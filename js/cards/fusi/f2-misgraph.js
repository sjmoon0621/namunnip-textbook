/* 카드: 같은 숫자로 그린 그래프가 왜 다른 인상을 줄까? — 세로축 자르기, 넓이 왜곡, 이중 축 (가상 자료) */
(() => {
  const root = document.getElementById("card-fusi-misgraph");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const sY0 = $(".y0"), sR = $(".r"), cbA = $(".byarea"), sLo = $(".lo"), sHi = $(".hi");
  let mode = "axis";
  const A = 91, B = 94;
  const YRS = Array.from({ length: 20 }, (_, i) => 2004 + i);
  const W1 = [0.4, -0.9, 0.7, 0.2, -0.5, 1.1, -0.3, 0.6, -1.0, 0.3, 0.8, -0.6, 0.1, 0.9, -0.4, -0.8, 0.5, 0.2, -0.2, 0.6];
  const W2 = [-0.2, 0.3, 0.1, -0.3, 0.2, -0.1, 0.35, -0.25, 0.1, 0.2, -0.3, 0.15, 0.25, -0.15, 0.05, 0.3, -0.2, 0.1, 0.2, -0.1];
  const SA = YRS.map((_, i) => 28 + 1.6 * i + 1.2 * W1[i]);
  const SB = YRS.map((_, i) => 62 + 0.45 * i + 0.4 * W2[i]);
  const LA = [20, 65];

  const cv = fit($(".cv-wide"), () => draw());
  const pct = (x) => (x * 100).toFixed(1) + " %";

  function crossYear(lo, hi) {
    const d = SA.map((a, i) => (a - LA[0]) / (LA[1] - LA[0]) - (SB[i] - lo) / (hi - lo));
    for (let i = 1; i < d.length; i++) if (d[i - 1] * d[i] <= 0 && d[i - 1] !== d[i]) return YRS[i - 1] + d[i - 1] / (d[i - 1] - d[i]);
    return null;
  }
  const lie = (g, d) => (Math.abs(d) < 1e-9 ? NaN : g / d);
  const setNums = (k, v) => { ["1", "2", "3"].forEach((n, i) => { $(".k" + n).textContent = k[i]; $(".v" + n).textContent = v[i]; }); };

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "axis") drawAxis(ctx, w, h);
    else if (mode === "area") drawArea(ctx, w, h);
    else drawDual(ctx, w, h);
  }

  function drawAxis(ctx, w, h) {
    const y0 = +sY0.value, top = 100;
    const box = { x0: 52, y0: 22, w: w - 80, h: h - 52 };
    const Y = (v) => box.y0 + box.h - (v - y0) / (top - y0) * box.h;
    const step = top - y0 > 40 ? 20 : top - y0 > 15 ? 5 : top - y0 > 6 ? 2 : 1;
    const yt = []; for (let v = Math.ceil(y0 / step) * step; v <= top; v += step) yt.push([v, String(v)]);
    axes(ctx, { ...box, X: (v) => v, Y, xt: [], yt, ylabel: "납 제거율 (%)" });
    const bw = box.w * 0.22;
    [["A 필터", A, box.x0 + box.w * 0.2], ["B 필터", B, box.x0 + box.w * 0.58]].forEach(([n, v, x]) => {
      ctx.fillStyle = n[0] === "A" ? C.sprout : C.leaf; ctx.strokeStyle = C.forest;
      ctx.fillRect(x, Y(v), bw, box.y0 + box.h - Y(v)); ctx.strokeRect(x + 0.5, Y(v) + 0.5, bw - 1, box.y0 + box.h - Y(v) - 1);
      ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(v + " %", x + bw / 2, Y(v) - 6);
      ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText(n, x + bw / 2, box.y0 + box.h + 16);
    });
    if (y0 > 0) {   // 축이 잘렸음을 알리는 물결
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let k = 0; k <= 12; k++) { const x = box.x0 + 3 + k * 1.6, y = box.y0 + box.h - 8 + (k % 2 ? -3 : 3); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    const dData = (B - A) / A, dPic = (B - y0) / (A - y0) - 1;
    setNums(["자료에서 B는 A보다", "그림(막대 길이)에서 B는 A보다", "거짓말 지수"], [pct(dData) + " 큼", pct(dPic) + " 큼", lie(dPic, dData).toFixed(1)]);
    $(".v3").classList.toggle("bad", lie(dPic, dData) > 1.5);
  }

  function drawArea(ctx, w, h) {
    const r = +sR.value, area = cbA.checked;
    const rMax = Math.min(h * 0.4, w * 0.24), rB = rMax, rA = area ? rMax / Math.sqrt(r) : rMax / r;
    const cy = h * 0.5, xA = w * 0.24, xB = w * 0.64;
    ctx.fillStyle = C.sprout; ctx.strokeStyle = C.forest; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(xA, cy + rB - rA, rA, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.arc(xB, cy, rB, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (!area && r > 1) {   // 정직하게 그렸다면 B의 크기
      const rh = rA * Math.sqrt(r);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(xB, cy + rB - rh, rh, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText("점선: 넓이를 값에 맞췄을 때의 B", 10, 32);
    }
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText("A = 100", xA, cy + rB + 18);
    ctx.fillText(`B = ${Math.round(100 * r)}`, xB, cy + rB + 18);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(area ? "넓이 ∝ 값 (지름 ∝ √값)" : "지름 ∝ 값", 10, 16);
    const picR = area ? r : r * r;
    setNums(["자료에서 B는 A의", "그림(넓이)에서 B는 A의", "거짓말 지수"], [r.toFixed(1) + "배", picR.toFixed(1) + "배", r > 1 ? lie(picR - 1, r - 1).toFixed(1) : "—"]);
    $(".v3").classList.toggle("bad", !area && r > 1);
  }

  function drawDual(ctx, w, h) {
    const lo = +sLo.value, hi = +sHi.value;
    const box = { x0: 40, y0: 22, w: w - 80, h: h - 50 };
    const X = (yr) => box.x0 + (yr - 2004) / 19 * box.w;
    const YL = (v) => box.y0 + box.h - (v - LA[0]) / (LA[1] - LA[0]) * box.h;
    const YR = (v) => box.y0 + box.h - (v - lo) / (hi - lo) * box.h;
    axes(ctx, { ...box, X, Y: YL, xt: [2004, 2008, 2012, 2016, 2020].map((y) => [y, String(y)]), yt: [20, 30, 40, 50, 60].map((v) => [v, String(v)]) });
    ctx.save(); ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.warn;
    const st = (hi - lo) > 40 ? 20 : (hi - lo) > 16 ? 5 : 2;
    for (let v = Math.ceil(lo / st) * st; v <= hi; v += st) ctx.fillText(String(v), box.x0 + box.w + 5, YR(v) + 3);
    ctx.fillStyle = C.forest; ctx.fillText("지표 A (왼쪽 축)", box.x0, box.y0 - 8);
    ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText("지표 B (오른쪽 축)", box.x0 + box.w + 30, box.y0 - 8);
    ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    [[SA, YL, C.forest], [SB, YR, C.warn]].forEach(([S, Y, col]) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
      S.forEach((v, i) => (i ? ctx.lineTo(X(YRS[i]), Y(v)) : ctx.moveTo(X(YRS[i]), Y(v)))); ctx.stroke();
    });
    const cy = crossYear(lo, hi);
    if (cy) { ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(cy), box.y0); ctx.lineTo(X(cy), box.y0 + box.h); ctx.stroke(); }
    ctx.restore();
    const gA = (SA[19] - SA[0]) / SA[0], gB = (SB[19] - SB[0]) / SB[0];
    setNums(["20년 동안 지표 A", "20년 동안 지표 B", "두 선이 교차하는 해"], ["+" + pct(gA), "+" + pct(gB), cy ? Math.floor(cy) + "년" : "교차 없음"]);
    $(".v3").classList.remove("bad");
  }

  $(".mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    mode = b.dataset.m;
    root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    root.querySelectorAll(".f2-pane").forEach((p) => { p.hidden = p.dataset.p !== mode; });
    draw();
  });
  const outs = () => {
    $(".y0-out").textContent = sY0.value; $(".r-out").textContent = (+sR.value).toFixed(1);
    $(".lo-out").textContent = sLo.value; $(".hi-out").textContent = sHi.value; draw();
  };
  [sY0, sR, sLo, sHi].forEach((el) => el.addEventListener("input", outs));
  cbA.addEventListener("change", draw);
  outs();
  if (/[?&]demo\b/.test(location.search)) { sY0.value = 88; outs(); }
})();
