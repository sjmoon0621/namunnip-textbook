/* 카드: 46억 년을 하루로 줄이면? — 24시간 시계와 확대되는 연대표 */
(() => {
  const root = document.getElementById("card-is2-deep-time");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), zS = $(".zoom"), zO = $(".zoom-out");
  const nAge = $(".age"), nClock = $(".clock"), nPct = $(".pct");

  const T0 = 4600; // 백만 년 (지구 나이 약 46억 년)
  // 경계 연대: 국제층서위원회(ICS) 연대표 — 백만 년 전
  const ERAS = [
    [4600, 538.8, "선캄브리아 시대", "#c9c4b3"],
    [538.8, 251.9, "고생대", "#9dbfd3"],
    [251.9, 66.0, "중생대", "#b3d5a1"],
    [66.0, 0, "신생대", "#ebc987"],
  ];
  const EV = [
    { id: "earth", age: 4600, name: "지구 탄생" },
    { id: "zircon", age: 4400, name: "가장 오래된 광물 알갱이" },
    { id: "life", age: 3500, name: "생명의 흔적(스트로마톨라이트)" },
    { id: "o2", age: 2400, name: "대기 중 산소 증가" },
    { id: "edi", age: 575, name: "에디아카라 생물군" },
    { id: "camb", age: 538.8, name: "캄브리아기 시작" },
    { id: "plant", age: 470, name: "육상 식물" },
    { id: "pt", age: 251.9, name: "페름기 말 대멸종" },
    { id: "dino", age: 233, name: "최초의 공룡" },
    { id: "kpg", age: 66.0, name: "백악기 말 대멸종" },
    { id: "homo", age: 2.8, name: "사람 속(Homo)" },
    { id: "sap", age: 0.3, name: "현생 인류" },
    { id: "farm", age: 0.011, name: "농경 시작" },
  ];
  let sel = EV.find((e) => e.id === "camb");

  const LMAX = Math.log10(T0), LMIN = -2; // 창의 폭: 46억 년 ~ 1만 년
  const W = () => 10 ** (LMAX - (+zS.value) * (LMAX - LMIN));
  const setW = (w) => { zS.value = clamp((LMAX - Math.log10(w)) / (LMAX - LMIN), 0, 1); };

  const fmtAge = (ma) => {
    const y = ma * 1e6;
    if (y >= 1e8) { const v = y / 1e8; return `${v >= 10 ? +v.toFixed(1) : +v.toFixed(2)}억 년`; }
    if (y >= 1e4) { const v = y / 1e4; return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}만 년`; }
    return `${Math.round(y).toLocaleString()}년`;
  };
  const secOf = (ma) => 86400 * (1 - ma / T0); // 자정(0시)에서 잰 초
  const fmtClock = (s) => {
    const r = Math.round(s), h = Math.floor(r / 3600), m = Math.floor(r % 3600 / 60), ss = r % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };
  const fmtDur = (s) => {
    if (s >= 3600) { const h = Math.floor(s / 3600), m = Math.round(s % 3600 / 60); return m ? `${h}시간 ${m}분` : `${h}시간`; }
    if (s >= 60) { const m = Math.floor(s / 60), r = Math.round(s % 60); return r ? `${m}분 ${r}초` : `${m}분`; }
    return s >= 1 ? `${s.toFixed(1)}초` : `${s.toFixed(2)}초`;
  };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 420;
    // ── 위: 24시간 시계
    const clockH = h * 0.56;
    const R = Math.min((clockH / 2 - 26) / 1.1, w / 2 - 70);
    const cx = narrow ? w / 2 : w * 0.36, cy = clockH / 2 + 6;
    const ang = (f) => -Math.PI / 2 + f * Math.PI * 2;
    const fOf = (ma) => 1 - ma / T0;
    // 시대 고리
    ctx.lineWidth = Math.max(10, R * 0.16);
    for (const [s, e, , col] of ERAS) {
      ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(cx, cy, R, ang(fOf(s)), ang(fOf(e)) + 1e-4); ctx.stroke();
    }
    // 시각 눈금
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    for (let k = 0; k < 24; k++) {
      const a = ang(k / 24), r0 = R + ctx.lineWidth + R * 0.09, big = k % 6 === 0;
      const r1 = R + R * 0.09 + (big ? 7 : 3);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R + R * 0.09), cy + Math.sin(a) * (R + R * 0.09));
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke();
      if (big) { ctx.textAlign = "center"; ctx.fillText(`${k}시`, cx + Math.cos(a) * (r1 + 11), cy + Math.sin(a) * (r1 + 11) + 4); }
      void r0;
    }
    // 확대 창이 시계에서 차지하는 부분
    const wv = W();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, R - R * 0.14, ang(fOf(wv)), ang(1)); ctx.stroke();
    // 사건 점
    for (const e of EV) {
      const a = ang(fOf(e.age));
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, e === sel ? 4.5 : 2.2, 0, Math.PI * 2);
      ctx.fillStyle = e === sel ? C.warn : C.ink2; ctx.fill();
    }
    // 바늘
    const a = ang(fOf(sel.age));
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (R - 6), cy + Math.sin(a) * (R - 6)); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
    // 시계 옆 범례
    if (!narrow) {
      let ly = cy - 34;
      ctx.font = `12px ${F.sans}`; ctx.textAlign = "left";
      const lx = cx + R + 44;
      for (const [s, e, name, col] of ERAS) {
        ctx.fillStyle = col; ctx.fillRect(lx, ly - 9, 12, 12);
        ctx.fillStyle = C.ink2; ctx.fillText(name, lx + 18, ly + 1);
        ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
        ctx.fillText(`${fmtClock(secOf(s)).slice(0, 5)}–${e ? fmtClock(secOf(e)).slice(0, 5) : "24:00"}`, lx + 18, ly + 15);
        ctx.font = `12px ${F.sans}`;
        ly += 34;
      }
      ctx.fillStyle = C.ink; ctx.fillRect(lx, ly - 6, 12, 3);
      ctx.fillStyle = C.ink2; ctx.fillText("아래 연대표 범위", lx + 18, ly + 1);
    }

    // ── 아래: 확대 연대표 (지금으로부터 W 전까지, 선형 눈금)
    const x0 = 14, x1 = w - 14, ty = clockH + 34, bandH = 14;
    const X = (ma) => x0 + (1 - ma / wv) * (x1 - x0);
    ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`지금으로부터 ${fmtAge(wv)} 전까지`, x0, ty - 10);
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText(`하루 시계로 ${fmtDur(86400 * wv / T0)}`, x1, ty - 10);
    for (const [s, e, name, col] of ERAS) {
      if (e >= wv) continue;
      const xa = X(Math.min(s, wv)), xb = X(e);
      ctx.fillStyle = col; ctx.fillRect(xa, ty, xb - xa, bandH);
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
      if (xb - xa > ctx.measureText(name).width + 8) ctx.fillText(name, (xa + xb) / 2, ty + 11);
    }
    // 눈금
    const step = (() => { const s = wv / 4, p = 10 ** Math.floor(Math.log10(s)); return [1, 2, 5, 10].map((k) => k * p).find((k) => k >= s); })();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    const axY = h - 14;
    for (let v = 0; v <= wv * 1.0001; v += step) {
      const x = Math.round(X(v)) + .5;
      ctx.beginPath(); ctx.moveTo(x, ty + bandH); ctx.lineTo(x, axY - 10); ctx.stroke();
      const lab = v === 0 ? "지금" : fmtAge(v).replace(" 년", "");
      ctx.textAlign = x > x1 - 20 ? "right" : x < x0 + 20 ? "left" : "center";
      ctx.fillText(lab, x, axY);
    }
    // 사건: 겹치지 않게 줄을 나눠 이름표를 단다
    ctx.font = `700 11px ${F.sans}`;
    const vis = EV.filter((e) => e.age <= wv * 1.0001).map((e) => ({ e, x: X(e.age), tw: ctx.measureText(e.name).width }));
    vis.sort((p, q) => p.x - q.x);
    const rows = [], rowH = 15, top = ty + bandH + 14, maxRows = Math.max(1, Math.floor((axY - 16 - top) / rowH));
    for (const v of vis) {
      let lx = clamp(v.x - 3, x0, x1 - v.tw);
      let r = rows.findIndex((end) => end < lx - 6);
      if (r < 0) { r = rows.length; rows.push(-1e9); }
      if (r >= maxRows) { v.row = -1; continue; }
      rows[r] = lx + v.tw; v.row = r; v.lx = lx;
    }
    for (const v of vis) {
      const on = v.e === sel, y = top + v.row * rowH;
      ctx.strokeStyle = on ? C.warn : C.ink3; ctx.lineWidth = on ? 1.6 : 1;
      ctx.beginPath(); ctx.moveTo(v.x + .5, ty + bandH); ctx.lineTo(v.x + .5, v.row < 0 ? ty + bandH + 8 : y - 9); ctx.stroke();
    }
    for (const v of vis) {
      if (v.row < 0) continue;
      const on = v.e === sel, y = top + v.row * rowH;
      ctx.font = `${on ? 700 : 400} 11px ${F.sans}`;
      ctx.fillStyle = C.card; ctx.fillRect(v.lx - 2, y - 10, ctx.measureText(v.e.name).width + 4, 13);
      ctx.fillStyle = on ? C.warn : C.ink2; ctx.textAlign = "left";
      ctx.fillText(v.e.name, v.lx, y);
    }
  }

  function update() {
    zO.textContent = fmtAge(W());
    nAge.textContent = fmtAge(sel.age) + " 전";
    const s = secOf(sel.age), left = 86400 - s;
    nClock.textContent = left < 60 ? `자정 ${left < 1 ? left.toFixed(2) : left.toFixed(1)}초 전` : fmtClock(s);
    const p = 100 * (1 - sel.age / T0);
    nPct.textContent = p < 99.9 ? `${p.toFixed(1)}%` : `${p.toFixed(4)}%`;
    root.querySelectorAll("[data-ev]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ev === sel.id)));
    draw();
  }
  root.querySelectorAll("[data-ev]").forEach((b) => b.addEventListener("click", () => {
    sel = EV.find((e) => e.id === b.dataset.ev);
    setW(Math.min(T0, sel.age * 1.6));
    update();
  }));
  zS.addEventListener("input", update);
  setW(sel.age * 1.6);
  update();
})();
