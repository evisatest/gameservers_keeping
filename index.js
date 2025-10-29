
// =================================================================================
// 游戏鸡 自动续期
// 原作者: Pungwing 单机版
// 二次创作：Evisa  轻量容器兼容版本 
// 功能增强版: 添加了 Web UI 管理和 Telegram 通知
// =================================================================================

// --- 全局常量 ---
const KV_CONFIG_KEY = "servers_config";
const AUTH_COOKIE_NAME = "__auth_token";

// --- 静态资源 ---
// Note: The HTML and CSS are now served from separate files (index.html, login.html, style.css)
// The inline variables (styleCss, clientScript, indexHtml, loginHtml) are removed.

// =================================================================================
// 主入口点: 监听 fetch 和 scheduled 事件
// =================================================================================

export default {
  /**
   * 监听 HTTP 请求 (用于 UI 和 API)
   * @param {Request} request
   * @param {object} env
   * @param {ExecutionContext} ctx
   */
  async fetch(request, env, ctx) {
    return handleFetch(request, env, ctx);
  },

  /**
   * 监听计划任务 (用于定时续期)
   * @param {ScheduledController} controller
   * @param {object} env
   * @param {ExecutionContext} ctx
   */
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(handleScheduled(env));
  },
};

// =================================================================================
// 核心功能: 定时续期处理
// =================================================================================

/**
 * 处理计划任务的核心函数
 * @param {object} env
 */
async function handleScheduled(env) {
  const timestamp = () => '[' + new Date().toISOString() + ']';
  console.log(timestamp() + ' 🚀 开始执行自动续期任务...');

  let servers = await getServersConfig(env);

  if (!servers || servers.length === 0) {
    const message = "⚠️ 配置为空，没有可续期的服务器。请通过 UI 添加配置。";
    console.warn(timestamp() + ' ' + message);
    await sendTelegramNotification(message, env);
    return;
  }

  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  const currentDay = now.getDay().toString(); // Sunday = 0, Monday = 1, etc.
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = currentHour + ':' + currentMinute;
  
  console.log(timestamp() + ' ℹ️ 当前时间 (上海): ' + currentTime + '。检测到 ' + servers.length + ' 台服务器配置。');

  const serversToRenew = servers.filter(server => {
    const renewalDays = server.renewalDays || ['everyday'];
    const shouldRenewToday = renewalDays.includes('everyday') || renewalDays.includes(currentDay);

    if (!shouldRenewToday) {
      return false;
    }

    // If renewalTimes is not set or empty, renew every time.
    if (!server.renewalTimes || server.renewalTimes.length === 0) {
      return true;
    }
    // Check if the current time is in the renewalTimes array.
    return server.renewalTimes.includes(currentTime);
  });

  if (serversToRenew.length === 0) {
    console.log(timestamp() + ' ℹ️ 当前时间没有需要续期的服务器。任务结束。');
    return;
  }

  console.log(timestamp() + ' ℹ️ 发现 ' + serversToRenew.length + ' 台服务器需要在此时间续期。');

  const results = await Promise.allSettled(
    serversToRenew.map(server => renewServer(server, timestamp))
  );

  console.log(timestamp() + ' ✅ 所有需要续期的服务器任务已处理完毕。');

  // --- Generate and send notification ---
  let successCount = 0;
  let failedCount = 0;
  const summary = results.map((result, index) => {
    const server = serversToRenew[index];
    const serverName = server.name || '服务器 #' + (servers.indexOf(server) + 1);
    if (result.status === 'fulfilled' && result.value.startsWith('成功')) {
      successCount++;
      return '✅ ' + serverName + ': 续期成功。';
    } else {
      failedCount++;
      const reason = (result.status === 'rejected') ? result.reason.message : result.value;
      return '❌ ' + serverName + ': 失败 - ' + reason;
    }
  }).join('\\n');

  const title = 'Gamechi 自动续期报告';
  const finalMessage = title + '\\n\\n总览: ' + successCount + ' 成功, ' + failedCount + ' 失败。\\n\\n' + summary;
  
  console.log(finalMessage);
  await sendTelegramNotification(finalMessage, env);
}

