/* 확률과 통계 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  const C = (n, r) => (r < 0 || r > n ? 0 : fact(n) / (fact(r) * fact(n - r)));

  // 기댓값: 5000원 p, 1000원 0.3, 0원 나머지 — 막대 저울
  Q.def("stat-balance", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), X = (v) => 60 + v / 5000 * 400;
    Q.bind(fig, ({ p }) => {
      clear(g);
      const pr = [[0, 0.7 - p / 100], [1000, 0.3], [5000, p / 100]], m = pr.reduce((s, [v, q]) => s + v * q, 0);
      const ex2 = pr.reduce((s, [v, q]) => s + v * v * q, 0), sd = Math.sqrt(ex2 - m * m);
      Q.line(g, 40, 170, 480, 170, "k");
      pr.forEach(([v, q]) => { el("rect", { x: X(v) - 16, y: 170 - q * 200, width: 32, height: q * 200, class: "lb" }, g); txt(g, X(v), 190, `${v}원`, "s", "middle"); txt(g, X(v), 165 - q * 200, num(q, 2), "s", "middle"); });
      el("path", { d: `M${X(m)} 172 l-10 18 h20 Z`, class: "fd" }, g);
      Q.line(g, X(Math.max(0, m - sd)), 215, X(m + sd), 215, "c"); txt(g, X(m), 232, `평균 ${num(m, 0)}원 ± 표준편차 ${num(sd, 0)}원`, "s tc", "middle");
      read.textContent = `E(X) = ${num(m, 0)}원, σ(X) ≈ ${num(sd, 0)}원 (한 번에 1000원을 낸다)`;
    });
  });

  // 이항분포 막대 (확률변수·이항분포 절에서 쓴다)
  const binomBars = (g, n, p, opt) => {
    const W = 440, ox = 50, base = 220, probs = [];
    for (let k = 0; k <= n; k++) probs.push(C(n, k) * p ** k * (1 - p) ** (n - k));
    const M = Math.max(...probs), w = W / (n + 1), s = 190 / M;
    Q.line(g, ox - 10, base, ox + W + 10, base, "ax");
    probs.forEach((v, k) => {
      el("rect", { x: ox + k * w + w * 0.15, y: base - v * s, width: w * 0.7, height: v * s, class: opt && opt.hi && opt.hi(k) ? "lc" : "lb" }, g);
      if (n <= 20 || k % 5 === 0) txt(g, ox + k * w + w / 2, base + 14, String(k), "s", "middle");
    });
    return probs;
  };
  Q.def("stat-rv", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const probs = binomBars(g, n, 0.5);
      read.textContent = `X = 0, 1, …, ${n}의 확률: ` + probs.map((v, k) => `${C(n, k)}/${2 ** n}`).join(", ") + ` (합 1)`;
    });
  });

  Q.def("stat-binom", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n, p }) => {
      clear(g);
      binomBars(g, n, p, { hi: (k) => k === Math.round(n * p) });
      const w = 440 / (n + 1), mx = 50 + (n * p + 0.5) * w;
      el("path", { d: `M${mx} 222 l-7 12 h14 Z`, class: "fd" }, g);
      read.textContent = `B(${n}, ${num(p)}): 평균 np = ${num(n * p, 2)}, 표준편차 √(np(1−p)) = ${num(Math.sqrt(n * p * (1 - p)), 3)}`;
    });
  });

  // 신뢰구간: 모평균 100, σ = 10, 크기 n, 20개의 95% 구간 (고정 난수)
  Q.def("stat-ci", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), X = (v) => 260 + (v - 100) * 20;
    Q.bind(fig, ({ s, n }) => {
      clear(g);
      let r = s * 7919;
      const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
      const nrm = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
      const half = 1.96 * 10 / Math.sqrt(n);
      let hit = 0;
      for (let i = 0; i < 20; i++) {
        const xb = 100 + (10 / Math.sqrt(n)) * nrm(), ok = Math.abs(xb - 100) <= half, y = 22 + i * 12.5;
        if (ok) hit++;
        Q.line(g, X(xb - half), y, X(xb + half), y, ok ? "b" : "d");
        Q.dot(g, X(xb), y, ok ? "fb" : "fd", 3);
      }
      Q.line(g, X(100), 12, X(100), 270, "a dsh"); txt(g, X(100) + 4, 10, "모평균 100", "s ta");
      read.textContent = `n = ${n}: 구간 길이 ${num(2 * half, 2)}, 20개 가운데 모평균을 품은 구간 ${hit}개 (빨강은 빗나간 구간)`;
    });
  });

  // 표본평균의 분포: 모집단 N(100, 4²)에서 크기 n
  Q.def("stat-xbar", (fig, svg) => {
    const F = Q.frame(88, 112, 0, 1.7, 30, 500, 15, 230);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const pdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (Math.sqrt(2 * Math.PI) * s);
    Q.line(bg, F.X0, F.y(0), F.X1, F.y(0), "ax");
    for (let x = 88; x <= 112; x += 4) txt(bg, F.x(x), F.y(0) + 14, String(x), "s", "middle");
    Q.plot(bg, F, (x) => pdf(x, 100, 4), "gd");
    txt(bg, F.x(107), F.y(0.12), "모집단 (σ = 4)", "s");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const s = 4 / Math.sqrt(n);
      Q.plot(g, F, (x) => Math.min(1.7, pdf(x, 100, s)), "b", 88, 112, 400);
      Q.line(g, F.x(100 - 2 * s), F.y(0) + 24, F.x(100 + 2 * s), F.y(0) + 24, "d");
      read.textContent = `n = ${n}: 표본평균의 표준편차 4/√${n} = ${num(s, 3)} g, 95%가 대략 ${num(100 - 2 * s, 1)} ~ ${num(100 + 2 * s, 1)} g 안에 든다`;
    });
  });

  // 모집단과 표본: 통학 시간 모집단 200명(가상), 임의추출 vs 일찍 온 학생
  Q.def("stat-sample", (fig, svg) => {
    let s0 = 77;
    const rnd = () => { s0 = (s0 * 16807) % 2147483647; return s0 / 2147483647; };
    const pop = Array.from({ length: 200 }, () => Math.round(5 + 50 * Math.pow(rnd(), 1.3)));
    const mu = pop.reduce((a, b) => a + b) / pop.length;
    const sorted = pop.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
    const X = (v) => 40 + v / 60 * 440;
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    pop.forEach((v, i) => Q.dot(bg, X(v), 30 + (i % 10) * 9, "fk", 2));
    Q.line(bg, X(mu), 20, X(mu), 210, "a dsh"); txt(bg, X(mu) + 4, 18, `모평균 ${num(mu, 1)}분`, "s ta");
    Q.line(bg, 40, 200, 480, 200, "ax"); [0, 10, 20, 30, 40, 50, 60].forEach((v) => txt(bg, X(v), 216, String(v), "s", "middle"));
    Q.bind(fig, ({ m, s }) => {
      clear(g);
      let r = s * 9973 % 2147483647, idx = [];
      const rr = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
      if (m === 0) { const used = new Set(); while (idx.length < 20) { const k = Math.floor(rr() * 200); if (!used.has(k)) { used.add(k); idx.push(k); } } }
      else { const near = sorted.slice(0, 60); const used = new Set(); while (idx.length < 20) { const k = Math.floor(rr() * 60); if (!used.has(k)) { used.add(k); idx.push(near[k][1]); } } }
      idx.forEach((i) => Q.dot(g, X(pop[i]), 30 + (i % 10) * 9, m ? "fd" : "fb", 4));
      const mean = idx.reduce((a, i) => a + pop[i], 0) / 20;
      Q.line(g, X(mean), 20, X(mean), 200, m ? "d" : "b");
      read.textContent = `${m ? "치우친 추출(통학 시간이 짧은 학생 위주)" : "임의추출"} 표본평균 ${num(mean, 1)}분, 모평균 ${num(mu, 1)}분`;
    }, (k, v) => k === "m" ? (v ? "치우침" : "임의") : String(v));
  });

  // 정규분포: N(m, σ²), 구간 m ± kσ의 넓이
  const phi = (z) => { // 표준정규분포의 누적확률 (Abramowitz–Stegun 근사)
    const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  };
  Q.def("stat-normal", (fig, svg) => {
    const F = Q.frame(-6, 6, 0, 0.85, 20, 500, 15, 230);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m, s, k }) => {
      clear(g);
      const f = (x) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (Math.sqrt(2 * Math.PI) * s);
      let d = `M${F.x(m - k * s)} ${F.y(0)}`;
      for (let i = 0; i <= 80; i++) { const x = m - k * s + 2 * k * s * i / 80; d += `L${F.x(x)} ${F.y(f(x))}`; }
      el("path", { d: d + `L${F.x(m + k * s)} ${F.y(0)}Z`, class: "lc" }, g);
      Q.line(g, F.X0, F.y(0), F.X1, F.y(0), "ax");
      for (let x = -6; x <= 6; x += 2) txt(g, F.x(x), F.y(0) + 14, String(x), "s", "middle");
      Q.plot(g, F, f, "b", -6, 6, 300);
      Q.line(g, F.x(m), F.y(0), F.x(m), F.y(f(m)), "d dsh");
      const P = phi(k) - phi(-k);
      read.textContent = `N(${num(m)}, ${num(s)}²): P(m − ${num(k)}σ ≤ X ≤ m + ${num(k)}σ) ≈ ${P.toFixed(3)} (m, σ를 바꿔도 같다)`;
    });
  });

  // 곱셈정리: 빨강 3, 파랑 2, 두 번 꺼내기 (다시 넣기 r)
  Q.def("stat-tree", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const p1 = [[3, 5], [2, 5]], p2 = r ? [[[3, 5], [2, 5]], [[3, 5], [2, 5]]] : [[[2, 4], [2, 4]], [[3, 4], [1, 4]]];
      const lab = ["빨강", "파랑"], root = [40, 125], mids = [[200, 65], [200, 185]];
      const leaves = [[[380, 35], [380, 95]], [[380, 155], [380, 215]]];
      let pr2 = 0;
      mids.forEach((m, i) => {
        Q.line(g, ...root, ...m, i ? "b" : "d");
        txt(g, (root[0] + m[0]) / 2, (root[1] + m[1]) / 2 + (i ? 16 : -6), `${p1[i][0]}/${p1[i][1]}`, "s", "middle");
        txt(g, m[0] + 6, m[1] + 4, lab[i], "s");
        leaves[i].forEach((lf, j) => {
          Q.line(g, m[0] + 34, m[1], ...lf, j ? "b" : "d");
          const [a, b] = p2[i][j];
          txt(g, (m[0] + 34 + lf[0]) / 2, (m[1] + lf[1]) / 2 + (j ? 14 : -4), `${a}/${b}`, "s", "middle");
          const prob = (p1[i][0] / p1[i][1]) * (a / b);
          if (j === 0) pr2 += prob;
          txt(g, lf[0] + 6, lf[1] + 4, `${lab[i]}→${lab[j]}  ${num(prob, 3)}`, "s");
        });
      });
      Q.dot(g, ...root, "fk", 4);
      read.textContent = (r ? "다시 넣으면(독립)" : "다시 넣지 않으면(종속)") + `: 두 번 모두 빨강 ${num((3 / 5) * (p2[0][0][0] / p2[0][0][1]), 3)}, 둘째가 빨강 ${num(pr2, 3)}`;
    }, (k, v) => (v ? "넣는다" : "넣지 않는다"));
  });

  // 독립: 단위 정사각형, A = 위쪽 띠(높이 0.5), B = [x, x + 0.4] × [y, 1]
  Q.def("stat-indep", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), S = 220, ox = 40, oy = 20;
    Q.bind(fig, ({ x, y }) => {
      clear(g);
      const X = (u) => ox + u * S, Y = (v) => oy + (1 - v) * S;
      el("rect", { x: ox, y: oy, width: S, height: S, class: "k" }, g);
      el("rect", { x: ox, y: Y(1), width: S, height: S * 0.5, class: "la" }, g);
      el("rect", { x: X(x), y: Y(1), width: S * 0.4, height: S * (1 - y), class: "lb" }, g);
      const pA = 0.5, pB = 0.4 * (1 - y), pAB2 = 0.4 * (1 - Math.max(0.5, y));
      txt(g, X(0.02), Y(0.9), "A", "i ta"); txt(g, X(x) + 6, Y(y) - 8, "B", "i tb");
      const ind = Math.abs(pAB2 - pA * pB) < 1e-9;
      txt(g, 290, 70, `P(A) = ${num(pA, 2)}`, "s"); txt(g, 290, 95, `P(B) = ${num(pB, 3)}`, "s");
      txt(g, 290, 120, `P(A∩B) = ${num(pAB2, 3)}`, "s"); txt(g, 290, 145, `P(A)P(B) = ${num(pA * pB, 3)}`, "s");
      txt(g, 290, 180, ind ? "같다 → 독립" : "다르다 → 종속", ind ? "ta" : "td");
      read.textContent = `P(B | A) = ${num(pAB2 / pA, 3)}, P(B) = ${num(pB, 3)}` + (ind ? " (같으므로 독립)" : "");
    });
  });

  // 조건부확률: 200명, 버스 80명, 지각 20명, 버스 중 지각 a명
  Q.def("stat-cond", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), W = 440, H = 200, ox = 40, oy = 25;
    Q.bind(fig, ({ a }) => {
      clear(g);
      const a2 = Math.max(0, 20 - a), bw = W * 80 / 200;
      el("rect", { x: ox, y: oy, width: bw, height: H, class: "lb" }, g);
      el("rect", { x: ox + bw, y: oy, width: W - bw, height: H, class: "lk" }, g);
      const h1 = H * a / 80, h2 = H * a2 / 120;
      el("rect", { x: ox, y: oy + H - h1, width: bw, height: h1, class: "ld" }, g);
      el("rect", { x: ox + bw, y: oy + H - h2, width: W - bw, height: h2, class: "ld" }, g);
      el("rect", { x: ox, y: oy, width: W, height: H, class: "k" }, g); Q.line(g, ox + bw, oy, ox + bw, oy + H, "k");
      txt(g, ox + bw / 2, oy + 20, "버스 80명", "s", "middle"); txt(g, ox + bw + (W - bw) / 2, oy + 20, "버스 아님 120명", "s", "middle");
      txt(g, ox + bw / 2, oy + H - h1 / 2 + 4, `지각 ${a}`, "s", "middle"); txt(g, ox + bw + (W - bw) / 2, oy + H - h2 / 2 + 4, `지각 ${a2}`, "s", "middle");
      read.textContent = `P(지각) = 20/200 = 0.1, P(지각 | 버스) = ${a}/80 = ${num(a / 80, 3)}, P(버스 | 지각) = ${a}/20 = ${num(a / 20, 2)}`;
    });
  });

  // 생일 문제
  Q.def("stat-birthday", (fig, svg) => {
    const X = (n) => 50 + (n - 1) / 59 * 450, Y = (p) => 230 - p * 210;
    const allDiff = [1]; for (let n = 1; n <= 60; n++) allDiff[n] = allDiff[n - 1] * (365 - n + 1) / 365;
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, 50, 230, 500, 230, "ax"); Q.line(bg, 50, 230, 50, 15, "ax");
    [10, 20, 30, 40, 50, 60].forEach((n) => txt(bg, X(n), 246, String(n), "s", "middle"));
    [0.5, 1].forEach((p) => { txt(bg, 44, Y(p) + 4, String(p), "s", "end"); Q.line(bg, 50, Y(p), 500, Y(p), "gd dsh"); });
    let d1 = "", d2 = "";
    for (let n = 1; n <= 60; n++) { d1 += (n > 1 ? "L" : "M") + X(n) + " " + Y(allDiff[n]); d2 += (n > 1 ? "L" : "M") + X(n) + " " + Y(1 - allDiff[n]); }
    el("path", { d: d1, class: "b" }, bg); el("path", { d: d2, class: "d" }, bg);
    Q.bind(fig, ({ n }) => {
      clear(g);
      Q.line(g, X(n), 15, X(n), 230, "k dsh");
      Q.dot(g, X(n), Y(allDiff[n]), "fb", 5); Q.dot(g, X(n), Y(1 - allDiff[n]), "fd", 5);
      read.textContent = `${n}명: 모두 다를 확률 ${allDiff[n].toFixed(3)}, 같은 생일이 있을 확률 ${(1 - allDiff[n]).toFixed(3)}`;
    });
  });

  // 덧셈정리: 1~30에서 a의 배수, b의 배수
  Q.def("stat-addgrid", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, b }) => {
      clear(g);
      let nA = 0, nB = 0, nAB = 0;
      for (let k = 1; k <= 30; k++) {
        const x = 20 + ((k - 1) % 10) * 48, y = 20 + Math.floor((k - 1) / 10) * 60, A = k % a === 0, B = k % b === 0;
        if (A) nA++; if (B) nB++; if (A && B) nAB++;
        el("rect", { x, y, width: 44, height: 52, class: A && B ? "ld" : A ? "la" : B ? "lb" : "lk" }, g);
        txt(g, x + 22, y + 32, String(k), "", "middle");
      }
      read.textContent = `${a}의 배수 ${nA}개 + ${b}의 배수 ${nB}개 − 둘 다(빨강) ${nAB}개 = ${nA + nB - nAB}개 → 확률 ${nA + nB - nAB}/30`;
    });
  });

  // 통계적 확률: 두 주사위 합이 7인 상대도수 (고정 난수, 최대 10000번)
  Q.def("stat-freq", (fig, svg) => {
    let s = 2024;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const N = 10000, hit = new Uint32Array(N + 1);
    for (let i = 1; i <= N; i++) { const a = 1 + Math.floor(rnd() * 6), b = 1 + Math.floor(rnd() * 6); hit[i] = hit[i - 1] + (a + b === 7 ? 1 : 0); }
    const X = (n) => 50 + Math.log10(n) / 4 * 450, Y = (p) => 230 - p / 0.4 * 210;
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, 50, 230, 500, 230, "ax"); Q.line(bg, 50, 230, 50, 15, "ax");
    [1, 10, 100, 1000, 10000].forEach((n) => txt(bg, X(n), 246, String(n), "s", "middle"));
    [0.1, 0.2, 0.3, 0.4].forEach((p) => txt(bg, 44, Y(p) + 4, String(p), "s", "end"));
    Q.line(bg, 50, Y(1 / 6), 500, Y(1 / 6), "a dsh"); txt(bg, 498, Y(1 / 6) - 6, "1/6", "s ta", "end");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const M = Math.round(10 ** (n / 3));
      let d = "";
      for (let k = 1; k <= M; k = Math.max(k + 1, Math.floor(k * 1.03))) d += (d ? "L" : "M") + X(k) + " " + Y(Math.min(0.4, hit[k] / k));
      d += "L" + X(M) + " " + Y(Math.min(0.4, hit[M] / M));
      el("path", { d, class: "d" }, g);
      Q.dot(g, X(M), Y(Math.min(0.4, hit[M] / M)), "fd", 5);
      read.textContent = `${M}번 던져 합 7이 ${hit[M]}번: 상대도수 ${(hit[M] / M).toFixed(4)} (확률 1/6 ≈ 0.1667)`;
    }, (k, v) => String(Math.round(10 ** (v / 3))));
  });

  // 이항정리: 파스칼의 삼각형
  Q.def("stat-pascal", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      for (let r = 0; r <= 9; r++) for (let k = 0; k <= r; k++) {
        const x = 260 + (k - r / 2) * 48, y = 20 + r * 25, on = r === n;
        if (on) el("rect", { x: x - 22, y: y - 14, width: 44, height: 20, class: "lc" }, g);
        txt(g, x, y, String(C(r, k)), on ? "" : "s", "middle");
      }
      const terms = [];
      for (let k = 0; k <= n; k++) { const c = C(n, k), pa = n - k, pb = k; terms.push(`${c === 1 && n ? "" : c}${pa ? "a" + (pa > 1 ? pa : "") : ""}${pb ? "b" + (pb > 1 ? pb : "") : ""}` || "1"); }
      read.textContent = `(a + b)^${n} = ${terms.join(" + ")}, 계수의 합 2^${n} = ${2 ** n}`;
    });
  });

  // 중복조합: 별과 막대 (세 종류, 5개)
  Q.def("stat-bars", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), bIn = fig.querySelector('input[data-k="b"]');
    Q.bind(fig, ({ a, b }) => {
      if (a + b > 5) { b = 5 - a; bIn.value = b; fig.querySelector('output[data-k="b"]').textContent = b; }
      clear(g);
      const c = 5 - a - b, seq = "★".repeat(a) + "|" + "★".repeat(b) + "|" + "★".repeat(c);
      [...seq].forEach((ch, i) => {
        const x = 50 + i * 60;
        el("rect", { x, y: 60, width: 50, height: 60, class: ch === "|" ? "lc" : "lb" }, g);
        txt(g, x + 25, 98, ch, "", "middle");
      });
      txt(g, 50 + a * 30, 150, `크림 ${a}`, "s", "middle");
      txt(g, 50 + (a + 1) * 60 + b * 30, 150, `단팥 ${b}`, "s", "middle");
      txt(g, 50 + (a + b + 2) * 60 + c * 30, 150, `소보로 ${c}`, "s", "middle");
      read.textContent = `(${a}, ${b}, ${c}) ↔ ${seq}: 7자리 가운데 막대 2개의 자리를 고르는 ₇C₂ = 21가지 가운데 하나`;
    });
  });

  // 바둑판 길: → m개, ↑ n개, k번째 길(사전식)
  Q.def("stat-grid", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), kIn = fig.querySelector('input[data-k="k"]');
    Q.bind(fig, ({ m, n, k }) => {
      clear(g);
      const total = C(m + n, m);
      kIn.max = total - 1; if (k > total - 1) { k = total - 1; kIn.value = k; }
      fig.querySelector('output[data-k="k"]').textContent = `${k + 1}번째`;
      const u = Math.min(60, 440 / m, 200 / n), ox = 40, oy = 230;
      for (let i = 0; i <= m; i++) Q.line(g, ox + i * u, oy, ox + i * u, oy - n * u, "gd");
      for (let j = 0; j <= n; j++) Q.line(g, ox, oy - j * u, ox + m * u, oy - j * u, "gd");
      // k번째 길: 남은 →가 a개, ↑가 b개일 때 → 먼저 고르는 경우의 수로 나눈다
      let a = m, b = n, r = k, x = 0, y = 0, d = `M${ox} ${oy}`, seq = "";
      while (a + b) {
        const first = a ? C(a - 1 + b, b) : 0;
        if (a && r < first) { a--; x++; seq += "→"; } else { r -= first; b--; y++; seq += "↑"; }
        d += `L${ox + x * u} ${oy - y * u}`;
      }
      el("path", { d, class: "d" }, g);
      Q.dot(g, ox, oy, "fk", 5); Q.dot(g, ox + m * u, oy - n * u, "fk", 5);
      read.textContent = `${seq}  (전체 ${m + n}!/(${m}!·${n}!) = ${total}가지 가운데 ${k + 1}번째)`;
    });
  });
})();
