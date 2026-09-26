/* 카드 2.6.1: 도체·반도체·절연체는 무엇이 다를까? — 띠틈과 온도에 따른 전도 전자 밀도 */
(() => {
  const root = document.getElementById("card-is1-bands");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), slider = $(".t"), tOut = $(".t-out");
  const oG = $(".gap"), oN = $(".n"), oR = $(".rel");

  const k = 8.617e-5; // 볼츠만 상수 (eV/K)
  const CU = 8.5e22;  // 구리의 자유 전자 밀도 (개/cm³)
  // 300 K 띠틈(eV)과 유효 상태 밀도 Nc, Nv (개/cm³)
  const M = {
    Cu: { name: "구리", eg: 0, col: "#b0703a" },
    Ge: { name: "저마늄", eg: 0.66, nc: 1.04e19, nv: 6.0e18, col: C.amber },
    Si: { name: "규소", eg: 1.12, nc: 3.2e19, nv: 1.8e19, col: C.forest },
    GaAs: { name: "갈륨 비소", eg: 1.42, nc: 4.7e17, nv: 7.0e18, col: "#3f78b5" },
    C: { name: "다이아몬드", eg: 5.47, nc: 1.0e19, nv: 1.0e19, col: C.ink2 },
  };
  const nOf = (m, T) => m === "Cu" ? CU : Math.sqrt(M[m].nc * M[m].nv) * Math.pow(T / 300, 1.5) * Math.exp(-M[m].eg / (2 * k * T));
  let mat = "Si";

  const SUPD = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sci = (v) => {
    const e = Math.floor(Math.log10(v)), m = v / 10 ** e;
    const es = (e < 0 ? "⁻" : "") + String(Math.abs(e)).split("").map((d) => SUPD[d]).join("");
    return `${m.toFixed(1)}×10${es}`;
  };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520, T = +slider.value, P = M[mat], n = nOf(mat, T);
    const split = Math.round(w * 0.36);

    // ── 에너지띠
    const bx = 30, bw = split - 44, top = 26, bot = h - 18;
    const scale = (bot - top - 40) / 6; // 1 eV 당 픽셀 (띠틈 최대 약 5.5 eV)
    const vbTop = bot - 20, vbBot = bot;
    let cbBot, cbTop;
    if (mat === "Cu") { cbBot = vbTop - 14; cbTop = cbBot - 22; }
    else { cbBot = vbTop - P.eg * scale; cbTop = cbBot - 20; }
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`${P.name}의 에너지띠`, 4, 14);
    // 원자가띠
    ctx.fillStyle = "rgba(35,35,38,.55)"; ctx.fillRect(bx, vbTop, bw, vbBot - vbTop);
    // 전도띠
    ctx.fillStyle = "rgba(63,120,181,.12)"; ctx.fillRect(bx, cbTop, bw, cbBot - cbTop);
    ctx.strokeStyle = "rgba(35,35,38,.4)"; ctx.lineWidth = 1;
    ctx.strokeRect(bx + .5, cbTop + .5, bw - 1, cbBot - cbTop - 1); ctx.strokeRect(bx + .5, vbTop + .5, bw - 1, vbBot - vbTop - 1);
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.save(); ctx.translate(12, (top + bot) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("에너지 →", 0, 0); ctx.restore();
    if (mat === "Cu") {
      // 겹친 띠: 절반쯤 찬 띠로 그림
      ctx.fillStyle = "rgba(176,112,58,.55)"; ctx.fillRect(bx, cbBot - 10, bw, vbTop - cbBot + 10);
      ctx.fillStyle = C.ink; ctx.textAlign = "center";
      ctx.fillText("띠가 겹치고 일부만 참", bx + bw / 2, cbTop - 8);
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(bx + 8 + (i * 37) % (bw - 16), cbBot - 4 + (i % 3) * 6, 2.6, 0, Math.PI * 2); ctx.fill(); }
    } else {
      ctx.fillStyle = C.ink3; ctx.textAlign = "center";
      ctx.fillText("전도띠", bx + bw / 2, cbTop - 6);
      ctx.fillText("원자가띠 (꽉 참)", bx + bw / 2, vbBot + 13 > h ? vbTop - 4 : vbBot + 13);
      // 띠틈 화살표
      ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(bx + bw - 8, cbBot); ctx.lineTo(bx + bw - 8, vbTop); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText(`띠틈 ${P.eg} eV`, bx + bw - 13, (cbBot + vbTop) / 2 + 4);
      // 올라간 전자 (로그 눈금 모식): 10^8 이상에서 한 자리마다 1개
      const dots = Math.max(0, Math.min(16, Math.round(Math.log10(n) - 8)));
      for (let i = 0; i < dots; i++) {
        const x = bx + 8 + ((i * 53) % (bw - 16)), y1 = cbBot - 6 - (i % 2) * 7, y2 = vbTop + 5 + (i % 2) * 6;
        ctx.fillStyle = "#3f78b5"; ctx.beginPath(); ctx.arc(x, y1, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.apple; ctx.lineWidth = 1.2; ctx.stroke();
      }
      if (!dots) { ctx.fillStyle = C.ink3; ctx.fillText("올라간 전자 거의 없음", bx + bw / 2, (cbBot + vbTop) / 2 + 4); }
    }

    // ── 온도-전자 밀도 그래프 (로그)
    const gx = split + (small ? 34 : 42), gy = 22, gw = w - gx - 10, gh = h - gy - 34;
    const lo = -30, hi = 25;
    const X = (t) => gx + (t - 200) / 400 * gw, Y = (lg) => gy + (1 - (lg - lo) / (hi - lo)) * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [[200, "200"], [300, "300"], [400, "400"], [500, "500"], [600, "600 K"]], yt: [[-20, "10⁻²⁰"], [0, "1"], [20, "10²⁰"]], ylabel: "전도 전자 밀도 (개/cm³, 로그)" });
    for (const m of Object.keys(M)) {
      ctx.beginPath();
      for (let t = 200; t <= 600; t += 5) { const y = Y(Math.max(lo, Math.log10(nOf(m, t)))); t === 200 ? ctx.moveTo(X(t), y) : ctx.lineTo(X(t), y); }
      ctx.strokeStyle = M[m].col; ctx.lineWidth = m === mat ? 2.6 : 1.1; ctx.globalAlpha = m === mat ? 1 : .55; ctx.stroke(); ctx.globalAlpha = 1;
      const lg = Math.max(lo, Math.log10(nOf(m, 250)));
      ctx.font = `${m === mat ? 600 : 400} 10.5px ${F.sans}`; ctx.fillStyle = M[m].col; ctx.textAlign = "left";
      if (!small || m === mat) ctx.fillText(M[m].name, X(250) + 4, m === "C" ? Y(lo) - 6 : Y(lg) - 5);
    }
    const lg = Math.max(lo, Math.log10(n));
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(T), Y(lg), 5, 0, Math.PI * 2); ctx.fill();
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(T), gy); ctx.lineTo(X(T), gy + gh); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = "left";
  }

  function update() {
    const T = +slider.value, n = nOf(mat, T);
    tOut.textContent = `${T} K (${T - 273} °C)`;
    oG.textContent = mat === "Cu" ? "없음 (띠 겹침)" : `${M[mat].eg} eV`;
    oN.textContent = sci(n);
    const r = n / CU;
    oR.textContent = mat === "Cu" ? "기준" : `${sci(r)}배`;
    draw();
  }
  slider.addEventListener("input", update);
  root.querySelectorAll(".mats .chip").forEach((b) => b.addEventListener("click", () => {
    mat = b.dataset.m;
    root.querySelectorAll(".mats .chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  update();
})();
