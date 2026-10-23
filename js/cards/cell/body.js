/* 세포와 물질대사 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const bell = (x, m, s) => Math.exp(-(((x - m) / s) ** 2) / 2);

  // 1-1 지방산의 이중 결합 수와 녹는점 (탄소 18개)
  Q.def("cell-fat", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const FA = [["스테아르산", 69.6], ["올레산", 13.4], ["리놀레산", -5], ["리놀렌산", -11]];
    Q.bind(fig, ({ db }) => {
      clear(g);
      const kinks = db;
      for (let k = 0; k < 4; k++) { // 분자 네 개를 나란히: 굽은 사슬은 촘촘히 쌓이지 못함
        let x = 40 + (kinks ? k * 14 : 0), y = 40 + k * (kinks ? 30 : 16), d = `M${x} ${y}`, ang = 0;
        for (let i = 1; i < 18; i++) { if (kinks && (i === 9 || (kinks > 1 && i === 12) || (kinks > 2 && i === 15))) ang += 0.45; x += 12 * Math.cos(ang); y += 12 * Math.sin(ang) + (i % 2 ? -3 : 3); d += ` L${x} ${y}`; }
        el("path", { d, class: "b" }, g);
      }
      const [nm, mp] = FA[db];
      txt(g, 330, 60, `${nm} (C18, 이중 결합 ${db}개)`, "s"); txt(g, 330, 85, `녹는점 ${mp} °C`, "s td"); txt(g, 330, 110, mp > 25 ? "실온에서 고체" : "실온에서 액체", "s");
      read.textContent = `이중 결합 ${db}개: 녹는점 ${mp} °C. 시스 이중 결합이 사슬을 굽혀 분자가 촘촘히 쌓이지 못하므로 녹는점이 낮아진다`;
    }, (k, v) => FA[v][0]);
  });

  // 1-2 샤가프 법칙: A의 비율 (%)
  Q.def("cell-chargaff", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ A }) => {
      clear(g);
      const G = 50 - A, s = 6;
      bar(g, 20, A * s, "lc", "A (아데닌)", `${A}%`); bar(g, 50, A * s, "lc", "T (타이민)", `${A}%`);
      bar(g, 80, G * s, "lb", "G (구아닌)", `${G}%`); bar(g, 110, G * s, "lb", "C (사이토신)", `${G}%`);
      const hb = 100 * (A / 100 * 2 + G / 100 * 3);
      txt(g, 170, 160, `100 염기쌍의 수소 결합 ${num(hb, 0)}개 (A–T 2개, G–C 3개)`, "s");
      read.textContent = `A ${A}% → T ${A}%, G = C = ${G}%. (A + G) = (T + C) = 50%. G–C 비율이 높을수록 수소 결합이 많아 이중 나선이 잘 풀리지 않는다`;
    });
  });

  // 1-3 차등 원심 분리: 단계 k
  Q.def("cell-spin", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const ST = [["1,000 g, 10분", "핵"], ["20,000 g, 20분", "미토콘드리아, 엽록체"], ["100,000 g, 60분", "소포체·골지체 조각 (미세 소체)"], ["300,000 g, 120분", "리보솜"]];
    Q.bind(fig, ({ k }) => {
      clear(g);
      ST.forEach(([gf, what], i) => { el("rect", { x: 40 + i * 115, y: 40, width: 60, height: 120, class: "lk" }, g); el("rect", { x: 40 + i * 115, y: 140, width: 60, height: 20, class: i <= k ? "lc" : "gd" }, g); txt(g, 70 + i * 115, 180, gf.split(",")[0], "s", "middle"); txt(g, 70 + i * 115, 30, `${i + 1}단계`, "s", "middle"); });
      read.textContent = `${k + 1}단계 (${ST[k][0]}): 가라앉는 것은 ${ST[k][1]}. 윗물만 옮겨 더 세게 돌리면 더 작은 소기관이 차례로 가라앉는다`;
    }, (key, v) => `${v + 1}단계`);
  });

  // 1-4 세포 반지름과 표면적/부피
  Q.def("cell-sav", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const F = frame(g, 0, 50, 0, 3.2, [5, 0.5]); ticks(g, F, [0, 10, 20, 30, 40, 50], [0, 1, 2, 3]);
      txt(g, 490, 200, "세포 반지름 (μm)", "s", "end"); txt(g, 66, 26, "표면적 ÷ 부피 (1/μm)", "s");
      Q.plot(g, F, (x) => 3 / x, "b", 0.9, 50, 300);
      Q.dot(g, F.x(r), F.y(Math.min(3.2, 3 / r)), "fd", 5);
      txt(g, F.x(1), F.y(3) - 6, "세균", "s"); txt(g, F.x(20), F.y(0.15) - 8, "동물 세포", "s");
      read.textContent = `반지름 ${r} μm: 표면적 ÷ 부피 = 3/r = ${num(3 / r, 2)}. 반지름이 ${r}배인 세포는 부피당 표면이 세균(1 μm)의 ${num(1 / r, 3)}배`;
    });
  });

  // 1-5 단순 확산과 촉진 확산: 농도 차 c (mM)
  Q.def("cell-trans", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ c }) => {
      clear(g);
      const F = frame(g, 0, 10, 0, 10, [1, 2]); ticks(g, F, [0, 2, 4, 6, 8, 10], [0, 2, 4, 6, 8, 10]);
      txt(g, 490, 200, "막 안팎의 농도 차 (mM)", "s", "end"); txt(g, 66, 26, "1초당 들어오는 양 (상대값)", "s");
      const sim = (x) => 0.6 * x, fac = (x) => 9 * x / (1.5 + x);
      Q.plot(g, F, sim, "c", 0, 10, 50); Q.plot(g, F, fac, "b", 0, 10, 200);
      Q.dot(g, F.x(c), F.y(sim(c)), "fc", 5); Q.dot(g, F.x(c), F.y(fac(c)), "fb", 5);
      txt(g, F.x(9), F.y(sim(9)) + 16, "단순 확산", "s tc"); txt(g, F.x(8), F.y(fac(8)) - 8, "운반체 (촉진 확산)", "s tb");
      read.textContent = `농도 차 ${c} mM: 단순 확산 ${num(sim(c), 1)}, 운반체 ${num(fac(c), 1)}. 운반체는 수가 정해져 있어 농도 차를 키워도 최대 9에서 포화된다`;
    });
  });

  // 2-1 에너지 짝지음: 필요한 반응의 ΔG (kJ/mol), ATP 가수 분해 −30.5
  Q.def("cell-couple", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dg }) => {
      clear(g);
      const n = Math.ceil(dg / 30.5), tot = dg - 30.5 * n, s = 3, z = 260;
      Q.line(g, z, 20, z, 170, "ax");
      el("rect", { x: z, y: 30, width: dg * s, height: 26, class: "ld" }, g); txt(g, z - 8, 48, "필요한 반응 ΔG", "s", "end"); txt(g, z + dg * s + 6, 48, `+${dg}`, "s");
      el("rect", { x: z - 30.5 * n * s, y: 70, width: 30.5 * n * s, height: 26, class: "lb" }, g); txt(g, z - 30.5 * n * s - 6, 88, `ATP ${n}개 −${num(30.5 * n, 1)}`, "s", "end");
      el("rect", { x: tot < 0 ? z + tot * s : z, y: 110, width: Math.abs(tot) * s, height: 26, class: "lc" }, g); txt(g, z + 6, 160, `합 ${num(tot, 1)} kJ/mol → ${tot < 0 ? "자발적" : "비자발적"}`, "s");
      read.textContent = `ΔG = +${dg} kJ/mol인 반응에 ATP ${n}개의 가수 분해(−30.5 kJ/mol씩)를 짝지으면 합 ${num(tot, 1)} kJ/mol로 저절로 일어난다`;
    });
  });

  // 2-2 하루에 재생되는 ATP의 양: 하루 소비 열량 (kcal)
  Q.def("cell-atp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ kcal }) => {
      clear(g);
      const kJ = kcal * 4.184, mol = kJ * 0.4 / 30.5, kg = mol * 0.507;
      bar(g, 40, kg * 4, "lc", "하루에 만들고 쓰는 ATP", `${num(kg, 0)} kg`);
      bar(g, 80, 50 / 1000 * 4 + 1, "lb", "몸속에 있는 ATP", "약 0.05 kg");
      txt(g, 170, 140, `ATP 한 분자가 하루에 약 ${num(kg / 0.05, 0)}번 재생된다`, "s");
      read.textContent = `하루 ${kcal} kcal (${num(kJ, 0)} kJ) 가운데 약 40%가 ATP에 실린다고 하면 ATP ${num(mol, 0)} mol, 약 ${num(kg, 0)} kg을 만들고 다시 쓴다`;
    });
  });

  // 2-3 효소의 최적 pH: 효소 e (0 펩신, 1 아밀레이스, 2 트립신), pH
  Q.def("cell-ph", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const E = [["펩신 (위)", 2, 1.1], ["침 아밀레이스 (입)", 6.8, 1.2], ["트립신 (작은창자)", 8, 1.2]];
    Q.bind(fig, ({ e, pH }) => {
      clear(g);
      const F = frame(g, 0, 12, 0, 1.05, [1, 0.25]); ticks(g, F, [0, 2, 4, 6, 8, 10, 12], [0, 0.5, 1]);
      txt(g, 490, 200, "pH", "s", "end"); txt(g, 66, 26, "상대 활성", "s");
      E.forEach(([, m, s], i) => Q.plot(g, F, (x) => bell(x, m, s), i === e ? "b" : "gd", 0, 12, 200));
      const [nm, m, s] = E[e], a = bell(pH, m, s); Q.dot(g, F.x(pH), F.y(a), "fd", 5);
      read.textContent = `${nm}, pH ${pH}: 활성 ${num(a * 100, 0)}% (최적 pH 약 ${m}). 최적 pH에서 멀어지면 활성 부위의 전하가 바뀌어 기질과 잘 결합하지 못한다`;
    }, (k, v) => k === "e" ? E[v][0] : `${v}`);
  });

  // 2-4 미카엘리스–멘텐과 저해제: 기질 농도 S, 저해 i (0 없음, 1 경쟁적, 2 비경쟁적)
  Q.def("cell-mm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const IN = ["저해제 없음", "경쟁적 저해제", "비경쟁적 저해제"];
    const v = (S, i) => i === 1 ? 100 * S / (3 * 2 + S) : i === 2 ? 50 * S / (2 + S) : 100 * S / (2 + S);
    Q.bind(fig, ({ S, i }) => {
      clear(g);
      const F = frame(g, 0, 40, 0, 100, [5, 20]); ticks(g, F, [0, 10, 20, 30, 40], [0, 20, 40, 60, 80, 100]);
      txt(g, 490, 200, "기질 농도 (mM)", "s", "end"); txt(g, 66, 26, "반응 속도 (최대의 %)", "s");
      for (let k = 0; k < 3; k++) Q.plot(g, F, (x) => v(x, k), k === i ? "b" : "gd", 0, 40, 200);
      Q.dot(g, F.x(S), F.y(v(S, i)), "fd", 5);
      read.textContent = `${IN[i]}, 기질 ${S} mM: 속도 ${num(v(S, i), 0)}%` + (i === 1 ? " (기질을 늘리면 저해를 이겨 100%에 다가간다)" : i === 2 ? " (기질을 늘려도 최대 50%에 머문다)" : "");
    }, (k, x) => k === "i" ? IN[x] : `${x}`);
  });

  // 2-5 효소의 온도: 온도 T (°C)
  Q.def("cell-thermo", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const act = (T, opt, die) => T < opt ? Math.exp((T - opt) / 12) : Math.max(0, 1 - ((T - opt) / (die - opt)) ** 2);
    Q.bind(fig, ({ T }) => {
      clear(g);
      const F = frame(g, 0, 100, 0, 1.05, [10, 0.25]); ticks(g, F, [0, 20, 40, 60, 80, 100], [0, 0.5, 1]);
      txt(g, 490, 200, "온도 (°C)", "s", "end"); txt(g, 66, 26, "상대 활성", "s");
      Q.plot(g, F, (x) => act(x, 37, 55), "c", 0, 100, 300); Q.plot(g, F, (x) => act(x, 75, 98), "b", 0, 100, 300);
      Q.dot(g, F.x(T), F.y(act(T, 37, 55)), "fc", 5); Q.dot(g, F.x(T), F.y(act(T, 75, 98)), "fb", 5);
      txt(g, F.x(28), F.y(1) - 4, "사람 효소", "s tc"); txt(g, F.x(66), F.y(1) - 4, "온천 세균의 효소", "s tb");
      read.textContent = `${T} °C: 사람 효소 ${num(act(T, 37, 55) * 100, 0)}%, 고온성 세균의 효소 ${num(act(T, 75, 98) * 100, 0)}%`;
    });
  });

  // 3-1 미토콘드리아 내막의 주름 수 n
  Q.def("cell-mito", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      el("ellipse", { cx: 200, cy: 110, rx: 170, ry: 80, class: "lk" }, g);
      const W = 300, x0 = 50, depth = 55;
      let d;
      const top = 50, bot = 170;
      // 위쪽 테두리를 따라 주름
      d = `M${x0} 100`;
      for (let i = 0; i < n; i++) { const x = x0 + 20 + (W - 40) * (i + 0.5) / n; d += ` L${x - 4} ${i % 2 ? bot - 30 : top + 20} L${x - 4} ${i % 2 ? bot - 30 - depth : top + 20 + depth} L${x + 4} ${i % 2 ? bot - 30 - depth : top + 20 + depth} L${x + 4} ${i % 2 ? bot - 30 : top + 20}`; }
      d += ` L${x0 + W} 100`;
      el("path", { d, class: "b" }, g);
      const area = 1 + n * 0.1;
      txt(g, 390, 60, `주름 ${n}개`, "s"); txt(g, 390, 85, `내막 넓이 약 ${num(area, 1)}배`, "s tb");
      read.textContent = `내막의 주름(크리스타) ${n}개: 매끈할 때보다 넓이가 약 ${num(area, 1)}배, 그만큼 전자 전달계와 ATP 합성 효소가 많이 들어간다`;
    });
  });

  // 3-2 세포 호흡 단계별 ATP: 단계 k (0 해당 과정, 1 피루브산 산화, 2 TCA 회로, 3 전자 전달계)
  Q.def("cell-resp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const S = [["해당 과정", 2, 2, 0], ["피루브산 산화", 0, 2, 0], ["TCA 회로", 2, 6, 2], ["전자 전달계", 0, 0, 0]];
    Q.bind(fig, ({ k }) => {
      clear(g);
      let atp = 0, nadh = 0, fadh = 0;
      for (let i = 0; i <= Math.min(k, 2); i++) { atp += S[i][1]; nadh += S[i][2]; fadh += S[i][3]; }
      const ox = k === 3 ? nadh * 2.5 + fadh * 1.5 : 0, tot = atp + ox;
      S.forEach(([nm], i) => { el("rect", { x: 30 + i * 120, y: 30, width: 105, height: 30, class: i <= k ? "lc" : "lk" }, g); txt(g, 82 + i * 120, 50, nm, "s", "middle"); });
      bar(g, 90, atp * 8, "lc", "기질 수준 ATP", `${atp}`);
      bar(g, 120, nadh * 8, "lb", "NADH", `${nadh}`); bar(g, 150, fadh * 8, "lb", "FADH₂", `${fadh}`);
      bar(g, 180, ox * 8, "ld", "산화적 인산화 ATP", `${num(ox, 0)}`);
      read.textContent = `${S[k][0]}까지 (포도당 1분자): ATP ${num(tot, 0)}개` + (k === 3 ? ` (NADH 10 × 2.5 + FADH₂ 2 × 1.5 + 기질 수준 4 = 약 32)` : `, NADH ${nadh}, FADH₂ ${fadh}는 아직 전자를 들고 있다`);
    }, (key, v) => S[v][0]);
  });

  // 3-3 화학 삼투: pH 차 dph, 막 전위 psi (mV)
  Q.def("cell-chemi", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dph, psi }) => {
      clear(g);
      const a = 2.303 * 8.314 * 310 * dph / 1000, b = 96.5 * psi / 1000, G = a + b, n = 50 / G;
      el("rect", { x: 170, y: 40, width: a * 15, height: 26, class: "lb" }, g); txt(g, 162, 58, "pH 차의 몫", "s", "end"); txt(g, 176 + a * 15, 58, `${num(a, 1)} kJ/mol`, "s");
      el("rect", { x: 170, y: 80, width: b * 15, height: 26, class: "lc" }, g); txt(g, 162, 98, "전위 차의 몫", "s", "end"); txt(g, 176 + b * 15, 98, `${num(b, 1)} kJ/mol`, "s");
      txt(g, 170, 145, `H⁺ 1 mol이 돌아올 때 ${num(G, 1)} kJ`, "s"); txt(g, 170, 170, isFinite(n) ? `ATP 1 mol(약 50 kJ, 세포 안 조건)에 H⁺ 약 ${num(n, 1)} mol` : "기울기가 없으면 ATP를 만들 수 없다", "s td");
      read.textContent = `ΔpH ${dph}, 막 전위 ${psi} mV: 수소 이온 하나가 내막을 거슬러 돌아올 때 ${num(G, 1)} kJ/mol을 내놓는다`;
    });
  });

  // 3-4 산소 호흡과 발효: 필요한 ATP (mmol/분)
  Q.def("cell-ferm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ atp }) => {
      clear(g);
      const ga = atp / 32, gf = atp / 2;
      bar(g, 50, ga * 6, "lb", "산소 호흡", `포도당 ${num(ga, 2)} mmol/분`);
      bar(g, 100, gf * 6, "ld", "젖산 발효", `포도당 ${num(gf, 1)} mmol/분`);
      txt(g, 170, 160, `같은 ATP를 얻으려면 발효는 포도당을 16배 쓴다`, "s");
      read.textContent = `ATP ${atp} mmol/분이 필요할 때: 산소 호흡 포도당 ${num(ga, 2)} mmol, 발효 ${num(gf, 1)} mmol (포도당 1분자당 32 대 2 ATP)`;
    });
  });

  // 3-5 광합성 색소의 흡수 스펙트럼: 파장 w (nm)
  const chlA = (w) => 0.95 * bell(w, 430, 14) + 0.75 * bell(w, 662, 11) + 0.1 * bell(w, 610, 25);
  const chlB = (w) => 1.0 * bell(w, 453, 13) + 0.5 * bell(w, 642, 11);
  const car = (w) => 0.8 * bell(w, 450, 18) + 0.75 * bell(w, 480, 16);
  Q.def("cell-pig", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w }) => {
      clear(g);
      const F = frame(g, 400, 700, 0, 1.1, [50, 0.25]); ticks(g, F, [400, 450, 500, 550, 600, 650, 700], []);
      txt(g, 490, 200, "파장 (nm)", "s", "end"); txt(g, 66, 26, "흡수 정도 (상대값)", "s");
      Q.plot(g, F, chlA, "c", 400, 700, 300); Q.plot(g, F, chlB, "b", 400, 700, 300); Q.plot(g, F, car, "d", 400, 700, 300);
      Q.line(g, F.x(w), F.y(0), F.x(w), F.y(1.1), "k");
      const col = w < 450 ? "보라" : w < 495 ? "파랑" : w < 570 ? "초록" : w < 590 ? "노랑" : w < 620 ? "주황" : "빨강";
      read.textContent = `${w} nm (${col}): 엽록소 a ${num(chlA(w), 2)}, 엽록소 b ${num(chlB(w), 2)}, 카로티노이드 ${num(car(w), 2)}` + (w > 500 && w < 600 ? " (거의 흡수하지 않아 반사된다)" : "");
    });
  });

  // 3-6 빛의 세기와 광합성 속도: 빛 I, 이산화 탄소 c (0 대기 0.04%, 1 0.1%)
  Q.def("cell-light", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const P = (I, c) => (c ? 30 : 18) * I / (250 + I) - 3;
    Q.bind(fig, ({ I, c }) => {
      clear(g);
      const F = frame(g, 0, 1500, -5, 30, [250, 5]); ticks(g, F, [0, 500, 1000, 1500], [0, 10, 20, 30]);
      txt(g, 490, 200, "빛의 세기 (μmol/m²·s)", "s", "end"); txt(g, 66, 26, "순광합성 속도 (상대값)", "s");
      Q.line(g, F.x(0), F.y(0), F.x(1500), F.y(0), "k");
      Q.plot(g, F, (x) => P(x, 0), c ? "gd" : "b", 0, 1500, 200); Q.plot(g, F, (x) => P(x, 1), c ? "b" : "gd", 0, 1500, 200);
      Q.dot(g, F.x(I), F.y(P(I, c)), "fd", 5);
      const comp = 3 * 250 / ((c ? 30 : 18) - 3);
      read.textContent = `빛 ${I}, CO₂ ${c ? "0.1%" : "0.04%"}: 순광합성 ${num(P(I, c), 1)} (광보상점 약 ${num(comp, 0)}). 빛이 세지면 결국 CO₂나 효소가 속도를 제한한다`;
    }, (k, v) => k === "c" ? (v ? "0.1%" : "0.04%") : `${v}`);
  });

  // 3-7 Z 도식: 전자의 위치 k
  Q.def("cell-z", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const Z = [["H₂O", 0.82, 30], ["P680", 1.1, 80], ["P680*", -0.8, 110], ["PQ", 0.0, 170], ["사이토크롬", 0.3, 230], ["P700", 0.45, 290], ["P700*", -1.25, 320], ["NADP⁺", -0.32, 420]];
    Q.bind(fig, ({ k }) => {
      clear(g);
      const Y = (e) => 30 + (e + 1.3) * 75;
      Q.line(g, 20, Y(0), 500, Y(0), "gd"); txt(g, 498, Y(0) - 4, "0 V", "s", "end");
      for (let i = 1; i < Z.length; i++) Q.line(g, Z[i - 1][2], Y(Z[i - 1][1]), Z[i][2], Y(Z[i][1]), i === 2 || i === 6 ? "d" : "b");
      Z.forEach(([nm, e, x], i) => { Q.dot(g, x, Y(e), i === k ? "fd" : "fk", i === k ? 6 : 3); txt(g, x, Y(e) + (i % 2 ? -8 : 16), nm, i === k ? "s td" : "s", "middle"); });
      txt(g, 95, Y(0.1), "빛", "s td"); txt(g, 305, Y(-0.4), "빛", "s td");
      read.textContent = `${Z[k][0]} (환원 전위 ${num(Z[k][1], 2)} V)` + (k === 2 || k === 6 ? ": 빛 에너지로 전자가 높은 에너지로 올라왔다" : k === 7 ? ": 전자가 NADPH에 실려 캘빈 회로로 간다" : "");
    }, (key, v) => Z[v][0]);
  });

  // 3-8 엥겔만 실험: 파장 w에 모인 호기성 세균 수 (작용 스펙트럼)
  Q.def("cell-eng", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const act = (w) => Math.min(1, 0.9 * bell(w, 440, 25) + 0.85 * bell(w, 670, 18) + 0.25 * bell(w, 560, 60));
    Q.bind(fig, ({ w }) => {
      clear(g);
      const X = (x) => 50 + (x - 400) * 1.4;
      el("rect", { x: X(400), y: 150, width: X(700) - X(400), height: 16, class: "lk" }, g);
      for (let x = 405; x < 700; x += 10) { const n = Math.round(act(x) * 10); for (let j = 0; j < n; j++) Q.dot(g, X(x) + ((j * 7) % 9) - 4, 140 - j * 9, x === Math.round((w - 5) / 10) * 10 + 5 ? "fd" : "fb", 2.5); }
      Q.line(g, X(w), 20, X(w), 170, "k");
      for (const [x, lb] of [[450, "파랑"], [550, "초록"], [670, "빨강"]]) txt(g, X(x), 190, lb, "s", "middle");
      read.textContent = `${w} nm 아래에 모인 세균 약 ${Math.round(act(w) * 10)}마리 (상대값). 파란빛과 빨간빛 부분에서 산소가 많이 나와 세균이 몰린다`;
    });
  });
})();
