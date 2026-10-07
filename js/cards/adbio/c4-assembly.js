/* 카드: 산탄총 염기 서열 분석과 조립 — 무작위 읽기 모의 + 랜더–워터먼 이론 (대장균 유전체 길이) */
(() => {
  const root = document.getElementById("card-adbio-assembly");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".cov"), oC = $(".c-out"), rep = $(".rep");
  const G = 4641652, TH = 0.2, REP = 5000, NREP = 7;
  let L = 150, sim = null, pending = false;

  function run() {
    const c = +sC.value, N = Math.round(c * G / L), T = TH * L;
    const st = new Float64Array(N);
    for (let i = 0; i < N; i++) st[i] = Math.random() * (G - L);
    st.sort();
    const segs = [];
    let s0 = st[0], e = st[0] + L, unc = st[0];
    for (let i = 1; i < N; i++) {
      const s = st[i];
      if (s > e - T) {
        segs.push([s0, e]);
        if (s > e) unc += s - e;
        s0 = s;
      }
      if (s + L > e) e = s + L;
    }
    segs.push([s0, e]); unc += G - e;
    let contigs = segs.length;
    const repBreak = rep.checked && L < REP + 2 * T;
    if (repBreak) contigs += NREP;
    sim = { c, N, segs, contigs, unc: unc / G, repBreak, theory: N * Math.exp(-c * (1 - TH)) };
  }
  const theo = (c, l) => (c * G / l) * Math.exp(-c * (1 - TH));

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w || !sim) return;
    ctx.clearRect(0, 0, w, h);
    const bx0 = 10, bx1 = w - 10, by = 30, bh = 16;
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`대장균 유전체 4.64 Mb 위의 콘티그 (${L === 150 ? "짧은 읽기" : "긴 읽기"}, ${sim.c}×)`, bx0, 18);
    ctx.fillStyle = "rgba(181,83,47,.35)"; ctx.fillRect(bx0, by, bx1 - bx0, bh);
    const X = (p) => bx0 + p / G * (bx1 - bx0);
    sim.segs.forEach(([a, b], i) => {
      ctx.fillStyle = i % 2 ? "#3f6fa3" : "#7ea3cb";
      ctx.fillRect(X(a), by, Math.max(0.6, X(b) - X(a)), bh);
    });
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    [0, 1, 2, 3, 4].forEach((m) => { ctx.textAlign = m ? "center" : "left"; ctx.fillText(`${m} Mb`, X(m * 1e6), by + bh + 12); });
    ctx.textAlign = "right";
    ctx.fillText("붉은 바탕 = 이어지지 않은 곳", bx1, 18);

    /* 아래: 콘티그 수 대 커버리지 (로그) */
    const x0 = 44, x1 = w - 14, y0 = h - 30, y1 = by + bh + 44;
    const PX = (c) => x0 + c / 40 * (x1 - x0), PY = (n) => y0 - Math.log10(Math.max(1, n)) / 5 * (y0 - y1);
    NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, X: PX, Y: (v) => y0 - v / 5 * (y0 - y1),
      xt: [0, 10, 20, 30, 40].map((c) => [c, `${c}×`]),
      yt: [0, 1, 2, 3, 4, 5].map((v) => [v, v === 0 ? "1" : "10" + "¹²³⁴⁵"[v - 1]]),
      xlabel: "커버리지 c", ylabel: "콘티그 수 (로그)" });
    const curve = (l, col, lab) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
      for (let c = 0.5; c <= 40.001; c += 0.25) {
        let n = theo(c, l); if (rep.checked && l < REP + 2 * TH * l) n += NREP;
        const x = PX(c), y = PY(n);
        c === 0.5 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = col; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left";
      const lc = l === 150 ? 3.2 : 1.6;
      ctx.fillText(lab, PX(lc) + 6, PY(theo(lc, l)) - 6);
    };
    curve(150, "#3f6fa3", "이론: 150 bp");
    curve(15000, C.forest, "이론: 15 kb");
    if (rep.checked) {
      ctx.strokeStyle = C.warn; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, PY(NREP + 1)); ctx.lineTo(x1, PY(NREP + 1)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText("짧은 읽기의 바닥: 반복 7벌로 끊김", x1 - 2, PY(NREP + 1) - 5);
    }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(PX(sim.c), PY(sim.contigs), 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
  }

  const fmt = (n) => n.toLocaleString("en-US");
  function update() {
    root.querySelectorAll("[data-L]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.L === L)));
    oC.textContent = sC.value;
    run();
    $(".n-n").textContent = fmt(sim.N);
    const u = sim.unc, t = Math.exp(-sim.c);
    const pc = (x) => (x >= 0.001 ? `${(x * 100).toFixed(1)}%` : x > 0 ? `${(x * 100).toExponential(0)}%` : "0%");
    $(".n-u").textContent = `${pc(u)} / ${pc(t)}`;
    $(".n-c").textContent = fmt(sim.contigs) + (sim.repBreak ? " (반복 7 포함)" : "");
    $(".n-t").textContent = sim.theory >= 10 ? fmt(Math.round(sim.theory)) : sim.theory.toFixed(1);
    draw();
  }
  const sched = () => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; update(); }); };
  root.querySelectorAll("[data-L]").forEach((b) => b.addEventListener("click", () => { L = +b.dataset.L; sched(); }));
  sC.addEventListener("input", sched); rep.addEventListener("change", sched);
  update();
})();
