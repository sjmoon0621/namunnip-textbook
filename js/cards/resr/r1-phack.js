/* 카드: 유의한 결과가 나올 때까지 분석을 바꾸면 무엇이 문제일까? — p-해킹(중간에 멈추기, 결과 고르기, 값 빼기) 모의실험 */
(() => {
  const root = document.getElementById("card-resr-phack");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const oStop = $(".o-stop"), oDv = $(".o-dv"), oOut = $(".o-out");
  const NMAX = 50, PLAN = 30, LOOKS = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  let eff = 0, one = null, many = null;

  /* 표준 정규 누적 분포 (Abramowitz–Stegun 7.1.26) */
  const Phi = (z) => {
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    const e = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? 0.5 * (1 + e) : 0.5 * (1 - e);
  };
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const pz = (a, b) => { const z = (mean(a) - mean(b)) / Math.sqrt(1 / a.length + 1 / b.length); return 2 * (1 - Phi(Math.abs(z))); };
  const trim = (a) => { const s = L.stats(a); return a.filter((x) => Math.abs(x - s.mean) <= 2 * s.sd); };

  /* 한 연구의 원자료: 음료 모둠 d, 물 모둠 w, 각 사람의 점수 두 가지 */
  function study() {
    const make = (e) => Array.from({ length: NMAX }, () => {
      const g1 = L.gauss(), g2 = L.gauss();
      return [g1 + e, 0.5 * g1 + Math.sqrt(0.75) * g2 + e];
    });
    return { d: make(eff), w: make(0) };
  }
  /* n명까지 썼을 때, 허용한 방법들 중 가장 작은 p */
  function bestP(s, n, o) {
    let best = 1;
    for (const k of o.dv ? [0, 1] : [0]) {
      const a = s.d.slice(0, n).map((r) => r[k]), b = s.w.slice(0, n).map((r) => r[k]);
      best = Math.min(best, pz(a, b));
      if (o.out) best = Math.min(best, pz(trim(a), trim(b)));
    }
    return best;
  }
  /* 연구자가 실제로 보고하게 되는 p와 멈춘 인원 */
  function report(s, o) {
    const looks = o.stop ? LOOKS : [PLAN];
    let p = 1, n = looks[looks.length - 1];
    for (const m of looks) { p = bestP(s, m, o); n = m; if (p < 0.05) break; }
    return { p, n };
  }
  const cur = () => ({ stop: oStop.checked, dv: oDv.checked, out: oOut.checked });
  const PLANO = { stop: false, dv: false, out: false };

  const cv = fit($(".cv-wide"), () => drawOne());
  const pl = fit($(".cv-plot"), () => drawMany());

  function drawOne() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 46, y0 = 46, bw = w - x0 - 16, bh = h - y0 - 36;
    const X = (n) => x0 + (n - 10) / 40 * bw, lg = (p) => Math.log10(Math.max(p, 1e-4));
    const Y = (p) => y0 + (0 - lg(p)) / 3 * bh;
    NM.axes(ctx, { x0, y0, w: bw, h: bh, X, Y, xt: [10, 20, 30, 40, 50].map((v) => [v, v + ""]), yt: [[1, "1"], [0.1, "0.1"], [0.05, "0.05"], [0.01, "0.01"], [0.001, "0.001"]], xlabel: "모둠당 인원", ylabel: "p값 (로그 눈금)" });
    ctx.fillStyle = "rgba(181,83,47,.08)"; ctx.fillRect(x0, Y(0.05), bw, Y(0.001) - Y(0.05));
    ctx.strokeStyle = C.warn; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(x0, Y(0.05)); ctx.lineTo(x0 + bw, Y(0.05)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(PLAN), y0); ctx.lineTo(X(PLAN), y0 + bh); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("계획한 인원", X(PLAN) + 4, y0 + 12);
    ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText("유의 (p < 0.05)", x0 + bw - 4, Y(0.001) - 6);
    if (!one) {
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.font = `13px ${F.sans}`;
      ctx.fillText("'연구 한 번 하기'를 누르세요", x0 + bw / 2, y0 + bh / 2);
      return;
    }
    const line = (ps, col, wd) => {
      ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath();
      LOOKS.forEach((n, i) => { i ? ctx.lineTo(X(n), Y(ps[i])) : ctx.moveTo(X(n), Y(ps[i])); }); ctx.stroke();
      ctx.fillStyle = col; LOOKS.forEach((n, i) => { ctx.beginPath(); ctx.arc(X(n), Y(ps[i]), 2.6, 0, Math.PI * 2); ctx.fill(); });
    };
    line(one.plan, C.ink3, 1.4);
    const o = cur();
    if (o.dv || o.out) line(one.best, C.amber, 2);
    const r = one.rep;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(r.n), Y(r.p), 6, 0, Math.PI * 2); ctx.stroke();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.ink3; ctx.fillRect(x0, 12, 12, 3); ctx.fillText("계획한 분석 (기억력, 값 빼지 않음)", x0 + 16, 17);
    if (o.dv || o.out) { const lx = Math.min(x0 + 226, w - 170); ctx.fillStyle = C.amber; ctx.fillRect(lx, 12, 12, 3); ctx.fillText("허용한 방법 중 가장 작은 p", lx + 16, 17); }
  }

  const COMBOS = [
    ["계획대로", PLANO], ["멈추기", { stop: true }], ["점수 고르기", { dv: true }], ["값 빼기", { out: true }], ["셋 모두", { stop: true, dv: true, out: true }],
  ];
  function drawMany() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, y0 = 20, bw = w - x0 - 12, bh = h - y0 - 34;
    const top = eff ? 100 : 40;
    const Y = (v) => y0 + bh - v / top * bh;
    NM.axes(ctx, { x0, y0, w: bw, h: bh, X: (v) => v, Y, yt: (eff ? [0, 25, 50, 75, 100] : [0, 10, 20, 30, 40]).map((v) => [v, v + ""]), ylabel: `1000번 중 p < 0.05인 비율 (%) · 실제 효과 ${eff ? "있음" : "없음"}` });
    if (!many) {
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.font = `13px ${F.sans}`;
      ctx.fillText("'같은 연구 1000번 하기'를 누르세요", x0 + bw / 2, y0 + bh / 2);
      return;
    }
    if (!eff) { ctx.strokeStyle = C.warn; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0, Y(5)); ctx.lineTo(x0 + bw, Y(5)); ctx.stroke(); ctx.setLineDash([]); }
    const bars = many.bars, gw = bw / bars.length, bwid = Math.min(42, gw * 0.55);
    bars.forEach(([lab, v, mine], i) => {
      const cx = x0 + gw * (i + 0.5);
      ctx.fillStyle = mine ? C.amber : (i === 0 ? C.leaf : C.sprout);
      ctx.fillRect(cx - bwid / 2, Y(Math.min(v, top)), bwid, Y(0) - Y(Math.min(v, top)));
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(v.toFixed(1), cx, Y(Math.min(v, top)) - 4);
      ctx.fillStyle = mine ? C.warn : C.ink2; ctx.font = `11px ${F.sans}`;
      ctx.fillText(lab, cx, y0 + bh + 15);
    });
  }

  function runOne() {
    const s = study(), o = cur();
    one = {
      plan: LOOKS.map((n) => bestP(s, n, PLANO)),
      best: LOOKS.map((n) => bestP(s, n, { dv: o.dv, out: o.out })),
      rep: report(s, o),
    };
    const r = one.rep, planP = bestP(s, PLAN, PLANO);
    $(".n-p").textContent = r.p < 0.001 ? "< 0.001" : r.p.toFixed(3);
    $(".n-p").className = "n-p " + (r.p < 0.05 ? "bad" : "");
    const tricks = [o.stop && "중간에 멈추기", o.dv && "점수 고르기", o.out && "값 빼기"].filter(Boolean);
    $(".r1p-msg").innerHTML = `${r.n}명에서 멈추고 p = ${r.p.toFixed(3)}을 보고합니다. ` +
      (r.p < 0.05 ? `<b>"음료가 효과 있다"는 논문이 됩니다.</b> ` : "유의하지 않아 서랍 속에 묻힐 가능성이 큽니다. ") +
      `계획대로 30명, 기억력 점수만 썼다면 p = ${planP.toFixed(3)}입니다.` +
      (tricks.length ? ` 보고서에는 '${tricks.join("', '")}'를 했다는 사실이 적히지 않습니다.` : "") +
      ` <span class="small dim">(실제 효과: ${eff ? "있음" : "없음"})</span>`;
    drawOne();
  }

  function runMany() {
    const o = cur(), N = 1000, cnt = new Array(COMBOS.length + 1).fill(0);
    const combos = [...COMBOS.map((c) => c[1]), o];
    for (let i = 0; i < N; i++) {
      const s = study();
      combos.forEach((c, j) => { if (report(s, c).p < 0.05) cnt[j]++; });
    }
    const pctv = cnt.map((c) => c / N * 100);
    const same = COMBOS.findIndex(([, c]) => !!c.stop === o.stop && !!c.dv === o.dv && !!c.out === o.out);
    const bars = COMBOS.map(([lab], j) => [lab, pctv[j], j === same]);
    if (same < 0) bars.push(["지금 선택", pctv[COMBOS.length], true]);
    many = { bars };
    $(".n-r").textContent = pctv[COMBOS.length].toFixed(1) + "%";
    $(".n-0").textContent = pctv[0].toFixed(1) + "%";
    drawMany();
  }

  $(".r1p-eff").addEventListener("click", (e) => {
    const b = e.target.closest("[data-e]"); if (!b) return;
    eff = +b.dataset.e; one = null; many = null;
    root.querySelectorAll(".r1p-eff [data-e]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    ["n-p", "n-r", "n-0"].forEach((c) => { $("." + c).textContent = "—"; });
    $(".r1p-msg").textContent = "";
    drawOne(); drawMany();
  });
  [oStop, oDv, oOut].forEach((el) => el.addEventListener("change", () => { one = null; $(".r1p-msg").textContent = "방법을 바꾸었습니다. 다시 연구해 보세요."; drawOne(); }));
  $(".r1p-one").addEventListener("click", runOne);
  $(".r1p-many").addEventListener("click", runMany);
  if (L.demo) {
    oStop.checked = true; oDv.checked = true;
    for (let i = 0; i < 40; i++) { runOne(); if (one.rep.p < 0.05) break; }
    runMany();
  }
})();
