/* 카드: 우리 학교 전기를 신재생 에너지로 채운다면 — 지역 조건·월별 수요와 공급·면적·예산 */
(() => {
  const root = document.getElementById("card-is2-energy-design");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const DEM = [1.2, 1.15, 0.95, 0.8, 0.8, 1.0, 1.1, 0.7, 0.95, 0.85, 1.0, 1.2], HEAT = [0.35, 0.3, 0.15, 0, 0, 0.15, 0.3, 0.2, 0.1, 0, 0.15, 0.35];
  const SUN = [0.75, 0.85, 1.05, 1.15, 1.2, 1.05, 0.95, 1.0, 1.0, 1.0, 0.8, 0.7], WIND = [1.3, 1.25, 1.2, 1.0, 0.8, 0.7, 0.7, 0.7, 0.8, 1.0, 1.2, 1.3];
  const REG = { city: { sun: 1.05, cf: 0.06, river: false }, island: { sun: 1.0, cf: 0.3, river: false }, mount: { sun: 0.9, cf: 0.12, river: true } };
  const YEAR = 300000, AREA = 1500, BUDGET = 7e8;
  let reg = "city";
  const { ctx, size } = fit($("canvas"), () => draw());
  function calc() {
    const r = REG[reg], pv = +$(".pv").value, wd = +$(".wd").value, hy = $(".hy").checked && r.river, geo = $(".geo").checked, ess = $(".ess").checked;
    const ds = DEM.reduce((a, b) => a + b);
    const dem = DEM.map((d, i) => YEAR * d / ds * (1 - (geo ? 0.4 * HEAT[i] / d : 0)));   // HEAT: 그달 수요 중 냉난방 몫
    const s1 = SUN.reduce((a, b) => a + b), w1 = WIND.reduce((a, b) => a + b);
    const sol = SUN.map((x) => pv * 1300 * r.sun * x / s1), win = WIND.map((x) => wd * 20 * 8760 * r.cf * x / w1), hyd = DEM.map((_, i) => (hy ? 30 * 730 * (i >= 5 && i <= 8 ? 0.6 : 0.4) : 0));
    let sup = sol.map((x, i) => x + win[i] + hyd[i]);
    if (ess) { // 남는 달 전기의 70%를 부족한 달로 옮김 (단순화)
      let bank = 0; for (let k = 0; k < 2; k++) for (let i = 0; i < 12; i++) { const ex = sup[i] - dem[i]; if (ex > 0 && k === 0) { bank += ex * 0.7; } else if (ex < 0 && k === 1) { const t = Math.min(bank, -ex); sup[i] += t; bank -= t; } }
    }
    const tot = (a) => a.reduce((x, y) => x + y, 0);
    return { dem, sol, win, hyd, sup, cover: Math.min(tot(sol) + tot(win) + tot(hyd), Infinity) / tot(dem), short: dem.filter((d, i) => sup[i] < d).length, area: pv * 6.5 + wd * 30, cost: pv * 1.5e6 + wd * 8e7 + (hy ? 1.5e8 : 0) + (geo ? 2e8 : 0) + (ess ? 1.2e8 : 0), hyOK: r.river };
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = calc(), top = Math.max(45000, ...r.dem.map((d, i) => Math.max(d, r.sol[i] + r.win[i] + r.hyd[i]))) * 1.1;
    const x0 = 46, y0 = 14, gw = w - 58, gh = h - 42, bw = gw / 12;
    const Y = (v) => y0 + gh - v / top * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X: (m) => x0 + bw * (m + 0.5), Y, xt: Array.from({ length: 12 }, (_, i) => [i, i + 1 + "월"]), yt: [0, 20000, 40000, 60000].filter((v) => v < top).map((v) => [v, v / 1000 + "k"]), ylabel: "kWh/월" });
    r.dem.forEach((d, i) => {
      const x = x0 + bw * i + bw * 0.18, ww = bw * 0.64; let yb = y0 + gh;
      [[r.sol[i], "#e8b931"], [r.win[i], "#6aa9d8"], [r.hyd[i], "#3f6fa3"]].forEach(([v, c]) => { const hh = v / top * gh; ctx.fillStyle = c; ctx.fillRect(x, yb - hh, ww, hh); yb -= hh; });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 3, Y(d)); ctx.lineTo(x + ww + 3, Y(d)); ctx.stroke();
      if (r.sup[i] < d) { ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("부족", x + ww / 2, Y(d) - 4); }
    });
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    [["#e8b931", "태양광"], ["#6aa9d8", "풍력"], ["#3f6fa3", "소수력"]].forEach(([c, t], i) => { ctx.fillStyle = c; ctx.fillRect(x0 + 6 + i * 62, y0 + 2, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText(t, x0 + 20 + i * 62, y0 + 11); });
    ctx.fillStyle = C.ink; ctx.fillRect(x0 + 196, y0 + 6, 14, 2); ctx.fillStyle = C.ink2; ctx.fillText("수요", x0 + 214, y0 + 11);
    $(".n-c").textContent = `${Math.round(r.cover * 100)}%`; $(".n-c").className = "n-c " + (r.cover >= 1 ? "good" : "");
    $(".n-m").textContent = `${r.short}개월`;
    $(".n-a").textContent = `${Math.round(r.area)} m²`; $(".n-a").className = "n-a " + (r.area > AREA ? "bad" : "");
    $(".n-b").textContent = `${(r.cost / 1e8).toFixed(1)}억`; $(".n-b").className = "n-b " + (r.cost > BUDGET ? "bad" : "");
    $(".hy").disabled = !r.hyOK; if (!r.hyOK) $(".hy").checked = false;
  }
  root.addEventListener("input", (e) => { if (e.target.matches(".pv,.wd")) { $(".pv-out").textContent = $(".pv").value; $(".wd-out").textContent = $(".wd").value; } draw(); });
  root.addEventListener("change", draw);
  $(".reg").addEventListener("click", (e) => { const b = e.target.closest("[data-r]"); if (!b) return; reg = b.dataset.r; root.querySelectorAll("[data-r]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  draw();
})();
