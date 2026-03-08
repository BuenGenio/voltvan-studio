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
    return c.sym + Math.round(p * c.rate).toLocaleString(c.loc);
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
        html = `<div class="wiz__step active"><h3 class="wiz__step-title">${t('wiz_s1_title')}</h3><p class="wiz__step-desc">${t('wiz_s1_desc')}</p>${radioGroup(VEHICLES, state.vehicle, true, 'price')}${navButtons()}</div>`;
        break;
      case 1:
        html = `<div class="wiz__step active"><h3 class="wiz__step-title">${t('wiz_s2_title')}</h3><div class="wiz__sub-label">${t('wiz_s2_tmpl')}</div>${radioGroup(TEMPLATES, state.template, true)}<div class="wiz__sub-label">${t('wiz_s2_elem')}</div>${checkGroup(ELEMENTS, state.elements)}${navButtons()}</div>`;
        break;
      case 2:
        html = `<div class="wiz__step active"><h3 class="wiz__step-title">${t('wiz_s3_title')}</h3><p class="wiz__step-desc">${t('wiz_s3_desc')}</p>${radioGroup(FINISHES, state.finish, true, 'price')}${navButtons()}</div>`;
        break;
      case 3:
        html = `<div class="wiz__step active"><h3 class="wiz__step-title">${t('wiz_s4_title')}</h3><p class="wiz__step-desc">${t('wiz_s4_desc')}</p>${radioGroup(POWERS, state.power, true, 'price')}${navButtons()}</div>`;
        break;
      case 4:
        html = `<div class="wiz__step active"><h3 class="wiz__step-title">${t('wiz_s5_title')}</h3><p class="wiz__step-desc">${t('wiz_s5_desc')}</p>${radioGroup(MOBILITY, state.mobility, true, 'price')}${navButtons()}</div>`;
        break;
      case 5:
        html = `<div class="wiz__step active"><h3 class="wiz__step-title">${t('wiz_s6_title')}</h3><p class="wiz__step-desc">${t('wiz_s6_desc')}</p>${radioGroup(DELIVERY, state.delivery, true, 'tag')}${navButtons(true)}</div>`;
        break;
    }
    wrap.innerHTML = html;
    bindStepEvents();
    updateProgress();
    updatePrice();
    renderSVG();
  };

  const navButtons = (last) => {
    const back = state.step > 0 ? `<button class="btn btn--ghost wiz__btn-back">${t('wiz_back')}</button>` : '';
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
        el.closest('.wiz__options').querySelectorAll('.wiz__opt').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        switch (state.step) {
          case 0: state.vehicle = key; break;
          case 1: state.template = key; break;
          case 2: state.finish = key; break;
          case 3: state.power = key; break;
          case 4: state.mobility = key; break;
          case 5: state.delivery = key; break;
        }
        updatePrice(); renderSVG();
      });
    });
    wrap.querySelectorAll('.wiz__chk').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.dataset.key;
        if (state.elements.has(key)) { state.elements.delete(key); el.classList.remove('selected'); }
        else { state.elements.add(key); el.classList.add('selected'); }
        updatePrice(); renderSVG();
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

  /* =============================================
     SVG Renderer — Skeuomorphic
     ============================================= */
  const PALETTES = {
    util: { wall: '#3a3a40', floor: '#2a2a2e', accent: '#5a5a62', wood: '#4a4a50', trim: '#484850', cushion: '#555560', metal: '#606068' },
    prem: { wall: '#5c4a38', floor: '#3e3228', accent: '#8b7355', wood: '#7a6248', trim: '#947054', cushion: '#a08060', metal: '#8a7a68' },
    exec: { wall: '#3d2e22', floor: '#2a1f18', accent: '#6b4f3a', wood: '#5c3d28', trim: '#7a5a40', cushion: '#8b6a4a', metal: '#6e5e4e' },
  };

  const has = (k) => state.elements.has(k);

  const renderSVG = () => {
    const wrap = document.getElementById('wizSvg');
    wrap.innerHTML = state.view === 'rear' ? svgRear() : svgSide();
  };

  /* ---- REAR VIEW ---- */
  const svgRear = () => {
    const p = PALETTES[state.finish] || PALETTES.util;
    const vw = state.vehicle;
    const W = vw === 'mid' ? 240 : vw === 'lwb' ? 280 : 320;
    const H = vw === 'mid' ? 190 : vw === 'lwb' ? 210 : 235;
    const ox = (400 - W) / 2;
    const mob = state.mobility;
    const lift = mob === 'road' ? 0 : mob === 'adv' ? 8 : 16;
    const oy = 285 - H - lift;
    const ledClr = state.finish === 'exec' ? '#ffcc66' : '#c8ff00';
    const wPad = 14, iL = ox + wPad, iT = oy + wPad, iW = W - wPad * 2, iH = H - wPad * 2;

    let defs = '';
    let elems = '';

    if (has('sound')) {
      defs += `<pattern id="snd" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="${p.wall}" opacity=".22"/><line x1="0" y1="7" x2="14" y2="7" stroke="${p.accent}" stroke-width=".6" opacity=".25"/><line x1="7" y1="0" x2="7" y2="14" stroke="${p.accent}" stroke-width=".6" opacity=".25"/></pattern>`;
      elems += `<rect x="${iL}" y="${iT}" width="${iW}" height="${iH}" rx="4" fill="url(#snd)"/>`;
    }

    if (has('led')) {
      defs += `<filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
      elems += `<line x1="${iL + 8}" y1="${iT + 4}" x2="${iL + iW - 8}" y2="${iT + 4}" stroke="${ledClr}" stroke-width="2.5" stroke-linecap="round" opacity=".65" filter="url(#gl)"/>`;
      elems += `<line x1="${iL + 8}" y1="${iT + iH - 5}" x2="${iL + iW - 8}" y2="${iT + iH - 5}" stroke="${ledClr}" stroke-width="1.5" stroke-linecap="round" opacity=".3" filter="url(#gl)"/>`;
    }

    if (has('desk')) {
      const dw = iW * 0.72, dx = iL + (iW - dw) / 2, dy = iT + iH * 0.5;
      const mw = dw * 0.45, mx = dx + (dw - mw) / 2;
      elems += `<rect x="${dx}" y="${dy}" width="${dw}" height="5" rx="1.5" fill="${p.wood}"/>`;
      elems += `<rect x="${dx + 3}" y="${dy + 5}" width="3" height="${iH * 0.38}" rx=".5" fill="${p.trim}" opacity=".55"/>`;
      elems += `<rect x="${dx + dw - 6}" y="${dy + 5}" width="3" height="${iH * 0.38}" rx=".5" fill="${p.trim}" opacity=".55"/>`;
      elems += `<rect x="${mx}" y="${dy - 30}" width="${mw}" height="26" rx="2" fill="#111118" stroke="#333" stroke-width="1"/>`;
      elems += `<rect x="${mx + 3}" y="${dy - 28}" width="${mw - 6}" height="20" rx="1" fill="#1a2030"/>`;
      elems += `<rect x="${mx + mw * .1}" y="${dy - 4}" width="${mw * .8}" height="2" rx=".5" fill="${p.metal}" opacity=".4"/>`;
    }

    if (has('bed')) {
      const bw = iW * 0.78, bx = iL + (iW - bw) / 2, by = iT + iH - 32;
      elems += `<rect x="${bx}" y="${by + 14}" width="${bw}" height="5" rx="1" fill="${p.trim}" opacity=".45"/>`;
      elems += `<rect x="${bx + 2}" y="${by}" width="${bw - 4}" height="14" rx="5" fill="${p.cushion}"/>`;
      elems += `<line x1="${bx + 4}" y1="${by + 7}" x2="${bx + bw - 6}" y2="${by + 7}" stroke="${p.wall}" stroke-width=".5" opacity=".25"/>`;
      elems += `<rect x="${bx + 6}" y="${by + 2}" width="${bw * .18}" height="10" rx="4" fill="${p.metal}" opacity=".4"/>`;
    }

    if (has('plants')) {
      const px = iL + iW * 0.06, py = iT + iH * 0.12;
      elems += `<rect x="${px - 5}" y="${py + 18}" width="16" height="14" rx="2.5" fill="#5a4030"/>`;
      elems += `<rect x="${px - 3}" y="${py + 16}" width="12" height="3" rx="1" fill="#6a5040"/>`;
      elems += `<line x1="${px + 3}" y1="${py + 16}" x2="${px + 3}" y2="${py + 2}" stroke="#2d6a2d" stroke-width="1.5"/>`;
      elems += `<ellipse cx="${px + 3}" cy="${py - 1}" rx="6" ry="5" fill="#2d7a2d" opacity=".85"/>`;
      elems += `<ellipse cx="${px - 3}" cy="${py + 6}" rx="5" ry="4" fill="#3d8a3d" opacity=".65"/>`;
      elems += `<ellipse cx="${px + 10}" cy="${py + 3}" rx="5" ry="4" fill="#258a25" opacity=".7"/>`;
      elems += `<line x1="${px + 3}" y1="${py + 8}" x2="${px - 2}" y2="${py + 6}" stroke="#2d6a2d" stroke-width="1"/>`;
      elems += `<line x1="${px + 3}" y1="${py + 10}" x2="${px + 9}" y2="${py + 4}" stroke="#2d6a2d" stroke-width="1"/>`;
    }

    if (has('kitchen')) {
      const kw = iW * 0.26, kx = iL + iW - kw - iW * 0.04, ky = iT + iH * 0.28, kh = iH * 0.62;
      elems += `<rect x="${kx}" y="${ky}" width="${kw}" height="${kh}" rx="3" fill="${p.trim}"/>`;
      elems += `<rect x="${kx}" y="${ky}" width="${kw}" height="5" rx="2" fill="${p.wood}"/>`;
      elems += `<ellipse cx="${kx + kw * .38}" cy="${ky + 2.5}" rx="${kw * .18}" ry="2" fill="${p.floor}" opacity=".65"/>`;
      elems += `<line x1="${kx + kw * .65}" y1="${ky - 12}" x2="${kx + kw * .65}" y2="${ky}" stroke="${p.metal}" stroke-width="2" stroke-linecap="round"/>`;
      elems += `<line x1="${kx + kw * .65}" y1="${ky - 12}" x2="${kx + kw * .52}" y2="${ky - 7}" stroke="${p.metal}" stroke-width="1.5" stroke-linecap="round"/>`;
      elems += `<line x1="${kx + 3}" y1="${ky + kh * .44}" x2="${kx + kw - 3}" y2="${ky + kh * .44}" stroke="${p.wall}" stroke-width=".5" opacity=".35"/>`;
      [.3, .7].forEach(fx => [.25, .65].forEach(fy => {
        elems += `<circle cx="${kx + kw * fx}" cy="${ky + kh * fy}" r="2" fill="${p.metal}" opacity=".35"/>`;
      }));
    }

    if (has('chair')) {
      const cx = iL + iW * 0.5, cy = iT + iH * 0.65;
      elems += `<ellipse cx="${cx}" cy="${cy + 18}" rx="14" ry="3" fill="${p.metal}" opacity=".35"/>`;
      [-10, -5, 0, 5, 10].forEach(dx => {
        elems += `<line x1="${cx}" y1="${cy + 16}" x2="${cx + dx}" y2="${cy + 20}" stroke="${p.metal}" stroke-width="1.2" opacity=".4"/>`;
      });
      elems += `<rect x="${cx - 2}" y="${cy + 3}" width="4" height="14" rx="1.5" fill="${p.metal}" opacity=".55"/>`;
      elems += `<ellipse cx="${cx}" cy="${cy + 1}" rx="16" ry="6" fill="${p.cushion}"/>`;
      elems += `<ellipse cx="${cx}" cy="${cy}" rx="13" ry="4" fill="${p.wood}" opacity=".2"/>`;
      elems += `<rect x="${cx - 13}" y="${cy - 26}" width="26" height="24" rx="5" fill="${p.cushion}" opacity=".85"/>`;
      elems += `<rect x="${cx - 11}" y="${cy - 24}" width="22" height="16" rx="3" fill="${p.wood}" opacity=".15"/>`;
    }

    let skylight = '';
    if (has('skylight')) {
      const sw = W * 0.3, sx = ox + (W - sw) / 2;
      skylight = `<rect x="${sx}" y="${oy - 8}" width="${sw}" height="10" rx="4" fill="#1c3848" stroke="#2a5a6a" stroke-width=".8"/><rect x="${sx + 3}" y="${oy - 6}" width="${sw - 6}" height="6" rx="2" fill="#2a6a8a" opacity=".35"/>`;
    }

    let solar = '';
    if (state.power === 'solar' || state.power === 'full') {
      const sw = W * 0.65, sx = ox + (W - sw) / 2;
      defs += `<pattern id="solr" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#263850"/><rect x="1" y="1" width="5" height="5" rx=".5" fill="#2a4468" opacity=".8"/><rect x="6" y="1" width="5" height="5" rx=".5" fill="#2a4468" opacity=".8"/><rect x="1" y="6" width="5" height="5" rx=".5" fill="#2a4468" opacity=".8"/><rect x="6" y="6" width="5" height="5" rx=".5" fill="#2a4468" opacity=".8"/></pattern>`;
      solar = `<rect x="${sx}" y="${oy - 16}" width="${sw}" height="10" rx="3" fill="url(#solr)" stroke="#3a5a7a" stroke-width=".7"/>`;
    }

    let evBadge = '';
    if (state.power === 'full') {
      evBadge = `<rect x="${ox + W / 2 - 18}" y="${oy + H + 6}" width="36" height="14" rx="3" fill="#1a2a1a" stroke="#3a6a3a" stroke-width=".7"/><text x="${ox + W / 2}" y="${oy + H + 16}" text-anchor="middle" fill="#c8ff00" font-size="8" font-weight="bold" font-family="'Space Grotesk',sans-serif">EV</text>`;
    }

    let battery = '';
    if (['solar', 'study', 'full'].includes(state.power)) {
      battery = `<rect x="${ox + W * .35}" y="${oy + H + 2}" width="${W * .3}" height="8" rx="2" fill="#222" stroke="#444" stroke-width=".7"/>`;
    }

    let mobExtra = '';
    if (mob === '4x4') {
      mobExtra = `<rect x="${ox - 8}" y="${oy + 14}" width="5" height="42" rx="2" fill="#444" stroke="#555" stroke-width=".5"/><rect x="${ox - 9}" y="${oy + 11}" width="7" height="6" rx="1.5" fill="#444"/>`;
    }

    /* Wheels — edge-on ellipses for rear perspective */
    const wR = mob === '4x4' ? 18 : 14;
    const tW = mob === '4x4' ? 10 : 7;
    const gY = oy + H + wR + 4;

    const edgeWheel = (cx) => {
      const cy = gY - wR * 0.5;
      let s = `<ellipse cx="${cx}" cy="${cy}" rx="${tW}" ry="${wR}" fill="#151518" stroke="#333" stroke-width="1.5"/>`;
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${tW - 2.5}" ry="${wR - 3}" fill="#1e1e22"/>`;
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${tW - 4.5}" ry="${wR - 6}" fill="#2a2a2e" opacity=".6"/>`;
      s += `<ellipse cx="${cx}" cy="${cy}" rx="2" ry="3" fill="#444"/>`;
      if (mob === '4x4') s += `<ellipse cx="${cx}" cy="${cy}" rx="${tW - 1}" ry="${wR - 1}" fill="none" stroke="#2a2a2a" stroke-width="1.5" stroke-dasharray="3 4"/>`;
      if (mob === 'adv') s += `<ellipse cx="${cx}" cy="${cy}" rx="${tW - 1}" ry="${wR - 1}" fill="none" stroke="#2a2a2a" stroke-width="1" stroke-dasharray="2 3"/>`;
      return s;
    };

    const hinges = [.2, .8].flatMap(fy =>
      [ox - 1, ox + W + 1].map(hx =>
        `<circle cx="${hx}" cy="${oy + H * fy}" r="2.5" fill="#2a2a2e" stroke="#444" stroke-width=".5"/>`
      )
    ).join('');

    const tailLights = [ox + 2, ox + W - 8].map(tx =>
      `<rect x="${tx}" y="${oy + 6}" width="6" height="16" rx="2" fill="#660000" opacity=".7"/><rect x="${tx + 1}" y="${oy + 7}" width="4" height="6" rx="1" fill="#cc2222" opacity=".55"/><rect x="${tx + 1}" y="${oy + 16}" width="4" height="4" rx="1" fill="#ffaa00" opacity=".45"/>`
    ).join('');

    return `<svg viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>${defs}</defs>
      ${solar}${skylight}
      <rect x="${ox}" y="${oy}" width="${W}" height="${H}" rx="8" fill="#16161a" stroke="#333" stroke-width="1.5"/>
      <path d="M${ox + 8} ${oy} Q${ox + W / 2} ${oy - 6} ${ox + W - 8} ${oy}" stroke="#333" stroke-width="1" fill="none"/>
      <rect x="${iL}" y="${iT}" width="${iW}" height="${iH}" rx="4" fill="${p.floor}"/>
      <rect x="${iL}" y="${iT}" width="8" height="${iH}" rx="2" fill="${p.wall}"/>
      <rect x="${iL + iW - 8}" y="${iT}" width="8" height="${iH}" rx="2" fill="${p.wall}"/>
      <rect x="${iL}" y="${iT}" width="${iW}" height="8" rx="2" fill="${p.wall}"/>
      <rect x="${iL}" y="${iT + iH - 4}" width="${iW}" height="4" rx="1" fill="${p.trim}" opacity=".35"/>
      <rect x="${ox - 20}" y="${oy + 4}" width="18" height="${H - 8}" rx="3" fill="#16161a" stroke="#333" stroke-width="1" transform="rotate(-14 ${ox} ${oy + H / 2})"/>
      <rect x="${ox + W + 2}" y="${oy + 4}" width="18" height="${H - 8}" rx="3" fill="#16161a" stroke="#333" stroke-width="1" transform="rotate(14 ${ox + W} ${oy + H / 2})"/>
      ${hinges}${tailLights}
      ${elems}
      ${mobExtra}${battery}${evBadge}
      ${edgeWheel(ox + 8)}${edgeWheel(ox + W - 8)}
      <rect x="${ox + 15}" y="${oy + H - 2}" width="${W - 30}" height="5" rx="2" fill="#1a1a1e" stroke="#2a2a2e" stroke-width=".5"/>
      <rect x="${ox + W / 2 - 20}" y="${oy + H + 1}" width="40" height="10" rx="2" fill="#f0f0e0" stroke="#888" stroke-width=".5"/>
      <text x="${ox + W / 2}" y="${oy + H + 8.5}" text-anchor="middle" fill="#111" font-size="5.5" font-weight="bold" font-family="monospace">VW 26 EVO</text>
      <line x1="30" y1="${gY + 2}" x2="370" y2="${gY + 2}" stroke="#1a1a1a" stroke-width="1"/>
      <ellipse cx="${ox + W / 2}" cy="${gY + 3}" rx="${W * .45}" ry="3" fill="#0a0a0a" opacity=".35"/>
    </svg>`;
  };

  /* ---- SIDE VIEW ---- */
  const svgSide = () => {
    const p = PALETTES[state.finish] || PALETTES.util;
    const vw = state.vehicle;
    const bw = vw === 'mid' ? 250 : vw === 'lwb' ? 300 : 345;
    const bh = vw === 'mid' ? 115 : vw === 'lwb' ? 128 : 142;
    const cabW = 55;
    const totalW = bw + cabW;
    const ox = (400 - totalW) / 2;
    const mob = state.mobility;
    const lift = mob === 'road' ? 0 : mob === 'adv' ? 6 : 12;
    const oy = 272 - bh - lift;
    const wR = mob === '4x4' ? 17 : 14;
    const gY = oy + bh + wR + 6;
    const wY = gY;
    const ledClr = state.finish === 'exec' ? '#ffcc66' : '#c8ff00';
    const ix = ox + cabW + 6, iy = oy + 8, iw = bw - 12, ih = bh - 16;

    let defs = '';
    let elems = '';

    if (has('sound')) {
      defs += `<pattern id="snds" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="${p.wall}" opacity=".18"/><line x1="0" y1="5" x2="10" y2="5" stroke="${p.accent}" stroke-width=".5" opacity=".2"/></pattern>`;
      elems += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="3" fill="url(#snds)"/>`;
    }

    if (has('led')) {
      if (!defs.includes('id="gl"')) defs += `<filter id="gl"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
      elems += `<line x1="${ix + 4}" y1="${iy + 3}" x2="${ix + iw - 4}" y2="${iy + 3}" stroke="${ledClr}" stroke-width="2" stroke-linecap="round" opacity=".55" filter="url(#gl)"/>`;
    }

    if (has('desk')) {
      const dx = ix + iw * .06, dw = iw * .42, dy = iy + ih * .5;
      elems += `<rect x="${dx}" y="${dy}" width="${dw}" height="4" rx="1" fill="${p.wood}"/>`;
      elems += `<rect x="${dx + 4}" y="${dy + 4}" width="3" height="${ih * .4}" rx=".5" fill="${p.trim}" opacity=".5"/>`;
      elems += `<rect x="${dx + dw - 7}" y="${dy + 4}" width="3" height="${ih * .4}" rx=".5" fill="${p.trim}" opacity=".5"/>`;
      const mh = 22, mx = dx + dw * .3;
      elems += `<rect x="${mx}" y="${dy - mh - 2}" width="4" height="${mh}" rx="1" fill="#222" stroke="#333" stroke-width=".5"/>`;
      elems += `<rect x="${mx - dw * .12}" y="${dy - mh - 4}" width="${dw * .4}" height="3" rx="1" fill="#111118" stroke="#333" stroke-width=".5"/>`;
      elems += `<rect x="${dx + 6}" y="${dy - 2}" width="${dw * .32}" height="1.5" rx=".5" fill="${p.metal}" opacity=".35"/>`;
    }

    if (has('bed')) {
      const bx = ix + iw * .58, bwid = iw * .36, by = iy + ih - 24;
      elems += `<rect x="${bx}" y="${by + 14}" width="${bwid}" height="4" rx="1" fill="${p.trim}" opacity=".45"/>`;
      elems += `<line x1="${bx + 4}" y1="${by + 14}" x2="${bx + 4}" y2="${by + 18}" stroke="${p.metal}" stroke-width="1.5"/>`;
      elems += `<line x1="${bx + bwid - 4}" y1="${by + 14}" x2="${bx + bwid - 4}" y2="${by + 18}" stroke="${p.metal}" stroke-width="1.5"/>`;
      elems += `<rect x="${bx + 1}" y="${by}" width="${bwid - 2}" height="14" rx="5" fill="${p.cushion}"/>`;
      elems += `<line x1="${bx + 3}" y1="${by + 7}" x2="${bx + bwid - 5}" y2="${by + 7}" stroke="${p.wall}" stroke-width=".4" opacity=".25"/>`;
      elems += `<rect x="${bx + 3}" y="${by + 1.5}" width="${bwid * .16}" height="10" rx="3.5" fill="${p.metal}" opacity=".38"/>`;
    }

    if (has('plants')) {
      const px = ix + 8, py = iy + 16;
      elems += `<rect x="${px}" y="${py + 14}" width="12" height="11" rx="2.5" fill="#5a4030"/>`;
      elems += `<rect x="${px - 1}" y="${py + 12}" width="14" height="3" rx="1" fill="#6a5040"/>`;
      elems += `<line x1="${px + 6}" y1="${py + 12}" x2="${px + 6}" y2="${py + 3}" stroke="#2d6a2d" stroke-width="1.2"/>`;
      elems += `<ellipse cx="${px + 6}" cy="${py + 1}" rx="7" ry="5.5" fill="#2d7a2d" opacity=".8"/>`;
      elems += `<ellipse cx="${px + 1}" cy="${py + 6}" rx="5" ry="4" fill="#3d8a3d" opacity=".6"/>`;
      elems += `<ellipse cx="${px + 12}" cy="${py + 4}" rx="4.5" ry="3.5" fill="#258a25" opacity=".65"/>`;
    }

    if (has('kitchen')) {
      const kw = iw * .22, kx = ix + iw - kw - 6, ky = iy + ih * .26, kh = ih * .66;
      elems += `<rect x="${kx}" y="${ky}" width="${kw}" height="${kh}" rx="2" fill="${p.trim}"/>`;
      elems += `<rect x="${kx}" y="${ky}" width="${kw}" height="4" rx="1.5" fill="${p.wood}"/>`;
      elems += `<rect x="${kx + 2}" y="${ky + 8}" width="${kw - 4}" height="${kh * .38}" rx="1" fill="${p.wall}" opacity=".3" stroke="${p.accent}" stroke-width=".5"/>`;
      elems += `<rect x="${kx + 2}" y="${ky + kh * .54}" width="${kw - 4}" height="${kh * .38}" rx="1" fill="${p.wall}" opacity=".3" stroke="${p.accent}" stroke-width=".5"/>`;
      elems += `<circle cx="${kx + kw * .5}" cy="${ky + kh * .27}" r="1.5" fill="${p.metal}" opacity=".45"/>`;
      elems += `<circle cx="${kx + kw * .5}" cy="${ky + kh * .73}" r="1.5" fill="${p.metal}" opacity=".45"/>`;
      elems += `<ellipse cx="${kx + kw * .35}" cy="${ky + 2}" rx="${kw * .16}" ry="1.5" fill="${p.floor}" opacity=".6"/>`;
    }

    if (has('chair')) {
      const cx = ix + iw * .42, cy = iy + ih * .66;
      elems += `<rect x="${cx - 2}" y="${cy + 6}" width="4" height="12" rx="1" fill="${p.metal}" opacity=".5"/>`;
      elems += `<line x1="${cx - 8}" y1="${cy + 18}" x2="${cx + 8}" y2="${cy + 18}" stroke="${p.metal}" stroke-width="1.5" opacity=".35"/>`;
      elems += `<circle cx="${cx - 7}" cy="${cy + 18.5}" r="1.5" fill="#1a1a1a"/>`;
      elems += `<circle cx="${cx + 7}" cy="${cy + 18.5}" r="1.5" fill="#1a1a1a"/>`;
      elems += `<ellipse cx="${cx}" cy="${cy + 5}" rx="12" ry="4" fill="${p.cushion}"/>`;
      elems += `<rect x="${cx - 3}" y="${cy - 18}" width="6" height="22" rx="2.5" fill="${p.cushion}" opacity=".8"/>`;
      elems += `<rect x="${cx - 2}" y="${cy - 16}" width="4" height="14" rx="2" fill="${p.wood}" opacity=".15"/>`;
    }

    if (has('skylight')) {
      const sw = bw * .22, sx = ox + cabW + (bw - sw) / 2;
      elems += `<rect x="${sx}" y="${oy - 3}" width="${sw}" height="5" rx="2" fill="#1c3848" stroke="#2a5a6a" stroke-width=".7"/><rect x="${sx + 2}" y="${oy - 1.5}" width="${sw - 4}" height="2.5" rx="1" fill="#2a6a8a" opacity=".3"/>`;
    }

    let solar = '';
    if (state.power === 'solar' || state.power === 'full') {
      const sw = bw * .7, sx = ox + cabW + (bw - sw) / 2;
      if (!defs.includes('id="slrs"')) defs += `<pattern id="slrs" width="10" height="6" patternUnits="userSpaceOnUse"><rect width="10" height="6" fill="#263850"/><rect x=".5" y=".5" width="4" height="2.2" rx=".3" fill="#2a4468" opacity=".8"/><rect x="5.5" y=".5" width="4" height="2.2" rx=".3" fill="#2a4468" opacity=".8"/><rect x=".5" y="3.2" width="4" height="2.2" rx=".3" fill="#2a4468" opacity=".8"/><rect x="5.5" y="3.2" width="4" height="2.2" rx=".3" fill="#2a4468" opacity=".8"/></pattern>`;
      solar = `<rect x="${sx}" y="${oy - 8}" width="${sw}" height="7" rx="2" fill="url(#slrs)" stroke="#3a5a7a" stroke-width=".6"/>`;
    }

    let snorkel = '';
    if (mob === '4x4') {
      snorkel = `<rect x="${ox + cabW - 3}" y="${oy - 18}" width="4" height="22" rx="1.5" fill="#444" stroke="#555" stroke-width=".5"/><rect x="${ox + cabW - 4}" y="${oy - 20}" width="6" height="5" rx="2" fill="#444"/>`;
    }

    let evBadge = '';
    if (state.power === 'full') {
      evBadge = `<rect x="${ox + cabW / 2 - 14}" y="${gY - 10}" width="28" height="12" rx="3" fill="#1a2a1a" stroke="#3a6a3a" stroke-width=".7"/><text x="${ox + cabW / 2}" y="${gY - 1}" text-anchor="middle" fill="#c8ff00" font-size="7" font-weight="bold" font-family="'Space Grotesk',sans-serif">EV</text>`;
    }

    let battery = '';
    if (['solar', 'study', 'full'].includes(state.power)) {
      battery = `<rect x="${ox + cabW + bw * .3}" y="${oy + bh + 2}" width="${bw * .35}" height="6" rx="2" fill="#222" stroke="#444" stroke-width=".6"/>`;
    }

    const winW = 26, winH = bh * .28, winY = oy + 10, winGap = 10;
    const winCount = bw > 290 ? 4 : bw > 240 ? 3 : 2;
    let windows = '';
    for (let i = 0; i < winCount; i++) {
      const wx = ox + cabW + 14 + i * (winW + winGap);
      windows += `<rect x="${wx}" y="${winY}" width="${winW}" height="${winH}" rx="3" fill="#1c2838" stroke="#2a3a4a" stroke-width=".5"/>`;
      windows += `<line x1="${wx + 3}" y1="${winY + 3}" x2="${wx + winW * .4}" y2="${winY + winH - 3}" stroke="#2a4a5a" stroke-width=".5" opacity=".25"/>`;
    }

    const sideWheel = (cx) => {
      let s = `<circle cx="${cx}" cy="${wY}" r="${wR}" fill="#151518" stroke="#333" stroke-width="1.5"/>`;
      s += `<circle cx="${cx}" cy="${wY}" r="${wR - 3}" fill="#1e1e22"/>`;
      s += `<circle cx="${cx}" cy="${wY}" r="${wR - 6}" fill="#2a2a2e" stroke="#3a3a3e" stroke-width=".5"/>`;
      s += `<circle cx="${cx}" cy="${wY}" r="3" fill="#444"/>`;
      s += `<line x1="${cx}" y1="${wY - wR + 7}" x2="${cx}" y2="${wY + wR - 7}" stroke="#333" stroke-width=".5" opacity=".35"/>`;
      s += `<line x1="${cx - wR + 7}" y1="${wY}" x2="${cx + wR - 7}" y2="${wY}" stroke="#333" stroke-width=".5" opacity=".35"/>`;
      if (mob !== 'road') s += `<circle cx="${cx}" cy="${wY}" r="${wR - 2}" fill="none" stroke="#2a2a2a" stroke-width=".5" stroke-dasharray="2 4"/>`;
      return s;
    };

    const headlights = `<rect x="${ox + 2}" y="${oy + bh * .2}" width="4" height="12" rx="2" fill="#fff8dd" opacity=".35"/><rect x="${ox + 2}" y="${oy + bh * .5}" width="4" height="6" rx="1.5" fill="#ffaa00" opacity=".25"/>`;

    return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>${defs}</defs>
      ${solar}
      <rect x="${ox + cabW}" y="${oy}" width="${bw}" height="${bh}" rx="5" fill="#16161a" stroke="#333" stroke-width="1.5"/>
      <path d="M${ox + cabW} ${oy} L${ox + cabW} ${oy + bh} L${ox} ${oy + bh} L${ox} ${oy + 22} Q${ox} ${oy} ${ox + 18} ${oy} Z" fill="#16161a" stroke="#333" stroke-width="1.5"/>
      <path d="M${ox + 5} ${oy + 20} Q${ox + 5} ${oy + 5} ${ox + 18} ${oy + 5} L${ox + cabW - 3} ${oy + 5} L${ox + cabW - 3} ${oy + bh * .38} Z" fill="#1c2838" opacity=".45" stroke="#2a3a4a" stroke-width=".5"/>
      <line x1="${ox + cabW}" y1="${oy}" x2="${ox + cabW + bw}" y2="${oy}" stroke="#444" stroke-width=".5"/>
      <rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="3" fill="${p.floor}" opacity=".85"/>
      <rect x="${ix}" y="${iy}" width="${iw}" height="5" rx="2" fill="${p.wall}" opacity=".45"/>
      ${elems}${windows}${snorkel}${headlights}${battery}${evBadge}
      ${sideWheel(ox + 26)}${sideWheel(ox + cabW + bw - 26)}
      <rect x="${ox - 2}" y="${oy + bh - 3}" width="8" height="6" rx="2" fill="#1a1a1e" stroke="#2a2a2e" stroke-width=".5"/>
      <line x1="15" y1="${gY + wR + 2}" x2="385" y2="${gY + wR + 2}" stroke="#1a1a1a" stroke-width="1"/>
      <ellipse cx="${ox + totalW / 2}" cy="${gY + wR + 3}" rx="${totalW * .45}" ry="2.5" fill="#0a0a0a" opacity=".3"/>
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
  const init = () => { renderStep(); initViewToggle(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { state, renderStep, calcTotal };
})();
