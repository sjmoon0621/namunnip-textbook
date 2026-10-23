/* 물질과 에너지 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val) => { el("rect", { x: 150, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, 142, y + 16, label, "s", "end"); txt(g, 156 + Math.max(1, w), y + 16, val, "s"); };
  const R = 0.08206; // L·atm/(mol·K)

  // 1-1 에어백: 부피 V (L), 온도 T (K), 압력 1.2 atm
  Q.def("mat-airbag", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ V, T }) => {
      clear(g);
      const P = 1.2, n = P * V / (R * T), mN = n * 2 / 3 * 65;
      el("circle", { cx: 120, cy: 105, r: 20 + V * 1.0, class: "lb" }, g); txt(g, 120, 110, `${V} L`, "s", "middle");
      bar(g, 50, n * 80, "lc", "질소 기체", `${num(n, 2)} mol`);
      bar(g, 90, mN * 1.5, "ld", "아자이드화 나트륨", `${num(mN, 0)} g`);
      txt(g, 150, 160, `PV = nRT, P = 1.2 atm, T = ${T} K`, "s");
      read.textContent = `${V} L 에어백을 ${T} K, 1.2 atm으로 채우려면 N₂ ${num(n, 2)} mol, 2NaN₃ → 2Na + 3N₂에서 NaN₃ 약 ${num(mN, 0)} g`;
    });
  });

  // 1-2 잠수 깊이 d (m)에서 공기의 부분 압력
  Q.def("mat-dive", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const P = 1 + d / 10, pO = 0.21 * P, pN = 0.78 * P, s = 50;
      bar(g, 30, P * s, "lk", "전체 압력", `${num(P, 1)} atm`);
      bar(g, 70, pN * s, "lb", "질소", `${num(pN, 2)} atm`);
      bar(g, 110, pO * s, pO > 1.4 ? "ld" : "lc", "산소", `${num(pO, 2)} atm`);
      const lx = 150 + 1.4 * s; Q.line(g, lx, 100, lx, 140, "d"); txt(g, lx, 155, "산소 한계 1.4 atm", "s td", "middle");
      read.textContent = `깊이 ${d} m: 전체 ${num(P, 1)} atm × 몰 분율 → 산소 ${num(pO, 2)} atm, 질소 ${num(pN, 2)} atm` + (pO > 1.4 ? " (산소 중독 위험)" : "");
    });
  });

  // 1-3 알케인의 끓는점: 탄소 수 n
  Q.def("mat-alkane", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const BP = [-162, -89, -42, -0.5, 36, 69, 98, 126], NM = ["메테인", "에테인", "프로페인", "뷰테인", "펜테인", "헥세인", "헵테인", "옥테인"];
    Q.bind(fig, ({ n }) => {
      clear(g);
      const F = frame(g, 0, 9, -200, 150, [1, 50]); ticks(g, F, [1, 2, 3, 4, 5, 6, 7, 8], [-200, -100, 0, 100]);
      txt(g, 490, 200, "탄소 수", "s", "end"); txt(g, 66, 26, "끓는점 (°C)", "s");
      Q.line(g, F.x(0), F.y(25), F.x(9), F.y(25), "gd"); txt(g, F.x(9), F.y(25) - 4, "실온 25 °C", "s", "end");
      BP.forEach((b, i) => Q.dot(g, F.x(i + 1), F.y(b), i + 1 === n ? "fd" : "fb", i + 1 === n ? 6 : 4));
      const mm = 12 * n + (2 * n + 2);
      read.textContent = `${NM[n - 1]} C${n}H${2 * n + 2} (분자량 ${mm}): 끓는점 ${BP[n - 1]} °C, 실온에서 ${BP[n - 1] < 25 ? "기체" : "액체"}. 분자가 클수록 분산력이 커서 끓는점이 높다`;
    });
  });

  // 1-4 고체의 종류: 0 염화 나트륨, 1 얼음, 2 다이아몬드, 3 구리
  Q.def("mat-solids", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const S = [["염화 나트륨", 801, "이온 결정", "단단하지만 잘 부서지고, 녹이거나 물에 녹이면 전기가 통한다"], ["얼음", 0, "분자 결정", "녹는점이 낮고 무르며 전기가 통하지 않는다"], ["다이아몬드", 3550, "공유 결정", "매우 단단하고 녹는점이 매우 높으며 전기가 통하지 않는다"], ["구리", 1085, "금속 결정", "펴지고 늘어나며 고체 상태에서 전기가 잘 통한다"]];
    Q.bind(fig, ({ k }) => {
      clear(g);
      S.forEach(([nm, mp], i) => bar(g, 25 + i * 40, (mp + 50) * 0.08, i === k ? "lc" : "lk", nm, `${mp} °C`));
      const [nm, mp, kind, prop] = S[k];
      read.textContent = `${nm} (${kind}): 녹는점 ${mp} °C, ${prop}`;
    }, (key, v) => key === "k" ? S[v][0] : `${v}`);
  });

  // 2-1 물의 밀도와 온도 (0~10 °C)
  Q.def("mat-density", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T }) => {
      clear(g);
      const rho = (t) => 999.97 - 0.0078 * (t - 4) ** 2;
      const F = frame(g, 0, 10, 999.6, 1000.05, [1, 0.1]); ticks(g, F, [0, 2, 4, 6, 8, 10], [999.6, 999.8, 1000]);
      txt(g, 490, 200, "온도 (°C)", "s", "end"); txt(g, 66, 26, "밀도 (kg/m³)", "s");
      Q.plot(g, F, rho, "b", 0, 10, 200);
      Q.dot(g, F.x(T), F.y(rho(T)), "fd", 5);
      read.textContent = `${T} °C 물의 밀도 약 ${num(rho(T), 2)} kg/m³ (4 °C에서 가장 크다). 0 °C 얼음은 약 917 kg/m³로 물보다 9% 가볍다`;
    });
  });

  // 2-2 총괄성: 몰랄 농도 m, 용질 (0 설탕 i=1, 1 염화 나트륨 i=2, 2 염화 칼슘 i=3)
  Q.def("mat-colli", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const SO = [["설탕", 1], ["염화 나트륨", 2], ["염화 칼슘", 3]];
    Q.bind(fig, ({ m, s }) => {
      clear(g);
      const [nm, i] = SO[s], dTb = 0.52 * i * m, dTf = 1.86 * i * m;
      bar(g, 40, dTb * 12, "ld", "끓는점 오름", `+${num(dTb, 2)} °C → ${num(100 + dTb, 2)} °C`);
      bar(g, 90, dTf * 12, "lb", "어는점 내림", `−${num(dTf, 2)} °C → ${num(-dTf, 2)} °C`);
      txt(g, 150, 160, `녹은 입자 농도 i × m = ${num(i * m, 2)} mol/kg`, "s");
      read.textContent = `${nm} ${num(m, 1)} mol/kg (입자 ${i}개로 나뉨): ΔTb = 0.52 × ${i} × ${num(m, 1)} = ${num(dTb, 2)} °C, ΔTf = 1.86 × ${i} × ${num(m, 1)} = ${num(dTf, 2)} °C`;
    }, (k, v) => k === "s" ? SO[v][0] : `${v}`);
  });

  // 2-3 삼투압: 염화 나트륨 몰 농도 M (mol/L), 25 °C
  Q.def("mat-osmo", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ M }) => {
      clear(g);
      const pi = 2 * M * R * 298;
      const F = frame(g, 0, 1.2, 0, 60, [0.2, 10]); ticks(g, F, [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2], [0, 20, 40, 60]);
      txt(g, 490, 200, "염화 나트륨 농도 (mol/L)", "s", "end"); txt(g, 66, 26, "삼투압 (atm)", "s");
      Q.plot(g, F, (x) => 2 * x * R * 298, "b", 0, 1.2, 50);
      for (const [x, lb] of [[0.15, "링거액"], [0.6, "바닷물"]]) { Q.dot(g, F.x(x), F.y(2 * x * R * 298), "fk", 3); txt(g, F.x(x) + 6, F.y(2 * x * R * 298) - 6, lb, "s"); }
      Q.dot(g, F.x(M), F.y(pi), "fd", 5);
      read.textContent = `${num(M, 2)} M NaCl: π = iMRT = 2 × ${num(M, 2)} × 0.082 × 298 = ${num(pi, 1)} atm. 역삼투로 담수를 얻으려면 이보다 센 압력이 필요하다`;
    });
  });

  // 3-1 메테인 연소: 메테인 n mol, ΔH = −890 kJ/mol
  Q.def("mat-enth", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const q = 890 * n, h = 20 + n * 30;
      Q.line(g, 60, 40, 200, 40, "k"); txt(g, 130, 32, "CH₄ + 2O₂", "s", "middle");
      Q.line(g, 260, 40 + h, 400, 40 + h, "k"); txt(g, 330, 60 + h, "CO₂ + 2H₂O", "s", "middle");
      Q.arrow(g, 230, 40, 230, 40 + h, "d", "fd"); txt(g, 420, 50 + h / 2, `ΔH = −${num(q, 0)} kJ`, "s td");
      const water = q * 1000 / (4.18 * 80) / 1000;
      read.textContent = `메테인 ${num(n, 1)} mol (${num(16 * n, 0)} g) 연소: 열 ${num(q, 0)} kJ 방출, 20 °C 물 약 ${num(water, 1)} kg을 끓는점까지 데울 양`;
    });
  });

  // 3-2 헤스 법칙: 경로 0 직접, 1 일산화 탄소를 거쳐
  Q.def("mat-hess", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const y = (H) => 30 + (-H) * 0.42;
      Q.line(g, 60, y(0), 180, y(0), "k"); txt(g, 120, y(0) - 6, "C + O₂", "s", "middle");
      Q.line(g, 220, y(-110.5), 340, y(-110.5), "k"); txt(g, 280, y(-110.5) - 6, "CO + ½O₂", "s", "middle");
      Q.line(g, 380, y(-393.5), 500, y(-393.5), "k"); txt(g, 440, y(-393.5) + 16, "CO₂", "s", "middle");
      if (p === 0) { Q.arrow(g, 180, y(0), 380, y(-393.5), "d", "fd"); txt(g, 250, 150, "−393.5 kJ", "s td"); }
      else { Q.arrow(g, 180, y(0), 220, y(-110.5), "c", "fc"); Q.arrow(g, 340, y(-110.5), 380, y(-393.5), "b", "fb"); txt(g, 150, 100, "−110.5", "s tc"); txt(g, 330, 140, "−283.0", "s tb"); }
      read.textContent = p === 0 ? "직접 태우면 ΔH = −393.5 kJ" : "CO를 거치면 −110.5 + (−283.0) = −393.5 kJ, 직접 경로와 같다";
    }, (k, v) => k === "p" ? (v ? "CO를 거쳐" : "직접") : `${v}`);
  });

  // 3-3 깁스 에너지: ΔH (kJ/mol), ΔS (J/(mol·K))
  Q.def("mat-gibbs", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ H, S }) => {
      clear(g);
      const G = (t) => H - t * S / 1000;
      const F = frame(g, 0, 600, -20, 20, [100, 5]); ticks(g, F, [0, 100, 200, 300, 400, 500, 600], [-20, -10, 0, 10, 20]);
      txt(g, 490, 200, "온도 (K)", "s", "end"); txt(g, 66, 26, "ΔG (kJ/mol)", "s");
      Q.line(g, F.x(0), F.y(0), F.x(600), F.y(0), "k");
      Q.plot(g, F, G, "b", 0, 600, 100);
      const T0 = S !== 0 ? H * 1000 / S : NaN;
      if (T0 > 0 && T0 < 600) Q.dot(g, F.x(T0), F.y(0), "fd", 5);
      let msg;
      if (H < 0 && S > 0) msg = "모든 온도에서 자발적";
      else if (H > 0 && S < 0) msg = "모든 온도에서 비자발적";
      else if (H > 0) msg = `${num(T0, 0)} K보다 높은 온도에서 자발적`;
      else msg = `${num(T0, 0)} K보다 낮은 온도에서 자발적`;
      read.textContent = `ΔH = ${H} kJ/mol, ΔS = ${S} J/(mol·K): ΔG = ΔH − TΔS, ${msg}`;
    });
  });

  // 4-1 속도 법칙: 차수 m, 농도 배수 c
  Q.def("mat-order", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m, c }) => {
      clear(g);
      const F = frame(g, 0, 4, 0, 16, [0.5, 2]); ticks(g, F, [0, 1, 2, 3, 4], [0, 4, 8, 12, 16]);
      txt(g, 490, 200, "농도 (처음의 몇 배)", "s", "end"); txt(g, 66, 26, "반응 속도 (처음의 몇 배)", "s");
      for (const k of [0, 1, 2]) Q.plot(g, F, (x) => x ** k, k === m ? "b" : "gd", 0, 4, 200);
      const r = c ** m; Q.dot(g, F.x(c), F.y(r), "fd", 5);
      read.textContent = `${m}차 반응 (v = k[A]^${m}): 농도 ${c}배 → 속도 ${num(r, 0)}배`;
    });
  });

  // 4-2 약물의 1차 소실: 반감기 h (시간), 복용량 D (mg)
  Q.def("mat-drug", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ h, D }) => {
      clear(g);
      const F = frame(g, 0, 36, 0, 1000, [6, 200]); ticks(g, F, [0, 6, 12, 18, 24, 30, 36], [0, 200, 400, 600, 800, 1000]);
      txt(g, 490, 200, "시간 (h)", "s", "end"); txt(g, 66, 26, "몸속 약 (mg)", "s");
      Q.line(g, F.x(0), F.y(50), F.x(36), F.y(50), "d"); txt(g, F.x(36), F.y(50) - 4, "효과 한계 50 mg", "s td", "end");
      Q.plot(g, F, (t) => D * 0.5 ** (t / h), "b", 0, 36, 300);
      if (D !== 500) Q.plot(g, F, (t) => 500 * 0.5 ** (t / h), "gd", 0, 36, 300);
      const tE = h * Math.log2(D / 50);
      read.textContent = `반감기 ${h} h, ${D} mg 복용: 50 mg 아래로 떨어지기까지 ${num(tE, 1)} h (반감기의 ${num(Math.log2(D / 50), 2)}배). 복용량을 2배로 해도 반감기 한 번만큼만 늘어난다`;
    });
  });

  const erfc = (x) => { const t = 1 / (1 + 0.3275911 * x); return t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x); };

  // 4-3 분자 에너지 분포와 활성화 에너지: 온도 T (K), 활성화 에너지 Ea (kJ/mol)
  Q.def("mat-ea", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T, Ea }) => {
      clear(g);
      const RT = 8.314e-3 * T, f = (E) => 2 / Math.sqrt(Math.PI) * RT ** -1.5 * Math.sqrt(E) * Math.exp(-E / RT);
      const F = frame(g, 0, 30, 0, 0.35, [5, 0.05]); ticks(g, F, [0, 5, 10, 15, 20, 25, 30], []);
      txt(g, 490, 200, "분자의 운동 에너지 (kJ/mol)", "s", "end"); txt(g, 66, 26, "분자의 비율", "s");
      let d = `M${F.x(Ea)} ${F.y(0)}`; for (let i = 0; i <= 100; i++) { const E = Ea + (30 - Ea) * i / 100; d += `L${F.x(E)} ${F.y(f(E))}`; } d += `L${F.x(30)} ${F.y(0)} Z`;
      el("path", { d, class: "lc" }, g);
      if (T !== 300) Q.plot(g, F, (E) => 2 / Math.sqrt(Math.PI) * (8.314e-3 * 300) ** -1.5 * Math.sqrt(E) * Math.exp(-E / (8.314e-3 * 300)), "gd", 0.01, 30, 300);
      Q.plot(g, F, f, "b", 0.01, 30, 300);
      Q.line(g, F.x(Ea), F.y(0), F.x(Ea), F.y(0.33), "d");
      const x = Ea / RT, frac = erfc(Math.sqrt(x)) + 2 * Math.sqrt(x / Math.PI) * Math.exp(-x);
      read.textContent = `${T} K, 활성화 에너지 ${Ea} kJ/mol: 문턱을 넘는 분자 ${num(frac * 100, 2)}% (색칠한 넓이, 회색은 300 K)`;
    });
  });

  // 4-4 온도와 촉매: 온도 t (°C), 촉매 c (0 없음 Ea 50, 1 있음 Ea 30 kJ/mol)
  Q.def("mat-arr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t, c }) => {
      clear(g);
      const k = (tc, Ea) => Math.exp(-Ea * 1000 / 8.314 * (1 / (tc + 273) - 1 / 298));
      const lg = (tc, Ea) => Math.log10(k(tc, Ea)) + (Ea === 30 ? 20000 / (8.314 * 298) / Math.LN10 : 0);
      const F = frame(g, 0, 60, -1, 5, [10, 1]); ticks(g, F, [0, 10, 20, 30, 40, 50, 60], [-1, 0, 1, 2, 3, 4, 5]);
      txt(g, 490, 200, "온도 (°C)", "s", "end"); txt(g, 66, 26, "반응 속도 (25 °C 무촉매의 10의 몇 제곱 배)", "s");
      Q.plot(g, F, (x) => lg(x, 50), c ? "gd" : "b", 0, 60, 120);
      Q.plot(g, F, (x) => lg(x, 30), c ? "b" : "gd", 0, 60, 120);
      const Ea = c ? 30 : 50, v = lg(t, Ea); Q.dot(g, F.x(t), F.y(v), "fd", 5);
      read.textContent = `${t} °C, ${c ? "촉매 있음 (Ea 30 kJ/mol)" : "촉매 없음 (Ea 50 kJ/mol)"}: 25 °C 무촉매보다 ${num(10 ** v, v > 2 ? 0 : 2)}배 빠르다`;
    }, (k, v) => k === "c" ? (v ? "있음" : "없음") : `${v}`);
  });
})();
