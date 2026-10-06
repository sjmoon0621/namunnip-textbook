/* 카드: 젤 속에서 이동한 거리만 재고 DNA 조각의 크기를 알 수 있을까? — 아가로스 농도·전압·시간, 사다리 표준 곡선 log(bp) = a·d + b */
(() => {
  const root = document.getElementById("card-labbio-electrophoresis");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const LADDER = [10000, 8000, 6000, 5000, 4000, 3500, 3000, 2500, 2000, 1500, 1000, 750, 500, 250];
  const LANES = [{ n: "M", b: LADDER }, { n: "A", b: [3700] }, { n: "B", b: [2600, 900] }, { n: "C", b: [1800, 1300, 450] }];
  const GEL = 7;   // 우물에서 젤 끝까지 cm
  let g = 1, lane = 0;

  // 이동 거리 (cm): 큰 조각일수록, 젤이 진할수록 느림 (모식). 1%, 100 V, 40분에서 1 kb ≈ 3.5 cm
  const mob = (bp) => Math.exp(-0.9 * g * Math.sqrt(bp / 1000));
  const dist = (bp, V, t) => 0.002134 * mob(bp) * V * t;
  const width = (V, t) => 0.1 + 0.012 * Math.sqrt(t) + Math.max(0, V - 120) * 0.006;
  const V = () => +$(".v").value, T = () => +$(".t").value;
  const key = () => `${g}%·${V()}V·${T()}분`;

  const tbl = L.table($(".tbl-host"), [
    { key: "k", label: "조건" }, { key: "l", label: "레인" }, { key: "bp", label: "알려진 크기 (bp)" }, { key: "d", label: "거리 (cm)", res: 0.1 }, { key: "est", label: "추정 크기 (bp)" },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawGel());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function curve() {
    const lin = $(".lin").checked;
    const rows = tbl.rows.filter((r) => r.k === key() && r.l === "M" && typeof r.bp === "number" && (!lin || (r.bp >= 500 && r.bp <= 5000)));
    return rows.length >= 2 ? L.linfit(rows.map((r) => r.d), rows.map((r) => Math.log10(r.bp))) : null;
  }

  function measure() {
    const v = V(), t = T(), wd = width(v, t), L0 = LANES[lane];
    if (!t) { $(".ep-msg").textContent = "아직 전류를 흘리지 않아 모든 DNA가 우물에 있습니다."; return; }
    const ds = L0.b.map((bp) => ({ bp, d: dist(bp, v, t) })).filter((x) => x.d <= GEL);
    const lost = L0.b.length - ds.length;
    // 너무 가까운 띠는 하나로 보임
    const seen = [];
    ds.forEach((x) => { const p = seen[seen.length - 1]; if (p && Math.abs(p.d - x.d) < wd * 0.9) { p.merged = true; p.d = (p.d + x.d) / 2; } else seen.push({ ...x }); });
    const f = curve();
    seen.forEach((x) => {
      const d = L.measure(x.d, { sd: 0.04, res: 0.1 });
      const est = lane && f ? Math.round(10 ** (f.a * d + f.b) / 10) * 10 : null;
      tbl.add({ k: key(), l: L0.n, bp: lane ? "?" : x.merged ? "겹침" : x.bp, d, est: lane ? (est ? est.toLocaleString() : "사다리 먼저") : "—" });
    });
    $(".ep-msg").textContent = lost ? `${lost}개 띠가 젤 끝을 지나 완충 용액으로 빠져나갔습니다.` : seen.some((x) => x.merged) ? "가까운 띠가 겹쳐 하나로 보이는 곳이 있습니다. 젤 농도를 바꿔 보세요." : "";
  }

  function drawGel() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = V(), t = T(), wd = width(v, t);
    const gx = 40, gy = 26, gw = w * 0.6, gh = h - 44, wellY = gy + 10;
    const Y = (d) => wellY + 6 + d / GEL * (gh - 22);
    ctx.fillStyle = "#1f2a33"; ctx.fillRect(gx, gy, gw, gh);
    // 전극 표시
    ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillStyle = C.ink; ctx.fillText("(−)", gx + gw + 6, gy + 12);
    ctx.fillStyle = C.apple; ctx.fillText("(+)", gx + gw + 6, gy + gh - 2);
    // 자 (cm)
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let c = 0; c <= GEL; c++) { const y = Y(c); ctx.fillRect(gx - 6, y, 5, 1); ctx.fillText(String(c), gx - 9, y + 3); }
    ctx.fillText("cm", gx - 9, gy + 2);
    // 로딩 염료 띠 (브로모페놀 블루, 자일렌 사이아놀)
    const lw = gw / LANES.length;
    [[300 / g ** 1.5, "rgba(80,90,230,.55)"], [4000 / g ** 1.5, "rgba(60,150,180,.45)"]].forEach(([bp, col]) => {
      const d = dist(bp, v, t); if (d > GEL) return;
      LANES.forEach((_, i) => { ctx.fillStyle = col; ctx.fillRect(gx + i * lw + lw * 0.2, Y(d) - 2, lw * 0.6, 4); });
    });
    LANES.forEach((ln, i) => {
      const x = gx + i * lw + lw * 0.2, bw = lw * 0.6;
      ctx.fillStyle = "#0e1418"; ctx.fillRect(x, wellY, bw, 5);
      ln.b.forEach((bp) => {
        const d = t ? dist(bp, v, t) : 0; if (d > GEL) return;
        const y = Y(d), hh = Math.max(1.5, 0.55 * wd / GEL * (gh - 22));
        const bright = i === 0 && (bp === 3000 || bp === 1000) ? 1 : 0.8;
        const gr = ctx.createLinearGradient(0, y - hh, 0, y + hh);
        gr.addColorStop(0, "rgba(255,170,60,0)"); gr.addColorStop(0.5, `rgba(255,190,90,${bright})`); gr.addColorStop(1, "rgba(255,170,60,0)");
        ctx.fillStyle = gr;
        const smile = v > 120 ? (v - 120) * 0.08 : 0;
        ctx.beginPath(); ctx.moveTo(x, y - hh + smile); ctx.quadraticCurveTo(x + bw / 2, y - hh - smile, x + bw, y - hh + smile); ctx.lineTo(x + bw, y + hh + smile); ctx.quadraticCurveTo(x + bw / 2, y + hh - smile, x, y + hh + smile); ctx.fill();
      });
      ctx.fillStyle = i === lane ? C.forest : C.ink2; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(ln.n, x + bw / 2, gy - 8);
    });
    // 사다리 설명서
    const lx = gx + gw + 40;
    ctx.textAlign = "left"; ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink;
    ctx.fillText("사다리 M (bp)", lx, gy + 6);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2;
    const step = Math.min(15, (gh - 40) / LADDER.length);
    LADDER.forEach((bp, i) => ctx.fillText(bp.toLocaleString(), lx, gy + 24 + i * step));
    ctx.fillStyle = C.ink3; ctx.fillText(`E ≈ ${(v / 12).toFixed(1)} V/cm`, lx, gy + gh - 2);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.k === key());
    const lad = rows.filter((r) => r.l === "M" && typeof r.bp === "number");
    const f = curve();
    const pts = lad.map((r) => ({ x: r.d, y: Math.log10(r.bp) }));
    const P = L.plot(ctx, { x0: 46, y0: 30, w: w - 60, h: h - 64 }, { pts, fit: f, xr: [0, GEL], yr: [2, 4.2], xlabel: "이동 거리 d (cm)", ylabel: "log₁₀(bp)" });
    const unk = rows.filter((r) => r.l !== "M");
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    if (f) {
      ctx.fillStyle = C.warn;
      ctx.fillText(`log(bp) = ${f.a.toFixed(3)}·d + ${f.b.toFixed(2)}`, 52, 44);
      unk.forEach((r) => {
        const y = f.a * r.d + f.b; ctx.strokeStyle = C.apple; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(P.X(r.d), P.Y(y), 4.5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = C.apple; ctx.fillText(r.l, P.X(r.d) + 6, P.Y(y) - 5);
      });
    }
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(`지금 조건 ${key()}의 기록만`, w - 14, 14);
  }

  const redraw = () => { $(".v-out").textContent = V(); $(".t-out").textContent = T(); drawGel(); drawPlot(); };
  [".v", ".t"].forEach((s) => $(s).addEventListener("input", redraw));
  $(".lin").addEventListener("change", drawPlot);
  const pick = (sel, attr, f) => root.querySelector(sel).addEventListener("click", (e) => { const b = e.target.closest(`[${attr}]`); if (!b) return; root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); f(b); redraw(); });
  pick(".gel", "data-g", (b) => { g = +b.dataset.g; });
  pick(".lane", "data-l", (b) => { lane = +b.dataset.l; });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => tbl.clear());
  redraw();

  if (L.demo) {
    for (lane = 0; lane < 4; lane++) measure();
    lane = 1; redraw();
  }
})();
