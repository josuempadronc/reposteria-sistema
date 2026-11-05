// ==========================================
// SISTEMA POS, PEDIDOS, CLIENTES, INVENTARIO Y CORTE DE CAJA - REPOSTERÍA
// Precios base en Pesos (COP) con conversión a USD y Bs
// ==========================================

const STORAGE_KEY = 'reposteria_pos_data_v2';

// Generador de ilustraciones SVG limpias para productos de muestra
function makeSampleProductSvg(bg, emoji, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
    </defs>
    <rect width="320" height="220" fill="url(#g)"/>
    <circle cx="160" cy="95" r="58" fill="rgba(255,255,255,0.75)"/>
    <text x="160" y="114" font-size="60" text-anchor="middle">${emoji}</text>
    <text x="160" y="192" font-family="sans-serif" font-size="15" font-weight="bold" fill="#5c3d2e" text-anchor="middle">${label}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

const defaultState = {
  config: {
    brandName: 'Dulce Repostería',
    brandSlogan: 'Pastelería Artesanal & Café',
    brandPhone: '',
    brandEmoji: '🧁',
    brandLogo: '',
    colorPrimary: '#c84b6b',
    colorSecondary: '#5c3d2e',
    colorBg: '#fdfaf7',
    requireLoginOnStart: false,
    categories: ['Pasteles', 'Porciones', 'Cupcakes', 'Galletas', 'Postres Fríos', 'Bebidas'],
    rateUSD: 4200, // 1 USD = 4,200 COP
    rateBS: 70     // 1 Bs = 70 COP
  },
  membership: {
    onboardingCompleted: false,
    status: 'trial', // 'trial' | 'active' | 'expired'
    trialStartDate: null,
    expiresAt: null,
    planPriceUSD: 20,
    bcvEuroRate: 52.50,
    bcvEuroUpdatedAt: null,
    payments: []
  },
  users: [
    { id: 'u1', name: 'Administrador General', avatar: '👑', role: 'admin', pin: '1234', active: true },
    { id: 'u2', name: 'Cajera Turno', avatar: '🧾', role: 'cajero', pin: '1111', active: true },
    { id: 'u3', name: 'Maestro Repostero', avatar: '👩‍🍳', role: 'repostero', pin: '2222', active: true }
  ],
  auditLog: [
    { id: 'aud1', timestamp: new Date().toISOString(), userName: 'Administrador General', role: 'admin', action: 'Inicio del sistema' }
  ],
  baseCash: {
    COP: 100000,
    USD: 20,
    BS: 200
  },
  customers: [
    {
      id: 'c1',
      name: 'María Alejandra Pérez',
      doc: 'V-18452310',
      phone: '+58 414 5551234',
      address: 'Urb. Las Acacias, Calle 4',
      notes: 'Cliente frecuente, prefiere tortas tres leches y bajas en azúcar.'
    },
    {
      id: 'c2',
      name: 'Carlos Andrés Gómez',
      doc: 'CC-1090456789',
      phone: '+57 311 4448899',
      address: 'Barrio Caobos, Av. 3',
      notes: 'Encarga cupcakes para eventos corporativos.'
    }
  ],
  orders: [
    {
      id: 'ord1',
      createdAt: new Date().toISOString(),
      customerId: 'c1',
      customerName: 'María Alejandra Pérez',
      customerPhone: '+58 414 5551234',
      deliveryDate: getFutureDate(0),
      deliveryTime: '17:00',
      description: 'Torta de 1 libra sabor Chocolate rellena de frutos rojos, decoración rosas pastel. Dedicatoria: "Feliz Cumpleaños Mamá".',
      totalCOP: 85000,
      paidCOP: 40000,
      status: 'En Preparación'
    },
    {
      id: 'ord2',
      createdAt: new Date().toISOString(),
      customerId: 'c2',
      customerName: 'Carlos Andrés Gómez',
      customerPhone: '+57 311 4448899',
      deliveryDate: getFutureDate(2),
      deliveryTime: '14:30',
      description: 'Caja de 12 Cupcakes Red Velvet y Chocolate con logos empresariales.',
      totalCOP: 90000,
      paidCOP: 90000,
      status: 'Pendiente'
    }
  ],
  products: [
    {
      id: 'p1',
      name: 'Torta Tres Leches (Porción)',
      emoji: '🍰',
      image: makeSampleProductSvg('#fde2e8', '🍰', 'Tres Leches'),
      category: 'Porciones',
      priceCOP: 12000,
      stock: 18,
      minStock: 5,
      expiry: getFutureDate(3)
    },
    {
      id: 'p2',
      name: 'Torta de Chocolate Matilda',
      emoji: '🍫',
      image: makeSampleProductSvg('#ebd5c8', '🍫', 'Chocolate Matilda'),
      category: 'Pasteles',
      priceCOP: 65000,
      stock: 4,
      minStock: 2,
      expiry: getFutureDate(4)
    },
    {
      id: 'p3',
      name: 'Cupcake Red Velvet',
      emoji: '🧁',
      image: makeSampleProductSvg('#fce7f3', '🧁', 'Red Velvet'),
      category: 'Cupcakes',
      priceCOP: 7500,
      stock: 24,
      minStock: 6,
      expiry: getFutureDate(2)
    },
    {
      id: 'p4',
      name: 'Cheesecake de Frutos Rojos',
      emoji: '🍓',
      image: makeSampleProductSvg('#ffe4e6', '🍓', 'Cheesecake'),
      category: 'Postres Fríos',
      priceCOP: 14000,
      stock: 10,
      minStock: 4,
      expiry: getFutureDate(2)
    },
    {
      id: 'p5',
      name: 'Galleta New York ChocoChips',
      emoji: '🍪',
      image: makeSampleProductSvg('#fef3c7', '🍪', 'Galleta NY'),
      category: 'Galletas',
      priceCOP: 6000,
      stock: 30,
      minStock: 8,
      expiry: getFutureDate(7)
    },
    {
      id: 'p6',
      name: 'Quesillo / Flan Napolitano',
      emoji: '🍮',
      image: makeSampleProductSvg('#ffedd5', '🍮', 'Quesillo Casero'),
      category: 'Postres Fríos',
      priceCOP: 9500,
      stock: 3,
      minStock: 5,
      expiry: getFutureDate(1)
    },
    {
      id: 'p7',
      name: 'Café Cappuccino Grande',
      emoji: '☕',
      image: makeSampleProductSvg('#e5d5c5', '☕', 'Cappuccino'),
      category: 'Bebidas',
      priceCOP: 7000,
      stock: 50,
      minStock: 10,
      expiry: ''
    },
    {
      id: 'p8',
      name: 'Milhojas de Arequipe',
      emoji: '🥐',
      image: makeSampleProductSvg('#fef08a', '🥐', 'Milhojas'),
      category: 'Porciones',
      priceCOP: 10500,
      stock: 12,
      minStock: 4,
      expiry: getFutureDate(1)
    }
  ],
  ingredients: [
    { id: 'i1', name: 'Harina de Trigo Todo Uso', unit: 'kg', stock: 25, minStock: 10, costCOP: 4200, expiry: getFutureDate(60) },
    { id: 'i2', name: 'Azúcar Blanca Refinada', unit: 'kg', stock: 18, minStock: 8, costCOP: 4800, expiry: getFutureDate(90) },
    { id: 'i3', name: 'Mantequilla sin Sal', unit: 'kg', stock: 4, minStock: 5, costCOP: 28000, expiry: getFutureDate(15) },
    { id: 'i4', name: 'Huevos Frescos AA', unit: 'unid', stock: 90, minStock: 30, costCOP: 600, expiry: getFutureDate(12) },
    { id: 'i5', name: 'Crema de Leche Repostera', unit: 'L', stock: 3, minStock: 4, costCOP: 19500, expiry: getFutureDate(2) },
    { id: 'i6', name: 'Chocolate Cobertura 70%', unit: 'kg', stock: 6, minStock: 3, costCOP: 38000, expiry: getFutureDate(120) },
    { id: 'i7', name: 'Cajas para Tortas y Empaques', unit: 'unid', stock: 40, minStock: 15, costCOP: 2200, expiry: '' }
  ],
  sales: [],
  expenses: [],
  mermas: [],
  closedDays: []
};

let state = loadState();
let cart = [];
let activeCategory = 'Todas';
let activePayMethod = 'efectivo';
let customerModalReturnToOrder = false;
let currentUser = state.users && state.users.length > 0 ? state.users[0] : { id: 'u1', name: 'Administrador', avatar: '👑', role: 'admin', pin: '1234' };

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('reposteria_pos_data_v1');
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      config: { ...defaultState.config, ...(parsed.config || {}) },
      membership: { ...defaultState.membership, ...(parsed.membership || {}) },
      baseCash: { ...defaultState.baseCash, ...(parsed.baseCash || {}) },
      users: parsed.users && parsed.users.length ? parsed.users : structuredClone(defaultState.users),
      auditLog: parsed.auditLog || structuredClone(defaultState.auditLog),
      customers: parsed.customers || structuredClone(defaultState.customers),
      orders: parsed.orders || structuredClone(defaultState.orders)
    };
  } catch (e) {
    console.error('Error cargando estado:', e);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateGlobalAlerts();
}

// ==========================================
// CONVERSIONES Y FORMATEO DE MONEDA
// ==========================================
function copToUSD(cop) {
  const r = Number(state.config.rateUSD) || 1;
  return cop / r;
}

function copToBS(cop) {
  const r = Number(state.config.rateBS) || 1;
  return cop / r;
}

function usdToCOP(usd) {
  const r = Number(state.config.rateUSD) || 1;
  return usd * r;
}

function bsToCOP(bs) {
  const r = Number(state.config.rateBS) || 1;
  return bs * r;
}

function fmtCOP(val) {
  const num = Math.round(Number(val) || 0);
  return '$ ' + num.toLocaleString('es-CO');
}

function fmtUSD(val) {
  const num = Number(val) || 0;
  return '$ ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtBS(val) {
  const num = Number(val) || 0;
  return num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs';
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ==========================================
// INICIALIZACIÓN Y NAVEGACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initModals();
  initTopbarEvents();
  initUsersAndAuthEvents();
  initPOSEvents();
  initOrdersEvents();
  initCustomersEvents();
  initInventoryEvents();
  initIngredientsEvents();
  initMermasEvents();
  initExpensesEvents();
  initCorteEvents();
  initConfigEvents();
  initOnboardingAndMembershipEvents();

  renderAll();
  if (!state.membership.onboardingCompleted) {
    openOnboardingWizard(1);
  } else if (isMembershipExpired()) {
    openMembershipModal(true);
  } else if (state.config.requireLoginOnStart) {
    openLoginScreen();
  }
});

function renderAll() {
  renderBrandAndRates();
  renderMembershipStatus();
  renderActiveUserSession();
  renderCustomerSelectors();
  renderPOSCategories();
  renderPOSProducts();
  renderCart();
  renderOrdersSection();
  renderCustomersTable();
  renderInventoryTable();
  renderIngredientsTable();
  renderMermasAndExpiry();
  renderMovimientos();
  renderCorteDeCaja();
  renderUsersSection();
  renderConfigForm();
  updateGlobalAlerts();
}

function goToTab(tabId) {
  const btn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (btn && !btn.classList.contains('hidden')) {
    btn.click();
  }
}

function openMobileSidebar() {
  const sb = document.getElementById('appSidebar');
  const bd = document.getElementById('mobileSidebarBackdrop');
  if (sb) sb.classList.add('mobile-open');
  if (bd) bd.classList.remove('hidden');
}

function closeMobileSidebar() {
  const sb = document.getElementById('appSidebar');
  const bd = document.getElementById('mobileSidebarBackdrop');
  if (sb) sb.classList.remove('mobile-open');
  if (bd) bd.classList.add('hidden');
}

function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  const mobNavButtons = document.querySelectorAll('.mob-nav-btn[data-mobtab]');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      if ((tabId === 'config' || tabId === 'usuarios') && currentUser.role !== 'admin') {
        showToast('🔒 Solo un usuario Administrador puede acceder a esta sección');
        return;
      }
      navButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      mobNavButtons.forEach((mb) => {
        mb.classList.toggle('active', mb.dataset.mobtab === tabId);
      });

      const titleSpan = btn.querySelector('span:nth-child(2)');
      const mobTitle = document.getElementById('mobileActiveTabTitle');
      if (mobTitle && titleSpan) {
        mobTitle.textContent = titleSpan.textContent;
      }

      document.querySelectorAll('.tab-section').forEach((sec) => sec.classList.remove('active'));
      document.getElementById(`tab-${tabId}`).classList.add('active');

      closeMobileSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (tabId === 'corte') renderCorteDeCaja();
      if (tabId === 'movimientos') renderMovimientos();
      if (tabId === 'usuarios') renderUsersSection();
    });
  });

  // Barra inferior móvil
  mobNavButtons.forEach((mb) => {
    mb.addEventListener('click', () => {
      goToTab(mb.dataset.mobtab);
    });
  });

  const btnMore = document.getElementById('btnBottomNavMore');
  if (btnMore) btnMore.addEventListener('click', openMobileSidebar);

  const btnOpenSb = document.getElementById('btnOpenMobileSidebar');
  if (btnOpenSb) btnOpenSb.addEventListener('click', openMobileSidebar);

  const btnCloseSb = document.getElementById('btnCloseMobileSidebar');
  if (btnCloseSb) btnCloseSb.addEventListener('click', closeMobileSidebar);

  const backdrop = document.getElementById('mobileSidebarBackdrop');
  if (backdrop) backdrop.addEventListener('click', closeMobileSidebar);

  // Botones rápidos de cabecera móvil y selector POS móvil
  const btnMobAlert = document.getElementById('btnMobileAlertBell');
  if (btnMobAlert) btnMobAlert.addEventListener('click', openCriticalAlertsModal);

  const toggleMobileTools = () => {
    const topbar = document.getElementById('mainTopbar');
    const stripBtn = document.getElementById('btnStripToggleTools');
    if (!topbar) return;
    const isExp = topbar.classList.toggle('mobile-expanded');
    if (stripBtn) {
      stripBtn.textContent = isExp ? '▲ Ocultar Herramientas' : '⚡ Tasas y Caja Rápida ▾';
    }
  };

  const btnToggleTopbar = document.getElementById('btnToggleMobileTopbar');
  if (btnToggleTopbar) btnToggleTopbar.addEventListener('click', toggleMobileTools);

  const btnStripToggle = document.getElementById('btnStripToggleTools');
  if (btnStripToggle) btnStripToggle.addEventListener('click', toggleMobileTools);

  const btnMobPosCatalog = document.getElementById('btnMobPosCatalog');
  if (btnMobPosCatalog) btnMobPosCatalog.addEventListener('click', () => setMobilePosView('catalog'));

  const btnMobPosCart = document.getElementById('btnMobPosCart');
  if (btnMobPosCart) btnMobPosCart.addEventListener('click', () => setMobilePosView('cart'));

  const btnBackCatalog = document.getElementById('btnMobileBackToCatalog');
  if (btnBackCatalog) btnBackCatalog.addEventListener('click', () => setMobilePosView('catalog'));

  const goToMobileCart = () => {
    goToTab('pos');
    setMobilePosView('cart');
  };

  const btnMobCart = document.getElementById('btnMobileGoCart');
  if (btnMobCart) btnMobCart.addEventListener('click', goToMobileCart);

  const btnMfc = document.getElementById('btnMfcScrollToCart');
  if (btnMfc) btnMfc.addEventListener('click', goToMobileCart);

  const now = new Date();
  document.getElementById('currentDateDisplay').textContent = now.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function initModals() {
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-close');
      document.getElementById(target).classList.add('hidden');
    });
  });
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// ==========================================
// CABECERA, MARCA, LOGO, TEMA DE COLORES Y TASAS EN VIVO
// ==========================================
function applyThemeColors(primary, secondary, bg) {
  const root = document.documentElement;
  const p = primary || '#c84b6b';
  const s = secondary || '#5c3d2e';
  const b = bg || '#fdfaf7';

  root.style.setProperty('--primary', p);
  root.style.setProperty('--primary-hover', p);
  root.style.setProperty('--primary-light', p + '18');
  root.style.setProperty('--secondary', s);
  root.style.setProperty('--bg-app', b);
}

function renderBrandAndRates() {
  const { brandName, brandSlogan, brandEmoji, brandLogo, colorPrimary, colorSecondary, colorBg, rateUSD, rateBS } = state.config;
  document.getElementById('brandNameDisplay').textContent = brandName;
  document.getElementById('brandSloganDisplay').textContent = brandSlogan;
  document.getElementById('printBrandName').textContent = `${brandName} - Entrega de Cuentas`;
  const mobBrand = document.getElementById('mobileBrandNameDisplay');
  if (mobBrand) mobBrand.textContent = brandName;

  const brandLogoContainer = document.getElementById('brandEmoji');
  const printLogoImg = document.getElementById('printBrandLogo');

  if (brandLogo) {
    brandLogoContainer.innerHTML = `<img src="${brandLogo}" alt="${brandName}" />`;
    if (printLogoImg) {
      printLogoImg.src = brandLogo;
      printLogoImg.style.display = 'block';
    }
  } else {
    brandLogoContainer.textContent = brandEmoji || '🧁';
    if (printLogoImg) {
      printLogoImg.src = '';
      printLogoImg.style.display = 'none';
    }
  }

  applyThemeColors(colorPrimary, colorSecondary, colorBg);

  document.getElementById('quickRateUSD').value = rateUSD;
  document.getElementById('quickRateBS').value = rateBS;

  const bsPerUsd = rateBS > 0 ? (rateUSD / rateBS).toFixed(2) : '0.00';
  document.getElementById('impliedUsdBsDisplay').textContent = `1$ ≈ ${bsPerUsd} Bs`;

  const mobStripTxt = document.getElementById('mobileRatesSummaryText');
  if (mobStripTxt) {
    mobStripTxt.textContent = `🇺🇸 1$ = ${fmtCOP(rateUSD)} | 🇻🇪 1$ ≈ ${bsPerUsd} Bs`;
  }
}

