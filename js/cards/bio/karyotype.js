/* 카드: 흩어진 염색체 사진으로 핵형을 맞출 수 있을까? — 중기 염색체를 끌어 1~22번·성염색체 자리에 놓고 핵형 판독
   길이: 사람 염색체 DNA 길이(Mb, GRCh38 어림), 동원체 위치: 짧은 팔 비율 어림. 띠무늬는 구별용 모식 */
(() => {
  const root = document.getElementById("card-bio-karyotype");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const LEN = { 1: 248, 2: 242, 3: 198, 4: 190, 5: 181, 6: 171, 7: 159, 8: 145, 9: 138, 10: 134, 11: 135, 12: 133, 13: 114, 14: 107, 15: 102, 16: 90, 17: 83, 18: 80, 19: 59, 20: 64, 21: 47, 22: 51, X: 156, Y: 57 };
  const PF = { 1: 0.48, 2: 0.39, 3: 0.46, 4: 0.28, 5: 0.27, 6: 0.36, 7: 0.37, 8: 0.31, 9: 0.33, 10: 0.30, 11: 0.39, 12: 0.27, 13: 0.15, 14: 0.15, 15: 0.16, 16: 0.42, 17: 0.31, 18: 0.24, 19: 0.45, 20: 0.43, 21: 0.22, 22: 0.24, X: 0.39, Y: 0.27 };
  const GRP = { A: [1, 3], B: [4, 5], C: [6, 12], D: [13, 15], E: [16, 18], F: [19, 20], G: [21, 22] };
  const ROWS = [["1", "2", "3", "4", "5"], ["6", "7", "8", "9", "10", "11", "12"], ["13", "14", "15", "16", "17", "18"], ["19", "20", "21", "22", "XY"]];
  const CASES = [
    { sex: ["X", "Y"], extra: [] },
    { sex: ["X", "X"], extra: ["21"] },
    { sex: ["X", "X"], extra: [] },
    { sex: ["X"], extra: [] },
    { sex: ["X", "X", "Y"], extra: [] },
  ];
  const CASE_NAME = ["정상 남성 46,XY", "다운 증후군 47,XX,+21", "정상 여성 46,XX", "터너 증후군 45,X", "클라인펠터 증후군 47,XXY"];

  /* 띠무늬(모식): 번호마다 같은 씨앗으로 만든 고정 무늬 → 상동 염색체는 같은 무늬 */
  const BANDS = {};
  Object.keys(LEN).forEach((id, k) => {
    let seed = 7 + k * 131;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const n = Math.max(2, Math.round(LEN[id] / 40)), out = [];
    for (let i = 0; i < n; i++) out.push([(i + 0.15 + 0.6 * rnd()) / n, 0.025 + 0.05 * rnd()]);
    BANDS[id] = out;
  });

  let ci = 0, chs = [], sel = null, drag = null, hover = null, showCheck = false, order = 0;
  const slotOf = (id) => (id === "X" || id === "Y" ? "XY" : id);
  function build(k) {
    const c = CASES[k], ids = [];
    for (let i = 1; i <= 22; i++) { ids.push(String(i), String(i)); }
    c.extra.forEach((e) => ids.push(e));
    c.sex.forEach((s) => ids.push(s));
    chs = ids.map((id) => ({ id, slot: null, u: 0, v: 0, rot: 0, x: 0, y: 0, ord: 0 }));
    scatter();
  }
  function scatter() {
    const free = chs.slice().sort(() => Math.random() - 0.5);
    const cols = 12, rows = Math.ceil(free.length / cols);
    free.forEach((c, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      c.slot = null;
      c.u = (col + 0.5 + (Math.random() - 0.5) * 0.35) / cols;
      c.v = (row + 0.5 + (Math.random() - 0.5) * 0.2) / rows;
      c.rot = (Math.random() - 0.5) * 0.9;
    });
    sel = null; showCheck = false;
  }

  const { ctx, size } = fit(cv, () => draw());
  let G = null;
  /* 배치 계산: 위쪽 흩어진 칸, 아래쪽 핵형 자리 */
  function layout() {
    const { w, h } = size;
    const rowsMb = ROWS.map((r) => {
      const ids = r.flatMap((s) => (s === "XY" ? ["X", "Y"] : [s]));
      return { p: Math.max(...ids.map((i) => LEN[i] * PF[i])), q: Math.max(...ids.map((i) => LEN[i] * (1 - PF[i]))) };
    });
    const lab = 16, gap = 8, sumMb = rowsMb.reduce((a, r) => a + r.p + r.q, 0);
    const kh = h * 0.5;
    const s = Math.min((kh - 10 - ROWS.length * (4 + lab + gap)) / sumMb, w / 900);
    const cw = clamp(w / 120, 3, 5);
    const sh = h - kh - 4;
    const slots = [];
    let y = sh + 6;
    ROWS.forEach((r, ri) => {
      const rm = rowsMb[ri], yc = y + rm.p * s + 2, bot = yc + rm.q * s + 2;
      const pad = 10, sw = (w - pad * 2) / r.length;
      r.forEach((sid, i) => slots.push({ id: sid, x: pad + i * sw + 3, y, w: sw - 6, h: bot - y + lab - 2, yc, base: bot }));
      y = bot + lab + gap;
    });
    G = { w, h, s, cw, sh, slots, spread: { x: 6, y: 22, w: w - 12, h: sh - 30 } };
  }
  const geom = (c) => ({ pL: LEN[c.id] * PF[c.id] * G.s, qL: LEN[c.id] * (1 - PF[c.id]) * G.s });

  function chromo(c, x, y, rot, mark) {
    const { pL, qL } = geom(c), cw = G.cw, gp = 0.7;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const shape = () => {
      ctx.beginPath();
      for (const sx of [-1, 1]) {
        const x0 = sx < 0 ? -cw - gp : gp;
        ctx.roundRect(x0, -pL, cw, pL - 1, Math.min(cw / 2, pL / 2));
        ctx.roundRect(x0, 1, cw, qL - 1, cw / 2);
      }
    };
    if (mark) { ctx.shadowColor = mark; ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = mark; shape(); ctx.stroke(); }
    ctx.fillStyle = "#d7c6e3"; shape(); ctx.fill();
    ctx.save(); shape(); ctx.clip();
    ctx.fillStyle = "#5e4378";
    const L = pL + qL;
    for (const [f, bw] of BANDS[c.id]) ctx.fillRect(-cw - 2, -pL + f * L, cw * 2 + 4, Math.max(1, bw * L));
    ctx.restore();
    ctx.strokeStyle = "#5e4378"; ctx.lineWidth = 0.8; shape(); ctx.stroke();
    ctx.fillStyle = "#5e4378"; ctx.fillRect(-cw * 0.6, -1.2, cw * 1.2, 2.4);
    ctx.restore();
  }
  const hits = (c, px, py) => {
    const { pL, qL } = geom(c), dx = px - c.x, dy = py - c.y, cs = Math.cos(-c.dr), sn = Math.sin(-c.dr);
    const lx = dx * cs - dy * sn, ly = dx * sn + dy * cs;
    return Math.abs(lx) <= G.cw + 5 && ly >= -pL - 5 && ly <= qL + 5;
  };
  const slotAt = (px, py) => G.slots.find((s) => px >= s.x && px <= s.x + s.w && py >= s.y - 4 && py <= s.y + s.h);

  function draw() {
    if (!size.w) return;
    layout();
    const { w, h, sh, spread } = G;
    ctx.clearRect(0, 0, w, h);
    // 흩어진 칸
    ctx.fillStyle = "#eef0ec"; ctx.beginPath(); ctx.roundRect(4, 4, w - 8, sh - 8, 8); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("중기 세포의 염색체 (모식)", 12, 17);
    // 핵형 자리
    const byslot = {};
    chs.forEach((c) => { if (c.slot && c !== (drag && drag.moved && drag.c)) (byslot[c.slot] = byslot[c.slot] || []).push(c); });
    let lastG = "";
    for (const s of G.slots) {
      const on = hover === s.id;
      ctx.fillStyle = on ? "rgba(116,171,102,.18)" : "rgba(0,0,0,.025)";
      ctx.strokeStyle = on ? C.forest : C.rule; ctx.lineWidth = on ? 1.5 : 1;
      ctx.beginPath(); ctx.roundRect(s.x, s.y, s.w, s.h, 4); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s.x + 6, s.base + 1.5); ctx.lineTo(s.x + s.w - 6, s.base + 1.5); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(s.id, s.x + s.w / 2, s.base + 14);
      const gn = s.id === "XY" ? "" : Object.keys(GRP).find((g) => +s.id >= GRP[g][0] && +s.id <= GRP[g][1]);
      if (gn && gn !== lastG) { ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(gn, s.x + 3, s.y + 10); lastG = gn; }
      const list = (byslot[s.id] || []).sort((a, b) => a.ord - b.ord);
      const step = Math.min(G.cw * 2 + 6, (s.w - 8) / Math.max(1, list.length));
      list.forEach((c, i) => { c.x = s.x + s.w / 2 + (i - (list.length - 1) / 2) * step; c.y = s.yc; c.dr = 0; });
      if (list.length && list.length !== 2) { ctx.fillStyle = C.warn; ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`${list.length}`, s.x + s.w - 3, s.y + 10); }
    }
    chs.forEach((c) => { if (!c.slot) { c.x = spread.x + c.u * spread.w; c.y = spread.y + c.v * spread.h; c.dr = c.rot; } });
    const markOf = (c) => (c === sel ? C.forest : showCheck && c.slot && c.slot !== slotOf(c.id) ? C.warn : showCheck && c.slot ? "rgba(59,124,42,.35)" : null);
    chs.forEach((c) => { if (!(drag && drag.moved && drag.c === c)) chromo(c, c.x, c.y, c.dr, markOf(c)); });
    if (drag && drag.moved) { ctx.globalAlpha = 0.9; chromo(drag.c, drag.c.x, drag.c.y, 0, C.forest); ctx.globalAlpha = 1; }
    report();
  }

  function report() {
    const left = chs.filter((c) => !c.slot).length, done = chs.length - left;
    $(".n-left").textContent = String(left);
    $(".n-done").textContent = `${done}`;
    const v = $(".verdict"), kar = $(".n-kar");
    const ok = chs.filter((c) => c.slot === slotOf(c.id)).length;
    if (left) {
      kar.textContent = "—"; kar.className = "n-kar";
      v.textContent = showCheck ? `지금까지 놓은 ${done}개 가운데 ${ok}개가 맞는 자리입니다. 빨간 테두리는 다른 번호 자리에 놓인 염색체입니다.` : "";
      v.className = "verdict small" + (showCheck && ok < done ? " bad" : "");
      return;
    }
    // 학생이 정리한 결과로 판독
    const cnt = {};
    chs.forEach((c) => { cnt[c.slot] = (cnt[c.slot] || 0) + 1; });
    const xy = chs.filter((c) => c.slot === "XY");
    const nX = xy.filter((c) => c.id === "X").length, nY = xy.filter((c) => c.id === "Y").length;
    const odd = [];
    for (let i = 1; i <= 22; i++) { const n = cnt[String(i)] || 0; if (n !== 2) odd.push([i, n]); }
    const sexs = "X".repeat(nX) + "Y".repeat(nY) || "—";
    const note = odd.map(([i, n]) => (n > 2 ? `+${i}`.repeat(n - 2) : `-${i}`.repeat(2 - n))).join(",");
    kar.textContent = `${chs.length},${sexs}${note ? "," + note : ""}`;
    const tri21 = odd.length === 1 && odd[0][0] === 21 && odd[0][1] === 3;
    let msg;
    if (odd.length && !tri21) msg = `${odd.map(([i, n]) => `${i}번이 ${n}개`).join(", ")}로 정리되었습니다. 상염색체가 이렇게 많이 어긋나는 일은 드뭅니다. 크기가 비슷한 이웃 번호와 바뀌지 않았는지 다시 확인하세요.`;
    else {
      const sexMsg = sexs === "XY" ? "남성" : sexs === "XX" ? "여성" : sexs === "X" ? "X 염색체가 하나뿐인 터너 증후군" : sexs === "XXY" ? "X가 하나 더 있는 클라인펠터 증후군" : `성염색체 ${sexs}`;
      msg = tri21 ? `21번 염색체가 3개입니다(21번 세염색체성). 다운 증후군 핵형이며, 성염색체는 ${sexs}입니다.` : sexs === "XY" || sexs === "XX" ? `상염색체 22쌍과 성염색체 ${sexs}: 정상 ${sexMsg}의 핵형입니다.` : `상염색체는 22쌍으로 정상이고, 성염색체가 ${sexs}입니다. ${sexMsg}의 핵형입니다.`;
    }
    const allOk = ok === chs.length;
    v.textContent = `판독: ${msg}` + (allOk ? ` 모든 염색체를 맞는 자리에 놓았습니다. (정답: ${CASE_NAME[ci]})` : showCheck ? ` 단, ${chs.length - ok}개가 다른 자리에 놓여 있습니다(빨간 테두리).` : " ‘맞게 놓았는지 확인’으로 점검해 보세요.");
    v.className = "verdict small " + (allOk ? "good" : showCheck ? "bad" : "");
    kar.className = "n-kar" + (chs.length !== 46 || tri21 ? " bad" : "");
  }

  /* 끌어 놓기 + 눌러서 고르고 자리 누르기 (마우스·터치 공통 포인터 이벤트) */
  const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const topHit = (p) => { for (let i = chs.length - 1; i >= 0; i--) if (hits(chs[i], p.x, p.y)) return chs[i]; return null; };
  const raise = (c) => { chs.splice(chs.indexOf(c), 1); chs.push(c); };
  function place(c, p) {
    const s = slotAt(p.x, p.y);
    if (s) { if (c.slot !== s.id) { c.slot = s.id; c.ord = ++order; } return true; }
    const sp = G.spread;
    if (p.y < G.sh) { c.slot = null; c.u = clamp((p.x - sp.x) / sp.w, 0.02, 0.98); c.v = clamp((p.y - sp.y) / sp.h, 0.05, 0.95); c.rot = 0; return true; }
    return false;
  }
  cv.addEventListener("pointerdown", (e) => {
    if (!G || (e.pointerType === "mouse" && e.button !== 0)) return;
    const p = pt(e), c = topHit(p);
    if (c) {
      drag = { c, ox: p.x - c.x, oy: p.y - c.y, sx: p.x, sy: p.y, moved: false, id: e.pointerId };
      try { cv.setPointerCapture(e.pointerId); } catch (_) { /* 캡처 실패해도 끌기는 동작 */ }
      e.preventDefault();
    } else drag = { c: null, sx: p.x, sy: p.y, moved: false, id: e.pointerId };
  });
  cv.addEventListener("pointermove", (e) => {
    const p = pt(e);
    if (!drag || drag.id !== e.pointerId || !drag.c) {
      if (G && e.pointerType === "mouse") cv.style.cursor = topHit(p) ? "grab" : sel && (slotAt(p.x, p.y) || p.y < G.sh) ? "pointer" : "default";
      return;
    }
    if (!drag.moved && Math.hypot(p.x - drag.sx, p.y - drag.sy) > 4) { drag.moved = true; cv.classList.add("dragging"); raise(drag.c); }
    if (drag.moved) { drag.c.x = p.x - drag.ox; drag.c.y = p.y - drag.oy; const s = slotAt(p.x, p.y); hover = s ? s.id : null; draw(); }
  });
  const end = (e, cancel) => {
    if (!drag || drag.id !== e.pointerId) return;
    const p = pt(e), d = drag;
    drag = null; hover = null; cv.classList.remove("dragging");
    if (cancel) { draw(); return; }
    if (d.c && d.moved) { place(d.c, p); sel = null; }
    else if (d.c) sel = sel === d.c ? null : d.c;
    else if (sel) { if (place(sel, p)) { raise(sel); sel = null; } }
    draw();
  };
  cv.addEventListener("pointerup", (e) => end(e, false));
  cv.addEventListener("pointercancel", (e) => end(e, true));
  cv.addEventListener("lostpointercapture", (e) => { if (drag && drag.id === e.pointerId && drag.moved) end(e, false); });

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]");
    if (b) { ci = +b.dataset.c; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); build(ci); draw(); }
  });
  $(".auto").addEventListener("click", () => { chs.forEach((c) => { if (c.slot !== slotOf(c.id)) { c.slot = slotOf(c.id); c.ord = ++order; } }); sel = null; draw(); });
  $(".check").addEventListener("click", () => { showCheck = true; draw(); });
  $(".reset").addEventListener("click", () => { scatter(); draw(); });

  build(0);
  if (/[?&]demo\b/.test(location.search)) {
    ci = 1; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.c === "1")));
    build(1);
    const full = /[?&]full\b/.test(location.search);
    let skip = full ? 0 : 7;
    chs.forEach((c) => { if (skip && ["7", "8", "X", "14", "21", "19", "11"].includes(c.id) && !chs.some((d) => d !== c && d.id === c.id && !d.slot)) { skip--; return; } c.slot = slotOf(c.id); c.ord = ++order; });
    if (!full) { const w = chs.find((c) => c.id === "10" && c.slot); if (w) w.slot = "9"; showCheck = true; }
  }
  draw();
})();
