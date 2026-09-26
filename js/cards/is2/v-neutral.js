/* 카드: 산과 염기를 섞으면 무엇이 사라질까? — 염산에 수산화 나트륨 수용액을 넣는 이온 모형 */
(() => {
  const root = document.getElementById("card-is2-neutral");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), vS = $(".vol"), vO = $(".vol-out");
  const nPH = $(".ph"), nT = $(".temp"), nW = $(".water");

  const VA = 20, KW = 1e-14, DH = 56; // 염산 20 mL, 중화열 약 56 kJ/mol (강산–강염기, 묽은 용액)
  let conc = 0.1, mode = "ion";

  const state = (V) => {
    const na = VA * conc, nb = V * conc; // mmol
    const net = (na - nb) / (VA + V); // mol/L
    const H = net >= 0 ? (net + Math.sqrt(net * net + 4 * KW)) / 2 : KW / ((-net + Math.sqrt(net * net + 4 * KW)) / 2);
    const water = Math.min(na, nb);
    return { na, nb, Hn: Math.max(0, na - nb), OHn: Math.max(0, nb - na), Cl: na, Na: nb, pH: -Math.log10(H), T: 25 + water * 1e-3 * DH * 1000 / ((VA + V) * 4.18), water };
  };

  const { ctx, size } = fit(cv, () => draw());
  const COL = { H: "#d05a5a", Cl: "#5f9c4f", Na: "#b9a36a", OH: "#5b7fc0", W: "#b8c4cf" };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const V = +vS.value, s = state(V), narrow = w < 460;
    // 비커 (입자 모형)
    const bx = 12, bw = narrow ? w - 24 : w * 0.4, by = 26, bh = narrow ? h * 0.44 : h - by - 30;
    const lvl = by + bh * (1 - (0.45 + 0.5 * (VA + V) / 60));
    ctx.fillStyle = "rgba(160,190,220,.18)"; ctx.fillRect(bx + 2, lvl, bw - 4, by + bh - lvl - 2);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    const unit = VA * conc / 10; // 입자 하나가 나타내는 양
    const nNa = Math.round(s.Na / unit), nH = Math.max(0, 10 - nNa), nOH = Math.max(0, nNa - 10), nW = Math.min(10, nNa);
    let seed = 4; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    // 겹치지 않게 격자 칸에 흩어 놓는다
    const gc = Math.max(4, Math.floor((bw - 20) / 25)), gr = Math.max(3, Math.floor((by + bh - lvl - 10) / 25));
    const cw = (bw - 20) / gc, chh = (by + bh - lvl - 10) / gr;
    const spots = [];
    for (let i = 0; i < gc * gr; i++) spots.push([bx + 10 + (i % gc + .5) * cw + (rnd() - .5) * cw * .3, lvl + 5 + (Math.floor(i / gc) + .5) * chh + (rnd() - .5) * chh * .3]);
    for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
    let k = 0;
    const put = (n, lab, col, r) => { for (let i = 0; i < n; i++) { const [x, y] = spots[k++ % spots.length]; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `700 ${r > 9 ? 9 : 8}px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, x, y + 3); } };
    put(10, "Cl⁻", COL.Cl, 10); put(nNa, "Na⁺", COL.Na, 10); put(nH, "H⁺", COL.H, 9); put(nOH, "OH⁻", COL.OH, 10);
    // 새로 생긴 물 분자
    for (let i = 0; i < nW; i++) { const [x, y] = spots[k++ % spots.length]; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = COL.W; ctx.fill(); ctx.fillStyle = C.ink2; ctx.font = `8px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("H₂O", x, y - 8); }
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`입자 1개 = ${unit < 1 ? unit.toFixed(1) : unit} mmol (모식)`, bx, by - 8);

    // 그래프
    const gx = narrow ? 44 : bx + bw + 52, gy = narrow ? by + bh + 30 : 26, gw = w - gx - 12, gh = narrow ? h - gy - 30 : h - gy - 34;
    const X = (v) => gx + v / 40 * gw;
    let Y, yt, ylabel;
    if (mode === "ion") { const m = 4 * conc * 10; Y = (v) => gy + (1 - v / m) * gh; yt = [[0, "0"], [2 * conc * 10, `${+(2 * conc * 10).toFixed(1)}`], [m, `${+m.toFixed(1)}`]]; ylabel = "이온의 양 (mmol)"; }
    else if (mode === "ph") { Y = (v) => gy + (1 - v / 14) * gh; yt = [[0, "0"], [7, "7"], [14, "14"]]; ylabel = "pH"; }
    else { const tmax = state(VA).T; const top = Math.ceil((tmax - 25) * 1.25 * 10) / 10 + 25; Y = (v) => gy + (1 - (v - 25) / (top - 25)) * gh; yt = [[25, "25"], [top, top.toFixed(1)]]; ylabel = "온도 (°C, 열 손실 없다고 가정)"; }
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [[0, "0"], [20, "20"], [40, "40 mL"]], yt, ylabel });
    const line = (f, col, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash ? [5, 3] : []); ctx.beginPath(); for (let v = 0; v <= 40.001; v += 0.25) { const y = Y(f(state(v))); v ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); } ctx.stroke(); ctx.setLineDash([]); };
    if (mode === "ion") {
      line((q) => q.Cl, COL.Cl, true); line((q) => q.Na, COL.Na); line((q) => q.Hn, COL.H); line((q) => q.OHn, COL.OH);
      ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
      [["H⁺", COL.H], ["Cl⁻", COL.Cl], ["Na⁺", COL.Na], ["OH⁻", COL.OH]].forEach(([t, c], i) => { ctx.fillStyle = c; ctx.fillRect(gx + 6 + i * 44, gy + 4, 10, 3); ctx.fillStyle = C.ink2; ctx.fillText(t, gx + 19 + i * 44, gy + 10); });
    } else if (mode === "ph") line((q) => q.pH, C.ink);
    else line((q) => q.T, C.warn);
    // 중화점, 현재 위치
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(20) + .5, gy); ctx.lineTo(X(20) + .5, gy + gh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("중화점", X(20), gy + gh + 26);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(V) + .5, gy); ctx.lineTo(X(V) + .5, gy + gh); ctx.stroke();
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText("넣은 NaOH 수용액", gx, gy + gh + 26);
  }

  function update() {
    const V = +vS.value, s = state(V);
    vO.textContent = V;
    nPH.textContent = s.pH.toFixed(2);
    nT.textContent = `${s.T.toFixed(conc < 0.5 ? 2 : 1)} °C`;
    nW.textContent = `${+s.water.toFixed(2)} mmol`;
    root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.c === conc)));
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    draw();
  }
  vS.addEventListener("input", update);
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { conc = +b.dataset.c; update(); }));
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; update(); }));
  update();
})();
