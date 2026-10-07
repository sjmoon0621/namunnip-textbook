/* 카드: 해수면 상승 중 열팽창은 얼마이고 나머지는 어디서 왔을까? — NOAA 위성 고도계 GMSL + NCEI 열팽창 해수면 */
(() => {
  const root = document.getElementById("card-clim-slr");
  if (!root || !window.NMSeaLevel) return;
  const { C, F, fit, axes } = NM;
  const D = NMSeaLevel, $ = (s) => root.querySelector(s);
  const get = (k, y) => { const i = y - D[k + "Y0"]; return i >= 0 && i < D[k].length ? D[k][i] : null; };
  const GY0 = D.gY0, GY1 = D.gY0 + D.g.length - 1;
  // 세 자료의 0점을 2005–2007년 평균에 맞춘다
  const ref = (k) => (get(k, 2005) + get(k, 2006) + get(k, 2007)) / 3;
  const R = { g: ref("g"), t7: ref("t7"), t2: ref("t2") };
  const S = (k, y) => { const v = get(k, y); return v === null ? null : v - R[k]; };
  let dep = "t2";
  const COL = { g: C.ink, t: "#c4462f", m: "#2f62a8", sel: "rgba(116,171,102,.16)" };
  const a = fit($(".sl-cv"), () => draw());
  const win = () => { const s = +$(".ws").value, L = +$(".wl").value; return [s, Math.min(s + L - 1, GY1)]; };
  function rate(f, a0, b0) {
    const xs = [], ys = [];
    for (let y = a0; y <= b0; y++) { const v = f(y); if (v !== null) { xs.push(y); ys.push(v); } }
    if (xs.length < 3) return null;
    const n = xs.length, mx = xs.reduce((p, v) => p + v, 0) / n, my = ys.reduce((p, v) => p + v, 0) / n;
    let sxy = 0, sxx = 0; xs.forEach((x, k) => { sxy += (x - mx) * (ys[k] - my); sxx += (x - mx) ** 2; });
    return sxy / sxx;
  }
  const mass = (y) => { const g = S("g", y), t = S(dep, y); return g === null || t === null ? null : g - t; };

  function draw() {
    const { ctx } = a, { w, h } = a.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 38, y0: 24, w: w - 48, h: h - 50 }, lo = -50, hi = 70;
    const X = (y) => box.x0 + (y - GY0 + 0.5) / (GY1 - GY0 + 1) * box.w, Y = (v) => box.y0 + (hi - v) / (hi - lo) * box.h;
    axes(ctx, { ...box, X, Y, xt: [1995, 2005, 2015].map((y) => [y, String(y)]).concat([[GY1, String(GY1)]]), yt: [-40, -20, 0, 20, 40, 60].map((v) => [v, String(v)]), ylabel: "해수면 편차 (mm, 2005–2007 평균 = 0)" });
    const [s, e] = win();
    ctx.fillStyle = COL.sel; ctx.fillRect(X(s - 0.5), box.y0, X(e + 0.5) - X(s - 0.5), box.h);
    const line = (f, col, lw, dot) => {
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath(); let st = false;
      for (let y = GY0; y <= GY1; y++) { const v = f(y); if (v === null) { st = false; continue; } const p = [X(y), Y(v)]; st ? ctx.lineTo(...p) : ctx.moveTo(...p); st = true; }
      ctx.stroke();
      if (dot) for (let y = GY0; y <= GY1; y++) { const v = f(y); if (v !== null) { ctx.beginPath(); ctx.arc(X(y), Y(v), 2.4, 0, Math.PI * 2); ctx.fill(); } }
    };
    line((y) => S("g", y), COL.g, 2.2, true);
    line((y) => S(dep, y), COL.t, 2, false);
    line(mass, COL.m, 2, false);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    const lx = box.x0 + 8; let ly = box.y0 + 12;
    ctx.fillStyle = "rgba(251,251,248,.88)"; ctx.fillRect(lx - 4, ly - 11, 232, 48);
    [[COL.g, "전체 해수면 (위성 고도계)"], [COL.t, `열팽창 (${dep === "t2" ? "0–2000 m" : "0–700 m"} 수온 관측)`], [COL.m, "나머지 = 질량 증가 (빙하·빙상·육지 물)"]].forEach(([c, t]) => {
      ctx.fillStyle = c; ctx.fillRect(lx, ly - 4, 14, 2.4); ctx.fillStyle = C.ink2; ctx.fillText(t, lx + 20, ly); ly += 15;
    });
  }

  function update() {
    let [s, e] = win();
    $(".ws-out").textContent = `${s}–${e}`; $(".wl-out").textContent = String(e - s + 1);
    const t0 = dep === "t2" ? Math.max(s, D.t2Y0) : s;
    const rg = rate((y) => S("g", y), s, e), rt = rate((y) => S(dep, y), t0, e), rm = rate(mass, t0, e), rg2 = rate((y) => S("g", y), t0, e);
    const f2 = (v) => (v === null ? "—" : `${v.toFixed(2)} mm/년`);
    $(".n-g").textContent = f2(rg); $(".n-t").textContent = f2(rt); $(".n-m").textContent = f2(rm);
    $(".n-s").textContent = rt !== null && rg2 ? `${Math.round(rt / rg2 * 100)} %` : "—";
    const v = $(".verdict");
    if (rt === null) { v.textContent = "0–2000 m 수온 자료는 Argo 뜰개가 바다를 고르게 덮은 2005년부터 있습니다. 구간을 2005년 뒤로 옮기거나 0–700 m를 고르세요."; }
    else {
      const gt = rm * 362;
      v.textContent = `${t0}–${e}년 해수면은 해마다 ${rg2.toFixed(1)} mm 올랐고, 그 가운데 ${Math.round(rt / rg2 * 100)} %가 바닷물의 열팽창, 나머지 ${rm.toFixed(1)} mm/년이 바다에 더해진 물입니다. 이는 해마다 약 ${Math.round(gt / 10) * 10} Gt(1 mm = 362 Gt)의 물이 육지에서 바다로 옮겨 온 것과 같습니다.${t0 > s ? ` (0–2000 m 자료가 2005년부터라 열팽창과 나머지는 ${t0}년부터 계산했습니다.)` : ""}`;
    }
    draw();
  }

  $(".deps").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-d]"); if (!bt) return;
    dep = bt.dataset.d; root.querySelectorAll(".deps [data-d]").forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update();
  });
  $(".ws").min = String(GY0); $(".ws").max = String(GY1 - 4);
  root.querySelectorAll(".ws, .wl").forEach((el) => el.addEventListener("input", update));
  update();
  if (/[?&]demo\b/.test(location.search)) { $(".ws").value = "2015"; update(); }
})();
