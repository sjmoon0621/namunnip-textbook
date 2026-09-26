/* 카드: 세균을 모아 광합성에 쓰이는 빛의 색을 알아낼 수 있을까? — 엥겔만 실험 모식. 세균 밀도 ∝ 작용 스펙트럼(가우스 합으로 만든 대략의 모양) */
(() => {
  const root = document.getElementById("card-cell-engelmann");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), chl = $(".chl"), nP = $(".n-p"), nB = $(".n-b"), nG = $(".n-g");
  const L0 = 400, L1 = 700;
  const g = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2);
  const action = (l) => 0.3 + 0.7 * g(l, 440, 28) + 0.4 * g(l, 485, 22) + 0.78 * g(l, 675, 20) + 0.22 * g(l, 640, 25) - 0.3 * g(l, 710, 12);
  const chlA = (l) => 0.03 + 1.0 * g(l, 430, 16) + 0.25 * g(l, 410, 12) + 0.75 * g(l, 662, 11) + 0.12 * g(l, 615, 15);
  const amax = Math.max(...Array.from({ length: 301 }, (_, i) => action(400 + i)));
  const cmax = Math.max(...Array.from({ length: 301 }, (_, i) => chlA(400 + i)));
  function rgb(l) {   // 파장 → 화면 색 (대략)
    let r = 0, gg = 0, b = 0;
    if (l < 440) { r = (440 - l) / 40 * 0.6; b = 1; } else if (l < 490) { gg = (l - 440) / 50; b = 1; } else if (l < 510) { gg = 1; b = (510 - l) / 20; }
    else if (l < 580) { r = (l - 510) / 70; gg = 1; } else if (l < 645) { r = 1; gg = (645 - l) / 65; } else r = 1;
    const f = l < 420 ? 0.4 + 0.6 * (l - 400) / 20 : l > 680 ? 0.4 + 0.6 * (700 - l) / 20 : 1;
    return `rgb(${Math.round(255 * r * f)},${Math.round(255 * gg * f)},${Math.round(255 * b * f)})`;
  }
  let mode = "prism";
  // 빛 세기(파장별, 필라멘트의 x 위치 = 파장)
  const lightAt = (l) => mode === "dark" ? 0 : mode === "green" ? (l >= 500 && l <= 560 ? 1 : 0) : 1;
  // 세균 밀도(필라멘트 위치 x에서)
  function density(l) {
    if (mode === "dark") return 0;
    if (mode === "white") return 0.62;   // 모든 파장이 섞여 필라멘트 전체가 같은 빛을 받음
    return lightAt(l) * Math.pow(action(l) / amax, 2);   // 세균이 산소가 많은 곳으로 몰리는 효과를 강조한 모식
  }
  let seed = 9; const rnd = () => { const x = Math.sin(seed++ * 17.17) * 43758.5; return x - Math.floor(x); };
  const pool = Array.from({ length: 900 }, () => [rnd(), rnd(), rnd()]);

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 30, x1 = w - 14, X = (l) => x0 + (l - L0) / (L1 - L0) * (x1 - x0), Lx = (x) => L0 + (x - x0) / (x1 - x0) * (L1 - L0);
    // 현미경 시야
    const fy = h * 0.28, top = 14, bot = h * 0.5;
    ctx.fillStyle = "#1c1e1b"; ctx.fillRect(x0 - 6, top, x1 - x0 + 12, bot - top);
    // 빛
    for (let x = x0; x < x1; x++) {
      const l = Lx(x);
      if (mode === "prism") { ctx.fillStyle = rgb(l); ctx.globalAlpha = 0.55; ctx.fillRect(x, top, 1.2, bot - top); }
      else if (mode === "white") { ctx.fillStyle = "#fffbe8"; ctx.globalAlpha = 0.55; ctx.fillRect(x, top, 1.2, bot - top); }
      else if (mode === "green" && lightAt(l)) { ctx.fillStyle = "rgb(60,200,70)"; ctx.globalAlpha = 0.55; ctx.fillRect(x, top, 1.2, bot - top); }
    }
    ctx.globalAlpha = 1;
    // 조류 사슬
    ctx.fillStyle = "#4f9a3c"; ctx.strokeStyle = "#1f4d15"; ctx.lineWidth = 1;
    const cellW = 22;
    for (let x = x0; x < x1 - 2; x += cellW) { ctx.beginPath(); ctx.roundRect(x, fy - 7, Math.min(cellW - 2, x1 - x), 14, 4); ctx.fill(); ctx.stroke(); }
    // 세균
    let count = 0;
    ctx.fillStyle = "#f3f4ef";
    pool.forEach(([a, b, c]) => {
      const x = x0 + a * (x1 - x0), l = Lx(x), d = density(l);
      const bg = 0.05;   // 어디에나 조금씩
      if (c > d * 0.9 + bg) return;
      const near = d > 0 ? (b - 0.5) * 2 * (10 + 26 * (1 - d * 0.7)) : (b - 0.5) * (bot - top - 10);
      const y = fy + near;
      if (y < top + 3 || y > bot - 3) return;
      ctx.beginPath(); ctx.ellipse(x, y, 2.2, 1.2, a * 6, 0, 6.29); ctx.fill(); count++;
    });
    ctx.fillStyle = "#c9cbc4"; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(mode === "dark" ? "빛 없음" : mode === "white" ? "백색광" : mode === "green" ? "초록빛만" : "프리즘으로 나눈 빛", x0, top + 14);
    // 그래프
    const gy = bot + 26, gh = h - gy - 34;
    const Y = (v) => gy + gh - v * gh;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    [400, 450, 500, 550, 600, 650, 700].forEach((l) => { ctx.beginPath(); ctx.moveTo(X(l) + .5, gy); ctx.lineTo(X(l) + .5, gy + gh); ctx.stroke(); ctx.fillText(l, X(l), gy + gh + 14); });
    ctx.textAlign = "right"; ctx.fillText("파장 (nm)", x1, gy + gh + 28);
    for (let x = x0; x < x1; x++) { ctx.fillStyle = rgb(Lx(x)); ctx.fillRect(x, gy + gh + 2, 1.2, 3); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let l = L0; l <= L1; l += 2) { const y = Y(action(l) / amax); l > L0 ? ctx.lineTo(X(l), y) : ctx.moveTo(X(l), y); } ctx.stroke();
    if (chl.checked) {
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.8; ctx.setLineDash([5, 3]); ctx.beginPath();
      for (let l = L0; l <= L1; l += 2) { const y = Y(chlA(l) / cmax); l > L0 ? ctx.lineTo(X(l), y) : ctx.moveTo(X(l), y); } ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink;
    ctx.fillText("광합성 속도 (작용 스펙트럼, 상대값)", x0, gy - 8);
    if (chl.checked) { ctx.fillStyle = C.forest; ctx.textAlign = "right"; ctx.fillText("- - 엽록소 a 흡수", x1, gy - 8); }
    draw.count = count;
  }
  function update() {
    root.querySelectorAll("[data-l]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.l === mode ? "true" : "false"));
    draw();
    nB.textContent = mode === "dark" ? "거의 없음" : String(draw.count || 0);
    nP.textContent = mode === "prism" ? "청자색(약 440 nm), 적색(약 675 nm)" : mode === "white" ? "사슬 전체에 고르게" : mode === "green" ? "초록빛 부분에 조금" : "고르게 흩어짐";
    nG.textContent = mode === "dark" ? "—" : mode === "white" ? "구별 안 됨" : "적게 모임";
  }
  root.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.l; update(); }));
  chl.addEventListener("change", update);
  new ResizeObserver(() => update()).observe(cv);
  update();
})();
