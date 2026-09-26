/* 카드: 식물은 광합성으로 만든 ATP로 살아갈까? — 엽록체(빛→ATP·NADPH→당)와 미토콘드리아(당→ATP→세포 활동)의 하루. 광합성은 빛에 포화, 호흡은 일정 (모식, 상대값) */
(() => {
  const root = document.getElementById("card-cell-plant-day");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".time"), sL = $(".light"), grow = $(".grow");
  const oT = $(".t-out"), oL = $(".l-out"), nCO2 = $(".n-co2"), nC = $(".n-c"), nSum = $(".n-sum");
  const PMAX = 10;
  const light = (t) => (t > 6 && t < 18 ? Math.sin(Math.PI * (t - 6) / 12) : 0) * (+sL.value / 100);
  const photo = (t) => { const I = light(t); return PMAX * 1.3 * I / (I + 0.3); };
  const resp = () => (grow.checked ? 3 : 1.5);
  const daySum = () => { let s = 0; for (let t = 0; t < 24; t += 0.05) s += (photo(t) - resp()) * 0.05; return s; };
  const fmtT = (t) => `${String(Math.floor(t) % 24).padStart(2, "0")}:${String(Math.round((t % 1) * 60)).padStart(2, "0")}`;

  function arrow(ctx, x0, y0, x1, y1, wdt, col, label, lpos) {
    if (wdt < 0.3) return;
    const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, hh = 5 + wdt;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wdt; ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hh, y1 - uy * hh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hh - uy * hh * 0.6, y1 - uy * hh + ux * hh * 0.6); ctx.lineTo(x1 - ux * hh + uy * hh * 0.6, y1 - uy * hh - ux * hh * 0.6); ctx.closePath(); ctx.fill();
    if (label) { ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; const [lx, ly] = lpos || [(x0 + x1) / 2, (y0 + y1) / 2 - 6]; ctx.fillText(label, lx, ly); }
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value, P = photo(t), R = resp(), I = light(t);
    const H = h * 0.52;
    // 배경: 낮/밤
    ctx.fillStyle = I > 0 ? `rgba(224,160,42,${0.06 + 0.12 * I})` : "#e6e7ea"; ctx.fillRect(0, 0, w, H);
    // 세포
    ctx.fillStyle = "#f4f1e8"; ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(24, 34, w - 48, H - 50, 10); ctx.fill(); ctx.stroke();
    const k = (v) => 1 + v * 0.9;   // 화살표 굵기
    // 엽록체
    const chx = w * 0.3, chy = H * 0.5, mix = w * 0.72, miy = H * 0.5;
    ctx.fillStyle = "#b5d7ac"; ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(chx, chy, w * 0.16, H * 0.2, 0, 0, 6.29); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f6d9d4"; ctx.strokeStyle = C.warn;
    ctx.beginPath(); ctx.ellipse(mix, miy, w * 0.12, H * 0.13, 0, 0, 6.29); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("엽록체", chx, chy - H * 0.2 - 6); ctx.fillText("미토콘드리아", mix, miy - H * 0.13 - 6);
    // 엽록체 안 ATP 순환
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
    if (P > 0.05) { ctx.fillText("명반응 → ATP·NADPH", chx, chy - 6); ctx.fillText("→ CO₂ 고정 → 당", chx, chy + 10); }
    else { ctx.fillStyle = C.ink3; ctx.fillText("빛 없음: 멈춤", chx, chy + 4); }
    ctx.fillStyle = C.ink2; ctx.fillText("당 분해 → ATP", mix, miy + 4);
    // 흐름 화살표
    if (I > 0.01) arrow(ctx, chx - w * 0.12, 8, chx - w * 0.05, chy - H * 0.14, k(I * 3), C.amber, "빛", [chx - w * 0.14, 22]);
    if (P > 0.05) arrow(ctx, 8, chy + 20, chx - w * 0.16, chy + 20, k(P * 0.5), "#5d5d61", "CO₂", [34, chy + 12]);
    arrow(ctx, chx + w * 0.16, chy - 10, mix - w * 0.12, miy - 10, k(R * 0.5), "#8a6d3b", P > 0.05 ? "당, O₂" : "저장한 당", null);
    if (P > 0.05) { arrow(ctx, mix - w * 0.12, miy + 16, chx + w * 0.16, chy + 16, k(Math.min(P, R) * 0.5), "#5d5d61", "", null);
      ctx.fillStyle = "#5d5d61"; ctx.font = `11px ${F.sans}`; ctx.fillText("CO₂, H₂O", (chx + mix) / 2, chy + 30); }
    // 남는 O2 / 부족한 O2
    if (P > R) arrow(ctx, chx + 10, chy - H * 0.2, chx + 40, 8, k((P - R) * 0.5), "#3f6fa3", "O₂", [chx + 56, 22]);
    else arrow(ctx, mix + 30, 8, mix + 8, miy - H * 0.13, k((R - P) * 0.5), "#3f6fa3", "O₂", [mix + 44, 22]);
    if (R > P) arrow(ctx, mix + w * 0.12, miy + 6, w - 8, miy + 6, k((R - P) * 0.5), "#5d5d61", "CO₂", [w - 30, miy - 2]);
    arrow(ctx, mix, miy + H * 0.13, mix, H - 20, k(R * 0.9), C.warn, "", null);
    ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("ATP → 능동 수송, 단백질 합성", mix - 8, H - 22);
    // 그래프
    const gx = 44, gy = H + 30, gw = w - gx - 14, gh = h - gy - 34;
    const X = (x) => gx + x / 24 * gw, Y = (v) => gy + gh - (v + 4) / 18 * gh;
    ctx.fillStyle = "#eceded"; ctx.fillRect(X(0), gy, X(6) - X(0), gh); ctx.fillRect(X(18), gy, X(24) - X(18), gh);
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [0, 6, 12, 18, 24].map((v) => [v, v + "시"]), yt: [[-4, "-4"], [0, "0"], [5, "5"], [10, "10"]], ylabel: "CO₂ 흡수 (+) / 방출 (−), 상대값" });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, Y(0) + .5); ctx.lineTo(gx + gw, Y(0) + .5); ctx.stroke();
    const curve = (f, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); for (let x = 0; x <= 24.001; x += 0.1) { const y = Y(f(x)); x ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); } ctx.stroke(); ctx.setLineDash([]); };
    curve(photo, C.forest, 1.6, [4, 3]); curve(() => -resp(), C.warn, 1.6, [4, 3]); curve((x) => photo(x) - resp(), C.ink, 2.4);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(t), Y(P - R), 5, 0, 6.29); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.forest; ctx.fillText("광합성", X(12) + 4, Y(photo(12)) - 4);
    ctx.fillStyle = C.warn; ctx.fillText("호흡", X(0.3), Y(-resp()) + 14);
    ctx.fillStyle = C.ink; ctx.fillText("잎 전체", X(19.5), Y(-resp()) - 6);
  }
  function update() {
    const t = +sT.value, P = photo(t), R = resp(), net = P - R;
    oT.textContent = fmtT(t); oL.textContent = sL.value;
    nCO2.textContent = Math.abs(net) < 0.1 ? "출입 없음 (보상점)" : net > 0 ? `흡수 ${net.toFixed(1)}` : `방출 ${(-net).toFixed(1)}`;
    nC.textContent = P > 0.05 ? "당 합성 (CO₂ 고정)" : "만들지 않음";
    const s = daySum();
    nSum.textContent = (s >= 0 ? "+" : "") + s.toFixed(0);
    nSum.classList.toggle("bad", s < 0); nSum.classList.toggle("good", s >= 0);
    draw();
  }
  [sT, sL].forEach((el) => el.addEventListener("input", update)); grow.addEventListener("change", update);
  update();
})();
