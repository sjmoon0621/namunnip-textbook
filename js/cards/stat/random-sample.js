/* 카드: 정문 앞에서 만난 학생 20명으로 평균 통학 시간을 알 수 있을까? — 가상 모집단(20×20)에서 임의추출과 치우친 추출의 표본평균 비교 */
(() => {
  const root = document.getElementById("card-stat-random-sample");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sn = $(".n"), chips = [...root.querySelectorAll(".presets .chip")];
  const G = 20, TMAX = 70; // 칸 수, 통학 시간 최댓값(분)
  /* 가상 모집단(모식): 위쪽 줄일수록 학교에 가까워 통학 시간이 짧다 */
  const pr = S.rng(7), pop = [];
  for (let row = 0; row < G; row++) for (let col = 0; col < G; col++) {
    pop.push(Math.round(Math.min(TMAX - 2, Math.max(3, 8 + 42 * row / (G - 1) + 7 * S.gauss(pr)))));
  }
  const M = pop.reduce((a, b) => a + b, 0) / pop.length;
  const NAMES = { rand: "임의추출", near: "앞 두 줄" };
  let mode = "rand", r = S.rng(11), pick = [], rec = { rand: [], near: [] };
  const { ctx, size } = fit($("canvas"), () => draw());
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = h - 8, cs = g / G, gx = 4, gy = 4;
    for (let i = 0; i < pop.length; i++) {
      ctx.globalAlpha = 0.1 + 0.85 * pop[i] / TMAX; ctx.fillStyle = C.forest;
      ctx.fillRect(gx + (i % G) * cs + 0.5, gy + Math.floor(i / G) * cs + 0.5, cs - 1, cs - 1);
    }
    ctx.globalAlpha = 1;
    if (mode === "near") {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      ctx.strokeRect(gx, gy, g, 2 * cs); ctx.setLineDash([]);
    }
    ctx.strokeStyle = C.warn; ctx.lineWidth = Math.max(1.5, cs * 0.18);
    for (const i of pick) ctx.strokeRect(gx + (i % G) * cs + 1, gy + Math.floor(i / G) * cs + 1, cs - 2, cs - 2);

    /* 오른쪽: 방법별 표본평균 기록 */
    const x0 = gx + g + 40, y0 = 20, gw = w - x0 - 8, gh = h - y0 - 22;
    const Y = (v) => y0 + (1 - v / TMAX) * gh, CX = (j) => x0 + gw * (j + 0.5) / 2;
    axes(ctx, { x0, y0, w: gw, h: gh, X: CX, Y, yt: [0, 20, 40, 60].map((v) => [v, String(v)]), ylabel: "x̄ (분)" });
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(x0, Y(M)); ctx.lineTo(x0 + gw, Y(M)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.font = `600 10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.fillText("m", x0 + gw, Y(M) - 2);
    ["rand", "near"].forEach((key, j) => {
      const list = rec[key].slice(-80), cx = CX(j), sp = gw / 2 * 0.32;
      ctx.fillStyle = key === mode ? C.warn : C.ink3;
      list.forEach((v, i) => { ctx.beginPath(); ctx.arc(cx + ((i * 37) % 21 - 10) / 10 * sp, Y(v), 2.2, 0, 7); ctx.fill(); });
      if (list.length) {
        const a = avg(rec[key]);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - sp - 4, Y(a)); ctx.lineTo(cx + sp + 4, Y(a)); ctx.stroke();
      }
      ctx.fillStyle = key === mode ? C.ink : C.ink3; ctx.font = `${key === mode ? 600 : 400} 10.5px ${F.sans}`;
      ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(NAMES[key], cx, y0 + gh + 6);
    });
  }

  function sample() {
    const n = +sn.value, a = mode === "rand" ? pop.map((_, i) => i) : pop.map((_, i) => i).slice(0, 2 * G);
    for (let i = 0; i < n; i++) { const j = i + Math.floor(r() * (a.length - i)); [a[i], a[j]] = [a[j], a[i]]; }
    pick = a.slice(0, n);
    rec[mode].push(avg(pick.map((i) => pop[i])));
  }
  function update() {
    const list = rec[mode];
    $(".n-out").textContent = sn.value;
    $(".n-m").textContent = `${S.fmt(M, 2)}분`;
    $(".n-x").textContent = pick.length ? `${S.fmt(avg(pick.map((i) => pop[i])), 2)}분` : "—";
    $(".n-c").textContent = list.length;
    $(".n-a").textContent = list.length ? `${S.fmt(avg(list), 2)}분` : "—";
    draw();
  }
  chips.forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.m; pick = [];
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    update();
  }));
  $(".go-one").addEventListener("click", () => { sample(); update(); });
  $(".go-20").addEventListener("click", () => { for (let i = 0; i < 20; i++) sample(); update(); });
  $(".go-reset").addEventListener("click", () => { rec = { rand: [], near: [] }; pick = []; update(); });
  sn.addEventListener("input", () => { rec = { rand: [], near: [] }; pick = []; sample(); update(); });
  mode = "near"; for (let i = 0; i < 12; i++) sample();
  mode = "rand"; for (let i = 0; i < 12; i++) sample();
  update();
})();
