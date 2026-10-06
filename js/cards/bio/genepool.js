/* 카드: 작은 섬의 생물 집단에서는 왜 우연이 진화를 이끌까? — 라이트–피셔 모형으로 부동·병목·창시자·선택·이주·돌연변이 비교 */
(() => {
  const root = document.getElementById("card-bio-genepool");
  if (!root) return;
  const { C, F, fit, loop, axes, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const R = 8, G = 150, BOT = [30, 35], BOTN = 4, FOUNDERS = 2;
  const MU = [0, 1e-4, 1e-3, 3e-3, 1e-2, 3e-2];
  const COL = ["#3b7c2a", "#b5532f", "#3f6fa3", "#e0a02a", "#7a4f9a", "#2a8a8a", "#a3435f", "#6b6b2a"];
  const PRE = {
    drift: { n: 20, p: 0.5, s: 0, m: 0, q: 0.2, u: 0, bot: false, fou: false },
    bottle: { n: 500, p: 0.5, s: 0, m: 0, q: 0.2, u: 0, bot: true, fou: false },
    founder: { n: 500, p: 0.5, s: 0, m: 0, q: 0.2, u: 0, bot: false, fou: true },
    select: { n: 1000, p: 0.1, s: 0.1, m: 0, q: 0.2, u: 0, bot: false, fou: false },
    flow: { n: 50, p: 0.9, s: 0, m: 0.05, q: 0.2, u: 0, bot: false, fou: false },
  };
  const nOf = (v) => { const x = 10 * Math.pow(100, v / 100); return x < 100 ? Math.round(x) : Math.round(x / 10) * 10; };
  const vOf = (n) => Math.round(Math.log(n / 10) / Math.log(100) * 100);
  const P = () => ({ n: nOf(+$(".s-n").value), p: +$(".s-p").value, s: +$(".s-s").value, m: +$(".s-m").value, q: +$(".s-q").value, u: MU[+$(".s-u").value], bot: $(".c-bot").checked, fou: $(".c-fou").checked });

  function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function binom(n, p) {
    if (p <= 0) return 0;
    if (p >= 1) return n;
    if (n <= 300) { let k = 0; for (let i = 0; i < n; i++) if (Math.random() < p) k++; return k; }
    return clamp(Math.round(n * p + Math.sqrt(n * p * (1 - p)) * gauss()), 0, n);
  }
  /* 선택 → 돌연변이 → 이주를 거친 기댓값 */
  function expect(p, o) {
    const wAA = 1 + o.s, wAa = 1 + o.s / 2, waa = 1, q = 1 - p;
    const wb = p * p * wAA + 2 * p * q * wAa + q * q * waa;
    let x = (p * p * wAA + p * q * wAa) / wb;
    x = x * (1 - o.u) + (1 - x) * o.u;
    return (1 - o.m) * x + o.m * o.q;
  }
  const sizeAt = (g, o) => (o.bot && g >= BOT[0] && g < BOT[1] ? BOTN : o.n);

  let sim = null, playing = true;
  function reset() {
    const o = P();
    const start = () => (o.fou ? binom(2 * FOUNDERS, o.p) / (2 * FOUNDERS) : o.p);
    const ref = [o.p];
    for (let g = 1; g <= G; g++) ref.push(expect(ref[g - 1], o));
    sim = { o, g: 0, acc: 0, ref, reps: Array.from({ length: R }, () => [start()]), hBefore: null, hAfter: null };
    playing = true; $(".pause").textContent = "멈춤";
  }
  function step() {
    const o = sim.o, g = sim.g + 1, N = sizeAt(g, o);
    sim.reps.forEach((r) => { const p = r[r.length - 1]; r.push(binom(2 * N, expect(p, o)) / (2 * N)); });
    sim.g = g;
    if (g === BOT[0] - 1) sim.hBefore = H();
    if (g === BOT[1] + 5) sim.hAfter = H();
  }
  const last = () => sim.reps.map((r) => r[r.length - 1]);
  const H = () => last().reduce((a, p) => a + 2 * p * (1 - p), 0) / R;

  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w || !sim) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 22, w: w - 54, h: h - 58 };
    const X = (g) => box.x0 + g / G * box.w, Y = (p) => box.y0 + box.h - p * box.h;
    if (sim.o.bot) {
      ctx.fillStyle = "rgba(181,83,47,.12)"; ctx.fillRect(X(BOT[0]), box.y0, X(BOT[1]) - X(BOT[0]), box.h);
      ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`병목 (N=${BOTN})`, X(BOT[1]) + 4, box.y0 + 12);
    }
    axes(ctx, { ...box, X, Y, xt: [0, 25, 50, 75, 100, 125, 150].map((v) => [v, String(v)]), yt: [0, 0.25, 0.5, 0.75, 1].map((v) => [v, v.toFixed(2)]), xlabel: "세대", ylabel: "대립유전자 A의 빈도 p" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0 - 2, box.y0 - 3, box.w + 4, box.h + 6); ctx.clip();
    ctx.lineWidth = 2.4; ctx.strokeStyle = C.ink; ctx.setLineDash([6, 4]); ctx.beginPath();
    sim.ref.forEach((p, g) => (g ? ctx.lineTo(X(g), Y(p)) : ctx.moveTo(X(g), Y(p)))); ctx.stroke(); ctx.setLineDash([]);
    sim.reps.forEach((r, i) => {
      ctx.strokeStyle = COL[i]; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.9; ctx.beginPath();
      r.forEach((p, g) => (g ? ctx.lineTo(X(g), Y(p)) : ctx.moveTo(X(g), Y(p)))); ctx.stroke();
      const p = r[r.length - 1];
      if (p === 0 || p === 1) { ctx.fillStyle = COL[i]; ctx.beginPath(); ctx.arc(X(r.length - 1), Y(p), 3, 0, Math.PI * 2); ctx.fill(); }
    });
    ctx.globalAlpha = 1; ctx.restore();
    const f = last();
    $(".n-g").textContent = sim.g;
    $(".n-fix").textContent = `${f.filter((p) => p === 1).length} / ${R}`;
    $(".n-los").textContent = `${f.filter((p) => p === 0).length} / ${R}`;
    $(".n-h").textContent = H().toFixed(2);
    verdict();
  }
  function verdict() {
    const v = $(".verdict"), o = sim.o, f = last();
    if (sim.g < G) { v.textContent = ""; v.className = "verdict small"; return; }
    const fix = f.filter((p) => p === 1).length, los = f.filter((p) => p === 0).length;
    let t = "", cls = "";
    if (o.fou) {
      t = `정착한 순간 이미 섬마다 처음 빈도가 달랐습니다(${sim.reps.map((r) => r[0].toFixed(2)).join(", ")}). 대륙의 p = ${o.p.toFixed(2)}와 상관없이, 창시자 몇 마리의 유전자가 섬 집단의 출발점이 됩니다.`; cls = "bad";
    } else if (o.bot && sim.hBefore != null && sim.hAfter != null) {
      t = `평균 이형 접합 비율이 병목 전 ${sim.hBefore.toFixed(2)} → 병목 뒤 ${sim.hAfter.toFixed(2)}입니다. 개체 수가 ${o.n}마리로 회복되어도 잃은 유전적 다양성은 돌아오지 않습니다.`; cls = "bad";
    } else if (o.m > 0) {
      t = `이주가 모든 집단의 빈도를 이웃 집단 값(${o.q.toFixed(2)}) 쪽으로 끌어당겨, 집단끼리 비슷해졌습니다. 유전자 흐름은 집단 사이의 차이를 줄입니다.`; cls = "good";
    } else if (o.s !== 0) {
      const win = o.s > 0 ? fix : los;
      t = win === R ? `${R}개 집단 모두에서 유리한 대립유전자가 퍼졌습니다. 선택은 방향이 있는 변화를 만듭니다.` : `유리한 대립유전자가 퍼진 집단은 ${win}개뿐입니다. 집단이 작으면(N=${o.n}) 부동이 선택을 이기기도 합니다.`;
      cls = win === R ? "good" : "bad";
    } else if (fix + los >= 2) {
      t = `선택이 없는데도 ${R}개 중 ${fix + los}개 집단에서 한 대립유전자만 남았습니다(고정 ${fix}, 소실 ${los}). 어느 쪽이 남을지는 우연이 정했습니다 — 유전적 부동입니다.`; cls = "bad";
    } else {
      t = `N=${o.n}에서는 빈도가 기댓값(점선) 근처에서 조금씩만 흔들립니다. 집단이 클수록 부동이 약합니다.`; cls = "good";
    }
    v.textContent = t; v.className = "verdict small " + cls;
  }
  function outs() {
    const o = P();
    $(".o-n").textContent = o.n; $(".o-p").textContent = o.p.toFixed(2); $(".o-s").textContent = o.s.toFixed(2);
    $(".o-m").textContent = o.m.toFixed(3); $(".o-q").textContent = o.q.toFixed(2); $(".o-u").textContent = o.u ? o.u.toExponential(0).replace("e-", "×10⁻").replace(/⁻(\d)/, (m, d) => "⁻" + "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]) : "0";
  }
  function apply(k) {
    const o = PRE[k];
    $(".s-n").value = vOf(o.n); $(".s-p").value = o.p; $(".s-s").value = o.s; $(".s-m").value = o.m; $(".s-q").value = o.q; $(".s-u").value = MU.indexOf(o.u);
    $(".c-bot").checked = o.bot; $(".c-fou").checked = o.fou;
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === k)));
    outs(); reset(); draw();
  }
  root.querySelectorAll("input").forEach((el) => el.addEventListener("input", () => {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", "false"));
    outs(); reset(); draw();
  }));
  $(".pre").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (b) apply(b.dataset.p); });
  $(".run").addEventListener("click", () => { reset(); draw(); });
  $(".pause").addEventListener("click", () => {
    if (sim.g >= G) { reset(); draw(); return; }
    playing = !playing; $(".pause").textContent = playing ? "멈춤" : "계속";
  });
  loop($("canvas"), (dt) => {
    if (!sim || !playing || sim.g >= G) return;
    sim.acc += dt * 40;
    while (sim.acc >= 1 && sim.g < G) { step(); sim.acc -= 1; }
    draw();
  });
  apply("drift");
  if (/[?&]demo\b/.test(location.search)) { while (sim.g < G) step(); draw(); }
})();
