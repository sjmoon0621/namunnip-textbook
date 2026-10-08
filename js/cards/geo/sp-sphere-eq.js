/* 카드: 중심과 반지름을 알면 구를 식 하나로 쓸 수 있을까? — 구의 방정식(표준형·전개형)과 점 Q의 위치 */
(() => {
  const root = document.getElementById("card-geo-sphere-eq");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sa = $(".a"), sb = $(".b"), sc = $(".c"), sr = $(".r");
  let Q = [3, 2, 2];
  const vw = S.view($("canvas"), () => draw(), { center: [0.5, 0, 0.6], span: 9, pitch: 0.38 });
  const fmt = (p) => `(${p.map((x) => S.n(x)).join(", ")})`;
  const V = ["x", "y", "z"];
  const sq = (v, a) => (a === 0 ? `<i>${v}</i><sup>2</sup>` : `(<i>${v}</i> ${a > 0 ? "−" : "+"} ${S.n(Math.abs(a))})<sup>2</sup>`);
  const term = (k, v) => (k === 0 ? "" : ` ${k > 0 ? "+" : "−"} ${Math.abs(k) === 1 ? "" : S.n(Math.abs(k))}<i>${v}</i>`);

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const c = [+sa.value, +sb.value, +sc.value], r = +sr.value;
    vw.axes(3.8, 3);
    const p = vw.P(c);
    ctx.save(); ctx.fillStyle = C.leaf; ctx.globalAlpha = 0.14; ctx.beginPath(); ctx.arc(p.x, p.y, r * vw.scale(), 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, r * vw.scale(), 0, 7); ctx.stroke();
    vw.path(vw.circle(c, [1, 0, 0], [0, 1, 0], r), C.forest, 1, [4, 3]);
    vw.path(vw.circle(c, [1, 0, 0], [0, 0, 1], r), C.forest, 1, [4, 3]);
    vw.line(c, Q, C.warn, 2);
    vw.dot(c, C.ink, 5); vw.label(c, `C${fmt(c)}`, C.ink, -8, 12, "right", `600 11.5px ${F.mono}`);
    vw.dot(Q, C.warn, 6); vw.label(Q, `Q${fmt(Q)}`, C.warn, 8, -8, "left", `600 11.5px ${F.mono}`);
  }

  function update() {
    const c = [+sa.value, +sb.value, +sc.value], r = +sr.value;
    $(".a-out").textContent = S.n(c[0]); $(".b-out").textContent = S.n(c[1]); $(".c-out").textContent = S.n(c[2]); $(".r-out").textContent = S.n(r);
    const k = c[0] ** 2 + c[1] ** 2 + c[2] ** 2 - r * r;
    $(".eq").innerHTML = `${V.map((v, i) => sq(v, c[i])).join(" + ")} = ${S.n(r * r)}<br><i>x</i><sup>2</sup> + <i>y</i><sup>2</sup> + <i>z</i><sup>2</sup>${V.map((v, i) => term(-2 * c[i], v)).join("")}${k === 0 ? "" : ` ${k > 0 ? "+" : "−"} ${S.n(Math.abs(k))}`} = 0`;
    const d2 = Q.reduce((s, q, i) => s + (q - c[i]) ** 2, 0), d = Math.sqrt(d2);
    $(".n-d").textContent = Math.abs(d - Math.round(d)) < 1e-9 ? `${Math.round(d)}` : `√${S.n(d2)} ≈ ${S.n(d)}`;
    $(".n-r").textContent = S.n(r);
    const w = $(".n-w"), on = Math.abs(d2 - r * r) < 1e-9;
    w.textContent = on ? "구 위" : d2 < r * r ? "구의 안쪽" : "구의 바깥쪽"; w.className = `n-w ${on ? "good" : ""}`;
    draw();
  }
  btns.forEach((b) => b.addEventListener("click", () => { Q = b.dataset.q.split(",").map(Number); btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [sa, sb, sc, sr].forEach((x) => x.addEventListener("input", update));
  update();
})();
