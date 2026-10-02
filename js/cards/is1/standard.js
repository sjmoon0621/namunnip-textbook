/* 카드: 모두가 자기 발걸음으로 재면 무슨 일이 생길까? — 기준 종류별 측정값 분포 비교 */
(() => {
  const root = document.getElementById("card-is1-standard");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const TRUE = 9.0;
  const NOTE = {
    own: "걸음 폭이 사람마다 달라 같은 교실이 7 m에서 11 m까지 나옵니다. 서로의 측정을 비교할 수 없습니다.",
    king: "모두 같은 막대를 본떠 써서 퍼짐이 크게 줄었습니다. 하지만 막대를 본뜰 때마다 생긴 차이가 남고, 왕이 바뀌면 기준도 바뀝니다.",
    rope: "한 끈을 따라 잘라 쓰니 퍼짐은 작지만, 끈이 늘어나거나 잘못 잘리면 모두 함께 틀립니다(계통 오차).",
    meter: "공인된 기준으로 눈금을 맞춘 줄자라, 재는 방법의 오차(몇 mm)만 남습니다.",
  };
  let std = "own", vals = [];
  const { ctx, size } = fit($(".cv-plot"), () => draw());
  function measureOne() {
    if (std === "own") { const step = L.measure(0.65, { sd: 0.07 }); const n = Math.round(TRUE / step * 2) / 2; return n * 0.65; }   // 반 걸음 단위로 셈
    if (std === "king") { const bar = 0.30 * (1 + 0.025 * L.gauss()); return L.snap(TRUE / bar, 0.5) * 0.30 + 0.03 * L.gauss(); }
    if (std === "rope") { const rope = 1.0 * (1 + 0.004 * L.gauss()) + 0.012; return Math.round(TRUE / rope * 10) / 10 * 1.0 + 0.01 * L.gauss(); }
    return L.measure(TRUE, { sd: 0.004, res: 0.001 });
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    L.hist(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, vals, { xr: [6.5, 11.5], bins: 25, xlabel: "잰 길이 (m)" });
    const X = (v) => 44 + (v - 6.5) / 5 * (w - 58);
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(TRUE), 18); ctx.lineTo(X(TRUE), h - 34); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("참값 9.00 m", X(TRUE) + 4, 30);
  }
  function run() {
    vals = Array.from({ length: 30 }, measureOne);
    const s = L.stats(vals);
    $(".n-m").textContent = `${s.mean.toFixed(2)} m`; $(".n-s").textContent = `${s.sd.toFixed(3)} m`;
    $(".n-r").textContent = `${(Math.max(...vals) - Math.min(...vals)).toFixed(2)} m`;
    $(".verdict").textContent = NOTE[std];
    draw();
  }
  $(".std").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; std = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); run(); });
  $(".run").addEventListener("click", run);
  run();
})();
