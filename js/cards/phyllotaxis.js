/* 카드: 잎은 왜 비스듬히 돌아 날까? — 잎차례 각도와 겹침 */
(() => {
  const root = document.getElementById("card-phyllo");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvTop, cvPlot] = root.querySelectorAll("canvas");
  const sA = $(".ang"), sN = $(".num"), oA = $(".ang-out"), oN = $(".num-out");
  const nShade = $(".shade"), nGap = $(".gap"), nRep = $(".rep");
  const GOLD = 180 * (3 - Math.sqrt(5));

  // 위에서 본 잎: i = 0 이 가장 아래(오래되고 큰 잎), n-1 이 꼭대기(어리고 작은 잎)
  function leaves(deg, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const L = 0.95 - 0.45 * (n > 1 ? i / (n - 1) : 0);
      const a = i * deg * Math.PI / 180;
      const d = 0.1 + L / 2;
      out.push({ i, a, L, cx: d * Math.cos(a), cy: d * Math.sin(a), ra: L / 2, rb: L * 0.21 });
    }
    return out;
  }
  const inside = (lf, x, y) => {
    const dx = x - lf.cx, dy = y - lf.cy;
    const u = dx * Math.cos(lf.a) + dy * Math.sin(lf.a), v = -dx * Math.sin(lf.a) + dy * Math.cos(lf.a);
    return (u / lf.ra) ** 2 + (v / lf.rb) ** 2 <= 1;
  };
  // 아래 잎 면적 중 위 잎에 가려진 비율 (격자 표본)
  function shaded(deg, n, res) {
    const lv = leaves(deg, n);
    let covered = 0, total = 0;
    for (let gy = 0; gy < res; gy++) for (let gx = 0; gx < res; gx++) {
      const x = -1 + 2 * (gx + .5) / res, y = -1 + 2 * (gy + .5) / res;
      let k = 0;
      for (const lf of lv) if (inside(lf, x, y)) k++;
      total += k; if (k > 1) covered += k - 1;
    }
    return total ? covered / total : 0;
  }
  function minGap(deg, n) {
    const a = []; for (let i = 0; i < n; i++) a.push((i * deg) % 360);
    a.sort((p, q) => p - q);
    let m = 360 - a[a.length - 1] + a[0];
    for (let i = 1; i < a.length; i++) m = Math.min(m, a[i] - a[i - 1]);
    return m;
  }
  function repeatAt(deg, n) { // 처음으로 1번 잎과 거의 같은 방향(±4°)에 나는 잎
    for (let k = 1; k < Math.max(n, 40); k++) { const r = (k * deg) % 360; if (r < 4 || r > 356) return k + 1; }
    return null;
  }

  const T = fit(cvTop, () => drawTop());
  const P = fit(cvPlot, () => drawPlot());
  let curve = null, curveN = 0;

  function drawTop() {
    const { ctx, size: { w, h } } = T; if (!w) return;
    const deg = +sA.value, n = +sN.value, s = Math.min(w, h) / 2 - 8, cx = w / 2, cy = h / 2;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = C.rule; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, s, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    const lv = leaves(deg, n);
    for (const lf of lv) {
      ctx.save(); ctx.translate(cx + lf.cx * s, cy + lf.cy * s); ctx.rotate(lf.a);
      ctx.beginPath(); ctx.ellipse(0, 0, lf.ra * s, lf.rb * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(59,124,42,.30)"; ctx.fill();
      ctx.strokeStyle = "rgba(35,35,38,.55)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-lf.ra * s * .9, 0); ctx.lineTo(lf.ra * s * .9, 0); ctx.strokeStyle = "rgba(35,35,38,.25)"; ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fillStyle = "#6b5a45"; ctx.fill();
    // 번호: 잎 끝에
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    if (n <= 16) for (const lf of lv) {
      const d = (0.1 + lf.L + 0.05) * s;
      ctx.fillText(lf.i + 1, cx + d * Math.cos(lf.a), cy + d * Math.sin(lf.a) + 3);
    }
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText("위에서 본 줄기 · 숫자는 난 순서", 6, h - 6);
  }

  function computeCurve(n) {
    const pts = [];
    for (let d = 90; d <= 180; d += 1) pts.push([d, shaded(d, n, 44)]);
    pts.push([GOLD, shaded(GOLD, n, 44)]);
    pts.sort((a, b) => a[0] - b[0]);
    curve = pts; curveN = n;
  }

  function drawPlot() {
    const { ctx, size: { w, h } } = P; if (!w) return;
    const n = +sN.value, deg = +sA.value;
    if (curveN !== n) computeCurve(n);
    const padL = 34, padR = 8, padT = 22, padB = 34;
    const pw = w - padL - padR, ph = h - padT - padB;
    const ymax = Math.max(0.5, ...curve.map((p) => p[1])) * 1.05;
    const X = (d) => padL + (d - 90) / 90 * pw, Y = (v) => padT + (1 - v / ymax) * ph;
    ctx.clearRect(0, 0, w, h);
    const yt = []; for (let v = 0; v <= ymax; v += 0.2) yt.push([v, `${Math.round(v * 100)}%`]);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[90, "90°"], [120, "120"], [144, "144"], [180, "180°"]], yt, ylabel: `가려진 면적 (잎 ${n}장)`, xlabel: "돌아 나는 각도" });
    ctx.beginPath(); curve.forEach(([d, v], i) => i ? ctx.lineTo(X(d), Y(v)) : ctx.moveTo(X(d), Y(v)));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.forest;
    ctx.beginPath(); ctx.moveTo(X(GOLD), padT); ctx.lineTo(X(GOLD), padT + ph); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.forest; ctx.fillText("137.5°", X(GOLD) + 4, padT + 12);
    const v = shaded(deg, n, 44);
    ctx.beginPath(); ctx.arc(X(deg), Y(v), 5, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
  }

  function update() {
    const deg = +sA.value, n = +sN.value;
    oA.textContent = deg.toFixed(1); oN.textContent = n;
    const sh = shaded(deg, n, 110);
    nShade.textContent = `${Math.round(sh * 100)}%`;
    const g = minGap(deg, n);
    nGap.textContent = `${g.toFixed(1)}°`;
    nGap.classList.toggle("bad", g < 5);
    const r = repeatAt(deg, n);
    nRep.textContent = r ? `${r}번째 잎` : "40장 안에 없음";
    drawTop(); drawPlot();
  }
  sA.addEventListener("input", update);
  sN.addEventListener("input", update);
  root.querySelectorAll("[data-ang]").forEach((b) => b.addEventListener("click", () => {
    sA.value = b.dataset.ang === "gold" ? GOLD : b.dataset.ang; update();
  }));
  update();
})();
