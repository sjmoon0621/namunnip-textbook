/* 물리학 실험 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st) => { const F = Q.frame(x0, x1, y0, y1, 60, 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const axl = (g, a, b) => { txt(g, 490, 200, a, "s", "end"); txt(g, 66, 26, b, "s"); };
  const path = (g, pts, cls) => { let d = ""; pts.forEach(([x, y], i) => { d += (i ? "L" : "M") + x + " " + y; }); return el("path", { d, class: cls }, g); };
  const G = 9.8, D = Math.PI / 180;
  const rng = (s) => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

  // 1-1 원기둥의 밀도와 오차의 전파: 지름을 재는 도구의 최소 눈금 dd (mm), 높이 오차 dh (mm)
  Q.def("lp-prec", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dd, dh }) => {
      clear(g);
      const d = 10, h = 50, m = 10.6, dm = 0.01, rm = dm / m, rd = 2 * dd / d, rh = dh / h, rt = rm + rd + rh;
      bar(g, 30, rm * 3000, "lk", "질량 (±0.01 g)", `${num(rm * 100, 2)}%`);
      bar(g, 70, rd * 3000, "lc", "지름 × 2", `${num(rd * 100, 2)}%`);
      bar(g, 110, rh * 3000, "lb", "높이", `${num(rh * 100, 2)}%`);
      bar(g, 150, rt * 3000, "ld", "밀도 ρ = 4m/(πd²h)", `${num(rt * 100, 2)}%`);
      read.textContent = `지름 10 mm를 ±${dd} mm, 높이 50 mm를 ±${dh} mm로 재면 밀도의 상대 오차 약 ${num(rt * 100, 2)}%. 지름은 제곱으로 들어가 오차가 두 배로 번지므로, 짧은 지름을 더 정밀한 도구로 재야 한다`;
    });
  });

  // 1-2 최소 제곱법: 측정점의 수 N, 각 점의 흩어짐 0.5
  Q.def("lp-lsq", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ N }) => {
      clear(g);
      const r = rng(7), X = [], Y = []; for (let i = 0; i < N; i++) { const x = 1 + 9 * i / Math.max(1, N - 1); X.push(x); let z = 0; for (let k = 0; k < 6; k++) z += r(); Y.push(2 * x + 1 + (z - 3) * 0.7); }
      const mx = X.reduce((a, b) => a + b) / N, my = Y.reduce((a, b) => a + b) / N, sxx = X.reduce((a, x) => a + (x - mx) ** 2, 0), b = X.reduce((a, x, i) => a + (x - mx) * (Y[i] - my), 0) / sxx, a = my - b * mx;
      const s = Math.sqrt(Y.reduce((t, y, i) => t + (y - a - b * X[i]) ** 2, 0) / Math.max(1, N - 2)), sb = s / Math.sqrt(sxx);
      const F = frame(g, 0, 11, 0, 24, [1, 4]); ticks(g, F, [0, 2, 4, 6, 8, 10], [0, 8, 16, 24]); axl(g, "x", "y");
      Q.plot(g, F, (x) => a + b * x, "c", 0, 11, 2);
      X.forEach((x, i) => Q.dot(g, F.x(x), F.y(Y[i]), "fb", 4));
      read.textContent = `점 ${N}개: 기울기 ${num(b, 3)} ± ${num(2 * sb, 3)} (95% 범위), 참값 2. 기울기의 불확도는 σ/√Σ(x − x̄)²로, 점이 많고 x가 넓게 퍼질수록 줄어든다`;
    });
  });

  // 1-3 오실로스코프 읽기: 수직 감도 (V/칸), 시간축 (ms/칸), 신호 1 kHz, 진폭 3 V
  Q.def("lp-scope", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ vd, td }) => {
      clear(g);
      const X0 = 60, Y0 = 20, W = 400, H = 192, cw = W / 10, ch = H / 8;
      for (let i = 0; i <= 10; i++) Q.line(g, X0 + i * cw, Y0, X0 + i * cw, Y0 + H, "gd");
      for (let j = 0; j <= 8; j++) Q.line(g, X0, Y0 + j * ch, X0 + W, Y0 + j * ch, "gd");
      const pts = []; for (let i = 0; i <= 400; i++) { const t = i / 400 * 10 * td, v = 3 * Math.sin(2 * Math.PI * t); pts.push([X0 + i, Math.max(Y0, Math.min(Y0 + H, Y0 + H / 2 - v / vd * ch))]); }
      path(g, pts, "b");
      read.textContent = `${vd} V/칸, ${td} ms/칸: 봉우리가 가운데에서 ${num(3 / vd, 1)}칸, 한 주기가 ${num(1 / td, 1)}칸이다. 진폭 = 칸 × V/칸 = 3 V, 주기 = 칸 × ms/칸 = 1 ms, 진동수 1 kHz` + (3 / vd > 4 ? " (화면을 넘어 잘림)" : "");
    });
  });

  // 1-4 센서의 측정 간격과 앨리어싱: 1초에 재는 횟수 fs, 진자 주기 2 s
  Q.def("lp-alias", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ fs }) => {
      clear(g);
      const f = 0.5, x = (t) => Math.sin(2 * Math.PI * f * t);
      const F = frame(g, 0, 10, -1.2, 1.2, [1, 0.5]); ticks(g, F, [0, 2, 4, 6, 8, 10], [-1, 0, 1]); axl(g, "시간 (s)", "진자의 위치");
      Q.plot(g, F, x, "gd", 0, 10, 300);
      const pts = []; for (let t = 0; t <= 10; t += 1 / fs) pts.push([F.x(t), F.y(x(t))]);
      path(g, pts, "c"); pts.forEach(([a, b]) => Q.dot(g, a, b, "fc", 3));
      const fa = Math.abs(f - fs * Math.round(f / fs));
      read.textContent = `1초에 ${num(fs, 2)}번: ` + (fs > 2 * f ? `진동수 0.5 Hz의 두 배(1 Hz)보다 자주 재어 주기 2 s의 운동이 기록된다. 모양까지 보려면 10배 이상` : `너무 드물어 진동이 ${fa < 1e-6 ? "멈춘 것처럼" : "주기 " + num(1 / fa, 1) + " s인 것처럼"} 보인다(앨리어싱)`);
    });
  });

  // 2-1 기록 타이머: 가속도 a (m/s²), 5타점(0.1 s)마다 자른 테이프
  Q.def("lp-tick", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const T = 0.1, v0 = 0.2, L = []; for (let i = 0; i < 6; i++) L.push((v0 * T + a * T * T * (i + 0.5)) * 100);
      L.forEach((l, i) => { el("rect", { x: 70 + i * 70, y: 205 - l * 12, width: 50, height: l * 12, class: "lb" }, g); txt(g, 95 + i * 70, 200 - l * 12, num(l, 1), "s", "middle"); });
      txt(g, 290, 220, "0.1 s 동안 간 거리 (cm), 차례로 붙인 테이프", "s", "middle");
      read.textContent = `가속도 ${num(a, 1)} m/s²: 테이프 길이가 0.1 s마다 aT² = ${num(a * T * T * 100, 1)} cm씩 늘어난다. 이웃 테이프의 길이 차 ÷ T²으로 가속도를 구한다`;
    });
  });

  // 2-2 수레와 추: 수레 질량 M (kg), 추 질량 m = 0.05 kg
  Q.def("lp-n2", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ M }) => {
      clear(g);
      const m = 0.05, a = m * G / (M + m), aF = m * G / M;
      const F = frame(g, 0.2, 2, 0, 2.5, [0.2, 0.5]); ticks(g, F, [0.2, 0.6, 1, 1.4, 1.8], [0, 0.5, 1, 1.5, 2, 2.5]); axl(g, "수레의 질량 (kg)", "가속도 (m/s²)");
      Q.plot(g, F, (x) => m * G / (x + m), "b", 0.2, 2, 100); Q.plot(g, F, (x) => Math.min(2.5, m * G / x), "gd", 0.2, 2, 100);
      Q.dot(g, F.x(M), F.y(a), "fd", 5);
      read.textContent = `수레 ${num(M, 2)} kg, 추 50 g: a = mg/(M + m) = ${num(a, 3)} m/s². 추의 질량을 빼고 F/M으로 계산하면 ${num(aF, 3)} m/s²로 ${num((aF / a - 1) * 100, 1)}% 크다. 추도 함께 가속하기 때문`;
    });
  });

  // 2-3 마찰력: 나무토막의 질량 m (kg), μs = 0.5, μk = 0.35
  Q.def("lp-fric", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const N = m * G, fs = 0.5 * N, fk = 0.35 * N;
      const f = (t) => (t < 2 ? fs * t / 2 : t < 2.15 ? fs - (fs - fk) * (t - 2) / 0.15 : fk + 0.03 * N * Math.sin(8 * t));
      const F = frame(g, 0, 5, 0, 12, [1, 2]); ticks(g, F, [0, 1, 2, 3, 4, 5], [0, 4, 8, 12]); axl(g, "시간 (s)", "용수철 저울의 힘 (N)");
      Q.plot(g, F, (t) => Math.min(12, f(t)), "b", 0, 5, 300);
      read.textContent = `질량 ${num(m, 1)} kg(수직 항력 ${num(N, 1)} N): 움직이기 직전 최대 정지 마찰력 ${num(fs, 2)} N(μs = 0.5), 끌려가는 동안 운동 마찰력 ${num(fk, 2)} N(μk = 0.35). 둘 다 수직 항력에 비례한다`;
    });
  });

  // 2-4 자유 낙하로 잰 g: 낙하 높이 h (m), 손으로 잰 시간의 오차 0.05 s
  Q.def("lp-g", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ h }) => {
      clear(g);
      const t = Math.sqrt(2 * h / G), e = (dt) => 2 * dt / t;
      bar(g, 40, e(0.05) * 400, "lc", "초시계 (±0.05 s)", `${num(e(0.05) * 100, 1)}%`);
      bar(g, 85, e(0.001) * 400, "lb", "광센서 (±0.001 s)", `${num(e(0.001) * 100, 2)}%`);
      read.textContent = `높이 ${num(h, 1)} m에서 떨어지는 시간 ${num(t, 3)} s. g = 2h/t²의 상대 오차는 시간 오차의 두 배라, 손으로 재면 ${num(e(0.05) * 100, 0)}%, 광센서로 재면 ${num(e(0.001) * 100, 2)}%`;
    });
  });

  // 2-5 구심력: 회전 반지름 r (m), 고무마개 10 g, 추 100 g
  Q.def("lp-cent", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const m = 0.01, M = 0.1, v = Math.sqrt(M * G * r / m), T = 2 * Math.PI * r / v;
      const F = frame(g, 0.2, 1.2, 0, 1.2, [0.1, 0.2]); ticks(g, F, [0.2, 0.4, 0.6, 0.8, 1, 1.2], [0, 0.4, 0.8, 1.2]); axl(g, "회전 반지름 (m)", "주기 (s)");
      Q.plot(g, F, (x) => 2 * Math.PI * Math.sqrt(x * m / (M * G)), "b", 0.2, 1.2, 100);
      Q.dot(g, F.x(r), F.y(T), "fd", 5);
      read.textContent = `반지름 ${num(r, 2)} m: 추의 무게 Mg가 구심력 mv²/r이 되어 v = ${num(v, 2)} m/s, 주기 ${num(T, 3)} s. 10바퀴 시간을 재면 ${num(10 * T, 2)} s. 주기의 제곱이 반지름에 비례한다`;
    });
  });

  // 2-6 진자의 진폭과 주기: 진폭 θ (°), 길이 1 m
  Q.def("lp-pend", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const Tex = (a) => { const k = Math.sin(a * D / 2); let s = 1, term = 1; for (let n = 1; n < 30; n++) { term *= ((2 * n - 1) / (2 * n)) ** 2 * k * k; s += term; } return s; };
    Q.bind(fig, ({ th }) => {
      clear(g);
      const F = frame(g, 0, 90, 1, 1.2, [10, 0.05]); ticks(g, F, [0, 30, 60, 90], [1, 1.05, 1.1, 1.15, 1.2]); axl(g, "진폭 (°)", "주기 ÷ 2π√(L/g)");
      Q.plot(g, F, Tex, "b", 0, 90, 100); Q.plot(g, F, (a) => 1 + (a * D) ** 2 / 16, "gd", 0, 90, 100);
      Q.dot(g, F.x(th), F.y(Tex(th)), "fd", 5);
      read.textContent = `진폭 ${th}°: 실제 주기가 작은 각의 공식보다 ${num((Tex(th) - 1) * 100, 2)}% 길다(회색은 1 + θ²/16 어림). 10° 안쪽이면 0.2% 안팎이라 공식이 잘 맞는다`;
    });
  });

  // 2-7 분리 실험의 운동량: 질량비 m₂/m₁, 용수철이 준 에너지 0.5 J, m₁ = 0.5 kg
  Q.def("lp-expl", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const m1 = 0.5, m2 = 0.5 * k, E = 0.5, v1 = Math.sqrt(2 * E * m2 / (m1 * (m1 + m2))), v2 = m1 * v1 / m2;
      const X = 300; const sb = (y, v, cls, lb, val) => { el("rect", { x: Math.min(X, X + v * 150), y, width: Math.abs(v * 150), height: 22, class: cls }, g); txt(g, 150, y + 16, lb, "s", "end"); txt(g, v >= 0 ? X + v * 150 + 6 : X + 6, y + 16, val, "s"); };
      Q.line(g, X, 30, X, 170, "gd");
      sb(40, -m1 * v1, "lb", "수레 1의 운동량", `${num(-m1 * v1, 3)} kg·m/s`);
      sb(80, m2 * v2, "lc", "수레 2의 운동량", `${num(m2 * v2, 3)} kg·m/s`);
      sb(120, 0.001, "lk", "합", "0");
      read.textContent = `질량 ${num(m1, 2)} kg와 ${num(m2, 2)} kg: 수레 1은 ${num(v1, 2)} m/s, 수레 2는 ${num(v2, 2)} m/s로 반대로 튕겨 나간다. 속력은 질량에 반비례하고 운동량의 합은 처음처럼 0이다`;
    });
  });

  // 2-8 용수철 진자의 에너지: 시간 t (주기의 몇 분의 몇)
  Q.def("lp-spe", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const k = 20, m = 0.5, A = 0.1, w = Math.sqrt(k / m), x = A * Math.cos(2 * Math.PI * p), v = -A * w * Math.sin(2 * Math.PI * p);
      const KE = 0.5 * m * v * v, PEs = 0.5 * k * x * x, Etot = 0.5 * k * A * A;
      bar(g, 40, KE / Etot * 250, "lb", "운동 에너지", `${num(KE * 1000, 0)} mJ`);
      bar(g, 80, PEs / Etot * 250, "lc", "탄성 퍼텐셜 에너지", `${num(PEs * 1000, 0)} mJ`);
      bar(g, 120, 250, "lk", "합", `${num((KE + PEs) * 1000, 0)} mJ`);
      read.textContent = `주기의 ${num(p, 2)} 지점, 평형점에서 ${num(x * 100, 1)} cm: 운동 에너지와 (평형점 기준) 탄성 에너지가 서로 바뀌며 합은 ${num(Etot * 1000, 0)} mJ로 일정하다. k = 20 N/m, m = 0.5 kg, 진폭 10 cm`;
    });
  });

  // 2-9 얼음의 융해열: 넣은 얼음의 질량 mi (g), 40 °C 물 200 g
  Q.def("lp-ice", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ mi }) => {
      clear(g);
      const mw = 200, Tw = 40, c = 4.18, L = 334, Tf = (mw * c * Tw - mi * L) / ((mw + mi) * c);
      const ok = Tf >= 0;
      bar(g, 50, Math.max(0, Tf) * 6, "lb", "나중 온도", ok ? `${num(Tf, 1)} °C` : "0 °C (얼음이 남음)");
      bar(g, 95, mi * L / 1000 * 5, "lc", "얼음이 녹는 데 쓴 열", `${num(Math.min(mi, mw * c * Tw / L) * L / 1000, 1)} kJ`);
      read.textContent = `40 °C 물 200 g에 0 °C 얼음 ${mi} g: 물이 잃은 열 = 얼음이 녹은 열 + 녹은 물이 데워진 열. ` + (ok ? `나중 온도 ${num(Tf, 1)} °C. 반대로 나중 온도를 재면 L = 334 J/g을 구할 수 있다` : `물이 0 °C까지 식어도 얼음을 다 녹이지 못한다`);
    });
  });

  // 2-10 열의 일당량: 열 손실 비율 (%), 일 4186 J를 물 1 kg에 가함
  Q.def("lp-joule", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ loss }) => {
      clear(g);
      const W = 4186, Qc = W / 4.186 * (1 - loss / 100), J = W / Qc, dT = Qc / 1000;
      bar(g, 50, dT * 200, "lb", "오른 온도", `${num(dT, 3)} °C`);
      bar(g, 95, J * 40, "lc", "계산한 열의 일당량", `${num(J, 2)} J/cal`);
      read.textContent = `일 4186 J로 물 1 kg을 저을 때 열의 ${loss}%가 빠져나가면 온도가 ${num(dT, 3)} °C 올라, 일당량을 ${num(J, 2)} J/cal로 계산한다(참값 4.19). 손실이 있으면 언제나 크게 나온다`;
    });
  });

  // 3-1 두 점 전극 사이의 전위: 전극 간격 s (cm), 전압 6 V
  Q.def("lp-equi", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ s }) => {
      clear(g);
      const a = 0.2, V = (x) => { const r1 = Math.max(a, Math.abs(x + s / 2)), r2 = Math.max(a, Math.abs(x - s / 2)); return 3 + 3 * Math.log(r2 / r1) / Math.log((s - a) / a); };
      const F = frame(g, -8, 8, 0, 6, [2, 1]); ticks(g, F, [-8, -4, 0, 4, 8], [0, 1, 2, 3, 4, 5, 6]); axl(g, "전극을 잇는 선 위의 위치 (cm)", "전위 (V)");
      Q.plot(g, F, (x) => Math.max(0, Math.min(6, V(x))), "b", -8, 8, 400);
      for (let v = 1; v <= 5; v++) { let lo = -s / 2 + a, hi = s / 2 - a; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (V(m) > v) lo = m; else hi = m; } Q.dot(g, F.x(lo), F.y(v), "fd", 4); }
      read.textContent = `전극 간격 ${s} cm, 6 V: 1 V 간격의 등전위점(빨강)이 전극 가까이 촘촘하고 가운데에서 성기다. 등전위선이 촘촘한 곳일수록 전기장이 세다(전도성 종이 모형)`;
    });
  });

  // 3-2 평행판 축전기: 종이 장수 n (장당 0.1 mm), 극판 20 cm × 20 cm, 유전 상수 3.5
  Q.def("lp-cap", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const A = 0.04, e0 = 8.85e-12, k = 3.5, C = (m) => k * e0 * A / (m * 1e-4) * 1e9;
      const F = frame(g, 0, 10, 0, 14, [1, 2]); ticks(g, F, [0, 2, 4, 6, 8, 10], [0, 4, 8, 12]); axl(g, "1/d (1/mm)", "전기 용량 (nF)");
      for (let m = 1; m <= 10; m++) Q.dot(g, F.x(10 / m), F.y(C(m)), m === n ? "fd" : "fb", m === n ? 6 : 4);
      Q.plot(g, F, (x) => k * e0 * A * x * 1e3 * 1e9, "gd", 0, 10, 2);
      read.textContent = `종이 ${n}장(d = ${num(n * 0.1, 1)} mm): C = κε₀A/d = ${num(C(n), 2)} nF. 전기 용량을 1/d에 대해 그리면 원점을 지나는 직선이고, 기울기에서 κε₀A를 구한다`;
    });
  });

  // 3-3 저항과 꼬마전구의 전압–전류: 전압 V (V)
  Q.def("lp-ohm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const bulb = (V) => { let R = 10; for (let i = 0; i < 30; i++) { const P = V * V / R; R = 10 * (1 + 0.6 * Math.sqrt(P)); } return V / R; };
    Q.bind(fig, ({ V }) => {
      clear(g);
      const F = frame(g, 0, 6, 0, 0.6, [1, 0.1]); ticks(g, F, [0, 1, 2, 3, 4, 5, 6], [0, 0.2, 0.4, 0.6]); axl(g, "전압 (V)", "전류 (A)");
      Q.plot(g, F, (v) => v / 20, "c", 0, 6, 10); Q.plot(g, F, bulb, "b", 0, 6, 120);
      Q.dot(g, F.x(V), F.y(V / 20), "fc", 5); Q.dot(g, F.x(V), F.y(bulb(V)), "fb", 5);
      read.textContent = `${num(V, 1)} V: 저항(주황)은 ${num(V / 20, 3)} A로 늘 20 Ω, 꼬마전구(파랑)는 ${num(bulb(V), 3)} A로 저항 ${num(V / Math.max(1e-6, bulb(V)), 1)} Ω. 전구는 필라멘트가 뜨거워질수록 저항이 커져 옴의 법칙을 따르지 않는다(모형)`;
    });
  });

  // 3-4 건전지의 내부 저항: 바깥 저항 R (Ω), 기전력 1.50 V, 내부 저항 0.50 Ω
  Q.def("lp-intr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ R }) => {
      clear(g);
      const E = 1.5, r = 0.5, I = E / (R + r), V = E - I * r;
      const F = frame(g, 0, 3, 0, 1.6, [0.5, 0.2]); ticks(g, F, [0, 0.5, 1, 1.5, 2, 2.5, 3], [0, 0.4, 0.8, 1.2, 1.6]); axl(g, "전류 (A)", "단자 전압 (V)");
      Q.plot(g, F, (i) => E - i * r, "b", 0, 3, 10);
      Q.dot(g, F.x(I), F.y(V), "fd", 5);
      read.textContent = `바깥 저항 ${num(R, 1)} Ω: 전류 ${num(I, 3)} A, 단자 전압 ${num(V, 3)} V (= E − Ir). 여러 저항으로 잰 점들을 이은 직선의 y절편이 기전력 1.5 V, 기울기의 크기가 내부 저항 0.5 Ω`;
    });
  });

  // 3-5 미터 브리지: 평형점까지의 길이 L₁ (cm), 표준 저항 100 Ω, 길이 읽기 오차 ±0.1 cm
  Q.def("lp-wheat", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ L }) => {
      clear(g);
      const Rx = 100 * L / (100 - L), e = (l) => 0.1 * (1 / l + 1 / (100 - l)) * 100;
      const F = frame(g, 5, 95, 0, 4, [10, 1]); ticks(g, F, [10, 30, 50, 70, 90], [0, 1, 2, 3, 4]); axl(g, "평형점 L₁ (cm)", "미지 저항의 상대 오차 (%)");
      Q.plot(g, F, (l) => Math.min(4, e(l)), "b", 5, 95, 200);
      Q.dot(g, F.x(L), F.y(Math.min(4, e(L))), "fd", 5);
      read.textContent = `평형점 ${L} cm: Rₓ = R × L₁/L₂ = ${num(Rx, 1)} Ω, 길이를 ±0.1 cm로 읽으면 오차 ${num(e(L), 2)}%. 평형점이 줄의 가운데일 때 오차가 가장 작아, 표준 저항을 Rₓ와 비슷하게 고른다`;
    });
  });

  // 3-6 전류 저울: 전류 I (A), 자기장 0.050 T, 도선 길이 4.0 cm
  Q.def("lp-bal", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ I }) => {
      clear(g);
      const B = 0.05, L = 0.04, Fm = B * I * L, dm = Fm / G * 1000;
      const F = frame(g, 0, 5, 0, 1.2, [1, 0.2]); ticks(g, F, [0, 1, 2, 3, 4, 5], [0, 0.4, 0.8, 1.2]); axl(g, "전류 (A)", "저울 눈금의 변화 (g)");
      Q.plot(g, F, (i) => B * i * L / G * 1000, "b", 0, 5, 10);
      Q.dot(g, F.x(I), F.y(dm), "fd", 5);
      read.textContent = `전류 ${num(I, 1)} A: 도선이 받는 힘 F = BIL = ${num(Fm * 1000, 2)} mN, 저울 눈금이 ${num(dm, 3)} g 바뀐다. 직선의 기울기 ÷ L × g로 자기장 B를 구한다`;
    });
  });

  // 3-7 코일을 지나는 자석: 자석의 속력 v (m/s)
  Q.def("lp-ind", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ v }) => {
      clear(g);
      const a = 0.02, Phi0 = 1, phi = (t) => Phi0 / (1 + (v * t / a) ** 2) ** 1.5, emf = (t) => { const h = 1e-5; return -(phi(t + h) - phi(t - h)) / (2 * h) / 100; };
      const F = frame(g, -0.1, 0.1, -4, 4, [0.02, 1]); ticks(g, F, [-0.1, -0.05, 0, 0.05, 0.1], [-4, -2, 0, 2, 4]); axl(g, "시간 (s)", "유도 기전력 (상대값)");
      Q.line(g, F.x(-0.1), F.y(0), F.x(0.1), F.y(0), "gd");
      Q.plot(g, F, (t) => Math.max(-4, Math.min(4, emf(t))), "b", -0.1, 0.1, 400);
      let mx = 0; for (let t = 0; t < 0.1; t += 0.0005) mx = Math.max(mx, Math.abs(emf(t)));
      read.textContent = `속력 ${num(v, 1)} m/s: 기전력의 최댓값 ${num(mx, 2)}(상대값)은 속력에 비례하고 지속 시간은 반비례한다. 한쪽 봉우리의 넓이(자기 선속의 변화)는 속력과 상관없이 같고, 들어갈 때와 나갈 때 부호가 반대이다`;
    });
  });

  // 3-8 RC 충전: 저항 R (kΩ), 축전기 100 μF, 전원 5 V
  Q.def("lp-rc", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ R }) => {
      clear(g);
      const tau = R * 1e3 * 100e-6;
      const F = frame(g, 0, 20, 0, 5.5, [2, 1]); ticks(g, F, [0, 5, 10, 15, 20], [0, 1, 2, 3, 4, 5]); axl(g, "시간 (s)", "축전기 전압 (V)");
      Q.plot(g, F, (t) => 5 * (1 - Math.exp(-t / tau)), "b", 0, 20, 200);
      Q.line(g, F.x(Math.min(20, tau)), F.y(0), F.x(Math.min(20, tau)), F.y(5 * 0.632), "gd");
      read.textContent = `R = ${R} kΩ, C = 100 μF: 시간 상수 RC = ${num(tau, 1)} s. 그때 전압이 3.16 V(63%), 5RC = ${num(5 * tau, 0)} s 뒤 99%에 이른다. ln(1 − V/E)를 시간에 대해 그리면 기울기 −1/RC인 직선`;
    });
  });

  // 3-9 공진의 날카로움: 저항 R (Ω), L = 10 mH, C = 1 μF
  Q.def("lp-q", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ R }) => {
      clear(g);
      const L = 0.01, C = 1e-6, f0 = 1 / (2 * Math.PI * Math.sqrt(L * C)), I = (f) => 1 / Math.sqrt(R * R + (2 * Math.PI * f * L - 1 / (2 * Math.PI * f * C)) ** 2), Qf = Math.sqrt(L / C) / R, bw = f0 / Qf;
      const F = frame(g, 500, 3000, 0, 1.05, [250, 0.25]); ticks(g, F, [500, 1000, 1500, 2000, 2500, 3000], [0, 0.5, 1]); axl(g, "진동수 (Hz)", "전류 ÷ 최대 전류");
      Q.plot(g, F, (f) => I(f) * R, "b", 500, 3000, 400);
      Q.line(g, F.x(f0 - bw / 2), F.y(0.707), F.x(f0 + bw / 2), F.y(0.707), "c");
      read.textContent = `R = ${R} Ω: 공진 진동수 ${num(f0, 0)} Hz, 전류가 최대의 70.7%가 되는 폭(주황) 약 ${num(bw, 0)} Hz, 선택도 Q = f₀/Δf = √(L/C)/R = ${num(Qf, 1)}. 저항이 작을수록 공진이 날카롭다`;
    });
  });

  // 3-10 정류와 평활: 평활 축전기 C (μF), 부하 1 kΩ, 60 Hz 반파 정류, 봉우리 10 V
  Q.def("lp-rect", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ C }) => {
      clear(g);
      const R = 1000, tau = R * C * 1e-6, T = 1 / 60, Vp = 10;
      const F = frame(g, 0, 0.05, -11, 11, [0.01, 5]); ticks(g, F, [0, 0.01, 0.02, 0.03, 0.04, 0.05], [-10, -5, 0, 5, 10]); axl(g, "시간 (s)", "전압 (V)");
      Q.plot(g, F, (t) => Vp * Math.sin(2 * Math.PI * 60 * t), "gd", 0, 0.05, 300);
      const pts = []; let v = 0; for (let i = 0; i <= 1000; i++) { const t = 0.05 * i / 1000, s = Math.max(0, Vp * Math.sin(2 * Math.PI * 60 * t)); v = C > 0 ? Math.max(s, v * Math.exp(-0.05 / 1000 / tau)) : s; pts.push([F.x(t), F.y(v)]); }
      path(g, pts, "b");
      const rip = C > 0 ? Vp / (60 * R * C * 1e-6) : Vp;
      read.textContent = `C = ${C} μF: 축전기가 봉우리 사이에서 부하로 방전하며 전압을 붙잡아, 맥동이 약 ${num(Math.min(Vp, rip), 2)} V (≈ V/(fRC)). 축전기가 클수록 직류에 가까워진다`;
    });
  });

  // 4-1 공명관: 소리굽쇠의 진동수 f (Hz), 음속 343 m/s, 관 끝 보정 1 cm
  Q.def("lp-tube", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ f }) => {
      clear(g);
      const lam = 343 / f * 100, e = 1, L1 = lam / 4 - e, L2 = 3 * lam / 4 - e;
      el("rect", { x: 230, y: 15, width: 60, height: 190, class: "lk" }, g);
      for (const [L, nm] of [[L1, "첫 공명"], [L2, "둘째 공명"]]) { if (L < 100) { const y = 15 + L * 1.9; Q.line(g, 220, y, 300, y, "c"); txt(g, 310, y + 4, `${nm} ${num(L, 1)} cm`, "s"); } }
      txt(g, 260, 220, "관 (길이 1 m)", "s", "middle");
      read.textContent = `${f} Hz: 파장 ${num(lam, 1)} cm. 수면이 관 입구에서 ${num(L1, 1)} cm, ${num(L2, 1)} cm일 때 소리가 커진다. 두 위치의 차 = 반파장 ${num(lam / 2, 1)} cm라서 끝 보정 없이 v = 2f(L₂ − L₁)`;
    });
  });

  // 4-2 오목 거울: 물체 거리 a (cm), 초점 거리 10 cm
  Q.def("lp-mirror", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const f = 10, b = 1 / (1 / f - 1 / a), m = -b / a;
      const F = frame(g, 0, 60, -60, 60, [10, 20]); ticks(g, F, [0, 10, 20, 30, 40, 50, 60], [-60, -30, 0, 30, 60]); axl(g, "물체 거리 a (cm)", "상 거리 b (cm)");
      Q.plot(g, F, (x) => Math.max(-60, Math.min(60, 1 / (1 / f - 1 / x))), "b", 1, 9.8, 100); Q.plot(g, F, (x) => Math.max(-60, Math.min(60, 1 / (1 / f - 1 / x))), "b", 10.2, 60, 200);
      Q.line(g, F.x(0), F.y(0), F.x(60), F.y(0), "gd");
      if (Math.abs(b) < 60) Q.dot(g, F.x(a), F.y(b), "fd", 5);
      read.textContent = `a = ${a} cm: ` + (Math.abs(a - f) < 0.01 ? "상이 무한히 멀리 생긴다(빛이 나란히 나감)" : `b = ${num(b, 1)} cm, 배율 ${num(m, 2)} → ` + (b > 0 ? `거울 앞의 ${m < 0 ? "거꾸로 선" : ""} 실상(스크린에 잡힘)` : "거울 뒤의 바로 선 허상(스크린에 안 잡힘)"));
    });
  });

  // 4-3 굴절과 전반사: 입사각 θ (°), 굴절률 n (유리 → 공기)
  Q.def("lp-tir", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ th, n }) => {
      clear(g);
      const s = n * Math.sin(th * D), crit = Math.asin(1 / n) / D;
      const F = frame(g, 0, 90, 0, 90, [10, 10]); ticks(g, F, [0, 30, 60, 90], [0, 30, 60, 90]); axl(g, "유리 안의 입사각 (°)", "공기로 나간 굴절각 (°)");
      Q.plot(g, F, (x) => { const v = n * Math.sin(x * D); return v <= 1 ? Math.asin(v) / D : NaN; }, "b", 0, crit - 0.01, 200);
      Q.line(g, F.x(crit), F.y(0), F.x(crit), F.y(90), "c");
      if (s <= 1) Q.dot(g, F.x(th), F.y(Math.asin(s) / D), "fd", 5);
      read.textContent = `굴절률 ${num(n, 2)}, 입사각 ${th}°: ` + (s <= 1 ? `굴절각 ${num(Math.asin(s) / D, 1)}°` : "빛이 공기로 나가지 못하고 모두 반사된다(전반사)") + `. 임계각(주황) sin θc = 1/n → ${num(crit, 1)}°`;
    });
  });

  // 4-4 베셀 방법: 물체–스크린 거리 Dd (cm), 볼록 렌즈 f = 10 cm
  Q.def("lp-bessel", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ Dd }) => {
      clear(g);
      const f = 10, disc = Dd * Dd - 4 * f * Dd, d = disc >= 0 ? Math.sqrt(disc) : NaN;
      const X0 = 60, sc = 400 / 100;
      Q.line(g, X0, 110, X0 + Dd * sc, 110, "gd"); Q.line(g, X0, 80, X0, 140, "b"); Q.line(g, X0 + Dd * sc, 60, X0 + Dd * sc, 160, "gd");
      txt(g, X0, 70, "물체", "s", "middle"); txt(g, X0 + Dd * sc, 50, "스크린", "s", "middle");
      if (!isNaN(d)) for (const x of [(Dd - d) / 2, (Dd + d) / 2]) { Q.line(g, X0 + x * sc, 85, X0 + x * sc, 135, "c"); txt(g, X0 + x * sc, 150, `${num(x, 1)}`, "s", "middle"); }
      read.textContent = `물체와 스크린 사이 ${Dd} cm: ` + (isNaN(d) ? "4f = 40 cm보다 가까워 선명한 상이 생기는 렌즈 위치가 없다" : `렌즈를 두 곳(물체에서 ${num((Dd - d) / 2, 1)} cm, ${num((Dd + d) / 2, 1)} cm)에 둘 때 상이 선명하다. 두 위치의 거리 d = ${num(d, 1)} cm에서 f = (D² − d²)/(4D) = ${num((Dd * Dd - d * d) / (4 * Dd), 2)} cm`);
    });
  });

  // 4-5 이중 슬릿: 슬릿 간격 d (mm), 스크린 거리 2.0 m, 파장 650 nm
  Q.def("lp-ds", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const L = 2, lam = 650e-9, dy = lam * L / (d * 1e-3) * 1000;
      const F = frame(g, -20, 20, 0, 1.05, [5, 0.25]); ticks(g, F, [-20, -10, 0, 10, 20], []); axl(g, "스크린 위의 위치 (mm)", "밝기");
      Q.plot(g, F, (y) => Math.cos(Math.PI * y / dy) ** 2, "b", -20, 20, 600);
      read.textContent = `슬릿 간격 ${num(d, 2)} mm: 밝은 무늬 간격 Δy = λL/d = ${num(dy, 2)} mm. 무늬 10개의 폭을 재어 10으로 나누면 자로 읽는 ±0.5 mm 오차가 ${num(0.5 / (10 * dy) * 100, 1)}%로 준다`;
    });
  });

  // 4-6 슬릿 폭과 간격: 슬릿 폭 a (μm), 슬릿 간격 d (μm), 파장 650 nm
  Q.def("lp-sp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, d }) => {
      clear(g);
      const lam = 0.65, I = (s) => { const b = Math.PI * a * s / lam, c = Math.PI * d * s / lam; const sinc = Math.abs(b) < 1e-9 ? 1 : Math.sin(b) / b; return sinc * sinc * Math.cos(c) ** 2; };
      const F = frame(g, -0.06, 0.06, 0, 1.05, [0.02, 0.25]); ticks(g, F, [-0.06, -0.03, 0, 0.03, 0.06], []); axl(g, "sin θ", "밝기");
      Q.plot(g, F, (s) => { const b = Math.PI * a * s / lam; const sc = Math.abs(b) < 1e-9 ? 1 : Math.sin(b) / b; return sc * sc; }, "gd", -0.06, 0.06, 400);
      Q.plot(g, F, I, "b", -0.06, 0.06, 1200);
      read.textContent = `슬릿 폭 ${a} μm, 간격 ${d} μm: 가는 줄무늬의 간격 sin θ = λ/d = ${num(lam / d, 4)}는 간격이, 무늬를 감싸는 큰 봉우리의 폭 λ/a = ${num(lam / a, 4)}는 폭이 정한다. 큰 봉우리 안에 밝은 줄이 약 ${num(2 * d / a - 1, 0)}개`;
    });
  });

  // 4-7 말뤼스 법칙: 두 편광판의 각 θ (°)
  Q.def("lp-malus", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ th }) => {
      clear(g);
      const I2 = (x) => Math.cos(x * D) ** 2, I3 = (x) => Math.cos(x * D) ** 2 * Math.sin(x * D) ** 2;
      const F = frame(g, 0, 90, 0, 1, [10, 0.25]); ticks(g, F, [0, 30, 60, 90], [0, 0.25, 0.5, 0.75, 1]); axl(g, "편광판 사이의 각 (°)", "투과한 빛 ÷ 첫 편광판을 지난 빛");
      Q.plot(g, F, I2, "b", 0, 90, 100); Q.plot(g, F, I3, "c", 0, 90, 100);
      Q.dot(g, F.x(th), F.y(I2(th)), "fb", 5); Q.dot(g, F.x(th), F.y(I3(th)), "fc", 5);
      read.textContent = `θ = ${th}°: 두 장이면 cos²θ = ${num(I2(th), 3)}(파랑). 수직인 두 장 사이에 θ만큼 돌린 셋째 장을 끼우면 cos²θ sin²θ = ${num(I3(th), 3)}(주황)로, 45°에서 25%가 다시 나온다`;
    });
  });

  // 5-1 광전 효과: 빛의 파장 λ (nm), 나트륨 일함수 2.3 eV
  Q.def("lp-photo", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lam }) => {
      clear(g);
      const phi = 2.3, f = 3e8 / (lam * 1e-9) / 1e14, Vs = Math.max(0, 4.136 * f / 10 - phi);
      const F = frame(g, 4, 10, 0, 2, [1, 0.5]); ticks(g, F, [4, 5, 6, 7, 8, 9, 10], [0, 0.5, 1, 1.5, 2]); axl(g, "진동수 (10¹⁴ Hz)", "정지 전압 (V)");
      Q.plot(g, F, (x) => Math.max(0, 0.4136 * x - phi), "b", 4, 10, 100);
      Q.dot(g, F.x(Math.min(10, Math.max(4, f))), F.y(Vs), "fd", 5);
      read.textContent = `파장 ${lam} nm(진동수 ${num(f, 2)} × 10¹⁴ Hz): ` + (Vs > 0 ? `정지 전압 ${num(Vs, 2)} V` : "문턱 진동수보다 낮아 전자가 튀어나오지 않는다") + `. 직선의 기울기 h/e = 4.14 × 10⁻¹⁵ V·s에서 플랑크 상수, x절편에서 문턱 진동수 ${num(phi / 0.4136, 2)} × 10¹⁴ Hz`;
    });
  });

  // 5-2 음극선의 편향: 편향 전압 Vd (V), 가속 전압 2000 V, 판 길이 5 cm, 판 간격 1 cm
  Q.def("lp-cath", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ Vd }) => {
      clear(g);
      const Va = 2000, L = 0.05, d = 0.01, y = Vd * L * L / (4 * d * Va) * 1000;
      el("rect", { x: 160, y: 60, width: 150, height: 6, class: "lc" }, g); el("rect", { x: 160, y: 154, width: 150, height: 6, class: "lb" }, g);
      let pd = `M60 110 L160 110`; for (let i = 0; i <= 30; i++) { const x = i / 30; pd += ` L${160 + 150 * x} ${110 - y * 9 * x * x}`; } pd += ` L460 ${110 - y * 9 - (y * 9 * 2) * (150 / 150) * 1}`;
      el("path", { d: pd, class: "b" }, g);
      txt(g, 235, 50, "+ 판", "s", "middle"); txt(g, 235, 178, "− 판", "s", "middle");
      read.textContent = `편향 전압 ${Vd} V: 전자가 판 사이를 지나며 + 판 쪽으로 ${num(y, 2)} mm 휜다(y = V_d L²/(4dV_a)). 전기장 쪽으로 휘므로 음전하를 띤 알갱이이다`;
    });
  });

  // 5-3 전자의 비전하: 가속 전압 V (V), 자기장 B (mT)
  Q.def("lp-em", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ V, B }) => {
      clear(g);
      const em = 1.759e11, r = Math.sqrt(2 * V / em) / (B * 1e-3);
      el("circle", { cx: 260, cy: 110, r: Math.min(95, r * 1000 * 1.5), class: "b" }, g);
      Q.dot(g, 260, 110 + Math.min(95, r * 1000 * 1.5), "fd", 4);
      read.textContent = `가속 전압 ${V} V, 자기장 ${num(B, 2)} mT: 전자 고리의 반지름 r = √(2V/(e/m))/B = ${num(r * 100, 2)} cm. 거꾸로 r을 재면 e/m = 2V/(B²r²) ≈ 1.76 × 10¹¹ C/kg`;
    });
  });

  // 5-4 프랑크–헤르츠 실험: 가속 전압 V (V)
  Q.def("lp-fh", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const I = (V) => { const E = 4.9, u = Math.max(0, V - 1.5), k = Math.floor(u / E), fr = u / E - k; return (0.15 + 0.12 * k) * (fr < 0.85 ? fr / 0.85 : 1 - (fr - 0.85) / 0.15 * 0.9) * (1 + 0.1 * k) + 0.02 * u; };
    Q.bind(fig, ({ V }) => {
      clear(g);
      const F = frame(g, 0, 30, 0, 1.2, [5, 0.2]); ticks(g, F, [0, 5, 10, 15, 20, 25, 30], [0, 0.4, 0.8, 1.2]); axl(g, "가속 전압 (V)", "전류 (상대값)");
      Q.plot(g, F, (v) => Math.min(1.2, I(v)), "b", 0, 30, 600);
      Q.dot(g, F.x(V), F.y(Math.min(1.2, I(V))), "fd", 5);
      read.textContent = `${num(V, 1)} V: 전자가 수은 원자에 4.9 eV를 줄 수 있게 될 때마다 에너지를 잃어 전류가 줄어든다. 전류가 줄어드는 봉우리 간격 4.9 V가 수은의 첫 들뜬 상태 에너지이다(모형)`;
    });
  });
})();
