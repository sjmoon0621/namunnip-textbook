/* 카드: 비료의 효과를 알아보려면 화분을 어떻게 나눠야 할까? — 대조군, 무작위 배정, 블록 설계, 표본 크기 (모식) */
(() => {
  const root = document.getElementById("card-resr-design");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab, S = NMRsStat;
  const $ = (s) => root.querySelector(s);
  const COLS = 8, ROWS = 6, TRUE = 1.5, BASE = 9, SD = 2;
  const light = (c) => 3 - 6 * c / (COLS - 1);
  const pots = [];
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) pots.push({ c, r, g: null, h: 0 });
  let ctl = 1, as = "sys", n = 5, showTruth = false, last = null;
  const runs = [];
  const COL = { sys: C.warn, rnd: C.forest, blk: C.ink, none: C.amber };
  const NAME = { sys: "편한 대로", rnd: "무작위", blk: "줄마다 무작위", none: "대조군 없음" };

  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const key = () => (ctl ? as : "none");

  function assign() {
    pots.forEach((p) => { p.g = null; });
    const need = ctl ? 2 * n : n;
    if (as === "sys") {
      const byWin = [...pots].sort((a, b) => a.c - b.c || a.r - b.r);
      byWin.slice(0, n).forEach((p) => { p.g = "T"; });
      if (ctl) byWin.reverse().slice(0, n).forEach((p) => { p.g = "C"; });
    } else if (as === "rnd" || !ctl) {
      const s = shuffle([...pots]).slice(0, need);
      s.forEach((p, i) => { p.g = i < n ? "T" : "C"; });
    } else {
      const pairs = [];
      for (let c = 0; c < COLS; c++) {
        const col = shuffle(pots.filter((p) => p.c === c));
        for (let k = 0; k + 1 < col.length; k += 2) pairs.push([col[k], col[k + 1]]);
      }
      shuffle(pairs).slice(0, n).forEach(([a, b]) => { if (Math.random() < 0.5) { a.g = "T"; b.g = "C"; } else { a.g = "C"; b.g = "T"; } });
    }
  }

  function runOnce() {
    assign();
    pots.forEach((p) => { p.h = p.g ? Math.max(0.5, BASE + light(p.c) + (p.g === "T" ? TRUE : 0) + SD * L.gauss()) : 0; });
    const T = pots.filter((p) => p.g === "T").map((p) => p.h), Cg = pots.filter((p) => p.g === "C").map((p) => p.h);
    let est;
    if (ctl) { const w = S.welch(Cg, T); est = { e: w.diff, lo: w.lo, hi: w.hi, mt: w.mb, mc: w.ma }; }
    else { const o = S.one(T); est = { e: o.diff, lo: o.lo, hi: o.hi, mt: o.diff, mc: NaN }; }
    est.k = key(); last = est;
    runs.push(est); if (runs.length > 80) runs.shift();
  }

  const tray = fit($(".cv-wide"), () => drawTray());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function drawTray() {
    const { ctx } = tray, { w, h } = tray.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const winW = 30, x0 = winW + 10, y0 = 10, gw = w - x0 - 10, gh = h - y0 - 30;
    const gr = ctx.createLinearGradient(x0, 0, x0 + gw, 0);
    gr.addColorStop(0, "rgba(224,160,42,0.28)"); gr.addColorStop(1, "rgba(224,160,42,0.02)");
    ctx.fillStyle = gr; ctx.fillRect(x0, y0, gw, gh);
    ctx.strokeStyle = C.rule; ctx.strokeRect(x0 + .5, y0 + .5, gw - 1, gh - 1);
    ctx.fillStyle = "#dceaf3"; ctx.fillRect(4, y0, winW - 4, gh);
    ctx.strokeStyle = "#9bb7c9"; ctx.strokeRect(4.5, y0 + .5, winW - 5, gh - 1);
    ctx.beginPath(); ctx.moveTo(4 + (winW - 4) / 2, y0); ctx.lineTo(4 + (winW - 4) / 2, y0 + gh); ctx.stroke();
    ctx.save(); ctx.translate(winW / 2 + 2, y0 + gh / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("창 (햇빛)", 0, 4); ctx.restore();
    const cw = gw / COLS, ch = gh / ROWS, rmax = Math.min(cw, ch) / 2 - 2;
    for (const p of pots) {
      const cx = x0 + (p.c + 0.5) * cw, cy = y0 + (p.r + 0.5) * ch;
      if (!p.g) { ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, rmax * 0.45, 0, 7); ctx.stroke(); continue; }
      const r = Math.max(3, Math.min(rmax, rmax * p.h / 15));
      ctx.fillStyle = p.g === "T" ? C.forest : C.amber;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const ly = h - 12;
    const item = (x, col, label, hollow) => {
      ctx.beginPath(); ctx.arc(x + 5, ly, 5, 0, 7);
      if (hollow) { ctx.strokeStyle = C.ink3; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); }
      ctx.fillStyle = C.ink2; ctx.fillText(label, x + 14, ly); return x + 14 + ctx.measureText(label).width + 14;
    };
    let x = item(x0, C.forest, "비료");
    if (ctl) x = item(x, C.amber, "대조군");
    x = item(x, null, "빈 자리", true);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("원 크기 = 자란 키", w - 10, ly);
    ctx.textBaseline = "alphabetic";
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const nx = Math.max(20, runs.length + 1);
    const box = { x0: 40, y0: 26, w: w - 52, h: h - 62 };
    const m = L.plot(ctx, box, { pts: [], xr: [0, nx], yr: [-4, 16], xlabel: "실험 회차", ylabel: "추정한 효과 (cm)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(box.x0, m.Y(0)); ctx.lineTo(box.x0 + box.w, m.Y(0)); ctx.stroke(); ctx.setLineDash([]);
    if (showTruth) { ctx.strokeStyle = C.apple; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(box.x0, m.Y(TRUE)); ctx.lineTo(box.x0 + box.w, m.Y(TRUE)); ctx.stroke(); }
    runs.forEach((r, i) => {
      const px = m.X(i + 1), col = COL[r.k];
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px, m.Y(r.lo)); ctx.lineTo(px, m.Y(r.hi)); ctx.stroke();
      ctx.beginPath(); ctx.arc(px, m.Y(r.e), 3, 0, 7); ctx.fill();
    });
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    let x = box.x0;
    const used = [...new Set(runs.map((r) => r.k))];
    used.forEach((k) => { ctx.fillStyle = COL[k]; ctx.fillRect(x, h - 11, 9, 9); ctx.fillStyle = C.ink2; ctx.fillText(NAME[k], x + 13, h - 3); x += 13 + ctx.measureText(NAME[k]).width + 12; });
    if (showTruth) { ctx.fillStyle = C.apple; ctx.textAlign = "right"; ctx.fillText(`참효과 ${TRUE} cm`, box.x0 + box.w, box.y0 - 7); }
  }

  const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) + " cm" : "—");
  function readout() {
    $(".v-t").textContent = last ? f1(last.mt) : "—";
    $(".v-c").textContent = last ? (ctl ? f1(last.mc) : "없음") : "—";
    $(".v-e").textContent = last ? `${last.e.toFixed(1)} (${last.lo.toFixed(1)}~${last.hi.toFixed(1)})` : "—";
    const v = $(".verdict"), mine = runs.filter((r) => r.k === key());
    v.className = "verdict small";
    if (mine.length < 3) { v.textContent = ""; return; }
    const st = L.stats(mine.map((r) => r.e)), cover = mine.filter((r) => r.lo <= TRUE && TRUE <= r.hi).length;
    let s = `${NAME[key()]} 설계 ${mine.length}번: 추정값 평균 ${st.mean.toFixed(2)} cm, 흩어진 정도(표준편차) ${st.sd.toFixed(2)} cm.`;
    if (showTruth) {
      const bias = st.mean - TRUE;
      s += ` 참값을 포함한 구간 ${cover}/${mine.length}개. 치우침 ${bias >= 0 ? "+" : ""}${bias.toFixed(2)} cm.`;
      v.classList.add(Math.abs(bias) < 0.6 ? "good" : "bad");
    } else s += " 참값 보기를 눌러 비교하세요.";
    v.textContent = s;
  }
  const redraw = () => { drawTray(); drawPlot(); readout(); };

  const press = (sel, attr, val) => root.querySelectorAll(sel).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === String(val))));
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b || !root.querySelector(".card-fig").contains(b)) return;
    if (b.dataset.ctl) { ctl = +b.dataset.ctl; press("[data-ctl]", "ctl", ctl); }
    else if (b.dataset.as) { as = b.dataset.as; press("[data-as]", "as", as); }
    else if (b.classList.contains("run1")) runOnce();
    else if (b.classList.contains("run20")) for (let i = 0; i < 20; i++) runOnce();
    else if (b.classList.contains("clear")) { runs.length = 0; last = null; pots.forEach((p) => { p.g = null; }); }
    else if (b.classList.contains("truth")) { showTruth = !showTruth; b.setAttribute("aria-pressed", String(showTruth)); }
    else return;
    root.querySelectorAll("[data-as]").forEach((x) => { x.disabled = !ctl && x.dataset.as === "blk"; });
    redraw();
  });
  $(".n").addEventListener("input", () => { n = +$(".n").value; $(".n-out").textContent = n; });
  if (L.demo) {
    for (let i = 0; i < 12; i++) runOnce();
    as = "rnd"; press("[data-as]", "as", as); for (let i = 0; i < 12; i++) runOnce();
    showTruth = true; $(".truth").setAttribute("aria-pressed", "true");
  }
  readout();
})();