function setMobilePosView(view) {
  const posSec = document.getElementById('tab-pos');
  const btnCat = document.getElementById('btnMobPosCatalog');
  const btnCart = document.getElementById('btnMobPosCart');
  if (!posSec) return;

  if (view === 'cart') {
    posSec.classList.add('mobile-pos-cart-view');
    if (btnCat) btnCat.classList.remove('active');
    if (btnCart) btnCart.classList.add('active');
  } else {
    posSec.classList.remove('mobile-pos-cart-view');
    if (btnCat) btnCat.classList.add('active');
    if (btnCart) btnCart.classList.remove('active');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initTopbarEvents() {
  const quickUSD = document.getElementById('quickRateUSD');
  const quickBS = document.getElementById('quickRateBS');

  const updateQuickRates = () => {
    const u = parseFloat(quickUSD.value);
    const b = parseFloat(quickBS.value);
    if (u > 0) state.config.rateUSD = u;
    if (b > 0) state.config.rateBS = b;
    saveState();
    renderAll();
  };

  quickUSD.addEventListener('change', updateQuickRates);
  quickBS.addEventListener('change', updateQuickRates);

  document.getElementById('btnOpenConverter').addEventListener('click', () => {
    document.getElementById('convInputCOP').value = '';
    document.getElementById('convInputUSD').value = '';
    document.getElementById('convInputBS').value = '';
    openModal('modalConverter');
  });

  const inpCOP = document.getElementById('convInputCOP');
  const inpUSD = document.getElementById('convInputUSD');
  const inpBS = document.getElementById('convInputBS');

  inpCOP.addEventListener('input', () => {
    const v = parseFloat(inpCOP.value) || 0;
    inpUSD.value = v ? copToUSD(v).toFixed(2) : '';
    inpBS.value = v ? copToBS(v).toFixed(2) : '';
  });

  inpUSD.addEventListener('input', () => {
    const v = parseFloat(inpUSD.value) || 0;
    const cop = usdToCOP(v);
    inpCOP.value = v ? Math.round(cop) : '';
    inpBS.value = v ? copToBS(cop).toFixed(2) : '';
  });

  inpBS.addEventListener('input', () => {
    const v = parseFloat(inpBS.value) || 0;
    const cop = bsToCOP(v);
    inpCOP.value = v ? Math.round(cop) : '';
    inpUSD.value = v ? copToUSD(cop).toFixed(2) : '';
  });

  // Botón Ingreso Extra Rápido
  document.getElementById('btnQuickIncome').addEventListener('click', () => {
    openMovementModal('ingreso');
  });

  // Botón Gasto Rápido
  document.getElementById('btnQuickExpense').addEventListener('click', () => {
    openMovementModal('gasto');
  });

  // Botón Fondo Inicial de Caja
  document.getElementById('btnOpenBaseModal').addEventListener('click', () => {
    document.getElementById('baseCashCOP').value = state.baseCash.COP || 0;
    document.getElementById('baseCashUSD').value = state.baseCash.USD || 0;
    document.getElementById('baseCashBS').value = state.baseCash.BS || 0;
    openModal('modalBaseCash');
  });

  // Botón Modal App / APK
  let deferredInstallPrompt = null;
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker
      .register('sw.js?v=6')
      .then((reg) => reg.update())
      .catch(() => {});
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btnInstall = document.getElementById('btnPwaInstallPrompt');
    if (btnInstall) btnInstall.classList.remove('hidden');
  });

  document.getElementById('btnPwaInstallPrompt').addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    document.getElementById('btnPwaInstallPrompt').classList.add('hidden');
  });

  document.getElementById('btnOpenApkModal').addEventListener('click', async () => {
    openModal('modalApk');
    document.getElementById('cfgApiBaseUrl').value = state.config.apiBaseUrl || '';
    try {
      const res = await fetch(getApiUrl('/api/mobile-info'));
      if (res.ok) {
        const info = await res.json();
        document.getElementById('apkMobileUrlText').textContent = info.mobileUrl;
        document.getElementById('apkQrContainer').innerHTML = `<img src="${info.qrDataUrl}" alt="QR App Móvil" style="width:205px;height:205px;" />`;
        if (!state.config.apiBaseUrl) {
          document.getElementById('cfgApiBaseUrl').placeholder = `Ej. ${info.mobileUrl}`;
        }
      }
    } catch (_) {
      document.getElementById('apkQrContainer').innerHTML = `<span style="font-size:12px;color:var(--text-muted);padding:12px;">Configura la IP del servidor abajo para conectar</span>`;
    }
  });

  document.getElementById('btnSaveApiBaseUrl').addEventListener('click', () => {
    const val = document.getElementById('cfgApiBaseUrl').value.trim().replace(/\/+$/, '');
    state.config.apiBaseUrl = val;
    saveState();
    pollWhatsAppStatus();
    showToast('✅ Dirección IP del servidor guardada');
  });

  // Botón Modal WhatsApp Automático (QR)
  document.getElementById('btnOpenWaModal').addEventListener('click', () => {
    openModal('modalWhatsApp');
    pollWhatsAppStatus();
  });

  document.getElementById('btnLogoutWa').addEventListener('click', async () => {
    if (!confirm('¿Desvincular el WhatsApp actual y generar un nuevo Código QR?')) return;
    try {
      await fetch(getApiUrl('/api/wa/logout'), { method: 'POST' });
      showToast('🔄 Generando nuevo Código QR...');
      setTimeout(pollWhatsAppStatus, 1500);
    } catch (e) {
      showToast('⚠️ Error comunicando con el servidor local');
    }
  });

  document.getElementById('btnSendTestWa').addEventListener('click', async () => {
    const phone = document.getElementById('waTestPhone').value.trim();
    if (!phone) {
      showToast('⚠️ Escribe un número de teléfono para la prueba');
      return;
    }
    const brand = state.config.brandName || 'Dulce Repostería';
    const msg = `✅ ¡Hola! Prueba de envío automático desde el sistema de *${brand}*.`;
    const sent = await sendWhatsAppViaServer(phone, msg);
    if (sent) {
      showToast(`✅ Mensaje de prueba enviado automáticamente a ${phone}`);
    }
  });

  // Consultar estado de WhatsApp cada 3 segundos
  pollWhatsAppStatus();
  setInterval(pollWhatsAppStatus, 3500);

  document.getElementById('formBaseCash').addEventListener('submit', (e) => {
    e.preventDefault();
    state.baseCash.COP = parseFloat(document.getElementById('baseCashCOP').value) || 0;
    state.baseCash.USD = parseFloat(document.getElementById('baseCashUSD').value) || 0;
    state.baseCash.BS = parseFloat(document.getElementById('baseCashBS').value) || 0;
    saveState();
    closeModal('modalBaseCash');
    renderCorteDeCaja();
    showToast('🏦 Fondo inicial de caja actualizado');
  });
}

// ==========================================
// CLIENTES (DIRECTORIO Y SELECTORES)
// ==========================================
function renderCustomerSelectors() {
  const posSel = document.getElementById('posCustomerSelect');
  const ordSel = document.getElementById('ordCustomerId');
  const currentPosVal = posSel.value;
  const currentOrdVal = ordSel.value;

  const opts = state.customers
    .map((c) => `<option value="${c.id}">${c.name} (${c.phone || 'Sin tel.'})</option>`)
    .join('');

  posSel.innerHTML = `<option value="">👤 Cliente Mostrador (General)</option>` + opts;
  ordSel.innerHTML = opts || `<option value="">-- Primero registra un cliente --</option>`;

  if (currentPosVal) posSel.value = currentPosVal;
  if (currentOrdVal) ordSel.value = currentOrdVal;
}

function renderCustomersTable() {
  const tbody = document.getElementById('customersTableBody');
  const query = (document.getElementById('customerSearchInput').value || '').toLowerCase().trim();

  const filtered = state.customers.filter((c) => {
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      (c.phone || '').toLowerCase().includes(query) ||
      (c.doc || '').toLowerCase().includes(query) ||
      (c.address || '').toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#7a685f;">No se encontraron clientes registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const custSales = state.sales.filter((s) => s.customerId === c.id);
      const custOrders = state.orders.filter((o) => o.customerId === c.id);
      const totalBoughtCOP =
        custSales.filter((s) => !s.isOrderPayment).reduce((a, b) => a + b.totalCOP, 0) +
        custOrders.reduce((a, b) => a + b.paidCOP, 0);

      const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

      return `
        <tr>
          <td><strong>👤 ${c.name}</strong></td>
          <td>${c.doc || '-'}</td>
          <td>
            ${c.phone || '-'}
            ${waLink ? `<a href="${waLink}" target="_blank" class="btn btn-outline btn-sm" style="margin-left:4px;text-decoration:none;">💬</a>` : ''}
          </td>
          <td>${c.address || '-'}</td>
          <td><small>${c.notes || '-'}</small></td>
          <td>${custSales.length} ventas / ${custOrders.length} pedidos</td>
          <td><strong>${fmtCOP(totalBoughtCOP)}</strong><br><small>${fmtUSD(copToUSD(totalBoughtCOP))}</small></td>
          <td>
            <button class="btn btn-outline btn-sm" data-editcust="${c.id}">✏️</button>
            <button class="btn btn-outline btn-sm" data-delcust="${c.id}">🗑️</button>
          </td>
        </tr>
      `;
    })
    .join('');

  tbody.querySelectorAll('[data-editcust]').forEach((btn) => {
    btn.addEventListener('click', () => openCustomerModal(btn.dataset.editcust));
  });

  tbody.querySelectorAll('[data-delcust]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const c = state.customers.find((x) => x.id === btn.dataset.delcust);
      if (c && confirm(`¿Eliminar a "${c.name}" del directorio de clientes?`)) {
        state.customers = state.customers.filter((x) => x.id !== c.id);
        saveState();
        renderAll();
      }
    });
  });
}

function initCustomersEvents() {
  document.getElementById('customerSearchInput').addEventListener('input', renderCustomersTable);
  document.getElementById('btnNewCustomer').addEventListener('click', () => {
    customerModalReturnToOrder = false;
    openCustomerModal(null);
  });
  document.getElementById('btnQuickNewCustomer').addEventListener('click', () => {
    customerModalReturnToOrder = false;
    openCustomerModal(null);
  });
  document.getElementById('btnNewCustFromOrder').addEventListener('click', () => {
    customerModalReturnToOrder = true;
    openCustomerModal(null);
  });

  document.getElementById('formCustomer').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('custId').value;
    const newId = id || 'c_' + Date.now();
    const data = {
      id: newId,
      name: document.getElementById('custName').value.trim(),
      doc: document.getElementById('custDoc').value.trim(),
      phone: document.getElementById('custPhone').value.trim(),
      address: document.getElementById('custAddress').value.trim(),
      notes: document.getElementById('custNotes').value.trim()
    };

    if (id) {
      const idx = state.customers.findIndex((c) => c.id === id);
      if (idx >= 0) state.customers[idx] = data;
    } else {
      state.customers.unshift(data);
    }

    saveState();
    closeModal('modalCustomer');
    renderAll();

    if (customerModalReturnToOrder) {
      document.getElementById('ordCustomerId').value = newId;
    } else {
      document.getElementById('posCustomerSelect').value = newId;
    }
    showToast(`👤 Cliente "${data.name}" guardado`);
  });
}

function openCustomerModal(custId) {
  if (custId) {
    const c = state.customers.find((x) => x.id === custId);
    if (!c) return;
    document.getElementById('modalCustomerTitle').textContent = 'Editar Cliente';
    document.getElementById('custId').value = c.id;
    document.getElementById('custName').value = c.name;
    document.getElementById('custDoc').value = c.doc || '';
    document.getElementById('custPhone').value = c.phone || '';
    document.getElementById('custAddress').value = c.address || '';
    document.getElementById('custNotes').value = c.notes || '';
  } else {
    document.getElementById('modalCustomerTitle').textContent = 'Nuevo Cliente';
    document.getElementById('formCustomer').reset();
    document.getElementById('custId').value = '';
  }
  openModal('modalCustomer');
}

// ==========================================
// PEDIDOS Y ENCARGOS PERSONALIZADOS
// ==========================================
let currentWaServerStatus = 'disconnected';

function getApiUrl(endpoint) {
  const base = (state.config.apiBaseUrl || '').trim().replace(/\/+$/, '');
  return base ? `${base}${endpoint}` : endpoint;
}

async function pollWhatsAppStatus() {
  try {
    const res = await fetch(getApiUrl('/api/wa/status'));
    if (!res.ok) return;
    const data = await res.json();
    currentWaServerStatus = data.status;

    const dot = document.getElementById('waTopbarDot');
    const txt = document.getElementById('waTopbarText');
    const badge = document.getElementById('waStatusBadge');
    const qrBox = document.getElementById('waQrContainer');
    const testSec = document.getElementById('waTestSection');

    if (data.status === 'connected') {
      dot.textContent = '🟢';
      txt.textContent = 'WA Conectado';
      badge.className = 'status-badge entregado';
      badge.textContent = `✅ Conectado automáticamente (${data.userPhone || 'Activo'})`;
      qrBox.innerHTML = `<div style="padding:20px;color:var(--success);font-weight:700;">🎉 ¡WhatsApp Vinculado!<br><small style="color:var(--text-muted);font-weight:500;">Los mensajes de pedidos listos se enviarán solos en segundo plano.</small></div>`;
      testSec.classList.remove('hidden');
    } else if (data.status === 'qr' && data.qrDataUrl) {
      dot.textContent = '📷';
      txt.textContent = 'Escanear QR WA';
      badge.className = 'status-badge pendiente';
      badge.textContent = '📷 Escanea este Código QR con tu WhatsApp';
      qrBox.innerHTML = `<img src="${data.qrDataUrl}" alt="Código QR WhatsApp" style="width:236px;height:236px;" />`;
      testSec.classList.add('hidden');
    } else {
      dot.textContent = '⏳';
      txt.textContent = 'WhatsApp Auto';
      badge.className = 'status-badge preparacion';
      badge.textContent = '⏳ Generando código QR de conexión...';
      qrBox.innerHTML = `<span style="color:var(--text-muted);font-size:13px;">Conectando con WhatsApp...</span>`;
      testSec.classList.add('hidden');
    }
  } catch (_) {}
}

function normalizePhoneForWhatsApp(rawPhone) {
  let cleanPhone = String(rawPhone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('04') && cleanPhone.length === 11) {
    cleanPhone = '58' + cleanPhone.slice(1);
  } else if (cleanPhone.length === 10 && cleanPhone.startsWith('3')) {
    cleanPhone = '57' + cleanPhone;
  }
  return cleanPhone;
}

async function sendWhatsAppViaServer(phone, message) {
  const cleanPhone = normalizePhoneForWhatsApp(phone);
  try {
    const res = await fetch(getApiUrl('/api/wa/send'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, message })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      return true;
    }
    showToast(`⚠️ ${data.error || 'No se pudo enviar automáticamente'}`);
    return false;
  } catch (err) {
    return false;
  }
}

async function sendOrderReadyWhatsApp(order) {
  if (!order) return;
  const cust = state.customers.find((c) => c.id === order.customerId);
  let rawPhone = order.customerPhone || (cust ? cust.phone : '') || '';
  let cleanPhone = normalizePhoneForWhatsApp(rawPhone);

  if (!cleanPhone) {
    const entered = prompt(
      `El cliente "${order.customerName}" no tiene teléfono registrado. Escribe su número con código de país (ej. 573001234567 o 584141234567):`,
      '57'
    );
    if (!entered) return;
    cleanPhone = normalizePhoneForWhatsApp(entered);
    if (!cleanPhone) return;
    order.customerPhone = entered.trim();
    if (cust) cust.phone = entered.trim();
    saveState();
  }

  const brand = state.config.brandName || 'Nuestra Repostería';
  const emoji = state.config.brandEmoji || '🧁';
  const pendingCOP = Math.max(0, order.totalCOP - order.paidCOP);

  let balanceLines = '';
  if (pendingCOP > 0) {
    balanceLines =
      `\n💰 *Resumen de Cuenta:*\n` +
      `• Total del pedido: ${fmtCOP(order.totalCOP)}\n` +
      `• Abonado: ${fmtCOP(order.paidCOP)}\n` +
      `• *Saldo pendiente al retirar:* ${fmtCOP(pendingCOP)} _(equivale a ${fmtUSD(copToUSD(pendingCOP))} USD ó ${fmtBS(copToBS(pendingCOP))})_`;
  } else {
    balanceLines = `\n✅ *Estado de cuenta:* Tu pedido ya se encuentra totalmente pagado (${fmtCOP(order.totalCOP)}).`;
  }

  const message =
    `¡Hola *${order.customerName}*! ${emoji} Te escribimos de *${brand}*.\n\n` +
    `🎉 Te informamos que tu pedido ya está *LISTO PARA ENTREGAR*:\n` +
    `🎂 *Detalle:* ${order.description}\n` +
    `📅 *Entrega programada:* ${order.deliveryDate} (${order.deliveryTime || ''})\n` +
    `${balanceLines}\n\n` +
    `¡Te esperamos! Muchas gracias por preferirnos ❤️`;

  // 1) Intentar envío 100% automático en segundo plano por el servidor local
  if (currentWaServerStatus === 'connected') {
    showToast(`⏳ Enviando WhatsApp automático a ${order.customerName}...`);
    const sentAuto = await sendWhatsAppViaServer(cleanPhone, message);
    if (sentAuto) {
      showToast(`✅ ¡WhatsApp enviado automáticamente a ${order.customerName}!`);
      return;
    }
  }

  // 2) Si aún no ha escaneado el QR, avisar y ofrecer abrir el QR o enviar por enlace
  if (confirm('Tu WhatsApp aún no está vinculado por Código QR para envío 100% silencioso.\n\n¿Deseas abrir el Código QR ahora para vincularlo (Aceptar) o abrir WhatsApp Web normal (Cancelar)?')) {
    openModal('modalWhatsApp');
    pollWhatsAppStatus();
  } else {
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }
}

