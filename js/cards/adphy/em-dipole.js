/* 카드: 전기 쌍극자 — 등전위선, 먼 곳의 1/r³ 전기장, 균일한 전기장 속의 돌림힘과 퍼텐셜 에너지 */
(() => {
  const root = document.getElementById("card-adphy-dipole");
  if (!root) return;
  const { C: COL, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), sD = $(".d"), oD = $(".d-out"), sE = $(".e"), oE = $(".e-out");
  const nP = $(".n-p"), nTq = $(".n-tq"), nU = $(".n-u");
  const K = 8.988e9, Q = 1e-9, HALF = 0.06; /* 장면 가로 반폭 (m) */
  const sup = (n) => String(n).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹⁻"["0123456789-".indexOf(c)]).join("");
  const sci = (v) => { if (v === 0) return "0"; const e = Math.floor(Math.log10(Math.abs(v))); return `${(v / 10 ** e).toFixed(2)}×10${sup(e)}`; };
  const par = () => {
    const th = +sT.value * Math.PI / 180, d = +sD.value / 100, E0 = +sE.value;
    const ux = Math.cos(th), uy = Math.sin(th);
    return { th, d, E0, ch: [[ux * d / 2, uy * d / 2, Q], [-ux * d / 2, -uy * d / 2, -Q]] };
  };
  /* 물리 좌표(m, y 위쪽)에서 전위와 전기장. 외부 전기장 E0는 +x 방향(V = −E0 x) */
  function VE(x, y, p) {
    let V = -p.E0 * x, ex = p.E0, ey = 0;
    for (const [qx, qy, q] of p.ch) {
      const dx = x - qx, dy = y - qy, r2 = Math.max(dx * dx + dy * dy, 1e-8), r = Math.sqrt(r2);
      V += K * q / r; ex += K * q * dx / (r2 * r); ey += K * q * dy / (r2 * r);
    }
    return [V, ex, ey];
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = par(), sceneH = Math.round(h * 0.6), s = w / (2 * HALF), cx = w / 2, cy = sceneH / 2;
    const toP = (X, Y) => [(X - cx) / s, (cy - Y) / s];
    /* 등전위선: 2 px 격자에서 V/ΔV의 정수 부분이 바뀌는 곳을 칠한다 */
    const cell = 2, nx = Math.ceil(w / cell), ny = Math.ceil(sceneH / cell);
    const grid = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const [x, y] = toP(i * cell, j * cell); grid[j * nx + i] = VE(x, y, p)[0]; }
    const dV = 60; /* V */
    const lvl = (v) => Math.floor(Math.sign(v) * Math.min(Math.abs(v), 1200) / dV);
    ctx.save();
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const v = grid[j * nx + i], a = lvl(v);
      if (Math.abs(v) >= 1200 || Math.max(Math.abs(grid[j * nx + i + 1] - v), Math.abs(grid[(j + 1) * nx + i] - v)) > dV * 0.6) continue;
      if (a !== lvl(grid[j * nx + i + 1]) || a !== lvl(grid[(j + 1) * nx + i])) {
        ctx.fillStyle = v > 0 ? "rgba(212,73,58,.75)" : v < 0 ? "rgba(63,111,163,.75)" : COL.ink3;
        ctx.fillRect(i * cell, j * cell, cell, cell);
      }
    }
    ctx.restore();
    /* 전기장 방향 화살표(길이 일정, 진하기 = 세기) */
    for (let Y = 14; Y < sceneH - 6; Y += 22) for (let X = 14; X < w - 6; X += 22) {
      const [x, y] = toP(X, Y), [, ex, ey] = VE(x, y, p), m = Math.hypot(ex, ey);
      if (m < 1) continue;
      const near = p.ch.some(([qx, qy]) => Math.hypot(x - qx, y - qy) < 0.006); if (near) continue;
      const a = Math.min(1, 0.25 + Math.log10(m) / 6), ux = ex / m, uy = -ey / m, L = 7;
      ctx.strokeStyle = `rgba(35,35,38,${(a * 0.6).toFixed(2)})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X - ux * L, Y - uy * L); ctx.lineTo(X + ux * L, Y + uy * L);
      ctx.lineTo(X + ux * L - ux * 3 - uy * 2.5, Y + uy * L - uy * 3 + ux * 2.5); ctx.moveTo(X + ux * L, Y + uy * L); ctx.lineTo(X + ux * L - ux * 3 + uy * 2.5, Y + uy * L - uy * 3 - ux * 2.5); ctx.stroke();
    }
    /* 쌍극자 */
    const [[ax, ay], [bx, by]] = p.ch;
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + ax * s, cy - ay * s); ctx.lineTo(cx + bx * s, cy - by * s); ctx.stroke();
    [[ax, ay, 1], [bx, by, -1]].forEach(([x, y, g]) => {
      const X = cx + x * s, Y = cy - y * s; ctx.fillStyle = g > 0 ? COL.apple : "#3f6fa3"; ctx.beginPath(); ctx.arc(X, Y, 7, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X - 4, Y); ctx.lineTo(X + 4, Y); if (g > 0) { ctx.moveTo(X, Y - 4); ctx.lineTo(X, Y + 4); } ctx.stroke();
    });
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    const tag = (t, x, y, col) => { const tw = ctx.measureText(t).width; ctx.fillStyle = "rgba(251,251,248,.92)"; ctx.fillRect(x - 3, y - 11, tw + 6, 15); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    tag(p.E0 ? `외부 전기장 E₀ = ${p.E0} N/C →` : "외부 전기장 없음", 8, 14, COL.ink2);
    tag(`등전위선 간격 ${dV} V · 화면 가로 ${HALF * 200} cm`, 8, sceneH - 6, COL.ink3);

    /* 아래: 축 방향 거리에 따른 |E| (로그–로그) */
    const x0 = 50, x1 = w - 14, y1 = sceneH + 26, y0 = h - 30, r0 = 0.01, r1 = 1, e0 = 1e0, e1 = 1e6;
    ctx.strokeStyle = COL.rule; ctx.beginPath(); ctx.moveTo(0, sceneH + 4); ctx.lineTo(w, sceneH + 4); ctx.stroke();
    const X = (r) => x0 + Math.log10(r / r0) / Math.log10(r1 / r0) * (x1 - x0), Y = (e) => y0 - Math.log10(e / e0) / Math.log10(e1 / e0) * (y0 - y1);
    NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, X, Y, xt: [[0.01, "1 cm"], [0.1, "10 cm"], [1, "1 m"]], yt: [[1, "1"], [1e2, "10²"], [1e4, "10⁴"], [1e6, "10⁶"]], xlabel: "쌍극자 중심에서 축 방향 거리 r", ylabel: "|E| (N/C), 외부 전기장 제외" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y1, x1 - x0, y0 - y1); ctx.clip();
    const curve = (f, col, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.beginPath(); let st = false; for (let i = 0; i <= 200; i++) { const r = r0 * (r1 / r0) ** (i / 200), e = f(r); if (!(e > 0)) { st = false; continue; } st ? ctx.lineTo(X(r), Y(e)) : ctx.moveTo(X(r), Y(e)); st = true; } ctx.stroke(); ctx.setLineDash([]); };
    curve((r) => K * Q / (r * r), COL.ink3, [5, 4]);
    curve((r) => r > p.d / 2 * 1.02 ? K * Q * (1 / (r - p.d / 2) ** 2 - 1 / (r + p.d / 2) ** 2) : NaN, COL.forest);
    curve((r) => 2 * K * Q * p.d / r ** 3, COL.amber, [2, 3]);
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = COL.ink3; ctx.fillText("점전하 +Q 하나: kQ/r²", x1 - 4, y1 + 12);
    ctx.fillStyle = COL.forest; ctx.fillText("쌍극자 (정확한 값)", x1 - 4, y1 + 26);
    ctx.fillStyle = "#b07a10"; ctx.fillText("근사 2kp/r³", x1 - 4, y1 + 40);
  }
  function update() {
    const p = par(), pm = Q * p.d;
    oT.textContent = (+sT.value).toFixed(0); oD.textContent = (+sD.value).toFixed(1); oE.textContent = sE.value;
    nP.textContent = `${sci(pm)} C·m`;
    nTq.textContent = p.E0 ? `${sci(pm * p.E0 * Math.abs(Math.sin(p.th)))} N·m` : "0";
    nU.textContent = p.E0 ? `${sci(-pm * p.E0 * Math.cos(p.th))} J` : "0";
    draw();
  }
  [sT, sD, sE].forEach((el) => el.addEventListener("input", update));
  if (/[?&]demo\b/.test(location.search)) { sT.value = 60; sE.value = 3000; }
  update();
})();
