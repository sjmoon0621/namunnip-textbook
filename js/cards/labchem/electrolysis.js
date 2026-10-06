/* 카드: 흘린 전하량으로 전극에 생길 물질의 양을 미리 맞힐 수 있을까? — 구리 전극 전기 분해, 호프만 장치 */
(() => {
  const root = document.getElementById("card-labchem-electrolysis");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  const FA = 96485, MCU = 63.55, VM = 24.5;   // C/mol, g/mol, L/mol (25 °C, 1 atm)
  let mode = "cu", run = null, lastRes = null;
  const m0 = { c: 12.000 + 2 * Math.random(), a: 12.000 + 2 * Math.random() };   // 처음 전극 질량 (g)

  const tbl = L.table($(".tbl-host"), [
    { key: "k", label: "장치" }, { key: "I", label: "I (A)", res: 0.01 }, { key: "t", label: "t (s)", res: 1 }, { key: "Q", label: "Q (C)", res: 1 },
    { key: "p", label: "예측" }, { key: "a", label: "(−)극" }, { key: "b", label: "(+)극" }, { key: "e", label: "효율 %", res: 0.1 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  const setI = () => +$(".i").value, setT = () => +$(".t").value * 60;
  const pred = (I, t) => {
    const ne = I * t / FA;
    return mode === "cu" ? { txt: `Cu ${(ne / 2 * MCU).toFixed(3)} g`, s: (ne / 2 * MCU).toFixed(3), ne } : { txt: `H₂ ${(ne / 2 * VM * 1000).toFixed(1)} mL, O₂ ${(ne / 4 * VM * 1000).toFixed(1)} mL`, s: `${(ne / 2 * VM * 1000).toFixed(1)}/${(ne / 4 * VM * 1000).toFixed(1)}`, ne };
  };

  /* 실제로 일어난 일 (참값 + 잡음) */
  function outcome(I, t) {
    const Itrue = I * (1 + 0.01 * L.gauss()), ne = Itrue * t / FA, wet = $(".wet").checked;
    if (mode === "cu") {
      const gain = ne / 2 * MCU * (0.985 + 0.004 * L.gauss()) * (I > 0.8 ? 0.97 : 1);   // 큰 전류: 푸석한 석출물 일부 떨어짐
      const loss = ne / 2 * MCU * (1.02 + 0.008 * Math.abs(L.gauss()));               // 양극 부스러기
      const wc = wet ? 0.02 + 0.01 * Math.random() : 0, wa = wet ? 0.02 + 0.01 * Math.random() : 0;
      const c1 = L.measure(m0.c + gain + wc, { sd: 0.0015, res: 0.001 }), a1 = L.measure(m0.a - loss + wa, { sd: 0.0015, res: 0.001 });
      const c0 = L.snap(m0.c, 0.001), a0 = L.snap(m0.a, 0.001);
      m0.c += gain; m0.a -= loss;
      return { dc: c1 - c0, da: a1 - a0, wet };
    }
    const h2 = ne / 2 * VM * 1000 * 1.032 * 0.99 - 0.3, o2 = ne / 4 * VM * 1000 * 1.032 * 0.95 - 0.8;   // 수증기 포함 습한 기체, 용해
    return { h2: h2 > 50 ? NaN : L.measure(Math.max(0, h2), { sd: 0.1, res: 0.1 }), o2: o2 > 50 ? NaN : L.measure(Math.max(0, o2), { sd: 0.1, res: 0.1 }) };
  }
  function record(I, t, o) {
    const Ir = L.snap(I, 0.01), Q = Ir * t, p = pred(Ir, t), ne = Q / FA;
    if (mode === "cu") {
      const th = ne / 2 * MCU;
      tbl.add({ k: o.wet ? "Cu·젖음 g" : "Cu g", mk: "cu", I: Ir, t, Q, p: p.s, a: `+${o.dc.toFixed(3)}`, b: o.da.toFixed(3), e: o.dc / th * 100, nc: o.dc / MCU, na: -o.da / MCU });
      lastRes = { m: `+${o.dc.toFixed(3)} / ${o.da.toFixed(3)} g`, e: `${(o.dc / th * 100).toFixed(1)}% (−극)` };
    } else {
      const th = ne / 2 * VM * 1000;
      const ok = Number.isFinite(o.h2) && Number.isFinite(o.o2);
      tbl.add({ k: "물 mL", mk: "h2o", I: Ir, t, Q, p: p.s, a: ok ? o.h2.toFixed(1) : "넘침", b: ok ? o.o2.toFixed(1) : "넘침", e: ok ? o.h2 / th * 100 : NaN, nh: ok ? o.h2 / 1000 / VM : NaN, no: ok ? o.o2 / 1000 / VM : NaN });
      lastRes = ok ? { m: `${o.h2.toFixed(1)} : ${o.o2.toFixed(1)} mL`, e: `H₂/O₂ = ${(o.h2 / o.o2).toFixed(2)}` } : { m: "눈금 넘침", e: "—" };
    }
    nums();
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = run ? Math.min(1, run.el / run.t) : 0, on = !!run;
    // 전원 장치
    const px = 12, py = 12, pw = Math.min(150, w * 0.34), ph = 66;
    ctx.fillStyle = "#e9e7df"; ctx.fillRect(px, py, pw, ph); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(px, py, pw, ph);
    ctx.fillStyle = C.night; ctx.fillRect(px + 8, py + 8, pw - 16, 30);
    ctx.fillStyle = on ? "#9fe08a" : "#5c6a58"; ctx.font = `600 15px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(`${on ? L.snap(run.I * (1 + 0.004 * Math.sin(run.el)), 0.01).toFixed(2) : "0.00"} A`, px + pw - 14, py + 29);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    const el = run ? Math.min(run.t, run.el) : 0;
    ctx.fillText(`⏱ ${String(Math.floor(el / 60)).padStart(2, "0")}:${String(Math.floor(el % 60)).padStart(2, "0")}`, px + 8, py + 56);
    ctx.fillStyle = C.ink; ctx.fillText("−", px + pw - 34, py + 56); ctx.fillStyle = C.apple; ctx.fillText("+", px + pw - 16, py + 56);
    const wl = px + pw - 32, wr = px + pw - 13;
    if (mode === "cu") {
      const bx = w * 0.62, bw = Math.min(170, w * 0.4), bt = h * 0.38, bb = h - 12;
      ctx.fillStyle = "rgba(70,140,225,.45)"; ctx.fillRect(bx - bw / 2, bt + 18, bw, bb - bt - 18);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(bx - bw / 2, bt); ctx.lineTo(bx - bw / 2, bb); ctx.lineTo(bx + bw / 2, bb); ctx.lineTo(bx + bw / 2, bt); ctx.stroke();
      const ex = [bx - bw * 0.25, bx + bw * 0.25], thick = [10 + 3 * f, 10 - 2 * f];
      ex.forEach((x, i) => { ctx.fillStyle = i === 0 ? "#b5612e" : "#c7773d"; ctx.fillRect(x - thick[i] / 2, bt - 30, thick[i], bb - bt + 10); });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(wl, py + ph); ctx.lineTo(wl, py + ph + 14); ctx.lineTo(ex[0], py + ph + 14); ctx.lineTo(ex[0], bt - 30); ctx.stroke();
      ctx.strokeStyle = C.apple; ctx.beginPath(); ctx.moveTo(wr, py + ph); ctx.lineTo(wr, py + ph + 6); ctx.lineTo(ex[1], py + ph + 6); ctx.lineTo(ex[1], bt - 30); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
      ctx.textAlign = "right"; ctx.fillText("(−)극", bx - bw / 2 - 8, bt + 40); ctx.fillText("Cu 석출", bx - bw / 2 - 8, bt + 55);
      ctx.textAlign = "left"; ctx.fillText("(+)극", bx + bw / 2 + 8, bt + 40); ctx.fillText("Cu 녹음", bx + bw / 2 + 8, bt + 55);
      if (on) { ctx.fillStyle = "rgba(160,110,70,.7)"; for (let i = 0; i < 5; i++) ctx.fillRect(ex[1] - 6 + i * 3, bb - 4 - (i % 2) * 2, 2, 2); }
    } else {
      const cx = w * 0.62, tw = 22, tt = 14, tb = h - 40, gap = Math.min(110, w * 0.26);
      const tubes = [[cx - gap / 2, "H₂", C.ink], [cx + gap / 2, "O₂", C.apple]];
      const ne = run ? run.I * Math.min(run.t, run.el) / FA : 0;
      const vol = [ne / 2 * VM * 1000, ne / 4 * VM * 1000];
      ctx.fillStyle = "rgba(205,225,240,.8)"; ctx.fillRect(cx - gap / 2, tb - 12, gap, 12);
      ctx.fillRect(cx - 8, tt + 20, 16, tb - tt - 20);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(cx - 8, tt + 20, 16, tb - tt - 20);
      ctx.beginPath(); ctx.arc(cx, tt + 14, 12, Math.PI * 0.15, Math.PI * 0.85, true); ctx.stroke();
      tubes.forEach(([x, lab, col], i) => {
        const gh = Math.min(1, vol[i] / 50) * (tb - tt - 40);
        ctx.fillStyle = "rgba(205,225,240,.8)"; ctx.fillRect(x - tw / 2 + 1, tt + 1 + gh, tw - 2, tb - tt - 2 - gh);
        ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.strokeRect(x - tw / 2, tt, tw, tb - tt);
        ctx.fillStyle = C.ink3; for (let k = 0; k <= 50; k += 10) ctx.fillRect(x - tw / 2, tt + (tb - tt - 40) * k / 50, 5, 1);
        ctx.fillStyle = col; ctx.fillRect(x - 3, tb - 26, 6, 22);
        ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab, x, tb + 14);
        if (on) { ctx.fillStyle = "#fff"; for (let b = 0; b < 4; b++) { ctx.beginPath(); ctx.arc(x - 4 + b * 3, tb - 30 - ((run.el * 40 + b * 23) % (tb - tt - 40 - gh)), 1.6, 0, Math.PI * 2); ctx.fill(); } }
      });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(wl, py + ph); ctx.lineTo(wl, tb + 24); ctx.lineTo(tubes[0][0], tb + 24); ctx.lineTo(tubes[0][0], tb - 4); ctx.stroke();
      ctx.strokeStyle = C.apple; ctx.beginPath(); ctx.moveTo(wr, py + ph); ctx.lineTo(wr, tb + 30); ctx.lineTo(tubes[1][0], tb + 30); ctx.lineTo(tubes[1][0], tb - 4); ctx.stroke();
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 48, y0: 18, w: w - 62, h: h - 52 };
    const rows = tbl.rows.filter((r) => r.mk === mode);
    const qmax = Math.max(400, ...rows.map((r) => r.Q)) * 1.1;
    if (mode === "cu") {
      const pc = rows.map((r) => ({ x: r.Q, y: r.nc * 1000 })), fc = rows.length > 1 ? L.linfit(rows.map((r) => r.Q), rows.map((r) => r.nc * 1000), true) : null;
      const P = L.plot(ctx, box, { pts: pc, model: (q) => q / 2 / FA * 1000, fit: fc, xr: [0, qmax], yr: [0, qmax / 2 / FA * 1000 * 1.15], xlabel: "전하량 Q (C)", ylabel: "Cu (mmol)" });
      ctx.fillStyle = C.warn; rows.forEach((r) => { ctx.beginPath(); ctx.rect(P.X(r.Q) - 3, P.Y(r.na * 1000) - 3, 6, 6); ctx.fill(); });
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillStyle = C.forest; ctx.fillText("● (−)극에 붙은 Cu", box.x0 + 8, box.y0 + 14);
      ctx.fillStyle = C.warn; ctx.fillText("■ (+)극에서 줄어든 Cu", box.x0 + 8, box.y0 + 30);
      ctx.fillStyle = C.ink3; ctx.fillText("점선: 이론 Q/2F", box.x0 + 8, box.y0 + 46);
      if (fc) { ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText(`기울기로 구한 F = ${Math.round(1 / (2 * fc.a / 1000))} C/mol`, box.x0 + box.w - 6, box.y0 + box.h - 8); }
    } else {
      const ok = rows.filter((r) => Number.isFinite(r.nh));
      const P = L.plot(ctx, box, { pts: ok.map((r) => ({ x: r.Q, y: r.nh * 1000 })), model: (q) => q / 2 / FA * 1000, xr: [0, qmax], yr: [0, qmax / 2 / FA * 1000 * 1.15], xlabel: "전하량 Q (C)", ylabel: "기체 (mmol)" });
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(P.X(0), P.Y(0)); ctx.lineTo(P.X(qmax), P.Y(qmax / 4 / FA * 1000)); ctx.stroke(); ctx.restore();
      ctx.fillStyle = C.apple; ok.forEach((r) => { ctx.beginPath(); ctx.rect(P.X(r.Q) - 3, P.Y(r.no * 1000) - 3, 6, 6); ctx.fill(); });
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillStyle = C.forest; ctx.fillText("● H₂  (이론 Q/2F)", box.x0 + 8, box.y0 + 14);
      ctx.fillStyle = C.apple; ctx.fillText("■ O₂  (이론 Q/4F)", box.x0 + 8, box.y0 + 30);
    }
  }

  function nums() {
    $(".n-p").textContent = pred(setI(), setT()).txt;
    $(".n-m").textContent = lastRes ? lastRes.m : "—";
    $(".n-e").textContent = lastRes ? lastRes.e : "—";
  }
  loop($(".cv-wide"), (dt) => {
    if (run) {
      run.el += dt * run.t / 6;   // 한 번 실행을 6초에
      if (run.el >= run.t) { record(run.I, run.t, outcome(run.I, run.t)); run = null; }
    }
    drawApp();
  });
  $(".mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b || run) return;
    mode = b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".wet").disabled = mode !== "cu"; lastRes = null; nums(); drawApp(); drawPlot();
  });
  const upd = () => { $(".i-out").textContent = setI().toFixed(2); $(".t-out").textContent = $(".t").value; lastRes = null; nums(); };
  [$(".i"), $(".t")].forEach((el) => el.addEventListener("input", upd));
  $(".run").addEventListener("click", () => { if (!run) run = { I: setI(), t: setT(), el: 0 }; });
  $(".clear").addEventListener("click", () => { tbl.clear(); lastRes = null; nums(); });
  upd();

  if (L.demo) {
    const go = (I, min) => { $(".i").value = I; $(".t").value = min; record(I, min * 60, outcome(I, min * 60)); };
    go(0.3, 10); go(0.5, 10); go(0.5, 20); go(0.8, 15); go(1.0, 20);
    $(".wet").checked = true; go(0.5, 20); $(".wet").checked = false;
    mode = "h2o"; go(0.2, 5); go(0.3, 8); go(0.4, 10); go(0.5, 10); mode = "cu"; go(0.5, 20);
    $(".i").value = 0.5; $(".t").value = 20; $(".i-out").textContent = "0.50"; $(".t-out").textContent = "20";
    run = null; nums(); drawPlot();
  }
})();
