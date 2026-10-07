/* 카드: 달 사진 한 장으로 크레이터의 깊이까지 잴 수 있을까? — FOV로 축척 정하기, 그림자 길이로 높이 구하기 (모식 영상) */
(() => {
  const root = document.getElementById("card-labearth-crater");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const RM = 1737.4, FOC = 1000, PIX = 3.75, W = 420, H = 250, X0 = -40;   // X0: 그림 왼쪽 끝의 경계선 기준 투영 거리 (km)
  const PS = 206.265 * PIX / FOC;   // ″/화소
  const sDist = $(".dist");
  /* 대상: s = 경계선에서 표면을 따라 잰 거리(km), y = 남북 위치(km), D 지름, dep 깊이, rim 테두리 높이, pk 중앙봉 높이 (모식, Pike 1977 경험식 근처) */
  const OBJ = {
    M: { s: 160, y: 175, mount: 2.0, wid: 8 },
    E: { s: 270, y: 92, D: 70, dep: 3.73, rim: 1.29, pk: 1.4 },
    A: { s: 322, y: 262, D: 48, dep: 3.34, rim: 1.11, pk: 1.0 },
    C: { s: 405, y: 160, D: 30, dep: 2.90, rim: 0.92, pk: 0.6 },
    B: { s: 528, y: 88, D: 12, dep: 2.35, rim: 0.44, pk: 0 },
    D: { s: 512, y: 236, D: 8, dep: 1.57, rim: 0.29, pk: 0 },
  };
  /* 배경의 작은 크레이터 (고정 난수) */
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const SMALL = [];
  for (let i = 0; i < 45; i++) {
    const s = 20 + rnd() * 560, y = rnd() * 340, D = 3 + 7 * rnd() ** 2;
    if (Object.values(OBJ).some((o) => o.D && Math.hypot(o.s - s, o.y - y) < o.D / 2 + D)) continue;
    SMALL.push({ s, y, D, dep: 0.19 * D, rim: 0.036 * D, pk: 0 });
  }
  const CR = [...Object.values(OBJ).filter((o) => o.D), ...SMALL];
  function height(s, y, list) {
    let h = 0.05 * Math.sin(s / 23 + y / 41) + 0.03 * Math.sin(s / 9.7 - y / 13.1);
    const m = OBJ.M; h += m.mount * Math.exp(-(((s - m.s) / m.wid) ** 2 + ((y - m.y) / (m.wid * 1.8)) ** 2));
    for (const c of list) {
      const R = c.D / 2, dx = s - c.s; if (Math.abs(dx) > 3 * R) continue;
      const q = Math.hypot(dx, y - c.y) / R;
      if (q > 3) continue;
      if (q < 1) {
        if (c.D < 15) h += -c.dep + (c.dep + c.rim) * q * q;
        else { const t = Math.max(0, (q - 0.45) / 0.55), sm = t * t * (3 - 2 * t); h += -c.dep + (c.dep + c.rim) * sm + c.pk * Math.exp(-((q / 0.12) ** 2)); }
      } else h += c.rim * (q ** -3 - 1 / 27) * 27 / 26;
    }
    return h;
  }

  /* 표면 계산: 줄마다 s 방향 높이·그림자 */
  const DS = 0.25, NS = Math.ceil(640 / DS);
  let kmpx = 0, rows = null;
  function compute() {
    kmpx = PS / 206265 * +sDist.value;
    const all = [];
    for (let j = -1; j <= H; j++) {
      const y = (j + 0.5) * kmpx, list = CR.filter((c) => Math.abs(y - c.y) < 1.5 * c.D), hs = new Float32Array(NS);
      for (let k = 0; k < NS; k++) hs[k] = height(k * DS, y, list);
      all.push(hs);
    }
    rows = [];
    for (let j = 0; j < H; j++) {
      const hs = all[j + 1], up = all[j], dn = all[j + 2], lit = new Float32Array(NS), sh = new Uint8Array(NS);
      let hz = -1e9;
      for (let k = NS - 1; k >= 0; k--) {
        const a = k * DS / RM;
        hz = Math.max(hs[k], hz - DS * Math.tan(a));
        sh[k] = hs[k] < hz - 1e-3 ? 1 : 0;
        if (!sh[k]) {
          const gs = (hs[Math.min(NS - 1, k + 1)] - hs[Math.max(0, k - 1)]) / (2 * DS), gy = (dn[k] - up[k]) / (2 * kmpx);
          lit[k] = Math.max(0, (-gs * Math.cos(a) + Math.sin(a)) / Math.sqrt(1 + gs * gs + gy * gy));
        }
      }
      rows.push({ y: (j + 0.5) * kmpx, hs, lit, sh });
    }
  }
  const sOf = (xproj) => RM * Math.asin(Math.max(-1, Math.min(1, xproj / RM)));
  const xOf = (s) => RM * Math.sin(s / RM);

  const cv = $(".moon"), ctx = cv.getContext("2d"), off = document.createElement("canvas");
  off.width = W; off.height = H;
  function renderImg() {
    compute();
    const o = off.getContext("2d"), im = o.createImageData(W, H);
    for (let j = 0; j < H; j++) {
      const r = rows[j];
      for (let i = 0; i < W; i++) {
        const xp = X0 + (i + 0.5) * kmpx, s = sOf(xp);
        let v = 0;
        if (s > 0) {
          const k = Math.min(NS - 1, Math.round(s / DS));
          const alb = 0.86 + 0.14 * Math.sin(s * 0.9 + j * 1.7) * Math.sin(s * 0.31 - j * 0.53);
          v = r.sh[k] ? 0.015 : r.lit[k] * alb;
        }
        const g = Math.min(255, 255 * Math.pow(v / 0.33, 0.75));
        const p = (j * W + i) * 4; im.data[p] = g; im.data[p + 1] = g; im.data[p + 2] = g * 0.97; im.data[p + 3] = 255;
      }
    }
    o.putImageData(im, 0, 0);
  }
  /* 참 그림자: 대상 중심 줄에서, 해 쪽 테두리(또는 산꼭대기)부터 그림자가 끝나는 곳까지 (표면 거리 km) */
  function trueShadow(key) {
    const o = OBJ[key], j = Math.max(0, Math.min(H - 1, Math.round(o.y / kmpx - 0.5))), r = rows[j];
    let k = Math.round((o.D ? o.s + o.D / 2 : o.s) / DS);
    let top = k; for (let t = k - 20; t <= k + 20; t++) if (r.hs[t] > r.hs[top]) top = t;
    let e = top - 1; while (e > 0 && !r.sh[e]) e--;
    if (e <= 0) return 0;
    while (e > 0 && r.sh[e]) e--;
    return (top - e) * DS;
  }
  const trueH = (key) => (OBJ[key].D ? OBJ[key].dep + OBJ[key].rim : OBJ[key].mount);

  let target = "E", what = "d", drag = null, truth = false;
  const meas = {};
  const curM = () => (meas[target] = meas[target] || {});
  function draw() {
    const w = cv.clientWidth, h = cv.clientHeight; if (!w) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    ctx.setTransform(dpr * w / W, 0, 0, dpr * h / H, 0, 0);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(off, 0, 0);
    const tx = -X0 / kmpx;
    ctx.strokeStyle = "rgba(224,160,42,0.7)"; ctx.lineWidth = 0.8; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, H); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center";
    Object.entries(OBJ).forEach(([k, o]) => {
      const x = (xOf(o.s) - X0) / kmpx, y = o.y / kmpx, rr = (o.D || 14) / 2 / kmpx;
      ctx.fillStyle = k === target ? C.amber : "rgba(255,255,255,0.75)";
      ctx.fillText(k, x + rr * 0.9 + 5, y - rr * 0.9 - 2);
    });
    if (drag) {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.2; ctx.beginPath();
      const [x1, y1] = drag.end;
      if (what === "d") { ctx.moveTo(drag.x, drag.y); ctx.lineTo(drag.x, y1); }
      else if (what === "l") { ctx.moveTo(drag.x, drag.y); ctx.lineTo(x1, drag.y); }
      else { ctx.moveTo(tx, y1); ctx.lineTo(x1, y1); }
      ctx.stroke();
    }
    ctx.font = `9px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("N", W - 12, 12); ctx.fillText(`50 km`, W - 46, H - 12);
    ctx.fillRect(W - 50 - 50 / kmpx + 50, H - 8, 50 / kmpx, 2);
  }
  const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
  cv.addEventListener("pointerdown", (e) => { const [x, y] = pt(e); drag = { x, y, end: [x, y] }; cv.setPointerCapture(e.pointerId); draw(); });
  cv.addEventListener("pointermove", (e) => { if (!drag) return; drag.end = pt(e); draw(); showCur(); });
  cv.addEventListener("pointerup", () => {
    if (!drag) return;
    const [x1, y1] = drag.end, m = curM();
    if (what === "d") m.d = Math.round(Math.abs(y1 - drag.y));
    else if (what === "l") m.l = Math.round(Math.abs(x1 - drag.x));
    else m.x = Math.round(x1 - (-X0 / kmpx));
    drag = null; draw(); showCur();
  });
  function showCur() {
    const m = curM(), f = (v) => (v == null ? "—" : `${v} 화소 = ${(v * kmpx).toFixed(1)} km`);
    let live = "";
    if (drag) { const [x1, y1] = drag.end; const v = what === "d" ? Math.abs(y1 - drag.y) : what === "l" ? Math.abs(x1 - drag.x) : x1 + X0 / kmpx; live = ` · 지금 ${Math.round(v)} 화소`; }
    $(".cur").textContent = `${target} — ① 지름 ${f(m.d)} · ② 거리 ${f(m.x)} · ③ 그림자 ${f(m.l)}${live}`;
  }

  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "n", label: "대상" }, { key: "D", label: "D (km)", res: 0.1 }, { key: "x", label: "x (km)", res: 1 }, { key: "a", label: "α (°)", res: 0.1 },
    { key: "L", label: "L (km)", res: 0.1 }, { key: "h", label: "h (km)", res: 0.01 }, { key: "t", label: "참 h" },
  ], () => drawPlot());
  function drawPlot() {
    const { ctx: c, size } = pl, { w, h } = size; if (!w) return;
    c.clearRect(0, 0, w, h);
    const pts = tbl.rows.filter((r) => Number.isFinite(r.D)).map((r) => ({ x: r.D, y: r.h }));
    const box = { x0: 44, y0: 22, w: w - 58, h: h - 56 };
    L.plot(c, box, { pts, xr: [0, 80], yr: [0, 6], xlabel: "지름 D (km)", ylabel: "테두리–바닥 높이차 h (km)", model: (x) => 0.2 * x });
    c.font = `11px ${F.mono}`; c.textAlign = "left"; c.fillStyle = C.ink3;
    c.fillText("점선: h = 0.2 D (작은 그릇 모양 크레이터)", box.x0 + 6, box.y0 + 14);
  }
  function record(m, key) {
    const o = OBJ[key];
    if (m.x == null || m.l == null) { $(".cur").textContent = `${key} — ②와 ③을 먼저 재세요`; return; }
    const x = m.x * kmpx, a = Math.asin(Math.min(1, x / RM)), Lk = m.l * kmpx / Math.cos(a);
    tbl.add({ n: key === "M" ? "M (산)" : key, D: o.D && m.d != null ? m.d * kmpx : NaN, x, a: a * 180 / Math.PI, L: Lk, h: Lk * Math.tan(a), t: truth ? trueH(key).toFixed(2) : "—" });
  }
  function nums() {
    $(".n-ps").textContent = PS.toFixed(3) + "″/화소";
    $(".n-fov").textContent = `${(1280 * PS / 60).toFixed(1)}′ × ${(960 * PS / 60).toFixed(1)}′`;
    $(".n-km").textContent = kmpx.toFixed(3) + " km";
    $(".n-w").textContent = `${(W * kmpx).toFixed(0)} × ${(H * kmpx).toFixed(0)} km`;
    $(".r-out").textContent = (+sDist.value).toLocaleString();
  }
  $(".tgt").addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (!b) return; target = b.dataset.c; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); showCur(); });
  $(".what").addEventListener("click", (e) => { const b = e.target.closest("[data-w]"); if (!b) return; what = b.dataset.w; root.querySelectorAll("[data-w]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  $(".rec").addEventListener("click", () => record(curM(), target));
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".truth").addEventListener("click", (e) => { truth = !truth; e.currentTarget.setAttribute("aria-pressed", String(truth)); tbl.rows.forEach((r) => { const k = r.n[0]; r.t = truth ? trueH(k).toFixed(2) : "—"; }); const keep = tbl.rows.slice(); tbl.clear(); keep.forEach((r) => tbl.add(r)); });
  sDist.addEventListener("change", () => { renderImg(); nums(); draw(); showCur(); });
  sDist.addEventListener("input", () => { $(".r-out").textContent = (+sDist.value).toLocaleString(); });
  new ResizeObserver(() => draw()).observe(cv);
  renderImg(); nums(); draw(); showCur();
  if (L.demo) {
    truth = true; $(".truth").setAttribute("aria-pressed", "true");
    ["M", "E", "A", "C", "D", "B"].forEach((k) => {
      const o = OBJ[k], a = o.s / RM;
      const m = { d: o.D ? Math.round(L.measure(o.D / kmpx, { sd: 1 })) : null, x: Math.round(L.measure((xOf(o.s)) / kmpx, { sd: 1 })), l: Math.round(L.measure(trueShadow(k) * Math.cos(a) / kmpx, { sd: 0.8 })) };
      meas[k] = m; record(m, k);
    });
    showCur();
  }
})();
