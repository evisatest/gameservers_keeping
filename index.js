
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
const styleCss = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary-color: #4a90e2;
  --primary-hover-color: #357ABD;
  --danger-color: #e94f4f;
  --danger-hover-color: #D33636;
  --save-color: #4CAF50;
  --save-hover-color: #45a049;
  --light-gray-color: #f0f2f5;
  --border-color: #d9d9d9;
  --text-color: #333;
  --text-secondary-color: #666;
  --background-color: #ffffff;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --border-radius: 8px;
  --shadow: 0 4px 12px rgba(0,0,0,0.08);
}

body { 
  font-family: var(--font-family); 
  margin: 0; 
  background-image: url('https://source.unsplash.com/featured/?beach');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  color: var(--text-color); 
}

.container { 
  max-width: 960px; 
  margin: 2rem auto; 
  padding: 2rem; 
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 2rem; 
  padding-bottom: 1.5rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}
header h1 { 
  margin: 0; 
  font-size: 1.8rem;
  font-weight: 600;
}

#logout-btn { 
  background: var(--danger-color); 
  color: white; 
  border: none; 
  padding: 0.6rem 1.2rem; 
  border-radius: var(--border-radius); 
  cursor: pointer; 
  font-weight: 500;
  transition: background-color 0.2s;
}
#logout-btn:hover { 
  background: var(--danger-hover-color); 
}

.variable-item {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
  transition: box-shadow 0.2s;
}
.variable-item:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.variable-summary {
  padding: 1rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
}
.server-name {
  color: var(--primary-color);
}
.summary-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.variable-details {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: #fafafa;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary-color);
}

input[type="text"], input[type="time"] { 
  width: 100%; 
  box-sizing: border-box; 
  padding: 0.8rem; 
  border: 1px solid var(--border-color); 
  border-radius: var(--border-radius);
  transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.actions { 
  grid-column: 1 / -1; 
  display: flex; 
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn { 
  padding: 0.7rem 1.4rem; 
  border: none; 
  border-radius: var(--border-radius); 
  cursor: pointer; 
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
}
.btn:active {
  transform: scale(0.98);
}
.btn-primary { 
  background-color: var(--primary-color); 
  color: white; 
}
.btn-primary:hover {
  background-color: var(--primary-hover-color);
}
.btn-save { 
  background-color: var(--save-color); 
  color: white; 
}
.btn-save:hover {
  background-color: var(--save-hover-color);
}
.btn-danger {
  background-color: var(--danger-color);
  color: white;
}
.btn-danger:hover {
  background-color: var(--danger-hover-color);
}
.btn-delete { 
  background-color: var(--danger-color); 
  color: white;
}
.btn-delete:hover {
  background-color: var(--danger-hover-color);
}
.btn-add-time {
  background-color: #e0e0e0;
  color: #333;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
}

.time-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.time-input-group { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
}
.time-input-group input { 
  flex-grow: 1; 
}
.btn-delete-time { 
  background: none; 
  border: 1px solid var(--border-color);
  color: var(--danger-color); 
  cursor: pointer; 
  font-size: 1.2rem; 
  padding: 0.2rem 0.5rem;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  line-height: 1;
  transition: background-color 0.2s, color 0.2s;
}
.btn-delete-time:hover {
  background-color: var(--danger-color);
  color: white;
}

.footer-actions { 
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem; 
}

/* Login Page Styles */
.login-container { 
  max-width: 400px;
  margin: 5rem auto;
  background: var(--background-color); 
  padding: 2.5rem; 
  border-radius: var(--border-radius); 
  box-shadow: var(--shadow);
}
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}
.login-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 600;
}
.login-header p {
  margin: 0;
  color: var(--text-secondary-color);
}

.login-container form .form-group {
  margin-bottom: 1.5rem;
}
.login-container form input {
  padding: 1rem;
  font-size: 1rem;
}
.btn-block {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}
.btn-toggle-details {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}
.btn-toggle-details:hover {
  background-color: var(--light-gray-color);
}

