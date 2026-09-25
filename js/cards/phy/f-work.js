/* 카드: 일을 하면 운동 에너지가 얼마나 늘까? — F–x 그래프의 넓이와 ½mv²를 수치 적분으로 비교 */
(() => {
  const root = document.getElementById("card-phy-work");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sF = $(".wf"), sM = $(".wm"), fr = $(".wfric");
  const oF = $(".wf-out"), oM = $(".wm-out");
  const nW = $(".w-work"), nQ = $(".w-fric"), nK = $(".w-ke"), nV = $(".w-v");

  const g = 9.81, XP = 4, XE = 7, MU = 0.1; // 미는 구간 4 m, 레일 7 m
  let prof = "const";
  // 모든 모양이 0~4 m에서 같은 넓이(4F)를 갖도록 정함
  const PROF = {
    const: (x, F0) => F0,
    ramp: (x, F0) => 2 * F0 * (1 - x / XP),
    front: (x, F0) => (x < 2 ? 2 * F0 : 0),
    wave: (x, F0) => F0 * (1 + 0.8 * Math.sin(Math.PI * x)),
  };
  const force = (x) => (x < XP ? PROF[prof](x, +sF.value) : 0);

  let x, v, W, Q, t, done, wait, trail;
  function reset() {
    x = 0; v = 0; W = 0; Q = 0; t = 0; done = false; wait = 0; trail = [];
    oF.textContent = (+sF.value).toFixed(1); oM.textContent = (+sM.value).toFixed(1);
    const m = +sM.value, f = fr.checked ? MU * m * g : 0;
    const Wp = 4 * +sF.value;
    nW.textContent = `${Wp.toFixed(1)} J`;
    nQ.textContent = f ? `−${(f * XP).toFixed(1)} J` : "0 J";
    nK.textContent = "—"; nV.textContent = "—";
    draw();
  }

  function step(dt) {
    const m = +sM.value, fk = fr.checked ? MU * m * g : 0;
    const Fx = force(x);
    // 멈춰 있을 때는 미는 힘이 마찰을 넘어야 출발
    if (v <= 0 && Fx <= fk) { v = 0; if (x >= XP || Fx === 0) done = done || x > 0; return; }
    const a = (Fx - fk) / m;
    const v1 = Math.max(0, v + a * dt / 2), dx = v1 * dt;
    W += force(x + dx / 2) * dx; Q += fk * dx;
    v = Math.max(0, v + a * dt); x += dx; t += dt;
    if (x >= XP && nK.textContent === "—") {
      nK.textContent = `${(0.5 * m * v * v).toFixed(1)} J`; nV.textContent = `${v.toFixed(2)} m/s`;
    }
    if (x >= XE) { x = XE; done = true; }
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = +sM.value, F0 = +sF.value;
    // ── 위: 레일과 수레
    const rx0 = 16, rx1 = w - 16, RX = (xx) => rx0 + xx / XE * (rx1 - rx0), ry = 50;
    ctx.fillStyle = "rgba(116,171,102,.18)"; ctx.fillRect(RX(0), ry - 34, RX(XP) - RX(0), 34);
    ctx.fillStyle = "#e6e6df"; ctx.fillRect(rx0, ry, rx1 - rx0, 5);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let k = 0; k <= XE; k++) ctx.fillText(`${k}`, RX(k), ry + 17);
    ctx.fillStyle = C.forest; ctx.fillText("미는 구간", (RX(0) + RX(XP)) / 2, ry - 38);
    const cw = 16 + 5 * m, cx = RX(x);
    ctx.fillStyle = C.ink; ctx.fillRect(cx - cw, ry - 18, cw, 16);
    ctx.beginPath(); ctx.arc(cx - cw + 5, ry, 3.5, 0, Math.PI * 2); ctx.arc(cx - 5, ry, 3.5, 0, Math.PI * 2); ctx.fill();
    const Fx = force(x);
    if (Fx > 0) {
      const L = Fx * 3;
      ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(cx - cw - 4 - L, ry - 10); ctx.lineTo(cx - cw - 10, ry - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - cw - 3, ry - 10); ctx.lineTo(cx - cw - 11, ry - 14); ctx.lineTo(cx - cw - 11, ry - 6); ctx.fill();
    }
    ctx.textAlign = "right"; ctx.fillStyle = C.ink2; ctx.fillText(`v = ${v.toFixed(2)} m/s`, rx1, 14);

    // ── 왼쪽 아래: F–x 그래프
    const gx0 = 34, gy0 = ry + 44, gw = w * 0.58 - gx0, gh = h - gy0 - 30;
    const Fm = 2 * 10 * 1.05;
    const X = (xx) => gx0 + xx / XP * gw, Y = (ff) => gy0 + (1 - ff / Fm) * gh;
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gw, h: gh, X, Y, xt: [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4"]], yt: [[0, "0"], [5, "5"], [10, "10"], [15, "15"], [20, "20"]], ylabel: "힘 F (N)", xlabel: "위치 x (m)" });
    const xs = Math.min(x, XP);
    ctx.beginPath(); ctx.moveTo(X(0), Y(0));
    for (let xx = 0; xx <= xs; xx += 0.01) ctx.lineTo(X(xx), Y(PROF[prof](xx, F0)));
    ctx.lineTo(X(xs), Y(0)); ctx.closePath(); ctx.fillStyle = "rgba(116,171,102,.35)"; ctx.fill();
    ctx.beginPath();
    for (let xx = 0; xx <= XP + 1e-9; xx += 0.01) { const yy = Y(PROF[prof](Math.min(xx, XP - 1e-9), F0)); xx === 0 ? ctx.moveTo(X(xx), yy) : ctx.lineTo(X(xx), yy); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    if (fr.checked) {
      const fk = MU * m * g;
      ctx.setLineDash([4, 3]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(X(0), Y(fk)); ctx.lineTo(X(XP), Y(fk)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.font = `10px ${F.mono}`; ctx.fillText(`마찰력 ${fk.toFixed(1)} N`, X(XP), Y(fk) - 4);
    }

    // ── 오른쪽 아래: 에너지 막대
    const bx0 = w * 0.64, bw = (w - 14 - bx0) / 3 - 8, by1 = h - 30, bh = by1 - gy0;
    const Emax = Math.max(4 * F0, 1) * 1.1, K = 0.5 * m * v * v;
    const bars = [["한 일 W", W, C.forest], ["운동 에너지", K, C.ink], ["열 (마찰)", Q, C.warn]];
    ctx.font = `10px ${F.mono}`;
    bars.forEach(([lab, val, col], i) => {
      const bx = bx0 + i * (bw + 8), hh = Math.min(val / Emax, 1.05) * bh;
      ctx.fillStyle = col; ctx.fillRect(bx, by1 - hh, bw, hh);
      ctx.fillStyle = C.ink2; ctx.textAlign = "center";
      ctx.fillText(`${val.toFixed(1)}`, bx + bw / 2, by1 - hh - 4);
      ctx.fillStyle = C.ink3; ctx.fillText(lab.split(" ")[0], bx + bw / 2, by1 + 13);
      if (lab.split(" ")[1]) ctx.fillText(lab.split(" ").slice(1).join(" "), bx + bw / 2, by1 + 25);
    });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx0 - 4, by1 + .5); ctx.lineTo(w - 10, by1 + .5); ctx.stroke();
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText("J", bx0 - 4, gy0 - 6);
  }

  [sF, sM, fr].forEach((el) => el.addEventListener("input", reset));
  root.querySelectorAll("[data-prof]").forEach((b) => b.addEventListener("click", () => {
    prof = b.dataset.prof;
    root.querySelectorAll("[data-prof]").forEach((c) => c.setAttribute("aria-pressed", c === b ? "true" : "false"));
    reset();
  }));
  reset();
  loop(cv, (dt) => {
    if (done) { wait += dt; if (wait > 1.8) reset(); else return; }
    for (let i = 0; i < 20; i++) step(dt / 20);
    if (!done && v === 0 && x > 0 && force(x) <= (fr.checked ? MU * +sM.value * g : 0)) {
      done = true;
      if (x < XP) { nK.textContent = "0 J"; nV.textContent = `${x.toFixed(2)} m에서 멈춤`; }
    }
    draw();
  });
})();
