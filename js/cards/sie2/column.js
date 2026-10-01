/* 카드: 종이 한 장으로 얼마나 무거운 것을 버틸 수 있을까? — 종이 기둥 설계 (압축·전체 좌굴·국부 좌굴) */
(() => {
  const root = document.getElementById("card-sie2-column");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sP = $(".p"), sH = $(".hh");
  const E = 3e9, SC = 5e6, T1 = 1e-4, W = 0.21, G = 9.8;   // 종이 탄성률, 압축 강도, 한 겹 두께, 감는 폭
  const NAME = { circle: "원", square: "사각형", tri: "삼각형" };
  let shape = "circle", test = null;

  // 모델: 버티는 하중(N)과 무너지는 방식
  function strength(sh, p, hcm) {
    const P = p / 1000, t = T1 * Math.max(1, W / P), A = W * T1, Lh = hcm / 100;   // 단면적은 종이 양으로 정해짐
    let I, local;
    if (sh === "circle") { const r = P / (2 * Math.PI); I = Math.PI * r ** 3 * t; local = 0.2 * 0.6 * E * t / r; }
    else { const n = sh === "square" ? 4 : 3, b = P / n; I = sh === "square" ? (2 / 3) * b ** 3 * t : b ** 3 * t / 4; local = 3.6 * E * (t / b) ** 2; }
    const modes = [["압축 파괴", SC * A], ["전체 좌굴 (옆으로 휨)", Math.PI ** 2 * E * I / Lh ** 2], ["국부 좌굴 (벽이 우그러짐)", Math.min(local, SC) * A]];
    return modes.reduce((a, b) => (b[1] < a[1] ? b : a));
  }
  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "단면" }, { key: "p", label: "둘레 (mm)", res: 1 }, { key: "h", label: "높이 (cm)", res: 1 }, { key: "kg", label: "버틴 무게 (kg)", res: 0.1 }, { key: "how", label: "무너진 방식" },
  ]);
  const app = fit($(".cv-wide"), () => draw());

  function section(ctx, cx, cy, s, sh, layers) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2 + Math.min(layers, 6) * 0.6;
    ctx.beginPath();
    if (sh === "circle") ctx.arc(cx, cy, s, 0, Math.PI * 2);
    else { const n = sh === "square" ? 4 : 3; for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n + (n === 4 ? Math.PI / 4 : 0); i ? ctx.lineTo(cx + s * Math.cos(a), cy + s * Math.sin(a)) : ctx.moveTo(cx + s * Math.cos(a), cy + s * Math.sin(a)); } }
    ctx.stroke();
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = +sP.value, hc = +sH.value, layers = W * 1000 / p;
    // 단면(위에서 본 모양)
    const sc = Math.min(1.6, h / 230);   // px/mm
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("위에서 본 단면", w * 0.16, 16);
    const rpx = (sh) => (sh === "circle" ? p / (2 * Math.PI) : sh === "square" ? p / 4 / Math.SQRT2 : p / 3 / Math.sqrt(3)) * sc;
    section(ctx, w * 0.16, h * 0.42, rpx(shape), shape, layers);
    ctx.fillStyle = C.ink2; ctx.fillText(`${layers.toFixed(1)}겹 · 벽 두께 ${(layers * 0.1).toFixed(2)} mm`, w * 0.16, h * 0.42 + 70);
    // 옆에서 본 기둥과 추
    const base = h - 14, colH = (h - 70) * hc / 29, cx = w * 0.55, half = Math.max(4, rpx(shape) * 0.9);
    ctx.fillStyle = C.ink; ctx.fillRect(cx - 90, base, 180, 4);
    const kg = test ? test.kg : 0, failed = test && test.failed;
    const bend = failed ? Math.min(1, test.after * 2) : 0;
    ctx.strokeStyle = "#b9a888"; ctx.fillStyle = "#f6f1e3"; ctx.lineWidth = 1.5;
    if (failed && /전체/.test(test.how)) {
      ctx.beginPath(); ctx.moveTo(cx - half, base); ctx.quadraticCurveTo(cx - half + 30 * bend, base - colH / 2, cx - half + 8 * bend, base - colH * (1 - 0.1 * bend));
      ctx.lineTo(cx + half + 8 * bend, base - colH * (1 - 0.1 * bend)); ctx.quadraticCurveTo(cx + half + 30 * bend, base - colH / 2, cx + half, base); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      const top = base - colH * (1 - (failed ? 0.15 * bend : 0));
      ctx.fillRect(cx - half, top, 2 * half, base - top); ctx.strokeRect(cx - half, top, 2 * half, base - top);
      if (failed) { ctx.strokeStyle = C.warn; ctx.beginPath(); for (let i = 0; i < 6; i++) { ctx.moveTo(cx - half, top + 6 + i * 4); ctx.lineTo(cx + half, top + 10 + i * 4); } ctx.stroke(); }
    }
    // 추 (0.5 kg 원판)
    const topY = base - colH * (1 - (failed ? 0.15 * bend : 0)) - (failed && /전체/.test(test.how) ? -colH * 0.1 * bend : 0);
    const n = Math.round(kg / 0.5);
    ctx.fillStyle = "#5d5d61"; ctx.fillRect(cx - 40, topY - 4, 80, 4);
    for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? "#8d8d92" : "#6f6f75"; ctx.fillRect(cx - 28, topY - 4 - (i + 1) * 5, 56, 5); }
    ctx.fillStyle = C.ink; ctx.font = `600 15px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`${kg.toFixed(1)} kg`, cx + 70, Math.max(24, topY - n * 5));
    if (failed) { ctx.fillStyle = C.warn; ctx.font = `600 12px ${F.sans}`; ctx.fillText(test.how, cx + 70, Math.max(42, topY - n * 5 + 18)); }
  }
  loop($(".cv-wide"), (dt) => {
    if (test && !test.failed) {
      test.clock += dt;
      if (test.clock > 0.18) { test.clock = 0; test.kg += 0.5; if (test.kg > test.limit) { test.kg -= 0.5; test.failed = true; test.after = 0; const r = test.rec; r.kg = test.kg; tbl.add(r); $(".n-r").textContent = `${r.kg.toFixed(1)} kg`; $(".n-r").className = "n-r " + (r.kg >= 8 ? "good" : "bad"); } }
    } else if (test) test.after += dt;
    draw();
  });
  function run() {
    const p = +sP.value, hc = +sH.value, [how, N] = strength(shape, p, hc);
    const limit = N * (1 + 0.15 * L.gauss()) / G;
    test = { kg: 0, clock: 0, limit, how, failed: false, rec: { s: NAME[shape], p, h: hc, kg: 0, how: "" } };
    if (/국부/.test(how)) test.rec.how = "국부 좌굴"; else if (/전체/.test(how)) test.rec.how = "전체 좌굴"; else test.rec.how = "압축 파괴";
    test.how = how;
  }
  const upd = () => { $(".p-out").textContent = sP.value; $(".ly-out").textContent = (210 / +sP.value).toFixed(1); $(".h-out").textContent = sH.value; test = null; draw(); };
  [sP, sH].forEach((el) => el.addEventListener("input", upd));
  $(".shape").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; shape = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd(); });
  $(".test").addEventListener("click", () => { if (!test || test.failed) run(); });
  $(".clear").addEventListener("click", () => { tbl.clear(); test = null; $(".n-r").textContent = "—"; draw(); });
  upd();
  if (L.demo) {
    [["square", 210], ["tri", 210], ["circle", 210], ["circle", 105], ["circle", 70], ["circle", 40], ["circle", 25]].forEach(([s, p]) => { shape = s; sP.value = p; run(); test.rec.kg = Math.floor(test.limit / 0.5) * 0.5; tbl.add(test.rec); });
    shape = "circle"; sP.value = 40; upd(); run(); test.kg = Math.floor(test.limit / 0.5) * 0.5; test.failed = true; test.after = 1;
  }
})();
