/* 카드: 지진파 속도로 지구 속 물질 알아내기 — PREM(Dziewonski & Anderson, 1981) 등방 근사 다항식 */
(() => {
  const root = document.getElementById("card-adearth-prem");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".d"), oD = $(".d-out");
  const RE = 6371;
  const poly = (c, x) => c.reduce((a, k, i) => a + k * x ** i, 0);
  /* [바깥 반지름(km), ρ 계수, VP 계수, VS 계수] — x = r/6371 */
  const LM = [7.9565, -6.4761, 5.5283, -3.0807];
  const L = [
    [1221.5, [13.0885, 0, -8.8381], [11.2622, 0, -6.3640], [3.6678, 0, -4.4475]],
    [3480, [12.5815, -1.2638, -3.6426, -5.5281], [11.0487, -4.0362, 4.8023, -13.5732], [0]],
    [3630, LM, [15.3891, -5.3181, 5.5242, -2.5514], [6.9254, 1.4672, -2.0834, 0.9783]],
    [5600, LM, [24.9520, -40.4673, 51.4832, -26.6419], [11.1671, -13.7818, 17.4575, -9.2777]],
    [5701, LM, [29.2766, -23.6027, 5.5242, -2.5514], [22.3459, -17.2473, -2.0834, 0.9783]],
    [5771, [5.3197, -1.4836], [19.0957, -9.8672], [9.9839, -4.9324]],
    [5971, [11.2494, -8.0298], [39.7027, -32.6166], [22.3512, -18.5856]],
    [6151, [7.1089, -3.8045], [20.3926, -12.2569], [8.9496, -4.4597]],
    [6346.6, [2.6910, 0.6924], [4.1875, 3.9382], [2.1519, 2.3481]],
    [6356, [2.9], [6.8], [3.9]],
    [6371, [2.6], [5.8], [3.2]],
  ];
  function prem(depth) {
    const r = RE - depth, x = r / RE;
    const l = L.find((q) => r <= q[0] + 1e-9) || L[L.length - 1];
    return { rho: poly(l[1], x), vp: poly(l[2], x), vs: poly(l[3], x) };
  }
  /* 압력: 질량 적분 → g(r) → 정역학 평형. 1 km 간격 */
  const N = 6371, P = new Float64Array(N + 1);
  (() => {
    const G = 6.674e-11, m = new Float64Array(N + 1);
    for (let i = 1; i <= N; i++) { const r = (i - 0.5) * 1000, rho = prem(RE - (i - 0.5)).rho * 1000; m[i] = m[i - 1] + 4 * Math.PI * r * r * rho * 1000; }
    for (let i = N - 1; i >= 0; i--) {
      const r = (i + 0.5) * 1000, mm = (m[i] + m[i + 1]) / 2, g = G * mm / (r * r), rho = prem(RE - (i + 0.5)).rho * 1000;
      P[i] = P[i + 1] + rho * g * 1000;
    }
  })();
  const pres = (depth) => P[clamp(Math.round(RE - depth), 0, N)] / 1e9;
  const BANDS = [
    [0, 24.4, "#d9c9a8", "지각"], [24.4, 400, "#e8d5c0", "상부 맨틀"], [400, 670, "#e9cfb4", "전이대"],
    [670, 2891, "#ecdcc9", "하부 맨틀"], [2891, 5150, "#f2d7a6", "외핵"], [5150, 6371, "#efc98d", "내핵"],
  ];
  function material(d) {
    if (d < 15) return "상부 지각: 화강암질 암석(석영·장석이 주성분). 밀도 약 2.6~2.7 g/cm³.";
    if (d < 24.4) return "하부 지각: 현무암질·반려암질 암석. PREM은 평균 지각 두께를 24.4 km로 두지만, 실제 대륙 지각은 30~70 km, 해양 지각은 5~10 km입니다.";
    if (d < 400) return "상부 맨틀: 감람암(감람석 약 60 %, 휘석, 석류석). 감람석 (Mg,Fe)₂SiO₄가 가장 많습니다.";
    if (d < 670) return "전이대: 감람석과 화학 조성은 같지만 압력 때문에 원자가 더 빽빽하게 쌓인 고압상(와즐리아이트 → 링우다이트)과 석류석.";
    if (d < 2891) return "하부 맨틀: 브리지마나이트((Mg,Fe)SiO₃, 페로브스카이트 구조)와 페리클레이스((Mg,Fe)O). 바닥 약 150 km는 성질이 불균질한 D″층입니다.";
    if (d < 5150) return "외핵: 액체 철–니켈 합금. 같은 압력의 순수한 철보다 가벼워 황·산소·규소 같은 가벼운 원소가 섞여 있다고 봅니다.";
    return "내핵: 고체 철–니켈 합금. 온도는 외핵보다 높지만 압력이 더 커서 녹는점이 올라가 고체로 굳었습니다.";
  }
  let depth = +sD.value;
  const { ctx, size } = fit(cv, () => draw());
  let G0 = null;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 44, x1 = w - 12, y0 = 34, y1 = h - 14, XM = 14.5;
    const X = (v) => x0 + v / XM * (x1 - x0), Y = (d) => y0 + d / RE * (y1 - y0);
    G0 = { y0, y1 };
    BANDS.forEach(([a, b, col, name]) => {
      ctx.fillStyle = col; ctx.globalAlpha = 0.55; ctx.fillRect(x0, Y(a), x1 - x0, Math.max(1, Y(b) - Y(a))); ctx.globalAlpha = 1;
      if (b - a > 200) { ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(name, x1 - 4, (Y(a) + Y(b)) / 2 + (name === "상부 맨틀" ? 4 : 4)); }
    });
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    for (let v = 0; v <= 14; v += 2) { const x = Math.round(X(v)) + 0.5; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.textAlign = "center"; ctx.fillText(String(v), x, y0 - 6); }
    for (let d = 0; d <= 6000; d += 1000) { const y = Math.round(Y(d)) + 0.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.textAlign = "right"; ctx.fillText(String(d), x0 - 5, y + 3); }
    ctx.textAlign = "left"; ctx.fillText("속도 km/s · 밀도 g/cm³", x0, y0 - 20);
    ctx.save(); ctx.translate(11, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("깊이 (km)", 0, 0); ctx.restore();
    const curve = (key, col, wd) => {
      ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath();
      let prev = null;
      for (let d = 0; d <= RE; d += 2) {
        const v = prem(d)[key], px = X(v), py = Y(d);
        if (prev === null) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        prev = v;
      }
      ctx.stroke();
    };
    curve("vp", "#3f6fa3", 2); curve("vs", "#c0392b", 2); curve("rho", "#232326", 1.6);
    /* 범례: 외핵 왼쪽 빈자리 */
    const ly = Y(3250);
    [["V_P", "#3f6fa3", "P파 속도"], ["V_S", "#c0392b", "S파 속도"], ["ρ", "#232326", "밀도"]].forEach(([, col, name], i) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0.5), ly + i * 15); ctx.lineTo(X(1.3), ly + i * 15); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(name, X(1.5), ly + i * 15 + 4);
    });
    /* 선택 깊이 */
    const q = prem(depth), y = Y(depth);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]);
    [["vp", "#3f6fa3"], ["vs", "#c0392b"], ["rho", "#232326"]].forEach(([k, col]) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(q[k]), y, 4, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = C.warn; ctx.font = `bold 10.5px ${F.mono}`; ctx.textAlign = "left";
    const lx = q.vs < 1 ? X(0.3) + 0 : X(0.3);
    ctx.fillText(`${Math.round(depth)} km`, lx, y + (depth > 6100 ? -6 : 13));
  }
  function update() {
    oD.textContent = String(Math.round(depth)); sD.value = String(Math.round(depth));
    const q = prem(depth), mu = q.rho * q.vs * q.vs, phi = q.vp * q.vp - 4 / 3 * q.vs * q.vs, K = q.rho * phi;
    $(".n-v").textContent = `${q.vp.toFixed(2)} · ${q.vs.toFixed(2)}`;
    $(".n-r").textContent = q.rho.toFixed(2);
    $(".n-p").textContent = pres(depth).toFixed(depth < 100 ? 2 : 0);
    const nmu = $(".n-mu"); nmu.textContent = mu.toFixed(0); nmu.classList.toggle("bad", mu < 0.5);
    $(".n-k").textContent = K.toFixed(0);
    $(".n-phi").textContent = `${phi.toFixed(1)} (km/s)²`;
    $(".pm-mat").textContent = material(depth);
    root.querySelectorAll("[data-d]").forEach((b) => {
      const d = +b.dataset.d, band = BANDS.find(([a, c]) => d >= a && d < c), cur = BANDS.find(([a, c]) => depth >= a && depth < (c === RE ? c + 1 : c));
      b.setAttribute("aria-pressed", String(band === cur));
    });
    draw();
  }
  sD.addEventListener("input", () => { depth = +sD.value; update(); });
  root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { depth = +b.dataset.d; update(); }));
  let drag = false;
  const pick = (e) => { if (!G0) return; const r = cv.getBoundingClientRect(); depth = clamp((e.clientY - r.top - G0.y0) / (G0.y1 - G0.y0) * RE, 0, RE); update(); };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) pick(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  update();
})();
