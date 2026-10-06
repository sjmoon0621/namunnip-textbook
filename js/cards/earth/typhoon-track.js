/* 카드: 실제 태풍의 길과 세기를 자료로 읽을 수 있을까? — IBTrACS 최적 경로(루사·매미·힌남노·카눈), 기압으로 색칠한 진로, 이동 속도, 위험 반원, 우리 지역 대응안 */
(() => {
  const root = document.getElementById("card-earth-typhoon-track");
  if (!root || !window.NMTyphoon || !window.NMEastAsia) return;
  const { C, F, fit, axes, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const LAND = NMEastAsia.land, TY = NMTyphoon;
  const CITY = { seoul: ["서울", 126.98, 37.57], busan: ["부산", 129.08, 35.18], gwangju: ["광주", 126.85, 35.16], gangneung: ["강릉", 128.88, 37.75], jeju: ["제주", 126.53, 33.5], pohang: ["포항", 129.37, 36.02] };
  const R = 6371, rad = Math.PI / 180;
  const hav = (a, b) => { const dl = (b[1] - a[1]) * rad, dn = (b[0] - a[0]) * rad, s = Math.sin(dl / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); };
  const utc = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10), +s.slice(11, 13));
  const kst = (ms) => { const d = new Date(ms + 9 * 3600e3); return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${String(d.getUTCHours()).padStart(2, "0")}시`; };
  const pcol = (p) => {
    const st = [[1010, [150, 180, 210]], [990, [240, 196, 80]], [970, [238, 135, 55]], [950, [214, 64, 44]], [930, [160, 25, 90]], [905, [80, 15, 95]]];
    if (p >= st[0][0]) return `rgb(${st[0][1]})`;
    for (let i = 1; i < st.length; i++) if (p >= st[i][0]) { const [p0, c0] = st[i - 1], [p1, c1] = st[i], u = (p0 - p) / (p0 - p1); return `rgb(${c0.map((c, k) => Math.round(c + u * (c1[k] - c))).join(",")})`; }
    return `rgb(${st[st.length - 1][1]})`;
  };
  function inLand(lon, lat) {
    let hit = false;
    LAND.forEach((p) => {
      for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
        const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
        if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) hit = !hit;
      }
    });
    return hit;
  }
  /* 태풍별 파생 값 */
  TY.forEach((ty) => {
    ty.ms = ty.t.map(utc);
    ty.lf = -1;
    for (let i = 0; i < ty.p.length - 1 && ty.lf < 0; i++) for (let k = 0; k < 36; k++) {
      const u = k / 36, la = ty.p[i][0] + u * (ty.p[i + 1][0] - ty.p[i][0]), lo = ty.p[i][1] + u * (ty.p[i + 1][1] - ty.p[i][1]);
      if (lo > 124 && lo < 131 && la > 34 && la < 39 && inLand(lo, la)) { ty.lf = i; ty.lfMs = ty.ms[i] + u * 6 * 3600e3; break; }
    }
    ty.n30 = ty.p.findIndex(([la]) => la >= 30);
    ty.pmin = Math.min(...ty.p.map((q) => q[2]));
    ty.imin = ty.p.findIndex((q) => q[2] === ty.pmin);
  });
  let ty = TY[0], I = 0, city = "busan";
  const map = fit($(".tt-map"), () => draw()), plot = fit($(".tt-plot"), () => drawPlot());
  const LAT1 = 48, LAT2 = 8, LATC = 28, LONC = 138.5;
  function proj(w, h) {
    const ky = h / (LAT1 - LAT2), kx = ky * Math.cos(LATC * rad), lonL = LONC - w / 2 / kx;
    return { X: (lon) => (lon - lonL) * kx, Y: (lat) => (LAT1 - lat) * ky, ky, kx };
  }
  const speed = (i) => {
    const a = Math.max(0, i - 1), b = Math.min(ty.p.length - 1, i + 1);
    if (a === b) return 0;
    return hav(ty.p[a], ty.p[b]) / ((ty.ms[b] - ty.ms[a]) / 3600e3);
  };
  /* 도시에 가장 가까이 온 때 (1시간 간격 선형 보간) */
  function closest(c) {
    let best = { d: 1e9 };
    for (let i = 0; i < ty.p.length - 1; i++) for (let k = 0; k < 6; k++) {
      const u = k / 6, A = ty.p[i], B = ty.p[i + 1], la = A[0] + u * (B[0] - A[0]), lo = A[1] + u * (B[1] - A[1]);
      const d = hav([la, lo], [c[2], c[1]]);
      if (d < best.d) {
        const hx = (B[1] - A[1]) * Math.cos(la * rad), hy = B[0] - A[0], cx = (c[1] - lo) * Math.cos(la * rad), cy = c[2] - la;
        best = { d, i, u, la, lo, ms: ty.ms[i] + u * 6 * 3600e3, p: A[2] + u * (B[2] - A[2]), r30: (A[5] + u * (B[5] - A[5])) * 1.852, right: hx * cy - hy * cx < 0 };
      }
    }
    return best;
  }
  function draw() {
    const { ctx } = map, { w, h } = map.size; if (!w) return;
    const P = proj(w, h);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#dfe7ef"; ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    LAND.forEach((p) => { for (let i = 0; i < p.length; i += 2) { const x = P.X(p[i]), y = P.Y(p[i + 1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); });
    ctx.fillStyle = "#f4f1e8"; ctx.fill("evenodd"); ctx.strokeStyle = "#c9c3b2"; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.strokeStyle = "rgba(90,110,130,.25)"; ctx.setLineDash([2, 3]); ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    [10, 20, 30, 40].forEach((la) => { const y = P.Y(la) + .5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); ctx.fillText(`${la}°N`, 4, y - 3); });
    [120, 130, 140, 150, 160].forEach((lo) => { const x = P.X(lo) + .5; if (x > w - 34) return; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); ctx.fillText(`${lo}°E`, x + 3, h - 4); });
    ctx.setLineDash([]);
    /* 다른 태풍은 흐리게 */
    TY.forEach((o) => { if (o === ty) return; ctx.strokeStyle = "rgba(90,90,100,.22)"; ctx.lineWidth = 1.2; ctx.beginPath(); o.p.forEach((q, i) => (i ? ctx.lineTo(P.X(q[1]), P.Y(q[0])) : ctx.moveTo(P.X(q[1]), P.Y(q[0])))); ctx.stroke(); });
    /* 진로: 기압 색 */
    for (let i = 0; i < ty.p.length - 1; i++) {
      const a = ty.p[i], b = ty.p[i + 1];
      ctx.strokeStyle = pcol((a[2] + b[2]) / 2); ctx.lineWidth = i < I ? 3.4 : 2; ctx.globalAlpha = i < I ? 1 : 0.45;
      ctx.beginPath(); ctx.moveTo(P.X(a[1]), P.Y(a[0])); ctx.lineTo(P.X(b[1]), P.Y(b[0])); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ty.p.forEach((q, i) => { if (ty.ms[i] % (86400e3) !== 0) return; ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(P.X(q[1]), P.Y(q[0]), 2.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    /* 지금 위치: 강풍 반경(30 kt)과 위험 반원 */
    const q = ty.p[I], cx = P.X(q[1]), cy = P.Y(q[0]);
    const a = ty.p[Math.max(0, I - 1)], b = ty.p[Math.min(ty.p.length - 1, I + 1)];
    const hx = P.X(b[1]) - P.X(a[1]), hy = P.Y(b[0]) - P.Y(a[0]), a0 = Math.atan2(hy, hx);
    if (q[5] > 0) {
      const ry = q[5] * 1.852 / 111 * P.ky, rx = ry * Math.cos(LATC * rad) / Math.cos(q[0] * rad);
      ctx.fillStyle = "rgba(200,60,40,.22)"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.ellipse(cx, cy, rx, ry, 0, a0, a0 + Math.PI); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(60,110,180,.12)"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.ellipse(cx, cy, rx, ry, 0, a0 + Math.PI, a0 + 2 * Math.PI); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(120,40,30,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      if (hx || hy) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; const L = Math.hypot(hx, hy), ux = hx / L, uy = hy / L, e = Math.min(rx, ry) + 10; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + ux * e, cy + uy * e); ctx.lineTo(cx + ux * (e - 6) - uy * 4, cy + uy * (e - 6) + ux * 4); ctx.moveTo(cx + ux * e, cy + uy * e); ctx.lineTo(cx + ux * (e - 6) + uy * 4, cy + uy * (e - 6) - ux * 4); ctx.stroke(); }
    }
    ctx.fillStyle = pcol(q[2]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    /* 도시와 최근접 */
    const c = CITY[city], cl = closest(c), px = P.X(c[1]), py = P.Y(c[2]);
    ctx.strokeStyle = C.ink; ctx.setLineDash([3, 2]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(P.X(cl.lo), P.Y(cl.la)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#111"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.fillRect(px - 3.5, py - 3.5, 7, 7); ctx.strokeRect(px - 3.5, py - 3.5, 7, 7);
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.lineWidth = 3; ctx.strokeText(c[0], px + 6, py - 4); ctx.fillStyle = C.ink; ctx.fillText(c[0], px + 6, py - 4);
    /* 제목 띠와 범례 */
    ctx.font = `600 11.5px ${F.sans}`;
    const tag = `${ty.year} ${ty.no} ${ty.name}(${ty.en}) · ${kst(ty.ms[I])} (한국 시각)`;
    ctx.fillStyle = "rgba(255,255,255,.88)"; ctx.fillRect(6, 6, ctx.measureText(tag).width + 12, 20); ctx.fillStyle = C.ink; ctx.fillText(tag, 12, 20);
    const lx = w - 132, ly = h - 70;
    ctx.fillStyle = "rgba(255,255,255,.88)"; ctx.fillRect(lx - 6, ly - 16, 132, 54);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("중심 기압 (hPa)", lx, ly - 4);
    for (let k = 0; k < 110; k++) { ctx.fillStyle = pcol(1010 - k); ctx.fillRect(lx + k, ly + 2, 1.2, 9); }
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("1010", lx, ly + 22); ctx.textAlign = "center"; ctx.fillText("960", lx + 50, ly + 22); ctx.textAlign = "right"; ctx.fillText("900", lx + 110, ly + 22);
    ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillStyle = "rgba(200,60,40,.8)"; ctx.fillRect(lx, ly + 28, 9, 7); ctx.fillStyle = C.ink2; ctx.fillText("위험 반원 (30 kt 반경)", lx + 13, ly + 35);
    nums(cl);
  }
  function drawPlot() {
    const { ctx } = plot, { w, h } = plot.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t0 = ty.ms[0], days = (ty.ms[ty.ms.length - 1] - t0) / 86400e3;
    const box = { x0: 40, y0: 22, w: w - 78, h: h - 50 };
    const X = (ms) => box.x0 + (ms - t0) / 86400e3 / days * box.w, Y = (p) => box.y0 + (1012 - p) / 112 * box.h, YL = (la) => box.y0 + box.h - (la - 5) / 50 * box.h;
    const xt = []; for (let d = 0; d <= days; d += 2) xt.push([t0 + d * 86400e3, `${d}일`]);
    axes(ctx, { ...box, X, Y, xt, yt: [1000, 980, 960, 940, 920, 900].map((p) => [p, String(p)]), ylabel: "중심 기압 (hPa) ↓ 강함", xlabel: "첫 자료부터 지난 날" });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = "#7a8a99"; ctx.textAlign = "left"; [10, 30, 50].forEach((la) => ctx.fillText(`${la}°`, box.x0 + box.w + 5, YL(la) + 3));
    ctx.textAlign = "right"; ctx.fillText("위도", box.x0 + box.w + 34, box.y0 - 7);
    const tagText = (txt, x, y, right, col) => {
      const tw = ctx.measureText(txt).width, x0 = right ? x - 4 - tw : x + 4;
      ctx.fillStyle = "rgba(251,251,248,.92)"; ctx.fillRect(x0 - 2, y - 10, tw + 4, 13);
      ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(txt, x0, y);
    };
    const vline = (ms, txt, col, row) => {
      if (ms == null) return; const x = X(ms) + .5;
      ctx.strokeStyle = col; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, box.y0); ctx.lineTo(x, box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = `10.5px ${F.sans}`; tagText(txt, x, box.y0 + 12 + row * 14, x > box.x0 + box.w * 0.6, col);
    };
    const xc = X(ty.ms[I]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xc + .5, box.y0); ctx.lineTo(xc + .5, box.y0 + box.h); ctx.stroke();
    vline(ty.ms[ty.n30], "북위 30° 통과", "#3a7bbf", 1);
    vline(ty.lfMs, "한반도 상륙(보간)", C.warn, 0);
    ctx.strokeStyle = "#9aa9b8"; ctx.lineWidth = 1.2; ctx.beginPath(); ty.p.forEach((q, i) => (i ? ctx.lineTo(X(ty.ms[i]), YL(q[0])) : ctx.moveTo(X(ty.ms[i]), YL(q[0])))); ctx.stroke();
    for (let i = 0; i < ty.p.length - 1; i++) { ctx.strokeStyle = pcol(ty.p[i][2]); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(X(ty.ms[i]), Y(ty.p[i][2])); ctx.lineTo(X(ty.ms[i + 1]), Y(ty.p[i + 1][2])); ctx.stroke(); }
    const mx = X(ty.ms[ty.imin]), my = Y(ty.pmin);
    ctx.font = `10.5px ${F.mono}`; tagText(`최저 ${ty.pmin} hPa`, mx, Math.min(my + 14, box.y0 + box.h - 3), true, C.ink);
    ctx.fillStyle = pcol(ty.p[I][2]); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(X(ty.ms[I]), Y(ty.p[I][2]), 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  function nums(cl) {
    const q = ty.p[I], G = { 2: "열대 저압부", 3: "열대 폭풍(TS)", 4: "강한 열대 폭풍(STS)", 5: "태풍(TY)", 6: "온대 저기압" };
    $(".n-p").textContent = `${q[2]} hPa`;
    $(".n-w").textContent = q[3] ? `${(q[3] * 0.5144).toFixed(0)} m/s` : "—";
    $(".n-v").textContent = `${speed(I).toFixed(0)} km/h`;
    $(".n-g").textContent = G[q[4]] || "—";
    $(".i-out").textContent = kst(ty.ms[I]);
    const c = CITY[city];
    $(".c-t").textContent = kst(cl.ms);
    $(".c-d").textContent = `${Math.round(cl.d)} km`;
    $(".c-p").textContent = `${Math.round(cl.p)} hPa`;
    $(".c-s").textContent = cl.r30 ? `${cl.right ? "오른쪽(위험 반원)" : "왼쪽"}` : "—";
    cityVerdict(cl, c);
  }
  function cityVerdict(cl, c) {
    const chosen = [...root.querySelectorAll(".plan input")].filter((x) => x.checked), good = chosen.filter((x) => x.dataset.ok === "1").length, bad = chosen.length - good;
    const inside = cl.r30 && cl.d <= cl.r30;
    const v = $(".plan-v");
    const head = `${c[0]}: ${ty.name}가 ${kst(cl.ms)}쯤 ${Math.round(cl.d)} km까지 다가옵니다. ` + (inside ? `강풍(30 kt ≈ 15 m/s) 반경 ${Math.round(cl.r30)} km 안이며 진로의 ${cl.right ? "오른쪽(위험 반원)" : "왼쪽"}입니다.` : `강풍 반경${cl.r30 ? ` ${Math.round(cl.r30)} km` : ""} 밖이지만 비구름은 더 넓게 퍼질 수 있습니다.`);
    const tail = chosen.length ? ` 고른 대비 ${good}/4${bad ? `, 피해야 할 행동 ${bad}개가 섞여 있습니다.` : "."}` : " 아래에서 대비 행동을 고르세요.";
    v.textContent = head + tail;
    v.className = "verdict small plan-v" + (good === 4 && !bad ? " good" : "");
  }
  const redraw = () => { draw(); drawPlot(); };
  const slider = $(".ti");
  function pick(k) {
    ty = TY.find((o) => o.id === k);
    slider.max = ty.p.length - 1; I = ty.lf > 0 ? ty.lf : ty.imin; slider.value = I;
    root.querySelectorAll("[data-ty]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.ty === k)));
    redraw();
  }
  slider.addEventListener("input", () => { I = +slider.value; redraw(); });
  root.querySelectorAll("[data-ty]").forEach((b) => b.addEventListener("click", () => pick(b.dataset.ty)));
  root.querySelectorAll("[data-city]").forEach((b) => b.addEventListener("click", () => { city = b.dataset.city; root.querySelectorAll("[data-city]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); }));
  root.querySelectorAll(".plan input").forEach((x) => x.addEventListener("change", () => draw()));
  pick("rusa");
  if (/[?&]demo\b/.test(location.search)) {
    root.querySelector('[data-ty="maemi"]').click();
    root.querySelector('[data-city="busan"]').click();
    root.querySelectorAll(".plan input").forEach((x, i) => { if (i < 3 || i === 4) x.checked = true; });
    draw();
  }
})();
