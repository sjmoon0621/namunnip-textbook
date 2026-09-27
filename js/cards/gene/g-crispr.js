/* 카드: 유전자 가위는 한 곳을 어떻게 찾아 자를까? — 가이드 RNA 20염기, PAM(NGG), 불일치 */
(() => {
  const root = document.getElementById("card-gene-crispr");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), oP = $(".p-out"), nG = $(".n-g"), nM = $(".n-m"), nP = $(".n-p"), nV = $(".n-v");
  // 가상의 서열(63 nt). 표적 11~30번 + PAM 31~33 (TGG)
  const TARGET = "CTTGACCACAGGTCTCCTGAGGAGAAGTCTTGGGCCCTGTTGAAGCATCCACAGGTAGTCACA";
  const OFF    = "AGTCCTAGCAGGACTCCTGAGCAGAAGTCTAGGGCAATGCCTACGGTAAGCTTACGCATGCTG";
  const GUIDE = TARGET.slice(10, 30); // 11~30번
  let d = "target";
  const { ctx, size } = fit(cv, () => draw());
  function info() {
    const seq = d === "target" ? TARGET : OFF, st = +sP.value - 1, win = seq.slice(st, st + 20), pam = seq.slice(st + 20, st + 23);
    let mm = 0; for (let i = 0; i < 20; i++) if (win[i] !== GUIDE[i]) mm++;
    const pamOk = pam.length === 3 && pam[1] === "G" && pam[2] === "G";
    return { seq, st, win, pam, mm, pamOk, cut: pamOk && mm <= 3 };
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const I = info(), n = I.seq.length, v0 = Math.max(0, Math.min(n - 36, I.st - 8)), v1 = Math.min(n, v0 + 36), step = Math.min(14, (w - 30) / (v1 - v0)), x0 = (w - step * (v1 - v0)) / 2 - v0 * step, yD = h * 0.5, yG = h * 0.3;
    // DNA
    [...I.seq].forEach((b, i) => {
      if (i < v0 || i >= v1) return;
      const inWin = i >= I.st && i < I.st + 20, inPam = i >= I.st + 20 && i < I.st + 23;
      ctx.fillStyle = inPam ? (I.pamOk ? "#e0a02a" : "#e7c7a0") : inWin ? "#e9f0f8" : "#f6f6f2"; ctx.fillRect(x0 + i * step, yD - 9, step - 1, 18);
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(b, x0 + i * step + step / 2 - 0.5, yD + 3.5);
      const cb = { A: "T", T: "A", G: "C", C: "G" }[b]; ctx.fillStyle = C.ink3; ctx.fillText(cb, x0 + i * step + step / 2 - 0.5, yD + 22);
    });
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${d === "target" ? "표적 유전자 DNA" : "다른 염색체의 비슷한 서열"} (${v0 + 1}~${v1}번 염기 부분)`, x0 + v0 * step, yD + 40);
    // 가이드 RNA
    for (let i = 0; i < 20; i++) { const x = x0 + (I.st + i) * step, ok = I.win[i] === GUIDE[i]; ctx.fillStyle = ok ? "#b8e0b0" : "#f2b8a8"; ctx.fillRect(x, yG - 9, step - 1, 18); ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(GUIDE[i].replace("T", "U"), x + step / 2 - 0.5, yG + 3.5); if (!ok) { ctx.fillStyle = C.warn; ctx.fillText("×", x + step / 2, yG + 16); } }
    ctx.fillStyle = C.forest; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("가이드 RNA", x0 + I.st * step, yG - 14);
    if (I.st + 23 <= n) { ctx.fillStyle = I.pamOk ? "#b8860b" : C.ink3; ctx.textAlign = "center"; ctx.fillText(`PAM ${I.pam}`, x0 + (I.st + 21.5) * step, yD - 14); }
    // Cas9과 자르는 위치
    const cx0 = x0 + (I.st - 1) * step, cx1 = x0 + (I.st + 24) * step; ctx.strokeStyle = I.cut ? "rgba(138,79,181,.8)" : "rgba(138,79,181,.3)"; ctx.lineWidth = 2; ctx.setLineDash(I.cut ? [] : [4, 3]); ctx.beginPath(); ctx.roundRect(cx0, yG - 28, cx1 - cx0, yD + 30 - (yG - 28), 14); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#8a4fb5"; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("Cas9", cx1 - 4, yG - 16);
    if (I.cut) { const cut = x0 + (I.st + 17) * step - 0.5; ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cut, yD - 14); ctx.lineTo(cut, yD + 28); ctx.stroke(); ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("✂ 자름", cut, h - 12); }
  }
  function update() {
    root.querySelectorAll("[data-d]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.d === d)));
    const I = info(); oP.textContent = sP.value; nG.textContent = GUIDE.replace(/T/g, "U");
    nM.textContent = `${I.mm}개`; nP.textContent = I.st + 23 > I.seq.length ? "DNA 끝을 넘음" : `${I.pam} → ${I.pamOk ? "있음" : "없음"}`;
    nV.textContent = !I.pamOk ? "PAM이 없어 자르지 않음" : I.mm === 0 ? "완전히 일치 · 자름 (표적)" : I.mm <= 3 ? `불일치 ${I.mm}개지만 잘릴 수 있음 (표적 외 절단 위험)` : "불일치가 많아 결합하지 못함";
    draw();
  }
  root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { d = b.dataset.d; update(); }));
  sP.addEventListener("input", update); update();
})();