function renderOrdersSection() {
  const activeOrders = state.orders.filter(
    (o) => o.status !== 'Entregado' && o.status !== 'Cancelado'
  );
  const todayStr = new Date().toISOString().split('T')[0];
  const todayActiveCount = activeOrders.filter((o) => o.deliveryDate === todayStr).length;

  const totalActiveCOP = activeOrders.reduce((a, b) => a + b.totalCOP, 0);
  const totalPaidActiveCOP = activeOrders.reduce((a, b) => a + b.paidCOP, 0);
  const totalPendingCOP = activeOrders.reduce((a, b) => a + Math.max(0, b.totalCOP - b.paidCOP), 0);

  document.getElementById('ordKpiActive').textContent = `${activeOrders.length} pedidos`;
  document.getElementById('ordKpiToday').textContent = `Para entregar hoy: ${todayActiveCount}`;
  document.getElementById('ordKpiTotalCOP').textContent = fmtCOP(totalActiveCOP);
  document.getElementById('ordKpiTotalEquiv').textContent = `${fmtUSD(copToUSD(totalActiveCOP))} USD | ${fmtBS(copToBS(totalActiveCOP))}`;
  document.getElementById('ordKpiPaidCOP').textContent = fmtCOP(totalPaidActiveCOP);
  document.getElementById('ordKpiPendingCOP').textContent = fmtCOP(totalPendingCOP);
  document.getElementById('ordKpiPendingEquiv').textContent = `${fmtUSD(copToUSD(totalPendingCOP))} USD | ${fmtBS(copToBS(totalPendingCOP))}`;

  const query = (document.getElementById('orderSearchInput').value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('orderFilterStatus').value;

  const filtered = state.orders.filter((o) => {
    const matchText =
      !query ||
      (o.customerName || '').toLowerCase().includes(query) ||
      (o.description || '').toLowerCase().includes(query) ||
      (o.customerPhone || '').toLowerCase().includes(query);
    if (!matchText) return false;
    if (statusFilter === 'active') return o.status !== 'Entregado' && o.status !== 'Cancelado';
    if (statusFilter !== 'all') return o.status === statusFilter;
    return true;
  });

  const tbody = document.getElementById('ordersTableBody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#7a685f;">No hay pedidos que coincidan con este filtro.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((o) => {
      const pendingCOP = Math.max(0, o.totalCOP - o.paidCOP);
      const badgeClass =
        o.status === 'Pendiente'
          ? 'pendiente'
          : o.status === 'En Preparación'
          ? 'preparacion'
          : o.status === 'Listo para Entregar'
          ? 'listo'
          : o.status === 'Entregado'
          ? 'entregado'
          : 'cancelado';

      return `
        <tr>
          <td>
            <strong>📅 ${o.deliveryDate}</strong><br>
            <small>⏰ ${o.deliveryTime || '--:--'}</small>
          </td>
          <td>
            <strong>${o.customerName}</strong><br>
            <small>${o.customerPhone || ''}</small>
          </td>
          <td style="max-width:260px;">${o.description}</td>
          <td>
            <strong>${fmtCOP(o.totalCOP)}</strong><br>
            <small>${fmtUSD(copToUSD(o.totalCOP))}</small>
          </td>
          <td style="color:var(--success);font-weight:700;">${fmtCOP(o.paidCOP)}</td>
          <td>
            <strong style="color:${pendingCOP > 0 ? 'var(--danger)' : 'var(--success)'};">
              ${fmtCOP(pendingCOP)}
            </strong>
            ${pendingCOP > 0 ? `<br><small>${fmtUSD(copToUSD(pendingCOP))} | ${fmtBS(copToBS(pendingCOP))}</small>` : ''}
          </td>
          <td><span class="status-badge ${badgeClass}">${o.status}</span></td>
          <td>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              ${
                o.status !== 'Cancelado' && o.status !== 'Entregado'
                  ? `<button class="btn btn-primary btn-sm" data-readywa="${o.id}" title="Marcar como Listo para Entregar y enviar aviso por WhatsApp al cliente">📲 Listo + WhatsApp</button>`
                  : `<button class="btn btn-outline btn-sm" data-readywa="${o.id}" title="Enviar mensaje de WhatsApp al cliente">💬 WhatsApp</button>`
              }
              ${
                pendingCOP > 0 && o.status !== 'Cancelado'
                  ? `<button class="btn btn-success btn-sm" data-payord="${o.id}" title="Registrar abono o pago de saldo">💵 Cobrar</button>`
                  : ''
              }
              <button class="btn btn-outline btn-sm" data-editord="${o.id}" title="Editar estado o detalles">✏️</button>
              <button class="btn btn-outline btn-sm" data-delord="${o.id}" title="Eliminar pedido">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  tbody.querySelectorAll('[data-readywa]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ord = state.orders.find((x) => x.id === btn.dataset.readywa);
      if (!ord) return;
      if (ord.status !== 'Entregado' && ord.status !== 'Cancelado') {
        ord.status = 'Listo para Entregar';
        saveState();
        renderAll();
      }
      sendOrderReadyWhatsApp(ord);
    });
  });

  tbody.querySelectorAll('[data-payord]').forEach((btn) => {
    btn.addEventListener('click', () => openOrderPaymentModal(btn.dataset.payord));
  });

  tbody.querySelectorAll('[data-editord]').forEach((btn) => {
    btn.addEventListener('click', () => openOrderModal(btn.dataset.editord));
  });

  tbody.querySelectorAll('[data-delord]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ord = state.orders.find((x) => x.id === btn.dataset.delord);
      if (ord && confirm(`¿Eliminar el pedido de "${ord.customerName}"?`)) {
        state.orders = state.orders.filter((x) => x.id !== ord.id);
        saveState();
        renderAll();
      }
    });
  });
}

function initOrdersEvents() {
  document.getElementById('orderSearchInput').addEventListener('input', renderOrdersSection);
  document.getElementById('orderFilterStatus').addEventListener('change', renderOrdersSection);

  document.getElementById('btnNewOrder').addEventListener('click', () => openOrderModal(null));

  const updateOrderPreview = () => {
    const total = parseFloat(document.getElementById('ordTotalCOP').value) || 0;
    const dep = parseFloat(document.getElementById('ordInitialDepositCOP').value) || 0;
    const pending = Math.max(0, total - dep);
    document.getElementById('ordLiveConversion').innerHTML = `Valor Total equivale a: <strong>${fmtUSD(copToUSD(total))} USD</strong> | <strong>${fmtBS(copToBS(total))}</strong>`;
    document.getElementById('ordPendingPreview').textContent = `Saldo pendiente por pagar en la entrega: ${fmtCOP(pending)} (${fmtUSD(copToUSD(pending))})`;
  };

  document.getElementById('ordTotalCOP').addEventListener('input', updateOrderPreview);
  document.getElementById('ordInitialDepositCOP').addEventListener('input', updateOrderPreview);

  document.getElementById('formOrder').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('ordId').value;
    const custId = document.getElementById('ordCustomerId').value;
    const cust = state.customers.find((c) => c.id === custId);
    const totalCOP = parseFloat(document.getElementById('ordTotalCOP').value) || 0;

    let orderToNotifyWA = null;

    if (id) {
      const ord = state.orders.find((o) => o.id === id);
      if (!ord) return;
      const prevStatus = ord.status;
      ord.customerId = custId;
      ord.customerName = cust ? cust.name : 'Cliente';
      ord.customerPhone = cust ? cust.phone : '';
      ord.deliveryDate = document.getElementById('ordDeliveryDate').value;
      ord.deliveryTime = document.getElementById('ordDeliveryTime').value;
      ord.description = document.getElementById('ordDescription').value.trim();
      ord.totalCOP = totalCOP;
      ord.status = document.getElementById('ordStatus').value;
      if (prevStatus !== 'Listo para Entregar' && ord.status === 'Listo para Entregar') {
        orderToNotifyWA = ord;
      }
    } else {
      const initialDepositCOP = Math.min(totalCOP, parseFloat(document.getElementById('ordInitialDepositCOP').value) || 0);
      const depMethod = document.getElementById('ordDepositMethod').value;
      const newOrdId = 'ord_' + Date.now();

      const newOrder = {
        id: newOrdId,
        createdAt: new Date().toISOString(),
        customerId: custId,
        customerName: cust ? cust.name : 'Cliente',
        customerPhone: cust ? cust.phone : '',
        deliveryDate: document.getElementById('ordDeliveryDate').value,
        deliveryTime: document.getElementById('ordDeliveryTime').value,
        description: document.getElementById('ordDescription').value.trim(),
        totalCOP,
        paidCOP: initialDepositCOP,
        status: document.getElementById('ordStatus').value
      };

      state.orders.unshift(newOrder);

      if (initialDepositCOP > 0) {
        registerOrderPaymentIntoCash(newOrder, initialDepositCOP, depMethod, 'Abono Inicial de Pedido');
      }
      if (newOrder.status === 'Listo para Entregar') {
        orderToNotifyWA = newOrder;
      }
    }

    saveState();
    closeModal('modalOrder');
    renderAll();
    showToast('🎂 Pedido guardado correctamente');

    if (orderToNotifyWA) {
      sendOrderReadyWhatsApp(orderToNotifyWA);
    }
  });

  // Formulario para cobrar saldo o abono de un pedido existente
  document.getElementById('formOrderPayment').addEventListener('submit', (e) => {
    e.preventDefault();
    const ordId = document.getElementById('payOrdId').value;
    const ord = state.orders.find((o) => o.id === ordId);
    if (!ord) return;

    const amountCOP = parseFloat(document.getElementById('payOrdAmountCOP').value) || 0;
    const method = document.getElementById('payOrdMethod').value;
    const markDelivered = document.getElementById('payOrdMarkDelivered').checked;

    if (amountCOP <= 0) return;

    ord.paidCOP = Math.min(ord.totalCOP, ord.paidCOP + amountCOP);
    if (ord.paidCOP >= ord.totalCOP && markDelivered) {
      ord.status = 'Entregado';
    }

    registerOrderPaymentIntoCash(ord, amountCOP, method, 'Abono / Saldo de Pedido');

    saveState();
    closeModal('modalOrderPayment');
    renderAll();
    showToast(`💵 Pago de ${fmtCOP(amountCOP)} ingresado a la caja del turno`);
  });
}

function registerOrderPaymentIntoCash(order, amountCOP, methodCode, prefixLabel) {
  let cashInCOP = 0;
  let cashInUSD = 0;
  let cashInBS = 0;
  let digitalCOP = 0;
  let method = 'efectivo';
  let paymentSummaryText = '';

  if (methodCode === 'efectivo_COP') {
    cashInCOP = amountCOP;
    paymentSummaryText = 'Efectivo COP';
  } else if (methodCode === 'efectivo_USD') {
    cashInUSD = copToUSD(amountCOP);
    paymentSummaryText = `Efectivo USD (${fmtUSD(cashInUSD)})`;
  } else if (methodCode === 'efectivo_BS') {
    cashInBS = copToBS(amountCOP);
    paymentSummaryText = `Efectivo Bs (${fmtBS(cashInBS)})`;
  } else if (methodCode === 'transferencia') {
    method = 'transferencia';
    digitalCOP = amountCOP;
    paymentSummaryText = 'Transferencia / QR';
  } else if (methodCode === 'tarjeta') {
    method = 'tarjeta';
    digitalCOP = amountCOP;
    paymentSummaryText = 'Tarjeta / Punto';
  }

  state.sales.unshift({
    id: 'v_ord_' + Date.now(),
    timestamp: new Date().toISOString(),
    isOrderPayment: true,
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    items: [{ productId: null, name: `🎂 ${prefixLabel}: ${order.description.slice(0, 45)}...`, priceCOP: amountCOP, qty: 1 }],
    subtotalCOP: amountCOP,
    discountCOP: 0,
    totalCOP: amountCOP,
    totalUSD: copToUSD(amountCOP),
    totalBS: copToBS(amountCOP),
    method,
    paymentSummaryText,
    cashInCOP,
    cashInUSD,
    cashInBS,
    changeOutCOP: 0,
    changeOutUSD: 0,
    changeOutBS: 0,
    cashNetCOP: cashInCOP,
    cashNetUSD: cashInUSD,
    cashNetBS: cashInBS,
    digitalCOP,
    note: `Pedido de ${order.customerName}`
  });
}

function openOrderModal(orderId) {
  renderCustomerSelectors();
  if (orderId) {
    const o = state.orders.find((x) => x.id === orderId);
    if (!o) return;
    document.getElementById('modalOrderTitle').textContent = 'Editar Pedido / Encargo';
    document.getElementById('ordId').value = o.id;
    document.getElementById('ordCustomerId').value = o.customerId;
    document.getElementById('ordDeliveryDate').value = o.deliveryDate;
    document.getElementById('ordDeliveryTime').value = o.deliveryTime || '16:00';
    document.getElementById('ordDescription').value = o.description;
    document.getElementById('ordTotalCOP').value = o.totalCOP;
    document.getElementById('ordStatus').value = o.status;
    document.getElementById('ordInitialPaymentSection').classList.add('hidden');
    document.getElementById('ordLiveConversion').innerHTML = `Valor Total equivale a: <strong>${fmtUSD(copToUSD(o.totalCOP))} USD</strong> | <strong>${fmtBS(copToBS(o.totalCOP))}</strong>`;
  } else {
    document.getElementById('modalOrderTitle').textContent = '🎂 Registrar Nuevo Pedido / Encargo';
    document.getElementById('formOrder').reset();
    document.getElementById('ordId').value = '';
    document.getElementById('ordDeliveryDate').value = getFutureDate(1);
    document.getElementById('ordDeliveryTime').value = '16:00';
    document.getElementById('ordInitialDepositCOP').value = 0;
    document.getElementById('ordInitialPaymentSection').classList.remove('hidden');
    document.getElementById('ordLiveConversion').innerHTML = `Valor Total equivale a: <strong>$ 0.00 USD</strong> | <strong>0.00 Bs</strong>`;
    document.getElementById('ordPendingPreview').textContent = 'Saldo pendiente por pagar en la entrega: $ 0 COP';
  }
  openModal('modalOrder');
}

function openOrderPaymentModal(orderId) {
  const o = state.orders.find((x) => x.id === orderId);
  if (!o) return;
  const pendingCOP = Math.max(0, o.totalCOP - o.paidCOP);
  document.getElementById('payOrdId').value = o.id;
  document.getElementById('payOrdAmountCOP').value = pendingCOP;
  document.getElementById('payOrdAmountCOP').max = pendingCOP;
  document.getElementById('payOrdSummaryInfo').innerHTML = `
    <strong>Cliente:</strong> ${o.customerName}<br>
    <strong>Saldo Pendiente:</strong> ${fmtCOP(pendingCOP)} (${fmtUSD(copToUSD(pendingCOP))} USD | ${fmtBS(copToBS(pendingCOP))})
  `;
  openModal('modalOrderPayment');
}

// ==========================================
// PUNTO DE VENTA (POS) CON IMÁGENES Y CONTROL DE VUELTO
// ==========================================
function renderPOSCategories() {
  const container = document.getElementById('posCategoryList');
  const cats = ['Todas', ...state.config.categories];
  container.innerHTML = cats
    .map(
      (c) =>
        `<button class="cat-chip ${c === activeCategory ? 'active' : ''}" data-cat="${c}">${c}</button>`
    )
    .join('');

  container.querySelectorAll('.cat-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderPOSCategories();
      renderPOSProducts();
    });
  });
}

function renderPOSProducts() {
  const grid = document.getElementById('posProductsGrid');
  const query = (document.getElementById('posSearchInput').value || '').toLowerCase().trim();

  const filtered = state.products.filter((p) => {
    const matchCat = activeCategory === 'Todas' || p.category === activeCategory;
    const matchQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="cart-empty" style="grid-column: 1/-1;">No se encontraron productos para esta búsqueda.</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((p) => {
      const usd = copToUSD(p.priceCOP);
      const bs = copToBS(p.priceCOP);
      const isZero = p.stock <= 0;
      const isLow = p.stock > 0 && p.stock <= p.minStock;
      const stockClass = isZero ? 'zero' : isLow ? 'low' : '';
      const stockText = isZero ? 'Agotado' : `${p.stock} disp.`;

      const mediaHtml = p.image
        ? `<img src="${p.image}" alt="${p.name}" loading="lazy" />`
        : `<span class="prod-media-emoji">${p.emoji || '🍰'}</span>`;

      return `
        <div class="product-card ${isZero ? 'out-of-stock' : ''}" data-id="${p.id}">
          <div class="prod-media-wrap">
            ${mediaHtml}
            <span class="stock-pill ${stockClass} prod-floating-stock">${stockText}</span>
          </div>
          <div class="prod-card-body">
            <div>
              <div class="prod-title">${p.name}</div>
              <div class="prod-cat">${p.category}</div>
            </div>
            <div class="prod-prices">
              <div class="price-cop">${fmtCOP(p.priceCOP)}</div>
              <div class="price-sub">
                <span>${fmtUSD(usd)}</span>
                <span>${fmtBS(bs)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  grid.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', () => {
      addToCart(card.dataset.id);
    });
  });
}

function addToCart(productId) {
  const prod = state.products.find((p) => p.id === productId);
  if (!prod) return;
  if (prod.stock <= 0) {
    showToast(`⚠️ "${prod.name}" está agotado en inventario`);
    return;
  }

  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    if (existing.qty + 1 > prod.stock) {
      showToast(`⚠️ Solo quedan ${prod.stock} unidades de "${prod.name}"`);
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({
      productId: prod.id,
      name: prod.name,
      priceCOP: prod.priceCOP,
      qty: 1
    });
  }
  renderCart();
}

