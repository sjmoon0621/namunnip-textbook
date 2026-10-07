/* 카드: 지구는 얼마나 납작하고, 해수면은 얼마나 울퉁불퉁할까? — 자오선 호 길이로 편평도, EGM96 지오이드로 정표고 */
(() => {
  const root = document.getElementById("card-labearth-geoid");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const D = window.NMGeoid, LAND = (window.NMQuake || {}).land || [];
  const A = 6378.137, FL = 1 / 298.257223563, E2 = FL * (2 - FL);   // WGS84
  const NR = 91, NCOL = 180;
  let mode = "arc", sel = { lat: 37.5, lon: 127 }, st = 1;

  /* 2° 격자 쌍선형 보간 */
  const gat = (i, j) => D.g[i * NCOL + ((j % NCOL) + NCOL) % NCOL];
  function geoidN(lat, lon) {
    const y = (90 - lat) / 2, x = (((lon + 180) % 360) + 360) % 360 / 2;
    const i = Math.min(NR - 2, Math.floor(y)), j = Math.floor(x), fy = y - i, fx = x - j;
    return gat(i, j) * (1 - fx) * (1 - fy) + gat(i, j + 1) * fx * (1 - fy) + gat(i + 1, j) * (1 - fx) * fy + gat(i + 1, j + 1) * fx * fy;
  }
  /* 위도 φ에서 자오선 1° 호의 길이 (km) */
  const arc1 = (phi) => { const s = Math.sin(phi * Math.PI / 180); return Math.PI / 180 * A * (1 - E2) / Math.pow(1 - E2 * s * s, 1.5); };

  /* 지오이드 색: 음수는 파랑, 양수는 주황 */
  const col = (n) => {
    const t = Math.max(-1, Math.min(1, n / 90));
    const base = [243, 244, 239], neg = [52, 96, 170], pos = [196, 86, 44];
    const tgt = t < 0 ? neg : pos, k = Math.abs(t);
    return `rgb(${base.map((b, i) => Math.round(b + (tgt[i] - b) * k)).join(",")})`;
  };
  const off = document.createElement("canvas");
  off.width = NCOL; off.height = NR;
  { const o = off.getContext("2d"); for (let i = 0; i < NR; i++) for (let j = 0; j < NCOL; j++) { o.fillStyle = col(D.g[i * NCOL + j]); o.fillRect(j, i, 1, 1); } }

  const map = fit($(".cv-wide"), () => drawMap());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tA = L.table($(".tbl-a"), [
    { key: "phi", label: "중심 위도 φ (°)", res: 0.1 }, { key: "s2", label: "sin²φ", res: 0.001 }, { key: "L", label: "1° 호 길이 L (km)", res: 0.01 },
  ], () => drawPlot());
  const tB = L.table($(".tbl-b"), [
    { key: "name", label: "지점" }, { key: "h", label: "GPS 타원체고 h (m)", res: 0.01 }, { key: "N", label: "지오이드 N (m)", res: 0.01 }, { key: "H", label: "정표고 H = h − N (m)", res: 0.01 },
  ], () => drawPlot());

  let box = null;
  function drawMap() {
    const { ctx } = map, { w, h } = map.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const mw = Math.min(w - 16, (h - 26) * 2), mh = mw / 2, x0 = (w - mw) / 2, y0 = 6;
    box = { x0, y0, mw, mh };
    const X = (lon) => x0 + (lon + 180) / 360 * mw, Y = (lat) => y0 + (90 - lat) / 180 * mh;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, X(-181), Y(91), mw * 181 / 180, mh * 91 / 90);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, mw, mh); ctx.clip();
    ctx.strokeStyle = "rgba(35,35,38,.55)"; ctx.lineWidth = 0.7;
    for (const p of LAND) { ctx.beginPath(); for (let k = 0; k < p.length; k += 2) { const px = X(p[k]), py = Y(p[k + 1]); k && Math.abs(p[k] - p[k - 2]) < 180 ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
    ctx.strokeStyle = C.rule; ctx.setLineDash([2, 4]);
    for (let la = -60; la <= 60; la += 30) { ctx.beginPath(); ctx.moveTo(x0, Y(la)); ctx.lineTo(x0 + mw, Y(la)); ctx.stroke(); }
    ctx.setLineDash([]);
    if (mode === "arc") {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(x0, Y(sel.lat)); ctx.lineTo(x0 + mw, Y(sel.lat)); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.warn; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(X(sel.lon), Y(sel.lat - 2)); ctx.lineTo(X(sel.lon), Y(sel.lat + 2)); ctx.stroke();
    } else {
      const s = D.st[st];
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(x0, Y(s[1])); ctx.lineTo(x0 + mw, Y(s[1])); ctx.stroke(); ctx.setLineDash([]);
      D.st.forEach((q, i) => { ctx.fillStyle = i === st ? C.warn : C.ink; ctx.beginPath(); ctx.arc(X(q[2]), Y(q[1]), i === st ? 5 : 3, 0, Math.PI * 2); ctx.fill(); });
    }
    ctx.restore();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, y0 + .5, mw - 1, mh - 1);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    [-120, -60, 0, 60, 120].forEach((lo) => ctx.fillText(`${Math.abs(lo)}°${lo < 0 ? "W" : lo ? "E" : ""}`, X(lo), y0 + mh + 13));
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bx = { x0: 52, y0: 20, w: w - 66, h: h - 56 };
    if (mode === "arc") {
      const pts = tA.rows.map((r) => ({ x: r.s2, y: r.L }));
      const f = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
      L.plot(ctx, bx, { pts, fit: f, model: () => 111.195, xr: [0, 1], yr: [110.4, 111.9], xlabel: "sin²φ", ylabel: "1° 호 길이 L (km)" });
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
      ctx.fillText("점선: 반지름 6371 km 구", bx.x0 + 8, bx.y0 + bx.h - 8);
      const fl = f ? f.a / (3 * f.b) : NaN;
      $(".n-a").textContent = f ? f.a.toFixed(3) + " km" : "—";
      $(".n-b").textContent = f ? f.b.toFixed(3) + " km" : "—";
      $(".n-f").textContent = f && fl > 0 ? "1/" + (1 / fl).toFixed(0) : "—";
    } else {
      const s = D.st[st], lat = s[1];
      const prof = [];
      for (let lo = -180; lo <= 180; lo += 2) prof.push([lo, geoidN(lat, lo)]);
      const X = (v) => bx.x0 + (v + 180) / 360 * bx.w, Y = (v) => bx.y0 + bx.h - (v + 120) / 220 * bx.h;
      NM.axes(ctx, { ...bx, X, Y, xt: [-180, -120, -60, 0, 60, 120, 180].map((v) => [v, v + "°"]), yt: [-100, -50, 0, 50, 100].map((v) => [v, String(v)]), xlabel: `경도 (위도 ${lat.toFixed(1)}° 단면)`, ylabel: "지오이드 높이 N (m)" });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx.x0, Y(0)); ctx.lineTo(bx.x0 + bx.w, Y(0)); ctx.stroke();
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.8; ctx.beginPath();
      prof.forEach(([lo, n], i) => (i ? ctx.lineTo(X(lo), Y(n)) : ctx.moveTo(X(lo), Y(n)))); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(s[2]), Y(s[4]), 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
      ctx.fillText("0 m = WGS84 타원체면", bx.x0 + 6, Y(0) - 5);
      const last = tB.rows.filter((r) => r.name === s[0]).pop();
      $(".n-a").textContent = s[4].toFixed(2) + " m";
      $(".n-b").textContent = last ? (Math.abs(last.H) < 0.005 ? 0 : last.H).toFixed(2) + " m" : "—";
      $(".n-f").textContent = s[3] ? s[3].toLocaleString("ko-KR") + " m" : "0 (바다)";
    }
  }

  function setMode(m) {
    mode = m;
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    $(".pane-a").hidden = m !== "arc"; $(".pane-b").hidden = m === "arc";
    const lab = m === "arc" ? ["기울기", "절편 L₀", "편평도 f = 기울기/(3L₀)"] : ["이 지점의 N", "계산한 H", "공식 정표고"];
    root.querySelectorAll(".nums dt").forEach((dt, i) => { dt.textContent = lab[i]; });
    drawMap(); drawPlot();
  }

  const sLat = $(".lat");
  const updLat = () => { sel.lat = +sLat.value; $(".lat-out").textContent = sel.lat.toFixed(1); drawMap(); };
  sLat.addEventListener("input", updLat);
  function measureArc() {
    const phi = sel.lat;
    tA.add({ phi, s2: Math.sin(phi * Math.PI / 180) ** 2, L: L.measure(arc1(phi), { sd: 0.03, res: 0.01 }) });
  }
  function measureGPS() {
    const s = D.st[st];
    const hEl = L.measure(s[3] + s[4], { sd: 0.03, res: 0.01 });
    tB.add({ name: s[0], h: hEl, N: s[4], H: Math.round((hEl - s[4]) * 100) / 100 + 0 });
  }
  $(".meas-a").addEventListener("click", measureArc);
  $(".meas-b").addEventListener("click", measureGPS);
  $(".clear").addEventListener("click", () => { (mode === "arc" ? tA : tB).clear(); drawPlot(); });
  $(".modes").addEventListener("click", (e) => { const b = e.target.closest("[data-mode]"); if (b) setMode(b.dataset.mode); });
  const stBox = $(".stations");
  stBox.innerHTML = D.st.map((s, i) => `<button class="chip" type="button" data-st="${i}" aria-pressed="${i === st}">${s[0]}</button>`).join("");
  stBox.addEventListener("click", (e) => {
    const b = e.target.closest("[data-st]"); if (!b) return;
    st = +b.dataset.st; stBox.querySelectorAll("[data-st]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    drawMap(); drawPlot();
  });
  $(".cv-wide").addEventListener("click", (e) => {
    if (!box || mode !== "arc") return;
    const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < box.x0 || px > box.x0 + box.mw || py < box.y0 || py > box.y0 + box.mh) return;
    sel.lat = Math.round(Math.max(-80, Math.min(80, 90 - (py - box.y0) / box.mh * 180))); sel.lon = (px - box.x0) / box.mw * 360 - 180;
    sLat.value = Math.abs(sel.lat); updLat();
  });
  updLat();
  if (L.demo) {
    [0, 10, 20, 30, 40, 50, 60, 70, 80].forEach((p) => { sel.lat = p; measureArc(); });
    [1, 2, 3, 4, 7].forEach((i) => { st = i; measureGPS(); });
    st = 4; stBox.querySelectorAll("[data-st]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.st === st)));
    sel.lat = 37.5; sLat.value = 37.5; $(".lat-out").textContent = "37.5";
  }
  setMode("arc");
})();
