const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const ROOT = __dirname;
const AUTH_DIR = path.join(ROOT, 'wa_auth_info');
const LICENSES_FILE = path.join(ROOT, 'licenses_db.json');
const FIREBASE_RTDB_URL = 'https://reposteria-sistema-pos-default-rtdb.firebaseio.com/reposteria_licenses';

function loadLicensesDb() {
  try {
    if (fs.existsSync(LICENSES_FILE)) {
      const data = JSON.parse(fs.readFileSync(LICENSES_FILE, 'utf8'));
      if (!data.adminWhatsapp) {
        data.adminWhatsapp = { phone: '04127049393', notifyOnPayment: true };
      }
      return data;
    }
  } catch (_) {}
  return {
    requireManualApproval: true,
    adminWhatsapp: {
      phone: '04127049393',
      notifyOnPayment: true
    },
    installations: []
  };
}

function saveLicensesDb(db) {
  try {
    fs.writeFileSync(LICENSES_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (_) {}
}


function formatPhoneForWhatsApp(phone) {
  let clean = String(phone || '').replace(/[^0-9]/g, '');
  if (!clean) return '';
  if (clean.startsWith('0') && clean.length === 11) {
    clean = '58' + clean.slice(1);
  } else if (!clean.startsWith('58') && (clean.length === 10 || clean.length === 11)) {
    clean = '58' + clean;
  }
  return clean;
}

async function sendWhatsAppMessageDirect(phone, text) {
  if (waStatus !== 'connected' || !waSock) {
    console.warn('[WA-BOT] WhatsApp no conectado. Estado:', waStatus);
    return { ok: false, error: 'Bot de WhatsApp no conectado' };
  }
  const cleanPhone = formatPhoneForWhatsApp(phone);
  if (!cleanPhone || !text) {
    return { ok: false, error: 'Falta teléfono o texto' };
  }
  try {
    const jid = `${cleanPhone}@s.whatsapp.net`;
    await waSock.sendMessage(jid, { text });
    console.log(`[WA-BOT] ✅ Mensaje enviado exitosamente a ${cleanPhone}`);
    return { ok: true, sentTo: cleanPhone };
  } catch (err) {
    console.error(`[WA-BOT] ❌ Error enviando a ${cleanPhone}:`, err.message);
    return { ok: false, error: err.message };
  }
}

async function notifyAdminOfPayment(inst, p) {
  try {
    const db = loadLicensesDb();
    const cfg = db.adminWhatsapp || { phone: '04127049393', notifyOnPayment: true };
    if (!cfg.notifyOnPayment) return;
    const adminPhone = cfg.phone || '04127049393';
    if (!adminPhone) return;

    const pin = generateUnlockPin(inst.licenseId, p.refDigits);
    const reportedTime = p.reportedAt
      ? new Date(p.reportedAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
      : 'Reciente';

    const msg =
      `🔔 *¡NUEVO PAGO REGISTRADO EN POSTFLOW!* 💰\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏬 *Negocio:* ${inst.brandName || 'PostFlow Negocio'} (${inst.licenseId})\n` +
      `🔢 *Ref. Pago Móvil:* #${p.refDigits || '----'}\n` +
      `🏦 *Banco:* ${p.bankName || 'Pago Móvil'}\n` +
      `💵 *Monto:* Bs. ${Number(p.amountBs || 0).toFixed(2)} (Tasa €: ${p.rateEurBcv || '-'}\n` +
      `📱 *Teléfono Cliente:* ${inst.brandPhone || p.payerPhone || 'No especificado'}\n` +
      `🕒 *Hora:* ${reportedTime}\n\n` +
      `🔑 *PIN Maestro de Activación:* *${pin}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👉 *Verifica y Activa en tu Panel Maestro:*\n` +
      `https://reposteria-sistema-pos.web.app/admin.html`;

    return await sendWhatsAppMessageDirect(adminPhone, msg);
  } catch (e) {
    console.warn('[WA-BOT] Error en notifyAdminOfPayment:', e);
  }
}

// MONITOREO EN LA NUBE (FIREBASE) PARA NOTIFICAR AL ADMIN EN VIVO
const notifiedPaymentsSet = new Set();
async function pollFirebasePendingPayments() {
  if (!FIREBASE_RTDB_URL || waStatus !== 'connected') return;
  try {
    const res = await fetch(`${FIREBASE_RTDB_URL}/installations.json`);
    if (!res.ok) return;
    const installations = await res.json();
    if (!installations) return;

    for (const inst of Object.values(installations)) {
      if (!inst || !inst.licenseId || !inst.pendingPayment) continue;
      const p = inst.pendingPayment;
      const paymentKey = `${inst.licenseId}_${p.refDigits}_${p.reportedAt || ''}`;

      if (notifiedPaymentsSet.has(paymentKey) || p.adminNotifiedViaWhatsApp) {
        continue;
      }

      console.log(`[WA-BOT] 🔔 Nuevo pago detectado en Firebase: ${inst.brandName} (Ref #${p.refDigits}). Notificando al Admin...`);
      const notifyRes = await notifyAdminOfPayment(inst, p);

      if (notifyRes && notifyRes.ok) {
        notifiedPaymentsSet.add(paymentKey);
        try {
          await fetch(`${FIREBASE_RTDB_URL}/installations/${inst.licenseId}/pendingPayment.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminNotifiedViaWhatsApp: true })
          });
        } catch (_) {}
      }
    }
  } catch (_) {}
}
setInterval(pollFirebasePendingPayments, 4000);

function generateUnlockPin(licenseId, refDigits) {
  const cleanId = String(licenseId || 'REP').replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const cleanRef = String(refDigits || '0000').replace(/[^0-9]/g, '');
  let sum = 0;
  const combined = `${cleanId}-${cleanRef}-BCV20`;
  for (let i = 0; i < combined.length; i++) {
    sum = (sum * 31 + combined.charCodeAt(i)) % 900000;
  }
  return String(100000 + (sum % 900000));
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.apk': 'application/vnd.android.package-archive'
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

function parseJsonBody(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve) => {
    let body = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        req.destroy();
        return resolve({});
      }
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
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
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

  if (safeUrl === '/api/bcv-euro' && req.method === 'GET') {
    try {
      const [rUsd, rFx] = await Promise.all([
        fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
        fetch('https://open.er-api.com/v6/latest/EUR')
      ]);
      if (rUsd.ok && rFx.ok) {
        const dUsd = await rUsd.json();
        const dFx = await rFx.json();
        const bcvUsd = parseFloat(dUsd.promedio);
        const eurToUsd = parseFloat(dFx?.rates?.USD) || 1.08;
        if (bcvUsd > 0) {
          return sendJson(res, 200, {
            ok: true,
            currency: 'EUR',
            source: 'BCV Oficial (EUR)',
            rate: Number((bcvUsd * eurToUsd).toFixed(2)),
            updatedAt: dUsd.fechaActualizacion || new Date().toISOString()
          });
        }
      }
    } catch (_) {}
    return sendJson(res, 503, { ok: false, error: 'No se pudo consultar BCV en este momento' });
  }

  // ==================== API CENTRAL DE ADMINISTRACIÓN DE APKS Y MEMBRESÍAS ====================
  if (safeUrl === '/api/licenses/sync' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const licenseId = String(body.licenseId || '').trim();
    if (!licenseId) return sendJson(res, 400, { ok: false, error: 'Falta licenseId' });

    const db = loadLicensesDb();
    let inst = db.installations.find((x) => x.licenseId === licenseId);
    const nowIso = new Date().toISOString();

    if (!inst) {
      inst = {
        licenseId,
        brandName: body.brandName || 'Repostería Sin Nombre',
        brandPhone: body.brandPhone || '',
        platform: body.platform || 'Android / Web',
        installedAt: nowIso,
        lastSeenAt: nowIso,
        status: body.status || 'trial',
        expiresAt: body.expiresAt || new Date(Date.now() + 7 * 86400000).toISOString(),
        pendingPayment: null,
        payments: []
      };
      db.installations.unshift(inst);
    } else {
      inst.lastSeenAt = nowIso;
      if (body.brandName) inst.brandName = body.brandName;
      if (body.brandPhone !== undefined) inst.brandPhone = body.brandPhone;
      if (body.platform) inst.platform = body.platform;
      // Si el servidor aún no tenía fecha y el cliente sí:
      if (!inst.expiresAt && body.expiresAt) inst.expiresAt = body.expiresAt;
    }

    saveLicensesDb(db);
    return sendJson(res, 200, {
      ok: true,
      requireManualApproval: db.requireManualApproval,
      installation: inst
    });
  }

  if (safeUrl === '/api/licenses/report-payment' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const licenseId = String(body.licenseId || '').trim();
    const refDigits = String(body.refDigits || '').replace(/[^0-9]/g, '');
    const unlockPin = String(body.unlockPin || '').trim();

    if (!licenseId || refDigits.length < 4) {
      return sendJson(res, 400, { ok: false, error: 'Datos de referencia incompletos' });
    }

    const db = loadLicensesDb();
    let inst = db.installations.find((x) => x.licenseId === licenseId);
    const nowIso = new Date().toISOString();

    if (!inst) {
      inst = {
        licenseId,
        brandName: body.brandName || 'Repostería',
        brandPhone: body.brandPhone || '',
        platform: body.platform || 'Android / Web',
        installedAt: nowIso,
        lastSeenAt: nowIso,
        status: 'trial',
        expiresAt: nowIso,
        pendingPayment: null,
        payments: []
      };
      db.installations.unshift(inst);
    }

    const expectedPin = generateUnlockPin(licenseId, refDigits);

    // Si el administrador desactivó la aprobación manual O si ingresaron el PIN maestro de activación:
    if (!db.requireManualApproval || (unlockPin && unlockPin === expectedPin)) {
      inst.status = 'active';
      inst.expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
      inst.pendingPayment = null;
      inst.payments = inst.payments || [];
      inst.payments.unshift({
        id: 'pay_' + Date.now(),
        timestamp: nowIso,
        refDigits,
        amountUSD: 20,
        rateEurBcv: body.rateEurBcv || 52.5,
        amountBs: body.amountBs || 1050,
        approvedBy: unlockPin ? 'PIN Maestro' : 'Auto-Validación'
      });
      saveLicensesDb(db);
      return sendJson(res, 200, {
        ok: true,
        approved: true,
        installation: inst
      });
    }

    // Dejar en espera de aprobación en el Panel de Administración (/admin.html)
    inst.status = 'pending_validation';
    inst.pendingPayment = {
      refDigits,
      bankName: body.bankName || 'Pago Móvil',
      payerPhone: body.payerPhone || '',
      amountUSD: 20,
      rateEurBcv: body.rateEurBcv || 52.5,
      amountBs: body.amountBs || 1050,
      reportedAt: nowIso,
      unlockPin: expectedPin
    };
    saveLicensesDb(db);

    return sendJson(res, 200, {
      ok: true,
      approved: false,
      pending: true,
      installation: inst
    });
  }

  if (safeUrl === '/api/admin/licenses' && req.method === 'GET') {
    const db = loadLicensesDb();
    const enriched = db.installations.map((inst) => ({
      ...inst,
      sampleUnlockPin: inst.pendingPayment
        ? generateUnlockPin(inst.licenseId, inst.pendingPayment.refDigits)
        : null
    }));
    return sendJson(res, 200, {
      ok: true,
      requireManualApproval: db.requireManualApproval,
      installations: enriched
    });
  }

  if (safeUrl === '/api/admin/action' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const { action, licenseId, days } = body;
    const db = loadLicensesDb();

    if (action === 'toggle_manual_approval') {
      db.requireManualApproval = Boolean(body.requireManualApproval);
      saveLicensesDb(db);
      return sendJson(res, 200, { ok: true, requireManualApproval: db.requireManualApproval });
    }

    const inst = db.installations.find((x) => x.licenseId === licenseId);
    if (!inst) return sendJson(res, 404, { ok: false, error: 'APK no encontrada' });

    const nowIso = new Date().toISOString();

    if (action === 'approve_payment') {
      const p = inst.pendingPayment || { refDigits: body.refDigits || 'MANUAL', amountBs: 0, rateEurBcv: 0 };
      inst.status = 'active';
      inst.expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
      inst.payments = inst.payments || [];
      inst.payments.unshift({
        id: 'pay_' + Date.now(),
        timestamp: nowIso,
        refDigits: p.refDigits,
        amountUSD: 20,
        rateEurBcv: p.rateEurBcv,
        amountBs: p.amountBs,
        approvedBy: 'Admin Panel'
      });
      inst.pendingPayment = null;
    } else if (action === 'reject_payment') {
      inst.status = 'expired';
      inst.pendingPayment = null;
      inst.lastRejectionNote = body.reason || 'Referencia de Pago Móvil no encontrada en Banco Mercantil.';
    } else if (action === 'grant_days') {
      const addDays = Number(days) || 7;
      const baseTime = inst.expiresAt && new Date(inst.expiresAt).getTime() > Date.now()
        ? new Date(inst.expiresAt).getTime()
        : Date.now();
      inst.expiresAt = new Date(baseTime + addDays * 86400000).toISOString();
      if (inst.status === 'expired' || inst.status === 'suspended') {
        inst.status = addDays >= 25 ? 'active' : 'trial';
      }
    } else if (action === 'suspend') {
      inst.status = 'suspended';
      inst.expiresAt = new Date(Date.now() - 1000).toISOString();
    } else if (action === 'delete') {
      db.installations = db.installations.filter((x) => x.licenseId !== licenseId);
    }

    saveLicensesDb(db);
    return sendJson(res, 200, { ok: true, installation: inst });
  }

  
  if (safeUrl === '/api/admin/whatsapp-config' && req.method === 'GET') {
    const db = loadLicensesDb();
    return sendJson(res, 200, {
      ok: true,
      adminWhatsapp: db.adminWhatsapp || { phone: '04127049393', notifyOnPayment: true }
    });
  }

  if (safeUrl === '/api/admin/whatsapp-config' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const db = loadLicensesDb();
    db.adminWhatsapp = {
      phone: String(body.phone || '04127049393').trim(),
      notifyOnPayment: body.notifyOnPayment !== false
    };
    saveLicensesDb(db);

    // Intentar sincronizar también en Firebase RTDB
    try {
      await fetch(`${FIREBASE_RTDB_URL}/config/adminWhatsapp.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db.adminWhatsapp)
      });
    } catch (_) {}

    return sendJson(res, 200, { ok: true, adminWhatsapp: db.adminWhatsapp });
  }

  if (safeUrl === '/api/wa/test' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const db = loadLicensesDb();
    const phone = body.phone || (db.adminWhatsapp && db.adminWhatsapp.phone) || '04127049393';

    if (waStatus !== 'connected' || !waSock) {
      return sendJson(res, 400, {
        ok: false,
        error: 'El Bot de WhatsApp aún no está vinculado. Escanea el código QR primero.'
      });
    }

    const testMsg =
      `🤖 *¡PRUEBA EXITOSA DEL BOT POSTFLOW!* ⚡\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `¡Hola Administrador! Tu Bot de WhatsApp está 100% configurado y vinculado.\n\n` +
      `A partir de ahora, cada vez que un cliente reporte un Pago Móvil en tu sistema, recibirás una notificación instantánea con la referencia, el monto y el PIN de activación.\n\n` +
      `🕒 Fecha/Hora: ${new Date().toLocaleString('es-VE')}\n` +
      `━━━━━━━━━━━━━━━━━━━━`;

    const resSend = await sendWhatsAppMessageDirect(phone, testMsg);
    if (resSend.ok) {
      return sendJson(res, 200, { ok: true, message: 'Mensaje de prueba enviado con éxito' });
    } else {
      return sendJson(res, 500, { ok: false, error: resSend.error || 'Error enviando mensaje' });
    }
  }

  if (safeUrl === '/api/wa/status' && req.method === 'GET') {
    const db = loadLicensesDb();
    return sendJson(res, 200, {
      status: waStatus,
      qrDataUrl: waQrDataUrl,
      userPhone: waConnectedUser,
      adminWhatsapp: db.adminWhatsapp || { phone: '04127049393', notifyOnPayment: true }
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

  let decodedUrl = '/index.html';
  try {
    decodedUrl = decodeURIComponent(safeUrl === '/' ? '/index.html' : safeUrl);
  } catch (_) {}
  const normalizedPath = path.normalize(decodedUrl);
  const filePath = path.resolve(ROOT, '.' + normalizedPath);
  const rootResolved = path.resolve(ROOT);

  if (!filePath.startsWith(rootResolved)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Acceso denegado: Path Traversal');
  }

  const relPath = path.relative(rootResolved, filePath).replace(/\\/g, '/');
  const isSensitive =
    relPath.startsWith('wa_auth_info') ||
    relPath.startsWith('.git') ||
    relPath.startsWith('.firebase') ||
    relPath === 'licenses_db.json' ||
    relPath === 'server.js' ||
    relPath === 'package.json' ||
    relPath.split('/').some((part) => part.startsWith('.'));

  if (isSensitive) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Acceso restringido');
  }

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
