/* 카드: 비튼 횟수가 바뀌면 자른 띠는 몇 조각이 될까? — 비튼 띠의 입체 그림과 자르는 선 */
(() => {
  const root = document.getElementById("card-extra-mobius");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = root.querySelector("canvas");
  const sK = $(".k"), oK = $(".k-out");
  const dF = $(".faces"), dL = $(".laps"), dR = $(".result");
  let cut = 0.5, yaw = 0.6, pitch = 0.55, ant = null, auto = true;
  const R = 1, W = 0.38;

  // 띠 위의 점: 각 θ, 폭 방향 v ∈ [−1, 1]
  function pt(k, th, v) {
    const a = k * th / 2, r = R + v * W * Math.cos(a);
    return [r * Math.cos(th), r * Math.sin(th), v * W * Math.sin(a)];
  }
  function proj(p, w, h) {
    const [x, y, z] = p;
    const x1 = x * Math.cos(yaw) - y * Math.sin(yaw), y1 = x * Math.sin(yaw) + y * Math.cos(yaw);
    const y2 = y1 * Math.cos(pitch) - z * Math.sin(pitch), z2 = y1 * Math.sin(pitch) + z * Math.cos(pitch);
    const s = Math.min(w, h) * 0.34;
    return [w / 2 + x1 * s, h / 2 + z2 * -s + y2 * 0, y2];
  }
  // 자르는 선: 폭 위치 v0에서 출발. 한 바퀴 돌 때마다 k가 홀수이면 v → −v
  const v0 = () => 2 * cut - 1;
  function cutV(k, th) { const lap = Math.floor(th / (2 * Math.PI)); return (k % 2 === 1 && lap % 2 === 1) ? -v0() : v0(); }

  const V = fit(cv, () => draw());
  function draw() {
    const { ctx, size: { w, h } } = V; if (!w) return;
    const k = +sK.value;
    ctx.clearRect(0, 0, w, h);
    // 띠 면: 작은 사각형들을 깊이 순서로
    const N = 120, quads = [];
    for (let i = 0; i < N; i++) {
      const t0 = 2 * Math.PI * i / N, t1 = 2 * Math.PI * (i + 1) / N;
      for (const [va, vb] of [[-1, 0], [0, 1]]) {
        const ps = [pt(k, t0, va), pt(k, t1, va), pt(k, t1, vb), pt(k, t0, vb)].map((p) => proj(p, w, h));
        quads.push({ ps, d: ps.reduce((s, p) => s + p[2], 0) / 4, shade: Math.cos(k * (t0 + t1) / 4) });
      }
    }
    quads.sort((a, b) => b.d - a.d);
    for (const q of quads) {
      ctx.beginPath(); q.ps.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
      const l = 62 + 18 * q.shade;
      ctx.fillStyle = `hsl(95 30% ${l}%)`; ctx.fill();
      ctx.strokeStyle = "rgba(35,35,38,.08)"; ctx.stroke();
    }
    // 테두리
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    for (const v of [-1, 1]) {
      ctx.beginPath();
      for (let i = 0; i <= 4 * N; i++) { const th = 4 * Math.PI * i / (4 * N); const p = proj(pt(k, th, v), w, h); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.stroke();
    }
    // 자르는 선 (두 바퀴까지)
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.setLineDash([5, 3]);
    ctx.beginPath();
    for (let i = 0; i <= 2 * N; i++) { const th = 4 * Math.PI * i / (2 * N); const p = proj(pt(k, th, cutV(k, th)), w, h); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
    if (ant !== null) {
      const p = proj(pt(k, ant, cutV(k, ant)), w, h);
      ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText(`개미 ${(ant / (2 * Math.PI)).toFixed(2)}바퀴`, 6, h - 6);
    }
  }
  function show() {
    const k = +sK.value; oK.textContent = k;
    const odd = k % 2 === 1;
    dF.textContent = odd ? "1 / 1" : "2 / 2";
    dL.textContent = odd ? "두 바퀴" : "한 바퀴";
    let r;
    if (!odd) r = k === 0 ? "같은 길이 고리 2개" : "서로 걸린 고리 2개";
    else if (cut === 0.5) r = "두 배 길이 고리 1개";
    else r = "띠 하나 + 두 배 고리, 서로 걸림";
    dR.textContent = r;
    draw();
  }
  let drag = null;
  cv.addEventListener("pointerdown", (e) => { drag = [e.clientX, e.clientY, yaw, pitch]; auto = false; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag[2] + (e.clientX - drag[0]) * 0.01;
    pitch = Math.max(0.05, Math.min(1.45, drag[3] + (e.clientY - drag[1]) * 0.01));
    draw();
  });
  cv.addEventListener("pointerup", () => { drag = null; });
  loop(cv, (dt) => {
    let changed = false;
    if (auto && !NM.reduce) { yaw += dt * 0.25; changed = true; }
    if (ant !== null) {
      ant += dt * 1.6;
      const k = +sK.value, lim = (k % 2 === 1 ? 2 : 1) * 2 * Math.PI;
      if (ant >= lim) ant = null;
      changed = true;
    }
    if (changed) draw();
    return changed;
  });
  sK.addEventListener("input", show);
  root.querySelectorAll("[data-cut]").forEach((b) => b.addEventListener("click", () => {
    cut = +b.dataset.cut;
    root.querySelectorAll("[data-cut]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    show();
  }));
  $("[data-act=walk]").addEventListener("click", () => { ant = 0; draw(); });
  show();
})();
