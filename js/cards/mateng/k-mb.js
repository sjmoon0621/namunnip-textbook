/* 공용 도구(물질과 에너지 카드용): 맥스웰–볼츠만 에너지 분포와 활성화 에너지를 넘는 분자의 비율 */
window.NMChem = window.NMChem || (() => {
  const R = 8.314e-3;   // kJ/(mol·K)
  // erfc 근사 (Abramowitz–Stegun 7.1.26, 오차 < 1.5e-7)
  function erfc(x) { const t = 1 / (1 + 0.3275911 * x); return t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x); }
  const pdf = (E, T) => { const kt = R * T; return 2 * Math.sqrt(E / Math.PI) * kt ** -1.5 * Math.exp(-E / kt); };
  const above = (Ea, T) => { const x = Ea / (R * T); return erfc(Math.sqrt(x)) + 2 * Math.sqrt(x / Math.PI) * Math.exp(-x); };
  return { R, pdf, above };
})();
