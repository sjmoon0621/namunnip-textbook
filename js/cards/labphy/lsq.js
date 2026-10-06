/* 카드: 흩어진 점들에 그은 직선의 기울기는 얼마나 믿을 수 있을까? — 최소 제곱법, 잔차, 95% 신뢰구간 */
(() => {
  const root = document.getElementById("card-labphy-lsq");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sM = $(".m"), sS = $(".s"), o0 = $(".o0");

  /* 참값 (화면에 직접 보이지 않음): k = 25 N/m, 초기 장력 0.098 N (추 10 g 무게) */
  const K = 25, M0 = 10, A0 = 0.98 / K;                  // 기울기 cm/g
  const xTrue = (m) => Math.max(0, (m - M0) * A0);
  const T95 = [0, 12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.160, 2.145, 2.131, 2.120, 2.110, 2.101, 2.093, 2.086, 2.080, 2.074, 2.069, 2.064, 2.060, 2.056, 2.052, 2.048, 2.045, 2.042];
  const tq = (dof) => (dof < 1 ? NaN : dof <= 30 ? T95[dof] : 1.96 + 2.4 / dof);
  let shown = +sM.value, cover = null;

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const rs = fit($(".cv-res"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "m", label: "m (g)", res: 1 }, { key: "x", label: "늘어난 길이 x (cm)", res: 0.1 }, { key: "r", label: "잔차 (cm)", res: 0.01 },
  ], () => { cover = null; drawPlot(); });

  /* 최소 제곱 맞춤 + 신뢰 띠에 필요한 값 */
  function fitAll(ms, xs, thru0) {
    const f = L.linfit(ms, xs, thru0);
    if (!f) return null;
    const n = ms.length, dof = thru0 ? n - 1 : n - 2;
    const mx = ms.reduce((s, v) => s + v, 0) / n;
    const sxx = ms.reduce((s, v) => s + (v - mx) ** 2, 0), sx2 = ms.reduce((s, v) => s + v * v, 0);
    const s = Math.sqrt(ms.reduce((acc, v, i) => acc + (xs[i] - f.a * v - f.b) ** 2, 0) / Math.max(dof, 1));
    const t = tq(dof);
    f.t = t; f.s = s; f.dof = dof;
    f.band = (v) => t * s * (thru0 ? Math.abs(v) / Math.sqrt(sx2) : Math.sqrt(1 / n + (v - mx) ** 2 / sxx));
    return f;
  }
  const meas = (m) => L.measure(xTrue(m), { sd: +sS.value, res: 0.1 });

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const sx = w * 0.42, top = 16, cmPx = (h - 90) / 12;
    // 스탠드
    ctx.fillStyle = C.ink2; ctx.fillRect(sx - 80, top - 6, 160, 5); ctx.fillRect(sx + 72, top - 6, 5, h - 14);
    ctx.fillRect(sx + 40, h - 12, 80, 5);
    // 용수철
    const rest = 3.0 * cmPx, len = rest + xTrue(shown) * cmPx, coils = 18;
    ctx.strokeStyle = "#6d7178"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sx, top);
    ctx.lineTo(sx, top + 8);
    for (let i = 0; i <= coils * 2; i++) ctx.lineTo(sx + (i % 2 ? 9 : -9) * (i && i < coils * 2 ? 1 : 0), top + 8 + len * i / (coils * 2));
    ctx.lineTo(sx, top + 16 + len); ctx.stroke();
    // 추걸이와 추
    const py = top + 16 + len, nb = Math.max(1, Math.round(shown / 20));
    ctx.fillStyle = C.ink; ctx.fillRect(sx - 18, py, 36, 3);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(sx - 18, py + 1.5); ctx.lineTo(sx - 50, py + 1.5); ctx.stroke();
    for (let i = 0; i < nb; i++) { ctx.fillStyle = i % 2 ? "#a8996f" : "#bfae7d"; ctx.fillRect(sx - 14, py + 4 + i * 5, 28, 4.5); }
    // 자
    const rx = sx - 68, r0 = top + 16 + rest;
    ctx.fillStyle = "#efe7cf"; ctx.fillRect(rx, r0 - 10, 18, 12 * cmPx + 14);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 0.8; ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
    for (let mm = 0; mm <= 110; mm++) {
      const y = r0 + mm / 10 * cmPx, l = mm % 10 ? (mm % 5 ? 4 : 7) : 11;
      ctx.beginPath(); ctx.moveTo(rx + 18, y); ctx.lineTo(rx + 18 - l, y); ctx.stroke();
      if (!(mm % 10)) ctx.fillText(String(mm / 10), rx - 4, y + 3);
    }
    ctx.fillText("cm", rx - 4, r0 - 12); ctx.textAlign = "left";
    // 안내
    const tx = w * 0.66;
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`;
    ctx.fillText(`m = ${shown.toFixed(0)} g`, tx, 40);
    ctx.font = `11.5px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText("빨간 바늘이 가리키는", tx, 64); ctx.fillText("눈금이 늘어난 길이 x", tx, 80);
    const n = tbl.rows.length;
    ctx.fillText(`기록한 점 N = ${n}`, tx, 110);
  }

  function drawPlot() {
    const ms = tbl.col("m"), xs = tbl.col("x"), thru0 = o0.checked;
    const f = ms.length >= 2 ? fitAll(ms, xs, thru0) : null;
    tbl.rows.forEach((r) => { r.r = f ? r.x - f.a * r.m - f.b : NaN; });
    // 표의 잔차 칸 갱신 (다시 그리지 않고 글자만)
    root.querySelectorAll(".tbl-host tbody tr").forEach((tr, i) => { const td = tr.children[3]; if (td && tbl.rows[i]) td.textContent = L.fmt(Math.abs(tbl.rows[i].r) < 0.005 ? 0 : tbl.rows[i].r, 0.01); });
    // 본 그래프
    {
      const { ctx } = pl, { w, h } = pl.size;
      if (w) {
        ctx.clearRect(0, 0, w, h);
        const box = { x0: 44, y0: 22, w: w - 58, h: h - 56 };
        const g = L.plot(ctx, box, { pts: [], xr: [0, 210], yr: [-0.5, 8.5], xlabel: "m (g)", ylabel: "x (cm)" });
        ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
        if (f) {
          ctx.fillStyle = "rgba(116,171,102,.38)"; ctx.beginPath();
          for (let i = 0; i <= 60; i++) { const v = 210 * i / 60; ctx.lineTo(g.X(v), g.Y(f.a * v + f.b + f.band(v))); }
          for (let i = 60; i >= 0; i--) { const v = 210 * i / 60; ctx.lineTo(g.X(v), g.Y(f.a * v + f.b - f.band(v))); }
          ctx.fill();
          ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(g.X(0), g.Y(f.b)); ctx.lineTo(g.X(210), g.Y(f.a * 210 + f.b)); ctx.stroke();
        }
        ctx.fillStyle = C.forest;
        ms.forEach((m, i) => { ctx.beginPath(); ctx.arc(g.X(m), g.Y(xs[i]), 3.2, 0, Math.PI * 2); ctx.fill(); });
        ctx.restore();
        if (f) {
          ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
          ctx.fillText(thru0 ? `x = ${f.a.toFixed(4)}·m` : `x = ${f.a.toFixed(4)}·m ${f.b < 0 ? "−" : "+"} ${Math.abs(f.b).toFixed(2)}`, box.x0 + 8, box.y0 + 14);
          ctx.fillStyle = C.ink2; ctx.fillText(`r² = ${f.r2.toFixed(4)}`, box.x0 + 8, box.y0 + 30);
        }
      }
    }
    // 잔차 그래프
    {
      const { ctx } = rs, { w, h } = rs.size;
      if (w) {
        ctx.clearRect(0, 0, w, h);
        const box = { x0: 44, y0: 18, w: w - 58, h: h - 46 };
        const rr = tbl.rows.map((r) => r.r).filter(Number.isFinite);
        const lim = Math.max(0.3, ...rr.map((v) => Math.abs(v) * 1.25));
        const g = L.plot(ctx, box, { pts: tbl.rows.filter((r) => Number.isFinite(r.r)).map((r) => ({ x: r.m, y: r.r })), xr: [0, 210], yr: [-lim, lim], xlabel: "m (g)", ylabel: "잔차 (cm)", color: C.amber });
        ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(box.x0, g.Y(0)); ctx.lineTo(box.x0 + box.w, g.Y(0)); ctx.stroke();
      }
    }
    // 수치
    const na = $(".n-a"), nb = $(".n-b"), nk = $(".n-k"), nc = $(".n-c");
    if (f && f.dof >= 1) {
      const ea = f.t * f.sa;
      na.textContent = `${f.a.toFixed(4)} ± ${ea.toFixed(4)}`;
      nb.textContent = thru0 ? "0 (고정)" : `${f.b.toFixed(2)} ± ${(f.t * f.sb).toFixed(2)}`;
      const k = 0.98 / f.a, ek = k * ea / f.a;
      nk.textContent = `${k.toFixed(1)} ± ${ek.toFixed(1)} N/m`;
    } else { na.textContent = nb.textContent = nk.textContent = "—"; }
    nc.textContent = cover == null ? "—" : `${cover}번`;
    nc.className = "n-c " + (cover == null ? "" : cover >= 90 ? "good" : "bad");
    drawApp();
  }

  function repeat() {
    let ms = tbl.col("m");
    if (ms.length < 3) ms = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];
    let hit = 0;
    for (let k = 0; k < 100; k++) {
      const f = fitAll(ms, ms.map(meas), o0.checked);
      if (f && Math.abs(f.a - A0) <= f.t * f.sa) hit++;
    }
    cover = hit; drawPlot();
  }

  const upd = () => { $(".m-out").textContent = sM.value; $(".s-out").textContent = (+sS.value).toFixed(2); cover = null; drawPlot(); };
  [sM, sS].forEach((el) => el.addEventListener("input", upd));
  o0.addEventListener("change", () => { cover = null; drawPlot(); });
  $(".meas").addEventListener("click", () => { const m = +sM.value; tbl.add({ m, x: meas(m) }); });
  $(".sweep").addEventListener("click", () => { for (let m = 20; m <= 200; m += 20) tbl.add({ m, x: meas(m) }); });
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".rep").addEventListener("click", repeat);
  loop($(".cv-wide"), (dt) => {
    const tgt = +sM.value; if (Math.abs(shown - tgt) < 0.05) return false;
    shown += (tgt - shown) * Math.min(1, dt * 8); drawApp();
  });
  upd();
  if (L.demo) {
    for (let m = 20; m <= 200; m += 20) tbl.add({ m, x: meas(m) });
    repeat();
  }
})();
