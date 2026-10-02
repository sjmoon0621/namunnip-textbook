/* 카드: 사람이 내보낸 탄소는 모두 공기 중에 남을까? — 초과 탄소 상자 모형 (육지·바다 흡수), 배출 시나리오, 저장고 그림 */
(() => {
  const root = document.getElementById("card-is1-carbon-cycle");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const sK = $(".k"), sD = $(".d"), sY = $(".y");
  const YR = [1850, 1900, 1950, 1970, 1990, 2000, 2010, 2020], FO = [0.05, 0.5, 1.6, 4.0, 6.1, 6.8, 9.0, 9.6], LU = [0.5, 0.7, 1.2, 1.2, 1.3, 1.3, 1.2, 1.1];
  const KL = 0.012, KO = 0.012, PPM = 2.12;
  let scen = "keep", run = [];
  const interp = (x, xs, ys) => { if (x <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[ys.length - 1]; };
  function emis(y) {
    const d = +sD.value / 100;
    if (y <= 2024) return { f: interp(y, YR, FO) * (y > 2020 ? 1 + 0.01 * (y - 2020) : 1), l: interp(y, YR, LU) * d };
    const f0 = 9.6 * 1.04, l0 = 1.1 * d;
    if (scen === "up") return { f: f0 * 1.02 ** (y - 2024), l: l0 };
    if (scen === "keep") return { f: f0, l: l0 };
    const r = Math.max(0, 1 - (y - 2024) / 26);            // 2050년까지 직선으로 줄이고, 그 뒤 흡수 기술로 약간 음수
    return { f: y <= 2050 ? f0 * r : -0.5, l: l0 * r };
  }
  function simulate() {
    const k = +sK.value / 100; let A = 0, L = 0, O = 0, cum = 0; run = [];
    for (let y = 1850; y <= 2100; y++) {
      const e = emis(y), E = e.f + e.l, sl = KL * k * A, so = KO * k * A;
      cum += E; A += E - sl - so; L += sl; O += so;
      run.push({ y, A, L, O, E, e, sl, so, cum });
    }
  }
  const { ctx, size } = fit($("canvas"), () => draw());
  function arrow(x0, y0, x1, y1, wd, col, lab, lx, ly, al) {
    if (wd <= 0.05) return;
    const a = Math.atan2(y1 - y0, x1 - x0), lw = Math.min(10, 1 + wd * 0.8);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * 8, y1 - Math.sin(a) * 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.5) * 12, y1 - Math.sin(a - 0.5) * 12); ctx.lineTo(x1 - Math.cos(a + 0.5) * 12, y1 - Math.sin(a + 0.5) * 12); ctx.fill();
    if (lab && 0) { ctx.font = `10px ${F.mono}`; ctx.textAlign = al; ctx.fillText(lab, lx, ly); }
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = run[+sY.value - 1850];
    // 왼쪽: 저장고 그림
    const bw = w * 0.46, box = (x, y, ww, hh, col, t, v) => { ctx.fillStyle = col; ctx.fillRect(x, y, ww, hh); ctx.fillStyle = C.ink; ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(t, x + ww / 2, y + 16); ctx.font = `10.5px ${F.mono}`; ctx.fillText(v, x + ww / 2, y + 31); };
    const atm = 590 + r.A;
    box(bw * 0.3, 8, bw * 0.48, 40, "#dce8f4", "대기", `${Math.round(atm)} GtC`);
    box(4, h * 0.5, bw * 0.42, 44, "#d6e8cc", "육상 생물·토양", `${Math.round(2300 + r.L)} (+${Math.round(r.L)})`);
    box(bw * 0.56, h * 0.5, bw * 0.42, 44, "#cfe0ee", "바다", `38000 (+${Math.round(r.O)})`);
    box(bw * 0.2, h - 40, bw * 0.6, 34, "#e3dccd", "화석 연료 (지권)", `−${Math.round(run.slice(0, +sY.value - 1849).reduce((a, x) => a + Math.max(0, x.e.f), 0))} 사용`);
    arrow(bw * 0.5, h - 42, bw * 0.5, 50, r.e.f, "#5d5d61", `화석 ${r.e.f.toFixed(1)}`, bw * 0.5 - 8, h * 0.72, "right");
    arrow(bw * 0.1, h * 0.5 - 2, bw * 0.26, 50, r.e.l, "#b5532f", r.e.l > 0.05 ? `벌채 ${r.e.l.toFixed(1)}` : "", 2, h * 0.5 - 22, "left");
    arrow(bw * 0.38, 50, bw * 0.3, h * 0.5 - 2, r.sl, C.forest, `흡수 ${r.sl.toFixed(1)}`, bw * 0.36, h * 0.33, "left");
    arrow(bw * 0.66, 50, bw * 0.78, h * 0.5 - 2, r.so, "#3f6fa3", `흡수 ${r.so.toFixed(1)}`, bw * 0.75, h * 0.25, "left");
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("화살표: 사람 때문에 생긴", 2, 14); ctx.fillText("순이동 (GtC/년)", 2, 27);
    // 오른쪽: 대기 CO2 그래프
    const gx = w * 0.56, gy = 18, gw = w - gx - 12, gh = h - 46;
    const X = (y) => gx + (y - 1850) / 250 * gw, Y = (p) => gy + gh - (p - 250) / 650 * gh;
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [1850, 1900, 1950, 2000, 2050, 2100].map((y) => [y, String(y)]), yt: [300, 400, 500, 600, 700, 800].map((p) => [p, String(p)]), ylabel: "대기 CO₂ (ppm)" });
    ctx.fillStyle = "rgba(141,141,146,.1)"; ctx.fillRect(X(2024), gy, X(2100) - X(2024), gh);
    ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); run.forEach((q, i) => { const p = 280 + q.A / PPM; i ? ctx.lineTo(X(q.y), Y(p)) : ctx.moveTo(X(q.y), Y(p)); }); ctx.stroke();
    // 배출이 모두 대기에 남았다면
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath(); run.forEach((q, i) => { const p = 280 + q.cum / PPM; i ? ctx.lineTo(X(q.y), Y(p)) : ctx.moveTo(X(q.y), Y(p)); }); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(r.y), gy); ctx.lineTo(X(r.y), gy + gh); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("점선: 흡수가 없다면", gx + 6, gy + 12); ctx.fillText("회색: 시나리오", X(2026), gy + gh - 6);
    $(".n-c").textContent = `${Math.round(280 + r.A / PPM)} ppm`;
    $(".n-e").textContent = `${r.e.f.toFixed(1)}+${r.e.l.toFixed(1)}`;
    $(".n-s").textContent = `${r.sl.toFixed(1)}/${r.so.toFixed(1)}`;
    $(".n-f").textContent = r.cum > 0 ? `${Math.round(r.A / r.cum * 100)}%` : "—";
  }
  const upd = () => { $(".k-out").textContent = sK.value; $(".d-out").textContent = sD.value; $(".y-out").textContent = sY.value; simulate(); draw(); };
  [sK, sD, sY].forEach((el) => el.addEventListener("input", upd));
  $(".scen").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; scen = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd(); });
  upd();
})();
