/* 카드: 북극 바다 얼음은 얼마나 빨리 줄고 있을까? — NSIDC Sea Ice Index 월평균 면적 1979–2026 */
(() => {
  const root = document.getElementById("card-clim-seaice");
  if (!root || !window.NMSeaIce) return;
  const { C, F, fit, axes } = NM;
  const D = NMSeaIce, $ = (s) => root.querySelector(s);
  const Y0 = D.y0, NY = D.e.length;
  const val = (y, m) => (D.e[y - Y0] ? D.e[y - Y0][m] : null);
  const MN = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  const a = fit($(".si-ts"), () => drawTS()), b = fit($(".si-cy"), () => drawCy());
  const COL = { pt: "#2f62a8", fit: "#c4462f", sel: C.ink };

  function series(m) {
    const xs = [], ys = [];
    for (let y = Y0; y < Y0 + NY; y++) { const v = val(y, m); if (v !== null) { xs.push(y); ys.push(v); } }
    return { xs, ys };
  }
  function lin(xs, ys) {
    const n = xs.length, mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
    let sxy = 0, sxx = 0; xs.forEach((x, k) => { sxy += (x - mx) * (ys[k] - my); sxx += (x - mx) ** 2; });
    const b1 = sxy / sxx; return { b1, b0: my - b1 * mx };
  }
  const base = (m) => { let s = 0, n = 0; for (let y = 1981; y <= 2010; y++) { const v = val(y, m); if (v !== null) { s += v; n++; } } return s / n; };

  function drawTS() {
    const { ctx } = a, { w, h } = a.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = +$(".mo").value - 1, yr = +$(".yr").value, { xs, ys } = series(m), L = lin(xs, ys);
    const box = { x0: 34, y0: 22, w: w - 44, h: h - 48 }, lo = 0, hi = 18;
    const X = (y) => box.x0 + (y - 1978) / (Y0 + NY + 1 - 1978) * box.w, Y = (v) => box.y0 + (hi - v) / (hi - lo) * box.h;
    axes(ctx, { ...box, X, Y, xt: [1980, 1990, 2000, 2010, 2020].map((y) => [y, String(y)]), yt: [0, 3, 6, 9, 12, 15, 18].map((v) => [v, String(v)]), ylabel: `북극 바다 얼음 면적 (백만 km²) · ${MN[m]}` });
    // 다른 달은 흐리게
    [2, 8].forEach((k) => {
      if (k === m) return;
      const s = series(k); ctx.strokeStyle = "rgba(141,141,146,.45)"; ctx.lineWidth = 1; ctx.beginPath();
      s.xs.forEach((y, i) => { const p = [X(y), Y(s.ys[i])]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); }); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(MN[k], X(s.xs[s.xs.length - 1]) - 4, Y(s.ys[s.ys.length - 1]) - 6);
    });
    ctx.strokeStyle = COL.fit; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(xs[0]), Y(L.b0 + L.b1 * xs[0])); ctx.lineTo(X(xs[xs.length - 1]), Y(L.b0 + L.b1 * xs[xs.length - 1])); ctx.stroke();
    xs.forEach((y, i) => { ctx.fillStyle = y === yr ? COL.sel : COL.pt; ctx.beginPath(); ctx.arc(X(y), Y(ys[i]), y === yr ? 4.5 : 2.6, 0, Math.PI * 2); ctx.fill(); });
  }

  function drawCy() {
    const { ctx } = b, { w, h } = b.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const yr = +$(".yr").value, m = +$(".mo").value - 1;
    const box = { x0: 34, y0: 22, w: w - 44, h: h - 48 }, lo = 0, hi = 18;
    const X = (k) => box.x0 + (k + 0.5) / 12 * box.w, Y = (v) => box.y0 + (hi - v) / (hi - lo) * box.h;
    axes(ctx, { ...box, X, Y, xt: [0, 2, 4, 6, 8, 10].map((k) => [k, MN[k]]), yt: [0, 6, 12, 18].map((v) => [v, String(v)]), ylabel: "한 해 동안의 변화 (백만 km²)" });
    ctx.fillStyle = "rgba(116,171,102,.14)"; ctx.fillRect(X(m) - box.w / 24, box.y0, box.w / 12, box.h);
    for (let y = Y0; y < Y0 + NY; y++) {
      const t = (y - Y0) / (NY - 1);
      ctx.strokeStyle = y === yr ? COL.sel : `rgba(${Math.round(150 - 110 * t)},${Math.round(180 - 90 * t)},${Math.round(220 - 50 * t)},${y === yr ? 1 : 0.55})`;
      ctx.lineWidth = y === yr ? 2.6 : 1; ctx.beginPath(); let st = false;
      for (let k = 0; k < 12; k++) { const v = val(y, k); if (v === null) { st = false; continue; } const p = [X(k), Y(v)]; st ? ctx.lineTo(...p) : ctx.moveTo(...p); st = true; }
      ctx.stroke();
    }
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = "rgb(150,180,220)"; ctx.fillRect(box.x0 + 8, box.y0 + box.h - 30, 14, 3); ctx.fillStyle = C.ink2; ctx.fillText("1979년", box.x0 + 26, box.y0 + box.h - 26);
    ctx.fillStyle = "rgb(40,90,170)"; ctx.fillRect(box.x0 + 8, box.y0 + box.h - 16, 14, 3); ctx.fillStyle = C.ink2; ctx.fillText("최근", box.x0 + 26, box.y0 + box.h - 12);
    ctx.fillStyle = COL.sel; ctx.fillRect(box.x0 + 78, box.y0 + box.h - 16, 14, 3); ctx.fillStyle = C.ink2; ctx.fillText(`${yr}년`, box.x0 + 96, box.y0 + box.h - 12);
  }

  function update() {
    const m = +$(".mo").value - 1, yr = +$(".yr").value, { xs, ys } = series(m), L = lin(xs, ys), B = base(m);
    $(".mo-out").textContent = MN[m]; $(".yr-out").textContent = String(yr);
    $(".n-t").textContent = `${(L.b1 * 10 * 100).toFixed(0)}만 km²`;
    $(".n-p").textContent = `${(L.b1 * 10 / B * 100).toFixed(1)} %`;
    const v = val(yr, m);
    $(".n-v").textContent = v === null ? "자료 없음" : `${v.toFixed(2)}백만 km²`;
    const avg = (a0, a1) => { const s = []; for (let y = a0; y <= a1; y++) { const q = val(y, m); if (q !== null) s.push(q); } return s.reduce((p, q) => p + q, 0) / s.length; };
    const old = avg(1979, 1988), now = avg(2015, 2024);
    $(".n-d").textContent = `${((now - old) / old * 100).toFixed(0)} %`;
    $(".verdict").textContent = `${MN[m]}의 바다 얼음은 10년마다 ${(Math.abs(L.b1) * 10 * 100).toFixed(0)}만 km²씩(1981–2010 평균의 ${Math.abs(L.b1 * 10 / B * 100).toFixed(1)} %) 줄었습니다. 1979–1988년 평균 ${old.toFixed(1)}백만 km²에서 2015–2024년 평균 ${now.toFixed(1)}백만 km²가 되었습니다. 남한 넓이(약 10만 km²)의 ${Math.round((old - now) * 10)}배가 사라진 셈입니다.`;
    drawTS(); drawCy();
  }
  $(".yr").min = String(Y0); $(".yr").max = String(Y0 + NY - 1);
  $(".mos").addEventListener("click", (e) => { const bt = e.target.closest("[data-m]"); if (!bt) return; $(".mo").value = bt.dataset.m; update(); });
  root.querySelectorAll(".mo, .yr").forEach((el) => el.addEventListener("input", update));
  update();
  if (/[?&]demo\b/.test(location.search)) { $(".yr").value = "2012"; update(); }
})();
