// =================================================================================
// 游戏鸡 自动续期
// 原作者: Pungwing 单机版
// 二次创作：Evisa  轻量容器兼容版本 
// 功能增强版: 添加了 Web UI 管理和 Telegram 通知
// =================================================================================

// --- 全局常量 ---
const KV_CONFIG_KEY = "servers_config";
const AUTH_COOKIE_NAME = "__auth_token";

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
    return handleFetch(request, env);
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
  const timestamp = () => `[${new Date().toISOString()}]`;
  console.log(`${timestamp()} 🚀 开始执行自动续期任务...`);

  let servers = await getServersConfig(env);

  if (!servers || servers.length === 0) {
    const message = "⚠️ 配置为空，没有可续期的服务器。请通过 UI 添加配置。";
    console.warn(`${timestamp()} ${message}`);
    await sendTelegramNotification(message, env);
    return;
  }

  const now = new Date();
  // Cloudflare Workers' new Date() is in UTC.
  const currentHour = now.getUTCHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  
  console.log(`${timestamp()} ℹ️ 当前时间 (UTC): ${currentTime}。检测到 ${servers.length} 台服务器配置。`);

  const serversToRenew = servers.filter(server => {
    // If renewalTime is not set, or is an empty string, renew every time for backward compatibility.
    if (!server.renewalTime) {
      return true;
    }
    // Check if the time matches.
    return server.renewalTime === currentTime;
  });

  if (serversToRenew.length === 0) {
    console.log(`${timestamp()} ℹ️ 当前时间没有需要续期的服务器。任务结束。`);
    return;
  }

  console.log(`${timestamp()} ℹ️ 发现 ${serversToRenew.length} 台服务器需要在此时间续期。`);

  const results = await Promise.allSettled(
    serversToRenew.map(server => renewServer(server, timestamp))
  );

  console.log(`${timestamp()} ✅ 所有需要续期的服务器任务已处理完毕。`);

  // --- Generate and send notification ---
  let successCount = 0;
  let failedCount = 0;
  const summary = results.map((result, index) => {
    const server = serversToRenew[index];
    const serverName = server.name || `服务器 #${servers.indexOf(server) + 1}`;
    if (result.status === 'fulfilled' && result.value.startsWith('成功')) {
      successCount++;
      return `✅ ${serverName}: 续期成功。`;
    } else {
      failedCount++;
      const reason = (result.status === 'rejected') ? result.reason.message : result.value;
      return `❌ ${serverName}: 失败 - ${reason}`;
    }
  }).join('\n');

  const title = `Gamechi 自动续期报告`;
  const finalMessage = `${title}\n\n总览: ${successCount} 成功, ${failedCount} 失败。\n\n${summary}`;
  
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
        // 为安全起见，建议迁移后从环境变量中移除 SERVERS_CONFIG
      } else {
        servers = [];
      }
    } catch (e) {
      console.error("❌ 解析旧版 SERVERS_CONFIG 失败:", e.message);
      servers = [];
    }
  }
  
  return Array.isArray(servers) ? servers : [];
}

/**
 * 为单个服务器发送续期请求
 * @param {object} server
 * @param {function} timestamp
 */
