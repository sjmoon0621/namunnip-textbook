/* 유전 부호 표 (생물의 유전). window.NMCodon.aa(codon) → [세 글자, 한 글자, 이름] */
window.NMCodon = (() => {
  const B = "UCAG", AA = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
  const N = { F: ["Phe", "페닐알라닌"], L: ["Leu", "류신"], S: ["Ser", "세린"], Y: ["Tyr", "타이로신"], "*": ["종결", "종결 코돈"], C: ["Cys", "시스테인"], W: ["Trp", "트립토판"], P: ["Pro", "프롤린"], H: ["His", "히스티딘"], Q: ["Gln", "글루타민"], R: ["Arg", "아르지닌"], I: ["Ile", "아이소류신"], M: ["Met", "메싸이오닌(시작)"], T: ["Thr", "트레오닌"], N: ["Asn", "아스파라진"], K: ["Lys", "라이신"], V: ["Val", "발린"], A: ["Ala", "알라닌"], D: ["Asp", "아스파트산"], E: ["Glu", "글루탐산"], G: ["Gly", "글리신"] };
  function aa(c) { c = c.toUpperCase().replace(/T/g, "U"); if (c.length !== 3 || /[^UCAG]/.test(c)) return null; const i = B.indexOf(c[0]) * 16 + B.indexOf(c[1]) * 4 + B.indexOf(c[2]), k = AA[i]; return [N[k][0], k, N[k][1]]; }
  const comp = (s) => s.replace(/[ATGCU]/g, (b) => ({ A: "U", T: "A", G: "C", C: "G", U: "A" }[b]));
  return { aa, comp, B, AA };
})();