function getCartTotals() {
  const subtotalCOP = cart.reduce((acc, item) => acc + item.priceCOP * item.qty, 0);
  const discountCOP = Math.max(0, parseFloat(document.getElementById('cartDiscountCOP').value) || 0);
  const totalCOP = Math.max(0, subtotalCOP - discountCOP);
  return {
    subtotalCOP,
    discountCOP,
    totalCOP,
    totalUSD: copToUSD(totalCOP),
    totalBS: copToBS(totalCOP)
  };
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty">Haz clic en los productos del catálogo para agregarlos a la cuenta.</div>`;
  } else {
    container.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item-row">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-unit">${fmtCOP(item.priceCOP)} c/u (${fmtUSD(copToUSD(item.priceCOP))})</div>
          </div>
          <div class="cart-qty-controls">
            <button type="button" class="qty-btn" data-action="dec" data-id="${item.productId}">-</button>
            <span><strong>${item.qty}</strong></span>
            <button type="button" class="qty-btn" data-action="inc" data-id="${item.productId}">+</button>
          </div>
          <div class="cart-item-subtotal">${fmtCOP(item.priceCOP * item.qty)}</div>
        </div>
      `
      )
      .join('');

    container.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const item = cart.find((i) => i.productId === id);
        const prod = state.products.find((p) => p.id === id);
        if (!item) return;

        if (action === 'inc') {
          if (prod && item.qty + 1 > prod.stock) {
            showToast(`⚠️ Stock máximo disponible: ${prod.stock}`);
            return;
          }
          item.qty += 1;
        } else {
          item.qty -= 1;
          if (item.qty <= 0) {
            cart = cart.filter((i) => i.productId !== id);
          }
        }
        renderCart();
      });
    });
  }

  const { totalCOP, totalUSD, totalBS } = getCartTotals();
  document.getElementById('cartTotalCOP').textContent = fmtCOP(totalCOP);
  document.getElementById('cartTotalUSD').textContent = `${fmtUSD(totalUSD)} USD`;
  document.getElementById('cartTotalBS').textContent = fmtBS(totalBS);

  // Actualizar indicadores móviles del carrito
  const totalItemsQty = cart.reduce((acc, i) => acc + i.qty, 0);
  const mobCartBadge = document.getElementById('mobileCartBadge');
  if (mobCartBadge) mobCartBadge.textContent = totalItemsQty;

  const mobPosSwitchCount = document.getElementById('mobPosSwitchCount');
  if (mobPosSwitchCount) mobPosSwitchCount.textContent = totalItemsQty;

  const mfcBar = document.getElementById('mobileFloatingCartBar');
  if (mfcBar) {
    if (totalItemsQty > 0) {
      mfcBar.classList.remove('hidden');
      document.getElementById('mfcCountText').textContent = `${totalItemsQty} producto(s) en cuenta`;
      document.getElementById('mfcTotalText').textContent = `${fmtCOP(totalCOP)} (${fmtUSD(totalUSD)})`;
    } else {
      mfcBar.classList.add('hidden');
    }
  }

  updatePaymentAndChangeCalculation();
}

function updatePaymentAndChangeCalculation() {
  const { totalCOP } = getCartTotals();
  const changeBox = document.getElementById('changeBox');
  const changeLabel = document.getElementById('changeLabel');
  const changeCOP = document.getElementById('changeCOP');
  const changeUSD = document.getElementById('changeUSD');
  const changeBS = document.getElementById('changeBS');
  const selectorRow = document.getElementById('changeCurrencySelectorRow');

  let receivedInCOP = 0;

  if (activePayMethod === 'mixto') {
    const cCOP = parseFloat(document.getElementById('mixCashCOP').value) || 0;
    const cUSD = parseFloat(document.getElementById('mixCashUSD').value) || 0;
    const cBS = parseFloat(document.getElementById('mixCashBS').value) || 0;
    const digCOP = parseFloat(document.getElementById('mixDigitalCOP').value) || 0;
    receivedInCOP = cCOP + usdToCOP(cUSD) + bsToCOP(cBS) + digCOP;
  } else {
    const currency = document.getElementById('payCurrencySelect').value;
    const rawAmount = parseFloat(document.getElementById('payAmountReceived').value);
    if (isNaN(rawAmount) || rawAmount === 0) {
      receivedInCOP = totalCOP;
    } else {
      if (currency === 'COP') receivedInCOP = rawAmount;
      if (currency === 'USD') receivedInCOP = usdToCOP(rawAmount);
      if (currency === 'BS') receivedInCOP = bsToCOP(rawAmount);
    }
  }

  const diffCOP = receivedInCOP - totalCOP;

  if (diffCOP >= -1) {
    changeBox.classList.remove('insufficient');
    const cleanDiff = Math.max(0, diffCOP);
    changeLabel.textContent = 'Vuelto / Cambio a entregar:';
    changeCOP.textContent = `${fmtCOP(cleanDiff)} COP`;
    changeUSD.textContent = `${fmtUSD(copToUSD(cleanDiff))} USD`;
    changeBS.textContent = fmtBS(copToBS(cleanDiff));
    if (cleanDiff > 10) {
      selectorRow.classList.remove('hidden');
    } else {
      selectorRow.classList.add('hidden');
    }
  } else {
    const missingCOP = Math.abs(diffCOP);
    changeBox.classList.add('insufficient');
    changeLabel.textContent = '⚠️ Falta por cubrir:';
    changeCOP.textContent = `${fmtCOP(missingCOP)} COP`;
    changeUSD.textContent = `${fmtUSD(copToUSD(missingCOP))} USD`;
    changeBS.textContent = fmtBS(copToBS(missingCOP));
    selectorRow.classList.add('hidden');
  }
}

function initPOSEvents() {
  document.getElementById('posSearchInput').addEventListener('input', renderPOSProducts);
  document.getElementById('cartDiscountCOP').addEventListener('input', renderCart);

  document.getElementById('btnClearCart').addEventListener('click', () => {
    cart = [];
    document.getElementById('cartDiscountCOP').value = 0;
    document.getElementById('payAmountReceived').value = '';
    renderCart();
  });

  const methodBtns = document.querySelectorAll('#paymentMethodButtons .pay-method-btn');
  methodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      methodBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activePayMethod = btn.dataset.method;

      if (activePayMethod === 'mixto') {
        document.getElementById('singlePaymentBox').classList.add('hidden');
        document.getElementById('mixedPaymentBox').classList.remove('hidden');
      } else {
        document.getElementById('singlePaymentBox').classList.remove('hidden');
        document.getElementById('mixedPaymentBox').classList.add('hidden');
      }
      updatePaymentAndChangeCalculation();
    });
  });

  document.getElementById('payCurrencySelect').addEventListener('change', () => {
    const cur = document.getElementById('payCurrencySelect').value;
    const { totalCOP, totalUSD, totalBS } = getCartTotals();
    const input = document.getElementById('payAmountReceived');
    if (cur === 'COP') input.placeholder = `Exacto: ${Math.round(totalCOP)}`;
    if (cur === 'USD') input.placeholder = `Exacto: ${totalUSD.toFixed(2)}`;
    if (cur === 'BS') input.placeholder = `Exacto: ${totalBS.toFixed(2)}`;
    document.getElementById('changeGivenCurrency').value = cur;
    updatePaymentAndChangeCalculation();
  });

  document.getElementById('payAmountReceived').addEventListener('input', updatePaymentAndChangeCalculation);

  ['mixCashCOP', 'mixCashUSD', 'mixCashBS', 'mixDigitalCOP'].forEach((id) => {
    document.getElementById(id).addEventListener('input', updatePaymentAndChangeCalculation);
  });

  document.querySelectorAll('#quickCashBtns .chip-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { totalCOP, totalUSD, totalBS } = getCartTotals();
      const cur = document.getElementById('payCurrencySelect').value;
      const input = document.getElementById('payAmountReceived');

      if (btn.dataset.exact === 'true') {
        if (cur === 'COP') input.value = Math.round(totalCOP);
        if (cur === 'USD') input.value = totalUSD.toFixed(2);
        if (cur === 'BS') input.value = totalBS.toFixed(2);
      } else {
        input.value = btn.dataset.val;
      }
      updatePaymentAndChangeCalculation();
    });
  });

  document.getElementById('btnCompleteSale').addEventListener('click', completeSale);
}

function completeSale() {
  if (cart.length === 0) {
    showToast('⚠️ Agrega al menos un producto a la orden para cobrar');
    return;
  }

  const { subtotalCOP, discountCOP, totalCOP, totalUSD, totalBS } = getCartTotals();
  const changeOutCurrency = document.getElementById('changeGivenCurrency').value;

  let cashInCOP = 0;
  let cashInUSD = 0;
  let cashInBS = 0;
  let changeOutCOP = 0;
  let changeOutUSD = 0;
  let changeOutBS = 0;
  let digitalCOP = 0;
  let changeAmountInCOP = 0;
  let paymentSummaryText = '';

  if (activePayMethod === 'mixto') {
    const cCOP = parseFloat(document.getElementById('mixCashCOP').value) || 0;
    const cUSD = parseFloat(document.getElementById('mixCashUSD').value) || 0;
    const cBS = parseFloat(document.getElementById('mixCashBS').value) || 0;
    const dig = parseFloat(document.getElementById('mixDigitalCOP').value) || 0;
    const totalRecCOP = cCOP + usdToCOP(cUSD) + bsToCOP(cBS) + dig;

    if (totalRecCOP < totalCOP - 1) {
      showToast('⚠️ El monto recibido en pago mixto es menor al total de la venta');
      return;
    }

    changeAmountInCOP = Math.max(0, totalRecCOP - totalCOP);
    cashInCOP = cCOP;
    cashInUSD = cUSD;
    cashInBS = cBS;
    digitalCOP = dig;
    paymentSummaryText = `Mixto (COP:${fmtCOP(cCOP)}, USD:${fmtUSD(cUSD)}, Bs:${fmtBS(cBS)}, Dig:${fmtCOP(dig)})`;
  } else {
    const currency = document.getElementById('payCurrencySelect').value;
    const rawAmount = parseFloat(document.getElementById('payAmountReceived').value);

    if (activePayMethod === 'efectivo') {
      if (currency === 'COP') {
        const rec = isNaN(rawAmount) || rawAmount === 0 ? totalCOP : rawAmount;
        if (rec < totalCOP - 1) {
          showToast('⚠️ El monto recibido es menor al total');
          return;
        }
        cashInCOP = rec;
        changeAmountInCOP = Math.max(0, rec - totalCOP);
        paymentSummaryText = `Efectivo COP (Rec: ${fmtCOP(rec)})`;
      } else if (currency === 'USD') {
        const recUSD = isNaN(rawAmount) || rawAmount === 0 ? totalUSD : rawAmount;
        const recCOP = usdToCOP(recUSD);
        if (recCOP < totalCOP - 1) {
          showToast('⚠️ Los dólares recibidos no cubren el total');
          return;
        }
        cashInUSD = recUSD;
        changeAmountInCOP = Math.max(0, recCOP - totalCOP);
        paymentSummaryText = `Efectivo USD (Rec: ${fmtUSD(recUSD)})`;
      } else if (currency === 'BS') {
        const recBS = isNaN(rawAmount) || rawAmount === 0 ? totalBS : rawAmount;
        const recCOP = bsToCOP(recBS);
        if (recCOP < totalCOP - 1) {
          showToast('⚠️ Los bolívares recibidos no cubren el total');
          return;
        }
        cashInBS = recBS;
        changeAmountInCOP = Math.max(0, recCOP - totalCOP);
        paymentSummaryText = `Efectivo Bs (Rec: ${fmtBS(recBS)})`;
      }
    } else {
      digitalCOP = totalCOP;
      const label = activePayMethod === 'transferencia' ? 'Transferencia/QR' : 'Tarjeta/Punto';
      paymentSummaryText = `${label} (${currency})`;
    }
  }

  // Asignar de qué gaveta salió el vuelto
  if (changeAmountInCOP > 1) {
    if (changeOutCurrency === 'COP') {
      changeOutCOP = changeAmountInCOP;
      paymentSummaryText += ` | Vuelto: ${fmtCOP(changeOutCOP)}`;
    } else if (changeOutCurrency === 'USD') {
      changeOutUSD = copToUSD(changeAmountInCOP);
      paymentSummaryText += ` | Vuelto: ${fmtUSD(changeOutUSD)} USD`;
    } else if (changeOutCurrency === 'BS') {
      changeOutBS = copToBS(changeAmountInCOP);
      paymentSummaryText += ` | Vuelto: ${fmtBS(changeOutBS)}`;
    }
  }

  // Descontar stock de los productos vendidos y detectar si alguno cayó en stock crítico
  let triggeredLowStockAlert = false;
  cart.forEach((item) => {
    const prod = state.products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.qty);
      if (prod.stock <= prod.minStock) {
        triggeredLowStockAlert = true;
      }
    }
  });

  const custId = document.getElementById('posCustomerSelect').value;
  const custObj = state.customers.find((c) => c.id === custId);
  const note = document.getElementById('saleCustomerNote').value.trim();

  const saleRecord = {
    id: 'v_' + Date.now(),
    timestamp: new Date().toISOString(),
    cashierName: currentUser ? currentUser.name : 'General',
    customerId: custId || null,
    customerName: custObj ? custObj.name : 'Mostrador',
    items: structuredClone(cart),
    subtotalCOP,
    discountCOP,
    totalCOP,
    totalUSD,
    totalBS,
    method: activePayMethod,
    paymentSummaryText,
    cashInCOP,
    cashInUSD,
    cashInBS,
    changeOutCOP,
    changeOutUSD,
    changeOutBS,
    cashNetCOP: cashInCOP - changeOutCOP,
    cashNetUSD: cashInUSD - changeOutUSD,
    cashNetBS: cashInBS - changeOutBS,
    digitalCOP,
    note
  };

  state.sales.unshift(saleRecord);
  logUserAction(`Registró venta por ${fmtCOP(totalCOP)} (${saleRecord.customerName})`);
  saveState();

  cart = [];
  document.getElementById('cartDiscountCOP').value = 0;
  document.getElementById('payAmountReceived').value = '';
  document.getElementById('saleCustomerNote').value = '';
  ['mixCashCOP', 'mixCashUSD', 'mixCashBS', 'mixDigitalCOP'].forEach((id) => {
    document.getElementById(id).value = 0;
  });

  renderAll();
  setMobilePosView('catalog');
  showToast(`✅ Venta registrada por ${fmtCOP(totalCOP)} (${fmtUSD(totalUSD)})`);
  if (triggeredLowStockAlert) {
    playAlertBeep();
    showToast('🚨 ¡ALERTA DE STOCK! Uno de los productos vendidos llegó al nivel mínimo.');
  }
}

// ==========================================
// INVENTARIO DE PRODUCTOS TERMINADOS (CON SUBIDA DE IMAGEN)
// ==========================================
function renderInventoryTable() {
  const tbody = document.getElementById('productsTableBody');
  const query = (document.getElementById('invSearchInput').value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('invFilterStatus').value;

  const filtered = state.products.filter((p) => {
    const matchText =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
    if (!matchText) return false;
    if (statusFilter === 'low') return p.stock <= p.minStock;
    if (statusFilter === 'expiring') return isExpiringSoonOrExpired(p.expiry);
    return true;
  });

  tbody.innerHTML = filtered
    .map((p) => {
      const usd = copToUSD(p.priceCOP);
      const bs = copToBS(p.priceCOP);
      const isLow = p.stock <= p.minStock;
      const expiryBadge = formatExpiryBadge(p.expiry);
      const thumbHtml = p.image
        ? `<img src="${p.image}" alt="${p.name}" />`
        : `<span>${p.emoji || '🍰'}</span>`;

      return `
        <tr>
          <td>
            <div class="table-prod-cell">
              <div class="table-thumb">${thumbHtml}</div>
              <strong>${p.name}</strong>
            </div>
          </td>
          <td>${p.category}</td>
          <td><strong>${fmtCOP(p.priceCOP)}</strong></td>
          <td>${fmtUSD(usd)}</td>
          <td>${fmtBS(bs)}</td>
          <td>
            <span class="stock-pill ${p.stock <= 0 ? 'zero' : isLow ? 'low' : ''}">
              ${p.stock} unid ${isLow ? '⚠️' : ''}
            </span>
          </td>
          <td>${expiryBadge}</td>
          <td>
            <button class="btn btn-outline btn-sm" data-addstock="${p.id}" title="Sumar producción">+ Stock</button>
            <button class="btn btn-outline btn-sm" data-editprod="${p.id}">✏️</button>
            <button class="btn btn-outline btn-sm" data-delprod="${p.id}">🗑️</button>
          </td>
        </tr>
      `;
    })
    .join('');

  tbody.querySelectorAll('[data-addstock]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prod = state.products.find((p) => p.id === btn.dataset.addstock);
      if (!prod) return;
      const qtyStr = prompt(`¿Cuántas unidades nuevas de "${prod.name}" salieron de producción para sumar al stock?`, '10');
      const qty = parseInt(qtyStr, 10);
      if (qty > 0) {
        prod.stock += qty;
        saveState();
        renderAll();
        showToast(`🍰 Se sumaron +${qty} unidades a ${prod.name}`);
      }
    });
  });

  tbody.querySelectorAll('[data-editprod]').forEach((btn) => {
    btn.addEventListener('click', () => openProductModal(btn.dataset.editprod));
  });

  tbody.querySelectorAll('[data-delprod]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prod = state.products.find((p) => p.id === btn.dataset.delprod);
      if (prod && confirm(`¿Eliminar "${prod.name}" del catálogo?`)) {
        state.products = state.products.filter((p) => p.id !== prod.id);
        saveState();
        renderAll();
      }
    });
  });
}

function resizeImageFileToDataUrl(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 360;
      let w = img.width;
      let h = img.height;
      if (w > h && w > maxDim) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else if (h > maxDim) {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateProductModalImagePreview(src, emoji) {
  const box = document.getElementById('prodImagePreview');
  document.getElementById('prodImageData').value = src || '';
  if (src) {
    box.innerHTML = `<img src="${src}" alt="Preview" />`;
  } else {
    box.innerHTML = `<span>${emoji || '🍰'}</span>`;
  }
}

function initInventoryEvents() {
  document.getElementById('invSearchInput').addEventListener('input', renderInventoryTable);
  document.getElementById('invFilterStatus').addEventListener('change', renderInventoryTable);

  document.getElementById('btnNewProduct').addEventListener('click', () => openProductModal(null));

  // Subida de archivo de imagen desde PC
  document.getElementById('prodImageFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    resizeImageFileToDataUrl(file, (dataUrl) => {
      document.getElementById('prodImageUrlInput').value = '';
      updateProductModalImagePreview(dataUrl, document.getElementById('prodEmoji').value);
    });
  });

  // Pegar URL de imagen
  document.getElementById('prodImageUrlInput').addEventListener('input', (e) => {
    const url = e.target.value.trim();
    updateProductModalImagePreview(url, document.getElementById('prodEmoji').value);
  });

  // Quitar imagen
  document.getElementById('btnRemoveProdImage').addEventListener('click', () => {
    document.getElementById('prodImageFile').value = '';
    document.getElementById('prodImageUrlInput').value = '';
    updateProductModalImagePreview('', document.getElementById('prodEmoji').value);
  });

  const priceInput = document.getElementById('prodPriceCOP');
  priceInput.addEventListener('input', () => {
    const cop = parseFloat(priceInput.value) || 0;
    document.getElementById('prodLiveConversion').innerHTML = `Equivale a: <strong>${fmtUSD(copToUSD(cop))} USD</strong> | <strong>${fmtBS(copToBS(cop))}</strong>`;
  });

  document.getElementById('formProduct').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const prodData = {
      id: id || 'p_' + Date.now(),
      name: document.getElementById('prodName').value.trim(),
      emoji: document.getElementById('prodEmoji').value.trim() || '🍰',
      image: document.getElementById('prodImageData').value || '',
      category: document.getElementById('prodCategory').value,
      priceCOP: parseFloat(document.getElementById('prodPriceCOP').value) || 0,
      stock: parseInt(document.getElementById('prodStock').value, 10) || 0,
      minStock: parseInt(document.getElementById('prodMinStock').value, 10) || 0,
      expiry: document.getElementById('prodExpiry').value
    };

    if (id) {
      const idx = state.products.findIndex((p) => p.id === id);
      if (idx >= 0) state.products[idx] = prodData;
    } else {
      state.products.push(prodData);
    }

    saveState();
    closeModal('modalProduct');
    renderAll();
    showToast('✅ Producto guardado con éxito');
  });
}

function openProductModal(productId) {
  const catSelect = document.getElementById('prodCategory');
  catSelect.innerHTML = state.config.categories
    .map((c) => `<option value="${c}">${c}</option>`)
    .join('');

  document.getElementById('prodImageFile').value = '';
  document.getElementById('prodImageUrlInput').value = '';

  if (productId) {
    const p = state.products.find((x) => x.id === productId);
    if (!p) return;
    document.getElementById('modalProductTitle').textContent = 'Editar Producto';
    document.getElementById('prodId').value = p.id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodEmoji').value = p.emoji || '🍰';
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodPriceCOP').value = p.priceCOP;
    document.getElementById('prodStock').value = p.stock;
    document.getElementById('prodMinStock').value = p.minStock;
    document.getElementById('prodExpiry').value = p.expiry || '';
    updateProductModalImagePreview(p.image || '', p.emoji || '🍰');
    document.getElementById('prodLiveConversion').innerHTML = `Equivale a: <strong>${fmtUSD(copToUSD(p.priceCOP))} USD</strong> | <strong>${fmtBS(copToBS(p.priceCOP))}</strong>`;
  } else {
    document.getElementById('modalProductTitle').textContent = 'Nuevo Producto Terminado';
    document.getElementById('formProduct').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('prodEmoji').value = '🍰';
    updateProductModalImagePreview('', '🍰');
    document.getElementById('prodLiveConversion').innerHTML = `Equivale a: <strong>$ 0.00 USD</strong> | <strong>0.00 Bs</strong>`;
  }
  openModal('modalProduct');
}

// ==========================================
// MATERIA PRIMA E INSUMOS
// ==========================================
function renderIngredientsTable() {
  const tbody = document.getElementById('ingredientsTableBody');
  const query = (document.getElementById('insumoSearchInput').value || '').toLowerCase().trim();
  const status = document.getElementById('insumoFilterStatus').value;

  const filtered = state.ingredients.filter((ing) => {
    const matchText = !query || ing.name.toLowerCase().includes(query);
    if (!matchText) return false;
    if (status === 'low') return ing.stock <= ing.minStock;
    return true;
  });

  tbody.innerHTML = filtered
    .map((ing) => {
      const isLow = ing.stock <= ing.minStock;
      return `
        <tr>
          <td><strong>${ing.name}</strong></td>
          <td>${ing.unit}</td>
          <td><strong>${ing.stock} ${ing.unit}</strong></td>
          <td>${ing.minStock} ${ing.unit}</td>
          <td>${fmtCOP(ing.costCOP)} (${fmtUSD(copToUSD(ing.costCOP))})</td>
          <td>${formatExpiryBadge(ing.expiry)}</td>
          <td>
            <span class="stock-pill ${ing.stock <= 0 ? 'zero' : isLow ? 'low' : ''}">
              ${isLow ? '⚠️ Stock Bajo' : 'Óptimo'}
            </span>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" data-ingadd="${ing.id}" title="Registrar compra/entrada">+ Entrada</button>
            <button class="btn btn-outline btn-sm" data-inguse="${ing.id}" title="Registrar uso en cocina">- Usar</button>
            <button class="btn btn-outline btn-sm" data-ingedit="${ing.id}">✏️</button>
            <button class="btn btn-outline btn-sm" data-ingdel="${ing.id}">🗑️</button>
          </td>
        </tr>
      `;
    })
    .join('');

  tbody.querySelectorAll('[data-ingadd]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ing = state.ingredients.find((i) => i.id === btn.dataset.ingadd);
      if (!ing) return;
      const q = parseFloat(prompt(`¿Cuántos ${ing.unit} de "${ing.name}" ingresaron al almacén?`, '5'));
      if (q > 0) {
        ing.stock = Number((ing.stock + q).toFixed(2));
        saveState();
        renderAll();
        showToast(`🌾 +${q} ${ing.unit} sumados a ${ing.name}`);
      }
    });
  });

  tbody.querySelectorAll('[data-inguse]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ing = state.ingredients.find((i) => i.id === btn.dataset.inguse);
      if (!ing) return;
      const q = parseFloat(prompt(`¿Cuántos ${ing.unit} de "${ing.name}" se usaron en producción?`, '1'));
      if (q > 0) {
        ing.stock = Math.max(0, Number((ing.stock - q).toFixed(2)));
        saveState();
        renderAll();
        showToast(`👩‍🍳 Se descontaron ${q} ${ing.unit} de ${ing.name}`);
      }
    });
  });

  tbody.querySelectorAll('[data-ingedit]').forEach((btn) => {
    btn.addEventListener('click', () => openIngredientModal(btn.dataset.ingedit));
  });

  tbody.querySelectorAll('[data-ingdel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ing = state.ingredients.find((i) => i.id === btn.dataset.ingdel);
      if (ing && confirm(`¿Eliminar el insumo "${ing.name}"?`)) {
        state.ingredients = state.ingredients.filter((i) => i.id !== ing.id);
        saveState();
        renderAll();
      }
    });
  });
}

function initIngredientsEvents() {
  document.getElementById('insumoSearchInput').addEventListener('input', renderIngredientsTable);
  document.getElementById('insumoFilterStatus').addEventListener('change', renderIngredientsTable);

  document.getElementById('btnNewIngredient').addEventListener('click', () => openIngredientModal(null));

  document.getElementById('formIngredient').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('ingId').value;
    const data = {
      id: id || 'i_' + Date.now(),
      name: document.getElementById('ingName').value.trim(),
      unit: document.getElementById('ingUnit').value,
      stock: parseFloat(document.getElementById('ingStock').value) || 0,
      minStock: parseFloat(document.getElementById('ingMinStock').value) || 0,
      costCOP: parseFloat(document.getElementById('ingCostCOP').value) || 0,
      expiry: document.getElementById('ingExpiry').value
    };

    if (id) {
      const idx = state.ingredients.findIndex((i) => i.id === id);
      if (idx >= 0) state.ingredients[idx] = data;
    } else {
      state.ingredients.push(data);
    }

    saveState();
    closeModal('modalIngredient');
    renderAll();
    showToast('✅ Insumo guardado');
  });
}

function openIngredientModal(ingId) {
  if (ingId) {
    const ing = state.ingredients.find((i) => i.id === ingId);
    if (!ing) return;
    document.getElementById('modalIngredientTitle').textContent = 'Editar Insumo';
    document.getElementById('ingId').value = ing.id;
    document.getElementById('ingName').value = ing.name;
    document.getElementById('ingUnit').value = ing.unit;
    document.getElementById('ingStock').value = ing.stock;
    document.getElementById('ingMinStock').value = ing.minStock;
    document.getElementById('ingCostCOP').value = ing.costCOP;
    document.getElementById('ingExpiry').value = ing.expiry || '';
  } else {
    document.getElementById('modalIngredientTitle').textContent = 'Nuevo Insumo / Materia Prima';
    document.getElementById('formIngredient').reset();
    document.getElementById('ingId').value = '';
  }
  openModal('modalIngredient');
}

// ==========================================
// CADUCIDAD Y MERMAS
// ==========================================
function getDaysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isExpiringSoonOrExpired(dateStr) {
  const days = getDaysUntilExpiry(dateStr);
  return days !== null && days <= 3;
}

function formatExpiryBadge(dateStr) {
  if (!dateStr) return '<span style="color:#9ca3af;">No aplica</span>';
  const days = getDaysUntilExpiry(dateStr);
  if (days < 0) {
    return `<span class="stock-pill zero">Vencido (${dateStr})</span>`;
  }
  if (days <= 3) {
    return `<span class="stock-pill low">Vence en ${days}d (${dateStr})</span>`;
  }
  return `<span>${dateStr}</span>`;
}

function renderMermasAndExpiry() {
  const expContainer = document.getElementById('expiringListContainer');
  const expiringItems = [];

  state.products.forEach((p) => {
    if (p.stock > 0 && isExpiringSoonOrExpired(p.expiry)) {
      expiringItems.push({
        type: 'Producto',
        name: `${p.emoji || '🍰'} ${p.name}`,
        stock: `${p.stock} unid`,
        expiry: p.expiry,
        days: getDaysUntilExpiry(p.expiry)
      });
    }
  });

  state.ingredients.forEach((i) => {
    if (i.stock > 0 && isExpiringSoonOrExpired(i.expiry)) {
      expiringItems.push({
        type: 'Insumo',
        name: `🌾 ${i.name}`,
        stock: `${i.stock} ${i.unit}`,
        expiry: i.expiry,
        days: getDaysUntilExpiry(i.expiry)
      });
    }
  });

  if (expiringItems.length === 0) {
    expContainer.innerHTML = `<div class="cart-empty">🎉 Ningún producto ni insumo está vencido o próximo a vencer en los próximos 3 días.</div>`;
  } else {
    expContainer.innerHTML = expiringItems
      .map(
        (item) => `
        <div class="expiry-alert-item ${item.days < 0 ? 'expired' : ''}">
          <div>
            <strong>${item.name}</strong> <small>(${item.type} - Stock: ${item.stock})</small>
            <div style="font-size:12px;">Fecha límite: ${item.expiry}</div>
          </div>
          <span class="stock-pill ${item.days < 0 ? 'zero' : 'low'}">
            ${item.days < 0 ? '¡VENCIDO!' : item.days === 0 ? 'Vence HOY' : `En ${item.days} día(s)`}
          </span>
        </div>
      `
      )
      .join('');
  }

  const tbody = document.getElementById('mermasTableBody');
  if (state.mermas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#7a685f;">Sin mermas registradas en este turno.</td></tr>`;
  } else {
    tbody.innerHTML = state.mermas
      .map((m) => {
        const dt = new Date(m.timestamp).toLocaleString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        return `
          <tr>
            <td>${dt}</td>
            <td>${m.itemType === 'product' ? 'Producto' : 'Insumo'}</td>
            <td><strong>${m.itemName}</strong></td>
            <td>${m.qty}</td>
            <td>${fmtCOP(m.lossCOP)}</td>
            <td>${m.reason}</td>
          </tr>
        `;
      })
      .join('');
  }
}

