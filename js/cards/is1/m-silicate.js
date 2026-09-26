/* 카드 2.5.1: 규산염 사면체 하나로 어떻게 여러 광물이 만들어질까? — 산소 공유 방식과 구조 (모식) */
(() => {
  const root = document.getElementById("card-is1-silicate");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), oSh = $(".sh"), oR = $(".ratio"), oC = $(".clv");

  const K = {
    iso:    { sh: "0개", ratio: "1 : 4 (SiO₄)", clv: "거의 없음", name: "독립형 구조 · 감람석" },
    single: { sh: "2개", ratio: "1 : 3 (SiO₃)", clv: "2방향 (거의 직각)", name: "단사슬 구조 · 휘석" },
    double: { sh: "2개 또는 3개", ratio: "4 : 11 (Si₄O₁₁)", clv: "2방향 (약 56°·124°)", name: "복사슬 구조 · 각섬석" },
    sheet:  { sh: "3개", ratio: "2 : 5 (Si₂O₅)", clv: "1방향 (얇게 벗겨짐)", name: "판상 구조 · 흑운모" },
    frame:  { sh: "4개", ratio: "1 : 2 (SiO₂)", clv: "없음 (곡면으로 깨짐)", name: "망상 구조 · 석영" },
  };
  let kind = "iso", ang = 0.6;
  const O_COL = "#e8a79c", SH_COL = "#e0a02a", CAT = "#9fc3a0";

  const { ctx, size } = fit(cv, () => draw());

  function tetra3d(cx, cy, R) {
    const V = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((v) => v.map((x) => x / Math.sqrt(3)));
    const tilt = -0.5, ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(tilt), st = Math.sin(tilt);
    const P = V.map(([x, y, z]) => {
      const x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
      const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
      return { x: cx + x1 * R, y: cy - y2 * R, z: z2 };
    });
    ctx.strokeStyle = "rgba(35,35,38,.45)"; ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(35,35,38,.25)"; ctx.setLineDash([2, 3]);
    for (const p of P) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke(); }
    ctx.setLineDash([]);
    const items = [...P.map((p) => ({ ...p, o: true })), { x: cx, y: cy, z: 0, o: false }].sort((a, b) => a.z - b.z);
    for (const it of items) {
      ctx.beginPath(); ctx.arc(it.x, it.y, it.o ? R * 0.24 * (1 + it.z * 0.15) : R * 0.13, 0, Math.PI * 2);
      ctx.fillStyle = it.o ? O_COL : C.ink; ctx.fill();
      if (it.o) { ctx.strokeStyle = "rgba(35,35,38,.35)"; ctx.lineWidth = 1; ctx.stroke(); }
    }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520;
    const split = Math.round(w * (small ? 0.3 : 0.28));

    // ── 사면체 하나 (3차원)
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("사면체 하나", split / 2, 16);
    tetra3d(split / 2, h / 2, Math.min(split * 0.36, h * 0.3));
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText("SiO₄ · 전하 −4", split / 2, h - 14);

    // ── 위에서 본 연결 방식
    const x0 = split + 6, y0 = 26, pw = w - x0 - 6, ph = h - y0 - 8;
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(K[kind].name, x0, 16);
    const rows = 4, s = Math.min(ph / (rows * Math.sqrt(3)), pw / 9);
    const hh = Math.sqrt(3) * s;
    const L = (i, j) => [x0 + i * 2 * s + j * s - s * 2, y0 + ph - 4 - j * hh];
    const tri = [];
    for (let j = 0; j < rows; j++) for (let i = -2; i < 12; i++) {
      tri.push({ j, up: true, v: [L(i, j), L(i + 1, j), L(i, j + 1)] });
      tri.push({ j, up: false, v: [L(i + 1, j), L(i, j + 1), L(i + 1, j + 1)] });
    }
    let sel;
    if (kind === "iso") sel = tri.filter((t) => t.up);
    else if (kind === "single") sel = tri.filter((t) => t.j === 0 || t.j === 2);
    else if (kind === "double") sel = tri.filter((t) => t.j === 1 || t.j === 2);
    else sel = tri;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const key = (p) => `${Math.round(p[0] * 10)},${Math.round(p[1] * 10)}`;
    const tets = sel.map((t) => { const [a, b, c] = t.v; return { ...t, o: [mid(a, b), mid(b, c), mid(c, a)], c: [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3] }; });
    const cnt = {};
    for (const t of tets) for (const p of t.o) cnt[key(p)] = (cnt[key(p)] || 0) + 1;

    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0, pw, ph); ctx.clip();
    const or = Math.max(3, s * 0.26);
    // 양이온
    if (kind === "iso" || kind === "single" || kind === "double") {
      const cats = kind === "iso" ? tri.filter((t) => !t.up) : kind === "single" ? tri.filter((t) => t.j === 1 && t.up) : tri.filter((t) => (t.j === 0 || t.j === 3) && t.up);
      ctx.fillStyle = CAT;
      for (const t of cats) {
        const c = [(t.v[0][0] + t.v[1][0] + t.v[2][0]) / 3, (t.v[0][1] + t.v[1][1] + t.v[2][1]) / 3];
        ctx.beginPath(); ctx.arc(c[0], c[1], or * 0.9, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (const t of tets) {
      ctx.beginPath(); ctx.moveTo(...t.o[0]); ctx.lineTo(...t.o[1]); ctx.lineTo(...t.o[2]); ctx.closePath();
      ctx.fillStyle = kind === "frame" && !t.up ? "rgba(35,35,38,.14)" : "rgba(35,35,38,.06)"; ctx.fill();
      ctx.strokeStyle = "rgba(35,35,38,.5)"; ctx.lineWidth = 1; ctx.stroke();
    }
    for (const t of tets) for (const p of t.o) {
      ctx.beginPath(); ctx.arc(p[0], p[1], or, 0, Math.PI * 2);
      ctx.fillStyle = cnt[key(p)] > 1 ? SH_COL : O_COL; ctx.fill();
    }
    for (const t of tets) {
      ctx.beginPath(); ctx.arc(t.c[0], t.c[1], or * 0.95, 0, Math.PI * 2);
      ctx.fillStyle = kind === "frame" ? SH_COL : "rgba(232,167,156,.75)"; ctx.fill();
      ctx.beginPath(); ctx.arc(t.c[0], t.c[1], or * 0.38, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    }
    ctx.restore();
    if (kind === "sheet" || kind === "frame") {
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
      ctx.fillStyle = "rgba(251,251,248,.85)";
      const note = kind === "sheet" ? "판과 판 사이는 K⁺ 등이 약하게 이음" : "가운데 산소까지 위·아래 층과 공유";
      const tw = ctx.measureText(note).width;
      ctx.fillRect(x0 + pw - tw - 8, y0 + ph - 20, tw + 8, 18);
      ctx.fillStyle = C.ink2; ctx.fillText(note, x0 + pw - 4, y0 + ph - 7);
    }
    ctx.textAlign = "left";
  }

  function update() {
    const k = K[kind];
    oSh.textContent = k.sh; oR.textContent = k.ratio; oC.textContent = k.clv;
    draw();
  }
  root.querySelectorAll(".kinds .chip").forEach((b) => b.addEventListener("click", () => {
    kind = b.dataset.k;
    root.querySelectorAll(".kinds .chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  let drag = null;
  cv.addEventListener("pointerdown", (e) => { drag = e.clientX; });
  addEventListener("pointerup", () => { drag = null; });
  cv.addEventListener("pointermove", (e) => { if (drag == null) return; ang += (e.clientX - drag) * 0.02; drag = e.clientX; draw(); });
  loop(cv, (dt) => { if (NM.reduce || drag != null) return; ang += dt * 0.5; draw(); });
  update();
})();
