/* 카드: 2⁰은 왜 0이 아니라 1일까? — 지수를 하나씩 줄이며 a로 나누는 규칙 이어 가기 */
(() => {
  const root = document.getElementById("card-alg-exp-zero-neg");
  if (!root) return;
  const { C, F, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), TOP = 4, LOW = -3;
  const START = 1;
  let k = START;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, N = TOP - LOW + 1, x0 = 14, base = h - 30, top = 28, bw = (w - 2 * x0) / N;
    const mx = a ** TOP;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(w - x0, base); ctx.stroke();
    for (let i = 0; i < N; i++) {
      const e = TOP - i, cx = x0 + bw * (i + 0.5);
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.fillText(`${E.n(a)}${E.sup(e)}`, cx, base + 16);
      if (e < k) continue;
      const v = a ** e, bh = Math.max(1.5, v / mx * (base - top));
      ctx.fillStyle = e === k ? C.warn : e === 0 ? C.forest : C.sprout;
      ctx.fillRect(cx - bw * 0.32, base - bh, bw * 0.64, bh);
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`;
      ctx.fillText(E.n(v, v < 1 ? 4 : 2), cx, base - bh - 6);
      if (e < TOP) {
        ctx.fillStyle = C.warn; ctx.font = `600 10.5px ${F.sans}`;
        ctx.fillText(`÷${E.n(a)}`, cx - bw / 2, Math.min(base - 8, base - bh - 20));
      }
    }
  }

  function update() {
    const a = +sa.value, A = E.n(a), v = a ** k;
    $(".a-out").textContent = A;
    $(".n-k").textContent = E.n(k);
    $(".n-v").textContent = E.n(v, 4);
    $(".n-p").textContent = E.n(a ** k * a ** -k);
    let s;
    if (k > 0) s = `${A}<sup>${k}</sup> = ${Array(k).fill(A).join(" × ")} = ${E.n(v, 4)}`;
    else if (k === 0) s = `${A}<sup>0</sup> = ${A}<sup>1</sup> ÷ ${A} = 1`;
    else s = `${A}<sup>${E.n(k)}</sup> = ${A}<sup>${E.n(k + 1)}</sup> ÷ ${A} = 1/${A}<sup>${-k}</sup> = 1/${E.n(a ** -k)}`;
    $(".eq").innerHTML = s;
    $(".go-next").disabled = k <= LOW;
    draw();
  }
  $(".go-next").addEventListener("click", () => { if (k > LOW) k--; update(); });
  $(".go-reset").addEventListener("click", () => { k = START; update(); });
  sa.addEventListener("input", update);
  update();
})();
