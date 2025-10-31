// --- 依赖 ---
import { Buffer } from 'node:buffer';
import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';

// =================================================================================
// 游戏鸡 自动续期
// 原作者: Pungwing 单机版
// 二次创作：Evisa 轻量容器兼容版本 
// 功能增强版: 添加了 Web UI 管理和 Telegram 通知
// =================================================================================

// --- 全局常量 ---
const KV_CONFIG_KEY = "servers_config";
const AUTH_COOKIE_NAME = "__auth_token";

// --- Hono 应用实例 ---
const app = new Hono();

// --- 认证中间件 ---
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
  return c.text('登出成功', 200);
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

// --- 静态资源服务 ---
app.get('/*', serveStatic({ root: './public' }));
app.get('/login', serveStatic({ path: './public/login.html' }));


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
    return;
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
    if ((renewalDays.includes('everyday') || renewalDays.includes(currentDay)) && server.renewalTimes.includes(currentTime)) {
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
