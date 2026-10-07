/* 카드: 평균은 조금 올랐는데 왜 극한은 훨씬 잦아질까? — 서울 일평균 기온 분포(GHCN-Daily), 모식 정규 분포, 포화 수증기압 */
(() => {
  const root = document.getElementById("card-clim-extremes");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const D = window.NMSeoulT;
  const $ = (s) => root.querySelector(s);
  const P = [[1951, 1980], [1996, 2025]];
  const COL = [C.ink3, C.warn];
  let view = "sum";

  // 기간별 값 모으기: 값 목록과 그 기간에 든 해의 수
  const pool = (obj, [a, b]) => {
    const v = []; let n = 0;
    for (const y in obj) if (+y >= a && +y <= b) { n++; obj[y].forEach((x) => { if (x != null) v.push(x / 10); }); }
    return { v, n };
  };
  const S = P.map((p) => pool(D.summer, p)), W = P.map((p) => pool(D.winter, p));
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

  // 표준 정규 분포의 오른쪽 꼬리 넓이
  const erfc = (x) => { const t = 1 / (1 + 0.5 * Math.abs(x)); const r = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? r : 2 - r; };
  const tail = (z) => 0.5 * erfc(z / Math.SQRT2);
  const es = (T) => 6.112 * Math.exp(17.67 * T / (T + 243.5));

  const { ctx, size } = fit($("canvas"), () => draw());

  function setNums(rows) {
    rows.forEach(([d, n, cls], i) => { $(".d" + (i + 1)).textContent = d; const el = $(".n" + (i + 1)); el.textContent = n; el.className = "n" + (i + 1) + (cls ? " " + cls : ""); });
  }

  function legend(x, y, items) {
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    items.forEach(([lab, col], i) => { ctx.fillStyle = col; ctx.fillRect(x, y + i * 16 - 8, 12, 8); ctx.fillStyle = C.ink2; ctx.fillText(lab, x + 17, y + i * 16); });
  }

  function drawHist(sets, lo, hi, th, coldSide) {
    const { w, h } = size;
    const x0 = 40, y0 = 22, gw = w - x0 - 14, gh = h - y0 - 36, bw = coldSide ? 1 : 0.5, nb = Math.round((hi - lo) / bw);
    const counts = sets.map(({ v, n }) => { const c = new Array(nb).fill(0); v.forEach((x) => { const k = Math.floor((x - lo) / bw); if (k >= 0 && k < nb) c[k]++; }); return c.map((k) => k / n); });
    const top = Math.max(...counts.flat()) * 1.1;
    const X = (t) => x0 + (t - lo) / (hi - lo) * gw, Y = (c) => y0 + gh - c / top * gh;
    const step = hi - lo > 20 ? 4 : 2, xt = [];
    for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) xt.push([t, String(t)]);
    const ys = top > 6 ? 2 : top > 2.5 ? 1 : 0.5, yt = [];
    for (let c = 0; c <= top; c += ys) yt.push([c, String(c)]);
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt, yt, xlabel: "일평균 기온 (°C)", ylabel: `한 해 날 수 (${bw} °C 구간)` });
    // 문턱 너머 칠하기
    ctx.fillStyle = "rgba(181,83,47,.10)";
    if (coldSide) ctx.fillRect(x0, y0, X(th) - x0, gh); else ctx.fillRect(X(th), y0, x0 + gw - X(th), gh);
    counts.forEach((c, i) => {
      ctx.strokeStyle = COL[i]; ctx.lineWidth = i ? 2 : 1.6; ctx.fillStyle = i ? "rgba(181,83,47,.18)" : "rgba(141,141,146,.18)";
      ctx.beginPath(); ctx.moveTo(X(lo), Y(0));
      c.forEach((k, j) => { ctx.lineTo(X(lo + j * bw), Y(k)); ctx.lineTo(X(lo + (j + 1) * bw), Y(k)); });
      ctx.lineTo(X(hi), Y(0)); ctx.fill(); ctx.stroke();
    });
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(th), y0); ctx.lineTo(X(th), y0 + gh); ctx.stroke(); ctx.setLineDash([]);
    legend(coldSide ? w - 150 : x0 + 8, y0 + 12, [[`${P[0][0]}–${P[0][1]}`, C.ink3], [`${P[1][0]}–${P[1][1]}`, C.warn]]);
  }

  function count(set, th, cold) { return set.v.filter((x) => (cold ? x <= th : x >= th)).length / set.n; }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const th = +$(".th").value;
    if (view === "sum" || view === "win") {
      const cold = view === "win", sets = cold ? W : S;
      drawHist(sets, cold ? -16 : 18, cold ? 8 : 33, th, cold);
      const a = count(sets[0], th, cold), b = count(sets[1], th, cold);
      const m0 = mean(sets[0].v), m1 = mean(sets[1].v);
      setNums([
        ["평균 기온 (과거 → 최근)", `${m0.toFixed(1)} → ${m1.toFixed(1)} °C`],
        [cold ? `${th} °C 이하인 날 / 해` : `${th} °C 이상인 날 / 해`, `${a.toFixed(1)} → ${b.toFixed(1)}일`],
        ["최근 ÷ 과거", a > 0 ? `${(b / a).toFixed(1)}배` : "과거 0일", b > a ? "bad" : "good"],
      ]);
    } else if (view === "model") {
      const mu = +$(".mu").value, sg = +$(".sg").value;
      const x0 = 30, y0 = 22, gw = w - x0 - 14, gh = h - y0 - 36, lo = -4, hi = 6;
      const X = (z) => x0 + (z - lo) / (hi - lo) * gw, Y = (p) => y0 + gh - p / 0.45 * gh;
      axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-3, -2, -1, 0, 1, 2, 3, 4, 5].map((z) => [z, (z > 0 ? "+" : "") + z + "σ"]), yt: [], xlabel: "기온 (과거 평균에서 떨어진 정도)" });
      const pdf = (z, m, s) => Math.exp(-0.5 * ((z - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
      ctx.fillStyle = "rgba(181,83,47,.10)"; ctx.fillRect(X(2), y0, x0 + gw - X(2), gh);
      [[0, 1, C.ink3], [mu, sg, C.warn]].forEach(([m, s, col], i) => {
        ctx.beginPath();
        for (let k = 0; k <= 240; k++) { const z = lo + (hi - lo) * k / 240; k ? ctx.lineTo(X(z), Y(pdf(z, m, s))) : ctx.moveTo(X(z), Y(pdf(z, m, s))); }
        ctx.strokeStyle = col; ctx.lineWidth = i ? 2 : 1.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(X(2), Y(0));
        for (let k = 0; k <= 80; k++) { const z = 2 + (hi - 2) * k / 80; ctx.lineTo(X(z), Y(pdf(z, m, s))); }
        ctx.lineTo(X(hi), Y(0)); ctx.fillStyle = i ? "rgba(181,83,47,.35)" : "rgba(141,141,146,.35)"; ctx.fill();
      });
      ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(2), y0); ctx.lineTo(X(2), y0 + gh); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("문턱: 과거 평균 + 2σ", X(2) + 5, y0 + 10);
      legend(x0 + 8, y0 + 12, [["과거", C.ink3], ["바뀐 기후", C.warn]]);
      const a = tail(2), b = tail((2 - mu) / sg), ca = tail(2), cb = 1 - tail((-2 - mu) / sg);
      setNums([
        ["+2σ 이상 더운 날", `${(a * 100).toFixed(1)} → ${(b * 100).toFixed(1)} %`],
        ["더운 극한의 배수", `${(b / a).toFixed(1)}배`, "bad"],
        ["−2σ 이하 추운 날", `${(ca * 100).toFixed(1)} → ${(cb * 100).toFixed(1)} %`, cb < ca ? "good" : "bad"],
      ]);
    } else {
      const T = +$(".tc").value;
      const x0 = 46, y0 = 22, gw = w - x0 - 14, gh = h - y0 - 36, lo = -10, hi = 36;
      const X = (t) => x0 + (t - lo) / (hi - lo) * gw, Y = (e) => y0 + gh - e / 65 * gh;
      axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-10, 0, 10, 20, 30].map((t) => [t, String(t)]), yt: [0, 20, 40, 60].map((e) => [e, String(e)]), xlabel: "기온 (°C)", ylabel: "포화 수증기압 (hPa)" });
      ctx.beginPath();
      for (let k = 0; k <= 200; k++) { const t = lo + (hi - lo) * k / 200; k ? ctx.lineTo(X(t), Y(es(t))) : ctx.moveTo(X(t), Y(es(t))); }
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.stroke();
      const e0 = es(T), e1 = es(T + 1), e2 = es(T + 2);
      ctx.fillStyle = "rgba(116,171,102,.25)"; ctx.fillRect(X(T), Y(e2), X(T + 2) - X(T), Y(e0) - Y(e2));
      [[T, e0, C.ink], [T + 2, e2, C.warn]].forEach(([t, e, col]) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(t), Y(e), 4, 0, 7); ctx.fill(); });
      ctx.font = `11px ${F.mono}`; ctx.textAlign = X(T) > x0 + gw * 0.6 ? "right" : "left";
      const dx = ctx.textAlign === "right" ? -10 : 10;
      ctx.fillStyle = C.ink; ctx.fillText(`${T} °C: ${e0.toFixed(1)} hPa`, X(T) + dx, Y(e0) + 16);
      ctx.fillStyle = C.warn; ctx.fillText(`+2 °C: ${e2.toFixed(1)} hPa`, X(T + 2) + dx, Y(e2) - 8);
      setNums([
        ["포화 수증기압", `${e0.toFixed(1)} hPa`],
        ["1 °C 오를 때 증가", `+${((e1 / e0 - 1) * 100).toFixed(1)} %`, "bad"],
        ["2 °C 오를 때 증가", `+${((e2 / e0 - 1) * 100).toFixed(1)} %`, "bad"],
      ]);
    }
  }

  function setView(v) {
    view = v;
    root.querySelectorAll("[data-v]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
    $(".c2-a").hidden = !(v === "sum" || v === "win");
    $(".c2-b").hidden = v !== "model";
    $(".c2-c").hidden = v !== "cc";
    const th = $(".th");
    if (v === "sum") { th.min = 24; th.max = 31; th.value = 29; $(".c2-thlab").textContent = "문턱 기온 (이상)"; }
    if (v === "win") { th.min = -14; th.max = -2; th.value = -10; $(".c2-thlab").textContent = "문턱 기온 (이하)"; }
    $(".th-out").textContent = (+th.value).toFixed(1);
    draw();
  }
  $(".c2-view").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) setView(b.dataset.v); });
  $(".th").addEventListener("input", () => { $(".th-out").textContent = (+$(".th").value).toFixed(1); draw(); });
  $(".mu").addEventListener("input", () => { $(".mu-out").textContent = "+" + (+$(".mu").value).toFixed(1); draw(); });
  $(".sg").addEventListener("input", () => { $(".sg-out").textContent = (+$(".sg").value).toFixed(2); draw(); });
  $(".tc").addEventListener("input", () => { $(".t-out").textContent = $(".tc").value; draw(); });
  setView("sum");
})();
