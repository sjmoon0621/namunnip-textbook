/* 카드: 일기도, 위성 영상, 레이더를 함께 보면 내일 날씨를 맞힐 수 있을까? — 가상의 온대 저기압·이동성 고기압 사례(모식), 세 자료 겹쳐 보기, 서울 날씨 예측 후 확인 */
(() => {
  const root = document.getElementById("card-earth-forecast");
  if (!root || !window.NMEastAsia) return;
  const { C, F, fit, axes, clamp } = NM;
  const $ = (s) => root.querySelector(s);

  /* ---- 모형 (가상 사례) : 좌표는 서울(127°E, 37.5°N) 기준 km, t는 1일째 09시부터 지난 시간(h) ---- */
  const LON0 = 127, LAT0 = 37.5, KX = 111 * Math.cos(LAT0 * Math.PI / 180), KY = 111;
  const toKm = (lon, lat) => [(lon - LON0) * KX, (lat - LAT0) * KY];
  const gauss = (dx, dy, s) => Math.exp(-(dx * dx + dy * dy) / (2 * s * s));
  const sig = (z) => 1 / (1 + Math.exp(-z));
  const lowAt = (t) => [-1300 + 33 * t, -350 + 13 * t];
  const WF = [[0, 0], [260, -90], [520, -230], [740, -390]];
  const CF = [[0, 0], [-120, -300], [-330, -640], [-600, -960]];
  function front(t, shape) {
    const [lx, ly] = lowAt(t), g = 0.75 + 0.25 * clamp(t / 48, 0, 1);
    return shape.map(([x, y]) => [lx + x * g, ly + y * g]);
  }
  /* 꺾은선까지의 부호 있는 거리(왼쪽 +)와 앞 끝을 넘은 거리 */
  function sdist(px, py, pl) {
    let best = 1e9, sgn = 1, over = 0;
    for (let i = 0; i < pl.length - 1; i++) {
      const [ax, ay] = pl[i], [bx, by] = pl[i + 1], vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy;
      const u = ((px - ax) * vx + (py - ay) * vy) / L2, uc = clamp(u, 0, 1);
      const qx = ax + uc * vx - px, qy = ay + uc * vy - py, d = Math.hypot(qx, qy);
      if (d < best) { best = d; sgn = (vx * (py - ay) - vy * (px - ax)) >= 0 ? 1 : -1; over = (i === pl.length - 2 && u > 1) ? (u - 1) * Math.sqrt(L2) : 0; }
    }
    return { d: sgn * best, over };
  }
  function state(t) {
    const L = lowAt(t), wf = front(t, WF), cf = front(t, CF);
    const H0 = [500 + 30 * t, -260], H1 = [-2000 + 35 * t, 320 - 6 * t];
    return { t, L, wf, cf, H0, H1, aL: 10 + 0.12 * t, aH0: 9 - 0.05 * t, aH1: 7 + 0.09 * t };
  }
  function fields(S, x, y) {
    const w = sdist(x, y, S.wf), c = sdist(x, y, S.cf);
    const dW = w.d, dC = -c.d;
    const fadeW = Math.exp(-w.over / 250), fadeC = Math.exp(-c.over / 300);
    let p = 1012 - S.aL * gauss(x - S.L[0], y - S.L[1], 560) + S.aH0 * gauss(x - S.H0[0], y - S.H0[1], 800) + S.aH1 * gauss(x - S.H1[0], y - S.H1[1], 750);
    p -= 2.5 * gauss(dW, 0, 110) * fadeW + 3 * gauss(dC, 0, 110) * fadeC;
    const rL = Math.hypot(x - S.L[0], y - S.L[1]);
    const ahead = dW > 0 && dC < 0 ? 1 : 0;
    const warmSec = sig(-dW / 40) * sig(-dC / 40) * (y < S.L[1] + 100 ? 1 : 0.3);
    /* 구름(적외 밝기 0~1) */
    let cl = ahead * clamp(1 - dW / 650, 0, 1) * (0.35 + 0.65 * clamp(1 - dW / 300, 0, 1)) * fadeW;
    cl = Math.max(cl, 0.95 * gauss(dC + 20, 0, 90) * fadeC);
    cl = Math.max(cl, 0.85 * gauss(rL, 0, 380) * (y > S.L[1] - 150 ? 1 : 0.4));
    cl = Math.max(cl, 0.35 * warmSec * gauss(rL, 0, 650));
    /* 강수 (mm/h) */
    let r = 0;
    if (dW > -20 && dW < 320) r = Math.max(r, 3.2 * Math.exp(-Math.max(dW, 0) / 130) * fadeW * (dC < 0 ? 1 : 0));
    r = Math.max(r, 16 * gauss(dC - 25, 0, 45) * fadeC);
    r = Math.max(r, 2.5 * gauss(rL, 0, 260) * (y > S.L[1] - 80 ? 1 : 0.3));
    r = Math.max(r, 0.4 * warmSec * gauss(rL, 0, 650));
    const cold = sig((dC - 40) / 60) * fadeC;
    return { p, cl, r, warm: warmSec, cold, dW, dC };
  }
  const BASE = 8.5;
  function seoul(t) {
    const S = state(t), f = fields(S, 0, 0), e = 25;
    const gx = (fields(S, e, 0).p - fields(S, -e, 0).p) / (2 * e), gy = (fields(S, 0, e).p - fields(S, 0, -e).p) / (2 * e);
    let u = -gy, v = gx;
    const a = 30 * Math.PI / 180, ur = u * Math.cos(a) - v * Math.sin(a), vr = u * Math.sin(a) + v * Math.cos(a);
    const G = Math.hypot(gx, gy) * 100;
    const spd = G * 9.4 * 0.6;
    const dir = (Math.atan2(-ur, -vr) * 180 / Math.PI + 360) % 360;
    const h = (9 + t) % 24;
    let coldAge = 0;
    for (let k = 0; k <= t; k += 3) if (fields(state(k), 0, 0).cold > 0.5) coldAge += 3;
    const Tair = BASE + 6.5 * f.warm - (2.5 + 0.12 * Math.min(coldAge, 30)) * f.cold;
    const A = 6 * (1 - 0.75 * f.cl);
    return { p: f.p, T: Tair + A * Math.cos(2 * Math.PI * (h - 15) / 24), r: f.r, cl: f.cl, dir, spd };
  }
  /* ---- 모형 끝 ---- */

  const WCAT = (d) => (d >= 45 && d < 157.5 ? "e" : d >= 157.5 && d < 247.5 ? "s" : "nw");
  const DIR16 = ["북", "북북동", "북동", "동북동", "동", "동남동", "남동", "남남동", "남", "남남서", "남서", "서남서", "서", "서북서", "북서", "북북서"];
  const label = (t) => `${1 + Math.floor((9 + t) / 24)}일째 ${String((9 + t) % 24).padStart(2, "0")}시`;
  const sky = (o) => (o.r >= 0.5 ? (o.r >= 8 ? "강한 비" : "비") : o.cl > 0.6 ? "흐림" : o.cl > 0.25 ? "구름 조금" : "맑음");
  const SERIES = []; for (let k = 0; k <= 72; k++) SERIES.push(seoul(k));

  const D = NMEastAsia;
  const layers = { map: true, ir: false, rad: false };
  let T = 0, cp = null, pred = {}, cache = null, revealed = false;
  const map = fit($(".fc-map"), () => draw()), plot = fit($(".fc-plot"), () => drawPlot());
  const LATC = 36, LAT1 = 50, LAT2 = 22;
  function proj(w, h) {
    const ky = h / (LAT1 - LAT2), kx = ky * Math.cos(LATC * Math.PI / 180), lonL = LON0 + 0.5 - w / 2 / kx;
    return { X: (lon) => (lon - lonL) * kx, Y: (lat) => (LAT1 - lat) * ky, lon: (x) => lonL + x / kx, lat: (y) => LAT1 - y / ky };
  }
  const RADC = toKm(127.5, 36.3), RADR = 500;
  function grid(w, h, P, S) {
    const n = 4, gw = Math.ceil(w / n) + 1, gh = Math.ceil(h / n) + 1, G = { n, gw, gh, p: new Float32Array(gw * gh), cl: new Float32Array(gw * gh), r: new Float32Array(gw * gh) };
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const [x, y] = toKm(P.lon(i * n), P.lat(j * n)), f = fields(S, x, y), k = j * gw + i;
      G.p[k] = f.p; G.cl[k] = f.cl; G.r[k] = f.r;
    }
    return G;
  }
  function landPath(ctx, P) {
    ctx.beginPath();
    D.land.forEach((p) => { for (let i = 0; i < p.length; i += 2) { const x = P.X(p[i]), y = P.Y(p[i + 1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); });
  }
  function isobars(ctx, G, col) {
    const { n, gw, gh, p } = G;
    ctx.strokeStyle = col; ctx.lineWidth = 1;
    for (let lv = 980; lv <= 1040; lv += 4) {
      ctx.beginPath();
      for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) {
        const v = [p[j * gw + i], p[j * gw + i + 1], p[(j + 1) * gw + i + 1], p[(j + 1) * gw + i]];
        const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], pts = [];
        for (let e = 0; e < 4; e++) {
          const a = v[e] - lv, b = v[(e + 1) % 4] - lv;
          if ((a < 0) !== (b < 0)) { const s = a / (a - b), A = c[e], B = c[(e + 1) % 4]; pts.push([(A[0] + s * (B[0] - A[0])) * n, (A[1] + s * (B[1] - A[1])) * n]); }
        }
        if (pts.length >= 2) { ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); }
        if (pts.length === 4) { ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); }
      }
      ctx.stroke();
    }
  }
  function frontLine(ctx, P, pl, warm) {
    const pts = pl.map(([x, y]) => [P.X(LON0 + x / KX), P.Y(LAT0 + y / KY)]);
    const col = warm ? "#c8402f" : "#2f5fb3";
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2;
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L;
      const nx = warm ? uy : -uy, ny = warm ? -ux : ux;
      for (let s = 14 - acc; s < L; s += 22) {
        const cx = ax + ux * s, cy = ay + uy * s;
        ctx.beginPath();
        if (warm) { const a0 = Math.atan2(ny, nx); ctx.arc(cx, cy, 5, a0 - Math.PI / 2, a0 + Math.PI / 2); }
        else { ctx.moveTo(cx - ux * 5, cy - uy * 5); ctx.lineTo(cx + nx * 7, cy + ny * 7); ctx.lineTo(cx + ux * 5, cy + uy * 5); }
        ctx.fill();
      }
      acc = (acc + L) % 22;
    }
  }
  function hl(ctx, P, xy, txt, pv, col, ink) {
    const x = P.X(LON0 + xy[0] / KX), y = P.Y(LAT0 + xy[1] / KY);
    if (x < 8 || x > P.w - 8 || y < 8 || y > P.h - 18) return;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `700 17px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(txt, x, y - 14);
    ctx.fillStyle = ink; ctx.font = `10px ${F.mono}`; ctx.fillText(Math.round(pv), x, y - 4);
  }
  function draw() {
    const { ctx } = map, { w, h } = map.size; if (!w) return;
    const P = proj(w, h); P.w = w; P.h = h;
    const S = state(T);
    if (!cache || cache.t !== T || cache.w !== w) cache = { t: T, w, G: grid(w, h, P, S) };
    const G = cache.G, ir = layers.ir;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ir ? "#262a30" : "#dfe7ef"; ctx.fillRect(0, 0, w, h);
    landPath(ctx, P); ctx.fillStyle = ir ? "#3a3f45" : "#f4f1e8"; ctx.fill("evenodd");
    if (ir) {
      const off = document.createElement("canvas"); off.width = G.gw; off.height = G.gh;
      const oc = off.getContext("2d"), im = oc.createImageData(G.gw, G.gh);
      for (let k = 0; k < G.gw * G.gh; k++) { const b = clamp(G.cl[k], 0, 1); im.data[4 * k] = im.data[4 * k + 1] = im.data[4 * k + 2] = 235; im.data[4 * k + 3] = Math.round(255 * Math.pow(b, 0.9)); }
      oc.putImageData(im, 0, 0);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, G.gw * G.n, G.gh * G.n);
    }
    ctx.strokeStyle = ir ? "rgba(255,255,255,.45)" : "#c9c3b2"; ctx.lineWidth = 0.7; landPath(ctx, P); ctx.stroke();
    if (layers.rad) {
      const off = document.createElement("canvas"); off.width = G.gw; off.height = G.gh;
      const oc = off.getContext("2d"), im = oc.createImageData(G.gw, G.gh);
      for (let j = 0; j < G.gh; j++) for (let i = 0; i < G.gw; i++) {
        const k = j * G.gw + i, r = G.r[k], [x, y] = toKm(P.lon(i * G.n), P.lat(j * G.n));
        if (Math.hypot(x - RADC[0], y - RADC[1]) > RADR || r < 0.5) continue;
        const c = r < 1 ? [110, 180, 235] : r < 4 ? [60, 170, 90] : r < 10 ? [235, 200, 50] : [220, 60, 50];
        im.data.set([c[0], c[1], c[2], 210], 4 * k);
      }
      oc.putImageData(im, 0, 0);
      ctx.drawImage(off, 0, 0, G.gw * G.n, G.gh * G.n);
      const cx = P.X(127.5), cy = P.Y(36.3), rx = RADR / KX * (P.X(128) - P.X(127)), ry = RADR / KY * (P.Y(36) - P.Y(37));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = ir ? "rgba(0,0,0,.35)" : "rgba(120,120,120,.18)"; ctx.fill("evenodd");
      ctx.setLineDash([4, 3]); ctx.strokeStyle = ir ? "#cfd5dc" : C.ink3; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    if (layers.map) {
      isobars(ctx, G, ir ? "rgba(255,255,255,.55)" : "rgba(60,60,70,.55)");
      frontLine(ctx, P, S.wf, true); frontLine(ctx, P, S.cf, false);
      const pc = (xy) => fields(S, xy[0], xy[1]).p;
      hl(ctx, P, S.L, "L", pc(S.L), "#c8402f", ir ? "#fff" : C.ink);
      hl(ctx, P, S.H0, "H", pc(S.H0), "#2f5fb3", ir ? "#fff" : C.ink);
      hl(ctx, P, S.H1, "H", pc(S.H1), "#2f5fb3", ir ? "#fff" : C.ink);
    }
    const sx = P.X(LON0), sy = P.Y(LAT0);
    ctx.fillStyle = "#111"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.stroke(); ctx.fill();
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right"; ctx.lineWidth = 3; ctx.strokeText("서울", sx - 7, sy + 4); ctx.fillText("서울", sx - 7, sy + 4);
    ctx.textAlign = "left"; ctx.font = `600 11.5px ${F.sans}`;
    const tag = `${label(T)} · ${[layers.map && "일기도", layers.ir && "적외", layers.rad && "레이더"].filter(Boolean).join(" + ") || "지도만"} · 가상 사례`;
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(6, 6, ctx.measureText(tag).width + 12, 20);
    ctx.fillStyle = C.ink; ctx.fillText(tag, 12, 20);
    if (layers.rad) {
      const items = [["#78bef0", "<1"], ["#3caa5a", "1–4"], ["#ebc832", "4–10"], ["#dc3c32", ">10 mm/h"]];
      ctx.font = `10px ${F.sans}`; let x = 8; const y = h - 10;
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(4, h - 22, 190, 18);
      items.forEach(([c, t]) => { ctx.fillStyle = c; ctx.fillRect(x, y - 8, 10, 9); ctx.fillStyle = C.ink2; ctx.fillText(t, x + 13, y); x += 17 + ctx.measureText(t).width + 6; });
    }
    nums();
  }
  function drawPlot() {
    const { ctx } = plot, { w, h } = plot.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 36, y0: 20, w: w - 74, h: h - 46 };
    const X = (t) => box.x0 + t / 72 * box.w, Y = (v) => box.y0 + (20 - v) / 25 * box.h, YR = (r) => box.y0 + box.h - clamp(r / 16, 0, 1) * box.h;
    axes(ctx, { ...box, X, Y, xt: [0, 24, 48, 72].map((t) => [t, label(t).replace("일째 ", "일 ")]), yt: [0, 5, 10, 15, 20].map((v) => [v, String(v)]), ylabel: "서울 기온 (°C)" });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = "#3a7bbf"; ctx.textAlign = "right"; ctx.fillText("강수 (mm/h)", box.x0 + box.w + 34, box.y0 - 7);
    ctx.textAlign = "left"; [0, 8, 16].forEach((r) => ctx.fillText(String(r), box.x0 + box.w + 5, YR(r) + 3));
    const until = cp !== null && !revealed ? cp : T;
    ctx.fillStyle = "rgba(58,123,191,.55)";
    for (let k = 0; k < until; k++) { const r = (SERIES[k].r + SERIES[k + 1].r) / 2; if (r > 0.05) ctx.fillRect(X(k), YR(r), Math.max(1, X(1) - X(0) - 0.5), box.y0 + box.h - YR(r)); }
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = 0; k <= until; k++) { const x = X(k), y = Y(SERIES[k].T); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(T) + .5, box.y0); ctx.lineTo(X(T) + .5, box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
    if (until < 72) { ctx.fillStyle = "rgba(200,200,200,.18)"; ctx.fillRect(X(until), box.y0, X(72) - X(until), box.h); ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; if (X(72) - X(until) > 70) ctx.fillText("아직 관측 전", (X(until) + X(72)) / 2, box.y0 + 14); }
  }
  function nums() {
    const o = SERIES[T];
    $(".n-p").textContent = `${o.p.toFixed(0)} hPa`;
    $(".n-t").textContent = `${o.T.toFixed(1)} °C`;
    $(".n-w").textContent = o.spd < 1 ? "약함" : `${DIR16[Math.round(o.dir / 22.5) % 16]} ${o.spd.toFixed(0)} m/s`;
    $(".n-s").textContent = `${sky(o)}${o.r >= 0.5 ? ` ${o.r.toFixed(o.r >= 10 ? 0 : 1)} mm/h` : ""}`;
    $(".t-out").textContent = label(T);
  }
  const redraw = () => { draw(); drawPlot(); };
  const slider = $(".tt");
  slider.addEventListener("input", () => { T = +slider.value; redraw(); });
  root.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { const k = b.dataset.l; layers[k] = !layers[k]; b.setAttribute("aria-pressed", String(layers[k])); draw(); }));
  /* 예측 */
  const verdict = $(".verdict");
  const obsCat = (a, b) => ({ rain: b.r >= 0.5 ? "y" : "n", temp: b.T - a.T > 1.5 ? "up" : b.T - a.T < -1.5 ? "down" : "same", wind: WCAT(b.dir) });
  const NAME = { rain: { y: "비 온다", n: "비 안 온다" }, temp: { up: "오른다", same: "비슷", down: "내린다" }, wind: { e: "동~남동풍", s: "남~남서풍", nw: "서~북서~북풍" } };
  const WHY = {
    18: "서쪽에서 온 저기압의 온난 전선이 다가오며 높은 구름이 두꺼워지고 비가 시작됩니다. 남동풍이 따뜻한 공기를 실어 오고, 새벽보다 오후가 더 따뜻합니다.",
    36: "밤사이 한랭 전선이 지나갔습니다. 좁고 강한 비가 짧게 내린 뒤 그쳤고, 바람이 북서풍으로 바뀌며 찬 공기가 들어와 기온이 내려갔습니다.",
    54: "뒤따라온 이동성 고기압이 서울을 덮었습니다. 하늘이 맑아 밤사이 열이 빠져나가 기온이 크게 떨어지고, 고기압 둘레의 바람은 약합니다.",
  };
  root.querySelectorAll("[data-cp]").forEach((b) => b.addEventListener("click", () => {
    cp = +b.dataset.cp; revealed = false; pred = {}; T = cp; slider.value = T;
    root.querySelectorAll("[data-cp]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    root.querySelectorAll("[data-q] .chip").forEach((x) => x.setAttribute("aria-pressed", "false"));
    $(".pred").hidden = false;
    verdict.className = "verdict small"; verdict.textContent = `${label(cp)}입니다. 세 자료를 켜 보고, 12시간 뒤(${label(cp + 12)}) 서울 날씨를 골라 보세요.`;
    redraw();
  }));
  root.querySelectorAll("[data-q]").forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    pred[g.dataset.q] = b.dataset.v;
    g.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
  $(".check").addEventListener("click", () => {
    if (cp === null) { verdict.textContent = "먼저 예측 시점을 고르세요."; return; }
    if (Object.keys(pred).length < 3) { verdict.textContent = "비, 기온, 바람을 모두 골라야 확인할 수 있습니다."; return; }
    const ob = obsCat(SERIES[cp], SERIES[cp + 12]);
    let hit = 0;
    const parts = ["rain", "temp", "wind"].map((k) => { const ok = pred[k] === ob[k]; hit += ok; return `${ok ? "○" : "×"} ${NAME[k][ob[k]]}`; });
    revealed = true; T = cp + 12; slider.value = T;
    verdict.className = "verdict small" + (hit === 3 ? " good" : "");
    verdict.textContent = `관측(${label(T)}): ${parts.join(" · ")} — ${hit}/3. ${WHY[cp]}`;
    redraw();
  });
  redraw();
  if (/[?&]demo\b/.test(location.search)) {
    root.querySelector('[data-l="ir"]').click(); root.querySelector('[data-l="rad"]').click();
    root.querySelector('[data-cp="36"]').click();
    [["rain", "y"], ["temp", "down"], ["wind", "nw"]].forEach(([q, v]) => root.querySelector(`[data-q="${q}"] [data-v="${v}"]`).click());
  }
})();