function initMermasEvents() {
  const typeSelect = document.getElementById('mermaType');
  const itemSelect = document.getElementById('mermaItemSelect');

  const populateMermaItems = () => {
    const t = typeSelect.value;
    if (t === 'product') {
      itemSelect.innerHTML = state.products
        .map((p) => `<option value="${p.id}">${p.name} (Disp: ${p.stock})</option>`)
        .join('');
    } else {
      itemSelect.innerHTML = state.ingredients
        .map((i) => `<option value="${i.id}">${i.name} (Disp: ${i.stock} ${i.unit})</option>`)
        .join('');
    }
  };

  typeSelect.addEventListener('change', populateMermaItems);

  document.getElementById('btnNewMerma').addEventListener('click', () => {
    populateMermaItems();
    openModal('modalMerma');
  });

  document.getElementById('formMerma').addEventListener('submit', (e) => {
    e.preventDefault();
    const itemType = typeSelect.value;
    const itemId = itemSelect.value;
    const qty = parseFloat(document.getElementById('mermaQty').value) || 0;
    const reason = document.getElementById('mermaReason').value;

    if (qty <= 0) return;

    let itemName = '';
    let lossCOP = 0;

    if (itemType === 'product') {
      const p = state.products.find((x) => x.id === itemId);
      if (!p) return;
      p.stock = Math.max(0, p.stock - qty);
      itemName = p.name;
      lossCOP = p.priceCOP * qty;
    } else {
      const ing = state.ingredients.find((x) => x.id === itemId);
      if (!ing) return;
      ing.stock = Math.max(0, Number((ing.stock - qty).toFixed(2)));
      itemName = `${ing.name} (${ing.unit})`;
      lossCOP = ing.costCOP * qty;
    }

    state.mermas.unshift({
      id: 'm_' + Date.now(),
      timestamp: new Date().toISOString(),
      itemType,
      itemName,
      qty,
      lossCOP,
      reason
    });

    saveState();
    closeModal('modalMerma');
    renderAll();
    showToast(`📉 Merma registrada y descontada de ${itemName}`);
  });
}

// ==========================================
// CENTRO DE GASTOS, INGRESOS EXTRA Y MOVIMIENTOS DE CAJA
// ==========================================
function renderMovimientos() {
  const salesTotalCOP = state.sales.reduce((a, b) => a + b.totalCOP, 0);
  const extraIncomes = state.expenses.filter((e) => e.movType === 'ingreso');
  const onlyExpenses = state.expenses.filter((e) => e.movType !== 'ingreso');

  const extraIncomeCOP = extraIncomes.reduce((a, b) => a + b.amountCOP, 0);
  const totalExpensesCOP = onlyExpenses.reduce((a, b) => a + b.amountCOP, 0);
  const cashExpCOP = onlyExpenses.filter((e) => e.source === 'efectivo').reduce((a, b) => a + b.amountCOP, 0);
  const digExpCOP = onlyExpenses.filter((e) => e.source === 'digital').reduce((a, b) => a + b.amountCOP, 0);
  const netFlowCOP = salesTotalCOP + extraIncomeCOP - totalExpensesCOP;

  document.getElementById('movKpiSalesCOP').textContent = fmtCOP(salesTotalCOP);
  document.getElementById('movKpiSalesCount').textContent = `${state.sales.length} transacciones hoy`;
  document.getElementById('movKpiIncomesCOP').textContent = fmtCOP(extraIncomeCOP);
  document.getElementById('movKpiExpensesCOP').textContent = fmtCOP(totalExpensesCOP);
  document.getElementById('movKpiExpensesSplit').textContent = `Efectivo: ${fmtCOP(cashExpCOP)} | Digital: ${fmtCOP(digExpCOP)}`;
  document.getElementById('movKpiNetCOP').textContent = fmtCOP(netFlowCOP);
  document.getElementById('movKpiNetEquiv').textContent = `${fmtUSD(copToUSD(netFlowCOP))} USD | ${fmtBS(copToBS(netFlowCOP))}`;

  // Filtro de ventas
  const salesFilter = (document.getElementById('salesFilterInput').value || '').toLowerCase().trim();
  const filteredSales = state.sales.filter((s) => {
    if (!salesFilter) return true;
    const itemsText = s.items.map((i) => i.name).join(' ').toLowerCase();
    const custText = (s.customerName || '').toLowerCase();
    return itemsText.includes(salesFilter) || custText.includes(salesFilter) || (s.note || '').toLowerCase().includes(salesFilter);
  });

  const salesBody = document.getElementById('salesHistoryTableBody');
  if (filteredSales.length === 0) {
    salesBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#7a685f;">No hay ventas o abonos que coincidan.</td></tr>`;
  } else {
    salesBody.innerHTML = filteredSales
      .map((s) => {
        const time = new Date(s.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        const summaryItems = s.items.map((i) => `${i.qty}x ${i.name}`).join(', ');
        return `
          <tr>
            <td>${time}</td>
            <td>
              <span class="status-badge ${s.isOrderPayment ? 'listo' : 'entregado'}" style="margin-bottom:3px;">
                👤 ${s.customerName || 'Mostrador'}
              </span><br>
              <strong>${summaryItems}</strong>
              ${s.note ? `<div style="font-size:11.5px;color:#7a685f;">Nota: ${s.note}</div>` : ''}
            </td>
            <td><small>${s.paymentSummaryText}</small></td>
            <td><strong>${fmtCOP(s.totalCOP)}</strong></td>
            <td><small>${fmtUSD(s.totalUSD)}<br>${fmtBS(s.totalBS)}</small></td>
            <td>
              <button class="btn btn-outline btn-sm" data-delsale="${s.id}" title="Anular movimiento">Anular</button>
            </td>
          </tr>
        `;
      })
      .join('');

    salesBody.querySelectorAll('[data-delsale]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sale = state.sales.find((s) => s.id === btn.dataset.delsale);
        if (sale && confirm('¿Anular este registro de venta/abono?')) {
          if (!sale.isOrderPayment) {
            sale.items.forEach((item) => {
              const p = state.products.find((x) => x.id === item.productId);
              if (p) p.stock += item.qty;
            });
          } else if (sale.orderId) {
            const ord = state.orders.find((o) => o.id === sale.orderId);
            if (ord) ord.paidCOP = Math.max(0, ord.paidCOP - sale.totalCOP);
          }
          state.sales = state.sales.filter((s) => s.id !== sale.id);
          saveState();
          renderAll();
          showToast('🔄 Registro anulado');
        }
      });
    });
  }

  // Tabla de Gastos e Ingresos Extra
  const movFilter = document.getElementById('movTypeFilter').value;
  const filteredMovs = state.expenses.filter((ex) => {
    const t = ex.movType || 'gasto';
    if (movFilter === 'all') return true;
    return t === movFilter;
  });

  const expBody = document.getElementById('expensesTableBody');
  if (filteredMovs.length === 0) {
    expBody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#7a685f;">Sin gastos ni ingresos extra registrados.</td></tr>`;
  } else {
    expBody.innerHTML = filteredMovs
      .map((ex) => {
        const isInc = ex.movType === 'ingreso';
        const time = new Date(ex.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        let formattedOrig = fmtCOP(ex.amount);
        if (ex.currency === 'USD') formattedOrig = `${fmtUSD(ex.amount)} USD`;
        if (ex.currency === 'BS') formattedOrig = fmtBS(ex.amount);

        return `
          <tr>
            <td>${time}</td>
            <td>
              <span class="status-badge ${isInc ? 'entregado' : 'cancelado'}">
                ${isInc ? '➕ Ingreso' : '➖ Gasto'}
              </span><br>
              <small><strong>${ex.category || 'General'}</strong></small>
            </td>
            <td><strong>${ex.concept}</strong></td>
            <td>${ex.source === 'efectivo' ? `💵 Gaveta ${ex.currency}` : '📲 Cuenta Digital'}</td>
            <td style="color:${isInc ? 'var(--success)' : 'var(--danger)'};font-weight:800;">
              ${isInc ? '+' : '-'}${formattedOrig}
            </td>
            <td>${fmtCOP(ex.amountCOP)}</td>
            <td>
              <button class="btn btn-outline btn-sm" data-delexp="${ex.id}">🗑️</button>
            </td>
          </tr>
        `;
      })
      .join('');

    expBody.querySelectorAll('[data-delexp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.expenses = state.expenses.filter((e) => e.id !== btn.dataset.delexp);
        saveState();
        renderAll();
      });
    });
  }
}

function openMovementModal(type) {
  document.getElementById('formExpense').reset();
  const selType = document.getElementById('expMovType');
  const selCat = document.getElementById('expCategory');
  selType.value = type;
  if (type === 'ingreso') {
    document.getElementById('modalMovementTitle').textContent = '➕ Registrar Ingreso Extra o Sencillo a Caja';
    selCat.value = 'Ingreso de Cambio / Sencillo';
  } else {
    document.getElementById('modalMovementTitle').textContent = '➖ Registrar Gasto o Salida de Caja';
    selCat.value = 'Compra de Insumos';
  }
  openModal('modalExpense');
}

function initExpensesEvents() {
  document.getElementById('salesFilterInput').addEventListener('input', renderMovimientos);
  document.getElementById('movTypeFilter').addEventListener('change', renderMovimientos);

  document.getElementById('btnAddIncomeTab').addEventListener('click', () => openMovementModal('ingreso'));
  document.getElementById('btnAddExpenseTab').addEventListener('click', () => openMovementModal('gasto'));

  document.getElementById('formExpense').addEventListener('submit', (e) => {
    e.preventDefault();
    const movType = document.getElementById('expMovType').value;
    const category = document.getElementById('expCategory').value;
    const concept = document.getElementById('expConcept').value.trim();
    const currency = document.getElementById('expCurrency').value;
    const amount = parseFloat(document.getElementById('expAmount').value) || 0;
    const source = document.getElementById('expSource').value;

    let amountCOP = amount;
    if (currency === 'USD') amountCOP = usdToCOP(amount);
    if (currency === 'BS') amountCOP = bsToCOP(amount);

    state.expenses.unshift({
      id: 'ex_' + Date.now(),
      timestamp: new Date().toISOString(),
      movType,
      category,
      concept,
      currency,
      amount,
      amountCOP,
      source
    });

    saveState();
    closeModal('modalExpense');
    renderAll();
    showToast(`${movType === 'ingreso' ? '➕ Ingreso' : '➖ Gasto'} registrado: ${concept}`);
  });
}

// ==========================================
// ENTREGA DE CUENTAS AL FINAL DEL DÍA (CORTE Y ARQUEO EXACTO)
// ==========================================
function getArqueoExpected() {
  const baseCOP = Number(state.baseCash.COP) || 0;
  const baseUSD = Number(state.baseCash.USD) || 0;
  const baseBS = Number(state.baseCash.BS) || 0;

  let inCashCOP = 0;
  let inCashUSD = 0;
  let inCashBS = 0;

  let outCashCOP = 0;
  let outCashUSD = 0;
  let outCashBS = 0;

  let salesDigitalCOP = 0;
  let digitalExpensesCOP = 0;

  state.sales.forEach((s) => {
    if (s.cashInCOP !== undefined) {
      inCashCOP += Number(s.cashInCOP) || 0;
      inCashUSD += Number(s.cashInUSD) || 0;
      inCashBS += Number(s.cashInBS) || 0;
      outCashCOP += Number(s.changeOutCOP) || 0;
      outCashUSD += Number(s.changeOutUSD) || 0;
      outCashBS += Number(s.changeOutBS) || 0;
    } else {
      // Compatibilidad con registros previos
      inCashCOP += Math.max(0, Number(s.cashNetCOP) || 0);
      outCashCOP += Math.abs(Math.min(0, Number(s.cashNetCOP) || 0));
      inCashUSD += Number(s.cashNetUSD) || 0;
      inCashBS += Number(s.cashNetBS) || 0;
    }
    salesDigitalCOP += Number(s.digitalCOP) || 0;
  });

  state.expenses.forEach((e) => {
    const isInc = e.movType === 'ingreso';
    if (e.source === 'efectivo') {
      if (isInc) {
        if (e.currency === 'COP') inCashCOP += e.amount;
        if (e.currency === 'USD') inCashUSD += e.amount;
        if (e.currency === 'BS') inCashBS += e.amount;
      } else {
        if (e.currency === 'COP') outCashCOP += e.amount;
        if (e.currency === 'USD') outCashUSD += e.amount;
        if (e.currency === 'BS') outCashBS += e.amount;
      }
    } else {
      if (isInc) {
        salesDigitalCOP += e.amountCOP;
      } else {
        digitalExpensesCOP += e.amountCOP;
      }
    }
  });

  const expectedCOP = baseCOP + inCashCOP - outCashCOP;
  const expectedUSD = baseUSD + inCashUSD - outCashUSD;
  const expectedBS = baseBS + inCashBS - outCashBS;
  const netDigitalCOP = salesDigitalCOP - digitalExpensesCOP;

  return {
    baseCOP,
    baseUSD,
    baseBS,
    inCashCOP,
    inCashUSD,
    inCashBS,
    outCashCOP,
    outCashUSD,
    outCashBS,
    expectedCOP,
    expectedUSD,
    expectedBS,
    salesDigitalCOP,
    digitalExpensesCOP,
    netDigitalCOP
  };
}