/**
 * 从 KV 或环境变量中获取服务器配置
 * @param {object} env
 * @returns {Promise<Array>}
 */
async function getServersConfig(env) {
  if (!env.AUTO_RENEW_KV) {
    console.error("❌ KV 命名空间 'AUTO_RENEW_KV' 未绑定。请检查 wrangler.toml 配置。");
    return [];
  }
  
  let servers = await env.AUTO_RENEW_KV.get(KV_CONFIG_KEY, "json");
  
  // 如果 KV 为空，尝试从环境变量 SERVERS_CONFIG (旧版) 迁移
  if (!servers && env.SERVERS_CONFIG) {
    console.log("ℹ️ 检测到旧版 SERVERS_CONFIG，正在尝试迁移到 KV...");
    try {
      servers = JSON.parse(env.SERVERS_CONFIG);
      if (Array.isArray(servers)) {
        await env.AUTO_RENEW_KV.put(KV_CONFIG_KEY, JSON.stringify(servers));
        console.log("✅ 成功将 SERVERS_CONFIG 迁移到 KV。");
      } else {
        servers = [];
      }
    } catch (e) {
      console.error("❌ 解析旧版 SERVERS_CONFIG 失败:", e.message);
      servers = [];
    }
  }
  
  servers = Array.isArray(servers) ? servers : [];

  // --- Data Migration: renewalTime to renewalTimes ---
  // This ensures backward compatibility with the old data structure.
  let needsUpdate = false;
  servers.forEach(server => {
    if (typeof server.renewalTime === 'string') {
      server.renewalTimes = server.renewalTime ? [server.renewalTime] : [];
      delete server.renewalTime;
      needsUpdate = true;
    }
  });

  // If we migrated any data, save it back to KV.
  if (needsUpdate) {
    console.log("🔄 正在将旧的 renewalTime 格式迁移到 renewalTimes...");
    await env.AUTO_RENEW_KV.put(KV_CONFIG_KEY, JSON.stringify(servers));
    console.log("✅ 数据结构迁移完成。");
  }

  return servers;
}

/**
 * 为单个服务器发送续期请求
 * @param {object} server
 * @param {function} timestamp
 */
async function renewServer(server, timestamp) {
  const serverName = server.name || '(未命名: ' + server.serverId + ')';
  
  if (!server.apiKey || !server.serverId || !server.renewUrl) {
    throw new Error('配置不完整 (缺少 apiKey, serverId, 或 renewUrl)');
  }
  
  console.log(timestamp() + ' 🔄 开始为 "' + serverName + '" 续期...');

  try {
    const response = await fetch(server.renewUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + server.apiKey,
        'User-Agent': 'Cloudflare-Worker-Gameji-Auto-Renew/2.0',
      },
      body: JSON.stringify({ server_id: server.serverId }),
    });

    if (response.status === 200) {
      console.log(timestamp() + ' ✅ 续期成功: "' + serverName + '"');
      return '成功';
    }

    const messages = {
      400: '请求无效(400)，可能今日已续期',
      404: '未找到服务器(404)',
      419: '授权过期(419)',
      403: '无权访问(403)',
    };
    const message = messages[response.status] || '返回码: ' + response.status;
    console.error(timestamp() + ' ❌ 续期失败: "' + serverName + '" - ' + message);
    throw new Error(message);

  } catch (error) {
    console.error(timestamp() + ' ❌ 续期请求异常: "' + serverName + '" - ' + error.message);
    throw error;
  }
}


// =================================================================================
// HTTP 请求处理 (Web UI 和 API)
// =================================================================================

/**
 * 主 HTTP 请求处理器
 * @param {Request} request
 * @param {object} env
 */