.day-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.day-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background-color: #fff;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.day-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
`;

const loginHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - 续期管理</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="login-container">
    <div class="login-header">
      <h2>续期管理</h2>
      <p>请登录以继续</p>
    </div>
    <form id="login-form" action="/api/login" method="post">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" name="username" placeholder="输入您的用户名" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" name="password" placeholder="输入您的密码" required>
      </div>
      <button type="submit" class="btn btn-primary btn-block">登 录</button>
    </form>
    <p id="error-message" style="color: red; text-align: center; margin-top: 1rem;"></p>
  </div>

  <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const errorMessage = document.getElementById('error-message');

      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const text = await response.text();
        errorMessage.textContent = text || '登录失败，请重试。';
      }
    });
  </script>
</body>
</html>
`;

const indexHtml = `<!DOCTYPE html>
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
      <button id="logout-btn" onclick="location.href='/api/logout'">登出</button>
    </header>
    
    <div id="variables-list">
      <!-- Server items will be dynamically inserted here -->
    </div>

    <div class="footer-actions">
      <button id="add-variable" class="btn btn-primary">添加服务器</button>
      <button id="save-all" class="btn btn-save">保存所有更改</button>
      <button id="refresh-status" class="btn">刷新状态</button>
      <button id="trigger-all" class="btn btn-danger">立即触发所有续期</button>
    </div>
  </div>

  <template id="server-template">
    <div class="variable-item">
      <div class="variable-summary">
        <span class="server-name">新服务器</span>
        <div class="summary-actions">
          <span class="status-indicator"></span>
          <button class="btn-toggle-details">详情</button>
        </div>
      </div>
      <div class="variable-details" style="display: none;">
        <div class="form-grid">
          <div class="form-group">
            <label>服务器名称</label>
            <input type="text" data-key="name" placeholder="例如：我的主服务器 (可选)">
          </div>
          <div class="form-group">
            <label>服务器ID</label>
            <input type="text" data-key="serverId" placeholder="服务器的唯一标识">
          </div>
          <div class="form-group">
            <label>API Key</label>
            <input type="text" data-key="apiKey" placeholder="用于API认证的密钥">
          </div>
          <div class="form-group">
            <label>续期URL</label>
            <input type="text" data-key="renewUrl" placeholder="完整的续期请求地址">
          </div>
          <div class="form-group full-width">
            <label>续期时间 (HH:mm)</label>
            <div class="time-inputs">
              <!-- Time inputs will be added here -->
            </div>
            <button class="btn btn-add-time">添加时间</button>
          </div>
          <div class="form-group full-width">
            <label>续期日期</label>
            <div class="day-selector">
              <button class="day-btn" data-day="everyday">每天</button>
              <button class="day-btn" data-day="1">一</button>
              <button class="day-btn" data-day="2">二</button>
              <button class="day-btn" data-day="3">三</button>
              <button class="day-btn" data-day="4">四</button>
              <button class="day-btn" data-day="5">五</button>
              <button class="day-btn" data-day="6">六</button>
              <button class="day-btn" data-day="0">日</button>
            </div>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-delete">删除服务器</button>
        </div>
      </div>
    </div>
  </template>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const variablesList = document.getElementById('variables-list');
      const addVariableBtn = document.getElementById('add-variable');
      const saveAllBtn = document.getElementById('save-all');
      const serverTemplate = document.getElementById('server-template');
      let servers = [];

      // Fetch initial data
      fetch('/api/variables')
        .then(response => {
          if (response.status === 401) {
            window.location.href = '/login.html';
            return;
          }
          return response.json();
        })
        .then(data => {
          if (data) {
            servers = data;
            render();
          }
        });

      function createServerElement(server, index) {
        const templateClone = serverTemplate.content.cloneNode(true);
        const serverElement = templateClone.querySelector('.variable-item');
        serverElement.dataset.index = index;

        const nameInput = serverElement.querySelector('[data-key="name"]');
        const serverIdInput = serverElement.querySelector('[data-key="serverId"]');
        const apiKeyInput = serverElement.querySelector('[data-key="apiKey"]');
        const renewUrlInput = serverElement.querySelector('[data-key="renewUrl"]');
        const serverName = serverElement.querySelector('.server-name');
        
        nameInput.value = server.name || '';
        serverIdInput.value = server.serverId || '';
        apiKeyInput.value = server.apiKey || '';
        renewUrlInput.value = server.renewUrl || '';
        serverName.textContent = server.name || '新服务器';

        const timeInputsContainer = serverElement.querySelector('.time-inputs');
        timeInputsContainer.innerHTML = '';
        (server.renewalTimes || []).forEach(time => {
          const timeGroup = createTimeInput(time);
          timeInputsContainer.appendChild(timeGroup);
        });

        const daySelector = serverElement.querySelector('.day-selector');
        const renewalDays = server.renewalDays || ['everyday'];
        
        daySelector.querySelectorAll('.day-btn').forEach(btn => {
          const day = btn.dataset.day;
          if (renewalDays.includes(day)) {
            btn.classList.add('active');
          }

          if (renewalDays.includes('everyday') && day !== 'everyday') {
            btn.classList.remove('active');
            daySelector.querySelector('[data-day="everyday"]').classList.add('active');
          } else if (!renewalDays.includes('everyday') && day === 'everyday') {
            btn.classList.remove('active');
          }
        });

        return serverElement;
      }
      
      function createTimeInput(time) {
        const div = document.createElement('div');
        div.className = 'time-input-group';
        div.innerHTML = `
          <input type="time" value="${time || ''}">
          <button class="btn-delete-time">&times;</button>
        `;
        div.querySelector('.btn-delete-time').addEventListener('click', () => {
          div.remove();
        });
        return div;
      }

      function render() {
        variablesList.innerHTML = '';
        servers.forEach((server, index) => {
          const el = createServerElement(server, index);
          variablesList.appendChild(el);
        });
      }

      addVariableBtn.addEventListener('click', () => {
        servers.push({ renewalTimes: [], renewalDays: ['everyday'] });
        render();
      });

      variablesList.addEventListener('click', e => {
        const target = e.target;
        const serverItem = target.closest('.variable-item');
        if (!serverItem) return;

        const index = parseInt(serverItem.dataset.index, 10);
        
        if (target.classList.contains('btn-toggle-details')) {
          const details = serverItem.querySelector('.variable-details');
          details.style.display = details.style.display === 'none' ? 'block' : 'none';
        }

        if (target.classList.contains('btn-add-time')) {
          const timeInputsContainer = serverItem.querySelector('.time-inputs');
          timeInputsContainer.appendChild(createTimeInput(''));
        }
        
        if (target.classList.contains('btn-delete')) {
          if (confirm('确定要删除这个服务器配置吗？')) {
            servers.splice(index, 1);
            render();
          }
        }
        
        if (target.classList.contains('day-btn')) {
          const day = target.dataset.day;
          const server = servers[index];
          server.renewalDays = server.renewalDays || [];
          
          const daySelector = target.parentElement;

          if (day === 'everyday') {
             server.renewalDays = ['everyday'];
             daySelector.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
             target.classList.add('active');
          } else {
             const everydayBtn = daySelector.querySelector('[data-day="everyday"]');
             if (server.renewalDays.includes('everyday')) {
                server.renewalDays = [];
                everydayBtn.classList.remove('active');
             }

             const dayIndex = server.renewalDays.indexOf(day);
             if (dayIndex > -1) {
                server.renewalDays.splice(dayIndex, 1);
                target.classList.remove('active');
             } else {
                server.renewalDays.push(day);
                target.classList.add('active');
             }
          }
        }
      });
      
      saveAllBtn.addEventListener('click', () => {
        const updatedServers = [];
        document.querySelectorAll('.variable-item').forEach(item => {
          const server = {
            name: item.querySelector('[data-key="name"]').value,
            serverId: item.querySelector('[data-key="serverId"]').value,
            apiKey: item.querySelector('[data-key="apiKey"]').value,
            renewUrl: item.querySelector('[data-key="renewUrl"]').value,
            renewalTimes: Array.from(item.querySelectorAll('.time-inputs input[type="time"]'))
                                .map(input => input.value)
                                .filter(Boolean),
            renewalDays: Array.from(item.querySelectorAll('.day-selector .day-btn.active'))
                               .map(btn => btn.dataset.day)
          };
          updatedServers.push(server);
        });

        fetch('/api/variables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedServers),
        })
        .then(response => {
          if (response.ok) {
            alert('所有配置已保存！');
            servers = updatedServers;
            render();
          } else {
            alert('保存失败，请检查网络或刷新页面重试。');
          }
        });
      });
      
      document.getElementById('refresh-status').addEventListener('click', () => {
         // Placeholder for status refresh logic
         alert('状态刷新功能待实现。');
      });

      document.getElementById('trigger-all').addEventListener('click', () => {
        if (confirm('确定要立即触发所有服务器的续期吗？这可能会消耗大量资源。')) {
          fetch('/api/trigger-all', { method: 'POST' })
            .then(response => response.text())
            .then(message => alert(message))
            .catch(err => alert('触发失败: ' + err));
        }
      });
    });
  </script>
</body>
</html>
`;

