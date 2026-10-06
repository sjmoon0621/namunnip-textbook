/* 카드: 축전기가 다 차는 데 걸리는 시간은 무엇이 정할까? — RC 충전·방전, RL 전류 증가, 63%·반감 시간·로그 기울기로 τ 구하기 */
(() => {
  const root = document.getElementById("card-labphy-rc");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  /* 부품: 표시값(nom)과 실제값(tru, 화면에 나오지 않음) */
  const RC_R = [["1 kΩ", 1e3, 0.987e3], ["2.2 kΩ", 2.2e3, 2.23e3], ["4.7 kΩ", 4.7e3, 4.63e3], ["10 kΩ", 1e4, 1.012e4]];
  const RC_C = [["100 μF", 100e-6, 108e-6], ["220 μF", 220e-6, 231e-6], ["470 μF", 470e-6, 446e-6], ["1000 μF", 1e-3, 1.09e-3]];
  const RL_R = [["47 Ω", 47, 47.4], ["100 Ω", 100, 99.1], ["220 Ω", 220, 222], ["470 Ω", 470, 466]];
  const RL_L = [["25 mH", 0.025, 0.0252, 6.2], ["100 mH", 0.1, 0.101, 21.5]];
  const E = 5.0, RG = 50;
  let mode = "rcc", ri = 3, xi = 2, view = "ln", last = null;
  const isRL = () => mode === "rl";
  const tRC = L.table($(".t-rc"), [
    { key: "md", label: "과정" }, { key: "r", label: "R" }, { key: "c", label: "C" }, { key: "tn", label: "RC (s)", res: 0.001 },
    { key: "t63", label: "τ₆₃ (s)", res: 0.001 }, { key: "th", label: "t½/ln2 (s)", res: 0.001 }, { key: "tl", label: "τ_ln (s)", res: 0.001 },
  ], () => drawPlot());
  const tRL = L.table($(".t-rl"), [
    { key: "r", label: "R" }, { key: "c", label: "L" }, { key: "tn", label: "L/R (ms)", res: 0.001 },
    { key: "t63", label: "τ₆₃ (ms)", res: 0.001 }, { key: "th", label: "t½/ln2 (ms)", res: 0.001 }, { key: "tl", label: "τ_ln (ms)", res: 0.001 },
  ], () => drawPlot());
  const tbl = () => (isRL() ? tRL : tRC);
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const parts = () => (isRL() ? [RL_R[ri], RL_L[xi]] : [RC_R[ri], RC_C[xi]]);
  const nice = (x) => { const m = 10 ** Math.floor(Math.log10(x)); return [1, 2, 5, 10].map((k) => k * m).find((v) => v >= x); };
  /* 한 번 기록: 시간 단위는 RC는 s, RL은 ms */
  function run() {
    const [r, x] = parts(), u = isRL() ? 1000 : 1;
    const tau = isRL() ? x[2] / (r[2] + x[3] + RG) : r[2] * x[2];
    const vf = isRL() ? E * r[2] / (r[2] + x[3] + RG) : E, rise = mode !== "rcd";
    const T = nice(6 * tau), n = 300, dt = T / n, o = isRL() ? { sd: 0.02, res: 0.04 } : { sd: 0.005, res: 0.01 };
    const ts = [], vs = [];
    for (let i = -15; i <= n; i++) {
      const t = i * dt, e = t < 0 ? 1 : Math.exp(-t / tau);
      ts.push(t * u); vs.push(L.measure(rise ? vf * (1 - e) : E * e, o));
    }
    const post = ts.map((t, i) => i).filter((i) => ts[i] >= 0);
    const ref = rise ? L.stats(vs.filter((v, i) => ts[i] > 0.85 * T * u)).mean : L.stats(vs.filter((v, i) => ts[i] < 0)).mean;
    const cross = (frac) => {
      const tg = (rise ? frac : 1 - frac) * ref;
      for (const i of post) {
        if (i > 0 && (rise ? vs[i] >= tg : vs[i] <= tg)) { const k = (tg - vs[i - 1]) / (vs[i] - vs[i - 1] || 1e-9); return ts[i - 1] + k * (ts[i] - ts[i - 1]); }
      }
      return NaN;
    };
    const lp = post.map((i) => ({ x: ts[i], y: rise ? ref - vs[i] : vs[i] })).filter((p) => p.y > 0.1 * ref).map((p) => ({ x: p.x, y: Math.log(p.y) }));
    const ft = L.linfit(lp.map((p) => p.x), lp.map((p) => p.y));
    return { ts, vs, rise, ref, T: T * u, t63: cross(0.632), th: cross(0.5) / Math.LN2, thRaw: cross(0.5), tl: ft ? -1 / ft.a : NaN, lp, ft, u };
  }
  function circuit(ctx, x0, y0, x1, y1) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    const my = (y0 + y1) / 2, mx = (x0 + x1) / 2;
    ctx.fillStyle = C.card;
    /* 전원 */
    ctx.fillRect(x0 - 3, my - 12, 6, 24);
    if (isRL()) {
      ctx.beginPath(); ctx.arc(x0, my, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0 - 6, my + 3); ctx.lineTo(x0 - 6, my - 4); ctx.lineTo(x0, my - 4); ctx.lineTo(x0, my + 3); ctx.lineTo(x0 + 6, my + 3); ctx.lineTo(x0 + 6, my - 4); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(x0 - 10, my - 4); ctx.lineTo(x0 + 10, my - 4); ctx.moveTo(x0 - 5, my + 4); ctx.lineTo(x0 + 5, my + 4); ctx.stroke();
    }
    /* 저항 (위) */
    ctx.fillRect(mx - 18, y0 - 7, 36, 14); ctx.strokeRect(mx - 18, y0 - 7, 36, 14);
    /* 축전기 또는 코일 (오른쪽) */
    ctx.fillRect(x1 - 12, my - 16, 24, 32);
    ctx.beginPath();
    if (isRL()) { ctx.moveTo(x1, my - 16); for (let k = 0; k < 4; k++) ctx.arc(x1, my - 12 + k * 8, 4, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x1, my + 16); }
    else { ctx.moveTo(x1, my - 16); ctx.lineTo(x1, my - 3); ctx.moveTo(x1 - 11, my - 3); ctx.lineTo(x1 + 11, my - 3); ctx.moveTo(x1 - 11, my + 3); ctx.lineTo(x1 + 11, my + 3); ctx.moveTo(x1, my + 3); ctx.lineTo(x1, my + 16); }
    ctx.stroke();
    const [r, x] = parts();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(r[0], mx, y0 - (isRL() ? 24 : 12));
    ctx.fillText(isRL() ? "0–5 V" : mode === "rcd" ? "방전" : "5.00 V", x0, y1 + 14);
    ctx.textAlign = "left"; ctx.fillText(x[0], x1 + 8, my + 26);
    /* 측정 위치 표시 */
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2; ctx.setLineDash([3, 2]);
    if (isRL()) { ctx.strokeRect(mx - 24, y0 - 20, 48, 30); ctx.fillStyle = C.forest; ctx.textAlign = "center"; ctx.fillText("CH2", mx, y0 + 22); }
    else { ctx.strokeRect(x1 - 16, my - 20, 32, 40); ctx.fillStyle = C.forest; ctx.textAlign = "right"; ctx.fillText("기록기", x1 - 20, my + 4); }
    ctx.setLineDash([]);
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    circuit(ctx, 26, 40, w * 0.3, h - 50);
    const gx = w * 0.36 + 26, gy = 16, gw = w - gx - 10, gh = h - 46;
    const un = isRL() ? "ms" : "s";
    if (!last) {
      NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X: (v) => gx + v * gw, Y: (v) => gy + gh - v / 6 * gh, xt: [], yt: [0, 2, 4, 6].map((v) => [v, String(v)]), xlabel: `t (${un})`, ylabel: isRL() ? "V_R (V)" : "V_C (V)" });
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("‘스위치 넣고 기록’을 누르세요", gx + gw / 2, gy + gh / 2);
      return;
    }
    const t0 = last.ts[0], t1 = last.T, X = (t) => gx + (t - t0) / (t1 - t0) * gw, Y = (v) => gy + gh - v / 6 * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: L.ticks(0, t1, 4).map((v) => [v, String(+v.toPrecision(3))]), yt: [0, 2, 4, 6].map((v) => [v, String(v)]), xlabel: `t (${un})`, ylabel: isRL() ? "V_R (V)" : "V_C (V)" });
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.4; ctx.beginPath();
    last.ts.forEach((t, i) => (i ? ctx.lineTo(X(t), Y(last.vs[i])) : ctx.moveTo(X(t), Y(last.vs[i]))));
    ctx.stroke();
    const tg = (last.rise ? 0.632 : 0.368) * last.ref;
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx, Y(tg)); ctx.lineTo(X(last.t63), Y(tg)); ctx.lineTo(X(last.t63), Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(last.rise ? "63%" : "37%", gx + 4, Y(tg) - 4);
    ctx.fillText("τ", X(last.t63) + 4, Y(0) - 6);
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 50, y0: 18, w: w - 64, h: h - 52 }, un = isRL() ? "ms" : "s";
    if (view === "ln") {
      if (!last) { L.plot(ctx, box, { pts: [], xlabel: `t (${un})`, ylabel: "ln V" }); return; }
      const step = Math.max(1, Math.ceil(last.lp.length / 40));
      L.plot(ctx, box, { pts: last.lp.filter((p, i) => i % step === 0), fit: last.ft, xlabel: `t (${un})`, ylabel: last.rise ? "ln(V_f − V)" : "ln V" });
    } else {
      const rows = tbl().rows, pts = rows.map((r) => ({ x: r.tn, y: r.tl })).filter((p) => Number.isFinite(p.y));
      const mx = Math.max(0.001, ...pts.map((p) => Math.max(p.x, p.y))) * 1.1;
      L.plot(ctx, box, { pts, model: (x) => x, xr: [0, mx], yr: [0, mx], xlabel: isRL() ? "이름값 L/R (ms)" : "이름값 RC (s)", ylabel: `τ_ln (${un})` });
    }
  }
  function show() {
    const un = isRL() ? "ms" : "s", f = (x) => (Number.isFinite(x) ? x.toPrecision(3) : "—");
    $(".n-t").textContent = last ? `${f(last.t63)} ${un}` : "—";
    $(".n-h").textContent = last ? `${f(last.thRaw)} → ${f(last.th)} ${un}` : "—";
    $(".n-l").textContent = last && last.ft ? `${f(last.tl)} ${un}` : "—";
  }
  function record() {
    last = run();
    const [r, x] = parts();
    const tn = isRL() ? x[1] / r[1] * 1000 : r[1] * x[1];
    const row = { r: r[0], c: x[0], tn, t63: last.t63, th: last.th, tl: last.tl };
    if (!isRL()) row.md = mode === "rcc" ? "충전" : "방전";
    tbl().add(row); show(); draw();
  }
  function chips() {
    const rs = isRL() ? RL_R : RC_R, xs = isRL() ? RL_L : RC_C;
    const mk = (host, list, cur, cb) => {
      host.querySelectorAll(".chip").forEach((c) => c.remove());
      list.forEach((p, i) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = p[0]; b.setAttribute("aria-pressed", String(i === cur));
        b.addEventListener("click", () => { cb(i); host.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); draw(); });
        host.appendChild(b);
      });
    };
    mk($(".rr"), rs, ri, (i) => { ri = i; });
    mk($(".xx"), xs, xi, (i) => { xi = i; });
    $(".xx-lab").textContent = isRL() ? "코일 L" : "축전기 C";
  }
  root.querySelectorAll(".mode .chip").forEach((b) => b.addEventListener("click", () => {
    const was = isRL(); mode = b.dataset.k;
    root.querySelectorAll(".mode .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    if (was !== isRL()) { ri = isRL() ? 1 : 3; xi = isRL() ? 1 : 2; chips(); $(".t-rc").classList.toggle("rc-hide", isRL()); $(".t-rl").classList.toggle("rc-hide", !isRL()); }
    last = null; show(); draw(); drawPlot();
  }));
  root.querySelectorAll(".view .chip").forEach((b) => b.addEventListener("click", () => {
    view = b.dataset.v; root.querySelectorAll(".view .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); drawPlot();
  }));
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => { tbl().clear(); last = null; show(); draw(); drawPlot(); });
  chips(); draw();
  if (L.demo) {
    ri = 3; [0, 1, 2, 3].forEach((i) => { xi = i; record(); });
    xi = 2; [0, 1, 2].forEach((i) => { ri = i; record(); });
    mode = "rl"; ri = 0; xi = 1; [0, 1, 2, 3].forEach((i) => { ri = i; record(); }); mode = "rcd"; ri = 3; xi = 2; record(); mode = "rcc"; ri = 2; record();
    chips(); drawPlot();
  }
})();