function renderCorteDeCaja() {
  const totalSalesCOP = state.sales.reduce((acc, s) => acc + s.totalCOP, 0);
  const onlyExpenses = state.expenses.filter((e) => e.movType !== 'ingreso');
  const onlyIncomes = state.expenses.filter((e) => e.movType === 'ingreso');

  const totalExpensesCOP = onlyExpenses.reduce((acc, e) => acc + e.amountCOP, 0);
  const totalExtraIncomesCOP = onlyIncomes.reduce((acc, e) => acc + e.amountCOP, 0);
  const totalMermasCOP = state.mermas.reduce((acc, m) => acc + m.lossCOP, 0);
  const netBalanceCOP = totalSalesCOP - totalExpensesCOP;

  const arq = getArqueoExpected();
  const totalBasePlusExtraCOP = arq.baseCOP + usdToCOP(arq.baseUSD) + bsToCOP(arq.baseBS) + totalExtraIncomesCOP;

  document.getElementById('corteTotalVentasCOP').textContent = `${fmtCOP(totalSalesCOP)} COP`;
  document.getElementById('corteTotalVentasEquiv').textContent = `${fmtUSD(copToUSD(totalSalesCOP))} USD | ${fmtBS(copToBS(totalSalesCOP))}`;

  document.getElementById('corteFondoInicialCOP').textContent = `${fmtCOP(totalBasePlusExtraCOP)} COP`;
  document.getElementById('corteFondoDetalle').textContent = `Base COP: ${fmtCOP(arq.baseCOP)} | USD: ${fmtUSD(arq.baseUSD)} | Bs: ${fmtBS(arq.baseBS)}`;

  document.getElementById('corteTotalGastosCOP').textContent = `${fmtCOP(totalExpensesCOP)} COP`;
  document.getElementById('corteMermasInfo').textContent = `Mermas hoy: ${fmtCOP(totalMermasCOP)} COP`;

  document.getElementById('corteUtilidadNetaCOP').textContent = `${fmtCOP(netBalanceCOP)} COP`;
  document.getElementById('corteUtilidadEquiv').textContent = `${fmtUSD(copToUSD(netBalanceCOP))} USD | ${fmtBS(copToBS(netBalanceCOP))}`;

  // Desglose por método de pago
  const byEfectivo = state.sales.filter((s) => s.method === 'efectivo').reduce((a, b) => a + b.totalCOP, 0);
  const byTransf = state.sales.filter((s) => s.method === 'transferencia').reduce((a, b) => a + b.totalCOP, 0);
  const byTarjeta = state.sales.filter((s) => s.method === 'tarjeta').reduce((a, b) => a + b.totalCOP, 0);
  const byMixto = state.sales.filter((s) => s.method === 'mixto').reduce((a, b) => a + b.totalCOP, 0);
  const byOrderPayments = state.sales.filter((s) => s.isOrderPayment).reduce((a, b) => a + b.totalCOP, 0);

  document.getElementById('corteMethodBreakdown').innerHTML = `
    <div class="summary-row"><span>💵 Ventas y Abonos en Efectivo</span><strong>${fmtCOP(byEfectivo)} (${fmtUSD(copToUSD(byEfectivo))})</strong></div>
    <div class="summary-row"><span>📲 Transferencia / Pago Móvil / QR</span><strong>${fmtCOP(byTransf)} (${fmtUSD(copToUSD(byTransf))})</strong></div>
    <div class="summary-row"><span>💳 Punto de Venta / Tarjeta</span><strong>${fmtCOP(byTarjeta)} (${fmtUSD(copToUSD(byTarjeta))})</strong></div>
    <div class="summary-row"><span>🔄 Pagos Mixtos</span><strong>${fmtCOP(byMixto)} (${fmtUSD(copToUSD(byMixto))})</strong></div>
    <div class="summary-row"><span>🎂 De los cuales fueron Abonos/Saldos de Pedidos</span><strong>${fmtCOP(byOrderPayments)}</strong></div>
  `;

  // Desglose de Gastos por Categoría
  const catMap = {};
  onlyExpenses.forEach((ex) => {
    const cat = ex.category || 'General';
    catMap[cat] = (catMap[cat] || 0) + ex.amountCOP;
  });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const expCatContainer = document.getElementById('corteExpenseCategoryBreakdown');
  if (catEntries.length === 0) {
    expCatContainer.innerHTML = `<div class="helper-text">No se registraron gastos en este turno.</div>`;
  } else {
    expCatContainer.innerHTML = catEntries
      .map(
        ([cat, amount]) =>
          `<div class="summary-row"><span>${cat}</span><strong>${fmtCOP(amount)} (${fmtUSD(copToUSD(amount))})</strong></div>`
      )
      .join('');
  }

  // Top productos vendidos hoy
  const prodCountMap = {};
  state.sales.forEach((s) => {
    s.items.forEach((i) => {
      if (!prodCountMap[i.name]) prodCountMap[i.name] = { qty: 0, totalCOP: 0 };
      prodCountMap[i.name].qty += i.qty;
      prodCountMap[i.name].totalCOP += i.qty * i.priceCOP;
    });
  });

  const topArr = Object.entries(prodCountMap).sort((a, b) => b[1].qty - a[1].qty);
  const topContainer = document.getElementById('corteTopProducts');
  if (topArr.length === 0) {
    topContainer.innerHTML = `<div class="helper-text">Aún no se han registrado ventas hoy.</div>`;
  } else {
    topContainer.innerHTML = topArr
      .slice(0, 5)
      .map(
        ([name, data]) =>
          `<div class="summary-row"><span>${name} (x${data.qty})</span><strong>${fmtCOP(data.totalCOP)}</strong></div>`
      )
      .join('');
  }

  // Tabla de Arqueo Físico
  document.getElementById('arqBaseCOP').textContent = fmtCOP(arq.baseCOP);
  document.getElementById('arqInCOP').textContent = `+${fmtCOP(arq.inCashCOP)}`;
  document.getElementById('arqOutCOP').textContent = `-${fmtCOP(arq.outCashCOP)}`;
  document.getElementById('arqExpTotalCOP').textContent = fmtCOP(arq.expectedCOP);

  document.getElementById('arqBaseUSD').textContent = fmtUSD(arq.baseUSD);
  document.getElementById('arqInUSD').textContent = `+${fmtUSD(arq.inCashUSD)}`;
  document.getElementById('arqOutUSD').textContent = `-${fmtUSD(arq.outCashUSD)}`;
  document.getElementById('arqExpTotalUSD').textContent = fmtUSD(arq.expectedUSD);

  document.getElementById('arqBaseBS').textContent = fmtBS(arq.baseBS);
  document.getElementById('arqInBS').textContent = `+${fmtBS(arq.inCashBS)}`;
  document.getElementById('arqOutBS').textContent = `-${fmtBS(arq.outCashBS)}`;
  document.getElementById('arqExpTotalBS').textContent = fmtBS(arq.expectedBS);

  document.getElementById('arqNetDigitalCOP').textContent = `${fmtCOP(arq.netDigitalCOP)} (${fmtUSD(copToUSD(arq.netDigitalCOP))} USD)`;

  updateArqueoDifferences();
  renderClosedDaysHistory();
}

function updateArqueoDifferences() {
  const arq = getArqueoExpected();

  const rawCOP = document.getElementById('realCountCOP').value;
  const rawUSD = document.getElementById('realCountUSD').value;
  const rawBS = document.getElementById('realCountBS').value;

  const realCOP = rawCOP === '' ? arq.expectedCOP : parseFloat(rawCOP) || 0;
  const realUSD = rawUSD === '' ? arq.expectedUSD : parseFloat(rawUSD) || 0;
  const realBS = rawBS === '' ? arq.expectedBS : parseFloat(rawBS) || 0;

  const diffCOP = realCOP - arq.expectedCOP;
  const diffUSD = realUSD - arq.expectedUSD;
  const diffBS = realBS - arq.expectedBS;

  setDiffCell('arqDiffCOP', diffCOP, fmtCOP(diffCOP));
  setDiffCell('arqDiffUSD', diffUSD, fmtUSD(diffUSD));
  setDiffCell('arqDiffBS', diffBS, fmtBS(diffBS));

  const unifiedDiffCOP = diffCOP + usdToCOP(diffUSD) + bsToCOP(diffBS);
  const globalText = document.getElementById('arqueoGlobalDiffText');

  if (Math.abs(unifiedDiffCOP) < 50) {
    globalText.textContent = '✅ CAJA CUADRADA EXACTA ($ 0 diferencia)';
    globalText.style.color = 'var(--success)';
  } else if (unifiedDiffCOP > 0) {
    globalText.textContent = `➕ SOBRANTE EN CAJA: +${fmtCOP(unifiedDiffCOP)} (${fmtUSD(copToUSD(unifiedDiffCOP))})`;
    globalText.style.color = 'var(--warning)';
  } else {
    globalText.textContent = `⚠️ FALTANTE EN CAJA: ${fmtCOP(unifiedDiffCOP)} (${fmtUSD(copToUSD(unifiedDiffCOP))})`;
    globalText.style.color = 'var(--danger)';
  }

  return { unifiedDiffCOP, realCOP, realUSD, realBS };
}

function setDiffCell(id, diffVal, formatted) {
  const el = document.getElementById(id);
  el.textContent = diffVal > 0 ? `+${formatted}` : formatted;
  el.className = 'diff-cell ' + (Math.abs(diffVal) < 0.05 ? 'ok' : diffVal > 0 ? 'over' : 'short');
}

function initCorteEvents() {
  ['realCountCOP', 'realCountUSD', 'realCountBS'].forEach((id) => {
    document.getElementById(id).addEventListener('input', updateArqueoDifferences);
  });

  document.getElementById('btnPrintCorte').addEventListener('click', () => {
    document.getElementById('printDateInfo').textContent =
      'Fecha de corte: ' +
      new Date().toLocaleString('es-CO') +
      ' | Responsable: ' +
      (document.getElementById('corteCashierName').value || 'General');
    window.print();
  });

  document.getElementById('btnSaveAndCloseDay').addEventListener('click', () => {
    if (state.sales.length === 0 && state.expenses.length === 0) {
      if (!confirm('No hay ventas ni gastos registrados en este turno. ¿Deseas guardar el corte de todos modos?')) {
        return;
      }
    }

    const totalSalesCOP = state.sales.reduce((acc, s) => acc + s.totalCOP, 0);
    const totalExpensesCOP = state.expenses.filter((e) => e.movType !== 'ingreso').reduce((acc, e) => acc + e.amountCOP, 0);
    const { unifiedDiffCOP, realCOP, realUSD, realBS } = updateArqueoDifferences();
    const cashier = document.getElementById('corteCashierName').value.trim() || 'Encargado de Turno';
    const notes = document.getElementById('corteNotes').value.trim() || 'Sin observaciones';

    if (!confirm('¿Confirmas guardar la Entrega de Cuentas y reiniciar las ventas/gastos para el siguiente turno? (El inventario, clientes y pedidos se mantienen intactos)')) {
      return;
    }

    state.closedDays.unshift({
      id: 'corte_' + Date.now(),
      closedAt: new Date().toISOString(),
      cashier,
      totalSalesCOP,
      totalExpensesCOP,
      realCashSummary: `COP: ${fmtCOP(realCOP)} | USD: ${fmtUSD(realUSD)} | Bs: ${fmtBS(realBS)}`,
      unifiedDiffCOP,
      notes
    });

    state.sales = [];
    state.expenses = [];
    state.mermas = [];

    document.getElementById('realCountCOP').value = '';
    document.getElementById('realCountUSD').value = '';
    document.getElementById('realCountBS').value = '';
    document.getElementById('corteNotes').value = '';

    saveState();
    renderAll();
    showToast('🔒 Entrega de cuentas guardada y nuevo turno iniciado');
  });
}

function renderClosedDaysHistory() {
  const tbody = document.getElementById('closedDaysHistoryBody');
  if (state.closedDays.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#7a685f;">Aún no hay cierres de días anteriores guardados.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.closedDays
    .map((c) => {
      const dt = new Date(c.closedAt).toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `
        <tr>
          <td><strong>${dt}</strong></td>
          <td>${c.cashier}</td>
          <td><strong>${fmtCOP(c.totalSalesCOP)}</strong> (${fmtUSD(copToUSD(c.totalSalesCOP))})</td>
          <td>${fmtCOP(c.totalExpensesCOP)}</td>
          <td><small>${c.realCashSummary || '-'}</small></td>
          <td>${fmtCOP(c.unifiedDiffCOP)}</td>
          <td>${c.notes}</td>
        </tr>
      `;
    })
    .join('');
}

// ==========================================
// PERSONALIZACIÓN (LOGO, PALETA DE COLORES, DATOS) Y RESPALDOS
// ==========================================
function updateConfigLogoPreview(logoSrc, emoji) {
  const box = document.getElementById('cfgLogoPreviewBox');
  document.getElementById('cfgBrandLogoData').value = logoSrc || '';
  if (logoSrc) {
    box.innerHTML = `<img src="${logoSrc}" alt="Logo Preview" />`;
  } else {
    box.innerHTML = `<span>${emoji || '🧁'}</span>`;
  }
}

function renderConfigForm() {
  document.getElementById('cfgBrandName').value = state.config.brandName;
  document.getElementById('cfgBrandSlogan').value = state.config.brandSlogan;
  document.getElementById('cfgBrandEmoji').value = state.config.brandEmoji || '🧁';
  document.getElementById('cfgCategories').value = state.config.categories.join(', ');
  document.getElementById('cfgRateUSD').value = state.config.rateUSD;
  document.getElementById('cfgRateBS').value = state.config.rateBS;

  updateConfigLogoPreview(state.config.brandLogo || '', state.config.brandEmoji || '🧁');

  const cPrim = state.config.colorPrimary || '#c84b6b';
  const cSec = state.config.colorSecondary || '#5c3d2e';
  const cBg = state.config.colorBg || '#fdfaf7';

  document.getElementById('cfgColorPrimary').value = cPrim;
  document.getElementById('cfgColorPrimaryHex').textContent = cPrim;
  document.getElementById('cfgColorSecondary').value = cSec;
  document.getElementById('cfgColorSecondaryHex').textContent = cSec;
  document.getElementById('cfgColorBg').value = cBg;
  document.getElementById('cfgColorBgHex').textContent = cBg;
}

function initConfigEvents() {
  // Subir Logo desde archivo en PC
  document.getElementById('cfgLogoFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    resizeImageFileToDataUrl(file, (dataUrl) => {
      document.getElementById('cfgLogoUrlInput').value = '';
      updateConfigLogoPreview(dataUrl, document.getElementById('cfgBrandEmoji').value);
    });
  });

  // Pegar URL del Logo
  document.getElementById('cfgLogoUrlInput').addEventListener('input', (e) => {
    const url = e.target.value.trim();
    updateConfigLogoPreview(url, document.getElementById('cfgBrandEmoji').value);
  });

  // Quitar Logo y volver a usar Emoji
  document.getElementById('btnRemoveBrandLogo').addEventListener('click', () => {
    document.getElementById('cfgLogoFileInput').value = '';
    document.getElementById('cfgLogoUrlInput').value = '';
    updateConfigLogoPreview('', document.getElementById('cfgBrandEmoji').value);
  });

  document.getElementById('cfgBrandEmoji').addEventListener('input', (e) => {
    if (!document.getElementById('cfgBrandLogoData').value) {
      updateConfigLogoPreview('', e.target.value);
    }
  });

  // Presets de Paleta de Colores
  document.querySelectorAll('#palettePresetsGrid .palette-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.primary;
      const s = btn.dataset.secondary;
      const b = btn.dataset.bg;

      document.getElementById('cfgColorPrimary').value = p;
      document.getElementById('cfgColorPrimaryHex').textContent = p;
      document.getElementById('cfgColorSecondary').value = s;
      document.getElementById('cfgColorSecondaryHex').textContent = s;
      document.getElementById('cfgColorBg').value = b;
      document.getElementById('cfgColorBgHex').textContent = b;

      applyThemeColors(p, s, b);
    });
  });

  // Selectores individuales de color en vivo
  const bindColorPicker = (inputId, hexId) => {
    const inp = document.getElementById(inputId);
    const hex = document.getElementById(hexId);
    inp.addEventListener('input', () => {
      hex.textContent = inp.value;
      applyThemeColors(
        document.getElementById('cfgColorPrimary').value,
        document.getElementById('cfgColorSecondary').value,
        document.getElementById('cfgColorBg').value
      );
    });
  };

  bindColorPicker('cfgColorPrimary', 'cfgColorPrimaryHex');
  bindColorPicker('cfgColorSecondary', 'cfgColorSecondaryHex');
  bindColorPicker('cfgColorBg', 'cfgColorBgHex');

  // Botón restaurar colores originales
  document.getElementById('btnResetColors').addEventListener('click', () => {
    const p = '#c84b6b';
    const s = '#5c3d2e';
    const b = '#fdfaf7';
    document.getElementById('cfgColorPrimary').value = p;
    document.getElementById('cfgColorPrimaryHex').textContent = p;
    document.getElementById('cfgColorSecondary').value = s;
    document.getElementById('cfgColorSecondaryHex').textContent = s;
    document.getElementById('cfgColorBg').value = b;
    document.getElementById('cfgColorBgHex').textContent = b;

    state.config.colorPrimary = p;
    state.config.colorSecondary = s;
    state.config.colorBg = b;
    saveState();
    renderAll();
    showToast('🎨 Colores originales restaurados');
  });

  // Guardar Identidad, Logo y Paleta de Colores
  document.getElementById('formConfigBusiness').addEventListener('submit', (e) => {
    e.preventDefault();
    state.config.brandName = document.getElementById('cfgBrandName').value.trim() || 'Mi Repostería';
    state.config.brandSlogan = document.getElementById('cfgBrandSlogan').value.trim();
    state.config.brandEmoji = document.getElementById('cfgBrandEmoji').value.trim() || '🧁';
    state.config.brandLogo = document.getElementById('cfgBrandLogoData').value || '';
    state.config.colorPrimary = document.getElementById('cfgColorPrimary').value || '#c84b6b';
    state.config.colorSecondary = document.getElementById('cfgColorSecondary').value || '#5c3d2e';
    state.config.colorBg = document.getElementById('cfgColorBg').value || '#fdfaf7';

    const rawCats = document.getElementById('cfgCategories').value;
    const cats = rawCats
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cats.length > 0) state.config.categories = cats;

    saveState();
    renderAll();
    showToast('✅ Identidad, logo y paleta de colores guardados');
  });

  document.getElementById('btnCalcBsFromUsd').addEventListener('click', () => {
    const rateUSD = parseFloat(document.getElementById('cfgRateUSD').value) || state.config.rateUSD;
    const bsPerUsd = parseFloat(document.getElementById('cfgHelperBsPerUsd').value);
    if (!bsPerUsd || bsPerUsd <= 0) {
      showToast('⚠️ Escribe cuántos Bolívares equivalen a 1 Dólar');
      return;
    }
    const calculatedRateBS = Number((rateUSD / bsPerUsd).toFixed(2));
    document.getElementById('cfgRateBS').value = calculatedRateBS;
    showToast(`💡 Calculado: 1 Bs = ${calculatedRateBS} COP`);
  });

  document.getElementById('btnSaveRatesConfig').addEventListener('click', () => {
    const rUSD = parseFloat(document.getElementById('cfgRateUSD').value);
    const rBS = parseFloat(document.getElementById('cfgRateBS').value);
    if (rUSD > 0) state.config.rateUSD = rUSD;
    if (rBS > 0) state.config.rateBS = rBS;
    saveState();
    renderAll();
    showToast('💱 Tasas de cambio actualizadas en todo el sistema');
  });

  document.getElementById('btnExportBackup').addEventListener('click', () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateTag = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `respaldo-reposteria-${dateTag}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('⬇️ Copia de seguridad descargada');
  });

  document.getElementById('inputImportBackup').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported && imported.config && imported.products) {
          state = imported;
          saveState();
          renderAll();
          showToast('✅ Copia de seguridad restaurada con éxito');
        } else {
          showToast('⚠️ El archivo no tiene un formato válido');
        }
      } catch (err) {
        showToast('⚠️ Error al leer el archivo de respaldo');
      }
    };
    reader.readAsText(file);
  });
}

// ==========================================
// CONTROL DE USUARIOS, ROLES, LOGIN POR PIN Y BITÁCORA
// ==========================================
function getRoleLabel(role) {
  if (role === 'admin') return '👑 Administrador Total';
  if (role === 'cajero') return '🧾 Cajero / Ventas';
  if (role === 'repostero') return '👩‍🍳 Repostero / Cocina';
  return role;
}

function logUserAction(actionText) {
  if (!state.auditLog) state.auditLog = [];
  state.auditLog.unshift({
    id: 'aud_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    userName: currentUser ? currentUser.name : 'Sistema',
    role: currentUser ? currentUser.role : 'admin',
    action: actionText
  });
  if (state.auditLog.length > 60) {
    state.auditLog = state.auditLog.slice(0, 60);
  }
}

function renderActiveUserSession() {
  if (!currentUser && state.users && state.users.length > 0) {
    currentUser = state.users[0];
  }
  if (!currentUser) return;

  document.getElementById('activeUserAvatar').textContent = currentUser.avatar || '👤';
  document.getElementById('activeUserNameDisplay').textContent = currentUser.name;
  document.getElementById('activeUserRoleDisplay').textContent = getRoleLabel(currentUser.role);

  const cashierInput = document.getElementById('corteCashierName');
  if (cashierInput && !cashierInput.value) {
    cashierInput.value = `${currentUser.name} (${getRoleLabel(currentUser.role)})`;
  }

  // Ocultar o mostrar pestañas exclusivas de Administrador
  const isAdmin = currentUser.role === 'admin';
  const navUsers = document.getElementById('navItemUsuarios');
  const navConfig = document.getElementById('navItemConfig');
  if (navUsers) navUsers.style.opacity = isAdmin ? '1' : '0.5';
  if (navConfig) navConfig.style.opacity = isAdmin ? '1' : '0.5';
}

function renderUsersSection() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  const chkLogin = document.getElementById('cfgRequireLoginOnStart');
  if (chkLogin) chkLogin.checked = !!state.config.requireLoginOnStart;

  tbody.innerHTML = (state.users || [])
    .map(
      (u) => `
      <tr>
        <td><strong>${u.avatar || '👤'} ${u.name}</strong></td>
        <td><span class="status-badge ${u.role === 'admin' ? 'listo' : u.role === 'cajero' ? 'entregado' : 'preparacion'}">${getRoleLabel(u.role)}</span></td>
        <td><code>••••</code></td>
        <td><span class="stock-pill">${u.active !== false ? 'Activo' : 'Inactivo'}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" data-switchto="${u.id}" title="Cambiar a este usuario">🔑 Usar</button>
          <button class="btn btn-outline btn-sm" data-editusr="${u.id}">✏️</button>
          ${
            state.users.length > 1
              ? `<button class="btn btn-outline btn-sm" data-delusr="${u.id}">🗑️</button>`
              : ''
          }
        </td>
      </tr>
    `
    )
    .join('');

  tbody.querySelectorAll('[data-switchto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openLoginScreen(btn.dataset.switchto);
    });
  });

  tbody.querySelectorAll('[data-editusr]').forEach((btn) => {
    btn.addEventListener('click', () => openUserModal(btn.dataset.editusr));
  });

  tbody.querySelectorAll('[data-delusr]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const u = state.users.find((x) => x.id === btn.dataset.delusr);
      if (!u) return;
      if (state.users.length <= 1) {
        showToast('⚠️ Debe existir al menos un usuario en el sistema');
        return;
      }
      if (confirm(`¿Eliminar al usuario "${u.name}"?`)) {
        state.users = state.users.filter((x) => x.id !== u.id);
        saveState();
        renderAll();
      }
    });
  });

  // Renderizar bitácora
  const auditBody = document.getElementById('userAuditTableBody');
  if (auditBody) {
    const logs = state.auditLog || [];
    if (logs.length === 0) {
      auditBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#7a685f;">Sin registros de actividad.</td></tr>`;
    } else {
      auditBody.innerHTML = logs
        .slice(0, 25)
        .map((l) => {
          const dt = new Date(l.timestamp).toLocaleString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
          return `
            <tr>
              <td><small>${dt}</small></td>
              <td><strong>${l.userName}</strong></td>
              <td><small>${getRoleLabel(l.role)}</small></td>
              <td>${l.action}</td>
            </tr>
          `;
        })
        .join('');
    }
  }
}