async function renewServer(server, timestamp) {
  const serverName = server.name || `(未命名: ${server.serverId})`;
  
  if (!server.apiKey || !server.serverId || !server.renewUrl) {
    throw new Error(`配置不完整 (缺少 apiKey, serverId, 或 renewUrl)`);
  }
  
  console.log(`${timestamp()} 🔄 开始为 "${serverName}" 续期...`);

  try {
    const response = await fetch(server.renewUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${server.apiKey}`,
        'User-Agent': `Cloudflare-Worker-Gameji-Auto-Renew/2.0`,
      },
      body: JSON.stringify({ server_id: server.serverId }),
    });

    if (response.status === 200) {
      console.log(`${timestamp()} ✅ 续期成功: "${serverName}"`);
      return '成功';
    }

    const messages = {
      400: `请求无效(400)，可能今日已续期`,
      404: `未找到服务器(404)`,
      419: `授权过期(419)`,
      403: `无权访问(403)`,
    };
    const message = messages[response.status] || `返回码: ${response.status}`;
    console.warn(`${timestamp()} ⚠️ 续期失败: "${serverName}" - ${message}`);
    return `失败 (${message})`;

  } catch (error) {
    console.error(`${timestamp()} ❌ 请求异常: "${serverName}" -`, error.message);
    throw new Error(`请求异常: ${error.message}`);
  }
}

/**
 * 发送 Telegram 通知
 * @param {string} text
 * @param {object} env
 */
async function sendTelegramNotification(text, env) {
  const { TG_BOT_TOKEN, TG_CHAT_ID } = env;

  if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
    console.log("ℹ️ 未配置 Telegram 环境变量 (TG_BOT_TOKEN, TG_CHAT_ID)，跳过通知。");
    return;
  }

  const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ 发送 Telegram 通知失败:", errorData.description);
    } else {
      console.log("✅ Telegram 通知已发送。");
    }
  } catch (error) {
    console.error("❌ 调用 Telegram API 时出错:", error.message);
  }
}

// =================================================================================
// Web UI & API 请求处理
// =================================================================================

/**
 * 处理 HTTP 请求的路由函数
 * @param {Request} request
 * @param {object} env
 */
async function handleFetch(request, env) {
  const url = new URL(request.url);
  
  if (url.pathname === '/') {
    return handleUIRoute(request, env);
  }
  if (url.pathname === '/login' && request.method === 'POST') {
    return handleLogin(request, env);
  }
  if (url.pathname === '/logout') {
    return handleLogout();
  }
  if (url.pathname === '/api/variables' && ['GET', 'POST'].includes(request.method)) {
    return handleApiVariables(request, env);
  }
  
  return new Response('Not Found', { status: 404 });
}

/**
 * 检查用户是否已认证
 * @param {Request} request
 * @param {object} env
 * @returns {Promise<boolean>}
 */
async function isAuthenticated(request, env) {
  const cookie = request.headers.get('Cookie');
  if (!cookie || !cookie.includes(AUTH_COOKIE_NAME)) {
    return false;
  }
  
  // 如果未设置密码，则始终返回 true
  if (!env.AUTH_USERNAME && !env.AUTH_PASSWORD) {
    return true;
  }
  
  const token = cookie.split(';').find(c => c.trim().startsWith(AUTH_COOKIE_NAME + '=')).split('=')[1];
  
  // 简单的基于时间的令牌验证 (这里为了简单，只检查 token 是否存在)
  // 在实际生产中，您可能希望使用 JWT 或更安全的令牌机制
  return token === await getAuthToken(env);
}

/**
 * 获取/生成一个安全的认证 Token
 * @param {object} env
 */
async function getAuthToken(env) {
  const secret = env.AUTH_PASSWORD || "admin"; // Fallback for safety
  const username = env.AUTH_USERNAME || "admin";

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(username);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  
  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}


/**
 * 处理 UI 路由，根据认证状态显示登录页或管理页
 * @param {Request} request
 * @param {object} env
 */
async function handleUIRoute(request, env) {
  if (await isAuthenticated(request, env)) {
    return new Response(getAdminPanelHTML(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }
  return new Response(getLoginPageHTML(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

/**
 * 处理登录请求
 * @param {Request} request
 * @param {object} env
 */
async function handleLogin(request, env) {
  try {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    const adminUser = env.AUTH_USERNAME || 'admin'
    const adminPass = env.AUTH_PASSWORD || 'admin'

    if (username === adminUser && password === adminPass) {
      const token = await getAuthToken(env);
      const headers = new Headers({ 'Location': '/' });
      // 设置一个简单的 cookie
      headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`);
      return new Response(null, { status: 302, headers });
    } else {
      return new Response('用户名或密码错误。', { status: 401 });
    }
  } catch (e) {
    return new Response('登录请求无效。', { status: 400 });
  }
}

/**
 * 处理登出请求
 */
function handleLogout() {
  const headers = new Headers({ 'Location': '/' });
  // 清除 cookie
  headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  return new Response(null, { status: 302, headers });
}

/**
 * 处理变量 API 请求
 * @param {Request} request
 * @param {object} env
 */
