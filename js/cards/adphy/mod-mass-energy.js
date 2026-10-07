/* 카드: 가속기에서 에너지를 계속 넣으면 전자는 빛보다 빨라질까? — 뉴턴 역학과 상대성 이론의 운동 에너지–속력 관계 */
(() => {
  const root = document.getElementById("card-adphy-mass-energy");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sK = $(".sk"), oK = $(".ok"), oR = $(".or");
  const nV = $(".nv"), nC = $(".nc"), nG = $(".ng"), nD = $(".nd");
  const MC2 = { e: 0.51099895e6, p: 938.272e6 }; /* eV */
  let q = "e";
  const vRel = (k) => Math.sqrt(1 - 1 / (1 + k) ** 2);
  const vCls = (k) => Math.sqrt(2 * k);
  const fmtE = (e) => (e >= 1e12 ? (e / 1e12).toPrecision(3) + " TeV" : e >= 1e9 ? (e / 1e9).toPrecision(3) + " GeV" : e >= 1e6 ? (e / 1e6).toPrecision(3) + " MeV" : e >= 1e3 ? (e / 1e3).toPrecision(3) + " keV" : e.toPrecision(3) + " eV");
  const sci = (x) => { if (x === 0) return "0"; const e = Math.floor(Math.log10(x)); return e >= -2 ? x.toFixed(3) : `${(x / 10 ** e).toFixed(2)}×10${String(e).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`; };

  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, al, c, f) { ctx.fillStyle = c || C.ink3; ctx.font = f || `11px ${F.sans}`; ctx.textAlign = al || "left"; ctx.fillText(s, x, y); }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lk = +sK.value, k = 10 ** lk;
    const gx = 40, gw = w * 0.7 - 50, gy = 18, gh = h - 50;
    const X = (l) => gx + (l + 3) / 7 * gw, Y = (v) => gy + gh - v / 1.3 * gh;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let l = -3; l <= 4; l++) { ctx.beginPath(); ctx.moveTo(X(l), gy); ctx.lineTo(X(l), gy + gh); ctx.stroke(); txt(l === 0 ? "1" : `10${l < 0 ? "⁻" : ""}${"⁰¹²³⁴⁵⁶⁷⁸⁹"[Math.abs(l)]}`, X(l), gy + gh + 14, "center", C.ink3, `10.5px ${F.mono}`); }
    [0.5, 1].forEach((v) => { ctx.beginPath(); ctx.moveTo(gx, Y(v)); ctx.lineTo(gx + gw, Y(v)); ctx.stroke(); txt(v === 1 ? "c" : "0.5c", gx - 5, Y(v) + 4, "right", C.ink3, `10.5px ${F.mono}`); });
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; ctx.setLineDash([6, 3]); ctx.beginPath(); ctx.moveTo(gx, Y(1)); ctx.lineTo(gx + gw, Y(1)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    const curve = (fn, col, dash) => {
      ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip();
      ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.setLineDash(dash || []); ctx.beginPath();
      for (let i = 0; i <= 350; i++) { const l = -3 + i / 350 * 7, y = Y(fn(10 ** l)); i ? ctx.lineTo(X(l), y) : ctx.moveTo(X(l), y); }
      ctx.stroke(); ctx.restore();
    };
    curve(vCls, "#8d8d92", [5, 4]); curve(vRel, "#3f6fa3");
    txt("뉴턴 역학 ½mv²", X(0.25), Y(1.22), "left", "#5d5d61");
    txt("상대성 이론", X(2.2), Y(1) + 16, "left", "#3f6fa3");
    txt("운동 에너지 K / mc² (로그 눈금)", gx + gw, gy + gh + 30, "right");
    txt("속력", gx + 4, gy - 4);
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(lk), Y(vRel(k)), 5, 0, 7); ctx.fill();
    if (vCls(k) < 1.3) { ctx.strokeStyle = C.apple; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(lk), Y(vCls(k)), 5, 0, 7); ctx.stroke(); }
    /* 오른쪽: 에너지 막대 */
    const bx = w * 0.76, bw = Math.min(54, w * 0.1), by = gy + 10, bh = gh - 20, tot = 1 + k;
    const hr = bh / tot;
    ctx.fillStyle = "#b5d7ac"; ctx.fillRect(bx, by + bh - hr, bw, hr);
    ctx.fillStyle = "rgba(212,73,58,.75)"; ctx.fillRect(bx, by, bw, bh - hr);
    ctx.strokeStyle = C.ink; ctx.strokeRect(bx, by, bw, bh);
    txt("전체 에너지 E = γmc²", bx + bw / 2, by - 8, "center", C.ink);
    txt(`K ${(k / tot * 100).toFixed(k / tot > 0.999 ? 2 : 1)} %`, bx + bw + 6, by + Math.max(12, (bh - hr) / 2), "left", C.apple);
    txt(`mc² ${(100 / tot).toFixed(1 / tot < 0.01 ? 3 : 1)} %`, bx + bw + 6, Math.min(by + bh - 2, by + bh - hr / 2 + 4), "left", C.forest);
    /* 수치 */
    const E = k * MC2[q];
    oK.textContent = fmtE(E); oR.textContent = k < 0.01 ? k.toExponential(1) : k < 100 ? k.toPrecision(3) : k.toFixed(0);
    const v = vRel(k), vc = vCls(k);
    nV.textContent = v > 0.9999 ? (1 - (1 - v)).toFixed(8) : v.toFixed(4);
    nC.textContent = vc.toFixed(3) + (vc > 1 ? " (> c)" : ""); nC.className = "nc " + (vc > 1 ? "bad" : "");
    nG.textContent = (1 + k).toPrecision(4);
    /* 1 − β 를 정확히: 1 − √(1 − 1/γ²) = (1/γ²)/(1 + √(1 − 1/γ²)) */
    const g2 = 1 / (1 + k) ** 2; nD.textContent = sci(g2 / (1 + Math.sqrt(1 - g2)));
  }
  function setQ(nq) { q = nq; root.querySelectorAll("[data-q]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.q === q))); draw(); }
  root.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => setQ(b.dataset.q)));
  root.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => {
    const [pq, e] = b.dataset.x.split(","); sK.value = Math.log10(+e / MC2[pq]); setQ(pq);
  }));
  sK.addEventListener("input", draw);
  draw();
})();
