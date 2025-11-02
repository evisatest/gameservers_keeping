
// --- 依赖 ---
import { Buffer } from 'node:buffer';
import { Hono } from 'hono';

// =================================================================================
// 游戏鸡 自动续期
// 原作者: Pungwing 单机版
// 二次创作：Evisa 轻量容器兼容版本 
// 功能增强版: 添加了 Web UI 管理和 Telegram 通知
// =================================================================================

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
.interval-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.interval-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background-color: #fff;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.interval-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}`;

const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>续期管理面板</title>
  <style>${styleCss}</style>
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
          <div class="form-group full-width">
            <label>续期间隔 (分钟)</label>
            <div class="interval-selector">
              <input type="text" data-key="renewalInterval" placeholder="例如：1, 30, 60">
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
            window.location.href = '/login';
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
        const renewalIntervalInput = serverElement.querySelector('[data-key="renewalInterval"]');
        const serverName = serverElement.querySelector('.server-name');
        
        nameInput.value = server.name || '';
        serverIdInput.value = server.serverId || '';
        apiKeyInput.value = server.apiKey || '';
        renewUrlInput.value = server.renewUrl || '';
        renewalIntervalInput.value = server.renewalInterval || '';
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
          btn.addEventListener('click', () => {
            if (day === 'everyday') {
              btn.classList.toggle('active');
              const isActive = btn.classList.contains('active');
              daySelector.querySelectorAll('.day-btn').forEach(otherBtn => {
                if (otherBtn !== btn) otherBtn.classList.remove('active');
              });
              if (isActive) {
                servers[index].renewalDays = ['everyday'];
              } else {
                servers[index].renewalDays = [];
              }
            } else {
              daySelector.querySelector('[data-day="everyday"]').classList.remove('active');
              btn.classList.toggle('active');
              const activeDays = Array.from(daySelector.querySelectorAll('.day-btn.active'))
                                      .map(b => b.dataset.day)
                                      .filter(d => d !== 'everyday');
              servers[index].renewalDays = activeDays.length > 0 ? activeDays : ['everyday'];
               if (activeDays.length === 0) {
                 daySelector.querySelector('[data-day="everyday"]').classList.add('active');
               }
            }
          });
        });
        nameInput.addEventListener('input', () => {
          serverName.textContent = nameInput.value || '新服务器';
        });
        serverElement.querySelector('.btn-toggle-details').addEventListener('click', () => {
          const details = serverElement.querySelector('.variable-details');
          details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
        serverElement.querySelector('.btn-delete').addEventListener('click', () => {
          if (confirm(\`确定要删除服务器 "\${server.name || '新服务器'}" 吗?\`)) {
            servers.splice(index, 1);
            render();
          }
        });
        serverElement.querySelector('.btn-add-time').addEventListener('click', (e) => {
          const container = e.target.previousElementSibling;
          container.appendChild(createTimeInput(''));
        });
        return serverElement;
      }
      function createTimeInput(time) {
        const div = document.createElement('div');
        div.className = 'time-input-group';
        const input = document.createElement('input');
        input.type = 'time';
        input.value = time;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-time';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.onclick = () => div.remove();
        div.appendChild(input);
        div.appendChild(deleteBtn);
        return div;
      }
      function render() {
        variablesList.innerHTML = '';
        servers.forEach((server, index) => {
          variablesList.appendChild(createServerElement(server, index));
        });
      }
      addVariableBtn.addEventListener('click', () => {
        servers.push({
          name: '',
          serverId: '',
          apiKey: '',
          renewUrl: '',
          renewalTimes: ['08:00'],
          renewalDays: ['everyday'],
          renewalInterval: ''
          });
          render();
          const newItem = variablesList.lastElementChild;
        const details = newItem.querySelector('.variable-details');
        details.style.display = 'block';
        newItem.querySelector('[data-key="name"]').focus();
      });
      saveAllBtn.addEventListener('click', () => {
        const updatedServers = [];
        variablesList.querySelectorAll('.variable-item').forEach((item, index) => {
          const serverData = servers[item.dataset.index];
          const updatedServer = {
            name: item.querySelector('[data-key="name"]').value,
            serverId: item.querySelector('[data-key="serverId"]').value,
            apiKey: item.querySelector('[data-key="apiKey"]').value,
            renewUrl: item.querySelector('[data-key="renewUrl"]').value,
            renewalTimes: Array.from(item.querySelectorAll('.time-input-group input')).map(input => input.value).filter(Boolean),
            renewalDays: serverData.renewalDays, // This is updated directly on click
            renewalInterval: item.querySelector('[data-key="renewalInterval"]').value
          };
          updatedServers.push(updatedServer);
        });
        servers = updatedServers;
        fetch('/api/variables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servers)
        }).then(response => {
          if (response.ok) {
            alert('保存成功！');
            render(); // Re-render to reflect new indices and clean data
          } else {
            alert('保存失败。');
          }
        });
      });
        document.getElementById('refresh-status').addEventListener('click', () => {
            alert('刷新功能待实现');
        });
        document.getElementById('trigger-all').addEventListener('click', async () => {
            if (!confirm('确定要立即触发所有服务器的续期吗？此操作不可逆。')) {
                return;
            }
            try {
                const response = await fetch('/api/trigger', { method: 'POST' });
                if (response.ok) {
                    const result = await response.text();
                    alert('触发成功！\\n' + result);
                } else {
                    const error = await response.text();
                    alert('触发失败：' + error);
                }
            } catch (err) {
                alert('请求失败：' + err.message);
            }
        });
    });
  </script>
</body>
</html>`;

const loginHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - 续期管理</title>
  <style>${styleCss}</style>
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
</html>`;


// --- 全局常量 ---
const KV_CONFIG_KEY = "servers_config";
const AUTH_COOKIE_NAME = "__auth_token";

// --- Hono 应用实例 ---
const app = new Hono();

// --- 认证中间件 ---
app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/api/') || c.req.path === '/login') {
    return next();
  }
  const cookie = c.req.headers.get('Cookie');
  if (!cookie || !cookie.includes(AUTH_COOKIE_NAME)) {
    return c.redirect('/login');
  }
  const token = cookie.split(';').find(s => s.trim().startsWith(AUTH_COOKIE_NAME + '='))?.split('=')[1];
  const storedToken = await c.env.AUTO_RENEW_KV.get("auth_token");
  if (token !== storedToken) {
    return c.redirect('/login');
  }
  await next();
});

app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/login') {
    return next();
  }
  const cookie = c.req.headers.get('Cookie');
  if (!cookie || !cookie.includes(AUTH_COOKIE_NAME)) {
    return c.text('Unauthorized', 401);
  }
  const token = cookie.split(';').find(s => s.trim().startsWith(AUTH_COOKIE_NAME + '='))?.split('=')[1];
  const storedToken = await c.env.AUTO_RENEW_KV.get("auth_token");
  if (token !== storedToken) {
    return c.text('Unauthorized', 401);
  }
  await next();
});


// --- UI 路由 ---
app.get('/login', (c) => {
  return c.html(loginHtml);
});

app.get('/', (c) => {
  return c.html(indexHtml);
});


// --- API 路由 ---
app.post('/api/login', async (c) => {
  const formData = await c.req.formData();
  const username = formData.get('username');
  const password = formData.get('password');
  
  const storedUser = c.env.AUTH_USERNAME || "admin";
  const storedPass = c.env.AUTH_PASSWORD || "password";
  
  if (username === storedUser && password === storedPass) {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Buffer.from(randomBytes).toString('hex');
    await c.env.AUTO_RENEW_KV.put("auth_token", token, { expirationTtl: 86400 });
    c.header('Set-Cookie', `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`);
    return c.text('登录成功', 200);
  } else {
    return c.text('用户名或密码错误', 401);
  }
});

app.get('/api/logout', (c) => {
  c.header('Set-Cookie', `${AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  return c.redirect('/login');
});

app.get('/api/variables', async (c) => {
  const config = await getServersConfig(c.env);
  return c.json(config);
});

app.post('/api/variables', async (c) => {
  try {
    const variables = await c.req.json();
    await c.env.AUTO_RENEW_KV.put(KV_CONFIG_KEY, JSON.stringify(variables));
    return c.text('保存成功', 200);
  } catch (e) {
    return c.text('保存失败: ' + e.message, 500);
  }
});

app.post('/api/trigger', async (c) => {
    console.log("[手动触发] 开始执行所有续期任务...");
    try {
        const results = await handleScheduled(c.env);
        console.log("[手动触发] 执行完成。");
        return c.text(`手动触发完成。\n${results}`, 200);
    } catch (e) {
        console.error("[手动触发] 执行失败:", e);
        return c.text('手动触发失败: ' + e.message, 500);
    }
});


// --- 核心逻辑 ---

async function getServersConfig(env) {
    let configStr = await env.AUTO_RENEW_KV.get(KV_CONFIG_KEY);
    if (!configStr && env.SERVERS_CONFIG) {
        configStr = env.SERVERS_CONFIG;
    }
    if (!configStr) return [];
    try {
        return JSON.parse(configStr);
    } catch (e) {
        console.error("解析服务器配置失败:", e);
        try {
            return JSON.parse(Buffer.from(configStr, 'base64').toString());
        } catch (e2) {
            console.error("解析 Base64 编码的配置也失败了:", e2);
            return [];
        }
    }
}

async function sendTelegramNotification(message, env) {
  const botToken = env.TG_BOT_TOKEN;
  const chatId = env.TG_CHAT_ID;
  if (!botToken || !chatId) {
    console.log("未配置 Telegram Bot Token 或 Chat ID，跳过发送通知。");
    return;
  }
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
    });
    if (!response.ok) {
      console.error(`发送 Telegram 通知失败: ${response.status} ${await response.text()}`);
    } else {
      console.log("Telegram 通知发送成功。");
    }
  } catch (e) {
    console.error(`发送 Telegram 通知异常: ${e.message}`);
  }
}

// --- 定时任务 ---

async function handleOptikLinkKeepAlive(env) {
  const apiKey = env.OPTIKLINK_API_KEY;
  const serverId = env.OPTIKLINK_SERVER_ID;
  if (!apiKey || !serverId) {
    console.log("[OptikLink] 缺少 API_KEY 或 SERVER_ID，跳过保活。");
    return;
  }
  const keepAliveUrl = `https://control.optiklink.com/api/client/servers/${serverId}/players`;
  try {
    const response = await fetch(keepAliveUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': "Mozilla/5.0",
      },
    });
    const httpCode = response.status;
    const logPrefix = `[OptikLink] [${new Date().toLocaleString()}]`;
    if (httpCode === 200) console.log(`${logPrefix} ✅ 保活成功 (HTTP 200)`);
    else if (httpCode === 403) console.log(`${logPrefix} ❌ 无访问权限 (HTTP 403)`);
    else if (httpCode === 404) console.log(`${logPrefix} ⚠️ 未找到服务器 (HTTP 404)`);
    else if (httpCode === 419) console.log(`${logPrefix} ⚠️ 授权过期或无效 (HTTP 419)`);
    else console.log(`${logPrefix} ⚠️ 保活失败，返回码: ${httpCode}`);
  } catch (error) {
    console.error(`[OptikLink] [${new Date().toLocaleString()}] 💥 保活请求异常:`, error);
  }
}

