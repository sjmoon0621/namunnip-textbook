/* 카드: 물을 더 부으면 무엇이 그대로이고 무엇이 변할까? — 0.10 M HCl 희석과 pH */
(() => {
  const root = document.getElementById("card-chem-dilution");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".dil"), oD = $(".dil-out");
  const dN = $(".n"), dV = $(".v"), dC = $(".c"), dP = $(".ph"), dP0 = $(".ph0"), msg = $(".msg");
  const C0 = 0.10, V0 = 10, KW = 1.0e-14;
  const pHof = (c) => -Math.log10(c / 2 + Math.sqrt(c * c / 4 + KW));
  const sup = (e) => String(e).split("").map((c) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]).join("");
  const sci = (v) => { const e = Math.floor(Math.log10(v) + 1e-9); const m = v / 10 ** e; return m < 1.05 ? `10${sup(e)}` : `${m.toFixed(1)}×10${sup(e)}`; };
  const vol = (mL) => mL < 1000 ? `${+mL.toPrecision(3)} mL` : mL < 1e6 ? `${+(mL / 1000).toPrecision(3)} L` : `${+(mL / 1e6).toPrecision(3)} m³`;

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const e = +sD.value, D = 10 ** e, c = C0 / D;
    const split = Math.round(w * 0.3);
    // ── 왼쪽: 10 mL를 떠낸 시료 속 HCl 입자 (처음 60개, 모식)
    const bx = 14, bw = split - 30, by = 40, bh = h - 90;
    ctx.fillStyle = "rgba(90,150,210,.14)"; ctx.fillRect(bx, by + 10, bw, bh - 10);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    const expect = 60 / D, k = Math.round(expect);
    let seed = 5; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < k; i++) { ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(bx + 6 + r() * (bw - 12), by + 16 + r() * (bh - 22), 3, 0, 7); ctx.fill(); }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("10 mL를 떠 보면", bx + bw / 2, by - 22);
    ctx.fillText(expect >= 1 ? `HCl 입자 ${k}개` : `평균 ${expect < 0.01 ? sci(expect) : expect.toFixed(2)}개`, bx + bw / 2, by - 8);
    ctx.fillStyle = C.ink3; ctx.fillText("(입자 수는 모식)", bx + bw / 2, h - 22);

    // ── 오른쪽: 희석 배수에 따른 pH
    const x0 = split + 40, y0 = 22, pw = w - x0 - 12, ph = h - y0 - 36;
    const X = (v) => x0 + v / 8 * pw, Y = (p) => y0 + (1 - p / 9) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 2, 4, 6, 8].map((v) => [v, v === 0 ? "1" : `10${sup(v)}`]), yt: [1, 3, 5, 7, 9].map((v) => [v, `${v}`]), ylabel: "pH", xlabel: "희석 배수 (로그 눈금)" });
    ctx.setLineDash([2, 4]); ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(7)); ctx.lineTo(x0 + pw, Y(7)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.textAlign = "left"; ctx.fillText("중성 (25 °C)", x0 + 4, Y(7) - 5);
    // 물을 무시한 계산: pH = −log c
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(0), Y(1)); ctx.lineTo(X(8), Y(9)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let v = 0; v <= 8.001; v += 0.05) { const y = Y(pHof(C0 / 10 ** v)); v ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); }
    ctx.stroke();
    ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText("−log(HCl 농도)", X(8) - 4, Y(8.6));
    ctx.fillStyle = C.ink; ctx.fillText("실제 pH (물의 이온화 포함)", X(8) - 4, Y(5.8));
    ctx.beginPath(); ctx.arc(X(e), Y(pHof(c)), 5, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
    ctx.textAlign = "left";
  }

  function update() {
    const e = +sD.value, D = 10 ** e, c = C0 / D;
    oD.textContent = e < 3 ? `${+D.toPrecision(3)}` : sci(D);
    dN.textContent = "1.0 mmol"; dV.textContent = vol(V0 * D); dC.textContent = `${sci(c)} M`;
    dP.textContent = pHof(c).toFixed(2); dP0.textContent = (-Math.log10(c)).toFixed(2);
    dP0.classList.toggle("bad", -Math.log10(c) > 7);
    msg.textContent = e < 4.5 ? "물을 부어도 HCl의 몰수는 그대로이고, 부피만 커져 농도가 작아집니다. 10배 묽히면 pH는 1 커집니다."
      : -Math.log10(c) < 6.99 ? "HCl이 아주 묽어지자 물이 스스로 내놓는 H₃O⁺(1.0×10⁻⁷ M)를 무시할 수 없게 됩니다."
      : "−log(HCl 농도)는 7 이상이 되지만, 산을 아무리 묽혀도 염기성이 되지는 않습니다. 실제 pH는 7에 다가갈 뿐입니다.";
    draw();
  }
  sD.addEventListener("input", update);
  root.querySelectorAll("[data-e]").forEach((b) => b.addEventListener("click", () => { sD.value = b.dataset.e; update(); }));
  update();
})();
