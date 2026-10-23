/* 융합과학 탐구 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };

  // 1-1 나선의 X선 무늬: 나선 한 바퀴의 길이 P (nm), 지름 2 nm
  Q.def("fusi-helix", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ P }) => {
      clear(g);
      const D = 2, a = Math.atan(P / (Math.PI * D)); // 가닥이 가로 방향과 이루는 각
      const cx = 380, cy = 110, L = 90;
      for (const s of [1, -1]) Q.line(g, cx - L * Math.sin(a) * s, cy - L * Math.cos(a), cx + L * Math.sin(a) * s, cy + L * Math.cos(a), "b");
      const sp = 100 / P; for (let i = -3; i <= 3; i++) if (i) Q.line(g, cx - 14, cy + i * sp, cx + 14, cy + i * sp, "gd");
      let d = ""; for (let i = 0; i <= 300; i++) { const z = i / 300 * 10; d += (i ? "L" : "M") + (120 + 18 * Math.cos(2 * Math.PI * z / P)) + " " + (20 + z * 18); }
      el("path", { d, class: "c" }, g);
      txt(g, 120, 214, "나선 10 nm 구간 (옆에서 본 모양)", "s", "middle"); txt(g, cx, 214, "X선 무늬", "s", "middle");
      read.textContent = `한 바퀴 ${num(P, 1)} nm, 지름 2 nm이면 가닥이 가로 방향과 ${num(a * 180 / Math.PI, 0)}° 기울고, X의 팔은 세로축과 ${num(a * 180 / Math.PI, 0)}°를 이룬다. 가로 줄 간격은 한 바퀴 길이에 반비례`;
    });
  });

  // 1-2 물감 혼합과 점 혼합: 노란 점의 비율 p
  Q.def("fusi-mix", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const Y = [0.9, 0.8, 0.1], B = [0.1, 0.3, 0.9];
      const paint = Y.map((y, i) => y ** p * B[i] ** (1 - p)), opt = Y.map((y, i) => p * y + (1 - p) * B[i]);
      const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
      bar(g, 50, lum(paint) * 300, "lk", "물감을 섞으면", `밝기 ${num(lum(paint) * 100, 0)}%`);
      bar(g, 95, lum(opt) * 300, "lc", "점으로 나란히 찍으면", `밝기 ${num(lum(opt) * 100, 0)}%`);
      read.textContent = `노랑 ${num(p * 100, 0)}% + 파랑: 물감은 서로의 빛을 빼앗아(흡수의 곱) 밝기 ${num(lum(paint) * 100, 0)}%, 점 혼합은 눈에서 빛이 더해져(평균) ${num(lum(opt) * 100, 0)}%`;
    });
  });

  // 1-3 온도 척도: 두 온도 t1, t2 (°C)
  Q.def("fusi-scale", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t1, t2 }) => {
      clear(g);
      const k1 = t1 + 273.15, k2 = t2 + 273.15;
      bar(g, 40, Math.max(1, (t2 + 20) * 3), "lb", `${t2} °C`, `섭씨 비 ${t1 !== 0 ? num(t2 / t1, 2) : "정의 안 됨"}`);
      bar(g, 75, Math.max(1, (t1 + 20) * 3), "lk", `${t1} °C`, "");
      bar(g, 120, k2 / 2, "lc", `${num(k2, 2)} K`, `절대 온도 비 ${num(k2 / k1, 3)}`);
      bar(g, 155, k1 / 2, "lk", `${num(k1, 2)} K`, "");
      read.textContent = `${t2} °C ÷ ${t1} °C = ${t1 !== 0 ? num(t2 / t1, 2) : "?"} 이지만 이는 의미가 없다. 0점이 임의인 간격 척도이기 때문이다. 분자 운동 에너지의 비는 절대 온도의 비 ${num(k2 / k1, 3)}`;
    });
  });

  // 1-4 스마트 플러그의 측정 간격: 간격 dt (s), 냉장고 압축기 10분 켜짐(150 W)·20분 꺼짐(5 W)
  Q.def("fusi-plug", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dt }) => {
      clear(g);
      const Pw = (t) => ((t % 1800) < 600 ? 150 : 5);
      let est = 0; for (let t = 37; t < 86400; t += dt) est += Pw(t) * dt;
      const tru = (150 * 600 + 5 * 1200) / 1800 * 86400;
      const F = frame(g, 0, 120, 0, 180, [10, 50]); ticks(g, F, [0, 30, 60, 90, 120], [0, 50, 100, 150]);
      txt(g, 490, 200, "시간 (분)", "s", "end"); txt(g, 66, 26, "전력 (W)", "s");
      let d = ""; for (let i = 0; i <= 720; i++) { const t = i * 10; d += (i ? "L" : "M") + F.x(t / 60) + " " + F.y(Pw(t)); }
      el("path", { d, class: "gd" }, g);
      for (let t = 37; t < 7200; t += dt) Q.dot(g, F.x(t / 60), F.y(Pw(t)), "fd", 3);
      read.textContent = `${dt}초마다 재면 하루 전력량 ${num(est / 3.6e6, 3)} kWh (참값 ${num(tru / 3.6e6, 3)} kWh, 오차 ${num((est - tru) / tru * 100, 1)}%). 켜짐과 꺼짐 주기보다 자주 재야 한다`;
    });
  });

  // 2-1 구텐베르크–리히터 법칙: 규모 M, 해마다 규모 4 이상 1000번 (b = 1)
  Q.def("fusi-gr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ M }) => {
      clear(g);
      const N = (m) => 1000 * 10 ** (-(m - 4));
      const F = frame(g, 4, 8, -2, 3, [0.5, 1]); ticks(g, F, [4, 5, 6, 7, 8], []);
      for (const [y, lb] of [[-2, "0.01"], [0, "1"], [1, "10"], [2, "100"], [3, "1000"]]) txt(g, F.X0 - 5, F.y(y) + 4, lb, "s", "end");
      txt(g, 490, 200, "규모", "s", "end"); txt(g, 66, 26, "해마다 일어나는 횟수 (로그 눈금)", "s");
      Q.plot(g, F, (m) => Math.log10(N(m)), "b", 4, 8, 50);
      Q.dot(g, F.x(M), F.y(Math.log10(N(M))), "fd", 5);
      read.textContent = `규모 ${num(M, 1)} 이상: 해마다 약 ${N(M) >= 1 ? num(N(M), 0) + "번" : "1번 미만, " + num(1 / N(M), 0) + "년에 한 번"}. 규모가 1 커질 때마다 횟수는 10분의 1, 에너지는 약 32배`;
    });
  });

  // 2-2 냉각의 두 가설: 측정 시간 tm (분), 처음 80 °C, 실온 20 °C, k = 0.05/분
  Q.def("fusi-cool", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ tm }) => {
      clear(g);
      const k = 0.05, newton = (t) => 20 + 60 * Math.exp(-k * t), r = (80 - newton(10)) / 10, lin = (t) => Math.max(20, 80 - r * t);
      const F = frame(g, 0, 60, 0, 85, [10, 20]); ticks(g, F, [0, 10, 20, 30, 40, 50, 60], [0, 20, 40, 60, 80]);
      txt(g, 490, 200, "시간 (분)", "s", "end"); txt(g, 66, 26, "물의 온도 (°C)", "s");
      Q.plot(g, F, newton, "b", 0, 60, 200); Q.plot(g, F, lin, "c", 0, 60, 200);
      el("rect", { x: F.x(0), y: 15, width: F.x(tm) - F.x(0), height: 190, class: "la" }, g);
      let diff = 0; for (let t = 0; t <= tm; t += 0.5) diff = Math.max(diff, Math.abs(newton(t) - lin(t)));
      read.textContent = `${tm}분 동안 재면 두 가설(파랑 뉴턴 냉각, 주황 일정한 빠르기)의 예측이 가장 크게는 ${num(diff, 1)} °C 다르다. 온도계 오차 ±0.5 °C의 두 배보다 ${diff > 1 ? "커서 가릴 수 있다" : "작아 가리기 어렵다"}`;
    });
  });

  // 2-3 응답 편향: 좋아하는 학생의 응답률 ra, 다른 학생의 응답률 rb, 실제 비율 30%
  Q.def("fusi-bias", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ra, rb }) => {
      clear(g);
      const p = 0.3, A = p * ra / 100, B = (1 - p) * rb / 100, est = A / (A + B);
      bar(g, 50, p * 300, "lb", "실제 비율", "30%");
      bar(g, 95, est * 300, "ld", "설문 결과", `${num(est * 100, 0)}%`);
      txt(g, 170, 160, `응답자 비율 ${num((A + B) * 100, 0)}% (전교생 1000명이면 ${num((A + B) * 1000, 0)}명)`, "s");
      read.textContent = `좋아하는 학생이 ${ra}%, 다른 학생이 ${rb}% 응답하면 설문은 ${num(est * 100, 0)}%로 나온다. 응답자가 많아도 응답하는 사람이 치우치면 전체를 대표하지 못한다`;
    });
  });

  // 2-4 그림 그래프의 넓이 왜곡: 값의 비 r
  Q.def("fusi-area", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const s = 40;
      el("rect", { x: 40, y: 190 - s, width: s, height: s, class: "lb" }, g); el("rect", { x: 100, y: 190 - s * r, width: s * r, height: s * r, class: "lc" }, g);
      txt(g, 60, 205, "1", "s", "middle"); txt(g, 100 + s * r / 2, 205, `${num(r, 1)}`, "s", "middle");
      el("rect", { x: 330, y: 190 - s, width: 40, height: s, class: "lb" }, g); el("rect", { x: 390, y: 190 - s * r, width: 40, height: s * r, class: "lc" }, g);
      txt(g, 350, 205, "1", "s", "middle"); txt(g, 410, 205, `${num(r, 1)}`, "s", "middle");
      txt(g, 100, 25, "가로세로 모두 늘린 그림", "s"); txt(g, 330, 25, "높이만 늘린 막대", "s");
      read.textContent = `값이 ${num(r, 1)}배일 때 그림을 가로세로 모두 키우면 넓이는 ${num(r * r, 1)}배로 보인다 (막대는 ${num(r, 1)}배). 입체 그림이면 부피가 ${num(r ** 3, 1)}배로 보여 차이를 더 부풀린다`;
    });
  });

  // 2-5 평균 차이와 표본 수: 모둠마다 n명, 평균 차 d, 표준 편차 6
  Q.def("fusi-meansd", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n, d }) => {
      clear(g);
      const s = 6, se = s * Math.sqrt(2 / n), t = d / se;
      const F = frame(g, 0, 3, 40, 70, [1, 5]); ticks(g, F, [], [40, 50, 60, 70]);
      const mA = 50, mB = 50 + d, e = 2 * s / Math.sqrt(n);
      for (const [x, m, cls] of [[1, mA, "b"], [2, mB, "c"]]) { Q.line(g, F.x(x), F.y(m - e), F.x(x), F.y(m + e), cls); Q.dot(g, F.x(x), F.y(m), cls === "b" ? "fb" : "fc", 6); }
      txt(g, F.x(1), 220, "A 모둠", "s", "middle"); txt(g, F.x(2), 220, "B 모둠", "s", "middle");
      read.textContent = `모둠마다 ${n}명, 평균 차 ${d}점, 표준 편차 6점: 차이 ÷ 표준 오차 = ${num(t, 2)} → ` + (t > 2 ? "우연으로 보기 어렵다 (2 넘음)" : "우연으로도 생길 수 있다 (2 미만)");
    });
  });

  // 2-6 심슨의 역설 (신장 결석 치료 자료): 보기 v (0 작은 결석, 1 큰 결석, 2 전체)
  const SIM = [["작은 결석", 81, 87, 234, 270], ["큰 결석", 192, 263, 55, 80], ["전체", 273, 350, 289, 350]];
  Q.def("fusi-simpson", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ v }) => {
      clear(g);
      SIM.forEach(([nm, a, an, b, bn], i) => { const y = 25 + i * 60; bar(g, y, a / an * 250, i === v ? "lb" : "lk", `${nm} · 치료 A`, `${num(a / an * 100, 0)}% (${a}/${an})`, 200); bar(g, y + 24, b / bn * 250, i === v ? "lc" : "lk", `치료 B`, `${num(b / bn * 100, 0)}% (${b}/${bn})`, 200); });
      const [nm, a, an, b, bn] = SIM[v];
      read.textContent = `${nm}: 치료 A ${num(a / an * 100, 0)}%, 치료 B ${num(b / bn * 100, 0)}% 성공. ` + (v === 2 ? "전체로는 B가 나아 보이지만, A가 어려운 큰 결석 환자를 훨씬 많이 맡았다" : "이 집단에서는 A가 더 낫다");
    }, (k, x) => SIM[x][0]);
  });

  // 2-7 오차 막대와 표본 수: n
  Q.def("fusi-err", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const s = 6, se = s / Math.sqrt(n);
      const F = frame(g, 0, 3, 40, 65, [1, 5]); ticks(g, F, [], [40, 45, 50, 55, 60, 65]);
      for (const [x, m, cls] of [[1, 50, "b"], [2, 53, "c"]]) { Q.line(g, F.x(x), F.y(m - 2 * se), F.x(x), F.y(m + 2 * se), cls); Q.line(g, F.x(x) - 8, F.y(m - 2 * se), F.x(x) + 8, F.y(m - 2 * se), cls); Q.line(g, F.x(x) - 8, F.y(m + 2 * se), F.x(x) + 8, F.y(m + 2 * se), cls); Q.dot(g, F.x(x), F.y(m), cls === "b" ? "fb" : "fc", 6); }
      const overlap = (50 + 2 * se) > (53 - 2 * se);
      read.textContent = `표본 ${n}개씩: 평균의 불확도 ±${num(2 * se, 1)}. 두 오차 막대가 ${overlap ? "겹친다 (차이를 단정하기 어렵다)" : "겹치지 않는다 (차이가 분명하다)"}. 발표 그래프에는 표본 수와 막대의 뜻을 꼭 적는다`;
    });
  });

  // 3-1 지수 추세의 외삽: 연도 y, 1971년 2300개, 2년마다 두 배
  Q.def("fusi-moore", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ y }) => {
      clear(g);
      const N = (t, T) => 2300 * 2 ** ((t - 1971) / T);
      const F = frame(g, 1970, 2040, 3, 15, [10, 2]); ticks(g, F, [1970, 1990, 2010, 2030], [4, 6, 8, 10, 12, 14]);
      txt(g, 490, 200, "연도", "s", "end"); txt(g, 66, 26, "칩 하나의 트랜지스터 수 (10의 거듭제곱)", "s");
      Q.plot(g, F, (t) => Math.log10(N(t, 2)), "b", 1970, 2040, 100); Q.plot(g, F, (t) => Math.log10(N(t, 2.2)), "c", 1970, 2040, 100);
      for (const [t, v] of [[1971, 2300], [1989, 1.2e6], [2000, 4.2e7], [2010, 1.2e9], [2020, 1.6e10]]) Q.dot(g, F.x(t), F.y(Math.log10(v)), "fk", 3);
      read.textContent = `${y}년 예측: 2년마다 두 배면 ${N(y, 2).toExponential(1)}개, 2.2년마다 두 배면 ${N(y, 2.2).toExponential(1)}개 (${num(N(y, 2) / N(y, 2.2), 1)}배 차이). 검은 점은 실제 칩(대략값)`;
    });
  });

  // 3-2 해수 담수화의 최소 에너지: 염분 S (g/L), 25 °C
  Q.def("fusi-desal", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ S }) => {
      clear(g);
      const pi = 2 * S / 58.5 * 0.08206 * 298, kwh = pi * 101325 / 3.6e6; // kWh/m³
      bar(g, 40, pi * 4, "lb", "삼투압", `${num(pi, 1)} atm`);
      bar(g, 80, kwh * 80, "lc", "이론적 최소 에너지", `${num(kwh, 2)} kWh/m³`);
      bar(g, 120, 3 * 80, "lk", "실제 역삼투 시설 (대략)", "약 3 kWh/m³");
      read.textContent = `염분 ${S} g/L (NaCl로 어림): 삼투압 ${num(pi, 1)} atm, 물 1 m³를 얻는 최소 에너지 = 삼투압 × 부피 ≈ ${num(kwh, 2)} kWh. 실제로는 그 몇 배가 든다`;
    });
  });

  // 3-3 공정성: 집단 B의 실제 양성 비율 bB (%), 집단 A 30%, 민감도 80%, 특이도 90%
  Q.def("fusi-fair", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ bB }) => {
      clear(g);
      const ppv = (b) => b * 0.8 / (b * 0.8 + (1 - b) * 0.1);
      const a = ppv(0.3), b = ppv(bB / 100);
      bar(g, 50, a * 250, "lb", "집단 A (30%)", `양성 판정 중 실제 양성 ${num(a * 100, 0)}%`);
      bar(g, 95, b * 250, "lc", `집단 B (${bB}%)`, `양성 판정 중 실제 양성 ${num(b * 100, 0)}%`);
      txt(g, 170, 160, "두 집단에 같은 민감도 80%, 특이도 90%", "s");
      read.textContent = `실제 양성 비율이 다르면(30% 대 ${bB}%), 같은 정확도의 판정도 '양성' 판정을 믿을 수 있는 정도가 ${num(a * 100, 0)}% 대 ${num(b * 100, 0)}%로 달라진다. 모든 공정성 기준을 한꺼번에 맞추기는 어렵다`;
    });
  });

  // 3-4 다수결의 정확도: 참여자 n (홀수), 한 사람이 맞힐 확률 p
  Q.def("fusi-crowd", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const acc = (n, p) => { let s = 0; for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += comb(n, k) * p ** k * (1 - p) ** (n - k); return s; };
    Q.bind(fig, ({ n, p }) => {
      clear(g);
      const F = frame(g, 1, 51, 0.4, 1, [10, 0.1]); ticks(g, F, [1, 11, 21, 31, 41, 51], [0.5, 0.6, 0.7, 0.8, 0.9, 1]);
      txt(g, 490, 200, "참여한 사람 수", "s", "end"); txt(g, 66, 26, "다수결이 맞을 확률", "s");
      let d = ""; for (let m = 1; m <= 51; m += 2) d += (m > 1 ? "L" : "M") + F.x(m) + " " + F.y(acc(m, p / 100));
      el("path", { d, class: "b" }, g);
      const nn = n % 2 ? n : n + 1; Q.dot(g, F.x(nn), F.y(acc(nn, p / 100)), "fd", 5);
      read.textContent = `한 사람이 ${p}% 맞히는 판단을 ${nn}명이 독립적으로 하면 다수결이 맞을 확률 ${num(acc(nn, p / 100) * 100, 1)}% (콩도르세 배심원 정리). 단 서로 따라 하지 않고 각자 판단해야 한다`;
    });
  });
})();
