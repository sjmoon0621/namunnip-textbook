/* 생물의 유전 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const sci = (v) => { if (v >= 0.001) return num(v, 4); const e = Math.floor(Math.log10(v)); return `${num(v / 10 ** e, 1)} × 10^${e}`; };
  const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };

  // 1-1 X 염색체 열성 형질: 대립유전자 빈도 q (%)
  Q.def("gene-xlink", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ q }) => {
      clear(g);
      const p = q / 100, m = p, f = p * p, s = 25;
      bar(g, 40, m * 100 * s, "lb", "남자 (XᵃY)", `${num(m * 100, 2)}%`);
      bar(g, 80, f * 100 * s, "ld", "여자 (XᵃXᵃ)", `${num(f * 100, 2)}%`);
      bar(g, 120, 2 * p * (1 - p) * 100 * s / 4, "lk", "보인자 여자", `${num(2 * p * (1 - p) * 100, 1)}%`);
      read.textContent = `대립유전자 빈도 ${num(q, 1)}%: 남자는 X가 하나라 ${num(m * 100, 2)}%, 여자는 둘 다 있어야 해서 ${num(f * 100, 2)}%로 남자가 ${num(m / f, 1)}배 많다`;
    });
  });

  // 1-2 ABO식 혈액형: 아버지 a, 어머니 b 유전자형
  const GT = ["AA", "AO", "BB", "BO", "AB", "OO"];
  const pheno = (x, y) => { const s = [x, y].sort().join(""); return s === "AB" ? "AB" : s.includes("A") ? "A" : s.includes("B") ? "B" : "O"; };
  Q.def("gene-abo", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, b }) => {
      clear(g);
      const cnt = { A: 0, B: 0, AB: 0, O: 0 };
      for (const x of GT[a]) for (const y of GT[b]) cnt[pheno(x, y)] += 0.25;
      ["A", "B", "AB", "O"].forEach((t, i) => bar(g, 30 + i * 36, cnt[t] * 280, t === "O" ? "lk" : t === "AB" ? "lc" : t === "A" ? "ld" : "lb", `${t}형`, `${num(cnt[t] * 100, 0)}%`));
      read.textContent = `아버지 ${GT[a]} × 어머니 ${GT[b]}: ` + ["A", "B", "AB", "O"].filter((t) => cnt[t] > 0).map((t) => `${t}형 ${num(cnt[t] * 100, 0)}%`).join(", ");
    }, (k, v) => GT[v]);
  });

  // 1-3 다유전자 유전: 유전자 쌍 수 n, F2의 대문자 대립유전자 수 분포
  Q.def("gene-poly", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const N = 2 * n, w = Math.min(60, 400 / (N + 1));
      let mx = 0; const P = []; for (let k = 0; k <= N; k++) { P.push(comb(N, k) / 2 ** N); mx = Math.max(mx, P[k]); }
      P.forEach((p, k) => { const h = p / mx * 150; el("rect", { x: 60 + k * (400 / (N + 1)), y: 180 - h, width: w - 2, height: h, class: "lb" }, g); if (N <= 8 || k % 2 === 0) txt(g, 60 + k * (400 / (N + 1)) + w / 2, 198, `${k}`, "s", "middle"); });
      txt(g, 470, 214, "대문자 대립유전자 수", "s", "end");
      read.textContent = `유전자 ${n}쌍: 표현형 ${N + 1}가지, 양 끝(0개, ${N}개)은 각각 ${sci(P[0])}뿐이고 가운데(${n}개)가 ${num(P[n] * 100, 1)}%로 가장 많다`;
    });
  });

  // 1-4 어머니 나이와 다운 증후군 출생 빈도 (대략값)
  const DS = [[20, 1 / 1500], [25, 1 / 1250], [30, 1 / 950], [35, 1 / 350], [40, 1 / 100], [45, 1 / 30]];
  const dsAt = (a) => { for (let i = 1; i < DS.length; i++) if (a <= DS[i][0]) { const [a0, p0] = DS[i - 1], [a1, p1] = DS[i], t = (a - a0) / (a1 - a0); return Math.exp(Math.log(p0) + t * (Math.log(p1) - Math.log(p0))); } return DS[DS.length - 1][1]; };
  Q.def("gene-age", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ age }) => {
      clear(g);
      const F = frame(g, 20, 45, -3.5, -1, [5, 0.5]); ticks(g, F, [20, 25, 30, 35, 40, 45], []);
      for (const [v, lb] of [[-3, "1/1000"], [-2, "1/100"], [-1.5, "1/30"]]) txt(g, F.X0 - 5, F.y(v) + 4, lb, "s", "end");
      txt(g, 490, 200, "어머니 나이 (세)", "s", "end"); txt(g, 66, 26, "출생 빈도 (로그 눈금)", "s");
      Q.plot(g, F, (x) => Math.log10(dsAt(x)), "b", 20, 45, 200);
      const p = dsAt(age); Q.dot(g, F.x(age), F.y(Math.log10(p)), "fd", 5);
      read.textContent = `어머니 ${age}세: 다운 증후군 출생 빈도 약 ${num(1 / p, 0)}명에 1명 (대략값). 나이가 많을수록 감수 분열의 비분리가 잦아진다`;
    });
  });

  // 1-5 허시–체이스 실험: 표지 l (0 ³⁵S 단백질, 1 ³²P DNA)
  Q.def("gene-hershey", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ l }) => {
      clear(g);
      const sup = l ? 0.2 : 0.8, pel = 1 - sup;
      el("rect", { x: 80, y: 30, width: 70, height: 150, class: "lk" }, g);
      el("rect", { x: 80, y: 30, width: 70, height: 110, class: sup > 0.5 ? "lc" : "gd" }, g); el("rect", { x: 80, y: 140, width: 70, height: 40, class: pel > 0.5 ? "lc" : "gd" }, g);
      txt(g, 160, 90, "상층액 (빈 단백질 껍질)", "s"); txt(g, 160, 165, "침전물 (세균)", "s");
      bar(g, 60, sup * 150, "lc", "", `상층액 ${num(sup * 100, 0)}%`, 330); bar(g, 140, pel * 150, "lc", "", `침전물 ${num(pel * 100, 0)}%`, 330);
      read.textContent = (l ? "³²P (DNA) 표지" : "³⁵S (단백질) 표지") + `: 방사능의 ${num(sup * 100, 0)}%가 상층액, ${num(pel * 100, 0)}%가 세균이 있는 침전물` + (l ? ". 세균 속으로 들어간 것은 DNA이다" : ". 단백질 껍질은 세균 밖에 남는다");
    }, (k, v) => v ? "³²P (DNA)" : "³⁵S (단백질)");
  });

  // 1-6 유전체 비교: 생물 o
  const ORG = [["대장균", 4.6e6, 4300, 88], ["효모", 1.2e7, 6000, 70], ["초파리", 1.4e8, 14000, 20], ["사람", 3.1e9, 20000, 1.5]];
  Q.def("gene-genome", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ o }) => {
      clear(g);
      ORG.forEach(([nm, size, , cod], i) => { bar(g, 25 + i * 40, (Math.log10(size) - 6) * 70 + 10, i === o ? "lc" : "lk", nm, `${num(size / 1e6, size < 1e7 ? 1 : 0)} Mb, 단백질 암호 ${cod}%`); });
      const [nm, size, genes, cod] = ORG[o];
      read.textContent = `${nm}: 유전체 ${size >= 1e8 ? num(size / 1e8, 1) + "억" : num(size / 1e4, 0) + "만"} 염기쌍, 유전자 약 ${genes.toLocaleString("ko-KR")}개, 단백질을 암호화하는 부분 ${cod}%, 유전자 1개당 평균 ${Math.round(size / genes).toLocaleString("ko-KR")} 염기쌍`;
    }, (k, v) => ORG[v][0]);
  });

  // 1-7 메셀슨–스탈 실험: 세대 n
  Q.def("gene-mesel", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const heavy = n === 0 ? 1 : 0, hyb = n === 0 ? 0 : 2 / 2 ** n, light = n === 0 ? 0 : 1 - hyb;
      el("rect", { x: 100, y: 20, width: 60, height: 180, class: "lk" }, g);
      const Y = { light: 70, hyb: 110, heavy: 150 };
      for (const [k, v] of [["light", light], ["hyb", hyb], ["heavy", heavy]]) if (v > 0) el("rect", { x: 100, y: Y[k] - 3 - v * 5, width: 60, height: 6 + v * 10, class: "lb" }, g);
      txt(g, 170, 74, "¹⁴N–¹⁴N (가벼움)", "s"); txt(g, 170, 114, "¹⁵N–¹⁴N (중간)", "s"); txt(g, 170, 154, "¹⁵N–¹⁵N (무거움)", "s");
      txt(g, 330, 74, `${num(light * 100, 1)}%`, "s"); txt(g, 330, 114, `${num(hyb * 100, 1)}%`, "s"); txt(g, 330, 154, `${num(heavy * 100, 1)}%`, "s");
      read.textContent = `¹⁴N 배지로 옮긴 뒤 ${n}세대: 무거운 DNA ${num(heavy * 100, 0)}%, 중간 ${num(hyb * 100, 1)}%, 가벼운 ${num(light * 100, 1)}% (반보존적 복제)`;
    });
  });

  // 2-1 전사와 번역: 아미노산 수 n
  Q.def("gene-trans", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const nt = 3 * (n + 1), t = n / 15;
      bar(g, 40, nt / 12, "lb", "mRNA 암호 부분", `${nt.toLocaleString("ko-KR")} 뉴클레오타이드`);
      bar(g, 80, n / 4, "lc", "폴리펩타이드", `아미노산 ${n.toLocaleString("ko-KR")}개`);
      bar(g, 120, t * 3, "lk", "번역 시간", `약 ${num(t, 0)}초 (1초에 15개)`);
      read.textContent = `아미노산 ${n}개짜리 단백질: 코돈 ${n}개 + 종결 코돈 1개 = mRNA ${nt}개 염기, 리보솜 하나가 약 ${num(t, 0)}초에 번역`;
    });
  });

  // 2-2 돌연변이와 유전 부호: 종류 k
  const CODE = { AUG: "Met", GCU: "Ala", GCC: "Ala", UGG: "Trp", UGA: "종결", AAA: "Lys", GAA: "Glu", GUA: "Val", UUU: "Phe", CUG: "Leu", UUG: "Leu", GGA: "Gly", AAG: "Lys", CUU: "Leu", UGC: "Cys", GAU: "Asp", AUG_: "Met", GGC: "Gly", UAA: "종결", GCA: "Ala", AAU: "Asn", GGG: "Gly", CCA: "Pro" };
  const MUT = [["원래", "AUGGCUUGGGAAAAGUAA"], ["침묵 (U→C)", "AUGGCCUGGGAAAAGUAA"], ["과오 (A→U)", "AUGGCUUGGGUAAAGUAA"], ["넌센스 (G→A)", "AUGGCUUGAGAAAAGUAA"], ["틀 이동 (G 삽입)", "AUGGGCUUGGGAAAAGUAA"]];
  Q.def("gene-codon", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const [nm, s] = MUT[k], aa = [];
      for (let i = 0; i + 3 <= s.length; i += 3) { const c = s.slice(i, i + 3), a = CODE[c] || "?"; txt(g, 40 + i / 3 * 75, 60, c, "s", "start"); txt(g, 40 + i / 3 * 75, 90, a, a === "종결" ? "s td" : "s tb", "start"); aa.push(a); if (a === "종결") break; }
      txt(g, 40, 30, `mRNA (${nm})`, "s"); txt(g, 40, 130, "폴리펩타이드: " + aa.filter((a) => a !== "종결").join("–"), "s");
      read.textContent = `${nm}: ` + aa.join("–") + (k === 1 ? " (같은 아미노산, 단백질 그대로)" : k === 2 ? " (아미노산 하나가 바뀜)" : k === 3 ? " (종결 코돈이 일찍 나와 짧아짐)" : k === 4 ? " (뒤의 코돈이 모두 바뀜)" : "");
    }, (key, v) => MUT[v][0]);
  });

  // 2-3 젖당 오페론: 젖당 l, 포도당 c
  Q.def("gene-lac", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ l, c }) => {
      clear(g);
      const lev = !l ? 0 : c ? 5 : 100;
      el("rect", { x: 40, y: 50, width: 70, height: 30, class: "lk" }, g); txt(g, 75, 70, "프로모터", "s", "middle");
      el("rect", { x: 110, y: 50, width: 60, height: 30, class: l ? "gd" : "ld" }, g); txt(g, 140, 70, "작동 부위", "s", "middle");
      el("rect", { x: 170, y: 50, width: 260, height: 30, class: lev > 50 ? "lc" : "lk" }, g); txt(g, 300, 70, "젖당 분해 효소 유전자들", "s", "middle");
      txt(g, 140, 40, l ? "억제 단백질 떨어짐" : "억제 단백질 결합", "s", "middle");
      bar(g, 120, lev * 2.5, "lc", "효소 생산", `${lev}%`);
      read.textContent = `젖당 ${l ? "있음" : "없음"}, 포도당 ${c ? "있음" : "없음"}: ` + (!l ? "억제 단백질이 작동 부위에 붙어 전사가 막힌다" : c ? "억제는 풀렸지만 포도당이 있어 전사가 약하다" : "억제가 풀리고 포도당도 없어 젖당 분해 효소를 많이 만든다");
    }, (k, v) => v ? "있음" : "없음");
  });

  // 2-4 세포 분화: 세포 종류 t
  const CELLS = ["근육 세포", "수정체 세포", "간세포", "신경 세포"];
  const GENES = [["해당 과정 효소", [1, 1, 1, 1]], ["리보솜 단백질", [1, 1, 1, 1]], ["마이오신 (근육 수축)", [1, 0, 0, 0]], ["크리스탈린 (투명 단백질)", [0, 1, 0, 0]], ["알부민 (혈장 단백질)", [0, 0, 1, 0]], ["신경 전달 물질 합성 효소", [0, 0, 0, 1]]];
  Q.def("gene-diff", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      GENES.forEach(([nm, on], i) => { el("rect", { x: 230, y: 18 + i * 30, width: 200, height: 22, class: on[t] ? "lc" : "lk" }, g); txt(g, 222, 34 + i * 30, nm, "s", "end"); txt(g, 330, 34 + i * 30, on[t] ? "발현" : "꺼짐", "s", "middle"); });
      read.textContent = `${CELLS[t]}: DNA는 모든 세포가 같지만 켜진 유전자가 다르다. 살림 유전자 2개 + 이 세포만의 유전자 1개가 발현`;
    }, (k, v) => CELLS[v]);
  });

  // 2-5 RNA 간섭: mRNA를 줄인 정도 kd (%), 단백질 반감기 h (시간)
  Q.def("gene-rnai", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ kd, h }) => {
      clear(g);
      const r = 1 - kd / 100, P = (t) => 100 * (r + (1 - r) * 0.5 ** (t / h));
      const F = frame(g, 0, 96, 0, 100, [12, 20]); ticks(g, F, [0, 24, 48, 72, 96], [0, 20, 40, 60, 80, 100]);
      txt(g, 490, 200, "약을 넣은 뒤 시간 (h)", "s", "end"); txt(g, 66, 26, "표적 단백질 (%)", "s");
      Q.plot(g, F, P, "b", 0, 96, 200);
      read.textContent = `mRNA ${kd}% 감소, 단백질 반감기 ${h} h: 하루 뒤 단백질 ${num(P(24), 0)}%, 결국 ${num(r * 100, 0)}%까지 줄어든다`;
    });
  });

  // 3-1 제한 효소 인식 서열 길이 n: 평균 절편 길이 4^n
  Q.def("gene-restr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const L = 4 ** n, cuts = 3.1e9 / L, cutsE = 4.6e6 / L;
      bar(g, 40, Math.log10(L) * 50, "lb", "평균 절편 길이", `${L.toLocaleString("ko-KR")} 염기쌍`);
      bar(g, 80, Math.log10(cuts) * 40, "lc", "사람 유전체 절단", `약 ${Math.round(cuts).toLocaleString("ko-KR")}곳`);
      bar(g, 120, Math.max(1, Math.log10(Math.max(1, cutsE)) * 40), "lk", "대장균 유전체 절단", `약 ${num(cutsE, 0)}곳`);
      read.textContent = `인식 서열 ${n}염기: 무작위 서열에서 4^${n} = ${L.toLocaleString("ko-KR")} 염기쌍마다 한 번 나타난다`;
    });
  });

  // 3-2 유전자 가위 안내 RNA 길이 L: 유전체 속 우연한 일치 수
  Q.def("gene-guide", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ L }) => {
      clear(g);
      const m = 2 * 3.1e9 / 4 ** L;
      const F = frame(g, 8, 24, -6, 9, [2, 3]); ticks(g, F, [8, 12, 16, 20, 24], [-6, -3, 0, 3, 6, 9]);
      txt(g, 490, 200, "안내 서열 길이 (염기)", "s", "end"); txt(g, 66, 26, "우연한 일치 수 (10의 거듭제곱)", "s");
      Q.line(g, F.x(8), F.y(0), F.x(24), F.y(0), "d"); txt(g, F.x(24), F.y(0) - 4, "1곳", "s td", "end");
      Q.plot(g, F, (x) => Math.log10(2 * 3.1e9 / 4 ** x), "b", 8, 24, 100);
      Q.dot(g, F.x(L), F.y(Math.log10(m)), "fd", 5);
      read.textContent = `안내 서열 ${L}염기: 사람 유전체(양쪽 가닥)에서 우연히 같은 서열이 나올 기댓값 ${m >= 1 ? num(m, 0) + "곳" : sci(m)} → ${m < 0.1 ? "거의 한 곳만 찾는다" : "여러 곳을 자를 수 있다"}`;
    });
  });

  // 3-3 DNA 지문: 검사 부위 수 k, 부위마다 유전자형 빈도 0.1
  Q.def("gene-profile", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const p = 0.1 ** k;
      const F = frame(g, 0, 20, -20, 0, [2, 4]); ticks(g, F, [0, 5, 10, 15, 20], [-20, -16, -12, -8, -4, 0]);
      txt(g, 490, 200, "검사한 STR 부위 수", "s", "end"); txt(g, 66, 26, "남과 우연히 같을 확률 (10의 거듭제곱)", "s");
      Q.line(g, F.x(0), F.y(Math.log10(1 / 8e9)), F.x(20), F.y(Math.log10(1 / 8e9)), "d"); txt(g, F.x(20), F.y(Math.log10(1 / 8e9)) - 4, "세계 인구 분의 1", "s td", "end");
      Q.plot(g, F, (x) => -x, "b", 0, 20, 40);
      Q.dot(g, F.x(k), F.y(-k), "fd", 5);
      read.textContent = `${k}개 부위: 모르는 사람과 우연히 모두 같을 확률 약 10^−${k}` + (k >= 10 ? " (세계 인구보다 큰 수의 1, 사실상 한 사람)" : "");
    });
  });

  // 3-4 Bt 작물과 피난처: 피난처 비율 f (%), 저항성 대립유전자 빈도 변화 (열성 저항성)
  Q.def("gene-refuge", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const run = (f, G) => { let q = 0.001; const out = [q]; for (let i = 0; i < G; i++) { const p = 1 - q, sR = 1, sH = f + (1 - f) * 0.02, sS = f + (1 - f) * 0.02; const w = p * p * sS + 2 * p * q * sH + q * q * sR; q = (p * q * sH + q * q * sR) / w; out.push(q); } return out; };
    Q.bind(fig, ({ f }) => {
      clear(g);
      const F = frame(g, 0, 40, 0, 1, [5, 0.25]); ticks(g, F, [0, 10, 20, 30, 40], [0, 0.5, 1]);
      txt(g, 490, 200, "세대", "s", "end"); txt(g, 66, 26, "저항성 대립유전자 빈도", "s");
      for (const ff of [0, 0.2, 0.5]) if (ff !== f / 100) { const a = run(ff, 40); Q.plot(g, F, (x) => a[Math.round(x)], "gd", 0, 40, 40); }
      const a = run(f / 100, 40); Q.plot(g, F, (x) => a[Math.round(x)], "b", 0, 40, 40);
      const half = a.findIndex((x) => x > 0.5);
      read.textContent = `피난처 ${f}%: ` + (half >= 0 ? `약 ${half}세대 만에 저항성 대립유전자가 절반을 넘는다` : "40세대 동안 저항성 대립유전자가 절반을 넘지 않는다") + " (저항성이 열성이라 가정)";
    });
  });

  // 3-5 유전자 검사의 양성 예측도: 유병률 prev (%), 민감도·특이도 99%
  Q.def("gene-ppv", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ prev }) => {
      clear(g);
      const N = 10000, d = N * prev / 100, tp = d * 0.99, fp = (N - d) * 0.01, ppv = tp / (tp + fp);
      bar(g, 40, tp / 4, "ld", "진짜 양성", `${num(tp, 0)}명`);
      bar(g, 80, fp / 4, "lk", "거짓 양성", `${num(fp, 0)}명`);
      txt(g, 170, 140, `양성 판정 가운데 실제 환자 ${num(ppv * 100, 0)}%`, "s td");
      read.textContent = `1만 명, 유병률 ${prev}%, 정확도 99%인 검사: 양성 ${num(tp + fp, 0)}명 가운데 실제 환자 ${num(tp, 0)}명 (${num(ppv * 100, 0)}%)`;
    });
  });
})();
