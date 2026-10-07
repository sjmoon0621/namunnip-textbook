/* 카드: 어떤 가설이 더 좋은 가설일까? — 가설이 금지하는 결과의 범위와 실험의 신뢰 구간 비교 */
(() => {
  const root = document.getElementById("card-resr-hypo");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sN = $(".n");
  const SD = 8, XR = [-20, 25], TRUTHS = [-4, 0, 3, 6, 10];
  /* 가설: 금지 범위 [a, b] (Δ = 빨강 − 파랑, mm). null이면 금지하는 것이 없음 */
  const H = [
    { lab: "① 영향을 줄 수 있다", ban: null },
    { lab: "② 빨강에서 더 길다", ban: [-Infinity, 0] },
    { lab: "③ 빨강에서 5 mm 이상 길다", ban: [-Infinity, 5] },
    { lab: "④ 파랑에서 더 길다", ban: [0, Infinity] },
    { lab: "⑤ 차이 없다 (귀무가설)", ban: "null" },
  ];
  let truth = TRUTHS[Math.floor(Math.random() * TRUTHS.length)], res = null, shown = false, k = 0;

  function verdict(hh) {
    if (!res) return ["", C.ink3];
    const [lo, hi] = res.ci;
    if (hh.ban === null) return ["시험 불가", C.ink3];
    if (hh.ban === "null") return lo > 0 || hi < 0 ? ["기각", C.warn] : ["기각 못함", C.ink2];
    const [a, b] = hh.ban;
    if (lo >= a && hi <= b) return ["기각", C.warn];
    if (hi <= a || lo >= b) return ["살아남음", C.forest];
    return ["판정 보류", C.amber];
  }

  const cv = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lw = Math.min(170, w * 0.34), vw = Math.min(72, w * 0.16);
    const x0 = lw + 6, bw = w - x0 - vw - 6, y0 = 30, bh = h - y0 - 34, rh = bh / H.length;
    const X = (v) => x0 + (v - XR[0]) / (XR[1] - XR[0]) * bw;
    NM.axes(ctx, { x0, y0, w: bw, h: bh, X, Y: (v) => v, xt: [-20, -10, 0, 10, 20].map((v) => [v, v + ""]), xlabel: "빨강 − 파랑 평균 길이 차이 (mm)" });
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("빗금: 가설이 금지하는 결과", x0, 14);
    ctx.textAlign = "right"; ctx.fillText("판정", w - 6, 14);
    H.forEach((hh, i) => {
      const y = y0 + rh * i + rh * 0.2, hgt = rh * 0.6;
      ctx.fillStyle = "rgba(116,171,102,.10)"; ctx.fillRect(x0, y, bw, hgt);
      const hatch = (a, b) => {
        const xa = Math.max(x0, X(a)), xb = Math.min(x0 + bw, X(b)); if (xb <= xa) return;
        ctx.save(); ctx.beginPath(); ctx.rect(xa, y, xb - xa, hgt); ctx.clip();
        ctx.fillStyle = "rgba(181,83,47,.10)"; ctx.fillRect(xa, y, xb - xa, hgt);
        ctx.strokeStyle = "rgba(181,83,47,.55)"; ctx.lineWidth = 1;
        for (let x = xa - hgt; x < xb; x += 7) { ctx.beginPath(); ctx.moveTo(x, y + hgt); ctx.lineTo(x + hgt, y); ctx.stroke(); }
        ctx.restore();
      };
      if (hh.ban === "null") { hatch(XR[0], -0.4); hatch(0.4, XR[1]); ctx.fillStyle = C.forest; ctx.fillRect(X(0) - 1.5, y, 3, hgt); }
      else if (hh.ban) hatch(hh.ban[0], hh.ban[1]);
      ctx.fillStyle = C.ink; ctx.font = `12px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText(hh.lab, lw, y + hgt / 2 + 4);
      const [vt, vc] = verdict(hh);
      ctx.fillStyle = vc; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText(vt, w - 6, y + hgt / 2 + 4);
    });
    if (res) {
      const [lo, hi] = res.ci;
      ctx.fillStyle = "rgba(35,35,38,.10)"; ctx.fillRect(X(lo), y0, X(hi) - X(lo), bh);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      [lo, hi].forEach((v) => { ctx.beginPath(); ctx.moveTo(X(v), y0); ctx.lineTo(X(v), y0 + bh); ctx.stroke(); });
      ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X(res.d), y0); ctx.lineTo(X(res.d), y0 + bh); ctx.stroke();
    }
    if (shown) {
      ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(X(truth), y0 - 4); ctx.lineTo(X(truth), y0 + bh); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.apple; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`참값 ${truth}`, X(truth), y0 - 7);
    }
  }

  function run() {
    const n = +sN.value;
    const r = Array.from({ length: n }, () => L.measure(20 + truth, { sd: SD, res: 1 }));
    const b = Array.from({ length: n }, () => L.measure(20, { sd: SD, res: 1 }));
    const sr = L.stats(r), sb = L.stats(b), d = sr.mean - sb.mean, se = Math.sqrt(sr.sd ** 2 / n + sb.sd ** 2 / n);
    res = { d, ci: [d - 1.96 * se, d + 1.96 * se], n };
    k++;
    $(".n-d").textContent = d.toFixed(1) + " mm";
    $(".n-ci").textContent = `${res.ci[0].toFixed(1)} ~ ${res.ci[1].toFixed(1)}`;
    $(".n-k").textContent = k;
    const v = H.map((hh) => verdict(hh)[0]);
    const alive = H.filter((_, i) => v[i] === "살아남음").map((hh) => hh.lab.slice(0, 1));
    const dead = H.filter((_, i) => v[i] === "기각").map((hh) => hh.lab.slice(0, 1));
    $(".r1h-msg").innerHTML = `n = ${n}일 때 신뢰 구간의 폭은 약 ${(res.ci[1] - res.ci[0]).toFixed(1)} mm입니다. ` +
      (dead.length ? `<b>기각: ${dead.join(" ")}</b>. ` : "기각된 가설이 없습니다. ") +
      (alive.length ? `살아남은 가설: ${alive.join(" ")}. ` : "") +
      (v.includes("판정 보류") ? "구간이 금지 범위에 걸친 가설은 판정을 보류합니다." : "");
    draw();
  }

  sN.addEventListener("input", () => { $(".n-out").textContent = sN.value; });
  $(".r1h-run").addEventListener("click", run);
  $(".r1h-new").addEventListener("click", () => {
    const others = TRUTHS.filter((t) => t !== truth);
    truth = others[Math.floor(Math.random() * others.length)];
    res = null; shown = false; k = 0;
    ["n-d", "n-ci"].forEach((c) => { $("." + c).textContent = "—"; }); $(".n-k").textContent = "0";
    $(".r1h-msg").textContent = "새 상황입니다. 참값이 바뀌었습니다.";
    draw();
  });
  $(".r1h-show").addEventListener("click", () => { shown = !shown; draw(); });
  if (L.demo) { truth = 6; sN.value = 30; $(".n-out").textContent = "30"; run(); }
})();
