/* 카드: 뇌 영상으로 뇌의 어느 부분이 무슨 일을 하는지 알 수 있을까? — fMRI 모식 활성 지도, 반대쪽 지배, 손상 사례 추론 */
(() => {
  const root = document.getElementById("card-bio-brain-map");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  /* 뇌 그림 좌표: x 0(앞, 이마 쪽) → 1(뒤), y 0(위) → 1(아래). 왼쪽 대뇌 반구를 바깥 옆에서 본 모식도 */
  const CORTEX = [[0.12, 0.52], [0.07, 0.38], [0.10, 0.22], [0.22, 0.08], [0.40, 0.02], [0.58, 0.03], [0.75, 0.10], [0.88, 0.22], [0.95, 0.36], [0.93, 0.50], [0.85, 0.58], [0.72, 0.60], [0.64, 0.64], [0.54, 0.70], [0.40, 0.70], [0.30, 0.65], [0.26, 0.57], [0.23, 0.53], [0.16, 0.55]];
  const STEM = [[0.52, 0.60], [0.62, 0.60], [0.635, 0.70], [0.66, 0.77], [0.63, 0.84], [0.625, 0.97], [0.555, 0.97], [0.55, 0.84], [0.53, 0.77], [0.525, 0.68]];
  const CS = [[0.555, 0.03], [0.50, 0.22], [0.44, 0.48]];
  const LS = [[0.25, 0.535], [0.45, 0.50], [0.62, 0.44], [0.70, 0.41]];
  const LOBE = {
    frontal: { n: "전두엽", c: "#f1e3cf", p: [[0, -0.1], [0.555, -0.1], [0.555, 0.03], [0.50, 0.22], [0.44, 0.48], [0.45, 0.50], [0.25, 0.535], [0.18, 0.8], [0, 0.8]] },
    parietal: { n: "두정엽", c: "#e3ead3", p: [[0.555, -0.1], [0.80, -0.1], [0.84, 0.42], [0.70, 0.41], [0.62, 0.44], [0.45, 0.50], [0.44, 0.48], [0.50, 0.22], [0.555, 0.03]] },
    occipital: { n: "후두엽", c: "#dbe3ee", p: [[0.80, -0.1], [1.1, -0.1], [1.1, 0.8], [0.87, 0.8], [0.84, 0.42]] },
    temporal: { n: "측두엽", c: "#eedfe3", p: [[0.25, 0.535], [0.45, 0.50], [0.62, 0.44], [0.70, 0.41], [0.84, 0.42], [0.87, 0.8], [0.18, 0.8]] },
  };
  /* 영역: 이름, 중심, 퍼짐, 보이는 면인지 */
  const REG = {
    prefrontal: { n: "전두엽 앞부분(전전두 영역)", at: [0.15, 0.30], s: 0.06 },
    motorFace: { n: "운동 영역(얼굴·혀)", at: [0.425, 0.42], s: 0.03 },
    motorHand: { n: "운동 영역(손)", at: [0.465, 0.25], s: 0.03 },
    motorLeg: { n: "운동 영역(다리)", at: [0.505, 0.07], s: 0.03 },
    sensHand: { n: "감각 영역(손)", at: [0.535, 0.27], s: 0.03 },
    broca: { n: "브로카 영역", at: [0.30, 0.45], s: 0.035 },
    auditory: { n: "청각 영역", at: [0.53, 0.535], s: 0.035 },
    wernicke: { n: "베르니케 영역", at: [0.67, 0.49], s: 0.035 },
    angular: { n: "두정엽 아래쪽(글자와 소리 연결)", at: [0.75, 0.37], s: 0.03 },
    visual: { n: "시각 영역", at: [0.91, 0.40], s: 0.035 },
    visualAssoc: { n: "시각 연합 영역", at: [0.83, 0.50], s: 0.035 },
    cerebellum: { n: "소뇌", at: [0.79, 0.71], s: 0.05 },
    pons: { n: "뇌교", at: [0.595, 0.77], s: 0.03 },
    medulla: { n: "연수", at: [0.59, 0.91], s: 0.03 },
    hypo: { n: "간뇌 시상하부 (안쪽)", at: [0.47, 0.60], s: 0.03, inner: true },
  };
  const TASK = {
    speak: { n: "단어 말하기", w: { broca: 1, motorFace: 1, auditory: 0.5, cerebellum: 0.35 }, note: "자기 목소리를 들으므로 청각 영역도 약하게 켜집니다." },
    listen: { n: "말 듣기", w: { auditory: 1, wernicke: 0.9 }, note: "소리는 청각 영역, 말의 뜻은 베르니케 영역 쪽에서 처리됩니다." },
    read: { n: "글 읽기(소리 내지 않고)", w: { visual: 1, visualAssoc: 0.85, angular: 0.6, wernicke: 0.5 }, note: "눈으로 본 글자 모양이 소리·뜻과 연결됩니다." },
    rhand: { n: "오른손 움직이기", w: { motorHand: 1, sensHand: 0.7 }, note: "오른손은 왼쪽 대뇌의 운동 영역이 조절합니다. 오른쪽 소뇌도 켜지지만 이 그림의 뒤편입니다." },
    lhand: { n: "왼손 움직이기", w: { motorHand: 0.12 }, note: "왼손을 조절하는 곳은 오른쪽 대뇌 반구라서 이 왼쪽 그림에는 거의 나타나지 않습니다." },
    walk: { n: "균형 잡고 걷기", w: { cerebellum: 1, motorLeg: 0.8, sensHand: 0.15 }, note: "다리 운동 영역은 대부분 두 반구 사이 안쪽 면에 있어 옆에서는 윗부분만 보입니다." },
    breathe: { n: "호흡·심장 박동", w: { medulla: 0.9, pons: 0.55 }, note: "의식하지 않아도 연수가 조절합니다. 뇌줄기는 작고 맥박·호흡의 영향을 크게 받아 fMRI로 재기 까다롭습니다." },
    heat: { n: "더울 때 체온 조절", w: { hypo: 0.9 }, note: "시상하부는 뇌 안쪽 깊은 곳이라 바깥 면에 점선으로 겹쳐 표시했습니다." },
  };
  const CASE = {
    broca: { r: "broca", y: "y1", n: "브로카 영역 손상" },
    wernicke: { r: "wernicke", y: "y2", n: "베르니케 영역 손상" },
    motor: { r: "motorHand", y: "y3", n: "왼쪽 운동 영역(손) 손상" },
    cerebellum: { r: "cerebellum", y: "y4", n: "소뇌 손상" },
    occipital: { r: "visual", y: "y5", n: "후두엽 시각 영역 손상" },
    gage: { r: "prefrontal", y: "y6", n: "전두엽 앞부분 손상 (피니어스 게이지)" },
  };
  const SYM = {
    y1: "남의 말은 대체로 알아듣지만, 말을 더듬거리며 짧은 낱말로만 겨우 말한다",
    y2: "말은 술술 하지만 뜻이 통하지 않고, 남의 말을 잘 알아듣지 못한다",
    y3: "오른손에 힘이 없고 마음대로 움직이지 못한다",
    y4: "팔다리 힘은 있지만 비틀거리고, 손 움직임이 정확하지 않다",
    y5: "눈에는 이상이 없는데 시야의 일부가 보이지 않는다",
    y6: "지능과 기억은 비교적 남았지만 계획·판단이 서툴고 충동적인 성격으로 바뀐다",
  };
  const WHY = {
    broca: "브로카 영역은 말을 만들어 내는 데 필요한 운동 계획을 세웁니다. 이해는 비교적 남지만 말하기가 어려운 <b>브로카 실어증</b>이 됩니다.",
    wernicke: "베르니케 영역은 들은 말의 뜻을 이해하는 데 중요합니다. 말소리는 유창하지만 뜻이 맞지 않는 <b>베르니케 실어증</b>이 됩니다.",
    motor: "대뇌의 운동 신경은 연수에서 반대쪽으로 교차합니다. 왼쪽 운동 영역이 다치면 <b>오른쪽</b> 몸이 마비됩니다.",
    cerebellum: "소뇌는 몸의 평형을 유지하고 근육 운동을 정교하게 조절합니다. 근력은 남아도 균형과 정확성이 떨어집니다.",
    occipital: "눈이 받은 정보는 후두엽의 시각 영역에서 처리됩니다. 눈이 멀쩡해도 시각 영역이 다치면 해당 시야가 보이지 않습니다.",
    gage: "1848년 미국 철도 공사장에서 쇠막대가 피니어스 게이지의 왼쪽 전두엽 앞부분을 뚫었습니다. 살아남았지만 주변 사람들은 그가 '예전의 게이지가 아니다'라고 했습니다. 전두엽 앞부분은 계획, 판단, 감정 조절에 관여합니다. 다만 당시 기록이 적어 변화의 정도는 지금도 논의됩니다.",
  };
  const YORDER = ["y3", "y5", "y1", "y6", "y4", "y2"];
  $(".syms").insertAdjacentHTML("beforeend", YORDER.map((k, i) => `<button class="chip" data-y="${k}" aria-pressed="false">${"ㄱㄴㄷㄹㅁㅂ"[i]}. ${SYM[k]}</button>`).join(""));

  let mode = "task", task = "speak", cs = "broca", pick = null, picked = null;
  const thr = $(".thr"), thrO = $(".thr-out");
  const { ctx, size } = fit(cv, () => { grid = null; draw(); });
  let grid = null, G = null;
  const geo = () => {
    const { w, h } = size, bw = Math.min(w - 16, (h - 12) / 0.62 / 0.98), bh = bw * 0.62;
    return { bx: (w - bw) / 2, by: 6, bw, bh };
  };
  const P = (g, u, v) => [g.bx + u * g.bw, g.by + v * g.bh];
  function smooth(g, pts) {
    const p = new Path2D(), n = pts.length, q = pts.map(([u, v]) => P(g, u, v));
    p.moveTo(...q[0]);
    for (let i = 0; i < n; i++) {
      const a = q[(i - 1 + n) % n], b = q[i], c = q[(i + 1) % n], d = q[(i + 2) % n];
      p.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]);
    }
    p.closePath(); return p;
  }
  const poly = (g, pts) => { const p = new Path2D(); pts.forEach(([u, v], i) => (i ? p.lineTo(...P(g, u, v)) : p.moveTo(...P(g, u, v)))); p.closePath(); return p; };
  const line = (g, pts) => { const p = new Path2D(); pts.forEach(([u, v], i) => (i ? p.lineTo(...P(g, u, v)) : p.moveTo(...P(g, u, v)))); return p; };
  function cereb(g) { const p = new Path2D(); const [x, y] = P(g, 0.79, 0.705); p.ellipse(x, y, g.bw * 0.12, g.bh * 0.135, -0.12, 0, Math.PI * 2); return p; }
  /* 잡음 격자 (한 번 만들어 둔다): 뇌 영상의 무작위 요동 */
  function makeGrid(g) {
    const cell = 4, nx = Math.ceil(size.w / cell), ny = Math.ceil(size.h / cell);
    let s = 20240611; const R = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const raw = new Float32Array(nx * ny).map(() => { let u = 0; while (!u) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R()); });
    const sm = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      let t = 0, c = 0;
      for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) { const x = i + a, y = j + b; if (x < 0 || y < 0 || x >= nx || y >= ny) continue; t += raw[y * nx + x]; c++; }
      sm[j * nx + i] = (t / c) * Math.sqrt(c) / 1.6;   /* 이웃 평균으로 덩어리진 잡음, 표준편차를 1 안팎으로 */
    }
    const mask = new Uint8Array(nx * ny), paths = [G.cortex, G.cb, G.stem];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = i * cell + cell / 2, y = j * cell + cell / 2; mask[j * nx + i] = paths.some((p) => ctx.isPointInPath(p, x * (ctx.getTransform().a), y * (ctx.getTransform().d))) ? 1 : 0; }
    return { cell, nx, ny, sm, mask };
  }
  function heat(z) {
    const t = Math.min(1, Math.max(0, z));
    return `rgba(${Math.round(230 + 25 * t)},${Math.round(60 + 180 * t)},${Math.round(30 + 40 * t)},${0.55 + 0.4 * t})`;
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    const g = geo();
    G = { cortex: smooth(g, CORTEX), stem: smooth(g, STEM), cb: cereb(g) };
    if (!grid) grid = makeGrid(g);
    ctx.clearRect(0, 0, w, h);
    /* 뇌줄기, 소뇌, 대뇌 */
    ctx.fillStyle = "#e8d9c4"; ctx.fill(G.stem); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.stroke(G.stem);
    ctx.fillStyle = "#e6d7c9"; ctx.fill(G.cb); ctx.stroke(G.cb);
    ctx.save(); ctx.clip(G.cb); ctx.strokeStyle = "rgba(141,141,146,.45)";
    for (let k = -4; k <= 4; k++) { const [x, y] = P(g, 0.79, 0.705 + k * 0.03); ctx.beginPath(); ctx.ellipse(x, y, g.bw * 0.13, g.bh * 0.04, -0.12, 0, Math.PI); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.clip(G.cortex);
    Object.values(LOBE).forEach((l) => { ctx.fillStyle = l.c; ctx.fill(poly(g, l.p)); });
    const strip = (dx, col) => { const pts = CS.map(([u, v]) => [u + dx[0], v]).concat(CS.slice().reverse().map(([u, v]) => [u + dx[1], v])); ctx.fillStyle = col; ctx.fill(poly(g, pts)); };
    strip([-0.055, -0.004], "rgba(212,120,90,.22)"); strip([0.004, 0.055], "rgba(90,140,200,.2)");
    ctx.restore();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.stroke(G.cortex);
    ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(93,93,97,.8)"; ctx.stroke(line(g, CS)); ctx.stroke(line(g, LS));
    ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.strokeStyle = "rgba(93,93,97,.5)"; ctx.stroke(line(g, [[0.81, 0.11], [0.84, 0.42], [0.86, 0.57]])); ctx.setLineDash([]);
    /* 시상하부(안쪽) 점선 */
    const [hx, hy] = P(g, ...REG.hypo.at);
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.ellipse(hx, hy, g.bw * 0.05, g.bh * 0.045, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    /* 활성 지도 */
    if (mode === "task") {
      const W = TASK[task].w, th = +thr.value, { cell, nx, ny, sm, mask } = grid;
      let on = 0, tot = 0;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        if (!mask[j * nx + i]) continue;
        tot++;
        const x = i * cell + cell / 2, y = j * cell + cell / 2, u = (x - g.bx) / g.bw, v = (y - g.by) / g.bh;
        let sig = 0;
        for (const k in W) { const r = REG[k], d2 = ((u - r.at[0]) ** 2 + ((v - r.at[1]) * 0.62) ** 2) / (r.s * r.s); sig += W[k] * Math.exp(-d2 / 2); }
        const z = sig * 6 + sm[j * nx + i];
        if (z > th) { on++; ctx.fillStyle = heat((z - th) / 4); ctx.fillRect(i * cell, j * cell, cell, cell); }
      }
      G.frac = tot ? on / tot : 0;
    } else {
      const r = REG[CASE[cs].r], [x, y] = P(g, ...r.at), rr = g.bw * (cs === "gage" ? 0.075 : cs === "cerebellum" ? 0.07 : 0.045);
      ctx.fillStyle = "rgba(60,40,30,.75)"; ctx.beginPath(); ctx.ellipse(x, y, rr, rr * 0.8, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(181,83,47,.9)"; ctx.lineWidth = 1.5; ctx.stroke();
      if (cs === "gage") { ctx.strokeStyle = "#6f6f74"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...P(g, 0.21, 0.74)); ctx.lineTo(...P(g, 0.11, 0.1)); ctx.stroke(); }
    }
    /* 이름표 */
    const lab = (t, u, v, col, al = "center", f = `10.5px ${F.sans}`) => { const [x, y] = P(g, u, v); ctx.font = f; ctx.textAlign = al; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(251,251,248,.85)"; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    const bold = `600 11.5px ${F.sans}`;
    lab("전두엽", 0.24, 0.25, C.ink, "center", bold); lab("두정엽", 0.68, 0.18, C.ink, "center", bold); lab("후두엽", 0.89, 0.30, C.ink, "center", bold); lab("측두엽", 0.37, 0.60, C.ink, "center", bold);
    lab("운동", 0.43, 0.12, "#a4553c"); lab("감각", 0.585, 0.15, "#3d6a9e");
    lab("브로카", 0.30, 0.50, C.ink2); lab("베르니케", 0.69, 0.555, C.ink2);
    lab("소뇌", 0.82, 0.74, C.ink, "center", bold); lab("뇌교", 0.52, 0.79, C.ink2, "right"); lab("연수", 0.54, 0.93, C.ink2, "right");
    lab("시상하부(안쪽)", 0.47, 0.675, C.ink3);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("← 앞(이마)", 8, h - 22); ctx.fillText("왼쪽 반구를 옆에서 본 모식도", 8, h - 8);
    ctx.textAlign = "right"; ctx.fillText("뒤 →", w - 8, h - 8);
    /* 위 왼쪽: 지금 상태 */
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 12.5px ${F.sans}`;
    ctx.fillText(mode === "task" ? `과제: ${TASK[task].n}` : CASE[cs].n, 8, 16);
    if (pick) { ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.forest; ctx.fillText(`누른 곳: ${pick}`, 8, 32); }
    nums();
  }
  function nums() {
    if (mode === "task") {
      const W = TASK[task].w, top = Object.keys(W).sort((a, b) => W[b] - W[a])[0];
      $(".n1").textContent = W[top] > 0.2 ? REG[top].n.replace(/ \(안쪽\)/, "") : "거의 없음";
      $(".n2").textContent = `${((G && G.frac) || 0) * 100 < 0.1 ? "0" : (G.frac * 100).toFixed(1)}%`;
      $(".n3").textContent = "약 5초 늦게";
      const v = $(".verdict"); v.innerHTML = TASK[task].note; v.className = "verdict small";
    } else {
      $(".n1").textContent = CASE[cs].n.replace(/ \(.*\)/, "");
      $(".n2").textContent = picked ? (picked === CASE[cs].y ? "맞음" : "다시") : "—";
      $(".n3").textContent = picked && picked === CASE[cs].y ? "확인" : "예측 전";
      const v = $(".verdict");
      if (!picked) { v.textContent = "이 부위가 다치면 어떤 증상이 나타날지 아래 보기에서 골라 보세요."; v.className = "verdict small"; }
      else if (picked === CASE[cs].y) { v.innerHTML = "<b>맞습니다.</b> " + WHY[cs]; v.className = "verdict small good"; }
      else { v.innerHTML = "그 증상은 다른 부위의 손상에 더 가깝습니다. 이 부위가 맡은 일을 떠올려 다시 골라 보세요."; v.className = "verdict small bad"; }
    }
  }
  function setMode(m) {
    mode = m;
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    root.querySelectorAll(".for-task").forEach((e) => { e.hidden = m !== "task"; });
    root.querySelectorAll(".for-case").forEach((e) => { e.hidden = m !== "case"; });
    $(".lbl1").textContent = m === "task" ? "가장 강한 신호" : "손상 부위";
    $(".lbl2").textContent = m === "task" ? "문턱값을 넘은 부분" : "예측";
    $(".lbl3").textContent = m === "task" ? "혈류 신호의 지연" : "판정";
    draw();
  }
  const press = (sel, key, val) => root.querySelectorAll(sel).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[key] === val)));
  root.addEventListener("click", (e) => {
    const m = e.target.closest("[data-m]"), t = e.target.closest("[data-t]"), c = e.target.closest("[data-c]"), y = e.target.closest("[data-y]");
    if (m) setMode(m.dataset.m);
    if (t) { task = t.dataset.t; press("[data-t]", "t", task); draw(); }
    if (c) { cs = c.dataset.c; picked = null; press("[data-c]", "c", cs); press("[data-y]", "y", ""); draw(); }
    if (y) { picked = y.dataset.y; press("[data-y]", "y", picked); draw(); }
  });
  thr.addEventListener("input", () => { thrO.textContent = (+thr.value).toFixed(1); draw(); });
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), g = geo(), u = (e.clientX - r.left - g.bx) / g.bw, v = (e.clientY - r.top - g.by) / g.bh;
    let best = null, bd = 0.09;
    for (const k in REG) { const d = Math.hypot(u - REG[k].at[0], (v - REG[k].at[1]) * 0.62); if (d < bd) { bd = d; best = k; } }
    if (!best) { const x = e.clientX - r.left, y = e.clientY - r.top, dpr = ctx.getTransform().a; const lobe = ctx.isPointInPath(G.cortex, x * dpr, y * dpr) ? Object.values(LOBE).find((l) => ctx.isPointInPath(poly(g, l.p), x * dpr, y * dpr)) : null; pick = lobe ? lobe.n : null; }
    else pick = REG[best].n;
    draw();
  });
  setMode("task");
  if (/[?&]demo=case\b/.test(location.search)) { setMode("case"); cs = "gage"; picked = "y6"; press("[data-c]", "c", cs); press("[data-y]", "y", picked); draw(); }
  else if (/[?&]demo\b/.test(location.search)) { task = "speak"; press("[data-t]", "t", task); thr.value = 2.5; thrO.textContent = "2.5"; pick = "브로카 영역"; draw(); }
})();
