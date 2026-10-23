/* 경제 수학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const won = (v) => Math.round(v).toLocaleString("ko-KR");
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys, fx, fy) => { for (const x of xs) txt(g, F.x(x), 220, fx ? fx(x) : `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, fy ? fy(y) : `${y}`, "s", "end"); };
  const bars = (g, items, x0, y0, w, h, max) => items.forEach(([lab, v, cls], i) => { const bw = w * v / max; el("rect", { x: x0, y: y0 + i * (h + 10), width: Math.max(0, bw), height: h, class: cls }, g); txt(g, x0 - 6, y0 + i * (h + 10) + h - 4, lab, "s", "end"); });

  // 1-1 소비자 물가지수: 기준 시점 장바구니 (쌀 3만, 교통 6만, 통신 5만, 외식 6만 = 20만 원)
  Q.def("econ-cpi", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const B = [["쌀", 3], ["교통", 6], ["통신", 5], ["외식", 6]];
    Q.bind(fig, ({ r, e }) => {
      clear(g);
      const now = B.map(([n, v], i) => [n, v * (i === 0 ? 1 + r / 100 : i === 3 ? 1 + e / 100 : 1)]);
      const base = 20, cur = now.reduce((s, [, v]) => s + v, 0), idx = cur / base * 100;
      B.forEach(([n, v], i) => { el("rect", { x: 120, y: 30 + i * 36, width: v * 25, height: 14, class: "gd" }, g); el("rect", { x: 120, y: 46 + i * 36, width: now[i][1] * 25, height: 14, class: i === 0 ? "lc" : i === 3 ? "ld" : "lb" }, g); txt(g, 112, 50 + i * 36, n, "s", "end"); });
      txt(g, 120, 190, "위 막대 기준 시점, 아래 막대 비교 시점 (만 원)", "s");
      txt(g, 380, 80, `물가지수 ${num(idx, 1)}`, "s tc"); txt(g, 380, 105, `상승률 ${num(idx - 100, 1)}%`, "s");
      read.textContent = `장바구니 값 20만 원 → ${num(cur, 2)}만 원, 물가지수 ${num(idx, 1)} (쌀 ${r}%, 외식 ${e}% 상승)`;
    });
  });

  // 1-2 환율: 1달러 = x 원
  Q.def("econ-fx", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const F = frame(g, 1000, 1600, 0, 1700000, [100, 250000]);
      ticks(g, F, [1000, 1200, 1400, 1600], [0, 500000, 1000000, 1500000], null, (y) => `${y / 10000}만`);
      Q.plot(g, F, (r) => 1000 * r, "b", 1000, 1600); Q.plot(g, F, (r) => 1200000 + 0 * r, "gd", 1000, 1600);
      Q.dot(g, F.x(x), F.y(1000 * x), "fd", 5);
      txt(g, 66, 30, "1000달러 수출 대금을 원으로 바꾼 금액", "s tb");
      read.textContent = `1달러 = ${x}원: 1000달러짜리 수출품 대금 ${won(1000 * x)}원, 100달러짜리 해외 직구 ${won(100 * x)}원` + (x > 1200 ? " (1200원일 때보다 수출 기업 유리, 수입 불리)" : x < 1200 ? " (1200원일 때보다 수입 유리, 수출 기업 불리)" : "");
    });
  });

  // 1-3 누진세 (단순화한 구간): 0~1400만 6%, ~5000만 15%, ~8800만 24%, ~1억 5천 35%
  const BR = [[1400, 0.06], [5000, 0.15], [8800, 0.24], [15000, 0.35], [Infinity, 0.38]];
  const taxOf = (m) => { let t = 0, lo = 0; for (const [hi, r] of BR) { if (m > lo) t += (Math.min(m, hi) - lo) * r; lo = hi; } return t; };
  Q.def("econ-tax", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const F = frame(g, 0, 15000, 0, 4000, [1000, 500]);
      ticks(g, F, [0, 5000, 10000, 15000], [0, 2000, 4000], (x) => `${x / 10000}억`.replace("0억", "0").replace("0.5억", "5천만"), (y) => `${y}만`);
      Q.plot(g, F, taxOf, "c", 0, 15000, 300);
      Q.dot(g, F.x(m), F.y(taxOf(m)), "fd", 5);
      const t = taxOf(m), mr = BR.find(([hi]) => m <= hi)[1];
      txt(g, 66, 30, "과세 표준에 따른 세액", "s tc");
      read.textContent = `과세 표준 ${won(m)}만 원: 세액 ${won(t)}만 원, 실효 세율 ${num(t / m * 100, 1)}%, 한계 세율 ${num(mr * 100, 0)}%`;
    });
  });

  // 1-4 단리와 복리: 원금 100, 연이율 r%, 30년
  Q.def("econ-compound", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r, n }) => {
      clear(g);
      const F = frame(g, 0, 30, 0, 600, [5, 100]);
      ticks(g, F, [0, 10, 20, 30], [0, 200, 400, 600]);
      Q.plot(g, F, (t) => 100 * (1 + r / 100 * t), "b", 0, 30); Q.plot(g, F, (t) => 100 * (1 + r / 100) ** t, "c", 0, 30);
      Q.line(g, F.x(n), 15, F.x(n), 205, "gd");
      const s = 100 * (1 + r / 100 * n), c = 100 * (1 + r / 100) ** n, dbl = Math.log(2) / Math.log(1 + r / 100);
      txt(g, 66, 30, "파랑 단리, 주황 복리 (원금 100)", "s");
      read.textContent = `연 ${r}%, ${n}년: 단리 ${num(s, 1)}, 복리 ${num(c, 1)} / 복리로 두 배가 되는 데 약 ${num(dbl, 1)}년 (72 ÷ ${r} ≈ ${num(72 / r, 1)})`;
    });
  });

  // 1-5 연금의 미래 가치: 해마다 말에 100만 원, 연 r%, n년
  Q.def("econ-annuity", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r, n }) => {
      clear(g);
      const i = r / 100, F = frame(g, 0, 31, 0, 7000, [5, 1000]);
      ticks(g, F, [0, 10, 20, 30], [0, 2000, 4000, 6000], null, (y) => `${y / 1000}천만`);
      let tot = 0;
      for (let k = 1; k <= n; k++) { const v = 100 * (1 + i) ** (n - k); tot += v; el("rect", { x: F.x(k) - 5, y: F.y(tot), width: 10, height: F.y(tot - v) - F.y(tot), class: k % 2 ? "lb" : "lc" }, g); }
      const fv = i ? 100 * ((1 + i) ** n - 1) / i : 100 * n;
      read.textContent = `해마다 100만 원씩 ${n}년, 연 ${r}%: 낸 돈 ${won(100 * n)}만 원, 모인 돈 ${won(fv)}만 원 (등비수열의 합)`;
    });
  });

  // 2-1 비용과 수입: 고정비 F, 개당 원가 v, 값 p
  Q.def("econ-breakeven", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const Fc = 200000, v = 1500, F = frame(g, 0, 400, 0, 1600000, [50, 250000]);
      ticks(g, F, [0, 100, 200, 300, 400], [0, 500000, 1000000, 1500000], null, (y) => `${y / 10000}만`);
      Q.plot(g, F, (q) => Fc + v * q, "d", 0, 400); Q.plot(g, F, (q) => p * q, "b", 0, 400);
      const be = p > v ? Fc / (p - v) : Infinity;
      if (be <= 400) Q.dot(g, F.x(be), F.y(p * be), "fk", 5);
      txt(g, 66, 30, "빨강 총비용, 파랑 총수입 (하루 판매량)", "s");
      read.textContent = `빵 값 ${won(p)}원 (원가 1500원, 고정비 20만 원): ` + (p > v ? `손익분기 판매량 ${num(be, 1)}개` : "값이 원가 이하라 아무리 팔아도 손해");
    });
  });

  // 2-2 수요곡선 Q = a − 2P 와 공급곡선 Q = 2P − 20
  Q.def("econ-demand", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, P }) => {
      clear(g);
      const F = frame(g, 0, 120, 0, 60, [10, 10]);
      ticks(g, F, [0, 40, 80, 120], [0, 20, 40, 60]);
      txt(g, 490, 200, "수량 Q", "s", "end"); txt(g, 66, 26, "가격 P", "s");
      Q.plot(g, F, (q) => (100 - q) / 2, "gd", 0, 100); Q.plot(g, F, (q) => (a - q) / 2, "b", 0, a);
      const q = Math.max(0, a - 2 * P);
      Q.line(g, F.x(0), F.y(P), F.x(q), F.y(P), "gd"); Q.dot(g, F.x(q), F.y(P), "fd", 5);
      read.textContent = `수요 Q = ${a} − 2P, 가격 ${P}: 수요량 ${q}` + (a !== 100 ? ` (점선은 원래 수요곡선 Q = 100 − 2P, 곡선 자체가 ${a > 100 ? "오른쪽" : "왼쪽"}으로 이동)` : "");
    });
  });

  // 2-3 효용 U = xy, 예산 1000x + 2000y = 10000 (만족이 같은 곡선과 예산선)
  Q.def("econ-utility", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const F = frame(g, 0, 11, 0, 6, 1);
      ticks(g, F, [0, 2, 4, 6, 8, 10], [0, 2, 4, 6]);
      txt(g, 490, 200, "떡볶이 x", "s", "end"); txt(g, 66, 26, "음료 y", "s");
      Q.plot(g, F, (t) => (10000 - 1000 * t) / 2000, "k", 0, 10);
      const y = (10000 - 1000 * x) / 2000, U = x * y;
      Q.plot(g, F, (t) => U / t, "c", Math.max(0.3, U / 6), 11);
      Q.plot(g, F, (t) => 12.5 / t, "gd", 12.5 / 6, 11);
      Q.dot(g, F.x(x), F.y(y), "fd", 5);
      read.textContent = `떡볶이 ${num(x, 1)}개, 음료 ${num(y, 2)}개: 효용 U = xy = ${num(U, 2)}` + (Math.abs(x - 5) < 0.01 ? " (최대, 점선 곡선에 접한다)" : " (최대 12.5는 x = 5일 때)");
    });
  });

  // 2-4 거미집 모형: 수요 P = 100 − Q, 공급 Q_t = s P_{t−1}
  Q.def("econ-cobweb", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ s }) => {
      clear(g);
      const F = frame(g, 0, 100, 0, 100, 10);
      ticks(g, F, [0, 50, 100], [0, 50, 100]);
      Q.plot(g, F, (q) => 100 - q, "b", 0, 100); Q.plot(g, F, (q) => q / s, "c", 0, 100);
      let P = 70, d = "", pts = [];
      for (let t = 0; t < 12; t++) { const Qs = Math.min(100, s * P); const Pn = 100 - Qs; d += (t ? "L" : "M") + F.x(Qs) + " " + F.y(P) + " L" + F.x(Qs) + " " + F.y(Math.max(0, Pn)); pts.push(Pn); P = Math.max(0, Pn); if (Pn <= 0) break; }
      el("path", { d, class: "d" }, g);
      const Pe = 100 / (1 + s);
      read.textContent = `공급 기울기 s = ${num(s, 2)}: 균형 가격 ${num(Pe, 1)}, 가격이 ` + (s < 1 ? "출렁이며 균형으로 수렴" : s === 1 ? "같은 폭으로 계속 출렁임" : "점점 크게 출렁이며 발산");
    });
  });

  // 2-5 세금의 귀착: 수요 P = 100 − Q, 공급 P = 20 + Q, 판매자에게 개당 t
  Q.def("econ-incidence", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t, k }) => {
      clear(g);
      const F = frame(g, 0, 80, 0, 100, [10, 10]);
      ticks(g, F, [0, 40, 80], [0, 50, 100]);
      Q.plot(g, F, (q) => 100 - q, "b", 0, 80); Q.plot(g, F, (q) => 20 + k * q, "c", 0, 80); Q.plot(g, F, (q) => 20 + t + k * q, "d", 0, 80);
      const q0 = 80 / (1 + k), q1 = (80 - t) / (1 + k), Pb = 100 - q1, Ps = Pb - t, P0 = 100 - q0;
      Q.dot(g, F.x(q0), F.y(P0), "fk", 4); Q.dot(g, F.x(q1), F.y(Pb), "fd", 5);
      read.textContent = `세금 ${t}: 소비자 가격 ${num(P0, 1)} → ${num(Pb, 1)} (+${num(Pb - P0, 1)}), 판매자 수취 ${num(P0, 1)} → ${num(Ps, 1)} (−${num(P0 - Ps, 1)})`;
    });
  });

  // 2-6 선형계획: 책상 x, 의자 y. 목재 2x + y ≤ 100, 노동 x + 2y ≤ 80, 이익 ax + 30y
  Q.def("econ-lp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const F = frame(g, 0, 60, 0, 60, 10);
      ticks(g, F, [0, 20, 40, 60], [0, 20, 40, 60]);
      txt(g, 490, 200, "책상 x", "s", "end"); txt(g, 66, 26, "의자 y", "s");
      const V = [[0, 0], [50, 0], [40, 20], [0, 40]];
      el("path", { d: "M" + V.map(([x, y]) => `${F.x(x)} ${F.y(y)}`).join(" L") + " Z", class: "la", opacity: 0.6 }, g);
      let best = V[0], bv = -1; for (const [x, y] of V) { const v = a * x + 30 * y; if (v > bv) { bv = v; best = [x, y]; } }
      Q.plot(g, F, (x) => (bv - a * x) / 30, "d", 0, 60);
      for (const [x, y] of V) Q.dot(g, F.x(x), F.y(y), x === best[0] && y === best[1] ? "fd" : "fk", 4);
      read.textContent = `책상 1개 이익 ${a}만 원, 의자 30만 원: 최대 이익 ${bv}만 원, 책상 ${best[0]}개, 의자 ${best[1]}개`;
    });
  });

  // 3-1 점유율 전이: A→A 0.8, A→B 0.2, B→A 0.3, B→B 0.7
  Q.def("econ-markov", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      let a = 0.5, b = 0.5; const H = [[a, b]];
      for (let k = 0; k < 15; k++) { const na = 0.8 * a + 0.3 * b, nb = 0.2 * a + 0.7 * b; a = na; b = nb; H.push([a, b]); }
      const F = frame(g, 0, 15, 0, 1, 1);
      ticks(g, F, [0, 5, 10, 15], [0, 0.5, 1]);
      let d1 = "", d2 = ""; H.forEach(([x, y], k) => { d1 += (k ? "L" : "M") + F.x(k) + " " + F.y(x); d2 += (k ? "L" : "M") + F.x(k) + " " + F.y(y); });
      el("path", { d: d1, class: "b" }, g); el("path", { d: d2, class: "c" }, g);
      Q.line(g, F.x(n), 15, F.x(n), 205, "gd");
      txt(g, 66, 26, "파랑 A사, 주황 B사의 점유율", "s");
      read.textContent = `${n}년 뒤: A ${num(H[n][0] * 100, 1)}%, B ${num(H[n][1] * 100, 1)}% (결국 A 60%, B 40%에 다가간다)`;
    });
  });

  // 3-2 연립방정식과 역행렬: 버거 x, 음료 y. 2x + y = 13000, x + 2y = c
  Q.def("econ-inverse", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ c }) => {
      clear(g);
      const x = (2 * 13000 - c) / 3, y = (2 * c - 13000) / 3;
      const F = frame(g, 0, 8000, 0, 8000, 1000);
      ticks(g, F, [0, 4000, 8000], [0, 4000, 8000]);
      txt(g, 490, 200, "버거 값 x", "s", "end"); txt(g, 66, 26, "음료 값 y", "s");
      Q.plot(g, F, (t) => 13000 - 2 * t, "b", 2500, 6500); Q.plot(g, F, (t) => (c - t) / 2, "c", 0, 8000);
      if (x > 0 && y > 0) Q.dot(g, F.x(x), F.y(y), "fd", 5);
      read.textContent = `세트 A (버거 2 + 음료 1) 13000원, 세트 B (버거 1 + 음료 2) ${won(c)}원 → 버거 ${won(x)}원, 음료 ${won(y)}원` + (y <= 0 || x <= 0 ? " (값이 음수라 현실에 맞지 않는 주문표)" : "");
    });
  });

  // 3-3 레온티예프 투입-산출: 철강(1), 자동차(2). A = [[0.2, 0.3], [0.1, 0.1]]
  Q.def("econ-leontief", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d2 }) => {
      clear(g);
      const d1 = 50, det = 0.8 * 0.9 - 0.3 * 0.1, x1 = (0.9 * d1 + 0.3 * d2) / det, x2 = (0.1 * d1 + 0.8 * d2) / det;
      bars(g, [["철강 최종 수요", d1, "lb"], ["자동차 최종 수요", d2, "lc"], ["철강 총생산", x1, "la"], ["자동차 총생산", x2, "ld"]], 150, 30, 300, 26, 400);
      read.textContent = `자동차 최종 수요 ${d2}억 원 → 철강 총생산 ${num(x1, 1)}억 원, 자동차 총생산 ${num(x2, 1)}억 원 ((I − A)⁻¹ d)`;
    });
  });

  // 4-1 한계비용: C(q) = 1000 + 20q + 0.1q²
  const Cq = (q) => 1000 + 20 * q + 0.1 * q * q, MC = (q) => 20 + 0.2 * q;
  Q.def("econ-mc", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ q }) => {
      clear(g);
      const F = frame(g, 0, 300, 0, 16000, [50, 2000]);
      ticks(g, F, [0, 100, 200, 300], [0, 5000, 10000, 15000]);
      Q.plot(g, F, Cq, "b", 0, 300);
      Q.plot(g, F, (t) => Cq(q) + MC(q) * (t - q), "c", Math.max(0, q - 80), Math.min(300, q + 80));
      Q.dot(g, F.x(q), F.y(Cq(q)), "fd", 5);
      txt(g, 66, 30, "총비용 C(q)와 접선 (단위 천 원)", "s");
      read.textContent = `${q}개: 총비용 ${won(Cq(q))}, 한계비용 C′(q) = ${num(MC(q), 1)}, 실제로 하나 더 만드는 비용 ${num(Cq(q + 1) - Cq(q), 1)}`;
    });
  });

  // 4-2 평균비용과 한계비용 (C(q) = 1000 + 20q + 0.1q²)
  Q.def("econ-ac", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ q }) => {
      clear(g);
      const F = frame(g, 0, 300, 0, 100, [50, 20]);
      ticks(g, F, [0, 100, 200, 300], [0, 50, 100]);
      Q.plot(g, F, (t) => Cq(t) / t, "b", 12, 300); Q.plot(g, F, MC, "c", 0, 300);
      Q.dot(g, F.x(q), F.y(Cq(q) / q), "fd", 5);
      txt(g, 66, 30, "파랑 평균비용, 주황 한계비용", "s");
      read.textContent = `${q}개: 평균비용 ${num(Cq(q) / q, 2)}, 한계비용 ${num(MC(q), 1)} → ` + (Math.abs(q - 100) < 1 ? "같다 (평균비용 최소)" : MC(q) < Cq(q) / q ? "한계 < 평균이라 평균이 내려가는 중" : "한계 > 평균이라 평균이 올라가는 중");
    });
  });

  // 4-3 가격 탄력성: 수요 Q = 100 − 2P
  Q.def("econ-elastic", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ P }) => {
      clear(g);
      const F = frame(g, 0, 50, 0, 1300, [5, 250]);
      ticks(g, F, [0, 10, 20, 30, 40, 50], [0, 500, 1000]);
      txt(g, 490, 200, "가격 P", "s", "end");
      Q.plot(g, F, (p) => p * (100 - 2 * p), "c", 0, 50);
      Q.plot(g, F, (p) => (100 - 2 * p) * 10, "b", 0, 50);
      const q = 100 - 2 * P, e = 2 * P / q;
      Q.dot(g, F.x(P), F.y(P * q), "fd", 5);
      txt(g, 66, 30, "주황 판매 수입 PQ, 파랑 수요량 Q (×10)", "s");
      read.textContent = `P = ${P}: 수요량 ${q}, 탄력성 ${q > 0 ? num(e, 2) : "∞"} → ` + (Math.abs(e - 1) < 0.01 ? "단위 탄력적 (수입 최대)" : e > 1 ? "탄력적 (값을 내리면 수입 증가)" : "비탄력적 (값을 올리면 수입 증가)");
    });
  });

  // 4-4 이윤 최대: P = 100 − q, C = 500 + 20q
  Q.def("econ-profit", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ q }) => {
      clear(g);
      const F = frame(g, 0, 100, -600, 2600, [10, 500]);
      ticks(g, F, [0, 20, 40, 60, 80, 100], [0, 1000, 2000]);
      const R = (t) => t * (100 - t), C = (t) => 500 + 20 * t, Pi = (t) => R(t) - C(t);
      Q.line(g, 60, F.y(0), 490, F.y(0), "ax");
      Q.plot(g, F, R, "b", 0, 100); Q.plot(g, F, C, "d", 0, 100); Q.plot(g, F, Pi, "c", 0, 100);
      Q.dot(g, F.x(q), F.y(Pi(q)), "fd", 5);
      txt(g, 66, 30, "파랑 수입, 빨강 비용, 주황 이윤", "s");
      read.textContent = `${q}개: 이윤 ${num(Pi(q), 0)}, 한계수입 ${100 - 2 * q}, 한계비용 20` + (q === 40 ? " → 같다, 이윤 최대 1100" : "");
    });
  });
})();
