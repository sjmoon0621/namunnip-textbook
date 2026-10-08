/* 카드: 곱해 가는 수열의 합은 어떻게 구할까? — S와 rS를 한 칸 어긋나게 적고 빼서 S − rS = a − arⁿ */
(() => {
  const root = document.getElementById("card-alg-geo-sum");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), rBtns = [...root.querySelectorAll(".rs .chip")];
  const sa = $(".a"), sn = $(".n");
  let rp = 2, rq = 1, step = 0;
  const { ctx, size } = fit($("canvas"), () => draw());
  /* k번째 거듭제곱 항 a·r^k를 분수 문자열로 */
  const T = (k) => S.fr(+sa.value * rp ** k, rq ** k);
  const MSG = [
    "첫 줄은 <i>S</i> = <i>a</i> + <i>ar</i> + … + <i>ar</i><sup><i>n</i>−1</sup>입니다.",
    "양변에 <i>r</i>을 곱하면 모든 항이 다음 항이 됩니다. 그래서 <i>rS</i>의 항은 한 칸 오른쪽에 맞추어 적습니다.",
    "위아래로 같은 항이 겹칩니다. 두 줄을 빼면 겹친 항은 모두 지워집니다.",
    "남는 것은 위 줄의 첫 항 <i>a</i>와 아래 줄의 끝 항 <i>ar</i><sup><i>n</i></sup>뿐입니다. (1 − <i>r</i>)<i>S</i> = <i>a</i> − <i>ar</i><sup><i>n</i></sup>",
  ];

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, one = rp === rq, cols = n + 1, LW = 40, cw = (w - LW - 6) / cols;
    const bw = Math.min(cw - 6, 62), bh = Math.min(30, h * 0.17);
    const cx = (j) => LW + (j + 0.5) * cw, y1 = h * 0.18, y2 = h * 0.47, y3 = h * 0.8;
    const fs = w < 380 ? 11 : 12.5;
    ctx.textBaseline = "middle"; ctx.textAlign = "right";
    S.rich(ctx, "S", LW - 8, y1, { size: 13, weight: 700, col: C.forest, align: "right" });
    if (step >= 1) S.rich(ctx, "rS", LW - 8, y2, { size: 13, weight: 700, col: S.BLUE, align: "right" });
    const box = (j, y, txt, col, gone) => {
      ctx.globalAlpha = gone ? 0.3 : 1;
      ctx.fillStyle = C.card; ctx.fillRect(cx(j) - bw / 2, y - bh / 2, bw, bh);
      ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.strokeRect(cx(j) - bw / 2 + .5, y - bh / 2 + .5, bw - 1, bh - 1);
      ctx.font = `600 ${fs}px ${F.mono}`; ctx.fillStyle = col; ctx.textAlign = "center"; ctx.fillText(txt, cx(j), y + 1);
      if (gone) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx(j) - bw / 2, y + bh / 2); ctx.lineTo(cx(j) + bw / 2, y - bh / 2); ctx.stroke(); }
      ctx.globalAlpha = 1;
    };
    const cancel = step >= 2 && !one;
    for (let k = 0; k < n; k++) box(k, y1, T(k), C.forest, cancel && k >= 1);
    if (step >= 1) for (let k = 1; k <= n; k++) box(k, y2, T(k), S.BLUE, cancel && k <= n - 1);
    if (step >= 2) for (let k = 1; k < n; k++) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("=", cx(k), (y1 + y2) / 2); }
    if (step >= 3) {
      S.rich(ctx, "S − rS", LW - 8 + 30, y3, { size: 12.5, weight: 700, col: C.warn, align: "right" });
      if (one) S.tag(ctx, "r = 1: S − S = 0, 아무것도 알 수 없음 → S = na", cx(0) + 10, y3, C.warn, "left");
      else {
        box(0, y3, T(0), C.warn, false); box(n, y3, T(n), C.warn, false);
        ctx.fillStyle = C.warn; ctx.font = `700 15px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("−", (cx(0) + cx(n)) / 2, y3);
      }
    }
  }

  function update() {
    const a = +sa.value, n = +sn.value, one = rp === rq;
    $(".a-out").textContent = a; $(".n-out").textContent = n;
    let num = 0; for (let k = 0; k < n; k++) num += a * rp ** k * rq ** (n - 1 - k);
    $(".v-s").textContent = S.fr(num, rq ** (n - 1));
    $(".v-rn").textContent = S.fr(rp ** n, rq ** n);
    /* a(1 − rⁿ)/(1 − r) = a(qⁿ − pⁿ)·q / (qⁿ(q − p)) */
    $(".v-f").textContent = one ? `${n} × ${a} = ${n * a}` : S.fr(a * (rq ** n - rp ** n) * rq, rq ** n * (rq - rp));
    $(".msg").innerHTML = one && step >= 2 ? "<i>r</i> = 1이면 두 줄이 모두 같아 빼면 0 = 0만 남습니다. 모든 항이 <i>a</i>이므로 <i>S</i><sub><i>n</i></sub> = <i>na</i>로 바로 구합니다." : MSG[step];
    $(".go-step").disabled = step >= 3;
    draw();
  }
  $(".go-step").addEventListener("click", () => { step = Math.min(3, step + 1); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  rBtns.forEach((b) => b.addEventListener("click", () => {
    [rp, rq] = b.dataset.r.split(",").map(Number); rBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  [sa, sn].forEach((s) => s.addEventListener("input", update));
  update();
})();
