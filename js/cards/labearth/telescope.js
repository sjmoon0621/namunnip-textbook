/* 카드: 망원경의 성능을 정하는 것은 배율일까, 구경일까? — 분해능 측정, 배율·실시야·센서 FOV·화소 척도 */
(() => {
  const root = document.getElementById("card-labearth-telescope");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const LAM = 550e-9, RAD = 206265, PIX = 3.75, SW = 1280, SH = 960, JUP = 142984, AU = 1.495978707e8;
  const sD = $(".dia"), sF = $(".foc"), sS = $(".see"), sSep = $(".sep"), sJ = $(".jd");
  let tgt = "dbl", fe = 25;

  /* 1차 베셀 함수 J1 (Numerical Recipes 근사) */
  function J1(x) {
    const ax = Math.abs(x);
    if (ax < 8) {
      const y = x * x;
      const a = x * (72362614232.0 + y * (-7895059235.0 + y * (242396853.1 + y * (-2972611.439 + y * (15704.48260 + y * (-30.16036606))))));
      const b = 144725228442.0 + y * (2300535178.0 + y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y))));
      return a / b;
    }
    const z = 8 / ax, y = z * z, xx = ax - 2.356194491;
    const p = 1 + y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * (-0.240337019e-6))));
    const q = 0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));
    const r = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * p - z * Math.sin(xx) * q);
    return x < 0 ? -r : r;
  }
  const airy = (th, D) => { const x = Math.PI * D * 1e-3 * th / RAD / LAM; return x < 1e-6 ? 1 : (2 * J1(x) / x) ** 2; };
  /* 에어리 무늬 ⊗ 시상 가우스의 반지름 방향 분포 (각초 단위), 표로 만들어 둔다 */
  function psfTable(D, see) {
    const sig = see / 2.355, rmax = 6 * Math.max(sig, 1.22 * LAM / (D * 1e-3) * RAD) + 1, n = 240, dr = rmax / n, tab = new Float32Array(n + 1);
    const K = 9, us = [];
    for (let i = -K; i <= K; i++) for (let j = -K; j <= K; j++) { const ux = i / K * 3 * sig, uy = j / K * 3 * sig, wgt = Math.exp(-(ux * ux + uy * uy) / (2 * sig * sig)); us.push([ux, uy, wgt]); }
    const ws = us.reduce((s, u) => s + u[2], 0);
    for (let k = 0; k <= n; k++) { const r = k * dr; let s = 0; for (const [ux, uy, wgt] of us) s += wgt * airy(Math.hypot(r - ux, uy), D); tab[k] = s / ws; }
    return (r) => { const k = r / dr; if (k >= n) return 0; const i = Math.floor(k), t = k - i; return tab[i] * (1 - t) + tab[i + 1] * t; };
  }
  const st = () => {
    const D = +sD.value, f = +sF.value, see = +sS.value;
    return { D, f, see, ps: 206.265 * PIX / f, theta: 1.22 * LAM / (D * 1e-3) * RAD, jd: RAD * JUP / (+sJ.value * AU), sep: +sSep.value };
  };

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "D", label: "D (mm)", res: 1 }, { key: "see", label: "시상 (″)", res: 0.1 }, { key: "f", label: "f (mm)", res: 1 },
    { key: "inv", label: "1/D (1/mm)", res: 0.0001 }, { key: "th", label: "θmin (″)", res: 0.01 },
  ], () => drawPlot());

  /* 센서 영상 N×N 화소 (가운데 부분) */
  let N = 96, img = null;
  const off = document.createElement("canvas"), octx = off.getContext("2d");
  let cacheKey = "", psf = null;
  function render() {
    const s = st(), key = `${s.D}|${s.see}`;
    if (key !== cacheKey) { psf = psfTable(s.D, s.see); cacheKey = key; }
    const span = tgt === "dbl" ? Math.max(6 * s.sep, 7 * s.theta, 5 * s.see) : 1.5 * s.jd;   // 확대 영역의 폭 (각초)
    N = Math.max(12, Math.min(150, Math.round(span / s.ps)));
    if (off.width !== N) { off.width = off.height = N; img = null; }
    if (!img) img = octx.createImageData(N, N);
    const buf = new Float32Array(N * N), c = N / 2;
    if (tgt === "dbl") {
      const stars = [[-s.sep / 2, 0], [s.sep / 2, 0]];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const ax = (x + 0.5 - c) * s.ps, ay = (y + 0.5 - c) * s.ps; let v = 0;
        for (const [sx, sy] of stars) v += psf(Math.hypot(ax - sx, ay - sy));
        buf[y * N + x] = v;
      }
    } else {
      // 목성 원반 (모식 줄무늬, 주변 감광) → 화소당 3×3 표본 → PSF로 흐리기
      const R = s.jd / 2, scene = new Float32Array(N * N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        let v = 0;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
          const ax = (x + (i + 0.5) / 3 - c) * s.ps, ay = (y + (j + 0.5) / 3 - c) * s.ps / 0.935;   // 극 방향 납작함 6.5%
          const r = Math.hypot(ax, ay) / R; if (r >= 1) continue;
          const lat = ay / R, band = 0.82 + 0.18 * Math.cos(lat * 9.5) - (Math.abs(lat - 0.27) < 0.07 || Math.abs(lat + 0.22) < 0.08 ? 0.28 : 0);
          v += band * (0.45 + 0.55 * Math.sqrt(1 - r * r));
        }
        scene[y * N + x] = v / 9;
      }
      const kr = Math.min(14, Math.ceil(Math.max(s.see, s.theta) * 2.2 / s.ps) + 1), ker = [];
      let ks = 0;
      for (let j = -kr; j <= kr; j++) for (let i = -kr; i <= kr; i++) { const v = psf(Math.hypot(i, j) * s.ps); ker.push([i, j, v]); ks += v; }
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        let v = 0;
        for (const [i, j, k] of ker) { const xx = x + i, yy = y + j; if (xx >= 0 && yy >= 0 && xx < N && yy < N) v += scene[yy * N + xx] * k; }
        buf[y * N + x] = v / ks;
      }
    }
    let mx = 0; for (const v of buf) mx = Math.max(mx, v);
    for (let i = 0; i < N * N; i++) {
      const v = Math.pow(buf[i] / (mx || 1), tgt === "dbl" ? 0.6 : 0.9) * 255;
      img.data[i * 4] = Math.min(255, v * (tgt === "jup" ? 1.0 : 0.95)); img.data[i * 4 + 1] = Math.min(255, v * (tgt === "jup" ? 0.9 : 0.97)); img.data[i * 4 + 2] = Math.min(255, v * (tgt === "jup" ? 0.75 : 1)); img.data[i * 4 + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = st(), S = Math.min(h - 40, w * 0.5), x0 = 12, y0 = 20;
    render();
    ctx.imageSmoothingEnabled = false; ctx.drawImage(off, x0, y0, S, S);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y0 + 0.5, S, S);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`센서 영상 확대 (${N}×${N} 화소, ${(N * s.ps / 60).toFixed(2)}′ 폭)`, x0, 13);
    // 오른쪽: 센서 전체 시야와 보름달
    const fw = SW * s.ps / 60, fh = SH * s.ps / 60;   // 각분
    const bx = x0 + S + 24, bw = w - bx - 12, bh = h - 56, sc = Math.min(bw / Math.max(fw, 34), bh / Math.max(fh, 34));
    const cx = bx + bw / 2, cy = 26 + bh / 2;
    ctx.fillStyle = C.night; ctx.fillRect(cx - fw * sc / 2, cy - fh * sc / 2, fw * sc, fh * sc);
    ctx.strokeStyle = "rgba(224,160,42,0.9)"; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(cx, cy, 15.5 * sc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    const cw = N * s.ps / 60 * sc; ctx.strokeStyle = C.apple; ctx.lineWidth = 1.2; ctx.strokeRect(cx - cw / 2, cy - cw / 2, Math.max(cw, 2), Math.max(cw, 2));
    ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText(`센서 시야 ${fw.toFixed(1)}′ × ${fh.toFixed(1)}′`, cx, 18);
    ctx.fillStyle = C.amber; ctx.fillText("점선 원: 보름달 (31′)", cx, h - 22);
    ctx.fillStyle = C.apple; ctx.fillText("빨간 사각형: 왼쪽 확대 영역", cx, h - 8);
  }

  function nums() {
    const s = st(), mag = s.f / fe, tf = 52 / mag;
    $(".n-mag").textContent = mag.toFixed(0) + "배";
    $(".n-tf").textContent = tf >= 1 ? tf.toFixed(2) + "°" : (tf * 60).toFixed(1) + "′";
    $(".n-res").textContent = s.theta.toFixed(2) + "″";
    $(".n-lg").textContent = ((s.D / 7) ** 2).toFixed(0) + "배";
    $(".n-lim").textContent = (7.5 + 5 * Math.log10(s.D / 10)).toFixed(1) + "등급";
    $(".n-ps").textContent = s.ps.toFixed(2) + "″/화소";
    $(".n-fov").textContent = `${(SW * s.ps / 60).toFixed(1)}′×${(SH * s.ps / 60).toFixed(1)}′`;
    if (tgt === "dbl") { $(".k-obj").textContent = "두 별 사이 (화소)"; $(".n-obj").textContent = (s.sep / s.ps).toFixed(1) + " 화소"; }
    else { $(".k-obj").textContent = "목성 지름 (″ · 화소)"; $(".n-obj").textContent = `${s.jd.toFixed(1)}″ · ${(s.jd / s.ps).toFixed(0)}`; }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: r.inv, y: r.th }));
    const good = tbl.rows.filter((r) => r.see <= 0.6);
    const f = good.length > 1 ? L.linfit(good.map((r) => r.inv), good.map((r) => r.th), true) : null;
    const box = { x0: 44, y0: 22, w: w - 58, h: h - 56 };
    L.plot(ctx, box, { pts, fit: f, xr: [0, 0.021], yr: [0, 4.5], xlabel: "1/D (1/mm)", ylabel: "분해 한계 θmin (″)", model: (x) => 1.22 * LAM * 1e3 * RAD * x });
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillStyle = C.ink3; ctx.fillText("점선: 1.22λ/D (λ = 550 nm)", box.x0 + 6, box.y0 + 14);
    if (f) {
      ctx.fillStyle = C.warn;
      ctx.fillText(`시상 ≤ 0.6″ 자료 맞춤: 기울기 ${f.a.toFixed(0)}″·mm`, box.x0 + 6, box.y0 + 29);
      ctx.fillText(`→ λ = 기울기 / (1.22 × 206265) = ${(f.a / (1.22 * RAD) * 1e6).toFixed(0)} nm`, box.x0 + 6, box.y0 + 44);
    }
  }

  function measure() {
    const s = st();
    const truth = Math.max(Math.hypot(s.theta, 0.85 * s.see), 2 * s.ps);   // 회절 + 시상 (모식), 화소 2개 이상 필요
    tbl.add({ D: s.D, see: s.see, f: s.f, inv: 1 / s.D, th: L.measure(truth, { rel: 0.07, res: 0.01 }) });
  }
  const upd = () => {
    $(".d-out").textContent = sD.value; $(".f-out").textContent = sF.value; $(".s-out").textContent = (+sS.value).toFixed(1);
    $(".sep-out").textContent = (+sSep.value).toFixed(1); $(".j-out").textContent = (+sJ.value).toFixed(2);
    nums(); draw();
  };
  [sD, sF, sS, sSep, sJ].forEach((el) => el.addEventListener("input", upd));
  $(".tgt").addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    tgt = b.dataset.t; root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".g-dbl").hidden = tgt !== "dbl"; $(".g-jup").hidden = tgt !== "jup"; $(".meas").disabled = tgt !== "dbl"; upd();
  });
  $(".eye").addEventListener("click", (e) => {
    const b = e.target.closest("[data-e]"); if (!b) return;
    fe = +b.dataset.e; root.querySelectorAll("[data-e]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); nums();
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => tbl.clear());
  upd();
  if (L.demo) {
    const keep = [sD.value, sS.value, sF.value];
    sF.value = 3000;
    [[0.4, [60, 80, 100, 150, 200, 300]], [2.0, [60, 100, 200, 300]]].forEach(([see, Ds]) => Ds.forEach((d) => { sS.value = see; sD.value = d; measure(); }));
    [sD.value, sS.value, sF.value] = keep; upd();
  }
})();
