/* 카드: 두 은하가 스쳐 지나가면 왜 길쭉한 꼬리가 생길까? — 툼리식 제한 다체 계산 (모식 단위 G = 1) */
(() => {
  const root = document.getElementById("card-adearth-merger");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sQ = $(".q"), oQ = $(".q-out"), sP = $(".p"), oP = $(".p-out"), cFr = $(".fr");
  const bRun = $(".run"), bRst = $(".rst"), nT = $(".n-t"), nD = $(".n-d"), nF = $(".n-f");
  const EPS2 = 0.25 * 0.25, DT = 0.01, TU = 47, LU = 10, R0 = 5, TMAX = 40;
  let orient = "pro", running = false, t = 0;
  let G = [], P = null, N1 = 0;

  function reset() {
    const q = +sQ.value, rp = +sP.value, M = 1 + q;
    const cf = Math.max(-0.999, 2 * rp / R0 - 1), f = -Math.acos(cf), p = 2 * rp, r = p / (1 + Math.cos(f));
    const vr = Math.sqrt(M / p) * Math.sin(f), vt = Math.sqrt(M / p) * (1 + Math.cos(f));
    const rx = r * Math.cos(f), ry = r * Math.sin(f);
    const vx = vr * Math.cos(f) - vt * Math.sin(f), vy = vr * Math.sin(f) + vt * Math.cos(f);
    const a = q / M, b = 1 / M;
    G = [
      { m: 1, x: -a * rx, y: -a * ry, z: 0, vx: -a * vx, vy: -a * vy, vz: 0 },
      { m: q, x: b * rx, y: b * ry, z: 0, vx: b * vx, vy: b * vy, vz: 0 },
    ];
    const parts = [];
    const tilt = orient === "tilt" ? 60 * Math.PI / 180 : 0, sgn = orient === "retro" ? -1 : 1;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    G.forEach((g, gi) => {
      const scale = Math.sqrt(g.m), rings = 11, per = gi === 0 ? 42 : Math.max(18, Math.round(42 * Math.sqrt(g.m)));
      for (let k = 0; k < rings; k++) {
        const rr = (0.25 + 0.75 * k / (rings - 1)) * scale, n = Math.round(per * (0.5 + k / rings));
        const v = Math.sqrt(g.m * rr * rr / Math.pow(rr * rr + EPS2 * g.m, 1.5));
        for (let j = 0; j < n; j++) {
          const th = 2 * Math.PI * (j + 0.5 * (k % 2)) / n;
          let x = rr * Math.cos(th), y = rr * Math.sin(th), ux = -sgn * v * Math.sin(th), uy = sgn * v * Math.cos(th);
          /* x축 둘레로 기울이기 */
          const y2 = y * ct, z2 = y * st, uy2 = uy * ct, uz2 = uy * st;
          parts.push(g.x + x, g.y + y2, z2, g.vx + ux, g.vy + uy2, g.vz + uz2, gi);
        }
      }
      if (gi === 0) N1 = parts.length / 7;
    });
    P = new Float64Array(parts);
    t = 0;
  }
  function accAt(x, y, z, out) {
    out[0] = out[1] = out[2] = 0;
    for (const g of G) {
      const dx = g.x - x, dy = g.y - y, dz = g.z - z, r2 = dx * dx + dy * dy + dz * dz + EPS2 * g.m, inv = g.m / (r2 * Math.sqrt(r2));
      out[0] += dx * inv; out[1] += dy * inv; out[2] += dz * inv;
    }
  }
  const tmp = [0, 0, 0];
  function galAcc() {
    const [A, B] = G, dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z, r2 = dx * dx + dy * dy + dz * dz + EPS2 * 0.5 * (A.m + B.m), inv = 1 / (r2 * Math.sqrt(r2));
    const acc = [[B.m * dx * inv, B.m * dy * inv, B.m * dz * inv], [-A.m * dx * inv, -A.m * dy * inv, -A.m * dz * inv]];
    if (cFr.checked) {
      const d2 = dx * dx + dy * dy + dz * dz, k = 0.2 * Math.exp(-d2 / 3), M = A.m + B.m;
      const rvx = B.vx - A.vx, rvy = B.vy - A.vy, rvz = B.vz - A.vz;
      acc[0][0] += k * rvx * B.m / M; acc[0][1] += k * rvy * B.m / M; acc[0][2] += k * rvz * B.m / M;
      acc[1][0] -= k * rvx * A.m / M; acc[1][1] -= k * rvy * A.m / M; acc[1][2] -= k * rvz * A.m / M;
    }
    return acc;
  }
  function step() {
    /* 은하: 반 걸음 kick */
    let ga = galAcc();
    G.forEach((g, i) => { g.vx += ga[i][0] * DT / 2; g.vy += ga[i][1] * DT / 2; g.vz += ga[i][2] * DT / 2; });
    const n = P.length / 7;
    for (let i = 0; i < n; i++) { const o = i * 7; accAt(P[o], P[o + 1], P[o + 2], tmp); P[o + 3] += tmp[0] * DT / 2; P[o + 4] += tmp[1] * DT / 2; P[o + 5] += tmp[2] * DT / 2; }
    G.forEach((g) => { g.x += g.vx * DT; g.y += g.vy * DT; g.z += g.vz * DT; });
    for (let i = 0; i < n; i++) { const o = i * 7; P[o] += P[o + 3] * DT; P[o + 1] += P[o + 4] * DT; P[o + 2] += P[o + 5] * DT; }
    ga = galAcc();
    G.forEach((g, i) => { g.vx += ga[i][0] * DT / 2; g.vy += ga[i][1] * DT / 2; g.vz += ga[i][2] * DT / 2; });
    for (let i = 0; i < n; i++) { const o = i * 7; accAt(P[o], P[o + 1], P[o + 2], tmp); P[o + 3] += tmp[0] * DT / 2; P[o + 4] += tmp[1] * DT / 2; P[o + 5] += tmp[2] * DT / 2; }
    t += DT;
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w || !P) return;
    const S = Math.min(w, h), sc = S / 13, cx = w / 2, cy = h / 2;
    ctx.fillStyle = "#0f1113"; ctx.fillRect(0, 0, w, h);
    const n = P.length / 7;
    for (let i = 0; i < n; i++) {
      const o = i * 7; ctx.fillStyle = P[o + 6] === 0 ? "rgba(150,200,255,.85)" : "rgba(255,190,110,.85)";
      ctx.fillRect(cx + P[o] * sc - 0.9, cy - P[o + 1] * sc - 0.9, 1.8, 1.8);
    }
    G.forEach((g, i) => { ctx.fillStyle = i === 0 ? "#dff0ff" : "#ffe2b8"; ctx.beginPath(); ctx.arc(cx + g.x * sc, cy - g.y * sc, 3.5, 0, Math.PI * 2); ctx.fill(); });
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12, h - 14); ctx.lineTo(12 + 2 * sc, h - 14); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("20 kpc (모식)", 12, h - 20);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = "rgba(150,200,255,.95)"; ctx.fillText("● 큰 은하의 별", 12, 18);
    ctx.fillStyle = "rgba(255,190,110,.95)"; ctx.fillText("● 작은 은하의 별", 12, 34);
    ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.textAlign = "right"; ctx.fillText("궤도면 위에서 본 모습", w - 10, 18);
    readouts();
  }
  function readouts() {
    const [A, B] = G, d = Math.hypot(B.x - A.x, B.y - A.y, B.z - A.z);
    const my = t * TU;
    nT.textContent = `${(my / 100).toFixed(1)}억 년`;
    nD.textContent = `${Math.round(d * LU)} kpc`;
    const n = P.length / 7; let far = 0;
    for (let i = 0; i < n; i++) { const o = i * 7; const g = G[P[o + 6]]; if (Math.hypot(P[o] - g.x, P[o + 1] - g.y, P[o + 2] - g.z) > 2.0 * Math.sqrt(g.m) + 0.3) far++; }
    nF.textContent = `${Math.round(100 * far / n)} %`;
  }
  NM.loop(cv, () => {
    if (!running) return false;
    for (let k = 0; k < 5; k++) step();
    if (t > TMAX) { running = false; bRun.textContent = "시작"; }
    draw();
    return true;
  });
  bRun.addEventListener("click", () => { running = !running; bRun.textContent = running ? "멈춤" : "계속"; if (running && t > TMAX - 0.1) { reset(); } });
  bRst.addEventListener("click", () => { running = false; bRun.textContent = "시작"; reset(); draw(); });
  root.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => {
    orient = b.dataset.o; root.querySelectorAll("[data-o]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    running = false; bRun.textContent = "시작"; reset(); draw();
  }));
  const param = () => { oQ.textContent = (+sQ.value).toFixed(2).replace(/0$/, ""); oP.textContent = (+sP.value).toFixed(1); running = false; bRun.textContent = "시작"; reset(); draw(); };
  sQ.addEventListener("input", param); sP.addEventListener("input", param); cFr.addEventListener("change", () => { if (t === 0) draw(); });
  oQ.textContent = "1.0";
  reset();
  if (/[?&]demo/.test(location.search)) { const tt = +((location.search.match(/demo=([0-9.]+)/) || [])[1] || 9); while (t < tt) step(); }
  draw();
})();
