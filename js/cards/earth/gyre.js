/* 카드: 바람과 지구 자전은 어떻게 거대한 해류 고리를 만들까? — 바람대·에크만 수송·아열대 환류 지도, 우리나라 주변 해류, 남북 열 수송, 스토멜 상자 바다(서안 강화) */
(() => {
  const root = document.getElementById("card-earth-gyre");
  if (!root || !window.NMGyreLand) return;
  const { C, F, fit, axes, loop, clamp, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const WARM = "#d4493a", COLD = "#3a62b0";

  /* 해류 경로 (경도 0–360°, 위도). 위치와 모양은 교과서 해류도 수준의 모식 */
  const WORLD = [
    { n: "쿠로시오 해류", w: 1, p: [[122, 21], [123.5, 25], [127, 28.5], [132, 31.5], [137, 33.8], [142, 35.5], [147, 37]], lab: [127, 22.5] },
    { n: "북태평양 해류", w: 1, p: [[150, 39], [165, 41], [180, 42], [200, 43], [222, 43]], lab: [176, 47] },
    { n: "캘리포니아 해류", w: 0, p: [[231, 45], [234, 38], [239, 31], [246, 23]], lab: [243, 33] },
    { n: "북적도 해류", w: 1, p: [[250, 14], [225, 13], [195, 13], [165, 14], [138, 15], [125, 18]], lab: [190, 9.5] },
    { n: "오야시오 해류", w: 0, p: [[163, 55], [156, 49], [149, 44.5], [144.5, 41]] },
    { n: "알래스카 해류", w: 1, p: [[224, 50], [215, 56], [205, 58.5], [195, 57]] },
    { n: "걸프 해류", w: 1, p: [[279, 24], [280, 29.5], [284, 34.5], [290, 38.5], [300, 40.5], [312, 42]], lab: [262, 40] },
    { n: "북대서양 해류", w: 1, p: [[315, 45], [326, 50], [338, 55], [350, 60], [362, 65]] },
    { n: "카나리아 해류", w: 0, p: [[346, 41], [344, 34], [341, 27], [336, 20]], lab: [347.5, 27] },
    { n: "북적도 해류", w: 1, p: [[334, 15], [318, 13.5], [302, 14], [291, 17], [284, 21]] },
    { n: "래브라도 해류", w: 0, p: [[298, 63], [303, 57], [307, 51], [310, 46.5]] },
    { n: "남적도 해류", w: 1, p: [[272, -5], [245, -7], [210, -9], [178, -11], [160, -14]] },
    { n: "동오스트레일리아 해류", w: 1, p: [[156, -16], [154.5, -24], [153.8, -31], [155, -37]] },
    { n: "페루 해류", w: 0, p: [[283, -44], [285, -35], [284, -25], [281, -16], [274, -7]], lab: [262, -24] },
    { n: "남적도 해류", w: 1, p: [[367, -6], [350, -5], [334, -6], [326, -8]] },
    { n: "브라질 해류", w: 1, p: [[324, -11], [319, -19], [312, -27], [305, -36]] },
    { n: "벵겔라 해류", w: 0, p: [[376, -35], [372, -28], [369, -20], [366, -13]] },
    { n: "남극 순환 해류", w: 0, p: [[102, -48], [130, -52], [160, -56], [200, -58], [250, -58], [290, -58.5], [315, -56], [350, -51], [378, -48]], lab: [205, -63] },
  ];
  const KOREA = [
    { n: "쿠로시오 해류", w: 1, p: [[122.6, 23.5], [123.5, 26.5], [126.5, 28.8], [130, 30.6], [133, 32.6], [137, 33.7], [141, 35.2], [146, 37.2]], lab: [138.3, 31.5] },
    { n: "쓰시마 난류", w: 1, p: [[127.6, 30.5], [128.3, 32.4], [129.2, 34.2]], lab: [119.8, 31.6], ll: [127.6, 31.5] },
    { n: "동한 난류", w: 1, p: [[129.6, 35.4], [129.8, 36.6], [130.1, 37.6], [131.3, 38.3], [133.5, 38.7]], lab: [131.6, 37.3] },
    { n: "쓰시마 난류", w: 1, p: [[130.4, 34.6], [132.6, 35.6], [135.5, 36.6], [138, 38.4], [139.6, 40.2], [140.5, 41.4]] },
    { n: "황해 난류", w: 1, p: [[125.6, 32.4], [124.7, 34.4], [124.2, 36.4], [123.8, 38]], lab: [117.6, 35.4], ll: [124.4, 35.4] },
    { n: "북한 한류", w: 0, p: [[131.6, 42.2], [130.4, 41.1], [129.7, 40], [129.4, 38.7]], lab: [123.7, 40.8], ll: [129.9, 40.6] },
    { n: "리만 해류", w: 0, p: [[140.6, 48.5], [139, 46.5], [137, 44.6], [134.5, 43.4], [132.2, 42.6]], lab: [136.8, 43.5] },
    { n: "오야시오 해류", w: 0, p: [[150, 45.2], [146.5, 43.4], [144, 41.6], [142.6, 39.8]], lab: [146.4, 43.2] },
  ];
  /* 남북 열 수송 (PW = 10¹⁵ W, 북쪽이 +). 대략값: 전체는 위도 35° 부근 약 5.8 PW(Trenberth & Caron 2001),
     해양은 북위 20° 부근 약 2 PW를 어림한 교육용 곡선. 대기 = 전체 − 해양 */
  const OC = [[-90, 0], [-70, -0.1], [-50, -0.45], [-35, -0.9], [-20, -1.2], [-10, -0.8], [0, 0.3], [10, 1.6], [18, 2.0], [25, 1.8], [35, 1.2], [50, 0.5], [70, 0.1], [90, 0]];
  const total = (lat) => 5.8 / 0.3849 * Math.sin(lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) ** 2;
  /* 단조 3차 보간(PCHIP)으로 점들을 매끄럽게 잇는다 */
  const OD = OC.map((_, i) => {
    if (i === 0 || i === OC.length - 1) return 0;
    const d0 = (OC[i][1] - OC[i - 1][1]) / (OC[i][0] - OC[i - 1][0]), d1 = (OC[i + 1][1] - OC[i][1]) / (OC[i + 1][0] - OC[i][0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  });
  const ocean = (lat) => {
    let i = 0; while (i < OC.length - 2 && OC[i + 1][0] < lat) i++;
    const [a, va] = OC[i], [b, vb] = OC[i + 1], hh = b - a, s = clamp((lat - a) / hh, 0, 1);
    return (2 * s ** 3 - 3 * s * s + 1) * va + (s ** 3 - 2 * s * s + s) * hh * OD[i] + (-2 * s ** 3 + 3 * s * s) * vb + (s ** 3 - s * s) * hh * OD[i + 1];
  };

  let view = "world", plot = "heat", t = 0;
  const lay = { wind: true, ek: false, cur: true, heat: true };
  const map = fit($(".gy-map"), () => drawMap()), pl = fit($(".gy-plot"), () => drawPlot());

  /* 투영 */
  function proj(w, h) {
    if (view === "world") return { X: (lon) => (lon - 100) / 280 * w, Y: (lat) => (70 - lat) / 140 * h, lon: [100, 380] };
    const ky = h / 19, kx = ky * Math.cos(36 * Math.PI / 180), lc = 131;
    return { X: (lon) => w / 2 + (lon - lc) * kx, Y: (lat) => h / 2 - (lat - 35.6) * ky, lon: [lc - w / 2 / kx, lc + w / 2 / kx] };
  }
  function land(ctx, P, polys, shifts) {
    ctx.fillStyle = "#f4f1e8"; ctx.strokeStyle = "#c9c3b2"; ctx.lineWidth = 0.6;
    shifts.forEach((o) => polys.forEach((p) => { ctx.beginPath(); for (let i = 0; i < p.length; i += 2) { const x = P.X(p[i] + o), y = P.Y(p[i + 1]); (i && Math.abs(p[i] - p[i - 2]) < 180) ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.fill(); ctx.stroke(); }));
  }
  /* 점이 육지 안인지 (홀짝 규칙) */
  const LW = NMGyreLand.world;
  function onLand(lon, lat) {
    const L = lon > 180 ? lon - 360 : lon; let inside = false;
    for (const p of LW) for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
      if (Math.abs(xi - xj) > 180) continue;
      if ((yi > lat) !== (yj > lat) && L < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  const arrow = (ctx, x, y, dx, dy, col, len, lw) => {
    const m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m, x2 = x + ux * len, y2 = y + uy * len;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - ux * 5 - uy * 3, y2 - uy * 5 + ux * 3); ctx.lineTo(x2 - ux * 5 + uy * 3, y2 - uy * 5 - ux * 3); ctx.fill();
  };
  /* 바람대: 위도별 바람 방향 (지도 위 dx = 동쪽, dy = 북쪽) */
  const BANDS = [[62, -1, -0.3], [45, 1, 0.3], [15, -1, -0.35], [-15, -1, 0.35], [-45, 1, -0.3], [-62, -1, 0.3]];
  const PTS = [];
  BANDS.forEach(([lat, dx, dy]) => { for (let lon = 110; lon <= 370; lon += 20) if (!onLand(lon, lat) && !onLand(lon + 4, lat)) PTS.push({ lon, lat, dx, dy }); });

  function curves(ctx, P, list, lw) {
    list.forEach((c) => {
      const col = lay.heat ? (c.w ? WARM : COLD) : C.ink2;
      const pts = c.p.map(([lo, la]) => [P.X(lo), P.Y(la)]);
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round";
      ctx.setLineDash([9, 6]); ctx.lineDashOffset = -t * 18;
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
      const [x1, y1] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1];
      const ux = (x2 - x1) / Math.hypot(x2 - x1, y2 - y1), uy = (y2 - y1) / Math.hypot(x2 - x1, y2 - y1), s = lw * 2.6 + 3;
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2 + ux * 3, y2 + uy * 3); ctx.lineTo(x2 - ux * s - uy * s * 0.6, y2 - uy * s + ux * s * 0.6); ctx.lineTo(x2 - ux * s + uy * s * 0.6, y2 - uy * s - ux * s * 0.6); ctx.fill();
    });
  }
  function labels(ctx, P, list, size) {
    ctx.font = `600 ${size}px ${F.sans}`;
    list.forEach((c) => {
      if (!c.lab) return;
      const col = lay.heat ? (c.w ? WARM : COLD) : C.ink;
      const x = P.X(c.lab[0]), y = P.Y(c.lab[1]);
      ctx.textAlign = "left"; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(251,251,248,.9)"; ctx.strokeText(c.n, x, y); ctx.fillStyle = col; ctx.fillText(c.n, x, y);
      if (c.ll) { const tw = ctx.measureText(c.n).width; ctx.strokeStyle = col; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x + tw + 3, y - 4); ctx.lineTo(P.X(c.ll[0]), P.Y(c.ll[1])); ctx.stroke(); }
    });
  }

  function drawMap() {
    const { ctx } = map, { w, h } = map.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = proj(w, h);
    ctx.fillStyle = "#dfe7ef"; ctx.fillRect(0, 0, w, h);
    if (view === "world") {
      land(ctx, P, LW, [0, 360]);
      // 위도선
      ctx.strokeStyle = "rgba(93,93,97,.25)"; ctx.lineWidth = 0.8; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
      [-60, -30, 0, 30, 60].forEach((la) => { ctx.setLineDash(la ? [2, 4] : []); ctx.beginPath(); ctx.moveTo(0, P.Y(la)); ctx.lineTo(w, P.Y(la)); ctx.stroke(); ctx.setLineDash([]); ctx.fillText(la ? `${Math.abs(la)}°${la > 0 ? "N" : "S"}` : "0°", 3, P.Y(la) - 3); });
      if (lay.ek) {
        // 아열대 수렴: 해수면이 높은 곳 (서쪽으로 치우침)
        [[195, 30, 46], [297, 31, 22], [215, -30, 42], [335, -28, 18]].forEach(([lo, la, rw]) => {
          ctx.fillStyle = "rgba(122,79,168,.14)"; ctx.strokeStyle = "rgba(122,79,168,.6)"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(P.X(lo), P.Y(la), rw / 280 * w, 8 / 140 * h, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = "#7a4fa8"; ctx.font = `600 10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("해수면 높음", P.X(lo), P.Y(la) + 4);
        });
      }
      if (lay.wind) PTS.forEach((p) => arrow(ctx, P.X(p.lon) - p.dx * 9, P.Y(p.lat) + p.dy * 9, p.dx, -p.dy, "rgba(93,93,97,.75)", 18, 1.3));
      if (lay.ek) PTS.filter((p) => Math.abs(p.lat) < 55).forEach((p) => { const nh = p.lat > 0, ex = nh ? p.dy : -p.dy, ey = nh ? -p.dx : p.dx; arrow(ctx, P.X(p.lon), P.Y(p.lat), ex, -ey, "#7a4fa8", 13, 2); });
      if (lay.cur) { curves(ctx, P, WORLD, 2.4); labels(ctx, P, WORLD, 10.5); }
      // 바람대 이름
      if (lay.wind) {
        ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "left"; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(251,251,248,.85)"; ctx.fillStyle = C.ink2;
        [[15, "무역풍"], [45, "편서풍"], [-15, "무역풍"], [-45, "편서풍"]].forEach(([la, s]) => { ctx.strokeText(s, 4, P.Y(la) + 4); ctx.fillText(s, 4, P.Y(la) + 4); });
      }
      // 고른 위도
      const la = +$(".lat").value;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(0, P.Y(la)); ctx.lineTo(w, P.Y(la)); ctx.stroke(); ctx.setLineDash([]);
    } else {
      land(ctx, P, NMGyreLand.korea, [0]);
      ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = "rgba(58,98,176,.55)"; ctx.textAlign = "center";
      [[134.8, 42.1, "동해"], [122.5, 34.4, "황해"], [125.5, 30.2, "동중국해"], [147, 28.6, "북태평양"]].forEach(([lo, la, s]) => ctx.fillText(s, P.X(lo), P.Y(la)));
      if (lay.cur) {
        // 조경 수역: 동한 난류와 북한 한류가 만나는 곳 (위치는 계절·해마다 달라짐)
        ctx.strokeStyle = "rgba(122,79,168,.7)"; ctx.lineWidth = 1.4; ctx.setLineDash([2, 4]);
        ctx.beginPath(); [[129.5, 38.3], [131.5, 39], [134, 39.6], [137, 40.2], [139.6, 40.6]].forEach(([lo, la], i) => (i ? ctx.lineTo(P.X(lo), P.Y(la)) : ctx.moveTo(P.X(lo), P.Y(la)))); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#7a4fa8"; ctx.font = `600 10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("조경 수역", P.X(132.2), P.Y(40.2));
        curves(ctx, P, KOREA, 3); labels(ctx, P, KOREA, 11.5);
      }
    }
    // 범례
    if (lay.cur && lay.heat) {
      ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
      const lx = 8, ly = h - 30;
      ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(lx - 4, ly - 12, 74, 34);
      [[WARM, "난류"], [COLD, "한류"]].forEach(([c, s], i) => { ctx.strokeStyle = c; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(lx, ly - 4 + i * 15); ctx.lineTo(lx + 22, ly - 4 + i * 15); ctx.stroke(); ctx.fillStyle = C.ink2; ctx.fillText(s, lx + 28, ly + i * 15); });
    }
  }

  /* 스토멜(1948) 상자 바다: 남쪽 무역풍·북쪽 편서풍, 바닥 마찰, 전향력이 북쪽으로 커지는 정도(β)를 바꾼다 */
  function stommel(bs) {
    const al = bs * 40, k = Math.PI, r = Math.sqrt(al * al / 4 + k * k), A = -al / 2 + r, B = -al / 2 - r;
    const p = (1 - Math.exp(B)) / (Math.exp(A) - Math.exp(B)), q = 1 - p;
    return (x, y) => Math.sin(Math.PI * y) * (p * Math.exp(A * x) + q * Math.exp(B * x) - 1);
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const la = +$(".lat").value, bs = +$(".beta").value / 100;
    $(".lat-out").textContent = la === 0 ? "0°" : `${Math.abs(la)}°${la > 0 ? "N" : "S"}`; $(".beta-out").textContent = Math.round(bs * 100);
    $(".n-oc").textContent = `${ocean(la).toFixed(1)} PW`; $(".n-at").textContent = `${(total(la) - ocean(la)).toFixed(1)} PW`;
    const tt = total(la); $(".n-ra").textContent = Math.abs(tt) < 0.3 ? "—" : `${Math.round(clamp(ocean(la) / tt, -9, 9) * 100)}%`;
    const f = stommel(bs);
    // 서쪽·동쪽 경계 최대 유속 비 (가운데 위도에서 v = ∂ψ/∂x)
    let vw = 0, ve = 0; for (let i = 0; i < 400; i++) { const x = (i + 0.5) / 400, v = Math.abs((f(x + 1e-4, 0.5) - f(x - 1e-4, 0.5)) / 2e-4); if (x < 0.5) vw = Math.max(vw, v); else ve = Math.max(ve, v); }
    $(".n-wb").textContent = `${(vw / ve).toFixed(1)} : 1`;
    if (plot === "heat") {
      const box = { x0: 40, y0: 22, w: w - 54, h: h - 54 };
      const X = (l) => box.x0 + (l + 90) / 180 * box.w, Y = (v) => box.y0 + box.h / 2 - v / 6.5 * box.h / 2;
      axes(ctx, { ...box, X, Y, xt: [-90, -60, -30, 0, 30, 60, 90].map((l) => [l, l ? `${Math.abs(l)}°${l > 0 ? "N" : "S"}` : "0°"]), yt: [-6, -4, -2, 0, 2, 4, 6].map((v) => [v, String(v)]), xlabel: "위도", ylabel: "북쪽으로 옮기는 열 (PW = 10¹⁵ W)" });
      const ln = (fn, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath(); for (let l = -90; l <= 90; l += 1) { const x = X(l), y = Y(fn(l)); l > -90 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]); };
      ln(total, C.ink, 2, []); ln((l) => total(l) - ocean(l), C.amber, 2, [5, 3]); ln(ocean, COLD, 2.4, []);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(la), box.y0); ctx.lineTo(X(la), box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
      [[total, C.ink], [ocean, COLD], [(l) => total(l) - ocean(l), C.amber]].forEach(([fn, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(la), Y(fn(la)), 3.5, 0, Math.PI * 2); ctx.fill(); });
      ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
      [[C.ink, "전체", []], [C.amber, "대기", [5, 3]], [COLD, "해양", []]].forEach(([c, s, d], i) => { const x = box.x0 + 8, y = box.y0 + 12 + i * 15; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.setLineDash(d); ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + 20, y - 4); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.ink2; ctx.fillText(s, x + 26, y); });
      ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("대략값 · 연평균", box.x0 + box.w - 4, box.y0 + box.h - 6);
    } else {
      const box = { x0: 70, y0: 30, w: w - 140, h: h - 66 };
      const N = 64, M = 40; let mx = 0; const g = [];
      for (let j = 0; j <= M; j++) { g.push([]); for (let i = 0; i <= N; i++) { const v = f(i / N, j / M); g[j].push(v); mx = Math.max(mx, Math.abs(v)); } }
      const cw = box.w / N, ch = box.h / M;
      for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) {
        const v = Math.abs((g[j][i] + g[j + 1][i + 1]) / 2) / mx, lev = Math.floor(v * 7) / 7;
        ctx.fillStyle = `rgba(58,98,176,${0.06 + lev * 0.42})`; ctx.fillRect(box.x0 + i * cw, box.y0 + box.h - (j + 1) * ch, cw + 0.5, ch + 0.5);
      }
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.strokeRect(box.x0, box.y0, box.w, box.h);
      // 유속 화살표 (시계 방향: 서쪽 경계에서 북쪽으로)
      const sgn = f(0.02, 0.5) - f(0, 0.5) > 0 ? 1 : -1;
      for (let j = 1; j < 8; j++) for (let i = 0; i < 12; i++) {
        const x = (i + 0.5) / 12, y = j / 8, e = 1e-3;
        const u = -sgn * (f(x, y + e) - f(x, y - e)) / (2 * e), v = sgn * (f(x + e, y) - f(x - e, y)) / (2 * e), sp = Math.hypot(u, v);
        if (sp < 1e-6) continue;
        const L = clamp(sp / mx * 3.2, 0.25, 2.6) * 7;
        arrow(ctx, box.x0 + x * box.w - u / sp * L / 2, box.y0 + box.h - y * box.h + v / sp * L / 2, u, -v, C.ink, L, 1.1);
      }
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
      ctx.fillText("편서풍 →", box.x0 + box.w / 2, box.y0 - 8); ctx.fillText("← 무역풍", box.x0 + box.w / 2, box.y0 + box.h + 15);
      ctx.save(); ctx.translate(box.x0 - 14, box.y0 + box.h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("서쪽 (대륙 동쪽 해안)", 0, 0); ctx.restore();
      ctx.save(); ctx.translate(box.x0 + box.w + 18, box.y0 + box.h / 2); ctx.rotate(Math.PI / 2); ctx.fillText("동쪽 (대륙 서쪽 해안)", 0, 0); ctx.restore();
      ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("북반구 상자 바다 · 색이 진할수록 유선 함수가 큼", box.x0, h - 4);
    }
  }

  const redraw = () => { drawMap(); drawPlot(); };
  $(".layers").addEventListener("click", (e) => { const b = e.target.closest("[data-l]"); if (!b) return; lay[b.dataset.l] = !lay[b.dataset.l]; b.setAttribute("aria-pressed", String(lay[b.dataset.l])); drawMap(); });
  $(".views").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (!b) return; view = b.dataset.v; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawMap(); });
  $(".plots").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; plot = b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot(); });
  root.querySelectorAll(".lat, .beta").forEach((el) => el.addEventListener("input", redraw));
  const sync = () => root.querySelectorAll("[data-l]").forEach((b) => b.setAttribute("aria-pressed", String(lay[b.dataset.l])));
  if (!reduce) loop($(".gy-map"), (dt) => { if (!lay.cur) return; t += dt; drawMap(); });
  sync(); redraw();
  if (/[?&]demo\b/.test(location.search)) {
    lay.ek = true; sync(); $(".lat").value = 20; redraw();
    if (/[?&]korea\b/.test(location.search)) root.querySelector('[data-v="korea"]').click();
    if (/[?&]box\b/.test(location.search)) root.querySelector('[data-p="box"]').click();
  }
})();
