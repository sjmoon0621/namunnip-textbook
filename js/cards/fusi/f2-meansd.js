/* 카드: 두 모둠의 평균이 다르면 가설이 맞은 걸까? — 평균, SD, SE로 두 집단 비교 (모식) */
(() => {
  const root = document.getElementById("card-fusi-meansd");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const EFF = [0.5, 0, 1.5], MU = 8.0, SD = 1.2;   // 학교별 참 효과 (cm), 대조군 평균, 개체 SD (모식)
  const nEl = $(".n");
  let sc = 0, bar = "sd", cur = null, ds = [], showTrue = false;

  function experiment() {
    const n = +nEl.value;
    const c = Array.from({ length: n }, () => L.measure(MU, { sd: SD, res: 0.1 }));
    const t = Array.from({ length: n }, () => L.measure(MU + EFF[sc], { sd: SD, res: 0.1 }));
    const sc1 = L.stats(c), st = L.stats(t), d = st.mean - sc1.mean, se = Math.sqrt(sc1.se ** 2 + st.se ** 2);
    return { c, t, sc: sc1, st, d, se, z: d / se, jc: c.map(() => Math.random() - 0.5), jt: t.map(() => Math.random() - 0.5) };
  }

  const top = fit($(".cv-wide"), () => drawTop());
  const bot = fit($(".cv-plot"), () => drawBot());

  function drawTop() {
    const { ctx } = top, { w, h } = top.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 46, y0: 20, w: w - 60, h: h - 48 }, lo = 4, hi = 13;
    const Y = (v) => box.y0 + box.h - (v - lo) / (hi - lo) * box.h;
    NM.axes(ctx, { ...box, X: (v) => v, Y, xt: [], yt: [4, 6, 8, 10, 12].map((v) => [v, String(v)]), ylabel: "콩나물 길이 (cm)" });
    const cols = [["대조군 (음악 없음)", 0.3, C.ink3], ["실험군 (음악)", 0.7, C.forest]];
    cols.forEach(([lab, fx], k) => {
      ctx.fillStyle = C.ink2; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(lab, box.x0 + box.w * fx, box.y0 + box.h + 18);
    });
    if (showTrue) {
      ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      [[MU, 0.3], [MU + EFF[sc], 0.7]].forEach(([v, fx]) => { const x = box.x0 + box.w * fx; ctx.beginPath(); ctx.moveTo(x - box.w * 0.17, Y(v)); ctx.lineTo(x + box.w * 0.17, Y(v)); ctx.stroke(); });
      ctx.restore();
      ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText(`점선: 참 평균 (참 효과 ${EFF[sc].toFixed(1)} cm)`, box.x0 + 6, box.y0 + 10);
    }
    if (!cur) {
      ctx.fillStyle = C.ink3; ctx.font = `13px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("‘실험 한 번 하기’를 누르세요", box.x0 + box.w / 2, box.y0 + box.h / 2); return;
    }
    [[cur.c, cur.jc, cur.sc, 0.3, C.ink3], [cur.t, cur.jt, cur.st, 0.7, C.forest]].forEach(([xs, js, s, fx, col]) => {
      const cx = box.x0 + box.w * fx, spread = box.w * 0.13;
      ctx.fillStyle = col; ctx.globalAlpha = 0.55;
      xs.forEach((v, i) => { ctx.beginPath(); ctx.arc(cx - box.w * 0.06 + js[i] * spread, Y(v), 3, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1;
      const e = bar === "sd" ? s.sd : bar === "se" ? s.se : 2 * s.se, bx = cx + box.w * 0.1;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(bx, Y(s.mean - e)); ctx.lineTo(bx, Y(s.mean + e));
      ctx.moveTo(bx - 6, Y(s.mean - e)); ctx.lineTo(bx + 6, Y(s.mean - e)); ctx.moveTo(bx - 6, Y(s.mean + e)); ctx.lineTo(bx + 6, Y(s.mean + e)); ctx.stroke();
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(cx - box.w * 0.15, Y(s.mean)); ctx.lineTo(bx + 8, Y(s.mean)); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(s.mean.toFixed(2), bx + 11, Y(s.mean) + 4);
    });
  }

  function drawBot() {
    const { ctx } = bot, { w, h } = bot.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 22, w: w - 54, h: h - 56 }, xr = [-2, 3.5];
    const hx = L.hist(ctx, box, ds.map((r) => r.d), { xr, bins: 44, xlabel: "평균 차이 d (cm)", ylabel: `실험 수 (총 ${ds.length}번)` });
    ctx.save();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx.X(0), box.y0); ctx.lineTo(hx.X(0), box.y0 + box.h); ctx.stroke();
    if (ds.length) {
      const seT = SD * Math.sqrt(2 / +nEl.value), thr = 2 * seT;   // 전형적인 SE로 그린 기준선
      ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]);
      [-thr, thr].forEach((v) => { if (v > xr[0] && v < xr[1]) { ctx.beginPath(); ctx.moveTo(hx.X(v), box.y0); ctx.lineTo(hx.X(v), box.y0 + box.h); ctx.stroke(); } });
      ctx.setLineDash([]);
      const k = ds.filter((r) => Math.abs(r.z) > 2).length;
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText(`|d| > 2SE 인 실험 ${k} / ${ds.length}  (점선: ±2SE)`, box.x0 + box.w, box.y0 + 10);
    }
    ctx.restore();
  }

  function nums() {
    const f = (s) => `${s.mean.toFixed(2)} ± ${s.sd.toFixed(2)}`;
    $(".v-c").textContent = cur ? f(cur.sc) : "—";
    $(".v-t").textContent = cur ? f(cur.st) : "—";
    $(".v-d").textContent = cur ? `${cur.d.toFixed(2)} ± ${cur.se.toFixed(2)}` : "—";
    const z = $(".v-z"); z.textContent = cur ? cur.z.toFixed(1) : "—";
    z.className = "v-z" + (cur ? (Math.abs(cur.z) > 2 ? " good" : "") : "");
    $(".f2-verdict").textContent = !cur ? "" : Math.abs(cur.z) > 2
      ? "차이가 우연한 흔들림(SE)의 2배를 넘습니다. 가설을 지지하는 증거로 볼 수 있습니다."
      : "차이가 SE의 2배보다 작습니다. 이 자료만으로는 효과가 있는지 없는지 판단할 수 없습니다.";
  }
  const redraw = () => { nums(); drawTop(); drawBot(); };
  const reset = () => { cur = null; ds = []; redraw(); };

  $(".scen").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    sc = +b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); reset();
  });
  $(".bar").addEventListener("click", (e) => {
    const b = e.target.closest("[data-b]"); if (!b) return;
    bar = b.dataset.b; root.querySelectorAll("[data-b]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawTop();
  });
  nEl.addEventListener("input", () => { $(".n-out").textContent = nEl.value; reset(); });
  $(".once").addEventListener("click", () => { cur = experiment(); ds.push(cur); redraw(); });
  $(".rep").addEventListener("click", () => { for (let k = 0; k < 100; k++) { cur = experiment(); ds.push(cur); } redraw(); });
  $(".truth").addEventListener("click", (e) => { showTrue = !showTrue; e.currentTarget.setAttribute("aria-pressed", String(showTrue)); drawTop(); });
  redraw();
  if (L.demo) {
    root.querySelector('[data-s="1"]').click(); root.querySelector('[data-b="se2"]').click();
    for (let k = 0; k < 100; k++) ds.push(experiment());
    cur = experiment(); ds.push(cur); redraw();
  }
})();
