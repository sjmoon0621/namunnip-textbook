/* 카드: 차갑고 짠 물은 어디까지 가라앉을까? — 수온–염분도와 선형 근사 밀도 */
(() => {
  const root = document.getElementById("card-earth-ts");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sT = $(".t"), sS = $(".s"), oT = $(".t-out"), oS = $(".s-out");
  const nRho = $(".n-rho"), nDepth = $(".n-depth"), nDrho = $(".n-drho");

  // 선형 상태 방정식 (근사): ρ = ρ0 [1 − α(T − T0) + β(S − S0)]
  const R0 = 1027, AL = 1.7e-4, BE = 7.6e-4, T0 = 10, S0 = 35;
  const rho = (T, S) => R0 * (1 - AL * (T - T0) + BE * (S - S0));
  const Tof = (r, S) => T0 + (BE * (S - S0) - (r / R0 - 1)) / AL; // 등밀도선

  // 대서양 모식 단면의 물 덩어리 (대표값, 대략)
  const LAYERS = [
    { n: "표층수", T: 18, S: 35.5, z0: 0, z1: 500, c: "#e7c07a" },
    { n: "남극 중층수", T: 4, S: 34.3, z0: 500, z1: 1500, c: "#a9c6c9" },
    { n: "북대서양 심층수", T: 2.5, S: 34.95, z0: 1500, z1: 4000, c: "#7d9fbf" },
    { n: "남극 저층수", T: -0.5, S: 34.7, z0: 4000, z1: 5000, c: "#4f6f95" },
  ];
  LAYERS.forEach((L) => (L.r = rho(L.T, L.S)));
  const ZB = 5000;

  function settle(r) {
    if (r <= LAYERS[0].r) return { z: 0, name: "표층에 머묾", i: -1 };
    for (let i = 0; i < LAYERS.length - 1; i++) {
      if (r <= LAYERS[i + 1].r) return { z: LAYERS[i].z1, name: `약 ${LAYERS[i].z1.toLocaleString("ko-KR")} m`, i };
    }
    return { z: ZB, name: "바닥까지", i: LAYERS.length - 1 };
  }

  const SMIN = 33.5, SMAX = 37, TMIN = -2, TMAX = 30;
  const { ctx, size } = fit(cv, () => draw());
  let geo = null;

  function draw() {
    const { w, h } = size; if (!w) return;
    const small = w < 480;
    const T = +sT.value, S = +sS.value, r = rho(T, S), st = settle(r);
    ctx.clearRect(0, 0, w, h);

    // ── 왼쪽: 수온–염분도 ──
    const padL = small ? 30 : 36, padT = 20, padB = 32;
    const gw = Math.round(w * (small ? .56 : .58)) - padL, gh = h - padT - padB;
    const X = (s) => padL + (s - SMIN) / (SMAX - SMIN) * gw;
    const Y = (t) => padT + (1 - (t - TMIN) / (TMAX - TMIN)) * gh;
    geo = { padL, padT, gw, gh };
    NM.axes(ctx, { x0: padL, y0: padT, w: gw, h: gh, X, Y,
      xt: (small ? [34, 35, 36, 37] : [34, 34.5, 35, 35.5, 36, 36.5, 37]).map((v) => [v, String(v)]),
      yt: [0, 10, 20, 30].map((v) => [v, String(v)]), ylabel: "수온 (°C)", xlabel: "염분 (psu)" });
    // 등밀도선
    ctx.save(); ctx.beginPath(); ctx.rect(padL, padT, gw, gh); ctx.clip();
    ctx.font = `10px ${F.mono}`;
    for (let rr = 1021; rr <= 1030; rr += 1) {
      ctx.strokeStyle = "rgba(93,93,97,.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(SMIN), Y(Tof(rr, SMIN))); ctx.lineTo(X(SMAX), Y(Tof(rr, SMAX))); ctx.stroke();
      // 라벨: 선이 위쪽 테두리 또는 오른쪽 테두리와 만나는 곳 근처
      const tR = Tof(rr, SMAX - 0.12);
      if (tR > TMIN + 1 && tR < TMAX - 1) {
        ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(String(rr), X(SMAX) - 3, Y(tR) - 3);
      } else {
        const sTop = S0 + ((TMAX - 1.2 - T0) * AL + (rr / R0 - 1)) / BE;
        if (sTop > SMIN + .2 && X(sTop) < X(SMAX) - 34) { ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText(String(rr), X(sTop) + 3, Y(TMAX - 1.2)); }
      }
    }
    ctx.restore();
    // 단면의 물 덩어리 점
    ctx.font = `10.5px ${F.sans}`;
    LAYERS.forEach((L) => {
      ctx.beginPath(); ctx.arc(X(L.S), Y(L.T), 4, 0, Math.PI * 2);
      ctx.fillStyle = L.c; ctx.fill(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.stroke();
      if (!small || L.n !== "남극 중층수") {
        ctx.fillStyle = C.ink2; ctx.textAlign = X(L.S) > padL + gw * .6 ? "right" : "left";
        const dx = ctx.textAlign === "right" ? -7 : 7;
        ctx.fillText(L.n, X(L.S) + dx, Y(L.T) + (L.n === "남극 저층수" ? 12 : -5));
      }
    });
    // 내 물 덩어리
    ctx.beginPath(); ctx.arc(X(S), Y(T), 7, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();

    // ── 오른쪽: 대서양 모식 단면 ──
    const cx = padL + gw + (small ? 14 : 26), cw = w - cx - 6, ctop = padT, cbot = h - padB + 12;
    const Z = (z) => ctop + z / ZB * (cbot - ctop);
    ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`;
    LAYERS.forEach((L) => {
      ctx.fillStyle = L.c; ctx.fillRect(cx, Z(L.z0), cw, Z(L.z1) - Z(L.z0));
      ctx.fillStyle = L.z0 >= 1500 ? "#fff" : C.ink; ctx.textAlign = "left";
      ctx.fillText(L.n, cx + 5, Z(L.z0) + 13);
      ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = L.z0 >= 1500 ? "rgba(255,255,255,.8)" : C.ink2;
      if (Z(L.z1) - Z(L.z0) > 30) ctx.fillText(L.r.toFixed(1), cx + 5, Z(L.z0) + 25);
      ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`;
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(cx + .5, ctop + .5, cw - 1, cbot - ctop - 1);
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("0 m", cx + cw - 3, ctop - 5);
    ctx.fillText("5000 m", cx + cw - 3, cbot + 11);
    // 가라앉는 경로
    const px = cx + cw * .78, pz = st.z === ZB ? Z(ZB) - 9 : st.z === 0 ? Z(0) + 9 : Z(st.z);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(px, ctop + 4); ctx.lineTo(px, pz); ctx.stroke(); ctx.setLineDash([]);
    if (st.z > 0) { // 옆으로 퍼지는 화살표
      ctx.beginPath(); ctx.moveTo(px - 6, pz); ctx.lineTo(px - cw * .3, pz); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - cw * .3, pz); ctx.lineTo(px - cw * .3 + 6, pz - 4); ctx.lineTo(px - cw * .3 + 6, pz + 4); ctx.closePath(); ctx.fillStyle = C.warn; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(px, pz, 6, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    ctx.textAlign = "left";
  }

  function update() {
    const T = +sT.value, S = +sS.value, r = rho(T, S), st = settle(r);
    oT.textContent = T.toFixed(1); oS.textContent = S.toFixed(2);
    nRho.textContent = `${r.toFixed(2)}`;
    nDepth.textContent = st.name;
    const d = r - LAYERS[0].r;
    nDrho.textContent = `${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(2)}`;
    nDrho.classList.toggle("good", d > 0);
    draw();
  }
  [sT, sS].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [t, s] = b.dataset.set.split(","); sT.value = t; sS.value = s; update();
  }));
  // 그래프 위를 끌어서 물 덩어리 옮기기
  let drag = false;
  const move = (e) => {
    if (!geo) return;
    const rc = cv.getBoundingClientRect(), x = e.clientX - rc.left, y = e.clientY - rc.top;
    if (x > geo.padL + geo.gw + 10) return;
    sS.value = clamp(SMIN + (x - geo.padL) / geo.gw * (SMAX - SMIN), SMIN, SMAX).toFixed(2);
    sT.value = clamp(TMIN + (1 - (y - geo.padT) / geo.gh) * (TMAX - TMIN), TMIN, TMAX).toFixed(1);
    update();
  };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); move(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) move(e); });
  cv.addEventListener("pointerup", () => (drag = false));
  update();
})();
