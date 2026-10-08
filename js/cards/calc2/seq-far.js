/* 카드: 처음 몇 항만 보고 수렴·발산을 판정해도 될까? — 예상을 먼저 고르고, 보는 범위를 n ≤ 10^k로 넓혀 가며 확인 */
(() => {
  const root = document.getElementById("card-calc2-seq-far");
  if (!root) return;
  const { C, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sk = $(".k");
  const SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶"];
  const NAME = { conv: "수렴", pinf: "양의 무한대로 발산", ninf: "음의 무한대로 발산", osc: "진동" };
  const P = {
    hump: { f: (m) => 100 * m / (m * m + 100), ans: "conv", why: "극한값 0" },
    log: { f: (m) => Math.log10(m), ans: "pinf", why: "느리지만 끝없이 커짐" },
    alt: { f: (m) => (-1) ** m * m / (m + 1), ans: "osc", why: "−1과 1 근처를 오감" },
    lin: { f: (m) => 5 - m / 10, ans: "ninf", why: "끝없이 작아짐" },
  };
  let key = "hump", guess = null, shown = false;
  const { ctx, size } = fit($("canvas"), () => draw());

  function samples(k) {
    const out = [], seen = new Set();
    for (let i = 0; i <= 240; i++) {
      const m = Math.round(Math.pow(10, k * i / 240));
      for (const j of [m, m + 1]) if (!seen.has(j) && j <= Math.pow(10, k) + 1) { seen.add(j); out.push(j); }
    }
    return out;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const k = +sk.value, f = P[key].f, ms = samples(k), vs = ms.map(f);
    let lo = Math.min(0, ...vs), hi = Math.max(0, ...vs);
    const pad = (hi - lo) * 0.08 || 1; lo -= pad; hi += pad;
    const xt = []; for (let i = 0; i <= k; i++) xt.push(i);
    const g = S.frame(ctx, w, h, {
      xr: [-0.05 * k, k * 1.03], yr: [lo, hi], xt, yt: S.ticks(lo, hi, 4),
      xf: (v) => (v === 0 ? "1" : v === 1 ? "10" : "10" + SUP[v]), L: 48, B: 34, xlab: "n (눈금은 10배씩)",
    });
    ms.forEach((m, i) => S.dot(ctx, g, Math.log10(m), vs[i], m <= 10 ? C.ink : C.forest, m <= 10 ? 3.4 : 2.2));
  }

  function update() {
    const k = +sk.value, N = Math.pow(10, k), f = P[key].f;
    $(".k-out").textContent = k === 0 ? "1" : "10" + SUP[k];
    $(".n-a").textContent = n(f(N), 6); $(".n-b").textContent = n(f(N + 1), 6);
    $(".d-a").textContent = `a(${N})`; $(".d-b").textContent = `a(${N + 1})`;
    const dg = $(".n-g"), dj = $(".n-j");
    dg.textContent = guess ? NAME[guess] : "아직 고르지 않음";
    if (shown) {
      const ok = guess === P[key].ans;
      dj.textContent = `${NAME[P[key].ans]} (${P[key].why})`;
      dj.className = `n-j ${guess ? (ok ? "good" : "bad") : ""}`;
    } else { dj.textContent = "—"; dj.className = "n-j"; }
    root.querySelectorAll(".guess .chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.g === guess)));
    draw();
  }
  S.chips(root, ".presets .chip", (b) => { key = b.dataset.k; guess = null; shown = false; sk.value = "1"; update(); });
  root.querySelectorAll(".guess .chip").forEach((b) => b.addEventListener("click", () => { guess = b.dataset.g; update(); }));
  $(".go-reveal").addEventListener("click", () => { shown = true; update(); });
  sk.addEventListener("input", update);
  update();
})();
