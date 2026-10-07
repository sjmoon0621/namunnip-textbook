/* 카드: 설문에 응답한 사람이 많으면 전교생을 대표할까? — 표집 방법과 표본 크기 (모식 학교 1200명) */
(() => {
  const root = document.getElementById("card-fusi-sampling");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  // 고정된 모식 모집단 (씨앗 난수로 매번 같은 학교)
  let seed = 20261007;
  const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rg = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const COLS = 40, ROWS = 30, GM = [6.9, 6.4, 5.8];
  const pop = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const g = Math.floor(i / 400), s = Math.min(9.5, Math.max(3.5, GM[g] + 0.8 * rg()));
    const pRoom = Math.min(0.9, (g === 2 ? 0.35 : 0.12) * Math.exp(-1.1 * (s - 6.2)));
    pop.push({ g, s: Math.round(s * 10) / 10, room: rnd() < pRoom, wSns: Math.exp(-1.3 * (s - 6.3)) });
  }
  const TRUE = pop.reduce((a, p) => a + p.s, 0) / pop.length;
  const roomPool = pop.map((p, i) => (p.room ? i : -1)).filter((i) => i >= 0);

  let meth = "srs", picked = new Set(), means = [], last = NaN, showTrue = false;
  const nEl = $(".n");

  function shuffleTake(idx, k) {
    const a = idx.slice();
    for (let i = 0; i < k; i++) { const j = i + Math.floor(Math.random() * (a.length - i)); [a[i], a[j]] = [a[j], a[i]]; }
    return a.slice(0, k);
  }
  function draw1() {
    const n = +nEl.value, all = pop.map((_, i) => i);
    let ids;
    if (meth === "srs") ids = shuffleTake(all, n);
    else if (meth === "strat") {
      ids = [];
      [0, 1, 2].forEach((g) => { const k = Math.floor(n / 3) + (g < n % 3 ? 1 : 0); ids.push(...shuffleTake(all.filter((i) => pop[i].g === g), k)); });
    } else if (meth === "room") ids = shuffleTake(roomPool, Math.min(n, roomPool.length));
    else ids = all.map((i) => [Math.pow(Math.random(), 1 / pop[i].wSns), i]).sort((a, b) => b[0] - a[0]).slice(0, n).map((x) => x[1]);
    picked = new Set(ids);
    last = ids.reduce((a, i) => a + pop[i].s, 0) / ids.length;
    means.push(last);
  }

  const top = fit($(".cv-wide"), () => drawPop());
  const bot = fit($(".cv-plot"), () => drawHist());
  const shade = (s) => {
    const t = Math.min(1, Math.max(0, (s - 4.5) / 4));
    const a = [47, 92, 36], b = [222, 236, 214];
    return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(",")})`;
  };

  function drawPop() {
    const { ctx } = top, { w, h } = top.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lw = 46, cell = Math.min((w - lw - 8) / COLS, (h - 40) / ROWS), x0 = lw, y0 = 4;
    pop.forEach((p, i) => {
      const c = i % COLS, r = Math.floor(i / COLS), x = x0 + c * cell, y = y0 + r * cell;
      ctx.fillStyle = shade(p.s); ctx.fillRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      if (meth === "room" && p.room && !picked.size) { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2); }
    });
    ctx.strokeStyle = C.warn; ctx.lineWidth = Math.max(1.4, cell * 0.22);
    picked.forEach((i) => { const c = i % COLS, r = Math.floor(i / COLS); ctx.strokeRect(x0 + c * cell + 1, y0 + r * cell + 1, cell - 2, cell - 2); });
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ["1학년", "2학년", "3학년"].forEach((t, g) => ctx.fillText(t, x0 - 6, y0 + (g * 10 + 5) * cell + 4));
    ctx.strokeStyle = C.card; ctx.lineWidth = 2;
    [10, 20].forEach((r) => { ctx.beginPath(); ctx.moveTo(x0, y0 + r * cell); ctx.lineTo(x0 + COLS * cell, y0 + r * cell); ctx.stroke(); });
    // 색 범례
    const ly = y0 + ROWS * cell + 7, lx = x0, lwid = Math.min(160, COLS * cell * 0.45);
    for (let k = 0; k <= 40; k++) { ctx.fillStyle = shade(4.5 + 4 * k / 40); ctx.fillRect(lx + k * lwid / 41, ly, lwid / 41 + 0.5, 8); }
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("4.5 h", lx, ly + 19); ctx.textAlign = "right"; ctx.fillText("8.5 h 이상", lx + lwid, ly + 19);
    ctx.textAlign = "right"; ctx.fillStyle = C.warn;
    ctx.fillText(picked.size ? `□ 이번 표본 ${picked.size}명` : "", x0 + COLS * cell, ly + 8);
  }

  function drawHist() {
    const { ctx } = bot, { w, h } = bot.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 26, w: w - 54, h: h - 60 };
    const hx = L.hist(ctx, box, means, { xr: [5.2, 7.2], bins: 40, xlabel: "표본 평균 수면 시간 (h)", ylabel: `표본 수 (총 ${means.length}번)` });
    ctx.save(); ctx.font = `11px ${F.sans}`;
    if (showTrue) {
      const x = hx.X(TRUE);
      ctx.strokeStyle = C.ink; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, box.y0); ctx.lineTo(x, box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink; ctx.textAlign = x > box.x0 + box.w * 0.7 ? "right" : "left";
      ctx.fillText(` 전교생 평균 ${TRUE.toFixed(2)} h `, x, box.y0 + 12);
    }
    if (Number.isFinite(last)) {
      const x = hx.X(Math.min(7.2, Math.max(5.2, last)));
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(x, box.y0 + box.h + 1); ctx.lineTo(x - 5, box.y0 + box.h + 9); ctx.lineTo(x + 5, box.y0 + box.h + 9); ctx.fill();
    }
    ctx.restore();
  }

  function nums() {
    const s = L.stats(means);
    $(".v-last").textContent = Number.isFinite(last) ? last.toFixed(2) + " h" : "—";
    $(".v-mm").textContent = s.n ? s.mean.toFixed(2) + " h" : "—";
    $(".v-sd").textContent = s.n > 2 ? s.sd.toFixed(3) + " h" : "—";
    const t = $(".v-true"); t.textContent = showTrue ? TRUE.toFixed(2) + " h" : "?"; t.classList.toggle("hid", !showTrue);
    const n = +nEl.value;
    $(".f2-note").textContent = meth === "room" && n > roomPool.length
      ? `밤 10시 자습실에 남은 학생은 ${roomPool.length}명뿐이라 표본을 ${roomPool.length}명까지만 뽑을 수 있습니다.`
      : meth === "room" ? `자습실에 남은 학생 ${roomPool.length}명(회색 테두리) 가운데에서만 뽑습니다.`
      : meth === "sns" ? "모든 학생이 응답할 수 있지만, 늦게 자는 학생일수록 설문을 볼 가능성이 큽니다."
      : meth === "strat" ? "학년마다 n의 3분의 1씩 무작위로 뽑습니다." : "모든 학생이 같은 확률로 뽑힙니다.";
  }
  const redraw = () => { nums(); drawPop(); drawHist(); };
  const reset = () => { means = []; last = NaN; picked = new Set(); redraw(); };

  $(".meth").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    meth = b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); reset();
  });
  nEl.addEventListener("input", () => { $(".n-out").textContent = nEl.value; reset(); });
  $(".one").addEventListener("click", () => { draw1(); redraw(); });
  $(".many").addEventListener("click", () => { for (let k = 0; k < 100; k++) draw1(); redraw(); });
  $(".clear").addEventListener("click", reset);
  $(".truth").addEventListener("click", (e) => { showTrue = !showTrue; e.currentTarget.setAttribute("aria-pressed", String(showTrue)); redraw(); });
  nums();
  if (L.demo) {
    root.querySelector('[data-m="sns"]').click(); nEl.value = 200; $(".n-out").textContent = "200";
    for (let k = 0; k < 100; k++) draw1(); showTrue = true; $(".truth").setAttribute("aria-pressed", "true"); redraw();
  }
})();
