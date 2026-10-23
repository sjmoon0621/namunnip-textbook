/* 정보과학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st) => { const F = Q.frame(x0, x1, y0, y1, 60, 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const axl = (g, a, b) => { txt(g, 490, 200, a, "s", "end"); txt(g, 66, 26, b, "s"); };
  const big = (x) => (x >= 1e12 ? x.toExponential(1) : x >= 1e8 ? num(x / 1e8, 1) + "억" : x >= 1e4 ? num(x / 1e4, 1) + "만" : num(x, 0));
  const tfmt = (s) => (s < 1e-3 ? num(s * 1e6, 1) + " μs" : s < 1 ? num(s * 1000, 1) + " ms" : s < 60 ? num(s, 1) + "초" : s < 3600 ? num(s / 60, 1) + "분" : s < 86400 ? num(s / 3600, 1) + "시간" : s < 3.15e7 ? num(s / 86400, 0) + "일" : s < 3.15e11 ? num(s / 3.15e7, 0) + "년" : (s / 3.15e7).toExponential(1) + "년");
  const lg = (x) => Math.log10(Math.max(1, x));

  // 1-1 호출 스택: 중첩 호출의 깊이 d
  Q.def("info-stack", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const NM = ["main()", "평균(점수)", "합계(점수)", "더하기(a, b)", "검사(x)", "기록(값)"];
    Q.bind(fig, ({ d }) => {
      clear(g);
      for (let i = 0; i <= d; i++) { const y = 190 - i * 30; el("rect", { x: 160, y, width: 200, height: 26, class: i === d ? "lc" : "lb" }, g); txt(g, 260, y + 17, NM[i], "s", "middle"); }
      txt(g, 380, 205, "스택의 바닥", "s"); txt(g, 380, 190 - d * 30 + 17, "지금 실행 중", "s");
      read.textContent = `호출 깊이 ${d}: 스택에 프레임 ${d + 1}개가 쌓여 있다. 프레임마다 매개변수, 지역 변수, 돌아갈 위치가 들어 있고, 함수가 끝나면 맨 위 프레임부터 사라진다`;
    });
  });

  // 1-2 하노이의 탑: 원판 수 n
  Q.def("info-hanoi", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const F = frame(g, 1, 30, 0, 10, [5, 2]); ticks(g, F, [1, 5, 10, 15, 20, 25, 30], [0, 2, 4, 6, 8, 10]); axl(g, "원판의 수", "log 옮기는 횟수");
      Q.plot(g, F, (x) => Math.log10(2 ** x - 1 || 1), "b", 1, 30, 100);
      const m = 2 ** n - 1;
      Q.dot(g, F.x(n), F.y(lg(m)), "fd", 5);
      read.textContent = `원판 ${n}개: 옮기는 횟수 T(n) = 2T(n−1) + 1 = 2^${n} − 1 = ${big(m)}번. 1초에 한 번 옮기면 ${tfmt(m)}`;
    });
  });

  // 1-3 피보나치: 재귀 호출 수와 반복 횟수
  Q.def("info-fib", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const F_ = [0, 1]; for (let i = 2; i <= 90; i++) F_.push(F_[i - 1] + F_[i - 2]);
    Q.bind(fig, ({ n }) => {
      clear(g);
      const calls = 2 * F_[n + 1] - 1;
      bar(g, 50, lg(calls) * 30, "lc", "재귀 호출 수", `${big(calls)}번 (${tfmt(calls / 1e8)})`, 140);
      bar(g, 95, lg(n) * 30, "lb", "반복문 횟수", `${n}번`, 140);
      read.textContent = `fib(${n}) = ${big(F_[n])}: 정의를 그대로 옮긴 재귀는 같은 값을 거듭 계산해 ${big(calls)}번 호출한다(1초에 1억 번이면 ${tfmt(calls / 1e8)}). 반복문은 ${n}번이면 끝난다. 막대는 로그 길이`;
    });
  });

  // 2-1 큐 구현: 원소 n개를 넣고 앞에서 모두 꺼낼 때의 원소 이동 횟수
  Q.def("info-queue", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ln }) => {
      clear(g);
      const n = Math.round(10 ** ln), a = n * (n - 1) / 2, b = n;
      bar(g, 50, lg(a) * 28, "lc", "리스트 pop(0)", `${big(a)}번 이동`, 140);
      bar(g, 95, lg(b) * 28, "lb", "원형 큐 (앞 위치만 옮김)", `${big(b)}번`, 140);
      read.textContent = `원소 ${big(n)}개: 리스트 맨 앞을 지울 때마다 나머지를 한 칸씩 당겨 n(n−1)/2 = ${big(a)}번, 앞 위치를 가리키는 변수만 옮기면 ${big(b)}번. 막대는 로그 길이`;
    }, (k, v) => big(Math.round(10 ** v)));
  });

  // 2-2 인쇄 대기열: 이용률 ρ = 도착률 ÷ 처리율
  Q.def("info-mm1", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const L = (x) => x / (1 - x);
      const F = frame(g, 0, 1, 0, 20, [0.1, 5]); ticks(g, F, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 5, 10, 15, 20]); axl(g, "이용률 ρ", "큐에 있는 평균 문서 수");
      Q.plot(g, F, (x) => Math.min(20, L(x)), "b", 0, 0.98, 200);
      Q.dot(g, F.x(r), F.y(Math.min(20, L(r))), "fd", 5);
      read.textContent = `문서가 처리 능력의 ${num(r * 100, 0)}% 빠르기로 들어오면 평균 ${num(L(r), 1)}개가 쌓이고, 문서 하나가 평균 ${num(1 / (1 - r), 1)}개 처리 시간만큼 기다린다(M/M/1 모형). 이용률이 1에 가까워지면 줄이 폭발한다`;
    });
  });

  // 2-3 그래프의 저장: 정점 수 V, 정점마다 평균 이웃 수 k
  Q.def("info-adj", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lv, k }) => {
      clear(g);
      const V = Math.round(10 ** lv), mat = V * V, lst = V + V * k;
      bar(g, 50, lg(mat) * 25, "lc", "인접 행렬 (V × V 칸)", `${big(mat)}칸`, 160);
      bar(g, 95, lg(lst) * 25, "lb", "인접 리스트 (V + 이웃 목록)", `${big(lst)}칸`, 160);
      read.textContent = `정점 ${big(V)}개, 정점마다 이웃 ${k}개: 행렬은 ${big(mat)}칸, 리스트는 약 ${big(lst)}칸 (${num(mat / lst, 0)}배 차이). 이웃이 적은 지도는 리스트가, 두 정점이 이웃인지 자주 묻는다면 행렬이 낫다`;
    }, (key, v) => (key === "lv" ? big(Math.round(10 ** v)) : `${v}`));
  });

  // 2-4 이진 탐색 트리의 높이: 원소 수 n
  Q.def("info-bst", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ln }) => {
      clear(g);
      const n = Math.round(10 ** ln), hb = Math.ceil(Math.log2(n + 1)), hs = n;
      bar(g, 50, lg(hb) * 40 + 3, "lb", "균형 잡힌 트리", `높이 ${hb} (비교 ${hb}번)`, 140);
      bar(g, 95, lg(hs) * 40 + 3, "lc", "한쪽으로 치우친 트리", `높이 ${big(hs)}`, 140);
      read.textContent = `단어 ${big(n)}개: 균형 잡힌 이진 탐색 트리는 ⌈log₂(n+1)⌉ = ${hb}번 비교로 찾고, 정렬된 순서로 넣어 한쪽으로 치우친 트리는 최악 ${big(hs)}번 비교한다. 막대는 로그 길이`;
    }, (k, v) => big(Math.round(10 ** v)));
  });

  // 3-1 상태 공간의 크기: n개의 결정
  Q.def("info-space", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const fact = (n) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
    Q.bind(fig, ({ n }) => {
      clear(g);
      const s = 2 ** n, p = fact(n);
      const F = frame(g, 1, 25, 0, 26, [2, 4]); ticks(g, F, [1, 5, 10, 15, 20, 25], [0, 6, 12, 18, 24]); axl(g, "결정할 대상의 수 n", "log 경우의 수");
      Q.plot(g, F, (x) => x * Math.LN2 / Math.LN10, "b", 1, 25, 50);
      Q.plot(g, F, (x) => { let s = 0; for (let i = 2; i <= Math.round(x); i++) s += Math.log10(i); return s; }, "c", 1, 25, 25);
      Q.line(g, F.x(1), F.y(9), F.x(25), F.y(9), "gd");
      read.textContent = `n = ${n}: 부분집합(고르기) 2^n = ${big(s)}가지(${tfmt(s / 1e9)}), 순서 정하기 n! = ${big(p)}가지(${tfmt(p / 1e9)}). 1초에 10억 가지(회색 선)를 검사한다고 본 시간`;
    });
  });

  // 3-2 N-퀸 문제: 가지치기 백트래킹이 방문한 상태 수
  const qcache = {};
  const queens = (n) => { if (qcache[n]) return qcache[n]; let nodes = 0, sol = 0; const all = (1 << n) - 1; const go = (cols, d1, d2) => { nodes++; if (cols === all) { sol++; return; } let free = all & ~(cols | d1 | d2); while (free) { const b = free & -free; free -= b; go(cols | b, ((d1 | b) << 1) & all, (d2 | b) >> 1); } }; go(0, 0, 0); return (qcache[n] = [nodes, sol]); };
  Q.def("info-queens", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const [nodes, sol] = queens(n), brute = n ** n;
      bar(g, 50, lg(brute) * 30, "lc", "행마다 아무 칸 (n^n)", `${big(brute)}가지`, 160);
      bar(g, 95, lg(nodes) * 30, "lb", "가지치기 백트래킹", `${big(nodes)}개 상태`, 160);
      read.textContent = `${n}-퀸: 해 ${sol}개. 퀸을 행마다 하나씩 놓되, 이미 공격받는 칸에서 바로 되돌아오면 ${big(nodes)}개 상태만 방문한다. 완전 탐색 ${big(brute)}가지의 ${num(brute / nodes, 0)}분의 1. 막대는 로그 길이`;
    });
  });

  // 3-3 격자 경로의 문제 분해: 가로 m칸, 세로 k칸
  Q.def("info-grid", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m, k }) => {
      clear(g);
      const T = []; for (let i = 0; i <= k; i++) { T.push([]); for (let j = 0; j <= m; j++) T[i].push(i === 0 || j === 0 ? 1 : T[i - 1][j] + T[i][j - 1]); }
      const c = Math.min(42, 360 / (m + 1), 170 / (k + 1));
      for (let i = 0; i <= k; i++) for (let j = 0; j <= m; j++) { const x = 70 + j * c, y = 20 + i * c; el("rect", { x, y, width: c - 2, height: c - 2, class: i === k && j === m ? "lc" : "lk" }, g); if (c > 22) txt(g, x + c / 2 - 1, y + c / 2 + 4, `${T[i][j]}`, "s", "middle"); }
      read.textContent = `${m} × ${k} 격자에서 오른쪽과 아래로만 가는 길: 각 칸의 수 = 위 칸 + 왼쪽 칸이므로 끝 칸은 ${big(T[k][m])}가지. 큰 문제를 '바로 앞 두 칸의 답'으로 나누어 표를 채운다`;
    });
  });

  // 3-4 정렬의 비교 횟수: 원소 수 n
  Q.def("info-sort", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ln }) => {
      clear(g);
      const n = Math.round(10 ** ln), sel = n * (n - 1) / 2, mer = n * Math.ceil(Math.log2(n));
      bar(g, 50, lg(sel) * 25, "lc", "선택 정렬 n(n−1)/2", `${big(sel)}번 (${tfmt(sel / 1e8)})`, 160);
      bar(g, 95, lg(mer) * 25, "lb", "병합 정렬 약 n log₂n", `${big(mer)}번 (${tfmt(mer / 1e8)})`, 160);
      read.textContent = `원소 ${big(n)}개: 반으로 나누기를 ${Math.ceil(Math.log2(n))}번 하면 하나씩 쪼개지고, 단계마다 합치는 비교가 n번 정도라 약 ${big(mer)}번. 선택 정렬보다 ${num(sel / mer, 0)}배 적다(1초에 1억 번 기준)`;
    }, (k, v) => big(Math.round(10 ** v)));
  });

  // 3-5 거스름돈: 동전 {1, 4, 5}로 금액 a를 만드는 최소 동전 수
  Q.def("info-coin", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const C = [1, 4, 5], dp = [0]; for (let a = 1; a <= 60; a++) dp.push(Math.min(...C.filter((c) => c <= a).map((c) => dp[a - c] + 1)));
    const greedy = (a) => { let n = 0; for (const c of [5, 4, 1]) { n += Math.floor(a / c); a %= c; } return n; };
    Q.bind(fig, ({ a }) => {
      clear(g);
      const F = frame(g, 0, 40, 0, 12, [5, 2]); ticks(g, F, [0, 10, 20, 30, 40], [0, 4, 8, 12]); axl(g, "금액", "동전 수");
      for (let x = 1; x <= 40; x++) { if (greedy(x) > dp[x]) Q.dot(g, F.x(x), F.y(greedy(x)), "fc", 3); Q.dot(g, F.x(x), F.y(dp[x]), "fb", 3); }
      Q.line(g, F.x(a), F.y(0), F.x(a), F.y(12), "gd");
      read.textContent = `금액 ${a}: 큰 동전부터 고르면 ${greedy(a)}개, 동적 계획법(dp[a] = 1 + min(dp[a−1], dp[a−4], dp[a−5]))은 ${dp[a]}개. 주황 점은 욕심쟁이 방법이 틀리는 금액`;
    });
  });

  // 3-6 빅오와 실행 시간: 입력 크기 n, 1초에 1억 번
  Q.def("info-bigo", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ln }) => {
      clear(g);
      const n = 10 ** ln, R = [["O(log n)", Math.log2(n)], ["O(n)", n], ["O(n log n)", n * Math.log2(n)], ["O(n²)", n * n], ["O(2ⁿ)", n <= 1000 ? 2 ** n : Infinity]];
      R.forEach(([nm, ops], i) => bar(g, 8 + i * 38, Math.min(300, (lg(ops / 1e8 * 1e6) + 1) * 20), i === 4 ? "lc" : "lb", nm, isFinite(ops) && ops < 1e300 ? tfmt(ops / 1e8) : "우주의 나이보다 김", 130));
      read.textContent = `n = ${big(n)}: 1초에 1억 번 연산할 때의 시간. n이 10배가 될 때 O(n)은 10배, O(n²)은 100배, O(2ⁿ)은 감당할 수 없게 늘어난다. 막대는 로그 길이`;
    }, (k, v) => big(10 ** v));
  });

  // 4-1 들를 곳의 순서 정하기: 들를 곳 k곳의 경로 수
  Q.def("info-tsp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      let f = 1; for (let i = 2; i <= k; i++) f *= i;
      const routes = f / 2;
      bar(g, 50, lg(routes) * 18 + 2, "lc", "모든 순서 (k!/2)", `${big(routes)}가지 (${tfmt(routes / 1e8)})`, 150);
      bar(g, 95, lg(k * k) * 18 + 2, "lb", "가장 가까운 곳부터 (어림)", `약 ${k * k}번 계산`, 150);
      read.textContent = `들를 곳 ${k}곳: 출발점으로 돌아오는 순서는 ${big(routes)}가지(1초에 1억 개 검사하면 ${tfmt(routes / 1e8)}). 문제의 크기를 먼저 어림해야 완전 탐색으로 풀지, 어림 방법을 쓸지 정할 수 있다`;
    });
  });

  // 4-2 팀 규모와 소통 경로: 팀원 수 n
  Q.def("info-team", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const cx = 140, cy = 110, R = 80, pts = [];
      for (let i = 0; i < n; i++) { const a = 2 * Math.PI * i / n - Math.PI / 2; pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) Q.line(g, pts[i][0], pts[i][1], pts[j][0], pts[j][1], "gd");
      pts.forEach(([x, y]) => Q.dot(g, x, y, "fb", 6));
      const c = n * (n - 1) / 2;
      bar(g, 90, c * 4, "lc", "소통 경로", `${c}개`, 320);
      read.textContent = `팀원 ${n}명이면 서로 맞춰야 할 경로가 n(n−1)/2 = ${c}개. 사람이 늘수록 경로가 제곱으로 늘어, 입력과 출력, 함수의 약속(인터페이스)을 미리 정해 두어야 나눈 코드가 맞물린다`;
    });
  });

  // 4-3 코드 검토: 검토자 수 k, 검토자 한 명이 버그를 찾을 확률 p
  Q.def("info-review", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k, p }) => {
      clear(g);
      const P = (x) => 1 - (1 - p / 100) ** x;
      const F = frame(g, 0, 10, 0, 1, [1, 0.25]); ticks(g, F, [0, 2, 4, 6, 8, 10], [0, 0.25, 0.5, 0.75, 1]); axl(g, "검토자 수", "버그를 누군가 찾을 확률");
      let d = ""; for (let x = 0; x <= 10; x++) d += (x ? "L" : "M") + F.x(x) + " " + F.y(P(x));
      el("path", { d, class: "b" }, g);
      Q.dot(g, F.x(k), F.y(P(k)), "fd", 5);
      read.textContent = `검토자 한 명이 ${p}% 확률로 찾는 버그를 ${k}명이 따로 보면 누군가 찾을 확률 1 − (1 − p)^k = ${num(P(k) * 100, 0)}%. 오픈소스에서 여러 사람의 검토가 품질을 높이는 까닭(서로 독립일 때)`;
    });
  });

  // 4-4 무작위 시험과 경계 시험: 잘못된 윤년 함수(4로만 나눔)
  Q.def("info-test", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const f = 0.0075, P = (x) => 1 - (1 - f) ** x;
      const F = frame(g, 0, 500, 0, 1, [50, 0.25]); ticks(g, F, [0, 100, 200, 300, 400, 500], [0, 0.25, 0.5, 0.75, 1]); axl(g, "무작위로 고른 연도의 수", "버그를 찾을 확률");
      Q.plot(g, F, P, "b", 0, 500, 200);
      Q.dot(g, F.x(n), F.y(P(n)), "fd", 5);
      read.textContent = `'4로 나누어떨어지면 윤년'인 함수는 1~10000년 가운데 75개(1900, 2100처럼 400의 배수가 아닌 100의 배수)에서만 틀린다. 무작위 연도 ${n}개로 찾을 확률 ${num(P(n) * 100, 0)}%, 경계값 1900 하나면 바로 찾는다`;
    });
  });

  // 4-5 평균에 가려진 집단: 소수 집단의 비율 s (%), 다수 집단 정확도 96%, 소수 집단 70%
  Q.def("info-groups", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ s }) => {
      clear(g);
      const a = 0.96 * (1 - s / 100) + 0.70 * s / 100;
      bar(g, 30, 96 * 2.5, "lb", "다수 집단", "96%");
      bar(g, 70, 70 * 2.5, "lc", "소수 집단", "70%");
      bar(g, 110, a * 250, "lk", "전체 평균", `${num(a * 100, 1)}%`);
      read.textContent = `사용자의 ${s}%를 차지하는 집단에서만 정확도가 70%이면, 전체 평균은 ${num(a * 100, 1)}%로 높아 보인다. 산출물은 평균뿐 아니라 집단별로 나누어 평가해야 누가 불편한지 드러난다`;
    });
  });
})();
