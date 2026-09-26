/* 카드: 물질은 순환하는데 에너지는 왜 흘러가 버릴까? — 영양 단계별 에너지 흐름 (실버스프링스 1957 자료와 모형) */
(() => {
  const root = document.getElementById("card-bio-flow");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sE = $(".eff"), cLog = $(".log");
  let real = false;

  const NAME = ["생산자", "1차 소비자", "2차 소비자", "3차 소비자"];
  // Odum(1957) 실버스프링스: 총생산량과 호흡량 (kcal/m²·년)
  const SS = { gross: [20810, 3368, 383, 21], resp: [11977, 1890, 316, 13] };
  function levels() {
    if (real) return SS.gross.map((g, i) => ({ g, r: SS.resp[i], next: SS.gross[i + 1] || 0 }));
    const e = +sE.value / 100, out = [];
    let g = 20810;
    for (let i = 0; i < 4; i++) { const r = g * (i ? 0.6 : 0.58); out.push({ g, r, next: i < 3 ? g * e : 0 }); g *= e; }
    return out;
  }

  const { ctx, size } = fit(cv, () => draw());
  const VW = 400, VH = 225;
  const HEAT = "#d9822b", DEC = "#9b7a55", NEXT = C.forest;
  function txt(s, x, y, o = {}) {
    ctx.font = `${o.w || 500} ${o.size || 11}px ${o.mono ? F.mono : F.sans}`;
    ctx.textAlign = o.align || "left"; ctx.fillStyle = o.c || C.ink; ctx.fillText(s, x, y); ctx.textAlign = "left";
  }
  function draw() {
    const { w, h } = size;
    if (!w) return;
    const dpr = cv.width / w, s = Math.min(w / VW, h / VH);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    const L = levels(), lg = cLog.checked;
    const cx = 160, maxW = 220, top = L[0].g;
    const W = (v) => lg ? Math.max(2, (Math.log10(Math.max(v, 1)) / Math.log10(top)) * maxW) : Math.max(v / top * maxW, 1.5);
    const bh = 34, gap = 12, y0 = VH - 30;
    L.forEach((lv, i) => {
      const y = y0 - (i + 1) * bh - i * gap + gap, bw = W(lv.g), x = cx - bw / 2;
      // 막대를 셋으로 나눔: 다음 단계 / 호흡(열) / 분해자로
      const dec = Math.max(0, lv.g - lv.r - lv.next);
      const parts = [[lv.next, NEXT], [lv.r, HEAT], [dec, DEC]];
      let px = x;
      if (lg) { ctx.fillStyle = "#cfe0c8"; ctx.fillRect(x, y, bw, bh - 6); }
      else parts.forEach(([v, c]) => { const pw = v / lv.g * bw; ctx.fillStyle = c; ctx.fillRect(px, y, pw, bh - 6); px += pw; });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, bw, bh - 6);
      txt(NAME[i], 6, y + 17, { size: 11.5, w: 600 });
      txt(lv.g >= 100 ? Math.round(lv.g).toLocaleString() : lv.g.toFixed(lv.g < 10 ? 1 : 0), cx + Math.max(bw / 2, 6) + 6, y + 17, { size: 10.5, mono: 1, c: C.ink2 });
    });
    txt(lg ? "로그 눈금 (길이 비교는 자릿수 비교)" : "막대 길이 = 그 단계로 들어온 에너지", 6, VH - 8, { size: 10, c: C.ink3, mono: 1 });
    // 오른쪽: 물질과 에너지
    const rx = 300;
    ctx.fillStyle = HEAT; ctx.fillRect(rx, 20, 10, 10); txt("호흡 → 열", rx + 14, 29, { size: 10.5 });
    ctx.fillStyle = DEC; ctx.fillRect(rx, 38, 10, 10); txt("사체·배설물", rx + 14, 47, { size: 10.5 });
    ctx.fillStyle = NEXT; ctx.fillRect(rx, 56, 10, 10); txt("다음 단계로", rx + 14, 65, { size: 10.5 });
    // 물질 순환 고리와 빠져나가는 열
    ctx.strokeStyle = "#8a6a45"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(342, 120, 26, -0.3, Math.PI * 1.6); ctx.stroke();
    const ha = Math.PI * 1.6; ctx.fillStyle = "#8a6a45"; ctx.beginPath();
    const hx = 342 + 26 * Math.cos(ha), hy = 120 + 26 * Math.sin(ha);
    ctx.moveTo(hx + 6, hy - 2); ctx.lineTo(hx - 3, hy - 6); ctx.lineTo(hx - 1, hy + 5); ctx.fill();
    txt("물질", 342, 118, { align: "center", size: 11, w: 700, c: "#8a6a45" });
    txt("돌아옴", 342, 131, { align: "center", size: 10, c: "#8a6a45" });
    ctx.strokeStyle = HEAT; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(318, 186); ctx.lineTo(372, 162); ctx.stroke();
    ctx.fillStyle = HEAT; ctx.beginPath(); ctx.moveTo(378, 159); ctx.lineTo(367, 159); ctx.lineTo(372, 168); ctx.fill();
    txt("에너지", 316, 202, { size: 11, w: 700, c: HEAT });
    txt("열로 빠져나감", 316, 215, { size: 10, c: HEAT });
  }

  function update() {
    const L = levels();
    $(".eff-out").textContent = sE.value;
    const topPct = L[3].g / L[0].g * 100;
    $(".f-top").textContent = topPct < 0.1 ? `${topPct.toFixed(3)}%` : `${topPct.toFixed(2)}%`;
    const heat = L.reduce((a, l) => a + l.r, 0) / L[0].g * 100;
    $(".f-heat").textContent = `${Math.round(heat)}%`;
    $(".f-e1").textContent = `${(L[1].g / L[0].g * 100).toFixed(0)}%`;
    root.querySelector("[data-real]").setAttribute("aria-pressed", real);
    sE.disabled = real;
    $(".f-src").hidden = !real;
    draw();
  }
  sE.addEventListener("input", () => { real = false; update(); });
  cLog.addEventListener("change", update);
  root.querySelector("[data-real]").addEventListener("click", () => { real = !real; update(); });
  update();
})();
