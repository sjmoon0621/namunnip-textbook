/* 개념 지도 (graph.html). 데이터: js/graph-data.js(개념·선수 관계), js/toc.js(블록 위치), js/store.js(학습 기록)
   원 = 개념, 화살표 = 선수 개념 → 다음 개념. 배치는 과목별로 모이는 힘 기반 배치이고, 선수 개념이 위에 오도록 흐름을 준다. */
(() => {
  "use strict";
  if (!window.GRAPH || !window.TOC) return;
  const S = window.NMStore;
  const { F, fit } = NM;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const COLORS = { is1: "#3b7c2a", is2: "#23857f", phy: "#3f6fa3", chem: "#8a4fb0", bio: "#c0661d", earth: "#8d6b4a", extra: "#8d8d92" };
  const R = ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ"];

  /* ───── 데이터 준비 ───── */
  const where = {};
  const courseName = {};
  TOC.forEach((c) => { courseName[c.id] = c.name; c.chapters.forEach((ch) => ch.sections.forEach((s) => s.items.forEach((it) => { where[it.id] = { c, ch, s, it }; }))); });
  const nodes = GRAPH.map((g) => {
    const courses = {};
    g.blocks.forEach((b) => { const w = where[b]; if (w) courses[w.c.id] = (courses[w.c.id] || 0) + 1; });
    const main = Object.entries(courses).sort((a, b) => b[1] - a[1])[0]?.[0] || "extra";
    return { ...g, courses, main, r: 7 + 2.4 * Math.sqrt(g.blocks.length), x: 0, y: 0, vx: 0, vy: 0, kids: [] };
  });
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = [];
  nodes.forEach((n) => n.req.forEach((r) => { if (byId[r]) { edges.push({ a: byId[r], b: n }); byId[r].kids.push(n); } }));

  /* ───── 배치 (시드 고정이라 매번 같은 모양) ───── */
  const ORDER = ["is1", "phy", "chem", "is2", "bio", "earth", "extra"];
  const centers = {};
  ORDER.forEach((c, i) => {
    const a = -Math.PI / 2 + (i / (ORDER.length - 1)) * Math.PI * 2 * (c === "extra" ? 0.97 : 1);
    centers[c] = c === "extra" ? { x: 520, y: 600 } : { x: Math.cos(a) * 760, y: Math.sin(a) * 560 };
  });
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  nodes.forEach((n) => { const c = centers[n.main]; n.x = c.x + (rnd() - 0.5) * 220; n.y = c.y + (rnd() - 0.5) * 220; });
  function simulate(steps) {
    for (let t = 0; t < steps; t++) {
      const cool = 1 - t / steps;
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y; const d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2);
        const f = 9000 / d2; dx /= d; dy /= d;
        a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
        const min = a.r + b.r + 44;   // 겹침 방지
        if (d < min) { const p = (min - d) * 0.5; a.vx -= dx * p; a.vy -= dy * p; b.vx += dx * p; b.vy += dy * p; }
      }
      edges.forEach(({ a, b }) => {
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, k = (d - 110) * 0.03;
        a.vx += dx / d * k; a.vy += dy / d * k; b.vx -= dx / d * k; b.vy -= dy / d * k;
        // 흐름: 다음 개념이 선수 개념보다 아래에 오도록
        const gap = b.y - a.y - 55; if (gap < 0) { a.vy += gap * 0.04; b.vy -= gap * 0.04; }
      });
      nodes.forEach((n) => {
        const c = centers[n.main];
        n.vx += (c.x - n.x) * 0.01; n.vy += (c.y - n.y) * 0.01;
        n.x += Math.max(-30, Math.min(30, n.vx)) * cool; n.y += Math.max(-30, Math.min(30, n.vy)) * cool;
        n.vx *= 0.55; n.vy *= 0.55;
      });
    }
  }
  simulate(500);

  /* ───── 학습 상태 ───── */
  function status(n) {
    let seen = 0, wrong = 0, noted = 0, qs = 0, qok = 0;
    n.blocks.forEach((b) => {
      const r = S && S.get(b); if (!r) return;
      if (r.seen) seen++;
      if (r.note || (r.hl && r.hl.length)) noted++;
      (r.quiz || []).forEach((q) => { if (!q) return; qs++; if (q.ok) qok++; if (q.firstOk === false && !q.resolved) wrong++; });
    });
    return { seen, wrong, noted, qs, qok, p: n.blocks.length ? seen / n.blocks.length : 0 };
  }

  /* ───── 그리기 ───── */
  const cv = document.getElementById("gv-canvas");
  const { ctx, size } = fit(cv, () => draw());
  const view = { x: 0, y: 0, k: 0.7 };
  let hover = null, selected = null, pathSet = null, match = null;
  const hidden = new Set();
  const toScreen = (x, y) => [(x - view.x) * view.k + size.w / 2, (y - view.y) * view.k + size.h / 2];
  const toWorld = (sx, sy) => [(sx - size.w / 2) / view.k + view.x, (sy - size.h / 2) / view.k + view.y];
  let raf = 0; const redraw = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };

  function visible(n) { return !Object.keys(n.courses).every((c) => hidden.has(c)); }
  function emphasis(n) {
    if (pathSet) return pathSet.has(n.id) ? 1 : 0.15;
    if (match) return match.has(n.id) ? 1 : 0.15;
    if (!visible(n)) return 0.12;
    const focus = hover || selected;
    if (focus) return n === focus || focus.req.includes(n.id) || focus.kids.includes(n) ? 1 : 0.3;
    return 1;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const focus = hover || selected;
    // 화살표
    edges.forEach((e) => {
      const al = Math.min(emphasis(e.a), emphasis(e.b));
      let col = "rgba(93,93,97," + (0.28 * al + 0.04) + ")", lw = 1;
      if (pathSet && pathSet.has(e.a.id) && pathSet.has(e.b.id)) { col = "rgba(181,83,47,.85)"; lw = 2; }
      else if (focus && e.b === focus) { col = "rgba(181,83,47,.9)"; lw = 2; }
      else if (focus && e.a === focus) { col = "rgba(59,124,42,.9)"; lw = 2; }
      const [x1, y1] = toScreen(e.a.x, e.a.y), [x2, y2] = toScreen(e.b.x, e.b.y);
      const d = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / d, uy = (y2 - y1) / d;
      const ra = e.a.r * view.k + 2, rb = e.b.r * view.k + 3;
      const sx = x1 + ux * ra, sy = y1 + uy * ra, ex = x2 - ux * rb, ey = y2 - uy * rb;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      const ah = 5 + lw * 1.5;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - ux * ah - uy * ah * 0.55, ey - uy * ah + ux * ah * 0.55); ctx.lineTo(ex - ux * ah + uy * ah * 0.55, ey - uy * ah - ux * ah * 0.55); ctx.closePath(); ctx.fill();
    });
    // 원
    nodes.forEach((n) => {
      const [x, y] = toScreen(n.x, n.y), r = n.r * view.k, st = status(n), al = emphasis(n);
      ctx.globalAlpha = al;
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      if (st.p > 0) {
        ctx.fillStyle = COLORS[n.main]; ctx.globalAlpha = al * 0.75;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * st.p); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = al;
      }
      // 테두리: 과목별로 나눈 고리
      const cs = Object.entries(n.courses); const tot = cs.reduce((a, [, v]) => a + v, 0) || 1;
      let a0 = -Math.PI / 2;
      (cs.length ? cs : [[n.main, 1]]).forEach(([c, v]) => {
        const a1 = a0 + Math.PI * 2 * v / tot;
        ctx.strokeStyle = COLORS[c]; ctx.lineWidth = n === selected ? 4 : 2.4;
        ctx.beginPath(); ctx.arc(x, y, r, a0, a1); ctx.stroke(); a0 = a1;
      });
      if (st.wrong) { ctx.fillStyle = "#c9463d"; ctx.beginPath(); ctx.arc(x + r * 0.75, y - r * 0.75, Math.max(3.5, r * 0.28), 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2; ctx.stroke(); }
      ctx.globalAlpha = 1;
    });
    // 이름: 중요한 것부터 그리고, 이미 그린 이름과 겹치면 건너뛴다
    const boxes = [];
    const pri = (n) => (n === focus ? 1e6 : 0) + (match && match.has(n.id) ? 1e5 : 0) + (pathSet && pathSet.has(n.id) ? 1e5 : 0)
      + (focus && (focus.req.includes(n.id) || focus.kids.includes(n)) ? 1e4 : 0) + n.r;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    [...nodes].sort((a, b) => pri(b) - pri(a)).forEach((n) => {
      const al = emphasis(n); if (al < 0.5 && n !== focus) return;
      const forced = pri(n) >= 1e4;
      if (!forced && view.k < 0.45) return;
      const [x, y] = toScreen(n.x, n.y), r = n.r * view.k;
      ctx.font = `${n === focus ? 700 : 500} ${n === focus ? 13.5 : 12}px ${F.sans}`;
      const tw = ctx.measureText(n.name).width, bx = { x0: x - tw / 2 - 2, x1: x + tw / 2 + 2, y0: y + r + 3, y1: y + r + 19 };
      if (!forced && boxes.some((b) => bx.x0 < b.x1 && bx.x1 > b.x0 && bx.y0 < b.y1 && bx.y1 > b.y0)) return;
      boxes.push(bx);
      ctx.globalAlpha = al;
      ctx.lineWidth = 3.5; ctx.strokeStyle = "rgba(243,244,239,.95)"; ctx.strokeText(n.name, x, y + r + 4);
      ctx.fillStyle = "#232326"; ctx.fillText(n.name, x, y + r + 4);
      ctx.globalAlpha = 1;
    });
    ctx.textBaseline = "alphabetic";
  }

  /* ───── 화면 맞추기 ───── */
  function fitTo(list, pad = 60) {
    if (!list.length || !size.w) return;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    list.forEach((n) => { x0 = Math.min(x0, n.x - n.r); x1 = Math.max(x1, n.x + n.r); y0 = Math.min(y0, n.y - n.r); y1 = Math.max(y1, n.y + n.r + 18); });
    view.x = (x0 + x1) / 2; view.y = (y0 + y1) / 2;
    view.k = Math.min(1.6, Math.max(0.25, Math.min((size.w - pad * 2) / Math.max(1, x1 - x0), (size.h - pad * 2) / Math.max(1, y1 - y0))));
    redraw();
  }

  /* ───── 조작: 이동, 확대, 끌기, 선택 ───── */
  const pointers = new Map(); let drag = null, pinch = null, moved = false;
  const hit = (sx, sy) => {
    const [wx, wy] = toWorld(sx, sy); let best = null, bd = Infinity;
    nodes.forEach((n) => { const d = Math.hypot(n.x - wx, n.y - wy); if (d < n.r + 6 / view.k && d < bd) { bd = d; best = n; } });
    return best;
  };
  const local = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener("pointerdown", (e) => {
    cv.setPointerCapture(e.pointerId); pointers.set(e.pointerId, local(e)); moved = false;
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: view.k }; drag = null; return; }
    const [sx, sy] = local(e), n = hit(sx, sy);
    drag = n ? { node: n, sx, sy } : { pan: true, sx, sy, vx: view.x, vy: view.y };
  });
  cv.addEventListener("pointermove", (e) => {
    const p = local(e);
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);
    if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; view.k = Math.min(3, Math.max(0.2, pinch.k * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d)); moved = true; redraw(); return; }
    if (drag) {
      const dx = p[0] - drag.sx, dy = p[1] - drag.sy;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      if (!moved) return;
      if (drag.pan) { view.x = drag.vx - dx / view.k; view.y = drag.vy - dy / view.k; }
      else { const [wx, wy] = toWorld(p[0], p[1]); drag.node.x = wx; drag.node.y = wy; }
      redraw(); return;
    }
    const n = hit(p[0], p[1]);
    if (n !== hover) { hover = n; cv.style.cursor = n ? "pointer" : "grab"; redraw(); }
  });
  const up = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (drag && !moved) { const n = drag.pan ? null : drag.node; select(n); }
    drag = null;
  };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("pointerleave", () => { if (hover) { hover = null; redraw(); } });
  cv.addEventListener("wheel", (e) => {
    e.preventDefault();
    const [sx, sy] = local(e), [wx, wy] = toWorld(sx, sy);
    view.k = Math.min(3, Math.max(0.2, view.k * Math.exp(-e.deltaY * 0.0015)));
    view.x = wx - (sx - size.w / 2) / view.k; view.y = wy - (sy - size.h / 2) / view.k;
    redraw();
  }, { passive: false });
  document.querySelectorAll(".gv-zoom button").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.z === "fit") { pathSet = null; match = null; fitTo(nodes.filter(visible)); return; }
    view.k = Math.min(3, Math.max(0.2, view.k * (b.dataset.z === "in" ? 1.3 : 1 / 1.3))); redraw();
  }));

  /* ───── 과목 필터 ───── */
  const cbox = document.getElementById("gv-courses");
  cbox.innerHTML = TOC.map((c) => `<button type="button" class="chip" aria-pressed="true" data-c="${c.id}"><i style="background:${COLORS[c.id]}"></i>${esc(c.name)}</button>`).join("");
  cbox.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-c]"); if (!b) return;
    const c = b.dataset.c, on = b.getAttribute("aria-pressed") === "true";
    // 모두 켜져 있을 때 누르면 그 과목만 보기, 아니면 켜고 끄기
    const all = [...cbox.querySelectorAll("button")];
    if (hidden.size === 0) { all.forEach((x) => { if (x.dataset.c !== c) { hidden.add(x.dataset.c); x.setAttribute("aria-pressed", "false"); } }); }
    else if (on) { hidden.add(c); b.setAttribute("aria-pressed", "false"); if (hidden.size === all.length) { hidden.clear(); all.forEach((x) => x.setAttribute("aria-pressed", "true")); } }
    else { hidden.delete(c); b.setAttribute("aria-pressed", "true"); }
    pathSet = null; match = null;
    fitTo(nodes.filter(visible));
  });

  /* ───── 찾기 ───── */
  const search = document.getElementById("gv-search");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    if (!q) { match = null; redraw(); return; }
    match = new Set(nodes.filter((n) => n.name.toLowerCase().includes(q) || n.blocks.some((b) => where[b] && where[b].it.title.toLowerCase().includes(q))).map((n) => n.id));
    pathSet = null; redraw();
  });
  search.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !match || !match.size) return;
    const list = nodes.filter((n) => match.has(n.id));
    list.length === 1 ? select(list[0], true) : fitTo(list, 90);
  });

  /* ───── 상세 패널 ───── */
  const panel = document.getElementById("gv-panel"), detail = document.getElementById("gv-detail");
  panel.querySelector(".gv-close").addEventListener("click", () => select(null));
  function ancestors(n, set = new Set()) { n.req.forEach((r) => { if (!set.has(r)) { set.add(r); ancestors(byId[r], set); } }); return set; }
  function depth(n, memo = {}) { if (memo[n.id] != null) return memo[n.id]; return (memo[n.id] = n.req.length ? 1 + Math.max(...n.req.map((r) => depth(byId[r], memo))) : 0); }
  const chip = (n) => `<button type="button" class="gv-chip" data-go="${n.id}" style="--c:${COLORS[n.main]}">${esc(n.name)}${status(n).p >= 1 ? " ✓" : ""}</button>`;
  function select(n, center) {
    selected = n; pathSet = null;
    if (!n) { panel.hidden = true; redraw(); history.replaceState(null, "", location.pathname); return; }
    const st = status(n);
    const blocks = n.blocks.map((b) => {
      const w = where[b]; if (!w) return "";
      const r = S && S.get(b) || {};
      const q = (r.quiz || []).filter(Boolean);
      const badge = [r.seen ? '<span class="ok" title="봄">✓</span>' : '<span class="no" title="아직 안 봄">○</span>',
        q.some((x) => x.firstOk === false && !x.resolved) ? '<span class="bad" title="오답노트에 있음">✗</span>' : "",
        r.note || (r.hl && r.hl.length) ? '<span class="memo" title="메모·형광펜">●</span>' : ""].join("");
      return `<li>${badge}<a href="c/${w.c.id}/${w.ch.n}-${w.s.n}.html#${b}">${w.it.kind === "video" ? "<b class=\"k\">영상</b>" : w.it.kind === "text" ? "<b class=\"k\">읽기</b>" : ""}${esc(w.it.title)}</a>
        <span class="mono">${esc(w.c.name)} ${w.ch.n}.${w.s.n} ${esc(w.s.title)}</span></li>`;
    }).join("");
    const reqs = n.req.map((r) => byId[r]), kids = n.kids;
    detail.innerHTML = `
      <p class="mono gv-course">${Object.keys(n.courses).map((c) => `<span style="color:${COLORS[c]}">${esc(courseName[c])}</span>`).join(" · ")}</p>
      <h2>${esc(n.name)}</h2>
      <p class="gv-prog">카드 ${n.blocks.length}개 중 <b>${st.seen}</b>개 봄${st.qs ? ` · 확인 문제 ${st.qs}개 중 ${st.qok}개 맞힘` : ""}${st.wrong ? ` · <span class="bad">오답 ${st.wrong}개</span>` : ""}</p>
      <ul class="gv-blocks">${blocks}</ul>
      ${reqs.length ? `<h3>먼저 알면 좋은 개념</h3><div class="gv-chips">${reqs.map(chip).join("")}</div>` : `<h3>먼저 알면 좋은 개념</h3><p class="dim small">없음 — 여기서 시작해도 됩니다.</p>`}
      ${kids.length ? `<h3>이어지는 개념</h3><div class="gv-chips">${kids.map(chip).join("")}</div>` : ""}
      ${reqs.length ? `<button type="button" class="btn ghost gv-path">여기까지 가는 길 보기</button><div class="gv-pathlist"></div>` : ""}`;
    panel.hidden = false;
    history.replaceState(null, "", `?c=${n.id}`);
    if (center) {
      view.k = Math.max(view.k, 0.9); view.x = n.x; view.y = n.y;
      // 좁은 화면에서는 패널이 아래를 덮으므로 노드를 패널 위쪽 가운데로
      if (matchMedia("(max-width: 760px)").matches) view.y += panel.offsetHeight / 2 / view.k;
    }
    redraw();
  }
  detail.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) { select(byId[go.dataset.go], true); return; }
    if (e.target.closest(".gv-path")) {
      const n = selected, anc = ancestors(n), memo = {};
      pathSet = new Set([...anc, n.id]);
      const list = [...anc].map((id) => byId[id]).sort((a, b) => depth(a, memo) - depth(b, memo) || a.name.localeCompare(b.name, "ko"));
      detail.querySelector(".gv-pathlist").innerHTML = `<ol class="gv-steps">${list.map((m) => `<li>${chip(m)}</li>`).join("")}<li>${chip(n)}</li></ol>
        <p class="dim small">위에서부터 차례로 보면 됩니다. ✓는 모든 카드를 본 개념입니다.</p>`;
      fitTo(list.concat(n), 70);
    }
  });

  /* ───── 시작: ?c=개념 또는 ?sec=과목-대단원-절 ───── */
  const params = new URLSearchParams(location.search);
  requestAnimationFrame(() => {
    fitTo(nodes);
    const c = params.get("c"), sec = params.get("sec");
    if (c && byId[c]) select(byId[c], true);
    else if (sec) {
      const [cid, chn, sn] = sec.split("-");
      const ids = new Set(Object.entries(where).filter(([, w]) => w.c.id === cid && String(w.ch.n) === chn && String(w.s.n) === sn).map(([id]) => id));
      const list = nodes.filter((n) => n.blocks.some((b) => ids.has(b)));
      if (list.length) {
        match = new Set(list.map((n) => n.id));
        const around = new Set(list); list.forEach((n) => { n.req.forEach((r) => around.add(byId[r])); n.kids.forEach((k) => around.add(k)); });
        fitTo([...around], 80);
        if (list.length === 1) select(list[0]);
      }
    }
  });
  if (S) S.onChange(() => { redraw(); if (selected) select(selected); });
})();