async function handleFetch(request, env, ctx) {
  const url = new URL(request.url);

  // API routes are handled first
  if (url.pathname.startsWith('/api/')) {
    return handleApiRequest(request, env, ctx);
  }

  // For all other requests, treat them as static asset requests
  try {
    const isAuthenticated = await checkAuth(request, env);

    // If not authenticated, only allow access to login page and style.css
    if (!isAuthenticated) {
      if (url.pathname === '/login.html' || url.pathname === '/style.css') {
        return env.ASSETS.fetch(request);
      } else {
        return Response.redirect(url.origin + '/login.html', 302);
      }
    }

    // If authenticated, but trying to access login, redirect to main page
    if (url.pathname === '/login.html') {
      return Response.redirect(url.origin + '/', 302);
    }
    
    // Serve the requested asset (e.g., /, /index.html, /style.css)
    return env.ASSETS.fetch(request);

  } catch (e) {
    // If asset not found, return a 404
    let pathname = url.pathname;
    return new Response(`Asset "${pathname}" not found`, {
      status: 404,
      statusText: "Not Found",
    });
  }
}

/**
 * API 请求处理器
 * @param {Request} request
 * @param {object} env
 */
async function handleApiRequest(request, env, ctx) {
    const url = new URL(request.url);

    // Login doesn't require auth
    if (url.pathname === '/api/login') {
        return handleLogin(request, env);
    }
    
    // All other API routes require auth
    const isAuthenticated = await checkAuth(request, env);
    if (!isAuthenticated) {
        return new Response('Unauthorized', { status: 401 });
    }

    switch (url.pathname) {
        case '/api/logout':
            return handleLogout();
        case '/api/variables':
            if (request.method === 'GET') {
                const servers = await getServersConfig(env);
                return new Response(JSON.stringify(servers || []), { headers: { 'Content-Type': 'application/json' } });
            } else if (request.method === 'POST') {
                const servers = await request.json();
                await env.AUTO_RENEW_KV.put(KV_CONFIG_KEY, JSON.stringify(servers));
                return new Response('Configuration saved', { status: 200 });
            }
            break;
        case '/api/trigger-all':
            if (request.method === 'POST') {
                ctx.waitUntil(handleScheduled(env));
                return new Response(JSON.stringify({ message: "所有续期任务已手动触发" }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            break;
    }
    return new Response('API Endpoint Not Found', { status: 404 });
}


// =================================================================================
// 认证功能
// =================================================================================

/**
 * 检查用户是否已认证
 * @param {Request} request
 * @param {object} env
 */
async function checkAuth(request, env) {
  const cookie = request.headers.get('Cookie');
  if (!cookie || !cookie.includes(AUTH_COOKIE_NAME)) {
    return false;
  }

  const token = cookie.split(AUTH_COOKIE_NAME + '=')[1].split(';')[0];
  const storedToken = await env.AUTO_RENEW_KV.get('auth_token');

  if (!token || !storedToken || token !== storedToken) {
    return false;
  }

  return true;
}

/**
 * 处理登录请求
 * @param {Request} request
 * @param {object} env
 */
async function handleLogin(request, env) {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  const adminUser = env.ADMIN_USER || 'admin';
  const adminPass = env.ADMIN_PASS;

  if (!adminPass) {
    return new Response('管理员密码未设置，请在环境变量中设置 ADMIN_PASS', { status: 500 });
  }

  if (username === adminUser && password === adminPass) {
    const token = crypto.randomUUID();
    await env.AUTO_RENEW_KV.put('auth_token', token, { expirationTtl: 86400 }); // 24-hour expiry

    const headers = new Headers();
    headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    headers.append('Location', '/');
    
    return new Response(null, { status: 302, headers });
  }

  return new Response('用户名或密码错误', { status: 401 });
}

/**
 * 处理登出请求
 */
function handleLogout() {
  const headers = new Headers();
  headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  headers.append('Location', '/login');
  return new Response(null, { status: 302, headers });
}


// =================================================================================
// 通知功能
// =================================================================================

/**
 * 发送 Telegram 通知
 * @param {string} message
 * @param {object} env
 */
async function sendTelegramNotification(message, env) {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('ℹ️ 未配置 Telegram token 或 chat ID，跳过发送通知。');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ 发送 Telegram 通知失败: ${response.status} ${response.statusText}`, errorBody);
    } else {
      console.log('✅ Telegram 通知已发送。');
    }
  } catch (error) {
    console.error('❌ 发送 Telegram 通知时发生网络错误:', error);
  }
}
