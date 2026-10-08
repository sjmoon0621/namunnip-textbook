/* 카드: 탄소-14가 4분의 1만 남았다면 몇 년이 지났을까? — y = r^(t/T)에서 목표 비율에 이르는 시간 t = T·log m / log r
   탄소-14 반감기 약 5730년, 연 5% 복리, 세균 20분마다 두 배(이상적 조건의 모식) */
(() => {
  const root = document.getElementById("card-alg-growth-time");
  if (!root) return;
  const { C, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sv = $(".v");
  const K = {
    c14: { r: 0.5, T: 5730, unit: "년", lab: "남은 비율", min: 0.05, max: 0.95, step: 0.05, v: 0.25, X1: 26000, Y1: 1.05,
      xt: [0, 5730, 11460, 17190, 22920], yt: [0, 0.25, 0.5, 0.75, 1], name: "반감기",
      eq: (m) => `(1/2)<sup><i>t</i>/5730</sup> = ${E.n(m)}`, note: "탄소-14의 반감기는 약 5730년으로 두었습니다. 점은 반감기마다의 위치입니다." },
    bank: { r: 1.05, T: 1, unit: "년", lab: "원금의 몇 배", min: 1.1, max: 4, step: 0.1, v: 2, X1: 30, Y1: 4.4,
      xt: [0, 5, 10, 15, 20, 25, 30], yt: [0, 1, 2, 3, 4], name: "1년",
      eq: (m) => `1.05<sup><i>t</i></sup> = ${E.n(m)}`, note: "이자에 붙는 세금과 수수료는 생각하지 않았습니다. 점은 해마다의 잔액입니다." },
    cell: { r: 2, T: 20, unit: "분", lab: "처음의 몇 배", min: 2, max: 1000, step: 1, v: 1000, X1: 210, Y1: 1100,
      xt: [0, 40, 80, 120, 160, 200], yt: [0, 250, 500, 750, 1000], name: "20분",
      eq: (m) => `2<sup><i>t</i>/20</sup> = ${E.n(m)}`, note: "20분마다 두 배는 영양과 공간이 충분한 이상적 조건의 모식입니다. 점은 20분마다의 양입니다." },
  };
  let key = "c14";
  const { ctx, size } = fit($("canvas"), () => draw());
  const time = (k, m) => k.T * Math.log10(m) / Math.log10(k.r);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = K[key], m = +sv.value, t = time(k, m), f = (x) => k.r ** (x / k.T);
    const g = E.frame(ctx, w, h, { X0: 0, X1: k.X1, Y0: 0, Y1: k.Y1, xt: k.xt.map((v) => [v, String(v)]), yt: k.yt, l: key === "cell" ? 40 : 36 });
    E.curve(ctx, g, f, C.forest, { lw: 2.4 });
    for (let i = 0; i * k.T <= k.X1; i++) E.dot(ctx, g, i * k.T, f(i * k.T), C.forest, 3.2);
    E.hline(ctx, g, m, E.BLUE, [], 1.6);
    E.vline(ctx, g, t, C.warn, [4, 3], 1.4);
    E.dot(ctx, g, t, m, C.warn, 6);
    E.dot(ctx, g, t, 0, C.warn, 4.5, true);
    E.tag(ctx, g, `t ≈ ${E.n(t, 1)}${k.unit}`, g.X(t) + (t > k.X1 * 0.7 ? -8 : 8), g.Y(0) - 12, C.warn, t > k.X1 * 0.7 ? "right" : "left");
    E.tag(ctx, g, `목표 ${E.n(m)}`, g.x0 + g.gw - 4, g.Y(m) + (m > k.Y1 * 0.8 ? 13 : -11), E.BLUE, "right", 11);
  }

  function update() {
    const k = K[key], m = +sv.value, t = time(k, m);
    $(".lab").textContent = k.lab; $(".v-out").textContent = E.n(m);
    $(".eq").innerHTML = `${k.eq(m)} ⇒ <i>t</i> = ${k.T === 1 ? "" : `${k.T} × `}log ${E.n(m)} / log ${E.n(k.r)} ≈ ${E.n(t, 2)}${k.unit}`;
    $(".n-t").textContent = `${E.n(t, 1)}${k.unit}`;
    $(".n-k").textContent = `${k.name} × ${E.n(t / k.T, 2)}`;
    $(".n-c").textContent = `${E.n(k.r ** (t / k.T), 4)}`;
    $(".f-note").textContent = k.note;
    draw();
  }
  chips.forEach((c) => c.addEventListener("click", () => {
    key = c.dataset.k; const k = K[key];
    sv.min = k.min; sv.max = k.max; sv.step = k.step; sv.value = k.v;
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update();
  }));
  sv.addEventListener("input", update);
  update();
})();
