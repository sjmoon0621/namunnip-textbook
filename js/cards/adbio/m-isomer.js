/* 카드: 육탄당의 이성질체 — 피셔 투영식에서 −OH를 뒤집어 이름과 관계 찾기, 하워스 고리와 α/β */
(() => {
  const root = document.getElementById("card-adbio-isomer");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nName = $(".n-name"), nRel = $(".n-rel"), nPoly = $(".n-poly"), bAno = $(".ano");
  /* true = 피셔식에서 −OH가 오른쪽 */
  const ALDO = { RRR: "알로스", LRR: "알트로스", RLR: "포도당", LLR: "만노스", RRL: "굴로스", LRL: "이도스", RLL: "갈락토스", LLL: "탈로스" };
  const KETO = { RR: "사이코스", LR: "과당", RL: "소르보스", LL: "타가토스" };
  const GLC = { 2: true, 3: false, 4: true, 5: true };
  const PRE = {
    glc: ["aldo", { 2: true, 3: false, 4: true, 5: true }],
    lglc: ["aldo", { 2: false, 3: true, 4: false, 5: false }],
    man: ["aldo", { 2: false, 3: false, 4: true, 5: true }],
    gal: ["aldo", { 2: true, 3: false, 4: false, 5: true }],
    fru: ["keto", { 2: true, 3: false, 4: true, 5: true }],
  };
  let kind = "aldo", cfg = { ...PRE.glc[1] }, alpha = true, pre = "glc";
  const rl = (b) => (b ? "R" : "L");

  function name() {
    const D = cfg[5];
    const m = (b) => (D ? b : !b);
    if (kind === "aldo") return (D ? "D-" : "L-") + ALDO[rl(m(cfg[2])) + rl(m(cfg[3])) + rl(m(cfg[4]))];
    return (D ? "D-" : "L-") + KETO[rl(m(cfg[3])) + rl(m(cfg[4]))];
  }
  function relation() {
    if (kind === "keto") return "구조 이성질체";
    const diff = [2, 3, 4, 5].filter((i) => cfg[i] !== GLC[i]);
    if (diff.length === 0) return "같은 물질";
    if (diff.length === 4) return "거울상 이성질체";
    if (diff.length === 1) return `C${diff[0]} 에피머`;
    return `부분입체 (${diff.length}곳 다름)`;
  }

  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, col, font, al) { ctx.fillStyle = col; ctx.font = font; ctx.textAlign = al || "center"; ctx.fillText(s, x, y); }

  function drawFischer(w, h) {
    const cx = w * 0.24, top = 46, dy = (h - top - 34) / 5;
    txt("피셔 투영식", cx, 20, C.ink2, `600 12px ${F.sans}`);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(cx, top + 9); ctx.lineTo(cx, top + 5 * dy - 11); ctx.stroke();
    for (let i = 1; i <= 6; i++) {
      const y = top + (i - 1) * dy;
      /* 탄소 번호 */
      txt(String(i), cx - w * 0.17, y + 4, C.ink3, `10px ${F.mono}`);
      if (i === 1) { txt(kind === "aldo" ? "CHO" : "CH₂OH", cx, y + 5, C.ink, `600 13px ${F.mono}`); continue; }
      if (i === 6) { txt("CH₂OH", cx, y + 5, C.ink, `600 13px ${F.mono}`); continue; }
      if (i === 2 && kind === "keto") {
        ctx.fillStyle = C.card; ctx.fillRect(cx - 9, y - 9, 18, 18);
        txt("C", cx, y + 5, C.ink, `600 13px ${F.mono}`);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(cx + 9, y - 2); ctx.lineTo(cx + 34, y - 2); ctx.moveTo(cx + 9, y + 2); ctx.lineTo(cx + 34, y + 2); ctx.stroke();
        txt("O", cx + 42, y + 5, C.ink, `600 13px ${F.mono}`);
        continue;
      }
      const right = cfg[i];
      const changed = kind === "aldo" && right !== GLC[i];
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(cx - 38, y); ctx.lineTo(cx + 38, y); ctx.stroke();
      ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(cx, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, y, 2.4, 0, Math.PI * 2); ctx.fill();
      const ohCol = changed ? C.warn : C.forest;
      txt("OH", right ? cx + 52 : cx - 52, y + 4, ohCol, `600 13px ${F.mono}`);
      txt("H", right ? cx - 46 : cx + 46, y + 4, C.ink2, `13px ${F.mono}`);
    }
    txt("주황 −OH: D-포도당과 다른 자리", cx, h - 8, C.warn, `10.5px ${F.sans}`);
  }

  function drawHaworth(w, h) {
    const hx = w * 0.73, hy = h * 0.5, s = Math.min(w * 0.235, h * 0.42);
    txt("하워스 투영식 (6각 고리)", hx, 20, C.ink2, `600 12px ${F.sans}`);
    if (kind === "keto") {
      const lines = ["수용액의 과당은 6각 고리(약 70 %)와", "5각 고리(퓨라노스, 약 22 %)가", "섞여 있고, 설탕 속에서는", "5각 고리로 들어 있습니다.", "", "포도당과 원자의 연결", "순서가 다르므로", "구조 이성질체입니다."];
      lines.forEach((l, i) => txt(l, hx, 70 + i * 19, C.ink2, `12.5px ${F.sans}`));
      return;
    }
    const P = { 5: [-0.6, -0.28], O: [0.22, -0.28], 1: [0.9, 0.06], 2: [0.5, 0.4], 3: [-0.3, 0.4], 4: [-0.98, 0.06] };
    const xy = (k) => [hx + P[k][0] * s, hy + P[k][1] * s];
    const order = ["5", "O", "1", "2", "3", "4", "5"];
    for (let i = 0; i < 6; i++) {
      const a = xy(order[i]), b = xy(order[i + 1]);
      const front = ["1-2", "2-3", "3-4"].includes(order[i] + "-" + order[i + 1]);
      ctx.strokeStyle = C.ink; ctx.lineWidth = front ? 4.5 : 1.6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    const [ox, oy] = xy("O");
    ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(ox, oy, 9, 0, Math.PI * 2); ctx.fill();
    txt("O", ox, oy + 5, C.apple, `600 13px ${F.mono}`);
    const sub = (k, upLab, downLab, upCol, downCol) => {
      const [x, y] = xy(k);
      const back = k === "5", Lu = s * 0.34, Ld = back ? s * 0.16 : s * 0.34;
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.3; ctx.lineCap = "butt";
      ctx.beginPath(); ctx.moveTo(x, y - Lu); ctx.lineTo(x, y + Ld); ctx.stroke();
      txt(upLab, x, y - Lu - 5, upCol, `600 12px ${F.mono}`);
      txt(downLab, x, y + Ld + 14, downCol, `600 12px ${F.mono}`);
      /* 탄소 번호는 고리 안쪽에 */
      txt(k, x + (hx - x) * 0.22 + (x < hx ? 6 : -6), y + (hy - y) * 0.3 + 4, C.ink3, `10px ${F.mono}`);
    };
    const D = cfg[5];
    for (const k of [2, 3, 4]) {
      const right = cfg[k], changed = right !== GLC[k];
      const col = changed ? C.warn : C.forest;
      if (right) sub(String(k), "H", "OH", C.ink2, col); else sub(String(k), "OH", "H", col, C.ink2);
    }
    if (D) sub("5", "CH₂OH", "H", C.ink, C.ink2); else sub("5", "H", "CH₂OH", C.ink2, C.ink);
    /* α: C1 −OH가 CH₂OH와 반대쪽 */
    const ohUp = alpha ? !D : D;
    if (ohUp) sub("1", "OH", "H", C.amber, C.ink2); else sub("1", "H", "OH", C.ink2, C.amber);
    txt(alpha ? "α 아노머: C1 −OH가 CH₂OH와 반대쪽" : "β 아노머: C1 −OH가 CH₂OH와 같은 쪽", hx, h - 8, "#b07b10", `10.5px ${F.sans}`);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.47, 10); ctx.lineTo(w * 0.47, h - 24); ctx.stroke();
    drawFischer(w, h); drawHaworth(w, h);
  }

  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === pre)));
    root.querySelectorAll("[data-f]").forEach((b) => { b.disabled = kind === "keto" && b.dataset.f === "2"; });
    bAno.disabled = kind === "keto";
    bAno.setAttribute("aria-pressed", String(!alpha));
    bAno.textContent = alpha ? "고리의 C1: α → β로" : "고리의 C1: β → α로";
    const nm = name();
    nName.textContent = kind === "aldo" ? `${alpha ? "α" : "β"}-${nm}` : nm;
    nRel.textContent = relation();
    nRel.className = "n-rel" + (relation() === "같은 물질" ? " good" : "");
    let poly = "—";
    if (kind === "aldo" && nm === "D-포도당") poly = alpha ? "녹말 (아밀로스)" : "셀룰로스";
    nPoly.textContent = poly;
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    pre = b.dataset.p; kind = PRE[pre][0]; cfg = { ...PRE[pre][1] }; update();
  }));
  root.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => {
    const k = +b.dataset.f; cfg[k] = !cfg[k]; pre = ""; update();
  }));
  bAno.addEventListener("click", () => { alpha = !alpha; update(); });
  update();
})();
