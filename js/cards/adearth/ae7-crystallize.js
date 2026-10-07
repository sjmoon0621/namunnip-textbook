/* 카드: 같은 마그마에서 왜 서로 다른 암석이 여러 가지 나올까?
   투휘석–회장석 공융계(Bowen 1915)와 조장석–회장석 고용체(Bowen 1913)의 온도–조성 그림.
   끝점 녹는점·공융점은 실험값, 그 사이 곡선은 모식(사장석은 이상 용액 모형, ΔH 회장석 133, 조장석 64.5 kJ/mol). */
(() => {
  const root = document.getElementById("card-adearth-crystallize");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sX = $(".x"), sT = $(".t"), oX = $(".x-out"), oT = $(".t-out");
  const nPh = $(".n-ph"), nL = $(".n-l"), nF = $(".n-f"), modeBox = $(".xt-mode");
  let sys = "dian", mode = "eq";

  /* ---- 투휘석(Di)–회장석(An) 공융계 ---- */
  const TDI = 1391.5, TAN = 1553, TE = 1274, XE = 42;
  const liqDi = (x) => TDI - (TDI - TE) * Math.pow(x / XE, 1.25);
  const liqAn = (x) => TAN - (TAN - TE) * Math.pow((100 - x) / (100 - XE), 1.15);
  const xDi = (T) => XE * Math.pow(clamp((TDI - T) / (TDI - TE), 0, 1), 1 / 1.25);
  const xAn = (T) => 100 - (100 - XE) * Math.pow(clamp((TAN - T) / (TAN - TE), 0, 1), 1 / 1.15);
  const liqDA = (x) => (x <= XE ? liqDi(x) : liqAn(x));

  function stateDA(x0, T) {
    const TL = liqDA(x0), left = x0 <= XE;
    if (T >= TL) return { ph: "액체", xl: x0, fs: 0, liq: 1, prim: 0, eut: 0, left, TL };
    if (T > TE) {
      const xl = left ? xDi(T) : xAn(T);
      const fs = left ? (xl - x0) / xl : (x0 - xl) / (100 - xl);
      return { ph: left ? "액체 + 투휘석" : "액체 + 회장석", xl, fs, liq: 1 - fs, prim: fs, eut: 0, left, TL };
    }
    const liqAtTe = left ? x0 / XE : (100 - x0) / (100 - XE);
    return { ph: T === TE ? "공융점: 액체 + 투휘석 + 회장석" : "투휘석 + 회장석 (고체)", xl: XE, fs: 1, liq: 0, prim: 1 - liqAtTe, eut: liqAtTe, left, TL };
  }

  /* ---- 조장석(Ab)–회장석(An) 고용체, 이상 용액 모형 ---- */
  const R = 8.314, KA = 1553 + 273.15, KB = 1118 + 273.15, HA = 133e3, HB = 64.5e3, TAB = 1118;
  function lens(Tc) {
    const T = clamp(Tc, TAB + 0.01, TAN - 0.01) + 273.15;
    const kA = Math.exp(HA / R * (1 / T - 1 / KA)), kB = Math.exp(HB / R * (1 / T - 1 / KB));
    const xl = (1 - kB) / (kA - kB);
    return { xl: 100 * xl, xs: 100 * kA * xl };
  }
  const solve = (f, x) => { let a = TAB, b = TAN; for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (f(m) < x) a = m; else b = m; } return (a + b) / 2; };
  const TLp = (x) => solve((T) => lens(T).xl, x), TSp = (x) => solve((T) => lens(T).xs, x);

  function statePl(x0, T) {
    const TL = TLp(x0), TS = TSp(x0);
    if (T >= TL) return { ph: "액체", xl: x0, fs: 0, TL, TS, shells: [] };
    if (mode === "eq") {
      if (T <= TS) return { ph: "사장석 (고체)", xl: null, xs: x0, fs: 1, TL, TS, shells: [[x0, 1]] };
      const { xl, xs } = lens(T), fs = (x0 - xl) / (xs - xl);
      return { ph: "액체 + 사장석", xl, xs, fs, TL, TS, shells: [[xs, fs]] };
    }
    /* 분별: 액체는 늘 액상선 위, 결정은 껍질마다 그때의 고상선 조성 */
    let Fm = 1, prev = lens(TL), shells = [];
    const Tend = Math.max(T, TAB + 0.05);
    for (let t = TL - 0.5; t >= Tend; t -= 0.5) {
      const cur = lens(t), dF = Fm * (cur.xl - prev.xl) / (prev.xs - prev.xl);
      shells.push([prev.xs, -dF]); Fm = Math.max(0, Fm + dF); prev = cur;
    }
    if (T <= TAB) { shells.push([0, Fm]); Fm = 0; }
    const xl = Fm > 0 ? prev.xl : null;
    return { ph: Fm > 0 ? "액체 + 사장석 (누대 구조)" : "사장석 (고체, 누대 구조)", xl, fs: 1 - Fm, TL, TS, shells, xsNow: prev.xs };
  }

  const anCol = (x) => {
    const t = clamp(x / 100, 0, 1), a = [248, 240, 214], b = [28, 52, 110];
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  };
  const LIQ = "#e0a02a", DI = "#5d8a4a", AN = "#cfd3da";

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0p = 44, x1p = w - 14, y0p = 22, y1p = Math.round(h * 0.66);
    const X = (x) => x0p + x / 100 * (x1p - x0p), Y = (T) => y1p - (T - 1100) / 500 * (y1p - y0p);
    const x0 = +sX.value, T = +sT.value;

    /* 축 */
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let t = 1100; t <= 1600; t += 100) { const y = Math.round(Y(t)) + .5; ctx.beginPath(); ctx.moveTo(x0p, y); ctx.lineTo(x1p, y); ctx.stroke(); ctx.textAlign = "right"; ctx.fillText(t, x0p - 5, y + 3); }
    for (let x = 0; x <= 100; x += 20) { const xx = Math.round(X(x)) + .5; ctx.beginPath(); ctx.moveTo(xx, y1p); ctx.lineTo(xx, y1p + 4); ctx.stroke(); ctx.textAlign = "center"; ctx.fillText(x, xx, y1p + 15); }
    ctx.textAlign = "left"; ctx.fillText("°C", 6, y0p - 8);
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.textAlign = "left"; ctx.fillText(sys === "dian" ? "투휘석 Di" : "조장석 Ab", x0p, y1p + 30);
    ctx.textAlign = "right"; ctx.fillText("회장석 An", x1p, y1p + 30);
    ctx.textAlign = "center"; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("An 함량 (질량 %)", (x0p + x1p) / 2, y1p + 30);
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0p, y0p); ctx.lineTo(x0p, y1p); ctx.lineTo(x1p, y1p); ctx.lineTo(x1p, y0p); ctx.stroke();

    const line = (f, a, b, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i <= 120; i++) { const x = a + (b - a) * i / 120, y = Y(f(x)); i ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); } ctx.stroke(); ctx.setLineDash([]); };
    const lab = (s, x, y, col, al) => { ctx.font = `11px ${F.sans}`; ctx.fillStyle = col || C.ink2; ctx.textAlign = al || "center"; ctx.fillText(s, x, y); };
    let st;

    if (sys === "dian") {
      st = stateDA(x0, T);
      ctx.fillStyle = "rgba(224,160,42,.08)"; ctx.beginPath(); ctx.moveTo(X(0), Y(1600));
      for (let i = 0; i <= 100; i++) ctx.lineTo(X(i), Y(liqDA(i))); ctx.lineTo(X(100), Y(1600)); ctx.closePath(); ctx.fill();
      line(liqDi, 0, XE, C.ink, 1.6); line(liqAn, XE, 100, C.ink, 1.6);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(0), Y(TE)); ctx.lineTo(X(100), Y(TE)); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(XE), Y(TE), 3.5, 0, 7); ctx.fill();
      lab("액체 (마그마)", X(50), Y(1560));
      lab("액체 + 투휘석", X(16), Y(1295));
      lab("액체 + 회장석", X(76), Y(1330));
      lab("투휘석 + 회장석", X(50), Y(1200));
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("공융점 1274 °C", X(XE) + 6, Y(TE) + 13);
      /* 액체의 경로 */
      if (T < st.TL) {
        const a = x0, b = st.xl;
        line(st.left ? liqDi : liqAn, Math.min(a, b), Math.max(a, b), LIQ, 4);
      }
    } else {
      st = statePl(x0, T);
      const Lx = (Tc) => lens(Tc).xl, Sx = (Tc) => lens(Tc).xs;
      ctx.fillStyle = "rgba(224,160,42,.08)"; ctx.beginPath(); ctx.moveTo(X(0), Y(1600)); ctx.lineTo(X(0), Y(TAB));
      for (let t = TAB; t <= TAN; t += 4) ctx.lineTo(X(Lx(t)), Y(t)); ctx.lineTo(X(100), Y(TAN)); ctx.lineTo(X(100), Y(1600)); ctx.closePath(); ctx.fill();
      const curveT = (f, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (let t = TAB + 0.02, i = 0; t <= TAN; t += 3, i++) { const x = X(f(t)), y = Y(t); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.lineTo(X(100), Y(TAN)); ctx.stroke(); };
      ctx.save(); ctx.beginPath(); ctx.moveTo(X(0), Y(TAB)); ctx.lineTo(X(0), Y(TAB)); ctx.restore();
      curveT(Lx, C.ink, 1.6); curveT(Sx, C.ink, 1.6);
      lab("액체 (마그마)", X(30), Y(1520));
      lab("액상선", X(Lx(1380)) - 8, Y(1380), C.ink3, "right");
      lab("액체 + 사장석", X((Lx(1440) + Sx(1440)) / 2), Y(1440) + 4);
      lab("고상선", X(Sx(1300)) + 8, Y(1300) + 4, C.ink3, "left");
      lab("사장석 (고용체)", X(66), Y(1180));
      if (T < st.TL) {
        const Tlo = Math.max(T, TAB + 0.05);
        ctx.strokeStyle = LIQ; ctx.lineWidth = 4; ctx.beginPath();
        for (let t = st.TL, i = 0; t >= Tlo - 0.01; t -= 2, i++) { const xx = X(Lx(t)), yy = Y(t); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
        if (mode === "eq" && T <= st.TS) { ctx.stroke(); }
        else ctx.stroke();
        if (mode === "eq") {
          ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 4; ctx.beginPath();
          const Tl2 = Math.max(T, st.TS);
          for (let t = st.TL, i = 0; t >= Tl2 - 0.01; t -= 2, i++) { const xx = X(Sx(t)), yy = Y(t); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
          ctx.stroke();
        } else {
          ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath();
          for (let t = st.TL, i = 0; t >= Tlo - 0.01; t -= 2, i++) { const xx = X(Sx(t)), yy = Y(t); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
          ctx.stroke(); ctx.setLineDash([]);
        }
      }
    }

    /* 전체 조성 수직선, 현재 온도, 공존선 */
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(x0), y0p); ctx.lineTo(X(x0), y1p); ctx.stroke(); ctx.setLineDash([]);
    const yT = Y(T);
    ctx.strokeStyle = "rgba(35,35,38,.25)"; ctx.beginPath(); ctx.moveTo(x0p, yT); ctx.lineTo(x1p, yT); ctx.stroke();
    let solidX = null;
    if (sys === "dian" && T < st.TL && T > TE) solidX = st.left ? 0 : 100;
    if (sys === "plag" && T < st.TL && st.xl != null) solidX = mode === "eq" ? st.xs : st.xsNow;
    if (solidX != null && st.xl != null) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(st.xl), yT); ctx.lineTo(X(solidX), yT); ctx.stroke();
      ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(X(solidX), yT, 5, 0, 7); ctx.fill();
    }
    if (st.xl != null && st.fs < 1) { ctx.fillStyle = LIQ; ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X(st.xl), yT, 5.5, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.rect(X(x0) - 3.5, yT - 3.5, 7, 7); ctx.fill();

    /* 범례 */
    const ly = y0p + 10; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    const key = (x, col, s, sq) => { ctx.fillStyle = col; if (sq) ctx.fillRect(x, ly - 7, 7, 7); else { ctx.beginPath(); ctx.arc(x + 3.5, ly - 3.5, 4, 0, 7); ctx.fill(); } ctx.fillStyle = C.ink2; ctx.fillText(s, x + 11, ly); };
    key(x0p + 6, C.ink, "전체 조성", true); key(x0p + 72, LIQ, "액체 조성"); key(x0p + 138, "#3f6fa3", "결정 조성");

    /* 아래 띠: 결정과 액체의 양 */
    const by = y1p + 46, bh = h - by - 6;
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    if (sys === "dian") {
      ctx.fillText("지금 있는 것 (질량 비율)", x0p, by + 10);
      const bx = x0p, bw = x1p - x0p, yb = by + 20, hb = Math.min(28, bh - 50);
      let cx = bx; const seg = (f, col, name, hatch) => {
        if (f <= 0.001) return; const ww = f * bw; ctx.fillStyle = col; ctx.fillRect(cx, yb, ww, hb);
        if (hatch) { ctx.save(); ctx.beginPath(); ctx.rect(cx, yb, ww, hb); ctx.clip(); ctx.strokeStyle = DI; ctx.lineWidth = 2; for (let k = -hb; k < ww; k += 6) { ctx.beginPath(); ctx.moveTo(cx + k, yb + hb); ctx.lineTo(cx + k + hb, yb); ctx.stroke(); } ctx.restore(); }
        ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
        if (ww > 54) ctx.fillText(`${name} ${Math.round(f * 100)}%`, cx + ww / 2, yb + hb + 14);
        cx += ww;
      };
      const pc = st.left ? DI : AN, pn = st.left ? "투휘석 결정" : "회장석 결정";
      seg(st.prim, pc, pn); seg(st.liq, LIQ, "액체"); seg(st.eut, AN, "공융 조직", true);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, yb + .5, bw - 1, hb);
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
      ctx.fillText("공융 조직: 1274 °C에서 투휘석과 회장석이 함께 정출되어 엇갈려 자란 부분", bx, yb + hb + 32);
    } else {
      ctx.fillText(mode === "eq" ? "사장석 결정 단면 (평형: 결정 전체가 액체와 반응)" : "사장석 결정 단면 (분별: 껍질마다 그때의 조성)", x0p, by + 10);
      const cxp = x0p + 40, cyp = by + 20 + (bh - 24) / 2, Rmax = Math.min(36, (bh - 26) / 2);
      ctx.strokeStyle = C.rule; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.arc(cxp, cyp, Rmax, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      /* 껍질을 바깥부터 그린다 */
      const tot = st.shells.reduce((s, [, m]) => s + m, 0);
      let cum = tot;
      for (let i = st.shells.length - 1; i >= 0; i--) {
        const r = Rmax * Math.sqrt(cum); ctx.fillStyle = anCol(st.shells[i][0]); ctx.beginPath(); ctx.arc(cxp, cyp, Math.max(r, 0), 0, 7); ctx.fill();
        cum -= st.shells[i][1];
        if (i > 0 && Math.floor(st.shells[i][0] / 10) !== Math.floor(st.shells[i - 1][0] / 10)) { ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(cxp, cyp, Rmax * Math.sqrt(Math.max(cum, 0)), 0, 7); ctx.stroke(); }
      }
      if (tot > 0.001) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cxp, cyp, Rmax * Math.sqrt(tot), 0, 7); ctx.stroke(); }
      /* 색 눈금 */
      const gx = cxp + Rmax + 30, gw = x1p - gx, gy = cyp - 8;
      for (let i = 0; i < gw; i++) { ctx.fillStyle = anCol(i / gw * 100); ctx.fillRect(gx + i, gy, 1, 12); }
      ctx.strokeStyle = C.ink3; ctx.strokeRect(gx + .5, gy + .5, gw - 1, 11);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("An 0 (Na)", gx, gy + 25); ctx.textAlign = "right"; ctx.fillText("An 100 (Ca)", gx + gw, gy + 25);
      if (st.shells.length) {
        const core = st.shells[0][0], rim = st.shells[st.shells.length - 1][0];
        const mk = (v, s) => { const xx = gx + v / 100 * gw; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(xx, gy - 2); ctx.lineTo(xx - 4, gy - 9); ctx.lineTo(xx + 4, gy - 9); ctx.fill(); ctx.textAlign = "center"; ctx.font = `10px ${F.sans}`; ctx.fillText(s, xx, gy - 12); };
        if (Math.abs(core - rim) < 4) mk(core, "결정"); else { mk(core, "중심"); mk(rim, "가장자리"); }
      }
    }
    return st;
  }

  function update() {
    root.querySelectorAll("[data-sys]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sys === sys)));
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    modeBox.hidden = sys !== "plag";
    oX.textContent = sX.value; oT.textContent = sT.value;
    const x0 = +sX.value, T = +sT.value;
    const st = sys === "dian" ? stateDA(x0, T) : statePl(x0, T);
    nPh.textContent = st.ph;
    nL.textContent = st.xl != null && st.fs < 1 ? st.xl.toFixed(1) : "— (액체 없음)";
    nF.textContent = `${(st.fs * 100).toFixed(st.fs > 0.995 && st.fs < 1 ? 1 : 0)} %`;
    draw();
  }
  root.querySelectorAll("[data-sys]").forEach((b) => b.addEventListener("click", () => { sys = b.dataset.sys; update(); }));
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; update(); }));
  sX.addEventListener("input", update); sT.addEventListener("input", update);
  if (/[?&]demo/.test(location.search)) { sys = "plag"; mode = "fr"; sX.value = 70; sT.value = 1250; }
  update();
})();
