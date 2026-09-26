/* 카드: 불을 끄면 캘빈 회로의 어떤 물질이 쌓일까? — 고정 vc = k·CO₂·RuBP, 환원 vr = k·L·3PG, 재생 vg = k·L·G3P, 유출 vo = k·G3P² 모식. 기준 상태에서 10초에 빛 또는 CO₂를 바꾼다 */
(() => {
  const root = document.getElementById("card-cell-calvin");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".time"), oT = $(".t-out"), nR = $(".n-r"), nP = $(".n-p"), nL = $(".n-l");
  const COL = { R: "#3f6fa3", P: "#e0a02a", G: "#3b7c2a" };
  let mode = "dark", S = null;
  function simulate() {
    let R = 1, P = 1, G = 1; const dt = 0.01;
    const step = (L, CO2) => { const vc = CO2 * R, vr = 0.5 * L * P, vg = 0.8 * L * G, vo = 0.25 * G * G; R += (0.6 * vg - vc) * dt; P += (2 * vc - vr) * dt; G += (vr - vg - vo) * dt; };
    for (let t = 0; t < 300; t += dt) step(1, 1);
    const b = [R, P, G], out = [];
    for (let i = 0; i <= 4000; i++) {
      const t = i * dt, after = t >= 10;
      if (i % 10 === 0) out.push({ t, R: R / b[0], P: P / b[1], G: G / b[2], L: mode === "dark" && after ? 0 : 1, CO2: mode === "lowco2" && after ? 0.2 : 1 });
      step(mode === "dark" && after ? 0 : 1, mode === "lowco2" && after ? 0.2 : 1);
    }
    return out;
  }
  const at = (t) => S[Math.min(S.length - 1, Math.round(t * 10))];

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value, s = at(t);
    // 회로 그림
    const cx = w * 0.46, cy = h * 0.26, R0 = Math.min(w * 0.2, h * 0.15);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.4; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(cx, cy, R0, 0, 6.29); ctx.stroke(); ctx.setLineDash([]);
    const pos = { R: -Math.PI / 2 - 0.9, P: -Math.PI / 2 + 0.9, G: Math.PI / 2 };
    const node = (k, v, name, cn) => {
      const a = pos[k], x = cx + Math.cos(a) * R0, y = cy + Math.sin(a) * R0, r = 9 + 13 * Math.sqrt(Math.min(4, v));
      ctx.fillStyle = COL[k]; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill(); ctx.globalAlpha = 1;
      const side = k === "R" ? -1 : k === "P" ? 1 : 0;
      ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = side < 0 ? "right" : side > 0 ? "left" : "center";
      const lx = x + side * (r + 8), ly = side ? y - 2 : y + r + 16;
      ctx.fillText(name, lx, ly);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(cn, lx, ly + 14);
    };
    node("R", s.R, "RuBP", "탄소 5"); node("P", s.P, "3PG", "탄소 3"); node("G", s.G, "G3P", "탄소 3");
    // 단계 이름과 입력
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillStyle = s.CO2 < 1 ? C.warn : C.ink; ctx.fillText(s.CO2 < 1 ? "① 고정 ← CO₂ 부족" : "① 고정 ← CO₂", cx, cy - R0 - 6);
    ctx.fillStyle = s.L ? C.amber : C.ink3; ctx.textAlign = "left";
    ctx.fillText(s.L ? "② 환원 ← ATP, NADPH" : "② 환원: ATP·NADPH 없음", cx + R0 * 0.72, cy + R0 * 0.35);
    ctx.textAlign = "right"; ctx.fillText(s.L ? "③ 재생 ← ATP" : "③ 재생: 멈춤", cx - R0 * 0.72, cy + R0 * 0.35);
    ctx.fillStyle = C.forest; ctx.textAlign = "center"; ctx.font = `11px ${F.sans}`;
    // 명반응 상자
    ctx.fillStyle = s.L ? "#fff2c9" : "#e6e7ea"; ctx.strokeStyle = s.L ? C.amber : C.ink3; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(w - 96, 8, 88, 34, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.fillText(s.L ? "명반응: 빛 켬" : "명반응: 빛 끔", w - 52, 29);
    // 그래프
    const gx = 44, gy = h * 0.54, gw = w - gx - 14, gh = h - gy - 34;
    const X = (v) => gx + v / 40 * gw, Y = (v) => gy + gh - v / 3.2 * gh;
    ctx.fillStyle = "#eceded"; ctx.fillRect(X(10), gy, X(40) - X(10), gh);
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [0, 10, 20, 30, 40].map((v) => [v, v]), yt: [[0, "0"], [1, "1"], [2, "2"], [3, "3"]], xlabel: "시간 (상대)", ylabel: "처음 양 대비" });
    [["R", "RuBP"], ["P", "3PG"]].forEach(([k, name]) => {
      ctx.strokeStyle = COL[k]; ctx.lineWidth = 2.4; ctx.beginPath();
      S.forEach((q, i) => (i ? ctx.lineTo(X(q.t), Y(Math.min(3.2, q[k]))) : ctx.moveTo(X(q.t), Y(q[k])))); ctx.stroke();
      const e = S[S.length - 1]; ctx.fillStyle = COL[k]; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(name, gx + gw - 4, Y(Math.min(3.1, e[k])) - 6);
    });
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(mode === "dark" ? "빛 끔 →" : "CO₂ 줄임 →", X(10) + 4, gy + 14);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(t), gy); ctx.lineTo(X(t), gy + gh); ctx.stroke(); ctx.setLineDash([]);
  }
  function update() {
    const s = at(+sT.value);
    oT.textContent = sT.value; nR.textContent = s.R.toFixed(2); nP.textContent = s.P.toFixed(2);
    nL.textContent = s.L ? "있음" : "끊김"; nL.classList.toggle("bad", !s.L);
    root.querySelectorAll("[data-x]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.x === mode ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.x; S = simulate(); update(); }));
  sT.addEventListener("input", update);
  S = simulate(); update();
})();
