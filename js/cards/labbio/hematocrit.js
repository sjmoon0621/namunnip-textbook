/* 카드: 원심 분리한 모세관에서 적혈구 층의 길이를 재면 무엇을 알 수 있을까? — 미세 원심 분리, 적혈구 용적률, 시나리오 비교 */
(() => {
  const root = document.getElementById("card-labbio-hematocrit");
  if (!root) return;
  const { C, F, fit, loop, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sT = $(".t");
  const KEYS = ["m", "f", "alt", "ane", "ath", "dhy"];
  const NAME = { m: "성인 남성", f: "성인 여성", alt: "고산 지대", ane: "철 결핍 빈혈", ath: "운동선수", dhy: "심한 탈수" };
  const HCT = { m: 46, f: 41, alt: 56, ane: 29, ath: 42, dhy: 53 };   // 모의 혈액의 참 용적률 (%)
  const CLAY = 4;   // 점토 마개 길이 (mm)
  let k = "m", view = "smp", run = null, show = null, ang = 0;

  // 원심 시간이 짧으면 적혈구 사이에 혈장이 끼어 남는다 (모식)
  const packed = (H, t) => Math.min(99, H * (1 + 0.25 * Math.exp(-t / 1.0) + 0.012));
  const tbl = L.table($(".tbl-host"), [
    { key: "name", label: "시료" }, { key: "t", label: "시간 (분)", res: 1 }, { key: "r", label: "적혈구 (mm)", res: 0.5 },
    { key: "tot", label: "전체 (mm)", res: 0.5 }, { key: "h", label: "Hct (%)", res: 0.1 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function sample(key, t, clay) {
    const total = 46 + 8 * Math.random();
    const red = total * packed(HCT[key], t) / 100;
    const add = clay ? CLAY : 0;
    const r = L.measure(red + add, { sd: 0.3, res: 0.5 }), tot = L.measure(total + add, { sd: 0.3, res: 0.5 });
    return { tube: { total, red, buffy: Math.max(0.4, total * 0.008) }, row: { name: NAME[key], k: key, t, clay, r, tot, h: L.snap(100 * r / tot, 0.1) } };
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 원심 분리기 (위에서 본 모습)
    const cx = w * 0.2, cy = h * 0.36, R = Math.min(h * 0.3, w * 0.16);
    ctx.fillStyle = "#e9ebe4"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R + 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.25, Math.sin(a) * R * 0.25); ctx.lineTo(Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95); ctx.stroke();
      if (i === 0 || i === 6) { ctx.strokeStyle = "#a2302a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.35, Math.sin(a) * R * 0.35); ctx.lineTo(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9); ctx.stroke(); }
    }
    ctx.restore();
    ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(run && !run.done ? `회전 중 ${Math.min(run.t, run.sim).toFixed(1)} / ${run.t} 분` : "맞은편 관으로 균형", cx, cy + R + 24);
    // 정보
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`;
    const ix = w * 0.46;
    ctx.fillText(show ? `${show.row.name} · ${show.row.t}분` : `${NAME[k]} · ${sT.value}분`, ix, 30);
    ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink2;
    if (show) {
      ctx.fillText(`적혈구 ${show.row.r.toFixed(1)} mm / 전체 ${show.row.tot.toFixed(1)} mm`, ix, 52);
      ctx.fillStyle = C.forest; ctx.fillText(`Hct = ${show.row.h.toFixed(1)} %`, ix, 72);
    } else ctx.fillText("원심 분리 전", ix, 52);
    // 모세관 확대 (오른쪽이 점토로 막힌 끝 → 적혈구가 쌓임)
    const y0 = h - 54, tx0 = 30, tx1 = w - 20, mm = (tx1 - tx0) / 75;
    const X = (d) => tx1 - d * mm;   // 막힌 끝에서 d mm
    ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.fillRect(tx0, y0 - 8, tx1 - tx0, 16);
    if (show || (run && !run.done)) {
      const tb = (show || run.pending).tube, sp = show ? 1 : Math.min(1, run.sim / run.t);
      const clayW = CLAY;
      ctx.fillStyle = "#8f8a7c"; ctx.fillRect(X(clayW), y0 - 8, clayW * mm, 16);
      const base = clayW;
      if (sp < 1 && !show) {
        // 섞인 상태에서 점점 갈라짐
        const mix = `rgba(170,40,40,${0.9})`;
        ctx.fillStyle = mix; ctx.fillRect(X(base + tb.total), y0 - 7, tb.total * mm, 14);
      } else {
        ctx.fillStyle = "#9b1f22"; ctx.fillRect(X(base + tb.red), y0 - 7, tb.red * mm, 14);
        ctx.fillStyle = "#f4f1ea"; ctx.fillRect(X(base + tb.red + tb.buffy), y0 - 7, tb.buffy * mm, 14);
        ctx.fillStyle = "#efd27a"; ctx.fillRect(X(base + tb.total), y0 - 7, (tb.total - tb.red - tb.buffy) * mm, 14);
      }
    }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.strokeRect(tx0, y0 - 8, tx1 - tx0, 16);
    // 자 (점토-혈액 경계를 0으로)
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let d = 0; d <= 70; d++) { const x = X(CLAY + d); if (x < tx0) break; ctx.fillRect(x, y0 + 10, 1, d % 10 ? (d % 5 ? 3 : 6) : 9); if (d % 10 === 0) ctx.fillText(d, x, y0 + 30); }
    ctx.textAlign = "left"; ctx.fillText("자 (mm, 점토 경계 = 0)", tx0, y0 + 44);
    ctx.textAlign = "right"; ctx.fillText("점토", tx1, y0 - 14);
    if (show) { ctx.fillStyle = "#9b1f22"; ctx.fillText("적혈구", X(CLAY + 2), y0 - 14); ctx.fillStyle = "#b08a20"; ctx.textAlign = "left"; ctx.fillText("혈장", X(CLAY + show.tube.total) + 4, y0 - 14); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 56 };
    const rows = tbl.rows.filter((r) => !r.clay);
    if (view === "smp") {
      const sel = rows.filter((r) => r.t === 5);
      const X = (i) => box.x0 + box.w * (i + 0.5) / KEYS.length, Y = (v) => box.y0 + box.h - (v - 20) / 45 * box.h;
      // 정상 범위 띠
      ctx.fillStyle = "rgba(59,124,42,.10)"; ctx.fillRect(box.x0, Y(50), box.w, Y(40) - Y(50));
      ctx.fillStyle = "rgba(224,160,42,.12)"; ctx.fillRect(box.x0, Y(46), box.w, Y(36) - Y(46));
      axes(ctx, { ...box, X, Y, xt: KEYS.map((q, i) => [i, NAME[q]]), yt: [20, 30, 40, 50, 60].map((v) => [v, String(v)]), ylabel: "Hct (%) · 5분 원심 기록" });
      KEYS.forEach((q, i) => {
        const vs = sel.filter((r) => r.k === q).map((r) => r.h);
        if (!vs.length) return;
        const s = L.stats(vs), bw = box.w / KEYS.length * 0.45;
        ctx.fillStyle = "rgba(155,31,34,.25)"; ctx.fillRect(X(i) - bw / 2, Y(s.mean), bw, Y(20) - Y(s.mean));
        ctx.strokeStyle = "#9b1f22"; ctx.lineWidth = 1; ctx.strokeRect(X(i) - bw / 2 + 0.5, Y(s.mean) + 0.5, bw - 1, Y(20) - Y(s.mean) - 1);
        ctx.fillStyle = "#9b1f22"; vs.forEach((v, j) => { ctx.beginPath(); ctx.arc(X(i) - 5 + (j % 3) * 5, Y(v), 2.4, 0, Math.PI * 2); ctx.fill(); });
      });
      ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillStyle = "#b07a10"; ctx.fillText("■ 여 36~46", box.x0 + box.w, box.y0 - 7);
      ctx.fillStyle = C.forest; ctx.fillText("■ 남 40~50", box.x0 + box.w - 84, box.y0 - 7);
    } else {
      const pts = rows.filter((r) => r.k === k).map((r) => ({ x: r.t, y: r.h }));
      L.plot(ctx, box, { pts, xr: [0, 6.5], yr: [20, 65], xlabel: "원심 분리 시간 (분)", ylabel: `Hct (%) · ${NAME[k]}` });
    }
  }

  loop($(".cv-wide"), (dt) => {
    if (run && !run.done) {
      run.sim += dt * 1.5; ang += dt * 40;
      if (run.sim >= run.t) { run.done = true; show = run.pending; tbl.add(show.row); }
    }
    drawApp();
  });
  const upd = () => { $(".t-out").textContent = sT.value; if (run && run.done) { run = null; show = null; } drawApp(); drawPlot(); };
  sT.addEventListener("input", upd);
  $(".clay").addEventListener("change", upd);
  $(".smp").addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return;
    k = b.dataset.k; root.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  $(".spin").addEventListener("click", () => {
    if (run && !run.done) return;
    show = null; run = { t: +sT.value, sim: 0, done: false, pending: sample(k, +sT.value, $(".clay").checked) };
  });
  $(".clear").addEventListener("click", () => { run = null; show = null; tbl.clear(); drawApp(); });
  $(".view").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    view = b.dataset.v; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    KEYS.forEach((q) => [1, 2].forEach(() => tbl.add(sample(q, 5, false).row)));
    [1, 2, 3].forEach((t) => tbl.add(sample("m", t, false).row));
    show = sample("m", 5, false); tbl.add(show.row); run = { t: 5, sim: 5, done: true, pending: show }; ang = 0.4; drawApp();
  }
})();
