// --- 依赖 ---
import { Buffer } from 'node:buffer';

// =================================================================================
// 游戏鸡 自动续期
// 原作者: Pungwing 单机版
// 二次创作：Evisa 轻量容器兼容版本 
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
          if (confirm(`确定要删除服务器 "${server.name || server.serverId}" 吗?`)) {
            servers.splice(index, 1);
            render();
          }
        });
        serverElement.querySelector('.btn-add-time').addEventListener('click', () => {
          if (!servers[index].renewalTimes) {
            servers[index].renewalTimes = [];
          }
          servers[index].renewalTimes.push('01:00');
          renderServer(server, index);
        });
        return serverElement;
      }
      function createTimeInput(time) {
        const container = document.createElement('div');
        container.className = 'time-input-group';
        
        const input = document.createElement('input');
        input.type = 'time';
        input.value = time;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-time';
        deleteBtn.innerHTML = '&times;';
        
        container.appendChild(input);
        container.appendChild(deleteBtn);
        return container;
      }
      function renderServer(server, index) {
        const oldElement = variablesList.querySelector(`[data-index="${index}"]`);
        const newElement = createServerElement(server, index);
        if (oldElement) {
          variablesList.replaceChild(newElement, oldElement);
        } else {
          variablesList.appendChild(newElement);
        }
      }
      function render() {
        variablesList.innerHTML = '';
        servers.forEach((server, index) => {
          const serverElement = createServerElement(server, index);
          variablesList.appendChild(serverElement);
        });
      }
      addVariableBtn.addEventListener('click', () => {
        servers.push({ name: '', serverId: '', apiKey: '', renewUrl: '', renewalTimes: ['01:00'], renewalDays: ['everyday'] });
        render();
      });
      saveAllBtn.addEventListener('click', () => {
        const updatedServers = [];
        variablesList.querySelectorAll('.variable-item').forEach((item, index) => {
          const serverData = { ...servers[index] };
          item.querySelectorAll('input[data-key]').forEach(input => {
            serverData[input.dataset.key] = input.value;
          });
          const timeInputs = item.querySelectorAll('.time-inputs input[type="time"]');
          serverData.renewalTimes = Array.from(timeInputs).map(input => input.value);
          const activeDayButtons = item.querySelectorAll('.day-selector .day-btn.active');
          serverData.renewalDays = Array.from(activeDayButtons).map(btn => btn.dataset.day);
          updatedServers.push(serverData);
        });
        servers = updatedServers;
        fetch('/api/variables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servers),
        })
        .then(response => {
          if (response.ok) {
            alert('保存成功!');
            render(); 
          } else {
            alert('保存失败。');
          }
        });
      });
    document.getElementById('refresh-status').addEventListener('click', async () => {
        const response = await fetch('/api/get-status');
        if (response.ok) {
            const statuses = await response.json();
            updateStatusIndicators(statuses);
            alert('状态已刷新!');
        } else {
            alert('刷新状态失败。');
        }
    });
    document.getElementById('trigger-all').addEventListener('click', async () => {
        if (confirm('确定要立即触发所有服务器的续期吗? 这将忽略计划时间。')) {
            const response = await fetch('/api/trigger-all', { method: 'POST' });
            const result = await response.text();
            alert(result);
        }
    });
    function updateStatusIndicators(statuses) {
        variablesList.querySelectorAll('.variable-item').forEach((item) => {
            const serverId = item.querySelector('[data-key="serverId"]').value;
            const statusIndicator = item.querySelector('.status-indicator');
            if (statuses[serverId]) {
                const { success, timestamp } = statuses[serverId];
                statusIndicator.textContent = `${success ? '✅' : '❌'} (${new Date(timestamp).toLocaleTimeString()})`;
                statusIndicator.title = `最后续期于 ${new Date(timestamp).toLocaleString()}`;
            } else {
                statusIndicator.textContent = '...';
                statusIndicator.title = '尚无状态信息';
            }
        });
    }
    });
  </script>
</body>
</html>
`;
// --- 工具函数 ---
const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  status
});
const textResponse = (text, status = 200, headers = {}) => new Response(text, {
  status,
  headers: {
    'Content-Type': 'text/plain;charset=UTF-8',
    ...headers
  }
});
const htmlResponse = (html, status = 200) => new Response(html, {
  headers: {
    'Content-Type': 'text/html;charset=UTF-8'
  },
  status
});
// --- 核心业务逻辑 ---
/**
 * 获取服务器配置
 * @param {any} env
 */
async function getServersConfig(env) {
  const configStr = await env.KV.get(KV_CONFIG_KEY);
  return configStr ? JSON.parse(configStr) : [];
}
/**
 * 保存服务器配置
 * @param {any} env
 * @param {any[]} config
 */
async function saveServersConfig(env, config) {
  await env.KV.put(KV_CONFIG_KEY, JSON.stringify(config, null, 2));
}
/**
 * 发送续期请求
 * @param {{ renewUrl: string; serverId: string; apiKey: string; name: any; }} server
 */
async function renewServer(server) {
  const {
    renewUrl,
    serverId,
    apiKey,
    name
  } = server;
  if (!renewUrl || !serverId || !apiKey) {
    return {
      success: false,
      message: `服务器 ${name || serverId} 的配置不完整，缺少 renewUrl, serverId, 或 apiKey。`
    };
  }
  try {
    const response = await fetch(renewUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        server_id: serverId,
        api_key: apiKey
      }),
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return {
          success: true,
          message: `服务器 ${name || serverId} 续期成功。`
        };
      } else {
        return {
          success: false,
          message: `服务器 ${name || serverId} 续期失败: ${result.message || '未知错误'}`
        };
      }
    } else {
      const errorText = await response.text();
      return {
        success: false,
        message: `服务器 ${name || serverId} 续期请求失败: ${response.status} ${response.statusText}. 响应: ${errorText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `服务器 ${name || serverId} 续期时发生网络错误: ${error.message}`
    };
  }
}
/**
 * 发送 Telegram 通知
 * @param {string} message
 * @param {any} env
 */
