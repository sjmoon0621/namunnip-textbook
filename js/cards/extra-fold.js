/* 카드: 종이를 몇 번 접으면 무엇의 높이를 넘을까? — 두께를 로그 눈금 위에 */
(() => {
  const root = document.getElementById("card-extra-fold");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = root.querySelector("canvas");
  const sN = $(".n"), oN = $(".n-out");
  const dT = $(".thick"), dX = $(".times"), dN = $(".need");
  const T0 = 1e-4; // m
  const marks = [
    [1e-4, "종이 한 장"], [0.01, "손가락 굵기"], [1.7, "사람 키"], [8849, "에베레스트산"],
    [4.2e5, "우주 정거장 높이"], [3.84e8, "달까지"], [1.5e11, "해까지"],
  ];
  const fmt = (m) => {
    if (m < 0.01) return `${(m * 1000).toPrecision(3)} mm`;
    if (m < 1) return `${(m * 100).toPrecision(3)} cm`;
    if (m < 1000) return `${m.toPrecision(3)} m`;
    if (m < 1e7) return `${(m / 1000).toPrecision(3)} km`;
    return `${(m / 1000).toExponential(2)} km`;
  };
  const V = fit(cv, () => draw());
  function draw() {
    const { ctx, size: { w, h } } = V; if (!w) return;
    const n = +sN.value, th = T0 * 2 ** n;
    const lo = -4.5, hi = 11.5, padT = 12, padB = 14;
    const Y = (m) => padT + (1 - (Math.log10(m) - lo) / (hi - lo)) * (h - padT - padB);
    ctx.clearRect(0, 0, w, h);
    const ax = 64;
    ctx.strokeStyle = C.rule; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let e = -4; e <= 11; e++) {
      const y = Math.round(Y(10 ** e)) + .5;
      ctx.beginPath(); ctx.moveTo(ax, y); ctx.lineTo(w - 6, y); ctx.stroke();
      if (e % 2 === 0) ctx.fillText(`10^${e} m`, ax - 4, y + 3);
    }
    // 막대
    const bx = ax + 14, bw = 34;
    ctx.fillStyle = "rgba(59,124,42,.35)"; ctx.fillRect(bx, Y(th), bw, Y(T0 / 3) - Y(th));
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.strokeRect(bx, Y(th), bw, Y(T0 / 3) - Y(th)); ctx.lineWidth = 1;
    // 이정표
    ctx.textAlign = "left";
    for (const [m, lab] of marks) {
      const y = Y(m), past = th >= m;
      ctx.strokeStyle = past ? C.warn : C.ink3; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw + 16, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = past ? C.warn : C.ink2; ctx.font = `11px ${F.sans}`;
      ctx.fillText(`${lab} (${Math.ceil(Math.log2(m / T0))}번)`, bx + bw + 20, y + 4);
    }
    ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`;
    ctx.fillText(`${n}번`, bx, Math.max(12, Y(th) - 4));
  }
  function update() {
    const n = +sN.value; oN.textContent = n;
    const th = T0 * 2 ** n;
    dT.textContent = fmt(th);
    dX.textContent = n < 20 ? `${(2 ** n).toLocaleString()}배` : `${(2 ** n).toExponential(2)}배`;
    // 한 방향으로 n번 접는 데 필요한 길이 (πt/6)(2^n + 4)(2^n − 1)
    const L = Math.PI * T0 / 6 * (2 ** n + 4) * (2 ** n - 1);
    dN.textContent = n === 0 ? "—" : fmt(L);
    dN.classList.toggle("bad", L > 1000);
    draw();
  }
  sN.addEventListener("input", update);
  update();
})();
