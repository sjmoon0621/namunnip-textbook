/* 카드: ATP 합성 효소 — c 고리 크기, Δψ, ΔpH로 합성 가능 여부와 H⁺/ATP, P/O 계산 (회전 그림은 모식) */
(() => {
  const root = document.getElementById("card-adbio-synthase");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), sP = $(".psi"), sH = $(".dph"), oN = $(".n-out"), oP = $(".p-out"), oH = $(".h-out");
  const nDp = $(".n-dp"), nHpa = $(".n-hpa"), nPo = $(".n-po"), nDir = $(".n-dir");
  const FAR = 96.485, DG = 50, Z = 61.5;
  const MODES = { mito: [8, 160, 0.8], chl: [14, 30, 2.2], jag: [14, 0, 4], dnp: [8, 20, 0.1] };
  let mode = "mito", ang = 0, made = 0, lastStep = 0;
  const blue = "#3f6fa3";
  function calc() {
    const n = +sN.value, psi = +sP.value, dph = +sH.value;
    const dp = psi + Z * dph, hpa = n / 3, eH = FAR * dp / 1000, eIn = hpa * eH, drive = eIn - DG;
    return { n, psi, dph, dp, hpa, eH, eIn, drive };
  }
  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, col, font, al) { ctx.fillStyle = col; ctx.font = font; ctx.textAlign = al || "center"; ctx.fillText(s, x, y); }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = calc(), mw = w * 0.6, cx = mw / 2;
    const inside = mode === "chl" || mode === "jag";
    /* 위: H⁺가 많은 쪽, 막, 아래: 효소 머리가 있는 쪽 */
    const mTop = h * 0.2, mBot = h * 0.36;
    ctx.fillStyle = "rgba(212,73,58,.07)"; ctx.fillRect(0, 0, mw, mTop);
    ctx.fillStyle = "#e9e6d6"; ctx.fillRect(0, mTop, mw, mBot - mTop);
    txt(inside ? "틸라코이드 안 (H⁺ 많음)" : "막 사이 공간 (H⁺ 많음, +)", 8, 15, C.apple, `600 11px ${F.sans}`, "left");
    txt(inside ? "틸라코이드 막" : "내막", 8, (mTop + mBot) / 2 + 4, C.ink2, `10.5px ${F.sans}`, "left");
    txt(inside ? "스트로마" : "기질 (−)", 8, mBot + 16, C.ink2, `600 11px ${F.sans}`, "left");
    /* H⁺ 점 (많을수록 Δp 큼) */
    const nh = Math.round(Math.max(0, Math.min(24, k.dp / 10)));
    for (let i = 0; i < nh; i++) { const x = 70 + ((i * 53) % (mw - 90)), y = 26 + ((i * 17) % (mTop - 34)); txt("H⁺", x, y + 4, "rgba(212,73,58,.75)", `600 10px ${F.mono}`); }
    /* c 고리 (원근 타원) */
    const rx = Math.min(mw * 0.2, 70), ry = (mBot - mTop) * 0.42, cy = (mTop + mBot) / 2;
    ctx.fillStyle = "#cfe2c6"; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry + 4, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < k.n; i++) {
      const a = ang + i * 2 * Math.PI / k.n, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a), front = Math.sin(a) > 0;
      ctx.fillStyle = front ? C.forest : "rgba(59,124,42,.45)";
      ctx.beginPath(); ctx.ellipse(x, y, 7, 11, 0, 0, Math.PI * 2); ctx.fill();
    }
    /* a 소단위 */
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(cx + rx + 8, mTop - 6, 18, mBot - mTop + 12);
    txt("a", cx + rx + 17, cy + 4, "#fff", `600 11px ${F.mono}`);
    txt("c 고리", cx - rx - 12, cy + 4, C.forest, `600 10.5px ${F.sans}`, "right");
    /* γ 축 */
    const hy = mBot + (h - mBot) * 0.52, hr = Math.min((h - mBot) * 0.36, mw * 0.2);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, hy); ctx.stroke();
    /* α₃β₃ 머리 (위에서 내려다본 모식) */
    const states = ["O", "L", "T"], stCol = { O: "#e9e6d6", L: "#d7e4f2", T: C.amber };
    const step = Math.floor(((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI / 3));
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 3, x = cx + hr * 0.62 * Math.cos(a), y = hy + hr * 0.62 * Math.sin(a);
      const isB = i % 2 === 0;
      const st = isB ? states[(i / 2 + step) % 3] : null;
      ctx.fillStyle = isB ? stCol[st] : "#f1efe6"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, hr * 0.36, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      txt(isB ? `β ${st}` : "α", x, y + 4, isB ? C.ink : C.ink3, `600 ${isB ? 11 : 10}px ${F.mono}`);
    }
    /* γ의 방향 표시 */
    const ga = ang * 1;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, hy); ctx.lineTo(cx + hr * 0.3 * Math.cos(ga), hy + hr * 0.3 * Math.sin(ga)); ctx.stroke(); ctx.lineCap = "butt";
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, hy, 4, 0, Math.PI * 2); ctx.fill();
    txt("F₁ (α₃β₃, 위에서 본 모식)", cx, h - 4, C.ink3, `10px ${F.sans}`);
    txt(`만든 ATP ${made}`, mw - 8, h - 4, "#b07b10", `600 11px ${F.mono}`, "right");
    /* 오른쪽 에너지 막대 */
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mw + 4, 10); ctx.lineTo(mw + 4, h - 10); ctx.stroke();
    const bx = mw + 16, bw = w - bx - 8, base = h - 30, top = 40, sc = (e) => (base - top) * Math.min(e, 100) / 100;
    txt("ATP 1개 기준 (kJ/mol)", bx + bw / 2, 16, C.ink2, `600 11px ${F.sans}`);
    const c1 = bx + bw * 0.28, c2 = bx + bw * 0.74, cw = Math.min(40, bw * 0.3);
    ctx.fillStyle = C.apple; ctx.fillRect(c1 - cw / 2, base - sc(k.eIn), cw, sc(k.eIn));
    ctx.fillStyle = C.amber; ctx.fillRect(c2 - cw / 2, base - sc(DG), cw, sc(DG));
    ctx.strokeStyle = C.ink; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(bx, base - sc(DG)); ctx.lineTo(bx + bw, base - sc(DG)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(bx, base); ctx.lineTo(bx + bw, base); ctx.stroke();
    txt(k.eIn.toFixed(0), c1, base - sc(k.eIn) - 5, C.apple, `600 11px ${F.mono}`);
    txt(String(DG), c2, base - sc(DG) - 5, "#b07b10", `600 11px ${F.mono}`);
    txt(`H⁺ ${k.hpa.toFixed(2)}개`, c1, base + 13, C.ink, `10.5px ${F.mono}`);
    txt("필요", c2, base + 13, C.ink, `10.5px ${F.mono}`);
    txt(k.drive >= 0 ? "합성 방향으로 회전" : "부족 → 거꾸로 회전", bx + bw / 2, 32, k.drive >= 0 ? C.forest : C.warn, `600 11px ${F.sans}`);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    const k = calc();
    oN.textContent = k.n; oP.textContent = k.psi; oH.textContent = k.dph.toFixed(1);
    nDp.textContent = `${k.dp.toFixed(0)} mV`;
    nHpa.textContent = k.hpa.toFixed(2);
    const mito = mode === "mito" || mode === "dnp";
    const per = k.hpa + (mito ? 1 : 0);
    nPo.textContent = `${(10 / per).toFixed(1)} / ${(6 / per).toFixed(1)}`;
    nDir.textContent = k.drive >= 0 ? "ATP 합성" : "ATP 분해";
    nDir.className = "n-dir " + (k.drive >= 0 ? "good" : "bad");
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.m; const [n, p, d] = MODES[mode]; sN.value = n; sP.value = p; sH.value = d; made = 0; update();
  }));
  [sN, sP, sH].forEach((s) => s.addEventListener("input", update));
  loop(cv, (dt) => {
    if (NM.reduce) return;
    const k = calc();
    const sp = Math.max(-1.2, Math.min(2.2, k.drive / 6));
    ang += sp * dt;
    const st = Math.floor(ang / (2 * Math.PI / 3));
    if (st !== lastStep) { made += st > lastStep ? 1 : -1; lastStep = st; }
    draw();
  });
  update();
})();
