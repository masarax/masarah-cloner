---
name: clone-website
description: Reverse-engineer and clone one or more websites in one shot — extracts assets, CSS, and content section-by-section and proactively dispatches parallel builder agents in worktrees as it goes. Use this whenever the user wants to clone, replicate, rebuild, reverse-engineer, or copy any website. Also triggers on phrases like "make a copy of this site", "rebuild this page", "pixel-perfect clone". Provide one or more target URLs as arguments.
argument-hint: "<url1> [<url2> ...]"
user-invocable: true
---

# Masarah Cloner - AI Agent Replicator Skill

You are about to reverse-engineer and rebuild target URLs as pixel-perfect clones.

By using the `masarah-cloner` tool, you can automatically download assets, preserve dynamic JS chunks, and configure local Express proxy servers that strip target validation headers (`X-Forwarded-Host`, `X-Forwarded-Proto`, and `X-Forwarded-For`).

---

## Framework Alignment

Before scraping, `masarah-cloner` checks your project directory for an active framework (Next.js, Vite, React, Vue, Svelte, Nuxt, etc.):
- **If a framework exists**: Source scripts and stylesheets (`.js`/`.css`) are mapped to the `/src` directory, visual assets (images, fonts, SVG graphics, manifests) go to `/public`, and `index.html` goes to the root.
- **If no framework exists**: The cloner creates a `/src` directory in the output path and places all files, folders, and assets inside it.

---

## Visual & Functional QA Diff Checklist

A website is not a screenshot — it is a living entity. If you only replicate the static elements, the site will feel empty. Extract both **appearance** (exact computed CSS via `getComputedStyle()`) AND **behavior** (what changes, what triggers it, and the transitions).

### 1. Scroll & Interactivity Check
- **Header & Navbar**: Capture navbar styles at scroll position `0` (initial state) AND scrolled state (100px+). Diff the two. Record property changes (e.g. background blur, borders, opacity) and transition speeds.
- **Intersection Animations**: Track elements that slide or fade into view on scroll. Document their IntersectionObserver thresholds or CSS animations.
- **Hover Transitions**: Extract hover transitions for buttons, links, cards, and navigation links. Record hover colors, scales, and transition values.
- **Tab Content Cycling**: For tab lists, click every tab. Record the cards, images, and text content for EACH state.

### 2. Typography & Fonts
- Do not approximate. Inspect headings and text blocks for computed `font-family`, `font-size`, `line-height`, and `font-weight`.
- Ensure downloaded fonts (WOFF, WOFF2) are mapped correctly in layout scripts.

### 3. Layered Asset Composition
- A banner may look like a single graphic, but it is often a composition: background gradients/meshes + overlay mockup PNGs + floating absolute SVGs.
- Inspect the DOM tree for all absolute containers and image layers. Download each element separately.

---

## DOM Style Extractor Template

Execute this script inside the browser console to extract exact CSS declarations:

```javascript
(function(selector) {
  const el = document.querySelector(selector);
  if (!el) return JSON.stringify({ error: 'Element not found: ' + selector });
  const props = [
    'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
    'textTransform','textDecoration','backgroundColor','background',
    'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'margin','marginTop','marginRight','marginBottom','marginLeft',
    'width','height','maxWidth','minWidth','maxHeight','minHeight',
    'display','flexDirection','justifyContent','alignItems','gap',
    'gridTemplateColumns','gridTemplateRows',
    'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
    'boxShadow','overflow','position','top','right','bottom','left','zIndex',
    'opacity','transform','transition','cursor','objectFit'
  ];
  function extractStyles(element) {
    const cs = getComputedStyle(element);
    const styles = {};
    props.forEach(p => { const v = cs[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px') styles[p] = v; });
    return styles;
  }
  function walk(element, depth) {
    if (depth > 4) return null;
    const children = [...element.children];
    return {
      tag: element.tagName.toLowerCase(),
      classes: element.className?.toString().split(' ').slice(0, 5).join(' '),
      text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 ? element.textContent.trim().slice(0, 150) : null,
      styles: extractStyles(element),
      children: children.map(c => walk(c, depth + 1)).filter(Boolean)
    };
  }
  return JSON.stringify(walk(el, 0), null, 2);
})('YOUR_CSS_SELECTOR');
```

---

## Component Specification File Pattern

For each section mapped from the target page, write a specification file at `docs/research/components/<component>.spec.md`:

```markdown
# <ComponentName> Spec

## Overview
- **Path**: `src/components/<ComponentName>.tsx`
- **Interactions**: <static | click | scroll>

## Computed Styles
### Container
- display: flex
- gap: 16px
...

## States & Behaviors
- **Hover State**: color changes to #0ea5e9, transition: 200ms ease-in-out
- **Scroll Transform**: header gains back-drop blur past 50px

## Assets
- Image: `public/assets/images/preview.webp`
```

---

## Local Server & Proxy Override (How It Works)

`masarah-cloner` creates a `server.js` file utilizing `express-http-proxy`. When the local browser makes API calls:
- Outgoing requests are redirected to the live target site.
- The `Host`, `Origin`, and `Referer` headers are overridden to match the original domain.
- `X-Forwarded-Host`, `X-Forwarded-For`, and `X-Forwarded-Proto` are explicitly deleted.
This bypasses backend firewall checks that block requests originating from `localhost:3000`.
