/* 카드: 은하 사진 수천 장을 인공지능은 어떻게 분류할까? — 합성 은하 그림, 이름표 붙이기, 특징 추출, k-최근접 이웃 분류, 혼동 행렬 */
(() => {
  const root = document.getElementById("card-earth-galaxy-ai");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const N = 32, CEN = 15.5, NT = 24, NTEST = 80;
  const CLS = [["E", "타원", "#d08a2a"], ["S", "나선", "#3b7c2a"], ["SB", "막대 나선", "#3a62b0"], ["Irr", "불규칙", "#a0479a"]];
  const FEAT = [["타원율", 0, 0.85], ["중심 집중도", 0, 0.45], ["비대칭도", 0, 0.6], ["나선팔 세기", 0.05, 0.65]];

  /* 씨앗이 같으면 같은 은하가 나오는 난수 */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(R) { let u = 0; while (!u) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R()); }

  /* 은하 한 장 (32×32, 밝기 0~1 + 잡음). 0 타원(E0~E7), 1 나선, 2 막대 나선, 3 불규칙 */
  function make(cls, R) {
    const img = new Float32Array(N * N), pa = R() * Math.PI, ca = Math.cos(pa), sa = Math.sin(pa);
    const scale = 0.8 + R() * 0.45;
    let q = 1, sub = "";
    if (cls === 0) { const n = Math.floor(R() * 8); q = 1 - n / 10; sub = "E" + n; }
    else q = 0.45 + R() * 0.55;
    const re = (3 + R() * 2) * scale, h = (3.2 + R() * 1.6) * scale;
    const bulge = 0.15 + R() * 0.45, armA = 0.55 + R() * 0.4, pitch = 0.25 + R() * 0.35, ph = R() * 6.28, barL = (1.6 + R() * 0.8) * h;
    const clumps = [];
    if (cls === 3) { const k = 3 + Math.floor(R() * 4); for (let i = 0; i < k; i++) clumps.push([CEN + gauss(R) * 4.5, CEN + gauss(R) * 4.5, 1 + R() * 2.2, 0.3 + R() * 0.7]); }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dx = x - CEN, dy = y - CEN, u = dx * ca + dy * sa, v = (-dx * sa + dy * ca) / q;
      const r = Math.hypot(u, v) + 1e-6, th = Math.atan2(v, u);
      let I = 0;
      if (cls === 0) I = Math.exp(-7.67 * (Math.pow(Math.hypot(r, 1.5) / re, 0.25) - 1));
      else if (cls === 3) {
        I = 0.12 * Math.exp(-r / (5 * scale));
        clumps.forEach(([cx, cy, s, a]) => { I += a * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * s * s)); });
      } else {
        I += bulge * Math.exp(-(u * u + v * v * q * q) / (2 * (1.1 * scale) ** 2));
        let arm = 1 + armA * Math.cos(2 * (th - Math.log(r + 1) / pitch - ph));
        if (cls === 2) {
          arm = r < barL ? 0.6 : 1 + armA * Math.cos(2 * (th - Math.log(r - barL + 1) / pitch - ph));
          I += 0.45 * Math.exp(-(u * u) / (2 * barL * barL * 0.35) - (v * v) / (2 * (0.9 * scale) ** 2));
        }
        I += 0.5 * Math.exp(-r / h) * Math.max(0, arm);
      }
      img[y * N + x] = I;
    }
    let mx = 0; for (const v of img) mx = Math.max(mx, v);
    for (let i = 0; i < img.length; i++) img[i] = img[i] / mx + gauss(R) * 0.035;
    return { cls, sub, img, f: feats(img), cv: null };
  }

  /* 특징 4개를 그림의 화소에서 직접 계산한다 */
  function feats(img) {
    const thr = 0.12;
    let s = 0, sx = 0, sy = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = img[y * N + x]; if (v > thr) { s += v; sx += v * x; sy += v * y; } }
    const cx = sx / s, cy = sy / s;
    let xx = 0, yy = 0, xy = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = img[y * N + x]; if (v > thr) { xx += v * (x - cx) ** 2; yy += v * (y - cy) ** 2; xy += v * (x - cx) * (y - cy); } }
    xx /= s; yy /= s; xy /= s;
    const d = Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy), l1 = (xx + yy) / 2 + d, l2 = (xx + yy) / 2 - d;
    const ell = 1 - Math.sqrt(Math.max(l2, 0) / l1);   /* 밝기 분포의 긴 축·짧은 축 비 */
    let fin = 0, fout = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = Math.max(0, img[y * N + x]), r = Math.hypot(x - CEN, y - CEN); if (r < 2.5) fin += v; if (r < 11) fout += v; }
    const bl = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let t = 0, n = 0; for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const X = x + i, Y = y + j; if (X < 0 || Y < 0 || X >= N || Y >= N) continue; t += img[Y * N + X]; n++; } bl[y * N + x] = t / n; }
    let ad = 0, at = 0, sd = 0, st = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const k = y * N + x; if (bl[k] < 0.1) continue;
      ad += Math.abs(img[k] - img[(N - 1 - y) * N + (N - 1 - x)]); at += Math.abs(img[k]);   /* 180° 돌린 그림과의 차 */
      if (Math.hypot(x - CEN, y - CEN) >= 2.5) { sd += Math.abs(img[k] - bl[k]); st += bl[k]; }   /* 흐리게 한 그림과의 차 = 줄무늬 구조 */
    }
    return [ell, fin / fout, ad / (2 * at), sd / st];
  }
  function toCanvas(g) {
    if (g.cv) return g.cv;
    const cv = document.createElement("canvas"); cv.width = N; cv.height = N;
    const c = cv.getContext("2d"), id = c.createImageData(N, N);
    for (let i = 0; i < N * N; i++) { const v = Math.sqrt(Math.min(1, Math.max(0, g.img[i]))); id.data[i * 4] = 18 + v * 237; id.data[i * 4 + 1] = 20 + v * 222; id.data[i * 4 + 2] = 34 + v * 190; id.data[i * 4 + 3] = 255; }
    c.putImageData(id, 0, 0); g.cv = cv; return cv;
  }

  let seed = 11, train = [], test = [], lab = [], selI = 0, fx = 1, fy = 3, K = 3, result = null;
  function newBatch() {
    const R = rng(seed), R2 = rng(seed + 1000);
    const order = Array.from({ length: NT }, (_, i) => i % 4);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    train = order.map((c) => make(c, R));
    test = Array.from({ length: NTEST }, (_, i) => make(i % 4, R2));
    lab = new Array(NT).fill(-1); selI = 0;
  }
  /* k-최근접 이웃: 고른 두 특징을 학습 자료의 평균·표준편차로 맞춘 뒤 가까운 k개의 다수결(가까울수록 큰 표) */
  function model() {
    const pts = train.map((g, i) => ({ f: g.f, c: lab[i] })).filter((p) => p.c >= 0);
    if (!pts.length) return null;
    const st = [fx, fy].map((j) => { const m = pts.reduce((s, p) => s + p.f[j], 0) / pts.length; const sd = Math.sqrt(pts.reduce((s, p) => s + (p.f[j] - m) ** 2, 0) / pts.length); return [m, sd > 1e-4 ? sd : (FEAT[j][2] - FEAT[j][1]) / 4]; });
    const pred = (a, b) => {
      const za = (a - st[0][0]) / st[0][1], zb = (b - st[1][0]) / st[1][1];
      const d = pts.map((p) => [((p.f[fx] - st[0][0]) / st[0][1] - za) ** 2 + ((p.f[fy] - st[1][0]) / st[1][1] - zb) ** 2, p.c]).sort((u, v) => u[0] - v[0]).slice(0, K);
      const vote = [0, 0, 0, 0]; d.forEach(([dd, c]) => { vote[c] += 1 / (Math.sqrt(dd) + 0.05); });
      return vote.indexOf(Math.max(...vote));
    };
    return { pred, n: pts.length, classes: new Set(pts.map((p) => p.c)).size };
  }
  function evaluate() {
    const m = model();
    if (!m) { result = null; return; }
    const cm = [0, 1, 2, 3].map(() => [0, 0, 0, 0]);
    test.forEach((g) => { cm[g.cls][m.pred(g.f[fx], g.f[fy])]++; });
    const ok = cm.reduce((s, r, i) => s + r[i], 0);
    result = { m, cm, acc: ok / test.length };
  }

  const top = fit($(".gx-main"), () => drawTop()), bot = fit($(".gx-plot"), () => drawBot());
  let grid = null;
  function drawTop() {
    const { ctx } = top, { w, h } = top.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gw = w * 0.62, cell = Math.min(gw / 6, (h - 22) / 4), pad = 3;
    grid = { cell, x0: 0, y0: 20 };
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`학습용 은하 ${NT}장 · 눌러서 고르기`, 0, 12);
    ctx.imageSmoothingEnabled = true;
    train.forEach((g, i) => {
      const x = (i % 6) * cell, y = 20 + Math.floor(i / 6) * cell;
      ctx.drawImage(toCanvas(g), x + pad, y + pad, cell - 2 * pad, cell - 2 * pad);
      if (lab[i] >= 0) {
        ctx.strokeStyle = CLS[lab[i]][2]; ctx.lineWidth = 3; ctx.strokeRect(x + pad + 1.5, y + pad + 1.5, cell - 2 * pad - 3, cell - 2 * pad - 3);
        ctx.fillStyle = CLS[lab[i]][2]; ctx.font = `600 10px ${F.mono}`; const t = CLS[lab[i]][0], tw = ctx.measureText(t).width + 6;
        ctx.fillRect(x + pad, y + pad, tw, 13); ctx.fillStyle = "#fff"; ctx.fillText(t, x + pad + 3, y + pad + 10);
      }
      if (i === selI) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2); }
    });
    /* 오른쪽: 고른 은하 확대와 특징값 */
    const g = train[selI], px = gw + 16, pw = w - px - 4, sz = Math.min(pw, h * 0.5);
    ctx.drawImage(toCanvas(g), px, 20, sz, sz);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(px + .5, 20.5, sz - 1, sz - 1);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.fillText(`${selI + 1}번 은하`, px, 12);
    ctx.font = `10.5px ${F.mono}`;
    FEAT.forEach(([n, a, b], j) => {
      const y = 20 + sz + 16 + j * 17, bw = pw - 4, v = Math.min(1, Math.max(0, (g.f[j] - a) / (b - a)));
      ctx.fillStyle = (j === fx || j === fy) ? C.ink : C.ink3; ctx.textAlign = "left"; ctx.fillText(n, px, y);
      ctx.textAlign = "right"; ctx.fillText(g.f[j].toFixed(2), px + bw, y);
      ctx.fillStyle = C.rule; ctx.fillRect(px, y + 3, bw, 3); ctx.fillStyle = (j === fx || j === fy) ? C.forest : C.ink3; ctx.fillRect(px, y + 3, bw * v, 3);
    });
  }
  function drawBot() {
    const { ctx } = bot, { w, h } = bot.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 22, w: w * 0.6 - 48, h: h - 60 };
    const [nx, ax, bx] = FEAT[fx], [ny, ay, by] = FEAT[fy];
    const X = (v) => box.x0 + (v - ax) / (bx - ax) * box.w, Y = (v) => box.y0 + box.h - (v - ay) / (by - ay) * box.h;
    const m = result && result.m;
    if (m) {
      const step = 5;
      ctx.globalAlpha = 0.18;
      for (let px = 0; px < box.w; px += step) for (let py = 0; py < box.h; py += step) {
        const a = ax + (px + step / 2) / box.w * (bx - ax), b = by - (py + step / 2) / box.h * (by - ay);
        ctx.fillStyle = CLS[m.pred(a, b)][2]; ctx.fillRect(box.x0 + px, box.y0 + py, step, step);
      }
      ctx.globalAlpha = 1;
    }
    const tk = (a, b) => [0, 1, 2, 3, 4].map((i) => a + (b - a) * i / 4).map((v) => [v, v.toFixed(2)]);
    axes(ctx, { ...box, X, Y, xt: tk(ax, bx), yt: tk(ay, by), xlabel: nx, ylabel: ny });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    if ($(".show-test").checked) test.forEach((g) => { ctx.strokeStyle = CLS[g.cls][2]; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X(g.f[fx]), Y(g.f[fy]), 2.6, 0, Math.PI * 2); ctx.stroke(); });
    train.forEach((g, i) => {
      if (lab[i] < 0) return;
      const x = X(g.f[fx]), y = Y(g.f[fy]);
      ctx.fillStyle = CLS[lab[i]][2]; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (lab[i] !== g.cls) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke(); }
      if (i === selI) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.stroke(); }
    });
    ctx.restore();
    if (!m) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("이름표를 붙이면 경계가 생깁니다", box.x0 + box.w / 2, box.y0 + box.h / 2); }
    /* 혼동 행렬 */
    const mx0 = w * 0.6 + 34, cs = Math.min((w - mx0 - 8) / 4, (h - 70) / 4), my0 = 40;
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("시험 은하 80장", mx0 - 30, 14);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("예측 →", mx0, my0 - 16);
    ctx.save(); ctx.translate(mx0 - 26, my0 + cs * 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("정답 →", 0, 0); ctx.restore();
    ctx.font = `600 10px ${F.mono}`;
    CLS.forEach(([t, , c], i) => {
      ctx.fillStyle = c; ctx.textAlign = "center"; ctx.fillText(t, mx0 + cs * (i + 0.5), my0 - 4);
      ctx.textAlign = "right"; ctx.fillText(t, mx0 - 4, my0 + cs * (i + 0.5) + 4);
    });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const n = result ? result.cm[i][j] : 0, x = mx0 + j * cs, y = my0 + i * cs, a = n / 20;
      ctx.fillStyle = i === j ? `rgba(59,124,42,${0.08 + a * 0.8})` : `rgba(181,83,47,${n ? 0.08 + a * 0.8 : 0.03})`;
      ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
      ctx.fillStyle = a > 0.55 ? "#fff" : C.ink; ctx.textAlign = "center"; ctx.font = `11px ${F.mono}`;
      ctx.fillText(result ? String(n) : "·", x + cs / 2, y + cs / 2 + 4);
    }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("대각선 = 맞힘", mx0, my0 + cs * 4 + 14);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText("● 학습 자료(이름표 색)  ✕ 틀린 이름표" + ($(".show-test").checked ? "  ○ 시험 자료(정답 색)" : ""), box.x0 - 30, h - 4);
  }
  function update() {
    evaluate();
    const nl = lab.filter((c) => c >= 0).length, wrong = lab.filter((c, i) => c >= 0 && c !== train[i].cls).length;
    $(".n-lab").textContent = `${nl} / ${NT}`;
    $(".n-wrong").textContent = String(wrong);
    $(".n-wrong").className = "n-wrong" + (wrong ? " bad" : "");
    $(".n-acc").textContent = result ? `${Math.round(result.acc * 100)}%` : "—";
    let worst = "—";
    if (result) { let b = 0; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i !== j && result.cm[i][j] + result.cm[j][i] > b) { b = result.cm[i][j] + result.cm[j][i]; worst = `${CLS[i][0]} ↔ ${CLS[j][0]}`; } }
    $(".n-conf").textContent = worst;
    const v = $(".verdict");
    let t = "", cls = "";
    if (!result) t = "은하를 하나 고르고 아래 이름표 단추를 눌러 분류해 보세요. 이름표가 붙은 은하가 학습 자료가 됩니다.";
    else if (result.m.classes < 4) { t = `아직 ${result.m.classes}종류만 배웠습니다. 배우지 않은 종류는 절대 맞힐 수 없어서 정확도에 한계가 있습니다.`; cls = "bad"; }
    else if (wrong / nl > 0.2) { t = "틀린 이름표가 많습니다. 분류기는 이름표를 그대로 믿으므로 경계가 엉뚱하게 그어지고 시험 정확도가 떨어집니다."; cls = "bad"; }
    else if (nl < 8) { t = "종류마다 한두 장뿐입니다. 자료가 적으면 경계가 우연히 놓인 점 몇 개에 크게 흔들립니다."; cls = "bad"; }
    else if (result.acc >= 0.7) { t = `시험 은하의 ${Math.round(result.acc * 100)}%를 맞혔습니다. 그래도 혼동 행렬에서 어느 칸이 비지 않았는지 보세요.`; cls = "good"; }
    else t = "자료는 충분한데 정확도가 낮다면 특징 두 개가 종류를 잘 가르지 못하는 것입니다. 다른 특징 쌍을 골라 보세요.";
    v.textContent = t; v.className = "verdict small " + cls;
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.k === K)));
    drawTop(); drawBot();
  }
  const sx = $(".fx"), sy = $(".fy");
  [sx, sy].forEach((s) => { s.innerHTML = FEAT.map(([n], j) => `<option value="${j}">${n}</option>`).join(""); });
  sx.value = fx; sy.value = fy;
  sx.addEventListener("change", () => { fx = +sx.value; if (fx === fy) { fy = (fx + 1) % 4; sy.value = fy; } update(); });
  sy.addEventListener("change", () => { fy = +sy.value; if (fx === fy) { fx = (fy + 1) % 4; sx.value = fx; } update(); });
  $(".show-test").addEventListener("change", () => drawBot());
  $(".gx-main").addEventListener("click", (e) => {
    if (!grid) return;
    const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top - grid.y0;
    const i = Math.floor(y / grid.cell) * 6 + Math.floor(x / grid.cell);
    if (x >= 0 && x < grid.cell * 6 && y >= 0 && i < NT) { selI = i; drawTop(); drawBot(); }
  });
  const R0 = rng(99);
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lab]"), k = e.target.closest("[data-k]"), a = e.target.closest("[data-act]");
    if (b) {
      lab[selI] = +b.dataset.lab;
      if (lab[selI] >= 0) { const nx = lab.findIndex((c, i) => c < 0 && i > selI); if (nx >= 0) selI = nx; }
      update();
    }
    if (k) { K = +k.dataset.k; update(); }
    if (a) {
      const act = a.dataset.act;
      if (act === "auto") lab = lab.map((c, i) => (c >= 0 ? c : train[i].cls));
      if (act === "noise") { const idx = lab.map((c, i) => i).filter((i) => lab[i] >= 0 && lab[i] === train[i].cls); for (let t = 0; t < Math.ceil(idx.length / 3); t++) { const j = idx.splice(Math.floor(R0() * idx.length), 1)[0]; lab[j] = (train[j].cls + 1 + Math.floor(R0() * 3)) % 4; } }
      if (act === "fix") lab = lab.map((c, i) => (c >= 0 ? train[i].cls : c));
      if (act === "clear") lab.fill(-1);
      if (act === "new") { seed += 7; newBatch(); }
      update();
    }
  });
  newBatch(); update();
  if (/[?&]demo\b/.test(location.search)) { lab = train.map((g) => g.cls); lab[2] = (train[2].cls + 1) % 4; selI = 2; $(".show-test").checked = true; update(); }
})();