async function handleScheduled(env) {
  const config = await getServersConfig(env);
  if (!config || config.length === 0) {
    console.log("[定时任务] 未找到服务器配置，跳过执行。");
    return "未找到服务器配置。";
  }
  const now = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
  const currentTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
  const currentDay = now.getUTCDay().toString();
  console.log(`[定时任务] 当前时间 (UTC+8): ${currentTime}, 星期: ${currentDay}`);
  const results = [];
  for (const server of config) {
    if (!server.serverId || !server.apiKey || !server.renewUrl || !server.renewalTimes) {
      console.log(`[定时任务] 服务器 "${server.name || server.serverId}" 配置不完整，跳过。`);
      continue;
    }
    const renewalDays = server.renewalDays || ['everyday'];
    const renewalInterval = parseInt(server.renewalInterval, 10);
    let needsRenewal = false;

    if (!isNaN(renewalInterval) && renewalInterval > 0) {
      const currentMinuteOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();
      if (currentMinuteOfDay % renewalInterval === 0) {
        needsRenewal = true;
      }
    } else {
      needsRenewal = (renewalDays.includes('everyday') || renewalDays.includes(currentDay)) && server.renewalTimes.includes(currentTime);
    }
    
    if (needsRenewal) {
      console.log(`[定时任务] 触发服务器 "${server.name || server.serverId}" 的续期...`);
      try {
        const response = await fetch(server.renewUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': server.apiKey,
          },
          body: JSON.stringify({ server_id: server.serverId }),
        });
        const resultText = await response.text();
        const logMessage = `[定时任务] ${server.name || server.serverId}: ${response.ok ? '✅ 成功' : '❌ 失败'} - ${response.status} ${resultText}`;
        console.log(logMessage);
        results.push(logMessage);
      } catch (e) {
        const errorMessage = `[定时任务] ${server.name || server.serverId}: 💥 异常 - ${e.message}`;
        console.error(errorMessage);
        results.push(errorMessage);
      }
    }
  }
  if (results.length > 0) {
    const summary = `Gamechi 自动续期报告 (共 ${results.length} 条):\n\n` + results.join('\n');
    await sendTelegramNotification(summary, env);
    return summary;
  }
  return "没有在当前时间点需要续期的服务器。";
}

export default {
  fetch: app.fetch,
  async scheduled(event, env, ctx) {
    console.log(`[定时任务] 开始执行 - ${new Date().toLocaleString()}`);
    ctx.waitUntil(handleScheduled(env));
    ctx.waitUntil(handleOptikLinkKeepAlive(env));
  }
};
