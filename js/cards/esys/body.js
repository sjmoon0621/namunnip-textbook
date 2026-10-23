/* 지구시스템과학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const OM = 7.29e-5, G = 9.8;

  // 1-1 원시 태양계 원반의 온도와 눈선: 거리 10^lr AU, T = 280 / √r
  Q.def("esys-frost", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lr }) => {
      clear(g);
      const T = (x) => 280 / Math.sqrt(10 ** x);
      const F = frame(g, -0.5, 1.5, 0, 600, [0.5, 100]);
      for (const [x, lb] of [[-0.5, "0.3"], [0, "1"], [0.5, "3"], [1, "10"], [1.5, "30"]]) txt(g, F.x(x), 220, lb, "s", "middle");
      ticks(g, F, [], [0, 150, 300, 450, 600]);
      txt(g, 490, 200, "태양에서의 거리 (AU, 로그 눈금)", "s", "end"); txt(g, 66, 26, "원반의 온도 (K)", "s");
      Q.line(g, F.x(-0.5), F.y(150), F.x(1.5), F.y(150), "d"); txt(g, F.x(1.5), F.y(150) - 4, "얼음이 어는 150 K", "s td", "end");
      Q.plot(g, F, T, "b", -0.5, 1.5, 200);
      const r = 10 ** lr, t = T(lr); Q.dot(g, F.x(lr), F.y(Math.min(600, t)), "fd", 5);
      read.textContent = `${num(r, 1)} AU: 약 ${num(t, 0)} K → ` + (t > 150 ? "얼음은 증발하고 암석과 금속만 뭉친다 (지구형 행성)" : "물이 얼음으로 뭉쳐 큰 핵이 되고 기체를 끌어모은다 (목성형 행성)") + ` (어림 모형, 눈선 약 ${num((280 / 150) ** 2, 1)} AU)`;
    });
  });

  // 1-2 대기 산소 농도의 변화: 시각 t (억 년 전)
  const O2 = (t) => t > 24 ? 1e-5 : t > 8 ? 1 : t > 4 ? 1 + (8 - t) / 4 * 20 : 21;
  Q.def("esys-o2", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const F = frame(g, 0, 40, -5, 2, [5, 1]);
      for (const x of [40, 30, 20, 10, 0]) txt(g, F.x(40 - x), 220, `${x}`, "s", "middle");
      for (const [v, lb] of [[-5, "0.00001"], [-2, "0.01"], [0, "1"], [1.32, "21"]]) txt(g, F.X0 - 5, F.y(v) + 4, lb, "s", "end");
      txt(g, 490, 200, "억 년 전", "s", "end"); txt(g, 66, 26, "대기 산소 (%, 로그 눈금)", "s");
      Q.plot(g, F, (x) => Math.log10(O2(40 - x)), "b", 0, 40, 400);
      Q.dot(g, F.x(40 - t), F.y(Math.log10(O2(t))), "fd", 5);
      const ev = t > 27 ? "남세균이 광합성을 시작했지만 산소는 바다의 철과 반응해 사라짐 (호상 철광층)" : t > 24 ? "대산화 사건 직전" : t > 8 ? "대산화 사건 뒤 산소 약 1%, 오존층 형성 시작" : t > 4 ? "두 번째 산소 증가, 다세포 동물 등장" : "현재와 비슷한 21%, 육상 생물 번성";
      read.textContent = `${t}억 년 전: 대기 산소 약 ${O2(t) < 0.001 ? "0.001% 미만" : num(O2(t), 0) + "%"} (대략값). ${ev}`;
    });
  });

  // 1-3 열점 섬의 나이와 거리: 섬 k
  const ISL = [["하와이섬", 0, 0.4], ["마우이섬", 200, 1.3], ["오아후섬", 340, 3.0], ["카우아이섬", 520, 5.1], ["미드웨이 환초", 2430, 28]];
  Q.def("esys-hotspot", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const F = frame(g, 0, 2500, 0, 30, [500, 5]); ticks(g, F, [0, 500, 1000, 1500, 2000, 2500], [0, 10, 20, 30]);
      txt(g, 490, 200, "열점에서의 거리 (km)", "s", "end"); txt(g, 66, 26, "섬의 나이 (백만 년)", "s");
      Q.line(g, F.x(0), F.y(0), F.x(2500), F.y(2500 / 87), "gd");
      ISL.forEach(([nm, d, a], i) => { Q.dot(g, F.x(d), F.y(a), i === k ? "fd" : "fb", i === k ? 6 : 4); });
      const [nm, d, a] = ISL[k], v = k ? d / a : NaN;
      read.textContent = `${nm}: 열점에서 ${d} km, 나이 약 ${num(a * 100, 0)}만 년` + (k ? ` → 판의 평균 속도 ${num(d * 1e5 / (a * 1e6), 1)} cm/년` : " (지금도 화산 활동 중)");
    }, (key, v) => ISL[v][0]);
  });

  // 1-4 마그마의 SiO₂ 함량과 점성, 분출 양식
  Q.def("esys-volc", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ si }) => {
      clear(g);
      const lv = 1 + (si - 45) / 30 * 9; // log10 점성 (Pa·s), 현무암질 약 10, 유문암질 약 10^10
      const F = frame(g, 45, 75, 0, 11, [5, 2]); ticks(g, F, [45, 50, 55, 60, 65, 70, 75], [0, 2, 4, 6, 8, 10]);
      txt(g, 490, 200, "SiO₂ 함량 (%)", "s", "end"); txt(g, 66, 26, "점성 (10의 거듭제곱 Pa·s)", "s");
      Q.plot(g, F, (x) => 1 + (x - 45) / 30 * 9, "b", 45, 75, 50);
      Q.dot(g, F.x(si), F.y(lv), "fd", 5);
      const nm = si < 52 ? "현무암질" : si < 63 ? "안산암질" : "유문암질";
      const st = si < 52 ? "가스가 잘 빠져 용암이 흐르는 분출, 순상 화산" : si < 63 ? "흐름과 폭발이 번갈아, 성층 화산" : "가스가 갇혀 폭발적 분출, 종상 화산이나 화산재";
      read.textContent = `SiO₂ ${si}%: ${nm} 마그마, 점성 약 10^${num(lv, 0)} Pa·s (물의 10^${num(lv + 3, 0)}배). ${st}`;
    });
  });

  // 1-5 지진파 암영대: 진앙 거리 각 a (°)
  Q.def("esys-shadow", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const cx = 150, cy = 115, R = 95, Rc = 52;
      el("circle", { cx, cy, r: R, class: "lk" }, g); el("circle", { cx, cy, r: Rc, class: "lc" }, g);
      const P = (ang, r) => [cx + r * Math.sin(ang * Math.PI / 180), cy - r * Math.cos(ang * Math.PI / 180)];
      const arc = (a0, a1, cls) => { const [x0, y0] = P(a0, R + 6), [x1, y1] = P(a1, R + 6); el("path", { d: `M${x0} ${y0} A ${R + 6} ${R + 6} 0 0 1 ${x1} ${y1}`, class: cls }, g); };
      arc(0, 103, "b"); arc(103, 142, "d"); arc(142, 180, "c");
      Q.dot(g, cx, cy - R, "fd", 5); const [mx, my] = P(a, R); Q.dot(g, mx, my, "fk", 5);
      txt(g, cx, cy + 4, "외핵", "s", "middle");
      const zone = a < 103 ? "P파와 S파가 모두 도착한다" : a < 142 ? "암영대: 직접 오는 P파도 S파도 없다" : "P파만 도착한다 (S파는 액체 외핵을 지나지 못함)";
      txt(g, 290, 60, "파랑: P파·S파 도착", "s tb"); txt(g, 290, 85, "빨강: 암영대 103°~142°", "s td"); txt(g, 290, 110, "주황: P파만 도착", "s tc");
      read.textContent = `진앙에서 ${a}°: ${zone}`;
    });
  });

  // 2-1 에크만 수송: 풍속 U (m/s), 위도 lat (°)
  Q.def("esys-ekman", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ U, lat }) => {
      clear(g);
      const tau = 1.2 * 1.3e-3 * U * U, f = 2 * OM * Math.sin(lat * Math.PI / 180), M = tau / (1025 * f);
      Q.arrow(g, 120, 110, 220, 110, "c", "fc"); txt(g, 170, 100, "바람", "s tc", "middle");
      Q.arrow(g, 120, 110, 120, 110 + Math.min(80, M * 25), "b", "fb"); txt(g, 130, 110 + Math.min(80, M * 25) / 2, "에크만 수송 (북반구, 바람의 오른쪽 90°)", "s tb");
      read.textContent = `풍속 ${U} m/s, 위도 ${lat}°: 바람 응력 ${num(tau, 3)} N/m², 해수 수송량 ${num(M, 2)} m²/s (해안 1 km당 1초에 ${num(M * 1000, 0)} m³)`;
    });
  });

  // 2-2 수면파의 속력: 수심 h (m), 파장 L (m)
  Q.def("esys-wave", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ h, L }) => {
      clear(g);
      const c = (d) => { const k = 2 * Math.PI / L; return Math.sqrt(G / k * Math.tanh(k * d)); };
      const F = frame(g, 0, 100, 0, 25, [10, 5]); ticks(g, F, [0, 20, 40, 60, 80, 100], [0, 5, 10, 15, 20, 25]);
      txt(g, 490, 200, "수심 (m)", "s", "end"); txt(g, 66, 26, "파도의 속력 (m/s)", "s");
      Q.plot(g, F, c, "b", 0.5, 100, 200); Q.plot(g, F, (d) => Math.sqrt(G * d), "gd", 0.5, 100, 200);
      Q.dot(g, F.x(h), F.y(Math.min(25, c(h))), "fd", 5);
      const deep = h > L / 2, shallow = h < L / 20;
      read.textContent = `파장 ${L} m, 수심 ${h} m: 속력 ${num(c(h), 1)} m/s ` + (deep ? `(심해파, 수심과 무관 √(gL/2π) = ${num(Math.sqrt(G * L / 2 / Math.PI), 1)})` : shallow ? `(천해파, √(gh) = ${num(Math.sqrt(G * h), 1)})` : "(중간 영역)") + ". 회색은 √(gh)";
    });
  });

  // 2-3 지진 해일: 수심 h (m), 먼바다 4000 m에서 높이 1 m
  Q.def("esys-tsunami", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lh }) => {
      clear(g);
      const h = 10 ** lh, A = (4000 / h) ** 0.25, c = Math.sqrt(G * h);
      bar(g, 40, c / 2, "lb", "속력", `${num(c, 0)} m/s (시속 ${num(c * 3.6, 0)} km)`);
      bar(g, 80, A * 40, "ld", "해일 높이", `${num(A, 1)} m`);
      bar(g, 120, c * 0.45, "lk", "파장 (주기 15분)", `${num(c * 900 / 1000, 0)} km`);
      read.textContent = `수심 ${num(h, 0)} m: 속력 √(gh) = ${num(c, 0)} m/s, 높이는 수심의 −1/4제곱에 비례하여 ${num(A, 1)} m (먼바다 4000 m에서 1 m일 때, 그린 법칙)`;
    });
  });

  // 2-4 조석: 음력 날짜 d (0 삭 … 29.5)
  Q.def("esys-tide", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const ph = 2 * Math.PI * d / 14.77, M2 = 1.0, S2 = 0.46;
      const hgt = (t) => M2 * Math.cos(2 * Math.PI * t / 12.42) + S2 * Math.cos(2 * Math.PI * t / 12 - ph);
      const F = frame(g, 0, 48, -1.6, 1.6, [6, 0.5]); ticks(g, F, [0, 12, 24, 36, 48], [-1.5, 0, 1.5]);
      txt(g, 490, 200, "시간 (h)", "s", "end"); txt(g, 66, 26, "해수면 높이 (m)", "s");
      Q.plot(g, F, hgt, "b", 0, 48, 400);
      const amp = Math.sqrt(M2 * M2 + S2 * S2 + 2 * M2 * S2 * Math.cos(ph));
      read.textContent = `음력 ${num(d, 1)}일: 하루 두 번 밀물, 조차 약 ${num(2 * amp, 1)} m ` + (amp > 1.3 ? "(사리: 해와 달이 일직선)" : amp < 0.7 ? "(조금: 해와 달이 직각)" : "") + `. 밀물 시각은 날마다 약 50분 늦어진다`;
    });
  });

  // 3-1 대기의 선택적 흡수: 파장 10^lw μm
  const tr = (w) => w < 0.29 ? 0 : w < 0.32 ? (w - 0.29) / 0.03 * 0.6 : w < 0.75 ? 0.85 : w < 5 ? 0.6 - 0.4 * Math.exp(-(((w - 2.7) / 0.4) ** 2)) - 0.3 * Math.exp(-(((w - 1.4) / 0.15) ** 2)) : w < 8 ? 0.1 : w < 13 ? (Math.abs(w - 9.6) < 0.4 ? 0.4 : 0.8) : w < 17 ? 0.05 : 0.02;
  Q.def("esys-absorb", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lw }) => {
      clear(g);
      const F = frame(g, -1, 1.5, 0, 1, [0.5, 0.25]);
      for (const [x, lb] of [[-1, "0.1"], [-0.5, "0.3"], [0, "1"], [0.5, "3"], [1, "10"], [1.5, "30"]]) txt(g, F.x(x), 220, lb, "s", "middle");
      ticks(g, F, [], [0, 0.5, 1]);
      txt(g, 490, 200, "파장 (μm, 로그 눈금)", "s", "end"); txt(g, 66, 26, "대기를 통과하는 비율", "s");
      el("rect", { x: F.x(Math.log10(0.38)), y: 15, width: F.x(Math.log10(0.75)) - F.x(Math.log10(0.38)), height: 190, class: "la" }, g);
      Q.plot(g, F, (x) => tr(10 ** x), "b", -1, 1.5, 500);
      const w = 10 ** lw, t = tr(w); Q.dot(g, F.x(lw), F.y(t), "fd", 5);
      const who = w < 0.32 ? "오존이 자외선을 흡수" : w < 0.75 ? "가시광선 창: 대부분 통과" : w < 8 ? "수증기와 이산화 탄소가 흡수" : w < 13 ? "적외선 창 (9.6 μm 부근은 오존)" : "이산화 탄소(15 μm)와 수증기가 흡수";
      read.textContent = `${num(w, 2)} μm: 통과 ${num(t * 100, 0)}% (모식), ${who}`;
    });
  });

  // 3-2 지구의 복사 평형: 반사율 a, 대기의 적외선 흡수율 e
  Q.def("esys-budget", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, e }) => {
      clear(g);
      const S = 1361, sig = 5.67e-8, Te = (S * (1 - a) / 4 / sig) ** 0.25, Ts = Te * (2 / (2 - e)) ** 0.25;
      bar(g, 30, S / 4 * a / 2, "lk", "반사 (W/m²)", `${num(S / 4 * a, 0)}`);
      bar(g, 65, S / 4 * (1 - a) / 2, "lc", "흡수 (W/m²)", `${num(S / 4 * (1 - a), 0)}`);
      bar(g, 110, (Te - 200) * 2, "lb", "온실 효과 없을 때", `${num(Te - 273, 0)} °C`);
      bar(g, 145, (Ts - 200) * 2, "ld", "지표 온도", `${num(Ts - 273, 0)} °C`);
      read.textContent = `반사율 ${num(a, 2)}, 대기 적외선 흡수율 ${num(e, 2)}: 복사 평형 온도 ${num(Te, 0)} K (${num(Te - 273, 0)} °C), 온실 효과를 넣은 지표 온도 ${num(Ts, 0)} K (${num(Ts - 273, 0)} °C, 한 층 대기 모형)`;
    });
  });

  // 3-3 공기 덩어리의 상승: 기온 감률 ge (°C/km), 지표 이슬점 차 D (°C), 지표 기온 25 °C
  Q.def("esys-parcel", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ge, D }) => {
      clear(g);
      const zc = 0.125 * D, env = (z) => 25 - ge * z, par = (z) => z < zc ? 25 - 10 * z : 25 - 10 * zc - 5 * (z - zc);
      const F = Q.frame(-20, 30, 0, 8, 60, 490, 15, 205); Q.axes(g, F, { step: [10, 1], label: false });
      for (const x of [-20, -10, 0, 10, 20, 30]) txt(g, F.x(x), 220, `${x}`, "s", "middle");
      for (const y of [0, 2, 4, 6, 8]) txt(g, 55, F.y(y) + 4, `${y}`, "s", "end");
      txt(g, 490, 200, "기온 (°C)", "s", "end"); txt(g, 66, 26, "높이 (km)", "s");
      let d1 = "", d2 = ""; for (let i = 0; i <= 80; i++) { const z = i / 10; d1 += (i ? "L" : "M") + F.x(env(z)) + " " + F.y(z); d2 += (i ? "L" : "M") + F.x(par(z)) + " " + F.y(z); }
      el("path", { d: d1, class: "c" }, g); el("path", { d: d2, class: "b" }, g);
      Q.line(g, F.x(-20), F.y(zc), F.x(30), F.y(zc), "gd"); txt(g, F.x(30), F.y(zc) - 4, `구름 바닥 ${num(zc * 1000, 0)} m`, "s", "end");
      const st = ge < 5 ? "절대 안정: 공기 덩어리가 늘 주변보다 차가워 다시 내려온다" : ge > 10 ? "절대 불안정: 계속 떠오른다" : "조건부 불안정: 구름이 생겨 포화되면 주변보다 따뜻해질 수 있다";
      read.textContent = `주변 기온 감률 ${ge} °C/km, 이슬점 차 ${D} °C: ${st} (파랑 공기 덩어리, 주황 주변 공기)`;
    });
  });

  // 3-4 정역학 평형: 높이 z (km), 기압 = 1013 e^(−z/8)
  Q.def("esys-hydro", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ z }) => {
      clear(g);
      const p = (x) => 1013 * Math.exp(-x / 8);
      const F = frame(g, 0, 30, 0, 1013, [5, 200]); ticks(g, F, [0, 5, 10, 15, 20, 25, 30], [0, 200, 400, 600, 800, 1000]);
      txt(g, 490, 200, "높이 (km)", "s", "end"); txt(g, 66, 26, "기압 (hPa)", "s");
      Q.plot(g, F, p, "b", 0, 30, 200); Q.dot(g, F.x(z), F.y(p(z)), "fd", 5);
      read.textContent = `높이 ${z} km: 기압 약 ${num(p(z), 0)} hPa, 대기 질량의 ${num((1 - p(z) / 1013) * 100, 0)}%가 이 높이 아래에 있다 (높이 8 km마다 약 1/e로 감소)`;
    });
  });

  // 3-5 지균풍: 등압선 간격 dn (km, 4 hPa마다), 위도 lat
  Q.def("esys-geo", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dn, lat }) => {
      clear(g);
      const f = 2 * OM * Math.sin(lat * Math.PI / 180), V = 400 / (1.2 * f * dn * 1000);
      const sp = Math.max(18, Math.min(80, dn / 5));
      for (let i = 0; i < 4; i++) { Q.line(g, 40, 40 + i * sp, 300, 40 + i * sp, "gd"); txt(g, 305, 44 + i * sp, `${1012 - 4 * i} hPa`, "s"); }
      Q.arrow(g, 120, 40 + 1.5 * sp, 120 + Math.min(150, V * 4), 40 + 1.5 * sp, "b", "fb");
      txt(g, 380, 60, `지균풍 ${num(V, 1)} m/s`, "s tb"); txt(g, 380, 85, "등압선에 나란히,", "s"); txt(g, 380, 105, "북반구에서 저기압을 왼쪽에", "s");
      read.textContent = `4 hPa 간격 등압선이 ${dn} km마다, 위도 ${lat}°: 기압 경도력과 전향력이 평형인 지균풍 약 ${num(V, 1)} m/s. 지표에서는 마찰로 느려지고 저기압 쪽으로 비스듬히 분다`;
    });
  });

  // 3-6 로스비파: 파장 L (천 km), 편서풍 U = 15 m/s, 위도 45°
  Q.def("esys-rossby", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ L }) => {
      clear(g);
      const beta = 2 * OM * Math.cos(Math.PI / 4) / 6.371e6, k = 2 * Math.PI / (L * 1e6), c = 15 - beta / (k * k);
      let d = ""; for (let i = 0; i <= 200; i++) { const x = 30 + i * 2.3; d += (i ? "L" : "M") + x + " " + (100 - 40 * Math.sin(2 * Math.PI * i / 200 * 2.4)); }
      el("path", { d, class: "b" }, g);
      Q.arrow(g, 200, 170, 200 + c * 8, 170, c >= 0 ? "c" : "d", c >= 0 ? "fc" : "fd");
      txt(g, 30, 200, `파동의 이동 속도 ${num(c, 1)} m/s (${c > 0.5 ? "동쪽" : c < -0.5 ? "서쪽" : "거의 정지"})`, "s");
      read.textContent = `파장 ${L}천 km: 로스비파 속도 c = U − β/k² = ${num(c, 1)} m/s. 정지하는 파장은 약 ${num(2 * Math.PI * Math.sqrt(15 / beta) / 1e6, 1)}천 km`;
    });
  });
})();
