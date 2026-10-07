/* 카드: 태풍과 욕조 소용돌이에서 가장 센 힘은 같을까? — 수평 운동 방정식 각 항의 크기 비교 */
(() => {
  const root = document.getElementById("card-adearth-forces");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".v"), sR = $(".r"), sP = $(".p"), sK = $(".k");
  const oV = $(".v-out"), oR = $(".r-out"), oP = $(".p-out"), oK = $(".k-out"), st = $(".fo-state"), nRo = $(".n-ro"), nPg = $(".n-pg"), nA = $(".n-a");
  const OM = 7.292e-5, G = 9.81;
  /* [매질, V(m/s), R(m), 위도, k(1/s)] */
  const P = [["air", 10, 1e6, 40, 1e-6], ["air", 8, 1e6, 37, 5e-5], ["air", 50, 4e4, 20, 1e-5], ["air", 60, 100, 35, 1e-5], ["sea", 1.5, 1e6, 32, 1e-6], ["sea", 0.1, 0.05, 37, 1e-3]];
  let pi = 0, med = "air";
  const sup = (e) => String(e).replace("-", "−");
  const sci = (x, d = 1) => { if (x === 0) return "0"; const e = Math.floor(Math.log10(Math.abs(x)) + 1e-9), m = x / 10 ** e; return Math.abs(e) <= 2 ? x.toPrecision(d + 1).replace(/\.?0+$/, "") : `${m.toFixed(d)}×10<sup>${sup(e)}</sup>`; };
  const len = (r) => (r >= 1000 ? `${+(r / 1000).toPrecision(2)} km` : r >= 1 ? `${+r.toPrecision(2)} m` : `${+(r * 100).toPrecision(2)} cm`);
  function calc() {
    const V = 10 ** +sV.value, R = 10 ** +sR.value, phi = +sP.value, k = 10 ** +sK.value, f = 2 * OM * Math.sin(phi * Math.PI / 180);
    const co = f * V, ce = V * V / R, fr = k * V, pg = Math.hypot(co + ce, fr);
    return { V, R, phi, k, f, co, ce, fr, pg, ro: V / (f * R) };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = calc(), x0 = 92, x1 = w - 14, E0 = -9, E1 = 2, X = (a) => x0 + (Math.log10(Math.max(a, 1e-12)) - E0) / (E1 - E0) * (x1 - x0);
    const y0 = 16, y1 = h - 30;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.strokeStyle = C.rule; ctx.textAlign = "center";
    for (let e = E0; e <= E1; e++) { const x = Math.round(X(10 ** e)) + 0.5; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); if ((e - E0) % 2 === 1 || e === E1) ctx.fillText(`10${e < 0 ? "⁻" : ""}${"⁰¹²³⁴⁵⁶⁷⁸⁹"[Math.abs(e)]}`, x, y1 + 14); }
    ctx.textAlign = "right"; ctx.fillText("가속도 (m/s², 로그 눈금)", x1, y1 + 27);
    const rows = [["기압 경도력", c.pg, "#3f6fa3"], ["전향력 fV", c.co, "#8a4fb5"], ["원심력 V²/R", c.ce, C.amber], ["마찰력 kV", c.fr, "#6a6a6a"]];
    const bh = (y1 - y0) / rows.length;
    rows.forEach(([lab, a, col], i) => {
      const y = y0 + i * bh + bh * 0.22, hh = bh * 0.5;
      ctx.fillStyle = col; ctx.fillRect(x0, y, Math.max(0, X(a) - x0), hh);
      ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = col; ctx.fillText(lab, x0 - 8, y + hh / 2 + 4);
      const e = Math.floor(Math.log10(a) + 1e-9), txt = `${(a / 10 ** e).toFixed(1)}×10${[...String(e)].map((ch) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(ch)]).join("")}`, inside = X(a) + 76 > x1;
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = inside ? "#fff" : C.ink2; ctx.textAlign = inside ? "right" : "left"; ctx.fillText(txt, inside ? X(a) - 6 : X(a) + 6, y + hh / 2 + 4);
    });
  }
  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.p === pi)));
    const c = calc();
    oV.textContent = `${+c.V.toPrecision(2)} m/s`; oR.textContent = len(c.R); oP.textContent = c.phi; oK.innerHTML = sci(c.k);
    nRo.innerHTML = sci(c.ro);
    if (med === "air") {
      const pa = 1.2 * c.pg;
      nPg.textContent = pa * 1e3 < 100 ? `${(pa * 1e3).toPrecision(2)} hPa/100 km` : pa * 10 < 100 ? `${(pa * 10).toPrecision(2)} hPa/km` : `${(pa / 100).toPrecision(2)} hPa/m`;
    } else {
      const s = c.pg / G;
      nPg.textContent = s < 1e-3 ? `수면 경사 100 km당 ${(s * 1e5).toPrecision(2)} m` : `수면 경사 1 m당 ${(s * 100).toPrecision(2)} cm`;
    }
    nA.textContent = `${(Math.atan2(c.fr, c.co + c.ce) * 180 / Math.PI).toFixed(0)}°`;
    const bal = c.ro < 0.1 ? "로스비 수가 0.1보다 작아 원심력은 무시할 만합니다. 기압 경도력과 전향력이 거의 같은 지균 균형입니다." : c.ro > 10 ? "로스비 수가 10보다 커서 전향력은 무시할 만합니다. 기압 경도력과 원심력이 균형을 이루는 선형풍(회전풍)입니다." : "전향력과 원심력이 같은 자릿수입니다. 셋이 함께 균형을 이루는 경도풍으로 다뤄야 합니다.";
    const frm = c.k / c.f > 0.3 ? ` 마찰 계수가 f의 ${(c.k / c.f).toPrecision(2)}배여서 마찰도 무시할 수 없고, 바람이 저기압 쪽으로 비스듬히 붑니다.` : "";
    st.textContent = bal + frm;
    draw();
  }
  function preset(i) { pi = i; const [m, V, R, phi, k] = P[i]; med = m; sV.value = Math.log10(V); sR.value = Math.log10(R); sP.value = phi; sK.value = Math.log10(k); update(); }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => preset(+b.dataset.p)));
  [sV, sR, sP, sK].forEach((x) => x.addEventListener("input", () => { pi = -1; update(); }));
  preset(0);
})();
