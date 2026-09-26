/* 카드: 염기 하나가 바뀌면 무슨 일이 생길까? — 치환·삽입·결실과 단백질 (사람 β-글로빈 유전자 앞부분 41개 코돈) */
(() => {
  const root = document.getElementById("card-is1-mutation");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const seqEl = $(".seq"), modeChips = [...root.querySelectorAll("[data-mode]")], preChips = [...root.querySelectorAll("[data-pre]")];
  const nB = $(".mu-b"), nA = $(".mu-a"), nL = $(".mu-l"), msg = $(".mu-msg");

  // 코딩 가닥 기준, 인트론을 뺀 순서 (mRNA와 같은 순서, U 대신 T)
  const WT = "ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAGAGG";
  const B4 = "TCAG", AA = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
  const tr = (c) => AA[B4.indexOf(c[0]) * 16 + B4.indexOf(c[1]) * 4 + B4.indexOf(c[2])];
  const ABBR = { A: "Ala", R: "Arg", N: "Asn", D: "Asp", C: "Cys", Q: "Gln", E: "Glu", G: "Gly", H: "His", I: "Ile", L: "Leu", K: "Lys", M: "Met", F: "Phe", P: "Pro", S: "Ser", T: "Thr", W: "Trp", Y: "Tyr", V: "Val", "*": "멈춤" };
  const KIND = (a) => "AVLIMFWPG".includes(a) ? "np" : "STCYNQ".includes(a) ? "po" : "DE".includes(a) ? "neg" : "KRH".includes(a) ? "pos" : "stop";
  const translate = (s) => { const o = []; for (let i = 0; i + 3 <= s.length; i += 3) { const a = tr(s.slice(i, i + 3)); o.push(a); if (a === "*") break; } return o; };
  const WTP = translate(WT);

  let seq = WT, mode = "sub", edits = 0;
  const PRE = {
    wt: () => WT,
    sickle: () => WT.slice(0, 19) + "T" + WT.slice(20),          // 7번째 코돈 GAG → GTG
    silent: () => WT.slice(0, 20) + "A" + WT.slice(21),          // GAG → GAA
    nonsense: () => WT.slice(0, 51) + "T" + WT.slice(52),        // 18번째 코돈 AAG → TAG
    ins: () => WT.slice(0, 27) + "G" + WT.slice(27),              // 9번째와 10번째 코돈 사이에 G 삽입
  };
  const PREMSG = {
    wt: "원래 서열입니다. 염기를 눌러 바꿔 보세요.",
    sickle: "7번째 코돈 GAG가 GTG로 바뀌었습니다. 겸형 적혈구 빈혈증의 원인입니다. 전하를 띤 글루탐산이 물과 섞이지 않는 발린으로 바뀌어, 산소를 내준 헤모글로빈끼리 달라붙어 긴 섬유를 만듭니다.",
    silent: "7번째 코돈 GAG가 GAA로 바뀌었습니다. 두 코돈 모두 글루탐산을 뜻하므로 단백질은 달라지지 않습니다.",
    nonsense: "18번째 코돈 AAG가 멈춤 코돈 TAG로 바뀌었습니다. 단백질이 17개 아미노산에서 끝나 버립니다. 동아시아에서 흔한 β-지중해 빈혈 돌연변이 가운데 하나입니다.",
    ins: "9번째와 10번째 코돈 사이에 G가 하나 끼어들었습니다. 그 뒤로 세 개씩 끊어 읽는 틀이 모두 밀려 아미노산이 줄줄이 바뀌고, 곧 멈춤 코돈이 나옵니다. 실제로 알려진 β-지중해 빈혈 돌연변이입니다.",
  };

  function render() {
    const P = translate(seq);
    let html = "";
    const ncod = Math.ceil(seq.length / 3);
    let stopped = false;
    for (let c = 0; c < ncod; c++) {
      const cod = seq.slice(c * 3, c * 3 + 3);
      const a = cod.length === 3 && !stopped ? tr(cod) : null;
      const same = a && WTP[c] === a && c < WTP.length;
      html += `<div class="cod${stopped ? " off" : ""}"><div class="b">`;
      for (let j = 0; j < cod.length; j++) {
        const i = c * 3 + j, changed = seq[i] !== WT[i];
        html += `<button type="button" data-i="${i}" class="${changed ? "ch" : ""}" aria-label="${i + 1}번째 염기 ${seq[i]}">${seq[i]}</button>`;
      }
      html += `</div><div class="a k-${a ? KIND(a) : "none"}${a && !same ? " diff" : ""}">${a ? ABBR[a] : stopped ? "" : "…"}</div><div class="n">${c + 1}</div></div>`;
      if (a === "*") stopped = true;
    }
    seqEl.innerHTML = html;
    // 수치
    let db = 0; const L = Math.max(seq.length, WT.length);
    for (let i = 0; i < L; i++) if (seq[i] !== WT[i]) db++;
    let da = 0; for (let c = 0; c < Math.max(P.length, WTP.length); c++) if (P[c] !== WTP[c]) da++;
    nB.textContent = seq.length === WT.length ? `${db}개` : `${seq.length > WT.length ? "+" : "−"}${Math.abs(seq.length - WT.length)}개`;
    nA.textContent = `${da}개`;
    const stopAt = P.indexOf("*");
    nL.textContent = stopAt >= 0 ? `${stopAt}개에서 멈춤` : `${P.length}개 이상`;
    nL.className = stopAt >= 0 ? "bad" : "";
  }
  seqEl.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]"); if (!b) return;
    const i = +b.dataset.i;
    if (mode === "sub") { const nx = { A: "T", T: "G", G: "C", C: "A" }[seq[i]]; seq = seq.slice(0, i) + nx + seq.slice(i + 1); }
    else if (mode === "ins") seq = seq.slice(0, i + 1) + "G" + seq.slice(i + 1);
    else if (seq.length > 3) seq = seq.slice(0, i) + seq.slice(i + 1);
    msg.textContent = mode === "sub" ? "누를 때마다 A → T → G → C 순서로 바뀝니다." : mode === "ins" ? "누른 염기 뒤에 G가 하나 들어갑니다." : "누른 염기가 빠집니다.";
    preChips.forEach((c) => c.setAttribute("aria-pressed", "false"));
    edits++; render();
    const nb = seqEl.querySelector(`button[data-i="${i}"]`); if (nb) nb.focus();
  });
  modeChips.forEach((c) => c.addEventListener("click", () => { mode = c.dataset.mode; modeChips.forEach((d) => d.setAttribute("aria-pressed", d === c ? "true" : "false")); }));
  preChips.forEach((c) => c.addEventListener("click", () => {
    seq = PRE[c.dataset.pre](); msg.textContent = PREMSG[c.dataset.pre];
    preChips.forEach((d) => d.setAttribute("aria-pressed", d === c ? "true" : "false")); render();
  }));
  modeChips[0].setAttribute("aria-pressed", "true");
  preChips[0].setAttribute("aria-pressed", "true");
  msg.textContent = PREMSG.wt;
  render();
})();
