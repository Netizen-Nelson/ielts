/**
 * sentence-demo.js
 * 語塊拆解互動元件 — Nelson IELTS
 *
 * 使用方式：
 *   <sentence-stage>
 *     <sentence-demo order="1" color="lavender" label="比較修飾語塊"
 *       note="說明主角和同儕的對比，提供背景，不是主要動作來源。">
 *       Unlike health-conscious people,
 *     </sentence-demo>
 *     I don't mind having burgers for a meal,
 *     <sentence-demo order="2" color="safe" label="原因狀語語塊"
 *       note="given + 名詞片語 = 考量到某個原因，等同 because of。">
 *       given the convenience
 *     </sentence-demo>.
 *   </sentence-stage>
 *
 * 全域設定：
 *   SentenceDemo.config({ animMs: 300, defaultColor: 'lavender' });
 */

(function () {
  'use strict';

  /* ── Palette ─────────────────────────────────────────────────────────── */
  const PALETTE = {
    /* ── 原有色票 ── */
    lavender: '#C3A5E5',
    special:  '#C8DD5A',
    warning:  '#F08080',
    salmon:   '#E5C3B3',
    sky:      '#08A9D1',
    safe:     '#40C99A',
    vanilla:  '#DBEDD8',
    yellow:   '#DECA4B',
    focus:    '#A0CF72',
    info:     '#4285EB',
    stone:    '#95BDD7',
    indigo:   '#7B6CF0',
    pink:     '#FFB3D9',
    orange:   '#EDA109',
    shell:    '#C6C7BD',
    /* ── 擴充色票（補足色相空缺，深色背景高對比）── */
    mint:        '#5EDEC8', /* 藍綠色相，比 safe 更冷、更亮        */
    coral:       '#FF7A65', /* 暖珊瑚橘，比 warning 更飽和有活力   */
    periwinkle:  '#99AAFF', /* 藍紫過渡，填補 sky 和 indigo 之間   */
    gold:        '#FFD066', /* 暖金黃，比 yellow 更深、比 orange 更亮 */
    rose:        '#FF7AAE', /* 飽和玫瑰粉，比 pink 更鮮明           */
  };

  function toRgba(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ── Global config ───────────────────────────────────────────────────── */
  const CFG = {
    animMs:       320,
    defaultColor: 'lavender',
    bgAlpha:      0.15,
    borderAlpha:  0.55,
    /* dimColor：未點亮語塊的文字色。
     * 不用 opacity，改用固定色值，確保深色背景下清晰可讀。
     * 預設 #7a7e78 ≈ 對比值約 4.5:1（WCAG AA 合格）。 */
    dimColor:     '#7a7e78',
    nextLabel:    '顯示下一個語塊',
    doneLabel:    '全部完成 ✓',
    resetLabel:   '重置',
    prevLabel:    '上一個',
  };

  /* ── <sentence-demo> ─────────────────────────────────────────────────── */
  class SentenceDemoEl extends HTMLElement {
    connectedCallback() {
      /* defer one tick so sentence-stage has registered its children */
      setTimeout(() => this._setup(), 0);
    }

    _setup() {
      this._order    = parseInt(this.getAttribute('order') ?? '0', 10);
      this._colorKey = this.getAttribute('color') || CFG.defaultColor;
      this._label    = this.getAttribute('label') || '';
      this._note     = this.getAttribute('note')  || '';
      this._always   = this.hasAttribute('always-show');

      this._hex = PALETTE[this._colorKey] || PALETTE[CFG.defaultColor];

      /* Base inline styles — only layout/transition, not color yet */
      const t = `${CFG.animMs}ms ease`;
      Object.assign(this.style, {
        display:        'inline',
        borderRadius:   '4px',
        padding:        '2px 6px',
        margin:         '0 1px',
        fontWeight:     '600',
        cursor:         'default',
        /* opacity 不在 transition 內：改用 color 過渡取代 opacity 淡入，
           避免整個元素（含背景）壓暗導致文字對比不足。 */
        transition:     `background ${t}, color ${t}, outline ${t}`,
      });

      if (this._order > 0 && !this._always) {
        this._applyDim();
      } else {
        this._applyActive();
      }
    }

    _applyActive() {
      const h = this._hex;
      this.style.background = toRgba(h, CFG.bgAlpha);
      this.style.color      = h;
      this.style.outline    = `1px solid ${toRgba(h, CFG.borderAlpha)}`;
      this._lit = true;
    }

    _applyDim() {
      this.style.background = 'transparent';
      /* 用固定色值取代 opacity：對比度約 4.5:1，深色背景上清晰可讀，
         但明顯低於已點亮語塊，視覺層次清楚。 */
      this.style.color      = CFG.dimColor;
      this.style.outline    = 'none';
      this._lit = false;
    }

    activate()   { if (!this._always) this._applyActive(); }
    deactivate() { if (!this._always) this._applyDim(); }

    get chunkOrder() { return this._order; }
    get chunkLabel() { return this._label; }
    get chunkNote()  { return this._note; }
    get colorHex()   { return this._hex; }
    get colorKey()   { return this._colorKey; }
  }

  customElements.define('sentence-demo', SentenceDemoEl);

  /* ── <sentence-stage> ────────────────────────────────────────────────── */
  class SentenceStageEl extends HTMLElement {
    connectedCallback() {
      /* Wait for children to initialise */
      setTimeout(() => this._build(), 20);
    }

    _build() {
      /* Collect ordered chunks */
      this._chunks = Array.from(this.querySelectorAll('sentence-demo'))
        .filter(el => {
          const o = parseInt(el.getAttribute('order') ?? '0', 10);
          return o > 0 && !el.hasAttribute('always-show');
        })
        .sort((a, b) =>
          parseInt(a.getAttribute('order'), 10) - parseInt(b.getAttribute('order'), 10)
        );

      this._total = this._chunks.length;
      this._step  = 0;

      /* ── Wrap existing content in sentence area ── */
      const sentenceArea = document.createElement('div');
      sentenceArea.style.cssText = [
        'font-size:1.1rem',
        'line-height:2.5',
        'color:#C6C7BD',
        'padding:4px 2px 8px',
        'letter-spacing:0.01em',
      ].join(';');
      while (this.firstChild) sentenceArea.appendChild(this.firstChild);

      /* ── Note panel ── */
      this._notePanel = document.createElement('div');
      const np = this._notePanel;
      np.style.cssText = [
        'min-height:48px',
        'margin-top:14px',
        'padding:12px 16px',
        'border-radius:8px',
        `background:${toRgba('#C6C7BD', 0.05)}`,
        'border-left:3px solid transparent',
        'font-size:0.9rem',
        'color:#C6C7BD',
        `transition:all ${CFG.animMs}ms ease`,
        'display:flex',
        'align-items:flex-start',
        'gap:10px',
        'opacity:0',
        'pointer-events:none',
      ].join(';');
      np.innerHTML = `
        <span class="sd-label" style="font-weight:700;white-space:nowrap;flex-shrink:0;font-size:0.85rem;letter-spacing:0.05em;padding-top:1px"></span>
        <span class="sd-note"  style="opacity:0.85;line-height:1.6"></span>
      `;

      /* ── Progress dots ── */
      this._dotsWrap = document.createElement('div');
      this._dotsWrap.style.cssText = 'display:flex;gap:6px;justify-content:center;align-items:center;flex:1;';
      this._dots = [];

      for (let i = 0; i < this._total; i++) {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `語塊 ${i + 1}`);
        dot.style.cssText = [
          'width:9px',
          'height:9px',
          'border-radius:50%',
          'border:none',
          'background:#2a2d2a',
          'cursor:pointer',
          'padding:0',
          `transition:background ${CFG.animMs}ms, transform ${CFG.animMs}ms`,
        ].join(';');
        const idx = i;
        dot.addEventListener('click', () => this._goTo(idx + 1));
        this._dotsWrap.appendChild(dot);
        this._dots.push(dot);
      }

      /* ── Control buttons ── */
      this._prevBtn  = this._mkBtn(CFG.prevLabel,  false);
      this._nextBtn  = this._mkBtn(CFG.nextLabel,  true);
      this._resetBtn = this._mkBtn(CFG.resetLabel, false);

      this._prevBtn .addEventListener('click', () => this._go(-1));
      this._nextBtn .addEventListener('click', () => this._go(1));
      this._resetBtn.addEventListener('click', () => this._goTo(0));

      /* ── Controls row ── */
      const ctrl = document.createElement('div');
      ctrl.style.cssText = [
        'display:flex',
        'align-items:center',
        'gap:8px',
        'margin-top:14px',
        'padding-top:14px',
        'border-top:1px solid #1e2020',
      ].join(';');
      ctrl.appendChild(this._prevBtn);
      ctrl.appendChild(this._dotsWrap);
      ctrl.appendChild(this._resetBtn);
      ctrl.appendChild(this._nextBtn);

      /* ── Outer card ── */
      const card = document.createElement('div');
      card.style.cssText = [
        'background:#0f1110',
        'border:1px solid #1e2020',
        'border-radius:14px',
        'padding:24px 28px 18px',
      ].join(';');
      card.appendChild(sentenceArea);
      card.appendChild(this._notePanel);
      card.appendChild(ctrl);

      this.appendChild(card);
      this._updateUI();
    }

    _mkBtn(text, primary) {
      const b = document.createElement('button');
      b.textContent = text;
      const bg     = primary ? '#1e2b1e' : '#1a1c1a';
      const brd    = primary ? '#3a4d3a' : '#2a2d2a';
      const clr    = primary ? '#A0CF72' : '#C6C7BD';
      b.style.cssText = [
        `background:${bg}`,
        `border:1px solid ${brd}`,
        `color:${clr}`,
        'padding:6px 14px',
        'border-radius:8px',
        'cursor:pointer',
        'font-size:0.875rem',
        'font-weight:600',
        'white-space:nowrap',
        `transition:background ${CFG.animMs}ms, opacity ${CFG.animMs}ms`,
      ].join(';');
      b.addEventListener('mouseenter', () => {
        if (!b.disabled) b.style.background = primary ? '#243824' : '#242726';
      });
      b.addEventListener('mouseleave', () => {
        b.style.background = bg;
      });
      return b;
    }

    _go(delta)   { this._goTo(this._step + delta); }

    _goTo(step) {
      step = Math.max(0, Math.min(this._total, step));
      this._chunks.forEach((el, i) => {
        if (i < step) el.activate(); else el.deactivate();
      });
      this._step = step;
      this._updateUI();
    }

    _updateUI() {
      const atStart = this._step === 0;
      const atEnd   = this._step === this._total;

      /* dots */
      this._dots.forEach((dot, i) => {
        if (i < this._step) {
          const hex = this._chunks[i].colorHex;
          dot.style.background = hex;
          dot.style.transform  = 'scale(1.4)';
        } else {
          dot.style.background = '#2a2d2a';
          dot.style.transform  = 'scale(1)';
        }
      });

      /* prev / reset */
      this._prevBtn.disabled  = atStart;
      this._prevBtn.style.opacity  = atStart ? '0.28' : '1';
      this._resetBtn.disabled = atStart;
      this._resetBtn.style.opacity = atStart ? '0.28' : '1';

      /* next */
      this._nextBtn.disabled   = atEnd;
      this._nextBtn.style.opacity   = atEnd ? '0.28' : '1';
      this._nextBtn.textContent     = atEnd ? CFG.doneLabel : CFG.nextLabel;
      if (atEnd) {
        this._nextBtn.style.color        = '#40C99A';
        this._nextBtn.style.borderColor  = '#1e4a3a';
        this._nextBtn.style.background   = '#0f2820';
      } else {
        this._nextBtn.style.color        = '#A0CF72';
        this._nextBtn.style.borderColor  = '#3a4d3a';
        this._nextBtn.style.background   = '#1e2b1e';
      }

      /* note panel */
      const np = this._notePanel;
      if (this._step > 0) {
        const cur   = this._chunks[this._step - 1];
        const hex   = cur.colorHex;
        const label = cur.chunkLabel;
        const note  = cur.chunkNote;

        np.style.borderLeftColor = hex;
        np.style.background      = toRgba(hex, 0.08);
        np.style.opacity         = '1';
        np.style.pointerEvents   = 'auto';
        np.querySelector('.sd-label').style.color   = hex;
        np.querySelector('.sd-label').textContent   = label || `語塊 ${this._step}`;
        np.querySelector('.sd-note') .textContent   = note  || '';
      } else {
        np.style.opacity       = '0';
        np.style.pointerEvents = 'none';
      }
    }
  }

  customElements.define('sentence-stage', SentenceStageEl);

  /* ── Public API ──────────────────────────────────────────────────────── */
  window.SentenceDemo = {
    /**
     * 全域設定
     * @param {Partial<typeof CFG>} opts
     */
    config(opts) { Object.assign(CFG, opts); },
    /** 色票參考 */
    PALETTE,
  };

})();
