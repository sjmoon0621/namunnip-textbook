/* 카드: 학교 연못 둘레의 생물 요소와 비생물 요소 — 지점별 센서 측정, 생물 목록, 산점도와 상관 계수 (가상 자료) */
(() => {
  const root = document.getElementById("card-labbio-eco-survey");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const [cvM, cvP] = root.querySelectorAll("canvas");
  /* 지점: 기호, 이름, 지도 위치(비율), 참값 {조도 klx, 온도 °C, 습도 %, pH, 용존 산소 mg/L, 쥐며느리, 수서 동물}, 생물 목록 */
  const S = [
    { k: "A", n: "양지 잔디밭", p: [0.55, 0.55], v: { lux: 75, T: 27.6, RH: 46, pH: 6.4, iso: 0.4 }, pro: "잔디, 토끼풀, 민들레", con: "개미, 메뚜기, 참새", dec: "흙 속 세균" },
    { k: "B", n: "화단", p: [0.6, 0.83], v: { lux: 58, T: 26.9, RH: 52, pH: 6.8, iso: 1.5 }, pro: "팬지, 바랭이, 쑥", con: "진딧물, 무당벌레, 꿀벌", dec: "흙 속 세균, 곰팡이" },
    { k: "C", n: "숲 가장자리", p: [0.52, 0.27], v: { lux: 16, T: 24.8, RH: 63, pH: 5.9, iso: 6 }, pro: "아까시나무, 쑥, 고사리", con: "쥐며느리, 거미, 직박구리", dec: "버섯, 흙 속 세균" },
    { k: "D", n: "숲 안 그늘", p: [0.8, 0.15], v: { lux: 4.5, T: 23.2, RH: 75, pH: 5.4, iso: 12 }, pro: "참나무, 이끼", con: "쥐며느리, 노래기, 지네", dec: "버섯, 낙엽 위 곰팡이" },
    { k: "E", n: "건물 뒤 그늘", p: [0.88, 0.5], v: { lux: 2.8, T: 22.8, RH: 69, pH: 7.6, iso: 8 }, pro: "이끼, 괭이밥", con: "쥐며느리, 민달팽이, 꼽등이", dec: "곰팡이" },
    { k: "F", n: "연못가 습지", p: [0.41, 0.48], v: { lux: 38, T: 24.6, RH: 82, pH: 6.6, iso: 3 }, pro: "고마리, 부들, 골풀", con: "청개구리, 실잠자리, 모기", dec: "흙 속 세균" },
    { k: "G", n: "연못 수초대 (물)", p: [0.13, 0.5], v: { lux: 52, T: 24.0, RH: 72, pH: 7.9, DO: 9.6, aq: 24 }, pro: "검정말, 개구리밥, 식물 플랑크톤", con: "소금쟁이, 잠자리 유충, 송사리", dec: "물속 세균" },
    { k: "H", n: "낙엽 쌓인 연못 구석 (물)", p: [0.27, 0.83], v: { lux: 7, T: 21.8, RH: 77, pH: 6.7, DO: 3.1, aq: 6 }, pro: "녹조류", con: "실지렁이, 모기 유충, 물달팽이", dec: "낙엽을 분해하는 세균" },
  ];
  const XL = { lux: "조도 (klx)", T: "온도 (°C)", RH: "상대 습도 (%)", pH: "pH", DO: "용존 산소 (mg/L)" };
  const YL = { iso: "쥐며느리 (마리/판)", aq: "수서 무척추동물 (마리)" };
  let sel = 0, xKey = "lux", yKey = "iso", nMeas = 0;

  function poisson(lam) {
    if (lam <= 0) return 0;
    const e = Math.exp(-lam); let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > e);
    return k - 1;
  }
  const mp = fit(cvM, () => drawMap());
  const pl = fit(cvP, () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "k", label: "지점" }, { key: "lux", label: "조도 klx", res: 0.1 }, { key: "T", label: "온도 °C", res: 0.1 },
    { key: "RH", label: "습도 %", res: 1 }, { key: "pH", label: "pH", res: 0.1 }, { key: "DO", label: "DO mg/L", res: 0.1 },
    { key: "iso", label: "쥐며느리", res: 1 }, { key: "aq", label: "수서", res: 1 },
  ], () => { if (!tbl.rows.length) nMeas = 0; drawPlot(); drawMap(); });

  function siteInfo() {
    const s = S[sel], water = s.v.DO !== undefined;
    $(".es-site").innerHTML = `<b>${s.k} · ${s.n}</b> <span class="r">${water ? "물속 온도·pH·용존 산소를 잼" : "지면 위 10 cm 기온, 흙의 pH를 잼"}</span><br>생산자: ${s.pro} · 소비자: ${s.con} · 분해자: ${s.dec}`;
  }

  function drawMap() {
    const { ctx } = mp, { w, h } = mp.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#d6e6bf"; ctx.fillRect(0, 0, w, h);
    /* 숲 */
    ctx.fillStyle = "#a9c98f"; ctx.beginPath(); ctx.moveTo(w * 0.44, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h * 0.36); ctx.bezierCurveTo(w * 0.8, h * 0.42, w * 0.6, h * 0.36, w * 0.44, h * 0.3); ctx.closePath(); ctx.fill();
    let sd = 5; const R = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    for (let i = 0; i < 22; i++) {
      const tx = w * (0.48 + R() * 0.5), ty = h * (0.02 + R() * 0.26);
      ctx.fillStyle = "rgba(59,124,42,.5)"; ctx.beginPath(); ctx.arc(tx, ty, Math.min(w, h) * 0.045, 0, Math.PI * 2); ctx.fill();
    }
    /* 건물 */
    ctx.fillStyle = "#c9c9c4"; ctx.fillRect(w * 0.78, h * 0.6, w * 0.2, h * 0.36);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("본관", w * 0.88, h * 0.8);
    /* 화단 */
    ctx.fillStyle = "#e3c9a3"; ctx.fillRect(w * 0.53, h * 0.75, w * 0.15, h * 0.16);
    ctx.fillStyle = "#d4493a"; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(w * (0.54 + R() * 0.13), h * (0.77 + R() * 0.12), 1.8, 0, Math.PI * 2); ctx.fill(); }
    /* 습지와 연못 */
    ctx.fillStyle = "#b6cf9a"; ctx.beginPath(); ctx.ellipse(w * 0.23, h * 0.62, w * 0.21, h * 0.33, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9cc3d6"; ctx.beginPath(); ctx.ellipse(w * 0.22, h * 0.63, w * 0.16, h * 0.27, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(120,96,50,.45)"; for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.ellipse(w * (0.23 + R() * 0.07), h * (0.76 + R() * 0.1), 3.5, 1.6, R() * 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = "#5f8f5a"; ctx.lineWidth = 1.2; for (let i = 0; i < 18; i++) { const gx = w * (0.08 + R() * 0.1), gy = h * (0.42 + R() * 0.2); ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 1, gy - 7); ctx.stroke(); }
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.fillText("연못", w * 0.2, h * 0.68);
    ctx.fillText("숲", w * 0.66, h * 0.33); ctx.fillText("잔디밭", w * 0.66, h * 0.62);
    /* 지점 */
    const cnt = {}; tbl.rows.forEach((r) => { cnt[r.k] = (cnt[r.k] || 0) + 1; });
    S.forEach((s, i) => {
      const x = s.p[0] * w, y = s.p[1] * h, r = 10;
      ctx.fillStyle = i === sel ? C.ink : "#fbfbf8"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = i === sel ? "#fbfbf8" : C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(s.k, x, y + 4);
      if (cnt[s.k]) { ctx.fillStyle = C.forest; ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("×" + cnt[s.k], x + r + 2, y - 4); }
    });
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => Number.isFinite(r[xKey]) && Number.isFinite(r[yKey]));
    const pts = rows.map((r) => ({ x: r[xKey], y: r[yKey] }));
    const f = pts.length > 2 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    const box = { x0: 40, y0: 34, w: w - 54, h: h - 68 };
    const g = L.plot(ctx, box, { pts, fit: f, xlabel: XL[xKey], ylabel: YL[yKey] });
    ctx.fillStyle = C.ink2; ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "left";
    rows.forEach((r) => ctx.fillText(r.k, g.X(r[xKey]) + 5, g.Y(r[yKey]) - 4));
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
    if (f) {
      const r = Math.sign(f.a) * Math.sqrt(Math.max(0, f.r2));
      ctx.fillStyle = C.warn; ctx.fillText(`r = ${r.toFixed(2)} (n = ${f.n})`, box.x0 + box.w, 16);
    } else {
      ctx.fillStyle = C.ink3; ctx.fillText(pts.length ? "점이 3개 이상이면 r을 계산합니다" : "이 두 값을 함께 잰 기록이 없습니다", box.x0 + box.w, 16);
    }
  }

  function measure() {
    const s = S[sel].v, drift = $(".late").checked ? 0.45 * nMeas : 0;
    nMeas++;
    const water = s.DO !== undefined;
    tbl.add({
      k: S[sel].k,
      lux: Math.max(0, L.measure(s.lux, { rel: 0.15, res: 0.1 })),
      T: L.measure(s.T + drift * (water ? 0.4 : 1), { sd: 0.3, res: 0.1 }),
      RH: Math.min(100, L.measure(s.RH, { sd: 2.5, res: 1 })),
      pH: L.measure(s.pH, { sd: 0.12, res: 0.1 }),
      DO: water ? L.measure(s.DO, { sd: 0.35, res: 0.1 }) : "—",
      iso: water ? "—" : poisson(s.iso * Math.exp(0.35 * L.gauss() - 0.06)),
      aq: water ? poisson(s.aq * Math.exp(0.3 * L.gauss() - 0.045)) : "—",
    });
  }

  cvM.addEventListener("click", (e) => {
    const b = cvM.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    let best = -1, bd = 1e9;
    S.forEach((s, i) => { const d = (s.p[0] * b.width - x) ** 2 + (s.p[1] * b.height - y) ** 2; if (d < bd) { bd = d; best = i; } });
    if (bd < 40 * 40) { sel = best; siteInfo(); drawMap(); }
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (xKey === "DO") { yKey = "aq"; root.querySelectorAll("[data-y]").forEach((y) => y.setAttribute("aria-pressed", String(y.dataset.y === "aq"))); }
    drawPlot();
  });
  $(".ysel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-y]"); if (!b) return;
    yKey = b.dataset.y; root.querySelectorAll("[data-y]").forEach((y) => y.setAttribute("aria-pressed", String(y === b))); drawPlot();
  });
  siteInfo();
  if (L.demo) {
    for (let rep = 0; rep < 2; rep++) for (let i = 0; i < S.length; i++) { sel = i; measure(); }
    sel = 3; siteInfo(); drawMap();
  }
})();
