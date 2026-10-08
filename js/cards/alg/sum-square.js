/* 카드: 1² + 2² + … + n²은 어떻게 구할까? — (k+1)³ − k³ = 3k² + 3k + 1을 n줄 적고 더하면 세제곱이 지워진다 */
(() => {
  const root = document.getElementById("card-alg-sum-square");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), sn = $(".n");
  let step = 0;
  const { ctx, size } = fit($("canvas"), () => draw());
  const MSG = [
    "<i>k</i> = 1부터 <i>n</i>까지 항등식 (<i>k</i>+1)<sup>3</sup> − <i>k</i><sup>3</sup> = 3<i>k</i><sup>2</sup> + 3<i>k</i> + 1을 한 줄씩 적었습니다.",
    "위 줄 왼쪽의 (<i>k</i>+1)<sup>3</sup>과 아래 줄의 <i>k</i><sup>3</sup>은 같은 수입니다. 모든 줄을 더하면 하나는 +, 하나는 −라서 지워집니다.",
    "왼쪽에는 맨 아래의 (<i>n</i>+1)<sup>3</sup>과 맨 위의 1<sup>3</sup>만 남습니다. 오른쪽은 열마다 모아 3∑<i>k</i><sup>2</sup> + 3∑<i>k</i> + <i>n</i>입니다.",
    "∑<i>k</i> = <i>n</i>(<i>n</i>+1)/2를 넣고 ∑<i>k</i><sup>2</sup>에 대해 풀면 <i>n</i>(<i>n</i>+1)(2<i>n</i>+1)/6입니다.",
  ];

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, rows = n + 2, rh = Math.min(34, h / (rows + 0.6)), fs = w < 380 ? 12 : 13.5;
    const xA = w * 0.13, xM = w * 0.22, xB = w * 0.31, xE = w * 0.4, xR = w * 0.47;
    const y = (i) => rh * (i + 0.9);
    const o = (col, wt = 600) => ({ size: fs, family: F.mono, weight: wt, col, align: "center" });
    for (let k = 1; k <= n; k++) {
      const yy = y(k - 1), cutA = step >= 1 && k < n, cutB = step >= 1 && k > 1;
      S.rich(ctx, `${k + 1}^3`, xA, yy, o(cutA ? C.ink3 : C.ink));
      S.rich(ctx, "−", xM, yy, o(C.ink2, 400));
      S.rich(ctx, `${k}^3`, xB, yy, o(cutB ? C.ink3 : C.ink));
      S.rich(ctx, "=", xE, yy, o(C.ink2, 400));
      S.rich(ctx, `3·${k}^2 + 3·${k} + 1`, xR, yy, { ...o(C.forest), align: "left" });
      if (step >= 1 && k < n) {
        ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]); ctx.beginPath();
        ctx.moveTo(xA + 12, yy + 7); ctx.lineTo(xB - 12, y(k) - 7); ctx.stroke(); ctx.setLineDash([]);
        [[xA, yy], [xB, y(k)]].forEach(([x, Y]) => { ctx.beginPath(); ctx.moveTo(x - 14, Y + 5); ctx.lineTo(x + 14, Y - 5); ctx.stroke(); });
      }
    }
    if (step >= 2) {
      const yy = y(n) + 4;
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8, yy - rh / 2); ctx.lineTo(w - 8, yy - rh / 2); ctx.stroke();
      S.rich(ctx, `${n + 1}^3`, xA, yy, o(C.warn, 700)); S.rich(ctx, "−", xM, yy, o(C.warn, 400)); S.rich(ctx, "1^3", xB, yy, o(C.warn, 700));
      S.rich(ctx, "=", xE, yy, o(C.ink2, 400));
      S.rich(ctx, `3∑k^2 + 3∑k + ${n}`, xR, yy, { ...o(C.warn, 700), align: "left" });
    }
    if (step >= 3) {
      const s2 = n * (n + 1) * (2 * n + 1) / 6;
      S.tag(ctx, `3∑k^2 = ${(n + 1) ** 3 - 1} − ${3 * n * (n + 1) / 2} − ${n} = ${3 * s2},  ∑k^2 = ${s2}`, w / 2, y(n + 1) + 4, C.warn, "center", fs - 1);
    }
  }

  function update() {
    const n = +sn.value;
    let s = 0; for (let k = 1; k <= n; k++) s += k * k;
    $(".n-out").textContent = n; $(".msg").innerHTML = MSG[step];
    $(".v-s").textContent = s; $(".v-f").textContent = n * (n + 1) * (2 * n + 1) / 6; $(".v-c").textContent = (n + 1) ** 3 - 1;
    $(".go-step").disabled = step >= 3;
    draw();
  }
  $(".go-step").addEventListener("click", () => { step = Math.min(3, step + 1); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  sn.addEventListener("input", update);
  update();
})();
