/* 카드: 파동 함수의 그래프에서 무엇을 읽을 수 있을까? — 수소 원자 ψ의 단면, R(r), r²R² */
(() => {
  const root = document.getElementById("card-adchem-wavefn");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r"), oR = $(".r-out");
  let n = 3, l = 0;

  /* 수소 지름 함수 (r: a₀ 단위, 정규화 전) */
  const RF = {
    "10": (r) => Math.exp(-r),
    "20": (r) => (2 - r) * Math.exp(-r / 2),
    "21": (r) => r * Math.exp(-r / 2),
    "30": (r) => (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3),
    "31": (r) => r * (6 - r) * Math.exp(-r / 3),
    "32": (r) => r * r * Math.exp(-r / 3),
    "40": (r) => (192 - 144 * r + 24 * r * r - r * r * r) * Math.exp(-r / 4),
    "41": (r) => r * (80 - 20 * r + r * r) * Math.exp(-r / 4),
    "42": (r) => r * r * (12 - r) * Math.exp(-r / 4),
    "43": (r) => r * r * r * Math.exp(-r / 4),
  };
  const ANG = [() => 1, (c) => c, (c) => 3 * c * c - 1, (c) => 5 * c * c * c - 3 * c];
  const VIEW = { 1: 6, 2: 16, 3: 28, 4: 44 };
  const norm = {};
  for (const k in RF) {
    let s = 0; const dr = 0.005;
    for (let r = dr / 2; r < 120; r += dr) { const v = RF[k](r); s += r * r * v * v * dr; }
    norm[k] = 1 / Math.sqrt(s);
  }
  const R = (r) => RF[`${n}${l}`](r) * norm[`${n}${l}`];
  const P = (r) => { const v = R(r); return r * r * v * v; };
  const cum = (rc) => { let s = 0; const N = 800, dr = rc / N; for (let i = 0; i < N; i++) s += P((i + 0.5) * dr) * dr; return s; };
  const nodes = () => {
    const out = [], V = VIEW[n] * 1.5; let prev = R(1e-4);
    for (let i = 1; i <= 3000; i++) { const r = i / 3000 * V, v = R(r); if (v * prev < 0) out.push(r); if (v !== 0) prev = v; }
    return out;
  };

  /* 단면 그림 (오프스크린) */
  const NPX = 150, off = document.createElement("canvas"); off.width = NPX; off.height = NPX;
  const octx = off.getContext("2d");
  function makeMap() {
    const V = VIEW[n] * 0.65, img = octx.createImageData(NPX, NPX), vals = new Float32Array(NPX * NPX);
    let mx = 0;
    for (let j = 0; j < NPX; j++) for (let i = 0; i < NPX; i++) {
      const x = ((i + 0.5) / NPX * 2 - 1) * V, z = (1 - (j + 0.5) / NPX * 2) * V, r = Math.hypot(x, z) + 1e-9;
      const v = R(r) * ANG[l](z / r); vals[j * NPX + i] = v; mx = Math.max(mx, Math.abs(v));
    }
    /* 핵 근처 s 오비탈의 뾰족한 값이 색을 독차지하지 않도록 99.5 백분위로 맞춤 */
    const sorted = Array.from(vals, Math.abs).sort((a, b) => a - b), ref = sorted[Math.floor(sorted.length * 0.995)] || mx;
    const bg = [251, 251, 248], pos = [212, 73, 58], neg = [63, 111, 163];
    for (let k = 0; k < vals.length; k++) {
      const t = Math.min(1, Math.pow(Math.abs(vals[k]) / ref, 0.55)), c = vals[k] >= 0 ? pos : neg;
      img.data[4 * k] = bg[0] + (c[0] - bg[0]) * t; img.data[4 * k + 1] = bg[1] + (c[1] - bg[1]) * t;
      img.data[4 * k + 2] = bg[2] + (c[2] - bg[2]) * t; img.data[4 * k + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
  }

  const { ctx, size } = fit(cv, () => draw());
  function graph(x0, y0, gw, gh, f, signed, rc, title, nd) {
    const V = VIEW[n], N = 400; let mx = 0;
    for (let i = 0; i <= N; i++) mx = Math.max(mx, Math.abs(f(i / N * V)));
    const X = (r) => x0 + r / V * gw, zeroY = signed ? y0 + gh / 2 : y0 + gh, Y = (v) => zeroY - v / mx * (signed ? gh / 2 : gh) * 0.95;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, y0 + .5, gw, gh);
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(x0, zeroY + .5); ctx.lineTo(x0 + gw, zeroY + .5); ctx.stroke();
    if (!signed) {
      ctx.fillStyle = "rgba(116,171,102,.28)"; ctx.beginPath(); ctx.moveTo(X(0), zeroY);
      for (let i = 0; i <= N; i++) { const r = i / N * V; if (r > rc) break; ctx.lineTo(X(r), Y(f(r))); }
      ctx.lineTo(X(Math.min(rc, V)), zeroY); ctx.closePath(); ctx.fill();
    }
    ctx.lineWidth = 2;
    for (let i = 0; i < N; i++) {
      const a = i / N * V, b = (i + 1) / N * V, va = f(a), vb = f(b);
      ctx.strokeStyle = signed ? (va + vb >= 0 ? C.apple : "#3f6fa3") : C.forest;
      ctx.beginPath(); ctx.moveTo(X(a), Y(va)); ctx.lineTo(X(b), Y(vb)); ctx.stroke();
    }
    ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    nd.forEach((r) => { if (r < V) { ctx.beginPath(); ctx.arc(X(r), zeroY, 3.2, 0, 7); ctx.fill(); ctx.stroke(); } });
    if (rc <= V) { ctx.strokeStyle = C.amber; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(rc), y0); ctx.lineTo(X(rc), y0 + gh); ctx.stroke(); ctx.setLineDash([]); }
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(title, x0 + gw - 5, y0 + 14);
    return X;
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const V = VIEW[n], rc = +sR.value * V, nd = nodes();
    const ms = Math.min(w * 0.44, h - 40), mx0 = 2, my0 = (h - ms) / 2 - 6;
    ctx.imageSmoothingEnabled = true; ctx.drawImage(off, mx0, my0, ms, ms);
    ctx.strokeStyle = C.rule; ctx.strokeRect(mx0 + .5, my0 + .5, ms, ms);
    const MV = V * 0.65, cx = mx0 + ms / 2, cy = my0 + ms / 2, sc = ms / 2 / MV;
    ctx.save(); ctx.beginPath(); ctx.rect(mx0, my0, ms, ms); ctx.clip();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(cx, cy, rc * sc, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 2, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`${n}${"spdf"[l]} 단면 (xz 평면)`, mx0, my0 + ms + 15);
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`z ↑  ±${Math.round(V * 0.65)} a₀`, mx0 + ms, my0 + ms + 15);
    const gx = mx0 + ms + 16, gw = w - gx - 6, gh = (h - 46) / 2;
    graph(gx, 6, gw, gh, R, true, rc, "지름 함수 R(r)", nd);
    const X = graph(gx, 6 + gh + 10, gw, gh, P, false, rc, "지름 확률 분포 r²R²", nd);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    const step = V > 30 ? 10 : V > 12 ? 5 : 1;
    for (let r = 0; r <= V; r += step) ctx.fillText(`${r}`, X(r), 6 + 2 * gh + 10 + 13);
    ctx.textAlign = "right"; ctx.fillText("r (a₀)", w - 6, h - 4);
  }
  function update() {
    if (l >= n) l = n - 1;
    root.querySelectorAll("[data-n]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.n === n)));
    root.querySelectorAll("[data-l]").forEach((b) => { b.disabled = +b.dataset.l >= n; b.setAttribute("aria-pressed", String(+b.dataset.l === l)); });
    const V = VIEW[n], rc = +sR.value * V;
    oR.textContent = rc.toFixed(1);
    $(".n-rn").textContent = `${n - l - 1}개`; $(".n-an").textContent = `${l}개`;
    $(".n-e").textContent = `${(-13.6 / (n * n)).toFixed(2)} eV`;
    $(".n-p").textContent = `${(Math.min(1, cum(rc)) * 100).toFixed(1)} %`;
    makeMap(); draw();
  }
  root.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => { n = +b.dataset.n; update(); }));
  root.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { if (+b.dataset.l < n) { l = +b.dataset.l; update(); } }));
  sR.addEventListener("input", () => {
    const rc = +sR.value * VIEW[n]; oR.textContent = rc.toFixed(1);
    $(".n-p").textContent = `${(Math.min(1, cum(rc)) * 100).toFixed(1)} %`; draw();
  });
  update();
})();
