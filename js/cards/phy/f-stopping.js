/* 카드: 속력이 2배면 정지 거리는 몇 배가 될까? — 공주 거리 + 제동 거리, v–t 그래프의 넓이 */
(() => {
  const root = document.getElementById("card-phy-stopping");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sV = $(".spd"), sR = $(".react"), cmp = $(".half");
  const oV = $(".spd-out"), oR = $(".react-out");
  const nR = $(".d-react"), nB = $(".d-brake"), nT = $(".d-total");

  const g = 9.81;
  const ROAD = { dry: { mu: 0.7, name: "마른 아스팔트" }, wet: { mu: 0.4, name: "젖은 아스팔트" }, snow: { mu: 0.2, name: "눈길" }, ice: { mu: 0.1, name: "빙판" } };
  let road = "dry", clock = 0;

  const run = (kmh) => {
    const v = kmh / 3.6, tr = +sR.value, a = ROAD[road].mu * g;
    const dr = v * tr, db = v * v / (2 * a), tb = v / a;
    return { kmh, v, tr, a, dr, db, d: dr + db, tEnd: tr + tb };
  };
  const posAt = (r, t) => t <= r.tr ? r.v * t : t >= r.tEnd ? r.d : r.dr + r.v * (t - r.tr) - 0.5 * r.a * (t - r.tr) ** 2;
  const velAt = (r, t) => t <= r.tr ? r.v : t >= r.tEnd ? 0 : r.v - r.a * (t - r.tr);

  function update() {
    oV.textContent = sV.value; oR.textContent = (+sR.value).toFixed(1);
    const r = run(+sV.value);
    nR.textContent = `${r.dr.toFixed(1)} m`; nB.textContent = `${r.db.toFixed(1)} m`; nT.textContent = `${r.d.toFixed(1)} m`;
    clock = 0; draw();
  }

  const { ctx, size } = fit(cv, () => draw());
  const nice = (m) => { const s = m / 4, p = 10 ** Math.floor(Math.log10(s)); return [1, 2, 5, 10].map((k) => k * p).find((k) => k >= s); };

  function car(x, y, col) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.roundRect(x - 26, y - 13, 26, 9, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(x - 20, y - 20, 13, 8, 2); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x - 20, y - 3, 3.2, 0, Math.PI * 2); ctx.arc(x - 6, y - 3, 3.2, 0, Math.PI * 2); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const main = run(+sV.value), half = cmp.checked ? run(+sV.value / 2) : null;
    const runs = half ? [main, half] : [main];
    // ── 도로
    const rx0 = 36, rx1 = w - 14, D = main.d * 1.08;
    const RX = (d) => rx0 + d / D * (rx1 - rx0);
    const lanes = runs.map((_, i) => 32 + i * 46);
    ctx.font = `10px ${F.mono}`;
    runs.forEach((r, i) => {
      const y = lanes[i];
      ctx.fillStyle = "#e6e6df"; ctx.fillRect(rx0 - 30, y - 22, rx1 - rx0 + 44, 26);
      ctx.fillStyle = "rgba(224,160,42,.35)"; ctx.fillRect(RX(0), y + 1, RX(r.dr) - RX(0), 3);
      ctx.fillStyle = "rgba(181,83,47,.45)"; ctx.fillRect(RX(r.dr), y + 1, RX(r.d) - RX(r.dr), 3);
      car(RX(posAt(r, clock)), y, i === 0 ? C.ink : "#9aa0a6");
      ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText(`${r.kmh.toFixed(r.kmh % 1 ? 1 : 0)} km/h · 정지 거리 ${r.d.toFixed(1)} m`, rx0 - 28, y + 15);
    });
    // 위험 발견 지점, 눈금
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(RX(0), 8); ctx.lineTo(RX(0), lanes.at(-1) + 5); ctx.stroke(); ctx.setLineDash([]);
    const ds = nice(D); ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    const ry = lanes.at(-1) + 30;
    for (let d = 0; d <= D; d += ds) ctx.fillText(`${d}`, RX(d), ry);
    ctx.textAlign = "right"; ctx.fillText("m", rx1, ry + 12);
    ctx.textAlign = "left"; ctx.fillStyle = C.warn; ctx.fillText("위험 발견", RX(0) + 4, 10);

    // ── v–t 그래프
    const x0 = 40, y0 = ry + 34, pw = w - x0 - 14, ph = h - y0 - 30;
    const tMax = main.tEnd * 1.12, vMax = main.v * 1.15;
    const X = (t) => x0 + t / tMax * pw, Y = (v) => y0 + (1 - v / vMax) * ph;
    const xs = nice(tMax), xt = []; for (let t = 0; t <= tMax; t += xs) xt.push([t, xs < 1 ? t.toFixed(1) : `${t}`]);
    const ys = nice(vMax), yt = []; for (let v = 0; v <= vMax; v += ys) yt.push([v, `${v}`]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt, yt, ylabel: "속력 (m/s)", xlabel: "시간 (s)" });
    runs.slice().reverse().forEach((r) => {
      const isMain = r === main;
      ctx.fillStyle = isMain ? "rgba(224,160,42,.30)" : "rgba(154,160,166,.25)";
      ctx.fillRect(X(0), Y(r.v), X(r.tr) - X(0), Y(0) - Y(r.v));
      ctx.fillStyle = isMain ? "rgba(181,83,47,.25)" : "rgba(154,160,166,.35)";
      ctx.beginPath(); ctx.moveTo(X(r.tr), Y(0)); ctx.lineTo(X(r.tr), Y(r.v)); ctx.lineTo(X(r.tEnd), Y(0)); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(0), Y(r.v)); ctx.lineTo(X(r.tr), Y(r.v)); ctx.lineTo(X(r.tEnd), Y(0));
      ctx.strokeStyle = isMain ? C.ink : "#8d8d92"; ctx.lineWidth = 2; ctx.stroke();
    });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    if (X(main.tr) - X(0) > 60) ctx.fillText(`공주 ${main.dr.toFixed(1)} m`, (X(0) + X(main.tr)) / 2, Y(main.v * 0.5));
    ctx.fillText(`제동 ${main.db.toFixed(1)} m`, X(main.tr) + (X(main.tEnd) - X(main.tr)) * 0.3, Y(main.v * 0.3));
    // 현재 시각
    const tc = Math.min(clock, tMax);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(tc), y0); ctx.lineTo(X(tc), y0 + ph); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(tc), Y(velAt(main, tc)), 4, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill();
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    ctx.fillText(`${ROAD[road].name} · μ ≈ ${ROAD[road].mu}`, w - 14, y0 - 8);
    ctx.textAlign = "left";
  }

  [sV, sR, cmp].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-road]").forEach((b) => b.addEventListener("click", () => {
    road = b.dataset.road;
    root.querySelectorAll("[data-road]").forEach((c) => c.setAttribute("aria-pressed", c === b ? "true" : "false"));
    update();
  }));
  update();
  loop(cv, (dt) => {
    const end = run(+sV.value).tEnd;
    if (NM.reduce) { if (clock !== end) { clock = end; draw(); } return; }
    clock += dt;
    if (clock > end + 1.8) clock = 0;
    draw();
  });
})();
