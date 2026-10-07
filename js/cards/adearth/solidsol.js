/* 카드: 이온 치환과 고용체 — 감람석(Fo–Fa), 사장석(Ab–An). 이온 반지름: Shannon(1976) 6배위 */
(() => {
  const root = document.getElementById("card-adearth-solidsol");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sX = $(".x"), ionBox = $(".ss-ion");
  const NA = 6.022e23;
  const SER = {
    ol: {
      host: ["Mg²⁺", 0.72, 2], lab: "Fo", a: "Fa (Fe₂SiO₄)", b: "Fo (Mg₂SiO₄)", x0: 90, yr: [3.1, 4.5],
      ions: [["Fe²⁺", 0.78, 2], ["Ni²⁺", 0.69, 2], ["Mn²⁺", 0.83, 2], ["Ca²⁺", 1.0, 2], ["K⁺", 1.38, 1], ["Al³⁺", 0.535, 3]],
      /* x = Fo 비율. 단위 세포(Z = 4) 부피: Fo 290.1, Fa 307.9 Å³ */
      M: (x) => 2 * (24.305 * x + 55.845 * (1 - x)) + 28.086 + 4 * 15.999,
      rho: (x) => 4 * SER.ol.M(x) / (NA * (290.1 * x + 307.9 * (1 - x)) * 1e-24),
      f: (x) => `(Mg${x.toFixed(2)}Fe${(1 - x).toFixed(2)})₂SiO₄`,
      name: (p) => (p >= 90 ? "고토감람석에 가까움" : p <= 10 ? "철감람석에 가까움" : "감람석 고용체"),
    },
    pl: {
      host: ["Na⁺", 1.02, 1], lab: "An", a: "Ab (NaAlSi₃O₈)", b: "An (CaAl₂Si₂O₈)", x0: 60, yr: [2.55, 2.82],
      ions: [["Ca²⁺", 1.0, 2], ["Sr²⁺", 1.18, 2], ["K⁺", 1.38, 1], ["Mg²⁺", 0.72, 2]],
      M: (x) => 262.22 * (1 - x) + 278.21 * x,
      rho: (x) => 2.62 * (1 - x) + 2.76 * x,
      f: (x) => `Na${(1 - x).toFixed(2)}Ca${x.toFixed(2)}Al${(1 + x).toFixed(2)}Si${(3 - x).toFixed(2)}O₈`,
      name: (p) => (p < 10 ? "조장석" : p < 30 ? "회조장석" : p < 50 ? "중성장석" : p < 70 ? "래브라도라이트" : p < 90 ? "바이토나이트" : "회장석"),
    },
  };
  let ser = "ol", ion = 0;
  function chips() {
    const s = SER[ser];
    ionBox.innerHTML = `<span class="mono small dim">${s.host[0]} 자리에 넣어 볼 이온</span>` + s.ions.map((q, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === ion}">${q[0]} ${q[1].toFixed(2)} Å</button>`).join("");
    ionBox.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { ion = +b.dataset.i; update(); }));
  }
  function verdict(dr, dq) {
    if (dq !== 0) return dr < 20 ? ["결합 치환 필요", ""] : ["거의 안 들어감", "bad"];
    if (dr < 10) return ["쉽게 치환", "good"];
    if (dr < 20) return ["치환 가능(제한적)", ""];
    return ["거의 안 들어감", "bad"];
  }
  const { ctx, size } = fit(cv, () => draw());
  function ball(x, y, r, fill, lab, sub) {
    ctx.fillStyle = fill; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `bold 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, x, y + 4);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText(sub, x, y + r + 14);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = SER[ser], q = s.ions[ion], sc = Math.min(48, w / 13), ty = 22 + 1.4 * sc;
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("이온 크기 비교 (실제 비율)", 8, 14);
    ball(w * 0.18, ty, s.host[1] * sc, "#f2d7a6", s.host[0], `자리 이온 ${s.host[1].toFixed(2)} Å`);
    ball(w * 0.47, ty, q[1] * sc, "#b9d3ea", q[0], `${q[1].toFixed(3).replace(/0$/, "")} Å`);
    /* 겹쳐 보기 */
    const cx = w * 0.79;
    ctx.fillStyle = "rgba(242,215,166,.7)"; ctx.beginPath(); ctx.arc(cx, ty, s.host[1] * sc, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(cx, ty, q[1] * sc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("겹쳐 보기", cx, ty + Math.max(s.host[1], q[1]) * sc + 14);
    /* 아래: 밀도–조성 */
    const gx0 = 52, gx1 = w - 14, gy0 = h * 0.40, gy1 = h - 34, [ya, yb] = s.yr;
    const X = (p) => gx0 + p / 100 * (gx1 - gx0), Y = (r) => gy1 - (r - ya) / (yb - ya) * (gy1 - gy0);
    const yt = []; const st = ser === "ol" ? 0.2 : 0.05; for (let v = Math.ceil(ya / st) * st; v <= yb + 1e-9; v += st) yt.push([v, v.toFixed(2)]);
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gx1 - gx0, h: gy1 - gy0, X, Y, xt: [0, 20, 40, 60, 80, 100].map((p) => [p, String(p)]), yt, ylabel: "밀도 (g/cm³)" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    for (let p = 0; p <= 100; p++) { const v = s.rho(p / 100); if (p) ctx.lineTo(X(p), Y(v)); else ctx.moveTo(X(p), Y(v)); }
    ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`;
    ctx.textAlign = "left"; ctx.fillText(`0 % = ${s.a}`, gx0, gy1 + 28);
    ctx.textAlign = "right"; ctx.fillText(`100 % = ${s.b}`, gx1, gy1 + 28);
    const p = +sX.value, v = s.rho(p / 100);
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(p), gy1); ctx.lineTo(X(p), Y(v)); ctx.lineTo(gx0, Y(v)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(p), Y(v), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = p > 60 ? "right" : "left"; ctx.fillText(s.name(p), X(p) + (p > 60 ? -8 : 8), Y(v) + (ser === "ol" ? 16 : -8));
  }
  function update() {
    const s = SER[ser], q = s.ions[ion], p = +sX.value, x = p / 100;
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === ser)));
    ionBox.querySelectorAll("[data-i]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.i === ion)));
    $(".x-lab").textContent = s.lab; $(".x-out").textContent = String(p);
    $(".n-f").textContent = s.f(x); $(".n-m").textContent = s.M(x).toFixed(1); $(".n-r").textContent = s.rho(x).toFixed(3);
    const dr = Math.abs(q[1] - s.host[1]) / s.host[1] * 100, dq = q[2] - s.host[2];
    $(".n-dr").textContent = `${dr.toFixed(0)} %`; $(".n-dq").textContent = dq === 0 ? "0" : (dq > 0 ? "+" : "") + dq;
    const [t, cls] = verdict(dr, dq), j = $(".n-j"); j.textContent = t; j.className = "n-j " + cls;
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { ser = b.dataset.s; ion = 0; sX.value = SER[ser].x0; chips(); update(); }));
  sX.addEventListener("input", update);
  chips(); update();
})();
