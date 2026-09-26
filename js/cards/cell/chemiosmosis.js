/* 카드: 산소를 쓰는 일과 ATP를 만드는 일은 어떻게 이어져 있을까? — 화학 삼투 모형. 펌프 P = e0(1−G), 합성 = kA·G, 누출 = kL·G 의 정상 상태 */
(() => {
  const root = document.getElementById("card-cell-chemiosmosis");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), o2 = $(".o2"), oligo = $(".oligo"), dnp = $(".dnp");
  const nATP = $(".n-atp"), nSub = $(".n-sub"), nOx = $(".n-ox");
  function ss(O, Ol, D) {
    const e0 = O ? 1 : 0, kA = Ol ? 0 : 1, kL = 0.08 + (D ? 3 : 0);
    if (!e0) return { G: 0, P: 0, A: 0, H: 0 };
    const G = e0 / (e0 + kA + kL), P = e0 * (1 - G);
    return { G, P, A: kA * G, H: kL * G };
  }
  const base = ss(true, false, false);
  function perGlucose(s) {
    if (!o2.checked) return { sub: 2, ox: 0 };                // 산소 없으면 해당 과정만 (발효)
    const eff = s.P > 0 ? (s.A / s.P) / (base.A / base.P) : 0;
    return { sub: 4, ox: 28 * eff };
  }
  const H = "#b5532f", E = "#3f6fa3";

  function arrow(ctx, x0, y0, x1, y1, wdt, col) {
    if (wdt < 0.4) return;
    const a = Math.atan2(y1 - y0, x1 - x0), hh = 5 + wdt * 1.2;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wdt;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hh, y1 - Math.sin(a) * hh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * hh, y1 - Math.sin(a - 0.45) * hh); ctx.lineTo(x1 - Math.cos(a + 0.45) * hh, y1 - Math.sin(a + 0.45) * hh); ctx.closePath(); ctx.fill();
  }
  let seed = 4; const rnd = () => { const x = Math.sin(seed++ * 33.3) * 43758.5; return x - Math.floor(x); };
  const dots = Array.from({ length: 80 }, () => [rnd(), rnd()]);

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = ss(o2.checked, oligo.checked, dnp.checked);
    const my = h * 0.3, mh = 30, top = 18, bot = h * 0.56;
    // 공간
    ctx.fillStyle = "#f6e3dd"; ctx.fillRect(0, top, w, my - mh / 2 - top);
    ctx.fillStyle = "#f4efe2"; ctx.fillRect(0, my + mh / 2, w, bot - my - mh / 2);
    ctx.fillStyle = "#e2cfc8"; ctx.fillRect(0, my - mh / 2, w, mh);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("막 사이 공간", 6, top + 13); ctx.fillText("내막", 6, my + 4); ctx.fillText("기질", 6, my + mh / 2 + 14);
    // H+ 점: 농도 차에 비례
    const nTop = Math.round(8 + s.G * 60), nBot = 8;
    ctx.fillStyle = H; ctx.font = `600 9px ${F.sans}`; ctx.textAlign = "center";
    for (let i = 0; i < nTop; i++) { const [a, b] = dots[i % 80]; ctx.fillText("H⁺", 60 + a * (w - 80), top + 22 + b * (my - mh / 2 - top - 28)); }
    for (let i = 0; i < nBot; i++) { const [a, b] = dots[(i * 7 + 3) % 80]; ctx.fillText("H⁺", 60 + a * (w * 0.62 - 60), my + mh / 2 + 16 + b * (bot - my - mh / 2 - 34)); }
    // 복합체 I, III, IV
    const cx = [w * 0.18, w * 0.38, w * 0.56];
    ["Ⅰ", "Ⅲ", "Ⅳ"].forEach((t, i) => {
      ctx.fillStyle = "#c9d8ea"; ctx.strokeStyle = E; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.roundRect(cx[i] - 16, my - mh / 2 - 8, 32, mh + 16, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = E; ctx.font = `600 12px ${F.sans}`; ctx.fillText(t, cx[i], my + 4);
      arrow(ctx, cx[i] + 23, my + mh / 2 + 14, cx[i] + 23, my - mh / 2 - 20, 1 + s.P * 6 * (i === 1 ? 0.8 : 1), H);
    });
    // 전자 경로
    ctx.setLineDash([4, 3]); ctx.strokeStyle = s.P > 0.01 ? E : C.ink3; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(cx[0] - 36, bot - 22); ctx.lineTo(cx[0], my + 6); ctx.lineTo(cx[1], my + 6); ctx.lineTo(cx[2], my + 6); ctx.lineTo(cx[2] + 34, bot - 22); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = E; ctx.font = `600 11px ${F.sans}`;
    ctx.fillText("NADH → NAD⁺ + e⁻", cx[0] - 20, bot - 8);
    ctx.fillStyle = o2.checked ? E : C.warn; ctx.fillText(o2.checked ? "e⁻ + O₂ → H₂O" : "O₂ 없음: 전자가 막힘", cx[2] + 40, bot - 8);
    // ATP 합성 효소
    const ax = w * 0.82;
    ctx.fillStyle = oligo.checked ? "#d8d8d8" : "#f1d9a6"; ctx.strokeStyle = oligo.checked ? C.ink3 : C.amber; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.roundRect(ax - 10, my - mh / 2 - 6, 20, mh + 12, 5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(ax, my + mh / 2 + 22, 16, 0, 6.29); ctx.fill(); ctx.stroke();
    arrow(ctx, ax, my - mh / 2 - 22, ax, my + mh / 2 + 4, 1 + s.A * 7, H);
    ctx.fillStyle = C.ink; ctx.font = `600 10px ${F.sans}`; ctx.fillText(oligo.checked ? "막힘" : "ATP", ax, my + mh / 2 + 26);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("ATP 합성 효소", ax, top + 13);
    if (!oligo.checked && s.A > 0.01) { ctx.fillText("ADP + Pᵢ → ATP", ax - 6, my + mh / 2 + 54); }
    // 누출 (짝풀림제)
    if (dnp.checked) { ctx.setLineDash([3, 3]); arrow(ctx, w * 0.68, my - mh / 2 - 16, w * 0.68, my + mh / 2 + 14, 1 + s.H * 4, "#8a4fb0"); ctx.setLineDash([]); ctx.fillStyle = "#8a4fb0"; ctx.fillText("누출 → 열", w * 0.68, my + mh / 2 + 28); }
    // 막대
    const bars = [["O₂ 소비 (전자 전달)", s.P / base.P, E], ["H⁺ 농도 차", s.G / base.G, H], ["ATP 합성", s.A / base.A, C.amber], ["열 (누출)", s.H / base.A, "#8a4fb0"]];
    const bx = 116, bw = w - bx - 50, by0 = bot + 22, bh = 16, gap = (h - by0 - 16) / 4;
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("억제제 없을 때 = 100", bx, by0 - 6);
    const X = (v) => bx + Math.min(v, 2.2) / 2.2 * bw;
    bars.forEach(([t, v, col], i) => {
      const y = by0 + i * gap + 6;
      ctx.fillStyle = C.ink2; ctx.font = `12px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(t, bx - 8, y + 12);
      ctx.fillStyle = "#ecece6"; ctx.fillRect(bx, y, bw, bh);
      ctx.fillStyle = col; ctx.fillRect(bx, y, X(v) - bx, bh);
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(Math.round(v * 100), X(v) + 5, y + 12);
    });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(1), by0); ctx.lineTo(X(1), h - 8); ctx.stroke(); ctx.setLineDash([]);
  }
  function update() {
    const s = ss(o2.checked, oligo.checked, dnp.checked), g = perGlucose(s);
    nSub.textContent = `${g.sub}개`; nOx.textContent = `약 ${Math.round(g.ox)}개`;
    nATP.textContent = `약 ${Math.round(g.sub + g.ox)}개`;
    nATP.classList.toggle("bad", g.sub + g.ox < 20);
    draw();
  }
  [o2, oligo, dnp].forEach((el) => el.addEventListener("change", update));
  update();
})();
