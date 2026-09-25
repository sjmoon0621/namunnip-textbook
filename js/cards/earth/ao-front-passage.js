/* 카드: 온대 저기압이 지나가면 날씨는 어떤 순서로 바뀔까? — 모식 일기도, 관측 기록, 연직 단면 */
(() => {
  const root = document.getElementById("card-earth-front");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cvMap = $(".cv-map"), cvLog = $(".cv-meteo");
  const sT = $(".t"), oT = $(".t-out"), btn = $(".play");
  const nT = $(".n-t"), nP = $(".n-p"), nD = $(".n-d"), nW = $(".n-w");

  const V = 40;               // 저기압 이동 속력 (km/h), 서→동
  const TMIN = -30, TMAX = 24;
  let ys = -300, view = "log", playing = false;

  // ── 모식 저기압 (좌표: 저기압 중심 기준 km, x 동쪽, y 북쪽) ──
  const sg = (s) => 1 / (1 + Math.exp(-s));
  const yw = (x) => -0.3 * x - 0.00025 * x * x;            // 온난 전선 (x ≥ 0)
  const xc = (y) => 0.3 * y - 0.0003 * y * y;              // 한랭 전선 (y ≤ 0)
  const dW = (x, y) => y - yw(Math.max(0, x));              // + 이면 온난 전선 앞(찬 공기 쪽)
  const dC = (x, y) => x - xc(Math.min(0, y));              // + 이면 한랭 전선 앞(동쪽)
  const TA = 11, TW = 18, TC = 5;
  function temp(x, y) {
    const warm = sg(dC(x, y) / 15) * sg(-dW(x, y) / 15);
    const wid = 15 + Math.max(0, y) * 0.8;
    const cold = sg(-dC(x, y) / wid);
    const tn = TA + (TC - TA) * cold;
    return tn + (TW - tn) * warm;
  }
  function pres(x, y) {
    const r2 = x * x + y * y, dc = dC(x, y), dw = dW(x, y);
    const fc = y < 0 ? Math.exp(-((y / 900) ** 2)) : Math.exp(-((y / 150) ** 2));
    const fw = x > 0 ? Math.exp(-((x / 800) ** 2)) : Math.exp(-((x / 150) ** 2));
    return 1018 - 16 * Math.exp(-r2 / (2 * 500 * 500)) - 2.5 * Math.exp(-((dc / 80) ** 2)) * fc - 1.5 * Math.exp(-((dw / 80) ** 2)) * fw + 4 * sg(-(x + 400) / 250);
  }
  const FCOR = 2 * 7.292e-5 * Math.sin(37 * Math.PI / 180);
  function wind(x, y) {
    const e = 3, gx = (pres(x + e, y) - pres(x - e, y)) / (2 * e), gy = (pres(x, y + e) - pres(x, y - e)) / (2 * e);
    let ux = -gy, uy = gx; const n = Math.hypot(ux, uy) || 1; ux /= n; uy /= n;
    const a = 30 * Math.PI / 180, rx = ux * Math.cos(a) - uy * Math.sin(a), ry = ux * Math.sin(a) + uy * Math.cos(a);
    return { ux: rx, uy: ry, V: 0.7 * Math.hypot(gx, gy) * 100 / (1.2 * FCOR) };
  }
  function weather(x, y) {
    const dw = dW(x, y), dc = dC(x, y);
    const rainW = x > -150 && x < 1100 && dw > 0 && dw < 350 ? 1 - dw / 350 : 0;
    const cloudW = x > -200 && x < 1200 && dw > 0 && dw < 650 ? 1 - dw / 650 : 0;
    const shower = y < 0 && dc < 10 && dc > -80 ? 1 : 0;
    const warm = sg(dc / 15) * sg(-dw / 15);
    const cold = sg(-dc / (15 + Math.max(0, y) * 0.8));
    let txt = "맑음";
    if (shower) txt = "소나기·뇌우";
    else if (rainW > 0.15) txt = "비 (계속)";
    else if (cloudW > 0) txt = "구름 많아짐";
    else if (warm > .5) txt = "구름 조금, 포근";
    else if (cold > .5) txt = "맑음, 쌀쌀";
    return { rainW, cloudW, shower, txt };
  }
  const DIRS = ["북", "북북동", "북동", "동북동", "동", "동남동", "남동", "남남동", "남", "남남서", "남서", "서남서", "서", "서북서", "북서", "북북서"];
  const fromDir = (ux, uy) => DIRS[Math.round(((Math.atan2(-ux, -uy) * 180 / Math.PI + 360) % 360) / 22.5) % 16] + "풍";
  const stn = (t) => [-V * t, ys];       // 관측소의 저기압 기준 위치

  // 전선 통과 시각
  function passages() {
    const out = [];
    let pw = null, pc = null;
    for (let t = TMIN; t <= TMAX; t += 0.1) {
      const [x, y] = stn(t);
      const w = x > 0 ? Math.sign(dW(x, y)) : null, c = y < 0 ? Math.sign(dC(x, y)) : null;
      if (pw !== null && w !== null && w !== pw) out.push(["온난 전선", t]);
      if (pc !== null && c !== null && c !== pc) out.push(["한랭 전선", t]);
      pw = w; pc = c;
    }
    return out;
  }

  function arrow(ctx, x1, y1, x2, y2, col, lw) {
    const a = Math.atan2(y2 - y1, x2 - x1), hl = 4 + lw * 1.4;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - .5), y2 - hl * Math.sin(a - .5)); ctx.lineTo(x2 - hl * Math.cos(a + .5), y2 - hl * Math.sin(a + .5)); ctx.closePath(); ctx.fill();
  }

  // 마칭 스퀘어
  function contour(grid, nx, ny, lev) {
    const segs = [], it = (a, b) => (lev - a) / (b - a);
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], d = grid[j + 1][i];
      const idx = (a > lev) | ((b > lev) << 1) | ((c > lev) << 2) | ((d > lev) << 3);
      if (idx === 0 || idx === 15) continue;
      const T = [i + it(a, b), j], R = [i + 1, j + it(b, c)], B = [i + it(d, c), j + 1], L = [i, j + it(a, d)];
      const m = { 1: [[L, T]], 2: [[T, R]], 3: [[L, R]], 4: [[R, B]], 5: [[L, T], [R, B]], 6: [[T, B]], 7: [[L, B]], 8: [[B, L]], 9: [[B, T]], 10: [[T, R], [B, L]], 11: [[B, R]], 12: [[R, L]], 13: [[R, T]], 14: [[T, L]] };
      m[idx].forEach((s) => segs.push(s));
    }
    return segs;
  }

  // ── 지도 ──
  const M = fit(cvMap, () => drawMap());
  function drawMap() {
    const { ctx, size: { w, h } } = M; if (!w) return;
    const t = +sT.value, lx = V * t;         // 저기압 중심의 지도 좌표 (관측소 경도 = 0)
    const S = w / 3000, YC = -250;
    const px = (X) => w / 2 + X * S, py = (Y) => h / 2 - (Y - YC) * S;
    const km = (i, j) => [(i - w / 2) / S, YC - (j - h / 2) / S];
    ctx.clearRect(0, 0, w, h);
    const step = w < 480 ? 8 : 10, nx = Math.ceil(w / step) + 1, ny = Math.ceil(h / step) + 1;
    const grid = [];
    for (let j = 0; j < ny; j++) {
      const row = [];
      for (let i = 0; i < nx; i++) {
        const [X, Y] = km(i * step, j * step), x = X - lx, y = Y;
        const T = temp(x, y), wx = weather(x, y);
        const k = (T - TC) / (TW - TC);
        ctx.fillStyle = `rgb(${Math.round(226 + 20 * k)},${Math.round(236 - 4 * k)},${Math.round(244 - 34 * k)})`;
        ctx.fillRect(i * step - step / 2, j * step - step / 2, step + 1, step + 1);
        if (wx.cloudW > 0) { ctx.fillStyle = `rgba(140,140,146,${0.25 * wx.cloudW})`; ctx.fillRect(i * step - step / 2, j * step - step / 2, step + 1, step + 1); }
        if (wx.rainW > 0.1) { ctx.fillStyle = `rgba(59,124,42,${0.35 * wx.rainW})`; ctx.fillRect(i * step - step / 2, j * step - step / 2, step + 1, step + 1); }
        if (wx.shower) { ctx.fillStyle = "rgba(59,124,42,.55)"; ctx.fillRect(i * step - step / 2, j * step - step / 2, step + 1, step + 1); }
        row.push(pres(x, y));
      }
      grid.push(row);
    }
    // 등압선
    ctx.strokeStyle = "rgba(35,35,38,.45)"; ctx.lineWidth = 1;
    for (let lev = 992; lev <= 1024; lev += 4) {
      ctx.beginPath();
      contour(grid, nx, ny, lev).forEach(([a, b]) => { ctx.moveTo(a[0] * step, a[1] * step); ctx.lineTo(b[0] * step, b[1] * step); });
      ctx.stroke();
    }
    // 전선 기호
    const front = (pts, col, kind) => {
      const P = pts.map(([x, y]) => [px(x + lx), py(y)]);
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
      let acc = 0, next = 14; ctx.fillStyle = col;
      for (let i = 1; i < P.length; i++) {
        const [ax, ay] = P[i - 1], [bx, by] = P[i], d = Math.hypot(bx - ax, by - ay);
        while (acc + d >= next) {
          const k = (next - acc) / d, cx = ax + (bx - ax) * k, cy = ay + (by - ay) * k;
          const tx = (bx - ax) / d, ty = (by - ay) / d, nxv = ty, nyv = -tx; // 화면 좌표에서 진행 방향의 왼쪽
          ctx.beginPath();
          if (kind === "warm") ctx.arc(cx, cy, 5, Math.atan2(nyv, nxv) - Math.PI / 2, Math.atan2(nyv, nxv) + Math.PI / 2);
          else { ctx.moveTo(cx - tx * 5, cy - ty * 5); ctx.lineTo(cx + nxv * 7, cy + nyv * 7); ctx.lineTo(cx + tx * 5, cy + ty * 5); }
          ctx.closePath(); ctx.fill();
          next += 28;
        }
        acc += d;
      }
    };
    const WP = [], CP = [];
    for (let x = 0; x <= 900; x += 20) WP.push([x, yw(x)]);
    for (let y = 0; y >= -1100; y -= 20) CP.push([xc(y), y]);
    front(WP, "#c0392b", "warm"); front(CP, "#2e5d9a", "cold");
    // 저기압 중심
    ctx.font = `800 ${w < 480 ? 18 : 22}px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "center";
    ctx.fillText("L", px(lx), py(0) + 8);
    arrow(ctx, px(lx) + 14, py(0) - 16, px(lx) + 44, py(0) - 16, C.warn, 1.5);
    // 관측소
    const sx = px(0), sy = py(ys);
    ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    const wd = wind(-lx, ys);
    arrow(ctx, sx, sy, sx + wd.ux * 26, sy - wd.uy * 26, C.ink, 2);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText("관측소", sx + 9, sy + 16);
    // 범례·축척
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(8, h - 8); ctx.lineTo(8 + 500 * S, h - 8); ctx.stroke();
    ctx.fillText("500 km", 10, h - 12);
    ctx.textAlign = "right"; ctx.fillText("모식 일기도 · 등압선 4 hPa", w - 6, h - 8);
    ctx.fillText("초록: 비", w - 6, 13);
  }

  // ── 관측 기록 / 연직 단면 ──
  const Lg = fit(cvLog, () => drawLog());
  function drawLog() {
    const { ctx, size: { w, h } } = Lg; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (view === "sec") return drawSec(ctx, w, h);
    const t = +sT.value, small = w < 480;
    const x0 = small ? 34 : 44, gw = w - x0 - 10, X = (tt) => x0 + (tt - TMIN) / (TMAX - TMIN) * gw;
    const bands = [[8, .34], [.34, .66], [.66, 1]].map(([a, b]) => [a < 1 ? 14 + a * (h - 38) : 14, 14 + b * (h - 38)]);
    bands[0][0] = 14;
    const samples = []; for (let tt = TMIN; tt <= TMAX + 1e-6; tt += .5) { const [x, y] = stn(tt); samples.push({ tt, T: temp(x, y), p: pres(x, y), wd: wind(x, y), wx: weather(x, y) }); }
    const series = (key, [y0, y1], col, fmt) => {
      const vals = samples.map((s) => s[key]); let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * .15 + .5; lo -= pad; hi += pad;
      const Y = (v) => y1 - (v - lo) / (hi - lo) * (y1 - y0 - 6) - 3;
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); samples.forEach((s, i) => (i ? ctx.lineTo(X(s.tt), Y(s[key])) : ctx.moveTo(X(s.tt), Y(s[key])))); ctx.stroke();
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
      ctx.fillText(fmt(hi - pad), x0 - 4, Y(hi - pad) + 3); ctx.fillText(fmt(lo + pad), x0 - 4, Y(lo + pad) + 3);
    };
    // 배경 띠
    bands.forEach(([a, b], i) => { ctx.fillStyle = i % 2 ? "rgba(35,35,38,.03)" : "transparent"; ctx.fillRect(x0, a, gw, b - a); ctx.strokeStyle = C.rule; ctx.strokeRect(x0 + .5, a + .5, gw - 1, b - a); });
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("기온 (°C)", x0 + 4, bands[0][0] + 12); ctx.fillText("기압 (hPa)", x0 + 4, bands[1][0] + 12); ctx.fillText("바람 · 강수", x0 + 4, bands[2][0] + 12);
    // 강수 막대
    samples.forEach((s) => {
      const r = s.wx.shower ? 1 : s.wx.rainW;
      if (r > 0.1) { const hh = (bands[2][1] - bands[2][0] - 16) * r; ctx.fillStyle = s.wx.shower ? "rgba(59,124,42,.8)" : "rgba(59,124,42,.45)"; ctx.fillRect(X(s.tt) - gw / 110, bands[2][1] - hh, gw / 55, hh); }
    });
    series("T", bands[0], C.warn, (v) => v.toFixed(0));
    series("p", bands[1], C.ink, (v) => v.toFixed(0));
    // 풍향 화살표 (3시간마다, 바람이 불어 가는 방향)
    samples.filter((s) => Math.abs(s.tt % 3) < 1e-6).forEach((s) => {
      const cx = X(s.tt), cy = (bands[2][0] + bands[2][1]) / 2 + 4, L = small ? 7 : 9;
      arrow(ctx, cx - s.wd.ux * L, cy + s.wd.uy * L, cx + s.wd.ux * L, cy - s.wd.uy * L, C.ink2, 1.2);
    });
    // 전선 통과
    ctx.font = `10px ${F.sans}`;
    passages().forEach(([name, tt]) => {
      ctx.strokeStyle = name === "온난 전선" ? "#c0392b" : "#2e5d9a"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(tt), 14); ctx.lineTo(X(tt), h - 24); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = ctx.strokeStyle; ctx.textAlign = "center"; ctx.fillText(name, X(tt), 10);
    });
    // 시간 축
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let tt = -24; tt <= 24; tt += 12) ctx.fillText(`${tt > 0 ? "+" : ""}${tt}h`, X(tt), h - 10);
    // 지금
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(t), 14); ctx.lineTo(X(t), h - 24); ctx.stroke();
  }

  function drawSec(ctx, w, h) {
    const t = +sT.value, small = w < 480;
    const top = 22, bot = h - 26, XL = -1000, XR = 1300, ZM = 10;
    const X = (x) => 8 + (x - XL) / (XR - XL) * (w - 16), Z = (z) => bot - z / ZM * (bot - top);
    ctx.font = `11px ${F.sans}`;
    if (ys > 0) {
      ctx.fillStyle = "rgba(111,160,184,.18)"; ctx.fillRect(8, top, w - 16, bot - top);
      ctx.fillStyle = C.ink2; ctx.textAlign = "center";
      ctx.fillText("관측소가 저기압 중심의 북쪽을 지나면", w / 2, h / 2 - 8);
      ctx.fillText("지표에서 두 전선을 만나지 않습니다. 계속 찬 공기 쪽입니다.", w / 2, h / 2 + 10);
      return;
    }
    let xw0 = 0; for (let x = 0; x < 2000; x += 2) if (yw(x) <= ys) { xw0 = x; break; }
    const xc0 = xc(ys);
    const wz = (x) => (x - xw0) / 150, cz = (x) => (xc0 - x) / 60;
    // 따뜻한 공기(전체 배경) 위에 찬 공기 쐐기
    ctx.fillStyle = "rgba(224,160,42,.16)"; ctx.fillRect(8, top, w - 16, bot - top);
    ctx.fillStyle = "rgba(63,111,163,.20)";
    ctx.beginPath(); ctx.moveTo(X(xw0), bot); for (let x = xw0; x <= XR; x += 20) ctx.lineTo(X(x), Z(Math.min(ZM, wz(x)))); ctx.lineTo(X(XR), bot); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(X(xc0), bot); for (let x = xc0; x >= XL; x -= 20) ctx.lineTo(X(x), Z(Math.min(ZM, cz(x)))); ctx.lineTo(X(XL), bot); ctx.closePath(); ctx.fill();
    // 전선면
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#c0392b"; ctx.beginPath(); ctx.moveTo(X(xw0), bot); ctx.lineTo(X(XR), Z(Math.min(ZM, wz(XR)))); ctx.stroke();
    ctx.strokeStyle = "#2e5d9a"; ctx.beginPath(); ctx.moveTo(X(xc0), bot); ctx.lineTo(X(xc0 - ZM * 60), top); ctx.stroke();
    // 구름: 온난 전선면 위 층운형
    const layer = (x0, x1, z0, z1, name, col) => {
      ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(X(x0), Z(z0)); ctx.lineTo(X(x1), Z(z1)); ctx.lineTo(X(x1), Z(z1 + .8)); ctx.lineTo(X(x0), Z(z0 + (name === "난층운" ? 2.2 : .8))); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`;
      ctx.fillText(name, X((x0 + x1) / 2), Z((z0 + z1) / 2 + (name === "난층운" ? 1.8 : 1.3)));
    };
    layer(xw0 + 20, xw0 + 330, wz(xw0 + 20) + .1, wz(xw0 + 330) + .1, "난층운", "rgba(120,120,126,.55)");
    layer(xw0 + 340, xw0 + 700, wz(xw0 + 340) + .1, wz(xw0 + 700) + .1, "고층운", "rgba(150,150,156,.4)");
    if (xw0 + 1100 < XR + 200) layer(xw0 + 710, Math.min(XR, xw0 + 1150), wz(xw0 + 710) + .1, Math.min(9, wz(Math.min(XR, xw0 + 1150)) + .1), "권층운·권운", "rgba(180,180,186,.35)");
    // 한랭 전선의 적란운
    const cb0 = xc0 - 20, cb1 = xc0 + 110;
    ctx.fillStyle = "rgba(110,110,116,.6)"; ctx.beginPath();
    ctx.moveTo(X(cb0), Z(.8)); ctx.lineTo(X(cb0 - 40), Z(9)); ctx.lineTo(X(cb1 + 90), Z(9.4)); ctx.lineTo(X(cb1 + 20), Z(8.4)); ctx.lineTo(X(cb1), Z(.8)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`; ctx.fillText("적란운", X((cb0 + cb1) / 2), Z(5));
    // 비
    ctx.strokeStyle = "rgba(59,124,42,.7)"; ctx.lineWidth = 1;
    const rain = (a, b) => { for (let x = a; x < b; x += 30) { ctx.beginPath(); ctx.moveTo(X(x), Z(.7)); ctx.lineTo(X(x) - 2, bot - 2); ctx.stroke(); } };
    rain(xw0 + 20, xw0 + 330); rain(cb0, cb1);
    // 바닥, 라벨
    ctx.fillStyle = "#b9c4a8"; ctx.fillRect(8, bot, w - 16, 4);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = "#2e5d9a"; ctx.textAlign = "left";
    ctx.fillText("찬 공기", X(XL) + 6, bot - 8); ctx.textAlign = "right"; ctx.fillText("찬 공기", X(XR) - 6, bot - 8);
    ctx.fillStyle = "#a8781c"; ctx.textAlign = "center"; ctx.fillText("따뜻한 공기", X((xc0 + xw0) / 2), Z(1.2));
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("서", 10, top - 8);
    ctx.textAlign = "right"; ctx.fillText("동 · 높이 10 km까지, 크게 과장", w - 10, top - 8);
    arrow(ctx, w / 2 - 30, top - 11, w / 2 + 30, top - 11, C.warn, 1.5);
    // 관측소
    const sx = X(-V * t);
    if (sx > 8 && sx < w - 8) {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(sx, bot - 2); ctx.lineTo(sx - 6, bot + 10); ctx.lineTo(sx + 6, bot + 10); ctx.closePath(); ctx.fill();
      ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("관측소", sx, bot + 21);
    }
  }

  function update() {
    const t = +sT.value, [x, y] = stn(t);
    oT.textContent = `${t > 0 ? "+" : t < 0 ? "−" : ""}${Math.abs(t)}`;
    nT.textContent = `${temp(x, y).toFixed(1)} °C`;
    nP.textContent = `${pres(x, y).toFixed(0)} hPa`;
    const wd = wind(x, y); nD.textContent = fromDir(wd.ux, wd.uy);
    nW.textContent = weather(x, y).txt;
    drawMap(); drawLog();
  }
  sT.addEventListener("input", update);
  root.querySelectorAll(".st").forEach((b) => b.addEventListener("click", () => {
    ys = +b.dataset.y; root.querySelectorAll(".st").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update();
  }));
  root.querySelectorAll(".view").forEach((b) => b.addEventListener("click", () => {
    view = b.dataset.v; root.querySelectorAll(".view").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); drawLog();
  }));
  btn.addEventListener("click", () => {
    playing = !playing; btn.textContent = playing ? "멈춤" : "재생";
    if (playing && +sT.value >= TMAX) sT.value = TMIN;
  });
  NM.loop(cvMap, (dt) => {
    if (!playing) return;
    let t = +sT.value + dt * 5;
    if (t >= TMAX) { t = TMAX; playing = false; btn.textContent = "재생"; }
    sT.value = (Math.round(t * 2) / 2).toString();
    if (Math.abs(+sT.value - t) < 1) update();
    sT.dataset.acc = t;
  });
  update();
})();
