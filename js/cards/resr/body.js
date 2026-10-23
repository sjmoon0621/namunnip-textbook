/* 과학과제 연구 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st) => { const F = Q.frame(x0, x1, y0, y1, 60, 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const axl = (g, a, b) => { txt(g, 490, 200, a, "s", "end"); txt(g, 66, 26, b, "s"); };
  const ncdf = (z) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };

  // 1-1 제멜바이스: 손 씻기를 지킨 비율 w (%)
  Q.def("resr-semm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w }) => {
      clear(g);
      const m1 = 1.2 + 8.7 * (1 - w / 100), m2 = 3.9;
      bar(g, 50, m1 * 25, "lc", "제1병동 (의사)", `${num(m1, 1)}%`);
      bar(g, 95, m2 * 25, "lb", "제2병동 (조산사)", `${num(m2, 1)}%`);
      read.textContent = `의사들이 손을 염소 용액으로 씻는 비율 ${w}%: 제1병동 산모 사망률 ${num(m1, 1)}% (1846년 자료 약 9.9%, 1848년 약 1.3%를 이은 모형). 원인을 짐작하고 처치로 시험한 가설 연역의 결과`;
    });
  });

  // 1-2 검은 깡통과 흰 깡통: 검은 깡통의 물 질량 m (g), 흰 깡통 200 g, 햇빛 20분
  Q.def("resr-cans", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const I = 600, A = 0.01, t = 1200, Tb = 0.9 * I * A * t / (m * 4.18), Tw = 0.3 * I * A * t / (200 * 4.18);
      bar(g, 50, Tb * 12, "lk", `검은 깡통 (물 ${m} g)`, `${num(Tb, 1)} °C 오름`);
      bar(g, 95, Tw * 12, "lb", "흰 깡통 (물 200 g)", `${num(Tw, 1)} °C 오름`);
      read.textContent = `흡수율 90%와 30%, 햇빛 600 W/m², 20분 (모형): 물의 양이 같으면 검은 깡통이 3배 더 오르지만, 검은 깡통에 물이 ${num(m / 200, 1)}배 들어 있으면 ` + (Tb > Tw ? "그래도 검은 깡통이 더 오른다" : "결론이 뒤집힌다") + `. 통제 변인을 같게 해야 하는 까닭`;
    });
  });

  // 1-3 분석을 여러 번 바꾸면: 시도한 분석의 수 k, 유의 수준 5%
  Q.def("resr-phack", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const P = (n) => 1 - 0.95 ** n;
      const F = frame(g, 1, 40, 0, 1, [5, 0.25]); ticks(g, F, [1, 10, 20, 30, 40], [0, 0.25, 0.5, 0.75, 1]); axl(g, "시도한 분석 방법의 수", "효과가 없는데 하나라도 '유의'할 확률");
      Q.plot(g, F, P, "b", 1, 40, 100);
      Q.line(g, F.x(1), F.y(0.05), F.x(40), F.y(0.05), "gd");
      Q.dot(g, F.x(k), F.y(P(k)), "fd", 5);
      read.textContent = `효과가 전혀 없어도 서로 다른 분석을 ${k}번 해 보면 하나라도 p < 0.05가 나올 확률 1 − 0.95^${k} = ${num(P(k) * 100, 0)}%. 분석 계획을 미리 정해 두어야 하는 까닭`;
    });
  });

  // 1-4 효과 크기와 필요한 표본 수 (검정력 80%, 유의 수준 5%)
  Q.def("resr-n", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const n = (x) => 16 / (x * x);
      const F = frame(g, 0.2, 2, 0, 200, [0.2, 50]); ticks(g, F, [0.2, 0.6, 1, 1.4, 1.8], [0, 50, 100, 150, 200]); axl(g, "효과 크기 d (평균 차 ÷ 표준 편차)", "모둠마다 필요한 표본 수");
      Q.plot(g, F, (x) => Math.min(200, n(x)), "b", 0.25, 2, 200);
      Q.dot(g, F.x(d), F.y(Math.min(200, n(d))), "fd", 5);
      read.textContent = `효과 크기 ${num(d, 2)}: 모둠마다 약 ${Math.ceil(n(d))}개 (n ≈ 16/d²). 효과가 작을수록 표본이 제곱으로 늘어, 1년 동안 실험실에서 할 수 있는지가 주제 선정의 기준이 된다`;
    });
  });

  // 2-1 검색어를 더할수록 줄어드는 결과: 덧붙인 검색어 수 k
  Q.def("resr-search", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const KW = ["plant growth", "+ LED", "+ wavelength", "+ lettuce", "+ hydroponic"];
    Q.bind(fig, ({ k }) => {
      clear(g);
      for (let i = 0; i <= 4; i++) { const N = 2e6 * 0.05 ** i; bar(g, 10 + i * 38, (Math.log10(N) + 1) * 40, i === k ? "lc" : i < k ? "lb" : "lk", KW[i], N >= 1e4 ? num(N / 1e4, 0) + "만 건" : num(N, 0) + "건", 150); }
      const N = 2e6 * 0.05 ** k;
      read.textContent = `검색어 ${k + 1}개를 AND로 묶으면 약 ${N >= 1e4 ? num(N / 1e4, 0) + "만" : num(N, 0)}건 (검색어 하나를 더할 때마다 5%만 남는다고 본 모형). 수백 건 안쪽으로 좁힌 뒤 초록을 읽어 고른다`;
    });
  });

  // 2-2 가설의 정밀도: 예측한 범위의 폭 w (측정 가능 범위 0~100)
  Q.def("resr-prec", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w }) => {
      clear(g);
      const F = Q.frame(0, 100, 0, 1, 60, 490, 15, 205);
      el("rect", { x: F.x(0), y: 90, width: F.x(100) - F.x(0), height: 30, class: "lk" }, g);
      el("rect", { x: F.x(50 - w / 2), y: 90, width: F.x(50 + w / 2) - F.x(50 - w / 2), height: 30, class: "lc" }, g);
      for (const x of [0, 25, 50, 75, 100]) txt(g, F.x(x), 140, `${x}`, "s", "middle");
      txt(g, F.x(50), 80, "가설이 예측한 범위", "s", "middle");
      read.textContent = `가설이 측정 범위의 ${w}%를 예측하면, 아무 관계가 없어도 우연히 맞을 확률이 ${w}%이다. 예측이 좁고 구체적일수록 틀릴 수 있어서, 맞았을 때 더 많은 것을 알려 준다`;
    });
  });

  // 2-3 반복 횟수와 평균 차의 불확도: 모둠마다 반복 n, 표준 편차 2 cm
  Q.def("resr-rep", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const h = 2 * 2 * Math.sqrt(2 / n);
      const F = frame(g, -3, 5, 0, 1, [1, 1]); ticks(g, F, [-3, -2, -1, 0, 1, 2, 3, 4, 5], []); txt(g, 490, 200, "처리군 − 대조군 (cm)", "s", "end");
      Q.line(g, F.x(0), 30, F.x(0), 190, "gd");
      Q.line(g, F.x(1.5 - h), 110, F.x(1.5 + h), 110, "b"); Q.dot(g, F.x(1.5), 110, "fb", 6);
      read.textContent = `모둠마다 ${n}번 반복: 평균 차 1.5 cm의 95% 범위 ±${num(h, 2)} cm. ` + (1.5 - h > 0 ? "범위가 0을 넘지 않아 효과가 있다고 말할 수 있다" : "범위가 0을 포함해 효과를 단정할 수 없다") + ". 반복은 설계 단계에서 정해야 한다";
    });
  });

  // 2-4 축의 변환으로 직선 만들기: 가로축을 t^p로 그림, 자료 y = 4.9 t²
  Q.def("resr-lin", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const T = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4], Y = T.map((t, i) => 4.9 * t * t * (1 + [0.03, -0.02, 0.01, -0.03, 0.02, 0.0, -0.01][i]));
    Q.bind(fig, ({ p }) => {
      clear(g);
      const X = T.map((t) => t ** p), mx = Math.max(...X);
      const F = frame(g, 0, mx * 1.05, 0, 10, [mx / 5, 2]); ticks(g, F, [], [0, 2, 4, 6, 8, 10]); axl(g, `t^${num(p, 1)}`, "낙하 거리 (m)");
      const n = X.length, sx = X.reduce((a, b) => a + b), sy = Y.reduce((a, b) => a + b), sxx = X.reduce((a, b) => a + b * b, 0), sxy = X.reduce((a, x, i) => a + x * Y[i], 0), syy = Y.reduce((a, b) => a + b * b, 0);
      const r = (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy)), b = (n * sxy - sx * sy) / (n * sxx - sx * sx), a = (sy - b * sx) / n;
      Q.plot(g, F, (x) => a + b * x, "gd", 0, mx, 20);
      X.forEach((x, i) => Q.dot(g, F.x(x), F.y(Y[i]), "fb", 4));
      read.textContent = `가로축을 t^${num(p, 1)}로 그리면 상관 계수 r = ${num(r, 4)}, 기울기 ${num(b, 2)}. p = 2에서 점들이 가장 곧게 늘어서고 기울기가 g/2 ≈ 4.9로 해석된다`;
    });
  });

  // 3-1 평균 차의 95% 신뢰 구간과 p값: 표본 수 n, 평균 차 1.5 cm, 표준 편차 2 cm
  Q.def("resr-ci", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n, d }) => {
      clear(g);
      const se = 2 * Math.sqrt(2 / n), z = d / se, p = 2 * (1 - ncdf(z));
      const F = frame(g, -3, 5, 0, 1, [1, 1]); ticks(g, F, [-3, -2, -1, 0, 1, 2, 3, 4, 5], []); txt(g, 490, 200, "평균 차 (cm)", "s", "end");
      Q.line(g, F.x(0), 30, F.x(0), 190, "gd");
      Q.line(g, F.x(d - 1.96 * se), 110, F.x(d + 1.96 * se), 110, "b"); Q.dot(g, F.x(d), 110, "fb", 6);
      read.textContent = `모둠마다 ${n}개, 평균 차 ${num(d, 1)} cm: 표준 오차 ${num(se, 2)}, 95% 신뢰 구간 ${num(d - 1.96 * se, 2)}~${num(d + 1.96 * se, 2)} cm, p ≈ ${p < 0.001 ? "0.001 미만" : num(p, 3)}. 효과 크기 d/s = ${num(d / 2, 2)}`;
    });
  });

  // 3-2 결론의 범위: 자료 범위(0~10) 밖으로 이어 그린 직선과 실제 곡선
  Q.def("resr-extrap", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const tr = (u) => 40 * u / (u + 30), lin = (u) => 0.4 + 0.97 * u;
      const F = frame(g, 0, 40, 0, 40, [5, 10]); ticks(g, F, [0, 10, 20, 30, 40], [0, 10, 20, 30, 40]); axl(g, "비료의 양 (g)", "생장량 (cm)");
      el("rect", { x: F.x(0), y: 15, width: F.x(10) - F.x(0), height: 190, class: "la" }, g);
      Q.plot(g, F, tr, "b", 0, 40, 200); Q.plot(g, F, lin, "c", 0, 40, 20);
      Q.dot(g, F.x(x), F.y(Math.min(40, lin(x))), "fc", 5); Q.dot(g, F.x(x), F.y(tr(x)), "fb", 5);
      read.textContent = `${x} g에서 직선(주황)은 ${num(lin(x), 1)} cm, 실제(파랑)는 ${num(tr(x), 1)} cm로 ${num(Math.abs(lin(x) - tr(x)) / tr(x) * 100, 0)}% 차이. 실험한 범위(색칠, 0~10 g) 밖은 결론에 넣을 수 없다(모형)`;
    });
  });

  // 3-3 오차의 전파와 유효 숫자: 초시계 오차 dt (s), 진자 길이 1.000 ± 0.002 m, 진동 횟수 N
  Q.def("resr-sig", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dt, N }) => {
      clear(g);
      const L = 1.0, T = 2.006, rL = 0.002 / L, rT = dt / (N * T), gv = 4 * Math.PI * Math.PI * L / (T * T), rg = rL + 2 * rT;
      bar(g, 40, rL * 100 * 150, "lk", "길이의 상대 오차", `${num(rL * 100, 2)}%`);
      bar(g, 80, 2 * rT * 100 * 150, "lb", "주기의 상대 오차 × 2", `${num(2 * rT * 100, 2)}%`);
      bar(g, 120, rg * 100 * 150, "lc", "g의 상대 오차", `${num(rg * 100, 2)}%`);
      const dg = gv * rg, dig = dg >= 0.1 ? 1 : 2;
      read.textContent = `${N}번 진동을 ±${dt} s로 재면 g = 4π²L/T² = ${num(gv, dig)} ± ${num(dg, dig)} m/s². 오차의 첫 자리까지만 쓰는 것이 정직한 유효 숫자이다`;
    });
  });

  // 3-4 포스터 글자의 크기: 읽는 거리 d (m)
  Q.def("resr-font", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const h = d * 1000 * Math.tan(0.3 * Math.PI / 180), pt = h / 0.7 / 0.353;
      el("rect", { x: 300, y: 205 - Math.min(180, h * 4), width: 40, height: Math.min(180, h * 4), class: "lb" }, g);
      txt(g, 320, 220, "글자 높이", "s", "middle");
      bar(g, 50, Math.min(200, pt / 2), "lc", "필요한 글자 크기", `약 ${num(pt, 0)} pt`, 120);
      read.textContent = `${num(d, 1)} m 떨어져 읽으려면 글자의 대문자 높이가 시각 약 0.3°, 곧 ${num(h, 1)} mm 이상(약 ${num(pt, 0)} pt)이어야 한다. 제목은 그 두세 배, 본문 글자 수는 줄인다(어림)`;
    });
  });
})();
