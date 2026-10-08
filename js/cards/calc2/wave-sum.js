/* 카드: a sin x + b cos x는 어떤 모양의 그래프일까? — 삼각함수의 합성 r sin(x + φ), r = √(a² + b²) */
(() => {
  const root = document.getElementById("card-calc2-wave-sum");
  if (!root) return;
  const { C, F, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sb = $(".sb");
  const PI = Math.PI, DEG = 180 / PI;
  let a = 1, b = 1, g = null;
  const piLab = (v) => { const k = Math.round(v / (PI / 2)); return ["0", "π/2", "π", "3π/2", "2π"][k] ?? ""; };
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const inset = Math.min(96, w * 0.22);
    g = K.frame(ctx, w - inset - 8, h, { xr: [0, 2 * PI], yr: [-6, 6], xs: PI / 2, ys: 2, xf: piLab });
    K.curve(ctx, g, (x) => a * Math.sin(x), C.ink3, { width: 1.5, dash: [5, 4] });
    K.curve(ctx, g, (x) => b * Math.cos(x), C.amber, { width: 1.5, dash: [5, 4] });
    K.curve(ctx, g, (x) => a * Math.sin(x) + b * Math.cos(x), C.forest, { width: 2.6 });
    const r = Math.hypot(a, b), phi = Math.atan2(b, a);
    if (r > 1e-9) {
      let xm = PI / 2 - phi; xm = ((xm % (2 * PI)) + 2 * PI) % (2 * PI);
      K.guide(ctx, g, xm, r, C.warn, "x");
      K.dot(ctx, g, xm, r, C.warn);
      K.tag(ctx, g, `최댓값 ${n(r, 3)}`, g.X(xm) + (xm > 4.5 ? -10 : 10), g.Y(r) - 4, C.warn, xm > 4.5 ? "right" : "left");
    }
    const cx = w - inset / 2 - 2, cy = 14 + inset / 2, R0 = inset / 2 - 6, sc = R0 / 5;
    ctx.save();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(cx - inset / 2 + 2, cy - inset / 2, inset - 4, inset);
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(cx - R0, cy); ctx.lineTo(cx + R0, cy); ctx.moveTo(cx, cy - R0); ctx.lineTo(cx, cy + R0); ctx.stroke();
    ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(cx, cy, r * sc, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    const px = cx + a * sc, py = cy - b * sc;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    if (r > 1e-9) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 12, Math.min(0, -phi), Math.max(0, -phi)); ctx.stroke(); }
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(px, py, 3.5, 0, 7); ctx.fill();
    ctx.font = `600 10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("점 (a, b)", cx, cy + inset / 2 + 14);
    ctx.restore();
  }

  function update() {
    $(".a-out").textContent = n(a, 3); $(".b-out").textContent = n(b, 3);
    const r = Math.hypot(a, b), phi = Math.atan2(b, a) * DEG;
    let mx = -Infinity; for (let i = 0; i <= 3600; i++) { const x = i / 3600 * 2 * PI; mx = Math.max(mx, a * Math.sin(x) + b * Math.cos(x)); }
    $(".n-r").textContent = n(r, 4); $(".n-p").textContent = r > 1e-9 ? n(phi, 2) + "°" : "—";
    $(".n-max").textContent = n(mx, 4); $(".n-ab").textContent = n(a + b, 4);
    const sg = (v) => (v < 0 ? "− " : "+ ") + n(Math.abs(v), 3);
    $(".eq").innerHTML = r > 1e-9
      ? `${n(a, 3)} sin <i>x</i> ${sg(b)} cos <i>x</i> = ${n(r, 4)} sin(<i>x</i> ${sg(phi)}°)`
      : "<i>a</i> = <i>b</i> = 0이면 합은 0입니다.";
    draw();
  }

  K.chips(root, ".presets .chip", (bt) => {
    a = +bt.dataset.a; b = bt.dataset.b === "s3" ? Math.sqrt(3) : +bt.dataset.b;
    sa.value = a; sb.value = b; update();
  });
  const clear = () => root.querySelectorAll(".presets .chip").forEach((x) => x.setAttribute("aria-pressed", "false"));
  sa.addEventListener("input", () => { a = +sa.value; clear(); update(); });
  sb.addEventListener("input", () => { b = +sb.value; clear(); update(); });
  update();
})();
