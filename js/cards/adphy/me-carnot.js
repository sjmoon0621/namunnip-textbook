/* 카드: 열기관의 효율에는 왜 넘을 수 없는 한계가 있을까? — 한 순환의 에너지 흐름과 열원들의 엔트로피 장부 ΔS = −QH/TH + QL/TL */
(() => {
  const root = document.getElementById("card-adphy-carnot");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sTh = $(".th"), sTl = $(".tl"), sE = $(".e"), oTh = $(".th-out"), oTl = $(".tl-out"), oE = $(".e-out");
  const nC = $(".n-c"), nW = $(".n-w"), nQl = $(".n-ql"), nS = $(".n-s");
  const QH = 1000, HOT = "#d4493a", COLD = "#3f6fa3", WORK = "#3b7c2a";

  function vals() {
    const TH = +sTh.value, TL = +sTl.value, e = +sE.value, W = e * QH, QL = QH - W;
    const dH = -QH / TH, dL = QL / TL;
    return { TH, TL, e, W, QL, dH, dL, tot: dH + dL, ec: 1 - TL / TH };
  }
  function band(ctx, x0, y0, x1, y1, wpx, col) {
    if (wpx < 0.5) return;
    ctx.strokeStyle = col; ctx.lineWidth = wpx; ctx.lineCap = "butt"; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const ang = Math.atan2(y1 - y0, x1 - x0), hw = Math.max(5, wpx * 0.8);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x1 + Math.cos(ang) * hw, y1 + Math.sin(ang) * hw);
    ctx.lineTo(x1 + Math.cos(ang + Math.PI / 2) * hw, y1 + Math.sin(ang + Math.PI / 2) * hw);
    ctx.lineTo(x1 + Math.cos(ang - Math.PI / 2) * hw, y1 + Math.sin(ang - Math.PI / 2) * hw); ctx.closePath(); ctx.fill();
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = vals();
    /* 왼쪽: 에너지 흐름 */
    const lw = w * 0.46, cx = lw * 0.42, bwid = lw * 0.62, maxW = 26;
    const hotY = 14, boxH = 34, coldY = h - 14 - boxH, ey = h / 2, er = 22;
    ctx.fillStyle = "#f6dcd6"; ctx.fillRect(cx - bwid / 2, hotY, bwid, boxH);
    ctx.fillStyle = "#d9e4f0"; ctx.fillRect(cx - bwid / 2, coldY, bwid, boxH);
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink;
    ctx.fillText(`고열원 ${v.TH} K`, cx, hotY + 21); ctx.fillText(`저열원 ${v.TL} K`, cx, coldY + 21);
    band(ctx, cx, hotY + boxH + 2, cx, ey - er - 10, maxW, HOT);
    band(ctx, cx, ey + er + 2, cx, coldY - 10, maxW * v.QL / QH, COLD);
    band(ctx, cx + er + 2, ey, lw - 14, ey, maxW * v.W / QH, WORK);
    ctx.fillStyle = "#fbfbf8"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, ey, er, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `11px ${F.sans}`; ctx.fillText("기관", cx, ey + 4);
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillStyle = HOT; ctx.fillText(`받은 열 ${QH} J`, cx + maxW / 2 + 6, (hotY + boxH + ey - er) / 2 + 3);
    ctx.fillStyle = COLD; ctx.fillText(`버린 열 ${v.QL.toFixed(0)} J`, cx + maxW / 2 + 6, (ey + er + coldY) / 2 + 3);
    ctx.fillStyle = WORK; ctx.textAlign = "right"; ctx.fillText(`일 ${v.W.toFixed(0)} J`, lw - 14, ey - maxW / 2 - 4);
    /* 오른쪽: 엔트로피 막대 */
    const bx0 = w * 0.52, bx1 = w - 10, top = 30, bot = h - 40, SM = 2.6;
    const zy = top + (bot - top) * 0.55, sc = (bot - top) * 0.45 / SM;
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("한 순환 동안 엔트로피 변화 (J/K)", bx0, 16);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx0, zy); ctx.lineTo(bx1, zy); ctx.stroke();
    const ok = v.tot >= -1e-9;
    const items = [["고열원", v.dH, HOT], ["저열원", v.dL, COLD], ["기관", 0, C.ink3], ["전체", v.tot, ok ? WORK : C.warn]];
    const cw = (bx1 - bx0) / items.length;
    items.forEach(([lab, s, col], i) => {
      const x = bx0 + cw * i + cw * 0.2, ww = cw * 0.6, hh = Math.max(-SM, Math.min(SM, s)) * sc;
      ctx.fillStyle = col; ctx.fillRect(x, hh >= 0 ? zy - hh : zy, ww, Math.max(1.5, Math.abs(hh)));
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(`${s >= 0 ? "+" : "−"}${Math.abs(s).toFixed(2)}`, x + ww / 2, hh >= 0 ? zy - hh - 4 : zy - hh + 12);
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.sans}`; ctx.fillText(lab, x + ww / 2, bot + 14);
    });
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = ok ? WORK : C.warn;
    const msg = Math.abs(v.tot) < 0.004 ? "ΔS = 0 · 가역 (카르노 한계)" : ok ? "ΔS > 0 · 일어날 수 있음" : "ΔS < 0 · 제2법칙 위반, 불가능";
    ctx.fillText(msg, (bx0 + bx1) / 2, h - 8);
  }
  function update() {
    const v = vals();
    oTh.textContent = v.TH; oTl.textContent = v.TL; oE.textContent = (v.e * 100).toFixed(1).replace(/\.0$/, "");
    nC.textContent = `${(v.ec * 100).toFixed(1)} %`;
    nW.textContent = `${v.W.toFixed(0)} J`; nQl.textContent = `${v.QL.toFixed(0)} J`;
    nS.textContent = `${v.tot >= 0 ? "+" : "−"}${Math.abs(v.tot).toFixed(3)} J/K`;
    nS.classList.toggle("bad", v.tot < -1e-9); nS.classList.toggle("good", v.tot >= -1e-9);
    draw();
  }
  root.querySelectorAll("[data-pre]").forEach((b) => b.addEventListener("click", () => {
    const p = b.dataset.pre, v = vals();
    sE.value = p === "carnot" ? v.ec : p === "plant" ? 0.4 : +p; update();
  }));
  [sTh, sTl, sE].forEach((el) => el.addEventListener("input", update));
  update();
})();
