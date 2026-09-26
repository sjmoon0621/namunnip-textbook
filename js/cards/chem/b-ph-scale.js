/* 카드: [H₃O⁺]가 늘면 [OH⁻]는 왜 줄어들까? — pH 척도와 Kw (25 °C) */
(() => {
  const root = document.getElementById("card-chem-ph-scale");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".ph"), oP = $(".ph-out");
  const dH = $(".h"), dO = $(".oh"), dR = $(".ratio"), dS = $(".side");
  // 대략적인 pH (25 °C, 제품·상태에 따라 다름)
  const EX = [[1.5, "위액"], [2.3, "레몬즙"], [2.9, "식초"], [5.0, "커피"], [7.0, "순수한 물"], [7.4, "혈액"], [8.3, "베이킹 소다 용액"], [11.6, "암모니아수"], [13.0, "0.1 M NaOH"]];
  const sup = (e) => String(e).split("").map((c) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]).join("");
  const sci = (v) => { const e = Math.floor(Math.log10(v) + 1e-9); const m = v / 10 ** e; return `${m.toFixed(1)}×10${sup(e)}`; };
  const col = (p) => { // 산성 = 주황빛, 염기성 = 파랑빛 (모식)
    const t = p / 14; const a = [214, 96, 58], m = [226, 214, 150], b = [70, 110, 190];
    const mix = (u, v, k) => u.map((x, i) => Math.round(x + (v[i] - x) * k));
    return `rgb(${(t < .5 ? mix(a, m, t * 2) : mix(m, b, (t - .5) * 2)).join(",")})`;
  };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = +sP.value, x0 = 30, pw = w - 60, X = (v) => x0 + v / 14 * pw;
    // 예시 물질 (위)
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    const lanes = [14, 27, 40, 53];
    EX.forEach(([v, name], i) => {
      const y = lanes[i % 4];
      ctx.fillStyle = C.ink2; ctx.fillText(name, Math.min(Math.max(X(v), x0 + 30), x0 + pw - 30), y);
      ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(X(v) + .5, y + 3); ctx.lineTo(X(v) + .5, 66); ctx.stroke();
    });
    // 색 띠
    const by = 66, bh = 16;
    for (let i = 0; i < pw; i++) { ctx.fillStyle = col(i / pw * 14); ctx.fillRect(x0 + i, by, 1.5, bh); }
    ctx.fillStyle = C.ink3;
    for (let v = 0; v <= 14; v++) ctx.fillText(`${v}`, X(v), by + bh + 13);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(p), by - 2); ctx.lineTo(X(p) - 6, by - 10); ctx.lineTo(X(p) + 6, by - 10); ctx.closePath(); ctx.fill();
    ctx.fillRect(X(p) - 1, by, 2, bh);

    // 두 이온의 농도: 로그 눈금 막대 (길이 = 10⁰에서 얼마나 떨어졌는지의 반대)
    const gy = by + bh + 34, gh = h - gy - 24;
    const Y = (e) => gy + (-e) / 14 * gh; // e: 0 … −14
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    for (let e = 0; e >= -14; e -= 2) { ctx.fillText(e === 0 ? "1" : `10${sup(e)}`, x0 + 34, Y(e) + 3); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0 + 40, Y(e) + .5); ctx.lineTo(x0 + pw, Y(e) + .5); ctx.stroke(); }
    ctx.textAlign = "left"; ctx.fillText("농도 (mol/L, 로그 눈금)", x0 + 40, gy - 8);
    const bw = Math.min(90, pw * 0.16), cxH = x0 + pw * 0.38, cxO = x0 + pw * 0.70;
    const bar = (cx, e, color, name) => {
      ctx.fillStyle = color; ctx.fillRect(cx - bw / 2, Y(e), bw, Y(-14) - Y(e));
      ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.font = `12px ${F.mono}`; ctx.fillText(name, cx, Y(-14) + 16);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(sci(10 ** e), cx, Y(e) - 5);
    };
    bar(cxH, -p, "rgba(214,96,58,.75)", "[H₃O⁺]"); bar(cxO, -(14 - p), "rgba(70,110,190,.75)", "[OH⁻]");
    ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText("×", (cxH + cxO) / 2, Y(-7));
    ctx.fillText("= 1.0×10⁻¹⁴", (cxH + cxO) / 2, Y(-7) + 16);
    ctx.textAlign = "left";
  }

  function update() {
    const p = +sP.value;
    oP.textContent = p.toFixed(1);
    dH.textContent = sci(10 ** -p); dO.textContent = sci(10 ** -(14 - p));
    const r = 10 ** (7 - p);
    dR.textContent = Math.abs(p - 7) < 0.05 ? "같음" : r > 1 ? `${r >= 100 ? sci(r).replace("1.0×", "") : r.toFixed(r < 10 ? 1 : 0)}배 많음` : `${(1 / r) >= 100 ? sci(1 / r).replace("1.0×", "") : (1 / r).toFixed(1 / r < 10 ? 1 : 0)}분의 1`;
    dS.textContent = Math.abs(p - 7) < 0.05 ? "중성" : p < 7 ? "산성" : "염기성";
    draw();
  }
  sP.addEventListener("input", update);
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { sP.value = b.dataset.p; update(); }));
  update();
})();
