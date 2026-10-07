/* 카드: 1차원 무한·유한 퍼텐셜 상자 — 파동 함수와 에너지 준위 (전자) */
(() => {
  const root = document.getElementById("card-adphy-well");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sL = $(".l"), oL = $(".l-out"), sV = $(".v"), oV = $(".v-out"), cInf = $(".inf"), cProb = $(".prob");
  const nEi = $(".n-ei"), nEf = $(".n-ef"), nOut = $(".n-out"), nNb = $(".n-nb");
  const H2M = 0.0380998; /* ħ²/2m (eV·nm²) */
  let nSel = 1;
  const eInf = (n, L) => H2M * (n * Math.PI / L) ** 2;
  /* 유한 상자: z = kL/2, z0 = (L/2)√(V0/H2M). n번째 상태(1부터)의 z를 이분법으로 */
  function zFin(n, L, V0) {
    const z0 = L / 2 * Math.sqrt(V0 / H2M);
    let a = (n - 1) * Math.PI / 2 + 1e-9, b = Math.min(n * Math.PI / 2, z0) - 1e-9;
    if (a >= b) return null;
    const f = (z) => { const r = Math.sqrt(Math.max(0, z0 * z0 - z * z)); return n % 2 ? z * Math.tan(z) - r : -z / Math.tan(z) - r; };
    let fa = f(a);
    for (let i = 0; i < 80; i++) { const m = (a + b) / 2, fm = f(m); if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m; }
    return { z: (a + b) / 2, z0 };
  }
  const nBound = (L, V0) => Math.ceil(2 * (L / 2 * Math.sqrt(V0 / H2M)) / Math.PI);
  /* 파동 함수 (정규화 안 함, 안쪽 진폭 1) */
  function psiFn(n, L, V0, inf) {
    if (inf) return (x) => Math.abs(x) >= L / 2 ? 0 : Math.sin(n * Math.PI * (x + L / 2) / L);
    const s = zFin(n, L, V0); if (!s) return null;
    const k = 2 * s.z / L, kap = 2 * Math.sqrt(s.z0 * s.z0 - s.z * s.z) / L, even = n % 2 === 1;
    const inside = (x) => even ? Math.cos(k * x) : Math.sin(k * x);
    const edge = inside(L / 2);
    return (x) => Math.abs(x) <= L / 2 ? inside(x) : Math.sign(x) ** (even ? 0 : 1) * edge * Math.exp(-kap * (Math.abs(x) - L / 2));
  }
  function stats() {
    const L = +sL.value, V0 = +sV.value, inf = cInf.checked;
    const ei = eInf(nSel, L);
    let ef = null, pout = 0;
    if (inf) { ef = ei; }
    else {
      const s = zFin(nSel, L, V0);
      if (s) {
        ef = H2M * (2 * s.z / L) ** 2;
        const f = psiFn(nSel, L, V0, false); let tin = 0, tout = 0; const X = 6 * L, N = 6000;
        for (let i = 0; i < N; i++) { const x = -X + 2 * X * (i + 0.5) / N, p = f(x) ** 2; if (Math.abs(x) > L / 2) tout += p; else tin += p; }
        pout = tout / (tin + tout);
      }
    }
    return { L, V0, inf, ei, ef, pout };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const { L, V0, inf } = stats();
    ctx.clearRect(0, 0, w, h);
    const px0 = 12, px1 = w * 0.66, y0 = 30, y1 = h - 34;
    const Emax = inf ? eInf(5, L) * 1.12 : V0 * 1.3;
    const Y = (E) => y1 - E / Emax * (y1 - y0);
    const XR = 1.25 * L, X = (x) => px0 + (x + XR) / (2 * XR) * (px1 - px0);
    /* 퍼텐셜 */
    ctx.fillStyle = "#e6e8e1"; const wallTop = inf ? y0 - 10 : Y(V0);
    ctx.fillRect(X(-XR), wallTop, X(-L / 2) - X(-XR), y1 - wallTop); ctx.fillRect(X(L / 2), wallTop, X(XR) - X(L / 2), y1 - wallTop);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(X(-XR), wallTop); ctx.lineTo(X(-L / 2), wallTop); ctx.lineTo(X(-L / 2), y1); ctx.lineTo(X(L / 2), y1); ctx.lineTo(X(L / 2), wallTop); ctx.lineTo(X(XR), wallTop); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(inf ? "V = ∞" : `V₀ = ${V0.toFixed(1)} eV`, X(-XR) + 4, inf ? y0 + 4 : wallTop - 6);
    /* 상자 폭 표시 */
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(-L / 2), y1 + 12); ctx.lineTo(X(L / 2), y1 + 12); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillStyle = C.ink2; ctx.fillText(`L = ${L.toFixed(2)} nm`, (X(-L / 2) + X(L / 2)) / 2, y1 + 26);
    /* 준위들 (얇은 선) */
    for (let n = 1; n <= 8; n++) {
      let E; if (inf) E = eInf(n, L); else { const s = zFin(n, L, V0); if (!s) break; E = H2M * (2 * s.z / L) ** 2; }
      if (E > Emax) break;
      ctx.strokeStyle = n === nSel ? C.forest : "rgba(35,35,38,.25)"; ctx.lineWidth = 1; ctx.setLineDash(n === nSel ? [] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(X(-L / 2 - (inf ? 0 : 0.35 * L)), Y(E)); ctx.lineTo(X(L / 2 + (inf ? 0 : 0.35 * L)), Y(E)); ctx.stroke(); ctx.setLineDash([]);
    }
    /* 선택한 상태의 파동 함수 */
    const f = psiFn(nSel, L, V0, inf);
    if (f) {
      const E = inf ? eInf(nSel, L) : H2M * (2 * zFin(nSel, L, V0).z / L) ** 2, base = Y(E);
      const amp = Math.min(46, (y1 - y0) * 0.14), prob = cProb.checked;
      ctx.strokeStyle = prob ? "#3f6fa3" : C.forest; ctx.fillStyle = prob ? "rgba(63,111,163,.2)" : "rgba(116,171,102,.18)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(-XR), base);
      for (let i = 0; i <= 500; i++) { const x = -XR + 2 * XR * i / 500, v = prob ? f(x) ** 2 : f(x); ctx.lineTo(X(x), base - v * amp); }
      ctx.lineTo(X(XR), base); ctx.closePath(); ctx.fill();
      ctx.beginPath(); for (let i = 0; i <= 500; i++) { const x = -XR + 2 * XR * i / 500, v = prob ? f(x) ** 2 : f(x); i ? ctx.lineTo(X(x), base - v * amp) : ctx.moveTo(X(x), base - v * amp); } ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(prob ? `|ψ${nSel}|²` : `ψ${nSel}`, X(L / 2) + 6, base - 4);
    } else {
      ctx.fillStyle = C.warn; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`n = ${nSel} 상태는 갇히지 않음 (E > V₀)`, (px0 + px1) / 2, y0 + 30);
    }
    /* 오른쪽: 준위 사다리 */
    const lx0 = w * 0.71, lx1 = w - 8, mid = (lx0 + lx1) / 2;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx0, y0 - 6); ctx.lineTo(lx0, y1); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("무한", (lx0 + mid) / 2, y1 + 16); ctx.fillText("이 상자", (mid + lx1) / 2, y1 + 16);
    ctx.fillText("에너지 준위", mid, 14);
    if (!inf) { ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(lx0, Y(V0)); ctx.lineTo(lx1, Y(V0)); ctx.stroke(); ctx.setLineDash([]); }
    ctx.font = `9.5px ${F.mono}`;
    for (let n = 1; n <= 8; n++) {
      const Ei = eInf(n, L);
      if (Ei <= Emax) { ctx.strokeStyle = n === nSel ? C.forest : C.ink; ctx.lineWidth = n === nSel ? 2.5 : 1.2; ctx.beginPath(); ctx.moveTo(lx0 + 6, Y(Ei)); ctx.lineTo(mid - 6, Y(Ei)); ctx.stroke(); }
      let Ef = null; if (inf) Ef = Ei; else { const s = zFin(n, L, V0); if (s) Ef = H2M * (2 * s.z / L) ** 2; }
      if (Ef !== null && Ef <= Emax) { ctx.strokeStyle = n === nSel ? C.forest : "#3f6fa3"; ctx.lineWidth = n === nSel ? 2.5 : 1.2; ctx.beginPath(); ctx.moveTo(mid + 6, Y(Ef)); ctx.lineTo(lx1 - 6, Y(Ef)); ctx.stroke(); }
      if (Ef !== null && Ef <= Emax && Ei <= Emax) { ctx.strokeStyle = "rgba(35,35,38,.2)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mid - 6, Y(Ei)); ctx.lineTo(mid + 6, Y(Ef)); ctx.stroke(); }
    }
  }
  const fmtE = (E) => E >= 100 ? `${E.toFixed(0)} eV` : E >= 10 ? `${E.toFixed(1)} eV` : `${E.toFixed(3)} eV`;
  function update() {
    root.querySelectorAll("[data-n]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.n === nSel)));
    oL.textContent = (+sL.value).toFixed(2); oV.textContent = (+sV.value).toFixed(1);
    sV.disabled = cInf.checked;
    const st = stats();
    nEi.textContent = fmtE(st.ei);
    nEf.textContent = st.ef === null ? "갇히지 않음" : fmtE(st.ef);
    nOut.textContent = st.inf ? "0" : st.ef === null ? "—" : `${(st.pout * 100).toFixed(1)} %`;
    nNb.textContent = st.inf ? "무한히 많음" : `${nBound(st.L, st.V0)}개`;
    draw();
  }
  root.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => { nSel = +b.dataset.n; update(); }));
  [sL, sV, cInf, cProb].forEach((el) => el.addEventListener("input", update));
  update();
})();
