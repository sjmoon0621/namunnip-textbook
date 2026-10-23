/* 역학과 에너지 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const G = 9.8;

  // 1-1 빗면: 경사각 θ, 마찰 계수 μ, 질량 2 kg
  Q.def("mech-incline", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ th, mu }) => {
      clear(g);
      const r = th * Math.PI / 180, m = 2, W = m * G, Wp = W * Math.sin(r), N = W * Math.cos(r), fmax = mu * N;
      const x0 = 60, y0 = 190, L = 300;
      el("path", { d: `M${x0} ${y0} L${x0 + L * Math.cos(r)} ${y0} L${x0 + L * Math.cos(r)} ${y0 - L * Math.sin(r)} Z`, class: "lk" }, g);
      const cx = x0 + 0.55 * L * Math.cos(r), cy = y0 - 0.55 * L * Math.sin(r);
      el("rect", { x: -18, y: -30, width: 36, height: 30, class: "lb", transform: `translate(${cx} ${cy}) rotate(${-th})` }, g);
      const k = 3;
      Q.arrow(g, cx, cy - 15, cx, cy - 15 + W * k, "d", "fd");
      Q.arrow(g, cx, cy - 15, cx - Wp * k * Math.cos(r), cy - 15 + Wp * k * Math.sin(r), "c", "fc");
      const moves = Wp > fmax, net = moves ? Wp - mu * N : 0, a = net / m;
      txt(g, 380, 50, `중력 ${num(W, 1)} N`, "s td"); txt(g, 380, 75, `빗면 방향 ${num(Wp, 1)} N`, "s tc"); txt(g, 380, 100, `최대 마찰 ${num(fmax, 1)} N`, "s");
      read.textContent = `θ = ${th}°, μ = ${num(mu, 2)}: ` + (moves ? `미끄러진다, 가속도 g(sin θ − μ cos θ) = ${num(a, 2)} m/s²` : `정지 마찰로 멈춰 있다 (tan θ = ${num(Math.tan(r), 2)} ≤ μ)`);
    });
  });

  // 1-2 포물선 운동: 처음 속력 v, 각도 θ
  Q.def("mech-proj", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ v, th }) => {
      clear(g);
      const F = frame(g, 0, 50, 0, 20, [5, 5]); ticks(g, F, [0, 10, 20, 30, 40, 50], [0, 10, 20]);
      const r = th * Math.PI / 180, vx = v * Math.cos(r), vy = v * Math.sin(r), T = 2 * vy / G, R = vx * T, H = vy * vy / (2 * G);
      Q.plot(g, F, (x) => x * Math.tan(r) - G * x * x / (2 * vx * vx), "b", 0, R, 200);
      for (const a of [15, 30, 45, 60, 75]) if (a !== th) { const ra = a * Math.PI / 180, vxa = v * Math.cos(ra); Q.plot(g, F, (x) => x * Math.tan(ra) - G * x * x / (2 * vxa * vxa), "gd", 0, v * v * Math.sin(2 * ra) / G, 100); }
      Q.dot(g, F.x(R), F.y(0), "fd", 5);
      txt(g, 490, 200, "수평 거리 (m)", "s", "end");
      read.textContent = `${v} m/s, ${th}°: 수평 도달 거리 v² sin 2θ / g = ${num(R, 1)} m, 최고 높이 ${num(H, 1)} m, 체공 시간 ${num(T, 2)} s`;
    });
  });

  // 1-3 등속 원운동: 반지름 r, 속력 v, 질량 0.5 kg
  Q.def("mech-circle", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 150, cy = 115;
    Q.bind(fig, ({ r, v, t }) => {
      clear(g);
      const R = r * 70, w = v / r, ang = t * Math.PI / 180;
      el("circle", { cx, cy, r: R, class: "gd" }, g);
      const px = cx + R * Math.cos(ang), py = cy - R * Math.sin(ang);
      Q.line(g, cx, cy, px, py, "k"); Q.dot(g, px, py, "fb", 7);
      Q.arrow(g, px, py, px - Math.sin(ang) * 60, py - Math.cos(ang) * 60, "c", "fc");
      Q.arrow(g, px, py, px - Math.cos(ang) * 40, py + Math.sin(ang) * 40, "d", "fd");
      const a = v * v / r, F = 0.5 * a, T = 2 * Math.PI * r / v;
      txt(g, 320, 60, `속도 (접선) ${num(v, 1)} m/s`, "s tc"); txt(g, 320, 85, `구심 가속도 ${num(a, 2)} m/s²`, "s td"); txt(g, 320, 110, `구심력 ${num(F, 2)} N`, "s"); txt(g, 320, 135, `주기 ${num(T, 2)} s`, "s");
      read.textContent = `반지름 ${r} m, 속력 ${v} m/s: a = v²/r = ${num(a, 2)} m/s² (중심 방향), 줄이 끊기면 주황 화살표(접선) 방향으로 날아간다`;
    });
  });

  // 1-4 케플러 제3법칙: T² ∝ a³ (태양계, 천문단위·년)
  const PL = [["수성", 0.387, 0.241], ["금성", 0.723, 0.615], ["지구", 1, 1], ["화성", 1.524, 1.881], ["목성", 5.203, 11.86], ["토성", 9.537, 29.46]];
  Q.def("mech-kepler", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const F = frame(g, -0.5, 1.1, -0.7, 1.6, [0.5, 0.5]);
      for (const [x, s] of [[-0.5, "0.3"], [0, "1"], [0.5, "3.2"], [1, "10"]]) txt(g, F.x(x), 220, s, "s", "middle");
      for (const [y, s] of [[-0.5, "0.3"], [0, "1"], [0.5, "3.2"], [1, "10"], [1.5, "32"]]) txt(g, F.X0 - 5, F.y(y) + 4, s, "s", "end");
      txt(g, 490, 200, "궤도 긴반지름 a (AU, 로그)", "s", "end"); txt(g, 66, 26, "공전 주기 T (년, 로그)", "s");
      Q.plot(g, F, (x) => 1.5 * x, "b", -0.5, 1.1);
      PL.forEach(([n, x, y]) => { Q.dot(g, F.x(Math.log10(x)), F.y(Math.log10(y)), "fk", 4); txt(g, F.x(Math.log10(x)) + 5, F.y(Math.log10(y)) - 6, n, "s"); });
      const T = a ** 1.5; Q.dot(g, F.x(Math.log10(a)), F.y(Math.log10(T)), "fd", 6);
      read.textContent = `a = ${num(a, 2)} AU: T = a^(3/2) = ${num(T, 2)}년 (T² = a³, 로그 그래프에서 기울기 3/2인 직선)`;
    });
  });

  // 1-5 탈출 속도: 행성에서 수직 발사, 도달 높이 h = R v² / (v_e² − v²)
  const BODY = [["지구", 6371, 11.19], ["달", 1737, 2.38], ["화성", 3390, 5.03]];
  Q.def("mech-escape", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b, f }) => {
      clear(g);
      const [n, R, ve] = BODY[b], v = ve * f / 100, h = f < 100 ? R * v * v / (ve * ve - v * v) : Infinity;
      const F = frame(g, 0, 100, 0, 5, [10, 1]);
      ticks(g, F, [0, 50, 100], []); txt(g, 490, 200, "발사 속력 (탈출 속도의 %)", "s", "end"); txt(g, 66, 26, "최고 높이 (행성 반지름의 몇 배)", "s");
      Q.plot(g, F, (p) => p < 100 ? (p / 100) ** 2 / (1 - (p / 100) ** 2) : NaN, "b", 0, 99.5, 200);
      for (const y of [1, 2, 3, 4, 5]) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end");
      if (f < 100) Q.dot(g, F.x(f), F.y(Math.min(5, h / R)), "fd", 5);
      read.textContent = `${n} (탈출 속도 ${ve} km/s), 발사 ${num(v, 2)} km/s: ` + (f < 100 ? `약 ${Math.round(h).toLocaleString("ko-KR")} km까지 올라갔다 떨어진다` : "다시 돌아오지 않는다 (탈출)");
    }, (k, v) => k === "b" ? BODY[v][0] : `${v}%`);
  });

  // 1-6 GPS 시계: 고도 h(km) 위성의 하루 시간 차이 (μs): 일반 상대론 +, 특수 상대론 −
  Q.def("mech-gps", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ h }) => {
      clear(g);
      const GM = 3.986e14, c = 2.998e8, R = 6.371e6, r = R + h * 1000, day = 86400;
      const gr = GM / (c * c) * (1 / R - 1 / r) * day * 1e6, v2 = GM / r, sr = -v2 / (2 * c * c) * day * 1e6, tot = gr + sr;
      const s = 3, base = 260;
      el("rect", { x: base, y: 40, width: gr * s, height: 30, class: "lc" }, g); txt(g, base - 6, 60, "중력 (일반)", "s", "end"); txt(g, base + gr * s + 4, 60, `+${num(gr, 1)}`, "s");
      el("rect", { x: base + sr * s, y: 90, width: -sr * s, height: 30, class: "lb" }, g); txt(g, base - 6 + sr * s, 110, "속도 (특수)", "s", "end"); txt(g, base + 4, 110, `${num(sr, 1)}`, "s");
      el("rect", { x: Math.min(base, base + tot * s), y: 140, width: Math.abs(tot) * s, height: 30, class: "ld" }, g); txt(g, base - 6, 160, "합계", "s", "end"); txt(g, base + Math.max(0, tot) * s + 4, 160, `${num(tot, 1)} μs/일`, "s");
      Q.line(g, base, 30, base, 180, "ax");
      read.textContent = `고도 ${h.toLocaleString("ko-KR")} km 위성 시계: 중력 효과 +${num(gr, 1)} μs/일, 속도 효과 ${num(sr, 1)} μs/일 → 하루에 ${num(tot, 1)} μs 빨라짐 (거리 오차 약 ${num(Math.abs(tot) * 0.3, 1)} km)`;
    });
  });

  // 2-1 열전도: Q/t = k A ΔT / d (벽 10 m², 안 20 °C, 밖 0 °C)
  const MAT = [["콘크리트", 1.4], ["벽돌", 0.7], ["나무", 0.15], ["스티로폼 단열재", 0.035]];
  Q.def("mech-conduct", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m, d }) => {
      clear(g);
      const [n, k] = MAT[m], P = k * 10 * 20 / (d / 100);
      el("rect", { x: 200, y: 30, width: d * 6, height: 150, class: ["lk", "ld", "la", "lb"][m] }, g);
      txt(g, 150, 105, "안 20 °C", "s", "middle"); txt(g, 230 + d * 6 + 40, 105, "밖 0 °C", "s", "middle");
      Q.arrow(g, 120, 140, 120 + Math.min(300, P / 20), 140, "d", "fd");
      read.textContent = `${n} (k = ${k} W/m·K), 두께 ${d} cm: 벽 10 m²로 빠져나가는 열 ${Math.round(P).toLocaleString("ko-KR")} W`;
    }, (k, v) => k === "m" ? MAT[v][0] : `${v}`);
  });

  // 2-2 이상 기체: PV = nRT (1 mol)
  Q.def("mech-gas", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T, V }) => {
      clear(g);
      const P = 8.314 * T / (V / 1000) / 1000;
      const h = V * 5;
      el("rect", { x: 60, y: 200 - h, width: 120, height: h, class: "lb", opacity: Math.min(0.9, 0.2 + T / 800) }, g);
      el("rect", { x: 55, y: 195 - h, width: 130, height: 8, class: "lk" }, g);
      const n = 30, r = (s) => { let x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); };
      for (let i = 0; i < n; i++) Q.dot(g, 66 + r(i) * 108, 205 - h + 8 + r(i + 99) * (h - 16), "fd", 2.5);
      txt(g, 230, 70, `온도 ${T} K`, "s"); txt(g, 230, 95, `부피 ${V} L`, "s"); txt(g, 230, 120, `압력 ${num(P, 1)} kPa`, "s tc");
      read.textContent = `기체 1 mol, ${T} K, ${V} L: P = nRT/V = ${num(P, 1)} kPa (대기압 약 101 kPa)`;
    });
  });

  // 2-3 열역학 제1법칙: 1 mol 이상 기체에 열 Q = 1000 J, 일정 압력 100 kPa에서 부피 ΔV 증가
  Q.def("mech-first", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dv }) => {
      clear(g);
      const Qh = 1000, W = 100e3 * dv / 1000, dU = Qh - W;
      const s = 0.25;
      el("rect", { x: 80, y: 40, width: Qh * s, height: 30, class: "ld" }, g); txt(g, 72, 60, "받은 열 Q", "s", "end");
      el("rect", { x: 80, y: 90, width: W * s, height: 30, class: "lc" }, g); txt(g, 72, 110, "한 일 W", "s", "end");
      el("rect", { x: 80, y: 140, width: Math.max(0, dU) * s, height: 30, class: "lb" }, g); txt(g, 72, 160, "내부 에너지 ΔU", "s", "end");
      txt(g, 80 + Qh * s + 6, 60, `${Qh} J`, "s"); txt(g, 80 + W * s + 6, 110, `${num(W, 0)} J`, "s"); txt(g, 80 + Math.max(0, dU) * s + 6, 160, `${num(dU, 0)} J`, "s");
      read.textContent = `열 1000 J, 100 kPa에서 부피 ${num(dv, 1)} L 팽창: 일 W = PΔV = ${num(W, 0)} J, ΔU = Q − W = ${num(dU, 0)} J`;
    });
  });

  // 2-4 열기관 순환 (P–V 직사각형): P1, P2 (kPa), V1 = 1 L, V2
  Q.def("mech-cycle", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p2, v2 }) => {
      clear(g);
      const p1 = 100, v1 = 1, F = frame(g, 0, 5, 0, 400, [1, 100]); ticks(g, F, [0, 1, 2, 3, 4, 5], [0, 100, 200, 300, 400]);
      txt(g, 490, 200, "부피 (L)", "s", "end"); txt(g, 66, 26, "압력 (kPa)", "s");
      el("path", { d: `M${F.x(v1)} ${F.y(p1)} L${F.x(v1)} ${F.y(p2)} L${F.x(v2)} ${F.y(p2)} L${F.x(v2)} ${F.y(p1)} Z`, class: "la" }, g);
      el("path", { d: `M${F.x(v1)} ${F.y(p1)} L${F.x(v1)} ${F.y(p2)} L${F.x(v2)} ${F.y(p2)} L${F.x(v2)} ${F.y(p1)} Z`, class: "b" }, g);
      const W = (p2 - p1) * (v2 - v1);
      // 단원자 이상 기체로 받은 열 (A→B 정적 가열 + B→C 정압 팽창)
      const Qin = 1.5 * (p2 - p1) * v1 + 2.5 * p2 * (v2 - v1), e = W / Qin;
      read.textContent = `한 바퀴 일 = 사각형 넓이 (${p2} − 100) kPa × (${num(v2, 1)} − 1) L = ${num(W, 0)} J, 받은 열 ${num(Qin, 0)} J, 효율 ${num(e * 100, 1)}% (단원자 기체)`;
    });
  });

  // 2-5 엔트로피: N개 분자가 모두 왼쪽에 있을 확률 (1/2)^N
  Q.def("mech-entropy", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      el("rect", { x: 40, y: 30, width: 260, height: 150, class: "gd" }, g); Q.line(g, 170, 30, 170, 180, "gd");
      let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      let left = 0;
      for (let i = 0; i < n; i++) { const L = r() < 0.5; if (L) left++; Q.dot(g, (L ? 48 : 178) + r() * 114, 38 + r() * 134, L ? "fb" : "fc", 3.5); }
      const p = 0.5 ** n;
      txt(g, 320, 70, `왼쪽 ${left}개, 오른쪽 ${n - left}개`, "s"); txt(g, 320, 100, "모두 왼쪽에 있을 확률", "s"); txt(g, 320, 125, p > 1e-4 ? num(p, 6) : `${num(p / 10 ** Math.floor(Math.log10(p)), 2)} × 10^${Math.floor(Math.log10(p))}`, "s td");
      read.textContent = `분자 ${n}개: 모두 한쪽에 모일 확률 (1/2)^${n}, 고르게 퍼진 상태의 경우의 수가 압도적으로 많다`;
    });
  });

  // 3-1 용수철 단진동: 질량 m, 용수철 상수 k, 진폭 0.1 m
  Q.def("mech-shm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m, k }) => {
      clear(g);
      const T = 2 * Math.PI * Math.sqrt(m / k), F = frame(g, 0, 3, -0.12, 0.12, [0.5, 0.05]);
      ticks(g, F, [0, 1, 2, 3], []); txt(g, 490, 200, "시간 (s)", "s", "end"); txt(g, 66, 26, "위치 (m)", "s");
      Q.plot(g, F, (t) => 0.1 * Math.cos(2 * Math.PI * t / T), "b", 0, 3, 300);
      const vmax = 0.1 * 2 * Math.PI / T, amax = 0.1 * (2 * Math.PI / T) ** 2;
      read.textContent = `m = ${num(m, 1)} kg, k = ${k} N/m: 주기 2π√(m/k) = ${num(T, 2)} s, 최대 속력 ${num(vmax, 2)} m/s (가운데), 최대 가속도 ${num(amax, 2)} m/s² (양 끝)`;
    });
  });

  // 3-2 펄스의 반사: 고정단은 뒤집혀, 자유단은 그대로 반사
  Q.def("mech-pulse", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t, e }) => {
      clear(g);
      const L = 400, x0 = 50, y0 = 110, w = 40, A = 50, pos = t * 8;
      const pulse = (x, c, s) => s * A * Math.exp(-(((x - c) / w) ** 2) * 3);
      let d = "";
      for (let i = 0; i <= 200; i++) { const x = i / 200 * L, y = pulse(x, pos, 1) + pulse(x, 2 * L - pos, e ? -1 : 1); d += (i ? "L" : "M") + (x0 + x) + " " + (y0 - y); }
      el("path", { d, class: "b" }, g);
      Q.line(g, x0, y0 + 60, x0 + L, y0 + 60, "gd");
      el("rect", { x: x0 + L, y: 40, width: 12, height: 140, class: e ? "lk" : "lc" }, g);
      txt(g, x0 + L + 6, 200, e ? "고정단" : "자유단", "s", "middle");
      read.textContent = (e ? "고정단" : "자유단") + `: 반사된 펄스가 ` + (e ? "위아래가 뒤집혀(위상이 반대로) 돌아온다" : "같은 모양 그대로 돌아온다");
    }, (k, v) => k === "e" ? (v ? "고정단" : "자유단") : `${v}`);
  });

  // 3-3 도플러 효과: 음원 진동수 500 Hz, 음속 340 m/s, 음원 속력 vs
  Q.def("mech-doppler", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ vs }) => {
      clear(g);
      const f0 = 500, c = 340, fa = f0 * c / (c - vs), fb = f0 * c / (c + vs), sx = 260, sy = 110, k = 0.5;
      for (let i = 1; i <= 6; i++) { const age = i * 0.25, R = c * age * k, cx = sx - vs * age * k; el("circle", { cx, cy: sy, r: R, class: "gd" }, g); }
      Q.dot(g, sx, sy, "fd", 6); Q.arrow(g, sx, sy, sx + 40, sy, "d", "fd");
      txt(g, 470, 40, `앞 ${num(fa, 0)} Hz`, "s tc", "end"); txt(g, 50, 40, `뒤 ${num(fb, 0)} Hz`, "s tb");
      read.textContent = `음원 ${vs} m/s로 이동 (500 Hz): 다가오는 쪽 ${num(fa, 0)} Hz, 멀어지는 쪽 ${num(fb, 0)} Hz`;
    });
  });

  // 3-4 두 스피커의 간섭: 간격 2 m, 거리 5 m 앞 선 위의 위치 y, 진동수 340 Hz (λ = 1 m)
  Q.def("mech-twospk", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ y }) => {
      clear(g);
      const lam = 1, S1 = [0, 1], S2 = [0, -1], D = 5, P = [D, y];
      const d1 = Math.hypot(P[0] - S1[0], P[1] - S1[1]), d2 = Math.hypot(P[0] - S2[0], P[1] - S2[1]), dd = Math.abs(d1 - d2), I = Math.cos(Math.PI * dd / lam) ** 2;
      const X = (x) => 60 + x * 70, Y = (v) => 110 - v * 25;
      for (const s of [S1, S2]) { el("rect", { x: X(s[0]) - 10, y: Y(s[1]) - 10, width: 20, height: 20, class: "lk" }, g); Q.line(g, X(s[0]), Y(s[1]), X(P[0]), Y(P[1]), "gd"); }
      Q.line(g, X(D), 10, X(D), 210, "ax");
      let d = ""; for (let i = 0; i <= 200; i++) { const yy = -3.8 + i * 7.6 / 200, a = Math.abs(Math.hypot(D, yy - 1) - Math.hypot(D, yy + 1)); d += (i ? "L" : "M") + (X(D) + 80 * Math.cos(Math.PI * a / lam) ** 2) + " " + Y(yy); }
      el("path", { d, class: "b" }, g);
      Q.dot(g, X(P[0]), Y(P[1]), "fd", 6);
      read.textContent = `y = ${num(y, 2)} m: 경로차 ${num(dd, 3)} m (파장 1 m의 ${num(dd / lam, 2)}배) → 소리 세기 ${num(I * 100, 0)}%` + (I < 0.05 ? " (상쇄)" : I > 0.95 ? " (보강)" : "");
    });
  });

  // 3-5 정상파: 줄 길이 L = 0.65 m, 파동 속력 v = 260 m/s, n배 진동
  Q.def("mech-standing", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n, t }) => {
      clear(g);
      const L = 0.65, v = 260, f = n * v / (2 * L), x0 = 60, W = 400, y0 = 110, A = 60;
      for (const ph of [0, Math.PI]) Q.plot(g, Q.frame(0, 1, -1, 1, x0, x0 + W, y0 - A, y0 + A), (x) => Math.sin(n * Math.PI * x) * Math.cos(ph), "gd", 0, 1, 200);
      Q.plot(g, Q.frame(0, 1, -1, 1, x0, x0 + W, y0 - A, y0 + A), (x) => Math.sin(n * Math.PI * x) * Math.cos(t * Math.PI / 10), "b", 0, 1, 200);
      for (let k = 0; k <= n; k++) Q.dot(g, x0 + W * k / n, y0, "fd", 4);
      Q.line(g, x0, y0 - 70, x0, y0 + 70, "k"); Q.line(g, x0 + W, y0 - 70, x0 + W, y0 + 70, "k");
      read.textContent = `${n}배 진동: 파장 2L/n = ${num(2 * L / n, 3)} m, 진동수 nv/2L = ${num(f, 0)} Hz, 마디 ${n + 1}개 (빨간 점)`;
    });
  });
})();
