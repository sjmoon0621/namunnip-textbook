/* 개념 지도 (graph.html) — Obsidian 그래프 뷰처럼 계속 움직이는 힘 기반 배치.
   데이터: js/graph-data.js(개념·선수 관계), js/toc.js(블록 위치), js/store.js(학습 기록)
   힘: 서로 밀어내기(전하), 선의 스프링, 중심으로 당기기, 겹침 막기. alpha가 식으면 멈추고, 끌면 다시 데운다(d3-force 방식). */
(() => {
  "use strict";
  if (!window.GRAPH || !window.TOC) return;
  const St = window.NMStore;
  const { F } = NM;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const COLORS = { is1: "#86c36f", is2: "#4fc1b6", phy: "#6ea4e6", chem: "#b58de3", bio: "#e89a55", earth: "#caa47c", extra: "#9a9aa0" };
  const ACCENT = "#a78bfa";

  /* ───── 설정 (이 브라우저에만 기억) ───── */
  const DEFAULTS = { orphans: true, color: "course", arrows: false, textFade: 0.55, nodeSize: 1, linkWidth: 1, center: 0.5, repel: 5, linkForce: 0.5, linkDist: 55 };
  let set = { ...DEFAULTS };
  try { Object.assign(set, JSON.parse(localStorage.getItem("namunnip-graph-settings") || "{}")); } catch (e) { /* 무시 */ }
  const saveSet = () => { try { localStorage.setItem("namunnip-graph-settings", JSON.stringify(set)); } catch (e) { /* 무시 */ } };

  /* ───── 데이터 ───── */
  const where = {}, courseName = {};
  TOC.forEach((c) => { courseName[c.id] = c.name; c.chapters.forEach((ch) => ch.sections.forEach((s) => s.items.forEach((it) => { where[it.id] = { c, ch, s, it }; }))); });
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ORDER = ["is1", "phy", "chem", "is2", "bio", "earth", "extra"], count = {};
  const nodes = GRAPH.map((g) => {
    const courses = {};
    g.blocks.forEach((b) => { const w = where[b]; if (w) courses[w.c.id] = (courses[w.c.id] || 0) + 1; });
    const main = Object.entries(courses).sort((a, b) => b[1] - a[1])[0]?.[0] || "extra";
    // 과목마다 자리를 나눠 해바라기 모양으로 놓고 시작한다 (선이 덜 엉킨다)
    const i = (count[main] = (count[main] || 0) + 1), ca = ORDER.indexOf(main) / ORDER.length * Math.PI * 2;
    const a = i * 2.39996, rad = 9 * Math.sqrt(i);
    return { ...g, courses, main, x: Math.cos(ca) * 170 + Math.cos(a) * rad, y: Math.sin(ca) * 170 + Math.sin(a) * rad, vx: 0, vy: 0, kids: [], nb: new Set(), fx: null, fy: null };
  });
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const links = [];
  nodes.forEach((n) => n.req.forEach((r) => { const a = byId[r]; if (!a) return; links.push({ a, b: n }); a.kids.push(n); a.nb.add(n); n.nb.add(a); }));
  nodes.forEach((n) => { n.deg = n.nb.size; n.base = 3 + Math.sqrt(n.deg) * 1.6 + Math.sqrt(n.blocks.length) * 1.2; });

  /* ───── 학습 상태 ───── */
  function status(n) {
    let seen = 0, wrong = 0, qs = 0, qok = 0;
    n.blocks.forEach((b) => {
      const r = St && St.get(b); if (!r) return;
      if (r.seen) seen++;
      (r.quiz || []).forEach((q) => { if (!q) return; qs++; if (q.ok) qok++; if (q.firstOk === false && !q.resolved) wrong++; });
    });
    return { seen, wrong, qs, qok, p: n.blocks.length ? seen / n.blocks.length : 0 };
  }
  let stCache = new Map();
  const st = (n) => { if (!stCache.has(n)) stCache.set(n, status(n)); return stCache.get(n); };
  const mix = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };
  function nodeColor(n) {
    if (set.color === "progress") { const s = st(n); return s.p <= 0 ? "#5c5c63" : mix("#6b7a5e", "#8fd16f", s.p); }
    return COLORS[n.main];
  }

  /* ───── 보이는 노드 (과목 필터, 연결 없는 개념, 로컬 그래프) ───── */
  const hiddenCourses = new Set();
  let local = null;   // { center, depth }
  let shown = new Set(nodes);
  function refilter() {
    let pool = nodes.filter((n) => !Object.keys(n.courses).every((c) => hiddenCourses.has(c)));
    if (!set.orphans) pool = pool.filter((n) => [...n.nb].some((m) => pool.includes(m)));
    if (local) {
      const keep = new Set([local.center]); let front = [local.center];
      for (let d = 0; d < local.depth; d++) { const nx = []; front.forEach((n) => n.nb.forEach((m) => { if (!keep.has(m)) { keep.add(m); nx.push(m); } })); front = nx; }
      pool = pool.filter((n) => keep.has(n));
      if (!pool.includes(local.center)) pool.push(local.center);
    }
    shown = new Set(pool);
    heat(0.6);
  }

  /* ───── 물리 ───── */
  let alpha = 1, alphaTarget = 0;
  const heat = (a) => { alpha = Math.max(alpha, a); wake(); };
  function tick() {
    alpha += (alphaTarget - alpha) * 0.0228;
    const list = nodes.filter((n) => shown.has(n));
    // 서로 밀어내기
    const q = -set.repel * 30;
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
      if (d2 < 1) { dx = rnd() - 0.5; dy = rnd() - 0.5; d2 = dx * dx + dy * dy; }
      if (d2 > 250000) continue;
      const f = q * alpha / d2;
      a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      const min = (a.base + b.base) * set.nodeSize + 4, d = Math.sqrt(d2);   // 겹침 막기
      if (d < min) { const p = (min - d) / d * 0.25; a.vx -= dx * p; a.vy -= dy * p; b.vx += dx * p; b.vy += dy * p; }
    }
    // 선의 스프링 (연결이 많은 쪽이 덜 움직임)
    links.forEach(({ a, b }) => {
      if (!shown.has(a) || !shown.has(b)) return;
      let dx = b.x + b.vx - a.x - a.vx, dy = b.y + b.vy - a.y - a.vy; const l = Math.hypot(dx, dy) || 1;
      const k = (l - set.linkDist) / l * alpha * set.linkForce / Math.min(a.deg, b.deg);
      dx *= k; dy *= k; const bias = a.deg / (a.deg + b.deg);
      b.vx -= dx * bias; b.vy -= dy * bias; a.vx += dx * (1 - bias); a.vy += dy * (1 - bias);
    });
    // 중심으로
    const c = set.center * 0.06 * alpha;
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
  let hover = null, selected = null, match = null, pathSet = null, dragging = null;
  let touched = false, settled = false, fitList = null;   // 사용자가 화면을 건드리기 전이면, 자리를 잡은 뒤 한 번 더 맞춘다
  const fade = new Map();   // 노드별 강조 정도를 부드럽게 바꾼다

  function focusOf() { return dragging || hover || selected; }
  function targetEmph(n) {
    if (pathSet) return pathSet.has(n.id) ? 1 : 0.12;
    if (match) return match.has(n.id) ? 1 : 0.12;
    const f = focusOf();
    if (f) return n === f || f.nb.has(n) ? 1 : 0.18;
    return 1;
  }
  const radius = (n) => n.base * set.nodeSize;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = focusOf();
    // 선
    links.forEach((L) => {
      const { a, b } = L; if (!shown.has(a) || !shown.has(b)) return;
      const e = Math.min(fade.get(a) ?? 1, fade.get(b) ?? 1);
      const hot = (f && (a === f || b === f)) || (pathSet && pathSet.has(a.id) && pathSet.has(b.id));
      const [x1, y1] = toS(a.x, a.y), [x2, y2] = toS(b.x, b.y);
      ctx.strokeStyle = hot ? ACCENT : `rgba(200,200,210,${0.08 + 0.2 * e})`;
      ctx.lineWidth = (hot ? 1.6 : 1) * set.linkWidth * Math.min(1.6, Math.max(0.6, view.k));
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      if (set.arrows || hot) {
        const d = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / d, uy = (y2 - y1) / d, rb = radius(b) * view.k + 2;
        const ex = x2 - ux * rb, ey = y2 - uy * rb, ah = 4 + 2 * set.linkWidth;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - ux * ah - uy * ah * 0.5, ey - uy * ah + ux * ah * 0.5); ctx.lineTo(ex - ux * ah + uy * ah * 0.5, ey - uy * ah - ux * ah * 0.5); ctx.closePath(); ctx.fill();
      }
    });
    // 점
    nodes.forEach((n) => {
      if (!shown.has(n)) return;
      const e = fade.get(n) ?? 1, [x, y] = toS(n.x, n.y), r = Math.max(1.5, radius(n) * view.k);
      ctx.globalAlpha = 0.1 + 0.9 * e;
      ctx.fillStyle = n === f ? ACCENT : nodeColor(n);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      const s = st(n);
      if (set.color === "course" && s.p > 0) {   // 본 만큼 흰 고리
        ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = Math.max(1.2, r * 0.22);
        ctx.beginPath(); ctx.arc(x, y, r + ctx.lineWidth, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.p); ctx.stroke();
      }
      if (s.wrong) { ctx.fillStyle = "#ff5f57"; ctx.beginPath(); ctx.arc(x + r * 0.8, y - r * 0.8, Math.max(2.5, r * 0.35), 0, Math.PI * 2); ctx.fill(); }
      if (n === selected) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 1;
    });
    // 글자: 확대할수록 나타난다. 초점과 그 이웃은 항상
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    const base = Math.max(0, Math.min(1, (view.k - set.textFade) / 0.35));
    const boxes = [];
    [...nodes].filter((n) => shown.has(n)).sort((a, b) => pri(b) - pri(a)).forEach((n) => {
      const forced = pri(n) >= 1e4, e = fade.get(n) ?? 1;
      const a = forced ? 1 : base * e;
      if (a < 0.03) return;
      const [x, y] = toS(n.x, n.y), r = radius(n) * view.k;
      const fs = Math.min(15, Math.max(10.5, 11.5 * Math.sqrt(view.k)));
      ctx.font = `${n === f ? 600 : 400} ${fs}px ${F.sans}`;
      const tw = ctx.measureText(n.name).width, bx = [x - tw / 2, x + tw / 2, y + r + 3, y + r + 5 + fs];
      if (!forced && boxes.some((b) => bx[0] < b[1] && bx[1] > b[0] && bx[2] < b[3] && bx[3] > b[2])) return;
      boxes.push(bx);
      ctx.globalAlpha = a; ctx.fillStyle = n === f ? "#ffffff" : "#d4d4d8";
      ctx.fillText(n.name, x, y + r + 4);
      ctx.globalAlpha = 1;
    });
  }
  function pri(n) {
    const f = focusOf();
    return (n === f ? 1e6 : 0) + (f && f.nb.has(n) ? 1e4 : 0) + (match && match.has(n.id) ? 1e5 : 0) + (pathSet && pathSet.has(n.id) ? 1e5 : 0) + n.base;
  }

  /* ───── 애니메이션 루프: 움직일 것이 있을 때만 돈다 ───── */
  let raf = 0;
  function wake() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame() {
    raf = 0;
    let busy = false;
    if (alpha > 0.004 || alphaTarget > 0) { tick(); busy = true; }
    if (!settled && alpha < 0.012) { settled = true; if (!touched && fitList) fitTo(fitList, fitList === nodes ? 40 : 90); }
    nodes.forEach((n) => { const t = targetEmph(n), c = fade.get(n) ?? 1; if (Math.abs(t - c) > 0.01) { fade.set(n, c + (t - c) * 0.18); busy = true; } else fade.set(n, t); });
    ["x", "y", "k"].forEach((k) => { const d = goal[k] - view[k]; if (Math.abs(d) > (k === "k" ? 0.0005 : 0.05)) { view[k] += d * 0.16; busy = true; } else view[k] = goal[k]; });
    draw();
    if (busy) wake();
  }

  function fitTo(list, pad = 60) {
    list = list.filter((n) => shown.has(n)); if (!list.length || !size.w) return;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    list.forEach((n) => { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y + 14); });
    goal.x = (x0 + x1) / 2; goal.y = (y0 + y1) / 2;
    goal.k = Math.min(2.2, Math.max(0.2, Math.min((size.w - pad * 2) / Math.max(40, x1 - x0), (size.h - pad * 2) / Math.max(40, y1 - y0))));
    wake();
  }

  /* ───── 조작 ───── */
  const pointers = new Map(); let drag = null, pinch = null, moved = false;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const hit = (sx, sy) => {
    const [wx, wy] = toW(sx, sy); let best = null, bd = Infinity;
    nodes.forEach((n) => { if (!shown.has(n)) return; const d = Math.hypot(n.x - wx, n.y - wy); if (d < radius(n) + 8 / view.k && d < bd) { bd = d; best = n; } });
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
    if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; goal.k = view.k = Math.min(4, Math.max(0.15, pinch.k * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d)); moved = true; wake(); return; }
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
  cv.addEventListener("wheel", (e) => {
    e.preventDefault(); hideHint(); touched = true;
    const [sx, sy] = pos(e), [wx, wy] = toW(sx, sy);
    const k = Math.min(4, Math.max(0.15, goal.k * Math.exp(-e.deltaY * 0.0018)));
    goal.k = k; goal.x = wx - (sx - size.w / 2) / k; goal.y = wy - (sy - size.h / 2) / k;
    wake();
  }, { passive: false });
  document.getElementById("gv-fit").addEventListener("click", () => { match = pathSet = null; fitTo(nodes); });

  /* ───── 찾기 ───── */
  const search = document.getElementById("gv-search");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    match = q ? new Set(nodes.filter((n) => n.name.toLowerCase().includes(q) || n.blocks.some((b) => where[b] && where[b].it.title.toLowerCase().includes(q))).map((n) => n.id)) : null;
    pathSet = null; wake();
  });
  search.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !match || !match.size) return;
    const list = nodes.filter((n) => match.has(n.id));
    list.length === 1 ? select(list[0], true) : fitTo(list, 90);
  });

  /* ───── 설정 패널 ───── */
  const gear = document.getElementById("gv-gear"), sp = document.getElementById("gv-settings");
  gear.addEventListener("click", () => { sp.hidden = !sp.hidden; gear.setAttribute("aria-expanded", String(!sp.hidden)); });
  function syncControls() {
    sp.querySelectorAll("[data-set]").forEach((el) => { const k = el.dataset.set; el.type === "checkbox" ? (el.checked = !!set[k]) : (el.value = set[k]); });
    sp.querySelectorAll("[data-color]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.color === set.color)));
    document.getElementById("gv-groups").innerHTML = set.color === "course"
      ? TOC.map((c) => `<li><i style="background:${COLORS[c.id]}"></i>${esc(c.name)}</li>`).join("") + `<li><i class="ring"></i>흰 고리: 본 카드 비율</li><li><i style="background:#ff5f57"></i>남은 오답</li>`
      : `<li><i style="background:#5c5c63"></i>아직 안 본 개념</li><li><i style="background:#6b7a5e"></i>조금 봄</li><li><i style="background:#8fd16f"></i>다 봄</li><li><i style="background:#ff5f57"></i>남은 오답</li>`;
  }
  sp.addEventListener("input", (e) => {
    const el = e.target.closest("[data-set]"); if (!el) return;
    const k = el.dataset.set;
    set[k] = el.type === "checkbox" ? el.checked : +el.value;
    saveSet();
    if (k === "orphans") refilter();
    else if (["center", "repel", "linkForce", "linkDist", "nodeSize"].includes(k)) heat(0.5);
    wake();
  });
  sp.addEventListener("click", (e) => {
    const b = e.target.closest("[data-color]"); if (!b) return;
    set.color = b.dataset.color; saveSet(); syncControls(); wake();
  });
  document.getElementById("gv-reset").addEventListener("click", () => { set = { ...DEFAULTS }; saveSet(); syncControls(); refilter(); });
  const cbox = document.getElementById("gv-courses");
  cbox.innerHTML = TOC.map((c) => `<button type="button" class="gv-course-chip" aria-pressed="true" data-c="${c.id}"><i style="background:${COLORS[c.id]}"></i>${esc(c.name)}</button>`).join("");
  cbox.addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    const c = b.dataset.c;
    hiddenCourses.has(c) ? hiddenCourses.delete(c) : hiddenCourses.add(c);
    if (hiddenCourses.size === TOC.length) hiddenCourses.clear();
    cbox.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(!hiddenCourses.has(x.dataset.c))));
    refilter(); setTimeout(() => fitTo([...shown]), 700);
  });
  syncControls();

  const hint = document.getElementById("gv-hint");
  function hideHint() { hint.classList.add("off"); }
  setTimeout(hideHint, 7000);

  /* ───── 상세 패널 ───── */
  const panel = document.getElementById("gv-panel"), detail = document.getElementById("gv-detail");
  panel.querySelector(".gv-close").addEventListener("click", () => select(null));
  function ancestors(n, s = new Set()) { n.req.forEach((r) => { if (!s.has(r)) { s.add(r); ancestors(byId[r], s); } }); return s; }
  function depth(n, memo = {}) { if (memo[n.id] != null) return memo[n.id]; return (memo[n.id] = n.req.length ? 1 + Math.max(...n.req.map((r) => depth(byId[r], memo))) : 0); }
  const chip = (n) => `<button type="button" class="gv-chip" data-go="${n.id}"><i style="background:${COLORS[n.main]}"></i>${esc(n.name)}${st(n).p >= 1 ? " ✓" : ""}</button>`;
  function select(n, center) {
    selected = n; pathSet = null;
    if (!n) { panel.hidden = true; if (local) { local = null; refilter(); } history.replaceState(null, "", location.pathname); wake(); return; }
    const s = st(n);
    const blocks = n.blocks.map((b) => {
      const w = where[b]; if (!w) return "";
      const r = St && St.get(b) || {};
      const q = (r.quiz || []).filter(Boolean);
      const badge = (r.seen ? '<span class="ok" title="봄">✓</span>' : '<span class="no" title="아직 안 봄">○</span>')
        + (q.some((x) => x.firstOk === false && !x.resolved) ? '<span class="bad" title="오답노트에 있음">✗</span>' : "")
        + (r.note || (r.hl && r.hl.length) ? '<span class="memo" title="메모·형광펜">●</span>' : "");
      return `<li><span class="bd">${badge}</span><a href="c/${w.c.id}/${w.ch.n}-${w.s.n}.html#${b}">${w.it.kind === "video" ? '<b class="k">영상</b>' : w.it.kind === "text" ? '<b class="k">읽기</b>' : ""}${esc(w.it.title)}</a>
        <span class="mono">${esc(w.c.name)} ${w.ch.n}.${w.s.n} ${esc(w.s.title)}</span></li>`;
    }).join("");
    const reqs = n.req.map((r) => byId[r]);
    detail.innerHTML = `
      <p class="mono gv-course">${Object.keys(n.courses).map((c) => `<span style="color:${COLORS[c]}">${esc(courseName[c])}</span>`).join(" · ")}</p>
      <h2>${esc(n.name)}</h2>
      <p class="gv-prog">카드 ${n.blocks.length}개 중 <b>${s.seen}</b>개 봄${s.qs ? ` · 확인 문제 ${s.qs}개 중 ${s.qok}개 맞힘` : ""}${s.wrong ? ` · <span class="bad">오답 ${s.wrong}개</span>` : ""}</p>
      <div class="gv-local"><label><input type="checkbox" id="gv-local" ${local ? "checked" : ""}> 로컬 그래프</label>
        <label class="mono">깊이 <input type="range" id="gv-depth" min="1" max="3" step="1" value="${local ? local.depth : 1}"> <output>${local ? local.depth : 1}</output></label></div>
      <ul class="gv-blocks">${blocks}</ul>
      <h3>먼저 알면 좋은 개념</h3>${reqs.length ? `<div class="gv-chips">${reqs.map(chip).join("")}</div>` : `<p class="gv-none">없음 — 여기서 시작해도 됩니다.</p>`}
      ${n.kids.length ? `<h3>이어지는 개념</h3><div class="gv-chips">${n.kids.map(chip).join("")}</div>` : ""}
      ${reqs.length ? `<button type="button" class="gv-path">여기까지 가는 길 보기</button><div class="gv-pathlist"></div>` : ""}`;
    panel.hidden = false;
    if (local && local.center !== n) { local.center = n; refilter(); }
    history.replaceState(null, "", `?c=${n.id}`);
    if (center) {
      goal.k = Math.max(goal.k, 1.1); goal.x = n.x; goal.y = n.y;
      if (matchMedia("(max-width: 760px)").matches) goal.y += panel.offsetHeight / 2 / goal.k;
    }
    wake();
  }
  detail.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) { select(byId[go.dataset.go], true); return; }
    if (e.target.closest(".gv-path")) {
      const n = selected, anc = ancestors(n), memo = {};
      if (local) { local = null; refilter(); detail.querySelector("#gv-local").checked = false; }
      pathSet = new Set([...anc, n.id]);
      const list = [...anc].map((id) => byId[id]).sort((a, b) => depth(a, memo) - depth(b, memo) || a.name.localeCompare(b.name, "ko"));
      detail.querySelector(".gv-pathlist").innerHTML = `<ol class="gv-steps">${list.map((m) => `<li>${chip(m)}</li>`).join("")}<li>${chip(n)}</li></ol>
        <p class="gv-none">위에서부터 차례로 보면 됩니다. ✓는 모든 카드를 본 개념입니다.</p>`;
      fitTo(list.concat(n), 70); wake();
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

  /* ───── 시작: 미리 조금 돌려 둔 뒤, 퍼져 나가며 자리 잡는 모습을 보여 준다 ───── */
  for (let i = 0; i < 60; i++) tick();
  const params = new URLSearchParams(location.search);
  requestAnimationFrame(() => {
    resize();
    goal.k = view.k = 0.9;
    wake();
    setTimeout(() => {
      const c = params.get("c"), sec = params.get("sec");
      if (c && byId[c]) { select(byId[c], true); return; }
      if (sec) {
        const [cid, chn, sn] = sec.split("-");
        const ids = new Set(Object.entries(where).filter(([, w]) => w.c.id === cid && String(w.ch.n) === chn && String(w.s.n) === sn).map(([id]) => id));
        const list = nodes.filter((n) => n.blocks.some((b) => ids.has(b)));
        if (list.length) {
          match = new Set(list.map((n) => n.id));
          const around = new Set(list); list.forEach((n) => n.nb.forEach((m) => around.add(m)));
          fitList = [...around]; fitTo(fitList, 90);
          if (list.length === 1) select(list[0]);
          return;
        }
      }
      fitList = nodes; fitTo(nodes, 40);
    }, 600);
  });
  if (St) St.onChange(() => { stCache = new Map(); if (selected) select(selected); wake(); });
})();
