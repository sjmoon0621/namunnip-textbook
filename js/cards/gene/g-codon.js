/* 카드: 염기 하나가 바뀌면 단백질은 얼마나 달라질까? — 코돈 해독, 치환·삽입·결실 */
(() => {
  const root = document.getElementById("card-gene-codon");
  if (!root || !window.NMCodon) return;
  const { C, F, fit } = NM, K = NMCodon;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), inp = $(".seq"), sP = $(".p"), oP = $(".p-out"), nO = $(".n-o"), nM = $(".n-m"), nK = $(".n-k");
  const ORIG = "AUGGUGCACCUGACUCCUGAGGAGAAGUCUGCCGUUACUGCC";
  let seq = ORIG, last = "";
  const clean = (s) => s.toUpperCase().replace(/T/g, "U").replace(/[^UCAG]/g, "");
  function translate(s) { const st = s.indexOf("AUG"); if (st < 0) return { st, aas: [], stop: false }; const aas = []; let stop = false; for (let i = st; i + 3 <= s.length; i += 3) { const a = K.aa(s.slice(i, i + 3)); if (a[1] === "*") { stop = true; break; } aas.push(a); } return { st, aas, stop }; }
  const { ctx, size } = fit(cv, () => draw());
  function row(s, y, label, ref) {
    const t = translate(s), step = Math.min(13, (size.w - 70) / Math.max(s.length, ORIG.length)), x0 = 60, pos = +sP.value - 1;
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(label, x0 - 8, y + 4);
    [...s].forEach((b, i) => { const inCod = t.st >= 0 && i >= t.st && Math.floor((i - t.st) / 3) % 2 === 0; ctx.fillStyle = inCod ? "#eef3fa" : "#fbf6ee"; ctx.fillRect(x0 + i * step, y - 9, step - 1, 18); if (label === "바뀐" && i === pos && last) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.strokeRect(x0 + i * step, y - 9, step - 1, 18); } ctx.fillStyle = C.ink; ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(b, x0 + i * step + step / 2 - 0.5, y + 4); });
    t.aas.forEach((a, k) => { const x = x0 + (t.st + k * 3 + 1.5) * step, diff = ref && (!ref.aas[k] || ref.aas[k][1] !== a[1]); ctx.fillStyle = diff ? C.warn : "#3f6fa3"; ctx.font = `600 9.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(a[0], x, y + 22); });
    if (t.stop) { const x = x0 + (t.st + t.aas.length * 3 + 1.5) * step; ctx.fillStyle = C.ink; ctx.font = `600 9.5px ${F.sans}`; ctx.fillText("종결", x, y + 22); }
    return t;
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const ref = row(ORIG, 18, "원래"); row(seq, 62, "바뀐", ref);
    // 유전 부호 표: 행 = 첫째 염기, 열 = 둘째·셋째
    const tx0 = 30, ty0 = 104, cw = Math.min(24, (w - tx0 - 10) / 16), chh = Math.min(22, (h - ty0 - 10) / 4), pos = +sP.value - 1, t = translate(seq);
    const cur = t.st >= 0 && pos >= t.st ? seq.slice(t.st + Math.floor((pos - t.st) / 3) * 3, t.st + Math.floor((pos - t.st) / 3) * 3 + 3) : "";
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`유전 부호 표 (행: 첫째 염기, 열: 둘째·셋째) · 강조: 바꿀 위치의 코돈 ${cur}`, tx0 - 20, ty0 - 6);
    for (let a = 0; a < 4; a++) { ctx.fillStyle = C.ink; ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(K.B[a], tx0 - 12, ty0 + a * chh + chh / 2 + 4);
      for (let j = 0; j < 16; j++) { const c = K.B[a] + K.B[j >> 2] + K.B[j & 3], x = tx0 + j * cw, y = ty0 + a * chh, aa = K.aa(c), on = c === cur;
        ctx.fillStyle = on ? C.warn : aa[1] === "*" ? "#e9e9e6" : aa[1] === "M" ? "#dfeedd" : (j >> 2) % 2 ? "#f4f6fa" : "#fff"; ctx.fillRect(x, y, cw - 1, chh - 1);
        ctx.fillStyle = on ? "#fff" : C.ink; ctx.font = `${on ? "600 " : ""}9.5px ${F.mono}`; ctx.fillText(aa[1] === "*" ? "■" : aa[1], x + cw / 2, y + chh / 2 + 3.5); } }
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("한 글자 = 아미노산 약어, ■ = 종결, 초록 = 시작(AUG)", tx0 - 20, h - 2);
  }
  function kind() {
    const a = translate(ORIG), b = translate(seq);
    if (seq === ORIG) return "없음";
    if ((seq.length - ORIG.length) % 3 !== 0) return "틀 이동 — 바뀐 곳 뒤의 아미노산이 대부분 달라짐";
    if (b.aas.length < a.aas.length && b.stop) return "난센스 — 종결 코돈이 생겨 단백질이 짧아짐";
    const same = a.aas.length === b.aas.length && a.aas.every((x, i) => x[1] === b.aas[i][1]);
    if (same) return "침묵 — 코돈은 바뀌었지만 아미노산은 그대로";
    const d = a.aas.filter((x, i) => b.aas[i] && x[1] !== b.aas[i][1]).length; return seq.length === ORIG.length ? `미스센스 — 아미노산 ${d}개가 바뀜` : `틀은 유지, 아미노산 ${Math.abs(seq.length - ORIG.length) / 3}개 증감`;
  }
  function update() {
    sP.max = Math.max(1, seq.length); oP.textContent = sP.value; if (document.activeElement !== inp) inp.value = seq;
    const f = (t) => t.aas.map((a) => a[0]).join("–") + (t.stop ? " (종결)" : " (종결 코돈 없음)");
    nO.textContent = f(translate(ORIG)); nM.textContent = f(translate(seq)); nK.textContent = kind(); draw();
  }
  const at = () => +sP.value - 1;
  $(".mut-s").addEventListener("click", () => { const i = at(), b = seq[i], nb = { A: "U", U: "C", C: "G", G: "A" }[b]; seq = seq.slice(0, i) + nb + seq.slice(i + 1); last = "s"; update(); });
  $(".mut-i").addEventListener("click", () => { const i = at(); seq = seq.slice(0, i) + "A" + seq.slice(i); last = "i"; update(); });
  $(".mut-d").addEventListener("click", () => { const i = at(); seq = seq.slice(0, i) + seq.slice(i + 1); last = "d"; update(); });
  $(".mut-r").addEventListener("click", () => { seq = ORIG; last = ""; update(); });
  inp.addEventListener("input", () => { seq = clean(inp.value) || ORIG; last = "e"; update(); });
  sP.addEventListener("input", update); update();
})();
