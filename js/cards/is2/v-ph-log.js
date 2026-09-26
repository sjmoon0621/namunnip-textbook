/* 카드: pH는 왜 로그 눈금일까? — pH 눈금, 지시약 색, 선형 눈금 비교, 묽히기 */
(() => {
  const root = document.getElementById("card-is2-ph-log");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), pS = $(".ph"), pO = $(".ph-out"), dilB = $(".dil");
  const nH = $(".h"), nOH = $(".oh"), nX = $(".x"), msg = $(".msg");

  const KW = 1e-14; // 25 °C
  // 대표값 (제품·상태에 따라 차이가 있음)
  const SUB = [
    ["위액", 2.0], ["레몬즙", 2.2], ["식초", 2.9], ["커피", 5.0], ["빗물", 5.6], ["순수한 물", 7.0], ["혈액", 7.4],
    ["바닷물", 8.1], ["베이킹 소다 수용액", 8.3], ["비눗물", 10.0], ["암모니아수", 11.6], ["표백제", 12.5],
  ];
  let ph = +pS.value, note = "";

  const lerp = (a, b, t) => a + (b - a) * t;
  const mixc = (c1, c2, t) => `rgb(${[0, 1, 2].map((k) => Math.round(lerp(c1[k], c2[k], clamp(t, 0, 1))))})`;
  const IND = [
    ["리트머스", (p) => p < 4.5 ? mixc([214, 72, 72], [214, 72, 72], 0) : p > 8.3 ? mixc([70, 100, 190], [70, 100, 190], 0) : mixc([214, 72, 72], [70, 100, 190], (p - 4.5) / 3.8)],
    ["BTB", (p) => p < 6.0 ? "rgb(232,200,60)" : p > 7.6 ? "rgb(55,95,190)" : p < 6.8 ? mixc([232, 200, 60], [80, 160, 80], (p - 6.0) / 0.8) : mixc([80, 160, 80], [55, 95, 190], (p - 6.8) / 0.8)],
    ["페놀프탈레인", (p) => p < 8.2 ? "rgb(248,248,245)" : mixc([248, 222, 236], [214, 40, 140], (p - 8.2) / 1.8)],
  ];
  const UNI = [[0, [200, 30, 30]], [3, [240, 120, 40]], [5, [240, 210, 60]], [7, [90, 170, 70]], [9, [40, 120, 170]], [11, [70, 60, 160]], [14, [110, 40, 120]]];
  const uni = (p) => { for (let i = 0; i < UNI.length - 1; i++) if (p <= UNI[i + 1][0]) return mixc(UNI[i][1], UNI[i + 1][1], (p - UNI[i][0]) / (UNI[i + 1][0] - UNI[i][0])); return mixc(UNI.at(-1)[1], UNI.at(-1)[1], 0); };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 86, x1 = w - 14, X = (p) => x0 + p / 14 * (x1 - x0);
    // pH 눈금 (만능 지시약 색)
    const sy = 18, sh = 16;
    for (let p = 0; p < 14; p += 0.1) { ctx.fillStyle = uni(p); ctx.fillRect(X(p), sy, X(0.1) - X(0) + 1, sh); }
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let p = 0; p <= 14; p += 2) ctx.fillText(p, X(p), sy - 4);
    ctx.textAlign = "right"; ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.fillText("pH", x0 - 8, sy + 12);
    // 물질 이름표
    ctx.font = `10.5px ${F.sans}`;
    const rows = [];
    const lab = SUB.map(([n, p]) => ({ n, p, x: X(p), tw: ctx.measureText(n).width }));
    for (const l of lab) { let r = rows.findIndex((e) => e < l.x - l.tw / 2 - 4); if (r < 0) { r = rows.length; rows.push(-1e9); } rows[r] = l.x + l.tw / 2; l.r = r; }
    for (const l of lab) {
      const y = sy + sh + 13 + l.r * 13;
      ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(l.x + .5, sy + sh); ctx.lineTo(l.x + .5, y - 9); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText(l.n, clamp(l.x, x0 + l.tw / 2, x1 - l.tw / 2), y);
    }
    const labBot = sy + sh + 13 + (rows.length - 1) * 13 + 8;
    // 지시약
    let iy = labBot + 10;
    ctx.font = `11px ${F.sans}`;
    for (const [n, f] of IND) {
      for (let p = 0; p < 14; p += 0.1) { ctx.fillStyle = f(p); ctx.fillRect(X(p), iy, X(0.1) - X(0) + 1, 12); }
      ctx.strokeStyle = C.rule; ctx.strokeRect(x0 + .5, iy + .5, x1 - x0, 12);
      ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText(n, x0 - 8, iy + 10);
      iy += 18;
    }
    // 현재 pH
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(ph), sy - 2); ctx.lineTo(X(ph), iy - 4); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(ph), sy - 2); ctx.lineTo(X(ph) - 5, sy - 10); ctx.lineTo(X(ph) + 5, sy - 10); ctx.fill();
    // 선형 눈금 막대: 지금 pH의 H⁺를 1로 두고 앞뒤 pH를 비교
    const by0 = iy + 22, bh = h - by0 - 26;
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText("선형 눈금으로 본 H⁺ 농도 (지금 pH를 1로)", 14, by0 - 8);
    const bars = [-1, 0, 1, 2, 3], bw = Math.min(56, (w - 40) / bars.length - 12);
    bars.forEach((d, i) => {
      const x = 20 + i * ((w - 40) / bars.length), v = 10 ** (-d), hh = Math.min(1, v) * bh;
      ctx.fillStyle = d === 0 ? C.forest : "#9dbfd3";
      ctx.fillRect(x, by0 + bh - hh, bw, Math.max(hh, d > 0 ? 1 : 0));
      if (v > 1) { ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("↑ 10배 (넘침)", x + bw / 2, by0 + 12); }
      ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
      const pv = ph + d;
      ctx.fillText(pv < 0 || pv > 14 ? "—" : `pH ${pv.toFixed(1)}`, x + bw / 2, by0 + bh + 14);
      if (d > 0) ctx.fillText(`${v}`, x + bw / 2, by0 + bh - hh - 4);
    });
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(14, by0 + bh + .5); ctx.lineTo(w - 14, by0 + bh + .5); ctx.stroke();
  }

  const sci = (v) => { const e = Math.floor(Math.log10(v)), m = v / 10 ** e; return `${m.toFixed(1)}×10${String(e).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`; };
  function update() {
    pO.textContent = ph.toFixed(2).replace(/0$/, "");
    const H = 10 ** -ph, OH = KW / H;
    nH.textContent = sci(H); nOH.textContent = sci(OH);
    const r = H / 1e-7;
    nX.textContent = r >= 1 ? `${r >= 100 ? Math.round(r).toLocaleString() : r.toFixed(1)}배` : `1/${(1 / r) >= 100 ? Math.round(1 / r).toLocaleString() : (1 / r).toFixed(1)}`;
    msg.textContent = note || (ph < 7 ? "산성: H⁺가 OH⁻보다 많습니다." : ph > 7 ? "염기성: OH⁻가 H⁺보다 많습니다." : "중성: H⁺와 OH⁻가 같습니다.");
    root.querySelectorAll("[data-ph]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.ph - ph) < 0.001)));
    draw();
  }
  pS.addEventListener("input", () => { ph = +pS.value; note = ""; update(); });
  root.querySelectorAll("[data-ph]").forEach((b) => b.addEventListener("click", () => { ph = +b.dataset.ph; pS.value = ph; note = ""; update(); }));
  dilB.addEventListener("click", () => {
    // 강산(또는 강염기) 용액을 물로 10배 묽힌다. 물 자체의 이온화(Kw)까지 넣어 계산.
    const H = 10 ** -ph;
    if (Math.abs(ph - 7) < 1e-3) { note = "순수한 물은 아무리 묽혀도 pH 7입니다."; update(); return; }
    let nh;
    if (ph < 7) { const ca = (H - KW / H) / 10; nh = (ca + Math.sqrt(ca * ca + 4 * KW)) / 2; }
    else { const OH = KW / H, cb = (OH - KW / OH) / 10, noh = (cb + Math.sqrt(cb * cb + 4 * KW)) / 2; nh = KW / noh; }
    const before = ph; ph = -Math.log10(nh); pS.value = ph;
    note = Math.abs(ph - before) > 0.9 ? `10배 묽히니 pH가 ${before.toFixed(2)} → ${ph.toFixed(2)}, 약 1만큼 7 쪽으로 움직였습니다.`
      : `pH ${before.toFixed(2)} → ${ph.toFixed(2)}. 7에 가까워지면 물 자체가 내놓는 H⁺와 OH⁻(각 10⁻⁷ mol/L)가 무시할 수 없어져, 아무리 묽혀도 7을 넘어가지 않습니다.`;
    update();
  });
  update();
})();
