/* 카드: 제트류는 왜 대류권 꼭대기에서 가장 셀까? — 측고 공식으로 쌓은 등압면과 지균 서풍 (모식 단면) */
(() => {
  const root = document.getElementById("card-adearth-jet");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".d"), sC = $(".c"), sW = $(".w");
  const oD = $(".d-out"), oC = $(".c-out"), oW = $(".w-out"), st = $(".jt-state"), nU = $(".n-u"), nL = $(".n-l"), nTh = $(".n-th");
  const R = 287.04, G = 9.81, OM = 7.292e-5, A = 6.371e6;
  const PREV = 250, P0 = 20, P1 = 70, NPH = 101, NP = 90, PTOP = 70, ZTOP = 18000;
  const PH = Array.from({ length: NPH }, (_, i) => P0 + (P1 - P0) * i / (NPH - 1));
  const LP = Array.from({ length: NP }, (_, j) => Math.log(1000) + (Math.log(PTOP) - Math.log(1000)) * j / (NP - 1));
  let season = "w";
  function model() {
    const dT = +sD.value, c = +sC.value, wd = +sW.value;
    const th = (x) => Math.tanh((x - c) / wd), a0 = th(P0), a1 = th(P1);
    const tsfc = (ph) => 300 - dT * (th(ph) - a0) / (a1 - a0);
    const tref = (p) => Math.max(216.65, 288.15 * (p / 1013.25) ** 0.1903);
    const LT = Math.log(PREV), LB = Math.log(1000);
    const wgt = (lp) => (lp >= LT ? (lp - LT) / (LB - LT) : Math.max(-0.4, -0.4 * (LT - lp) / (LT - Math.log(100))));
    const Z = [], T = [];
    PH.forEach((ph) => {
      const dt = tsfc(ph) - (300 - dT / 2), zc = [0], tc = LP.map((lp) => tref(Math.exp(lp)) + dt * wgt(lp));
      for (let j = 1; j < NP; j++) zc.push(zc[j - 1] + R * (tc[j] + tc[j - 1]) / 2 / G * (LP[j - 1] - LP[j]));
      Z.push(zc); T.push(tc);
    });
    /* u = −(g/f) ∂z/∂y */
    const U = PH.map((ph, i) => {
      const f = 2 * OM * Math.sin(ph * Math.PI / 180), i0 = Math.max(0, i - 1), i1 = Math.min(NPH - 1, i + 1), dy = A * (PH[i1] - PH[i0]) * Math.PI / 180;
      return Z[i].map((_, j) => -G / f * (Z[i1][j] - Z[i0][j]) / dy);
    });
    return { Z, T, U, tsfc };
  }
  const uAtZ = (m, i, z) => { const zc = m.Z[i]; for (let j = 1; j < NP; j++) if (zc[j] >= z) { const f = (z - zc[j - 1]) / (zc[j] - zc[j - 1]); return m.U[i][j - 1] + f * (m.U[i][j] - m.U[i][j - 1]); } return NaN; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = model(), x0 = 40, x1 = w - 58, y0 = 18, y1 = h - 52;
    const X = (ph) => x0 + (ph - P0) / (P1 - P0) * (x1 - x0), Y = (z) => y1 - z / ZTOP * (y1 - y0);
    /* 바람 칠하기 */
    const nx = NPH - 1, nz = 64, cw = (x1 - x0) / nx, ch = (y1 - y0) / nz;
    for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
      const u = uAtZ(m, i, (k + 0.5) / nz * ZTOP); if (!isFinite(u)) continue;
      const a = Math.min(1, Math.abs(u) / 50);
      ctx.fillStyle = u >= 0 ? `rgba(59,124,42,${0.85 * a})` : `rgba(181,83,47,${0.85 * a})`;
      ctx.fillRect(x0 + i * cw, Y((k + 1) / nz * ZTOP), cw + 0.6, ch + 0.6);
    }
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y, xt: [20, 30, 40, 50, 60, 70].map((v) => [v, `${v}°N`]), yt: [0, 4000, 8000, 12000, 16000].map((v) => [v, `${v / 1000}`]), ylabel: "높이 (km)" });
    /* 기온 차가 뒤집히는 높이 */
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.lineWidth = 1.2; ctx.beginPath();
    const jr = LP.findIndex((lp) => lp <= Math.log(PREV));
    PH.forEach((ph, i) => { const z = m.Z[i][jr]; i ? ctx.lineTo(X(ph), Y(z)) : ctx.moveTo(X(ph), Y(z)); }); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("점선 위: 고위도가 더 따뜻 (성층권 하부)", x1 - 4, Y(m.Z[NPH - 1][jr]) - 6);
    /* 등압면 */
    [1000, 850, 700, 500, 300, 200, 100].forEach((p) => {
      const lp = Math.log(p); let j = 0; while (j < NP - 1 && LP[j + 1] >= lp) j++;
      const f = (LP[j] - lp) / (LP[j] - LP[Math.min(NP - 1, j + 1)] || 1);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.beginPath();
      PH.forEach((ph, i) => { const z = m.Z[i][j] + f * (m.Z[i][Math.min(NP - 1, j + 1)] - m.Z[i][j]); i ? ctx.lineTo(X(ph), Y(z)) : ctx.moveTo(X(ph), Y(z)); }); ctx.stroke();
      const zr = m.Z[NPH - 1][j] + f * (m.Z[NPH - 1][Math.min(NP - 1, j + 1)] - m.Z[NPH - 1][j]);
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${p}`, x1 + 4, Y(zr) + 3);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("hPa", x1 + 4, y0 - 4);
    /* 최대 서풍 표시 */
    let best = -1e9, bi = 0, bj = 0; m.U.forEach((col, i) => col.forEach((u, j) => { if (u > best) { best = u; bi = i; bj = j; } }));
    if (best > 3) { const bx = X(PH[bi]), by = Y(m.Z[bi][bj]); ctx.fillStyle = C.ink; ctx.font = `700 13px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("J", bx, by + 5); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.stroke(); }
    /* 지표 기온 */
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    [20, 30, 40, 50, 60, 70].forEach((ph) => ctx.fillText(`${(m.tsfc(ph) - 273.15).toFixed(0).replace("-", "−")}°`, X(ph), y1 + 28));
    ctx.textAlign = "left"; ctx.fillText("지표 기온(°C)", x0 - 36, y1 + 42);
    /* 범례 */
    ctx.textAlign = "right"; ctx.fillStyle = C.forest; ctx.fillText("초록: 서풍 (진할수록 셈, 50 m/s 이상 최대)", x1, y1 + 42);
  }
  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === season)));
    oD.textContent = sD.value; oC.textContent = sC.value; oW.textContent = sW.value;
    const m = model();
    let best = -1e9, bi = 0, bj = 0; m.U.forEach((col, i) => col.forEach((u, j) => { if (u > best) { best = u; bi = i; bj = j; } }));
    nU.textContent = `${Math.max(0, best).toFixed(0)} m/s`;
    nL.textContent = best > 1 ? `${PH[bi].toFixed(0)}°N · ${Math.round(Math.exp(LP[bj]) / 10) * 10} hPa` : "—";
    const j5 = LP.findIndex((lp) => lp <= Math.log(500)), th = (ph) => { const i = Math.round((ph - P0) / (P1 - P0) * (NPH - 1)); return m.Z[i][j5]; };
    nTh.textContent = `${Math.round(th(30))} / ${Math.round(th(60))} m`;
    st.textContent = +sD.value === 0 ? "남북 기온 차가 없으면 층후가 어디서나 같아 등압면이 수평이고, 어느 높이에서도 지균풍이 불지 않습니다(대류권 계면의 기울기 때문에 성층권에서만 약한 바람이 생깁니다)." : `남쪽의 층후가 두꺼워 등압면이 위로 갈수록 북쪽으로 더 기울어집니다. 서풍은 대류권 계면 바로 아래, 기온 차가 몰린 위도 위에서 가장 셉니다.`;
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => {
    season = b.dataset.s;
    if (season === "w") { sD.value = 45; sC.value = 40; sW.value = 10; } else { sD.value = 22; sC.value = 50; sW.value = 14; }
    update();
  }));
  [sD, sC, sW].forEach((x) => x.addEventListener("input", () => { season = ""; update(); }));
  update();
})();