async function sendTelegramNotification(message, env) {
  const {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID
  } = env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("未配置 Telegram 通知所需的环境变量。");
    return;
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      }),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`发送 Telegram 通知失败: ${response.status} ${errorBody}`);
    }
  } catch (error) {
    console.error(`发送 Telegram 通知时发生网络错误: ${error}`);
  }
}
/**
 * 检查并触发所有服务器的续期
 * @param {any} env
 * @param {boolean} force
 */
async function checkAndRenewAll(env, force = false) {
  const servers = await getServersConfig(env);
  const now = new Date(new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Shanghai'
  }));
  const currentDay = now.getDay().toString();
  const currentTime = now.toTimeString().slice(0, 5);
  let logs = [];
  for (const server of servers) {
    const renewalDays = server.renewalDays || ['everyday'];
    const shouldRenewToday = renewalDays.includes('everyday') || renewalDays.includes(currentDay);
    const shouldRenewNow = server.renewalTimes && server.renewalTimes.includes(currentTime);
    if (force || (shouldRenewToday && shouldRenewNow)) {
      const result = await renewServer(server);
      logs.push(result.message);
      // 保存状态
      const status = {
        success: result.success,
        timestamp: Date.now()
      };
      await env.KV.put(`status_${server.serverId}`, JSON.stringify(status));
    }
  }
  if (logs.length > 0) {
    const notificationMessage = `续期任务报告 (执行时间: ${now.toLocaleString('zh-CN')}):\n\n` + logs.join('\n');
    console.log(notificationMessage);
    await sendTelegramNotification(notificationMessage, env);
  } else if (force) {
    console.log("强制触发，但没有符合条件的服务器。");
  }
}
// --- 认证 ---
/**
 * @param {string} password
 * @param {string} storedHash
 * @param {any} env
 */
async function verifyPassword(password, storedHash, env) {
  if (!password || !storedHash) return false;
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const hash = Buffer.from(hashHex, 'hex');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), {
    name: 'PBKDF2'
  }, false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: parseInt(env.ITERATIONS || '100000'),
    hash: 'SHA-256',
  }, key, 256);
  return Buffer.from(derivedBits).equals(hash);
}
async function generateSecureToken() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
/**
 * @param {Request} request
 * @param {any} env
 */
async function isAuthenticated(request, env) {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return false;
  const tokenMatch = cookie.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
  if (!tokenMatch) return false;
  const token = tokenMatch[1];
  const storedToken = await env.KV.get(`auth_token_${token}`);
  return !!storedToken;
}
// --- 路由和处理 ---
export default {
  async fetch(request, env, ctx) {
    return await handleRequest(request, env).catch(
      (err) => new Response(err.stack, {
        status: 500
      })
    );
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(checkAndRenewAll(env));
  },
};
/**
 * @param {Request} request
 * @param {any} env
 */
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  // 静态资源
  if (path === '/style.css') {
    return new Response(styleCss, {
      headers: {
        'Content-Type': 'text/css'
      }
    });
  }
  if (path === '/login.html') {
    return htmlResponse(loginHtml);
  }
  // API 路由
  if (path.startsWith('/api/')) {
    // 登录接口不需要认证
    if (path === '/api/login' && request.method === 'POST') {
      const formData = await request.formData();
      const username = formData.get('username');
      const password = formData.get('password');
      if (username === env.AUTH_USER) {
        // 从环境变量中读取存储的哈希
        const storedPasswordHash = env.AUTH_PASS_HASH;
        if (await verifyPassword(password, storedPasswordHash, env)) {
          const token = await generateSecureToken();
          await env.KV.put(`auth_token_${token}`, 'valid', {
            expirationTtl: 86400
          }); // 24小时有效
          return textResponse("登录成功", 200, {
            'Set-Cookie': `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
          });
        }
      }
      return textResponse("用户名或密码错误", 401);
    }
    // 登出接口
    if (path === '/api/logout') {
      return textResponse("已登出", 200, {
        'Set-Cookie': `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
      });
    }
    // 后续所有 API 请求都需要认证
    if (!await isAuthenticated(request, env)) {
      return textResponse("未授权", 401);
    }
    if (path === '/api/variables') {
      if (request.method === 'GET') {
        const config = await getServersConfig(env);
        return jsonResponse(config);
      } else if (request.method === 'POST') {
        try {
          const newConfig = await request.json();
          await saveServersConfig(env, newConfig);
          return jsonResponse({
            success: true,
            message: "配置已保存"
          });
        } catch (e) {
          return jsonResponse({
            success: false,
            message: "请求体无效"
          }, 400);
        }
      }
    }
    if (path === '/api/get-status' && request.method === 'GET') {
      const servers = await getServersConfig(env);
      const statuses = {};
      for (const server of servers) {
        const statusStr = await env.KV.get(`status_${server.serverId}`);
        if (statusStr) {
          statuses[server.serverId] = JSON.parse(statusStr);
        }
      }
      return jsonResponse(statuses);
    }
    if (path === '/api/trigger-all' && request.method === 'POST') {
      await checkAndRenewAll(env, true);
      return textResponse("已触发所有服务器续期任务。");
    }
    return textResponse("API 路由未找到", 404);
  }
  // UI 界面
  if (!await isAuthenticated(request, env)) {
    return Response.redirect(new URL('/login.html', request.url).toString(), 302);
  }
  return htmlResponse(indexHtml);
}
