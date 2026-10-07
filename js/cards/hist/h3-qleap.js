/* 카드: ‘양자 도약’의 크기 — 수소 준위 전이 에너지와 일상 에너지를 로그 눈금으로 비교 */
(() => {
  const root = document.getElementById("card-hist-quantum-leap");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sH = $(".hi"), sL = $(".lo");
  const EV = 1.602e-19, JUMP = 70 * 9.8 * 0.5;
  const En = (n) => -13.6 / (n * n);
  const REF = [
    [4.1e-21, "실온 분자 열운동 kT", "L"],
    [JUMP, "0.5 m 제자리 뛰기", "R"],
    [5.4e4, "스마트폰 배터리 완충", "R"],
    [1.3e6, "밥 한 공기", "R"],
  ];
  const band = (nm) => (nm < 380 ? "자외선" : nm <= 750 ? "가시광선" : "적외선");
  const color = (nm) => (nm < 380 ? "#7b5ea7" : nm < 450 ? "#6a4bc4" : nm < 495 ? "#2f6fd0" : nm < 570 ? "#2e9a4a" : nm < 590 ? "#d0b020" : nm < 620 ? "#e07a20" : nm <= 750 ? "#d33a2c" : "#8a3a2a");
  const sci = (x) => { const e = Math.floor(Math.log10(x)), m = x / 10 ** e; return `${m.toFixed(1)} × 10${sup(e)}`; };
  const sup = (e) => String(e).split("").map((ch) => "⁰¹²³⁴⁵⁶⁷⁸⁹"["0123456789".indexOf(ch)] || (ch === "-" ? "⁻" : ch)).join("");
  function trans() { const hi = +sH.value, lo = +sL.value; const eV = En(hi) - En(lo); return { hi, lo, eV, J: eV * EV, nm: 1239.84 / eV }; }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = trans();
    // 왼쪽: 준위
    const x0 = 46, x1 = w * 0.42, yt = 24, yb = h - 20;
    const Y = (e) => yt + (e / -13.6) * (yb - yt);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("수소 원자의 에너지 준위", x0, 12);
    for (let n = 1; n <= 6; n++) {
      const y = Y(En(n)), on = n === t.hi || n === t.lo;
      ctx.strokeStyle = on ? C.ink : C.ink3; ctx.lineWidth = on ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      if (n <= 4) {
        ctx.fillStyle = on ? C.ink : C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
        ctx.fillText(`n=${n}`, x0 - 4, y + 3.5);
        if (n <= 3) { ctx.textAlign = "left"; ctx.fillText(`${En(n).toFixed(2)} eV`, x0 + 2, y - 4); }
      }
    }
    ctx.strokeStyle = C.rule; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke(); ctx.setLineDash([]);
    if (t.hi > t.lo) {
      const ax = x0 + (x1 - x0) * 0.7, ya = Y(En(t.hi)), yb2 = Y(En(t.lo));
      ctx.strokeStyle = color(t.nm); ctx.fillStyle = color(t.nm); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(ax, ya); ctx.lineTo(ax, yb2 - 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax - 5, yb2 - 8); ctx.lineTo(ax + 5, yb2 - 8); ctx.lineTo(ax, yb2); ctx.fill();
      // 광자 물결
      ctx.lineWidth = 1.5; ctx.beginPath();
      const my = (ya + yb2) / 2;
      for (let k = 0; k <= 40; k++) { const x = ax + 6 + k; const y = my + 4 * Math.sin(k / 3); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(band(t.nm), ax + 50, my + 4);
    }
    // 오른쪽: 로그 눈금 (J)
    const lx = w * 0.7, ly0 = 22, ly1 = h - 14, e0 = -22, e1 = 7;
    const LY = (J) => ly1 - (Math.log10(J) - e0) / (e1 - e0) * (ly1 - ly0);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, ly0); ctx.lineTo(lx, ly1); ctx.stroke();
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let e = -20; e <= 6; e += 5) { const y = LY(10 ** e); ctx.beginPath(); ctx.moveTo(lx - 3, y); ctx.lineTo(lx + 3, y); ctx.stroke(); }
    ctx.textAlign = "center"; ctx.fillText("에너지 (J, 로그 눈금)", lx, 12);
    for (let e = -20; e <= 6; e += 5) { ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText(`10${sup(e)}`, lx + 5, LY(10 ** e) + 3); }
    const mark = (J, label, side, col) => {
      const y = LY(J); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = `10px ${F.sans}`; ctx.textAlign = side === "L" ? "right" : "left";
      ctx.fillText(label, side === "L" ? lx - 8 : lx + 34, y + 3.5);
    };
    REF.forEach(([J, lab, side]) => mark(J, lab, side, C.ink2));
    if (t.hi > t.lo) mark(t.J, `양자 도약 ${t.hi}→${t.lo}`, "L", color(t.nm));
  }
  function update() {
    if (+sL.value >= +sH.value) sL.value = +sH.value - 1;
    $(".hi-out").textContent = sH.value; $(".lo-out").textContent = sL.value;
    const t = trans();
    $(".n-e").textContent = `${t.eV.toFixed(2)} eV`;
    $(".n-j").textContent = sci(t.J).replace(" × ", "×");
    $(".n-l").textContent = `${Math.round(t.nm)} nm`;
    $(".n-r").textContent = `약 1/${sci(JUMP / t.J).replace(" × ", "×")}`;
    draw();
  }
  sH.addEventListener("input", update); sL.addEventListener("input", () => { if (+sL.value >= +sH.value) sH.value = Math.min(6, +sL.value + 1); update(); });
  update();
})();
