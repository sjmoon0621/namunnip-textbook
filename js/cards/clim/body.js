/* 기후변화와 환경생태 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const pdf = (x, m, s) => Math.exp(-(((x - m) / s) ** 2) / 2) / (s * Math.sqrt(2 * Math.PI));
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));

  // 1-1 평년값과 오늘의 기온: 오늘 최고 기온 T, 평년 29 °C, 표준 편차 2.5
  Q.def("clim-normal", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T }) => {
      clear(g);
      const m = 29, s = 2.5, z = (T - m) / s, p = 1 - cdf(z);
      const F = frame(g, 20, 38, 0, 0.17, [2, 0.05]); ticks(g, F, [20, 24, 28, 32, 36], []);
      txt(g, 490, 200, "8월 1일 최고 기온 (°C)", "s", "end"); txt(g, 66, 26, "30년 동안 나타난 빈도", "s");
      let d = `M${F.x(T)} ${F.y(0)}`; for (let i = 0; i <= 80; i++) { const x = T + (38 - T) * i / 80; d += `L${F.x(x)} ${F.y(pdf(x, m, s))}`; } d += `L${F.x(38)} ${F.y(0)} Z`;
      el("path", { d, class: "ld" }, g);
      Q.plot(g, F, (x) => pdf(x, m, s), "b", 20, 38, 200);
      Q.line(g, F.x(m), F.y(0), F.x(m), F.y(0.165), "gd"); txt(g, F.x(m), 12, "평년 29 °C", "s", "middle");
      read.textContent = `오늘 ${T} °C: 평년보다 ${num(T - m, 1)} °C ${T >= m ? "높고" : "낮고"}, 표준 편차의 ${num(z, 1)}배. 30년 가운데 이보다 더웠던 날의 비율 ${num(p * 100, 1)}%`;
    });
  });

  // 1-2 되먹임 증폭: 되먹임 비율 f, 직접 효과 1.2 °C (CO2 두 배)
  Q.def("clim-gain", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ f }) => {
      clear(g);
      const d0 = 1.2, tot = d0 / (1 - f);
      let x = 160, acc = 0;
      for (let i = 0; i < 8; i++) { const step = d0 * f ** i, w = step * 60; el("rect", { x: x, y: 60, width: Math.max(1, w), height: 30, class: i ? "lc" : "lb" }, g); x += w; acc += step; }
      txt(g, 152, 80, "직접 효과 + 되먹임", "s", "end");
      bar(g, 120, tot * 60, "ld", "최종 온도 변화", `${num(tot, 1)} °C`);
      read.textContent = `되먹임 비율 ${num(f, 2)}: 직접 효과 ${d0} °C가 되먹임으로 ${num(d0 * f, 2)}, ${num(d0 * f * f, 2)} … 씩 더해져 모두 ${num(tot, 1)} °C (증폭 ${num(1 / (1 - f), 1)}배)`;
    });
  });

  // 1-3 북극 해빙의 월별 감소율 (%/10년, 대략값)
  const SEA = [3.2, 2.9, 2.6, 2.6, 2.8, 4.0, 7.0, 10.5, 12.7, 9.5, 5.0, 3.7];
  Q.def("clim-seaice", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      SEA.forEach((v, i) => { const h = v * 12; el("rect", { x: 60 + i * 36, y: 190 - h, width: 28, height: h, class: i + 1 === m ? "ld" : "lb" }, g); txt(g, 74 + i * 36, 206, `${i + 1}`, "s", "middle"); });
      txt(g, 490, 220, "월", "s", "end"); txt(g, 60, 20, "10년마다 줄어드는 비율 (%)", "s");
      read.textContent = `${m}월 북극 해빙 면적: 10년마다 약 ${SEA[m - 1]}%씩 줄고 있다 (1979년 이후 위성 관측, 대략값). 여름 끝 9월에 가장 빨리 준다`;
    });
  });

  // 2-1 킬링 곡선: 연도 y
  const co2 = (t) => 280 + 37 * Math.exp(0.0212 * (t - 1960)) + 3 * Math.sin(2 * Math.PI * (t - 0.3));
  Q.def("clim-keeling", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ y }) => {
      clear(g);
      const F = frame(g, 1960, 2025, 300, 440, [10, 20]); ticks(g, F, [1960, 1980, 2000, 2020], [300, 340, 380, 420]);
      txt(g, 490, 200, "연도", "s", "end"); txt(g, 66, 26, "대기 CO₂ (ppm)", "s");
      Q.plot(g, F, co2, "b", 1960, 2025, 800);
      const c = 280 + 37 * Math.exp(0.0212 * (y - 1960)), rate = 37 * 0.0212 * Math.exp(0.0212 * (y - 1960));
      Q.dot(g, F.x(y), F.y(c), "fd", 5);
      read.textContent = `${y}년 평균 약 ${num(c, 0)} ppm (산업혁명 전 280 ppm), 해마다 약 ${num(rate, 1)} ppm 증가. 해마다 북반구 식물의 광합성으로 여름에 줄고 겨울에 는다 (어림식)`;
    });
  });

  // 2-2 해수면 상승의 두 몫: 바다 상층 2000 m의 평균 승온 dT (°C), 녹은 육지 얼음 M (천 Gt)
  Q.def("clim-slr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dT, M }) => {
      clear(g);
      const th = 2.0e-4 * 2000 * dT * 1000, ic = M * 1000 / 362; // mm
      bar(g, 50, th * 1.2, "lc", "열팽창", `${num(th, 0)} mm`);
      bar(g, 90, ic * 1.2, "lb", "녹은 육지 얼음", `${num(ic, 0)} mm`);
      bar(g, 140, (th + ic) * 1.2, "ld", "합계", `${num(th + ic, 0)} mm`);
      read.textContent = `상층 2000 m가 ${num(dT, 2)} °C 데워지면 열팽창으로 약 ${num(th, 0)} mm, 육지 얼음 ${num(M, 1)}천 Gt가 녹으면 ${num(ic, 0)} mm (362 Gt마다 1 mm). 바다에 떠 있던 얼음은 녹아도 해수면을 거의 올리지 않는다`;
    });
  });

  // 2-3 평균 이동과 극한 빈도: 평균 상승 d (표준 편차 단위)
  Q.def("clim-shift", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const F = frame(g, -4, 6, 0, 0.42, [1, 0.1]); ticks(g, F, [-4, -2, 0, 2, 4, 6], []);
      txt(g, 490, 200, "기온 (표준 편차 단위)", "s", "end"); txt(g, 66, 26, "빈도", "s");
      let dd = `M${F.x(2)} ${F.y(0)}`; for (let i = 0; i <= 80; i++) { const x = 2 + 4 * i / 80; dd += `L${F.x(x)} ${F.y(pdf(x, d, 1))}`; } dd += `L${F.x(6)} ${F.y(0)} Z`;
      el("path", { d: dd, class: "ld" }, g);
      Q.plot(g, F, (x) => pdf(x, 0, 1), "gd", -4, 6, 200); Q.plot(g, F, (x) => pdf(x, d, 1), "b", -4, 6, 200);
      Q.line(g, F.x(2), F.y(0), F.x(2), F.y(0.4), "d"); txt(g, F.x(2) + 4, 30, "폭염 기준", "s td");
      const p0 = 1 - cdf(2), p1 = 1 - cdf(2 - d);
      read.textContent = `평균이 표준 편차의 ${num(d, 1)}배만큼 오르면 기준을 넘는 날이 ${num(p0 * 100, 1)}%에서 ${num(p1 * 100, 1)}%로, ${num(p1 / p0, 1)}배가 된다`;
    });
  });

  // 2-4 산 위로 옮겨 가는 서식지: 기온 상승 dT
  Q.def("clim-range", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dT }) => {
      clear(g);
      const H = 2000, lo0 = 1200, hi0 = 1600, up = dT / 6.5 * 1000, lo = lo0 + up, hi = Math.min(H, hi0 + up);
      const Y = (h) => 200 - h / H * 180, X = (h) => (1 - h / H) * 200;
      el("path", { d: `M${260 - X(0)} ${Y(0)} L260 ${Y(H)} L${260 + X(0)} ${Y(0)} Z`, class: "lk" }, g);
      const band = (a, b, cls) => { if (b <= a) return; el("path", { d: `M${260 - X(a)} ${Y(a)} L${260 - X(b)} ${Y(b)} L${260 + X(b)} ${Y(b)} L${260 + X(a)} ${Y(a)} Z`, class: cls }, g); };
      band(lo0, hi0, "gd"); band(lo, hi, "lc");
      const area = (a, b) => b <= a ? 0 : (1 - a / H) ** 2 - (1 - b / H) ** 2;
      const ratio = area(lo, hi) / area(lo0, hi0);
      read.textContent = `기온 ${num(dT, 1)} °C 상승: 알맞은 서식지가 약 ${num(up, 0)} m 위로 옮겨 가고, 원뿔 모양 산에서 그 넓이는 ${num(ratio * 100, 0)}%로 준다` + (lo >= H ? " (산꼭대기를 넘어 갈 곳이 없다)" : "");
    });
  });

  // 2-5 적산 온도와 개화일: 봄철 기온 상승 w (°C)
  Q.def("clim-gdd", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const temp = (day, w) => -2 + 0.22 * day + w; // 2월 1일이 day 0
    const bloom = (w) => { let s = 0; for (let d = 0; d < 120; d++) { s += Math.max(0, temp(d, w) - 5); if (s >= 160) return d; } return 120; };
    Q.bind(fig, ({ w }) => {
      clear(g);
      const F = frame(g, 0, 90, 0, 200, [10, 40]); ticks(g, F, [0, 30, 60, 90], [0, 80, 160]);
      txt(g, 490, 200, "2월 1일부터 지난 날", "s", "end"); txt(g, 66, 26, "쌓인 따뜻함 (5 °C 넘는 온도의 합)", "s");
      Q.line(g, F.x(0), F.y(160), F.x(90), F.y(160), "d"); txt(g, F.x(90), F.y(160) - 4, "개화 기준", "s td", "end");
      for (const [ww, cls] of [[0, "gd"], [w, "b"]]) { let s = 0, dd = ""; for (let d = 0; d <= 90; d++) { s += Math.max(0, temp(d, ww) - 5); dd += (d ? "L" : "M") + F.x(d) + " " + F.y(Math.min(200, s)); } el("path", { d: dd, class: cls }, g); }
      const b0 = bloom(0), b1 = bloom(w);
      read.textContent = `봄 기온이 ${num(w, 1)} °C 오르면 개화가 ${b0 - b1}일 빨라진다 (2월 1일부터 ${b1}일째, 평년 ${b0}일째). 꽃은 달력이 아니라 쌓인 따뜻함으로 핀다`;
    });
  });

  // 2-6 꽃과 벌의 시기 어긋남: 기온 상승 w
  Q.def("clim-mismatch", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w }) => {
      clear(g);
      const fl = 100 - 4.5 * w, be = 100 - 1.5 * w, s = 6;
      const F = frame(g, 70, 120, 0, 0.075, [5, 0.025]); ticks(g, F, [70, 80, 90, 100, 110, 120], []);
      txt(g, 490, 200, "1월 1일부터의 날", "s", "end"); txt(g, 66, 26, "활동 정도", "s");
      Q.plot(g, F, (x) => pdf(x, fl, s), "c", 70, 120, 200); Q.plot(g, F, (x) => pdf(x, be, s), "b", 70, 120, 200);
      let ov = 0; for (let x = 60; x <= 130; x += 0.1) ov += Math.min(pdf(x, fl, s), pdf(x, be, s)) * 0.1;
      txt(g, F.x(fl), 20, "꽃", "s tc", "middle"); txt(g, F.x(be), 34, "벌", "s tb", "middle");
      read.textContent = `${num(w, 1)} °C 따뜻해지면 꽃은 ${num(4.5 * w, 1)}일, 벌은 ${num(1.5 * w, 1)}일 앞당겨져 ${num(3 * w, 1)}일 어긋난다. 꽃과 벌이 함께 활동하는 정도 ${num(ov * 100, 0)}% (모형)`;
    });
  });

  // 2-7 조류 증식: 수온 T, 총인 P (μg/L)
  Q.def("clim-algae", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T, P }) => {
      clear(g);
      const r = 0.9 * Math.exp(-(((T - 30) / 8) ** 2)) * P / (20 + P); // 하루 성장률
      const F = frame(g, 0, 20, 0, 5, [2, 1]); ticks(g, F, [0, 5, 10, 15, 20], [0, 1, 2, 3, 4, 5]);
      txt(g, 490, 200, "날", "s", "end"); txt(g, 66, 26, "남조류 (10의 거듭제곱 세포/mL)", "s");
      Q.line(g, F.x(0), F.y(4), F.x(20), F.y(4), "d"); txt(g, F.x(20), F.y(4) - 4, "녹조 경보 수준", "s td", "end");
      Q.plot(g, F, (t) => Math.min(5, 1 + r * t / Math.LN10), "b", 0, 20, 100);
      const days = r > 0 ? 3 * Math.LN10 / r : Infinity;
      read.textContent = `수온 ${T} °C, 총인 ${P} μg/L: 하루 성장률 ${num(r, 2)}, 두 배가 되는 데 ${r > 0 ? num(Math.LN2 / r, 1) : "∞"}일 → 1000배(경보 수준)까지 ${isFinite(days) ? num(days, 0) + "일" : "자라지 않음"}`;
    });
  });

  // 2-8 모기 매개 감염병: 기온 T
  Q.def("clim-vector", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T }) => {
      clear(g);
      const eip = (t) => t > 16 ? 110 / (t - 16) : Infinity, surv = (t) => t > 34 ? 0.8 : 0.9;
      const pr = (t) => isFinite(eip(t)) ? surv(t) ** eip(t) : 0;
      const F = frame(g, 16, 36, 0, 0.6, [2, 0.1]); ticks(g, F, [16, 20, 24, 28, 32, 36], [0, 0.2, 0.4, 0.6]);
      txt(g, 490, 200, "기온 (°C)", "s", "end"); txt(g, 66, 26, "모기가 병을 옮길 수 있게 될 확률", "s");
      Q.plot(g, F, pr, "b", 16.5, 36, 300);
      Q.dot(g, F.x(T), F.y(pr(T)), "fd", 5);
      read.textContent = `${T} °C: 바이러스가 모기 몸속에서 자라는 기간 약 ${isFinite(eip(T)) ? num(eip(T), 1) : "∞"}일, 모기가 그때까지 살아남아 병을 옮길 확률 ${num(pr(T) * 100, 0)}% (모형)`;
    });
  });

  // 3-1 산호 백화: 평소 최고 수온보다 높은 정도 a (°C), 이어진 주 w
  Q.def("clim-dhw", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, w }) => {
      clear(g);
      const dhw = a >= 1 ? a * w : 0;
      const F = frame(g, 0, 12, 0, 16, [1, 4]); ticks(g, F, [0, 4, 8, 12], [0, 4, 8, 12, 16]);
      txt(g, 490, 200, "주", "s", "end"); txt(g, 66, 26, "누적 고수온 (°C·주)", "s");
      el("rect", { x: F.x(0), y: F.y(16), width: F.x(12) - F.x(0), height: F.y(8) - F.y(16), class: "ld" }, g);
      el("rect", { x: F.x(0), y: F.y(8), width: F.x(12) - F.x(0), height: F.y(4) - F.y(8), class: "lc" }, g);
      Q.plot(g, F, (t) => a >= 1 ? a * Math.min(t, w) : 0, "b", 0, 12, 100);
      read.textContent = `평소 최고보다 ${num(a, 1)} °C 높은 날이 ${w}주: 누적 ${num(dhw, 1)} °C·주 → ` + (dhw >= 8 ? "심한 백화와 대량 폐사" : dhw >= 4 ? "산호 백화가 일어난다" : "아직 견딜 수 있다") + (a < 1 ? " (1 °C 미만은 누적하지 않음)" : "");
    });
  });

  // 3-2 연료 수분과 산불 확산: 연료 수분 m (%)
  Q.def("clim-fire", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const R = (x) => 60 * Math.exp(-0.15 * (x - 5)); // m/분
      const F = frame(g, 5, 30, 0, 60, [5, 10]); ticks(g, F, [5, 10, 15, 20, 25, 30], [0, 20, 40, 60]);
      txt(g, 490, 200, "죽은 연료의 수분 (%)", "s", "end"); txt(g, 66, 26, "불이 번지는 빠르기 (m/분)", "s");
      Q.plot(g, F, R, "b", 5, 30, 200); Q.dot(g, F.x(m), F.y(R(m)), "fd", 5);
      const A = Math.PI * (R(m) * 60 / 1000) ** 2 / 4 * 100; // ha, 타원 어림
      read.textContent = `연료 수분 ${m}%: 불이 1분에 약 ${num(R(m), 0)} m 번지고, 1시간 뒤 탄 넓이 약 ${num(A, 0)} ha (모형). 수분이 5%p 줄 때마다 빠르기는 약 2배, 넓이는 약 4배`;
    });
  });

  // 3-3 탄소 예산: 순배출 0에 이르는 해 Y, 2025년 배출 40 Gt/년, 남은 예산 500 Gt (1.5 °C)
  Q.def("clim-budget", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ Y }) => {
      clear(g);
      const cum = 40 * (Y - 2025) / 2;
      const F = frame(g, 2025, 2080, 0, 45, [5, 10]); ticks(g, F, [2025, 2040, 2055, 2070], [0, 10, 20, 30, 40]);
      txt(g, 490, 200, "연도", "s", "end"); txt(g, 66, 26, "CO₂ 배출 (Gt/년)", "s");
      el("path", { d: `M${F.x(2025)} ${F.y(0)} L${F.x(2025)} ${F.y(40)} L${F.x(Y)} ${F.y(0)} Z`, class: cum > 500 ? "ld" : "lb" }, g);
      Q.line(g, F.x(2025), F.y(40), F.x(Y), F.y(0), "b");
      read.textContent = `${Y}년에 순배출 0 (직선으로 감축): 그때까지 누적 배출 ${num(cum, 0)} Gt, 1.5 °C 예산 약 500 Gt의 ${num(cum / 5, 0)}% → ` + (cum <= 500 ? "예산 안" : "예산 초과");
    });
  });

  // 3-4 공공재 게임: 감축하는 나라 수 k (10개국), 감축 비용 1, 감축 하나의 이익 3을 모두가 나눔
  Q.def("clim-game", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const n = 10, ben = 3 * k / n, coop = ben - 1, def = ben, tot = n * ben - k;
      for (let i = 0; i < n; i++) el("rect", { x: 40 + i * 44, y: 30, width: 36, height: 36, class: i < k ? "lb" : "lk" }, g);
      bar(g, 90, (coop + 1) * 60, "lb", "감축하는 나라의 이득", num(coop, 1), 220);
      bar(g, 125, (def + 1) * 60, "lk", "감축 안 하는 나라의 이득", num(def, 1), 220);
      txt(g, 220, 180, `10개국 전체의 이득 ${num(tot, 1)} (모두 감축하면 20)`, "s");
      read.textContent = `${k}개국이 감축: 감축국 ${num(coop, 1)}, 무임승차국 ${num(def, 1)}. 늘 혼자 빠지는 쪽이 0.7 이득이지만, 모두 빠지면 전체 이득 0, 모두 감축하면 20`;
    });
  });
})();
