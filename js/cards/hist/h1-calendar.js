/* 카드: 달력은 왜 계절과 어긋날까? — 역법 규칙별 평균 1년과 회귀년의 차이가 쌓이는 모습 */
(() => {
  const root = document.getElementById("card-hist-calendar");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const TROP = 365.2422, SYN = 29.530589;
  const sY = $(".y"), sK = $(".k"), kRow = $(".k-row");
  let mode = "egypt";
  const LEN = {
    egypt: () => 365,
    lunar: () => 12 * SYN,
    luni: () => (228 + +sK.value) * SYN / 19,
    julian: () => 365.25,
    greg: () => 365.2425,
  };
  const NAME = { egypt: "이집트 민력", lunar: "순태음력", luni: "태음태양력", julian: "율리우스력", greg: "그레고리력" };
  const COL = { egypt: "#b5532f", lunar: "#3f6fa3", luni: "#3b7c2a", julian: "#e0a02a", greg: "#7a4fa0" };
  const { ctx, size } = fit($("canvas"), () => draw());
  /* 해마다 쌓이는 어긋남(일): 달력 1년이 짧으면 +, 계절이 달력에서 늦은 날짜로 감 */
  const drift = (m, n) => n * (TROP - LEN[m]());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const N = +sY.value, d = drift(mode, N);
    /* 왼쪽: 계절 바퀴 */
    const cx = w * 0.22, cy = h * 0.52, R = Math.min(w * 0.17, h * 0.36);
    const seasons = [["춘분", 0], ["하지", 0.25], ["추분", 0.5], ["동지", 0.75]];
    ctx.lineWidth = 10;
    const band = ["#cfe3c6", "#f1d9a8", "#e8c4b0", "#c9d6e6"];
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = band[i]; ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI / 2 + i * Math.PI / 2, -Math.PI / 2 + (i + 1) * Math.PI / 2); ctx.stroke();
    }
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    seasons.forEach(([s, f]) => {
      const a = -Math.PI / 2 + f * 2 * Math.PI, rx = cx + Math.cos(a) * (R + 20), ry = cy + Math.sin(a) * (R + 20) + 4;
      ctx.fillText(s, rx, ry);
    });
    /* 해마다 새해 첫날이 놓이는 계절 위치 (지난 자취는 흐리게) */
    const step = Math.max(1, Math.round(N / 60));
    for (let n = 0; n <= N; n += step) {
      const a = -Math.PI / 2 - (drift(mode, n) / TROP) * 2 * Math.PI;
      ctx.fillStyle = `rgba(93,93,97,${0.12 + 0.5 * n / N})`;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (R - 16), cy + Math.sin(a) * (R - 16), 2.2, 0, Math.PI * 2); ctx.fill();
    }
    const a = -Math.PI / 2 - (d / TROP) * 2 * Math.PI;
    ctx.strokeStyle = COL[mode]; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (R - 6), cy + Math.sin(a) * (R - 6)); ctx.stroke();
    ctx.fillStyle = COL[mode]; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (R - 6), cy + Math.sin(a) * (R - 6), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = `12px ${F.sans}`; ctx.fillText(`${N}년 뒤`, cx, cy - 4);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.fillText("새해 첫날의 계절", cx, cy + 12);
    ctx.textAlign = "left"; ctx.fillText("처음엔 춘분에 맞춤", 8, 14);

    /* 오른쪽: 어긋남 그래프 */
    const x0 = w * 0.5, x1 = w - 14, y0 = 24, y1 = h - 30, Nmax = +sY.max;
    const lim = Math.max(5, Math.abs(drift(mode, Nmax)) * 1.05);
    const show = Math.min(lim, 400);
    const X = (n) => x0 + n / Nmax * (x1 - x0), Y = (v) => (y0 + y1) / 2 - v / show * (y1 - y0) / 2;
    const yt = [-show, -show / 2, 0, show / 2, show].map((v) => [v, `${Math.round(v)}`]);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y, xt: [0, 400, 800, 1200, 1600].map((v) => [v, `${v}`]), yt, xlabel: "흐른 세월 (년)", ylabel: "어긋남 (일)" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    Object.keys(LEN).forEach((m) => {
      ctx.strokeStyle = COL[m]; ctx.globalAlpha = m === mode ? 1 : 0.25; ctx.lineWidth = m === mode ? 2.2 : 1.2;
      ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(Nmax), Y(drift(m, Nmax))); ctx.stroke();
    });
    ctx.globalAlpha = 1; ctx.fillStyle = COL[mode];
    ctx.beginPath(); ctx.arc(X(N), Y(d), 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = COL[mode]; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText(NAME[mode], x1, y0 - 7);
  }
  const fmtD = (v) => (Math.abs(v) < 0.01 ? `${(v * 1440).toFixed(1)}분` : `${v >= 0 ? "+" : ""}${v.toFixed(Math.abs(v) < 1 ? 4 : 2)}일`);
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    kRow.hidden = mode !== "luni";
    $(".y-out").textContent = sY.value; $(".k-out").textContent = sK.value;
    const L = LEN[mode](), dd = TROP - L, N = +sY.value, acc = drift(mode, N);
    $(".n-len").textContent = `${L.toFixed(4)}일`;
    $(".n-d").textContent = `${dd >= 0 ? "+" : ""}${dd.toFixed(4)}일 (${(dd * 1440).toFixed(1)}분)`;
    const turns = Math.trunc(acc / TROP);
    $(".n-acc").textContent = `${acc >= 0 ? "+" : ""}${acc.toFixed(1)}일` + (turns ? ` (계절 ${Math.abs(turns)}바퀴 넘음)` : "");
    $(".n-one").textContent = Math.abs(dd) < 1e-6 ? "—" : `약 ${Math.abs(1 / dd) < 10 ? (1 / Math.abs(dd)).toFixed(2) : Math.round(1 / Math.abs(dd)).toLocaleString()}년`;
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  sY.addEventListener("input", update); sK.addEventListener("input", update);
  if (window.NMLab && NMLab.demo) { mode = "julian"; sY.value = 1257; }
  update();
})();
