/* 카드: 힘을 주지 않으면 물체는 멈출까? — 미는 힘과 마찰력, 알짜힘으로 움직임을 수치 적분 */
(() => {
  const root = document.getElementById("card-phy-inertia");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sF = $(".force"), oF = $(".force-out");
  const nF = $(".f-app"), nf = $(".f-fric"), nNet = $(".f-net"), nV = $(".f-v");

  const g = 9.81, M = 2; // kg
  const SURF = { none: { mu: 0, name: "마찰 없음" }, ice: { mu: 0.03, name: "얼음" }, wood: { mu: 0.3, name: "나무 바닥" }, rubber: { mu: 0.6, name: "고무 매트" } };
  let surf = "wood", x = 0, v = 0, t = 0;
  const hist = []; // [t, v, F]
  const SPAN = 12; // 그래프에 보이는 시간 (s)

  function forces() {
    const fmax = SURF[surf].mu * M * g, F0 = +sF.value;
    const Fa = fmax > 0 && Math.abs(F0 - fmax) < 0.051 ? fmax : F0; // 눈금 0.1 N 때문에 생기는 오차를 맞춤
    // 움직이는 중: 운동 마찰 μmg. 멈춰 있으면: 미는 힘만큼(최대 μmg)만 버팀.
    const fr = v > 1e-9 ? fmax : Math.min(Fa, fmax);
    return { Fa, fr, net: Fa - fr };
  }

  function step(dt) {
    const { net } = forces();
    v += net / M * dt;
    if (v < 0) v = 0;          // 마찰은 멈추게만 하고, 뒤로 밀지는 않는다
    x += v * dt; t += dt;
  }

  const { ctx, size } = fit(cv, () => draw());

  function arrow(x0, y0, x1, y1, col, lw = 2.2) {
    if (Math.abs(x1 - x0) < 2) return;
    const a = Math.atan2(y1 - y0, x1 - x0), hl = 8;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - hl * 0.8 * Math.cos(a), y1 - hl * 0.8 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - hl * Math.cos(a - 0.4), y1 - hl * Math.sin(a - 0.4));
    ctx.lineTo(x1 - hl * Math.cos(a + 0.4), y1 - hl * Math.sin(a + 0.4)); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = forces();
    // ── 위: 바닥과 상자 (카메라가 상자를 따라감 → 바닥 눈금이 흘러감)
    const gy = Math.round(h * 0.34), bx = w * 0.42, bw = 44, bh = 32, pxm = 60;
    ctx.fillStyle = surf === "ice" ? "#dfeaf0" : surf === "rubber" ? "#4a4a4d" : surf === "wood" ? "#d9c7a6" : "#eeeee8";
    ctx.fillRect(0, gy, w, 10);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    const m0 = Math.floor((x - bx / pxm) ), m1 = Math.ceil(x + (w - bx) / pxm);
    for (let m = m0; m <= m1; m++) {
      const px = bx + (m - x) * pxm;
      ctx.beginPath(); ctx.moveTo(px, gy + 10); ctx.lineTo(px, gy + 16); ctx.stroke();
      if (m % 2 === 0) ctx.fillText(`${m} m`, px, gy + 27);
    }
    ctx.fillStyle = C.ink; ctx.fillRect(bx - bw / 2, gy - bh, bw, bh);
    ctx.fillStyle = C.paper; ctx.font = `500 11px ${F.mono}`; ctx.fillText("2 kg", bx, gy - bh / 2 + 4);
    // 힘 화살표: 1 N = 3.2 px
    const k = 3.2;
    arrow(bx - bw / 2 - 4 - f.Fa * k, gy - bh / 2, bx - bw / 2 - 4, gy - bh / 2, C.ink);
    if (f.fr > 0) arrow(bx, gy + 4, bx - f.fr * k, gy + 4, C.warn);
    arrow(bx, gy - bh - 12, bx + f.net * k, gy - bh - 12, C.forest, 2.6);
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillStyle = C.ink2; ctx.fillText(`미는 힘 ${f.Fa.toFixed(1)} N`, 8, 16);
    ctx.fillStyle = C.warn; ctx.fillText(`마찰력 ${f.fr.toFixed(1)} N`, 8, 30);
    ctx.fillStyle = C.forest; ctx.fillText(`알짜힘 ${f.net.toFixed(1)} N`, 8, 44);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(SURF[surf].name + (SURF[surf].mu ? ` · μ = ${SURF[surf].mu}` : ""), w - 8, 16);

    // ── 아래: 속력–시간 그래프
    const x0 = 40, y0 = gy + 52, pw = w - x0 - 12, ph = h - y0 - 30;
    const tA = Math.max(0, t - SPAN), vMax = Math.max(4, ...hist.map((p) => p[1])) * 1.1;
    const X = (tt) => x0 + (tt - tA) / SPAN * pw, Y = (vv) => y0 + (1 - vv / vMax) * ph;
    const xt = []; for (let s = Math.ceil(tA / 2) * 2; s <= tA + SPAN; s += 2) xt.push([s, `${s}`]);
    const ys = vMax > 20 ? 10 : vMax > 8 ? 4 : 1, yt = []; for (let s = 0; s <= vMax; s += ys) yt.push([s, `${s}`]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt, yt, ylabel: "속력 (m/s)", xlabel: "시간 (s)" });
    ctx.beginPath(); let first = true;
    for (const [tt, vv] of hist) { if (tt < tA) continue; first ? ctx.moveTo(X(tt), Y(vv)) : ctx.lineTo(X(tt), Y(vv)); first = false; }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
  }

  function numbers() {
    const f = forces();
    oF.textContent = f.Fa.toFixed(1);
    nF.textContent = `${f.Fa.toFixed(1)} N`; nf.textContent = `${f.fr.toFixed(1)} N`;
    nNet.textContent = `${f.net.toFixed(1)} N`; nV.textContent = `${v.toFixed(2)} m/s`;
  }

  sF.addEventListener("input", () => { numbers(); draw(); });
  root.querySelectorAll("[data-surf]").forEach((b) => b.addEventListener("click", () => {
    surf = b.dataset.surf;
    root.querySelectorAll("[data-surf]").forEach((c) => c.setAttribute("aria-pressed", c === b ? "true" : "false"));
    numbers(); draw();
  }));
  $(".f-zero").addEventListener("click", () => { sF.value = 0; numbers(); draw(); });
  $(".f-match").addEventListener("click", () => { sF.value = (SURF[surf].mu * M * g).toFixed(1); numbers(); draw(); });
  $(".f-reset").addEventListener("click", () => { x = 0; v = 0; t = 0; hist.length = 0; numbers(); draw(); });
  numbers();
  let acc = 0;
  loop(cv, (dt) => {
    for (let i = 0; i < 10; i++) step(dt / 10);
    acc += dt; if (acc > 0.05) { hist.push([t, v]); acc = 0; }
    while (hist.length && hist[0][0] < t - SPAN - 1) hist.shift();
    numbers(); draw();
  });
})();
