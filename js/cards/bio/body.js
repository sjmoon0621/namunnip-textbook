/* 생명과학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const gauss = (r) => { const u = r() || 1e-9, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  // 구성 단계: 세포 → 조직 → 기관 → 기관계 → 개체
  Q.def("bio-levels", (fig, svg) => {
    const L = [
      ["세포", "근육 세포", "약 0.01 mm"], ["조직", "근육 조직", "약 1 mm"], ["기관", "심장", "약 12 cm"],
      ["기관계", "순환계", "약 1 m"], ["개체", "사람", "약 1.7 m"]
    ];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      L.forEach(([n], i) => {
        const on = i <= k, x = 30 + i * 95;
        el("rect", { x, y: 170, width: 85, height: 30, class: i === k ? "lc" : on ? "lb" : "gd" }, g);
        txt(g, x + 42, 190, n, "s", "middle");
        if (i < 4) Q.line(g, x + 85, 185, x + 95, 185, "k");
      });
      const cx = 260, cy = 85;
      if (k === 0) { el("ellipse", { cx, cy, rx: 60, ry: 18, class: "la" }, g); Q.dot(g, cx, cy, "fk", 5); }
      if (k === 1) for (let i = 0; i < 5; i++) el("ellipse", { cx, cy: 45 + i * 20, rx: 90, ry: 9, class: "la" }, g);
      if (k === 2) el("path", { d: `M${cx} 140 C ${cx - 90} 80 ${cx - 50} 20 ${cx} 55 C ${cx + 50} 20 ${cx + 90} 80 ${cx} 140 Z`, class: "ld" }, g);
      if (k === 3) { el("path", { d: `M${cx} 110 C ${cx - 30} 90 ${cx - 20} 70 ${cx} 82 C ${cx + 20} 70 ${cx + 30} 90 ${cx} 110 Z`, class: "ld" }, g); for (const s of [-1, 1]) el("path", { d: `M${cx} 95 Q ${cx + s * 120} 30 ${cx + s * 100} 150`, class: "d" }, g); }
      if (k === 4) { el("circle", { cx, cy: 30, r: 16, class: "lb" }, g); el("rect", { x: cx - 22, y: 48, width: 44, height: 60, class: "lb" }, g); Q.line(g, cx - 12, 108, cx - 16, 155, "k"); Q.line(g, cx + 12, 108, cx + 16, 155, "k"); }
      const [n, ex, size] = L[k];
      read.textContent = `${n} 단계, 예 ${ex}, 크기 ${size}`;
    }, (k, v) => L[v][0]);
  });

  // 세포 호흡: 포도당 1 mol 2870 kJ, ATP 32 mol × 30.5 kJ
  Q.def("bio-atp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const n = m / 180, E = 2870 * n, atp = 32 * n, Ea = atp * 30.5, H = E - Ea, s = 380 / 2870;
      el("rect", { x: 60, y: 50, width: E * s, height: 34, class: "ld" }, g); txt(g, 54, 72, "포도당", "s", "end");
      el("rect", { x: 60, y: 120, width: Ea * s, height: 34, class: "lc" }, g);
      el("rect", { x: 60 + Ea * s, y: 120, width: H * s, height: 34, class: "lk" }, g);
      txt(g, 54, 142, "분해 후", "s", "end");
      if (Ea > 60) txt(g, 60 + Ea * s / 2, 142, "ATP", "s", "middle");
      if (H > 100) txt(g, 60 + Ea * s + H * s / 2, 142, "열", "s", "middle");
      txt(g, 60, 190, `ATP ${num(atp, 1)} mol 생성`, "s");
      read.textContent = `포도당 ${m} g (${num(n, 2)} mol): 에너지 ${num(E, 0)} kJ → ATP에 ${num(Ea, 0)} kJ, 열 ${num(H, 0)} kJ`;
    });
  });

  // 운동 강도 x: 산소 소비 0.25 → 3 L/분, 심장 박동 70 → 190, 호흡 12 → 45
  Q.def("bio-exercise", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const o2 = 0.25 + 2.75 * x, hr = 70 + 120 * x, br = 12 + 33 * x;
      const B = [["산소 소비", o2 / 3, `${num(o2, 2)} L/분`, "lb"], ["심장 박동", hr / 190, `${num(hr, 0)}회/분`, "ld"], ["호흡", br / 45, `${num(br, 0)}회/분`, "lc"]];
      B.forEach(([n, f, v, cls], i) => {
        const y = 30 + i * 60;
        txt(g, 100, y + 22, n, "s", "end");
        el("rect", { x: 110, y, width: 330, height: 32, class: "gd" }, g);
        el("rect", { x: 110, y, width: 330 * f, height: 32, class: cls }, g);
        txt(g, 446, y + 22, v, "s");
      });
      read.textContent = `운동 강도 ${num(x, 1)}: 산소 소비 ${num(o2, 2)} L/분, 심장 박동 ${num(hr, 0)}회/분, 호흡 ${num(br, 0)}회/분`;
    });
  });

  // 몸무게 모형: dW/dt = (I − 33W)/7700 (일), W0 = 60 kg, 3년
  Q.def("bio-weight", (fig, svg) => {
    const F = Q.frame(0, 3, 40, 100, 60, 470, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ I }) => {
      clear(g);
      const We = I / 33, k = 33 / 7700, W = (yr) => We + (60 - We) * Math.exp(-k * yr * 365);
      Q.line(g, 60, 200, 470, 200, "ax"); Q.line(g, 60, 200, 60, 20, "ax");
      for (const w of [40, 60, 80, 100]) txt(g, 54, F.y(w) + 4, `${w}`, "s", "end");
      for (const y of [0, 1, 2, 3]) txt(g, F.x(y), 216, `${y}년`, "s", "middle");
      Q.line(g, 60, F.y(We), 470, F.y(We), "gd"); txt(g, 466, F.y(We) - 6, `균형 ${num(We, 1)} kg`, "s", "end");
      Q.plot(g, F, W, "b", 0, 3, 200);
      Q.plot(g, F, (y) => 60 + (I - 1980) * y * 365 / 7700, "d", 0, 3, 50);
      txt(g, 66, 32, "곧은 선은 소비가 그대로라고 본 계산", "s td");
      read.textContent = `하루 ${I} kcal: 1년 뒤 ${num(W(1), 1)} kg, 3년 뒤 ${num(W(3), 1)} kg, 균형점 ${num(We, 1)} kg`;
    });
  });

  // 에너지 피라미드: 생산자 10000 kJ, 전달 비율 e%
  Q.def("bio-pyramid", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const N = ["생산자", "1차 소비자", "2차 소비자", "3차 소비자"], C = ["la", "lb", "lc", "ld"];
    Q.bind(fig, ({ e }) => {
      clear(g);
      const E = [10000]; for (let i = 1; i < 4; i++) E.push(E[i - 1] * e / 100);
      E.forEach((v, i) => {
        const w = Math.max(4, 360 * Math.sqrt(v / 10000)), y = 180 - i * 46;
        el("rect", { x: 220 - w / 2, y, width: w, height: 40, class: C[i] }, g);
        txt(g, 410, y + 25, `${N[i]} ${num(v, v < 10 ? 1 : 0)} kJ`, "s");
      });
      read.textContent = `전달 비율 ${e}%: ` + E.map((v, i) => `${N[i]} ${num(v, v < 10 ? 1 : 0)}`).join(", ") + ` kJ (3차 소비자는 생산자의 ${num(E[3] / 100, 3)}%)`;
    });
  });

  // 로지스틱 생장 N(t) = K / (1 + (K/N0 − 1) e^(−rt)), N0 = 10
  Q.def("bio-logistic", (fig, svg) => {
    const F = Q.frame(0, 20, 0, 1100, 60, 480, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ K, r }) => {
      clear(g);
      const N = (t) => K / (1 + (K / 10 - 1) * Math.exp(-r * t));
      Q.line(g, 60, 200, 480, 200, "ax"); Q.line(g, 60, 200, 60, 20, "ax");
      for (const n of [0, 500, 1000]) txt(g, 54, F.y(n) + 4, `${n}`, "s", "end");
      for (const t of [0, 5, 10, 15, 20]) txt(g, F.x(t), 216, `${t}`, "s", "middle");
      txt(g, 480, 230, "시간(세대)", "s", "end");
      Q.line(g, 60, F.y(K), 480, F.y(K), "gd"); txt(g, 476, F.y(K) - 6, "K", "s", "end");
      Q.plot(g, F, (t) => 10 * Math.exp(r * t), "d", 0, 20, 200).setAttribute("stroke-dasharray", "4 4");
      Q.plot(g, F, N, "b", 0, 20, 200);
      const th = Math.log(K / 10 - 1) / r;
      read.textContent = `K = ${K}, r = ${num(r, 1)}: 개체 수가 K/2 = ${K / 2}에 이르는 때 약 ${num(th, 1)}세대, 10세대 뒤 ${num(N(10), 0)}마리`;
    });
  });

  // 활동 전위 막전위 (mV), 자극 t = 0.5 ms
  const ss = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
  const apV = (t) => t < 0.5 ? -70 : t < 1 ? -70 + 15 * (t - 0.5) / 0.5 : t < 1.5 ? -55 + 85 * ss(1, 1.5, t) : t < 2.6 ? 30 - 110 * ss(1.5, 2.6, t) : -70 - 10 * Math.exp(-(t - 2.6) / 0.8);
  Q.def("bio-ap", (fig, svg) => {
    const F = Q.frame(0, 6, -90, 40, 60, 330, 20, 200);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, 60, 200, 330, 200, "ax"); Q.line(bg, 60, 200, 60, 20, "ax");
    for (const v of [-70, -55, 0, 30]) { txt(bg, 54, F.y(v) + 4, `${v}`, "s", "end"); }
    Q.line(bg, 60, F.y(-55), 330, F.y(-55), "gd"); txt(bg, 326, F.y(-55) - 4, "역치", "s", "end");
    for (const t of [0, 2, 4, 6]) txt(bg, F.x(t), 216, `${t}`, "s", "middle");
    txt(bg, 330, 230, "시간 (ms)", "s", "end"); txt(bg, 66, 16, "막전위 (mV)", "s");
    Q.plot(bg, F, apV, "b", 0, 6, 300);
    Q.bind(fig, ({ t }) => {
      clear(g);
      const v = apV(t), dv = apV(t + 0.02) - v;
      Q.dot(g, F.x(t), F.y(v), "fd", 5);
      let st;
      if (t < 0.5) st = "휴지 상태, Na⁺ 통로 닫힘";
      else if (v < -55 && dv > 0) st = "자극으로 역치를 향해 오르는 중";
      else if (dv > 0) st = "탈분극, Na⁺ 통로 열림, Na⁺ 유입";
      else if (v > -70) st = "재분극, K⁺ 통로 열림, K⁺ 유출";
      else st = v < -71 ? "과분극, K⁺ 통로가 늦게 닫힘" : "휴지 상태로 회복";
      const naOpen = t >= 1 && t < 1.5, kOpen = t >= 1.5 && t < 3.6;
      el("rect", { x: 380, y: 50, width: 110, height: 40, class: naOpen ? "lc" : "gd" }, g); txt(g, 435, 75, "Na⁺ 통로", "s", "middle");
      el("rect", { x: 380, y: 120, width: 110, height: 40, class: kOpen ? "lb" : "gd" }, g); txt(g, 435, 145, "K⁺ 통로", "s", "middle");
      read.textContent = `${num(t, 1)} ms: 막전위 ${num(v, 0)} mV, ${st}`;
    });
  });

  // 시냅스: 틈의 농도 C(t) = t e^(1 − t/τ)/τ, 반응 = C × 수용체 비율
  Q.def("bio-synapse", (fig, svg) => {
    const F = Q.frame(0, 10, 0, 1.1, 60, 480, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const D = [["약물 없음", 1, 1], ["재흡수 억제제", 3, 1], ["수용체 차단제", 1, 0.3]];
    Q.bind(fig, ({ d }) => {
      clear(g);
      const [nm, tau, rec] = D[d], C = (t) => t / tau * Math.exp(1 - t / tau), R = (t) => C(t) * rec;
      Q.line(g, 60, 200, 480, 200, "ax"); Q.line(g, 60, 200, 60, 20, "ax");
      for (const t of [0, 2, 4, 6, 8, 10]) txt(g, F.x(t), 216, `${t}`, "s", "middle");
      txt(g, 480, 230, "분비 후 시간 (ms)", "s", "end");
      Q.plot(g, F, (t) => t * Math.exp(1 - t), "k", 0, 10, 200).setAttribute("stroke-dasharray", "3 4");
      Q.plot(g, F, C, "c", 0, 10, 200); Q.plot(g, F, R, "b", 0, 10, 200);
      txt(g, 300, 40, "주황 틈의 전달 물질 농도", "s tc"); txt(g, 300, 60, "파랑 다음 뉴런의 반응", "s tb"); txt(g, 300, 80, "점선 약물이 없을 때", "s");
      let area = 0; for (let t = 0; t < 10; t += 0.01) area += R(t) * 0.01;
      read.textContent = `${nm}: 다음 뉴런이 받은 자극의 총량 ${num(area / 2.718, 2)}배 (약물 없을 때를 1로)`;
    }, (k, v) => ["없음", "재흡수 억제", "수용체 차단"][v]);
  });

  // 반사 경로 시간: 척수 반사 0.8 + 0.6 m, 시냅스 2 / 대뇌 경유 + 0.5 m 왕복, 시냅스 6, 판단 120 ms
  Q.def("bio-reflex", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const S = [80, 150], C = [260, 120], B = [260, 30], M = [80, 190];
      el("rect", { x: 240, y: 95, width: 40, height: 55, class: "la" }, g); txt(g, 290, 140, "척수", "s");
      el("ellipse", { cx: 260, cy: 30, rx: 50, ry: 20, class: "lb" }, g); txt(g, 320, 34, "대뇌", "s");
      el("rect", { x: 40, y: 140, width: 50, height: 22, class: "ld" }, g); txt(g, 30, 156, "손", "s", "end");
      el("rect", { x: 40, y: 182, width: 50, height: 22, class: "lc" }, g); txt(g, 30, 198, "근육", "s", "end");
      Q.arrow(g, S[0] + 10, S[1], C[0] - 20, C[1], "d", "fd");
      if (p) { Q.arrow(g, C[0], C[1] - 25, B[0], B[1] + 20, "b", "fb"); Q.arrow(g, B[0] - 10, B[1] + 20, C[0] - 10, C[1] - 25, "b", "fb"); }
      Q.arrow(g, C[0] - 20, C[1] + 25, M[0] + 10, M[1], "c", "fc");
      const cond = (0.8 + 0.6 + (p ? 1.0 : 0)) / 60 * 1000, syn = (p ? 6 : 2) * 0.5, think = p ? 120 : 0, T = cond + syn + think;
      txt(g, 360, 110, `전도 ${num(cond, 1)} ms`, "s"); txt(g, 360, 135, `시냅스 ${num(syn, 1)} ms`, "s");
      if (p) txt(g, 360, 160, `판단 약 ${think} ms`, "s");
      txt(g, 360, 190, `합계 약 ${num(T, 0)} ms`, "s tc");
      read.textContent = (p ? "대뇌를 거치는 경로" : "척수 반사") + `: 약 ${num(T, 0)} ms`;
    }, (k, v) => v ? "대뇌 경유" : "척수 반사");
  });

  // 혈당 모형 (mg/dL)과 인슐린 (상댓값)
  Q.def("bio-glucose", (fig, svg) => {
    const F = Q.frame(0, 180, 60, 280, 60, 470, 20, 200);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const G = [(t) => 90 + 55 * (t / 30) * Math.exp(1 - t / 30), (t) => 130 + 140 * (1 - Math.exp(-t / 50)) * Math.exp(-t / 400)];
    const In = [(t) => 0.1 + 0.9 * (t / 40) * Math.exp(1 - t / 40), () => 0.03];
    Q.line(bg, 60, 200, 470, 200, "ax"); Q.line(bg, 60, 200, 60, 20, "ax");
    for (const v of [70, 140, 200, 250]) txt(bg, 54, F.y(v) + 4, `${v}`, "s", "end");
    el("rect", { x: 60, y: F.y(140), width: 410, height: F.y(70) - F.y(140), class: "la", opacity: 0.35 }, bg);
    for (const t of [0, 60, 120, 180]) txt(bg, F.x(t), 216, `${t}`, "s", "middle");
    txt(bg, 470, 230, "식사 후 시간 (분)", "s", "end"); txt(bg, 66, 16, "혈당 (mg/dL)", "s");
    Q.bind(fig, ({ t, s }) => {
      clear(g);
      Q.plot(g, F, G[s], "d", 0, 180, 200);
      const FI = Q.frame(0, 180, 0, 1.2, 60, 470, 20, 200);
      Q.plot(g, FI, In[s], "b", 0, 180, 200).setAttribute("stroke-dasharray", "4 4");
      Q.line(g, F.x(t), 20, F.x(t), 200, "gd");
      Q.dot(g, F.x(t), F.y(G[s](t)), "fd", 5);
      txt(g, 466, 36, "빨강 혈당, 파랑 점선 인슐린", "s", "end");
      read.textContent = (s ? "인슐린이 거의 없는 사람" : "건강한 사람") + `, ${t}분: 혈당 약 ${num(G[s](t), 0)} mg/dL, 인슐린 ${num(In[s](t), 2)} (상댓값)`;
    }, (k, v) => k === "s" ? (v ? "인슐린 부족" : "건강") : num(v));
  });

  // 1차, 2차 면역 반응 (로그 눈금 항체 농도)
  Q.def("bio-immune", (fig, svg) => {
    const F = Q.frame(0, 60, 0, 2.3, 60, 480, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const bump = (t, t0, peak, rise) => t < t0 ? 0 : peak * ((t - t0) / rise) ** 2 * Math.exp(2 * (1 - (t - t0) / rise));
    Q.bind(fig, ({ d }) => {
      clear(g);
      const A = (t) => Math.log10(1 + bump(t, 2, 10, 10) + bump(t, d, 100, 4));
      Q.line(g, 60, 200, 480, 200, "ax"); Q.line(g, 60, 200, 60, 20, "ax");
      for (const [v, s] of [[0, "1"], [1, "10"], [2, "100"]]) txt(g, 54, F.y(v) + 4, s, "s", "end");
      for (const t of [0, 10, 20, 30, 40, 50, 60]) txt(g, F.x(t), 216, `${t}`, "s", "middle");
      txt(g, 480, 230, "날짜 (일)", "s", "end"); txt(g, 66, 16, "항체 농도 (상댓값)", "s");
      Q.plot(g, F, A, "b", 0, 60, 400);
      for (const [t, lab] of [[0, "1차 침입"], [d, "2차 침입"]]) { Q.arrow(g, F.x(t), 40, F.x(t), 60, "d", "fd"); txt(g, F.x(t) + 4, 36, lab, "s td"); }
      read.textContent = `1차 반응 최고 약 10 (12일째), 2차 반응 최고 약 100 (${d + 4}일째): 2차가 3배 빠르고 10배 많다`;
    });
  });

  // 혈액형 판정: 항A, 항B 혈청에서의 응집
  Q.def("bio-blood", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const T = [["A", true, false], ["B", false, true], ["AB", true, true], ["O", false, false]];
    const r = rng(5), P = []; for (let i = 0; i < 40; i++) P.push([r(), r()]);
    Q.bind(fig, ({ b }) => {
      clear(g);
      const [n, a, bb] = T[b];
      [["항A 혈청", a, 130], ["항B 혈청", bb, 330]].forEach(([lab, agg, cx]) => {
        el("circle", { cx, cy: 100, r: 70, class: "gd" }, g);
        P.forEach(([u, v], i) => {
          let x = cx - 55 + u * 110, y = 45 + v * 110;
          if (agg) { const k = i % 5, gx = cx - 30 + (k % 3) * 30, gy = 75 + Math.floor(k / 3) * 40; x = gx + (u - 0.5) * 16; y = gy + (v - 0.5) * 16; }
          if (Math.hypot(x - cx, y - 100) < 64) Q.dot(g, x, y, "fd", 4);
        });
        txt(g, cx, 192, lab, "s", "middle"); txt(g, cx, 212, agg ? "응집" : "응집 안 함", "s", "middle");
      });
      read.textContent = `${n}형: 항A 혈청 ${a ? "응집" : "응집 안 함"}, 항B 혈청 ${bb ? "응집" : "응집 안 함"}`;
    }, (k, v) => T[v][0] + "형");
  });

  // 집단 면역: R = R0 (1 − p), 5세대 동안 감염자 수 (처음 10명)
  Q.def("bio-herd", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ R, v }) => {
      clear(g);
      const p = v / 100, Re = R * (1 - p), th = 1 - 1 / R, F = Q.frame(0, 5, 0, 4, 60, 300, 30, 200);
      Q.line(g, 60, 200, 300, 200, "ax"); Q.line(g, 60, 200, 60, 30, "ax");
      for (const e of [0, 1, 2, 3, 4]) txt(g, 54, F.y(e) + 4, ["1", "10", "100", "1천", "1만"][e], "s", "end");
      for (let k = 0; k <= 5; k++) txt(g, F.x(k), 216, `${k}`, "s", "middle");
      txt(g, 300, 230, "전파 세대", "s", "end"); txt(g, 66, 24, "새 감염자 수", "s");
      for (let k = 0; k <= 5; k++) { const n = 10 * Re ** k, y = Math.max(0, Math.min(4, Math.log10(Math.max(1, n)))); el("rect", { x: F.x(k) - 12, y: F.y(y), width: 24, height: 200 - F.y(y), class: Re < 1 ? "lb" : "ld" }, g); }
      el("rect", { x: 340, y: 60, width: 150, height: 24, class: "gd" }, g);
      el("rect", { x: 340, y: 60, width: 150 * p, height: 24, class: "la" }, g);
      Q.line(g, 340 + 150 * th, 52, 340 + 150 * th, 92, "d"); txt(g, 340 + 150 * th, 108, `기준 ${num(th * 100, 0)}%`, "s td", "middle");
      txt(g, 340, 48, `접종률 ${v}%`, "s"); txt(g, 340, 140, `R = ${num(R, 1)} × ${num(1 - p, 2)} = ${num(Re, 2)}`, "s");
      read.textContent = `R₀ ${num(R, 1)}, 접종률 ${v}%: 실제 재생산 수 ${num(Re, 2)} → ` + (Re < 1 ? "감염이 줄어든다(집단 면역)" : "감염이 퍼진다") + `, 필요한 접종률 ${num(th * 100, 0)}% 초과`;
    });
  });

  // DNA 응축 단계
  Q.def("bio-pack", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const L = [["DNA 이중 나선", "약 2 nm"], ["뉴클레오솜 (구슬 꿰미)", "약 11 nm"], ["꼬이고 접힌 염색사", "수백 nm"], ["분열기 염색체", "약 1.4 μm"]];
    Q.bind(fig, ({ k }) => {
      clear(g);
      if (k === 0) { let d1 = "", d2 = ""; for (let x = 20; x <= 500; x += 4) { d1 += (x === 20 ? "M" : "L") + x + " " + (100 + 18 * Math.sin(x / 14)); d2 += (x === 20 ? "M" : "L") + x + " " + (100 - 18 * Math.sin(x / 14)); } el("path", { d: d1, class: "b" }, g); el("path", { d: d2, class: "c" }, g); }
      if (k === 1) { Q.line(g, 20, 100, 500, 100, "b"); for (let x = 50; x < 500; x += 60) { el("circle", { cx: x, cy: 100, r: 18, class: "la" }, g); el("circle", { cx: x, cy: 100, r: 18, class: "b" }, g); } }
      if (k === 2) { let d = ""; for (let i = 0; i <= 300; i++) { const t = i / 300 * 14 * Math.PI, x = 60 + i * 1.3, y = 100 + 40 * Math.sin(t) * Math.cos(t / 7); d += (i ? "L" : "M") + x + " " + y; } el("path", { d, class: "b" }, g); }
      if (k === 3) { for (const s of [-1, 1]) el("path", { d: `M${260 + s * 14} 20 Q${260 + s * 4} 100 ${260 + s * 14} 180`, class: "b", style: "stroke-width:16;stroke-linecap:round" }, g); Q.dot(g, 260, 100, "fd", 6); }
      L.forEach(([n], i) => { el("rect", { x: 20 + i * 125, y: 190, width: 115, height: 22, class: i === k ? "lc" : "gd" }, g); txt(g, 77 + i * 125, 206, ["DNA", "뉴클레오솜", "염색사", "염색체"][i], "s", "middle"); });
      read.textContent = `${L[k][0]}, 굵기 ${L[k][1]}`;
    }, (k, v) => ["DNA", "뉴클레오솜", "염색사", "염색체"][v]);
  });

  // 독립 분리: 2^n 조합, n ≤ 3이면 조합을 그린다
  Q.def("bio-assort", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const c = 2 ** n;
      if (n <= 3) {
        for (let i = 0; i < c; i++) {
          const x = 40 + (i % 4) * 115, y = 30 + Math.floor(i / 4) * 80;
          el("rect", { x, y, width: 100, height: 60, class: "gd" }, g);
          for (let j = 0; j < n; j++) { const fromDad = (i >> j) & 1; el("rect", { x: x + 15 + j * 28, y: y + 12, width: 14, height: 36, class: fromDad ? "lb" : "lc" }, g); }
        }
        txt(g, 40, 205, "파랑 아버지에게서 받은 염색체, 주황 어머니에게서 받은 염색체", "s");
      } else {
        const F = Q.frame(1, 23, 0, 7, 60, 480, 30, 180);
        Q.line(g, 60, 180, 480, 180, "ax"); Q.line(g, 60, 180, 60, 30, "ax");
        for (const e of [0, 2, 4, 6]) txt(g, 54, F.y(e) + 4, `10${["⁰", "", "²", "", "⁴", "", "⁶"][e]}`, "s", "end");
        Q.plot(g, F, (k) => k * Math.log10(2), "b", 1, 23, 100);
        Q.dot(g, F.x(n), F.y(n * Math.log10(2)), "fd", 5);
        txt(g, 480, 200, "상동 염색체 쌍의 수", "s", "end");
      }
      read.textContent = `${n}쌍: 생식세포 조합 2^${n} = ${c.toLocaleString("ko-KR")}가지, 두 자손이 같을 확률 1/${(c * c).toLocaleString("ko-KR")}`;
    });
  });

  // 핀치 부리 선택: 평균 9.4, 표준 편차 0.9 mm, 생존 확률 = 로지스틱((x − c)/0.3)
  Q.def("bio-finch", (fig, svg) => {
    const F = Q.frame(6, 13, 0, 0.5, 50, 470, 30, 190);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const pdf = (x, m) => Math.exp(-(((x - m) / 0.9) ** 2) / 2) / (0.9 * Math.sqrt(2 * Math.PI));
    Q.bind(fig, ({ c }) => {
      clear(g);
      const surv = (x) => 1 / (1 + Math.exp(-(x - c) / 0.3));
      let S = 0, SX = 0; for (let x = 5; x < 14; x += 0.01) { const w = pdf(x, 9.4) * surv(x) * 0.01; S += w; SX += w * x; }
      const ms = SX / S, mn = 9.4 + 0.8 * (ms - 9.4);
      Q.line(g, 50, 190, 470, 190, "ax");
      for (let x = 6; x <= 13; x++) txt(g, F.x(x), 206, `${x}`, "s", "middle");
      txt(g, 470, 222, "부리 두께 (mm)", "s", "end");
      Q.plot(g, F, (x) => pdf(x, 9.4), "k", 6, 13, 200);
      Q.plot(g, F, (x) => pdf(x, 9.4) * surv(x), "c", 6, 13, 200);
      Q.plot(g, F, (x) => pdf(x, mn), "b", 6, 13, 200).setAttribute("stroke-dasharray", "4 4");
      for (const [m, cls] of [[9.4, "k"], [ms, "c"], [mn, "b"]]) Q.line(g, F.x(m), 30, F.x(m), 190, cls === "k" ? "gd" : cls);
      txt(g, 54, 22, "검정 가뭄 전, 주황 살아남은 개체, 파랑 점선 다음 세대", "s");
      read.textContent = `살아남은 비율 ${num(S * 100, 0)}%, 살아남은 개체 평균 ${num(ms, 2)} mm → 다음 세대 평균 ${num(mn, 2)} mm (가뭄 전 9.4 mm)`;
    });
  });

  // 분류 단계: 대왕고래와 같은 무리에 남는 생물
  Q.def("bio-rank", (fig, svg) => {
    const R = ["계", "문", "강", "목", "과", "속", "종"];
    const T = {
      "대왕고래": ["동물계", "척삭동물문", "포유강", "우제목", "수염고래과", "대왕고래속", "대왕고래"],
      "하마": ["동물계", "척삭동물문", "포유강", "우제목", "하마과", "하마속", "하마"],
      "사람": ["동물계", "척삭동물문", "포유강", "영장목", "사람과", "사람속", "사람"],
      "개": ["동물계", "척삭동물문", "포유강", "식육목", "개과", "개속", "개"],
      "고등어": ["동물계", "척삭동물문", "조기강", "고등어목", "고등어과", "고등어속", "고등어"]
    };
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), names = Object.keys(T);
    Q.bind(fig, ({ k }) => {
      clear(g);
      R.forEach((r, i) => { el("rect", { x: 20 + i * 70, y: 190, width: 62, height: 24, class: i === k ? "lc" : "gd" }, g); txt(g, 51 + i * 70, 207, r, "s", "middle"); });
      const same = names.filter((n) => T[n][k] === T["대왕고래"][k]);
      names.forEach((n, i) => {
        const on = same.includes(n), y = 20 + i * 32;
        el("rect", { x: 40, y, width: 120, height: 26, class: on ? (n === "대왕고래" ? "lb" : "la") : "gd" }, g);
        txt(g, 100, y + 18, n, "s", "middle"); txt(g, 180, y + 18, T[n][k], "s" + (on ? "" : " i"));
      });
      read.textContent = `${R[k]} 단계(${T["대왕고래"][k]}): 대왕고래와 같은 무리 ${same.filter((n) => n !== "대왕고래").join(", ") || "없음"}`;
    }, (k, v) => R[v]);
  });

  // 계통수: (((((사람, 침팬지), 고릴라), 오랑우탄), 긴팔원숭이)
  Q.def("bio-tree", (fig, svg) => {
    const S = ["사람", "침팬지", "고릴라", "오랑우탄", "긴팔원숭이"], Y = S.map((_, i) => 30 + i * 40);
    const NX = [380, 300, 210, 110], D = [1.2, 1.6, 3.1, 4.4];   // 갈림점 x, 서열 차이(%)
    const mrca = (a, b) => Math.max(a, b, 1) - 1;   // 0: 사람-침팬지 갈림점 ...
    const P = []; for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) P.push([i, j]);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const [a, b] = P[p], m = mrca(a, b);
      // 노드 k는 종 0..k+1을 묶는다. 노드 y는 묶인 종의 가운데
      const ny = (k) => (k === 0 ? (Y[0] + Y[1]) / 2 : (ny(k - 1) + Y[k + 1]) / 2);
      const draw = (x1, y1, x2, y2, hl) => { Q.line(g, x1, y1, x1, y2, hl ? "c" : "k"); Q.line(g, x1, y2, x2, y2, hl ? "c" : "k"); };
      for (let k = 0; k < 4; k++) {
        const x = NX[k], y = ny(k);
        const left = k === 0 ? [[0, Y[0]], [1, Y[1]]] : [[-1, ny(k - 1)], [k + 1, Y[k + 1]]];
        for (const [sp, yy] of left) {
          const x2 = sp === -1 ? NX[k - 1] : 470;
          const hl = sp === -1 ? k <= m && a <= k : sp === a || sp === b;
          draw(x, y, x2, yy, hl);
        }
      }
      Q.line(g, 60, ny(3), NX[3], ny(3), "k");
      S.forEach((n, i) => txt(g, 476, Y[i] + 4, n, "s" + (i === a || i === b ? " tc" : "")));
      Q.dot(g, NX[m], ny(m), "fd", 6);
      txt(g, 60, 225, "뿌리 (과거)", "s"); txt(g, 470, 225, "현재", "s", "end");
      read.textContent = `${S[a]}, ${S[b]}: 빨간 점의 공통 조상에서 갈라졌다, 서열 차이 약 ${D[m]}%`;
    }, (k, v) => P[v].map((i) => S[i]).join("-"));
  });

  // 대조 실험: 비료 효과 +2 cm, 개체 차이 표준 편차 3 cm, 집단마다 n그루
  Q.def("bio-control", (fig, svg) => {
    const r = rng(11), A = [], B = [];
    for (let i = 0; i < 40; i++) { A.push(15 + 3 * gauss(r)); B.push(17 + 3 * gauss(r)); }
    const F = Q.frame(5, 27, 0, 1, 60, 480, 0, 1);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const a = A.slice(0, n), b = B.slice(0, n), ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n;
      for (const [arr, y, cls, lab, m] of [[a, 70, "fb", "대조군", ma], [b, 150, "fc", "실험군", mb]]) {
        Q.line(g, 60, y + 20, 480, y + 20, "ax"); txt(g, 54, y + 4, lab, "s", "end");
        arr.forEach((x, i) => Q.dot(g, F.x(x), y - 14 + (i % 5) * 7, cls, 3.5));
        Q.line(g, F.x(m), y - 26, F.x(m), y + 24, "d");
      }
      for (const x of [5, 10, 15, 20, 25]) txt(g, F.x(x), 196, `${x}`, "s", "middle");
      txt(g, 480, 214, "키 (cm)", "s", "end");
      read.textContent = `집단마다 ${n}그루: 평균 대조군 ${num(ma, 1)} cm, 실험군 ${num(mb, 1)} cm, 차이 ${num(mb - ma, 1)} cm (실제 효과는 2 cm)`;
    });
  });
})();
