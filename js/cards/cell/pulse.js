/* 카드: 세포 밖으로 나갈 단백질은 어떤 길을 지날까? — 펄스–추적 자기 방사법 모식. 소포체→골지체→분비 소낭→세포 밖 1차 이동 모형 */
(() => {
  const root = document.getElementById("card-cell-pulse");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".time"), oT = $(".t-out"), cont = $(".cont"), stim = $(".stim");
  const nR = $(".n-r"), nG = $(".n-g"), nV = $(".n-v"), nO = $(".n-o");
  const k1 = 0.18, k2 = 0.05, COL = ["#e0a02a", "#3b7c2a", "#3f6fa3", "#8a4fb0"];
  const NAMES = ["거친면 소포체", "골지체", "분비 소낭", "세포 밖"];
  // 0~120분 시계열 (1분 간격, 비율 %)
  function series() {
    const k3 = stim.checked ? 0.03 : 0.003, out = [];
    let R = 0, Rr = 0, G = 0, V = 0, O = 0; const dt = 0.02;
    out.push([0, 0, 0, 0, 0]);
    for (let m = 1; m <= 120; m++) {
      for (let t = m - 1; t < m - 1e-9; t += dt) {
        const inp = (cont.checked || t < 3) ? 1 / 3 : 0;
        R += (0.85 * inp - k1 * R) * dt; Rr += 0.15 * inp * dt; G += (k1 * R - k2 * G) * dt; V += (k2 * G - k3 * V) * dt; O += k3 * V * dt;
      }
      const s = R + Rr + G + V + O;
      out.push([R + Rr, G, V, O].map((x) => x / s * 100).concat([s]));
    }
    return out;
  }
  // 은 알갱이 위치용 고정 난수
  let seed = 5; const rnd = () => { const x = Math.sin(seed++ * 78.23) * 43758.5453; return x - Math.floor(x); };
  const pool = Array.from({ length: 400 }, () => [rnd(), rnd()]);

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const S = series(), m = +sT.value, cur = S[m];
    // 세포 모식도 (위쪽이 샘의 빈 공간 쪽)
    const cx = w / 2, top = 26, ch = h * 0.5, cw = Math.min(w * 0.62, 260);
    ctx.fillStyle = "#f4f1e8"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - cw / 2, top + 16); ctx.lineTo(cx - cw / 2, top + ch); ctx.lineTo(cx + cw / 2, top + ch); ctx.lineTo(cx + cw / 2, top + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e3eef6"; ctx.fillRect(cx - cw / 2, top - 6, cw, 20);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("샘의 빈 공간 (세포 밖)", cx, top + 8);
    // 영역: 핵, 소포체, 골지체, 분비 소낭
    const nuc = { x: cx, y: top + ch * 0.8, r: ch * 0.13 };
    ctx.fillStyle = "#e6dcef"; ctx.beginPath(); ctx.arc(nuc.x, nuc.y, nuc.r, 0, 6.29); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillText("핵", nuc.x, nuc.y + 4);
    const reg = [
      { x0: cx - cw / 2 + 6, x1: cx + cw / 2 - 6, y0: top + ch * 0.58, y1: top + ch - 6 },   // 소포체
      { x0: cx - cw * 0.3, x1: cx + cw * 0.3, y0: top + ch * 0.42, y1: top + ch * 0.54 },       // 골지체
      { x0: cx - cw / 2 + 10, x1: cx + cw / 2 - 10, y0: top + 20, y1: top + ch * 0.36 },         // 분비 소낭
      { x0: cx - cw / 2 + 4, x1: cx + cw / 2 - 4, y0: top - 4, y1: top + 10 },                  // 세포 밖
    ];
    // 소포체 막
    ctx.strokeStyle = COL[0]; ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const y = reg[0].y0 + 6 + i * (reg[0].y1 - reg[0].y0 - 10) / 3;
      ctx.beginPath();
      for (let x = reg[0].x0; x <= reg[0].x1; x += 4) { if (Math.abs(x - nuc.x) < nuc.r + 6 && Math.abs(y - nuc.y) < nuc.r + 4) { ctx.moveTo(x + 4, y); continue; } ctx.lineTo(x, y + Math.sin(x / 9) * 2); }
      ctx.stroke();
    }
    // 골지체 주머니
    ctx.strokeStyle = COL[1]; ctx.lineWidth = 2.2;
    for (let i = 0; i < 4; i++) { const y = reg[1].y0 + 2 + i * 4, s = cw * (0.28 - i * 0.03); ctx.beginPath(); ctx.moveTo(cx - s, y + 3); ctx.quadraticCurveTo(cx, y - 5, cx + s, y + 3); ctx.stroke(); }
    // 분비 소낭
    ctx.strokeStyle = COL[2]; ctx.lineWidth = 1.2;
    for (let i = 0; i < 12; i++) { const x = reg[2].x0 + 14 + (i % 6) * (reg[2].x1 - reg[2].x0 - 28) / 5, y = reg[2].y0 + 12 + Math.floor(i / 6) * 26 + (i % 2) * 6; ctx.fillStyle = "#e4ebf3"; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.29); ctx.fill(); ctx.stroke(); }
    // 은 알갱이
    let k = 0; ctx.fillStyle = C.ink;
    [0, 1, 2, 3].forEach((i) => {
      const n = Math.round(cur[i] / 100 * 110 * (cont.checked ? 1 : 1));
      const r = reg[i];
      for (let j = 0; j < n; j++) { const [a, b] = pool[k++ % pool.length]; const x = r.x0 + a * (r.x1 - r.x0), y = r.y0 + b * (r.y1 - r.y0); if (i === 0 && Math.hypot(x - nuc.x, y - nuc.y) < nuc.r + 2) continue; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.29); ctx.fill(); }
    });
    // 이름표
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    [[0, reg[0].y1 - 4], [1, reg[1].y0 + 8], [2, reg[2].y0 + 8]].forEach(([i, y]) => { ctx.fillStyle = COL[i]; ctx.fillText(NAMES[i], cx + cw / 2 + 6, y); });
    // 그래프
    const gx = 44, gy = top + ch + 34, gw = w - gx - 12, gh = h - gy - 34;
    const X = (t) => gx + t / 120 * gw, Y = (v) => gy + gh - v / 100 * gh;
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [0, 20, 40, 60, 80, 100, 120].map((v) => [v, v]), yt: [0, 50, 100].map((v) => [v, v + "%"]), xlabel: "분", ylabel: "표지의 비율" });
    [0, 1, 2, 3].forEach((i) => {
      ctx.strokeStyle = COL[i]; ctx.lineWidth = 2; ctx.beginPath();
      S.forEach((p, t) => (t ? ctx.lineTo(X(t), Y(p[i])) : ctx.moveTo(X(t), Y(p[i])))); ctx.stroke();
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(m), gy); ctx.lineTo(X(m), gy + gh); ctx.stroke(); ctx.setLineDash([]);
    if (!cont.checked) { ctx.fillStyle = "rgba(212,73,58,.12)"; ctx.fillRect(X(0), gy, X(3) - X(0), gh); }
  }
  function update() {
    oT.textContent = sT.value;
    const c = series()[+sT.value];
    [nR, nG, nV, nO].forEach((el, i) => (el.textContent = +sT.value ? `${c[i].toFixed(0)} %` : "—"));
    draw();
  }
  [sT].forEach((el) => el.addEventListener("input", update));
  [cont, stim].forEach((el) => el.addEventListener("change", update));
  update();
})();