// --- 中间件和路由 ---

/**
 * 验证请求是否已经过身份验证
 * @param {Request} request
 * @param {any} env
 * @returns {Promise<boolean>}
 */
async function isAuthenticated(request, env) {
  const cookie = request.headers.get('Cookie');
  if (!cookie || !cookie.includes(AUTH_COOKIE_NAME)) {
    return false;
  }

  const token = cookie.split(';').find(c => c.trim().startsWith(AUTH_COOKIE_NAME + '='));
  if (!token) {
    return false;
  }

  const authToken = token.split('=')[1];
  const storedToken = await env.KV_NAMESPACE.get('auth_token');

  return authToken === storedToken && storedToken !== null;
}

/**
 * 处理HTTP请求
 * @param {Request} request
 * @param {any} env
 * @param {any} ctx
 * @returns {Promise<Response>}
 */
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);

  // 登录页面和API端点等公共资源不需要身份验证
  if (url.pathname === '/login.html' || url.pathname === '/api/login' || url.pathname === '/style.css') {
    return serveAsset(request, env, ctx);
  }

  // 检查身份验证
  const authenticated = await isAuthenticated(request, env);
  if (!authenticated) {
    // 对于API请求，返回401 Unauthorized
    if (url.pathname.startsWith('/api/')) {
        return new Response('Unauthorized', { status: 401 });
    }
    // 对于页面请求，重定向到登录页面
    return Response.redirect(url.origin + '/login.html', 302);
  }

  // 对于已认证的请求，提供资源
  return serveAsset(request, env, ctx);
}


