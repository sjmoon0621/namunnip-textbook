/* 카드: 채집한 곤충과 풀을 연구에 쓸 수 있는 표본으로 만들려면 무엇이 필요할까? — 검색표 동정, 핀 위치, 라벨 점검, 채집 윤리, 압착 건조 무게 측정 */
(() => {
  const root = document.getElementById("card-labbio-specimen");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 검색표: t = 이 질문에 '예'가 되는 형질 */
  const KEY = [
    { q: "날개가 한 쌍뿐이고, 뒷날개 자리에 작은 곤봉(평균곤)이 있는가?", t: "fly", yes: "파리목", no: 1 },
    { q: "앞날개가 단단한 딱지날개이고, 배 위에서 좌우가 일직선으로 맞닿는가?", t: "ely", yes: "딱정벌레목", no: 2 },
    { q: "날개가 비늘가루로 덮여 색과 무늬가 있는가?", t: "sca", yes: "나비목", no: 3 },
    { q: "등에 삼각형 작은방패판이 있고, 앞날개는 밑부분이 단단하고 끝이 얇은 막인가?", t: "hem", yes: "노린재목", no: 4 },
    { q: "뒷다리 넓적다리가 굵어 뛰기에 알맞고, 앞날개가 좁고 가죽 같은가?", t: "jmp", yes: "메뚜기목", no: 5 },
    { q: "더듬이가 아주 짧고, 그물맥 날개 네 장을 쉴 때 접지 못하는가?", t: "odo", yes: "잠자리목", no: "벌목" },
  ];
  /* 채집물: 이름은 등록 뒤에 보여 준다. pin = 알맞은 핀 자리(몸길이 단위, 머리 쪽이 위) */
  const INS = [
    { name: "장수풍뎅이", ord: "딱정벌레목", t: "ely", pin: [0.09, -0.06, 0.07], pinTxt: "오른쪽 딱지날개 앞쪽" },
    { name: "배추흰나비", ord: "나비목", t: "sca", pin: [0, -0.2, 0.05], pinTxt: "가슴 한가운데" },
    { name: "벼메뚜기", ord: "메뚜기목", t: "jmp", pin: [0.035, -0.2, 0.045], pinTxt: "앞가슴등판의 중앙선 약간 오른쪽" },
    { name: "썩덩나무노린재", ord: "노린재목", t: "hem", pin: [0.02, -0.06, 0.06], pinTxt: "작은방패판" },
    { name: "집파리", ord: "파리목", t: "fly", pin: [0.04, -0.18, 0.05], pinTxt: "가슴의 중앙선 약간 오른쪽" },
    { name: "고추잠자리", ord: "잠자리목", t: "odo", pin: [0, -0.24, 0.05], pinTxt: "가슴 한가운데" },
    { name: "꿀벌", ord: "벌목", t: "bee", pin: [0.04, -0.2, 0.05], pinTxt: "가슴의 중앙선 약간 오른쪽" },
    { name: "장수하늘소", ord: "딱정벌레목", t: "ely", pin: [0.09, -0.04, 0.07], pinTxt: "오른쪽 딱지날개 앞쪽", protect: "천연기념물이자 멸종위기 야생생물 Ⅰ급" },
  ];
  const FIELD = { date: "채집 날짜", loc: "장소", gps: "위도·경도", who: "채집자", hab: "서식지·방법", det: "동정" };
  const MUST = ["date", "loc", "gps", "who"];

  let mode = "ins", sp = 0, node = 0, trail = [], answer = null, pin = null, place = "school";
  const plant = { day: 0, W: 1, every: 1, wet: 0, last: null, done: 0 };
  const M0 = 15.0, MD = 2.2;

  const log = L.table($(".sp-log"), [{ key: "no", label: "표본" }, { key: "id", label: "동정" }, { key: "pin", label: "핀·건조" }, { key: "lab", label: "라벨 필수" }, { key: "v", label: "판정" }]);
  const dry = L.table($(".sp-dry"), [{ key: "d", label: "날", res: 1 }, { key: "m", label: "무게 (g)", res: 0.1 }, { key: "c", label: "흡습지 교체" }], () => draw());

  const fields = () => [...root.querySelectorAll("[data-f]")].filter((x) => x.checked).map((x) => x.dataset.f);

  /* ---------- 검색표 ---------- */
  function showKey() {
    const k = typeof node === "number" ? KEY[node] : null;
    $(".sp-q").innerHTML = k ? `<b>${node + 1}.</b> ${k.q}` : `<b>결과:</b> ${answer}`;
    $(".sp-yes").disabled = !k; $(".sp-no").disabled = !k;
    $(".sp-trail").textContent = trail.length ? "지나온 길: " + trail.join(" → ") : "그림을 보고 질문에 답하세요.";
  }
  function step(yes) {
    const k = KEY[node]; if (!k) return;
    trail.push(`${node + 1}${yes ? " 예" : " 아니요"}`);
    const nx = yes ? k.yes : k.no;
    if (typeof nx === "number") node = nx; else { node = null; answer = nx; }
    showKey();
  }
  function restart() { node = 0; trail = []; answer = null; showKey(); }

  /* ---------- 그림 ---------- */
  const { ctx, size } = fit($("canvas"), () => draw());
  let geo = null;   // 곤충 그림의 중심과 크기 (클릭 좌표 변환용)
  function ell(x, y, rx, ry, fill, stroke, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); } }
  function line(pts, col, lw) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.lineWidth = 1; }
  function legs(s, col, jump) {
    for (const sg of [-1, 1]) {
      line([[sg * 0.05 * s, -0.25 * s], [sg * 0.2 * s, -0.33 * s], [sg * 0.26 * s, -0.42 * s]], col, 1.6);
      line([[sg * 0.05 * s, -0.2 * s], [sg * 0.24 * s, -0.18 * s], [sg * 0.3 * s, -0.08 * s]], col, 1.6);
      if (jump) { ell(sg * 0.13 * s, 0.02 * s, 0.045 * s, 0.2 * s, "#8aa84a", "#4f6a22", sg * -0.25); line([[sg * 0.18 * s, 0.2 * s], [sg * 0.14 * s, 0.42 * s]], col, 1.6); }
      else line([[sg * 0.05 * s, -0.15 * s], [sg * 0.24 * s, 0.02 * s], [sg * 0.3 * s, 0.2 * s]], col, 1.6);
    }
  }
  function antennae(s, len, col, clubbed) {
    for (const sg of [-1, 1]) {
      line([[sg * 0.02 * s, -0.42 * s], [sg * 0.08 * s, -(0.42 + len * 0.6) * s], [sg * 0.12 * s, -(0.42 + len) * s]], col, 1.3);
      if (clubbed) ell(sg * 0.12 * s, -(0.42 + len) * s, 0.012 * s, 0.02 * s, col);
    }
  }
  function insect(i, s) {
    const ink = "#2a2a2a";
    ctx.save();
    switch (i) {
      case 0: /* 장수풍뎅이 */
        legs(s, ink); ell(0, -0.36 * s, 0.07 * s, 0.06 * s, "#3d2618", ink);
        line([[0, -0.4 * s], [0, -0.55 * s], [0.03 * s, -0.6 * s]], "#3d2618", 4);
        ell(0, -0.24 * s, 0.17 * s, 0.09 * s, "#4a2e1d", ink);
        ctx.fillStyle = "#56331f"; ctx.beginPath(); ctx.moveTo(-0.2 * s, -0.15 * s); ctx.lineTo(0.2 * s, -0.15 * s); ctx.quadraticCurveTo(0.24 * s, 0.4 * s, 0, 0.45 * s); ctx.quadraticCurveTo(-0.24 * s, 0.4 * s, -0.2 * s, -0.15 * s); ctx.fill(); ctx.stroke();
        line([[0, -0.15 * s], [0, 0.45 * s]], "#1c120b", 1.4); break;
      case 7: /* 장수하늘소 */
        legs(s, ink);
        for (const sg of [-1, 1]) line([[sg * 0.03 * s, -0.4 * s], [sg * 0.2 * s, -0.6 * s], [sg * 0.42 * s, -0.55 * s], [sg * 0.48 * s, -0.3 * s]], "#3b2a1a", 2);
        ell(0, -0.36 * s, 0.06 * s, 0.05 * s, "#4a3420", ink); ell(0, -0.25 * s, 0.11 * s, 0.07 * s, "#5a3e24", ink);
        ctx.fillStyle = "#6b4a2a"; ctx.beginPath(); ctx.moveTo(-0.15 * s, -0.17 * s); ctx.lineTo(0.15 * s, -0.17 * s); ctx.lineTo(0.13 * s, 0.42 * s); ctx.lineTo(-0.13 * s, 0.42 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
        for (let k = 0; k < 9; k++) ell(((k * 37) % 20 - 10) / 100 * s, (-0.1 + k * 0.055) * s, 0.012 * s, 0.01 * s, "#d8c79a");
        line([[0, -0.17 * s], [0, 0.42 * s]], "#2b1d10", 1.4); break;
      case 1: /* 배추흰나비 */
        for (const sg of [-1, 1]) {
          ctx.fillStyle = "#f6f4ec"; ctx.strokeStyle = "#9a9888";
          ctx.beginPath(); ctx.moveTo(sg * 0.03 * s, -0.25 * s); ctx.quadraticCurveTo(sg * 0.35 * s, -0.55 * s, sg * 0.48 * s, -0.32 * s); ctx.quadraticCurveTo(sg * 0.4 * s, -0.08 * s, sg * 0.04 * s, -0.12 * s); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sg * 0.04 * s, -0.12 * s); ctx.quadraticCurveTo(sg * 0.4 * s, -0.05 * s, sg * 0.32 * s, 0.18 * s); ctx.quadraticCurveTo(sg * 0.12 * s, 0.25 * s, sg * 0.03 * s, 0.02 * s); ctx.fill(); ctx.stroke();
          ell(sg * 0.4 * s, -0.36 * s, 0.06 * s, 0.04 * s, "#3a3a3a", null, sg * 0.5); ell(sg * 0.24 * s, -0.24 * s, 0.025 * s, 0.025 * s, "#3a3a3a");
          for (let k = 0; k < 14; k++) ell(sg * (0.1 + (k * 13 % 25) / 100) * s, (-0.3 + (k * 7 % 40) / 100) * s, 1, 1, "rgba(150,150,140,.5)");
        }
        antennae(s, 0.18, ink, true); ell(0, -0.38 * s, 0.035 * s, 0.035 * s, "#333"); ell(0, -0.22 * s, 0.04 * s, 0.08 * s, "#3b3b3b"); ell(0, 0.08 * s, 0.03 * s, 0.22 * s, "#4a4a4a"); break;
      case 2: /* 벼메뚜기 */
        legs(s, "#4f6a22", true); antennae(s, 0.12, "#4f6a22");
        ell(0, -0.37 * s, 0.06 * s, 0.07 * s, "#8fb34e", "#4f6a22"); ell(0, -0.22 * s, 0.08 * s, 0.09 * s, "#86ad46", "#4f6a22");
        ell(0, 0.12 * s, 0.07 * s, 0.32 * s, "#a7c46a", "#4f6a22");
        for (const sg of [-1, 1]) ell(sg * 0.035 * s, 0.12 * s, 0.035 * s, 0.3 * s, "rgba(140,160,80,.75)", "#5e7a2a"); break;
      case 3: /* 썩덩나무노린재 */
        legs(s, ink); antennae(s, 0.14, "#5a4630");
        ell(0, -0.36 * s, 0.06 * s, 0.05 * s, "#7a6248", ink);
        ctx.fillStyle = "#86694a"; ctx.beginPath(); ctx.moveTo(-0.07 * s, -0.31 * s); ctx.lineTo(0.07 * s, -0.31 * s); ctx.lineTo(0.24 * s, -0.17 * s); ctx.lineTo(-0.24 * s, -0.17 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#7c6044"; ctx.beginPath(); ctx.moveTo(-0.22 * s, -0.17 * s); ctx.lineTo(0.22 * s, -0.17 * s); ctx.quadraticCurveTo(0.2 * s, 0.32 * s, 0, 0.38 * s); ctx.quadraticCurveTo(-0.2 * s, 0.32 * s, -0.22 * s, -0.17 * s); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(210,200,180,.85)"; ctx.beginPath(); ctx.moveTo(-0.17 * s, 0.17 * s); ctx.lineTo(0.17 * s, 0.17 * s); ctx.quadraticCurveTo(0.15 * s, 0.33 * s, 0, 0.37 * s); ctx.quadraticCurveTo(-0.15 * s, 0.33 * s, -0.17 * s, 0.17 * s); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#97795a"; ctx.beginPath(); ctx.moveTo(-0.11 * s, -0.17 * s); ctx.lineTo(0.11 * s, -0.17 * s); ctx.lineTo(0, 0.12 * s); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
      case 4: /* 집파리 */
        legs(s, ink);
        for (const sg of [-1, 1]) { ell(sg * 0.17 * s, 0.02 * s, 0.07 * s, 0.24 * s, "rgba(200,210,220,.6)", "#7a8590", sg * -0.45); ell(sg * 0.07 * s, -0.1 * s, 0.014 * s, 0.014 * s, "#e6dcb0", "#7a6a3a"); }
        ell(0, -0.37 * s, 0.09 * s, 0.06 * s, "#555", ink); ell(-0.055 * s, -0.38 * s, 0.04 * s, 0.045 * s, "#8a2b22"); ell(0.055 * s, -0.38 * s, 0.04 * s, 0.045 * s, "#8a2b22");
        ell(0, -0.2 * s, 0.09 * s, 0.1 * s, "#6a6a6a", ink); for (const sg of [-1, 1]) line([[sg * 0.03 * s, -0.29 * s], [sg * 0.03 * s, -0.12 * s]], "#333", 1.5);
        ell(0, 0.05 * s, 0.09 * s, 0.13 * s, "#7a7060", ink); break;
      case 5: /* 고추잠자리 */
        for (const [yy, ln] of [[-0.24, 0.5], [-0.18, 0.46]]) for (const sg of [-1, 1]) {
          ell(sg * ln / 2 * s, yy * s, ln / 2 * s, 0.045 * s, "rgba(220,225,230,.55)", "#8a9098");
          for (let k = 1; k < 8; k++) line([[sg * k * ln / 8 * s, (yy - 0.035) * s], [sg * k * ln / 8 * s, (yy + 0.035) * s]], "rgba(120,125,130,.5)", 0.6);
        }
        ell(0, -0.33 * s, 0.075 * s, 0.05 * s, "#b33a2a", ink); ell(0, -0.22 * s, 0.05 * s, 0.07 * s, "#8a4a2a", ink);
        line([[0, -0.15 * s], [0, 0.48 * s]], "#c8362a", 0.04 * s); break;
      case 6: /* 꿀벌 */
        legs(s, ink); antennae(s, 0.1, ink);
        for (const sg of [-1, 1]) { ell(sg * 0.2 * s, -0.12 * s, 0.17 * s, 0.06 * s, "rgba(210,220,230,.65)", "#7a8590", sg * 0.45); ell(sg * 0.15 * s, 0.0 * s, 0.11 * s, 0.04 * s, "rgba(210,220,230,.65)", "#7a8590", sg * 0.35); }
        ell(0, -0.36 * s, 0.065 * s, 0.06 * s, "#3a2e22", ink); ell(0, -0.2 * s, 0.08 * s, 0.09 * s, "#8a6a3a", ink);
        ell(0, 0.14 * s, 0.1 * s, 0.2 * s, "#d9a33a", ink);
        for (let k = 0; k < 4; k++) { ctx.fillStyle = "#3a2e22"; ctx.fillRect(-0.09 * s, (0.0 + k * 0.08) * s, 0.18 * s, 0.03 * s); }
        break;
    }
    ctx.restore();
  }
  function pinSide(x0, y0, w, h) {
    ctx.fillStyle = C.ink; ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("옆에서 본 곤충 핀", x0, y0);
    const px = x0 + 26, top = y0 + 14, bot = y0 + h - 6;
    line([[px, top], [px, bot]], "#777", 1.6); ell(px, top, 3, 3, "#333");
    const yI = top + (bot - top) * 0.18, yL1 = top + (bot - top) * 0.55, yL2 = top + (bot - top) * 0.82;
    ell(px, yI, 18, 6, "#4a2e1d"); ctx.fillStyle = "#f3eee0"; ctx.strokeStyle = "#999";
    ctx.fillRect(px - 14, yL1 - 4, 28, 8); ctx.strokeRect(px - 14, yL1 - 4, 28, 8); ctx.fillRect(px - 14, yL2 - 4, 28, 8); ctx.strokeRect(px - 14, yL2 - 4, 28, 8);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`;
    const tx = px + 24;
    ctx.fillText("핀 머리 아래", tx, top + 4); ctx.fillText("손잡이 여유", tx, top + 17);
    ctx.fillText("곤충", tx, yI + 4);
    ctx.fillText("채집 라벨", tx, yL1); ctx.fillText("(언제·어디서·누가)", tx, yL1 + 13);
    ctx.fillText("동정 라벨", tx, yL2); ctx.fillText("(학명·동정자)", tx, yL2 + 13);
  }
  function drawIns(w, h) {
    const lw = w * 0.62, s = Math.min(lw * 0.82, h * 0.78), cx = lw / 2, cy = h * 0.53;
    geo = { cx, cy, s };
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`채집물 ${"ABCDEFGH"[sp]}${answer ? ` · 검색 결과 ${answer}` : ""}`, 8, 16);
    ctx.save(); ctx.translate(cx, cy); insect(sp, s); ctx.restore();
    if (pin) {
      const x = cx + pin[0] * s, y = cy + pin[1] * s;
      ctx.fillStyle = C.apple; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1;
    } else { ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText("그림을 눌러 핀 자리를 정하세요", 8, h - 8); }
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(lw + 4, 8); ctx.lineTo(lw + 4, h - 8); ctx.stroke();
    pinSide(lw + 14, 18, w - lw - 18, h - 26);
  }
  /* ---------- 식물 압착 ---------- */
  function mass() { return MD + (M0 - MD) * plant.W; }
  function drawPl(w, h) {
    const sw = Math.min(w * 0.42, h * 0.72), sh = sw * 1.4 > h - 20 ? h - 20 : sw * 1.4, sx = 8, sy = 10;
    ctx.fillStyle = "#fbfaf4"; ctx.strokeStyle = "#bdb8a8"; ctx.fillRect(sx, sy, sw, sh); ctx.strokeRect(sx + 0.5, sy + 0.5, sw, sh);
    const brown = Math.min(1, plant.wet / 4);
    const g = [Math.round(70 + 70 * brown), Math.round(120 - 30 * brown), Math.round(60 - 20 * brown)];
    const col = `rgb(${g.join(",")})`;
    const px = sx + sw * 0.42, py = sy + sh * 0.5;
    line([[px, py], [px - 6, py + sh * 0.12], [px - 14, py + sh * 0.2]], "#8a7a5a", 1.2); line([[px, py], [px + 8, py + sh * 0.15]], "#8a7a5a", 1.2); line([[px, py], [px + 2, py + sh * 0.22]], "#8a7a5a", 1);
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.42; ell(px + Math.cos(a) * sw * 0.16, py + Math.sin(a) * sw * 0.16, sw * 0.16, sw * 0.055, col, "rgba(40,60,30,.6)", a); }
    for (const dx of [-0.08, 0.1]) { line([[px, py], [px + dx * sw, sy + sh * 0.12]], col, 2); for (let k = 0; k < 8; k++) ell(px + dx * sw * (1 - k * 0.02), sy + sh * (0.12 + k * 0.025), 2.4, 3.2, "#6b5a3a"); }
    const lw2 = sw * 0.55, lh = sh * 0.22, lx = sx + sw - lw2 - 6, ly = sy + sh - lh - 6;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#999"; ctx.fillRect(lx, ly, lw2, lh); ctx.strokeRect(lx + 0.5, ly + 0.5, lw2, lh);
    const f = fields(), fs = Math.max(7.5, Math.min(9.5, lh / 7));
    ctx.font = `${fs}px ${F.sans}`; ctx.textAlign = "left";
    const lines = [["det", "질경이 Plantago asiatica"], ["date", "2026. 9. 12."], ["loc", "서울 관악구 ○○고 뒤뜰"], ["gps", "37.46 N, 126.95 E"], ["hab", "운동장 가 밟힌 땅"], ["who", "채집 김○○"]];
    lines.forEach(([k, t], i) => { ctx.fillStyle = f.includes(k) ? C.ink : "#c9c4b6"; ctx.fillText(f.includes(k) ? t : "─────", lx + 4, ly + fs + 2 + i * (fs + 2.2)); });
    /* 무게 그래프 */
    const box = { x0: sx + sw + 50, y0: 36, w: w - (sx + sw + 50) - 10, h: h - 74 };
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("시료 무게 기록", box.x0 - 36, 14);
    const pts = dry.rows.map((r) => ({ x: r.d, y: r.m }));
    L.plot(ctx, box, { pts: [{ x: 0, y: M0 }].concat(pts), xr: [0, Math.max(10, plant.day + 1)], yr: [0, 16], xlabel: "날", ylabel: "g" });
    if (plant.done) { ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(`${plant.done}일째 다 마름`, box.x0 + box.w, box.y0 + 12); }
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "ins") drawIns(w, h); else drawPl(w, h);
  }

  function dayStep() {
    if (plant.done) return;
    const dsc = plant.day % plant.every;   // 마지막으로 흡습지를 간 뒤 지난 날 수
    plant.day++;
    plant.W *= Math.exp(-0.75 * Math.exp(-dsc / 0.9));
    plant.wet += plant.W > 0.3 ? plant.W : 0;
    const m = L.measure(mass(), { sd: 0.04, res: 0.1 });
    const prev = dry.rows.length ? dry.rows[dry.rows.length - 1].m : M0;
    dry.add({ d: plant.day, m, c: dsc === 0 ? "예" : "아니요" });
    if (prev - m < 0.1 && plant.day > 2) plant.done = plant.day;
    let msg = `${plant.day}일째 무게 ${m.toFixed(1)} g.`;
    if (plant.done) msg += ` <b>하루 사이 무게가 거의 줄지 않아 다 말랐습니다.</b> 대지에 붙이고 라벨을 다세요.`;
    else if (plant.day >= 3 && plant.W > 0.3) msg += ` <b>아직 물기가 많습니다.</b> 젖은 흡습지에 오래 두면 잎이 갈색으로 변하고 곰팡이가 필 수 있습니다.`;
    $(".sp-obs").innerHTML = msg;
  }
  function newPlant() { Object.assign(plant, { day: 0, W: 1, wet: 0, done: 0 }); dry.clear(); $(".sp-obs").textContent = "신문지 사이에 질경이 한 포기를 펴고 흡습지를 끼워 눌렀습니다. 처음 무게 15.0 g."; draw(); }

  function legal() {
    if (place === "park") return "국립공원 안은 허가 없이 채집 금지";
    if (place === "private") return "땅 주인 허락 없이 채집하면 안 됨";
    return "";
  }
  function register() {
    const f = fields(), must = MUST.filter((k) => f.includes(k)).length, miss = MUST.filter((k) => !f.includes(k)).map((k) => FIELD[k]);
    const lab = `${must}/4${f.includes("det") ? " +동정" : ""}`;
    const bad = legal();
    if (mode === "pl") {
      const ok = plant.done && must === 4 && !bad;
      log.add({ no: "질경이", id: "—", pin: plant.done ? `${plant.done}일 건조` : "덜 마름", lab, v: bad || (!plant.done ? "곰팡이 위험" : must < 4 ? "라벨 보완" : "연구용 표본") });
      $(".sp-obs").innerHTML = bad ? `<b>${bad}.</b> 사진과 관찰 기록으로 대신합니다.` : ok ? "<b>연구에 쓸 수 있는 압착 표본입니다.</b>" : `${!plant.done ? "덜 마른 표본은 곰팡이가 핍니다. " : ""}${miss.length ? `라벨에 <b>${miss.join(", ")}</b>이(가) 빠졌습니다.` : ""}`;
      return;
    }
    const it = INS[sp], code = "ABCDEFGH"[sp];
    if (it.protect) {
      log.add({ no: code, id: it.ord, pin: "—", lab, v: "채집 금지" });
      $(".sp-obs").innerHTML = `<b>${code}는 ${it.name}입니다. ${it.protect}</b>라 잡거나 표본으로 만들면 안 됩니다. 사진과 관찰 기록(날짜, 장소, 좌표)을 남기고 놓아 줍니다.`;
      return;
    }
    const idOk = answer === it.ord;
    let pinOk = false;
    if (pin) pinOk = Math.hypot(pin[0] - it.pin[0], pin[1] - it.pin[1]) <= it.pin[2];
    const v = bad ? "채집 부적절" : idOk && pinOk && must === 4 ? "연구용 표본" : "보완 필요";
    log.add({ no: `${code} ${it.name}`, id: answer ? `${answer} ${idOk ? "○" : "×"}` : "안 함", pin: pin ? (pinOk ? "알맞음" : "고칠 것") : "안 꽂음", lab, v });
    const parts = [`<b>${code}는 ${it.name}(${it.ord})입니다.</b>`];
    if (!answer) parts.push("검색표로 먼저 동정해 보세요."); else if (!idOk) parts.push(`검색 결과 ${answer}는 틀렸습니다. 지나온 질문 중 어디서 갈렸는지 다시 보세요.`);
    if (!pinOk) parts.push(`핀은 ${it.pinTxt}에 꽂습니다.`);
    if (miss.length) parts.push(`라벨에 ${miss.join(", ")}이(가) 빠졌습니다.`);
    if (bad) parts.push(`${bad}.`);
    $(".sp-obs").innerHTML = parts.join(" ");
  }

  /* ---------- 조작 ---------- */
  const group = (sel, attr, fn) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[${attr}]`); if (!b) return;
    root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    fn(b.getAttribute(attr));
  });
  group(".mode", "data-m", (v) => { mode = v; $(".sp-ins").hidden = v !== "ins"; $(".sp-pl").hidden = v !== "pl"; $(".sp-obs").textContent = v === "pl" ? "흡습지 교체 간격을 고르고 하루씩 무게를 재세요." : "검색표로 동정하고, 그림을 눌러 핀 자리를 정하세요."; draw(); });
  group(".spec", "data-i", (v) => { sp = +v; pin = null; restart(); draw(); });
  group(".blot", "data-b", (v) => { plant.every = +v; newPlant(); });
  group(".place", "data-p", (v) => { place = v; });
  root.querySelectorAll("[data-f]").forEach((x) => x.addEventListener("change", draw));
  $(".sp-yes").addEventListener("click", () => { step(true); draw(); });
  $(".sp-no").addEventListener("click", () => { step(false); draw(); });
  $(".sp-restart").addEventListener("click", () => { restart(); draw(); });
  $(".sp-day").addEventListener("click", () => { dayStep(); draw(); });
  $(".sp-new").addEventListener("click", newPlant);
  $(".sp-reg").addEventListener("click", register);
  $(".sp-clear").addEventListener("click", () => log.clear());
  $("canvas").addEventListener("click", (e) => {
    if (mode !== "ins" || !geo) return;
    const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (x > size.w * 0.62) return;
    pin = [(x - geo.cx) / geo.s, (y - geo.cy) / geo.s]; draw();
  });
  restart();
  $(".sp-obs").textContent = "검색표로 동정하고, 그림을 눌러 핀 자리를 정하세요.";
  draw();
  if (L.demo) {
    const solve = (i) => { sp = i; restart(); const it = INS[i]; while (typeof node === "number") step(KEY[node].t === it.t); pin = it.pin.slice(0, 2); };
    root.querySelectorAll("[data-f]").forEach((x) => { x.checked = true; }); solve(0); register();
    root.querySelector('[data-f="gps"]').checked = false; solve(3); pin = [0.12, 0.25]; register();
    solve(7); register();
    root.querySelector('[data-f="gps"]').checked = true;
    sp = 2; root.querySelectorAll(".spec [data-i]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.i === "2"))); restart(); step(false); step(false); step(false); pin = [0.035, -0.19]; draw();
    for (let d = 0; d < 7; d++) dayStep();
    $(".sp-obs").innerHTML = "채집물 C를 검색표로 따라가는 중입니다. 4번 질문에 답하세요.";
  }
})();
