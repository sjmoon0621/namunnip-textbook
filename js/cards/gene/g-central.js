/* 카드: 핵 속 DNA의 정보는 어떻게 단백질이 될까? — 전사 → 스플라이싱 → 번역 진행 막대 */
(() => {
  const root = document.getElementById("card-gene-central");
  if (!root || !window.NMCodon) return;
  const { C, F, fit } = NM, K = NMCodon;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), nS = $(".n-s"), nW = $(".n-w"), nM = $(".n-m");
  let cell = "eu";
  // 암호 가닥(5′→3′). 소문자 = 인트론
  const CODING_EU = "ATGGCCgtaagtcagAAATTCGGATGA", CODING_PRO = "ATGGCCAAATTCGGATGA";
  const coding = () => cell === "eu" ? CODING_EU : CODING_PRO;
  const templ = (s) => s.toUpperCase().replace(/[ATGC]/g, (b) => ({ A: "T", T: "A", G: "C", C: "G" }[b]));
  function phase(t) { // 반환 [단계 이름, 진행 0~1]
    if (cell === "eu") { if (t < 40) return ["전사", t / 40]; if (t < 55) return ["RNA 가공 (스플라이싱)", (t - 40) / 15]; return ["번역", (t - 55) / 45]; }
    if (t < 50) return ["전사 (번역이 동시에 시작)", t / 50]; return ["번역", (t - 50) / 50];
  }
  const { ctx, size } = fit(cv, () => draw());
  function base(x, y, b, col, intr) { ctx.fillStyle = intr ? "#f3e2c0" : col; ctx.fillRect(x - 7, y - 9, 14, 18); ctx.fillStyle = C.ink; ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(b, x, y + 4); }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value, [ph, p] = phase(t), cs = coding(), n = cs.length, step = Math.min(16, (w - 90) / n), x0 = Math.max(62, (w - step * (n - 1)) / 2);
    const yC = 22, yT = 44, yR = 74;
    // DNA 두 가닥
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("암호 5′", x0 - 10, yC + 3); ctx.fillText("주형 3′", x0 - 10, yT + 3);
    [...cs].forEach((b, i) => { const intr = b === b.toLowerCase(); base(x0 + i * step, yC, b.toUpperCase(), "#dbe6f3", intr); base(x0 + i * step, yT, templ(b), "#cfe0cf", intr); });
    if (cell === "eu") { ctx.fillStyle = "#b8860b"; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "center"; const i0 = cs.indexOf("g"), i1 = cs.lastIndexOf("g") + 2; ctx.fillText("인트론", x0 + (i0 + (cs.match(/[a-z]/g).length - 1) / 2) * step, yC - 12); }
    // 전사된 RNA
    const tr = ph.startsWith("전사") ? Math.floor(p * n) : n;
    const rna = [...cs].map((b) => [b.toUpperCase().replace("T", "U"), b === b.toLowerCase()]);
    if (ph.startsWith("전사")) { const x = x0 + Math.min(tr, n - 1) * step; ctx.fillStyle = "rgba(138,79,181,.25)"; ctx.beginPath(); ctx.ellipse(x, yT + 12, 22, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#8a4fb5"; ctx.font = `9px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("RNA 중합 효소", x, yT + 42); }
    let mr = rna.slice(0, tr);
    const spl = ph.startsWith("RNA 가공") ? p : ph === "번역" ? 1 : 0;
    if (spl > 0.5) mr = mr.filter(([, intr]) => !intr);
    const mx0 = Math.max(62, (w - step * (mr.length - 1)) / 2);
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "right"; if (mr.length) ctx.fillText(spl > 0.5 ? "mRNA 5′" : "RNA 5′", mx0 - 10, yR + 3);
    mr.forEach(([b, intr], i) => base(mx0 + i * step, yR, b, "#f6d7c3", intr && spl < 0.5 && spl > 0 ? true : intr));
    if (spl > 0.5 && cell === "eu") { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(mx0 - 26, yR, 5, 0, Math.PI * 2); ctx.fill(); ctx.font = `9px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("AAAA…", mx0 + mr.length * step, yR + 3); }
    // 번역
    if (ph === "번역" || cell === "pro") {
      const codons = []; const seq = mr.map(([b]) => b).join(""); for (let i = 0; i + 3 <= seq.length; i += 3) codons.push(seq.slice(i, i + 3));
      const done = ph === "번역" ? Math.min(codons.length, Math.floor(p * (codons.length + 0.999))) : Math.max(0, Math.floor(tr / 3) - 3);
      codons.forEach((c, i) => { ctx.strokeStyle = C.rule; ctx.strokeRect(mx0 + i * 3 * step - 8, yR - 11, 3 * step, 22); });
      if (done > 0 || ph === "번역") { const ri = Math.min(done, codons.length - 1), rx = mx0 + ri * 3 * step + step; ctx.fillStyle = "rgba(59,124,42,.2)"; ctx.beginPath(); ctx.ellipse(rx, yR + 4, 3 * step, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.forest; ctx.font = `9px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("리보솜", rx, yR + 36); }
      const chain = codons.slice(0, done).map((c) => K.aa(c)).filter((a) => a && a[1] !== "*");
      chain.forEach((a, i) => { const x = w / 2 - (chain.length - 1) * 22 + i * 44, y = h - 30; ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(a[0], x, y + 3.5); if (i) { ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x - 28, y); ctx.lineTo(x - 16, y); ctx.stroke(); } });
    }
  }
  function update() {
    root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === cell)));
    const t = +sT.value, [ph, p] = phase(t); oT.textContent = `${ph} ${Math.round(p * 100)}%`; nS.textContent = ph;
    nW.textContent = ph.startsWith("전사") ? (cell === "eu" ? "핵 · RNA 중합 효소" : "세포질 · RNA 중합 효소") : ph.startsWith("RNA") ? "핵 · 스플라이세오솜 (인트론 제거), 모자와 꼬리 추가" : "세포질의 리보솜 · tRNA가 아미노산 운반";
    const mseq = coding().replace(/[a-z]/g, "").replace(/T/g, "U"); const aas = []; for (let i = 0; i + 3 <= mseq.length; i += 3) { const a = K.aa(mseq.slice(i, i + 3)); if (a[1] === "*") break; aas.push(a[0]); }
    nM.textContent = ph === "번역" && p > 0.95 ? `폴리펩타이드 ${aas.join("–")} (종결 코돈 UGA에서 끝)` : ph === "번역" ? "폴리펩타이드가 자라는 중" : ph.startsWith("RNA") ? "성숙한 mRNA" : "RNA가 5′→3′ 방향으로 자라는 중";
    draw();
  }
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { cell = b.dataset.c; update(); }));
  sT.addEventListener("input", update); update();
})();
