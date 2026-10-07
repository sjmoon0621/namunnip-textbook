/* 카드: 적정 곡선에서 약산의 pKa를 읽어 낼 수 있을까? — pH 미터 적정 기록, ΔpH/ΔV로 중화점, 반중화점 pH */
(() => {
  const root = document.getElementById("card-adchem-pka");
  if (!root || !window.NMLab) return;
  const { C, F, fit, clamp } = NM, L = NMLab;
  const $ = (s) => root.querySelector(s);
  const Kw = 1e-14, V0 = 25;
  /* C0: 시료 농도(M), pKa: 산(암모니아는 짝산 NH₄⁺), Ct: 적정 용액 농도, base: 약염기 시료 */
  const S = {
    ac: { C0: 0.10, pKa: 4.76, Ct: 0.10, base: false, t: "NaOH" },
    bz: { C0: 0.020, pKa: 4.20, Ct: 0.020, base: false, t: "NaOH" },
    cl: { C0: 0.010, pKa: 2.87, Ct: 0.010, base: false, t: "NaOH" },
    nh: { C0: 0.10, pKa: 9.25, Ct: 0.10, base: true, t: "HCl" },
    x: { C0: 0.08, pKa: 6.0, Ct: 0.100, base: false, t: "NaOH" },
  };
  let s = "ac", peek = false;
  const cv = $("canvas"), sv = $(".v"), ov = $(".v-out"), tn = $(".t-name");
  const nNow = $(".n-now"), nEq = $(".n-eq"), nHalf = $(".n-half"), nTrue = $(".n-true"), bPeek = $(".peek");
  function newX() { S.x.pKa = +(3.6 + Math.random() * 4.8).toFixed(2); S.x.C0 = +(0.05 + Math.random() * 0.07).toFixed(4); }
  /* 참 pH: 전하 균형 [H⁺] + [Na⁺] (+[BH⁺]) = [OH⁻] + [A⁻] (+[Cl⁻]) */
  function pH(v) {
    const p = S[s], V = V0 + v, Ka = 10 ** -p.pKa, Ca = p.C0 * V0 / V, Ct = p.Ct * v / V;
    let lo = -14.5, hi = 1;
    for (let i = 0; i < 90; i++) {
      const m = (lo + hi) / 2, h = 10 ** m;
      const f = p.base ? h + Ca * h / (h + Ka) - Kw / h - Ct : h + Ct - Kw / h - Ca * Ka / (Ka + h);
      if (f > 0) hi = m; else lo = m;
    }
    return -(lo + hi) / 2;
  }
  const veqTrue = () => S[s].C0 * V0 / S[s].Ct;
  const tbl = L.table($(".tbl-host"), [{ key: "v", label: "V (mL)", res: 0.01 }, { key: "ph", label: "pH", res: 0.01 }], () => { analyse(); draw(); });
  let res = null;
  function analyse() {
    const pts = tbl.rows.map((r) => [r.v, r.ph]).sort((a, b) => a[0] - b[0]);
    res = { pts, d: [], veq: null, half: null };
    for (let i = 0; i + 1 < pts.length; i++) {
      const dv = pts[i + 1][0] - pts[i][0]; if (dv <= 0.001) continue;
      res.d.push([(pts[i][0] + pts[i + 1][0]) / 2, Math.abs(pts[i + 1][1] - pts[i][1]) / dv]);
    }
    if (pts.length >= 5 && res.d.length) {
      const top = res.d.reduce((a, b) => (b[1] > a[1] ? b : a));
      res.veq = top[0];
      const vh = res.veq / 2;
      for (let i = 0; i + 1 < pts.length; i++) if (pts[i][0] <= vh && pts[i + 1][0] >= vh && pts[i + 1][0] > pts[i][0]) {
        const t = (vh - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); res.half = pts[i][1] + t * (pts[i + 1][1] - pts[i][1]);
      }
    }
    nEq.textContent = res.veq ? `${res.veq.toFixed(2)} mL` : "기록 5개 이상";
    nHalf.textContent = res.half != null ? res.half.toFixed(2) : res.veq ? `${(res.veq / 2).toFixed(2)} mL 앞뒤 기록 필요` : "—";
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, x1 = w - 44, y0 = 22, y1 = h - 32;
    const X = (v) => x0 + v / 45 * (x1 - x0), Y = (p) => y1 - clamp(p, 0, 14) / 14 * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y, xt: [0, 10, 20, 30, 40].map((v) => [v, String(v)]), yt: [0, 2, 4, 6, 8, 10, 12, 14].map((v) => [v, String(v)]), xlabel: `넣은 ${S[s].t} (mL) →`, ylabel: "pH" });
    /* ΔpH/ΔV 막대 (오른쪽 눈금, 상대값) */
    if (res && res.d.length) {
      const top = Math.max(...res.d.map((d) => d[1]));
      ctx.fillStyle = "rgba(224,160,42,.45)";
      res.d.forEach(([v, d]) => { const hh = d / top * (y1 - y0) * 0.92; ctx.fillRect(X(v) - 2, y1 - hh, 4, hh); });
      ctx.fillStyle = "#a87614"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("ΔpH/ΔV", w - 4, y0 + 10); ctx.fillText(`최대 ${top.toFixed(1)}`, w - 4, y0 + 23);
    }
    /* 참값 곡선 */
    if (peek) {
      ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.4; ctx.beginPath();
      for (let i = 0; i <= 300; i++) { const v = 45 * i / 300, y = Y(pH(v)); i ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); } ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.forest; ctx.beginPath(); ctx.moveTo(x0, Y(S[s].pKa)); ctx.lineTo(x1, Y(S[s].pKa)); ctx.stroke();
      ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(`문헌 pKa ${S[s].pKa.toFixed(2)}`, x1 - 2, Y(S[s].pKa) + (S[s].base ? 13 : -4));
    }
    /* 찾은 중화점과 반중화점 */
    if (res && res.veq) {
      ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(res.veq), y0); ctx.lineTo(X(res.veq), y1); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`Veq ${res.veq.toFixed(2)}`, X(res.veq) + 3, y0 + 10);
      if (res.half != null) {
        const hx = X(res.veq / 2), hy = Y(res.half);
        ctx.beginPath(); ctx.moveTo(hx, y1); ctx.lineTo(hx, hy); ctx.lineTo(x0, hy); ctx.stroke();
        ctx.setLineDash([]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.fillText(`반중화점 pH ${res.half.toFixed(2)}`, hx + 9, hy + (S[s].base ? -8 : 14));
      }
      ctx.setLineDash([]);
    }
    /* 기록한 점 */
    ctx.fillStyle = "#3f6fa3";
    (res ? res.pts : []).forEach(([v, p]) => { ctx.beginPath(); ctx.arc(X(v), Y(p), 3, 0, Math.PI * 2); ctx.fill(); });
    /* 지금 뷰렛 위치 */
    const v = +sv.value; ctx.strokeStyle = C.apple; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(v), y1); ctx.lineTo(X(v), y1 - 8); ctx.stroke();
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.moveTo(X(v), y1 - 2); ctx.lineTo(X(v) - 4, y1 - 9); ctx.lineTo(X(v) + 4, y1 - 9); ctx.fill();
  }
  let now = 7;
  function read() { now = L.measure(pH(+sv.value), { sd: 0.02, res: 0.01 }); nNow.textContent = now.toFixed(2); }
  function update() {
    ov.textContent = (+sv.value).toFixed(2); tn.textContent = S[s].t; read();
    nTrue.textContent = peek ? `${S[s].pKa.toFixed(2)}${s === "x" ? ` · ${S.x.C0.toFixed(3)} M` : ""}` : "?";
    bPeek.setAttribute("aria-pressed", String(peek));
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === s)));
    draw();
  }
  function record() { const v = +sv.value; tbl.add({ v: L.measure(v, { sd: 0.01, res: 0.01 }), ph: now }); }
  const step = (d) => { sv.value = clamp(+sv.value + d, 0, 45).toFixed(2); update(); };
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => {
    s = b.dataset.s; if (s === "x") newX(); peek = false; tbl.clear(); sv.value = 0; update();
  }));
  sv.addEventListener("input", update);
  $(".rec").addEventListener("click", record);
  $(".p1").addEventListener("click", () => step(1));
  $(".m1").addEventListener("click", () => step(-1));
  $(".p01").addEventListener("click", () => step(0.1));
  $(".clear").addEventListener("click", () => tbl.clear());
  bPeek.addEventListener("click", () => { peek = !peek; update(); });
  newX(); analyse();
  if (L.demo) {
    [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 23, 24, 24.5, 24.8, 25.1, 25.4, 26, 27, 30, 35, 40].forEach((v) => { sv.value = v; read(); record(); });
    sv.value = 12.5;
  }
  update();
})();
