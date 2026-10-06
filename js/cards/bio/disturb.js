/* 카드: 생태계의 한 고리를 빼거나 더하면 어떻게 될까? — 식물·사슴·늑대 먹이 사슬과 외래종의 교란·회복 (교육용 모형) */
(() => {
  const root = document.getElementById("card-bio-disturb");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvW, cvT] = root.querySelectorAll("canvas");
  /* 로지스틱 생장 + 선형 섭식(로트카–볼테라형) + 약한 밀도 의존. 시간 단위: 년, 개체 수는 모형의 상대 단위 */
  const p = { r: 0.8, a: 1.0, ax: 0.9, e: 0.6, mH: 0.25, b: 1.5, qH: 0.08, eW: 0.6, mW: 0.08, qW: 0.3, eX: 0.5, mX: 0.12, qX: 0.35, bx: 0.4 };
  const TEND = 100, SPEED = 10;
  const SPC = [
    { k: "P", n: "식물", c: C.leaf },
    { k: "H", n: "사슴", c: "#a0703c" },
    { k: "W", n: "늑대", c: "#555a66" },
    { k: "X", n: "외래 초식 동물", c: C.warn },
  ];
  const env = { K: 1, hunt: 0 };
  function deriv(s) {
    const { P, H, W, X } = s;
    return {
      P: p.r * P * (1 - P / env.K) - p.a * P * H - p.ax * P * X,
      H: H * (p.e * P - p.mH - p.b * W - p.qH * H - env.hunt),
      W: W * (p.eW * H - p.mW - p.qW * W),
      X: X * (p.eX * P - p.mX - p.qX * X - p.bx * W),
    };
  }
  function step(s, dt) { const k = deriv(s); for (const q in s) s[q] = Math.max(0, s[q] + k[q] * dt); }
  /* 처음 평형 (기준 = 100) */
  const EQ = (() => { const s = { P: 0.8, H: 0.2, W: 0.1, X: 0 }; for (let i = 0; i < 20000; i++) step(s, 0.02); return s; })();
  const rel = (s, k) => (k === "X" ? (s.X / EQ.H) * 100 : (s[k] / EQ[k]) * 100);   /* 외래종은 사슴의 처음 평형을 기준으로 */

  const EV = {
    wolfOut: ["늑대 제거", (s) => { s.W = 0; }],
    wolfIn: ["늑대 풀어 줌", (s) => { if (s.W < 0.02) s.W = 0.02; }],
    xIn: ["외래종 유입", (s) => { if (s.X < 0.02) s.X = 0.02; }],
    xOut: ["외래종 퇴치", (s) => { s.X = 0; }],
    habLoss: ["서식지 훼손", () => { env.K = 0.6; }],
    habBack: ["서식지 복원", () => { env.K = 1; }],
    huntOn: ["사슴 남획 시작", () => { env.hunt = 0.15; }],
    huntOff: ["남획 중지", () => { env.hunt = 0; }],
  };
  const SCN = {
    calm: [],
    wolfOut: [[10, "wolfOut"]],
    yellow: [[10, "wolfOut"], [50, "wolfIn"]],
    alien: [[10, "xIn"], [65, "xOut"]],
    habitat: [[10, "habLoss"], [55, "habBack"]],
    hunt: [[10, "huntOn"], [60, "huntOff"]],
  };
  let st, t, ser, marks, plan, scn = "yellow", run = true;
  function reset(name) {
    scn = name; st = { ...EQ }; t = 0; env.K = 1; env.hunt = 0; ser = [snap()]; marks = []; plan = SCN[name].slice(); run = true;
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === name)));
  }
  function snap() { return { t, P: rel(st, "P"), H: rel(st, "H"), W: rel(st, "W"), X: rel(st, "X") }; }
  function fire(key) { EV[key][1](st); marks.push({ t, key }); }
  function advance(years) {
    const dt = 0.02; let n = Math.round(years / dt);
    while (n-- > 0 && t < TEND) {
      while (plan.length && plan[0][0] <= t + 1e-9) fire(plan.shift()[1]);
      step(st, dt); t += dt;
      if (t - ser[ser.length - 1].t >= 0.25 - 1e-9) ser.push(snap());
    }
    if (t >= TEND - 1e-9) run = false;
  }

  const A = fit(cvW, () => drawWeb());
  const B = fit(cvT, () => drawPlot());
  function arrow(ctx, x1, y1, x2, y2, wdt, col) {
    const an = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wdt;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(an) * 6, y2 - Math.sin(an) * 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 9 * Math.cos(an - 0.4), y2 - 9 * Math.sin(an - 0.4)); ctx.lineTo(x2 - 9 * Math.cos(an + 0.4), y2 - 9 * Math.sin(an + 0.4)); ctx.closePath(); ctx.fill();
  }
  function drawWeb() {
    const { ctx, size: { w, h } } = A; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const R0 = Math.min(h * 0.085, w * 0.06);
    const xIn = st.X > 1e-4 || marks.some((m) => m.key === "xIn");
    const pos = { W: [w * 0.5, h * 0.17], H: [w * (xIn ? 0.33 : 0.5), h * 0.5], X: [w * 0.67, h * 0.5], P: [w * 0.5, h * 0.8] };
    const rad = (k) => R0 * Math.min(1.9, Math.sqrt(Math.max(rel(st, k), 0) / 100));
    const edge = (from, to, wd) => {
      const [x1, y1] = pos[from], [x2, y2] = pos[to], an = Math.atan2(y2 - y1, x2 - x1);
      const r1 = from === "P" ? 0 : rad(from) + 4, r2 = rad(to) + 6;
      const sx = x1 + Math.cos(an) * r1, sy = from === "P" ? y1 - h * 0.08 : y1 + Math.sin(an) * r1;
      arrow(ctx, sx, sy, x2 - Math.cos(an) * Math.max(r2, 14), y2 - Math.sin(an) * Math.max(r2, 14), wd, "rgba(93,93,97,.55)");
    };
    /* 식물: 땅 띠와 풀 */
    const pr = Math.max(0, rel(st, "P")) / 100;
    ctx.fillStyle = "#e7e1c9"; ctx.fillRect(w * 0.12, h * 0.86, w * 0.76, h * 0.08);
    const nb = Math.round(40 * Math.min(pr, 1.4));
    ctx.strokeStyle = C.leaf; ctx.lineWidth = 2;
    for (let i = 0; i < nb; i++) { const x = w * 0.13 + ((i * 37) % 56) / 56 * w * 0.74, hh = h * (0.05 + 0.04 * ((i * 13) % 7) / 7) * Math.min(1, pr + 0.2); ctx.beginPath(); ctx.moveTo(x, h * 0.86); ctx.quadraticCurveTo(x - 3, h * 0.86 - hh * 0.6, x + 2, h * 0.86 - hh); ctx.stroke(); }
    edge("P", "H", 1.6);
    if (xIn) edge("P", "X", 1.6);
    edge("H", "W", 1.6);
    if (xIn) edge("X", "W", 0.8);
    ["W", "H", "X"].forEach((k) => {
      if (k === "X" && !xIn) return;
      const sp = SPC.find((s) => s.k === k), [x, y] = pos[k], v = rel(st, k), r = rad(k);
      if (v < 0.5) { ctx.setLineDash([3, 3]); ctx.strokeStyle = sp.c; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, R0 * 0.6, 0, 6.283); ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.fillStyle = sp.c; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
      const lx = x + Math.max(r, R0 * 0.6) + 8;
      ctx.fillText(sp.n, lx, y - 2);
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = v < 0.5 ? C.warn : C.ink2; ctx.fillText(v < 0.5 ? "없음" : v.toFixed(0), lx, y + 13);
    });
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("식물", w * 0.12, h * 0.83);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(rel(st, "P").toFixed(0), w * 0.12 + 32, h * 0.83);
    ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink; ctx.fillText(`${Math.min(t, TEND).toFixed(0)}년째`, 10, 20);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3;
    const cond = [env.K < 1 ? "서식지 60%" : "", env.hunt > 0 ? "사슴 남획 중" : ""].filter(Boolean).join(" · ");
    if (cond) { ctx.fillStyle = C.warn; ctx.fillText(cond, 10, 38); }
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.fillText("화살표: 먹히는 쪽 → 먹는 쪽", w - 10, 20);
  }
  function drawPlot() {
    const { ctx, size: { w, h } } = B; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 38, y0 = 30, pw = w - x0 - 16, ph = h - y0 - 38, ymax = 250;
    const X = (v) => x0 + (v / TEND) * pw, Y = (v) => y0 + ph - (Math.min(v, ymax) / ymax) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 20, 40, 60, 80, 100].map((v) => [v, String(v)]), yt: [0, 50, 100, 150, 200, 250].map((v) => [v, String(v)]), xlabel: "시간 (년)", ylabel: "처음 평형 = 100" });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(100)); ctx.lineTo(x0 + pw, Y(100)); ctx.stroke(); ctx.setLineDash([]);
    /* 개입 표시 */
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    marks.forEach((m, i) => {
      const x = X(m.t);
      ctx.strokeStyle = "rgba(181,83,47,.5)"; ctx.beginPath(); ctx.moveTo(x + 0.5, y0); ctx.lineTo(x + 0.5, y0 + ph); ctx.stroke();
      ctx.fillStyle = C.warn; const lab = EV[m.key][0], tw = ctx.measureText(lab).width;
      ctx.fillText(lab, Math.min(x + 3, x0 + pw - tw), y0 + 11 + (i % 2) * 13);
    });
    const showX = ser.some((s) => s.X > 0.5);
    SPC.forEach((sp) => {
      if (sp.k === "X" && !showX) return;
      ctx.strokeStyle = sp.c; ctx.lineWidth = sp.k === "P" ? 2.6 : 2; ctx.beginPath();
      ser.forEach((s, i) => { const px = X(s.t), py = Y(s[sp.k]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
      ctx.stroke();
    });
    /* 범례 */
    ctx.font = `11px ${F.sans}`;
    let lx = x0 + pw - SPC.reduce((a, sp) => a + (sp.k === "X" && !showX ? 0 : ctx.measureText(sp.n).width + 30), 0) + 14;
    SPC.forEach((sp) => { if (sp.k === "X" && !showX) return; ctx.fillStyle = sp.c; ctx.fillRect(lx, 8, 12, 3); ctx.fillStyle = C.ink2; ctx.fillText(sp.n, lx + 16, 13); lx += ctx.measureText(sp.n).width + 30; });
  }
  function status() {
    const k = deriv(st), sp = Math.abs(k.P / EQ.P) + Math.abs(k.H / EQ.H) + Math.abs(k.W / EQ.W) + Math.abs(k.X / EQ.H);
    const back = ["P", "H", "W"].every((q) => Math.abs(rel(st, q) - 100) < 3) && st.X < 1e-3;
    const v = $(".verdict");
    if (!marks.length) { v.textContent = "개입이 없으면 세 개체군은 처음 평형을 그대로 유지합니다. 아래 버튼으로 한 고리를 빼거나 더해 보세요."; v.className = "verdict small"; }
    else if (sp > 0.01) { v.textContent = "교란 뒤 개체군들이 서로 영향을 주고받으며 변하는 중입니다."; v.className = "verdict small"; }
    else if (back) { v.textContent = "처음 평형으로 돌아왔습니다. 교란 요인이 사라지면 먹이 관계가 생태계를 원래 상태로 되돌립니다(복원력)."; v.className = "verdict small good"; }
    else { v.textContent = "새로운 평형에 이르렀습니다. 원인이 남아 있거나 사라진 종이 돌아오지 않으면 생태계는 처음 상태로 돌아가지 않습니다."; v.className = "verdict small bad"; }
    $(".v-P").textContent = rel(st, "P").toFixed(0); $(".v-H").textContent = rel(st, "H").toFixed(0);
    $(".v-W").textContent = st.W < 1e-3 ? "없음" : rel(st, "W").toFixed(0); $(".v-X").textContent = st.X < 1e-3 ? "없음" : rel(st, "X").toFixed(0);
    $(".play").textContent = run ? "멈춤" : t >= TEND ? "처음부터" : "계속";
  }
  function draw() { drawWeb(); drawPlot(); status(); }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { reset(b.dataset.s); draw(); }));
  root.querySelectorAll("[data-e]").forEach((b) => b.addEventListener("click", () => { if (t >= TEND) return; fire(b.dataset.e); if (!run) run = true; draw(); }));
  $(".play").addEventListener("click", () => { if (t >= TEND) reset(scn); else run = !run; draw(); });
  loop(cvT, (dt) => { if (!run) return; advance(dt * SPEED); draw(); });
  const dm = location.search.match(/[?&]demo(?:=(\w+))?\b/);
  reset(dm && SCN[dm[1]] ? dm[1] : "yellow");
  if (dm) { advance(78); run = false; }
  draw();
})();
