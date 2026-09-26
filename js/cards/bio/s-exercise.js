/* 카드: 운동하면 왜 숨이 가빠지고 심장이 빨리 뛸까? — 산소 요구량에 따른 심박수·환기량 (모식 모형, 몸무게 65 kg) */
(() => {
  const root = document.getElementById("card-bio-exercise");
  if (!root) return;
  const { C, F, clamp, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".demand");
  let who = "u", ph = 0, pl = 0;

  // 대표적인 문헌값에 맞춘 모식 모형: 심박출량은 산소 섭취량 1 L/분당 약 5.5 L/분씩 늘어난다
  const P = { u: { vmax: 45, svr: 70, svm: 100, vtm: 1.8, name: "보통 학생" }, t: { vmax: 60, svr: 90, svm: 130, vtm: 2.4, name: "지구력 훈련한 학생" } };
  const M = 65, VR = 3.5 * M;
  function model(p, d) {
    const x = clamp((d - 3.5) / (p.vmax - 3.5), 0, 1), vo2 = Math.min(d, p.vmax) * M;
    const Q = 4.55 + 5.5 * (vo2 - VR) / 1000;
    const sv = p.svr + (p.svm - p.svr) * (1 - Math.exp(-x / 0.3)) / (1 - Math.exp(-1 / 0.3));
    const ve = vo2 / 1000 * (25 + 11 * Math.max(0, (x - 0.55) / 0.45) ** 2), vt = 0.5 + p.vtm * x ** 0.8;
    return { x, vo2, Q, sv, hr: Q * 1000 / sv, ve, vt, f: ve / vt, over: d > p.vmax };
  }

  const { ctx, size } = fit(cv, () => draw());
  const VW = 400, VH = 225;
  function txt(s, x, y, o = {}) {
    ctx.font = `${o.w || 500} ${o.size || 12}px ${o.mono ? F.mono : F.sans}`;
    ctx.textAlign = o.align || "left"; ctx.fillStyle = o.c || C.ink; ctx.fillText(s, x, y); ctx.textAlign = "left";
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const dpr = cv.width / w, s = Math.min(w / VW, h / VH);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    const d = +sD.value, m = model(P[who], d);
    // 폐
    const breath = 0.5 - 0.5 * Math.cos(pl * 2 * Math.PI), amp = 0.04 + 0.16 * (m.vt - 0.5) / 2.4;
    const ls = 1 + amp * breath;
    ctx.save(); ctx.translate(62, 62); ctx.scale(ls, ls);
    ctx.fillStyle = "rgba(90,127,181,.55)";
    ctx.beginPath(); ctx.ellipse(-16, 4, 13, 26, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(16, 4, 13, 26, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#8a9fc4"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(62, 22); ctx.lineTo(62, 44); ctx.stroke();
    txt(`호흡 ${Math.round(m.f)}회/분`, 62, 114, { align: "center", size: 11.5, mono: 1, w: 600 });
    // 심장
    const beat = Math.pow(Math.max(0, Math.sin(ph * 2 * Math.PI)), 6), hs = 0.92 + 0.12 * beat;
    ctx.save(); ctx.translate(62, 158); ctx.scale(hs * 0.9, hs * 0.9);
    ctx.fillStyle = "#c9444a"; ctx.beginPath(); ctx.moveTo(0, 26);
    ctx.bezierCurveTo(-30, 6, -30, -22, -12, -22); ctx.bezierCurveTo(-4, -22, 0, -16, 0, -12);
    ctx.bezierCurveTo(0, -16, 4, -22, 12, -22); ctx.bezierCurveTo(30, -22, 30, 6, 0, 26); ctx.fill();
    ctx.restore();
    txt(`심박 ${Math.round(m.hr)}회/분`, 62, 208, { align: "center", size: 11.5, mono: 1, w: 600 });

    // 그래프: 산소 요구량 - 심박수
    const x0 = 164, y0 = 16, gw = 222, gh = 170;
    const X = (v) => x0 + v / 60 * gw, Y = (v) => y0 + (1 - (v - 40) / 170) * gh;
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [[0, "0"], [20, "20"], [40, "40"], [60, "60"]], yt: [[60, "60"], [100, "100"], [140, "140"], [180, "180"]], xlabel: "산소 요구량 (mL/kg·분)", ylabel: "심박수 (회/분)" });
    for (const k of ["u", "t"]) {
      const p = P[k], on = k === who;
      ctx.strokeStyle = k === "u" ? C.warn : C.forest; ctx.lineWidth = on ? 2.4 : 1.2; ctx.setLineDash(on ? [] : [4, 4]);
      ctx.beginPath();
      for (let v = 3.5; v <= 60; v += 0.5) { const r = model(p, v); v === 3.5 ? ctx.moveTo(X(v), Y(r.hr)) : ctx.lineTo(X(v), Y(r.hr)); }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(35,35,38,.25)"; ctx.fillRect(X(p.vmax) - 0.5, Y(model(p, p.vmax).hr) - 6, 1, 12);
    }
    txt("보통", X(46) + 3, Y(194) + 14, { size: 10.5, c: C.warn, mono: 1 });
    txt("훈련", X(52), Y(170) + 14, { size: 10.5, c: C.forest, mono: 1 });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(d) + .5, y0); ctx.lineTo(X(d) + .5, y0 + gh); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(d), Y(m.hr), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }

  function update() {
    const d = +sD.value, p = P[who], m = model(p, d);
    $(".d-out").textContent = d.toFixed(1);
    $(".hr").textContent = Math.round(m.hr);
    $(".sv").textContent = `${Math.round(m.sv)} mL`;
    $(".q").textContent = `${m.Q.toFixed(1)} L`;
    $(".ve").textContent = `${Math.round(m.ve)} L`;
    const note = $(".ex-note");
    if (m.over) {
      note.textContent = `${p.name}의 최대 산소 섭취량(${p.vmax} mL/kg·분)을 넘었습니다. 심박수는 더 오르지 않고, 모자란 에너지를 산소 없이 얻느라 젖산이 쌓여 오래 버티지 못합니다.`;
      note.classList.add("bad");
    } else {
      note.classList.remove("bad");
      note.textContent = `쉴 때보다 심박출량은 ${(m.Q / 4.55).toFixed(1)}배, 환기량은 ${(m.ve / 5.7).toFixed(1)}배입니다. 혈액 1 L가 조직에 내려놓는 O₂도 쉴 때 약 50 mL에서 지금 약 ${Math.round(m.vo2 / m.Q)} mL로 늘었습니다.`;
    }
    root.querySelectorAll("[data-who]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.who === who));
    root.querySelectorAll("[data-d]").forEach((b) => b.setAttribute("aria-pressed", Math.abs(+b.dataset.d - d) < 0.05));
    draw();
  }
  sD.addEventListener("input", update);
  root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { sD.value = b.dataset.d; update(); }));
  root.querySelectorAll("[data-who]").forEach((b) => b.addEventListener("click", () => { who = b.dataset.who; update(); }));
  if (!reduce) loop(cv, (dt) => { const m = model(P[who], +sD.value); ph += dt * m.hr / 60; pl += dt * m.f / 60; draw(); });
  update();
})();
