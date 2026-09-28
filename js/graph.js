/* 개념 지도 (graph.html) — Obsidian 그래프 뷰처럼 계속 움직이는 힘 기반 배치.
   점 = 블록(카드 ●, 읽기 ■, 영상 ▲). 개념은 작은 고리 모양의 '허브'로, 블록은 자기 개념 허브에 붙는다(Obsidian의 태그 노드처럼).
   선수 관계(graph/concepts.txt)는 허브와 허브 사이에, 카드끼리 직접 이은 선(graph/links.txt)은 블록 사이에 그린다.
   허브를 숨기면 같은 개념의 블록을 교과서 순서대로 잇고, 선수 관계는 두 개념의 블록 사이 선 하나로 바꾼다.
   데이터: js/graph-data.js, js/toc.js(블록 위치), js/store.js(학습 기록) */
(() => {
  "use strict";
  if (!window.GRAPH || !window.TOC) return;
  const St = window.NMStore;
  const { F } = NM;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const COLORS = { is1: "#86c36f", is2: "#4fc1b6", phy: "#6ea4e6", mech: "#4f7fd6", emq: "#8fc3f5", chem: "#b58de3", mateng: "#9267d6", rxn: "#d3a8f0", bio: "#e89a55", cell: "#d97a3a", gene: "#f2bd86", earth: "#caa47c", esys: "#a88457", space: "#e3cfa3", extra: "#9a9aa0" };
  const ACCENT = "#a78bfa";
  const KIND = { card: "카드", text: "읽기", video: "영상" };

  /* ───── 설정 (이 브라우저에만 기억) ───── */
  const DEFAULTS = { courses: true, hubs: true, orphans: true, color: "course", arrows: false, textFade: 0.7, nodeSize: 1, linkWidth: 1, center: 0.5, repel: 4, linkForce: 0.6, linkDist: 38 };
  let set = { ...DEFAULTS };
  try { Object.assign(set, JSON.parse(localStorage.getItem("namunnip-graph-settings-v2") || "{}")); } catch (e) { /* 무시 */ }
  const saveSet = () => { try { localStorage.setItem("namunnip-graph-settings-v2", JSON.stringify(set)); } catch (e) { /* 무시 */ } };

  /* ───── 데이터: 블록 점과 개념 허브 ───── */
  const courseName = {}, where = {}, order = [];
  TOC.forEach((c) => { courseName[c.id] = c.name; c.chapters.forEach((ch) => ch.sections.forEach((s) => s.items.forEach((it) => { if (where[it.id]) { where[it.id].also.push({ c, ch, s }); return; } where[it.id] = { c, ch, s, it, also: [] }; order.push(it.id); }))); });
  const ORDER = ["is1", "phy", "mech", "emq", "chem", "mateng", "rxn", "is2", "bio", "cell", "gene", "earth", "esys", "space", "extra"], count = {};
  const place = (course) => {
    const i = (count[course] = (count[course] || 0) + 1), ca = ORDER.indexOf(course) / ORDER.length * Math.PI * 2, a = i * 2.39996, r = 7 * Math.sqrt(i);
    return { x: Math.cos(ca) * 220 + Math.cos(a) * r, y: Math.sin(ca) * 220 + Math.sin(a) * r };
  };
  const all = new Map();   // id → 점 (블록은 블록 id, 허브는 "c:" + 개념 id)
  order.forEach((id) => {
    const w = where[id];
    all.set(id, { id, type: "block", kind: w.it.kind, name: w.it.title, main: w.c.id, w, concepts: [], vx: 0, vy: 0, fx: null, fy: null, ...place(w.c.id) });
  });
  const concepts = GRAPH.map((g) => {
    const courses = {};
    g.blocks.forEach((b) => { const w = where[b]; if (w) courses[w.c.id] = (courses[w.c.id] || 0) + 1; });
    const main = Object.entries(courses).sort((a, b) => b[1] - a[1])[0]?.[0] || "extra";
    const blocks = g.blocks.filter((b) => all.has(b)).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const hub = { id: "c:" + g.id, cid: g.id, type: "hub", name: g.name, main, courses, blocks, req: g.req, kidsC: [], vx: 0, vy: 0, fx: null, fy: null, x: 0, y: 0 };
    blocks.forEach((b) => all.get(b).concepts.push(hub));
    blocks.forEach((b) => { hub.x += all.get(b).x / blocks.length; hub.y += all.get(b).y / blocks.length; });   // 자기 블록들의 가운데에서 시작
    all.set(hub.id, hub);
    return hub;
  });
  const hubOf = Object.fromEntries(concepts.map((h) => [h.cid, h]));
  concepts.forEach((h) => h.req.forEach((r) => hubOf[r] && hubOf[r].kidsC.push(h)));
  const EXTRA = (window.GRAPH_LINKS || []).filter(([a, b]) => all.has(a) && all.has(b));
  // 과목 노드: 과목마다 하나. 그 과목에 배치된 블록(재사용 포함)과, 그 블록이 속한 개념 허브에 이어진다
  const courseNodes = TOC.filter((c) => c.id !== "extra").map((c) => {
    const ca = Math.max(0, ORDER.indexOf(c.id)) / ORDER.length * Math.PI * 2;
    const blocks = order.filter((id) => where[id].c.id === c.id || where[id].also.some((a) => a.c.id === c.id));
    const hubs = concepts.filter((h) => h.blocks.some((b) => blocks.includes(b)));
    const node = { id: "k:" + c.id, type: "course", name: c.name, main: c.id, course: c, blocks, hubs, courses: { [c.id]: 1 }, vx: 0, vy: 0, fx: null, fy: null, x: Math.cos(ca) * 240, y: Math.sin(ca) * 240 };
    all.set(node.id, node);
    return node;
  });

  /* ───── 상태 ───── */
  let nodes = [], links = [];
  let hover = null, selected = null, match = null, pathSet = null, dragging = null;
  let touched = false, settled = false, fitList = null;
  const hiddenCourses = new Set();
  let local = null, shown = new Set();
  const fade = new Map();

  /* ───── 지금 그릴 점과 선 (허브 켜기/끄기에 따라 다시 짠다) ───── */
  function rebuild() {
    nodes = [...all.values()].filter((n) => n.type === "block" || (n.type === "hub" && set.hubs) || (n.type === "course" && set.courses));
    const L = new Map();
    const add = (a, b, kind) => { if (!a || !b || a === b) return; const k = a.id < b.id ? a.id + "|" + b.id : b.id + "|" + a.id; if (!L.has(k) || kind === "req") L.set(k, { a, b, kind }); };
    concepts.forEach((h) => {
      const bs = h.blocks.map((b) => all.get(b));
      if (set.hubs) {
        bs.forEach((b) => add(h, b, "member"));
        h.req.forEach((r) => add(hubOf[r], h, "req"));
      } else {
        for (let i = 1; i < bs.length; i++) add(bs[i - 1], bs[i], "member");
        h.req.forEach((r) => { const p = hubOf[r]; if (p && p.blocks.length && bs.length) add(all.get(p.blocks[p.blocks.length - 1]), bs[0], "req"); });
      }
    });
    EXTRA.forEach(([a, b]) => add(all.get(a), all.get(b), "req"));
    if (set.courses) courseNodes.forEach((k) => (set.hubs ? k.hubs : k.blocks.map((b) => all.get(b))).forEach((m) => add(k, m, "course")));
    links = [...L.values()];
    nodes.forEach((n) => { n.nb = new Set(); });
    links.forEach(({ a, b }) => { a.nb.add(b); b.nb.add(a); });
    nodes.forEach((n) => {
      n.deg = n.nb.size;
      n.base = n.type === "course" ? 17 : n.type === "hub" ? 3 + Math.sqrt(n.blocks.length) * 1.1 : 3.4 + Math.sqrt(n.deg) * 0.9;
    });
    if (selected && !nodes.includes(selected)) selected = null;
    if (local && !nodes.includes(local.center)) local = null;
    refilter();
  }

  /* ───── 학습 상태 ───── */
  let stCache = new Map();
  function blockStatus(id) {
    const r = (St && St.get(id)) || {};
    const q = (r.quiz || []).filter(Boolean);
    return { seen: !!r.seen, wrong: q.some((x) => x.firstOk === false && !x.resolved), noted: !!(r.note || (r.hl && r.hl.length)), qs: q.length, qok: q.filter((x) => x.ok).length };
  }
  function st(n) {
    if (stCache.has(n)) return stCache.get(n);
    let s;
    if (n.type === "block") { s = blockStatus(n.id); s.p = s.seen ? 1 : 0; }
    else {
      const bs = n.blocks.filter((b) => all.get(b) && all.get(b).kind !== "video").map(blockStatus);
      s = { seen: bs.filter((b) => b.seen).length, wrong: bs.filter((b) => b.wrong).length, qs: bs.reduce((a, b) => a + b.qs, 0), qok: bs.reduce((a, b) => a + b.qok, 0) };
      s.p = bs.length ? s.seen / bs.length : 0;
    }
    stCache.set(n, s); return s;
  }
  const mix = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };
  function nodeColor(n) {
    if (set.color === "progress") { const s = st(n); if (n.type === "block" && s.wrong) return "#ff7b73"; return s.p <= 0 ? "#5c5c63" : mix("#6b7a5e", "#8fd16f", s.p); }
    return COLORS[n.main];
  }

  /* ───── 보이는 점 (과목 필터, 연결 없는 점, 로컬 그래프) ───── */
  function refilter() {
    let pool = nodes.filter((n) => n.type === "block" || n.type === "course" ? !hiddenCourses.has(n.main) : !Object.keys(n.courses).every((c) => hiddenCourses.has(c)));
    const inPool = new Set(pool);
    if (!set.orphans) pool = pool.filter((n) => [...n.nb].some((m) => inPool.has(m)));
    if (local) {
      const keep = new Set([local.center]); let front = [local.center];
      for (let d = 0; d < local.depth; d++) { const nx = []; front.forEach((n) => n.nb.forEach((m) => { if (!keep.has(m)) { keep.add(m); nx.push(m); } })); front = nx; }
      pool = pool.filter((n) => keep.has(n));
      if (!pool.includes(local.center)) pool.push(local.center);
    }
    shown = new Set(pool);
    heat(0.6);
  }

  /* ───── 물리 (d3-force 방식: alpha가 식으면 멈추고, 끌면 다시 데운다) ───── */
  let alpha = 1, alphaTarget = 0;
  function heat(a) { alpha = Math.max(alpha, a); wake(); }
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function tick() {
    alpha += (alphaTarget - alpha) * 0.0228;
    const list = nodes.filter((n) => shown.has(n));
    const q = -set.repel * 30;
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
      if (d2 < 1) { dx = rnd() - 0.5; dy = rnd() - 0.5; d2 = dx * dx + dy * dy; }
      if (d2 > 160000) continue;
      const f = q * alpha / d2;
      a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      const min = (a.base + b.base) * set.nodeSize + 3, d = Math.sqrt(d2);
      if (d < min) { const p = (min - d) / d * 0.25; a.vx -= dx * p; a.vy -= dy * p; b.vx += dx * p; b.vy += dy * p; }
    }
    links.forEach(({ a, b, kind }) => {
      if (!shown.has(a) || !shown.has(b)) return;
      let dx = b.x + b.vx - a.x - a.vx, dy = b.y + b.vy - a.y - a.vy; const l = Math.hypot(dx, dy) || 1;
      const dist = set.linkDist * (kind === "req" ? 2.2 : kind === "course" ? 3.2 : 1);
      const k = (l - dist) / l * alpha * set.linkForce * (kind === "course" ? 0.35 : 1) / Math.max(1, Math.min(a.deg, b.deg));
      dx *= k; dy *= k; const bias = a.deg / (a.deg + b.deg || 1);
      b.vx -= dx * bias; b.vy -= dy * bias; a.vx += dx * (1 - bias); a.vy += dy * (1 - bias);
    });
    const c = set.center * 0.05 * alpha;
    list.forEach((n) => { n.vx -= n.x * c; n.vy -= n.y * c; });
    list.forEach((n) => {
      if (n.fx != null) { n.x = n.fx; n.y = n.fy; n.vx = n.vy = 0; return; }
      n.vx *= 0.6; n.vy *= 0.6; n.x += n.vx; n.y += n.vy;
    });
  }

  /* ───── 화면 ───── */
  const cv = document.getElementById("gv-canvas");
  const ctx = cv.getContext("2d");
  const size = { w: 0, h: 0 };
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    size.w = cv.clientWidth; size.h = cv.clientHeight;
    cv.width = Math.round(size.w * dpr); cv.height = Math.round(size.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); wake();
  }
  new ResizeObserver(resize).observe(cv);
  const view = { x: 0, y: 0, k: 1 }, goal = { x: 0, y: 0, k: 1 };
  const toS = (x, y) => [(x - view.x) * view.k + size.w / 2, (y - view.y) * view.k + size.h / 2];
  const toW = (sx, sy) => [(sx - size.w / 2) / view.k + view.x, (sy - size.h / 2) / view.k + view.y];
  const radius = (n) => n.base * set.nodeSize;
  const focusOf = () => dragging || hover || selected;
  function targetEmph(n) {
    if (pathSet) return pathSet.has(n) ? 1 : 0.1;
    if (match) return match.has(n) ? 1 : 0.1;
    const f = focusOf();
    if (f) return n === f || f.nb.has(n) ? 1 : 0.15;
    return 1;
  }

  function shape(n, x, y, r) {
    ctx.beginPath();
    if (n.type === "hub") { ctx.arc(x, y, r, 0, Math.PI * 2); return; }
    if (n.kind === "text") { const s = r * 0.9; ctx.rect(x - s, y - s, s * 2, s * 2); return; }
    if (n.kind === "video") { const s = r * 1.25; ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.95, y + s * 0.7); ctx.lineTo(x - s * 0.95, y + s * 0.7); ctx.closePath(); return; }
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }
  const hexA = (h, a) => { const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); return `rgba(${v.join(",")},${a})`; };
  const short = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = focusOf();
    // 선
    links.forEach(({ a, b, kind }) => {
      if (!shown.has(a) || !shown.has(b)) return;
      const e = Math.min(fade.get(a) ?? 1, fade.get(b) ?? 1);
      const hot = (f && (a === f || b === f)) || (pathSet && pathSet.has(a) && pathSet.has(b));
      const [x1, y1] = toS(a.x, a.y), [x2, y2] = toS(b.x, b.y);
      const baseA = kind === "req" ? 0.1 + 0.25 * e : kind === "course" ? 0.03 + 0.07 * e : 0.05 + 0.13 * e;
      ctx.strokeStyle = hot ? ACCENT : kind === "course" ? hexA(COLORS[a.type === "course" ? a.main : b.main], baseA * 1.6) : `rgba(200,200,210,${baseA})`;
      ctx.lineWidth = (hot ? 1.5 : kind === "req" ? 1 : 0.7) * set.linkWidth * Math.min(1.6, Math.max(0.6, view.k));
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      if (kind === "req" && (set.arrows || hot)) {
        const d = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / d, uy = (y2 - y1) / d, rb = radius(b) * view.k + 3;
        const ex = x2 - ux * rb, ey = y2 - uy * rb, ah = 4 + 2 * set.linkWidth;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - ux * ah - uy * ah * 0.5, ey - uy * ah + ux * ah * 0.5); ctx.lineTo(ex - ux * ah + uy * ah * 0.5, ey - uy * ah - ux * ah * 0.5); ctx.closePath(); ctx.fill();
      }
    });
    // 점
    nodes.forEach((n) => {
      if (!shown.has(n)) return;
      const e = fade.get(n) ?? 1, [x, y] = toS(n.x, n.y), r = Math.max(1.5, radius(n) * view.k), s = st(n);
      ctx.globalAlpha = 0.1 + 0.9 * e;
      const col = n === f ? ACCENT : nodeColor(n);
      if (n.type === "course") {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = Math.max(1.5, r * 0.12); ctx.stroke();
        if (s.p > 0) { ctx.strokeStyle = "#8fd16f"; ctx.lineWidth = Math.max(2, r * 0.2); ctx.beginPath(); ctx.arc(x, y, r + ctx.lineWidth, -Math.PI / 2, -Math.PI / 2 + s.p * Math.PI * 2); ctx.stroke(); }
      } else if (n.type === "hub") {
        ctx.fillStyle = "#1c1c1f"; shape(n, x, y, r); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.3, r * 0.38); shape(n, x, y, r); ctx.stroke();
      } else {
        ctx.fillStyle = col; shape(n, x, y, r); ctx.fill();
        if (set.color === "course" && s.seen) { ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = Math.max(1.1, r * 0.3); shape(n, x, y, r + ctx.lineWidth * 0.8); ctx.stroke(); }
        if (s.wrong && set.color === "course") { ctx.fillStyle = "#ff5f57"; ctx.beginPath(); ctx.arc(x + r * 0.85, y - r * 0.85, Math.max(2.2, r * 0.42), 0, Math.PI * 2); ctx.fill(); }
        if (s.noted) { ctx.fillStyle = "#e0b400"; ctx.beginPath(); ctx.arc(x + r * 0.85, y + r * 0.85, Math.max(1.8, r * 0.34), 0, Math.PI * 2); ctx.fill(); }
      }
      if (n === selected) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 1;
    });
    // 글자: 허브 이름은 조금만 확대해도, 블록 제목은 더 확대해야 나타난다. 초점과 이웃은 항상
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    const hubA = Math.max(0, Math.min(1, (view.k - (set.textFade - 0.25)) / 0.3));
    const blkA = Math.max(0, Math.min(1, (view.k - (set.textFade + 0.45)) / 0.4));
    const boxes = [];
    nodes.filter((n) => shown.has(n)).sort((a, b) => pri(b) - pri(a)).forEach((n) => {
      const forced = pri(n) >= 1e4, e = fade.get(n) ?? 1;
      const a = forced || n.type === "course" ? Math.max(0.35, e) : (n.type === "hub" ? hubA : blkA) * e * e;
      if (a < 0.04) return;
      const [x, y] = toS(n.x, n.y), r = radius(n) * view.k;
      const fs = n.type === "course" ? Math.min(17, Math.max(12, 14 * Math.sqrt(view.k))) : Math.min(15, Math.max(10, (n.type === "hub" ? 12 : 11) * Math.sqrt(view.k)));
      ctx.font = `${n === f || n.type !== "block" ? 600 : 400} ${fs}px ${F.sans}`;
      const label = n === f || n.type === "course" ? n.name : short(n.name, n.type === "hub" ? 20 : 16);
      const tw = ctx.measureText(label).width, bx = [x - tw / 2, x + tw / 2, y + r + 3, y + r + 5 + fs];
      if (!forced && boxes.some((b) => bx[0] < b[1] && bx[1] > b[0] && bx[2] < b[3] && bx[3] > b[2])) return;
      boxes.push(bx);
      ctx.globalAlpha = a; ctx.fillStyle = n === f || n.type === "course" ? "#ffffff" : n.type === "hub" ? "#e4e4e8" : "#b9b9c1";
      ctx.fillText(label, x, y + r + 4);
      ctx.globalAlpha = 1;
    });
  }
  function pri(n) {
    const f = focusOf();
    return (n === f ? 1e6 : 0) + (f && f.nb.has(n) ? 1e4 : 0) + (match && match.has(n) ? 1e5 : 0) + (pathSet && pathSet.has(n) && n.type === "hub" ? 1e5 : 0) + (n.type === "course" ? 5e3 : n.type === "hub" ? 100 : 0) + n.base;
  }

  /* ───── 애니메이션 루프 ───── */
  let raf = 0;
  // 헤드리스 시험(?test)에서는 가상 시간이 requestAnimationFrame을 거의 돌리지 않아 타이머로 대신한다
  const TEST = /[?&]test\b/.test(location.search);
  const nextFrame = TEST ? (f) => setTimeout(f, 16) : requestAnimationFrame;
  function wake() { if (!raf) raf = nextFrame(frame); }
  function frame() {
    raf = 0;
    let busy = false;
    if (alpha > 0.004 || alphaTarget > 0) { tick(); busy = true; }
    if (!settled && alpha < 0.012) { settled = true; if (!touched && fitList) fitTo(fitList, 50, 1.4); }
    nodes.forEach((n) => { const t = targetEmph(n), c = fade.get(n) ?? 1; if (Math.abs(t - c) > 0.01) { fade.set(n, c + (t - c) * 0.18); busy = true; } else fade.set(n, t); });
    ["x", "y", "k"].forEach((k) => { const d = goal[k] - view[k]; if (Math.abs(d) > (k === "k" ? 0.0005 : 0.05)) { view[k] += d * 0.16; busy = true; } else view[k] = goal[k]; });
    draw();
    if (TEST) cv.dataset.state = JSON.stringify({ view, alpha: +alpha.toFixed(3), size, n0: [nodes[0].x, nodes[0].y], shown: shown.size, match: match ? match.size : 0 });
    if (busy) wake();
  }
  function fitTo(list, pad = 60, kmax = 2.4) {
    list = list.filter((n) => shown.has(n)); if (!list.length || !size.w) return;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    list.forEach((n) => { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y + 14); });
    goal.x = (x0 + x1) / 2; goal.y = (y0 + y1) / 2;
    goal.k = Math.min(kmax, Math.max(0.15, Math.min((size.w - pad * 2) / Math.max(40, x1 - x0), (size.h - pad * 2) / Math.max(40, y1 - y0))));
    wake();
  }

  /* ───── 조작 ───── */
  const pointers = new Map(); let drag = null, pinch = null, moved = false;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const hit = (sx, sy) => {
    const [wx, wy] = toW(sx, sy); let best = null, bd = Infinity;
    nodes.forEach((n) => { if (!shown.has(n)) return; const d = Math.hypot(n.x - wx, n.y - wy); if (d < radius(n) + 7 / view.k && d < bd) { bd = d; best = n; } });
    return best;
  };
  cv.addEventListener("pointerdown", (e) => {
    cv.setPointerCapture(e.pointerId); pointers.set(e.pointerId, pos(e)); moved = false;
    hideHint(); touched = true;
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: goal.k }; drag = null; return; }
    const [sx, sy] = pos(e), n = hit(sx, sy);
    drag = n ? { node: n, sx, sy } : { pan: true, sx, sy, gx: goal.x, gy: goal.y };
  });
  cv.addEventListener("pointermove", (e) => {
    const p = pos(e);
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);
    if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; goal.k = view.k = Math.min(5, Math.max(0.12, pinch.k * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d)); moved = true; wake(); return; }
    if (drag) {
      const dx = p[0] - drag.sx, dy = p[1] - drag.sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) > 4) { moved = true; if (drag.node) { dragging = drag.node; alphaTarget = 0.3; heat(0.3); } }
      if (!moved) return;
      if (drag.pan) { goal.x = view.x = drag.gx - dx / view.k; goal.y = view.y = drag.gy - dy / view.k; wake(); }
      else { const [wx, wy] = toW(p[0], p[1]); drag.node.fx = wx; drag.node.fy = wy; wake(); }
      return;
    }
    const n = hit(p[0], p[1]);
    if (n !== hover) { hover = n; cv.style.cursor = n ? "pointer" : "grab"; wake(); }
  });
  const up = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (drag) {
      if (drag.node && moved) { drag.node.fx = drag.node.fy = null; alphaTarget = 0; dragging = null; }
      if (!moved) select(drag.pan ? null : drag.node);
    }
    drag = null; wake();
  };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("pointerleave", () => { if (hover && !drag) { hover = null; wake(); } });
  cv.addEventListener("dblclick", (e) => {   // 블록을 두 번 누르면 그 카드로 바로 간다
    const n = hit(...pos(e)); if (n && n.type === "block") location.href = blockHref(n);
  });
  cv.addEventListener("wheel", (e) => {
    e.preventDefault(); hideHint(); touched = true;
    const [sx, sy] = pos(e), [wx, wy] = toW(sx, sy);
    const k = Math.min(5, Math.max(0.12, goal.k * Math.exp(-e.deltaY * 0.0018)));
    goal.k = k; goal.x = wx - (sx - size.w / 2) / k; goal.y = wy - (sy - size.h / 2) / k;
    wake();
  }, { passive: false });
  document.getElementById("gv-fit").addEventListener("click", () => { match = pathSet = null; fitTo(nodes, 50); });

  /* ───── 찾기 ───── */
  const search = document.getElementById("gv-search");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    match = q ? new Set(nodes.filter((n) => n.name.toLowerCase().includes(q))) : null;
    pathSet = null; wake();
  });
  search.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !match || !match.size) return;
    const list = [...match];
    list.length === 1 ? select(list[0], true) : fitTo(list, 90);
  });

  /* ───── 설정 패널 ───── */
  const gear = document.getElementById("gv-gear"), sp = document.getElementById("gv-settings");
  gear.addEventListener("click", () => { sp.hidden = !sp.hidden; gear.setAttribute("aria-expanded", String(!sp.hidden)); });
  const legendShapes = `<li><i class="sh dot"></i>카드</li><li><i class="sh sq"></i>읽기</li><li><i class="sh tri"></i>영상</li><li><i class="sh hub"></i>개념 허브</li><li><i class="sh course"></i>과목</li>`;
  function syncControls() {
    sp.querySelectorAll("[data-set]").forEach((el) => { const k = el.dataset.set; el.type === "checkbox" ? (el.checked = !!set[k]) : (el.value = set[k]); });
    sp.querySelectorAll("[data-color]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.color === set.color)));
    document.getElementById("gv-groups").innerHTML = legendShapes + (set.color === "course"
      ? TOC.map((c) => `<li><i style="background:${COLORS[c.id]}"></i>${esc(c.name)}</li>`).join("") + `<li><i class="ring"></i>흰 테두리: 본 블록</li><li><i style="background:#ff5f57"></i>오답노트에 있음</li><li><i style="background:#e0b400"></i>메모·형광펜</li>`
      : `<li><i style="background:#5c5c63"></i>아직 안 봄</li><li><i style="background:#8fd16f"></i>봄</li><li><i style="background:#ff7b73"></i>오답노트에 있음</li>`);
  }
  sp.addEventListener("input", (e) => {
    const el = e.target.closest("[data-set]"); if (!el) return;
    const k = el.dataset.set;
    set[k] = el.type === "checkbox" ? el.checked : +el.value;
    saveSet();
    if (k === "hubs" || k === "courses") { pathSet = null; rebuild(); settled = false; touched = false; fitList = nodes; }
    else if (k === "orphans") refilter();
    else if (["center", "repel", "linkForce", "linkDist", "nodeSize"].includes(k)) heat(0.5);
    wake();
  });
  sp.addEventListener("click", (e) => {
    const b = e.target.closest("[data-color]"); if (!b) return;
    set.color = b.dataset.color; saveSet(); syncControls(); wake();
  });
  document.getElementById("gv-reset").addEventListener("click", () => { set = { ...DEFAULTS }; saveSet(); syncControls(); rebuild(); });
  const cbox = document.getElementById("gv-courses");
  cbox.innerHTML = TOC.map((c) => `<button type="button" class="gv-course-chip" aria-pressed="true" data-c="${c.id}"><i style="background:${COLORS[c.id]}"></i>${esc(c.name)}</button>`).join("");
  cbox.addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    const c = b.dataset.c;
    hiddenCourses.has(c) ? hiddenCourses.delete(c) : hiddenCourses.add(c);
    if (hiddenCourses.size === TOC.length) hiddenCourses.clear();
    cbox.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(!hiddenCourses.has(x.dataset.c))));
    refilter(); setTimeout(() => fitTo([...shown], 50), 700);
  });
  syncControls();

  const hint = document.getElementById("gv-hint");
  function hideHint() { hint.classList.add("off"); }
  setTimeout(hideHint, 7000);

  /* ───── 상세 패널 ───── */
  const panel = document.getElementById("gv-panel"), detail = document.getElementById("gv-detail");
  panel.querySelector(".gv-close").addEventListener("click", () => select(null));
  function blockHref(n) { return `c/${n.w.c.id}/${n.w.ch.n}-${n.w.s.n}.html#${n.id}`; }
  function ancestorsC(hubs, s = new Set()) { hubs.forEach((h) => h.req.forEach((r) => { const p = hubOf[r]; if (p && !s.has(p)) { s.add(p); ancestorsC([p], s); } })); return s; }
  function depth(h, memo = {}) { if (memo[h.cid] != null) return memo[h.cid]; return (memo[h.cid] = h.req.length ? 1 + Math.max(...h.req.map((r) => depth(hubOf[r], memo))) : 0); }
  const hubChip = (h) => `<button type="button" class="gv-chip" data-go="${esc(h.id)}"><i class="hubdot" style="border-color:${COLORS[h.main]}"></i>${esc(h.name)}${st(h).p >= 1 ? " ✓" : ""}</button>`;
  const badge = (id) => { const s = blockStatus(id); return (s.seen ? '<span class="ok" title="봄">✓</span>' : '<span class="no" title="아직 안 봄">○</span>') + (s.wrong ? '<span class="bad" title="오답노트에 있음">✗</span>' : "") + (s.noted ? '<span class="memo" title="메모·형광펜">●</span>' : ""); };
  const blockLi = (id) => { const n = all.get(id); if (!n) return ""; return `<li><span class="bd">${badge(id)}</span><a href="${blockHref(n)}">${n.kind !== "card" ? `<b class="k">${KIND[n.kind]}</b>` : ""}${esc(n.name)}</a><span class="mono">${esc(n.w.c.name)} ${n.w.ch.n}.${n.w.s.n} ${esc(n.w.s.title)}</span></li>`; };
  const localBox = () => `<div class="gv-local"><label><input type="checkbox" id="gv-local" ${local ? "checked" : ""}> 로컬 그래프</label>
    <label class="mono">깊이 <input type="range" id="gv-depth" min="1" max="3" step="1" value="${local ? local.depth : 2}"> <output>${local ? local.depth : 2}</output></label></div>`;

  function select(n, center) {
    selected = n; pathSet = null;
    if (!n) { panel.hidden = true; if (local) { local = null; refilter(); } history.replaceState(null, "", location.pathname); wake(); return; }
    const s = st(n);
    if (n.type === "course") {
      const c = n.course, sec = (ch, se) => { const ids = se.items.filter((it) => it.kind !== "video").map((it) => it.id), seen = ids.filter((id) => blockStatus(id).seen).length; return `<li><a href="c/${c.id}/${ch.n}-${se.n}.html">${ch.n}.${se.n} ${esc(se.title)}</a><span class="mono">${seen}/${ids.length}</span></li>`; };
      detail.innerHTML = `
        <p class="mono gv-course"><span style="color:${COLORS[n.main]}">과목</span> · 절 ${c.chapters.reduce((a, ch) => a + ch.sections.length, 0)}개 · 블록 ${n.blocks.length}개 · 개념 ${n.hubs.length}개</p>
        <h2>${esc(n.name)}</h2>
        <p class="gv-prog">카드·읽기 ${s.seen}개 봄 (${Math.round(s.p * 100)} %)${s.qs ? ` · 확인 문제 ${s.qs}개 중 ${s.qok}개 맞힘` : ""}${s.wrong ? ` · <span class="bad">오답 ${s.wrong}개</span>` : ""}</p>
        ${localBox()}
        ${c.chapters.map((ch) => `<h3>${ch.n}. ${esc(ch.title)}</h3><ul class="gv-blocks gv-secs">${ch.sections.map((se) => sec(ch, se)).join("")}</ul>`).join("")}`;
    } else if (n.type === "block") {
      const hubs = n.concepts, reqs = [...new Set(hubs.flatMap((h) => h.req.map((r) => hubOf[r])))], kids = [...new Set(hubs.flatMap((h) => h.kidsC))];
      const same = [...new Set(hubs.flatMap((h) => h.blocks))].filter((b) => b !== n.id);
      detail.innerHTML = `
        <p class="mono gv-course"><span style="color:${COLORS[n.main]}">${esc(n.w.c.name)}</span> · ${n.w.ch.n}.${n.w.s.n} ${esc(n.w.s.title)} · ${KIND[n.kind]}</p>
        <h2>${esc(n.name)}</h2>
        <p class="gv-prog">${s.seen ? "<b>봄</b>" : "아직 안 봄"}${s.qs ? ` · 확인 문제 ${s.qok}/${s.qs} 맞힘` : ""}${s.wrong ? ` · <span class="bad">오답노트에 있음</span>` : ""}${s.noted ? " · 메모·형광펜 있음" : ""}</p>
        <a class="gv-open" href="${blockHref(n)}">${KIND[n.kind]} 열기 →</a>
        ${localBox()}
        <h3>속한 개념</h3><div class="gv-chips">${hubs.map(hubChip).join("") || '<span class="gv-none">없음</span>'}</div>
        ${same.length ? `<h3>같은 개념의 다른 블록</h3><ul class="gv-blocks">${same.map(blockLi).join("")}</ul>` : ""}
        <h3>먼저 알면 좋은 개념</h3>${reqs.length ? `<div class="gv-chips">${reqs.map(hubChip).join("")}</div>` : `<p class="gv-none">없음 — 여기서 시작해도 됩니다.</p>`}
        ${kids.length ? `<h3>이어지는 개념</h3><div class="gv-chips">${kids.map(hubChip).join("")}</div>` : ""}
        ${reqs.length ? `<button type="button" class="gv-path">여기까지 가는 길 보기</button><div class="gv-pathlist"></div>` : ""}`;
    } else {
      const reqs = n.req.map((r) => hubOf[r]);
      detail.innerHTML = `
        <p class="mono gv-course">개념 · ${Object.keys(n.courses).map((c) => `<span style="color:${COLORS[c]}">${esc(courseName[c])}</span>`).join(" · ")}</p>
        <h2>${esc(n.name)}</h2>
        <p class="gv-prog">블록 ${n.blocks.length}개 중 <b>${s.seen}</b>개 봄${s.qs ? ` · 확인 문제 ${s.qs}개 중 ${s.qok}개 맞힘` : ""}${s.wrong ? ` · <span class="bad">오답 ${s.wrong}개</span>` : ""}</p>
        ${localBox()}
        <ul class="gv-blocks">${n.blocks.map(blockLi).join("")}</ul>
        <h3>먼저 알면 좋은 개념</h3>${reqs.length ? `<div class="gv-chips">${reqs.map(hubChip).join("")}</div>` : `<p class="gv-none">없음 — 여기서 시작해도 됩니다.</p>`}
        ${n.kidsC.length ? `<h3>이어지는 개념</h3><div class="gv-chips">${n.kidsC.map(hubChip).join("")}</div>` : ""}
        ${reqs.length ? `<button type="button" class="gv-path">여기까지 가는 길 보기</button><div class="gv-pathlist"></div>` : ""}`;
    }
    panel.hidden = false;
    if (local && local.center !== n) { local.center = n; refilter(); }
    history.replaceState(null, "", `?n=${encodeURIComponent(n.id)}`);
    if (center) {
      goal.k = Math.max(goal.k, 1.3); goal.x = n.x; goal.y = n.y;
      if (matchMedia("(max-width: 760px)").matches) goal.y += panel.offsetHeight / 2 / goal.k;
    }
    wake();
  }
  detail.addEventListener("click", (e) => {
    const go = e.target.closest("button[data-go]");
    if (go) {
      const n = all.get(go.dataset.go);
      if (n && !nodes.includes(n)) { if (n.type === "course") set.courses = true; else set.hubs = true; saveSet(); syncControls(); rebuild(); }   // 숨긴 종류의 점을 누르면 다시 켠다
      select(n, true); return;
    }
    if (e.target.closest(".gv-path")) {
      const n = selected, start = n.type === "hub" ? [n] : n.type === "course" ? n.hubs : n.concepts, anc = ancestorsC(start), memo = {};
      if (local) { local = null; refilter(); }
      const list = [...anc].sort((a, b) => depth(a, memo) - depth(b, memo) || a.name.localeCompare(b.name, "ko"));
      pathSet = new Set([n, ...start, ...anc]);
      [...anc, ...start].forEach((h) => h.blocks.forEach((b) => pathSet.add(all.get(b))));
      detail.querySelector(".gv-pathlist").innerHTML = `<ol class="gv-steps">${list.concat(start).map((h) => `<li>${hubChip(h)}</li>`).join("")}</ol>
        <p class="gv-none">위에서부터 차례로 보면 됩니다. ✓는 모든 블록을 본 개념입니다.</p>`;
      fitTo([...pathSet].filter((m) => nodes.includes(m)), 60); wake();
    }
  });
  detail.addEventListener("input", (e) => {
    if (e.target.id === "gv-local" || e.target.id === "gv-depth") {
      const on = detail.querySelector("#gv-local").checked, dep = +detail.querySelector("#gv-depth").value;
      detail.querySelector(".gv-local output").textContent = dep;
      local = on && selected ? { center: selected, depth: dep } : null;
      pathSet = null; refilter();
      setTimeout(() => fitTo([...shown], 80), on ? 600 : 900);
    }
  });

  /* ───── 시작: ?n=블록 id 또는 c:개념 id, ?c=개념 id(예전 주소), ?sec=과목-대단원-절 ───── */
  rebuild();
  for (let i = 0; i < 80; i++) tick();
  const params = new URLSearchParams(location.search);
  nextFrame(() => {
    resize();
    goal.k = view.k = 0.8;
    wake();
    setTimeout(() => {
      const id = params.get("n") || (params.get("c") ? "c:" + params.get("c") : null), sec = params.get("sec");
      if (id && all.has(id)) { const n = all.get(id); if (!nodes.includes(n)) { if (n.type === "course") set.courses = true; else set.hubs = true; syncControls(); rebuild(); } select(n, true); return; }
      if (sec) {
        const [cid, chn, sn] = sec.split("-");
        const list = nodes.filter((n) => n.type === "block" && n.w.c.id === cid && String(n.w.ch.n) === chn && String(n.w.s.n) === sn);
        if (list.length) {
          match = new Set(list); list.forEach((n) => n.concepts.forEach((h) => nodes.includes(h) && match.add(h)));   // 블록과 그 개념 허브
          const around = new Set(match); [...match].forEach((n) => n.nb.forEach((m) => around.add(m)));
          fitList = [...around]; fitTo(fitList, 80, 1.4);
          return;
        }
      }
      fitList = nodes; fitTo(nodes, 50);
    }, 600);
  });
  if (St) St.onChange(() => { stCache = new Map(); if (selected) select(selected); wake(); });
})();
