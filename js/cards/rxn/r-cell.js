/* 카드: 두 금속을 고르면 전지의 전압을 미리 알 수 있을까? — 표준 환원 전위 사다리와 전지 그림 */
(() => {
  const root = document.getElementById("card-rxn-cell");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nAn = $(".n-an"), nCa = $(".n-ca"), nE = $(".n-e"), nR = $(".n-r");
  // [표시, 이온, 전자 수, E°]
  const T = { Li: ["Li", "Li⁺", 1, -3.04], Mg: ["Mg", "Mg²⁺", 2, -2.37], Al: ["Al", "Al³⁺", 3, -1.66], Zn: ["Zn", "Zn²⁺", 2, -0.76], Fe: ["Fe", "Fe²⁺", 2, -0.44], Pb: ["Pb", "Pb²⁺", 2, -0.13], H: ["H₂(Pt)", "H⁺", 1, 0], Cu: ["Cu", "Cu²⁺", 2, 0.34], Ag: ["Ag", "Ag⁺", 1, 0.8] };
  let a = "Zn", b = "Cu";
  const lcm = (x, y) => { const g = (p, q) => (q ? g(q, p % q) : p); return x * y / g(x, y); };
  function reaction(an, ca) {
    const [sa, ia, na] = T[an], [sc, ic, nc] = T[ca], L = lcm(na, nc), ka = L / na, kc = L / nc;
    const sp = (k, s) => (k === 1 ? "" : k) + s;
    const aL = an === "H" ? sp(ka, "H₂") : sp(ka, sa), aR = an === "H" ? sp(2 * ka, "H⁺") : sp(ka, ia), cL = ca === "H" ? sp(2 * kc, "H⁺") : sp(kc, ic), cR = ca === "H" ? sp(kc, "H₂") : sp(kc, sc);
    return `${aL} + ${cL} → ${aR} + ${cR}`;
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 사다리
    const lx = 16, lw = w * 0.3, y0 = h - 18, y1 = 16, Y = (e) => y0 - (e + 3.2) / 4.2 * (y0 - y1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(lx + 40, y1); ctx.lineTo(lx + 40, y0); ctx.stroke();
    // 이름표가 겹치지 않도록 아래에서부터 최소 간격 13px로 밀어 올림
    const ents = Object.entries(T).sort((p, q) => p[1][3] - q[1][3]); let prev = 1e9;
    ents.forEach(([k, [s, ion, , e]]) => { const sel = k === a || k === b; let ly = Math.min(Y(e), prev - 13); prev = ly; ctx.fillStyle = sel ? C.ink : C.ink3; ctx.font = `${sel ? "600 " : ""}10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(e.toFixed(2), lx + 36, ly + 3); ctx.textAlign = "left"; ctx.fillText(`${ion}/${s.replace("(Pt)", "")}`, lx + 46, ly + 3); ctx.fillRect(lx + 37, Y(e), 6, 1); });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("↑ 환원되기 쉬움", lx, y1 - 4);
    if (a === b) { ctx.fillStyle = C.warn; ctx.font = `600 12px ${F.sans}`; ctx.fillText("서로 다른 반쪽 전지를 고르세요", w * 0.45, h / 2); return; }
    const [an, ca] = T[a][3] < T[b][3] ? [a, b] : [b, a];
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx + lw - 6, Y(T[an][3])); ctx.lineTo(lx + lw - 6, Y(T[ca][3])); ctx.stroke(); 
    // 전지 그림
    const cx0 = w * 0.38, cw = w - cx0 - 14, bw = cw * 0.34, bh = h * 0.42, by = h * 0.5, bxL = cx0 + 6, bxR = cx0 + cw - bw - 6;
    const beaker = (x, col) => { ctx.fillStyle = col; ctx.fillRect(x, by + bh * 0.25, bw, bh * 0.75); ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x, by + bh); ctx.lineTo(x + bw, by + bh); ctx.lineTo(x + bw, by); ctx.stroke(); };
    beaker(bxL, "rgba(181,83,47,.12)"); beaker(bxR, "rgba(63,111,163,.12)");
    const elec = (x, k) => { ctx.fillStyle = k === "H" ? "#c9cdd2" : "#8d8d92"; ctx.fillRect(x + bw / 2 - 7, by - 30, 14, bh * 0.85); ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(T[k][0], x + bw / 2, by + bh + 14); ctx.font = `10px ${F.sans}`; ctx.fillText(`${T[k][1]} 1 M`, x + bw / 2, by + bh * 0.62 + 20); };
    elec(bxL, an); elec(bxR, ca);
    // 염다리
    ctx.strokeStyle = "#caa47c"; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(bxL + bw - 10, by + bh * 0.5); ctx.lineTo(bxL + bw - 10, by + 6); ctx.lineTo(bxR + 10, by + 6); ctx.lineTo(bxR + 10, by + bh * 0.5); ctx.stroke(); ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("염다리", (bxL + bxR + bw) / 2, by + 24);
    // 도선과 전압계
    const top = 24, xm = (bxL + bxR + bw) / 2; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bxL + bw / 2, by - 30); ctx.lineTo(bxL + bw / 2, top); ctx.lineTo(bxR + bw / 2, top); ctx.lineTo(bxR + bw / 2, by - 30); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(xm, top, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.ink; ctx.font = `600 10px ${F.mono}`; ctx.fillText(`${(T[ca][3] - T[an][3]).toFixed(2)}V`, xm, top + 4);
    ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.sans}`; ctx.fillText("e⁻ →", (bxL + bw / 2 + xm) / 2, top - 6); ctx.fillText("e⁻ →", (xm + bxR + bw / 2) / 2, top - 6);
    ctx.fillStyle = C.warn; ctx.fillText("(−)극 · 산화", bxL + bw / 2, by + bh + 28); ctx.fillStyle = "#3f6fa3"; ctx.fillText("(+)극 · 환원", bxR + bw / 2, by + bh + 28);
  }
  function update() {
    root.querySelectorAll("[data-a]").forEach((q) => q.setAttribute("aria-pressed", String(q.dataset.a === a)));
    root.querySelectorAll("[data-b]").forEach((q) => q.setAttribute("aria-pressed", String(q.dataset.b === b)));
    if (a === b) { nAn.textContent = nCa.textContent = nE.textContent = nR.textContent = "—"; draw(); return; }
    const [an, ca] = T[a][3] < T[b][3] ? [a, b] : [b, a];
    nAn.textContent = `${T[an][0]} (E° ${T[an][3].toFixed(2)} V)`; nCa.textContent = `${T[ca][0]} (E° ${T[ca][3].toFixed(2)} V)`;
    nE.textContent = `${T[ca][3].toFixed(2)} − (${T[an][3].toFixed(2)}) = ${(T[ca][3] - T[an][3]).toFixed(2)} V`; nR.textContent = reaction(an, ca);
    draw();
  }
  root.querySelectorAll("[data-a]").forEach((q) => q.addEventListener("click", () => { a = q.dataset.a; update(); }));
  root.querySelectorAll("[data-b]").forEach((q) => q.addEventListener("click", () => { b = q.dataset.b; update(); }));
  update();
})();
