/* 카드: 구를 평면 z = k로 자르면 단면의 크기는 어떻게 정해질까? — 단면의 반지름 √(r² − d²), 접할 조건 */
(() => {
  const root = document.getElementById("card-geo-sphere-section");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3, { add } = S;
  const $ = (s) => root.querySelector(s), exBtns = [...root.querySelectorAll(".ex .chip")];
  const sr = $(".r"), sk = $(".k");
  let c = [1, -1, 2];
  const vw = S.view($("canvas"), () => draw(), { center: [0, 0, 0.3], span: 10, pitch: 0.36 });
  const state = () => { const r = +sr.value, k = +sk.value, d = Math.abs(k - c[2]); return { r, k, d, rho2: r * r - d * d }; };
  const EPS = 1e-9;

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const { r, k, rho2 } = state(), W = 3.6;
    vw.axes(4.4, 3.2);
    const q = vw.P(c);
    ctx.save(); ctx.fillStyle = C.leaf; ctx.globalAlpha = 0.12; ctx.beginPath(); ctx.arc(q.x, q.y, r * vw.scale(), 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(q.x, q.y, r * vw.scale(), 0, 7); ctx.stroke();
    vw.poly([[c[0] - W, c[1] - W, k], [c[0] + W, c[1] - W, k], [c[0] + W, c[1] + W, k], [c[0] - W, c[1] + W, k]], C.amber, C.ink3, 0.16);
    vw.label([c[0] + W, c[1] + W, k], `z = ${S.n(k)}`, C.ink2, 6, 0, "left", `600 11.5px ${F.mono}`);
    const O2 = [c[0], c[1], k];
    vw.line(c, O2, C.ink2, 1.4, [4, 3]);
    if (rho2 > EPS) {
      const rho = Math.sqrt(rho2), E = add(O2, [rho, 0, 0]);
      vw.poly(vw.circle(O2, [1, 0, 0], [0, 1, 0], rho), C.warn, C.warn, 0.25, 2.5);
      vw.line(O2, E, C.warn, 2); vw.line(c, E, C.ink2, 1.4);
      vw.right(O2, [0, 0, Math.sign(c[2] - k) || 1], [1, 0, 0], 0.22, C.ink2);
      vw.label(add(O2, [rho / 2, 0, 0]), "ρ", C.warn, 0, 12, "center", `italic 600 13px ${F.serif}`);
    } else if (Math.abs(rho2) <= EPS) vw.dot(O2, C.warn, 6);
    vw.dot(c, C.ink, 5); vw.label(c, "C", C.ink, -8, -6, "right");
  }

  function update() {
    const { r, k, d, rho2 } = state();
    $(".r-out").textContent = S.n(r); $(".k-out").textContent = S.n(k);
    $(".n-d").textContent = S.n(d);
    const rh = $(".n-rho"), s = $(".n-s");
    if (rho2 > EPS) { rh.textContent = S.n(Math.sqrt(rho2)); s.textContent = `${S.n(rho2)}π ≈ ${S.n(Math.PI * rho2)}`; rh.className = "n-rho"; }
    else if (Math.abs(rho2) <= EPS) { rh.textContent = "0 (접한다)"; s.textContent = "0"; rh.className = "n-rho good"; }
    else { rh.textContent = "만나지 않음"; s.textContent = "—"; rh.className = "n-rho bad"; }
    draw();
  }
  exBtns.forEach((b) => b.addEventListener("click", () => { c = b.dataset.c.split(",").map(Number); exBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [sr, sk].forEach((x) => x.addEventListener("input", update));
  update();
})();