async function handleApiVariables(request, env) {
  if (!(await isAuthenticated(request, env))) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!env.AUTO_RENEW_KV) {
    return new Response("KV 命名空间未绑定。", { status: 500 });
  }

  if (request.method === 'GET') {
    const servers = await getServersConfig(env);
    return new Response(JSON.stringify(servers || []), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    try {
      const servers = await request.json();
      if (!Array.isArray(servers)) {
        return new Response('请求体必须是一个 JSON 数组。', { status: 400 });
      }
      await env.AUTO_RENEW_KV.put(KV_CONFIG_KEY, JSON.stringify(servers));
      return new Response('配置已保存。', { status: 200 });
    } catch (e) {
      return new Response('无效的 JSON 格式。', { status: 400 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}


// =================================================================================
// HTML 模板
// =================================================================================

function getLoginPageHTML() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - 续期管理</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f4f9; }
    .login-container { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #333; }
    form { display: flex; flex-direction: column; }
    input { padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
    button { padding: 0.8rem; background-color: #007aff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
    button:hover { background-color: #0056b3; }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>管理员登录</h1>
    <form action="/login" method="post">
      <input type="text" name="username" placeholder="用户名" required>
      <input type="password" name="password" placeholder="密码" required>
      <button type="submit">登录</button>
    </form>
  </div>
</body>
</html>
  `;
}

function getAdminPanelHTML() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>续期管理面板</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; background-color: #f4f4f9; color: #333; }
    .container { max-width: 900px; margin: 2rem auto; padding: 2rem; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
    h1 { margin: 0; }
    #logout-btn { background: #f44336; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    #logout-btn:hover { background: #d32f2f; }
    .variable-item { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1rem; background: #fafafa; }
    .variable-item input { width: 100%; box-sizing: border-box; padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; }
    .actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
    .btn { padding: 0.6rem 1.2rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
    .btn-delete { background-color: #ffcccc; color: #a00; }
    .btn-delete:hover { background-color: #ff9999; }
    #add-variable-btn { background-color: #28a745; color: white; }
    #add-variable-btn:hover { background-color: #218838; }
    #save-changes-btn { background-color: #007aff; color: white; margin-top: 2rem; width: 100%; padding: 1rem; font-size: 1.2rem; }
    #save-changes-btn:hover { background-color: #0056b3; }
    .notification { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: #333; color: white; padding: 1rem 2rem; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index: 1000; opacity: 0; transition: opacity 0.3s; }
    .notification.show { opacity: 1; }
    .info-box { background-color: #e7f3fe; border-left: 6px solid #2196F3; margin-bottom: 20px; padding: 15px 20px; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>续期服务器配置</h1>
      <button id="logout-btn" onclick="window.location.href='/logout'">登出</button>
    </header>
    
    <div class="info-box">
      <strong>提示:</strong> 续约时间为 UTC 时间，格式为 <strong>HH:MM</strong> (例如: 14:30)。如果不填，则每次触发都会尝试续约。
      <br>为确保精确按时续约，请在 Cloudflare Worker 的 Cron 触发器中设置为每分钟执行 (<code>* * * * *</code>)。
    </div>

    <div id="variables-container"></div>
    <button id="add-variable-btn" class="btn">添加一个服务器</button>
    
    <button id="save-changes-btn">保存所有更改</button>
  </div>
  
  <div id="notification" class="notification"></div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('variables-container');
      const addBtn = document.getElementById('add-variable-btn');
      const saveBtn = document.getElementById('save-changes-btn');
      let variables = [];

      function renderVariables() {
        container.innerHTML = '';
        variables.forEach((variable, index) => {
          const div = document.createElement('div');
          div.className = 'variable-item';
          div.innerHTML = \`
            <div><label>名称 (可选)</label><input type="text" data-key="name" value="\${variable.name || ''}" placeholder="例如: 我的服务器1"></div>
            <div><label>API Key</label><input type="text" data-key="apiKey" value="\${variable.apiKey || ''}" placeholder="请输入 API Key" required></div>
            <div><label>Server ID</label><input type="text" data-key="serverId" value="\${variable.serverId || ''}" placeholder="请输入 Server ID" required></div>
            <div><label>续期 URL</label><input type="text" data-key="renewUrl" value="\${variable.renewUrl || ''}" placeholder="请输入续期 URL" required></div>
            <div><label>续约时间 (UTC, HH:MM)</label><input type="text" data-key="renewalTime" value="\${variable.renewalTime || ''}" placeholder="例如: 14:30"></div>
            <div class="actions">
              <button class="btn btn-delete" data-index="\${index}">删除</button>
            </div>
          \`;
          container.appendChild(div);
        });

        document.querySelectorAll('.btn-delete').forEach(button => {
          button.addEventListener('click', (e) => {
            if (confirm('确定要删除这个服务器配置吗？')) {
              variables.splice(e.target.dataset.index, 1);
              renderVariables();
            }
          });
        });
      }

      function loadVariables() {
        fetch('/api/variables')
          .then(res => res.ok ? res.json() : Promise.reject('Failed to load'))
          .then(data => {
            variables = data;
            renderVariables();
          })
          .catch(err => showNotification('加载配置失败。', true));
      }
      
      addBtn.addEventListener('click', () => {
        variables.push({ name: '', apiKey: '', serverId: '', renewUrl: '', renewalTime: '' });
        renderVariables();
      });

      saveBtn.addEventListener('click', () => {
        const newVariables = [];
        const items = container.querySelectorAll('.variable-item');
        let isValid = true;
        
        items.forEach(item => {
          const newVar = {};
          item.querySelectorAll('input').forEach(input => {
            const key = input.dataset.key;
            const value = input.value.trim();
            
            // Validate renewalTime format if it's not empty
            if (key === 'renewalTime' && value && !/^([01]\\d|2[0-3]):([0-5]\\d)$/.test(value)) {
              showNotification(\`错误: 服务器 "\${newVar.name || '(未命名)'}" 的续约时间格式不正确。请使用 HH:MM 格式。\`, true);
              isValid = false;
            }

            newVar[key] = value;
          });
          newVariables.push(newVar);
        });

        if (!isValid) return;

        fetch('/api/variables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVariables),
        })
        .then(res => {
          if (res.ok) {
            showNotification('配置已成功保存！');
            variables = newVariables; // Update local state
          } else {
            res.text().then(text => showNotification(\`保存失败: \${text}\`, true));
          }
        })
        .catch(err => showNotification('保存时发生网络错误。', true));
      });

      function showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.backgroundColor = isError ? '#f44336' : '#333';
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
        }, 3000);
      }

      loadVariables();
    });
  </script>
</body>
</html>
  `;
}
