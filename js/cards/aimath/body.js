/* 인공지능 수학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const gauss = (r) => { const u = r() || 1e-9, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  // 1-1 무게 기준으로 귤과 사과 가르기
  const R1 = rng(3), ORA = [], APP = [];
  for (let i = 0; i < 20; i++) { ORA.push(120 + 18 * gauss(R1)); APP.push(200 + 25 * gauss(R1)); }
  Q.def("ai-threshold", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w }) => {
      clear(g);
      const F = Q.frame(60, 280, 0, 1, 40, 490, 0, 1);
      Q.line(g, 40, 150, 490, 150, "ax");
      for (let x = 80; x <= 280; x += 40) txt(g, F.x(x), 168, `${x}`, "s", "middle");
      txt(g, 490, 186, "무게 (g)", "s", "end");
      ORA.forEach((x, i) => Q.dot(g, F.x(x), 120 - (i % 5) * 9, "fc", 4.5)); APP.forEach((x, i) => Q.dot(g, F.x(x), 75 - (i % 5) * 9, "fd", 4.5));
      Q.line(g, F.x(w), 20, F.x(w), 150, "b"); txt(g, F.x(w) + 4, 30, `기준 ${w} g`, "s tb");
      const ok = ORA.filter((x) => x < w).length + APP.filter((x) => x >= w).length;
      txt(g, 44, 200, "주황 귤, 빨강 사과 (각 20개)", "s");
      read.textContent = `기준 ${w} g 미만은 귤, 이상은 사과: 40개 중 ${ok}개 맞힘 (정확도 ${num(ok / 40 * 100, 1)}%)`;
    });
  });

  // 1-2 퍼셉트론: w1 x1 + w2 x2 + b > 0 이면 1
  Q.def("ai-perceptron", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w1, w2, b, task }) => {
      clear(g);
      const T = [["AND", [0, 0, 0, 1]], ["OR", [0, 1, 1, 1]], ["XOR", [0, 1, 1, 0]]][task], P = [[0, 0], [1, 0], [0, 1], [1, 1]];
      const F = Q.frame(-0.5, 1.5, -0.5, 1.5, 60, 260, 15, 215); Q.axes(g, F, { step: 0.5, label: false });
      if (Math.abs(w2) > 1e-9) Q.plot(g, F, (x) => -(w1 * x + b) / w2, "b", -0.5, 1.5); else if (Math.abs(w1) > 1e-9) Q.line(g, F.x(-b / w1), 15, F.x(-b / w1), 215, "b");
      let ok = 0;
      P.forEach(([x1, x2], i) => { const out = w1 * x1 + w2 * x2 + b > 0 ? 1 : 0, want = T[1][i]; if (out === want) ok++; Q.dot(g, F.x(x1), F.y(x2), want ? "fd" : "fk", 7); txt(g, F.x(x1) + 10, F.y(x2) - 8, `${out}`, "s" + (out === want ? "" : " td")); });
      txt(g, 290, 50, `목표 ${T[0]}`, "s"); txt(g, 290, 80, "빨강 점 = 1, 검정 점 = 0", "s"); txt(g, 290, 110, "점 옆 숫자 = 뉴런의 출력", "s"); txt(g, 290, 150, `${ok} / 4 맞음`, "s tc");
      read.textContent = `${T[0]}: ${num(w1, 1)}x₁ + ${num(w2, 1)}x₂ + ${num(b, 1)} > 0 이면 1 → 4개 중 ${ok}개 맞음` + (task === 2 ? " (직선 하나로는 XOR을 가를 수 없다)" : "");
    }, (k, v) => k === "task" ? ["AND", "OR", "XOR"][v] : num(v, 1));
  });

  // 1-3 표본 크기와 오차: 진짜 비율 40%, 표본 n명
  Q.def("ai-sample", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n, bias }) => {
      clear(g);
      const F = frame(g, 0, 50, 0.1, 0.7, [10, 0.1]); ticks(g, F, [0, 25, 50], [0.2, 0.4, 0.6]);
      const p = 0.4, pb = p + bias / 100, se = Math.sqrt(pb * (1 - pb) / n), r = rng(17);
      Q.line(g, 60, F.y(p), 490, F.y(p), "d"); txt(g, 486, F.y(p) - 4, "진짜 40%", "s td", "end");
      for (let i = 1; i <= 50; i++) { const est = pb + se * gauss(r); Q.dot(g, F.x(i), F.y(Math.max(0.1, Math.min(0.7, est))), "fb", 3); }
      txt(g, 66, 26, "표본 50개를 뽑을 때마다의 추정값", "s");
      read.textContent = `표본 ${n}명, 표본 치우침 ${bias}%p: 추정값의 흩어짐(표준 오차) 약 ±${num(se * 100, 2)}%p, 평균 ${num(pb * 100, 0)}%`;
    });
  });

  // 2-1 자카드 유사도
  const SEN = [["나는 사과를 좋아한다", "나는 귤을 좋아한다"], ["오늘 날씨가 맑다", "오늘 날씨가 흐리다"], ["고양이가 잔다", "강아지가 뛴다"], ["수학은 재미있다", "수학은 정말 재미있다"]];
  Q.def("ai-jaccard", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const [a, b] = SEN[k], A = new Set(a.split(" ")), B = new Set(b.split(" ")), I = [...A].filter((w) => B.has(w)), U = new Set([...A, ...B]);
      el("circle", { cx: 200, cy: 110, r: 80, class: "lb", opacity: 0.6 }, g); el("circle", { cx: 310, cy: 110, r: 80, class: "lc", opacity: 0.6 }, g);
      [...A].filter((w) => !B.has(w)).forEach((w, i) => txt(g, 160, 95 + i * 20, w, "s", "middle"));
      I.forEach((w, i) => txt(g, 255, 95 + i * 20, w, "s", "middle"));
      [...B].filter((w) => !A.has(w)).forEach((w, i) => txt(g, 350, 95 + i * 20, w, "s", "middle"));
      txt(g, 200, 210, `"${a}"`, "s", "middle"); txt(g, 310, 225, `"${b}"`, "s", "middle");
      read.textContent = `공통 낱말 ${I.length}개, 합집합 ${U.size}개 → 자카드 유사도 ${I.length}/${U.size} = ${num(I.length / U.size, 3)}`;
    });
  });

  // 2-2 TF-IDF: 문서 5개, 낱말별 빈도와 등장 문서 수
  const WORDS = [["은/는", 9, 5], ["학교", 6, 4], ["급식", 5, 1], ["맛있다", 4, 2], ["메뉴", 3, 1]];
  Q.def("ai-tfidf", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const N = 5, rows = WORDS.map(([w, tf, df]) => [w, tf, df, m ? tf * Math.log10(N / df) : tf]);
      const max = Math.max(...rows.map((r) => r[3])) || 1;
      rows.forEach(([w, tf, df, s], i) => { el("rect", { x: 140, y: 25 + i * 34, width: 300 * s / max, height: 22, class: m ? "lc" : "lb" }, g); txt(g, 132, 41 + i * 34, w, "s", "end"); txt(g, 146 + 300 * s / max, 41 + i * 34, `${num(s, 2)} (빈도 ${tf}, 문서 ${df}/5)`, "s"); });
      const top = rows.slice().sort((a, b) => b[3] - a[3])[0][0];
      read.textContent = (m ? "TF-IDF" : "단순 빈도") + `로 본 가장 중요한 낱말: "${top}"`;
    }, (k, v) => v ? "TF-IDF" : "단순 빈도");
  });

  // 2-3 코사인 유사도: 문서 A = (3, 1), 문서 B = (k·a, k·b)
  Q.def("ai-cosine", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ bx, by }) => {
      clear(g);
      const F = Q.frame(0, 12, 0, 8, 60, 400, 15, 215); Q.axes(g, F, { step: 2, label: false });
      txt(g, 400, 200, "'축구' 횟수", "s", "end"); txt(g, 66, 26, "'요리' 횟수", "s");
      const A = [3, 1], B = [bx, by];
      Q.arrow(g, F.x(0), F.y(0), F.x(A[0]), F.y(A[1]), "b", "fb"); Q.arrow(g, F.x(0), F.y(0), F.x(B[0]), F.y(B[1]), "c", "fc");
      const cos = (A[0] * B[0] + A[1] * B[1]) / (Math.hypot(...A) * Math.hypot(...B)), dist = Math.hypot(A[0] - B[0], A[1] - B[1]);
      txt(g, 420, 80, `cos ${num(cos, 3)}`, "s tc"); txt(g, 420, 110, `거리 ${num(dist, 2)}`, "s");
      read.textContent = `문서 A (3, 1), 문서 B (${bx}, ${by}): 코사인 유사도 ${num(cos, 3)}, 유클리드 거리 ${num(dist, 2)}`;
    });
  });

  // 3-1 픽셀 행렬: 8×8 밝기, 기준값으로 흑백
  const IMG = [[0, 0, 40, 90, 90, 40, 0, 0], [0, 60, 180, 230, 230, 180, 60, 0], [30, 180, 250, 120, 120, 250, 180, 30], [60, 230, 120, 0, 0, 120, 230, 60], [60, 230, 120, 0, 0, 120, 230, 60], [30, 180, 250, 120, 120, 250, 180, 30], [0, 60, 180, 230, 230, 180, 60, 0], [0, 0, 40, 90, 90, 40, 0, 0]];
  Q.def("ai-pixels", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      let on = 0;
      IMG.forEach((row, i) => row.forEach((v, j) => {
        const b = t > 0 ? (v >= t ? 255 : 0) : v; if (t > 0 && v >= t) on++;
        el("rect", { x: 30 + j * 24, y: 15 + i * 24, width: 23, height: 23, fill: `rgb(${b},${b},${b})`, class: "" }, g);
        txt(g, 250 + j * 30, 30 + i * 24, `${t > 0 ? (v >= t ? 1 : 0) : v}`, "s", "end");
      }));
      read.textContent = t > 0 ? `기준 ${t} 이상을 1(흰색), 미만을 0(검은색)으로: 흰 칸 ${on}개` : "0(검정)에서 255(흰색) 사이의 밝기 값을 그대로 보인 8 × 8 행렬";
    }, (k, v) => v ? `${v}` : "흑백 변환 안 함");
  });

  // 3-2 밝기와 대비: 새 값 = c(v − 128) + 128 + d, 0~255로 자름, 반전
  Q.def("ai-imgops", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d, c, inv }) => {
      clear(g);
      const f = (v) => { let x = c * (v - 128) + 128 + d; if (inv) x = 255 - x; return Math.max(0, Math.min(255, Math.round(x))); };
      IMG.forEach((row, i) => row.forEach((v, j) => {
        el("rect", { x: 30 + j * 24, y: 15 + i * 24, width: 23, height: 23, fill: `rgb(${v},${v},${v})` }, g);
        const w = f(v); el("rect", { x: 280 + j * 24, y: 15 + i * 24, width: 23, height: 23, fill: `rgb(${w},${w},${w})` }, g);
      }));
      txt(g, 125, 222, "원본", "s", "middle"); txt(g, 375, 222, "변환", "s", "middle");
      read.textContent = `새 값 = ${num(c, 1)} × (원래 값 − 128) + 128 + ${d}` + (inv ? ", 반전 255 − 값" : "") + `: 원래 230 → ${f(230)}, 원래 40 → ${f(40)}`;
    }, (k, v) => k === "inv" ? (v ? "반전" : "그대로") : num(v, 1));
  });

  // 3-3 k-최근접 이웃
  const R3 = rng(29), PTS = [];
  for (let i = 0; i < 14; i++) PTS.push([2.5 + 1.1 * gauss(R3), 3 + 1.1 * gauss(R3), 0]);
  for (let i = 0; i < 14; i++) PTS.push([6.5 + 1.1 * gauss(R3), 5.5 + 1.1 * gauss(R3), 1]);
  Q.def("ai-knn", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x, k }) => {
      clear(g);
      const F = Q.frame(0, 10, 0, 9, 60, 380, 15, 215); Q.axes(g, F, { step: 1, label: false });
      const q = [x, 4.3], D = PTS.map((p) => [Math.hypot(p[0] - q[0], p[1] - q[1]), p]).sort((a, b) => a[0] - b[0]), nb = D.slice(0, k);
      const R = nb[nb.length - 1][0];
      el("circle", { cx: F.x(q[0]), cy: F.y(q[1]), r: F.x(R) - F.x(0), class: "gd" }, g);
      PTS.forEach((p) => Q.dot(g, F.x(p[0]), F.y(p[1]), p[2] ? "fc" : "fb", 4));
      nb.forEach(([, p]) => Q.line(g, F.x(q[0]), F.y(q[1]), F.x(p[0]), F.y(p[1]), "gd"));
      const v1 = nb.filter(([, p]) => p[2]).length, v0 = k - v1, lab = v1 > v0 ? "주황 무리" : v0 > v1 ? "파랑 무리" : "동점";
      Q.dot(g, F.x(q[0]), F.y(q[1]), "fd", 6);
      txt(g, 400, 80, `파랑 ${v0}표`, "s tb"); txt(g, 400, 105, `주황 ${v1}표`, "s tc"); txt(g, 400, 140, `판정 ${lab}`, "s td");
      read.textContent = `새 점 (${num(x, 1)}, 4.3), 이웃 ${k}개: 파랑 ${v0}, 주황 ${v1} → ${lab}`;
    });
  });

  // 4-1 기저율: 유병률 p, 민감도·특이도 99%
  Q.def("ai-bayes", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const N = 10000, sick = N * p / 100, tp = sick * 0.99, fp = (N - sick) * 0.01, ppv = tp / (tp + fp);
      el("rect", { x: 40, y: 30, width: 440, height: 40, class: "gd" }, g);
      el("rect", { x: 40, y: 30, width: 440 * sick / N, height: 40, class: "ld" }, g);
      txt(g, 40, 22, `1만 명 중 실제 환자 ${num(sick, 0)}명`, "s");
      const tot = tp + fp, w1 = 440 * tp / tot;
      el("rect", { x: 40, y: 120, width: w1, height: 40, class: "ld" }, g); el("rect", { x: 40 + w1, y: 120, width: 440 - w1, height: 40, class: "lb" }, g);
      txt(g, 40, 112, `양성 판정 ${num(tot, 0)}명 = 진짜 환자 ${num(tp, 0)}명 + 잘못된 양성 ${num(fp, 0)}명`, "s");
      read.textContent = `유병률 ${p}%, 정확도 99%: 양성 판정을 받은 사람이 실제 환자일 확률 ${num(ppv * 100, 1)}%`;
    });
  });

  // 4-2 추세선: y = a x + b, 점 6개, 오차 제곱합
  const XY = [[1, 2.1], [2, 2.9], [3, 4.2], [4, 4.8], [5, 6.1], [6, 6.9]];
  Q.def("ai-trend", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const F = frame(g, 0, 7, 0, 9, 1); ticks(g, F, [0, 2, 4, 6], [0, 3, 6, 9]);
      const mx = 3.5, my = XY.reduce((s, [, y]) => s + y, 0) / 6, b = my - a * mx;
      Q.plot(g, F, (x) => a * x + b, "b", 0, 7);
      let sse = 0; XY.forEach(([x, y]) => { const e = y - (a * x + b); sse += e * e; Q.line(g, F.x(x), F.y(y), F.x(x), F.y(a * x + b), "d"); Q.dot(g, F.x(x), F.y(y), "fk", 4); });
      read.textContent = `기울기 ${num(a, 2)} (점들의 중심을 지남): 오차 제곱합 ${num(sse, 3)}` + (Math.abs(a - 0.98) < 0.015 ? " (최소에 가깝다)" : "");
    });
  });

  // 4-3 손실함수: 자료 4개와 이상치 하나, 상수 예측 c의 제곱 손실과 절댓값 손실
  Q.def("ai-loss", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ o }) => {
      clear(g);
      const D = [3, 4, 5, 6, o], F = frame(g, 0, 20, 0, 1, [2, 0.25]); ticks(g, F, [0, 5, 10, 15, 20], []);
      const L2 = (c) => D.reduce((s, x) => s + (x - c) ** 2, 0), L1 = (c) => D.reduce((s, x) => s + Math.abs(x - c), 0);
      const m2 = L2(0) * 1.05, m1 = L1(0) * 1.05;
      Q.plot(g, F, (c) => L2(c) / Math.max(m2, L2(20)), "c", 0, 20, 300); Q.plot(g, F, (c) => L1(c) / Math.max(m1, L1(20)), "b", 0, 20, 300);
      const mean = D.reduce((s, x) => s + x, 0) / 5, med = D.slice().sort((x, y) => x - y)[2];
      Q.line(g, F.x(mean), 15, F.x(mean), 205, "c"); Q.line(g, F.x(med), 15, F.x(med), 205, "b");
      D.forEach((x) => Q.dot(g, F.x(x), F.y(0.02), "fd", 4));
      txt(g, 66, 26, "주황 제곱 손실 → 최소점 = 평균, 파랑 절댓값 손실 → 최소점 = 중앙값", "s");
      read.textContent = `자료 3, 4, 5, 6, ${o}: 제곱 손실 최소 ${num(mean, 2)} (평균), 절댓값 손실 최소 ${med} (중앙값)`;
    });
  });

  // 4-4 경사하강법: L(w) = (w − 3)² + 1, 시작 w = −2, 학습률 η
  Q.def("ai-gd", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ eta, n }) => {
      clear(g);
      const F = frame(g, -4, 10, 0, 40, [1, 5]); ticks(g, F, [-4, 0, 3, 6, 10], [0, 20, 40]);
      const L = (w) => (w - 3) ** 2 + 1;
      Q.plot(g, F, L, "b", -4, 10, 200);
      let w = -2, d = `M${F.x(w)} ${F.y(L(w))}`;
      for (let i = 0; i < n; i++) { const nw = w - eta * 2 * (w - 3); d += ` L${F.x(Math.max(-4, Math.min(10, nw)))} ${F.y(Math.min(40, L(nw)))}`; Q.dot(g, F.x(Math.max(-4, Math.min(10, w))), F.y(Math.min(40, L(w))), "fc", 3.5); w = nw; if (Math.abs(w) > 1e6) break; }
      el("path", { d, class: "c" }, g); Q.dot(g, F.x(Math.max(-4, Math.min(10, w))), F.y(Math.min(40, L(w))), "fd", 5);
      read.textContent = `학습률 ${num(eta, 2)}, ${n}걸음: w = ${Math.abs(w) < 1e6 ? num(w, 3) : "발산"}` + (Math.abs(w - 3) < 0.01 ? " (최소점 3에 도착)" : eta > 1 ? " (너무 커서 발산)" : "");
    });
  });

  // 5-1 인공 뉴런: z = w x + b, 출력 σ(z)
  Q.def("ai-neuron", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w, x }) => {
      clear(g);
      const b = -4, F = frame(g, -10, 10, 0, 1, [2, 0.25]); ticks(g, F, [-10, -5, 0, 5, 10], [0, 0.5, 1]);
      const s = (z) => 1 / (1 + Math.exp(-z));
      Q.plot(g, F, s, "b", -10, 10, 200);
      const z = w * x + b;
      Q.dot(g, F.x(Math.max(-10, Math.min(10, z))), F.y(s(z)), "fd", 6);
      txt(g, 490, 200, "z = wx + b", "s", "end");
      read.textContent = `입력 x = ${num(x, 1)}, 가중치 w = ${num(w, 1)}, 편향 b = −4: z = ${num(z, 2)} → 출력 σ(z) = ${num(s(z), 3)}`;
    });
  });

  // 5-2 공정성: 두 집단의 점수 분포, 같은 기준 점수
  Q.def("ai-fair", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const F = frame(g, 20, 100, 0, 0.06, [10, 0.01]); ticks(g, F, [20, 40, 60, 80, 100], []);
      const pdf = (x, m, s) => Math.exp(-(((x - m) / s) ** 2) / 2) / (s * Math.sqrt(2 * Math.PI));
      const erf = (u) => { const s = Math.sign(u), a = Math.abs(u), k = 1 / (1 + 0.3275911 * a); return s * (1 - (((((1.061405429 * k - 1.453152027) * k) + 1.421413741) * k - 0.284496736) * k + 0.254829592) * k * Math.exp(-a * a)); };
      const cdf = (x, m, s) => 0.5 * (1 - erf((x - m) / (s * Math.SQRT2)));
      Q.plot(g, F, (x) => pdf(x, 60, 10), "b", 20, 100); Q.plot(g, F, (x) => pdf(x, 52, 10), "c", 20, 100);
      Q.line(g, F.x(t), 15, F.x(t), 205, "d");
      const pa = cdf(t, 60, 10), pb = cdf(t, 52, 10);
      txt(g, 66, 26, "파랑 집단 A (평균 60), 주황 집단 B (평균 52)", "s");
      read.textContent = `기준 ${t}점: 통과율 A ${num(pa * 100, 1)}%, B ${num(pb * 100, 1)}% (차이 ${num((pa - pb) * 100, 1)}%p)`;
    });
  });
})();
