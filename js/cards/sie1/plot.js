/* 카드: 같은 자료인데 왜 그래프마다 다른 이야기를 할까? — 자료 유형과 그래프 고르기, 축 자르기, 이상값 */
(() => {
  const root = document.getElementById("card-sie1-plot");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const DATA = {
    sol: { x: "온도 (°C)", y: "용해도 (g/물 100 g)", kind: "num", pts: [[10, 21], [20, 32], [30, 46], [40, 64], [50, 85], [60, 110], [70, 118], [80, 169]], out: 6 },   // 질산 칼륨 (70 °C 값은 영점 오류로 낮게 기록됨)
    day: { x: "시각 (시)", y: "기온 (°C)", kind: "time", pts: [[0, 14], [3, 12.5], [6, 11.8], [9, 16], [12, 22.5], [15, 24], [18, 20], [21, 16.5], [24, 14.5]] },
    cls: { x: "반", y: "평균 수면 시간 (h)", kind: "cat", pts: [["1반", 6.4], ["2반", 6.1], ["3반", 6.6], ["4반", 6.2]] },
  };
  const GOOD = {
    sol: { scatter: "알맞음: 연속형 두 변인의 관계를 보고, 추세선으로 경향과 튀는 점을 찾을 수 있습니다.", line: "보통: 점을 잇는 것은 괜찮지만, 측정 오차까지 꺾여 보입니다. 추세선이 관계를 더 잘 보여 줍니다.", bar: "어색함: 온도는 이어진 수인데 막대로 끊으면 측정하지 않은 온도 사이가 비어 보입니다.", table: "정확한 값은 전하지만 '온도가 오를수록 빠르게 늘어난다'는 경향은 한눈에 보이지 않습니다." },
    day: { line: "알맞음: 시간에 따른 변화는 이어서 보는 것이 자연스럽고, 최저·최고 시각이 바로 보입니다.", scatter: "보통: 시간과 기온은 직선 관계가 아니라 추세선이 오해를 낳습니다(하루 기온은 오르내림).", bar: "보통: 값은 보이지만 시간의 흐름이 끊겨 보입니다.", table: "정확한 값은 전하지만 언제 가장 따뜻했는지 찾으려면 숫자를 하나씩 읽어야 합니다." },
    cls: { bar: "알맞음: 범주(반)끼리 비교하는 자료입니다. 단, 막대 길이로 비교하므로 세로축은 0부터 시작해야 합니다.", line: "부적절: 반은 범주라 선으로 이으면 '1.5반' 같은 중간이 있는 것처럼 보이고, 순서가 의미 있는 것처럼 보입니다.", scatter: "부적절: 반 사이 추세선(기울기)은 의미가 없습니다.", table: "알맞음: 값이 넷뿐이면 표도 충분히 명확합니다." },
  };
  let ds = "sol", g = "scatter";
  const { ctx, size } = fit($(".cv-plot"), () => draw());
  const host = $(".tbl-host");
  const cols = [{ key: "x", label: "x" }, { key: "y", label: "y" }];
  const tbl = L.table(host, cols);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const D = DATA[ds], zero = $(".zero").checked;
    const pts = D.pts.filter((_, i) => !($(".out").checked && i === D.out));
    $(".out-wrap").hidden = ds !== "sol";
    const tableMode = g === "table";
    $(".cv-plot").hidden = tableMode; host.hidden = !tableMode;
    let v = GOOD[ds][g];
    if (!zero && (g === "bar")) v += " 지금은 세로축이 0이 아니라서 막대 길이 비가 실제 값의 비와 다릅니다.";
    $(".verdict").textContent = v;
    $(".verdict").className = "verdict small " + (/^알맞음/.test(v) && (zero || g !== "bar") ? "good" : /^부적절|^어색/.test(v) ? "bad" : "");
    if (tableMode) return;
    const ys = pts.map((p) => p[1]), ymax = Math.max(...ys), ymin = Math.min(...ys);
    const yr = zero ? [0, ymax * 1.1] : [ymin - (ymax - ymin) * 0.15, ymax + (ymax - ymin) * 0.15];
    const box = { x0: 46, y0: 20, w: w - 60, h: h - 56 };
    if (D.kind === "cat" || g === "bar") {
      const n = pts.length, X = (i) => box.x0 + (i + 0.5) / n * box.w, Y = (y) => box.y0 + box.h - (y - yr[0]) / (yr[1] - yr[0]) * box.h;
      axes(ctx, { ...box, X, Y, xt: pts.map((p, i) => [i, String(p[0])]), yt: L.ticks(yr[0], yr[1], 4).map((t) => [t, String(+t.toPrecision(3))]), xlabel: D.x, ylabel: D.y });
      if (g === "bar") {
        const bw = box.w / n * 0.55; ctx.fillStyle = C.sprout; ctx.strokeStyle = C.forest;
        pts.forEach((p, i) => { const y = Y(p[1]), y0 = Y(Math.max(yr[0], 0)); ctx.fillRect(X(i) - bw / 2, y, bw, y0 - y); ctx.strokeRect(X(i) - bw / 2 + .5, y + .5, bw - 1, y0 - y - 1); });
      } else {
        ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 1.6;
        if (g === "line") { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(X(i), Y(p[1])) : ctx.moveTo(X(i), Y(p[1])))); ctx.stroke(); }
        if (g === "scatter") { const f = L.linfit(pts.map((_, i) => i), ys); ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(X(-0.3), Y(f.b - 0.3 * f.a)); ctx.lineTo(X(n - 0.7), Y(f.a * (n - 0.7) + f.b)); ctx.stroke(); }
        pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(X(i), Y(p[1]), 3.5, 0, Math.PI * 2); ctx.fill(); });
      }
      if (!zero) { ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(`가장 큰 값 ÷ 가장 작은 값 = ${(ymax / ymin).toFixed(2)}배인데 막대(점) 높이는 ${((ymax - yr[0]) / (ymin - yr[0])).toFixed(1)}배`, box.x0 + box.w, box.y0 + 10); }
      return;
    }
    const xr = [Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0]))]; xr[1] += (xr[1] - xr[0]) * 0.05;
    if (g === "line") {
      const r = L.plot(ctx, box, { pts: pts.map(([x, y]) => ({ x, y })), xr: [0, xr[1]], yr, xlabel: D.x, ylabel: D.y });
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.6; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(r.X(x), r.Y(y)) : ctx.moveTo(r.X(x), r.Y(y)))); ctx.stroke();
    } else {
      // 용해도는 곡선 관계: 2차 맞춤 대신 지수 맞춤(로그 직선)
      let model = null;
      if (ds === "sol") { const f = L.linfit(pts.map((p) => p[0]), pts.map((p) => Math.log(p[1]))); model = (x) => Math.exp(f.a * x + f.b); }
      const f = ds === "sol" ? null : L.linfit(pts.map((p) => p[0]), ys);
      const r = L.plot(ctx, box, { pts: pts.map(([x, y]) => ({ x, y })), fit: f, xr: [0, xr[1]], yr, xlabel: D.x, ylabel: D.y });
      if (model) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i <= 50; i++) { const x = xr[1] * i / 50, y = model(x); i ? ctx.lineTo(r.X(x), r.Y(y)) : ctx.moveTo(r.X(x), r.Y(y)); } ctx.stroke(); }
      if (ds === "sol" && !$(".out").checked) { const [x, y] = D.pts[D.out]; ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(r.X(x), r.Y(y), 8, 0, Math.PI * 2); ctx.stroke(); }
    }
  }
  function fillTable() {
    cols[0].label = DATA[ds].x; cols[1].label = DATA[ds].y;
    tbl.clear();
    DATA[ds].pts.forEach(([x, y]) => tbl.add({ x: String(x), y: String(y) }));
  }
  const pick = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    set(b.dataset[attr]); root.querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    fillTable(); draw();
  });
  pick(".dsel", "d", (v) => { ds = v; });
  pick(".gsel", "g", (v) => { g = v; });
  [$(".zero"), $(".out")].forEach((el) => el.addEventListener("change", draw));
  fillTable(); draw();
  if (L.demo) { root.querySelector('[data-d="cls"]').click(); root.querySelector('[data-g="bar"]').click(); $(".zero").checked = false; draw(); }
})();
