/* 카드: 같은 수씩 커지는 수열의 100번째 항은? — 첫째항·둘째항 점을 끌어 등차수열을 만들고 계단·직선·등차중항을 본다 */
(() => {
  const root = document.getElementById("card-alg-arith-term");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  const sa = $(".a"), sd = $(".d"), sk = $(".k");
  const N = 8, R = { x0: 0.4, x1: 8.6, y0: -21, y1: 21 };
  let G = null, drag = 0;
  const { ctx, size } = fit(cv, () => draw());
  const term = (k) => +sa.value + (k - 1) * +sd.value;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, d = +sd.value, k = +sk.value;
    const box = { x: 34, y: 10, w: w - 44, h: h - 32 };
    G = S.frame(ctx, box, R, { xt: Array.from({ length: N }, (_, i) => [i + 1, String(i + 1)]), yt: [-20, -10, 0, 10, 20].map((v) => [v, S.n(v)]) });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath();
    ctx.moveTo(G.X(R.x0), G.Y(a + (R.x0 - 1) * d)); ctx.lineTo(G.X(R.x1), G.Y(a + (R.x1 - 1) * d)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 2;
    for (let i = 1; i < N; i++) {
      ctx.beginPath(); ctx.moveTo(G.X(i), G.Y(term(i))); ctx.lineTo(G.X(i + 1), G.Y(term(i))); ctx.lineTo(G.X(i + 1), G.Y(term(i + 1))); ctx.stroke();
    }
    /* 등차중항: 양옆 두 점을 잇는 선분의 가운데 */
    const l = term(k - 1), r = term(k + 1);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(G.X(k - 1), G.Y(l)); ctx.lineTo(G.X(k + 1), G.Y(r)); ctx.stroke();
    for (let i = 1; i <= N; i++) {
      const col = i === 1 ? C.warn : i === 2 ? S.BLUE : C.forest;
      S.dot(ctx, G.X(i), G.Y(term(i)), i <= 2 ? (drag === i ? 8 : 6.5) : 4.5, col, i === k);
    }
    ctx.restore();
    if (d !== 0) S.tag(ctx, `+${S.n(d)}`.replace("+−", "−"), G.X(2) + 12, G.Y((term(1) + term(2)) / 2) + 8, C.forest);
    const up = d >= 0;
    S.tag(ctx, `a_${k} = (a_${k - 1} + a_${k + 1})/2`, G.X(k) + (up ? -8 : 8), G.Y(term(k)) + (up ? -16 : -16), C.warn, up ? "right" : "left", 11);
  }

  function update() {
    const a = +sa.value, d = +sd.value, k = +sk.value;
    $(".a-out").textContent = S.n(a); $(".d-out").textContent = S.n(d); $(".k-out").textContent = k;
    const it = (s) => s.replace(/n/g, "<i>n</i>");
    $(".gen").innerHTML = `<i>a</i><sub><i>n</i></sub> = ${S.n(a)} + (<i>n</i> − 1) × ${d < 0 ? `(${S.n(d)})` : S.n(d)} = ${it(S.lin(d, a - d))}`;
    $(".v-8").textContent = S.n(term(8)); $(".v-100").textContent = S.n(a + 99 * d);
    $(".d-mid").innerHTML = `(<i>a</i><sub>${k - 1}</sub> + <i>a</i><sub>${k + 1}</sub>)/2`;
    $(".v-mid").innerHTML = `${S.n((term(k - 1) + term(k + 1)) / 2)} = <i>a</i><sub>${k}</sub>`;
    draw();
  }
  const pick = (e) => {
    const [px, py] = S.local(cv, e);
    for (const i of [1, 2]) if (Math.hypot(px - G.X(i), py - G.Y(term(i))) < 22) return i;
    for (const i of [1, 2]) if (Math.abs(px - G.X(i)) < 16) return i;
    return 0;
  };
  const move = (e) => {
    const y = G.inY(S.local(cv, e)[1]);
    if (drag === 1) { const a2 = term(2); sa.value = clamp(Math.round(y), -6, 6); sd.value = clamp(Math.round((a2 - +sa.value) * 2) / 2, -2, 2); }
    else sd.value = clamp(Math.round((y - +sa.value) * 2) / 2, -2, 2);
    update();
  };
  cv.addEventListener("pointerdown", (e) => { if (!G) return; drag = pick(e); if (!drag) return; cv.setPointerCapture(e.pointerId); move(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) move(e); });
  const end = () => { if (drag) { drag = 0; draw(); } };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  [sa, sd, sk].forEach((s) => s.addEventListener("input", update));
  update();
})();
