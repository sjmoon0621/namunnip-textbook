/* 카드: 진폭과 주기는 식의 어디에 숨어 있을까? — y = a sin(bx) + d의 계수를 바꾸며 최댓값·최솟값·주기를 읽는다 */
(() => {
  const root = document.getElementById("card-alg-sin-param");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s), fchips = [...root.querySelectorAll(".presets .chip")];
  const sa = $(".a"), sb = $(".b"), sd = $(".dd");
  const PI = Math.PI, M = "−";
  const n = (v) => { const r = Math.round(v * 100) / 100; return r === 0 ? "0" : (r < 0 ? M : "") + Math.abs(r); };
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  const piOver = (b) => { let p = 4, q = Math.round(2 * Math.abs(b)); const g = gcd(p, q); p /= g; q /= g; return `${p === 1 ? "" : p}π${q === 1 ? "" : "/" + q}`; };
  let fn = "sin";
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, b = +sb.value, d = +sd.value, g = fn === "sin" ? Math.sin : Math.cos;
    const x0 = 30, y0 = 8, gw = w - x0 - 8, gh = h - y0 - 22, X0 = 0, X1 = 4 * PI, Y0 = -5, Y1 = 5;
    const X = (x) => x0 + (x - X0) / (X1 - X0) * gw, Y = (y) => y0 + (Y1 - y) / (Y1 - Y0) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [[0, "0"], [PI, "π"], [2 * PI, "2π"], [3 * PI, "3π"], [4 * PI, "4π"]], yt: [-4, -2, 0, 2, 4].map((v) => [v, n(v)]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.stroke();
    const plot = (f, col, lw, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath();
      for (let i = 0; i <= 600; i++) { const x = X0 + (X1 - X0) * i / 600, px = X(x), py = Y(f(x)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    plot((x) => g(x), C.ink3, 1.5, [4, 4]);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.beginPath();
    [d + Math.abs(a), d - Math.abs(a)].forEach((v) => { ctx.moveTo(x0, Y(v)); ctx.lineTo(x0 + gw, Y(v)); });
    ctx.stroke(); ctx.setLineDash([]);
    plot((x) => a * g(b * x) + d, C.forest, 3);
    const p = 2 * PI / Math.abs(b), sx = 0, yb = y0 + gh - 4;
    if (p <= X1) {
      ctx.strokeStyle = C.warn; ctx.fillStyle = C.warn; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(sx), yb); ctx.lineTo(X(sx + p), yb); ctx.stroke();
      [sx, sx + p].forEach((v) => { ctx.beginPath(); ctx.moveTo(X(v), yb - 5); ctx.lineTo(X(v), yb + 3); ctx.stroke(); });
      ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillStyle = C.card; const lab = `한 주기 ${piOver(b)}`, tw = ctx.measureText(lab).width;
      ctx.fillRect(X(sx + p / 2) - tw / 2 - 3, yb - 19, tw + 6, 15);
      ctx.fillStyle = C.warn; ctx.fillText(lab, X(sx + p / 2), yb - 5);
    }
  }

  function update() {
    const a = +sa.value, b = +sb.value, d = +sd.value;
    $(".a-out").textContent = n(a); $(".b-out").textContent = n(b); $(".dd-out").textContent = n(d);
    const bx = b === 1 ? "x" : `${n(b)}x`, head = a === 1 ? "" : a === -1 ? M : n(a) + " ";
    $(".eq").textContent = `y = ${head}${fn}${b === 1 ? " " : "("}${bx}${b === 1 ? "" : ")"}${d === 0 ? "" : d > 0 ? ` + ${n(d)}` : ` ${M} ${n(-d)}`}`;
    $(".n-max").textContent = n(d + Math.abs(a)); $(".n-min").textContent = n(d - Math.abs(a)); $(".n-p").textContent = piOver(b);
    fchips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.f === fn)));
    draw();
  }
  [sa, sb, sd].forEach((s) => s.addEventListener("input", update));
  fchips.forEach((c) => c.addEventListener("click", () => { fn = c.dataset.f; update(); }));
  update();
})();
