/* ============================================
   VoltVan Build Wizard
   ============================================ */
const Wizard = (() => {
  'use strict';

  /* ---------- Data ---------- */
  const STEPS = [
    { id: 'vehicle', label: 'wiz_s1' },
    { id: 'interior', label: 'wiz_s2' },
    { id: 'finish', label: 'wiz_s3' },
    { id: 'power', label: 'wiz_s4' },
    { id: 'mobility', label: 'wiz_s5' },
    { id: 'delivery', label: 'wiz_s6' },
  ];

  const VEHICLES = [
    { key: 'mid', name: 'wiz_v_mid', desc: 'wiz_v_mid_d', price: 8000 },
    { key: 'lwb', name: 'wiz_v_lwb', desc: 'wiz_v_lwb_d', price: 12000 },
    { key: 'bus', name: 'wiz_v_bus', desc: 'wiz_v_bus_d', price: 18000 },
  ];

  const TEMPLATES = [
    { key: 'open', name: 'wiz_t_open', desc: 'wiz_t_open_d' },
    { key: 'split', name: 'wiz_t_split', desc: 'wiz_t_split_d' },
    { key: 'studio', name: 'wiz_t_studio', desc: 'wiz_t_studio_d' },
  ];

  const ELEMENTS = [
    { key: 'desk', name: 'wiz_e_desk', price: 1200 },
    { key: 'bed', name: 'wiz_e_bed', price: 1800 },
    { key: 'plants', name: 'wiz_e_plants', price: 600 },
    { key: 'kitchen', name: 'wiz_e_kitchen', price: 2400 },
    { key: 'chair', name: 'wiz_e_chair', price: 900 },
    { key: 'skylight', name: 'wiz_e_skylight', price: 1500 },
    { key: 'led', name: 'wiz_e_led', price: 400 },
    { key: 'sound', name: 'wiz_e_sound', price: 800 },
  ];

  const FINISHES = [
    { key: 'util', name: 'wiz_f_util', desc: 'wiz_f_util_d', price: 3000 },
    { key: 'prem', name: 'wiz_f_prem', desc: 'wiz_f_prem_d', price: 8500 },
    { key: 'exec', name: 'wiz_f_exec', desc: 'wiz_f_exec_d', price: 16000 },
  ];

  const POWERS = [
    { key: 'aux', name: 'wiz_p_aux', desc: 'wiz_p_aux_d', price: 2500 },
    { key: 'solar', name: 'wiz_p_solar', desc: 'wiz_p_solar_d', price: 6500 },
    { key: 'study', name: 'wiz_p_study', desc: 'wiz_p_study_d', price: 12000 },
    { key: 'full', name: 'wiz_p_full', desc: 'wiz_p_full_d', price: 35000 },
  ];

  const MOBILITY = [
    { key: 'road', name: 'wiz_m_road', desc: 'wiz_m_road_d', price: 0 },
    { key: 'adv', name: 'wiz_m_adv', desc: 'wiz_m_adv_d', price: 3500 },
    { key: '4x4', name: 'wiz_m_4x4', desc: 'wiz_m_4x4_d', price: 9000 },
  ];

  const DELIVERY = [
    { key: 'std', name: 'wiz_d_std', desc: 'wiz_d_std_d', mult: 1.0, tag: '' },
    { key: 'pri', name: 'wiz_d_pri', desc: 'wiz_d_pri_d', mult: 1.15, tag: '+15%' },
    { key: 'exp', name: 'wiz_d_exp', desc: 'wiz_d_exp_d', mult: 1.35, tag: '+35%' },
  ];

  /* ---------- State ---------- */
  const state = {
    step: 0,
    view: 'rear',
    vehicle: 'mid',
    template: 'open',
    elements: new Set(),
    finish: 'util',
    power: 'aux',
    mobility: 'road',
    delivery: 'std',
  };

  /* ---------- Helpers ---------- */
  const getLang = () =>
    (typeof currentLang !== 'undefined' ? currentLang : null)
    || localStorage.getItem('vw_lang') || 'en';

  const t = (key) => {
    const lang = getLang();
    return (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  };

  const CURRENCY = { en: { sym: '£', loc: 'en-GB', rate: 1 }, es: { sym: '€', loc: 'es-ES', rate: 1.17 } };

  const fmtPrice = (p) => {
    const c = CURRENCY[getLang()] || CURRENCY.en;
    const converted = Math.round(p * c.rate);
    return c.sym + converted.toLocaleString(c.loc);
  };

  const calcTotal = () => {
    const veh = VEHICLES.find(v => v.key === state.vehicle)?.price || 0;
    const fin = FINISHES.find(f => f.key === state.finish)?.price || 0;
    const pow = POWERS.find(p => p.key === state.power)?.price || 0;
    const mob = MOBILITY.find(m => m.key === state.mobility)?.price || 0;
    let elems = 0;
    state.elements.forEach(k => { elems += ELEMENTS.find(e => e.key === k)?.price || 0; });
    const deliv = DELIVERY.find(d => d.key === state.delivery)?.mult || 1;
    return (veh + fin + pow + mob + elems) * deliv;
  };

  /* ---------- Render helpers ---------- */
  const radioGroup = (items, selected, hasDesc, priceField) =>
    `<div class="wiz__options">${items.map(it => {
      const sel = it.key === selected ? ' selected' : '';
      const price = priceField ? `<span class="wiz__opt-price">${it[priceField] !== undefined ? (typeof it[priceField] === 'number' ? fmtPrice(it[priceField]) : it[priceField]) : ''}</span>` : '';
      const desc = hasDesc && it.desc ? `<div class="wiz__opt-desc">${t(it.desc)}</div>` : '';
      return `<div class="wiz__opt${sel}" data-key="${it.key}"><div class="wiz__opt-radio"></div><div class="wiz__opt-info"><div class="wiz__opt-name">${t(it.name)}</div>${desc}</div>${price}</div>`;
    }).join('')}</div>`;

  const checkGroup = (items, selected) =>
    `<div class="wiz__checks">${items.map(it => {
      const sel = selected.has(it.key) ? ' selected' : '';
      return `<div class="wiz__chk${sel}" data-key="${it.key}"><div class="wiz__chk-box"><svg viewBox="0 0 12 12" fill="none" stroke="#0a0a0a" stroke-width="2"><path d="M2 6l3 3 5-5"/></svg></div><span class="wiz__chk-name">${t(it.name)}</span><span class="wiz__chk-price">+${fmtPrice(it.price)}</span></div>`;
    }).join('')}</div>`;

  /* ---------- Step renderers ---------- */
  const renderStep = () => {
    const wrap = document.getElementById('wizSteps');
    let html = '';

    switch (state.step) {
      case 0:
        html = `<div class="wiz__step active">
          <h3 class="wiz__step-title">${t('wiz_s1_title')}</h3>
          <p class="wiz__step-desc">${t('wiz_s1_desc')}</p>
          ${radioGroup(VEHICLES, state.vehicle, true, 'price')}
          ${navButtons()}
        </div>`;
        break;
      case 1:
        html = `<div class="wiz__step active">
          <h3 class="wiz__step-title">${t('wiz_s2_title')}</h3>
          <div class="wiz__sub-label">${t('wiz_s2_tmpl')}</div>
          ${radioGroup(TEMPLATES, state.template, true)}
          <div class="wiz__sub-label">${t('wiz_s2_elem')}</div>
          ${checkGroup(ELEMENTS, state.elements)}
          ${navButtons()}
        </div>`;
        break;
      case 2:
        html = `<div class="wiz__step active">
          <h3 class="wiz__step-title">${t('wiz_s3_title')}</h3>
          <p class="wiz__step-desc">${t('wiz_s3_desc')}</p>
          ${radioGroup(FINISHES, state.finish, true, 'price')}
          ${navButtons()}
        </div>`;
        break;
      case 3:
        html = `<div class="wiz__step active">
          <h3 class="wiz__step-title">${t('wiz_s4_title')}</h3>
          <p class="wiz__step-desc">${t('wiz_s4_desc')}</p>
          ${radioGroup(POWERS, state.power, true, 'price')}
          ${navButtons()}
        </div>`;
        break;
      case 4:
        html = `<div class="wiz__step active">
          <h3 class="wiz__step-title">${t('wiz_s5_title')}</h3>
          <p class="wiz__step-desc">${t('wiz_s5_desc')}</p>
          ${radioGroup(MOBILITY, state.mobility, true, 'price')}
          ${navButtons()}
        </div>`;
        break;
      case 5:
        html = `<div class="wiz__step active">
          <h3 class="wiz__step-title">${t('wiz_s6_title')}</h3>
          <p class="wiz__step-desc">${t('wiz_s6_desc')}</p>
          ${radioGroup(DELIVERY, state.delivery, true, 'tag')}
          ${navButtons(true)}
        </div>`;
        break;
    }

    wrap.innerHTML = html;
    bindStepEvents();
    updateProgress();
    updatePrice();
    renderSVG();
  };

  const navButtons = (last) => {
    const back = state.step > 0
      ? `<button class="btn btn--ghost wiz__btn-back">${t('wiz_back')}</button>` : '';
    const next = last
      ? `<button class="btn btn--primary wiz__btn-quote"><span>${t('wiz_quote')}</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>`
      : `<button class="btn btn--primary wiz__btn-next">${t('wiz_next')}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>`;
    return `<div class="wiz__nav">${back}${next}</div>`;
  };

  /* ---------- Events ---------- */
  const bindStepEvents = () => {
    const wrap = document.getElementById('wizSteps');

    wrap.querySelectorAll('.wiz__opt').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.dataset.key;
        const group = el.closest('.wiz__options');
        group.querySelectorAll('.wiz__opt').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');

        switch (state.step) {
          case 0: state.vehicle = key; break;
          case 1: state.template = key; break;
          case 2: state.finish = key; break;
          case 3: state.power = key; break;
          case 4: state.mobility = key; break;
          case 5: state.delivery = key; break;
        }
        updatePrice();
        renderSVG();
      });
    });

    wrap.querySelectorAll('.wiz__chk').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.dataset.key;
        if (state.elements.has(key)) { state.elements.delete(key); el.classList.remove('selected'); }
        else { state.elements.add(key); el.classList.add('selected'); }
        updatePrice();
        renderSVG();
      });
    });

    const backBtn = wrap.querySelector('.wiz__btn-back');
    const nextBtn = wrap.querySelector('.wiz__btn-next');
    const quoteBtn = wrap.querySelector('.wiz__btn-quote');

    if (backBtn) backBtn.addEventListener('click', () => { state.step--; renderStep(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { state.step++; renderStep(); });
    if (quoteBtn) quoteBtn.addEventListener('click', submitQuote);
  };

  /* ---------- Progress bar ---------- */
  const updateProgress = () => {
    const wrap = document.getElementById('wizProgress');
    wrap.innerHTML = STEPS.map((s, i) => {
      const cls = i < state.step ? 'done' : i === state.step ? 'active' : '';
      return `<div class="wiz__prog-step ${cls}" data-idx="${i}"><div class="wiz__prog-bar"></div><span class="wiz__prog-label">${t(s.label)}</span></div>`;
    }).join('');

    wrap.querySelectorAll('.wiz__prog-step').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx, 10);
        if (idx <= state.step) { state.step = idx; renderStep(); }
      });
    });
  };

  /* ---------- Price ---------- */
  const updatePrice = () => {
    const el = document.getElementById('wizPriceVal');
    el.textContent = fmtPrice(calcTotal());
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 200);
  };

  /* ---------- View toggle ---------- */
  const initViewToggle = () => {
    document.querySelector('.wiz__view-toggle').addEventListener('click', (e) => {
      const btn = e.target.closest('.wiz__view-btn');
      if (!btn) return;
      state.view = btn.dataset.view;
      document.querySelectorAll('.wiz__view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
      renderSVG();
    });
  };

  /* ---------- SVG Renderer ---------- */
  const PALETTES = {
    util: { wall: '#3a3a40', floor: '#2a2a2e', accent: '#5a5a62', wood: '#4a4a50' },
    prem: { wall: '#5c4a38', floor: '#3e3228', accent: '#8b7355', wood: '#7a6248' },
    exec: { wall: '#3d2e22', floor: '#2a1f18', accent: '#6b4f3a', wood: '#5c3d28' },
  };

  const renderSVG = () => {
    const wrap = document.getElementById('wizSvg');
    if (state.view === 'rear') wrap.innerHTML = svgRear();
    else wrap.innerHTML = svgSide();
  };

  const svgRear = () => {
    const p = PALETTES[state.finish] || PALETTES.util;
    const vw = state.vehicle;
    const w = vw === 'mid' ? 220 : vw === 'lwb' ? 260 : 300;
    const h = vw === 'mid' ? 180 : vw === 'lwb' ? 200 : 220;
    const ox = (400 - w) / 2;
    const oy = 300 - h - 30;

    let interior = '';

    if (state.elements.has('desk')) {
      interior += `<rect x="${ox + 30}" y="${oy + h - 60}" width="${w - 60}" height="6" rx="2" fill="${p.wood}" opacity="0.9"/>
        <rect x="${ox + w / 2 - 3}" y="${oy + h - 90}" width="6" height="34" rx="2" fill="${p.accent}"/>`;
    }
    if (state.elements.has('bed')) {
      interior += `<rect x="${ox + 20}" y="${oy + h - 45}" width="${w - 40}" height="14" rx="4" fill="${p.accent}" opacity="0.7"/>
        <rect x="${ox + 22}" y="${oy + h - 43}" width="${w - 44}" height="10" rx="3" fill="${p.wall}" opacity="0.5"/>`;
    }
    if (state.elements.has('plants')) {
      interior += `<circle cx="${ox + 40}" cy="${oy + 50}" r="12" fill="#2d5a2d" opacity="0.8"/>
        <circle cx="${ox + 48}" cy="${oy + 42}" r="8" fill="#3d7a3d" opacity="0.7"/>
        <rect x="${ox + 36}" y="${oy + 58}" width="8" height="12" rx="2" fill="${p.accent}"/>`;
    }
    if (state.elements.has('kitchen')) {
      interior += `<rect x="${ox + w - 55}" y="${oy + h - 80}" width="35" height="50" rx="3" fill="${p.accent}" opacity="0.6"/>
        <circle cx="${ox + w - 44}" cy="${oy + h - 68}" r="5" fill="none" stroke="${p.wall}" stroke-width="1.5"/>
        <circle cx="${ox + w - 32}" cy="${oy + h - 68}" r="4" fill="none" stroke="${p.wall}" stroke-width="1.5"/>`;
    }
    if (state.elements.has('chair')) {
      interior += `<ellipse cx="${ox + w / 2}" cy="${oy + h - 55}" rx="14" ry="10" fill="${p.wood}" opacity="0.7"/>
        <rect x="${ox + w / 2 - 2}" y="${oy + h - 48}" width="4" height="16" rx="2" fill="${p.accent}"/>`;
    }
    if (state.elements.has('led')) {
      interior += `<line x1="${ox + 15}" y1="${oy + 12}" x2="${ox + w - 15}" y2="${oy + 12}" stroke="${state.finish === 'exec' ? '#ffcc66' : '#c8ff00'}" stroke-width="2" opacity="0.5"/>
        <line x1="${ox + 15}" y1="${oy + h - 8}" x2="${ox + w - 15}" y2="${oy + h - 8}" stroke="${state.finish === 'exec' ? '#ffcc66' : '#c8ff00'}" stroke-width="2" opacity="0.35"/>`;
    }
    if (state.elements.has('sound')) {
      interior += `<pattern id="wiz-ins" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${p.wall}"/><circle cx="4" cy="4" r="1" fill="${p.accent}" opacity="0.3"/></pattern>
        <rect x="${ox + 8}" y="${oy + 8}" width="${w - 16}" height="${h - 16}" rx="4" fill="url(#wiz-ins)" opacity="0.3"/>`;
    }

    let skylight = '';
    if (state.elements.has('skylight')) {
      skylight = `<rect x="${ox + w / 2 - 25}" y="${oy - 6}" width="50" height="8" rx="3" fill="#4488aa" opacity="0.5"/>`;
    }

    const mob = state.mobility;
    const wheelY = oy + h + 8;
    const liftOff = mob === 'road' ? 0 : mob === 'adv' ? 6 : 12;
    const wheelR = mob === '4x4' ? 16 : 13;

    let powerExt = '';
    if (state.power === 'solar' || state.power === 'full') {
      powerExt = `<rect x="${ox + 20}" y="${oy - 14}" width="${w - 40}" height="8" rx="2" fill="#334466" opacity="0.6"/>
        <line x1="${ox + 30}" y1="${oy - 10}" x2="${ox + w - 30}" y2="${oy - 10}" stroke="#5588bb" stroke-width="0.5" opacity="0.5"/>`;
    }
    if (state.power === 'full') {
      powerExt += `<text x="${ox + w / 2}" y="${oy + h + 25 - liftOff}" text-anchor="middle" fill="#c8ff00" font-size="9" font-family="monospace" opacity="0.6">EV</text>`;
    }

    let mobExtra = '';
    if (mob === '4x4') {
      mobExtra = `<rect x="${ox - 6}" y="${oy + 20}" width="6" height="30" rx="2" fill="#555" opacity="0.5"/>`;
    }

    return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <rect x="${ox}" y="${oy - liftOff}" width="${w}" height="${h}" rx="10" fill="#1a1a20" stroke="#333" stroke-width="1.5"/>
      <!-- Interior back -->
      <rect x="${ox + 6}" y="${oy + 6 - liftOff}" width="${w - 12}" height="${h - 12}" rx="6" fill="${p.floor}"/>
      <!-- Walls -->
      <rect x="${ox + 6}" y="${oy + 6 - liftOff}" width="8" height="${h - 12}" rx="2" fill="${p.wall}"/>
      <rect x="${ox + w - 14}" y="${oy + 6 - liftOff}" width="8" height="${h - 12}" rx="2" fill="${p.wall}"/>
      <rect x="${ox + 6}" y="${oy + 6 - liftOff}" width="${w - 12}" height="8" rx="2" fill="${p.wall}"/>
      <!-- Doors (open) -->
      <rect x="${ox - 18}" y="${oy + 5 - liftOff}" width="16" height="${h - 10}" rx="3" fill="#1a1a20" stroke="#333" stroke-width="1" transform="rotate(-12 ${ox - 2} ${oy + h / 2 - liftOff})"/>
      <rect x="${ox + w + 2}" y="${oy + 5 - liftOff}" width="16" height="${h - 10}" rx="3" fill="#1a1a20" stroke="#333" stroke-width="1" transform="rotate(12 ${ox + w + 2} ${oy + h / 2 - liftOff})"/>
      <!-- Interior elements -->
      <g transform="translate(0,${-liftOff})">${interior}</g>
      ${skylight ? `<g transform="translate(0,${-liftOff})">${skylight}</g>` : ''}
      ${powerExt ? `<g transform="translate(0,${-liftOff})">${powerExt}</g>` : ''}
      ${mobExtra ? `<g transform="translate(0,${-liftOff})">${mobExtra}</g>` : ''}
      <!-- Wheels -->
      <circle cx="${ox + 25}" cy="${wheelY - liftOff}" r="${wheelR}" fill="#222" stroke="#444" stroke-width="2"/>
      <circle cx="${ox + 25}" cy="${wheelY - liftOff}" r="${wheelR - 5}" fill="#333"/>
      <circle cx="${ox + w - 25}" cy="${wheelY - liftOff}" r="${wheelR}" fill="#222" stroke="#444" stroke-width="2"/>
      <circle cx="${ox + w - 25}" cy="${wheelY - liftOff}" r="${wheelR - 5}" fill="#333"/>
      <!-- Ground line -->
      <line x1="40" y1="${wheelY + wheelR + 2 - liftOff}" x2="360" y2="${wheelY + wheelR + 2 - liftOff}" stroke="#222" stroke-width="1"/>
    </svg>`;
  };

  const svgSide = () => {
    const p = PALETTES[state.finish] || PALETTES.util;
    const vw = state.vehicle;
    const bw = vw === 'mid' ? 260 : vw === 'lwb' ? 310 : 350;
    const bh = vw === 'mid' ? 120 : vw === 'lwb' ? 130 : 145;
    const cabW = 60;
    const ox = (400 - bw - cabW) / 2;
    const oy = 280 - bh - 40;

    const mob = state.mobility;
    const liftOff = mob === 'road' ? 0 : mob === 'adv' ? 5 : 10;
    const wheelR = mob === '4x4' ? 16 : 13;
    const wheelY = oy + bh + 6 - liftOff;

    let interior = '';
    const ix = ox + cabW + 8;
    const iw = bw - 16;
    const iy = oy + 10 - liftOff;
    const ih = bh - 20;

    if (state.elements.has('desk')) {
      interior += `<rect x="${ix + 20}" y="${iy + ih - 35}" width="50" height="4" rx="1" fill="${p.wood}"/>
        <rect x="${ix + 43}" y="${iy + ih - 55}" width="4" height="24" rx="1" fill="${p.accent}"/>`;
    }
    if (state.elements.has('bed')) {
      interior += `<rect x="${ix + iw - 70}" y="${iy + ih - 25}" width="60" height="12" rx="3" fill="${p.accent}" opacity="0.7"/>`;
    }
    if (state.elements.has('plants')) {
      interior += `<circle cx="${ix + 10}" cy="${iy + 25}" r="8" fill="#2d5a2d" opacity="0.7"/>
        <rect x="${ix + 7}" y="${iy + 31}" width="6" height="8" rx="1" fill="${p.accent}"/>`;
    }
    if (state.elements.has('kitchen')) {
      interior += `<rect x="${ix + iw - 35}" y="${iy + ih - 50}" width="28" height="38" rx="2" fill="${p.accent}" opacity="0.5"/>`;
    }
    if (state.elements.has('chair')) {
      interior += `<ellipse cx="${ix + 55}" cy="${iy + ih - 28}" rx="10" ry="7" fill="${p.wood}" opacity="0.6"/>
        <rect x="${ix + 50}" y="${iy + ih - 45}" width="10" height="20" rx="3" fill="${p.wood}" opacity="0.4"/>`;
    }
    if (state.elements.has('led')) {
      interior += `<line x1="${ix + 5}" y1="${iy + 5}" x2="${ix + iw - 5}" y2="${iy + 5}" stroke="#c8ff00" stroke-width="1.5" opacity="0.4"/>`;
    }
    if (state.elements.has('skylight')) {
      interior += `<rect x="${ix + iw / 2 - 18}" y="${iy - 4}" width="36" height="5" rx="2" fill="#4488aa" opacity="0.4"/>`;
    }

    let solarPanel = '';
    if (state.power === 'solar' || state.power === 'full') {
      solarPanel = `<rect x="${ox + cabW + 15}" y="${oy - 6 - liftOff}" width="${bw - 30}" height="6" rx="2" fill="#334466" opacity="0.6"/>`;
    }

    let evBadge = '';
    if (state.power === 'full') {
      evBadge = `<text x="${ox + cabW / 2}" y="${wheelY + 22}" text-anchor="middle" fill="#c8ff00" font-size="9" font-family="monospace" opacity="0.6">EV</text>`;
    }

    let snorkel = '';
    if (mob === '4x4') {
      snorkel = `<rect x="${ox + cabW - 4}" y="${oy - 20 - liftOff}" width="4" height="25" rx="1" fill="#555"/>`;
    }

    const windows = `<rect x="${ox + cabW + 15}" y="${oy + 12 - liftOff}" width="30" height="22" rx="3" fill="#1c2838" opacity="0.6"/>
      <rect x="${ox + cabW + 55}" y="${oy + 12 - liftOff}" width="30" height="22" rx="3" fill="#1c2838" opacity="0.6"/>
      ${bw > 280 ? `<rect x="${ox + cabW + 95}" y="${oy + 12 - liftOff}" width="30" height="22" rx="3" fill="#1c2838" opacity="0.6"/>` : ''}`;

    return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <rect x="${ox + cabW}" y="${oy - liftOff}" width="${bw}" height="${bh}" rx="6" fill="#1a1a20" stroke="#333" stroke-width="1.5"/>
      <!-- Cab -->
      <path d="M${ox + cabW} ${oy - liftOff} L${ox + cabW} ${oy + bh - liftOff} L${ox} ${oy + bh - liftOff} L${ox} ${oy + 25 - liftOff} Q${ox} ${oy - liftOff} ${ox + 20} ${oy - liftOff} Z" fill="#1a1a20" stroke="#333" stroke-width="1.5"/>
      <!-- Windshield -->
      <path d="M${ox + 6} ${oy + 22 - liftOff} Q${ox + 6} ${oy + 6 - liftOff} ${ox + 22} ${oy + 6 - liftOff} L${ox + cabW - 4} ${oy + 6 - liftOff} L${ox + cabW - 4} ${oy + 35 - liftOff} Z" fill="#1c2838" opacity="0.5"/>
      <!-- Interior cutaway -->
      <rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="4" fill="${p.floor}" opacity="0.85"/>
      ${interior}
      ${windows}
      ${solarPanel}
      ${snorkel}
      ${evBadge}
      <!-- Wheels -->
      <circle cx="${ox + 30}" cy="${wheelY}" r="${wheelR}" fill="#222" stroke="#444" stroke-width="2"/>
      <circle cx="${ox + 30}" cy="${wheelY}" r="${wheelR - 5}" fill="#333"/>
      <circle cx="${ox + cabW + bw - 30}" cy="${wheelY}" r="${wheelR}" fill="#222" stroke="#444" stroke-width="2"/>
      <circle cx="${ox + cabW + bw - 30}" cy="${wheelY}" r="${wheelR - 5}" fill="#333"/>
      <!-- Ground -->
      <line x1="20" y1="${wheelY + wheelR + 2}" x2="380" y2="${wheelY + wheelR + 2}" stroke="#222" stroke-width="1"/>
    </svg>`;
  };

  /* ---------- Quote CTA ---------- */
  const submitQuote = () => {
    const veh = VEHICLES.find(v => v.key === state.vehicle);
    const tmpl = TEMPLATES.find(x => x.key === state.template);
    const fin = FINISHES.find(f => f.key === state.finish);
    const pow = POWERS.find(p => p.key === state.power);
    const mob = MOBILITY.find(m => m.key === state.mobility);
    const del = DELIVERY.find(d => d.key === state.delivery);
    const elemNames = [...state.elements].map(k => t(ELEMENTS.find(e => e.key === k)?.name || k));

    const lines = [
      `Vehicle: ${t(veh.name)}`,
      `Layout: ${t(tmpl.name)}`,
      elemNames.length ? `Elements: ${elemNames.join(', ')}` : null,
      `Finish: ${t(fin.name)}`,
      `Power: ${t(pow.name)}`,
      `Mobility: ${t(mob.name)}`,
      `Delivery: ${t(del.name)}`,
      `Estimated total: ${fmtPrice(calcTotal())}`,
    ].filter(Boolean).join('\n');

    const interest = document.getElementById('serviceSelect');
    if (interest) interest.value = 'full';
    const msg = document.getElementById('message');
    if (msg) msg.value = `--- ${t('wiz_summary')} ---\n${lines}\n\n`;

    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ---------- Init ---------- */
  const init = () => {
    renderStep();
    initViewToggle();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { state, renderStep, calcTotal };
})();
