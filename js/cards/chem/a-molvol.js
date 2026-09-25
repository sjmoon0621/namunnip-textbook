/* 카드: 기체 1몰의 부피는 왜 기체 종류와 상관없을까? — 실제 크기 비율로 본 기체 분자 */
(() => {
  const root = document.getElementById("card-chem-molvol");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sT = $(".temp"), oT = $(".temp-out"), sP = $(".pres"), oP = $(".pres-out");
  const dV = $(".v-vol"), dM = $(".v-mass"), dRho = $(".v-rho"), dGap = $(".v-gap"), note = $(".real");

  const NA = 6.02214076e23, VSTP = 22.414;   // L/mol, 0 °C · 1 atm 이상 기체
  // 몰질량(g/mol), 분자 운동 지름(nm), 0 °C·1 atm 밀도 실측(g/L)
  const GAS = {
    He: { t: "He", M: 4.003, d: 0.26, rho: 0.1786, c: "#c9a227" },
    H2: { t: "H₂", M: 2.016, d: 0.289, rho: 0.08988, c: "#8d8d92" },
    N2: { t: "N₂", M: 28.014, d: 0.364, rho: 1.2506, c: "#3f6fb5" },
    O2: { t: "O₂", M: 31.998, d: 0.346, rho: 1.429, c: C.apple },
    CO2: { t: "CO₂", M: 44.009, d: 0.33, rho: 1.977, c: C.ink },
    NH3: { t: "NH₃", M: 17.031, d: 0.26, rho: 0.7710, c: "#6f8fcf" },
  };
  let gas = "N2";
  const B = 14;                                   // 확대 상자 한 변 (nm)
  let parts = [];

  const vol = () => VSTP * (+sT.value + 273.15) / 273.15 / +sP.value;   // L/mol
  const nPerNm3 = () => NA / (vol() * 1e24);
  const vrms = () => Math.sqrt(3 * 8.314 * (+sT.value + 273.15) / (GAS[gas].M / 1000));

  function spawn() {
    const want = Math.round(nPerNm3() * B ** 3);
    while (parts.length < want) {
      const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
      parts.push({ x: Math.random() * B, y: Math.random() * B, z: Math.random() * B, ux: Math.sin(ph) * Math.cos(th), uy: Math.sin(ph) * Math.sin(th), uz: Math.cos(ph), s: 0.6 + Math.random() * 0.8 });
    }
    parts.length = want;
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = GAS[gas], small = w < 520;
    const V = vol(), edge = Math.cbrt(V * 1000); // cm
    // ── 왼쪽: 1몰이 차지하는 정육면체
    const lw = w * 0.5, pad = small ? 14 : 24;
    const pxcm = Math.min((lw - pad * 2 - 10) / 52, (h - 80) / 52);
    const s = edge * pxcm, dep = s * 0.3, cx = pad + 6, cy = h - 44 - s;
    ctx.fillStyle = "rgba(63,111,181,.08)"; ctx.strokeStyle = g.c; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dep, cy - dep); ctx.lineTo(cx + s + dep, cy - dep); ctx.lineTo(cx + s + dep, cy + s - dep); ctx.lineTo(cx + s, cy + s); ctx.lineTo(cx, cy + s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + s, cy); ctx.lineTo(cx + s + dep, cy - dep); ctx.moveTo(cx + s, cy); ctx.lineTo(cx + s, cy + s); ctx.stroke();
    // 자 (30 cm)
    const ry = h - 26;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, ry); ctx.lineTo(cx + 30 * pxcm, ry); ctx.stroke();
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let c = 0; c <= 30; c += 10) { ctx.beginPath(); ctx.moveTo(cx + c * pxcm, ry - 4); ctx.lineTo(cx + c * pxcm, ry + 4); ctx.stroke(); ctx.fillText(`${c}`, cx + c * pxcm, ry + 15); }
    ctx.textAlign = "left"; ctx.fillText("cm", cx + 30 * pxcm + 5, ry + 4);
    ctx.fillStyle = C.ink; ctx.font = `500 ${small ? 11 : 12.5}px ${F.mono}`;
    ctx.fillText(`${g.t} 1 mol`, cx, cy - dep - 24);
    ctx.fillStyle = C.ink2; ctx.font = `${small ? 10 : 11.5}px ${F.mono}`;
    ctx.fillText(`한 변 ${edge.toFixed(1)} cm`, cx, cy - dep - 9);

    // ── 오른쪽: 확대 상자 (분자 크기와 간격을 같은 배율로)
    const zs = Math.min(h - 46, w - lw - pad), zx = w - pad - zs, zy = 26;
    ctx.fillStyle = "#fff"; ctx.fillRect(zx, zy, zs, zs);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(zx + .5, zy + .5, zs - 1, zs - 1);
    ctx.fillStyle = C.ink3; ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`확대: 한 변 ${B} nm 상자 속 분자 ${parts.length}개`, zx, zy - 9);
    // 확대 표시선
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink3;
    const px = cx + s * 0.55, py = cy + s * 0.45;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(zx, zy); ctx.moveTo(px, py); ctx.lineTo(zx, zy + zs); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    const k = zs / B, r = Math.max(1.4, g.d / 2 * k);
    const sorted = parts.slice().sort((a, b) => a.z - b.z);
    for (const p of sorted) {
      ctx.globalAlpha = 0.35 + 0.65 * p.z / B;
      ctx.beginPath(); ctx.arc(zx + p.x * k, zy + p.y * k, r, 0, Math.PI * 2); ctx.fillStyle = g.c; ctx.fill();
    }
    ctx.globalAlpha = 1;
    // 1 nm 눈금
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(zx + 8, zy + zs - 10); ctx.lineTo(zx + 8 + k, zy + zs - 10); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillText("1 nm", zx + 12 + k, zy + zs - 6);
  }

  function update() {
    const g = GAS[gas], V = vol();
    oT.textContent = sT.value; oP.textContent = (+sP.value).toFixed(2);
    dV.textContent = `${V.toFixed(1)} L`;
    dM.textContent = `${g.M.toFixed(1)} g`;
    dRho.textContent = `${(g.M / V).toFixed(g.M / V < 1 ? 3 : 2)} g/L`;
    const gap = Math.cbrt(V * 1e24 / NA);
    dGap.textContent = `${gap.toFixed(1)} nm`;
    const frac = Math.PI / 6 * g.d ** 3 / (V * 1e24 / NA) * 100;
    note.innerHTML = `분자 지름 약 ${g.d} nm, 사이 거리는 그 ${Math.round(gap / g.d)}배쯤. 분자 자체가 차지하는 부피는 전체의 약 ${frac.toFixed(2)}%입니다.<br>0 °C·1 atm 실측: ${g.t} 1몰 ${(g.M / g.rho).toFixed(2)} L (밀도 ${g.rho} g/L로 계산)`;
    spawn(); draw();
  }

  root.querySelectorAll("[data-gas]").forEach((b) => b.addEventListener("click", () => {
    gas = b.dataset.gas;
    root.querySelectorAll("[data-gas]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  root.querySelectorAll("[data-tp]").forEach((b) => b.addEventListener("click", () => {
    const [t, p] = b.dataset.tp.split(","); sT.value = t; sP.value = p; update();
  }));
  [sT, sP].forEach((el) => el.addEventListener("input", update));
  update();

  loop(cv, (dt) => {
    if (NM.reduce) return;
    const v = vrms() / 493 * 2;   // N₂ 0 °C일 때 초당 2 nm (실제보다 약 2.5×10¹¹배 느리게)
    for (const p of parts) {
      for (const [a, u] of [["x", "ux"], ["y", "uy"], ["z", "uz"]]) {
        p[a] += p[u] * v * p.s * dt;
        if (p[a] < 0) { p[a] = -p[a]; p[u] *= -1; } else if (p[a] > B) { p[a] = 2 * B - p[a]; p[u] *= -1; }
        p[a] = clamp(p[a], 0, B);
      }
    }
    draw();
  });
})();