function openUserModal(userId) {
  if (userId) {
    const u = state.users.find((x) => x.id === userId);
    if (!u) return;
    document.getElementById('modalUserTitle').textContent = 'Editar Usuario';
    document.getElementById('usrId').value = u.id;
    document.getElementById('usrName').value = u.name;
    document.getElementById('usrAvatar').value = u.avatar || '👤';
    document.getElementById('usrRole').value = u.role;
    document.getElementById('usrPin').value = u.pin;
  } else {
    document.getElementById('modalUserTitle').textContent = '➕ Nuevo Usuario';
    document.getElementById('formUser').reset();
    document.getElementById('usrId').value = '';
    document.getElementById('usrAvatar').value = '👩‍💼';
  }
  openModal('modalUser');
}

function openLoginScreen(preselectedUserId) {
  const overlay = document.getElementById('loginOverlay');
  const grid = document.getElementById('loginUsersGrid');
  const logoBox = document.getElementById('loginBrandLogo');
  document.getElementById('loginBrandTitle').textContent = state.config.brandName || 'Dulce Repostería';

  if (state.config.brandLogo) {
    logoBox.innerHTML = `<img src="${state.config.brandLogo}" alt="Logo" />`;
  } else {
    logoBox.textContent = state.config.brandEmoji || '🧁';
  }

  const users = state.users || [];
  let selectedId = preselectedUserId || (currentUser ? currentUser.id : users[0]?.id);

  const renderTiles = () => {
    grid.innerHTML = users
      .map(
        (u) => `
        <div class="login-user-tile ${u.id === selectedId ? 'active' : ''}" data-uid="${u.id}">
          <span class="tile-avatar">${u.avatar || '👤'}</span>
          <strong>${u.name}</strong>
          <small>${getRoleLabel(u.role)}</small>
        </div>
      `
      )
      .join('');

    const selUser = users.find((x) => x.id === selectedId) || users[0];
    if (selUser) {
      document.getElementById('loginSelectedUserId').value = selUser.id;
      document.getElementById('loginSelectedUserLabel').textContent = `Ingresa el PIN de ${selUser.name}:`;
    }

    grid.querySelectorAll('.login-user-tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        selectedId = tile.dataset.uid;
        document.getElementById('loginPinInput').value = '';
        renderTiles();
        document.getElementById('loginPinInput').focus();
      });
    });
  };

  renderTiles();
  document.getElementById('loginPinInput').value = '';
  overlay.classList.remove('hidden');
  setTimeout(() => document.getElementById('loginPinInput').focus(), 100);
}

function initUsersAndAuthEvents() {
  document.getElementById('btnLockOrSwitchUser').addEventListener('click', () => openLoginScreen());
  document.getElementById('btnLockScreenNow').addEventListener('click', () => openLoginScreen());
  document.getElementById('btnNewUser').addEventListener('click', () => openUserModal(null));

  document.getElementById('cfgRequireLoginOnStart').addEventListener('change', (e) => {
    state.config.requireLoginOnStart = e.target.checked;
    saveState();
    showToast(e.target.checked ? '🔒 Solicitud de PIN al iniciar activada' : '🔓 Inicio directo activado');
  });

  document.getElementById('formUser').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('usrId').value;
    const data = {
      id: id || 'u_' + Date.now(),
      name: document.getElementById('usrName').value.trim(),
      avatar: document.getElementById('usrAvatar').value.trim() || '👤',
      role: document.getElementById('usrRole').value,
      pin: document.getElementById('usrPin').value.trim(),
      active: true
    };

    if (id) {
      const idx = state.users.findIndex((u) => u.id === id);
      if (idx >= 0) state.users[idx] = data;
      if (currentUser && currentUser.id === id) currentUser = data;
    } else {
      state.users.push(data);
    }

    logUserAction(`Guardó usuario "${data.name}" (${getRoleLabel(data.role)})`);
    saveState();
    closeModal('modalUser');
    renderAll();
    showToast(`👤 Usuario "${data.name}" guardado`);
  });

  // Teclado numérico del Login por PIN
  document.querySelectorAll('.pin-key').forEach((key) => {
    key.addEventListener('click', () => {
      const inp = document.getElementById('loginPinInput');
      const d = key.dataset.digit;
      if (d === 'clear') {
        inp.value = '';
      } else if (d === 'back') {
        inp.value = inp.value.slice(0, -1);
      } else {
        inp.value += d;
      }
      inp.focus();
    });
  });

  document.getElementById('formLoginPin').addEventListener('submit', (e) => {
    e.preventDefault();
    const uid = document.getElementById('loginSelectedUserId').value;
    const pin = document.getElementById('loginPinInput').value.trim();
    const user = state.users.find((u) => u.id === uid);

    if (!user) return;
    if (user.pin !== pin) {
      playAlertBeep();
      showToast('❌ PIN incorrecto. Intenta nuevamente.');
      document.getElementById('loginPinInput').value = '';
      return;
    }

    currentUser = user;
    document.getElementById('corteCashierName').value = `${user.name} (${getRoleLabel(user.role)})`;
    logUserAction(`Inició turno en el sistema`);
    saveState();
    document.getElementById('loginOverlay').classList.add('hidden');

    if (user.role !== 'admin') {
      goToTab('pos');
    }
    renderAll();
    showToast(`👋 ¡Bienvenido(a), ${user.name}!`);
  });

  // Botón de Centro de Alertas Críticas y Sonido
  document.getElementById('btnOpenCriticalAlerts').addEventListener('click', () => {
    openCriticalAlertsModal();
  });

  document.getElementById('btnTestAlertSound').addEventListener('click', () => {
    playAlertBeep();
    showToast('🔊 Sonido de alerta reproducido');
  });
}

// ==========================================
// ALERTAS VISUALES NOTORIAS Y ALARMA SONORA
// ==========================================
function playAlertBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.22, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(880, 0, 0.16);
    playTone(1174, 0.18, 0.22);
  } catch (_) {}
}

function getDetailedActiveAlerts() {
  const todayStr = new Date().toISOString().split('T')[0];
  const zeroProducts = state.products.filter((p) => p.stock <= 0);
  const lowProducts = state.products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  const lowIngredients = state.ingredients.filter((i) => i.stock <= i.minStock);
  const expiringProducts = state.products.filter((p) => p.stock > 0 && isExpiringSoonOrExpired(p.expiry));
  const expiringIngredients = state.ingredients.filter((i) => i.stock > 0 && isExpiringSoonOrExpired(i.expiry));
  const todayOrders = state.orders.filter(
    (o) => o.status !== 'Entregado' && o.status !== 'Cancelado' && o.deliveryDate <= todayStr
  );
  const activeOrders = state.orders.filter(
    (o) => o.status !== 'Entregado' && o.status !== 'Cancelado'
  );

  return {
    zeroProducts,
    lowProducts,
    lowIngredients,
    expiringProducts,
    expiringIngredients,
    todayOrders,
    activeOrders
  };
}

function updateGlobalAlerts() {
  const {
    zeroProducts,
    lowProducts,
    lowIngredients,
    expiringProducts,
    expiringIngredients,
    todayOrders,
    activeOrders
  } = getDetailedActiveAlerts();

  const totalLowProd = zeroProducts.length + lowProducts.length;
  const totalExpiring = expiringProducts.length + expiringIngredients.length;

  setBadge('badgePedidos', activeOrders.length);
  setBadge('badgeProductos', totalLowProd);
  setBadge('badgeInsumos', lowIngredients.length);
  setBadge('badgeMermas', totalExpiring);

  const totalCriticalCount =
    todayOrders.length + totalLowProd + lowIngredients.length + totalExpiring;

  const topbarBell = document.getElementById('btnOpenCriticalAlerts');
  const topbarCount = document.getElementById('topbarAlertCount');
  const mobAlertBadge = document.getElementById('mobileAlertBadge');
  if (topbarCount) topbarCount.textContent = totalCriticalCount;
  if (mobAlertBadge) mobAlertBadge.textContent = totalCriticalCount;
  if (topbarBell) {
    if (totalCriticalCount > 0) {
      topbarBell.classList.add('has-alerts');
    } else {
      topbarBell.classList.remove('has-alerts');
    }
  }

  const banner = document.getElementById('globalAlertsBar');
  if (!banner) return;

  const cards = [];

  if (todayOrders.length > 0) {
    const names = todayOrders.map((o) => o.customerName).join(', ');
    cards.push(`
      <div class="prominent-alert-box">
        <div>
          <strong>🎂 ¡${todayOrders.length} PEDIDO(S) PARA ENTREGAR HOY!</strong>
          <span>Clientes: ${names}</span>
        </div>
        <button type="button" class="btn btn-danger btn-sm" data-alerttab="pedidos">Ver Pedidos ➔</button>
      </div>
    `);
  }

  if (totalLowProd > 0) {
    const names = [...zeroProducts, ...lowProducts]
      .slice(0, 3)
      .map((p) => `${p.name} (${p.stock})`)
      .join(', ');
    cards.push(`
      <div class="prominent-alert-box ${zeroProducts.length > 0 ? '' : 'warn'}">
        <div>
          <strong>🍰 ¡${totalLowProd} PRODUCTO(S) CON STOCK CRÍTICO!</strong>
          <span>${names}</span>
        </div>
        <button type="button" class="btn btn-primary btn-sm" data-alerttab="inventario">Reponer ➔</button>
      </div>
    `);
  }

  if (lowIngredients.length > 0) {
    const names = lowIngredients
      .slice(0, 3)
      .map((i) => `${i.name} (${i.stock}${i.unit})`)
      .join(', ');
    cards.push(`
      <div class="prominent-alert-box warn">
        <div>
          <strong>🌾 ¡${lowIngredients.length} INSUMO(S) POR AGOTARSE!</strong>
          <span>${names}</span>
        </div>
        <button type="button" class="btn btn-primary btn-sm" data-alerttab="insumos">Ver Insumos ➔</button>
      </div>
    `);
  }

  if (totalExpiring > 0) {
    cards.push(`
      <div class="prominent-alert-box">
        <div>
          <strong>⏰ ¡${totalExpiring} LOTE(S) PRÓXIMOS A VENCER O VENCIDOS!</strong>
          <span>Revisa fechas de caducidad en vitrina y almacén</span>
        </div>
        <button type="button" class="btn btn-danger btn-sm" data-alerttab="mermas">Revisar ➔</button>
      </div>
    `);
  }

  if (cards.length > 0) {
    banner.classList.remove('hidden');
    banner.innerHTML = `
      <div class="alerts-banner-header">
        <div class="alerts-banner-title">
          🚨 <span>ATENCIÓN PRIORITARIA EN REPOSTERÍA (${totalCriticalCount} alertas activas)</span>
        </div>
        <button type="button" class="btn btn-outline btn-sm" id="btnBannerOpenModal" style="background:#fff;color:#991b1b;border:none;">
          🔍 Ver Detalle Completo de Alertas
        </button>
      </div>
      <div class="alerts-cards-row">
        ${cards.join('')}
      </div>
    `;

    banner.querySelectorAll('[data-alerttab]').forEach((btn) => {
      btn.addEventListener('click', () => goToTab(btn.dataset.alerttab));
    });

    const btnModal = document.getElementById('btnBannerOpenModal');
    if (btnModal) {
      btnModal.addEventListener('click', openCriticalAlertsModal);
    }
  } else {
    banner.classList.add('hidden');
  }
}

function openCriticalAlertsModal() {
  const {
    zeroProducts,
    lowProducts,
    lowIngredients,
    expiringProducts,
    expiringIngredients,
    todayOrders
  } = getDetailedActiveAlerts();

  const body = document.getElementById('criticalAlertsModalBody');
  const itemsHtml = [];

  todayOrders.forEach((o) => {
    itemsHtml.push(`
      <div class="critical-modal-item">
        <div>
          <strong>🎂 Pedido para HOY (${o.deliveryTime || ''}) - ${o.customerName}</strong>
          <div style="font-size:12.5px;">${o.description}</div>
        </div>
        <button type="button" class="btn btn-primary btn-sm" data-modalgo="pedidos">Ir a Pedidos</button>
      </div>
    `);
  });

  [...zeroProducts, ...lowProducts].forEach((p) => {
    itemsHtml.push(`
      <div class="critical-modal-item ${p.stock <= 0 ? '' : 'warn'}">
        <div>
          <strong>${p.emoji || '🍰'} ${p.name} — ${p.stock <= 0 ? '¡AGOTADO (0 unid)!' : `Stock Bajo (${p.stock} unid, mín: ${p.minStock})`}</strong>
          <div style="font-size:12px;">Categoría: ${p.category}</div>
        </div>
        <button type="button" class="btn btn-outline btn-sm" data-modalgo="inventario">Reponer Stock</button>
      </div>
    `);
  });

  lowIngredients.forEach((i) => {
    itemsHtml.push(`
      <div class="critical-modal-item warn">
        <div>
          <strong>🌾 Insumo Bajo: ${i.name} (${i.stock} ${i.unit} disp. / mín: ${i.minStock} ${i.unit})</strong>
        </div>
        <button type="button" class="btn btn-outline btn-sm" data-modalgo="insumos">Ir a Insumos</button>
      </div>
    `);
  });

  [...expiringProducts, ...expiringIngredients].forEach((item) => {
    itemsHtml.push(`
      <div class="critical-modal-item">
        <div>
          <strong>⏰ Caducidad Próxima o Vencida: ${item.name}</strong>
          <div style="font-size:12px;">Fecha límite registrada: ${item.expiry}</div>
        </div>
        <button type="button" class="btn btn-danger btn-sm" data-modalgo="mermas">Ver Caducidad</button>
      </div>
    `);
  });

  if (itemsHtml.length === 0) {
    body.innerHTML = `<div class="cart-empty">✅ ¡Todo está en orden! No hay alertas críticas en este momento.</div>`;
  } else {
    body.innerHTML = itemsHtml.join('');
    body.querySelectorAll('[data-modalgo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeModal('modalCriticalAlerts');
        goToTab(btn.dataset.modalgo);
      });
    });
  }

  openModal('modalCriticalAlerts');
}

