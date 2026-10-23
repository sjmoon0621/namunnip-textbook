/* 고급 물리학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st) => { const F = Q.frame(x0, x1, y0, y1, 60, 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const sbar = (g, y, v, sc, cls, label, val) => { const X = 300, w = v * sc; el("rect", { x: Math.min(X, X + w), y, width: Math.max(1, Math.abs(w)), height: 22, class: cls }, g); Q.line(g, X, y - 4, X, y + 26, "gd"); txt(g, 150, y + 16, label, "s", "end"); txt(g, w >= 0 ? X + w + 6 : X + 6, y + 16, val, "s"); };

  // 1-1 공기 저항과 종단 속도: 저항 계수 k (1/s), 저항력 = m k v
  Q.def("adphy-vterm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const G = 9.8, vt = G / k;
      const F = frame(g, 0, 10, 0, 100, [1, 20]); ticks(g, F, [0, 2, 4, 6, 8, 10], [0, 20, 40, 60, 80, 100]);
      txt(g, 490, 200, "시간 (s)", "s", "end"); txt(g, 66, 26, "낙하 속력 (m/s)", "s");
      Q.plot(g, F, (t) => Math.min(100, G * t), "gd", 0, 10, 50);
      Q.plot(g, F, (t) => vt * (1 - Math.exp(-k * t)), "b", 0, 10, 200);
      if (vt <= 100) Q.line(g, F.x(0), F.y(vt), F.x(10), F.y(vt), "gd");
      read.textContent = `k = ${num(k, 2)}/s: 종단 속도 g/k = ${num(vt, 1)} m/s, 시간 상수 ${num(1 / k, 1)} s. ${num(3 / k, 1)} s(시간 상수의 세 배) 뒤에 종단 속도의 95%에 이른다`;
    });
  });

  // 1-2 일차원 탄성 충돌: 질량비 m1/m2 = 10^lg, 정지한 m2에 속력 1로 부딪침
  Q.def("adphy-elastic", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lg }) => {
      clear(g);
      const r = 10 ** lg, v1 = (r - 1) / (r + 1), v2 = 2 * r / (r + 1), f = 4 * r / (1 + r) ** 2;
      sbar(g, 30, 1, 100, "lk", "충돌 전 m1", "1");
      sbar(g, 70, v1, 100, "lb", "충돌 후 m1", num(v1, 2));
      sbar(g, 110, v2, 100, "lc", "충돌 후 m2", num(v2, 2));
      bar(g, 150, f * 200, "ld", "넘겨준 운동 에너지", `${num(f * 100, 0)}%`, 300);
      read.textContent = `질량비 ${num(r, 2)}: 부딪친 공은 ${v1 < 0 ? "튕겨 돌아오고" : v1 < 0.01 ? "멈추고" : "계속 앞으로 가고"} 맞은 공은 ${num(v2, 2)}배 빠르기로 나간다. 운동 에너지의 ${num(f * 100, 0)}%를 넘겨주며, 질량이 같을 때 100%`;
    }, (k, v) => num(10 ** v, 2));
  });

  // 1-3 굴러 내려가기: 회전 관성 계수 β (I = β m r²), 높이 1 m, 빗면 길이 2 m
  const ROLL = [["미끄러지는 상자", 0], ["속이 찬 공", 0.4], ["속이 찬 원기둥", 0.5], ["속이 빈 공", 2 / 3], ["고리", 1]];
  Q.def("adphy-roll", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b }) => {
      clear(g);
      const v = (B) => Math.sqrt(2 * 9.8 / (1 + B)), t = (B) => Math.sqrt(2 * 2 / (9.8 * 0.5 / (1 + B)));
      ROLL.forEach(([nm, B], i) => bar(g, 12 + i * 34, v(B) * 50, Math.abs(B - b) < 0.03 ? "lc" : "lk", nm, `${num(v(B), 2)} m/s, ${num(t(B), 2)} s`));
      read.textContent = `β = ${num(b, 2)}: 바닥 속력 √(2gh/(1+β)) = ${num(v(b), 2)} m/s, 2 m 빗면을 내려오는 시간 ${num(t(b), 2)} s. 위치 에너지의 ${num(b / (1 + b) * 100, 0)}%가 회전 에너지로 간다`;
    });
  });

  // 1-4 원 궤도: 고도 h (km)
  Q.def("adphy-sat", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ h }) => {
      clear(g);
      const GM = 3.986e14, R = 6.371e6, vv = (x) => Math.sqrt(GM / (R + x * 1e3)) / 1e3;
      const F = frame(g, 0, 40000, 0, 8, [5000, 1]); ticks(g, F, [0, 10000, 20000, 30000, 40000], [0, 2, 4, 6, 8]);
      txt(g, 490, 200, "고도 (km)", "s", "end"); txt(g, 66, 26, "궤도 속력 (km/s)", "s");
      Q.plot(g, F, vv, "b", 0, 40000, 200);
      Q.dot(g, F.x(h), F.y(vv(h)), "fd", 5);
      const T = 2 * Math.PI * (R + h * 1e3) / (vv(h) * 1e3) / 3600;
      read.textContent = `고도 ${num(h, 0)} km: 속력 ${num(vv(h), 2)} km/s, 한 바퀴 ${T < 3 ? num(T * 60, 0) + "분" : num(T, 1) + "시간"}. ` + (Math.abs(T - 23.93) < 0.3 ? "지구 자전과 같은 주기, 정지 궤도이다" : "높이 올라갈수록 느리게 돌지만 한 바퀴는 길어진다");
    });
  });

  // 1-5 등온 팽창과 단열 팽창: 부피비 r, P1 = 100 kPa, V1 = 1 L, γ = 1.4
  Q.def("adphy-pv", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const ga = 1.4, iso = (V) => 100 / V, adi = (V) => 100 * V ** -ga;
      const F = frame(g, 0, 4, 0, 110, [0.5, 20]); ticks(g, F, [0, 1, 2, 3, 4], [0, 20, 40, 60, 80, 100]);
      txt(g, 490, 200, "부피 (L)", "s", "end"); txt(g, 66, 26, "압력 (kPa)", "s");
      Q.plot(g, F, iso, "b", 0.95, 4, 150); Q.plot(g, F, adi, "c", 0.95, 4, 150);
      let d = `M${F.x(1)} ${F.y(0)}`; for (let i = 0; i <= 60; i++) { const V = 1 + (r - 1) * i / 60; d += `L${F.x(V)} ${F.y(iso(V))}`; } d += `L${F.x(r)} ${F.y(0)}Z`;
      el("path", { d, class: "la" }, g);
      const Wi = 100 * Math.log(r), Wa = 100 * (1 - r ** (1 - ga)) / (ga - 1);
      read.textContent = `${num(r, 1)}배로 팽창: 등온(파랑)은 일 ${num(Wi, 0)} J을 하고 같은 양의 열을 받는다. 단열(주황)은 일 ${num(Wa, 0)} J을 내부 에너지로 치러 절대 온도가 ${num(r ** (1 - ga), 2)}배로 떨어진다`;
    });
  });

  // 1-6 카르노 효율과 엔트로피: 고온 Th, 저온 Tc (K), 열 1000 J
  Q.def("adphy-entropy", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ Th, Tc }) => {
      clear(g);
      const tc = Math.min(Tc, Th - 1), eta = 1 - tc / Th, dS = 1000 / tc - 1000 / Th;
      bar(g, 40, eta * 300, "lb", "최대 효율", `${num(eta * 100, 1)}%`);
      bar(g, 80, eta * 1000 * 0.3, "lc", "1000 J에서 얻는 최대 일", `${num(eta * 1000, 0)} J`);
      bar(g, 120, dS * 60, "ld", "그냥 흘러갈 때 엔트로피 증가", `${num(dS, 2)} J/K`);
      read.textContent = `${Th} K와 ${tc} K 사이: 카르노 효율 1 − Tc/Th = ${num(eta * 100, 1)}%. 열 1000 J이 일을 하지 않고 그냥 흘러가면 우주의 엔트로피가 ${num(dS, 2)} J/K 늘고, 그만큼 일을 얻을 기회를 잃는다`;
    });
  });

  // 2-1 가우스 법칙: 반지름 R인 구의 전기장, 거리 x = r/R
  Q.def("adphy-gsph", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const solid = (u) => (u < 1 ? u : 1 / (u * u)), shell = (u) => (u < 1 ? 0 : 1 / (u * u));
      const F = frame(g, 0, 3, 0, 1.1, [0.5, 0.2]); ticks(g, F, [0, 0.5, 1, 1.5, 2, 2.5, 3], [0, 0.2, 0.4, 0.6, 0.8, 1]);
      txt(g, 490, 200, "중심에서의 거리 r/R", "s", "end"); txt(g, 66, 26, "전기장 (겉면의 값 = 1)", "s");
      Q.plot(g, F, solid, "b", 0, 3, 200); Q.plot(g, F, shell, "c", 0.001, 3, 200);
      Q.line(g, F.x(x), F.y(0), F.x(x), F.y(1.1), "gd");
      read.textContent = `r = ${num(x, 2)}R: 속이 고르게 찬 구(파랑) ${num(solid(x), 2)}, 껍질에만 전하가 있는 구(주황) ${num(shell(x), 2)}. ` + (x < 1 ? "가우스 면 안의 전하만 전기장을 만든다" : "밖에서는 둘 다 점전하와 같다");
    });
  });

  // 2-2 유전체를 일부 채운 축전기: 유전 상수 κ, 채운 비율 f
  Q.def("adphy-diel", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ kap, f }) => {
      clear(g);
      const par = 1 + (kap - 1) * f, ser = 1 / ((1 - f) + f / kap);
      bar(g, 50, par * 30, "lb", "옆으로 나란히 채움", `C/C₀ = ${num(par, 2)} (병렬)`, 180);
      bar(g, 95, ser * 30, "lc", "층으로 겹쳐 채움", `C/C₀ = ${num(ser, 2)} (직렬)`, 180);
      read.textContent = `유전 상수 ${num(kap, 1)}, 극판 사이의 ${num(f * 100, 0)}%를 채움: 옆으로 채우면 ${num(par, 2)}배(병렬), 층으로 채우면 ${num(ser, 2)}배(직렬). 다 채우면 둘 다 ${num(kap, 1)}배`;
    });
  });

  // 2-3 RL 회로: 자체 유도 계수 L (mH), R = 10 Ω, 기전력 10 V
  Q.def("adphy-rl", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ L }) => {
      clear(g);
      const tau = L / 10; // ms
      const F = frame(g, 0, 100, 0, 1.1, [10, 0.2]); ticks(g, F, [0, 20, 40, 60, 80, 100], [0, 0.2, 0.4, 0.6, 0.8, 1]);
      txt(g, 490, 200, "시간 (ms)", "s", "end"); txt(g, 66, 26, "전류 (A)", "s");
      Q.plot(g, F, (t) => 1 - Math.exp(-t / tau), "b", 0, 100, 200);
      Q.line(g, F.x(Math.min(100, tau)), F.y(0), F.x(Math.min(100, tau)), F.y(0.632), "gd");
      read.textContent = `L = ${L} mH: 시간 상수 L/R = ${num(tau, 1)} ms. 그동안 최종 전류 1 A의 63%에 이르고, 10 ms 뒤 전류는 ${num(1 - Math.exp(-10 / tau), 2)} A`;
    });
  });

  // 2-4 전자기파의 진동수와 파장: 진동수 10^lg Hz
  const BANDS = [[6, "AM 라디오"], [8, "FM 라디오"], [9.3, "휴대 전화"], [9.7, "와이파이"]];
  const fhz = (v) => { const f = 10 ** v; return f >= 1e9 ? num(f / 1e9, 2) + " GHz" : num(f / 1e6, 1) + " MHz"; };
  Q.def("adphy-antenna", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lg }) => {
      clear(g);
      const lam = 3e8 / 10 ** lg;
      const F = frame(g, 6, 10, -2, 3, [0.5, 1]);
      for (const [x, s] of [[6, "1 MHz"], [7, "10 MHz"], [8, "100 MHz"], [9, "1 GHz"], [10, "10 GHz"]]) txt(g, F.x(x), 220, s, "s", "middle");
      for (const [y, s] of [[-2, "1 cm"], [-1, "10 cm"], [0, "1 m"], [1, "10 m"], [2, "100 m"], [3, "1 km"]]) txt(g, F.X0 - 5, F.y(y) + 4, s, "s", "end");
      Q.plot(g, F, (v) => Math.log10(3e8 / 10 ** v), "b", 6, 10, 50);
      for (const [v, s] of BANDS) { Q.dot(g, F.x(v), F.y(Math.log10(3e8 / 10 ** v)), "fk", 3); txt(g, F.x(v) + 6, F.y(Math.log10(3e8 / 10 ** v)) - 6, s, "s"); }
      Q.dot(g, F.x(lg), F.y(Math.log10(lam)), "fd", 5);
      const ls = (m) => (m >= 1 ? num(m, 2) + " m" : num(m * 100, 1) + " cm");
      read.textContent = `진동수 ${fhz(lg)}: 파장 c/f = ${ls(lam)}, 4분의 1 파장 안테나의 길이 ${ls(lam / 4)}`;
    }, (k, v) => fhz(v));
  });

  // 2-5 키르히호프 법칙: E1 = 12 V (R1 = 2 Ω), E2 (R2 = 4 Ω)가 함께 R3 = 6 Ω에 전류를 보냄
  Q.def("adphy-kvl", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ E2 }) => {
      clear(g);
      const V = (12 / 2 + E2 / 4) / (1 / 2 + 1 / 4 + 1 / 6), I1 = (12 - V) / 2, I2 = (E2 - V) / 4, I3 = V / 6;
      sbar(g, 40, I1, 60, "lb", "I₁ (전지 1)", `${num(I1, 2)} A`);
      sbar(g, 80, I2, 60, "lc", "I₂ (전지 2)", `${num(I2, 2)} A`);
      sbar(g, 120, I3, 60, "ld", "I₃ (부하 저항)", `${num(I3, 2)} A`);
      read.textContent = `E₂ = ${E2} V: 접점 법칙 I₁ + I₂ = I₃ (${num(I1, 2)} + ${num(I2, 2)} = ${num(I3, 2)}). ` + (I2 < 0 ? "I₂가 음수이므로 전지 2는 거꾸로 충전된다" : "두 전지가 함께 부하에 전류를 보낸다");
    });
  });

  // 2-6 RLC 공진: 진동수 f (Hz), 저항 R (Ω), L = 10 mH, C = 1 μF, 전원 1 V
  Q.def("adphy-res", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ f, R }) => {
      clear(g);
      const L = 0.01, C = 1e-6, I = (x) => 1 / Math.sqrt(R * R + (2 * Math.PI * x * L - 1 / (2 * Math.PI * x * C)) ** 2) * 1000;
      const F = frame(g, 200, 5000, 0, 200, [400, 40]); ticks(g, F, [1000, 2000, 3000, 4000, 5000], [0, 40, 80, 120, 160, 200]);
      txt(g, 490, 200, "진동수 (Hz)", "s", "end"); txt(g, 66, 26, "전류 (mA)", "s");
      Q.plot(g, F, (x) => Math.min(200, I(x)), "b", 200, 5000, 400);
      Q.dot(g, F.x(f), F.y(Math.min(200, I(f))), "fd", 5);
      const XL = 2 * Math.PI * f * L, XC = 1 / (2 * Math.PI * f * C);
      read.textContent = `${f} Hz: 유도 리액턴스 ${num(XL, 0)} Ω, 용량 리액턴스 ${num(XC, 0)} Ω, 전류 ${num(I(f), 1)} mA. 공진 진동수 1/(2π√LC) ≈ 1592 Hz에서 두 리액턴스가 상쇄되어 전류가 1/R = ${num(1000 / R, 0)} mA로 가장 크다`;
    });
  });

  // 3-1 현미경의 배율: 대물렌즈 초점 거리 fo (mm), 접안렌즈 fe (mm), 경통 길이 160 mm
  Q.def("adphy-micro", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ fo, fe }) => {
      clear(g);
      const mo = 160 / fo, me = 250 / fe, M = mo * me;
      bar(g, 40, mo * 3, "lb", "대물렌즈 배율", `${num(mo, 1)}배`);
      bar(g, 80, me * 6, "lc", "접안렌즈 배율", `${num(me, 1)}배`);
      bar(g, 120, Math.log10(M) * 80, "ld", "전체 배율 (로그 길이)", `${num(M, 0)}배`);
      read.textContent = `대물 ${fo} mm, 접안 ${fe} mm: 대물렌즈가 160/fo = ${num(mo, 1)}배로 실상을 만들고, 접안렌즈가 그 상을 250/fe = ${num(me, 1)}배로 다시 키워 모두 ${num(M, 0)}배`;
    });
  });

  // 3-2 마이컬슨 간섭계: 거울 이동 d (μm), 파장 633 nm
  Q.def("adphy-mich", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const lam = 0.633, Ib = (x) => Math.cos(2 * Math.PI * x / lam) ** 2;
      const F = frame(g, 0, 3, 0, 1, [0.5, 0.25]); ticks(g, F, [0, 0.5, 1, 1.5, 2, 2.5, 3], [0, 0.5, 1]);
      txt(g, 490, 200, "거울을 옮긴 거리 (μm)", "s", "end"); txt(g, 66, 26, "가운데 밝기", "s");
      Q.plot(g, F, Ib, "b", 0, 3, 400);
      Q.dot(g, F.x(d), F.y(Ib(d)), "fd", 5);
      read.textContent = `거울을 ${num(d, 2)} μm 옮기면 빛의 경로는 그 두 배인 ${num(2 * d, 2)} μm 달라져 무늬가 ${num(2 * d / lam, 1)}개 지나간다. 무늬 하나는 거울 ${num(lam / 2 * 1000, 0)} nm 이동에 해당`;
    });
  });

  // 3-3 레일리 기준: 구경 D (mm), 파장 550 nm, 1.5 m 떨어진 두 전조등
  Q.def("adphy-ray", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ D }) => {
      clear(g);
      const th = (x) => 1.22 * 550e-9 / (x * 1e-3), as = (x) => th(x) * 206265;
      const F = frame(g, 0, 300, 0, 50, [50, 10]); ticks(g, F, [0, 50, 100, 150, 200, 250, 300], [0, 10, 20, 30, 40, 50]);
      txt(g, 490, 200, "구경 (mm)", "s", "end"); txt(g, 66, 26, "가를 수 있는 최소 각 (초)", "s");
      Q.plot(g, F, (x) => Math.min(50, as(x)), "b", 2, 300, 300);
      Q.dot(g, F.x(D), F.y(Math.min(50, as(D))), "fd", 5);
      const dist = 1.5 / th(D) / 1000;
      read.textContent = `구경 ${D} mm: 최소 각 1.22λ/D = ${num(as(D), 2)}초. 1.5 m 떨어진 두 전조등을 ${dist < 100 ? num(dist, 1) : num(dist, 0)} km까지 두 개로 가를 수 있다`;
    });
  });

  // 3-4 반사와 편광 (브루스터 각): 입사각 θ, 공기에서 유리(n = 1.5)로
  Q.def("adphy-brew", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const R = (deg) => { const n = 1.5, ti = deg * Math.PI / 180, ci = Math.cos(ti), ct = Math.sqrt(1 - (Math.sin(ti) / n) ** 2); const rs = (ci - n * ct) / (ci + n * ct), rp = (n * ci - ct) / (n * ci + ct); return [rs * rs, rp * rp]; };
    Q.bind(fig, ({ th }) => {
      clear(g);
      const F = frame(g, 0, 90, 0, 1, [10, 0.2]); ticks(g, F, [0, 30, 60, 90], [0, 0.2, 0.4, 0.6, 0.8, 1]);
      txt(g, 490, 200, "입사각 (°)", "s", "end"); txt(g, 66, 26, "반사율", "s");
      Q.plot(g, F, (x) => R(x)[0], "b", 0, 89.9, 200); Q.plot(g, F, (x) => R(x)[1], "c", 0, 89.9, 200);
      const [s, p] = R(th); Q.dot(g, F.x(th), F.y(s), "fb", 4); Q.dot(g, F.x(th), F.y(p), "fc", 4);
      read.textContent = `입사각 ${th}°: 면에 나란히 진동하는 빛(파랑) ${num(s * 100, 1)}%, 입사면 안에서 진동하는 빛(주황) ${num(p * 100, 1)}% 반사. 브루스터 각 56.3°에서 주황이 0이 되어 반사광은 완전히 편광된다`;
    });
  });

  // 4-1 가속하는 차 안의 진자: 가속도 a (m/s²)
  Q.def("adphy-tilt", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const th = Math.atan(a / 9.8), cx = 260, cy = 40, L = 130;
      el("rect", { x: 140, y: 30, width: 240, height: 160, class: "lk" }, g);
      Q.line(g, cx, cy, cx, cy + L + 10, "gd");
      Q.line(g, cx, cy, cx - L * Math.sin(th), cy + L * Math.cos(th), "b");
      Q.dot(g, cx - L * Math.sin(th), cy + L * Math.cos(th), "fb", 8);
      txt(g, 400, 110, "가속 방향 →", "s");
      read.textContent = `가속도 ${num(a, 1)} m/s²: 차 안에서는 진자가 뒤로 ${num(th * 180 / Math.PI, 1)}° 기운다 (tan θ = a/g). 차 안의 관찰자는 크기 ${num(Math.hypot(9.8, a), 2)} m/s²인 '유효 중력'을 느낀다`;
    });
  });

  // 4-2 시간 팽창과 뮤온: 속력 β = v/c
  Q.def("adphy-gamma", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b }) => {
      clear(g);
      const ga = (x) => 1 / Math.sqrt(1 - x * x);
      const F = frame(g, 0, 1, 1, 25, [0.1, 4]); ticks(g, F, [0, 0.2, 0.4, 0.6, 0.8, 1], [1, 5, 9, 13, 17, 21, 25]);
      txt(g, 490, 200, "속력 v/c", "s", "end"); txt(g, 66, 26, "로런츠 인자 γ", "s");
      Q.plot(g, F, (x) => Math.min(25, ga(x)), "b", 0, 0.9992, 300);
      Q.dot(g, F.x(b), F.y(Math.min(25, ga(b))), "fd", 5);
      const Lm = ga(b) * b * 3e8 * 2.2e-6, surv = Math.exp(-15000 / Lm);
      read.textContent = `v = ${num(b, 3)}c: γ = ${num(ga(b), 2)}. 수명 2.2 μs인 뮤온은 평균 ${num(Lm / 1000, 2)} km를 날아가, 15 km 아래 땅까지 ${surv < 0.001 ? surv.toExponential(1) : num(surv * 100, 1) + "%"}가 살아남는다`;
    });
  });

  // 4-3 전자의 드브로이 파장: 가속 전압 10^lg V
  Q.def("adphy-dbl", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lg }) => {
      clear(g);
      const V = 10 ** lg, lam = 1.226 / Math.sqrt(V);
      const F = frame(g, 0, 4, -2, 0.5, [0.5, 0.5]);
      for (const [x, s] of [[0, "1 V"], [1, "10 V"], [2, "100 V"], [3, "1 kV"], [4, "10 kV"]]) txt(g, F.x(x), 220, s, "s", "middle");
      for (const [y, s] of [[-2, "0.01 nm"], [-1, "0.1 nm"], [0, "1 nm"]]) txt(g, F.X0 - 5, F.y(y) + 4, s, "s", "end");
      Q.plot(g, F, (x) => Math.log10(1.226 / Math.sqrt(10 ** x)), "b", 0, 4, 50);
      Q.line(g, F.x(0), F.y(Math.log10(0.2)), F.x(4), F.y(Math.log10(0.2)), "gd"); txt(g, F.x(3.9), F.y(Math.log10(0.2)) - 6, "원자 간격 약 0.2 nm", "s", "end");
      Q.dot(g, F.x(lg), F.y(Math.log10(lam)), "fd", 5);
      read.textContent = `가속 전압 ${num(V, V < 10 ? 1 : 0)} V: 파장 h/√(2meV) ≈ ${num(lam, 3)} nm. 원자 간격과 ${lam > 0.1 && lam < 0.4 ? "비슷하여 결정에서 회절한다" : lam >= 0.4 ? "견주어 길다" : "견주어 짧다"}`;
    }, (k, v) => num(10 ** v, v < 1 ? 1 : 0));
  });

  // 4-4 불확정성: 위치의 퍼짐 Δx = 10^lg nm, 전자
  Q.def("adphy-unc", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lg }) => {
      clear(g);
      const dx = 10 ** lg, dp = 1.055e-34 / (2 * dx * 1e-9), dv = dp / 9.11e-31;
      const sx = 10 + 30 * (lg + 2), sp = 10 + 30 * (1 - lg);
      let d1 = "", d2 = ""; for (let i = 0; i <= 100; i++) { const u = -100 + 2 * i; d1 += (i ? "L" : "M") + (140 + u) + " " + (190 - 150 * Math.exp(-u * u / (2 * sx * sx))); d2 += (i ? "L" : "M") + (380 + u) + " " + (190 - 150 * Math.exp(-u * u / (2 * sp * sp))); }
      el("path", { d: d1, class: "b" }, g); el("path", { d: d2, class: "c" }, g);
      txt(g, 140, 210, "위치의 분포", "s", "middle"); txt(g, 380, 210, "운동량의 분포", "s", "middle");
      read.textContent = `전자의 위치를 Δx = ${num(dx, dx < 0.1 ? 2 : 1)} nm 안에 가두면 Δp ≥ ħ/(2Δx)이므로 속도는 적어도 ${dv > 1e5 ? num(dv / 1000, 0) + " km/s" : num(dv, 0) + " m/s"}만큼 불확실하다`;
    }, (k, v) => num(10 ** v, v < -1 ? 2 : 1));
  });

  // 4-5 상자 속 전자: 상자 길이 L (nm)
  Q.def("adphy-box", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ L }) => {
      clear(g);
      const E1 = 0.376 / (L * L), dE = 3 * E1, lam = 1240 / dE;
      const sc = Math.min(160 / (16 * E1), 400);
      const w = Math.min(300, 60 + L * 80);
      Q.line(g, 100, 20, 100, 200, "b"); Q.line(g, 100 + w, 20, 100 + w, 200, "b"); Q.line(g, 100, 200, 100 + w, 200, "b");
      for (let n = 1; n <= 4; n++) { const y = 200 - n * n * E1 * sc; if (y > 15) { Q.line(g, 100, y, 100 + w, y, n <= 2 ? "c" : "gd"); txt(g, 110 + w, y + 4, `n = ${n}, ${num(n * n * E1, 2)} eV`, "s"); } }
      read.textContent = `상자 길이 ${num(L, 1)} nm: E₁ = h²/(8mL²) = ${num(E1, 3)} eV. n = 2에서 1로 떨어질 때 ${num(dE, 2)} eV, 파장 ${num(lam, 0)} nm의 빛 (${lam < 380 ? "자외선" : lam <= 750 ? "가시광선" : "적외선"})`;
    });
  });

  // 4-6 핵자당 결합 에너지 (반경험적 질량 공식): 질량수 A
  Q.def("adphy-bea", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const BA = (A) => { const Z = A / (2 + 0.0154 * A ** (2 / 3)); const B = 15.8 * A - 18.3 * A ** (2 / 3) - 0.714 * Z * (Z - 1) / A ** (1 / 3) - 23.2 * (A - 2 * Z) ** 2 / A; return B / A; };
    Q.bind(fig, ({ A }) => {
      clear(g);
      const F = frame(g, 0, 250, 6, 9.5, [25, 0.5]); ticks(g, F, [0, 50, 100, 150, 200, 250], [6, 7, 8, 9]);
      txt(g, 490, 200, "질량수", "s", "end"); txt(g, 66, 26, "핵자당 결합 에너지 (MeV)", "s");
      Q.plot(g, F, BA, "b", 12, 250, 240);
      Q.dot(g, F.x(A), F.y(BA(A)), "fd", 5);
      read.textContent = `질량수 ${A}: 핵자당 약 ${num(BA(A), 2)} MeV. 질량수 60 근처(철)에서 가장 커서, 무거운 핵은 쪼개질 때, 가벼운 핵은 합쳐질 때 에너지를 낸다`;
    });
  });
})();
