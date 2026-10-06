/* 카드: 0.100 M 용액 100 mL를 만들 때 어떤 실수가 농도를 가장 크게 바꿀까? — 질량으로 만들기, 희석, 여러 농도 표현, 흔한 실수 */
(() => {
  const root = document.getElementById("card-labchem-solution");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const U = (a) => (Math.random() * 2 - 1) * a;

  const MW = { nacl: 58.44, cu5: 249.69, cu0: 159.61 };
  const G = {
    nacl: { c: 0.1, lab: "0.100 M NaCl", goal: "NaCl(58.44 g/mol)을 달아 100 mL 부피 플라스크에 0.100 M 용액을 만듭니다.", k: 0.0405, anh: MW.nacl, solid: MW.nacl },
    cu: { c: 0.05, lab: "0.0500 M CuSO₄", goal: "파란 황산 구리(Ⅱ) 결정 CuSO₄·5H₂O(249.69 g/mol)를 달아 0.0500 M CuSO₄ 용액 100 mL를 만듭니다.", k: 0.155, anh: MW.cu0, solid: MW.cu5 },
    dil: { c: 0.01, lab: "0.0100 M NaCl", goal: "0.1000 M NaCl 원액을 10.00 mL 부피 피펫으로 옮겨 100 mL 부피 플라스크에서 0.0100 M로 묽힙니다.", k: 0.0405, anh: MW.nacl },
  };
  const FLASK = 100 + U(0.06), PIP = 10 + U(0.015), NECK = 0.133;   // 개체 보정값(mL), 목 1 mm당 부피(mL)
  let gk = "nacl", last = null;
  const sFill = $(".fill"), inM = $(".mass");

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "lab", label: "목표" }, { key: "ms", label: "질량·부피" }, { key: "f", label: "눈금 차 (mm)", res: 1 },
    { key: "cm", label: "확인 c (M)", res: 0.00001 }, { key: "err", label: "오차 (%)", res: 0.1 },
  ], () => { drawPlot(); nums(); });

  function make() {
    const g = G[gk], fill = +sFill.value, V = FLASK + fill * NECK;   // mL
    const rinse = $(".e-rinse").checked, wet = $(".e-wet").checked, mix = $(".e-mix").checked;
    let n, mUsed = null;
    if (gk === "dil") {
      n = 0.1 * (wet ? 0.988 : 1) * PIP / 1000;
    } else {
      mUsed = Math.max(0, +inM.value || 0);
      n = mUsed / g.solid * (rinse ? 0.965 : 1);
    }
    const c = n / (V / 1000);
    const cm = L.measure(c * (mix ? 1 + 0.06 * L.gauss() : 1), { rel: 0.003 });
    const rho = 0.9982 + g.k * c, msol = rho * V, mSolute = n * g.anh, mSolvent = msol - mSolute;
    last = { M: c, p: mSolute / msol * 100, ppm: mSolute / msol * 1e6, m: n / (mSolvent / 1000) };
    tbl.add({ lab: g.lab, ms: gk === "dil" ? "10.00 mL" : mUsed.toFixed(4) + " g", f: fill, cm, err: (cm / g.c - 1) * 100, _last: last });
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = G[gk], blue = gk === "cu" ? "rgba(70,140,220,0.45)" : "rgba(120,170,215,0.22)";
    // 왼쪽: 저울 또는 피펫
    const lx = w * 0.04, lw = w * 0.28;
    if (gk === "dil") {
      const px = lx + lw / 2;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(px, 14); ctx.lineTo(px, h * 0.32); ctx.moveTo(px, h * 0.62); ctx.lineTo(px, h * 0.86); ctx.stroke();
      ctx.fillStyle = blue; ctx.beginPath(); ctx.ellipse(px, h * 0.47, 11, h * 0.15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - 6, h * 0.2); ctx.lineTo(px + 6, h * 0.2); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("10.00 mL 부피 피펫", px, h - 12);
    } else {
      const by = h * 0.62;
      ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
      ctx.fillRect(lx, by, lw, h * 0.22); ctx.strokeRect(lx, by, lw, h * 0.22);
      ctx.beginPath(); ctx.moveTo(lx + lw * 0.2, by - 6); ctx.lineTo(lx + lw * 0.8, by - 6); ctx.stroke();
      ctx.strokeRect(lx - 2, h * 0.12, lw + 4, by - h * 0.12);
      ctx.fillStyle = gk === "cu" ? "#3f7fd0" : "#f4f4f4"; ctx.strokeStyle = C.ink3;
      ctx.beginPath(); ctx.moveTo(lx + lw * 0.32, by - 7); ctx.quadraticCurveTo(lx + lw / 2, by - 24, lx + lw * 0.68, by - 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.night; ctx.fillRect(lx + lw * 0.1, by + h * 0.05, lw * 0.8, h * 0.11);
      ctx.fillStyle = "#9be08a"; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText((+inM.value || 0).toFixed(4) + " g", lx + lw * 0.86, by + h * 0.135);
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("분석 저울 (0.1 mg)", lx + lw / 2, h - 12);
    }
    // 가운데: 부피 플라스크
    const fx = w * 0.47, fy = h * 0.84, R = Math.min(h * 0.24, w * 0.11), nw = 9;
    ctx.fillStyle = blue; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(fx - nw, 14); ctx.lineTo(fx - nw, fy - R * 1.7);
    ctx.quadraticCurveTo(fx - R * 1.2, fy - R * 1.2, fx - R * 1.15, fy - R * 0.3); ctx.lineTo(fx - R * 1.15, fy); ctx.lineTo(fx + R * 1.15, fy); ctx.lineTo(fx + R * 1.15, fy - R * 0.3);
    ctx.quadraticCurveTo(fx + R * 1.2, fy - R * 1.2, fx + nw, fy - R * 1.7); ctx.lineTo(fx + nw, 14);
    ctx.stroke();
    const markY = h * 0.3, liqY = markY - +sFill.value * 2.2;
    ctx.save(); ctx.clip();
    ctx.fillRect(0, liqY, w, h); ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(fx - nw - 3, markY); ctx.lineTo(fx + nw + 3, markY); ctx.stroke();
    ctx.strokeStyle = C.warn; ctx.strokeRect(fx - nw - 6, markY - 16, 2 * nw + 12, 32);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("100 mL 부피 플라스크", fx, h - 12 + 0);
    // 오른쪽: 목 확대
    const zx = w * 0.7, zw = w * 0.22, zt = 16, zb = h * 0.8, zm = (zt + zb) / 2, px = 9;   // px: 1 mm 화면 높이
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(fx + nw + 6, markY - 16); ctx.lineTo(zx, zt); ctx.moveTo(fx + nw + 6, markY + 16); ctx.lineTo(zx, zb); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(zx, zt, zw, zb - zt); ctx.clip();
    ctx.fillStyle = C.card; ctx.fillRect(zx, zt, zw, zb - zt);
    const my = zm - +sFill.value * px;
    ctx.fillStyle = blue; ctx.beginPath(); ctx.moveTo(zx, my - 7);
    for (let i = 0; i <= 20; i++) { const u = i / 10 - 1; ctx.lineTo(zx + zw * i / 20, my - 7 * u * u); }
    ctx.lineTo(zx + zw, zb); ctx.lineTo(zx, zb); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#3d6f99"; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= 20; i++) { const u = i / 10 - 1, x = zx + zw * i / 20, y = my - 7 * u * u; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(zx, zm); ctx.lineTo(zx + zw, zm); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.strokeRect(zx, zt, zw, zb - zt);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("눈금선 확대", zx + zw / 2, h - 12);
    const f = +sFill.value;
    ctx.fillStyle = f > 0 ? C.warn : f < 0 ? C.warn : C.forest; ctx.font = `11px ${F.mono}`;
    ctx.fillText(f === 0 ? "맞춤" : `${f > 0 ? "+" : ""}${(f * NECK).toFixed(2)} mL`, zx + zw / 2, zb + 14);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows, lim = 5;
    const inr = rows.map((r, i) => ({ x: i + 1, y: r.err })).filter((p) => Math.abs(p.y) <= lim);
    const o = L.plot(ctx, { x0: 46, y0: 18, w: w - 60, h: h - 52 }, { pts: inr, model: () => 0, xr: [0, Math.max(6, rows.length + 1)], yr: [-lim, lim], xlabel: "기록 번호", ylabel: "목표 대비 오차 (%)" });
    rows.forEach((r, i) => {
      if (Math.abs(r.err) <= lim) return;
      const x = o.X(i + 1), up = r.err > 0, y = o.Y(up ? lim : -lim);
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(x, y + (up ? -1 : 1)); ctx.lineTo(x - 5, y + (up ? 9 : -9)); ctx.lineTo(x + 5, y + (up ? 9 : -9)); ctx.fill();
      ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${r.err.toFixed(0)}%`, x + 7, y + (up ? 10 : -3));
    });
    ctx.fillStyle = "rgba(116,171,102,0.15)"; ctx.fillRect(o.X(0), o.Y(0.5), o.X(o.xr[1]) - o.X(0), o.Y(-0.5) - o.Y(0.5));
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("띠: ±0.5% 안 · 세모: 범위 밖", 50, h - 4);
  }

  function nums() {
    const r = tbl.rows[tbl.rows.length - 1], v = r && r._last;
    $(".n-M").textContent = v ? v.M.toPrecision(4) + " M" : "—";
    $(".n-p").textContent = v ? v.p.toPrecision(3) + " %" : "—";
    $(".n-ppm").textContent = v ? Math.round(v.ppm).toString() : "—";
    $(".n-m").textContent = v ? v.m.toPrecision(4) + " m" : "—";
  }

  function setG(k) {
    gk = k;
    root.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.g === k)));
    $(".goal").textContent = G[k].goal;
    inM.disabled = k === "dil"; $(".e-wet").disabled = k !== "dil"; $(".e-rinse").disabled = k === "dil";
    draw();
  }
  $(".gsel").addEventListener("click", (e) => { const b = e.target.closest("[data-g]"); if (b) setG(b.dataset.g); });
  sFill.addEventListener("input", () => { $(".f-out").textContent = (+sFill.value > 0 ? "+" : "") + sFill.value; draw(); });
  inM.addEventListener("input", draw);
  $(".make").addEventListener("click", make);
  $(".clear").addEventListener("click", () => tbl.clear());

  setG("nacl");
  if (L.demo) {
    const run = (g, m, f, ch = []) => {
      setG(g); inM.value = m; sFill.value = f; ["e-rinse", "e-wet", "e-mix"].forEach((c) => { $("." + c).checked = ch.includes(c); }); make();
    };
    run("nacl", "0.5844", 0); run("nacl", "0.5844", 8); run("nacl", "0.5844", 0, ["e-rinse"]);
    run("cu", "1.2484", 0); run("cu", "0.7980", 0); run("dil", "0", 0); run("dil", "0", 0, ["e-wet"]);
    ["e-rinse", "e-wet", "e-mix"].forEach((c) => { $("." + c).checked = false; });
    sFill.value = 0; $(".f-out").textContent = "0"; setG("nacl"); inM.value = "0.5844"; draw();
  }
})();
