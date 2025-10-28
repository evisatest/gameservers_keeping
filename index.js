
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
const styleCss = `
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; background-color: #f4f4f9; color: #333; }
.container { max-width: 900px; margin: 2rem auto; padding: 2rem; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
h1 { margin: 0; }
#logout-btn { background: #f44336; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
#logout-btn:hover { background: #d32f2f; }
.variable-item {
 border: 1px solid #ddd;
 border-radius: 8px;
 margin-bottom: 1rem;
 background: #fafafa;
}
.variable-summary {
 padding: 1rem 1.5rem;
 font-weight: bold;
 cursor: pointer;
 display: flex;
 justify-content: space-between;
 align-items: center;
}
.variable-summary::after {
 content: '▼';
 transition: transform 0.2s;
}
.variable-item[open] .variable-summary::after {
 transform: rotate(180deg);
}
.variable-details {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
 gap: 1rem;
 padding: 0 1.5rem 1.5rem 1.5rem;
 border-top: 1px solid #eee;
}
.variable-item input { width: 100%; box-sizing: border-box; padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; }
.actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
.btn { padding: 0.6rem 1.2rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
.btn-delete { background-color: #ffcccc; color: #a00; margin-left: auto; }
.btn-delete:hover { background-color: #ff9999; }
.btn-add-time { background-color: #e0e0e0; color: #333; }
.time-input-group { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.time-input-group input { flex-grow: 1; }
.btn-delete-time { background: none; border: none; color: #a00; cursor: pointer; font-size: 1.2rem; padding: 0.2rem; }
.footer-actions { text-align: right; margin-top: 2rem; }
.btn-primary { background-color: #007aff; color: white; }
.btn-save { background-color: #4CAF50; color: white; }
.login-container { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
form { display: flex; flex-direction: column; }
input { padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
button { padding: 0.8rem; background-color: #007aff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
button:hover { background-color: #0056b3; }
`;

