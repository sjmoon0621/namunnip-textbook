/* 물리학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;

  // 줄의 실험: 추 10 kg이 2 m 낙하 n번, 물 0.5 kg
  Q.def("phy-joule", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const W = n * 10 * 9.8 * 2, dT = W / (0.5 * 4200);
      el("rect", { x: 60, y: 110, width: 160, height: 100, class: "lb" }, g); el("rect", { x: 60, y: 110, width: 160, height: 100, class: "k" }, g);
      Q.line(g, 140, 60, 140, 190, "k");
      for (let i = 0; i < 4; i++) { const a = n * 0.7 + i * Math.PI / 2; Q.line(g, 140, 170, 140 + 40 * Math.cos(a), 170 + 12 * Math.sin(a), "k"); }
      el("circle", { cx: 140, cy: 60, r: 14, class: "gd" }, g);
      Q.line(g, 154, 60, 280, 60, "k"); Q.line(g, 280, 60, 280, 80 + (n % 5) * 16, "k");
      el("rect", { x: 266, y: 80 + (n % 5) * 16, width: 28, height: 28, class: "lc" }, g); txt(g, 280, 98 + (n % 5) * 16, "10kg", "s", "middle");
      el("rect", { x: 380, y: 40, width: 18, height: 170, class: "lk" }, g);
      el("rect", { x: 383, y: 210 - Math.min(160, 20 + dT * 30), width: 12, height: Math.min(160, 20 + dT * 30), class: "ld" }, g);
      txt(g, 410, 200 - Math.min(160, dT * 30), `+${num(dT, 2)} °C`, "s td");
      read.textContent = `${n}번: 추가 한 일 ${num(W, 0)} J → 물 0.5 kg의 온도 상승 ${num(dT, 2)} °C (4.2 J = 1 cal)`;
    });
  });

  // 두 점전하의 전기장: q1 = +1 (왼쪽), q2 (오른쪽)
  Q.def("phy-field", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), P1 = [180, 130], P2 = [340, 130];
    Q.bind(fig, ({ q }) => {
      clear(g);
      const E = (x, y) => {
        let ex = 0, ey = 0;
        for (const [[px, py], c] of [[P1, 1], [P2, q]]) {
          const dx = x - px, dy = y - py, r2 = dx * dx + dy * dy, r = Math.sqrt(r2);
          ex += c * dx / (r2 * r); ey += c * dy / (r2 * r);
        }
        return [ex * 4e3, ey * 4e3];
      };
      for (let x = 30; x <= 500; x += 32) for (let y = 18; y <= 250; y += 32) {
        if (Math.hypot(x - P1[0], y - P1[1]) < 20 || Math.hypot(x - P2[0], y - P2[1]) < 20) continue;
        const [ex, ey] = E(x, y), m = Math.hypot(ex, ey);
        if (m < 0.02) { Q.dot(g, x, y, "fd", 2); continue; }
        const L = 12, ux = ex / m * L, uy = ey / m * L, o = Math.min(1, 0.25 + m / 3);
        Q.arrow(el("g", { opacity: o.toFixed(2) }, g), x - ux / 2, y - uy / 2, x + ux / 2, y + uy / 2, "c", "fc");
      }
      el("circle", { cx: P1[0], cy: P1[1], r: 12, class: "ld" }, g); txt(g, P1[0], P1[1] + 5, "+1", "s", "middle");
      if (q) { el("circle", { cx: P2[0], cy: P2[1], r: 12, class: q > 0 ? "ld" : "lb" }, g); txt(g, P2[0], P2[1] + 5, (q > 0 ? "+" : "") + num(q), "s", "middle"); }
      read.textContent = q === 0 ? "오른쪽 전하가 없으면 화살표가 왼쪽 전하에서 사방으로 뻗어 나간다"
        : q < 0 ? `부호가 다르다: 화살표가 +1에서 나와 ${num(q)}로 들어가고, 두 전하는 서로 끌어당긴다`
        : `부호가 같다: 두 전하 사이에 전기장이 0인 곳(점)이 생기고, 두 전하는 서로 밀어낸다`;
    });
  });

  // 멀티탭: 220 V에 1100 W 기구 n개 병렬, 한계 16 A
  Q.def("phy-multitap", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const I = n * 5, over = I > 16;
      Q.line(g, 30, 60, 470, 60, "k"); Q.line(g, 30, 140, 470, 140, "k");
      txt(g, 20, 104, "220 V", "s", "middle");
      for (let i = 0; i < 5; i++) {
        const x = 110 + i * 80, on = i < n;
        Q.line(g, x, 60, x, 82, "k"); Q.line(g, x, 118, x, 140, "k");
        el("rect", { x: x - 22, y: 82, width: 44, height: 36, class: on ? "lc" : "lk" }, g);
        txt(g, x, 105, on ? "5 A" : "꺼짐", "s", "middle");
      }
      const w = Math.min(380, I * 16);
      el("rect", { x: 70, y: 175, width: w, height: 22, class: over ? "ld" : "lb" }, g);
      Q.line(g, 70 + 16 * 16, 168, 70 + 16 * 16, 204, "d"); txt(g, 70 + 16 * 16 + 4, 216, "한계 16 A", "s td");
      txt(g, 64, 191, "전선", "s", "end");
      read.textContent = `기구 ${n}개: 전선 전류 ${I} A, 전력 ${n * 1100} W` + (over ? " (16 A를 넘어 위험하다)" : "");
    });
  });

  // 평행판 축전기: C ∝ A/d, 같은 전압에서 Q = CV
  Q.def("phy-cap", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ A, d }) => {
      clear(g);
      const C = A / d, h = 30 + A * 35, gap = d * 30, cx = 180, cy = 120;
      const xl = cx - gap / 2 - 8, xr = cx + gap / 2;
      el("rect", { x: xl, y: cy - h / 2, width: 8, height: h, class: "ld" }, g);
      el("rect", { x: xr, y: cy - h / 2, width: 8, height: h, class: "lb" }, g);
      const n = Math.round(C * 4);
      for (let i = 0; i < n; i++) {
        const y = cy - h / 2 + (i + 0.5) * h / n;
        txt(g, xl - 8, y + 4, "+", "s td", "middle"); txt(g, xr + 16, y + 4, "−", "s tb", "middle");
      }
      Q.line(g, xl, cy, 40, cy, "k"); Q.line(g, xr + 8, cy, 320, cy, "k");
      txt(g, 180, 228, `간격 ${num(d)}`, "s", "middle");
      el("rect", { x: 360, y: 200 - C * 40, width: 40, height: C * 40, class: "lc" }, g);
      txt(g, 380, 218, "전하량", "s", "middle");
      read.textContent = `넓이 ${num(A)}, 간격 ${num(d)}: 전기 용량 ${num(C, 2)}배, 같은 전압에서 모인 전하도 ${num(C, 2)}배`;
    });
  });

  // 자성체: 외부 자기장 B(오른쪽)에서 원자 자석의 정렬 (s: 0 강자성, 1 상자성, 2 반자성)
  Q.def("phy-domain", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const R = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 48; i++) R.push(rnd() * Math.PI * 2);
    Q.bind(fig, ({ s, B }) => {
      clear(g);
      el("rect", { x: 40, y: 30, width: 320, height: 180, class: "gd" }, g);
      let M = 0;
      for (let i = 0; i < 48; i++) {
        const c = i % 8, r = Math.floor(i / 8), x = 60 + c * 40, y = 45 + r * 30;
        let a;
        if (s === 0) { const dom = Math.floor(c / 4) + 2 * Math.floor(r / 3), a0 = R[dom * 11 % 48]; a = B >= 0.15 * (dom + 1) ? 0 : a0; }
        else if (s === 1) a = (R[i] - Math.PI) * (1 - B * 0.4);
        else a = R[i];
        let dx = Math.cos(a), dy = Math.sin(a);
        if (s === 2) dx -= B * 0.15;
        M += dx;
        Q.arrow(g, x - dx * 13, y - dy * 9, x + dx * 13, y + dy * 9, s === 0 ? "c" : "b", s === 0 ? "fc" : "fb");
      }
      M /= 48;
      if (B > 0) { Q.arrow(g, 390, 120, 390 + 100 * B, 120, "d", "fd"); txt(g, 390, 105, "외부 자기장", "s td"); }
      txt(g, 390, 170, "자화 " + num(M, 2), "s");
      read.textContent = ["강자성체", "상자성체", "반자성체"][s] + `: 외부 자기장 ${num(B)}에서 평균 자화 ${num(M, 2)} (오른쪽이 +)`;
    }, (k, v) => k === "s" ? ["강자성", "상자성", "반자성"][v] : num(v));
  });

  // 외르스테드: 도선 자기장 B = 2e-7 I / r 과 지구 자기장 3e-5 T의 합
  Q.def("phy-wire", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ I, r }) => {
      clear(g);
      const Bw = 2e-7 * I / (r / 100), Be = 3e-5, th = Math.atan2(Bw, Be), cx = 180, cy = 130, L = 70;
      el("circle", { cx, cy, r: 85, class: "gd" }, g);
      Q.line(g, cx, 20, cx, 230, "gd"); txt(g, cx + 6, 30, "북", "s"); txt(g, cx + 92, cy + 4, "동", "s");
      const ux = Math.sin(th), uy = -Math.cos(th);
      el("path", { d: `M${cx + ux * L} ${cy + uy * L} L${cx - uy * 8} ${cy + ux * 8} L${cx - ux * L} ${cy - uy * L} L${cx + uy * 8} ${cy - ux * 8} Z`, class: "lk" }, g);
      el("path", { d: `M${cx + ux * L} ${cy + uy * L} L${cx - uy * 8} ${cy + ux * 8} L${cx + uy * 8} ${cy - ux * 8} Z`, class: "fd" }, g);
      const bx = 330, s = 2e6;
      Q.arrow(g, bx, 180, bx, 180 - Be * s, "b", "fb"); txt(g, bx - 6, 196, "지구", "s");
      if (Bw > 1e-9) Q.arrow(g, bx, 180, bx + Math.min(170, Bw * s), 180, "c", "fc");
      txt(g, bx + 40, 196, "도선", "s tc");
      read.textContent = `도선의 자기장 ${num(Bw * 1e5, 2)} × 10⁻⁵ T, 바늘이 돌아간 각 ${num(th * 180 / Math.PI, 1)}°`;
    });
  });

  // 전자기 유도: 자석이 코일을 지날 때 Φ(t) = exp(-(v t)^2), V = -N dΦ/dt
  Q.def("phy-induce", (fig, svg) => {
    const F1 = Q.frame(-3, 3, 0, 1.1, 60, 500, 20, 100), F2 = Q.frame(-3, 3, -6, 6, 60, 500, 130, 240);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ v, N }) => {
      clear(g);
      const phi = (t) => Math.exp(-((v * t) ** 2)), emf = (t) => N / 100 * 2 * v * v * t * Math.exp(-((v * t) ** 2));
      Q.line(g, 60, 100, 500, 100, "ax"); Q.line(g, 60, F2.y(0), 500, F2.y(0), "ax");
      txt(g, 64, 30, "자기 선속", "s"); txt(g, 64, 140, "유도 기전력", "s");
      txt(g, 500, 252, "시간", "s", "end");
      Q.plot(g, F1, phi, "b", -3, 3, 200); Q.plot(g, F2, emf, "c", -3, 3, 200);
      const peak = N / 100 * Math.SQRT2 * v * Math.exp(-0.5);
      read.textContent = `빠르기 ${num(v)}, 감은 수 ${N}: 기전력의 최댓값 ${num(peak, 2)} (상댓값). 자석이 코일 한가운데에 있는 순간(선속이 최대)에는 기전력이 0이다`;
    });
  });

  // 이중 슬릿: L = 1 m, 스크린 ±10 mm, 밝기 cos²(π d x / (L λ))
  Q.def("phy-dslit", (fig, svg) => {
    const F = Q.frame(-10, 10, 0, 1.05, 40, 480, 110, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lam, d }) => {
      clear(g);
      const I = (x) => Math.cos(Math.PI * (d * 1e-3) * (x * 1e-3) / (lam * 1e-9)) ** 2;
      const hue = 270 - (lam - 400) / 300 * 270;
      for (let i = 0; i < 220; i++) {
        const x = -10 + i * 20 / 220;
        el("rect", { x: F.x(x), y: 20, width: 2.2, height: 70, fill: `hsl(${hue},90%,${num(8 + 52 * I(x), 0)}%)` }, g);
      }
      Q.line(g, 40, 200, 480, 200, "ax");
      Q.plot(g, F, I, "a", -10, 10, 400);
      for (let x = -10; x <= 10; x += 5) txt(g, F.x(x), 214, `${x}`, "s", "middle");
      txt(g, 480, 104, "mm", "s", "end");
      const dx = 1 * lam * 1e-9 / (d * 1e-3) * 1e3;
      read.textContent = `λ = ${lam} nm, d = ${num(d, 2)} mm: 무늬 간격 Δx = Lλ/d = ${num(dx, 2)} mm`;
    });
  });

  // 볼록 렌즈 작도: f = 10 cm, 물체 높이 2 cm, 1 cm = 6 px
  Q.def("phy-lens", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), L = 290, Y = 130, u = 6, f = 10, h = 2;
    Q.bind(fig, ({ a }) => {
      clear(g);
      const X = (c) => L + c * u, H = (c) => Y - c * u * 3;
      Q.line(g, 10, Y, 510, Y, "ax");
      el("path", { d: `M${L} ${Y - 100} Q${L + 16} ${Y} ${L} ${Y + 100} Q${L - 16} ${Y} ${L} ${Y - 100} Z`, class: "lb" }, g);
      for (const c of [-f, f]) { Q.dot(g, X(c), Y, "fk", 3); txt(g, X(c), Y + 16, "F", "s", "middle"); }
      Q.arrow(g, X(-a), Y, X(-a), H(h), "c", "fc");
      if (Math.abs(a - f) < 1e-9) { read.textContent = "물체가 초점에 있으면 빛이 나란히 나가 상이 생기지 않는다"; Q.line(g, X(-a), H(h), L, H(h), "d"); Q.line(g, L, H(h), 510, H(h) + (510 - L) * h * 3 / f, "d"); Q.line(g, X(-a), H(h), 510, H(h) + (510 - X(-a)) * h * 3 * u / (a * u), "a"); return; }
      const b = a * f / (a - f), m = b / a, hi = -h * m;
      const ext = (x1, y1, x2, y2, xe) => [xe, y1 + (y2 - y1) * (xe - x1) / (x2 - x1)];
      Q.line(g, X(-a), H(h), L, H(h), "d");
      let [ex, ey] = ext(L, H(h), X(f), Y, 510); Q.line(g, L, H(h), ex, ey, "d");
      [ex, ey] = ext(X(-a), H(h), L, Y, 510); Q.line(g, X(-a), H(h), ex, ey, "a");
      if (b > 0) {
        if (X(b) < 515) Q.arrow(g, X(b), Y, X(b), H(hi), "b", "fb");
      } else {
        const xb = Math.max(10, X(b));
        el("line", { x1: L, y1: H(h), x2: xb, y2: ext(L, H(h), X(f), Y, xb)[1], class: "gd" }, g);
        el("line", { x1: X(-a), y1: H(h), x2: xb, y2: ext(X(-a), H(h), L, Y, xb)[1], class: "gd" }, g);
        if (X(b) > 10) Q.arrow(g, X(b), Y, X(b), H(hi), "b", "fb");
      }
      read.textContent = `a = ${a} cm → b = ${num(b, 1)} cm, 배율 ${num(Math.abs(m), 2)}배, ` + (b > 0 ? "거꾸로 선 실상" : "바로 선 허상(렌즈 앞쪽)");
    });
  });

  // 광전 효과: 나트륨 W = 2.3 eV, E = 1240/λ
  Q.def("phy-photo", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lam, I }) => {
      clear(g);
      const E = 1240 / lam, K = E - 2.3, hue = Math.max(0, Math.min(270, 270 - (lam - 400) / 300 * 270));
      el("rect", { x: 40, y: 160, width: 220, height: 30, class: "lk" }, g); txt(g, 150, 180, "나트륨", "s", "middle");
      for (let i = 0; i < I * 2; i++) {
        const x = 60 + i * 20;
        el("line", { x1: x - 30, y1: 30, x2: x, y2: 155, stroke: lam < 380 ? "#8a5cf6" : `hsl(${hue},85%,50%)`, "stroke-width": 2 }, g);
        if (K > 0) Q.arrow(g, x + 5, 155, x + 5 + 18, 155 - 20 - K * 25, "b", "fb");
      }
      const bx = 330;
      el("rect", { x: bx, y: 200 - E * 40, width: 40, height: E * 40, class: "lc" }, g); txt(g, bx + 20, 215, "광자", "s", "middle");
      Q.line(g, bx - 10, 200 - 2.3 * 40, bx + 130, 200 - 2.3 * 40, "d"); txt(g, bx + 132, 200 - 2.3 * 40 + 4, "일함수", "s td");
      if (K > 0) { el("rect", { x: bx + 70, y: 200 - K * 40, width: 40, height: K * 40, class: "lb" }, g); }
      txt(g, bx + 90, 215, "전자", "s", "middle");
      read.textContent = K > 0
        ? `광자 ${num(E, 2)} eV → 전자의 최대 운동 에너지 ${num(K, 2)} eV, 튀어나오는 전자 수는 세기에 비례(${I * 2}개)`
        : `광자 ${num(E, 2)} eV가 일함수 2.3 eV보다 작아 세기가 ${I}이어도 전자가 나오지 않는다`;
    });
  });

  // 수소 준위: E_n = -13.6/n², n → 2 전이의 파장
  Q.def("phy-hydrogen", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), Y = (E) => 30 + (-E) * 52;
    const col = { 3: "#e53935", 4: "#1fb6c9", 5: "#5b5cff", 6: "#7a3cff" };
    Q.bind(fig, ({ n }) => {
      clear(g);
      for (let k = 2; k <= 6; k++) { const E = -13.6 / k / k; Q.line(g, 40, Y(E), 240, Y(E), "k"); txt(g, 250, Y(E) + 4, `n=${k}  ${num(E, 2)} eV`, "s"); }
      Q.line(g, 40, Y(0), 240, Y(0), "gd"); txt(g, 250, Y(0) + 4, "0 eV", "s");
      const Em = -13.6 / n / n, E2 = -3.4, dE = Em - E2, lam = 1240 / dE;
      Q.arrow(g, 140, Y(Em), 140, Y(E2), "c", "fc");
      el("rect", { x: 390, y: 40, width: 110, height: 170, fill: "#111" }, g);
      for (const k of [3, 4, 5, 6]) { const l = 1240 / (-13.6 / k / k + 3.4), x = 390 + (l - 400) / 300 * 110; el("rect", { x, y: 40, width: 2.5, height: 170, fill: col[k], opacity: k === n ? 1 : 0.25 }, g); }
      txt(g, 390, 226, "400", "s"); txt(g, 500, 226, "700 nm", "s", "end");
      read.textContent = `n=${n} → n=2: 에너지 차 ${num(dE, 2)} eV, 파장 ${num(lam, 0)} nm`;
    });
  });

  // 에너지띠: 띠 간격 Eg → LED 파장 1240/Eg, 전압 ≈ Eg
  Q.def("phy-band", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ g: Eg }) => {
      clear(g);
      const lam = 1240 / Eg, top = 160 - Eg * 35;
      el("rect", { x: 40, y: 160, width: 200, height: 40, class: "lb" }, g); txt(g, 140, 185, "원자가 띠", "s", "middle");
      el("rect", { x: 40, y: top - 40, width: 200, height: 40, class: "lk" }, g); txt(g, 140, top - 15, "전도띠", "s", "middle");
      Q.line(g, 250, top, 250, 160, "c"); txt(g, 256, (top + 160) / 2 + 4, `${num(Eg, 1)} eV`, "s tc");
      Q.dot(g, 110, top - 8, "fb", 5); Q.arrow(g, 110, top - 2, 110, 158, "b", "fb");
      const vis = lam >= 380 && lam <= 750, hue = Math.max(0, Math.min(270, 270 - (lam - 400) / 300 * 270));
      el("circle", { cx: 400, cy: 110, r: 50, fill: vis ? `hsl(${hue},90%,55%)` : "none", class: vis ? "" : "gd" }, g);
      txt(g, 400, 190, vis ? `${num(lam, 0)} nm` : lam > 750 ? `${num(lam, 0)} nm 적외선` : `${num(lam, 0)} nm 자외선`, "s", "middle");
      read.textContent = `띠 간격 ${num(Eg, 1)} eV → 파장 ${num(lam, 0)} nm` + (vis ? "" : "(눈에 보이지 않음)") + `, 켜는 데 약 ${num(Eg, 1)} V 이상 필요`;
    });
  });

  // 빛 시계: 높이 L, 속력 b = v/c 일 때 빗변 길이와 시간 팽창
  Q.def("phy-lclock", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), L = 150, top = 40, bot = 190;
    Q.bind(fig, ({ b }) => {
      clear(g);
      const gam = 1 / Math.sqrt(1 - b * b), dx = b * gam * L;
      for (const x of [80]) { Q.line(g, x - 25, top, x + 25, top, "k"); Q.line(g, x - 25, bot, x + 25, bot, "k"); Q.line(g, x, bot, x, top, "b"); }
      txt(g, 80, 220, "정지한 시계", "s", "middle");
      const x0 = 190, x1 = Math.min(500, x0 + dx);
      Q.line(g, x0 - 25, bot, x0 + 25, bot, "gd"); Q.line(g, x1 - 25, top, x1 + 25, top, "k"); Q.line(g, x1 - 25, bot, x1 + 25, bot, "gd");
      Q.line(g, x0, bot, x1, top, "c");
      if (dx > 4) Q.line(g, x0, bot + 12, x1, bot + 12, "d");
      txt(g, (x0 + x1) / 2, 220, `움직이는 시계 (시간 ${num(gam, 2)}배)`, "s", "middle");
      read.textContent = `v = ${num(b, 2)}c: 빛의 경로가 ${num(gam, 2)}배 길어져 한 번 오르는 데 걸리는 시간도 ${num(gam, 2)}배`;
    });
  });

  // 열기관: Q1을 받아 W를 하고 Q2를 버린다
  Q.def("phy-engine", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ q1, q2 }) => {
      clear(g);
      const Q2 = Math.min(q2, q1), W = q1 - Q2, k = 1.6;
      el("rect", { x: 40, y: 20, width: 140, height: 40, class: "ld" }, g); txt(g, 110, 45, "고열원", "s", "middle");
      el("rect", { x: 40, y: 180, width: 140, height: 40, class: "lb" }, g); txt(g, 110, 205, "저열원", "s", "middle");
      el("circle", { cx: 110, cy: 120, r: 26, class: "gd" }, g); txt(g, 110, 125, "기관", "s", "middle");
      Q.arrow(g, 110, 60, 110, 94, "d", "fd"); Q.arrow(g, 110, 146, 110, 180, "b", "fb"); Q.arrow(g, 136, 120, 200, 120, "c", "fc");
      txt(g, 206, 124, "W", "s tc");
      const bx = 280;
      el("rect", { x: bx, y: 40, width: q1 * k, height: 26, class: "ld" }, g); txt(g, bx - 6, 58, "Q₁", "s", "end");
      el("rect", { x: bx, y: 90, width: W * k, height: 26, class: "lc" }, g); txt(g, bx - 6, 108, "W", "s", "end");
      el("rect", { x: bx + W * k, y: 90, width: Q2 * k, height: 26, class: "lb" }, g); txt(g, bx - 6, 158, "효율", "s", "end");
      txt(g, bx, 158, `${num(q1 ? W / q1 * 100 : 0, 0)}%`, "s tc");
      read.textContent = q2 > q1 ? "버린 열은 받은 열보다 클 수 없다(Q₂ = Q₁로 계산)" : `W = ${q1} − ${Q2} = ${W} kJ, 효율 ${num(W / q1 * 100, 0)}%` + (Q2 === 0 ? " (실제로는 불가능한 경우)" : "");
    });
  });

  // 롤러코스터: 궤도 높이 h(s), 역학적 에너지 보존 (m = 500 kg, h0 = 40 m)
  Q.def("phy-coaster", (fig, svg) => {
    const H = (s) => 40 * (0.5 + 0.5 * Math.cos(Math.PI * s * 2.2)) * (1 - 0.45 * s) + 0 * s;   // 처음 40 m에서 내려갔다 오르는 모양
    const X = (s) => 30 + s * 300, Y = (h) => 220 - h * 4.5, m = 500, g0 = 10, E = m * g0 * H(0);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    let d = ""; for (let i = 0; i <= 100; i++) { const s = i / 100; d += (i ? "L" : "M") + X(s) + " " + Y(H(s)); }
    el("path", { d, class: "k" }, bg); Q.line(bg, 20, Y(0), 340, Y(0), "ax");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const h = H(x), U = m * g0 * h, K = E - U, v = Math.sqrt(2 * K / m);
      Q.dot(g, X(x), Y(h) - 6, "fd", 7);
      const bx = 380, sc = 180 / E;
      el("rect", { x: bx, y: 220 - U * sc, width: 40, height: U * sc, class: "lb" }, g);
      el("rect", { x: bx + 60, y: 220 - K * sc, width: 40, height: K * sc, class: "lc" }, g);
      el("rect", { x: bx - 8, y: 40, width: 124, height: 180, class: "gd" }, g);
      txt(g, bx + 20, 238, "퍼텐셜", "s", "middle"); txt(g, bx + 80, 238, "운동", "s", "middle");
      read.textContent = `높이 ${num(h, 1)} m: 퍼텐셜 ${num(U / 1000, 1)} kJ + 운동 ${num(K / 1000, 1)} kJ = ${num(E / 1000, 0)} kJ, 속력 ${num(v, 1)} m/s`;
    }, (k, v) => num(v, 2));
  });

  // 운동량 보존: A 2 kg, 3 m/s → 정지한 B (탄성 충돌 또는 붙음)
  Q.def("phy-collide", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), mA = 2, vA = 3;
    Q.bind(fig, ({ m, s }) => {
      clear(g);
      let a2, b2;
      if (s) { a2 = b2 = mA * vA / (mA + m); }
      else { a2 = (mA - m) / (mA + m) * vA; b2 = 2 * mA / (mA + m) * vA; }
      const row = (y, label, va, vb) => {
        txt(g, 20, y + 4, label, "s");
        el("rect", { x: 80, y: y - 14, width: 40, height: 28, class: "lc" }, g); txt(g, 100, y + 4, "A", "s", "middle");
        el("rect", { x: 140, y: y - 14, width: 40, height: 28, class: "lb" }, g); txt(g, 160, y + 4, "B", "s", "middle");
        txt(g, 200, y + 4, `vA ${num(va, 2)}, vB ${num(vb, 2)} m/s`, "s");
        const pA = mA * va, pB = m * vb, X0 = 350, k = 15;
        el("rect", { x: Math.min(X0, X0 + pA * k), y: y - 12, width: Math.abs(pA * k), height: 10, class: "lc" }, g);
        el("rect", { x: X0 + Math.max(0, pA) * k + Math.min(0, pB) * k, y: y + 2, width: Math.abs(pB * k), height: 10, class: "lb" }, g);
        Q.line(g, X0, y - 16, X0, y + 16, "ax");
      };
      row(60, "충돌 전", vA, 0);
      row(140, "충돌 후", a2, b2);
      txt(g, 360, 200, "운동량 막대: 노랑 A, 파랑 B", "s");
      const KE0 = 0.5 * mA * vA * vA, KE1 = 0.5 * mA * a2 * a2 + 0.5 * m * b2 * b2;
      read.textContent = `운동량 합: 전 ${num(mA * vA, 2)}, 후 ${num(mA * a2 + m * b2, 2)} kg·m/s / 운동 에너지: 전 ${num(KE0, 2)} J, 후 ${num(KE1, 2)} J`;
    }, (k, v) => k === "s" ? (v ? "붙는다" : "튕긴다(탄성)") : num(v));
  });

  // F = ma: 수레와 속도-시간 그래프 (처음 속도 2 m/s, 5초)
  Q.def("phy-fma", (fig, svg) => {
    const F0 = Q.frame(0, 5, 0, 30, 270, 500, 20, 220);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ F, m }) => {
      clear(g);
      const a = F / m;
      Q.line(g, 20, 150, 240, 150, "k");
      const w = 30 + m * 10;
      el("rect", { x: 60, y: 150 - 30, width: w, height: 30, class: "lb" }, g); el("rect", { x: 60, y: 120, width: w, height: 30, class: "k" }, g);
      txt(g, 60 + w / 2, 140, `${num(m)} kg`, "s", "middle");
      if (F) Q.arrow(g, 60 + w, 135, 60 + w + F * 8, 135, "d", "fd");
      txt(g, 130, 190, `a = F/m = ${num(a, 2)} m/s²`, "s td", "middle");
      Q.line(g, F0.X0, F0.Y1, F0.X1, F0.Y1, "ax"); Q.line(g, F0.X0, F0.Y1, F0.X0, F0.Y0, "ax");
      txt(g, F0.X1, F0.Y1 + 16, "시간(s)", "s", "end"); txt(g, F0.X0 + 4, F0.Y0 + 8, "속도(m/s)", "s");
      Q.plot(g, F0, (t) => { const v = 2 + a * t; return v <= 30 ? v : NaN; }, "b", 0, 5);
      read.textContent = `F = ${F} N, m = ${num(m)} kg: 가속도 ${num(a, 2)} m/s², 5초 뒤 속도 ${num(2 + 5 * a, 2)} m/s`;
    });
  });

  // 시소: 아이 30 kg이 2 m, 어른 60 kg이 d m
  Q.def("phy-seesaw", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 260, cy = 150, u = 80;
    Q.bind(fig, ({ d }) => {
      clear(g);
      const tl = 30 * 2, tr = 60 * d, net = tr - tl, ang = Math.max(-12, Math.min(12, net / 6)) * Math.PI / 180;
      const P = (x) => [cx + x * u * Math.cos(ang), cy + x * u * Math.sin(ang)];
      el("path", { d: `M${cx} ${cy} l-18 40 h36 Z`, class: "lk" }, g); el("path", { d: `M${cx} ${cy} l-18 40 h36 Z`, class: "k" }, g);
      const [ax, ay] = P(-3), [bx, by] = P(3);
      Q.line(g, ax, ay, bx, by, "k");
      const [kx, ky] = P(-2), [px, py] = P(d);
      el("circle", { cx: kx, cy: ky - 16, r: 14, class: "lb" }, g); txt(g, kx, ky - 12, "30", "s", "middle");
      el("circle", { cx: px, cy: py - 22, r: 20, class: "lc" }, g); txt(g, px, py - 18, "60", "s", "middle");
      Q.arrow(g, kx, ky, kx, ky + 40, "b", "fb"); Q.arrow(g, px, py, px, py + 60, "c", "fc");
      txt(g, 20, 30, `왼쪽 돌림힘 30g × 2 = ${tl}g`, "s tb"); txt(g, 500, 30, `오른쪽 돌림힘 60g × ${num(d)} = ${num(tr)}g`, "s tc", "end");
      read.textContent = Math.abs(net) < 1e-9 ? "돌림힘이 같아 수평을 유지한다" : net > 0 ? "어른 쪽 돌림힘이 커서 오른쪽으로 기운다" : "아이 쪽 돌림힘이 커서 왼쪽으로 기운다";
    });
  });
})();
