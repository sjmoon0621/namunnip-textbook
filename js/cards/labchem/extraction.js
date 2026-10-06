/* 카드: 같은 용매를 한 번에 쓸까, 나눠서 여러 번 쓸까? — 분액 깔때기와 분배 계수 */
(() => {
  const root = document.getElementById("card-labchem-extraction");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const VAQ = 100;

  /* K: 분배 계수 (대략값), rho: 유기 용매 밀도, m0: 처음 양 */
  const SOL = {
    i2: { name: "I₂", org: "헥세인", K: 30, rho: 0.66, m0: "20 mg", oc: [140, 50, 160], ac: [190, 130, 40], cmax: 0.55 },
    caf: { name: "카페인", org: "다이클로로메테인", K: 4.6, rho: 1.33, m0: "1.00 g", oc: [80, 140, 100], ac: [70, 110, 170], cmax: 0.35 },
  };
  let sk = "i2", run = null, t = 0;
  const sV = $(".v"), sN = $(".n");

  /* 참 결과: 회차마다 수층에 남는 비율 */
  function simulate() {
    const s = SOL[sk], V = +sV.value, n = +sN.value, shake = $(".shake").checked, vent = $(".vent").checked;
    const steps = [];
    let f = 1;
    for (let i = 0; i < n; i++) {
      const v = V / n * (vent ? 1 : 0.88);   /* 압력을 안 빼면 마개가 튀어 유기층 일부를 잃음 */
      let r = VAQ / (VAQ + s.K * v);
      if (!shake) r = 1 - 0.5 * (1 - r);   /* 평형의 절반만 도달 */
      const before = f; f *= r;
      steps.push({ before, after: f, v: V / n });
    }
    return { f, steps, V, n };
  }
  const theory = (n) => { const s = SOL[sk], V = +sV.value; return Math.pow(VAQ / (VAQ + s.K * V / n), n); };

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "용질" }, { key: "n", label: "n", res: 1 }, { key: "V", label: "V유기(mL)", res: 1 },
    { key: "f", label: "남은 비율(%)", res: 0.1 }, { key: "e", label: "추출률(%)", res: 0.1 }, { key: "K", label: "K 계산", res: 0.1 },
  ], () => drawPlot());

  function funnel(ctx, cx, top, H, W, st) {
    /* 분액 깔때기 몸통: 위 넓고 아래 좁은 배 모양 */
    const s = SOL[sk];
    const yb = top + H;   /* 몸통 아래 끝 */
    const halfW = (y) => { const u = (y - top) / H; return W / 2 * Math.sin(Math.PI * Math.min(1, 0.15 + u * 0.95)) * (1 - 0.75 * u) + 3; };
    const shakeX = st.shaking ? Math.sin(t * 40) * 4 : 0;
    ctx.save(); ctx.translate(shakeX, 0);
    /* 층 높이: 부피에 비례하는 근사 (아래가 좁으므로 위로 갈수록 덜 올라가게) */
    const vAq = st.vAq, vOrg = st.vOrg, vTot = vAq + vOrg;
    const yAt = (vol) => yb - (H * 0.9) * Math.pow(vol / 200, 0.75);
    const yTop = yAt(vTot);
    const dense = s.rho > 1, vLow = dense ? vOrg : vAq;
    const yMid = yAt(vLow);
    const col = (rgb, a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
    const aAq = Math.min(0.85, 0.06 + s.cmax * st.cAq * 1.6), aOrg = Math.min(0.85, 0.06 + s.cmax * st.cOrg * 1.6 / Math.max(1, s.K / 6));
    const band = (y0, y1, c) => {
      ctx.fillStyle = c; ctx.beginPath();
      for (let y = y0; y <= y1; y += 2) ctx.lineTo(cx - halfW(y), y);
      for (let y = y1; y >= y0; y -= 2) ctx.lineTo(cx + halfW(y), y);
      ctx.fill();
    };
    if (st.mixed) band(yTop, yb, "rgba(160,150,170,.35)");
    else {
      if (vOrg > 0) band(dense ? yMid : yTop, dense ? yb : yMid, col(s.oc, aOrg));
      band(dense ? yTop : yMid, dense ? yMid : yb, col(s.ac, aAq));
      if (vOrg > 0) { ctx.strokeStyle = C.ink2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx - halfW(yMid), yMid); ctx.lineTo(cx + halfW(yMid), yMid); ctx.stroke(); ctx.setLineDash([]); }
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let y = top; y <= yb; y += 2) ctx.lineTo(cx - halfW(y), y);
    ctx.lineTo(cx - 3, yb + 4); ctx.lineTo(cx - 3, yb + 40); ctx.moveTo(cx + 3, yb + 40); ctx.lineTo(cx + 3, yb + 4);
    for (let y = yb; y >= top; y -= 2) ctx.lineTo(cx + halfW(y), y);
    ctx.stroke();
    /* 목과 마개 */
    ctx.strokeRect(cx - 7, top - 16, 14, 16); ctx.fillStyle = C.ink2; ctx.fillRect(cx - 9, top - 24, 18, 9);
    /* 콕 */
    ctx.fillStyle = C.ink; ctx.fillRect(cx - 12, yb + 14, 24, 6);
    ctx.restore();
    return { yTop, yMid, yb, dense };
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = SOL[sk], V = +sV.value, n = +sN.value;
    let st;
    if (run) {
      const k = Math.min(run.sim.steps.length - 1, Math.floor(run.el / run.per)), ph = (run.el % run.per) / run.per, step = run.sim.steps[k];
      const after = ph > 0.35 ? step.after : step.before;
      const cAq = after, cOrg = ph > 0.35 ? (step.before - step.after) * VAQ / step.v : 0;
      st = { vAq: VAQ, vOrg: ph > 0.85 ? step.v * (1 - (ph - 0.85) / 0.15) : step.v, cAq, cOrg, shaking: ph < 0.35, mixed: ph < 0.3, k, ph };
    } else {
      st = { vAq: VAQ, vOrg: V / n, cAq: 1, cOrg: 0 };
    }
    const cx = w * 0.36, top = 52, H = h * 0.62, W = Math.min(150, w * 0.32);
    const g = funnel(ctx, cx, top, H, W, st);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    const lx = cx + W / 2 + 14;
    if (!st.mixed) {
      const upY = (g.yTop + g.yMid) / 2, lowY = (g.yMid + g.yb) / 2;
      const orgTxt = `${s.org} (${s.rho} g/mL)`, aqTxt = "물 (1.00 g/mL)";
      ctx.fillText("위층: " + (g.dense ? aqTxt : orgTxt), lx, upY + 4);
      ctx.fillText("아래층: " + (g.dense ? orgTxt : aqTxt), lx, Math.max(lowY + 4, upY + 20));
    } else ctx.fillText("흔드는 중 — 두 용매가 잘게 섞임", lx, g.yb - 30);
    /* 오른쪽 위: 회차 표시와 수층 잔량 막대 */
    const bx = w - 46, by0 = 30, bh = h - 70;
    ctx.strokeStyle = C.ink3; ctx.strokeRect(bx, by0, 18, bh);
    const rem = run ? st.cAq : 1;
    ctx.fillStyle = `rgba(${s.ac[0]},${s.ac[1]},${s.ac[2]},.55)`; ctx.fillRect(bx + 1, by0 + bh * (1 - rem), 16, bh * rem);
    ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText("수층에", bx + 9, by0 + bh + 14); ctx.fillText("남은 양", bx + 9, by0 + bh + 27);
    ctx.textAlign = "left"; ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink;
    const head = run ? `추출 ${st.k + 1} / ${run.sim.steps.length}` : `${(V / n).toFixed(V % n ? 1 : 0)} mL × ${n}회`;
    ctx.fillText(head, 10, 16);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText(`수층 100 mL · ${s.name} ${s.m0}`, 10, 31);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 18, w: w - 58, h: h - 52 };
    const mine = tbl.rows.filter((r) => r.s === "I₂").map((r) => ({ x: r.n, y: r.f }));
    const res = L.plot(ctx, box, { pts: mine, model: (x) => 100 * theory(Math.max(0.5, x)), xr: [0.5, 5.5], yr: [0, 60], xlabel: "나눠 쓴 횟수 n", ylabel: "수층에 남은 비율 (%)" });
    ctx.fillStyle = C.warn;
    tbl.rows.filter((r) => r.s !== "I₂").forEach((r) => { if (r.f > 60) return; ctx.beginPath(); ctx.rect(res.X(r.n) - 3.5, res.Y(r.f) - 3.5, 7, 7); ctx.fill(); });
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = C.forest; ctx.fillText("● I₂/헥세인", box.x0 + box.w - 4, box.y0 + 14);
    ctx.fillStyle = C.warn; ctx.fillText("■ 카페인/다이클로로메테인", box.x0 + box.w - 4, box.y0 + 29);
    ctx.fillStyle = C.ink3; ctx.fillText(`점선: 이론값 (${SOL[sk].name}, V = ${sV.value} mL)`, box.x0 + box.w - 4, box.y0 + 44);
  }

  function record(sim) {
    const f = Math.max(0.0005, L.measure(sim.f, { rel: 0.02, sd: 0.001 }));
    const n = sim.n, v = sim.V / n;
    const K = (Math.pow(f, -1 / n) - 1) * VAQ / v;
    tbl.add({ s: SOL[sk].name, n, V: sim.V, f: f * 100, e: (1 - f) * 100, K });
  }
  function msg() {
    const m = [];
    if (!$(".vent").checked) m.push("압력을 빼지 않아 마개가 튀어 유기층 일부가 샜습니다. 실제로는 얼굴·옷에 튈 수 있어 위험합니다.");
    if (!$(".shake").checked) m.push("덜 흔들면 평형에 이르지 못합니다.");
    $(".ex-msg").textContent = m.join(" ");
  }

  loop($(".cv-wide"), (dt) => {
    t += dt;
    if (run) { run.el += dt; if (run.el >= run.per * run.sim.steps.length + 0.3) { record(run.sim); run = null; } }
    draw();
  });
  const upd = () => { $(".v-out").textContent = sV.value; $(".n-out").textContent = sN.value; draw(); drawPlot(); };
  [sV, sN].forEach((el) => el.addEventListener("input", () => { if (!run) upd(); }));
  [".shake", ".vent"].forEach((c) => $(c).addEventListener("change", msg));
  $(".sol").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b || run) return;
    sk = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  $(".meas").addEventListener("click", () => { if (!run) run = { sim: simulate(), el: 0, per: 1.3 }; });
  $(".clear").addEventListener("click", () => { run = null; tbl.clear(); });
  upd(); msg();
  if (L.demo) {
    sV.value = 30;
    [["i2", 1], ["i2", 2], ["i2", 3], ["i2", 5], ["caf", 1], ["caf", 2], ["caf", 3], ["caf", 5]]
      .forEach(([s, n]) => { sk = s; sN.value = n; record(simulate()); });
    sk = "caf"; sN.value = 3; root.querySelector('[data-s="caf"]').click();
  }
})();
