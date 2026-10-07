/* 카드: 같은 망원경에 CCD를 달면 왜 훨씬 어두운 별까지 찍힐까? — 검출기별 S/N과 노출 시간 */
(() => {
  const root = document.getElementById("card-adearth-detector");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sM = $(".m"), sD = $(".dd");
  const DET = {
    ccd: { name: "냉각 CCD", qe: 0.90, rn: 5, dark: 0.01, fw: 1e5, col: "#3f6fa3" },
    cmos: { name: "CMOS", qe: 0.80, rn: 1.5, dark: 0.05, fw: 5e4, col: "#3b7c2a" },
    plate: { name: "사진 건판", qe: 0.01, rn: 0, dark: 0, fw: 2e3, col: "#b5532f", plate: true },
  };
  const F0 = 8.8e5, TAU = 0.6, NPIX = Math.PI * 4, PEAK = 0.2;
  let kind = "ccd", sky = 21.5;
  function calc(k, t) {
    const d = DET[k], A = Math.PI * (+sD.value / 2) ** 2;
    const rs = F0 * 10 ** (-0.4 * +sM.value) * A * TAU * d.qe;
    const rb = F0 * 10 ** (-0.4 * sky) * A * TAU * d.qe; /* 1″² = 1화소당 */
    const S = rs * t, sky1 = rb * t;
    const noise = Math.sqrt(S + NPIX * (sky1 + d.dark * t + d.rn * d.rn));
    let sn = S / noise;
    const peak = PEAK * S + sky1 + d.dark * t;
    if (d.plate) sn /= Math.sqrt(1 + (peak / d.fw) ** 2);
    return { S, noise, sn, fill: peak / d.fw };
  }
  const { ctx, size } = fit(cv, () => draw());
  const x0f = 46, padR = 12, padT = 22, padB = 34;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = x0f, x1 = w - padR, y0 = padT, y1 = h - padB;
    const X = (lt) => x0 + (lt + 2) / 5.5 * (x1 - x0), Y = (ls) => y1 - (ls + 1) / 5 * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y,
      xt: [[-2, "0.01"], [-1, "0.1"], [0, "1"], [1, "10"], [2, "100"], [3, "1000"]],
      yt: [[-1, "0.1"], [0, "1"], [1, "10"], [2, "100"], [3, "1000"], [4, "10⁴"]],
      xlabel: "노출 시간 (s)", ylabel: "S/N" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    /* 검출 기준 S/N = 5 */
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(x0, Y(Math.log10(5))); ctx.lineTo(x1, Y(Math.log10(5))); ctx.stroke(); ctx.setLineDash([]);
    for (const k of Object.keys(DET)) {
      const d = DET[k], on = k === kind;
      ctx.lineWidth = on ? 2.4 : 1.2; ctx.globalAlpha = on ? 1 : 0.45;
      let prevSat = null;
      ctx.beginPath();
      for (let i = 0; i <= 220; i++) {
        const lt = -2 + i / 220 * 5.5, r = calc(k, 10 ** lt), sat = !d.plate && r.fill > 1;
        const px = X(lt), py = Y(Math.log10(Math.max(r.sn, 1e-3)));
        if (prevSat === null || sat !== prevSat) { ctx.stroke(); ctx.beginPath(); ctx.strokeStyle = d.col; ctx.setLineDash(sat ? [4, 3] : []); ctx.moveTo(px, py); prevSat = sat; }
        else ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
    const lt = +sT.value, r = calc(kind, 10 ** lt);
    ctx.fillStyle = DET[kind].col; ctx.strokeStyle = C.card; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(X(lt), Y(Math.log10(Math.max(r.sn, 1e-3))), 5.5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    ctx.restore();
    /* 범례 */
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    let ly = y0 + 12;
    for (const k of Object.keys(DET)) { ctx.fillStyle = DET[k].col; ctx.fillRect(x0 + 8, ly - 7, 12, 3); ctx.fillStyle = k === kind ? C.ink : C.ink3; ctx.fillText(DET[k].name, x0 + 25, ly - 2); ly += 15; }
    ctx.fillStyle = C.ink3; ctx.fillText("점선 구간: 화소 포화", x0 + 8, ly + 1);
    ctx.textAlign = "right"; ctx.fillText("S/N = 5 (검출 기준)", x1 - 4, Y(Math.log10(5)) - 4);
  }
  const fmt = (v) => v >= 1e5 ? v.toExponential(2).replace("e+", "×10^") : v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1);
  function update() {
    const t = 10 ** +sT.value;
    $(".t-out").textContent = t < 1 ? `${t.toFixed(2)} s` : t < 100 ? `${t.toFixed(1)} s` : `${Math.round(t)} s`;
    $(".m-out").textContent = (+sM.value).toFixed(1);
    $(".dd-out").textContent = sD.value;
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === kind)));
    root.querySelectorAll("[data-sky]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.sky === sky)));
    const r = calc(kind, t);
    $(".n-s").textContent = fmt(r.S); $(".n-n").textContent = fmt(r.noise);
    $(".n-sn").textContent = r.sn < 10 ? r.sn.toFixed(2) : Math.round(r.sn).toLocaleString();
    const fw = $(".n-fw"); fw.textContent = DET[kind].plate ? (r.fill > 1 ? "흑화 포화" : `${Math.round(r.fill * 100)} %`) : r.fill > 1 ? "포화" : `${(r.fill * 100).toFixed(r.fill < 0.01 ? 2 : 0)} %`;
    fw.classList.toggle("bad", r.fill > 1);
    draw();
  }
  [sT, sM, sD].forEach((s) => s.addEventListener("input", update));
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { kind = b.dataset.k; update(); }));
  root.querySelectorAll("[data-sky]").forEach((b) => b.addEventListener("click", () => { sky = +b.dataset.sky; update(); }));
  update();
})();
