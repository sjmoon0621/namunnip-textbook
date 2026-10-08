/* 카드: 끝없이 튀는 공은 모두 얼마나 움직일까? — 떨어뜨린 높이 h, 튀어 오르는 비율 r을 바꾸며 이동 거리의 부분합과 등비급수의 합 비교 (모식) */
(() => {
  const root = document.getElementById("card-calc2-bounce");
  if (!root) return;
  const { C, fit } = NM;
  const S = NMSeq, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sh = $(".h"), sr = $(".r"), sk = $(".kk"), KMAX = 20;
  const getR = () => Math.round(+sr.value * 100) / 100;
  const dist = (h, r, k) => h + 2 * h * r * (1 - r ** k) / (1 - r);   // m, 처음 낙하 h + 튈 때마다 오르내림 2·h·rⁱ (i = 1…k)
  const total = (h, r) => h * (1 + r) / (1 - r);                        // m
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    const H = +sh.value, r = getR(), k = +sk.value;
    const widths = [Math.sqrt(H)];
    for (let i = 1; i <= KMAX + 40; i++) widths.push(2 * Math.sqrt(H * r ** i));
    const span = widths.reduce((s, v) => s + v, 0);
    const g = S.frame(ctx, w, h, { xr: [-0.02 * span, span * 1.02], yr: [0, 10.8], yt: [0, 2, 4, 6, 8, 10], L: 30, B: 14, T: 22, ylab: "높이 (m)" });
    const arc = (x0, x1, top, half, col, lw) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      for (let j = 0; j <= 40; j++) {
        const t = j / 40, x = x0 + (x1 - x0) * t;
        const u = half ? t : 2 * t - 1;            // 포물선: 꼭대기에서 u = 0
        ctx.lineTo(g.X(x), g.Y(top * (1 - u * u)));
      }
      ctx.stroke();
    };
    let x = 0;
    arc(0, widths[0], H, true, C.forest, 2.4); x = widths[0];
    for (let i = 1; i <= KMAX + 40; i++) {
      const on = i <= k;
      arc(x, x + widths[i], H * r ** i, false, on ? C.forest : C.rule, on ? 2.4 : 1.2);
      x += widths[i];
    }
    let bx = widths[0]; for (let i = 1; i <= k; i++) bx += widths[i];
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(g.X(bx), g.Y(0) - 6, 6, 0, 7); ctx.fill();
  }

  function update() {
    const H = +sh.value, r = getR(), k = +sk.value;
    $(".h-out").textContent = String(H); $(".r-out").textContent = n(r); $(".kk-out").textContent = String(k);
    $(".n-d").textContent = `${n(dist(H, r, k), 4)} m`;
    $(".n-t").textContent = `${n(total(H, r), 4)} m`;
    $(".n-g").textContent = `${n(total(H, r) - dist(H, r, k), 4)} m`;
    $(".go-bounce").disabled = k >= KMAX;
    draw();
  }
  $(".go-bounce").addEventListener("click", () => { sk.value = String(Math.min(KMAX, +sk.value + 1)); update(); });
  $(".go-reset").addEventListener("click", () => { sk.value = "0"; update(); });
  [sh, sr, sk].forEach((s) => s.addEventListener("input", update));
  update();
})();
