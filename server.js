const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const ROOT = __dirname;
const AUTH_DIR = path.join(ROOT, 'wa_auth_info');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Estado de la conexión de WhatsApp
let waSock = null;
let waStatus = 'connecting';
let waQrDataUrl = null;
let waConnectedUser = null;

async function startWhatsAppBot() {
  try {
    const baileys = await import('@whiskeysockets/baileys');
    const makeWASocket = baileys.default?.default || baileys.default || baileys.makeWASocket;
    const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = baileys;
    const QRCode = require('qrcode');
    const pino = require('pino');

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    let version = [2, 3000, 1015901307];
    try {
      const latest = await fetchLatestBaileysVersion();
      if (latest && latest.version) version = latest.version;
    } catch (_) {}

    waSock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['Sistema Reposteria POS', 'Chrome', '1.0.0']
    });

    waSock.ev.on('creds.update', saveCreds);

    waSock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        waStatus = 'qr';
        waQrDataUrl = await QRCode.toDataURL(qr, { width: 250, margin: 1 });
      }

      if (connection === 'close') {
        waQrDataUrl = null;
        waConnectedUser = null;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          waStatus = 'connecting';
          setTimeout(startWhatsAppBot, 3000);
        } else {
          waStatus = 'disconnected';
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch (_) {}
          setTimeout(startWhatsAppBot, 1500);
        }
      } else if (connection === 'open') {
        waStatus = 'connected';
        waQrDataUrl = null;
        waConnectedUser = waSock.user?.id ? waSock.user.id.split(':')[0] : 'Vinculado';
        console.log('WhatsApp conectado exitosamente:', waConnectedUser);
      }
    });
  } catch (err) {
    console.error('Error iniciando módulo WhatsApp:', err.message);
    waStatus = 'disconnected';
  }
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (_) {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const safeUrl = req.url.split('?')[0];

  if (safeUrl === '/api/mobile-info' && req.method === 'GET') {
    const QRCode = require('qrcode');
    const ip = getLocalIpAddress();
    const mobileUrl = `http://${ip}:${PORT}`;
    const qrDataUrl = await QRCode.toDataURL(mobileUrl, { width: 240, margin: 1 });
    return sendJson(res, 200, { ip, port: PORT, mobileUrl, qrDataUrl });
  }

  if (safeUrl === '/api/wa/status' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: waStatus,
      qrDataUrl: waQrDataUrl,
      userPhone: waConnectedUser
    });
  }

  if (safeUrl === '/api/wa/send' && req.method === 'POST') {
    const { phone, message } = await parseJsonBody(req);
    if (waStatus !== 'connected' || !waSock) {
      return sendJson(res, 400, {
        ok: false,
        error: 'WhatsApp aún no está vinculado. Escanea primero el Código QR.'
      });
    }
    let cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || !message) {
      return sendJson(res, 400, { ok: false, error: 'Falta el número de teléfono o el mensaje.' });
    }

    try {
      const jid = `${cleanPhone}@s.whatsapp.net`;
      await waSock.sendMessage(jid, { text: message });
      return sendJson(res, 200, { ok: true, sentTo: cleanPhone });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (safeUrl === '/api/wa/logout' && req.method === 'POST') {
    try {
      if (waSock) {
        await waSock.logout();
      }
    } catch (_) {}
    try {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    } catch (_) {}
    waStatus = 'connecting';
    waQrDataUrl = null;
    waConnectedUser = null;
    setTimeout(startWhatsAppBot, 1000);
    return sendJson(res, 200, { ok: true });
  }

  const filePath = path.join(ROOT, safeUrl === '/' ? 'index.html' : safeUrl);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Archivo no encontrado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIpAddress();
  console.log(`Servidor activo en PC: http://localhost:${PORT}`);
  console.log(`Acceso desde Celular Android (Wi-Fi): http://${ip}:${PORT}`);
  startWhatsAppBot();
});
