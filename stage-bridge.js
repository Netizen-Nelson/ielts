/**
 * stage-bridge.js
 * 多層語塊分析的層間銜接元件 — Nelson IELTS
 *
 * 使用方式：
 *   <stage-bridge label="↓ 第二層：拆解主詞語塊"></stage-bridge>
 *   <stage-bridge label="↓ 第三層" color="sky"></stage-bridge>
 *
 * 全域設定：
 *   StageBridge.config({ marginY: '28px', accentColor: '#7B6CF0' });
 */

(function () {
  'use strict';

  /* ── Palette（與 sentence-demo.js 一致）────────────────────── */
  const PALETTE = {
    lavender:   '#C3A5E5', special:    '#C8DD5A', warning: '#F08080',
    salmon:     '#E5C3B3', sky:        '#08A9D1', safe:    '#40C99A',
    vanilla:    '#DBEDD8', yellow:     '#DECA4B', focus:   '#A0CF72',
    info:       '#4285EB', stone:      '#95BDD7', indigo:  '#7B6CF0',
    pink:       '#FFB3D9', orange:     '#EDA109', shell:   '#C6C7BD',
    mint:       '#5EDEC8', coral:      '#FF7A65', periwinkle: '#99AAFF',
    gold:       '#FFD066', rose:       '#FF7AAE',
  };

  /* ── Global config ──────────────────────────────────────────── */
  const CFG = {
    marginY:       '22px',
    accentColor:   '#7B6CF0',   /* 預設 indigo */
    lineColor:     '#1e2020',
    labelBg:       '#111312',
    labelColor:    '#95BDD7',   /* stone — 低調但可讀 */
    fontSize:      '0.78rem',
    fontWeight:    '700',
    letterSpacing: '0.07em',
  };

  /* ── Helper ─────────────────────────────────────────────────── */
  function esc(s) {
    return (s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function toRgba(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ── <stage-bridge> ─────────────────────────────────────────── */
  class StageBridgeEl extends HTMLElement {
    connectedCallback() {
      /* 讓父層完成佈局後再渲染，避免 offsetWidth 為 0 */
      setTimeout(() => this._render(), 0);
    }

    static get observedAttributes() {
      return ['label', 'color'];
    }

    attributeChangedCallback() {
      if (this.isConnected) this._render();
    }

    _render() {
      const label  = this.getAttribute('label') || '↓ 下一層分析';
      const cName  = this.getAttribute('color') || '';
      const accent = PALETTE[cName] || CFG.accentColor;

      /* 外層樣式 */
      Object.assign(this.style, {
        display:    'block',
        margin:     `${CFG.marginY} 0`,
        userSelect: 'none',
      });

      /* 漸層線：從外向內從 lineColor → transparent，讓中間標籤浮現 */
      const lineL = `linear-gradient(to right,  ${CFG.lineColor}, transparent)`;
      const lineR = `linear-gradient(to left,   ${CFG.lineColor}, transparent)`;

      this.innerHTML = `
        <div style="
          display:flex; align-items:center; gap:16px; padding:0 2px;
        ">
          <div style="flex:1; height:1px; background:${lineL}"></div>

          <div style="
            display:inline-flex; align-items:center; gap:8px;
            font-size:${CFG.fontSize}; font-weight:${CFG.fontWeight};
            letter-spacing:${CFG.letterSpacing};
            color:${CFG.labelColor};
            white-space:nowrap;
            padding:5px 16px;
            border:1px solid ${toRgba(accent, 0.35)};
            border-radius:99px;
            background:${CFG.labelBg};
            box-shadow:0 0 0 3px ${toRgba(accent, 0.08)};
          ">
            <span style="
              display:inline-block; width:7px; height:7px;
              border-radius:50%; flex-shrink:0;
              background:${accent};
              box-shadow:0 0 6px ${toRgba(accent, 0.6)};
            "></span>
            ${esc(label)}
          </div>

          <div style="flex:1; height:1px; background:${lineR}"></div>
        </div>`;
    }
  }

  customElements.define('stage-bridge', StageBridgeEl);

  /* ── Public API ─────────────────────────────────────────────── */
  window.StageBridge = {
    /**
     * 全域設定
     * @param {Partial<typeof CFG>} opts
     */
    config(opts) { Object.assign(CFG, opts); },
    /** 色票參考 */
    PALETTE,
  };

})();
