/* 카드: 신뢰도 95%의 신뢰구간은 무엇을 95% 믿는 것일까? — N(300, 20²) 모집단에서 신뢰구간 x̄ ± kσ/√n을 반복해 만들고 m을 포함한 비율 세기 */
(() => {
  const root = document.getElementById("card-stat-ci-mean");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sn = $(".n"), chips = [...root.querySelectorAll(".presets .chip")];
  const M = 300, SG = 20, LO = 240, HI = 360, SHOW = 40; // g
  let k = 1.96, r = S.rng(23), xb = [];
  const { ctx, size } = fit($("canvas"), () => draw());
  const half = () => k * SG / Math.sqrt(+sn.value);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 14, y0 = 24, gw = w - 28, gh = h - y0 - 26;
    const X = (v) => x0 + (v - LO) / (HI - LO) * gw;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y: (v) => v, xt: [240, 260, 280, 300, 320, 340, 360].map((v) => [v, String(v)]) });
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.8; ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(X(M), y0 - 4); ctx.lineTo(X(M), y0 + gh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText("m = 300", X(M), y0 - 8);
    const e = half(), list = xb.slice(-SHOW), rh = gh / SHOW;
    list.forEach((v, i) => {
      const y = y0 + (i + 0.5) * rh, miss = Math.abs(v - M) > e;
      ctx.strokeStyle = miss ? C.warn : C.ink2; ctx.lineWidth = Math.max(1.5, Math.min(3, rh * 0.5));
      ctx.beginPath(); ctx.moveTo(X(Math.max(LO, v - e)), y); ctx.lineTo(X(Math.min(HI, v + e)), y); ctx.stroke();
      ctx.fillStyle = miss ? C.warn : C.ink; ctx.beginPath(); ctx.arc(X(v), y, Math.max(1.8, Math.min(3, rh * 0.4)), 0, 7); ctx.fill();
    });
  }

  function update() {
    const c = xb.length, e = half(), hit = xb.filter((v) => Math.abs(v - M) <= e).length;
    $(".n-out").textContent = sn.value;
    $(".n-c").textContent = c;
    $(".n-r").textContent = c ? `${S.fmt(100 * hit / c, 1)}%` : "—";
    $(".n-l").textContent = `${S.fmt(2 * e, 2)} g`;
    $(".n-x").textContent = c ? `${S.fmt(xb[c - 1], 1)} g` : "—";
    draw();
  }
  const run = (cnt) => {
    const n = +sn.value;
    for (let j = 0; j < cnt; j++) { let s = 0; for (let i = 0; i < n; i++) s += M + SG * S.gauss(r); xb.push(s / n); }
    update();
  };
  chips.forEach((b) => b.addEventListener("click", () => {
    k = +b.dataset.k; xb = [];
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    run(SHOW);
  }));
  $(".go-one").addEventListener("click", () => run(1));
  $(".go-20").addEventListener("click", () => run(20));
  $(".go-reset").addEventListener("click", () => { xb = []; update(); });
  sn.addEventListener("input", () => { xb = []; run(SHOW); });
  run(SHOW);
})();
