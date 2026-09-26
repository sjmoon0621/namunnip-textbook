/* 카드: 전자는 한쪽에선 내려가고, 다른 쪽에선 왜 올라갈까? — 호흡과 광합성(Z 도식)의 전자 전달을 환원 전위 E°′ 눈금에 그림. ΔG = −2FΔE (전자쌍) */
(() => {
  const root = document.getElementById("card-cell-etc");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".pos"), oP = $(".p-out"), nE = $(".n-e"), nL = $(".n-l"), nH = $(".n-h");
  const FARADAY = 96.485;
  // [이름, E°′(V), 종류] — light: 빛으로 들어 올리는 구간의 시작, pump: 이 구간에서 H⁺ 퍼냄
  // 이름표 위치: [dx, dy, 정렬]
  const PATH = {
    resp: [["NADH", -0.32, "", -8, 4, "right"], ["복합체 Ⅰ", -0.3, "pump", 6, -9, "left"], ["유비퀴논", 0.05, "", -8, 14, "right"], ["복합체 Ⅲ", 0.1, "pump", 6, -9, "left"], ["사이토크롬 c", 0.25, "", -8, 14, "right"], ["복합체 Ⅳ", 0.35, "pump", 6, -9, "left"], ["O₂ → H₂O", 0.82, "", -10, 4, "right"]],
    photo: [["H₂O → O₂", 0.82, "", 10, -8, "left"], ["P680", 1.2, "light", 8, 12, "left"], ["P680*", -0.8, "", 8, -6, "left"], ["플라스토퀴논", 0.05, "", 8, -7, "left"], ["사이토크롬 복합체", 0.3, "pump", 0, 20, "center"], ["P700", 0.48, "light", 8, 12, "left"], ["P700*", -1.3, "", 8, -4, "left"], ["페레독신", -0.43, "", 8, -7, "left"], ["NADP⁺ → NADPH", -0.32, "", 4, 18, "right"]],
  };
  let mode = "resp";
  const photonKJ = (nm) => 119627 / nm;   // 1몰 광자 에너지 (kJ)

  const { ctx, size } = fit(cv, () => draw());
  function state() {
    const P = PATH[mode], f = +sP.value / 100 * (P.length - 1), i = Math.floor(f), t = f - i;
    const E = i >= P.length - 1 ? P[P.length - 1][1] : P[i][1] + (P[i + 1][1] - P[i][1]) * t;
    let light = 0, pumps = [];
    for (let k = 0; k < P.length - 1 && k < f; k++) {
      if (P[k][2] === "light" && P[k + 1][1] < P[k][1] && f >= k + 1) light += 2 * photonKJ(P[k][0] === "P680" ? 680 : 700);
      if (P[k][2] === "pump" && f > k) pumps.push(P[k][0]);
    }
    return { P, f, i, E, light, pumps, dG: -2 * FARADAY * (E - P[0][1]) * -1 };
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state(), P = s.P;
    const gx = 48, gw = w - gx - 16, top = 26, bot = h - 34;
    const Y = (e) => top + (e + 1.45) / 2.8 * (bot - top);   // −1.45 (위) ~ +1.35 (아래)
    const X = (k) => gx + 20 + k / (P.length - 1) * (gw - 40);
    // 눈금
    ctx.strokeStyle = C.rule; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.lineWidth = 1;
    [-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].forEach((e) => { ctx.beginPath(); ctx.moveTo(gx, Y(e) + .5); ctx.lineTo(gx + gw, Y(e) + .5); ctx.stroke(); ctx.fillText(e.toFixed(1), gx - 5, Y(e) + 3); });
    ctx.textAlign = "left"; ctx.fillText("E°′ (V) · 위로 갈수록 전자의 에너지가 높음", 4, top - 10);
    // 경로
    for (let k = 0; k < P.length - 1; k++) {
      const x0 = X(k), y0 = Y(P[k][1]), x1 = X(k + 1), y1 = Y(P[k + 1][1]);
      const up = P[k][2] === "light";
      ctx.strokeStyle = up ? C.amber : (k < s.f ? "#3f6fa3" : "#b9c7d6"); ctx.lineWidth = up ? 3 : 2.2;
      if (up) ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
      if (up) { ctx.fillStyle = C.amber; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(`빛 ${P[k][0] === "P680" ? "680" : "700"} nm`, (x0 + x1) / 2 - 6, (y0 + y1) / 2); }
      if (P[k][2] === "pump") { ctx.fillStyle = "#b5532f"; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("H⁺ 퍼냄", x0 + 2, y0 + (mode === "resp" ? 18 : 34)); }
    }
    P.forEach(([name, e], k) => {
      const x = X(k), y = Y(e);
      ctx.fillStyle = C.card; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 6.29); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `10.5px ${F.sans}`;
      const [, , , dx, dy, al] = P[k];
      ctx.textAlign = al; ctx.fillText(name, x + dx, y + dy);
    });
    // 전자
    const ex = gx + 20 + s.f / (P.length - 1) * (gw - 40);
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(ex, Y(s.E), 7, 0, 6.29); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("e⁻", ex, Y(s.E) + 3.5);
    ctx.fillStyle = C.ink2; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(mode === "resp" ? "세포 호흡: 전자가 내리막을 따라 내려감" : "광합성: 빛으로 두 번 들어 올린 뒤 내려감", gx, h - 10);
  }
  function update() {
    const s = state(), P = s.P, k = Math.min(P.length - 1, Math.round(s.f));
    oP.textContent = P[k][0];
    const dG = 2 * FARADAY * (s.E - P[0][1]);   // 전자쌍 기준: 전위가 오르면(+) 에너지 방출
    nE.textContent = Math.abs(dG) < 1 ? "0 kJ" : dG > 0 ? `${dG.toFixed(0)} kJ 방출` : `${(-dG).toFixed(0)} kJ 저장`;
    nE.classList.toggle("good", dG > 0);
    nL.textContent = mode === "resp" ? "없음" : `${s.light.toFixed(0)} kJ`;
    nH.textContent = s.pumps.length ? s.pumps.join(", ") : "아직 없음";
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.m === mode ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  sP.addEventListener("input", update);
  update();
})();
