/* 카드: 물의 상평형 그림 — 로그 압력 축, 증기압·승화·융해 곡선, 경로 따라가기 */
(() => {
  const root = document.getElementById("card-chem-phase");
  if (!root) return;
  const { C, F, fit, loop, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const TP = [0.01, 611.7], R = 8.314, LV = 40660, LS = 51060;
  const pv = (T) => TP[1] * Math.exp(-LV / R * (1 / (T + 273.15) - 1 / (TP[0] + 273.15)));   // 증기압 (액체–기체)
  const ps = (T) => TP[1] * Math.exp(-LS / R * (1 / (T + 273.15) - 1 / (TP[0] + 273.15)));   // 승화
  const melt = (P) => 0.01 - 7.4e-8 * (P - 611.7);   // 융해 곡선 (°C), 아주 가파름
  const PATHS = {
    boil: [[-20, 101325], [130, 101325]], mount: [[-20, 33700], [120, 33700]], cook: [[-20, 202650], [140, 202650]],
    fd: [[20, 101325], [-30, 101325], [-30, 100], [20, 100]],
  };
  let path = "boil", s = 0, playing = false;
  function state(T, P) { if (P < TP[1]) return T < Math.log(P / TP[1]) * (1 / (-LS / R)) ? "?" : (P < ps(T) ? "기체" : "고체"); if (T < melt(P)) return "고체"; return P > pv(T) ? "액체" : "기체"; }
  function stateOf(T, P) { if (P < ps(Math.min(T, 0.01)) && T < 0.01) return "기체"; if (T < melt(P)) return P >= ps(T) ? "고체" : "기체"; return P >= pv(T) ? "액체" : "기체"; }
  function at(u) { const p = PATHS[path], n = p.length - 1, k = Math.min(n - 1, Math.floor(u * n)), f = u * n - k; const [T0, P0] = p[k], [T1, P1] = p[k + 1]; return [T0 + (T1 - T0) * f, Math.exp(Math.log(P0) + (Math.log(P1) - Math.log(P0)) * f)]; }
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gx = 56, gy = 14, gw = w - 70, gh = h - 44, Tmin = -40, Tmax = 150, Lmin = 1, Lmax = 6;
    const X = (T) => gx + (T - Tmin) / (Tmax - Tmin) * gw, Y = (P) => gy + gh - (Math.log10(P) - Lmin) / (Lmax - Lmin) * gh;
    // 영역 칠하기
    for (let i = 0; i < gw; i += 3) for (let j = 0; j < gh; j += 3) { const T = Tmin + i / gw * (Tmax - Tmin), P = 10 ** (Lmin + (gh - j) / gh * (Lmax - Lmin)); const st = stateOf(T, P); ctx.fillStyle = st === "고체" ? "#dbe8f4" : st === "액체" ? "#bcd9f2" : "#f6f1e3"; ctx.fillRect(gx + i, gy + j, 3, 3); }
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [-40, 0, 50, 100, 150].map((T) => [T, T + " °C"]), yt: [[10, "10 Pa"], [100, "100"], [1000, "1 kPa"], [1e4, "10 kPa"], [101325, "1기압"], [1e6, "1 MPa"]], ylabel: "압력 (로그)" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
    ctx.beginPath(); for (let T = 0.01; T <= Tmax; T += 1) { const y = Y(pv(T)); T === 0.01 ? ctx.moveTo(X(T), y) : ctx.lineTo(X(T), y); } ctx.stroke();
    ctx.beginPath(); for (let T = Tmin; T <= 0.01; T += 0.5) { const y = Y(ps(T)); T === Tmin ? ctx.moveTo(X(T), y) : ctx.lineTo(X(T), y); } ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(melt(TP[1])), Y(TP[1])); ctx.lineTo(X(melt(1e6)), Y(1e6)); ctx.stroke();
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(0.01), Y(TP[1]), 4, 0, Math.PI * 2); ctx.fill(); ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("삼중점", X(0.01) + 6, Y(TP[1]) + 12);
    ctx.fillStyle = C.ink2; ctx.font = `600 12px ${F.sans}`; ctx.fillText("고체", X(-30), Y(3e4)); ctx.fillText("액체", X(40), Y(3e5)); ctx.fillText("기체", X(80), Y(300));
    // 경로
    const p = PATHS[path]; ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4; ctx.beginPath(); p.forEach(([T, P], i) => (i ? ctx.lineTo(X(T), Y(P)) : ctx.moveTo(X(T), Y(P)))); ctx.stroke(); ctx.setLineDash([]);
    const [T, P] = at(s); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(T), Y(P), 6, 0, Math.PI * 2); ctx.fill();
    $(".n-t").textContent = `${T.toFixed(1)} °C`; $(".n-p").textContent = P >= 1000 ? `${(P / 1000).toFixed(1)} kPa` : `${P.toFixed(0)} Pa`; $(".n-s").textContent = stateOf(T, P);
    if (path === "mount" || path === "boil" || path === "cook") { const Tb = (() => { let lo = 0, hi = 200; for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; pv(m) > p[0][1] ? (hi = m) : (lo = m); } return lo; })(); ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.fillText(`끓는점 ≈ ${Tb.toFixed(0)} °C`, X(Tb) + 6, Y(p[0][1]) - 6); }
  }
  loop($("canvas"), (dt) => { if (playing) { s = Math.min(1, s + dt * 0.12); if (s >= 1) playing = false; } draw(); });
  $(".path").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; path = b.dataset.p; s = 0; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  $(".play").addEventListener("click", () => { if (s >= 1) s = 0; playing = !playing; });
  draw();
  if (/[?&]demo\b/.test(location.search)) { root.querySelector('[data-p="fd"]').click(); s = 0.8; }
})();