function setBadge(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  if (count > 0) {
    el.textContent = count;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

// ==========================================
// ASISTENTE INICIAL (ONBOARDING), TUTORIAL DE MÓDULOS Y SISTEMA DE MEMBRESÍA ($20 / BCV EURO)
// ==========================================
const SUBSCRIPTION_PRICE_USD = 20;
const PAGO_MOVIL_DATA = {
  cedula: '26862189',
  phone: '04127049393',
  bank: '0105',
  bankName: 'Banco Mercantil'
};

function getMembershipRemainingDays() {
  if (!state.membership || !state.membership.expiresAt) return 7;
  const diffMs = new Date(state.membership.expiresAt).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function isMembershipExpired() {
  if (!state.membership || !state.membership.onboardingCompleted) return false;
  if (state.membership.status === 'expired') return true;
  return getMembershipRemainingDays() <= 0;
}

function renderMembershipStatus() {
  if (!state.membership) return;
  const days = getMembershipRemainingDays();
  const expired = isMembershipExpired();

  if (expired && state.membership.status !== 'expired') {
    state.membership.status = 'expired';
  }

  const sidebarBadge = document.getElementById('sidebarMembershipBadge');
  const topbarText = document.getElementById('topbarMembershipText');
  const topbarBtn = document.getElementById('btnOpenMembershipTopbar');

  let labelShort = '🎁 Prueba: 7d';
  let labelLong = '🎁 Prueba: 7 días';

  if (expired) {
    labelShort = '⚠️ Vencida ($20)';
    labelLong = '⚠️ Membresía Vencida';
    if (topbarBtn) {
      topbarBtn.classList.remove('btn-primary');
      topbarBtn.classList.add('btn-danger');
    }
  } else if (state.membership.status === 'active') {
    labelShort = `💎 Activa (${days}d)`;
    labelLong = `💎 Activa: ${days} día(s)`;
    if (topbarBtn) {
      topbarBtn.classList.remove('btn-danger');
      topbarBtn.classList.add('btn-primary');
    }
  } else {
    labelShort = `🎁 Prueba (${days}d)`;
    labelLong = `🎁 Prueba: ${days} día(s)`;
    if (topbarBtn) {
      topbarBtn.classList.remove('btn-danger');
      topbarBtn.classList.add('btn-primary');
    }
  }

  if (sidebarBadge) sidebarBadge.textContent = labelLong;
  if (topbarText) topbarText.textContent = labelShort;
}

function openOnboardingWizard(stepNumber = 1) {
  const overlay = document.getElementById('onboardingOverlay');
  if (!overlay) return;

  // Pre-cargar valores actuales de configuración
  document.getElementById('onbBrandName').value = state.config.brandName || 'Dulce Repostería';
  document.getElementById('onbBrandEmoji').value = state.config.brandEmoji || '🧁';
  document.getElementById('onbBrandSlogan').value = state.config.brandSlogan || 'Pastelería Artesanal & Café';
  document.getElementById('onbBrandPhone').value = state.config.brandPhone || '';
  document.getElementById('onbColorPrimary').value = state.config.colorPrimary || '#c84b6b';
  document.getElementById('onbColorSecondary').value = state.config.colorSecondary || '#5c3d2e';
  document.getElementById('onbColorBg').value = state.config.colorBg || '#fdfaf7';
  document.getElementById('onbRateUSD').value = state.config.rateUSD || 4200;
  document.getElementById('onbRateBS').value = state.config.rateBS || 70;

  setOnboardingStep(stepNumber);
  overlay.classList.remove('hidden');
}

function setOnboardingStep(stepNumber) {
  [1, 2, 3].forEach((n) => {
    const stepEl = document.getElementById(`onbStep${n}`);
    const pillEl = document.getElementById(`onbStepIndicator${n}`);
    if (stepEl) stepEl.classList.toggle('hidden', n !== stepNumber);
    if (pillEl) pillEl.classList.toggle('active', n === stepNumber);
  });

  if (stepNumber === 3) {
    const nameVal = document.getElementById('onbBrandName').value.trim() || state.config.brandName;
    const sumName = document.getElementById('onbSummaryBrandName');
    if (sumName) sumName.textContent = nameVal;
  }
}

function saveOnboardingStep1Data() {
  const name = document.getElementById('onbBrandName').value.trim() || 'Dulce Repostería';
  const emoji = document.getElementById('onbBrandEmoji').value.trim() || '🧁';
  const slogan = document.getElementById('onbBrandSlogan').value.trim() || 'Pastelería, Postres y Café';
  const phone = document.getElementById('onbBrandPhone').value.trim();
  const cPrim = document.getElementById('onbColorPrimary').value || '#c84b6b';
  const cSec = document.getElementById('onbColorSecondary').value || '#5c3d2e';
  const cBg = document.getElementById('onbColorBg').value || '#fdfaf7';
  const rUSD = parseFloat(document.getElementById('onbRateUSD').value) || 4200;
  const rBS = parseFloat(document.getElementById('onbRateBS').value) || 70;

  state.config.brandName = name;
  state.config.brandEmoji = emoji;
  state.config.brandSlogan = slogan;
  state.config.brandPhone = phone;
  state.config.colorPrimary = cPrim;
  state.config.colorSecondary = cSec;
  state.config.colorBg = cBg;
  state.config.rateUSD = rUSD;
  state.config.rateBS = rBS;

  saveState();
  renderAll();
}

async function fetchBcvEuroRate() {
  const statusEl = document.getElementById('bcvEuroStatusText');
  if (statusEl) statusEl.textContent = '⏳ Consultando tasa oficial EURO (EUR) en BCV...';

  let rate = null;
  let updatedStr = null;

  // 1. Intentar desde API directa DolarApi Venezuela (Cotización Oficial Euro BCV)
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/cotizaciones/eur');
    if (res.ok) {
      const data = await res.json();
      const parsed = parseFloat(data.promedio || data.venta || data.compra);
      if (parsed > 0) {
        rate = Number(parsed.toFixed(2));
        updatedStr = data.fechaActualizacion
          ? new Date(data.fechaActualizacion).toLocaleDateString('es-VE')
          : 'Hoy';
      }
    }
  } catch (_) {}

  // 2. Fallback: Intentar mediante el endpoint de nuestro servidor local (/api/bcv-euro)
  if (!rate) {
    try {
      const res = await fetch(getApiUrl('/api/bcv-euro'));
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.rate > 0) {
          rate = Number(parseFloat(data.rate).toFixed(2));
          updatedStr = 'Hoy';
        }
      }
    } catch (_) {}
  }

  // 3. Fallback secundario: Dólar BCV oficial * paridad internacional EUR/USD
  if (!rate) {
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
          rate = Number((bcvUsd * eurToUsd).toFixed(2));
          updatedStr = 'Hoy';
        }
      }
    } catch (_) {}
  }

  if (rate && rate > 0) {
    state.membership.bcvEuroRate = rate;
    state.membership.bcvEuroUpdatedAt = new Date().toISOString();
    saveState();
    const inp = document.getElementById('bcvEuroRateInput');
    if (inp) inp.value = rate.toFixed(2);
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:var(--success);font-weight:700;">🟢 Tasa Oficial Euro BCV sincronizada (${updatedStr || 'En vivo'}): Bs. ${rate.toFixed(2)} / €</span>`;
    }
  } else {
    const fallbackRate = state.membership.bcvEuroRate || 52.50;
    const inp = document.getElementById('bcvEuroRateInput');
    if (inp) inp.value = Number(fallbackRate).toFixed(2);
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:var(--warning);font-weight:700;">⚠️ Usando última tasa Euro BCV guardada (puedes ajustarla manualmente)</span>`;
    }
  }

  updateMembershipBsCalculation();
}

function getMembershipAmountBs() {
  const inp = document.getElementById('bcvEuroRateInput');
  const rate = parseFloat(inp ? inp.value : state.membership.bcvEuroRate) || state.membership.bcvEuroRate || 52.50;
  return Number((SUBSCRIPTION_PRICE_USD * rate).toFixed(2));
}

function updateMembershipBsCalculation() {
  const inp = document.getElementById('bcvEuroRateInput');
  const rate = parseFloat(inp ? inp.value : state.membership.bcvEuroRate) || 52.50;
  state.membership.bcvEuroRate = rate;
  const totalBs = Number((SUBSCRIPTION_PRICE_USD * rate).toFixed(2));
  const formattedBs = `Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const disp1 = document.getElementById('bcvTotalBsDisplay');
  const disp2 = document.getElementById('pmRowAmountBs');
  const disp3 = document.getElementById('valModalAmountBs');

  if (disp1) disp1.textContent = formattedBs;
  if (disp2) disp2.textContent = formattedBs;
  if (disp3) disp3.textContent = formattedBs;
}

function openMembershipModal(forceLock = false) {
  const modal = document.getElementById('modalMembership');
  if (!modal) return;

  const expired = isMembershipExpired() || forceLock;
  const days = getMembershipRemainingDays();

  const banner = document.getElementById('membershipStatusBanner');
  const titleEl = document.getElementById('memBannerTitle');
  const subEl = document.getElementById('memBannerSub');
  const badgeEl = document.getElementById('memBannerBadge');
  const btnCloseTop = document.getElementById('btnCloseMembershipModal');
  const btnCloseFoot = document.getElementById('btnCloseMembershipFooter');

  if (expired) {
    banner.classList.add('expired');
    titleEl.textContent = '⚠️ Período de Prueba / Membresía Finalizado';
    subEl.textContent = 'Realiza tu Pago Móvil de $20 (a tasa Euro BCV) y valida la referencia para continuar.';
    badgeEl.className = 'status-badge cancelado';
    badgeEl.textContent = 'VENCIDO';
    if (btnCloseTop) btnCloseTop.classList.add('hidden');
    if (btnCloseFoot) btnCloseFoot.classList.add('hidden');
  } else if (state.membership.status === 'active') {
    banner.classList.remove('expired');
    titleEl.textContent = '💎 Membresía Mensual Activa';
    subEl.textContent = `Tu suscripción está al día. Te quedan ${days} día(s) activos.`;
    badgeEl.className = 'status-badge entregado';
    badgeEl.textContent = 'ACTIVA';
    if (btnCloseTop) btnCloseTop.classList.remove('hidden');
    if (btnCloseFoot) btnCloseFoot.classList.remove('hidden');
  } else {
    banner.classList.remove('expired');
    titleEl.textContent = '🎁 Período de Prueba Gratis Activo (7 Días)';
    subEl.textContent = `Disfruta tu prueba gratuita. Te quedan ${days} día(s) antes del corte mensual ($20).`;
    badgeEl.className = 'status-badge entregado';
    badgeEl.textContent = `${days} DÍAS GRATIS`;
    if (btnCloseTop) btnCloseTop.classList.remove('hidden');
    if (btnCloseFoot) btnCloseFoot.classList.remove('hidden');
  }

  const inp = document.getElementById('bcvEuroRateInput');
  if (inp) inp.value = Number(state.membership.bcvEuroRate || 52.50).toFixed(2);
  updateMembershipBsCalculation();

  modal.classList.remove('hidden');
  fetchBcvEuroRate();
}

async function copyTextToClipboard(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`📋 Copiado al portapapeles: ${label}`);
  } catch (_) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast(`📋 Copiado al portapapeles: ${label}`);
  }
}

function initOnboardingAndMembershipEvents() {
  // Selectores de color en vivo dentro del Paso 1 del Onboarding
  document.querySelectorAll('.onb-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.p;
      const s = btn.dataset.s;
      const b = btn.dataset.b;
      document.getElementById('onbColorPrimary').value = p;
      document.getElementById('onbColorSecondary').value = s;
      document.getElementById('onbColorBg').value = b;
      applyThemeColors(p, s, b);
    });
  });

  ['onbColorPrimary', 'onbColorSecondary', 'onbColorBg'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        applyThemeColors(
          document.getElementById('onbColorPrimary').value,
          document.getElementById('onbColorSecondary').value,
          document.getElementById('onbColorBg').value
        );
      });
    }
  });

  // Navegación entre los 3 pasos del Onboarding
  const btnStep2 = document.getElementById('btnOnbNextToStep2');
  if (btnStep2) {
    btnStep2.addEventListener('click', () => {
      saveOnboardingStep1Data();
      setOnboardingStep(2);
    });
  }

  const btnBack1 = document.getElementById('btnOnbBackToStep1');
  if (btnBack1) btnBack1.addEventListener('click', () => setOnboardingStep(1));

  const btnStep3 = document.getElementById('btnOnbNextToStep3');
  if (btnStep3) btnStep3.addEventListener('click', () => setOnboardingStep(3));

  const btnBack2 = document.getElementById('btnOnbBackToStep2');
  if (btnBack2) btnBack2.addEventListener('click', () => setOnboardingStep(2));

  // Selector interactivo de módulos dentro del Paso 2 (Tutorial)
  document.querySelectorAll('#tutorialModulesNav .tut-mod-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#tutorialModulesNav .tut-mod-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tut;
      ['pos', 'pedidos', 'inventario', 'corte', 'usuarios'].forEach((mod) => {
        const box = document.getElementById(`tutContent-${mod}`);
        if (box) box.classList.toggle('hidden', mod !== target);
      });
    });
  });

  // Finalizar Onboarding y activar los 7 días de prueba gratis
  const btnFinish = document.getElementById('btnFinishOnboarding');
  if (btnFinish) {
    btnFinish.addEventListener('click', () => {
      saveOnboardingStep1Data();
      if (!state.membership.onboardingCompleted || !state.membership.expiresAt) {
        state.membership.onboardingCompleted = true;
        state.membership.status = 'trial';
        state.membership.trialStartDate = new Date().toISOString();
        state.membership.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
      saveState();
      renderAll();
      document.getElementById('onboardingOverlay').classList.add('hidden');
      showToast('🎉 ¡Bienvenido! Se han activado tus 7 días de prueba gratis.');
    });
  }

  // Botones para abrir el Tutorial o la ventana de Membresía en cualquier momento
  ['btnOpenTutorialTopbar', 'btnOpenTutorialSidebar'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        closeMobileSidebar();
        openOnboardingWizard(1);
      });
    }
  });

  ['btnOpenMembershipTopbar', 'btnOpenMembershipSidebar'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        closeMobileSidebar();
        openMembershipModal(false);
      });
    }
  });

  // Eventos de Tasa BCV Euro y Copiado de Datos de Pago Móvil
  const btnRefreshBcv = document.getElementById('btnRefreshBcvEuro');
  if (btnRefreshBcv) btnRefreshBcv.addEventListener('click', fetchBcvEuroRate);

  const inpBcvEuro = document.getElementById('bcvEuroRateInput');
  if (inpBcvEuro) inpBcvEuro.addEventListener('input', updateMembershipBsCalculation);

  document.querySelectorAll('.pm-copy-btn[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.copy;
      copyTextToClipboard(val, val);
    });
  });

  const btnCopyBs = document.getElementById('btnCopyExactBs');
  if (btnCopyBs) {
    btnCopyBs.addEventListener('click', () => {
      const bsVal = getMembershipAmountBs().toFixed(2);
      copyTextToClipboard(bsVal, `Bs. ${bsVal}`);
    });
  }

  const btnCopyAll = document.getElementById('btnCopyAllPagoMovil');
  if (btnCopyAll) {
    btnCopyAll.addEventListener('click', () => {
      const bsVal = getMembershipAmountBs().toFixed(2);
      const fullText = `Pago Móvil\nBanco: ${PAGO_MOVIL_DATA.bank} (${PAGO_MOVIL_DATA.bankName})\nTeléfono: ${PAGO_MOVIL_DATA.phone}\nCédula: ${PAGO_MOVIL_DATA.cedula}\nMonto: ${bsVal} Bs ($20 a Tasa Euro BCV)`;
      copyTextToClipboard(fullText, 'Todos los datos de Pago Móvil');
    });
  }

  // Botón "Pagar / Validar Referencia" -> Abre la ventana de validación de últimos dígitos
  const btnOpenValWin = document.getElementById('btnOpenValidatePaymentWindow');
  if (btnOpenValWin) {
    btnOpenValWin.addEventListener('click', () => {
      updateMembershipBsCalculation();
      document.getElementById('paymentRefDigitsInput').value = '';
      openModal('modalValidatePayment');
      setTimeout(() => document.getElementById('paymentRefDigitsInput').focus(), 120);
    });
  }

  const btnBackMem = document.getElementById('btnBackToMembershipModal');
  if (btnBackMem) {
    btnBackMem.addEventListener('click', () => {
      closeModal('modalValidatePayment');
    });
  }

  // Validar Pago con los últimos dígitos de la referencia
  const formVal = document.getElementById('formValidatePagoMovil');
  if (formVal) {
    formVal.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawRef = (document.getElementById('paymentRefDigitsInput').value || '').replace(/[^0-9]/g, '');
      if (rawRef.length < 4) {
        showToast('⚠️ Ingresa al menos los últimos 4 dígitos numéricos de la referencia');
        return;
      }

      const amountBs = getMembershipAmountBs();
      const rateUsed = state.membership.bcvEuroRate || 52.50;

      state.membership.status = 'active';
      state.membership.onboardingCompleted = true;
      state.membership.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      state.membership.payments = state.membership.payments || [];
      state.membership.payments.unshift({
        id: 'pay_' + Date.now(),
        timestamp: new Date().toISOString(),
        refDigits: rawRef,
        amountUSD: SUBSCRIPTION_PRICE_USD,
        rateEurBcv: rateUsed,
        amountBs
      });

      logUserAction(`Validó Pago Móvil de Membresía ($20 / Bs. ${amountBs.toFixed(2)}) - Ref: #${rawRef}`);
      saveState();
      renderAll();

      closeModal('modalValidatePayment');
      closeModal('modalMembership');
      showToast(`✅ ¡Pago validado (Ref #${rawRef})! Tu membresía está activa por 30 días.`);
    });
  }

  // Botón para probar cómo luce cuando se vencen los 7 días de prueba
  const btnSimExp = document.getElementById('btnSimulateTrialExpired');
  if (btnSimExp) {
    btnSimExp.addEventListener('click', () => {
      state.membership.status = 'expired';
      state.membership.expiresAt = new Date(Date.now() - 86400000).toISOString();
      saveState();
      renderAll();
      openMembershipModal(true);
      showToast('🧪 Simulación activada: Período de 7 días vencido. Valida una referencia para reactivar.');
    });
  }
}
