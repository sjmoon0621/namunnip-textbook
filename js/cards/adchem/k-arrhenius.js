/* 카드: 아레니우스 식 — k–T 곡선과 ln k–1/T 직선, 두 온도 공식 */
(() => {
  const root = document.getElementById("card-adchem-arrhenius");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const R = 8.314;
  /* 문헌값(기체상 1차 반응): A [s⁻¹], Ea [kJ/mol] */
  const P = { n2o5: { la: Math.log10(4.94e13), ea: 103.4 }, cp: { la: Math.log10(1.58e15), ea: 272 }, x: { la: 13, ea: 53 } };
  let rx = "n2o5", la = P.n2o5.la, ea = P.n2o5.ea;
  const sEa = $(".ea"), sLa = $(".la"), sT1 = $(".t1"), sT2 = $(".t2");
  const sup = (n) => String(n).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  function sci(x, d = 2) {
    if (!Number.isFinite(x) || x <= 0) return "—";
    const e = Math.floor(Math.log10(x)), m = x / 10 ** e;
    if (e >= -2 && e <= 3) return String(+x.toPrecision(d + 1));
    return `${m.toFixed(d - 1)}×10${sup(e)}`;
  }
  function dur(s) {
    if (!Number.isFinite(s)) return "—";
    if (s < 60) return `${sci(s)} s`;
    if (s < 3600) return `${(s / 60).toFixed(1)} 분`;
    if (s < 86400 * 2) return `${(s / 3600).toFixed(1)} 시간`;
    if (s < 3.15e7 * 2) return `${(s / 86400).toFixed(0)} 일`;
    return `${sci(s / 3.15e7)} 년`;
  }
  const lnk = (T) => la * Math.LN10 - (ea * 1000) / (R * T);
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T1 = +sT1.value, T2 = +sT2.value, Ea = ea;
    /* 왼쪽: 두 온도 둘레의 k–T (선형 눈금) */
    const lx0 = 40, lx1 = w * 0.44, ty = 22, by = h - 34;
    const tlo = Math.max(240, Math.min(T1, T2) - 30), thi = Math.min(820, Math.max(T1, T2) + 15);
    const kmax = Math.exp(Math.max(lnk(T1), lnk(T2))) * 1.3;
    const X = (T) => lx0 + (T - tlo) / (thi - tlo) * (lx1 - lx0), Y = (k) => by - k / kmax * (by - ty);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx0, ty); ctx.lineTo(lx0, by); ctx.lineTo(lx1, by); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(lx0, ty, lx1 - lx0, by - ty); ctx.clip();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const T = tlo + (thi - tlo) * i / 120, y = Y(Math.exp(lnk(T))); i ? ctx.lineTo(X(T), y) : ctx.moveTo(X(T), y); }
    ctx.stroke(); ctx.restore();
    [[T1, "#d4493a", "T₁"], [T2, "#e0a02a", "T₂"]].forEach(([T, c, lab]) => {
      const y = Y(Math.exp(lnk(T)));
      ctx.strokeStyle = c; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(T), by); ctx.lineTo(X(T), y); ctx.lineTo(lx0, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(T), y, 3.5, 0, 7); ctx.fill();
      ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab, X(T), by + 24);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${tlo}`, lx0, by + 13);
    ctx.textAlign = "right"; ctx.fillText(`${thi} K`, lx1, by + 13);
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillText("k (상대값, 선형 눈금)", lx0 + 4, ty - 8);
    /* 오른쪽: ln k – 1/T */
    const rx0 = w * 0.56, rx1 = w - 12, ix0 = 1000 / 800, ix1 = 1000 / 250;
    const ylo = lnk(250), yhi = lnk(800), pad = (yhi - ylo) * 0.06 + 0.5;
    const XX = (inv) => rx0 + (inv - ix0) / (ix1 - ix0) * (rx1 - rx0), YY = (v) => by - (v - (ylo - pad)) / (yhi - ylo + 2 * pad) * (by - ty);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rx0, ty); ctx.lineTo(rx0, by); ctx.lineTo(rx1, by); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let v = 1.5; v <= 4.01; v += 0.5) ctx.fillText(v.toFixed(1), XX(v), by + 13);
    ctx.textAlign = "right"; ctx.fillText("1/T (10⁻³ K⁻¹)", rx1, by + 26);
    const step = (yhi - ylo) > 60 ? 20 : (yhi - ylo) > 25 ? 10 : 5;
    ctx.textAlign = "right";
    for (let v = Math.ceil((ylo - pad) / step) * step; v <= yhi + pad; v += step) { const y = YY(v); ctx.fillText(`${v}`, rx0 - 4, y + 3); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(rx0 + 1, y); ctx.lineTo(rx1, y); ctx.stroke(); }
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText("ln (k / s⁻¹)", rx0 + 4, ty - 8);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(XX(ix0), YY(yhi)); ctx.lineTo(XX(ix1), YY(ylo)); ctx.stroke();
    const p1 = [XX(1000 / T1), YY(lnk(T1))], p2 = [XX(1000 / T2), YY(lnk(T2))];
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(p2[0], p2[1]); ctx.lineTo(p1[0], p2[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); ctx.setLineDash([]);
    [[p1, "#d4493a"], [p2, "#e0a02a"]].forEach(([p, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, 7); ctx.fill(); });
    ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(`기울기 −Eₐ/R = −${sci(Ea * 1000 / R, 3)} K`, rx1, YY(yhi) + 16 < by - 30 ? Math.max(ty + 12, YY(yhi) + 16) : ty + 12);
  }
  function update() {
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === rx)));
    const T1 = +sT1.value, T2 = +sT2.value;
    $(".ea-out").textContent = ea.toFixed(ea % 1 ? 1 : 0);
    $(".a-out").textContent = sci(10 ** la);
    $(".t1-out").textContent = `${T1} (${T1 - 273} °C)`; $(".t2-out").textContent = `${T2} (${T2 - 273} °C)`;
    const k1 = Math.exp(lnk(T1)), k2 = Math.exp(lnk(T2));
    $(".n-k1").textContent = `${sci(k1)} s⁻¹`; $(".n-k2").textContent = `${sci(k2)} s⁻¹`;
    const r = Math.exp(lnk(T2) - lnk(T1));
    $(".n-r").textContent = r >= 1e4 || r < 1e-3 ? sci(r) : r.toFixed(r < 10 ? 2 : 0);
    $(".n-h").textContent = dur(Math.LN2 / k1);
    draw();
  }
  function setRx(k) { rx = k; la = P[k].la; ea = P[k].ea; sEa.value = ea; sLa.value = la.toFixed(1); update(); }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => setRx(b.dataset.r)));
  [sEa, sLa].forEach((s) => s.addEventListener("input", () => { rx = "x"; la = +sLa.value; ea = +sEa.value; update(); }));
  [sT1, sT2].forEach((s) => s.addEventListener("input", update));
  setRx("n2o5");
})();
