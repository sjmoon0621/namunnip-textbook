/* 카드: 바닷속 소리는 왜 수천 km까지 전해질까? — 매켄지 음속식과 음선 추적 (모식 수온 분포) */
(() => {
  const root = document.getElementById("card-adearth-sofar");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sTs = $(".ts"), sH = $(".h"), sSc = $(".sc"), sZ = $(".zs");
  const oTs = $(".ts-out"), oH = $(".h-out"), oSc = $(".sc-out"), oZ = $(".zs-out"), st = $(".sf-state"), nZ = $(".n-z"), nC = $(".n-c"), nR = $(".n-r");
  const ZB = 5000, RMAX = 150000, DZ = 5;
  /* [표층 수온, 혼합층, 약층 척도, 음원 깊이, 깊은 물 수온] */
  const P = [[20, 50, 600, null, 2], [28, 80, 300, null, 2], [12, 200, 700, 100, 2], [-1.5, 0, 300, 50, 0.5]];
  let pi = 0, tdeep = 2;
  const mack = (T, S, D) => 1448.96 + 4.591 * T - 5.304e-2 * T * T + 2.374e-4 * T ** 3 + 1.34 * (S - 35) + 1.63e-2 * D + 1.675e-7 * D * D - 1.025e-2 * T * (S - 35) - 7.139e-13 * T * D ** 3;
  let prof = null;
  function build() {
    const ts = +sTs.value, h = +sH.value, sc = +sSc.value, T = [], c = [];
    for (let i = 0; i <= ZB / DZ; i++) { const z = i * DZ, t = z <= h ? ts : tdeep + (ts - tdeep) * Math.exp(-(z - h) / sc); T.push(t); c.push(mack(t, 35, z)); }
    let im = 0; c.forEach((v, i) => { if (v < c[im]) im = i; });
    prof = { T, c, zmin: im * DZ, cmin: c[im] };
  }
  const cAt = (z) => { const i = Math.max(0, Math.min(prof.c.length - 2, Math.floor(z / DZ))), f = z / DZ - i; return prof.c[i] + f * (prof.c[i + 1] - prof.c[i]); };
  const dcAt = (z) => { const i = Math.max(0, Math.min(prof.c.length - 2, Math.floor(z / DZ))); return (prof.c[i + 1] - prof.c[i]) / DZ; };
  function rays() {
    const zs = +sZ.value, out = [];
    for (let a = -14; a <= 14; a++) {
      let r = 0, z = Math.max(1, zs), th = a * Math.PI / 180, hit = false, alive = true; const pts = [[0, z]], ds = 40;
      while (r < RMAX) {
        const c = cAt(z), dc = dcAt(z);
        th += -Math.cos(th) * dc / c * ds; r += Math.cos(th) * ds; z += Math.sin(th) * ds;
        if (z < 0) { z = -z; th = -th; hit = true; }
        if (z > ZB) { pts.push([r, ZB]); alive = false; hit = true; break; }
        if (pts.length < 4000 && (r - pts[pts.length - 1][0] > 400)) pts.push([r, z]);
      }
      if (alive) pts.push([r, z]);
      out.push({ pts, hit, alive });
    }
    return out;
  }
  const { ctx, size } = fit(cv, () => draw());
  let R = [];
  function draw() {
    const { w, h } = size; if (!w || !prof) return;
    ctx.clearRect(0, 0, w, h);
    const y0 = 22, y1 = h - 34, Y = (z) => y0 + z / ZB * (y1 - y0);
    /* 왼쪽: 음속 */
    const lx0 = 40, lx1 = w * 0.3, C0 = 1440, C1 = 1560, X = (c) => lx0 + (c - C0) / (C1 - C0) * (lx1 - lx0);
    NM.axes(ctx, { x0: lx0, y0, w: lx1 - lx0, h: y1 - y0, X, Y: (v) => Y(v), xt: [[1450, "1450"], [1500, "1500"], [1550, "1550"]], yt: [0, 1000, 2000, 3000, 4000, 5000].map((v) => [v, `${v / 1000}`]), xlabel: "음속 (m/s)", ylabel: "깊이 (km)" });
    const TX = (t) => lx0 + (t + 2) / 32 * (lx1 - lx0);
    ctx.strokeStyle = "rgba(212,73,58,.6)"; ctx.lineWidth = 1.4; ctx.beginPath(); prof.T.forEach((t, i) => (i ? ctx.lineTo(TX(t), Y(i * DZ)) : ctx.moveTo(TX(t), Y(i * DZ)))); ctx.stroke();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2.2; ctx.beginPath(); prof.c.forEach((c, i) => (i ? ctx.lineTo(X(c), Y(i * DZ)) : ctx.moveTo(X(c), Y(i * DZ)))); ctx.stroke();
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = "rgba(212,73,58,.9)"; ctx.textAlign = "left"; ctx.fillText("수온 (−2~30 °C)", lx0 + 3, y1 - 6);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("음속", Math.min(lx1 - 26, X(cAt(3500)) + 4), Y(3500));
    /* 오른쪽: 음선 */
    const rx0 = w * 0.36, rx1 = w - 12, RX = (r) => rx0 + r / RMAX * (rx1 - rx0);
    NM.axes(ctx, { x0: rx0, y0, w: rx1 - rx0, h: y1 - y0, X: (v) => RX(v * 1000), Y: (v) => Y(v), xt: [0, 50, 100, 150].map((v) => [v, `${v}`]), yt: [], xlabel: "거리 (km)" });
    ctx.save(); ctx.beginPath(); ctx.rect(rx0, y0 - 1, rx1 - rx0, y1 - y0 + 2); ctx.clip();
    R.forEach((ray) => {
      ctx.strokeStyle = ray.hit ? "rgba(141,141,146,.45)" : "rgba(59,124,42,.8)"; ctx.lineWidth = ray.hit ? 1 : 1.3;
      ctx.beginPath(); ray.pts.forEach(([r, z], i) => (i ? ctx.lineTo(RX(r), Y(z)) : ctx.moveTo(RX(r), Y(z)))); ctx.stroke();
    });
    ctx.restore();
    ctx.strokeStyle = "#3f6fa3"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
    [[lx0, lx1], [rx0, rx1]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(a, Y(prof.zmin)); ctx.lineTo(b, Y(prof.zmin)); ctx.stroke(); });
    ctx.setLineDash([]);
    ctx.fillStyle = "#3f6fa3"; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("음속 최소층", rx1 - 4, Y(prof.zmin) + (prof.zmin < 200 ? 14 : -5));
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(RX(0), Y(+sZ.value), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6b4a2b"; ctx.fillRect(rx0, y1, rx1 - rx0, 3);
  }
  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.p === pi)));
    oTs.textContent = (+sTs.value).toFixed(1).replace("-", "−"); oH.textContent = sH.value; oSc.textContent = sSc.value; oZ.textContent = sZ.value;
    build(); R = rays();
    const trapped = R.filter((r) => !r.hit).length;
    nZ.textContent = `${prof.zmin} m`; nC.textContent = `${prof.cmin.toFixed(0)} · ${prof.c[0].toFixed(0)} m/s`; nR.textContent = `${trapped} / ${R.length}`;
    const zs = +sZ.value;
    st.textContent = prof.zmin < 30 ? "음속이 수면에서 가장 느립니다. 음선은 모두 위로 휘어 수면 반사를 되풀이합니다(표층 음파 통로)." : Math.abs(zs - prof.zmin) < 250 ? `음원이 음속 최소층(${prof.zmin} m) 근처에 있어 비스듬히 나간 음선이 위아래로 휘며 층에 갇힙니다.` : zs < prof.zmin ? "음원이 음속 최소층보다 얕습니다. 아래로 나간 음선은 최소층을 지나 다시 위로 휘어 수면에 닿고, 일부 깊이와 거리에는 음선이 닿지 않는 음영대가 생깁니다." : "음원이 음속 최소층보다 깊습니다. 위로 나간 음선은 최소층을 지나 다시 아래로 휘고, 큰 각으로 나간 음선은 해저에 닿아 사라집니다.";
    draw();
  }
  function preset(i) { pi = i; const [ts, h, sc, zs, td] = P[i]; sTs.value = ts; sH.value = h; sSc.value = sc; tdeep = td; if (zs === null) { build(); sZ.value = Math.round(prof.zmin / 25) * 25; } else sZ.value = zs; update(); }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => preset(+b.dataset.p)));
  [sTs, sH, sSc, sZ].forEach((x) => x.addEventListener("input", () => { pi = -1; update(); }));
  preset(0);
})();
