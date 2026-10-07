/* 카드: 바닷물에서 마실 물 1 m³를 얻는 데 에너지가 얼마나 들까? — 역삼투의 회수율과 에너지 (모식) */
(() => {
  const root = document.getElementById("card-fusi-desal");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r"), cE = $(".erd");
  const PI_PER_G = 27 / 35, MARGIN = 8, ETA = 0.8, ERD = 0.95, PMAX = 80, CO2 = 0.45, PRE = 0.15;
  let sal = 35;
  const pi0 = () => sal * PI_PER_G;
  const press = (r) => pi0() / (1 - r) + MARGIN;
  const emin = (r) => pi0() * 1e5 * Math.log(1 / (1 - r)) / r / 3.6e6;
  const eact = (r, erd) => press(r) * 1e5 / ETA * (1 / r - (erd ? ERD : 0) * (1 / r - 1)) / 3.6e6 + PRE / r;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = +sR.value / 100, erd = cE.checked;
    const top = sal > 20 ? 8 : 2, x0 = 46, x1 = w - 14, y0 = 22, y1 = h - 34;
    const X = (v) => x0 + (v - 0.1) / 0.75 * (x1 - x0), Y = (v) => y1 - v / top * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y,
      xt: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((v) => [v, `${Math.round(v * 100)}%`]),
      yt: NMLab.ticks(0, top, 4).map((v) => [v, String(v)]), ylabel: "담수 1 m³당 에너지 (kWh)", xlabel: "회수율" });
    let rmax = 1 - pi0() / (PMAX - MARGIN);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    if (rmax < 0.85) { ctx.fillStyle = "rgba(181,83,47,.10)"; ctx.fillRect(X(Math.max(0.1, rmax)), y0, x1 - X(Math.max(0.1, rmax)), y1 - y0); }
    const curve = (f, col, dash, lw) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath();
      for (let i = 0; i <= 150; i++) { const v = 0.1 + 0.75 * i / 150, px = X(v), py = Y(f(v)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    curve(emin, C.ink2, [4, 4], 1.5);
    curve((v) => eact(v, !erd), "rgba(63,111,163,.35)", [], 1.4);
    curve((v) => eact(v, erd), "#3f6fa3", [], 2.4);
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(r), Y(eact(r, erd)), 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === sal)));
    const r = +sR.value / 100, erd = cE.checked;
    $(".r-out").textContent = sR.value;
    $(".lg-a").textContent = erd ? "추정 (회수 장치 있음)" : "추정 (회수 장치 없음)";
    $(".lg-b").textContent = erd ? "회수 장치 없을 때" : "회수 장치 있을 때";
    const P = press(r), em = emin(r), ea = eact(r, erd);
    $(".n-p").textContent = `${P.toFixed(0)} bar (원수 ${pi0().toFixed(1)} bar)`;
    $(".n-e").textContent = `${em.toFixed(2)} / ${ea.toFixed(2)} kWh`;
    $(".n-b").textContent = `${((1 - r) / r).toFixed(2)} m³ (염분 ${(sal / (1 - r)).toFixed(0)} g/L)`;
    $(".n-c").textContent = `${(ea * 0.3).toFixed(2)} kWh · CO₂ ${(ea * 0.3 * CO2 * 1000).toFixed(0)} g`;
    $(".alert").textContent = P > PMAX ? `필요한 압력 ${P.toFixed(0)} bar가 막이 견디는 약 ${PMAX} bar를 넘습니다. 이 회수율로는 운전할 수 없습니다.` : "";
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { sal = +b.dataset.s; update(); }));
  sR.addEventListener("input", update); cE.addEventListener("change", update);
  if (NMLab.demo) sR.value = 60;
  update();
})();
