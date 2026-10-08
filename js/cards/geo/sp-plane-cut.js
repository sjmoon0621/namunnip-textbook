/* 카드: 평행한 두 평면을 한 평면으로 자르면 교선은 어떻게 놓일까? — α(z=0), 기울일 수 있는 β, 세로 평면 γ의 교선 */
(() => {
  const root = document.getElementById("card-geo-plane-cut");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3, { add, mul, rad } = S;
  const $ = (s) => root.querySelector(s);
  const st = $(".t"), sp = $(".p");
  const H = 1.2, A = 2.6;           // β의 높이(x = 0에서), 평면 조각의 반너비
  const vw = S.view($("canvas"), () => draw(), { center: [0, 0, 1.1], span: 7.4, yaw: -0.55, pitch: 0.32 });
  const state = () => {
    const T = Math.tan(rad(+st.value)), ps = rad(+sp.value), u = [Math.cos(ps), Math.sin(ps), 0];
    const slope = T * u[0];            // l₂의 기울기: z = H + slope·s
    const par = Math.abs(slope) < 1e-9;
    return { T, u, slope, par, s: par ? null : -H / slope };
  };
  const zb = (x, T) => H + T * x;

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const { T, u, slope, par, s } = state();
    vw.poly([[-A, -A, 0], [A, -A, 0], [A, A, 0], [-A, A, 0]], C.leaf, C.ink3, 0.14);
    vw.poly([[-A, -A, zb(-A, T)], [A, -A, zb(A, T)], [A, A, zb(A, T)], [-A, A, zb(-A, T)]], C.amber, C.ink3, 0.14);
    vw.label([A, A, 0], "α", C.ink2, -6, 10, "right", `italic 600 14px ${F.serif}`);
    vw.label([A, A, zb(A, T)], "β", C.ink2, -6, -10, "right", `italic 600 14px ${F.serif}`);
    const G = 2.9;
    vw.poly([add(mul(u, -G), [0, 0, -0.9]), add(mul(u, G), [0, 0, -0.9]), add(mul(u, G), [0, 0, 3.4]), add(mul(u, -G), [0, 0, 3.4])], C.ink3, C.ink3, 0.1);
    vw.label(add(mul(u, G), [0, 0, 3.4]), "γ", C.ink2, 6, 4, "left", `italic 600 14px ${F.serif}`);
    if (Math.abs(T) > 1e-9) {                  // α∩β: x = −H/T
      const x0 = -H / T;
      if (Math.abs(x0) <= A) vw.line([x0, -A, 0], [x0, A, 0], C.ink, 2.2, [6, 4]);
    }
    const L = (k) => [mul(u, -k), mul(u, k)];
    const [p1, q1] = L(G);
    vw.line(p1, q1, C.forest, 3);
    vw.line(add(mul(u, -G), [0, 0, H - slope * G]), add(mul(u, G), [0, 0, H + slope * G]), C.warn, 3);
    vw.label(q1, "l₁", C.forest, 8, 6, "left", `italic 600 13px ${F.serif}`);
    vw.label(add(mul(u, G), [0, 0, H + slope * G]), "l₂", C.warn, 8, -6, "left", `italic 600 13px ${F.serif}`);
    if (!par && Math.abs(s) <= G) vw.dot(mul(u, s), C.ink, 6);
  }

  function update() {
    $(".t-out").textContent = `${S.n(+st.value)}°`; $(".p-out").textContent = `${sp.value}°`;
    const { u, slope, par, s } = state();
    const ab = $(".n-ab"), l = $(".n-l");
    ab.textContent = +st.value === 0 ? "평행" : "만남 (교선)";
    l.textContent = par ? "평행" : `한 점에서 만남${Math.abs(s) > 2.9 ? " (그림 밖)" : ""}`;
    l.className = `n-l ${par ? "good" : "bad"}`;
    $(".n-ang").textContent = par ? "0°" : `${S.n(S.lineAngle(u, [u[0], u[1], slope]), 1)}°`;
    draw();
  }
  [st, sp].forEach((x) => x.addEventListener("input", update));
  update();
})();
