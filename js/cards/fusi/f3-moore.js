/* 카드: 지난 추세만 보고 미래 기술을 얼마나 맞힐 수 있을까? — 트랜지스터 수의 추세 외삽 */
(() => {
  const root = document.getElementById("card-fusi-moore");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  /* 위키백과 "Transistor count" (마이크로프로세서 표), 회사 발표값 */
  const D = [
    [1971, 2250, "4004"], [1972, 3500, "8008"], [1974, 4500, "8080"], [1978, 29000, "8086"],
    [1982, 134000, "80286"], [1985, 275000, "80386"], [1989, 1180235, "80486"], [1993, 3100000, "Pentium"],
    [1997, 7500000, "Pentium II"], [1999, 9500000, "Pentium III"], [2000, 42000000, "Pentium 4"],
    [2006, 291000000, "Core 2 Duo"], [2008, 731000000, "Core i7"], [2013, 1e9, "A7"], [2017, 4.3e9, "A11"],
    [2020, 1.6e10, "M1"], [2023, 1.34e11, "M2 Ultra"],
  ];
  const ACT = 1.34e11;
  const cv = $("canvas"), sCut = $(".cut"), oCut = $(".cut-out"), cShow = $(".show");
  let model = "exp";
  const { ctx, size } = fit(cv, () => draw());
  const sup = (k) => String(k).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c]).join("");
  const sci = (v) => {
    if (!Number.isFinite(v) || v <= 0) return "0 이하";
    const e = Math.floor(Math.log10(v)), m = v / 10 ** e;
    return `${m.toFixed(1)}×10${sup(e)}`;
  };
  function fitNow() {
    const cut = +sCut.value, k = D.filter((d) => d[0] <= cut);
    if (model === "exp") {
      const f = NMLab.linfit(k.map((d) => d[0]), k.map((d) => Math.log10(d[1])));
      return { f: (y) => 10 ** (f.a * y + f.b), dbl: Math.log10(2) / f.a, n: k.length };
    }
    const f = NMLab.linfit(k.map((d) => d[0]), k.map((d) => d[1]));
    return { f: (y) => f.a * y + f.b, slope: f.a, n: k.length };
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cut = +sCut.value, M = fitNow(), show = cShow.checked;
    const x0 = 52, x1 = w - 14, y0 = 20, y1 = h - 34, Y0 = 3, Y1 = 12, T0 = 1970, T1 = 2030;
    const X = (t) => x0 + (t - T0) / (T1 - T0) * (x1 - x0), Y = (v) => y1 - (Math.log10(v) - Y0) / (Y1 - Y0) * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y: (e) => Y(10 ** e),
      xt: [1970, 1980, 1990, 2000, 2010, 2020, 2030].map((t) => [t, String(t)]),
      yt: [3, 5, 7, 9, 11].map((e) => [e, "10" + sup(e)]),
      ylabel: "칩 하나의 트랜지스터 수 (로그 눈금)", xlabel: "연도" });
    ctx.fillStyle = "rgba(116,171,102,.12)"; ctx.fillRect(x0, y0, X(cut) - x0, y1 - y0);
    ctx.strokeStyle = C.forest; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(cut) + .5, y0); ctx.lineTo(X(cut) + .5, y1); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("아는 자료", x0 + 6, y0 + 14);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2;
    for (const [a, b, dash] of [[T0, cut, []], [cut, T1, [6, 4]]]) {
      ctx.setLineDash(dash); ctx.beginPath(); let started = false;
      for (let i = 0; i <= 120; i++) {
        const t = a + (b - a) * i / 120, v = M.f(t);
        if (!(v > 0)) { started = false; continue; }
        const py = Y(v); started ? ctx.lineTo(X(t), py) : ctx.moveTo(X(t), py); started = true;
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const [t, n, name] of D) {
      const known = t <= cut; if (!known && !show) continue;
      ctx.beginPath(); ctx.arc(X(t), Y(n), 4, 0, Math.PI * 2);
      if (known) { ctx.fillStyle = "#3f6fa3"; ctx.fill(); } else { ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    ctx.restore();
    if (show) {
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText("M2 Ultra", X(2023) - 7, Y(ACT) + 4);
    }
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`;
    const lx = Math.max(x0 + 70, X(cut) + 8);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("● 아는 점  ○ 그 뒤의 실제 값", lx, y1 - 22);
    ctx.fillStyle = C.warn; ctx.fillText("— 맞춘 추세  - - 외삽", lx, y1 - 8);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === model)));
    oCut.textContent = sCut.value;
    const M = fitNow(), p = M.f(2023);
    $(".n-d").textContent = model === "exp" ? `${M.dbl.toFixed(2)}년 (점 ${M.n}개로 맞춤)` : `두 배 기간이 일정하지 않음 (해마다 ${sci(M.slope)}개씩)`;
    $(".n-p").textContent = sci(p);
    $(".n-a").textContent = cShow.checked ? sci(ACT) : "‘실제 값 보기’를 켜세요";
    $(".n-r").textContent = cShow.checked ? (p > 0 ? `${(p / ACT).toPrecision(2)}배` : "예측이 0 이하") : "—";
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { model = b.dataset.m; update(); }));
  sCut.addEventListener("input", update); cShow.addEventListener("change", update);
  if (NMLab.demo) cShow.checked = true;
  update();
})();