/**
 * 提供静态资源或API路由
 * @param {Request} request
 * @param {any} env
 * @param {any} ctx
 * @returns {Promise<Response>}
 */
async function serveAsset(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 静态资源
  if (path === '/style.css') {
    return new Response(styleCss, { headers: { 'Content-Type': 'text/css' } });
  }
  if (path === '/login.html') {
    return new Response(loginHtml, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }
  if (path === '/') {
    return new Response(indexHtml, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }

  // API 路由
  if (path === '/api/login') {
    return handleLogin(request, env);
  }
  if (path === '/api/logout') {
    return handleLogout(request);
  }
  if (path === '/api/variables' && request.method === 'GET') {
    return handleGetVariables(request, env);
  }
  if (path === '/api/variables' && request.method === 'POST') {
    return handlePostVariables(request, env);
  }
   if (path === '/api/trigger-all' && request.method === 'POST') {
    ctx.waitUntil(handleScheduled(env,null));
    return new Response('所有续期任务已手动触发', { status: 200 });
  }

  return new Response('Not Found', { status: 404 });
}

// --- API 处理函数 ---

/**
 * 处理登录请求
 * @param {Request} request
 * @param {any} env
 * @returns {Promise<Response>}
 */
async function handleLogin(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');
  
  const { AUTH_USERNAME, AUTH_PASSWORD } = env;

  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    const authToken = crypto.randomUUID();
    await env.KV_NAMESPACE.put('auth_token', authToken, { expirationTtl: 86400 }); // 24小时过期

    const headers = new Headers();
    headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=${authToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    
    return new Response('登录成功', { status: 200, headers });
  } else {
    return new Response('用户名或密码错误', { status: 401 });
  }
}

/**
 * 处理登出请求
 * @param {Request} request
 * @returns {Promise<Response>}
 */
function handleLogout(request) {
  const headers = new Headers();
  headers.append('Set-Cookie', `${AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  
  const url = new URL(request.url);
  return Response.redirect(url.origin + '/login.html', {
    status: 302,
    headers: headers
  });
}


/**
 * 获取服务器配置
 * @param {Request} request
 * @param {any} env
 * @returns {Promise<Response>}
 */
async function handleGetVariables(request, env) {
  const config = await env.KV_NAMESPACE.get(KV_CONFIG_KEY, 'json') || [];
  return new Response(JSON.stringify(config), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * 更新服务器配置
 * @param {Request} request
 * @param {any} env
 * @returns {Promise<Response>}
 */
async function handlePostVariables(request, env) {
  try {
    const config = await request.json();
    await env.KV_NAMESPACE.put(KV_CONFIG_KEY, JSON.stringify(config));
    return new Response('配置已保存', { status: 200 });
  } catch (e) {
    return new Response(`保存配置时出错: ${e.message}`, { status: 500 });
  }
}

// --- 定时任务处理 ---

/**
 * 处理定时触发的续期任务
 * @param {any} env
 * @param {any} controller
 */
async function handleScheduled(env,controller) {
  try {
    const config = await env.KV_NAMESPACE.get(KV_CONFIG_KEY, 'json');
    if (!config || config.length === 0) {
      console.log('没有配置，跳过续期。');
      return;
    }

    const now = new Date();
    const currentDay = now.getDay().toString(); // 0 for Sunday, 1 for Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm
    
    console.log(`当前时间: ${currentTime}, 星期${currentDay}`);
    
    let renewalTasks = [];

    for (const server of config) {
      if (!server.renewalTimes || server.renewalTimes.length === 0) continue;

      const renewalDays = server.renewalDays || ['everyday'];
      const shouldRunToday = renewalDays.includes('everyday') || renewalDays.includes(currentDay);
      
      if (shouldRunToday && server.renewalTimes.includes(currentTime)) {
        renewalTasks.push(renewServer(server, env));
      }
    }

    if (renewalTasks.length > 0) {
      await Promise.all(renewalTasks);
      const message = `成功为 ${renewalTasks.length} 个服务器续期。`;
      console.log(message);
      await sendTelegramNotification(env, message);
    } else {
      console.log('没有在当前时间需要续期的服务器。');
    }
  } catch (e) {
    console.error(`执行定时任务时出错: ${e.message}`);
    await sendTelegramNotification(env, `执行定时任务时出错: ${e.message}`);
  }
}

// --- 核心业务逻辑 ---

/**
 * 为单个服务器续期
 * @param {object} serverConfig
 * @param {any} env
 */
async function renewServer(serverConfig, env) {
  const { name, serverId, apiKey, renewUrl } = serverConfig;
  const serverIdentifier = name || serverId;
  
  console.log(`正在为服务器 ${serverIdentifier} 续期...`);

  try {
    const response = await fetch(renewUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        server_id: serverId,
        api_key: apiKey,
      }),
    });

    const result = await response.json();

    if (response.ok && result.message === 'Renew request sent successfully.') {
      const successMsg = `服务器 ${serverIdentifier} 续期成功。`;
      console.log(successMsg);
      await sendTelegramNotification(env, successMsg);
    } else {
      const errorMsg = `服务器 ${serverIdentifier} 续期失败: ${result.message || response.statusText}`;
      console.error(errorMsg);
      await sendTelegramNotification(env, errorMsg);
    }
  } catch (error) {
    const errorMsg = `为服务器 ${serverIdentifier} 续期时发生网络错误: ${error.message}`;
    console.error(errorMsg);
    await sendTelegramNotification(env, errorMsg);
  }
}

// --- 辅助函数 ---

/**
 * 发送Telegram通知
 * @param {any} env
 * @param {string} message
 */
async function sendTelegramNotification(env, message) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('未配置Telegram通知，跳过发送。');
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url,.
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }),
    });
    if (!response.ok) {
      console.error(`发送Telegram通知失败: ${response.statusText}`);
    }
  } catch (e) {
    console.error(`发送Telegram通知时出错: ${e.message}`);
  }
}


// --- Worker 入口 ---

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
  async scheduled(controller, env, ctx) {
    await handleScheduled(env, controller);
  },
};
