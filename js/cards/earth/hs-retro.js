/* 카드: 행성은 왜 가끔 뒤로 가는 것처럼 보일까? — 지구에서 본 행성의 황경 (원 궤도 근사) */
(() => {
  const root = document.getElementById("card-earth-retro");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), play = $(".play");
  const nDir = $(".dir"), nEl = $(".elong"), nRet = $(".ret"), msg = $(".rt-msg");
  // 궤도 반지름 (AU)과 공전 주기 (년) — 실제 값, 원 궤도·같은 평면으로 근사
  const PL = { venus: { name: "금성", a: 0.723, P: 0.615, col: "#e0a02a" }, mars: { name: "화성", a: 1.524, P: 1.881, col: "#c9463d" }, jupiter: { name: "목성", a: 5.203, P: 11.86, col: "#a8781c" } };
  let key = "mars", running = !NM.reduce;
  const SPAN = 2.2;   // 그래프에 보여 줄 햇수

  const pos = (a, P, t, ph = 0) => { const q = 2 * Math.PI * t / P + ph; return [a * Math.cos(q), a * Math.sin(q)]; };
  // 시작 위치: 화성은 약 1년 뒤, 목성은 약 0.6년 뒤에 충이, 금성은 약 1.1년 뒤에 내합이 오도록
  const PH = { venus: -2 * Math.PI * 1.1 * (1 / 0.615 - 1), mars: 2 * Math.PI * (1 - 1 / 1.881), jupiter: 2 * Math.PI * 0.6 * (1 - 1 / 11.86) };
  function lonAt(t) { // 지구에서 본 행성의 황경(도)과 이각
    const p = PL[key], [ex, ey] = pos(1, 1, t), [px, py] = pos(p.a, p.P, t, PH[key]);
    const lon = Math.atan2(py - ey, px - ex) * 180 / Math.PI;
    const sun = Math.atan2(-ey, -ex) * 180 / Math.PI;
    let el = lon - sun; el = ((el + 540) % 360) - 180;
    return { lon, el };
  }
  function series() { const out = []; let prev = null, acc = 0; for (let t = 0; t <= SPAN + 1e-9; t += 0.004) { const { lon, el } = lonAt(t); if (prev !== null) { let d = lon - prev; d = ((d + 540) % 360) - 180; acc += d; } else acc = lon; prev = lon; out.push([t, acc, el]); } return out; }

  const { ctx, size } = fit(cv, () => draw());
  let S = series();

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value, p = PL[key];
    const narrow = w < 520;
    // 왼쪽(또는 위): 위에서 본 궤도
    const ow = narrow ? w : w * 0.44, oh = narrow ? h * 0.48 : h;
    const cx = ow / 2, cy = oh / 2, amax = Math.max(1, p.a) * 1.08, sc = Math.min(ow, oh) / 2 / amax * 0.92;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (const a of [1, p.a]) { ctx.beginPath(); ctx.arc(cx, cy, a * sc, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = "#e0a02a"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    const [ex, ey] = pos(1, 1, t), [px, py] = pos(p.a, p.P, t, PH[key]);
    const E = [cx + ex * sc, cy - ey * sc], Pp = [cx + px * sc, cy - py * sc];
    // 시선
    const dx = Pp[0] - E[0], dy = Pp[1] - E[1], L = Math.hypot(dx, dy);
    ctx.strokeStyle = "rgba(35,35,38,.35)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(E[0], E[1]); ctx.lineTo(E[0] + dx / L * sc * amax * 2, E[1] + dy / L * sc * amax * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#3f7fc4"; ctx.beginPath(); ctx.arc(E[0], E[1], 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(Pp[0], Pp[1], 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("지구", E[0] + 8, E[1] + 4); ctx.fillText(p.name, Pp[0] + 8, Pp[1] + 4);
    ctx.fillStyle = C.ink3; ctx.fillText("위에서 본 궤도 (원 궤도 근사)", 6, 14);

    // 오른쪽(또는 아래): 하늘에서 본 황경 변화
    const gx0 = narrow ? 44 : ow + 40, gy0 = narrow ? oh + 26 : 26, gw = w - gx0 - 10, gh = (narrow ? h - oh - 26 : h - 26) - 30;
    const lo = Math.min(...S.map((s) => s[1])), hi = Math.max(...S.map((s) => s[1]));
    const X = (tt) => gx0 + tt / SPAN * gw, Y = (v) => gy0 + (1 - (v - lo) / (hi - lo || 1)) * gh;
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gw, h: gh, X, Y, xt: [0, 1, 2].map((k) => [k, `${k}년`]), yt: [], ylabel: "하늘에서의 위치 (황경, 동쪽 ↑)" });
    // 역행 구간 칠하기
    for (let i = 1; i < S.length; i++) if (S[i][1] < S[i - 1][1]) { ctx.fillStyle = "rgba(181,83,47,.16)"; ctx.fillRect(X(S[i - 1][0]), gy0, X(S[i][0]) - X(S[i - 1][0]) + .5, gh); }
    ctx.beginPath(); S.forEach(([tt, v], i) => i ? ctx.lineTo(X(tt), Y(v)) : ctx.moveTo(X(tt), Y(v)));
    ctx.strokeStyle = p.col; ctx.lineWidth = 2.2; ctx.stroke();
    const k = Math.min(S.length - 1, Math.round(t / 0.004));
    ctx.beginPath(); ctx.arc(X(S[k][0]), Y(S[k][1]), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = "#9a4a2a"; ctx.textAlign = "right"; ctx.fillText("칠한 구간: 역행 (서쪽으로 되돌아감)", gx0 + gw, gy0 + gh + 26);
    ctx.textAlign = "left";
  }

  function update() {
    const t = +sT.value, p = PL[key];
    oT.textContent = `${t.toFixed(2)}년`;
    const k = Math.min(S.length - 1, Math.round(t / 0.004)), k0 = Math.max(0, k - 1);
    const back = S[k][1] < S[k0][1];
    nDir.textContent = back ? "역행 (서쪽으로)" : "순행 (동쪽으로)";
    nDir.classList.toggle("bad", back);
    nEl.textContent = `${Math.abs(S[k][2]).toFixed(0)}° ${S[k][2] >= 0 ? "동쪽" : "서쪽"}`;
    // 한 번 역행하는 기간 (가장 긴 구간)
    let days = 0, run = 0; for (let i = 1; i < S.length; i++) { if (S[i][1] < S[i - 1][1]) { run += 0.004 * 365.25; days = Math.max(days, run); } else run = 0; }
    nRet.textContent = `약 ${Math.round(days)}일`;
    msg.textContent = key === "venus"
      ? `금성은 태양에서 ${Math.round(Math.asin(p.a) * 180 / Math.PI)}°보다 멀어지지 못합니다(최대 이각). 그래서 해 뜨기 전 동쪽 하늘이나 해 진 뒤 서쪽 하늘에서만 보입니다.`
      : `${p.name}은 지구가 ${p.name}을 앞지를 때(충 무렵) 뒤로 가는 것처럼 보입니다. 행성이 실제로 거꾸로 도는 것이 아닙니다.`;
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === key)));
    draw();
  }
  sT.addEventListener("input", () => { running = false; play.textContent = "재생"; update(); });
  play.addEventListener("click", () => { running = !running; play.textContent = running ? "멈춤" : "재생"; });
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.p; S = series(); sT.value = 0; update(); }));
  play.textContent = running ? "멈춤" : "재생";
  update();
  loop(cv, (dt) => { if (!running) return; let t = +sT.value + dt * 0.12; if (t > SPAN) t = 0; sT.value = t; update(); });
})();
