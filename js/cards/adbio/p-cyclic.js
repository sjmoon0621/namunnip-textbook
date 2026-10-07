/* 카드: 비순환·순환 광인산화 — 순환 비율에 따른 ATP : NADPH 장부 (H⁺/e, H⁺/ATP는 추정값) */
(() => {
  const root = document.getElementById("card-adbio-cyclic");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sF = $(".f"), oF = $(".f-out"), nR = $(".n-r"), nNeed = $(".n-need"), nO = $(".n-o");
  const NEED = { c3: 1.5, c4: 2.5, dcmu: 1.5 };
  const HPA = 14 / 3;
  let mode = "c3", t = 0;
  const blue = "#3f6fa3";

  function ledger() {
    const f = mode === "dcmu" ? 1 : +sF.value / 100;
    const L = 100 * (1 - f), Cy = 100 * f;
    const atp = (3 * L + 2 * Cy) / HPA, nadph = L / 2, o2 = L / 4;
    return { f, L, Cy, atp, nadph, o2 };
  }

  /* Z 도식의 점: [가로 위치(0~1), 전위 V] */
  const N = {
    h2o: [0.03, 0.82], p680: [0.15, 1.15], p680s: [0.15, -0.8], pq: [0.3, 0.0], b6f: [0.43, 0.3], pc: [0.54, 0.37],
    p700: [0.64, 0.48], p700s: [0.64, -1.3], fd: [0.8, -0.43], nadp: [0.95, -0.32],
  };
  const LIN = ["h2o", "p680", "p680s", "pq", "b6f", "pc", "p700", "p700s", "fd", "nadp"];
  const CYC = ["p700", "p700s", "fd", "fdLow", "pqLow", "pq", "b6f", "pc", "p700"];

  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, col, font, al) { ctx.fillStyle = col; ctx.font = font; ctx.textAlign = al || "center"; ctx.fillText(s, x, y); }

  function geo(w, h) {
    const zw = w * 0.64, x0 = 30, top = 22, bot = h - 18;
    const X = (u) => x0 + u * (zw - x0 - 10);
    const Y = (E) => top + (E + 1.4) / 2.75 * (bot - top);
    const P = {};
    for (const k in N) P[k] = [X(N[k][0]), Y(N[k][1])];
    P.fdLow = [P.fd[0], Y(1.02)]; P.pqLow = [P.pq[0], Y(1.02)];
    return { zw, X, Y, P, top, bot, x0 };
  }
  function polyPt(P, path, s) {
    /* s: 0~1 비율로 경로 위의 점 */
    const segs = []; let tot = 0;
    for (let i = 0; i < path.length - 1; i++) { const a = P[path[i]], b = P[path[i + 1]]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push([a, b, l]); tot += l; }
    let d = s * tot;
    for (const [a, b, l] of segs) { if (d <= l) return [a[0] + (b[0] - a[0]) * d / l, a[1] + (b[1] - a[1]) * d / l]; d -= l; }
    return P[path[path.length - 1]];
  }
  function stroke(P, path, col, wd, dash) {
    ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash || []);
    ctx.beginPath(); path.forEach((k, i) => (i ? ctx.lineTo(...P[k]) : ctx.moveTo(...P[k]))); ctx.stroke(); ctx.setLineDash([]);
  }
  function bolt(x, y) {
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 22, y - 26); ctx.lineTo(x - 12, y - 14); ctx.lineTo(x - 17, y - 12); ctx.lineTo(x - 6, y); ctx.stroke();
    txt("빛", x - 26, y - 28, "#b07b10", `600 10.5px ${F.sans}`);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = geo(w, h), P = g.P, lg = ledger(), dcmu = mode === "dcmu";
    /* 전위 축 */
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(g.x0 - 8, g.top); ctx.lineTo(g.x0 - 8, g.bot); ctx.stroke();
    ctx.save(); ctx.translate(11, (g.top + g.bot) / 2); ctx.rotate(-Math.PI / 2); txt("환원 전위 (V, 아래로 갈수록 +)", 0, 0, C.ink3, `10px ${F.sans}`); ctx.restore();
    [-1, 0, 1].forEach((E) => txt(String(E).replace("-", "−"), g.x0 - 12, g.Y(E) + 3, C.ink3, `9.5px ${F.mono}`, "right"));
    /* 경로 */
    stroke(P, LIN, dcmu ? C.rule : "rgba(59,124,42,.55)", 2.4);
    stroke(P, ["fd", "fdLow", "pqLow", "pq"], lg.f > 0 ? C.amber : C.rule, 2, [5, 4]);
    if (dcmu) {
      const [x, y] = P.p680s, [x2, y2] = P.pq, mx = (x + x2) / 2, my = (y + y2) / 2;
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(mx - 8, my - 8); ctx.lineTo(mx + 8, my + 8); ctx.moveTo(mx + 8, my - 8); ctx.lineTo(mx - 8, my + 8); ctx.stroke();
      txt("DCMU", mx + 12, my - 8, C.warn, `600 10.5px ${F.mono}`, "left");
    }
    bolt(P.p680[0], P.p680[1] - 40); bolt(P.p700[0], P.p700[1] - 40);
    /* 이름표 */
    const lab = (k, s, dx, dy, col, al) => txt(s, P[k][0] + dx, P[k][1] + dy, col || C.ink, `600 11px ${F.mono}`, al);
    lab("h2o", "H₂O", 0, 16); txt(dcmu ? "O₂ 없음" : "→ O₂", P.h2o[0], P.h2o[1] + 29, dcmu ? C.warn : C.forest, `10px ${F.sans}`);
    lab("p680", "P680", 0, 16, C.forest); lab("p680s", "광계 Ⅱ", 0, -8, C.forest);
    lab("pq", "PQ", -6, -6, C.ink, "right"); lab("b6f", "b₆f", 0, 15); lab("pc", "PC", 4, 15, C.ink, "left");
    lab("p700", "P700", 8, 4, blue, "left"); lab("p700s", "광계 Ⅰ", 0, -8, blue);
    lab("fd", "Fd", 7, -4, C.ink, "left"); lab("nadp", "NADP⁺", 0, -10, dcmu ? C.ink3 : C.ink);
    txt("NADPH", P.nadp[0], P.nadp[1] + 16, dcmu || lg.L === 0 ? C.ink3 : C.forest, `600 11px ${F.mono}`);
    txt("순환 경로", (P.fdLow[0] + P.pqLow[0]) / 2, P.pqLow[1] + 13, lg.f > 0 ? "#b07b10" : C.ink3, `10.5px ${F.sans}`);
    /* H⁺를 퍼 내는 곳 */
    txt("H⁺↓", P.b6f[0], P.b6f[1] - 9, C.apple, `600 10.5px ${F.mono}`);
    /* 전자 점 */
    const nL = Math.round(14 * lg.L / 100), nC = Math.round(14 * lg.Cy / 100);
    for (let i = 0; i < nL; i++) { const [x, y] = polyPt(P, LIN, ((t * 0.12 + i / nL) % 1)); ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill(); }
    for (let i = 0; i < nC; i++) { const [x, y] = polyPt(P, CYC, ((t * 0.16 + i / nC) % 1)); ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill(); }
    /* 오른쪽 막대 */
    const bx = g.zw + 18, bw = w - bx - 10, base = h - 30, top = 38, sc = (v) => (base - top) * v / 70;
    txt("광계 Ⅰ 전자 100개당", bx + bw / 2, 16, C.ink2, `600 11.5px ${F.sans}`);
    const cw = Math.min(46, bw / 3.2), c1 = bx + bw * 0.3, c2 = bx + bw * 0.72;
    ctx.fillStyle = C.amber; ctx.fillRect(c1 - cw / 2, base - sc(lg.atp), cw, sc(lg.atp));
    ctx.fillStyle = C.forest; ctx.fillRect(c2 - cw / 2, base - sc(lg.nadph), cw, sc(lg.nadph));
    const need = NEED[mode] * lg.nadph;
    if (lg.nadph > 0) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(c1 - cw / 2 - 6, base - sc(need)); ctx.lineTo(c1 + cw / 2 + 6, base - sc(need)); ctx.stroke(); ctx.setLineDash([]);
      txt("필요", c1 + cw / 2 + 4, base - sc(need) - 4, C.ink, `10px ${F.sans}`, "left");
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, base); ctx.lineTo(bx + bw, base); ctx.stroke();
    txt("ATP", c1, base + 14, C.ink, `600 11px ${F.mono}`); txt("NADPH", c2, base + 14, C.ink, `600 11px ${F.mono}`);
    txt(lg.atp.toFixed(1), c1, base - sc(lg.atp) - 5, "#b07b10", `600 11px ${F.mono}`);
    txt(lg.nadph.toFixed(1), c2, base - sc(lg.nadph) - 5, C.forest, `600 11px ${F.mono}`);
  }

  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    sF.disabled = mode === "dcmu";
    oF.textContent = mode === "dcmu" ? "100" : sF.value;
    const lg = ledger();
    const r = lg.nadph > 0 ? lg.atp / lg.nadph : Infinity;
    nR.textContent = isFinite(r) ? `${r.toFixed(2)} : 1` : "ATP만 생김";
    const ok = isFinite(r) && Math.abs(r - NEED[mode]) < 0.03;
    nR.className = "n-r" + (ok ? " good" : "");
    nNeed.textContent = mode === "c4" ? "2.5 : 1 (5 : 2)" : "1.5 : 1 (3 : 2)";
    nO.textContent = `${lg.o2.toFixed(1)} 분자`;
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  sF.addEventListener("input", update);
  if (location.search.includes("demo")) { sF.value = 20; }
  loop(cv, (dt) => { if (!NM.reduce) { t += dt; draw(); } });
  update();
})();