const clientScript = `
let serversConfig = [];
let initialServersConfig = [];

document.addEventListener('DOMContentLoaded', () => {
  loadVariables();

  document.getElementById('add-variable').addEventListener('click', () => {
    const newServer = {
      id: \`server-\${Date.now()}\`,
      name: '新服务器',
      apiKey: '',
      serverId: '',
      renewUrl: '',
      renewalTimes: ['01:00'],
      isNew: true,
    };
    serversConfig.push(newServer);
    renderVariables();
    const newItem = document.getElementById(newServer.id);
    newItem.open = true;
  });

  document.getElementById('save-all').addEventListener('click', saveAll);
});

async function loadVariables() {
  try {
    const response = await fetch('/api/variables');
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    serversConfig = await response.json();
    initialServersConfig = JSON.parse(JSON.stringify(serversConfig));
    renderVariables();
  } catch (error) {
    console.error('Failed to load variables:', error);
    alert('加载配置失败，请查看控制台获取更多信息。');
  }
}

function renderVariables() {
  const list = document.getElementById('variables-list');
  list.innerHTML = '';
  serversConfig.forEach((server, index) => {
    const id = server.id || \`server-\${index}\`;
    server.id = id;

    const item = document.createElement('details');
    item.className = 'variable-item';
    item.id = id;
    if (server.isNew) {
      item.open = true;
    }

    item.innerHTML = \`
      <summary class="variable-summary">\${server.name || '未命名服务器'}</summary>
      <div class="variable-details">
        <div>
          <label>名称 (Name):</label>
          <input type="text" data-key="name" value="\${server.name || ''}" placeholder="例如: 我的测试服务器">
        </div>
        <div>
          <label>API Key:</label>
          <input type="text" data-key="apiKey" value="\${server.apiKey || ''}" placeholder="输入您的 API Key">
        </div>
        <div>
          <label>Server ID:</label>
          <input type="text" data-key="serverId" value="\${server.serverId || ''}" placeholder="输入服务器 ID">
        </div>
        <div>
          <label>续期 URL (Renew URL):</label>
          <input type="text" data-key="renewUrl" value="\${server.renewUrl || ''}" placeholder="完整的续期请求 URL">
        </div>
        <div class="renewal-times-container" style="grid-column: 1 / -1;">
          <label>续期时间 (上海时间, 24小时制, HH:mm):</label>
          <div id="times-list-\${id}">
            \${(server.renewalTimes || []).map((time, timeIndex) => \`
              <div class="time-input-group" data-time-index="\${timeIndex}">
                <input type="time" value="\${time}">
                <button type="button" class="btn-delete-time" onclick="removeTime('\${id}', \${timeIndex})">&times;</button>
              </div>
            \`).join('')}
          </div>
          <button type="button" class="btn btn-add-time" onclick="addTime('\${id}')">添加时间</button>
        </div>
        <div class="actions">
          <button class="btn btn-delete" onclick="deleteVariable('\${id}')">删除</button>
        </div>
      </div>
    \`;
    list.appendChild(item);
  });

  document.querySelectorAll('.variable-details input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = e.target.closest('.variable-item').id;
      const key = e.target.dataset.key;
      const server = serversConfig.find(s => s.id === id);
      server[key] = e.target.value;
      if (key === 'name') {
        e.target.closest('.variable-item').querySelector('.variable-summary').textContent = e.target.value;
      }
    });
  });
}

function addTime(id) {
  const server = serversConfig.find(s => s.id === id);
  if (!server.renewalTimes) {
    server.renewalTimes = [];
  }
  server.renewalTimes.push('01:00');
  rerenderTimes(id);
}

function removeTime(id, timeIndex) {
  const server = serversConfig.find(s => s.id === id);
  server.renewalTimes.splice(timeIndex, 1);
  rerenderTimes(id);
}

function rerenderTimes(id) {
  const server = serversConfig.find(s => s.id === id);
  const timesListDiv = document.getElementById(\`times-list-\${id}\`);
  timesListDiv.innerHTML = (server.renewalTimes || []).map((time, timeIndex) => \`
    <div class="time-input-group" data-time-index="\${timeIndex}">
      <input type="time" value="\${time}">
      <button type="button" class="btn-delete-time" onclick="removeTime('\${id}', \${timeIndex})">&times;</button>
    </div>
  \`).join('');

  // Re-attach event listeners for the time inputs
  timesListDiv.querySelectorAll('input[type="time"]').forEach((input, index) => {
    input.addEventListener('input', (e) => {
      server.renewalTimes[index] = e.target.value;
    });
  });
}


function updateTimesFromUI() {
  serversConfig.forEach(server => {
    const id = server.id;
    const timesContainer = document.getElementById(\`times-list-\${id}\`);
    if (timesContainer) {
      const timeInputs = timesContainer.querySelectorAll('.time-input-group input[type="time"]');
      server.renewalTimes = Array.from(timeInputs).map(input => input.value);
    }
  });
}

function deleteVariable(id) {
  if (confirm('您确定要删除这个服务器配置吗？')) {
    serversConfig = serversConfig.filter(s => s.id !== id);
    renderVariables();
  }
}

async function saveAll() {
  updateTimesFromUI();

  const serversToSave = serversConfig.map(s => {
    const { id, isNew, ...rest } = s;
    return rest;
  });

  try {
    const response = await fetch('/api/variables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serversToSave),
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    alert('所有配置已成功保存！');
    initialServersConfig = JSON.parse(JSON.stringify(serversConfig));
    // Reset isNew flag
    serversConfig.forEach(s => { s.isNew = false; });
    document.querySelectorAll('.variable-item').forEach(item => item.open = false);

  } catch (error) {
    console.error('Failed to save variables:', error);
    alert('保存失败，请查看控制台获取更多信息。');
  }
}
`;

const indexHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>续期管理面板</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>续期管理面板</h1>
      <button id="logout-btn" onclick="location.href='/logout'">登出</button>
    </header>
    
    <div id="variables-list"></div>

    <button id="add-variable" class="btn btn-primary">添加服务器</button>
    <div class="footer-actions">
      <button id="save-all" class="btn btn-save">保存所有更改</button>
    </div>
  </div>

  <script>${clientScript}</script>
</body>
</html>
`;

const loginHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - 续期管理</title>
  <link rel="stylesheet" href="/style.css">
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
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = currentHour + ':' + currentMinute;
  
  console.log(timestamp() + ' ℹ️ 当前时间 (上海): ' + currentTime + '。检测到 ' + servers.length + ' 台服务器配置。');

  const serversToRenew = servers.filter(server => {
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
    console.warn(timestamp() + ' ⚠️ 续期失败: "' + serverName + '" - ' + message);
    return '失败 (' + message + ')';

  } catch (error) {
    console.error(timestamp() + ' ❌ 请求异常: "' + serverName + '" -', error.message);
    throw new Error('请求异常: ' + error.message);
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

  const url = 'https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage';
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
async function handleFetch(request, env, ctx) {
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
  if (url.pathname === '/style.css') {
    return new Response(styleCss, { headers: { 'Content-Type': 'text/css;charset=UTF-8' } });
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
    return new Response(indexHtml, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }
  return new Response(loginHtml, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
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
      headers.append('Set-Cookie', AUTH_COOKIE_NAME + '=' + token + '; Path=/; HttpOnly; Secure; SameSite=Strict');
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
  headers.append('Set-Cookie', AUTH_COOKIE_NAME + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
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
