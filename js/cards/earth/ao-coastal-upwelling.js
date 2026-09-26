/* 카드: 바람이 불면 왜 해안에 찬물이 올라올까? — 에크만 수송과 연안 용승·침강 */
(() => {
  const root = document.getElementById("card-earth-upwelling");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sDir = $(".dir"), sSpd = $(".spd"), oDir = $(".dir-out"), oSpd = $(".spd-out");
  const nDir = $(".n-dir"), nM = $(".n-m"), nK = $(".n-k");
  let coast = 1, hemi = 1;   // coast: 바다가 동쪽(1) / 서쪽(−1)

  const DIRS = ["북", "북북동", "북동", "동북동", "동", "동남동", "남동", "남남동", "남", "남남서", "남서", "서남서", "서", "서북서", "북서", "북북서"];
  const RHO_A = 1.2, CD = 1.3e-3, RHO_W = 1025, FC = 2 * 7.292e-5 * Math.sin(37 * Math.PI / 180);
  function state() {
    const from = +sDir.value, U = +sSpd.value;
    const b = (from + 180) * Math.PI / 180;            // 바람이 불어 가는 방위
    const wx = Math.sin(b), wy = Math.cos(b);
    const ex = hemi > 0 ? wy : -wy, ey = hemi > 0 ? -wx : wx; // 북반구: 오른쪽 90°
    const M = RHO_A * CD * U * U / (RHO_W * FC);         // m²/s (해안 1 m당)
    const off = ex * coast;                               // 먼바다 쪽 성분 (−1~1)
    return { from, U, wx, wy, ex, ey, M, off, k: off * clamp(U / 10, 0, 1.5) };
  }
  const bearName = (x, y) => DIRS[Math.round(((Math.atan2(x, y) * 180 / Math.PI + 360) % 360) / 22.5) % 16];

  function arrow(x1, y1, x2, y2, col, lw) {
    const a = Math.atan2(y2 - y1, x2 - x1), hl = 5 + lw * 1.5;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hl * .5 * Math.cos(a), y2 - hl * .5 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - .45), y2 - hl * Math.sin(a - .45)); ctx.lineTo(x2 - hl * Math.cos(a + .45), y2 - hl * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
    ctx.lineCap = "butt";
  }
  const tcol = (T) => {
    const S = [[6, [40, 80, 150]], [16, [90, 160, 190]], [26, [225, 170, 90]]];
    const i = T < 16 ? 0 : 1, [t0, a] = S[i], [t1, b] = S[i + 1], k = clamp((T - t0) / (t1 - t0), 0, 1);
    return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(",")})`;
  };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const st = state(), small = w < 480;
    ctx.clearRect(0, 0, w, h);
    // ── 왼쪽: 위에서 본 해안 ──
    const pw = Math.min(h - 10, w * .44), px0 = 6, py0 = (h - pw) / 2, cxm = px0 + pw / 2, cym = py0 + pw / 2;
    const landLeft = coast > 0;
    ctx.fillStyle = "#e7e2d2"; ctx.fillRect(landLeft ? px0 : cxm, py0, pw / 2, pw);
    // 연안 수온 (용승이면 차갑게)
    const g = ctx.createLinearGradient(cxm, 0, landLeft ? px0 + pw : px0, 0);
    g.addColorStop(0, tcol(24 - 10 * clamp(st.k, -0.2, 1))); g.addColorStop(.5, tcol(24 - 3 * clamp(st.k, -0.2, 1))); g.addColorStop(1, tcol(24));
    ctx.fillStyle = g; ctx.fillRect(landLeft ? cxm : px0, py0, pw / 2, pw);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cxm, py0); ctx.lineTo(cxm, py0 + pw); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(px0 + .5, py0 + .5, pw - 1, pw - 1);
    ctx.font = `${small ? 10 : 11}px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("육지", landLeft ? px0 + pw / 4 : px0 + pw * .75, py0 + pw - 10);
    ctx.fillStyle = "#fff"; ctx.fillText("바다", landLeft ? px0 + pw * .75 : px0 + pw / 4, py0 + pw - 10);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("N ↑", px0 + 5, py0 + 13);
    // 바람 화살표 (바다 쪽 가운데에)
    const sc = pw * .32 * clamp(st.U / 12, .25, 1.1), ax = landLeft ? px0 + pw * .72 : px0 + pw * .28, ay = cym;
    if (st.U > 0) {
      arrow(ax - st.wx * sc / 2, ay + st.wy * sc / 2, ax + st.wx * sc / 2, ay - st.wy * sc / 2, "rgba(35,35,38,.85)", 2.2);
      const es = pw * .3 * clamp(st.U / 12, .25, 1.1);
      arrow(ax, ay, ax + st.ex * es, ay - st.ey * es, C.warn, 4);
      ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillStyle = C.ink; ctx.fillText("바람", ax - st.wx * sc / 2 + 4, ay + st.wy * sc / 2 + (st.wy > 0 ? 14 : -6));
      ctx.fillStyle = C.warn; ctx.fillText("표층 해수", clamp(ax + st.ex * es + 4, px0 + 4, px0 + pw - 50), ay - st.ey * es + (st.ey > 0 ? -6 : 14));
    }
    // ── 오른쪽: 해안에 수직인 단면 ──
    const sx0 = px0 + pw + (small ? 12 : 22), sw = w - sx0 - 8, top = py0 + 16, bot = py0 + pw - 4, zmax = 200;
    const Y = (z) => top + z / zmax * (bot - top);
    // 단면에서 해안은 평면도와 같은 쪽에 둔다
    const coastX = landLeft ? sx0 + sw * .12 : sx0 + sw * .88;
    const dist = (x) => Math.abs(x - coastX) / (sw * .76);  // 0 해안 ~ 1 먼바다
    const disp = (x) => -60 * clamp(st.k, -1, 1.5) * Math.exp(-dist(x) / .35); // 등수온선 변위 (m)
    // 수온 분포: 기본 T(z) = 6 + 18·exp(−z/60) (모식)
    const T0 = (z) => 6 + 18 * Math.exp(-Math.max(0, z) / 60);
    const stepx = small ? 3 : 4;
    for (let x = Math.min(coastX, sx0 + sw * .12); x < Math.max(coastX, sx0 + sw * .88); x += stepx) {
      for (let y = top; y < bot; y += 3) {
        const z = (y - top) / (bot - top) * zmax;
        ctx.fillStyle = tcol(T0(z - disp(x))); ctx.fillRect(x, y, stepx + .5, 3.5);
      }
    }
    // 등수온선
    ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1;
    ctx.font = `9.5px ${F.mono}`;
    [20, 15, 10].forEach((T) => {
      const z0 = -60 * Math.log((T - 6) / 18);
      ctx.beginPath(); let first = true;
      for (let x = sx0 + sw * .12; x <= sx0 + sw * .88; x += 4) { const y = Y(clamp(z0 + disp(x), 0, zmax)); first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false; }
      ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.textAlign = landLeft ? "right" : "left";
      const xl = landLeft ? sx0 + sw * .88 - 2 : sx0 + sw * .12 + 2; ctx.fillText(`${T}°`, xl, Y(z0 + disp(xl)) - 3);
    });
    // 육지
    ctx.fillStyle = "#e7e2d2";
    if (landLeft) ctx.fillRect(sx0, top - 10, sw * .12, bot - top + 10); else ctx.fillRect(sx0 + sw * .88, top - 10, sw * .12, bot - top + 10);
    ctx.strokeStyle = C.ink; ctx.strokeRect(sx0 + .5, top - 10 + .5, sw - 1, bot - top + 9);
    // 흐름 화살표
    if (Math.abs(st.k) > .1) {
      const dir = landLeft ? 1 : -1, s = Math.sign(st.k), lw = 1.5 + 2 * clamp(Math.abs(st.k), 0, 1);
      const xa = coastX + dir * sw * .06, xb = coastX + dir * sw * .4;
      if (s > 0) { arrow(xa, Y(8), xb, Y(8), C.ink, lw); arrow(coastX + dir * sw * .05, Y(120), coastX + dir * sw * .05, Y(30), C.ink, lw); }
      else { arrow(xb, Y(8), xa, Y(8), C.ink, lw); arrow(coastX + dir * sw * .05, Y(30), coastX + dir * sw * .05, Y(120), C.ink, lw); }
    }
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("해안에 수직인 단면 · 0~200 m", sx0, top - 14);
  }

  function update() {
    const st = state();
    oDir.textContent = DIRS[Math.round(st.from / 22.5) % 16]; oSpd.textContent = st.U;
    if (st.U === 0) { nDir.textContent = "—"; nM.textContent = "0"; nK.textContent = "변화 없음"; draw(); return; }
    const side = st.off > .3 ? " (먼바다 쪽)" : st.off < -.3 ? " (해안 쪽)" : " (해안과 나란히)";
    nDir.textContent = bearName(st.ex, st.ey) + side;
    const q = st.M * 1000 * st.off;
    nM.textContent = `${q >= 0 ? "" : "−"}${Math.abs(q).toFixed(0)} m³/s`;
    const k = st.off > .3 ? "용승" : st.off < -.3 ? "침강" : "약함";
    nK.textContent = k; nK.className = k === "용승" ? "good" : k === "침강" ? "bad" : "";
    draw();
  }
  [sDir, sSpd].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll(".coast").forEach((b) => b.addEventListener("click", () => { coast = +b.dataset.c; root.querySelectorAll(".coast").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update(); }));
  root.querySelectorAll(".hemi").forEach((b) => b.addEventListener("click", () => { hemi = +b.dataset.h; root.querySelectorAll(".hemi").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update(); }));
  update();
})();
