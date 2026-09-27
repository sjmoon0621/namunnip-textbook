/* 산·염기 평형 계산 공통 도구 (화학 반응의 세계). window.NMAcid */
window.NMAcid = (() => {
  const Kw = 1e-14;
  // 전하 균형을 [H⁺]에 대해 풀기 (로그 이분법). parts: [[C, Ka 또는 null(강산), 산의 전하 기준]] 형태 대신 함수 f(h) = 양전하 − 음전하
  function solveH(balance) { let lo = -15, hi = 1; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (balance(10 ** m) > 0) hi = m; else lo = m; } return 10 ** ((lo + hi) / 2); }
  // 일양성자 약산 HA (C, Ka) + 짝염기 A⁻ (Cb, Na⁺로 넣음) + 강산 Ca_s + 강염기 Cb_s
  function pH({ Ca = 0, Ka = null, Cb = 0, strongA = 0, strongB = 0 }) {
    const f = (h) => { const oh = Kw / h; const Atot = Ca + Cb; const aMinus = Ka === null ? Atot : Atot * Ka / (Ka + h); return h + Cb + strongB - oh - aMinus - strongA; };
    return -Math.log10(solveH(f));
  }
  // 약염기 B (C, Kb): BH⁺ 생성
  function pHbase({ C, Kb, Cacid = 0 }) { // Cacid: BH⁺Cl⁻로 넣은 짝산 농도
    const Ka = Kw / Kb, f = (h) => { const oh = Kw / h, Btot = C + Cacid, bh = Btot * h / (h + Ka); return h + bh - oh - Cacid; };
    return -Math.log10(solveH(f));
  }
  return { Kw, solveH, pH, pHbase };
})();
