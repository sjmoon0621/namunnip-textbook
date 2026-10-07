/* 카드: 바닷물이 1 °C 더 따뜻한 날이 몇 주 이어지면 산호는 왜 하얗게 될까? — NOAA Coral Reef Watch 일별 HotSpot으로 DHW를 직접 더해 보기 */
(() => {
  const root = document.getElementById("card-clim-dhw");
  if (!root || !window.NMDhw) return;
  const { C, F, fit, axes, clamp } = NM;
  const D = NMDhw, $ = (s) => root.querySelector(s);
  const IDX = {}; [...D.A].forEach((c, i) => { IDX[c] = i * 0.05; });
  const LEV = [
    [20, "경보 5단계", "#3a0f24"], [16, "경보 4단계", "#5e1630"], [12, "경보 3단계", "#8a1f2e"],
    [8, "경보 2단계", "#b5332a"], [4, "경보 1단계", "#d46a2e"],
  ];
  const levOf = (dhw, hs) => {
    for (const [t, n, c] of LEV) if (dhw >= t) return [n, c];
    if (hs >= 1 && dhw > 0) return ["경고", "#e0a02a"];
    if (hs > 0) return ["주의", "#d9c35a"];
    return ["없음", "#9fb59a"];
  };
  const barCol = (m) => { for (const [t, , c] of LEV) if (m >= t) return c; return m > 0 ? "#e0a02a" : "#9fb59a"; };

  let reg = "gbrn", year = 2016, day = 120;
  const R = () => D.r[reg];
  const yMin = () => R().y0, yMax = () => R().y0 + R().seasons.length - 1;
  const season = () => R().seasons[year - R().y0];
  const hsArr = () => [...season().s].map((c) => IDX[c] || 0);
  // 화면에 보이는 여름: 남반구 11/1–5/31 (자료는 7/1부터), 북반구 6/1–12/31 (자료는 1/1부터)
  const start = () => R().hemi === "S" ? new Date(Date.UTC(year - 1, 6, 1)) : new Date(Date.UTC(year, 0, 1));
  const addDay = (d, n) => new Date(d.getTime() + n * 864e5);
  const win = () => {
    const s0 = start(), n = season().s.length;
    const a = R().hemi === "S" ? new Date(Date.UTC(year - 1, 10, 1)) : new Date(Date.UTC(year, 5, 1));
    const b = R().hemi === "S" ? new Date(Date.UTC(year, 4, 31)) : new Date(Date.UTC(year, 11, 31));
    const i0 = Math.round((a - s0) / 864e5), i1 = Math.min(n - 1, Math.round((b - s0) / 864e5));
    return [i0, i1];
  };
  const dhwAt = (hs, i) => { let s = 0, k = 0; for (let j = Math.max(0, i - 83); j <= i; j++) if (hs[j] >= 1) { s += hs[j]; k++; } return [s / 7, k]; };
  const fmtD = (d) => `${d.getUTCFullYear()}.${d.getUTCMonth() + 1}.${d.getUTCDate()}`;

  const A = fit($(".dh-yr"), () => drawY()), B = fit($(".dh-day"), () => drawD());
  let boxY = null, boxD = null, i0 = 0, i1 = 0;

  function drawY() {
    const { ctx } = A, { w, h } = A.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = R(), ys = r.seasons, lo = 1985, hi = 2026;
    const box = { x0: 30, y0: 20, w: w - 66, h: h - 44 }; boxY = box;
    const top = 24, X = (y) => box.x0 + (y - lo) / (hi - lo + 1) * box.w, Y = (v) => box.y0 + box.h - Math.min(v, top) / top * box.h;
    axes(ctx, { ...box, X, Y, xt: [1990, 2000, 2010, 2020].map((y) => [y + 0.5, String(y)]), yt: [0, 4, 8, 12, 16, 20].map((v) => [v, String(v)]), ylabel: `여름철 최고 DHW (°C-주) · ${r.name}` });
    const bw = box.w / (hi - lo + 1);
    ys.forEach((s, k) => {
      const y = r.y0 + k, x = X(y);
      ctx.fillStyle = barCol(s.m); ctx.globalAlpha = y === year ? 1 : 0.72;
      ctx.fillRect(x + 1, Y(s.m), Math.max(1, bw - 2), box.y0 + box.h - Y(s.m));
      if (y === year) { ctx.globalAlpha = 1; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, Y(Math.max(s.m, 0.4)) - 2.5, bw - 1, box.y0 + box.h - Y(Math.max(s.m, 0.4)) + 2.5); }
    });
    ctx.globalAlpha = 1;
    [[4, "1단계"], [8, "2단계"]].forEach(([v, t]) => {
      ctx.strokeStyle = "rgba(35,35,38,.35)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(box.x0, Y(v) + .5); ctx.lineTo(box.x0 + box.w, Y(v) + .5); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(t, box.x0 + box.w + 4, Y(v) + 3);
    });
    const s = ys[year - r.y0];
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`고른 해 ${year}: 최고 ${s.m.toFixed(1)}`, box.x0 + 6, box.y0 + 10);
  }

  function drawD() {
    const { ctx } = B, { w, h } = B.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const hs = hsArr(); [i0, i1] = win();
    const n = i1 - i0 + 1, box = { x0: 30, y0: 22, w: w - 66, h: h - 50 }; boxD = box;
    const X = (i) => box.x0 + (i - i0) / Math.max(1, n) * box.w;
    const Yh = (v) => box.y0 + box.h - v / 4 * box.h;
    const dTop = Math.max(12, Math.ceil(Math.max(season().m, 4) / 4) * 4 + 4);
    const Yd = (v) => box.y0 + box.h - Math.min(v, dTop) / dTop * box.h;
    const s0 = start();
    const xt = [];
    for (let i = i0; i <= i1; i++) { const d = addDay(s0, i); if (d.getUTCDate() === 1) xt.push([i, `${d.getUTCMonth() + 1}월`]); }
    axes(ctx, { ...box, X, Y: Yh, xt, yt: [0, 1, 2, 3].map((v) => [v, v + " °C"]), ylabel: "HotSpot (막대) · DHW (선, 오른쪽 눈금)" });
    // 오른쪽 DHW 눈금
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.forest; ctx.textAlign = "left";
    for (let v = 0; v <= dTop; v += 4) ctx.fillText(String(v), box.x0 + box.w + 5, Yd(v) + 3);
    // 12주 창
    const a = Math.max(i0, day - 83);
    ctx.fillStyle = "rgba(141,141,146,.16)"; ctx.fillRect(X(a), box.y0, X(day + 1) - X(a), box.h);
    // 1 °C 문턱
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(box.x0, Yh(1) + .5); ctx.lineTo(box.x0 + box.w, Yh(1) + .5); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("문턱 1 °C", box.x0 + 4, Yh(1) - 4);
    // HotSpot 막대
    const bw = box.w / n;
    for (let i = i0; i <= i1; i++) {
      const v = hs[i]; if (v <= 0) continue;
      const inWin = i <= day && i >= day - 83;
      ctx.fillStyle = v >= 1 ? (inWin ? "#c4462f" : "rgba(196,70,47,.38)") : (inWin ? "#d9b84a" : "rgba(217,184,74,.4)");
      ctx.fillRect(X(i), Yh(Math.min(v, 4)), Math.max(1, bw - 0.3), box.y0 + box.h - Yh(Math.min(v, 4)));
    }
    // 경보 문턱 (DHW 눈금)
    [4, 8, 12, 16, 20].filter((v) => v <= dTop).forEach((v) => {
      ctx.strokeStyle = "rgba(59,124,42,.28)"; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(box.x0, Yd(v) + .5); ctx.lineTo(box.x0 + box.w, Yd(v) + .5); ctx.stroke(); ctx.setLineDash([]);
    });
    // DHW 곡선
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = i0; i <= i1; i++) { const p = [X(i) + bw / 2, Yd(dhwAt(hs, i)[0])]; i === i0 ? ctx.moveTo(...p) : ctx.lineTo(...p); }
    ctx.stroke(); ctx.lineWidth = 1;
    // 커서
    const cx = X(day) + bw / 2, [dv] = dhwAt(hs, day);
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(cx + .5, box.y0); ctx.lineTo(cx + .5, box.y0 + box.h); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(cx, Yd(dv), 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = cx > box.x0 + box.w * 0.7 ? "right" : "left";
    ctx.fillText(`DHW ${dv.toFixed(1)}`, cx + (ctx.textAlign === "right" ? -7 : 7), Math.max(box.y0 + 12, Yd(dv) - 8));
  }

  function update() {
    const r = R();
    year = clamp(year, yMin(), yMax());
    const yr = $(".yr"); yr.min = yMin(); yr.max = yMax(); yr.value = year;
    [i0, i1] = win();
    const dEl = $(".day"); dEl.min = i0; dEl.max = i1; day = clamp(day, i0, i1); dEl.value = day;
    const hs = hsArr(), [dv, k] = dhwAt(hs, day), [ln, lc] = levOf(dv, hs[day]);
    $(".y-out").textContent = r.hemi === "S" ? `${year - 1}–${String(year).slice(2)} 여름` : `${year} 여름`;
    $(".d-out").textContent = fmtD(addDay(start(), day));
    $(".n-hs").textContent = hs[day].toFixed(2) + " °C";
    $(".n-nd").textContent = k + "일";
    $(".n-dhw").textContent = dv.toFixed(1) + " °C-주";
    const al = $(".n-al"); al.textContent = ln; al.style.color = lc;
    // 앞뒤 20년 비교
    const cnt = (a, b) => r.seasons.filter((s, j) => r.y0 + j >= a && r.y0 + j <= b && s.m >= 8).length;
    const a1 = r.y0, mid = 2005;
    $(".dh-cnt").textContent = `${r.name}: 여름 최고 DHW가 8 °C-주 이상(경보 2단계 이상)인 해는 ${a1}–${mid}년 ${cnt(a1, mid)}번, ${mid + 1}–2026년 ${cnt(mid + 1, 2026)}번입니다. 이 해의 공식 최고 DHW는 ${season().m.toFixed(1)}입니다.`;
    drawY(); drawD();
  }

  root.querySelectorAll(".dh-reg .chip").forEach((b) => b.addEventListener("click", () => {
    reg = b.dataset.r; year = clamp(year, yMin(), yMax()); toMax();
    root.querySelectorAll(".dh-reg .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    update();
  }));
  $(".yr").addEventListener("input", (e) => { year = +e.target.value; toMax(); update(); });
  $(".day").addEventListener("input", (e) => { day = +e.target.value; update(); });
  $(".dh-yr").addEventListener("click", (e) => {
    if (!boxY) return;
    const rc = e.currentTarget.getBoundingClientRect(), x = e.clientX - rc.left;
    const y = Math.floor(1985 + (x - boxY.x0) / boxY.w * 42);
    if (y >= yMin() && y <= yMax()) { year = y; toMax(); update(); }
  });
  const cv = $(".dh-day");
  const pick = (e) => {
    if (!boxD) return;
    const rc = cv.getBoundingClientRect(), x = e.clientX - rc.left;
    day = clamp(Math.round(i0 + (x - boxD.x0) / boxD.w * (i1 - i0 + 1) - 0.5), i0, i1); update();
  };
  let drag = false;
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) pick(e); });
  cv.addEventListener("pointerup", () => { drag = false; });

  // 처음에는 고른 해의 DHW 최고일에 커서를 둔다
  const toMax = () => { const hs = hsArr(); [i0, i1] = win(); let best = i0, bv = -1; for (let i = i0; i <= i1; i++) { const v = dhwAt(hs, i)[0]; if (v > bv) { bv = v; best = i; } } day = best; };
  toMax();
  if (/[?&]demo\b/.test(location.search)) { reg = "gbrn"; year = 2016; toMax(); day = Math.max(win()[0], day - 10); }
  update();
})();
