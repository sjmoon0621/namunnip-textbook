/* 카드: 크레인은 왜 넘어지지 않을까? — 두 받침의 수직 항력으로 보는 힘·돌림힘 평형 (모식 크레인) */
(() => {
  const root = document.getElementById("card-phy-crane");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sL = $(".load"), sD = $(".dist"), sC = $(".cw");
  const oL = $(".load-out"), oD = $(".dist-out"), oC = $(".cw-out");
  const nNL = $(".nl"), nNR = $(".nr"), nMax = $(".lmax"), nCm = $(".xcm");

  const g = 9.81, A = 3; // 받침 사이 거리의 절반 (m)
  // 고정된 부분: [질량 t, x m, y m]
  const FIXED = [[20, 0, 12], [8, 25, 30], [3, -6, 30]]; // 기둥·바닥, 앞쪽 팔, 뒤쪽 팔
  const XCW = -12, YHOOK = 6, TOP = 30;
  let tilt = 0;

  function state() {
    const L = +sL.value, d = +sD.value, Cw = +sC.value;
    const parts = [...FIXED, [Cw, XCW, 27.5], [L, d, YHOOK]];
    const W = parts.reduce((a, p) => a + p[0], 0);
    const Mx = parts.reduce((a, p) => a + p[0] * p[1], 0);
    const My = parts.reduce((a, p) => a + p[0] * p[2], 0);
    // 힘 평형: NL + NR = Wg,  돌림힘 평형(중심 기준): (NR − NL)·A = Mx·g
    const NL = (W - Mx / A) * g / 2, NR = (W + Mx / A) * g / 2;
    // 이 거리에서 NL ≥ 0 이 되게 하는 최대 하중
    const W0 = W - L, M0 = Mx - L * d;
    const Lmax = d > A ? (A * W0 - M0) / (d - A) : Infinity;
    return { L, d, Cw, W, xcm: Mx / W, ycm: My / W, NL, NR, Lmax };
  }

  function update() {
    const st = state();
    oL.textContent = st.L.toFixed(1); oD.textContent = st.d; oC.textContent = st.Cw;
    nNL.textContent = `${st.NL.toFixed(0)} kN`; nNR.textContent = `${st.NR.toFixed(0)} kN`;
    nNL.classList.toggle("bad", st.NL < 0); nNR.classList.toggle("bad", st.NR < 0);
    nMax.textContent = st.Lmax <= 0 ? "0 t" : `${st.Lmax.toFixed(1)} t`;
    nCm.textContent = `${st.xcm >= 0 ? "+" : ""}${st.xcm.toFixed(2)} m`;
    nCm.classList.toggle("bad", Math.abs(st.xcm) > A);
    draw();
  }

  const { ctx, size } = fit(cv, () => draw());

  function arrow(x0, y0, x1, y1, col, lw = 2) {
    const a = Math.atan2(y1 - y0, x1 - x0), hl = 7;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - hl * 0.8 * Math.cos(a), y1 - hl * 0.8 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - hl * Math.cos(a - 0.4), y1 - hl * Math.sin(a - 0.4));
    ctx.lineTo(x1 - hl * Math.cos(a + 0.4), y1 - hl * Math.sin(a + 0.4)); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const st = state();
    ctx.clearRect(0, 0, w, h);
    const s = Math.min(w / 70, (h - 44) / 37), gy = h - 26;
    const ox = w / 2 - 18 * s; // 세계 x = −16 … 52 m
    const X = (x) => ox + x * s, Y = (y) => gy - y * s;

    // 땅
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(4, gy + .5); ctx.lineTo(w - 4, gy + .5); ctx.stroke();
    // 받침 영역
    const inside = Math.abs(st.xcm) <= A;
    ctx.fillStyle = inside ? "rgba(116,171,102,.28)" : "rgba(181,83,47,.2)";
    ctx.fillRect(X(-A), gy, 2 * A * s, 6);

    ctx.save();
    // 넘어가는 모습 (모식): 받침 모서리를 축으로 기울인다
    const pv = st.NL < 0 ? A : st.NR < 0 ? -A : (tilt > 0 ? A : -A);
    ctx.translate(X(pv), gy); ctx.rotate(tilt); ctx.translate(-X(pv), -gy);

    // 받침과 바닥 블록
    ctx.fillStyle = C.ink2;
    for (const x of [-A, A]) { ctx.beginPath(); ctx.moveTo(X(x), gy - 1); ctx.lineTo(X(x) - 5, gy - 10); ctx.lineTo(X(x) + 5, gy - 10); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = "#9aa0a6"; ctx.fillRect(X(-A - 0.8), Y(1.8), (2 * A + 1.6) * s, 1.8 * s - 10);
    // 기둥 (격자)
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.4;
    const mw = 1.1;
    ctx.beginPath(); ctx.moveTo(X(-mw), Y(1.8)); ctx.lineTo(X(-mw), Y(TOP)); ctx.moveTo(X(mw), Y(1.8)); ctx.lineTo(X(mw), Y(TOP)); ctx.stroke();
    ctx.lineWidth = 0.8; ctx.beginPath();
    for (let y = 1.8, k = 0; y < TOP - 0.1; y += 2.2, k++) { const y2 = Math.min(TOP, y + 2.2); ctx.moveTo(X(k % 2 ? mw : -mw), Y(y)); ctx.lineTo(X(k % 2 ? -mw : mw), Y(y2)); }
    ctx.stroke();
    // 꼭대기와 지지 줄
    ctx.lineWidth = 1.4; ctx.beginPath();
    ctx.moveTo(X(-mw), Y(TOP)); ctx.lineTo(X(0), Y(TOP + 5)); ctx.lineTo(X(mw), Y(TOP)); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8; ctx.beginPath();
    ctx.moveTo(X(0), Y(TOP + 5)); ctx.lineTo(X(36), Y(TOP + 1.4)); ctx.moveTo(X(0), Y(TOP + 5)); ctx.lineTo(X(-13), Y(TOP + 1.2)); ctx.stroke();
    // 앞쪽 팔(지브)과 뒤쪽 팔
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.4; ctx.beginPath();
    ctx.moveTo(X(-14), Y(TOP)); ctx.lineTo(X(50), Y(TOP)); ctx.moveTo(X(-14), Y(TOP + 1.4)); ctx.lineTo(X(50), Y(TOP + 1.4)); ctx.stroke();
    ctx.lineWidth = 0.7; ctx.beginPath();
    for (let x = -14, k = 0; x < 50; x += 2, k++) { ctx.moveTo(X(x), Y(TOP + (k % 2 ? 0 : 1.4))); ctx.lineTo(X(x + 2), Y(TOP + (k % 2 ? 1.4 : 0))); }
    ctx.stroke();
    // 균형추
    const ch = 0.13 * st.Cw + 0.2;
    ctx.fillStyle = C.ink; ctx.fillRect(X(XCW - 1.4), Y(TOP), 2.8 * s, ch * s);
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
    ctx.fillText(`균형추 ${st.Cw} t`, X(XCW), Y(TOP) + ch * s + 13);
    // 트롤리, 줄, 짐
    const lx = X(st.d);
    ctx.fillStyle = C.ink2; ctx.fillRect(lx - 5, Y(TOP) - 1, 10, 5);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, Y(TOP) + 4); ctx.lineTo(lx, Y(YHOOK + 1)); ctx.stroke();
    if (st.L > 0) {
      const b = (1.2 + 1.3 * Math.cbrt(st.L)) * s;
      ctx.fillStyle = "#8a6b4e"; ctx.fillRect(lx - b / 2, Y(YHOOK + 1), b, b * 0.8);
      ctx.fillStyle = C.ink2; ctx.fillText(`${st.L.toFixed(1)} t`, lx, Y(YHOOK + 1) + b * 0.8 + 13);
    }
    // 무게중심
    const cx = X(st.xcm), cyy = Y(st.ycm);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = inside ? C.forest : C.warn; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx, cyy); ctx.lineTo(cx, gy); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cyy, 6, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 6, cyy); ctx.lineTo(cx + 6, cyy); ctx.moveTo(cx, cyy - 6); ctx.lineTo(cx, cyy + 6); ctx.stroke();
    ctx.fillStyle = inside ? C.forest : C.warn; ctx.textAlign = "left";
    ctx.fillText("전체 무게중심", cx + 9, cyy - 8);
    ctx.restore();

    // 받침의 수직 항력 (위로 미는 힘만 가능)
    const fs = 0.0125 * s;
    ctx.font = `10.5px ${F.mono}`;
    for (const [x, N] of [[-A, st.NL], [A, st.NR]]) {
      if (N <= 0) continue;
      const x0 = X(x) + (x < 0 ? -9 : 9);
      arrow(x0, gy, x0, gy - N * fs, C.forest, 2.2);
      ctx.fillStyle = C.forest; ctx.textAlign = x < 0 ? "right" : "left";
      ctx.fillText(`${N.toFixed(0)} kN`, x0 + (x < 0 ? -4 : 4), gy - N * fs + 8);
    }
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("모식 크레인 · 받침 간격 6 m", 8, 14);
    if (!inside) {
      ctx.fillStyle = C.warn; ctx.font = `600 13px ${F.sans}`;
      ctx.fillText(st.NL < 0 ? "앞으로 넘어감: 왼쪽 받침이 당겨야 버틸 수 있음" : "뒤로 넘어감: 오른쪽 받침이 당겨야 버틸 수 있음", 8, 32);
    }
  }

  [sL, sD, sC].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [L, d, c] = b.dataset.set.split(",").map(Number);
    sL.value = L; sD.value = d; sC.value = c; update();
  }));
  update();
  loop(cv, (dt) => {
    const st = state();
    const target = st.NL < 0 ? 0.09 : st.NR < 0 ? -0.09 : 0;
    const nt = tilt + clamp(target - tilt, -dt * 0.25, dt * 0.25);
    if (nt === tilt) return;
    tilt = nt; draw();
  });
})();
