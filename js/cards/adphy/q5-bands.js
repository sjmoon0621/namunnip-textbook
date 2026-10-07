/* 카드: N개의 사각 우물 — 준위 갈라짐, 에너지띠, 띠틈 (유한 차분 + 스투름 이분법) */
(() => {
  const root = document.getElementById("card-adphy-bands");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), oN = $(".n-out"), sB = $(".b"), oB = $(".b-out"), sS = $(".s"), oS = $(".s-out");
  const nW = $(".n-w"), nG = $(".n-g"), nF = $(".n-f");
  const H2M = 0.0380998, A = 0.40, V0 = 8.0, DX = 0.01, PAD = 0.7;
  let eper = 2, R = null;
  function build() {
    const N = +sN.value, b = +sB.value;
    const L = N * A + (N - 1) * b + 2 * PAD, M = Math.round(L / DX) - 1;
    const V = new Float64Array(M), t = H2M / (DX * DX);
    for (let i = 0; i < M; i++) {
      const x = (i + 1) * DX - PAD; let v = V0;
      if (x >= 0) { const c = x % (A + b), j = Math.floor(x / (A + b)); if (j < N && c < A) v = 0; }
      V[i] = v;
    }
    const d = new Float64Array(M); for (let i = 0; i < M; i++) d[i] = 2 * t + V[i];
    /* 스투름 수열: E보다 작은 고유값 개수 */
    const count = (E) => { let q = d[0] - E, c = q < 0 ? 1 : 0; for (let i = 1; i < M; i++) { q = d[i] - E - t * t / (q === 0 ? 1e-12 : q); if (q < 0) c++; } return c; };
    const nb = count(V0), ev = [];
    for (let k = 0; k < nb; k++) { let lo = 0, hi = V0; for (let it = 0; it < 48; it++) { const m = (lo + hi) / 2; if (count(m) > k) hi = m; else lo = m; } ev.push((lo + hi) / 2); }
    R = { N, b, L, M, V, d, t, ev };
  }
  /* 역반복으로 고유 벡터 */
  function vec(E) {
    const { M, d, t } = R, sh = E - 1e-7;
    let x = new Float64Array(M).fill(1);
    for (let it = 0; it < 3; it++) {
      const c = new Float64Array(M), y = new Float64Array(M);
      let den = d[0] - sh; c[0] = -t / den; y[0] = x[0] / den;
      for (let i = 1; i < M; i++) { den = d[i] - sh + t * c[i - 1]; c[i] = -t / den; y[i] = (x[i] + t * y[i - 1]) / den; }
      for (let i = M - 2; i >= 0; i--) y[i] -= c[i] * y[i + 1];
      let n = 0; for (let i = 0; i < M; i++) n = Math.max(n, Math.abs(y[i])); for (let i = 0; i < M; i++) y[i] /= n; x = y;
    }
    return x;
  }
  function groups() {
    /* 단일 우물 준위 기준으로 띠를 나눈다: 앞의 N개가 1번 띠, 다음 N개가 2번 띠 */
    const { ev, N } = R; return [ev.slice(0, N), ev.slice(N, 2 * N)];
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w || !R) return;
    ctx.clearRect(0, 0, w, h);
    const { L, M, V, ev, N } = R, sel = Math.min(+sS.value, ev.length) - 1;
    /* 위: 퍼텐셜과 파동 함수 */
    const x0 = 10, x1 = w - 10, ty0 = 26, ty1 = h * 0.5;
    const X = (i) => x0 + (i + 1) / (M + 1) * (x1 - x0), YE = (E) => ty1 - E / (V0 * 1.08) * (ty1 - ty0);
    ctx.fillStyle = "#e6e8e1"; for (let i = 0; i < M; i++) if (V[i] > 0) ctx.fillRect(X(i) - 0.5, YE(V0), (x1 - x0) / M + 1, ty1 - YE(V0));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = 0; i < M; i++) { const y = YE(V[i]); i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); } ctx.stroke();
    ev.forEach((E, k) => { ctx.strokeStyle = k === sel ? C.forest : "rgba(35,35,38,.18)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, YE(E)); ctx.lineTo(x1, YE(E)); ctx.stroke(); });
    if (ev.length) {
      const v = vec(ev[sel]), base = YE(ev[sel]), amp = Math.min(30, (ty1 - ty0) * 0.2);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.8; ctx.beginPath();
      for (let i = 0; i < M; i++) { const y = base - v[i] * amp; i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); }
      ctx.stroke();
    }
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`우물 ${N}개의 퍼텐셜과 ${sel + 1}번째 상태의 파동 함수`, x0, 14);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`${V0.toFixed(1)} eV`, x1, YE(V0) - 4);
    /* 아래: 준위 도표 (N = 1 … 현재 N) */
    const eLo = Math.max(0, Math.floor((ev[0] || 0) - 0.3)), eHi = Math.min(V0, Math.ceil((ev[ev.length - 1] || V0) + 0.3));
    const by0 = h * 0.6, by1 = h - 22, lx0 = 44, lx1 = w * 0.62, YB = (E) => by1 - (E - eLo) / (eHi - eLo) * (by1 - by0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx0, by0 - 6); ctx.lineTo(lx0, by1); ctx.stroke();
    NM.axes(ctx, { x0: lx0, y0: by0, w: lx1 - lx0, h: by1 - by0, X: () => 0, Y: YB, yt: Array.from({ length: eHi - eLo + 1 }, (_, i) => eLo + i).filter((v) => eHi - eLo <= 5 || v % 2 === 0).map((v) => [v, String(v)]) });
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("에너지 준위 (eV) · 파랑: 전자 2개, 반쪽: 1개", lx0, by0 - 14);
    const ne = eper * N; let filled = 0;
    const g = groups();
    ev.forEach((E, k) => {
      const occ = Math.max(0, Math.min(2, ne - 2 * k)); filled += occ;
      const xa = lx0 + 10, xb = lx1 - 10, xm = (xa + xb) / 2;
      ctx.lineWidth = k === sel ? 2.6 : 1.4;
      ctx.strokeStyle = "rgba(35,35,38,.3)"; ctx.beginPath(); ctx.moveTo(xa, YB(E)); ctx.lineTo(xb, YB(E)); ctx.stroke();
      if (occ) { ctx.strokeStyle = "#3f6fa3"; ctx.beginPath(); ctx.moveTo(xa, YB(E)); ctx.lineTo(occ === 2 ? xb : xm, YB(E)); ctx.stroke(); }
      if (k === sel) { ctx.fillStyle = C.forest; ctx.beginPath(); ctx.moveTo(xa - 8, YB(E) - 4); ctx.lineTo(xa - 2, YB(E)); ctx.lineTo(xa - 8, YB(E) + 4); ctx.fill(); }
    });
    /* 띠 괄호 */
    const bx = w * 0.66;
    g.forEach((band, i) => {
      if (!band.length) return;
      const ya = YB(band[band.length - 1]), yb = YB(band[0]);
      ctx.fillStyle = i ? "rgba(224,160,42,.25)" : "rgba(116,171,102,.3)"; ctx.fillRect(bx, ya - 1, 12, yb - ya + 2);
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText(band.length === N ? `${i + 1}번 띠 (준위 ${N}개)` : `${i + 1}번 띠 (V₀ 아래 ${band.length}개)`, bx + 18, (ya + yb) / 2 + 4);
    });
    if (g[0].length && g[1].length) {
      const ya = YB(g[1][0]), yb = YB(g[0][g[0].length - 1]);
      ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(bx + 6, ya); ctx.lineTo(bx + 6, yb); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.fillText("띠틈", bx + 18, (ya + yb) / 2 + 4);
    }
  }
  function update() {
    root.querySelectorAll("[data-e]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.e === eper)));
    oN.textContent = sN.value; oB.textContent = (+sB.value).toFixed(2);
    build();
    sS.max = Math.max(1, R.ev.length); if (+sS.value > R.ev.length) sS.value = R.ev.length; oS.textContent = sS.value;
    const [b1, b2] = groups();
    nW.textContent = b1.length > 1 ? `${((b1[b1.length - 1] - b1[0]) * 1000).toFixed(0)} meV` : "0 (준위 1개)";
    nG.textContent = b1.length && b2.length ? `${(b2[0] - b1[b1.length - 1]).toFixed(2)} eV` : "—";
    const ne = eper * R.N, top = Math.ceil(ne / 2) - 1, half = ne % 2 === 1;
    /* 맨 위 전자가 있는 준위에서 다음 빈 자리까지 */
    let gapE = null;
    if (half) gapE = 0; else if (top + 1 < R.ev.length) gapE = R.ev[top + 1] - R.ev[top];
    nF.textContent = gapE === null ? "—" : gapE === 0 ? "0 (같은 준위에 빈자리)" : gapE < 0.1 ? `${(gapE * 1000).toFixed(0)} meV` : `${gapE.toFixed(2)} eV`;
    nF.className = gapE === null ? "n-f" : gapE > 0.5 ? "n-f bad" : "n-f good";
    draw();
  }
  root.querySelectorAll("[data-e]").forEach((b) => b.addEventListener("click", () => { eper = +b.dataset.e; update(); }));
  [sN, sB].forEach((el) => el.addEventListener("input", update));
  sS.addEventListener("input", () => { oS.textContent = sS.value; draw(); });
  update();
})();
