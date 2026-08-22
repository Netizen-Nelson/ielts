# sentence-demo

![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Web Components](https://img.shields.io/badge/Web_Components-29ABE2?style=flat-square)
![No Dependencies](https://img.shields.io/badge/Dependencies-None-40C99A?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-95BDD7?style=flat-square)

A zero-dependency custom element suite for building interactive sentence-chunking exercises. Designed for IELTS Reading instruction — reveal sentence structure layer by layer, with semantic labels and explanations.

---

## Contents

1. [Overview](#overview)
2. [Files](#files)
3. [Quick Start](#quick-start)
4. [Element: \<sentence-demo\>](#element-sentence-demo)
5. [Element: \<sentence-stage\>](#element-sentence-stage)
6. [Element: \<stage-bridge\>](#element-stage-bridge)
7. [Multi-Layer Analysis](#multi-layer-analysis)
8. [Global Configuration API](#global-configuration-api)
9. [Color Palette](#color-palette)
10. [Visual Editor](#visual-editor)
11. [Browser Support](#browser-support)
12. [Design Notes](#design-notes)

---

## Overview

**sentence-demo** is a suite of three custom HTML elements built for language teachers who need to walk students through complex English sentences, chunk by chunk.

The core idea: wrap any portion of a sentence in a `<sentence-demo>` tag, assign it a color, a semantic label, and an explanation. The parent `<sentence-stage>` then controls the step-by-step reveal — each click lights up the next chunk and displays its explanation. No JavaScript knowledge required to author content.

For deeper sentences, multiple stages can be chained with `<stage-bridge>` to guide students from skeleton-level analysis down to phrase-level detail.

> **Design Principle**  
> Elements use **no Shadow DOM**, keeping styles globally accessible and markup inspectable. All colors, timing, and labels are configurable through a simple JavaScript API without touching source files.

---

## Files

| File | Role |
|---|---|
| `sentence-demo.js` | Defines `<sentence-demo>` and `<sentence-stage>`. Required for all usage. |
| `stage-bridge.js` | Defines `<stage-bridge>`. Only needed for multi-layer analysis. |
| `sentence-marker.html` | Visual drag-to-mark editor. Generates ready-to-paste HTML with multi-layer support. |
| `sentence-editor.html` | Segment-based editor for building sentences from scratch, with live preview. |
| `multi-stage-demo.html` | Full worked example — three-layer analysis of an IELTS art passage sentence. |

---

## Quick Start

### 1. Load the script

```html
<!-- Required -->
<script src="sentence-demo.js"></script>

<!-- Optional: only needed for multi-layer analysis -->
<script src="stage-bridge.js"></script>
```

Both files are self-contained. Place them alongside your HTML or serve from any static host. No build step, no package manager, no framework required.

### 2. Write your first exercise

```html
<sentence-stage>
  <sentence-demo
    order="1"
    color="lavender"
    label="Comparative clause"
    note="Like + noun phrase. Provides background contrast; not the main subject.">
    Unlike health-conscious people,
  </sentence-demo>
  I don't mind having burgers for a meal,
  <sentence-demo
    order="2"
    color="safe"
    label="Reason adverbial"
    note="given + noun = considering / because of. More formal than 'because'.">
    given the convenience
  </sentence-demo>.
</sentence-stage>
```

Text outside any `<sentence-demo>` tag renders as plain body text — this is intentional. It represents the sentence skeleton that students see at all times.

---

## Element: \<sentence-demo\>

An inline element that marks a chunk of text within a sentence. Must be a descendant of `<sentence-stage>`.

### Attributes

| Attribute | Default | Description |
|---|---|---|
| `order` | `"0"` | Reveal order. Chunks are lit up in ascending order when the user clicks *Next*. Set to `0` or omit to always display (useful for skeleton anchors like the main verb). |
| `color` | `"lavender"` | Chunk highlight color. Any name from the [palette](#color-palette). Controls background tint, text color, and outline simultaneously. |
| `label` | `""` | Short semantic label shown in bold on the left side of the explanation panel when the chunk is revealed. E.g. `Subject (S)`, `Relative clause`. |
| `note` | `""` | Full explanation shown in the panel when the chunk is revealed. Plain text; no HTML. |
| `always-show` | — | Boolean attribute. Chunk is always fully highlighted regardless of the current step. Useful for anchoring the verb in a skeleton-first strategy. |

### `always-show` example

When teaching "verb first", mark the main verb with `always-show` so students always see the action, then progressively reveal the surrounding chunks.

```html
<sentence-demo always-show color="sky" label="Main verb (Vt)">suggest</sentence-demo>
```

---

## Element: \<sentence-stage\>

The interactive wrapper that manages step-by-step chunk reveal. Renders a dark card containing the sentence, an explanation panel, progress dots, and Prev / Reset / Next controls. All UI is generated via inline styles — no external stylesheet required.

### How reveal works

At step 0, all chunks with `order > 0` are dimmed to a readable but visually subdued gray (`#7a7e78`). Each click of *Next* activates the chunk whose `order` matches the current step. The explanation panel updates to show the activated chunk's `label` and `note`, tinted in the chunk's color. Progress dots are clickable — clicking dot *n* jumps directly to step *n*.

`<sentence-stage>` takes no attributes. Behavior is controlled entirely by the `<sentence-demo>` children it contains.

---

## Element: \<stage-bridge\>

A visual separator placed between two `<sentence-stage>` blocks to signal a layer transition in multi-level analysis. Renders as a centred pill label flanked by gradient lines.

### Attributes

| Attribute | Default | Description |
|---|---|---|
| `label` | `"↓ Next layer"` | Text shown in the bridge pill. Typically describes what the next stage zooms into. |
| `color` | — | Optional. A color name from the palette to tint the pill border and glow dot. |

---

## Multi-Layer Analysis

Complex academic sentences often have three or four levels of modification. Rather than nesting elements (which creates visual and logical complexity), the recommended approach is **sequential stages**: one `<sentence-stage>` per layer of analysis, connected by `<stage-bridge>` elements.

```html
<!-- Layer 1: Sentence skeleton -->
<sentence-stage>
  <sentence-demo order="1" color="lavender"
    label="Subject (S)"
    note="Core noun: proliferation. The of-phrase is a modifier — skip it first.">
    The proliferation of digital streaming platforms
  </sentence-demo>
  , while democratising access to artistic works,
  <sentence-demo order="2" color="sky" label="Verb (Vt)"
    note="has raised: present perfect. simultaneously is an inserted adverb.">
    has simultaneously raised
  </sentence-demo>
  <sentence-demo order="3" color="special" label="Object (O)"
    note="urgent questions is the core noun. The about-phrase specifies what kind.">
    urgent questions about financial sustainability.
  </sentence-demo>
</sentence-stage>

<!-- Transition -->
<stage-bridge label="↓ Layer 2: zoom into the subject"></stage-bridge>

<!-- Layer 2: Subject phrase internals -->
<sentence-stage>
  <sentence-demo order="1" color="safe" label="Core noun"
    note="proliferation = rapid spread. The subject's anchor concept.">
    The proliferation
  </sentence-demo>
  <sentence-demo order="2" color="stone" label="of-phrase"
    note="of + noun: specifies what is proliferating (digital streaming platforms).">
    of digital streaming platforms
  </sentence-demo>
</sentence-stage>
```

> **Cognitive design rationale**  
> Sequential stages match natural reading comprehension: identify the skeleton first, then zoom into each complex phrase. Each stage has its own independent progress bar, so students are never confused about which layer they are in.

---

## Global Configuration API

Call `SentenceDemo.config()` or `StageBridge.config()` **before** any elements connect to the DOM (i.e., before the page renders). Options are merged into the global defaults.

```html
<script src="sentence-demo.js"></script>
<script>
  SentenceDemo.config({
    animMs:       300,            // transition duration (ms)
    defaultColor: 'lavender',    // fallback color when none specified
    bgAlpha:      0.15,          // chunk background opacity
    borderAlpha:  0.55,          // chunk outline opacity
    dimColor:     '#7a7e78',     // text color of unrevealed chunks
    nextLabel:    'Show next chunk',
    doneLabel:    'All done ✓',
    resetLabel:   'Reset',
    prevLabel:    'Previous',
  });
</script>
```

### SentenceDemo.config() options

| Key | Type | Default | Description |
|---|---|---|---|
| `animMs` | number | `320` | Transition duration in milliseconds for chunk reveal. |
| `defaultColor` | string | `'lavender'` | Fallback color when a chunk has no `color` attribute. |
| `bgAlpha` | number | `0.15` | Alpha (0–1) for the revealed chunk's background fill. |
| `borderAlpha` | number | `0.55` | Alpha (0–1) for the revealed chunk's outline. |
| `dimColor` | string | `'#7a7e78'` | Text color for unrevealed chunks. Uses a fixed hex value for reliable contrast on dark backgrounds (~4.5:1 WCAG AA). |
| `nextLabel` | string | `'顯示下一個語塊'` | *Next* button label. |
| `doneLabel` | string | `'全部完成 ✓'` | Label when all chunks are revealed. |
| `resetLabel` | string | `'重置'` | *Reset* button label. |
| `prevLabel` | string | `'上一個'` | *Previous* button label. |

### StageBridge.config() options

| Key | Type | Default | Description |
|---|---|---|---|
| `marginY` | string | `'22px'` | Vertical margin above and below the bridge. Any CSS length. |
| `accentColor` | string | `'#7B6CF0'` | Default glow dot and pill border color when no `color` attribute is set. |
| `labelColor` | string | `'#95BDD7'` | Text color of the bridge label. |
| `labelBg` | string | `'#111312'` | Background fill of the bridge pill. |
| `fontSize` | string | `'0.78rem'` | Bridge label font size. |

---

## Color Palette

All color names are available on both `<sentence-demo color="...">` and `<stage-bridge color="...">`. The palette is designed for dark backgrounds (base: `#0C0D0C`). Each color passes WCAG AA contrast at the default `bgAlpha`.

### Core palette

| Name | Hex | | Name | Hex |
|---|---|---|---|---|
| `lavender` | `#C3A5E5` | | `focus` | `#A0CF72` |
| `special` | `#C8DD5A` | | `info` | `#4285EB` |
| `warning` | `#F08080` | | `stone` | `#95BDD7` |
| `salmon` | `#E5C3B3` | | `indigo` | `#7B6CF0` |
| `sky` | `#08A9D1` | | `pink` | `#FFB3D9` |
| `safe` | `#40C99A` | | `orange` | `#EDA109` |
| `vanilla` | `#DBEDD8` | | `shell` | `#C6C7BD` |
| `yellow` | `#DECA4B` | | | |

### Extended palette

Recommended when a sentence has five or more chunks and you need additional distinct colors.

| Name | Hex | Hue gap filled |
|---|---|---|
| `mint` | `#5EDEC8` | Cool blue-green, brighter and cooler than `safe` |
| `coral` | `#FF7A65` | Warm coral-orange, more saturated than `warning` |
| `periwinkle` | `#99AAFF` | Blue-violet bridge between `sky` and `indigo` |
| `gold` | `#FFD066` | Warm gold, between `yellow` and `orange` |
| `rose` | `#FF7AAE` | Vivid rose-pink, more saturated than `pink` |

---

## Visual Editor

Writing chunk markup by hand is feasible but slow. **sentence-marker.html** is a standalone no-server editor that eliminates the need to type any HTML manually.

### Workflow

1. Paste or type the target sentence.
2. Click **Parse sentence** to render it as selectable text.
3. Drag-select any portion of text — a floating panel appears automatically.
4. Choose a color, enter a label and explanation, click **Mark chunk**.
5. Click **Add analysis layer** to append a second stage.
6. Use **Select from previous layer's chunks** to populate the next stage's input.
7. Click **Preview result** to inspect the output, then **Copy HTML**.

> **No install required**  
> Open `sentence-marker.html` directly in any modern browser. Both `sentence-demo.js` and `stage-bridge.js` must be in the same directory.

---

## Browser Support

| Browser | Min version | Notes |
|---|---|---|
| Chrome / Edge | 67+ | Full support. Recommended for the editor. |
| Firefox | 63+ | Full support. |
| Safari | 10.1+ | Full support. Custom Elements v1 since Safari 10.1. |
| iOS Safari | 10.3+ | Full support. Touch selection works for the student-facing view. |
| IE 11 | — | Not supported. No Custom Elements API. |

---

## Design Notes

### Why no Shadow DOM

Shadow DOM would prevent external CSS from reaching chunk styles, making theming and overrides unnecessarily difficult for educators who are not developers. All styles are applied as inline `style` attributes, keeping the elements inspectable and the markup fully portable.

### Why fixed color values instead of opacity for dimming

Using `opacity` to dim unrevealed chunks compounds over dark backgrounds — at `opacity: 0.22`, text becomes nearly invisible on `#0f1110`. Instead, a fixed `dimColor` hex value is applied directly to `color`, giving reliable contrast (~4.5:1 WCAG AA) regardless of the background behind the element.

### Chunking as a reading strategy

The IELTS Reading section tests the ability to locate paraphrased information under time pressure. Students who read word-by-word exhaust working memory on mechanical translation and frequently lose track of the sentence subject. Chunking trains the eye to process meaning units rather than individual words, which reduces cognitive load and improves both speed and accuracy. These elements operationalize that training in a web page.

---

Built for **Nelson IELTS** · MIT License · Vanilla JS, no dependencies, no build step
