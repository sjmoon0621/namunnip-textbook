/* 카드: 포도당의 탄소 6개는 어디로 가고, 에너지는 어디에 실릴까? — 세포 호흡 단계별 탄소·ATP·NADH·FADH₂·CO₂ 장부 (포도당 1분자, TCA 2바퀴) */
(() => {
  const root = document.getElementById("card-cell-carbon");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sK = $(".k"), oK = $(".k-out"), note = $(".stepnote");
  const nATP = $(".n-atp"), nN = $(".n-nadh"), nF = $(".n-fad"), nC = $(".n-co2");
  // 각 단계까지의 누적 (포도당 1분자)
  const S = [
    { atp: 0, nadh: 0, fad: 0, co2: 0, org: 6, where: "cyto", t: "시작: 세포질에 포도당(탄소 6개) 1분자가 있습니다." },
    { atp: 2, nadh: 2, fad: 0, co2: 0, org: 6, where: "cyto", t: "<b>해당 과정</b> (세포질): ATP 2개를 써서 포도당을 활성화한 뒤 쪼개, 피루브산(탄소 3개) 2분자를 만듭니다. ATP 4개가 생겨 순이익은 2개(기질 수준 인산화), NADH 2개가 생깁니다. 산소가 필요 없습니다." },
    { atp: 2, nadh: 4, fad: 0, co2: 2, org: 4, where: "matrix", t: "<b>피루브산 산화</b> (미토콘드리아 기질): 피루브산이 CO₂ 1분자를 잃고 조효소 A와 결합해 아세틸 CoA(탄소 2개)가 됩니다. 피루브산 2분자이므로 CO₂ 2개, NADH 2개." },
    { atp: 2, nadh: 4, fad: 0, co2: 2, org: 4, where: "matrix", t: "<b>TCA 회로 ①</b>: 아세틸 CoA(탄소 2)가 옥살아세트산(탄소 4)과 결합해 시트르산(탄소 6)이 됩니다. 조효소 A는 떨어져 나가 다시 쓰입니다." },
    { atp: 2, nadh: 6, fad: 0, co2: 4, org: 2, where: "matrix", t: "<b>TCA 회로 ②</b>: 시트르산이 산화되며 CO₂ 1분자를 내놓고 α-케토글루타르산(탄소 5)이 됩니다. NADH 1개 (두 바퀴면 2개)." },
    { atp: 2, nadh: 8, fad: 0, co2: 6, org: 0, where: "matrix", t: "<b>TCA 회로 ③</b>: 다시 CO₂ 1분자와 NADH 1개가 생기며 석시닐 CoA(탄소 4)가 됩니다. 이제 포도당 탄소 6개만큼의 CO₂가 모두 나갔습니다." },
    { atp: 4, nadh: 8, fad: 0, co2: 6, org: 0, where: "matrix", t: "<b>TCA 회로 ④</b>: 석시닐 CoA가 석신산(탄소 4)이 되며 ATP(세포에 따라 GTP) 1개가 생깁니다. 기질 수준 인산화입니다." },
    { atp: 4, nadh: 10, fad: 2, co2: 6, org: 0, where: "matrix", t: "<b>TCA 회로 ⑤</b>: 석신산 → 푸마르산 → 말산 → 옥살아세트산으로 바뀌며 FADH₂ 1개, NADH 1개가 생깁니다. 옥살아세트산이 다시 만들어져 회로가 닫힙니다." },
    { atp: 32, nadh: 0, fad: 0, co2: 6, org: 0, where: "inner", t: "<b>전자 전달계와 산화적 인산화</b> (내막): NADH 10개와 FADH₂ 2개의 전자가 산소 6분자에 전달되어 물이 됩니다. 이때 약 28개의 ATP가 만들어져 모두 약 32개가 됩니다(세포질 NADH를 넘기는 방식에 따라 30개)." },
  ];
  const TCA = [["시트르산", 6], ["α-케토글루타르산", 5], ["석시닐 CoA", 4], ["석신산", 4], ["푸마르산·말산", 4], ["옥살아세트산", 4]];
  const COL = { atp: "#e0a02a", nadh: "#3f6fa3", fad: "#8a4fb0", co2: "#8d8d92", c: "#232326" };

  function carbons(ctx, x, y, n, r) { for (let i = 0; i < n; i++) { ctx.fillStyle = COL.c; ctx.beginPath(); ctx.arc(x - (n - 1) * r * 1.25 + i * r * 2.5, y, r, 0, 6.29); ctx.fill(); } }
  function box(ctx, x, y, t, n, on) {
    ctx.globalAlpha = on ? 1 : 0.28;
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    const bw = Math.max(64, n * 9 + 18);
    ctx.beginPath(); ctx.roundRect(x - bw / 2, y - 17, bw, 34, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(t, x, y - 4);
    carbons(ctx, x, y + 8, n, 3);
    ctx.globalAlpha = 1;
  }
  function arrowTo(ctx, x0, y0, x1, y1, col, on) {
    ctx.globalAlpha = on ? 1 : 0.25; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6;
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * 6, y1 - Math.sin(a) * 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.4) * 8, y1 - Math.sin(a - 0.4) * 8); ctx.lineTo(x1 - Math.cos(a + 0.4) * 8, y1 - Math.sin(a + 0.4) * 8); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }
  function out(ctx, x, y, t, col, on) { ctx.globalAlpha = on ? 1 : 0.25; ctx.fillStyle = col; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(t, x, y); ctx.globalAlpha = 1; }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = +sK.value, st = S[k];
    // 영역
    const split = w * 0.3, top = 22, bot = h - 58;
    ctx.fillStyle = st.where === "cyto" ? "#f1efe4" : "#f7f6f1"; ctx.fillRect(0, top, split - 6, bot - top);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("세포질", 6, top - 6);
    ctx.fillStyle = st.where === "matrix" ? "#f6e3dd" : "#fbf3f0"; ctx.strokeStyle = "#b98a7c"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(split + 4, top, w - split - 10, bot - top, 26); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.fillText("미토콘드리아 기질", split + 12, top - 6);
    // 내막 전자 전달계 띠
    const ey = bot - 16;
    ctx.globalAlpha = k >= 8 ? 1 : 0.35; ctx.fillStyle = "#b98a7c"; ctx.fillRect(split + 30, ey - 5, w - split - 60, 10);
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("내막: 전자 전달계 → O₂ + 전자 → H₂O,  ATP 약 28", split + (w - split) / 2, ey - 10); ctx.globalAlpha = 1;
    // 해당 과정
    const lx = split / 2;
    box(ctx, lx, top + 40, "포도당", 6, k === 0);
    arrowTo(ctx, lx, top + 60, lx, top + 102, C.ink2, k >= 1);
    out(ctx, lx + 34, top + 78, "ATP +2", COL.atp, k >= 1); out(ctx, lx + 34, top + 92, "NADH +2", COL.nadh, k >= 1);
    box(ctx, lx, top + 124, "피루브산 ×2", 3, k === 1);
    // 피루브산 산화
    const ax = split + (w - split) * 0.2, ay = top + 40;
    arrowTo(ctx, lx + 36, top + 118, ax - 20, ay + 20, C.ink2, k >= 2);
    box(ctx, ax, ay, "아세틸 CoA ×2", 2, k === 2);
    out(ctx, (lx + ax) / 2 + 22, top + 96, "CO₂ ×2", COL.co2, k >= 2); out(ctx, (lx + ax) / 2 + 22, top + 110, "NADH +2", COL.nadh, k >= 2);
    // TCA 회로
    const rx = split + (w - split) * 0.55, ry = top + (bot - top - 60) * 0.58 + 10, R = Math.min((w - split) * 0.25, (bot - top) * 0.27);
    ctx.globalAlpha = k >= 3 ? 1 : 0.3; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.4; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(rx, ry, R, 0, 6.29); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = C.ink3; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("TCA 회로", rx, ry + 4);
    const ang = (i) => -Math.PI / 2 + i / TCA.length * Math.PI * 2 + 0.25;
    arrowTo(ctx, ax + 30, ay + 12, rx + Math.cos(ang(-0.5)) * R, ry + Math.sin(ang(-0.5)) * R, C.ink2, k >= 3);
    const stepOf = [3, 4, 5, 6, 7, 7];
    TCA.forEach(([t, n], i) => {
      const a = ang(i), x = rx + Math.cos(a) * R, y = ry + Math.sin(a) * R;
      const cur = k >= 3 && k <= 7 && stepOf[i] === k;
      ctx.globalAlpha = k >= 3 ? 1 : 0.3;
      ctx.fillStyle = cur ? "#fff2c9" : C.card; ctx.strokeStyle = cur ? C.warn : C.ink2; ctx.lineWidth = cur ? 2 : 1;
      ctx.beginPath(); ctx.arc(x, y, 12, 0, 6.29); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`C${n}`, x, y + 4);
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = cur ? C.warn : C.ink2;
      const ly = Math.sin(a) < 0 ? y - 17 : y + 26, tw = ctx.measureText(t).width;
      ctx.globalAlpha = 0.85; ctx.fillStyle = st.where === "matrix" ? "#f6e3dd" : "#fbf3f0"; ctx.fillRect(x - tw / 2 - 2, ly - 10, tw + 4, 13); ctx.globalAlpha = k >= 3 ? 1 : 0.3;
      ctx.fillStyle = cur ? C.warn : C.ink2; ctx.fillText(t, x, ly);
      ctx.globalAlpha = 1;
    });
    // 회로에서 나오는 것: 두 중간 산물 사이 호 안쪽에 색 점
    const outs = [[4, [COL.co2, COL.nadh], 0.5], [5, [COL.co2, COL.nadh], 1.5], [6, [COL.atp], 2.5], [7, [COL.fad, COL.nadh], 3.9]];
    outs.forEach(([s0, cols, i]) => {
      const a = ang(i);
      cols.forEach((c, j) => { ctx.globalAlpha = k >= s0 ? 1 : 0.2; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(rx + Math.cos(a) * (R * 0.7 - j * 10), ry + Math.sin(a) * (R * 0.7 - j * 10), 4.5, 0, 6.29); ctx.fill(); });
      ctx.globalAlpha = 1;
    });
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    let lgx = split + 14;
    [["CO₂", COL.co2], ["NADH", COL.nadh], ["FADH₂", COL.fad], ["ATP", COL.atp]].forEach(([t, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(lgx + 4, bot - 48, 4.5, 0, 6.29); ctx.fill(); ctx.fillStyle = C.ink2; ctx.fillText(t, lgx + 12, bot - 44); lgx += ctx.measureText(t).width + 26; });
    // 탄소 장부
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`탄소 6개의 행방: 유기물 속 ${st.org}개 · CO₂ ${st.co2}개`, 6, h - 22);
    ctx.fillText("(개수는 포도당 1분자, TCA 두 바퀴 기준)", 6, h - 6);
  }
  function update() {
    const k = +sK.value, st = S[k];
    oK.textContent = k; note.innerHTML = st.t;
    nATP.textContent = k === 8 ? "약 30~32" : st.atp; nN.textContent = k === 8 ? "0 (모두 씀)" : st.nadh; nF.textContent = k === 8 ? "0 (모두 씀)" : st.fad; nC.textContent = st.co2;
    draw();
  }
  sK.addEventListener("input", update);
  $(".prev").addEventListener("click", () => { sK.value = Math.max(0, +sK.value - 1); update(); });
  $(".next").addEventListener("click", () => { sK.value = Math.min(8, +sK.value + 1); update(); });
  update();
})();
