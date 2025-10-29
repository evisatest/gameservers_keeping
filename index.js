
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
        .then(response => response.json())
        .then(data => {
          servers = data;
          render();
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
        
        // Update server name in summary when typing
        nameInput.addEventListener('input', () => {
          serverName.textContent = nameInput.value || '新服务器';
        });

        return serverElement;
      }

      function createTimeInput(time) {
        const div = document.createElement('div');
        div.className = 'time-input-group';
        div.innerHTML = \`
          <input type="time" class="time-input" value="\${time}">
          <button type="button" class="btn-delete-time">&times;</button>
        \`;
        return div;
      }

      function render() {
        variablesList.innerHTML = '';
        servers.sort((a, b) => {
          const numA = parseInt(a.serverId, 10);
          const numB = parseInt(b.serverId, 10);

          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          if (!isNaN(numA)) return -1;
          if (!isNaN(numB)) return 1;
          return 0;
        });
        servers.forEach((server, index) => {
          const serverElement = createServerElement(server, index);
          variablesList.appendChild(serverElement);
        });
      }

      addVariableBtn.addEventListener('click', () => {
        servers.push({ name: '', serverId: '', apiKey: '', renewUrl: '', renewalTimes: [], renewalDays: ['everyday'] });
        render();
      });

      variablesList.addEventListener('input', (e) => {
        const target = e.target;
        const variableItem = target.closest('.variable-item');
        if (!variableItem) return;

        const index = variableItem.dataset.index;
        
        if (target.matches('[data-key]')) {
          servers[index][target.dataset.key] = target.value;
        }
      });

      variablesList.addEventListener('click', (e) => {
        const target = e.target;
        const variableItem = target.closest('.variable-item');
        if (!variableItem) return;

        const index = variableItem.dataset.index;

        if (target.classList.contains('btn-toggle-details')) {
          const details = variableItem.querySelector('.variable-details');
          details.style.display = details.style.display === 'none' ? 'block' : 'none';
          target.textContent = details.style.display === 'none' ? '详情' : '收起';
        } else if (target.classList.contains('btn-add-time')) {
          const timeInputsContainer = variableItem.querySelector('.time-inputs');
          timeInputsContainer.appendChild(createTimeInput(''));
        } else if (target.classList.contains('btn-delete-time')) {
          target.closest('.time-input-group').remove();
        } else if (target.classList.contains('btn-delete')) {
          servers.splice(index, 1);
          render();
        } else if (target.classList.contains('day-btn')) {
          const day = target.dataset.day;
          const daySelector = target.parentElement;
          
          if (day === 'everyday') {
            daySelector.querySelectorAll('.day-btn').forEach(btn => {
              btn.classList.remove('active');
            });
            target.classList.add('active');
          } else {
            daySelector.querySelector('[data-day="everyday"]').classList.remove('active');
            target.classList.toggle('active');
          }
        }
      });

      saveAllBtn.addEventListener('click', () => {
        // Before saving, collect all time inputs and day selections for each server
        document.querySelectorAll('.variable-item').forEach((item, index) => {
          const timeInputs = item.querySelectorAll('.time-input');
          const renewalTimes = Array.from(timeInputs).map(input => input.value).filter(Boolean);
          servers[index].renewalTimes = renewalTimes;

          const dayButtons = item.querySelectorAll('.day-btn.active');
          const renewalDays = Array.from(dayButtons).map(btn => btn.dataset.day);
          servers[index].renewalDays = renewalDays.length > 0 ? renewalDays : ['everyday'];
        });
        
        fetch('/api/variables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servers)
        }).then(response => {
          if (response.ok) {
            alert('保存成功!');
          } else {
            alert('保存失败!');
          }
        });
      });
    });
  </script>
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

  // Serve static assets
  if (url.pathname === '/style.css') {
    return new Response(styleCss, { headers: { 'Content-Type': 'text/css' } });
  }

  const isAuthenticated = await checkAuth(request, env);

  if (!isAuthenticated) {
    if (url.pathname === '/login.html' || url.pathname === '/login') {
      return new Response(loginHtml, { headers: { 'Content-Type': 'text/html' } });
    }
    return Response.redirect(url.origin + '/login.html', 302);
  }

  // If authenticated, serve the main page
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return new Response(indexHtml, { headers: { 'Content-Type': 'text/html' } });
  }
  
  // If authenticated and trying to access login, redirect to main page
  if (url.pathname === '/login.html' || url.pathname === '/login') {
    return Response.redirect(url.origin + '/', 302);
  }

  // Fallback for any other path
  return new Response('Not Found', { status: 404 });
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
