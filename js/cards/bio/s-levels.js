/* 카드: 세포에서 개체까지 — 동물과 식물의 구성 단계를 확대·축소하며 보기 (모식도) */
(() => {
  const root = document.getElementById("card-bio-levels");
  if (!root) return;
  const { C, F, clamp, ease, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), slider = $(".lv"), lvChips = $(".lv-chips");
  const VW = 400, VH = 300;
  let mode = "animal", t = 0, anim = 0;

  const RED = "#c9555a", BLUE = "#5a7fb5", PINK = "#eaa7aa", PINK2 = "#d98589", NUC = "#7a5a9a";
  const WALL = "#6f8f4f", CHL = "#4f9a3a", VAC = "#e4efe0";

  /* ── 공통 그리기 도구 ── */
  function label(g, s, x, y, o = {}) {
    g.font = `${o.w || 500} ${o.size || 12}px ${F.sans}`;
    g.textAlign = o.align || "left";
    if (o.bg) { const m = g.measureText(s).width, x0 = o.align === "center" ? x - m / 2 : o.align === "right" ? x - m : x; g.fillStyle = "rgba(251,251,248,.85)"; g.fillRect(x0 - 3, y - 11, m + 6, 15); }
    g.fillStyle = o.c || C.ink2; g.fillText(s, x, y); g.textAlign = "left";
  }
  function leader(g, x0, y0, x1, y1) { g.strokeStyle = C.ink3; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
  function inset(g, r, drawInner) {
    const [x, y, w, h] = r;
    g.save();
    g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = C.card; g.fillRect(x, y, w, h);
    g.translate(x, y); g.scale(w / VW, h / VH); drawInner(g);
    g.restore();
    g.strokeStyle = C.ink; g.lineWidth = 1.2; g.setLineDash([4, 3]); g.strokeRect(x, y, w, h); g.setLineDash([]);
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }

  /* ── 동물: 세포 → 조직 → 기관 → 기관계 → 개체 ── */
  function aCell(g, full) {
    g.fillStyle = PINK; g.strokeStyle = PINK2; g.lineWidth = 3;
    g.beginPath();
    g.moveTo(70, 118); g.lineTo(270, 118); g.lineTo(320, 82); g.lineTo(338, 100); g.lineTo(296, 132);
    g.lineTo(296, 168); g.lineTo(338, 200); g.lineTo(320, 218); g.lineTo(270, 182); g.lineTo(70, 182); g.closePath();
    g.fill(); g.stroke();
    g.save(); g.clip();
    g.strokeStyle = "rgba(160,70,80,.35)"; g.lineWidth = 1.6;
    for (let x = 74; x < 340; x += 7) { g.beginPath(); g.moveTo(x, 60); g.lineTo(x, 240); g.stroke(); }
    g.restore();
    g.fillStyle = "#3a2a3a"; g.fillRect(66, 116, 6, 68); // 사이원반
    g.beginPath(); g.ellipse(180, 150, 26, 12, 0, 0, Math.PI * 2); g.fillStyle = NUC; g.fill();
    if (!full) return;
    label(g, "핵", 180, 210, { align: "center", c: C.ink });
    leader(g, 180, 198, 180, 163);
    label(g, "가로무늬", 120, 100, { align: "center" }); leader(g, 120, 104, 120, 122);
    label(g, "이웃 세포와 이어지는 곳", 30, 222); leader(g, 69, 208, 69, 186);
    label(g, "가지를 쳐 이웃 세포와 연결", 395, 260, { align: "right" }); leader(g, 330, 248, 326, 214);
  }
  const A1R = [150, 112.5, 100, 75];
  function aTissue(g, full) {
    g.fillStyle = "#f3dcdc"; g.fillRect(0, 0, VW, VH);
    for (let row = -2; row <= 3; row++) for (let col = -2; col <= 3; col++) {
      const ox = A1R[0] + col * 72 + (row % 2 ? 36 : 0) - (row % 2 ? 0 : 0), oy = A1R[1] + row * 20;
      if (row === 0 && col === 0) continue;
      g.save(); g.translate(ox, oy + ((col * 7) % 5)); g.scale(0.25, 0.25); aCell(g, false); g.restore();
    }
    g.save(); g.translate(A1R[0], A1R[1]); g.scale(0.25, 0.25); aCell(g, false); g.restore();
    if (!full) return;
    g.strokeStyle = C.ink; g.lineWidth = 1.2; g.setLineDash([4, 3]); g.strokeRect(...A1R); g.setLineDash([]);
    label(g, "심장근 세포 하나", 200, 205, { align: "center", c: C.ink, bg: 1 });
    label(g, "비슷한 세포가 모여 같은 일을 합니다", 200, 285, { align: "center", bg: 1 });
  }
  const A2R = [214, 176, 72, 54];
  function heartPath(g) {
    g.beginPath();
    g.moveTo(200, 262);
    g.bezierCurveTo(150, 230, 108, 180, 118, 128);
    g.bezierCurveTo(126, 92, 168, 84, 196, 104);
    g.bezierCurveTo(226, 82, 282, 90, 286, 134);
    g.bezierCurveTo(292, 184, 246, 232, 200, 262);
    g.closePath();
  }
  function aHeart(g, full) {
    // 대동맥, 폐동맥
    g.lineCap = "round";
    g.strokeStyle = RED; g.lineWidth = 22;
    g.beginPath(); g.moveTo(206, 110); g.bezierCurveTo(206, 50, 250, 40, 268, 70); g.stroke();
    g.strokeStyle = BLUE; g.lineWidth = 18;
    g.beginPath(); g.moveTo(178, 112); g.lineTo(158, 58); g.stroke();
    g.strokeStyle = "#8a9fc4"; g.lineWidth = 14; g.beginPath(); g.moveTo(262, 110); g.lineTo(300, 76); g.stroke();
    g.lineCap = "butt";
    heartPath(g); g.fillStyle = RED; g.fill();
    g.strokeStyle = "#a63e44"; g.lineWidth = 2; g.stroke();
    // 관상 혈관
    g.strokeStyle = "rgba(255,230,200,.8)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(196, 110); g.bezierCurveTo(186, 150, 206, 190, 200, 250); g.stroke();
    g.beginPath(); g.moveTo(200, 150); g.bezierCurveTo(230, 150, 250, 170, 262, 190); g.stroke();
    if (!full) return;
    inset(g, A2R, (h) => aTissue(h, false));
    label(g, "대동맥", 276, 60, { c: C.ink });
    label(g, "폐동맥", 110, 50, { c: C.ink });
    label(g, "심장근 조직", 250, 246, { c: C.ink, bg: 1 });
    label(g, "+ 결합 조직(판막, 혈관 벽)", 10, 272);
    label(g, "+ 신경 조직, 상피 조직", 10, 288);
  }
  function body(g, fill, stroke) {
    g.fillStyle = fill; g.strokeStyle = stroke; g.lineWidth = 1.5;
    g.beginPath(); g.arc(200, 38, 22, 0, Math.PI * 2); g.fill(); g.stroke();
    rr(g, 170, 66, 60, 112, 18); g.fill(); g.stroke();
    g.lineCap = "round";
    for (const [x0, y0, x1, y1, wd] of [[172, 76, 142, 170, 16], [228, 76, 258, 170, 16], [186, 170, 180, 288, 22], [214, 170, 220, 288, 22]]) {
      g.strokeStyle = stroke; g.lineWidth = wd + 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = fill; g.lineWidth = wd; g.stroke();
    }
    g.lineCap = "butt";
    rr(g, 172, 68, 56, 108, 16); g.fillStyle = fill; g.fill();
  }
  const A3R = [180, 84, 32, 24];
  function vessels(g, a) {
    g.globalAlpha = a; g.lineWidth = 2;
    const paths = [[[196, 96], [196, 60], [200, 30]], [[196, 96], [150, 110], [144, 165]], [[204, 96], [252, 110], [256, 165]], [[196, 100], [190, 170], [182, 280]], [[204, 100], [210, 170], [218, 280]]];
    paths.forEach((p, i) => {
      g.strokeStyle = RED; g.beginPath(); g.moveTo(...p[0]); g.quadraticCurveTo(...p[1], ...p[2]); g.stroke();
      g.strokeStyle = BLUE; g.beginPath(); g.moveTo(p[0][0] + (i % 2 ? 4 : -4), p[0][1]); g.quadraticCurveTo(p[1][0] + 5, p[1][1], p[2][0] + 5, p[2][1]); g.stroke();
    });
    g.globalAlpha = 1;
  }
  function aSystem(g, full) {
    body(g, "#f0ede6", "#cfcac0");
    vessels(g, 1);
    g.save(); g.translate(A3R[0], A3R[1]); g.scale(A3R[2] / VW, A3R[3] / VH); heartPath(g); g.restore();
    g.fillStyle = RED; g.fill();
    if (!full) return;
    g.strokeStyle = C.ink; g.lineWidth = 1.2; g.setLineDash([3, 3]); g.strokeRect(...A3R); g.setLineDash([]);
    label(g, "심장", 268, 90, { c: C.ink }); leader(g, 266, 88, 214, 94);
    label(g, "동맥", 300, 150, { c: RED }); label(g, "정맥", 300, 168, { c: BLUE });
    label(g, "심장 + 혈관 = 순환계", 20, 290, { c: C.ink });
  }
  function aOrganism(g, full) {
    body(g, "#f0ede6", "#cfcac0");
    vessels(g, 0.35);
    // 호흡계: 폐
    g.fillStyle = "rgba(120,150,190,.75)";
    g.beginPath(); g.ellipse(186, 98, 11, 20, 0.1, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(214, 98, 11, 20, -0.1, 0, Math.PI * 2); g.fill();
    // 소화계
    g.strokeStyle = "#b07a3a"; g.lineWidth = 4; g.lineCap = "round";
    g.beginPath(); g.moveTo(200, 60); g.lineTo(200, 118); g.quadraticCurveTo(214, 122, 208, 132);
    for (let k = 0; k < 4; k++) g.quadraticCurveTo(182 + (k % 2) * 36, 138 + k * 8, 196 + (k % 2 ? -8 : 8), 142 + k * 8);
    g.stroke();
    // 신경계
    g.strokeStyle = C.amber; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(200, 50); g.lineTo(200, 170); g.stroke();
    g.fillStyle = "rgba(224,160,42,.6)"; g.beginPath(); g.ellipse(200, 32, 14, 10, 0, 0, Math.PI * 2); g.fill();
    // 배설계: 콩팥
    g.fillStyle = "#8a4b3c";
    g.beginPath(); g.ellipse(184, 150, 5, 8, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(216, 150, 5, 8, 0, 0, Math.PI * 2); g.fill();
    g.lineCap = "butt";
    if (!full) return;
    const L = [["신경계", C.amber, 62], ["호흡계", BLUE, 92], ["순환계", RED, 112], ["소화계", "#b07a3a", 132], ["배설계", "#8a4b3c", 152]];
    L.forEach(([s, c, y]) => { label(g, s, 290, y + 4, { c, w: 600 }); leader(g, 286, y, 234, y); });
    label(g, "여러 기관계가 함께 일하는 하나의 생명체", 20, 292, { c: C.ink });
  }

  /* ── 식물: 세포 → 조직 → 조직계 → 기관 → 개체 ── */
  function pCell(g, full) {
    rr(g, 170, 40, 60, 220, 18); g.fillStyle = "#f4f8ee"; g.fill();
    g.lineWidth = 6; g.strokeStyle = WALL; g.stroke();
    rr(g, 180, 62, 40, 176, 12); g.fillStyle = VAC; g.fill();
    g.fillStyle = CHL;
    for (let k = 0; k < 9; k++) {
      g.beginPath(); g.ellipse(177, 58 + k * 23, 4, 9, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(223, 70 + k * 22, 4, 9, 0, 0, Math.PI * 2); g.fill();
    }
    g.beginPath(); g.ellipse(200, 52, 9, 4, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(200, 248, 9, 4, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(210, 150, 8, 0, Math.PI * 2); g.fillStyle = NUC; g.fill();
    if (!full) return;
    label(g, "세포벽", 250, 40, { c: C.ink }); leader(g, 248, 36, 229, 52);
    label(g, "엽록체", 70, 110, { c: CHL, w: 600 }); leader(g, 110, 106, 172, 104);
    label(g, "액포", 70, 200, { c: C.ink }); leader(g, 98, 196, 192, 190);
    label(g, "핵", 262, 154, { c: C.ink }); leader(g, 258, 150, 219, 150);
  }
  const P1K = 0.35, P1X = 130, P1Y = 97.5;
  function pTissue(g, full) {
    // 표피(위)와 해면 조직(아래)은 흐리게
    g.fillStyle = "#eef3f6"; g.fillRect(0, 89, VW, 22);
    g.strokeStyle = "rgba(90,127,181,.5)"; g.lineWidth = 1;
    for (let x = 0; x < VW; x += 46) g.strokeRect(x + .5, 89.5, 46, 21);
    g.fillStyle = "rgba(143,191,94,.25)";
    for (let k = 0; k < 16; k++) { g.beginPath(); g.ellipse((k * 53) % 420, 215 + (k % 3) * 30, 20, 13, k, 0, Math.PI * 2); g.fill(); }
    for (let j = -7; j <= 12; j++) {
      g.save(); g.translate(P1X + j * 22, P1Y); g.scale(P1K, P1K); pCell(g, false); g.restore();
    }
    if (!full) return;
    g.strokeStyle = C.ink; g.lineWidth = 1.2; g.setLineDash([4, 3]); g.strokeRect(P1X, P1Y, VW * P1K, VH * P1K); g.setLineDash([]);
    label(g, "표피 조직", 8, 80, { c: BLUE });
    label(g, "울타리 조직", 8, 206, { c: C.ink, w: 700, bg: 1 });
    label(g, "해면 조직", 8, 280, { c: "#6d9a3e" });
  }
  const P2K = 0.45, P2X = 110, P2Y = 40;
  function pSystem(g, full) {
    const y0 = 80, epi = 10, pal = 35, spo = 50;
    g.fillStyle = "#dfe9f3"; g.fillRect(0, y0, VW, epi); g.fillRect(0, y0 + epi + pal + spo, VW, epi);
    g.fillStyle = "#cfe3bf"; g.fillRect(0, y0 + epi, VW, pal);
    g.fillStyle = "#e6f0da"; g.fillRect(0, y0 + epi + pal, VW, spo);
    g.strokeStyle = "rgba(79,154,58,.45)"; g.lineWidth = 1;
    for (let x = 0; x < VW; x += 8) { g.beginPath(); g.moveTo(x, y0 + epi); g.lineTo(x, y0 + epi + pal); g.stroke(); }
    g.fillStyle = "rgba(143,191,94,.55)";
    for (let k = 0; k < 30; k++) { g.beginPath(); g.ellipse((k * 29) % 400, y0 + epi + pal + 10 + (k % 3) * 14, 8, 5, k, 0, Math.PI * 2); g.fill(); }
    // 관다발
    g.beginPath(); g.arc(340, 150, 22, 0, Math.PI * 2); g.fillStyle = "#f3dfae"; g.fill(); g.strokeStyle = "#b8862b"; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#b8862b"; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(328 + k * 6, 142, 3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#d7a95a"; g.beginPath(); g.ellipse(340, 160, 12, 5, 0, 0, Math.PI * 2); g.fill();
    // 기공
    for (const x of [60, 250]) { g.fillStyle = CHL; g.beginPath(); g.ellipse(x - 5, 180, 5, 4, 0, 0, Math.PI * 2); g.ellipse(x + 5, 180, 5, 4, 0, 0, Math.PI * 2); g.fill(); }
    if (!full) return;
    inset(g, [P2X, P2Y, VW * P2K, VH * P2K], (h) => pTissue(h, false));
    label(g, "표피 조직계", 8, 30, { c: BLUE, w: 700 }); leader(g, 40, 34, 40, 82);
    label(g, "기본 조직계", 8, 240, { c: "#4f7f2a", w: 700 }); label(g, "울타리·해면 조직", 8, 256); leader(g, 50, 226, 50, 150);
    label(g, "관다발 조직계", 392, 222, { c: "#9b6f1f", w: 700, align: "right" }); label(g, "물관·체관", 392, 238, { align: "right" }); leader(g, 340, 206, 340, 172);
    label(g, "기공", 250, 205, { align: "center" });
    label(g, "잎의 단면", 392, 30, { align: "right", c: C.ink3 });
  }
  const P3R = [206, 128, 60, 45];
  function leafPath(g) {
    g.beginPath(); g.moveTo(60, 150); g.bezierCurveTo(120, 50, 280, 50, 340, 150); g.bezierCurveTo(280, 250, 120, 250, 60, 150); g.closePath();
  }
  function pLeaf(g, full) {
    g.strokeStyle = "#5b7d33"; g.lineWidth = 4; g.beginPath(); g.moveTo(20, 170); g.lineTo(62, 150); g.stroke();
    leafPath(g); g.fillStyle = C.leaf; g.fill(); g.strokeStyle = "#4f7f2a"; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = "#d9ecc9"; g.lineWidth = 2; g.beginPath(); g.moveTo(60, 150); g.lineTo(340, 150); g.stroke();
    g.lineWidth = 1.2;
    for (let k = 0; k < 6; k++) { const x = 90 + k * 40; g.beginPath(); g.moveTo(x, 150); g.lineTo(x + 30, 150 - 55 + k * 3); g.moveTo(x, 150); g.lineTo(x + 30, 150 + 55 - k * 3); g.stroke(); }
    if (!full) return;
    g.strokeStyle = C.ink; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(236, 70); g.lineTo(236, 230); g.stroke(); g.setLineDash([]);
    inset(g, P3R, (h) => pSystem(h, false));
    label(g, "여기를 자른 단면", 236, 62, { align: "center", c: C.ink });
    label(g, "잎맥(관다발)", 70, 280, { c: C.ink2 }); leader(g, 110, 268, 130, 152);
    label(g, "잎 = 영양 기관", 392, 290, { align: "right", c: C.ink });
  }
  const P4R = [214, 92, 48, 36];
  function pPlant(g, full) {
    g.fillStyle = "#e8e0d2"; g.fillRect(0, 232, VW, 68);
    g.strokeStyle = "#9b7a55"; g.lineWidth = 2;
    for (const [dx, dy] of [[-40, 50], [30, 55], [-15, 62], [55, 30], [-60, 25]]) { g.beginPath(); g.moveTo(200, 232); g.quadraticCurveTo(200 + dx * .4, 232 + dy * .6, 200 + dx, 232 + dy); g.stroke(); }
    g.strokeStyle = "#5b7d33"; g.lineWidth = 4; g.beginPath(); g.moveTo(200, 232); g.lineTo(200, 40); g.stroke();
    const leaves = [[200, 180, -1], [200, 140, 1], [200, 100, -1]];
    leaves.forEach(([x, y, s]) => {
      g.save(); g.translate(x, y); g.scale(s * 0.2, 0.2); g.translate(-20, -170); leafPath(g); g.restore();
      g.fillStyle = C.leaf; g.fill();
    });
    g.save(); g.translate(P4R[0], P4R[1]); g.scale(P4R[2] / VW, P4R[3] / VH); leafPath(g); g.restore();
    g.fillStyle = C.leaf; g.fill();
    g.fillStyle = "#e7b6c8"; for (let k = 0; k < 5; k++) { const a = k * 1.256; g.beginPath(); g.arc(200 + 9 * Math.cos(a), 34 + 9 * Math.sin(a), 7, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = C.amber; g.beginPath(); g.arc(200, 34, 5, 0, Math.PI * 2); g.fill();
    if (!full) return;
    g.strokeStyle = C.ink; g.lineWidth = 1.2; g.setLineDash([3, 3]); g.strokeRect(...P4R); g.setLineDash([]);
    label(g, "꽃 (생식 기관)", 222, 30, { c: C.ink });
    label(g, "잎", 280, 108, { c: C.ink });
    label(g, "줄기", 120, 160, { c: C.ink }); leader(g, 146, 156, 198, 156);
    label(g, "뿌리", 120, 272, { c: C.ink }); leader(g, 146, 268, 176, 262);
    label(g, "영양 기관: 뿌리·줄기·잎", 392, 196, { align: "right" });
  }

  const M = {
    animal: {
      draw: [aCell, aTissue, aHeart, aSystem, aOrganism],
      rect: [null, A1R, A2R, A3R, [0, 0, VW, VH]],
      fw: [150e-6, 600e-6, 0.24, 2.4, 2.4],
      name: ["세포", "조직", "기관", "기관계", "개체"],
      ex: ["심장근 세포", "심장근 조직", "심장", "순환계", "사람"],
      note: [
        "생명 활동의 기본 단위입니다. 심장근 세포는 가로무늬가 있고, 가지를 쳐 이웃 세포와 이어져 한꺼번에 수축합니다.",
        "모양과 기능이 비슷한 세포의 모임입니다. 동물의 조직은 상피 조직, 결합 조직, 근육 조직, 신경 조직으로 나눕니다.",
        "여러 조직이 모여 일정한 기능을 하는 단위입니다. 심장에는 근육 조직만 있는 것이 아니라 판막과 혈관 벽의 결합 조직, 신경 조직, 상피 조직이 함께 있습니다.",
        "관련된 기관이 모여 함께 일하는 단위입니다. 심장과 혈관은 순환계를 이룹니다. 식물에는 없는 단계입니다.",
        "여러 기관계가 서로 도우며 살아가는 하나의 생명체입니다. 소화계, 호흡계, 순환계, 배설계, 신경계 등이 함께 작용합니다.",
      ],
    },
    plant: {
      draw: [pCell, pTissue, pSystem, pLeaf, pPlant],
      rect: [null, [P1X, P1Y, VW * P1K, VH * P1K], [P2X, P2Y, VW * P2K, VH * P2K], P3R, P4R],
      fw: [91e-6, 260e-6, 580e-6, 0.14, 0.57],
      name: ["세포", "조직", "조직계", "기관", "개체"],
      ex: ["울타리 조직 세포", "울타리 조직", "잎의 조직계", "잎", "강낭콩"],
      note: [
        "세포벽으로 둘러싸여 있고, 엽록체와 큰 액포가 있는 식물 세포입니다.",
        "모양과 기능이 비슷한 세포의 모임입니다. 식물의 조직은 계속 분열하는 분열 조직과, 분열을 멈추고 역할이 정해진 영구 조직(표피·울타리·해면·물관·체관 조직 등)으로 나눕니다.",
        "여러 조직이 모여 이룬 단위로, 표피 조직계·관다발 조직계·기본 조직계가 있습니다. 세 조직계는 뿌리에서 잎까지 식물 몸 전체에 이어져 있습니다. 동물에는 없는 단계입니다.",
        "여러 조직계가 모여 일정한 기능을 하는 단위입니다. 뿌리·줄기·잎은 영양 기관, 꽃·열매는 생식 기관입니다.",
        "여러 기관이 모여 이룬 하나의 식물입니다. 식물에는 기관계 단계가 없습니다.",
      ],
    },
  };

  const { ctx, size } = fit(cv, () => draw());

  function fmtLen(m) {
    if (m < 1e-3) return `${+(m * 1e6).toPrecision(2)} μm`;
    if (m < 1e-2) return `${+(m * 1e3).toPrecision(2)} mm`;
    if (m < 1) return `${+(m * 100).toPrecision(2)} cm`;
    return `${+m.toPrecision(2)} m`;
  }
  function nice(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); const f = v / p; return (f >= 5 ? 5 : f >= 2 ? 2 : 1) * p; }
  function fieldWidth() {
    const m = M[mode], i = Math.min(3, Math.floor(t)), f = t - i;
    return m.fw[i] * Math.pow(m.fw[i + 1] / m.fw[i], ease(f));
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const m = M[mode];
    const dpr = cv.width / w, s = w / VW;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    const i = Math.min(3, Math.floor(t)), f = t - i;
    const r = m.rect[i + 1], k = r[2] / VW;
    const e = ease(f);
    ctx.save();
    if (k < 0.999) {
      const z = Math.pow(1 / k, 1 - e), Px = r[0] / (1 - k), Py = r[1] / (1 - k);
      ctx.translate(Px, Py); ctx.scale(z, z); ctx.translate(-Px, -Py);
    }
    m.draw[i + 1](ctx, true);
    const a = 1 - clamp(f / 0.55, 0, 1);
    if (a > 0) {
      ctx.save(); ctx.globalAlpha = a;
      ctx.translate(r[0], r[1]); ctx.scale(k, k);
      ctx.fillStyle = C.card; ctx.fillRect(0, 0, VW, VH);
      m.draw[i](ctx, true);
      ctx.restore();
    }
    ctx.restore();
    // 축척 막대
    const fw = fieldWidth(), target = fw * 0.25, bar = nice(target), px = bar / fw * VW;
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(VW - px - 16, 6, px + 12, 30);
    ctx.fillStyle = C.ink; ctx.fillRect(VW - px - 10, 26, px, 3);
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(fmtLen(bar), VW - 10 - px / 2, 20); ctx.textAlign = "left";
  }

  function update() {
    const m = M[mode], n = Math.round(t);
    $(".lv-name").textContent = m.name[n];
    $(".lv-ex").textContent = m.ex[n];
    $(".lv-fw").textContent = fmtLen(fieldWidth());
    $(".lv-note").textContent = m.note[n];
    lvChips.querySelectorAll("button").forEach((b, j) => { b.textContent = m.name[j]; b.setAttribute("aria-pressed", j === n && Math.abs(t - n) < 0.02); });
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === mode));
    slider.value = t;
    draw();
  }
  function goTo(target) {
    cancelAnimationFrame(anim);
    const t0 = t, T = NM.reduce ? 1 : 900 * Math.max(0.5, Math.abs(target - t0) ** 0.6), start = performance.now();
    const step = (now) => {
      const p = clamp((now - start) / T, 0, 1);
      t = t0 + (target - t0) * p; update();
      if (p < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  slider.addEventListener("input", () => { cancelAnimationFrame(anim); t = +slider.value; update(); });
  lvChips.querySelectorAll("button").forEach((b, j) => b.addEventListener("click", () => goTo(j)));
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; update(); }));
  update();
})();
