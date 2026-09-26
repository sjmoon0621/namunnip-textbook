/* 카드: 물 분자는 왜 굽은 모양일까? — 전자쌍 반발 (3D, 드래그로 회전) */
(() => {
  const root = document.getElementById("card-chem-vsepr");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const oB = $(".nb-out"), oL = $(".nl-out");
  const dShape = $(".v-shape"), dMod = $(".v-mod"), dReal = $(".v-real"), msg = $(".vs-msg");

  // 전자쌍끼리 밀어내는 세기 (결합–결합 = 1). 값은 실제 결합각에 가깝게 맞춘 모식
  const W_LB = 1.22, W_LL = 1.45;
  const REAL = {
    "2,0": ["BeCl₂ (기체)", 180, "직선형"], "3,0": ["BF₃", 120, "평면 삼각형"], "4,0": ["CH₄", 109.5, "정사면체"],
    "3,1": ["NH₃", 107, "삼각뿔"], "2,2": ["H₂O", 104.5, "굽은 형"], "2,1": ["O₃", 116.8, "굽은 형"],
  };
  let nb = 2, nl = 2, P = [], yaw = 0.6, pitch = -0.35, drag = null, settle = 0;

  function rnd() { const a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1); return [Math.sin(b) * Math.cos(a), Math.sin(b) * Math.sin(a), Math.cos(b)]; }
  function setCount(b, l) {
    b = Math.max(2, Math.min(4, b)); l = Math.max(0, Math.min(4 - b, l));
    const bonds = P.filter((p) => !p.lp), lps = P.filter((p) => p.lp);
    while (bonds.length < b) bonds.push({ v: rnd(), lp: false });
    while (lps.length < l) lps.push({ v: rnd(), lp: true });
    bonds.length = b; lps.length = l;
    P = bonds.concat(lps); nb = b; nl = l; settle = 0; info();
  }
  function step(n) {
    for (let it = 0; it < n; it++) {
      const Fz = P.map(() => [0, 0, 0]);
      for (let i = 0; i < P.length; i++) for (let j = 0; j < P.length; j++) {
        if (i === j) continue;
        const w = P[i].lp && P[j].lp ? W_LL : P[i].lp || P[j].lp ? W_LB : 1;
        const d = [0, 1, 2].map((k) => P[i].v[k] - P[j].v[k]), r = Math.hypot(...d) || 1e-3;
        for (let k = 0; k < 3; k++) Fz[i][k] += d[k] * w / r ** 3;
      }
      P.forEach((p, i) => { for (let k = 0; k < 3; k++) p.v[k] += 0.01 * Fz[i][k]; const r = Math.hypot(...p.v); p.v = p.v.map((x) => x / r); });
    }
  }
  const angle = () => {
    const b = P.filter((p) => !p.lp); let s = 0, n = 0;
    for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) { s += Math.acos(Math.max(-1, Math.min(1, b[i].v[0] * b[j].v[0] + b[i].v[1] * b[j].v[1] + b[i].v[2] * b[j].v[2]))) * 180 / Math.PI; n++; }
    return s / n;
  };

  const { ctx, size } = fit(cv, () => draw());
  function rot([x, y, z]) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = cy * x + sy * z, z1 = -sy * x + cy * z;
    return [x1, cp * y - sp * z1, sp * y + cp * z1];
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2 + 6, S = Math.min(w, h) * 0.33, small = w < 520;
    const items = [{ z: 0, t: "c" }];
    P.forEach((p) => { const r = rot(p.v); items.push({ z: r[2], t: p.lp ? "lp" : "b", r }); });
    items.sort((a, b) => a.z - b.z);
    const per = (z) => 1 + z * 0.12;
    for (const it of items) {
      if (it.t === "c") {
        const g = ctx.createRadialGradient(cx - 6, cy - 6, 3, cx, cy, 20);
        g.addColorStop(0, "#8a8a8f"); g.addColorStop(1, "#3a3a3e");
        ctx.beginPath(); ctx.arc(cx, cy, 19, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("A", cx, cy + 4.5);
        continue;
      }
      const [x, y, z] = it.r, k = per(z);
      if (it.t === "b") {
        const bx = cx + x * S * k, by = cy - y * S * k;
        ctx.strokeStyle = "#8d8d92"; ctx.lineWidth = 6 * k; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
        const g = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, 16 * k);
        g.addColorStop(0, "#f7f7f3"); g.addColorStop(1, "#b9bab2");
        ctx.beginPath(); ctx.arc(bx, by, 15 * k, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = C.ink; ctx.font = `600 ${Math.round(11 * k)}px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("X", bx, by + 4);
      } else {
        // 비공유 전자쌍: 가운데 원자 가까이 퍼진 구름
        const lx = cx + x * S * 0.6 * k, ly = cy - y * S * 0.6 * k;
        const len = Math.hypot(x, y) || 1e-3, ang = Math.atan2(-y, x);
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(ang);
        const a = S * 0.4 * (0.4 + 0.6 * len), b = S * 0.26;
        const g = ctx.createRadialGradient(0, 0, 2, 0, 0, Math.max(a, b));
        g.addColorStop(0, "rgba(63,111,181,.45)"); g.addColorStop(1, "rgba(63,111,181,.08)");
        ctx.beginPath(); ctx.ellipse(0, 0, Math.max(a, 8), b, 0, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = "rgba(63,111,181,.5)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = "#1f3f73"; ctx.beginPath(); ctx.arc(-3, 5, 2.4, 0, Math.PI * 2); ctx.arc(-3, -5, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("끌어서 돌려 보세요 · X 결합한 원자, 파란 구름 비공유 전자쌍", 8, h - 10);
    ctx.textAlign = "right"; ctx.fillText(`모형 결합각 ${angle().toFixed(1)}°`, w - 8, 18);
  }

  function info() {
    oB.textContent = nb; oL.textContent = nl;
    const key = `${nb},${nl}`, r = REAL[key];
    dShape.textContent = r ? r[2] : "—";
    dReal.textContent = r ? `${r[0]} ${r[1]}°` : "—";
    msg.textContent = `가운데 원자 둘레의 전자쌍 ${nb + nl}개(결합 ${nb} + 비공유 ${nl})가 서로 가장 멀어지는 배치를 찾아갑니다.` +
      (nl ? " 분자 모양은 원자의 위치만 보고 부릅니다. 비공유 전자쌍은 보이지 않는 자리를 차지합니다." : "");
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.p === key ? "true" : "false"));
  }
  function numbers() { dMod.textContent = `${angle().toFixed(1)}°`; }

  root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => {
    const [kind, d] = b.dataset.d.split(",");
    if (kind === "b") setCount(nb + +d, nl); else setCount(nb, nl + +d);
    if (NM.reduce) { step(3000); settle = 3000; numbers(); draw(); }
  }));
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { const [x, y] = b.dataset.p.split(",").map(Number); setCount(x, y); if (NM.reduce) { step(3000); settle = 3000; numbers(); draw(); } }));
  cv.addEventListener("pointerdown", (e) => { drag = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw += (e.clientX - drag[0]) * 0.01; pitch = Math.max(-1.5, Math.min(1.5, pitch + (e.clientY - drag[1]) * 0.01));
    drag = [e.clientX, e.clientY]; draw();
  });
  cv.addEventListener("pointerup", () => { drag = null; });
  cv.addEventListener("pointercancel", () => { drag = null; });
  cv.style.touchAction = "pan-y"; cv.style.cursor = "grab";

  setCount(2, 2);
  step(3000); settle = 3000; numbers();
  loop(cv, (dt) => {
    if (settle < 3000) { step(30); settle += 30; numbers(); draw(); }
    else if (!drag && !NM.reduce) { yaw += dt * 0.25; draw(); }
  });
})();
