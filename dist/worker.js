var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var KV_CONFIG_KEY = "servers_config";
var AUTH_COOKIE_NAME = "__auth_token";
var styleCss = `
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
 content: '\u25BC';
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
var clientScript = `
let serversConfig = [];
let initialServersConfig = [];

document.addEventListener('DOMContentLoaded', () => {
  loadVariables();

  document.getElementById('add-variable').addEventListener('click', () => {
    const newServer = {
      id: \`server-\${Date.now()}\`,
      name: '\u65B0\u670D\u52A1\u5668',
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
    alert('\u52A0\u8F7D\u914D\u7F6E\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u63A7\u5236\u53F0\u83B7\u53D6\u66F4\u591A\u4FE1\u606F\u3002');
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
      <summary class="variable-summary">\${server.name || '\u672A\u547D\u540D\u670D\u52A1\u5668'}</summary>
      <div class="variable-details">
        <div>
          <label>\u540D\u79F0 (Name):</label>
          <input type="text" data-key="name" value="\${server.name || ''}" placeholder="\u4F8B\u5982: \u6211\u7684\u6D4B\u8BD5\u670D\u52A1\u5668">
        </div>
        <div>
          <label>API Key:</label>
          <input type="text" data-key="apiKey" value="\${server.apiKey || ''}" placeholder="\u8F93\u5165\u60A8\u7684 API Key">
        </div>
        <div>
          <label>Server ID:</label>
          <input type="text" data-key="serverId" value="\${server.serverId || ''}" placeholder="\u8F93\u5165\u670D\u52A1\u5668 ID">
        </div>
        <div>
          <label>\u7EED\u671F URL (Renew URL):</label>
          <input type="text" data-key="renewUrl" value="\${server.renewUrl || ''}" placeholder="\u5B8C\u6574\u7684\u7EED\u671F\u8BF7\u6C42 URL">
        </div>
        <div class="renewal-times-container" style="grid-column: 1 / -1;">
          <label>\u7EED\u671F\u65F6\u95F4 (UTC, 24\u5C0F\u65F6\u5236, HH:mm):</label>
          <div id="times-list-\${id}">
            \${(server.renewalTimes || []).map((time, timeIndex) => \`
              <div class="time-input-group" data-time-index="\${timeIndex}">
                <input type="time" value="\${time}">
                <button type="button" class="btn-delete-time" onclick="removeTime('\${id}', \${timeIndex})">&times;</button>
              </div>
            \`).join('')}
          </div>
          <button type="button" class="btn btn-add-time" onclick="addTime('\${id}')">\u6DFB\u52A0\u65F6\u95F4</button>
        </div>
        <div class="actions">
          <button class="btn btn-delete" onclick="deleteVariable('\${id}')">\u5220\u9664</button>
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
  if (confirm('\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u670D\u52A1\u5668\u914D\u7F6E\u5417\uFF1F')) {
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

    alert('\u6240\u6709\u914D\u7F6E\u5DF2\u6210\u529F\u4FDD\u5B58\uFF01');
    initialServersConfig = JSON.parse(JSON.stringify(serversConfig));
    // Reset isNew flag
    serversConfig.forEach(s => { s.isNew = false; });
    document.querySelectorAll('.variable-item').forEach(item => item.open = false);

  } catch (error) {
    console.error('Failed to save variables:', error);
    alert('\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u63A7\u5236\u53F0\u83B7\u53D6\u66F4\u591A\u4FE1\u606F\u3002');
  }
}
`;
var indexHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u7EED\u671F\u7BA1\u7406\u9762\u677F</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>\u7EED\u671F\u7BA1\u7406\u9762\u677F</h1>
      <button id="logout-btn" onclick="location.href='/logout'">\u767B\u51FA</button>
    </header>
    
    <div id="variables-list"></div>

    <button id="add-variable" class="btn btn-primary">\u6DFB\u52A0\u670D\u52A1\u5668</button>
    <div class="footer-actions">
      <button id="save-all" class="btn btn-save">\u4FDD\u5B58\u6240\u6709\u66F4\u6539</button>
    </div>
  </div>

  <script>${clientScript}<\/script>
</body>
</html>
`;
var loginHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u767B\u5F55 - \u7EED\u671F\u7BA1\u7406</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="login-container">
    <h1>\u7BA1\u7406\u5458\u767B\u5F55</h1>
    <form action="/login" method="post">
      <input type="text" name="username" placeholder="\u7528\u6237\u540D" required>
      <input type="password" name="password" placeholder="\u5BC6\u7801" required>
      <button type="submit">\u767B\u5F55</button>
    </form>
  </div>
</body>
</html>
`;
var index_default = {
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
  }
};
async function handleScheduled(env) {
  const timestamp = /* @__PURE__ */ __name(() => "[" + (/* @__PURE__ */ new Date()).toISOString() + "]", "timestamp");
  console.log(timestamp() + " \u{1F680} \u5F00\u59CB\u6267\u884C\u81EA\u52A8\u7EED\u671F\u4EFB\u52A1...");
  let servers = await getServersConfig(env);
  if (!servers || servers.length === 0) {
    const message = "\u26A0\uFE0F \u914D\u7F6E\u4E3A\u7A7A\uFF0C\u6CA1\u6709\u53EF\u7EED\u671F\u7684\u670D\u52A1\u5668\u3002\u8BF7\u901A\u8FC7 UI \u6DFB\u52A0\u914D\u7F6E\u3002";
    console.warn(timestamp() + " " + message);
    await sendTelegramNotification(message, env);
    return;
  }
  const now = /* @__PURE__ */ new Date();
  const currentHour = now.getUTCHours().toString().padStart(2, "0");
  const currentMinute = now.getMinutes().toString().padStart(2, "0");
  const currentTime = currentHour + ":" + currentMinute;
  console.log(timestamp() + " \u2139\uFE0F \u5F53\u524D\u65F6\u95F4 (UTC): " + currentTime + "\u3002\u68C0\u6D4B\u5230 " + servers.length + " \u53F0\u670D\u52A1\u5668\u914D\u7F6E\u3002");
  const serversToRenew = servers.filter((server) => {
    if (!server.renewalTimes || server.renewalTimes.length === 0) {
      return true;
    }
    return server.renewalTimes.includes(currentTime);
  });
  if (serversToRenew.length === 0) {
    console.log(timestamp() + " \u2139\uFE0F \u5F53\u524D\u65F6\u95F4\u6CA1\u6709\u9700\u8981\u7EED\u671F\u7684\u670D\u52A1\u5668\u3002\u4EFB\u52A1\u7ED3\u675F\u3002");
    return;
  }
  console.log(timestamp() + " \u2139\uFE0F \u53D1\u73B0 " + serversToRenew.length + " \u53F0\u670D\u52A1\u5668\u9700\u8981\u5728\u6B64\u65F6\u95F4\u7EED\u671F\u3002");
  const results = await Promise.allSettled(
    serversToRenew.map((server) => renewServer(server, timestamp))
  );
  console.log(timestamp() + " \u2705 \u6240\u6709\u9700\u8981\u7EED\u671F\u7684\u670D\u52A1\u5668\u4EFB\u52A1\u5DF2\u5904\u7406\u5B8C\u6BD5\u3002");
  let successCount = 0;
  let failedCount = 0;
  const summary = results.map((result, index) => {
    const server = serversToRenew[index];
    const serverName = server.name || "\u670D\u52A1\u5668 #" + (servers.indexOf(server) + 1);
    if (result.status === "fulfilled" && result.value.startsWith("\u6210\u529F")) {
      successCount++;
      return "\u2705 " + serverName + ": \u7EED\u671F\u6210\u529F\u3002";
    } else {
      failedCount++;
      const reason = result.status === "rejected" ? result.reason.message : result.value;
      return "\u274C " + serverName + ": \u5931\u8D25 - " + reason;
    }
  }).join("\\n");
  const title = "Gamechi \u81EA\u52A8\u7EED\u671F\u62A5\u544A";
  const finalMessage = title + "\\n\\n\u603B\u89C8: " + successCount + " \u6210\u529F, " + failedCount + " \u5931\u8D25\u3002\\n\\n" + summary;
  console.log(finalMessage);
  await sendTelegramNotification(finalMessage, env);
}
__name(handleScheduled, "handleScheduled");
async function getServersConfig(env) {
  if (!env.AUTO_RENEW_KV) {
    console.error("\u274C KV \u547D\u540D\u7A7A\u95F4 'AUTO_RENEW_KV' \u672A\u7ED1\u5B9A\u3002\u8BF7\u68C0\u67E5 wrangler.toml \u914D\u7F6E\u3002");
    return [];
  }
  let servers = await env.AUTO_RENEW_KV.get(KV_CONFIG_KEY, "json");
  if (!servers && env.SERVERS_CONFIG) {
    console.log("\u2139\uFE0F \u68C0\u6D4B\u5230\u65E7\u7248 SERVERS_CONFIG\uFF0C\u6B63\u5728\u5C1D\u8BD5\u8FC1\u79FB\u5230 KV...");
    try {
      servers = JSON.parse(env.SERVERS_CONFIG);
      if (Array.isArray(servers)) {
        await env.AUTO_RENEW_KV.put(KV_CONFIG_KEY, JSON.stringify(servers));
        console.log("\u2705 \u6210\u529F\u5C06 SERVERS_CONFIG \u8FC1\u79FB\u5230 KV\u3002");
      } else {
        servers = [];
      }
    } catch (e) {
      console.error("\u274C \u89E3\u6790\u65E7\u7248 SERVERS_CONFIG \u5931\u8D25:", e.message);
      servers = [];
    }
  }
  servers = Array.isArray(servers) ? servers : [];
  let needsUpdate = false;
  servers.forEach((server) => {
    if (typeof server.renewalTime === "string") {
      server.renewalTimes = server.renewalTime ? [server.renewalTime] : [];
      delete server.renewalTime;
      needsUpdate = true;
    }
  });
  if (needsUpdate) {
    console.log("\u{1F504} \u6B63\u5728\u5C06\u65E7\u7684 renewalTime \u683C\u5F0F\u8FC1\u79FB\u5230 renewalTimes...");
    await env.AUTO_RENEW_KV.put(KV_CONFIG_KEY, JSON.stringify(servers));
    console.log("\u2705 \u6570\u636E\u7ED3\u6784\u8FC1\u79FB\u5B8C\u6210\u3002");
  }
  return servers;
}
__name(getServersConfig, "getServersConfig");
async function renewServer(server, timestamp) {
  const serverName = server.name || "(\u672A\u547D\u540D: " + server.serverId + ")";
  if (!server.apiKey || !server.serverId || !server.renewUrl) {
    throw new Error("\u914D\u7F6E\u4E0D\u5B8C\u6574 (\u7F3A\u5C11 apiKey, serverId, \u6216 renewUrl)");
  }
  console.log(timestamp() + ' \u{1F504} \u5F00\u59CB\u4E3A "' + serverName + '" \u7EED\u671F...');
  try {
    const response = await fetch(server.renewUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + server.apiKey,
        "User-Agent": "Cloudflare-Worker-Gameji-Auto-Renew/2.0"
      },
      body: JSON.stringify({ server_id: server.serverId })
    });
    if (response.status === 200) {
      console.log(timestamp() + ' \u2705 \u7EED\u671F\u6210\u529F: "' + serverName + '"');
      return "\u6210\u529F";
    }
    const messages = {
      400: "\u8BF7\u6C42\u65E0\u6548(400)\uFF0C\u53EF\u80FD\u4ECA\u65E5\u5DF2\u7EED\u671F",
      404: "\u672A\u627E\u5230\u670D\u52A1\u5668(404)",
      419: "\u6388\u6743\u8FC7\u671F(419)",
      403: "\u65E0\u6743\u8BBF\u95EE(403)"
    };
    const message = messages[response.status] || "\u8FD4\u56DE\u7801: " + response.status;
    console.warn(timestamp() + ' \u26A0\uFE0F \u7EED\u671F\u5931\u8D25: "' + serverName + '" - ' + message);
    return "\u5931\u8D25 (" + message + ")";
  } catch (error) {
    console.error(timestamp() + ' \u274C \u8BF7\u6C42\u5F02\u5E38: "' + serverName + '" -', error.message);
    throw new Error("\u8BF7\u6C42\u5F02\u5E38: " + error.message);
  }
}
__name(renewServer, "renewServer");
async function sendTelegramNotification(text, env) {
  const { TG_BOT_TOKEN, TG_CHAT_ID } = env;
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
    console.log("\u2139\uFE0F \u672A\u914D\u7F6E Telegram \u73AF\u5883\u53D8\u91CF (TG_BOT_TOKEN, TG_CHAT_ID)\uFF0C\u8DF3\u8FC7\u901A\u77E5\u3002");
    return;
  }
  const url = "https://api.telegram.org/bot" + TG_BOT_TOKEN + "/sendMessage";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text,
        parse_mode: "Markdown"
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("\u274C \u53D1\u9001 Telegram \u901A\u77E5\u5931\u8D25:", errorData.description);
    } else {
      console.log("\u2705 Telegram \u901A\u77E5\u5DF2\u53D1\u9001\u3002");
    }
  } catch (error) {
    console.error("\u274C \u8C03\u7528 Telegram API \u65F6\u51FA\u9519:", error.message);
  }
}
__name(sendTelegramNotification, "sendTelegramNotification");
async function handleFetch(request, env, ctx) {
  const url = new URL(request.url);
  if (url.pathname === "/") {
    return handleUIRoute(request, env);
  }
  if (url.pathname === "/login" && request.method === "POST") {
    return handleLogin(request, env);
  }
  if (url.pathname === "/logout") {
    return handleLogout();
  }
  if (url.pathname === "/api/variables" && ["GET", "POST"].includes(request.method)) {
    return handleApiVariables(request, env);
  }
  if (url.pathname === "/style.css") {
    return new Response(styleCss, { headers: { "Content-Type": "text/css;charset=UTF-8" } });
  }
  return new Response("Not Found", { status: 404 });
}
__name(handleFetch, "handleFetch");
async function isAuthenticated(request, env) {
  const cookie = request.headers.get("Cookie");
  if (!cookie || !cookie.includes(AUTH_COOKIE_NAME)) {
    return false;
  }
  if (!env.AUTH_USERNAME && !env.AUTH_PASSWORD) {
    return true;
  }
  const token = cookie.split(";").find((c) => c.trim().startsWith(AUTH_COOKIE_NAME + "=")).split("=")[1];
  return token === await getAuthToken(env);
}
__name(isAuthenticated, "isAuthenticated");
async function getAuthToken(env) {
  const secret = env.AUTH_PASSWORD || "admin";
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
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(getAuthToken, "getAuthToken");
async function handleUIRoute(request, env) {
  if (await isAuthenticated(request, env)) {
    return new Response(indexHtml, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }
  return new Response(loginHtml, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
__name(handleUIRoute, "handleUIRoute");
async function handleLogin(request, env) {
  try {
    const formData = await request.formData();
    const username = formData.get("username");
    const password = formData.get("password");
    const adminUser = env.AUTH_USERNAME || "admin";
    const adminPass = env.AUTH_PASSWORD || "admin";
    if (username === adminUser && password === adminPass) {
      const token = await getAuthToken(env);
      const headers = new Headers({ "Location": "/" });
      headers.append("Set-Cookie", AUTH_COOKIE_NAME + "=" + token + "; Path=/; HttpOnly; Secure; SameSite=Strict");
      return new Response(null, { status: 302, headers });
    } else {
      return new Response("\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF\u3002", { status: 401 });
    }
  } catch (e) {
    return new Response("\u767B\u5F55\u8BF7\u6C42\u65E0\u6548\u3002", { status: 400 });
  }
}
__name(handleLogin, "handleLogin");
function handleLogout() {
  const headers = new Headers({ "Location": "/" });
  headers.append("Set-Cookie", AUTH_COOKIE_NAME + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  return new Response(null, { status: 302, headers });
}
__name(handleLogout, "handleLogout");
async function handleApiVariables(request, env) {
  if (!await isAuthenticated(request, env)) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!env.AUTO_RENEW_KV) {
    return new Response("KV \u547D\u540D\u7A7A\u95F4\u672A\u7ED1\u5B9A\u3002", { status: 500 });
  }
  if (request.method === "GET") {
    const servers = await getServersConfig(env);
    return new Response(JSON.stringify(servers || []), { headers: { "Content-Type": "application/json" } });
  }
  if (request.method === "POST") {
    try {
      const servers = await request.json();
      if (!Array.isArray(servers)) {
        return new Response("\u8BF7\u6C42\u4F53\u5FC5\u987B\u662F\u4E00\u4E2A JSON \u6570\u7EC4\u3002", { status: 400 });
      }
      await env.AUTO_RENEW_KV.put(KV_CONFIG_KEY, JSON.stringify(servers));
      return new Response("\u914D\u7F6E\u5DF2\u4FDD\u5B58\u3002", { status: 200 });
    } catch (e) {
      return new Response("\u65E0\u6548\u7684 JSON \u683C\u5F0F\u3002", { status: 400 });
    }
  }
  return new Response("Method Not Allowed", { status: 405 });
}
__name(handleApiVariables, "handleApiVariables");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
