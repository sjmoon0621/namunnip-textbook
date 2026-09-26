/* 카드: 산소가 없으면 세포는 왜 포도당을 훨씬 많이 쓸까? — 같은 ATP 요구량에서 산소 호흡(약 32 ATP)과 발효(2 ATP)의 비율에 따른 포도당 소비와 생성물 */
(() => {
  const root = document.getElementById("card-cell-ferment");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sO = $(".ox"), oO = $(".o-out");
  const nY = $(".n-y"), nG = $(".n-g"), nN = $(".n-n");
  const DEMAND = 32;   // 산소가 충분할 때 포도당 1분자 몫의 ATP
  let org = "yeast";
  function calc() {
    const f = +sO.value / 100, yld = f * 32 + (1 - f) * 2, glu = DEMAND / yld;
    return { f, yld, glu, co2: glu * (6 * f + (org === "yeast" ? 2 * (1 - f) : 0)), o2: glu * 6 * f, eth: org === "yeast" ? glu * 2 * (1 - f) : 0, lac: org === "lactic" ? glu * 2 * (1 - f) : 0 };
  }
  function arrow(ctx, x0, y0, x1, y1, wdt, col, lab, lx, ly) {
    if (wdt < 0.25) return;
    const a = Math.atan2(y1 - y0, x1 - x0), hh = 6 + wdt;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wdt;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hh, y1 - Math.sin(a) * hh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * hh, y1 - Math.sin(a - 0.45) * hh); ctx.lineTo(x1 - Math.cos(a + 0.45) * hh, y1 - Math.sin(a + 0.45) * hh); ctx.closePath(); ctx.fill();
    if (lab) { ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, lx, ly); }
  }
  function node(ctx, x, y, t, col) {
    ctx.font = `600 12px ${F.sans}`; const tw = ctx.measureText(t).width + 16;
    ctx.fillStyle = C.card; ctx.strokeStyle = col || C.ink; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.roundRect(x - tw / 2, y - 13, tw, 26, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col || C.ink; ctx.textAlign = "center"; ctx.fillText(t, x, y + 4);
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = calc(), k = 1.1;
    const gx = w * 0.18, px = w * 0.46, y0 = 40, ya = 24, yf = h * 0.46;
    // 경로
    node(ctx, gx, (ya + yf) / 2 + 8, "포도당");
    node(ctx, px, (ya + yf) / 2 + 8, "피루브산");
    arrow(ctx, gx + 30, (ya + yf) / 2 + 8, px - 38, (ya + yf) / 2 + 8, 1 + r.glu * k, C.ink2, "해당 과정: ATP 2", (gx + px) / 2, (ya + yf) / 2 - 6 - r.glu * k / 2);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText("NAD⁺ → NADH", (gx + px) / 2, (ya + yf) / 2 + 26 + r.glu * k / 2);
    // 산소 호흡
    const mx = w * 0.8;
    ctx.fillStyle = "#f6e3dd"; ctx.strokeStyle = "#b98a7c"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(mx - 60, ya - 6, 120, 58, 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("미토콘드리아", mx, ya + 10); ctx.fillText("CO₂ + H₂O", mx, ya + 26); ctx.fillStyle = C.amber; ctx.fillText("ATP 약 30 더", mx, ya + 42);
    arrow(ctx, px + 36, (ya + yf) / 2, mx - 62, ya + 28, 1 + r.glu * 2 * r.f * k * 0.5, "#b98a7c", "", 0, 0);
    ctx.fillStyle = "#8f5a4c"; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(r.f > 0 ? "O₂ 있음" : "O₂ 없음: 막힘", (px + mx) / 2 + 6, ya + 8);
    // 발효
    const fx = w * 0.8;
    const fl = org === "yeast" ? "에탄올 + CO₂" : "젖산";
    ctx.fillStyle = "#eef3e8"; ctx.strokeStyle = C.forest;
    ctx.beginPath(); ctx.roundRect(fx - 60, yf - 22, 120, 46, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.sans}`; ctx.fillText(fl, fx, yf - 4); ctx.fillStyle = C.ink2; ctx.fillText("NADH → NAD⁺", fx, yf + 12);
    arrow(ctx, px + 36, (ya + yf) / 2 + 16, fx - 62, yf, 1 + r.glu * 2 * (1 - r.f) * k * 0.5, C.forest, "", 0, 0);
    ctx.fillStyle = C.forest; ctx.font = `11px ${F.sans}`; ctx.fillText(org === "yeast" ? "알코올 발효" : "젖산 발효", (px + fx) / 2 + 6, yf + 30);
    // 막대: 같은 ATP를 얻는 동안
    const bx = 108, bw = w - bx - 44, by = h * 0.6, gap = (h - by - 10) / 5;
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("같은 양의 ATP(32개)를 얻는 동안 (분자 수)", bx, by - 8);
    const rows = [["쓴 포도당", r.glu, C.ink], ["쓴 O₂", r.o2, "#3f6fa3"], ["나온 CO₂", r.co2, C.ink3], [org === "yeast" ? "나온 에탄올" : "나온 젖산", org === "yeast" ? r.eth : r.lac, C.forest]];
    const vmax = 32;
    rows.forEach(([t, v, col], i) => {
      const y = by + i * gap + 4;
      ctx.fillStyle = C.ink2; ctx.font = `12px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(t, bx - 8, y + 12);
      ctx.fillStyle = "#ecece6"; ctx.fillRect(bx, y, bw, 15);
      ctx.fillStyle = col; ctx.fillRect(bx, y, Math.min(1, v / vmax) * bw, 15);
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(v.toFixed(v < 10 ? 1 : 0), bx + Math.min(1, v / vmax) * bw + 5, y + 12);
    });
  }
  function update() {
    const r = calc();
    oO.textContent = sO.value;
    nY.textContent = `약 ${r.yld.toFixed(0)}개`;
    nG.textContent = `${r.glu.toFixed(1)} 배`; nG.classList.toggle("bad", r.glu > 2);
    nN.textContent = r.f >= 0.99 ? "전자 전달계" : r.f <= 0.01 ? (org === "yeast" ? "에탄올을 만들 때" : "젖산을 만들 때") : "둘 다";
    root.querySelectorAll("[data-o]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.o === org ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => { org = b.dataset.o; update(); }));
  sO.addEventListener("input", update);
  update();
})();
