/* 카드: 지수함수의 화살표를 거꾸로 하면 함수가 될까? — aᵏ ↔ k 대응 화살표와 방향 바꾸기 */
(() => {
  const root = document.getElementById("card-alg-log-func-def");
  if (!root) return;
  const { C, F, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s);
  const dirs = [...root.querySelectorAll(".chip[data-d]")], bases = [...root.querySelectorAll(".chip.base")];
  const sx = $(".x");
  let a = 2, dir = "log";
  const KS = [-3, -2, -1, 0, 1, 2, 3];
  const { ctx, size } = fit($("canvas"), () => draw());
  const frac = (v) => (v >= 1 - 1e-9 ? E.n(v, 3) : `1/${E.n(1 / v, 3)}`);

  function arrow(x1, y1, x2, y2, col, lw) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const t = Math.atan2(y2 - y1, x2 - x1), s = 7 + lw;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(t - 0.4), y2 - s * Math.sin(t - 0.4)); ctx.lineTo(x2 - s * Math.cos(t + 0.4), y2 - s * Math.sin(t + 0.4)); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const xl = w * 0.3, xr = w * 0.7, top = 40, bot = h - 14, Yk = (k) => bot - (k + 3.6) / 7.2 * (bot - top);
    const Ylx = (x) => Yk(Math.log(x) / Math.log(a));
    ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = C.ink2;
    ctx.fillText(dir === "log" ? "정의역: 양수 x" : "치역: 양수 x", xl, 16);
    ctx.fillText(dir === "log" ? "치역: 실수 y" : "정의역: 실수 y", xr, 16);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    [xl, xr].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, top - 6); ctx.lineTo(x, bot + 6); ctx.stroke(); });
    KS.forEach((k) => {
      const y = Yk(k), x = a ** k;
      const [x1, x2] = dir === "log" ? [xl + 8, xr - 8] : [xr - 8, xl + 8];
      arrow(x1, y, x2, y, C.ink3, 1.2);
      ctx.fillStyle = C.ink; ctx.font = `12px ${F.mono}`; ctx.textBaseline = "middle";
      ctx.textAlign = "right"; ctx.fillText(frac(x), xl - 8, y);
      ctx.textAlign = "left"; ctx.fillText(E.n(k), xr + 8, y);
    });
    const x = +sx.value, yv = Math.log(x) / Math.log(a), py = Math.max(top - 10, Math.min(bot + 10, Ylx(x)));
    const [x1, x2] = dir === "log" ? [xl + 8, xr - 8] : [xr - 8, xl + 8];
    arrow(x1, py, x2, py, C.warn, 2.4);
    ctx.font = `600 12px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText(E.n(x, 2), xl - 50, py);
    ctx.textAlign = "left"; ctx.fillText(E.n(yv, 3), xr + 30, py);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(dir === "log" ? `y = log x (밑 ${a === 0.5 ? "1/2" : E.n(a)})` : `x = ${a === 0.5 ? "(1/2)" : E.n(a)}의 y제곱`, (xl + xr) / 2, 32);
  }

  function update() {
    const x = +sx.value, y = Math.log(x) / Math.log(a), A = a === 0.5 ? "1/2" : E.n(a);
    $(".x-out").textContent = E.n(x);
    $(".eq").innerHTML = dir === "log" ? `<i>y</i> = log<sub>${A}</sub> ${E.n(x)} ≈ ${E.n(y, 4)}` : `${a === 0.5 ? "(1/2)" : A}<sup>${E.n(y, 4)}</sup> ≈ ${E.n(x)}`;
    $(".n-x").textContent = E.n(x); $(".n-y").textContent = E.n(y, 4); $(".n-k").textContent = E.n(a ** y, 4);
    draw();
  }
  dirs.forEach((c) => c.addEventListener("click", () => { dir = c.dataset.d; dirs.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  bases.forEach((c) => c.addEventListener("click", () => { a = +c.dataset.a; bases.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  sx.addEventListener("input", update);
  update();
})();
