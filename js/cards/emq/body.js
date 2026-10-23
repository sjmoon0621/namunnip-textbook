/* 전자기와 양자 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const sci = (v, d) => { if (v === 0) return "0"; const e = Math.floor(Math.log10(Math.abs(v))); return `${num(v / 10 ** e, d == null ? 2 : d)} × 10^${e}`; };

  // 1-1 점전하의 등전위면: Q = 1 nC, 10 V 간격, 거리 r (m)
  Q.def("emq-equip", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const k = 9e9, q = 1e-9, cx = 150, cy = 110, s = 300; // 1 m = 300 px 아님: 0.1 m = 30 px
      for (const V of [90, 80, 70, 60, 50, 40, 30, 20]) { const R = k * q / V; el("circle", { cx, cy, r: R * s, class: "gd" }, g); }
      Q.dot(g, cx, cy, "fd", 6);
      const px = cx + r * s; Q.dot(g, px, cy, "fb", 5);
      const V = k * q / r, E = k * q / (r * r);
      Q.arrow(g, px, cy, px + Math.min(120, E * 0.12), cy, "b", "fb");
      txt(g, 330, 60, `전위 ${num(V, 1)} V`, "s tb"); txt(g, 330, 85, `전기장 ${num(E, 0)} V/m`, "s tb");
      txt(g, 330, 160, "회색 원: 10 V 간격 등전위면", "s");
      read.textContent = `1 nC 점전하에서 ${num(r, 2)} m: 전위 kQ/r = ${num(V, 1)} V, 전기장 kQ/r² = ${num(E, 0)} V/m. 등전위면이 촘촘한 곳일수록 전기장이 세다`;
    });
  });

  // 1-2 유전 분극: 대전체에서 거리 d (cm), 분극 간격 0.2 cm
  Q.def("emq-polar", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const s = 0.2, near = 1 / (d * d), far = 1 / ((d + s) ** 2), net = near - far, sc = 140 / near;
      el("circle", { cx: 50, cy: 70, r: 22, class: "ld" }, g); txt(g, 50, 75, "+", "s", "middle");
      const bx = 80 + d * 25; el("rect", { x: bx, y: 50, width: 40, height: 40, class: "lk" }, g);
      txt(g, bx + 6, 75, "−", "s"); txt(g, bx + 28, 75, "+", "s");
      el("rect", { x: 80, y: 120, width: near * sc, height: 18, class: "lb" }, g); txt(g, 75, 134, "끌림", "s", "end");
      el("rect", { x: 80, y: 145, width: far * sc, height: 18, class: "ld" }, g); txt(g, 75, 159, "밀림", "s", "end");
      el("rect", { x: 80, y: 175, width: Math.max(1, net * sc), height: 18, class: "la" }, g); txt(g, 75, 189, "알짜", "s", "end");
      read.textContent = `거리 ${num(d, 1)} cm: 가까운 음전하가 받는 끌림이 먼 양전하가 받는 밀림보다 ${num(near / far, 2)}배 커서 알짜힘은 끌림 (끌림의 ${num(net / near * 100, 0)}%)`;
    });
  });

  // 1-3 직선 도선의 자기장: 전류 I (A), 거리 r (cm)
  Q.def("emq-wire", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ I, r }) => {
      clear(g);
      const F = frame(g, 0, 10, 0, 100, [1, 20]); ticks(g, F, [0, 2, 4, 6, 8, 10], [0, 20, 40, 60, 80, 100]);
      txt(g, 490, 200, "거리 (cm)", "s", "end"); txt(g, 66, 26, "자기장 (μT)", "s");
      const B = (x) => 2e-7 * I / (x / 100) * 1e6;
      Q.plot(g, F, B, "b", 0.2, 10, 300);
      Q.dot(g, F.x(r), F.y(Math.min(100, B(r))), "fd", 5);
      read.textContent = `전류 ${I} A, 거리 ${num(r, 1)} cm: B = μ₀I/(2πr) = ${num(B(r), 1)} μT (지구 자기장 약 50 μT). 거리가 2배면 자기장은 절반`;
    });
  });

  // 1-4 질량 분석기: 자기장 B (T), 질량수 A, 전하 +e, 가속 전압 1000 V
  Q.def("emq-mass", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ B, A }) => {
      clear(g);
      const e = 1.6e-19, u = 1.66e-27, m = A * u, V = 1000, v = Math.sqrt(2 * e * V / m), R = m * v / (e * B);
      const x0 = 60, y0 = 190, s = 1500; // 1 cm = 15 px
      el("rect", { x: 40, y: 20, width: 460, height: 175, class: "lk" }, g);
      Q.line(g, 20, y0, 500, y0, "ax");
      const Rp = Math.min(R * s, 170);
      el("path", { d: `M${x0} ${y0} A ${Rp} ${Rp} 0 0 1 ${x0 + 2 * Rp} ${y0}`, class: "b" }, g);
      for (const a of [12, 16, 40]) { const Ra = Math.sqrt(2 * a * u * V / e) / B * s; if (Ra < 175) { Q.line(g, x0 + 2 * Ra, y0 - 6, x0 + 2 * Ra, y0 + 6, "d"); txt(g, x0 + 2 * Ra, y0 + 20, `${a}`, "s", "middle"); } }
      Q.dot(g, x0, y0, "fd", 4);
      read.textContent = `질량수 ${A}, B = ${num(B, 2)} T: 속력 ${sci(v)} m/s, 반지름 r = mv/(qB) = ${num(R * 100, 1)} cm (눈금은 질량수 12, 16, 40의 도착점)`;
    });
  });

  // 1-5 변압기: 1차 220 V, 1차 감은 수 1000, 2차 감은 수 N2, 2차 부하 저항 10 Ω
  Q.def("emq-xfmr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ N2 }) => {
      clear(g);
      const V1 = 220, N1 = 1000, V2 = V1 * N2 / N1, I2 = V2 / 10, P = V2 * I2, I1 = P / V1, s = 0.6;
      el("rect", { x: 140, y: 30, width: V1 * s, height: 26, class: "ld" }, g); txt(g, 132, 48, "1차 전압", "s", "end"); txt(g, 146 + V1 * s, 48, `${V1} V`, "s");
      el("rect", { x: 140, y: 64, width: Math.min(300, V2 * s), height: 26, class: "lb" }, g); txt(g, 132, 82, "2차 전압", "s", "end"); txt(g, 146 + Math.min(300, V2 * s), 82, `${num(V2, 1)} V`, "s");
      el("rect", { x: 140, y: 120, width: Math.min(300, I1 * 20), height: 26, class: "ld" }, g); txt(g, 132, 138, "1차 전류", "s", "end"); txt(g, 146 + Math.min(300, I1 * 20), 138, `${num(I1, 2)} A`, "s");
      el("rect", { x: 140, y: 154, width: Math.min(300, I2 * 20), height: 26, class: "lb" }, g); txt(g, 132, 172, "2차 전류", "s", "end"); txt(g, 146 + Math.min(300, I2 * 20), 172, `${num(I2, 2)} A`, "s");
      read.textContent = `감은 수 1000 : ${N2} → 2차 전압 ${num(V2, 1)} V. 10 Ω 부하에서 전력 ${num(P, 1)} W, 1차 전류 ${num(I1, 2)} A (V₁I₁ = V₂I₂)`;
    });
  });

  // 1-6 RC 충전: 전원 10 V, 저항 R (kΩ), 전기 용량 C (μF)
  Q.def("emq-rc", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ R, C }) => {
      clear(g);
      const tau = R * C / 1000; // s
      const F = frame(g, 0, 5, 0, 10, [0.5, 2]); ticks(g, F, [0, 1, 2, 3, 4, 5], [0, 2, 4, 6, 8, 10]);
      txt(g, 490, 200, "시간 (s)", "s", "end"); txt(g, 66, 26, "축전기 전압 (V)", "s");
      Q.plot(g, F, (t) => 10 * (1 - Math.exp(-t / tau)), "b", 0, 5, 300);
      Q.plot(g, F, (t) => 10 * Math.exp(-t / tau), "c", 0, 5, 300);
      if (tau <= 5) { Q.line(g, F.x(tau), F.y(0), F.x(tau), F.y(6.32), "gd"); Q.dot(g, F.x(tau), F.y(6.32), "fd", 4); }
      read.textContent = `R = ${R} kΩ, C = ${C} μF: 시간 상수 RC = ${num(tau, 2)} s, 이때 축전기 전압은 63%인 6.3 V (파랑 충전, 주황 저항에 걸린 전압)`;
    });
  });

  // 1-7 다이오드 전류-전압 곡선: 포화 전류 1e-12 A, 열전압 0.026 V
  Q.def("emq-diode", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ V }) => {
      clear(g);
      const I = (v) => 1e-12 * (Math.exp(v / 0.026) - 1) * 1000; // mA
      const F = frame(g, -1, 1, -5, 50, [0.25, 10]); ticks(g, F, [-1, -0.5, 0, 0.5, 1], [0, 10, 20, 30, 40, 50]);
      txt(g, 490, 200, "전압 (V)", "s", "end"); txt(g, 66, 26, "전류 (mA)", "s");
      Q.plot(g, F, I, "b", -1, 1, 400);
      const iv = I(V); if (iv <= 50) Q.dot(g, F.x(V), F.y(Math.max(-5, iv)), "fd", 5);
      read.textContent = `전압 ${num(V, 2)} V: 전류 ${iv > 1e-3 ? num(iv, 2) + " mA" : iv > -1e-9 ? sci(iv / 1000) + " A" : "거의 0"}` + (V < 0 ? " (역방향, 거의 흐르지 않음)" : V < 0.55 ? " (순방향이지만 문턱 전압 아래)" : " (순방향, 전류가 급격히 커짐)");
    });
  });

  // 2-1 다중 슬릿 무늬: 슬릿 수 N, 화면 위치 각 (상대 위상)
  Q.def("emq-grating", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ N }) => {
      clear(g);
      const F = frame(g, -2.2, 2.2, 0, 1, [0.5, 0.25]); ticks(g, F, [-2, -1, 0, 1, 2], [0, 1]);
      txt(g, 490, 200, "화면 위치 (밝은 무늬 간격 단위)", "s", "end"); txt(g, 66, 26, "상대 밝기", "s");
      const I = (x) => { const ph = Math.PI * x; const s = Math.sin(ph); if (Math.abs(s) < 1e-6) return 1; return (Math.sin(N * ph) / (N * s)) ** 2; };
      Q.plot(g, F, I, "b", -2.2, 2.2, 1200);
      // 반치폭 어림: 첫 어두운 점까지 1/N
      read.textContent = `슬릿 ${N}개: 밝은 무늬 위치는 그대로, 밝은 무늬 폭은 1/${N}로 좁아지고 사이에 작은 무늬 ${N - 2}개가 생긴다`;
    });
  });

  // 2-2 볼록 렌즈 상: 초점 거리 10 cm, 물체 거리 a (cm)
  Q.def("emq-lens", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const f = 10, b = a * f / (a - f), m = -b / a, s = 4, cx = 260, cy = 110, h = 5;
      Q.line(g, 20, cy, 500, cy, "ax"); Q.line(g, cx, 20, cx, 200, "k");
      for (const x of [-f, f]) Q.dot(g, cx + x * s, cy, "fk", 3);
      const ox = cx - a * s, oy = cy - h * s; Q.arrow(g, ox, cy, ox, oy, "c", "fc");
      if (Math.abs(a - f) > 0.01) {
        const ix = cx + b * s, iy = cy - m * h * s;
        Q.line(g, ox, oy, cx, oy, "gd"); Q.line(g, cx, oy, ix, iy, "gd"); Q.line(g, ox, oy, ix, iy, "gd");
        if (Math.abs(ix) < 2000) Q.arrow(g, ix, cy, ix, iy, b > 0 ? "b" : "d", b > 0 ? "fb" : "fd");
        read.textContent = `물체 거리 ${a} cm (f = 10 cm): 상 거리 ab/(a − f) = ${num(b, 1)} cm, 배율 ${num(m, 2)} → ` + (b > 0 ? `거꾸로 선 실상, ${Math.abs(Math.abs(m) - 1) < 0.01 ? "같은 크기" : Math.abs(m) > 1 ? "확대" : "축소"}` : "바로 선 허상, 확대 (돋보기)");
      } else read.textContent = "물체가 초점에 있으면 굴절한 빛이 나란하게 나가 상이 생기지 않는다";
    });
  });

  // 2-3 말뤼스 법칙: 두 편광판 사이 각 θ
  Q.def("emq-malus", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ th }) => {
      clear(g);
      const F = frame(g, 0, 180, 0, 1, [30, 0.25]); ticks(g, F, [0, 30, 60, 90, 120, 150, 180], [0, 0.5, 1]);
      txt(g, 490, 200, "두 편광판 사이 각 (°)", "s", "end"); txt(g, 66, 26, "통과한 빛의 세기 비", "s");
      Q.plot(g, F, (t) => Math.cos(t * Math.PI / 180) ** 2, "b", 0, 180, 300);
      const I = Math.cos(th * Math.PI / 180) ** 2; Q.dot(g, F.x(th), F.y(I), "fd", 5);
      read.textContent = `θ = ${th}°: 첫 편광판을 지난 빛의 cos²θ = ${num(I * 100, 1)}%가 두 번째 편광판을 통과한다`;
    });
  });

  // 2-4 광전 효과: 빛의 진동수 f (×10^14 Hz), 금속 (0 나트륨 2.3 eV, 1 아연 4.3 eV)
  Q.def("emq-photo", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const MET = [["나트륨", 2.3], ["아연", 4.3]];
    Q.bind(fig, ({ f, mt }) => {
      clear(g);
      const h = 4.14e-15, F = frame(g, 0, 20, 0, 4, [2, 1]); ticks(g, F, [0, 4, 8, 12, 16, 20], [0, 1, 2, 3, 4]);
      txt(g, 490, 200, "진동수 (×10¹⁴ Hz)", "s", "end"); txt(g, 66, 26, "최대 운동 에너지 (eV)", "s");
      MET.forEach(([n, W], i) => { Q.plot(g, F, (x) => { const k = h * x * 1e14 - W; return k >= 0 ? k : NaN; }, i === mt ? "b" : "gd", 0, 20, 300); });
      const [nm, W] = MET[mt], E = h * f * 1e14, K = E - W;
      Q.dot(g, F.x(f), F.y(Math.max(0, Math.min(4, K))), K > 0 ? "fd" : "fk", 5);
      read.textContent = `${nm}(일함수 ${W} eV)에 진동수 ${f}×10¹⁴ Hz 빛 (광자 ${num(E, 2)} eV): ` + (K > 0 ? `전자가 최대 ${num(K, 2)} eV로 튀어나온다` : `광자 에너지가 일함수보다 작아 아무리 세게 비춰도 전자가 나오지 않는다`);
    }, (k, v) => k === "mt" ? MET[v][0] : `${v}`);
  });

  // 2-5 레이저 이득: 위 준위에 있는 원자 비율 p (%)
  Q.def("emq-laser", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const up = p, lo = 100 - p, net = up - lo;
      el("rect", { x: 140, y: 40, width: up * 3, height: 30, class: "lc" }, g); txt(g, 132, 60, "위 준위", "s", "end"); txt(g, 146 + up * 3, 60, `${up}%`, "s");
      el("rect", { x: 140, y: 90, width: lo * 3, height: 30, class: "lb" }, g); txt(g, 132, 110, "아래 준위", "s", "end"); txt(g, 146 + lo * 3, 110, `${lo}%`, "s");
      txt(g, 140, 160, net > 0 ? `유도 방출이 흡수보다 많다: 빛이 ${net}%p 비율로 증폭` : net < 0 ? `흡수가 유도 방출보다 많다: 빛이 약해진다` : "흡수와 유도 방출이 같다: 증폭 없음", net > 0 ? "s tc" : "s tb");
      read.textContent = `위 준위 ${up}%, 아래 준위 ${lo}%: ` + (net > 0 ? "밀도 반전 상태라 지나가는 빛이 증폭된다" : "밀도 반전이 아니라 빛이 증폭되지 않는다");
    });
  });

  // 3-1 전자 하나씩 쌓이는 간섭무늬: 전자 수 n
  Q.def("emq-dots", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      el("rect", { x: 40, y: 20, width: 440, height: 110, class: "lk" }, g);
      let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const P = (x) => Math.cos(3 * Math.PI * x) ** 2 * Math.exp(-x * x * 1.2); // x ∈ [-2, 2]
      const hist = new Array(44).fill(0);
      let k = 0;
      while (k < n) { const x = -2 + 4 * r(); if (r() < P(x)) { const px = 40 + (x + 2) / 4 * 440; Q.dot(g, px, 24 + r() * 102, "fb", 1.4); hist[Math.min(43, Math.floor((x + 2) / 4 * 44))]++; k++; } }
      const mx = Math.max(...hist);
      hist.forEach((c, i) => el("rect", { x: 40 + i * 10, y: 205 - c / mx * 65, width: 9, height: c / mx * 65, class: "la" }, g));
      read.textContent = `전자 ${n}개: ` + (n < 100 ? "점이 아무 데나 찍히는 것처럼 보인다" : n < 1000 ? "점이 몰리는 곳이 줄무늬처럼 드러나기 시작한다" : "밝고 어두운 간섭무늬가 뚜렷하다 (아래 막대는 위치별 개수)");
    });
  });

  // 3-2 큐비트 측정: 상태 각 θ (°), 측정 횟수 100
  Q.def("emq-qubit", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ th, n }) => {
      clear(g);
      const p0 = Math.cos(th * Math.PI / 360) ** 2;
      let s = 5 + th; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      let c0 = 0; for (let i = 0; i < n; i++) if (r() < p0) c0++;
      const cx = 110, cy = 110, R = 80, a = th * Math.PI / 180;
      el("circle", { cx, cy, r: R, class: "gd" }, g);
      txt(g, cx, cy - R - 6, "0", "s", "middle"); txt(g, cx, cy + R + 16, "1", "s", "middle");
      Q.arrow(g, cx, cy, cx + R * Math.sin(a), cy - R * Math.cos(a), "b", "fb");
      el("rect", { x: 260, y: 200 - c0 / n * 170, width: 60, height: c0 / n * 170, class: "lb" }, g); txt(g, 290, 216, `0: ${c0}회`, "s", "middle");
      el("rect", { x: 360, y: 200 - (n - c0) / n * 170, width: 60, height: (n - c0) / n * 170, class: "lc" }, g); txt(g, 390, 216, `1: ${n - c0}회`, "s", "middle");
      read.textContent = `θ = ${th}°: 0이 나올 확률 cos²(θ/2) = ${num(p0 * 100, 1)}%. ${n}번 측정하니 0이 ${c0}번, 1이 ${n - c0}번 (한 번의 측정 결과는 0 아니면 1)`;
    });
  });

  // 3-3 터널 효과: 장벽 두께 d (nm), 장벽 높이와 에너지의 차 U − E (eV), 전자
  Q.def("emq-tunnel", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d, u }) => {
      clear(g);
      const kap = Math.sqrt(2 * 9.11e-31 * u * 1.6e-19) / 1.055e-34 * 1e-9; // 1/nm
      const T = Math.exp(-2 * kap * d);
      const F = frame(g, 0, 1.5, -12, 0, [0.25, 2]); ticks(g, F, [0, 0.5, 1, 1.5], [-12, -8, -4, 0]);
      txt(g, 490, 200, "장벽 두께 (nm)", "s", "end"); txt(g, 66, 26, "통과 확률 (10의 거듭제곱)", "s");
      Q.plot(g, F, (x) => -2 * kap * x / Math.LN10, "b", 0, 1.5, 200);
      Q.dot(g, F.x(d), F.y(Math.max(-12, Math.log10(T))), "fd", 5);
      read.textContent = `U − E = ${num(u, 1)} eV, 두께 ${num(d, 2)} nm: 통과 확률 약 e^(−2κd) = ${T > 1e-3 ? num(T, 4) : sci(T)} (두께가 조금만 늘어도 급격히 작아진다)`;
    });
  });

  // 3-4 수소 원자 발머 계열: 처음 준위 n → 2
  Q.def("emq-hydrogen", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const E = (k) => -13.6 / (k * k), y = (e) => 200 + e * 13;
      for (let k = 1; k <= 7; k++) { Q.line(g, 60, y(E(k)), 260, y(E(k)), k === 2 || k === n ? "k" : "gd"); if (k <= 4) txt(g, 54, y(E(k)) + 4, `n=${k}`, "s", "end"); }
      Q.arrow(g, 160, y(E(n)), 160, y(E(2)), "d", "fd");
      const dE = E(n) - E(2), lam = 1240 / dE;
      const col = lam > 620 ? "빨강" : lam > 480 ? "청록" : lam > 420 ? "파랑" : "보라";
      txt(g, 300, 60, `ΔE = ${num(dE, 2)} eV`, "s"); txt(g, 300, 85, `파장 ${num(lam, 0)} nm (${col})`, "s td");
      read.textContent = `n = ${n} → 2: 13.6(1/4 − 1/${n * n}) = ${num(dE, 2)} eV, 파장 1240/ΔE = ${num(lam, 0)} nm의 ${col}빛`;
    });
  });

  // 3-5 흑체 복사: 표면 온도 T (K)
  Q.def("emq-planck", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T }) => {
      clear(g);
      const B = (lnm, t) => { const l = lnm * 1e-9; return 1 / (l ** 5 * (Math.exp(0.0143877 / (l * t)) - 1)); };
      const pkB = (t) => B(2.898e6 / t, t);
      const F = frame(g, 100, 2000, 0, 1, [100, 0.25]); ticks(g, F, [100, 500, 1000, 1500, 2000], []);
      txt(g, 490, 200, "파장 (nm)", "s", "end"); txt(g, 66, 26, "상대 세기", "s");
      el("rect", { x: F.x(380), y: 15, width: F.x(750) - F.x(380), height: 190, class: "la" }, g);
      for (const t of [4000, 6000, 8000]) if (t !== T) Q.plot(g, F, (l) => B(l, t) / pkB(t), "gd", 100, 2000, 300);
      Q.plot(g, F, (l) => B(l, T) / pkB(T), "b", 100, 2000, 300);
      const pk = 2.898e6 / T; Q.dot(g, F.x(Math.min(2000, pk)), F.y(1), "fd", 5);
      read.textContent = `${T} K: 가장 센 파장 2.898×10⁶ / T = ${num(pk, 0)} nm` + (pk < 380 ? " (자외선 쪽, 푸르게 보인다)" : pk < 750 ? " (가시광선 안)" : " (적외선 쪽, 붉게 보인다)") + `. 같은 넓이에서 내는 에너지는 6000 K의 ${num((T / 6000) ** 4, 2)}배 (곡선은 각자 최댓값을 1로 맞춤)`;
    });
  });
})();
