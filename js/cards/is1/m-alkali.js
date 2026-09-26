/* 카드 2.3.2: 리튬·나트륨·칼륨은 왜 물과 비슷하게 반응할까? — 물과의 반응(모식)과 원자 크기 비교 */
(() => {
  const root = document.getElementById("card-is1-alkali");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), dropB = $(".drop");
  const oR = $(".rad"), oIE = $(".ie"), oMP = $(".mp"), oD = $(".den");

  // 실측값: 금속 결합 반지름(pm), 첫 이온화 에너지(kJ/mol), 녹는점(°C), 밀도(g/cm³)
  // 반응 모습(속력·지속 시간·불꽃)은 관찰을 옮긴 모식
  const M = {
    Li: { name: "리튬", r: 152, ie: 520, mp: 180.5, d: 0.53, shells: [2, 1], speed: 8, dur: 9, bub: 10, melt: false, flame: null },
    Na: { name: "나트륨", r: 186, ie: 496, mp: 97.8, d: 0.97, shells: [2, 8, 1], speed: 55, dur: 5, bub: 28, melt: true, flame: null },
    K:  { name: "칼륨", r: 227, ie: 419, mp: 63.5, d: 0.86, shells: [2, 8, 8, 1], speed: 110, dur: 3, bub: 45, melt: true, flame: "rgba(190,140,230," },
  };
  let m = "Na", t = -1, px = 0, py = 0, vx = 1, vy = 0, trail = [], bubbles = [];
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520, P = M[m];
    const split = Math.round(w * 0.46);

    // ── 비커 (위에서 비스듬히 본 모식)
    const bx = 14, bw = split - 28, top = 30, bh = h - top - 16;
    const wy = top + bh * 0.22;
    ctx.fillStyle = "rgba(160,200,230,.22)"; ctx.fillRect(bx, wy, bw, top + bh - wy);
    // 붉게 변한 부분 (페놀프탈레인)
    for (const [x, y, a] of trail) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, 26);
      g.addColorStop(0, `rgba(222,80,150,${0.16 * a})`); g.addColorStop(1, "rgba(222,80,150,0)");
      ctx.fillStyle = g; ctx.fillRect(x - 26, y - 26, 52, 52);
    }
    if (t >= 0 && t > P.dur) {
      const k = clamp((t - P.dur) / 2, 0, 1);
      ctx.fillStyle = `rgba(222,80,150,${0.22 * k})`; ctx.fillRect(bx, wy, bw, top + bh - wy);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bx, top); ctx.lineTo(bx, top + bh); ctx.lineTo(bx + bw, top + bh); ctx.lineTo(bx + bw, top); ctx.stroke();
    ctx.strokeStyle = "rgba(90,140,180,.6)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, wy); ctx.lineTo(bx + bw, wy); ctx.stroke();
    // 기포
    for (const b of bubbles) {
      ctx.strokeStyle = `rgba(35,35,38,${0.5 * b.a})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
    }
    // 금속 조각
    if (t < 0) {
      ctx.fillStyle = "#b9bcc0"; ctx.fillRect(bx + bw / 2 - 8, top - 18, 16, 10);
      ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText("‘물에 넣기’를 누르세요", bx + bw / 2, wy + 40);
    } else if (t < P.dur) {
      const s = 1 - t / P.dur, r = 4 + 6 * Math.sqrt(s);
      if (P.flame && t > 0.5) {
        const g = ctx.createRadialGradient(px, py - 8, 0, px, py - 8, 22);
        g.addColorStop(0, P.flame + ".9)"); g.addColorStop(1, P.flame + "0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(px, py - 10, 12, 22, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#c7cacd";
      ctx.beginPath();
      if (P.melt && t > 0.4) ctx.arc(px, py, r, 0, Math.PI * 2); else ctx.rect(px - r, py - r * .6, 2 * r, 1.2 * r);
      ctx.fill(); ctx.strokeStyle = C.ink2; ctx.stroke();
    }
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`${P.name} + 물 (페놀프탈레인)`, bx, 16);
    if (t >= 0) {
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
      const note = t < P.dur ? (m === "Li" ? "천천히 기포를 내며 떠다님" : m === "Na" ? "녹아서 구슬처럼 굴러다님" : "연보라 불꽃을 내며 빠르게 움직임") : "다 녹음 · 용액이 붉어짐";
      ctx.fillText(note, bx + 4, top + bh - 8);
    }

    // ── 원자 크기 비교 (반지름 실측 비례, 껍질은 모식)
    const ox = split + 10, ow = w - ox - 6;
    const scale = Math.min((ow / 3 - 4) / 2 / 227, (h - 80) / 2 / 227);
    const keys = ["Li", "Na", "K"];
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("원자의 크기 (반지름 비례)", ox, 16);
    const base = h - 32;
    keys.forEach((k, i) => {
      const A = M[k], R = A.r * scale, cx = ox + ow * (i + .5) / 3, cy = base - 227 * scale;
      const sel = k === m;
      A.shells.forEach((n, j) => {
        const r = R * (j + 1) / A.shells.length;
        ctx.strokeStyle = sel ? "rgba(35,35,38,.5)" : "rgba(35,35,38,.18)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        if (j === A.shells.length - 1) {
          ctx.fillStyle = sel ? C.amber : "rgba(224,160,42,.45)";
          ctx.beginPath(); ctx.arc(cx + r, cy, 3.5, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.fillStyle = sel ? C.apple : "rgba(212,73,58,.4)"; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.font = `${sel ? 600 : 400} 11px ${F.mono}`; ctx.fillStyle = sel ? C.ink : C.ink3; ctx.textAlign = "center";
      ctx.fillText(k, cx, base + 14);
      ctx.font = `10px ${F.mono}`;
      ctx.fillText(`껍질 ${A.shells.length}`, cx, base + 27);
    });
    ctx.textAlign = "left";
  }

  function update() {
    const P = M[m];
    oR.textContent = `${P.r} pm`; oIE.textContent = `${P.ie}`; oMP.textContent = `${P.mp} °C`; oD.textContent = `${P.d}`;
    draw();
  }
  function start() {
    const { w, h } = size; const split = Math.round(w * 0.46);
    const bx = 14, bw = split - 28, top = 30, bh = h - top - 16, wy = top + bh * 0.22;
    t = 0; px = bx + bw / 2; py = wy + 2; const a = rnd() * Math.PI * 2; vx = Math.cos(a); vy = Math.sin(a) * 0.3;
    trail = []; bubbles = [];
    start.box = { bx, bw, wy, bot: top + bh };
  }

  root.querySelectorAll(".metal .chip").forEach((b) => b.addEventListener("click", () => {
    m = b.dataset.m; t = -1; trail = []; bubbles = [];
    root.querySelectorAll(".metal .chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  dropB.addEventListener("click", start);

  loop(cv, (dt) => {
    if (t < 0) return;
    const P = M[m], B = start.box;
    t += dt;
    if (t < P.dur) {
      const sp = NM.reduce ? P.speed * .3 : P.speed;
      if (rnd() < dt * 3) { const a = Math.atan2(vy, vx) + (rnd() - .5) * 2; vx = Math.cos(a); vy = Math.sin(a) * 0.35; }
      px += vx * sp * dt; py = B.wy + 2 + Math.sin(t * 7) * 1.2 + vy * 4;
      if (px < B.bx + 14) { px = B.bx + 14; vx = Math.abs(vx); }
      if (px > B.bx + B.bw - 14) { px = B.bx + B.bw - 14; vx = -Math.abs(vx); }
      if (rnd() < dt * 8) trail.push([px, B.wy + 14 + rnd() * 30, 1]);
      if (rnd() < dt * P.bub) bubbles.push({ x: px + (rnd() - .5) * 10, y: py + 2, r: 1 + rnd() * 2, a: 1 });
    }
    for (const b of bubbles) { b.y -= dt * 14; b.a -= dt * 1.4; }
    bubbles = bubbles.filter((b) => b.a > 0);
    for (const tr of trail) { tr[1] += dt * 5; if (tr[1] > B.bot - 10) tr[1] = B.bot - 10; }
    if (trail.length > 160) trail.splice(0, trail.length - 160);
    if (t > P.dur + 2.2 && !bubbles.length) { draw(); t = P.dur + 2.2; return; }
    draw();
  });
  update();
})();
