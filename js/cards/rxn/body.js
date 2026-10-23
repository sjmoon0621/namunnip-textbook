/* 화학 반응의 세계 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val) => { el("rect", { x: 150, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, 142, y + 16, label, "s", "end"); txt(g, 156 + Math.max(1, w), y + 16, val, "s"); };
  const ACIDS = [["염산", Infinity], ["플루오린화 수소산", 6.8e-4], ["아세트산", 1.8e-5]];
  // 약산 HA (농도 C, 이온화 상수 Ka)의 [H3O+]: x² + Ka x − Ka C = 0
  const hOf = (C, Ka) => Ka === Infinity ? C : (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C)) / 2;

  // 1-1 짝산–짝염기의 세기: 산의 pKa
  Q.def("rxn-conj", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ pka }) => {
      clear(g);
      const pkb = 14 - pka, s = 20;
      bar(g, 40, (16 - pka) * s, "ld", "산의 세기 (16 − pKa)", `pKa ${num(pka, 1)}`);
      bar(g, 90, (16 - pkb) * s, "lb", "짝염기의 세기 (16 − pKb)", `pKb ${num(pkb, 1)}`);
      txt(g, 150, 150, `Ka × Kb = Kw = 1.0 × 10⁻¹⁴  (pKa + pKb = 14)`, "s");
      read.textContent = `pKa ${num(pka, 1)}인 산의 짝염기는 pKb ${num(pkb, 1)}: 산이 셀수록 짝염기는 약하다`;
    });
  });

  // 1-2 약산의 pH: 농도 10^lc M, 산의 종류 a
  Q.def("rxn-weakph", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lc, a }) => {
      clear(g);
      const F = frame(g, -4, 0, 0, 7, [0.5, 1]); ticks(g, F, [-4, -3, -2, -1, 0], [0, 1, 2, 3, 4, 5, 6, 7]);
      txt(g, 490, 200, "농도 (10의 거듭제곱 M)", "s", "end"); txt(g, 66, 26, "pH", "s");
      ACIDS.forEach(([, Ka], i) => Q.plot(g, F, (x) => -Math.log10(hOf(10 ** x, Ka)), i === a ? "b" : "gd", -4, 0, 120));
      const C = 10 ** lc, [nm, Ka] = ACIDS[a], h = hOf(C, Ka), pH = -Math.log10(h);
      Q.dot(g, F.x(lc), F.y(pH), "fd", 5);
      read.textContent = `${nm} ${num(C, 4)} M: [H₃O⁺] = ${h.toExponential(1)} M, pH ${num(pH, 2)}, 이온화도 ${num(h / C * 100, 1)}%`;
    }, (k, v) => k === "a" ? ACIDS[v][0] : `${v}`);
  });

  // 1-3 중화 적정 곡선: 0.10 M 산 25 mL에 0.10 M NaOH, 산 a (0 염산, 2 아세트산), 넣은 부피 V
  Q.def("rxn-titr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const pHat = (v, Ka) => {
      const na = 2.5, nb = 0.1 * v, Vt = (25 + v) / 1000; // mmol, L
      if (Math.abs(nb - na) < 1e-9) return Ka === Infinity ? 7 : 14 + Math.log10(Math.sqrt(1e-14 / Ka * (na / 1000 / Vt)));
      if (nb > na) return 14 + Math.log10((nb - na) / 1000 / Vt);
      if (Ka === Infinity) return -Math.log10((na - nb) / 1000 / Vt);
      if (nb === 0) return -Math.log10(hOf(0.1, Ka));
      return -Math.log10(Ka) + Math.log10(nb / (na - nb));
    };
    Q.bind(fig, ({ a, V }) => {
      clear(g);
      const F = frame(g, 0, 50, 0, 14, [5, 2]); ticks(g, F, [0, 10, 20, 25, 30, 40, 50], [0, 2, 4, 6, 8, 10, 12, 14]);
      txt(g, 490, 200, "넣은 NaOH (mL)", "s", "end"); txt(g, 66, 26, "pH", "s");
      const Ka = a ? 1.8e-5 : Infinity;
      if (a) Q.plot(g, F, (v) => pHat(v, Infinity), "gd", 0, 50, 400);
      Q.plot(g, F, (v) => pHat(v, Ka), "b", 0, 50, 400);
      const p = pHat(V, Ka); Q.dot(g, F.x(V), F.y(p), "fd", 5);
      read.textContent = `${a ? "아세트산" : "염산"} 25 mL에 NaOH ${V} mL: pH ${num(p, 2)}` + (Math.abs(V - 25) < 0.01 ? " (중화점)" : a && Math.abs(V - 12.5) < 0.01 ? " (절반 중화, pH = pKa)" : "");
    }, (k, v) => k === "a" ? (v ? "아세트산" : "염산") : `${v}`);
  });

  // 1-4 염의 가수 분해: 염 s (0 NaCl, 1 CH3COONa, 2 NH4Cl), 농도 C
  Q.def("rxn-salt", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const SALTS = [["염화 나트륨", 0], ["아세트산 나트륨", 1], ["염화 암모늄", -1]];
    Q.bind(fig, ({ s, C }) => {
      clear(g);
      const [nm, t] = SALTS[s];
      let pH = 7;
      if (t === 1) { const Kb = 1e-14 / 1.8e-5, oh = Math.sqrt(Kb * C); pH = 14 + Math.log10(oh); }
      if (t === -1) { const Ka = 1e-14 / 1.8e-5, h = Math.sqrt(Ka * C); pH = -Math.log10(h); }
      for (let i = 0; i <= 14; i++) { el("rect", { x: 40 + i * 30, y: 60, width: 30, height: 40, class: i < 7 ? "ld" : i > 7 ? "lb" : "lk" }, g); txt(g, 55 + i * 30, 120, `${i}`, "s", "middle"); }
      Q.arrow(g, 40 + pH * 30 + 15, 30, 40 + pH * 30 + 15, 58, "k", "fk");
      txt(g, 40 + pH * 30 + 15, 24, `pH ${num(pH, 2)}`, "s", "middle");
      const why = t === 1 ? "CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻ (염기성)" : t === -1 ? "NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺ (산성)" : "Na⁺와 Cl⁻는 물과 반응하지 않음 (중성)";
      txt(g, 40, 160, why, "s");
      read.textContent = `${nm} ${num(C, 2)} M 수용액: pH ${num(pH, 2)}`;
    }, (k, v) => k === "s" ? SALTS[v][0] : `${v}`);
  });

  // 1-5 완충 용액: 0.10 M CH3COOH/CH3COONa 100 mL와 순수한 물 100 mL에 HCl n mmol
  Q.def("rxn-buffer", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const buf = (n) => 4.74 + Math.log10((10 - n) / (10 + n));
    const water = (n) => n === 0 ? 7 : -Math.log10(n / 1000 / 0.1);
    Q.bind(fig, ({ n }) => {
      clear(g);
      const F = frame(g, 0, 8, 0, 8, [1, 1]); ticks(g, F, [0, 2, 4, 6, 8], [0, 2, 4, 6, 8]);
      txt(g, 490, 200, "넣은 HCl (mmol)", "s", "end"); txt(g, 66, 26, "pH", "s");
      Q.plot(g, F, buf, "b", 0, 8, 200); Q.plot(g, F, (x) => water(Math.max(x, 1e-7)), "d", 0.0001, 8, 400);
      Q.dot(g, F.x(n), F.y(buf(n)), "fb", 5); Q.dot(g, F.x(n), F.y(Math.min(8, water(n))), "fd", 5);
      txt(g, F.x(6), F.y(buf(6)) - 10, "완충 용액", "s tb"); txt(g, F.x(6), F.y(water(6)) + 16, "물", "s td");
      read.textContent = `HCl ${n} mmol: 완충 용액 pH ${num(buf(n), 2)} (변화 ${num(buf(n) - 4.74, 2)}), 물 pH ${num(water(n), 2)} (변화 ${num(water(n) - 7, 2)})`;
    });
  });

  // 2-1 질소의 산화수
  Q.def("rxn-oxnum", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const N = [["NH₃", -3], ["N₂", 0], ["N₂O", 1], ["NO", 2], ["NO₂", 4], ["HNO₃", 5]];
    Q.bind(fig, ({ k }) => {
      clear(g);
      const X = (v) => 60 + (v + 3) * 50;
      Q.line(g, X(-3), 100, X(5), 100, "ax");
      for (let v = -3; v <= 5; v++) { Q.line(g, X(v), 95, X(v), 105, "k"); txt(g, X(v), 125, `${v > 0 ? "+" : ""}${v}`, "s", "middle"); }
      N.forEach(([f, v], i) => { Q.dot(g, X(v), 100, i === k ? "fd" : "fb", i === k ? 7 : 4); txt(g, X(v), i % 2 ? 80 : 70, f, i === k ? "s td" : "s", "middle"); });
      txt(g, X(-3), 160, "← 환원 (전자를 얻음)", "s tb"); txt(g, X(5), 160, "산화 (전자를 잃음) →", "s td", "end");
      const [f, v] = N[k];
      read.textContent = `${f}에서 N의 산화수 ${v > 0 ? "+" : ""}${v}` + (k === 0 ? " (H는 +1, 3 × (+1) + x = 0)" : k === 5 ? " (H +1, O −2: 1 + x + 3 × (−2) = 0)" : "");
    }, (key, v) => key === "k" ? N[v][0] : `${v}`);
  });

  // 2-2 전지의 발달: 전지 종류
  Q.def("rxn-batt", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const B = [["볼타 전지 (1800)", 1.1, 0], ["다니엘 전지 (1836)", 1.1, 0], ["납축전지 (1859)", 2.0, 35], ["망가니즈 건전지 (1886)", 1.5, 80], ["리튬 이온 전지 (1991)", 3.7, 250]];
    Q.bind(fig, ({ k }) => {
      clear(g);
      B.forEach(([nm, v], i) => { el("rect", { x: 200, y: 20 + i * 34, width: v * 60, height: 24, class: i === k ? "lc" : "lk" }, g); txt(g, 192, 37 + i * 34, nm, "s", "end"); txt(g, 206 + v * 60, 37 + i * 34, `${v} V`, "s"); });
      const [nm, v, wh] = B[k];
      read.textContent = `${nm}: 전압 약 ${v} V` + (wh ? `, 질량당 에너지 약 ${wh} Wh/kg` : "") + (k === 4 ? " (충전 가능, 가볍고 전압이 높다)" : k === 2 ? " (충전 가능, 무겁다)" : "");
    }, (key, v) => key === "k" ? B[v][0] : `${v}`);
  });

  // 2-3 표준 환원 전위와 전지 전위: 금속 a, b
  const MET = [["Mg", -2.37], ["Zn", -0.76], ["Fe", -0.44], ["Pb", -0.13], ["Cu", 0.34], ["Ag", 0.80]];
  Q.def("rxn-ecell", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, b }) => {
      clear(g);
      const Y = (e) => 110 - e * 38;
      Q.line(g, 120, Y(1), 120, Y(-2.5), "ax");
      MET.forEach(([m, e], i) => { Q.line(g, 112, Y(e), 128, Y(e), "k"); txt(g, 106, Y(e) + 4, `${m} ${num(e, 2)} V`, i === a || i === b ? "s td" : "s", "end"); });
      const [ma, ea] = MET[a], [mb, eb] = MET[b];
      if (a === b) { read.textContent = "같은 금속끼리는 전위차가 없어 전지가 되지 않는다"; return; }
      const [cat, ec, an, ean] = ea > eb ? [ma, ea, mb, eb] : [mb, eb, ma, ea];
      Q.arrow(g, 160, Y(ean), 160, Y(ec), "b", "fb"); txt(g, 175, (Y(ean) + Y(ec)) / 2, `E° = ${num(ec, 2)} − (${num(ean, 2)}) = ${num(ec - ean, 2)} V`, "s tb");
      read.textContent = `${an} | ${cat} 전지: ${an}이 산화되는 (−)극, ${cat} 이온이 환원되는 (+)극, 표준 전지 전위 ${num(ec - ean, 2)} V`;
    }, (k, v) => MET[v][0]);
  });

  // 2-4 전기 분해: 전류 I (A), 시간 t (분), 구리 석출
  Q.def("rxn-faraday", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ I, t }) => {
      clear(g);
      const m = (tt) => I * tt * 60 / 96500 / 2 * 63.5;
      const F = frame(g, 0, 60, 0, 6, [10, 1]); ticks(g, F, [0, 10, 20, 30, 40, 50, 60], [0, 2, 4, 6]);
      txt(g, 490, 200, "시간 (분)", "s", "end"); txt(g, 66, 26, "석출된 구리 (g)", "s");
      Q.plot(g, F, m, "b", 0, 60, 60);
      Q.dot(g, F.x(t), F.y(Math.min(6, m(t))), "fd", 5);
      const q = I * t * 60;
      read.textContent = `${I} A로 ${t}분: 전하량 ${num(q, 0)} C = 전자 ${num(q / 96500, 3)} mol → Cu²⁺ + 2e⁻ → Cu, 구리 ${num(m(t), 2)} g`;
    });
  });

  // 2-5 전자 전달계: 전자가 내려온 단계 k
  Q.def("rxn-etc", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const L = [["NADH", -0.32], ["유비퀴논", 0.05], ["사이토크롬 c", 0.25], ["O₂", 0.82]];
    Q.bind(fig, ({ k }) => {
      clear(g);
      const Y = (e) => 40 + (e + 0.32) * 140;
      L.forEach(([nm, e], i) => { Q.line(g, 80 + i * 100, Y(e), 160 + i * 100, Y(e), "k"); txt(g, 120 + i * 100, Y(e) - 6, nm, "s", "middle"); txt(g, 120 + i * 100, Y(e) + 16, `${num(e, 2)} V`, "s", "middle"); if (i > 0) Q.line(g, 160 + (i - 1) * 100, Y(L[i - 1][1]), 80 + i * 100, Y(e), "gd"); });
      Q.dot(g, 120 + k * 100, Y(L[k][1]), "fd", 6);
      const dE = L[k][1] - L[0][1], dG = 2 * 96.5 * dE;
      read.textContent = `전자 2개가 NADH에서 ${L[k][0]}까지 내려옴: 전위차 ${num(dE, 2)} V, 방출 에너지 nFΔE = ${num(dG, 0)} kJ/mol` + (k === 3 ? " (이 에너지로 ATP 약 2.5개를 만든다)" : "");
    }, (key, v) => L[v][0]);
  });

  // 3-1 작용기와 끓는점 (탄소 2개 화합물)
  Q.def("rxn-func", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const C = [["에테인 CH₃CH₃", "없음", -89, "물에 거의 안 녹음"], ["클로로에테인 CH₃CH₂Cl", "할로젠", 12, "조금 녹음"], ["아세트알데하이드 CH₃CHO", "포밀기", 20, "잘 녹음"], ["에탄올 CH₃CH₂OH", "하이드록시기", 78, "잘 섞임 (수소 결합)"], ["아세트산 CH₃COOH", "카복실기", 118, "잘 섞임, 산성"]];
    Q.bind(fig, ({ k }) => {
      clear(g);
      C.forEach(([nm, , bp], i) => { const w = (bp + 100) * 1.1; el("rect", { x: 220, y: 18 + i * 34, width: w, height: 24, class: i === k ? "lc" : "lk" }, g); txt(g, 212, 35 + i * 34, nm, "s", "end"); txt(g, 226 + w, 35 + i * 34, `${bp} °C`, "s"); });
      const [nm, fg, bp, sol] = C[k];
      read.textContent = `${nm}: 작용기 ${fg}, 끓는점 ${bp} °C, 물에 ${sol}`;
    }, (key, v) => C[v][0].split(" ")[0]);
  });

  // 3-2 에스터화 평형: 아세트산 1 mol, 에탄올 r mol, K = 4
  Q.def("rxn-ester", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const yieldOf = (r) => { const a = 3, b = -4 * (1 + r), c = 4 * r; return (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a); };
    Q.bind(fig, ({ r }) => {
      clear(g);
      const F = frame(g, 0, 5, 0, 1, [0.5, 0.25]); ticks(g, F, [0, 1, 2, 3, 4, 5], [0, 0.5, 1]);
      txt(g, 490, 200, "에탄올 / 아세트산 (몰비)", "s", "end"); txt(g, 66, 26, "에스터 수득률", "s");
      Q.plot(g, F, yieldOf, "b", 0.05, 5, 200);
      const x = yieldOf(r); Q.dot(g, F.x(r), F.y(x), "fd", 5);
      read.textContent = `아세트산 1 mol + 에탄올 ${num(r, 1)} mol (K = 4): 평형에서 아세트산 에틸 ${num(x, 2)} mol, 아세트산 기준 수득률 ${num(x * 100, 0)}%`;
    });
  });

  // 3-3 폴리에틸렌의 중합도: 10^ln
  Q.def("rxn-poly", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ln }) => {
      clear(g);
      const n = Math.round(10 ** ln), M = 28 * n, L = n * 2 * 0.126; // nm (탄소-탄소 사슬 방향 길이)
      const w = Math.min(440, 40 + ln * 100);
      let d = `M40 100`; const seg = Math.max(4, Math.min(80, n)); for (let i = 1; i <= seg; i++) d += ` L${40 + w * i / seg} ${100 + (i % 2 ? -8 : 8)}`;
      el("path", { d, class: "b" }, g);
      txt(g, 40, 150, `중합도 ${n.toLocaleString("ko-KR")}, 분자량 약 ${M.toLocaleString("ko-KR")}, 사슬 길이 약 ${num(L, L > 100 ? 0 : 1)} nm`, "s");
      const st = n < 30 ? "기름이나 왁스처럼 무르다" : n < 1000 ? "파라핀처럼 부서지기 쉬운 고체" : "질기고 늘어나는 플라스틱 (비닐봉지, 용기)";
      read.textContent = `에틸렌 ${n.toLocaleString("ko-KR")}개를 이은 폴리에틸렌: ${st}`;
    });
  });

  // 3-4 하버 공정: 온도 T (°C), 압력 P (atm), N2:H2 = 1:3, 평형 암모니아 몰 분율 (어림)
  Q.def("rxn-haber", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const yNH3 = (Tc, P) => {
      const T = Tc + 273, Kp = Math.exp(-(-92200 + T * 198.7) / (8.314 * T));
      const f = (x) => { const tot = 4 - 2 * x, yn = 2 * x / tot, y1 = (1 - x) / tot, y3 = (3 - 3 * x) / tot; return yn * yn / (y1 * y3 ** 3 * P * P) - Kp; };
      let lo = 1e-9, hi = 1 - 1e-9; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
      const x = (lo + hi) / 2; return 2 * x / (4 - 2 * x);
    };
    Q.bind(fig, ({ T, P }) => {
      clear(g);
      const F = frame(g, 200, 600, 0, 100, [50, 20]); ticks(g, F, [200, 300, 400, 500, 600], [0, 20, 40, 60, 80, 100]);
      txt(g, 490, 200, "온도 (°C)", "s", "end"); txt(g, 66, 26, "평형 암모니아 (%)", "s");
      for (const p of [50, 100, 200, 400]) if (p !== P) Q.plot(g, F, (t) => 100 * yNH3(t, p), "gd", 200, 600, 80);
      Q.plot(g, F, (t) => 100 * yNH3(t, P), "b", 200, 600, 80);
      const y = 100 * yNH3(T, P); Q.dot(g, F.x(T), F.y(y), "fd", 5);
      read.textContent = `${T} °C, ${P} atm: 평형 암모니아 약 ${num(y, 0)}% (어림 계산). 온도가 낮고 압력이 높을수록 많지만, 낮은 온도에서는 반응이 너무 느리다`;
    });
  });
})();
