/* 카드: 어떤 화산은 흐르고, 어떤 화산은 터지는 까닭은? — SiO₂ 함량 → 온도·점성 → 화산체 모양 */
(() => {
  const root = document.getElementById("card-esys-volcano");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sS = $(".s"), oS = $(".s-out"), nK = $(".n-k"), nV = $(".n-v"), nF = $(".n-f"), nE = $(".n-e");
  const T = (s) => 1250 - (s - 48) * 17;              // °C 대표값
  const logEta = (s) => 1.5 + (s - 48) * 0.27;         // Pa·s, 현무암 ~10², 안산암 ~10⁵, 유문암 ~10⁸
  const kind = (s) => s < 52 ? 0 : s < 63 ? 1 : 2;
  const K = [
    ["현무암질 (SiO₂ 52 % 미만)", "순상 화산 · 용암 대지 — 조용히 흘러나옴(용암류)", "하와이 킬라우에아, 한라산의 산허리, 아이슬란드"],
    ["안산암질 (52~63 %)", "성층 화산 — 용암과 화산 쇄설물이 번갈아 쌓임", "일본 후지산, 필리핀 마욘, 백두산의 대부분"],
    ["유문암질 (63 % 이상)", "용암 돔(종상 화산) — 폭발적 분출, 화산재·부석·화쇄류", "세인트헬렌스의 용암 돔, 제주 산방산(조면암)"],
  ];
  const COL = ["#3a3a3c", "#7b6a5c", "#c9b8a6"];
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = +sS.value, k = kind(s), le = logEta(s);
    // 왼쪽: 화산 단면
    const gx0 = 20, gx1 = w * 0.62, base = h * 0.78, cx = (gx0 + gx1) / 2;
    ctx.fillStyle = "rgba(110,164,230,.10)"; ctx.fillRect(gx0, 10, gx1 - gx0, base - 10);
    const ang = clamp(4 + (s - 45) * 1.35, 4, 42) * Math.PI / 180;  // 경사각
    const half = k === 2 ? (gx1 - gx0) * 0.16 : (gx1 - gx0) * (0.46 - (s - 45) * 0.008);
    const ht = Math.min(base - 30, half * Math.tan(ang));
    ctx.fillStyle = COL[k]; ctx.beginPath(); ctx.moveTo(cx - half, base);
    if (k === 2) { ctx.bezierCurveTo(cx - half, base - ht * 1.1, cx + half, base - ht * 1.1, cx + half, base); }
    else { ctx.lineTo(cx - 8, base - ht); ctx.lineTo(cx + 8, base - ht); ctx.lineTo(cx + half, base); }
    ctx.fill();
    if (k === 1) { ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1; for (let i = 1; i < 6; i++) { const y = base - ht * i / 6, hw = half * (1 - i / 6); ctx.beginPath(); ctx.moveTo(cx - hw, y + 4); ctx.lineTo(cx + hw, y + 4); ctx.stroke(); } }
    // 분출물
    if (k === 0) { ctx.strokeStyle = "#e0602a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, base - ht); ctx.quadraticCurveTo(cx + half * 0.5, base - ht * 0.5, cx + half * 1.05, base - 2); ctx.stroke(); }
    else { const n = k === 1 ? 10 : 22; ctx.fillStyle = "rgba(100,100,100,.45)"; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / n - 0.5) * 1.3, r = 16 + (i * 37 % 60) * (k === 2 ? 1.2 : 0.6); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, base - ht - 10 + Math.sin(a) * r, 5 + (i % 3) * 3, 0, Math.PI * 2); ctx.fill(); } }
    ctx.fillStyle = C.ink; ctx.fillRect(gx0, base, gx1 - gx0, 2);
    ctx.fillStyle = "#e0602a"; ctx.beginPath(); ctx.ellipse(cx, base + (h - base) * 0.55, 40, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx - 3, base, 6, (h - base) * 0.5);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`경사 약 ${Math.round(ang * 180 / Math.PI)}°`, gx0 + 6, 26); ctx.fillText("마그마방", cx + 46, base + (h - base) * 0.6);
    // 오른쪽: 점성 막대 (로그)
    const bx0 = w * 0.70, bx1 = w - 20, by = [34, 94];
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("점성 (Pa·s, 로그 눈금)", bx0, by[0] - 12);
    ctx.fillStyle = C.rule; ctx.fillRect(bx0, by[0], bx1 - bx0, 14);
    const f = (le - 0) / 10; ctx.fillStyle = "#b5532f"; ctx.fillRect(bx0, by[0], (bx1 - bx0) * clamp(f, 0, 1), 14);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; [0, 5, 10].forEach((e) => ctx.fillText(`10${["⁰", "⁵", "¹⁰"][e / 5]}`, bx0 + (bx1 - bx0) * e / 10, by[0] + 28));
    ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillText("물 10⁻³ · 꿀 10¹ · 땅콩버터 10³", bx0, by[0] + 44);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.fillText("온도 (°C)", bx0, by[1] + 10);
    ctx.fillStyle = C.rule; ctx.fillRect(bx0, by[1] + 18, bx1 - bx0, 14);
    ctx.fillStyle = "#e0a02a"; ctx.fillRect(bx0, by[1] + 18, (bx1 - bx0) * clamp((T(s) - 600) / 700, 0, 1), 14);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [600, 900, 1200].forEach((t) => ctx.fillText(t, bx0 + (bx1 - bx0) * (t - 600) / 700, by[1] + 46));
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.fillText("기체가 빠져나가기", bx0, by[1] + 72);
    ctx.fillStyle = ["#3b7c2a", "#e0a02a", "#b5532f"][k]; ctx.font = `600 12px ${F.sans}`; ctx.fillText(["쉬움 → 조용한 분출", "중간 → 폭발과 용암 번갈아", "어려움 → 폭발적 분출"][k], bx0, by[1] + 90);
  }
  function update() {
    const s = +sS.value, k = kind(s); oS.textContent = s;
    nK.textContent = K[k][0]; nV.textContent = `약 ${Math.round(T(s) / 10) * 10} °C · 약 10${String(Math.round(logEta(s))).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])} Pa·s`;
    nF.textContent = K[k][1]; nE.textContent = K[k][2];
    draw();
  }
  sS.addEventListener("input", update); update();
})();
