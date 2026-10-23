/* 행성우주과학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const GC = 6.674e-11;

  // 1-1 호만 전이 궤도: 목표 행성 k
  const PL = [["금성", 0.723], ["화성", 1.524], ["목성", 5.203], ["토성", 9.537]];
  Q.def("space-hohmann", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const [nm, a] = PL[k], at = (1 + a) / 2, tt = 0.5 * at ** 1.5, T = a ** 1.5, syn = 1 / Math.abs(1 - 1 / T);
      const cx = 160, cy = 110, s = 90 / Math.max(1, a);
      el("circle", { cx, cy, r: s, class: "gd" }, g); el("circle", { cx, cy, r: a * s, class: "gd" }, g); Q.dot(g, cx, cy, "fc", 6);
      const r1 = Math.min(1, a) * s, r2 = Math.max(1, a) * s, aa = (r1 + r2) / 2, bb = Math.sqrt(r1 * r2), ccx = cx + (a > 1 ? -(aa - r1) : (aa - r1));
      el("path", { d: `M${cx + (a > 1 ? r1 : r2)} ${cy} A ${aa} ${bb} 0 0 0 ${cx - (a > 1 ? r2 : r1)} ${cy}`, class: "b" }, g);
      txt(g, 300, 60, `전이 궤도 긴반지름 ${num(at, 2)} AU`, "s"); txt(g, 300, 85, `가는 데 ${num(tt * 12, 1)}개월`, "s tb"); txt(g, 300, 110, `발사 기회 ${num(syn * 12, 0)}개월마다`, "s td");
      read.textContent = `지구 → ${nm} (${a} AU): 호만 궤도로 ${num(tt * 365, 0)}일, 같은 배치가 돌아오는 회합 주기 ${num(syn, 2)}년`;
    }, (key, v) => PL[v][0]);
  });

  // 1-2 소행성 충돌 에너지: 지름 10^ld m, 속력 20 km/s, 밀도 3000 kg/m³
  Q.def("space-impact", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ld }) => {
      clear(g);
      const D = 10 ** ld, m = 3000 * Math.PI / 6 * D ** 3, E = 0.5 * m * 2e4 ** 2, Mt = E / 4.184e15;
      const F = frame(g, 1, 4, -4, 8, [0.5, 2]);
      for (const [x, lb] of [[1, "10 m"], [2, "100 m"], [3, "1 km"], [4, "10 km"]]) txt(g, F.x(x), 220, lb, "s", "middle");
      for (const y of [-4, -2, 0, 2, 4, 6, 8]) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end");
      txt(g, 490, 200, "소행성 지름 (로그 눈금)", "s", "end"); txt(g, 66, 26, "에너지 (TNT 메가톤, 10의 거듭제곱)", "s");
      Q.plot(g, F, (x) => Math.log10(0.5 * 3000 * Math.PI / 6 * (10 ** x) ** 3 * 4e8 / 4.184e15), "b", 1, 4, 100);
      Q.line(g, F.x(1), F.y(Math.log10(0.015)), F.x(4), F.y(Math.log10(0.015)), "gd"); txt(g, F.x(4), F.y(Math.log10(0.015)) - 4, "히로시마 원폭", "s", "end");
      Q.dot(g, F.x(ld), F.y(Math.log10(Mt)), "fd", 5);
      read.textContent = `지름 ${num(D, 0)} m, 20 km/s: 질량 ${m.toExponential(1)} kg, 에너지 약 ${Mt >= 1 ? num(Mt, 0) + " 메가톤" : num(Mt * 1000, 0) + " 킬로톤"} (히로시마 원폭의 ${num(Mt / 0.015, 0)}배)`;
    });
  });

  // 1-3 목성 위성으로 목성 질량 구하기: 위성 k
  const MOON = [["이오", 4.22e8, 1.769], ["유로파", 6.71e8, 3.551], ["가니메데", 1.070e9, 7.155], ["칼리스토", 1.883e9, 16.69]];
  Q.def("space-jmass", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const F = frame(g, 0, 2, 0, 18, [0.5, 3]); ticks(g, F, [0, 0.5, 1, 1.5, 2], [0, 6, 12, 18]);
      txt(g, 490, 200, "궤도 반지름 (백만 km)", "s", "end"); txt(g, 66, 26, "공전 주기 (일)", "s");
      Q.plot(g, F, (x) => 2 * Math.PI * Math.sqrt((x * 1e9) ** 3 / (GC * 1.898e27)) / 86400, "gd", 0.05, 2, 200);
      MOON.forEach(([, a, T], i) => Q.dot(g, F.x(a / 1e9), F.y(T), i === k ? "fd" : "fb", i === k ? 6 : 4));
      const [nm, a, T] = MOON[k], M = 4 * Math.PI ** 2 * a ** 3 / (GC * (T * 86400) ** 2);
      read.textContent = `${nm}: 궤도 반지름 ${num(a / 1e7, 1)}만 km, 주기 ${T}일 → 목성 질량 4π²a³/(GT²) = ${M.toExponential(2)} kg (지구의 ${num(M / 5.97e24, 0)}배)`;
    }, (key, v) => MOON[v][0]);
  });

  // 1-4 행성과 왜소 행성: 천체 k
  const BODY = [["수성", 4879, "둥글다", "궤도 주변을 지배", "행성"], ["명왕성", 2377, "둥글다", "카이퍼대 천체와 궤도를 나눔", "왜소 행성"], ["세레스", 940, "둥글다", "소행성대 안", "왜소 행성"], ["베스타", 525, "울퉁불퉁", "소행성대 안", "소행성"], ["핼리 혜성 핵", 11, "울퉁불퉁", "긴 타원 궤도", "혜성"]];
  Q.def("space-dwarf", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      BODY.forEach(([nm, d], i) => bar(g, 18 + i * 34, Math.log10(d) * 70, i === k ? "lc" : "lk", nm, `지름 ${d.toLocaleString("ko-KR")} km`, 130));
      const [nm, d, shape, orbit, cls] = BODY[k];
      read.textContent = `${nm}: 지름 ${d.toLocaleString("ko-KR")} km, 모양 ${shape}, ${orbit} → ${cls}`;
    }, (key, v) => BODY[v][0]);
  });

  // 1-5 통과 관측: 행성 반지름 rp (지구 반지름), 별 반지름 rs (태양 반지름)
  Q.def("space-transit", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ rp, rs }) => {
      clear(g);
      const dep = (rp * 6371 / (rs * 696000)) ** 2;
      const F = frame(g, -5, 5, 1 - 0.012, 1.001, [1, 0.002]); ticks(g, F, [-4, -2, 0, 2, 4], []);
      for (const v of [1, 0.996, 0.992, 0.988]) txt(g, F.X0 - 5, F.y(v) + 4, `${num(v * 100, 1)}%`, "s", "end");
      txt(g, 490, 200, "시간 (시)", "s", "end"); txt(g, 66, 26, "별의 밝기", "s");
      Q.plot(g, F, (t) => Math.abs(t) < 1.5 ? 1 - dep : Math.abs(t) < 2 ? 1 - dep * (2 - Math.abs(t)) / 0.5 : 1, "b", -5, 5, 400);
      read.textContent = `행성 ${rp} 지구 반지름, 별 ${rs} 태양 반지름: 밝기 감소 (Rp/Rs)² = ${num(dep * 100, 3)}% (${num(dep * 1e6, 0)} ppm)`;
    });
  });

  // 2-1 흑점의 온도와 밝기: 흑점 온도 T (K), 광구 5800 K
  Q.def("space-spot", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T }) => {
      clear(g);
      const r = (T / 5800) ** 4;
      el("circle", { cx: 130, cy: 110, r: 85, class: "lc" }, g); el("circle", { cx: 150, cy: 95, r: 16, class: r < 0.5 ? "ld" : "lc" }, g);
      bar(g, 50, 250, "lc", "광구 (5800 K)", "1", 280); bar(g, 90, r * 250, "ld", "흑점", num(r, 2), 280);
      txt(g, 280, 150, `가장 센 파장 ${num(2.9e6 / T, 0)} nm`, "s");
      read.textContent = `흑점 ${T} K: 같은 넓이에서 내는 빛은 광구의 (T/5800)⁴ = ${num(r * 100, 0)}%. 그래서 주변보다 어둡게 보이지만 혼자 있다면 밝게 빛난다`;
    });
  });

  // 2-2 연주 시차와 거리: 시차 10^lp 초, 겉보기 등급 m
  Q.def("space-parallax", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lp, m }) => {
      clear(g);
      const p = 10 ** lp, d = 1 / p, M = m - 5 * Math.log10(d) + 5;
      bar(g, 40, Math.log10(d) * 80 + 10, "lb", "거리", `${num(d, d < 10 ? 2 : 0)} pc (${num(d * 3.26, d < 10 ? 1 : 0)}광년)`);
      bar(g, 80, Math.max(1, (M + 10) * 12), "lc", "절대 등급", num(M, 2));
      txt(g, 170, 140, `거리 지수 m − M = 5 log d − 5 = ${num(m - M, 2)}`, "s");
      read.textContent = `연주 시차 ${p >= 0.01 ? num(p, 3) : p.toExponential(1)}″: 거리 1/p = ${num(d, 1)} pc. 겉보기 등급 ${m}이면 절대 등급 ${num(M, 2)}`;
    });
  });

  // 2-3 별의 공간 운동: 고유 운동 mu (″/년), 거리 d (pc), 시선 속도 20 km/s
  Q.def("space-motion", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ mu, d }) => {
      clear(g);
      const vt = 4.74 * mu * d, vr = 20, v = Math.hypot(vt, vr), s = 2;
      Q.dot(g, 100, 150, "fk", 5);
      Q.arrow(g, 100, 150, 100 + Math.min(300, vt * s), 150, "b", "fb"); Q.arrow(g, 100, 150, 100, 150 - vr * s, "c", "fc");
      Q.arrow(g, 100, 150, 100 + Math.min(300, vt * s), 150 - vr * s, "d", "fd");
      txt(g, 110 + Math.min(300, vt * s), 165, `접선 속도 ${num(vt, 1)} km/s`, "s tb"); txt(g, 108, 150 - vr * s - 4, `시선 속도 ${vr} km/s`, "s tc");
      read.textContent = `고유 운동 ${mu}″/년, 거리 ${d} pc: 접선 속도 4.74μd = ${num(vt, 1)} km/s, 공간 속도 √(vt² + vr²) = ${num(v, 1)} km/s. 10만 년 동안 하늘에서 ${num(mu * 1e5 / 3600, 1)}° 움직인다`;
    });
  });

  // 2-4 쌍성의 질량: 긴반지름 a (AU), 주기 P (년)
  Q.def("space-binary", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, P }) => {
      clear(g);
      const M = a ** 3 / P ** 2;
      el("ellipse", { cx: 150, cy: 110, rx: 30 + a * 3, ry: 20 + a * 2, class: "gd" }, g); Q.dot(g, 150 - 10, 110, "fc", 7); Q.dot(g, 150 + 30 + a * 3, 110, "fb", 5);
      bar(g, 60, Math.min(250, M * 25), "lc", "두 별의 질량 합", `${num(M, 2)} 태양 질량`, 320);
      read.textContent = `긴반지름 ${a} AU, 주기 ${P}년: 질량 합 a³/P² = ${num(M, 2)}배 태양 질량 (케플러 제3법칙)`;
    });
  });

  // 2-5 세페이드 변광성: 주기 P (일), 겉보기 등급 m
  Q.def("space-ceph", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ P, m }) => {
      clear(g);
      const Mv = (p) => -2.43 * (Math.log10(p) - 1) - 4.05, M = Mv(P), d = 10 ** ((m - M + 5) / 5);
      const F = Q.frame(0, 2, -7, -1, 60, 490, 15, 205); Q.axes(g, F, { step: [0.5, 1], label: false });
      for (const [x, lb] of [[0, "1"], [0.5, "3"], [1, "10"], [1.5, "30"], [2, "100"]]) txt(g, F.x(x), 220, lb, "s", "middle");
      for (const y of [-7, -5, -3, -1]) txt(g, F.X0 - 5, F.y(-y - 8) + 4, `${y}`, "s", "end");
      txt(g, 490, 200, "변광 주기 (일, 로그 눈금)", "s", "end"); txt(g, 66, 26, "절대 등급 (위로 갈수록 밝음)", "s");
      Q.plot(g, F, (x) => -Mv(10 ** x) - 8, "b", 0, 2, 100);
      Q.dot(g, F.x(Math.log10(P)), F.y(-M - 8), "fd", 5);
      read.textContent = `주기 ${P}일: 절대 등급 ${num(M, 2)} (주기–광도 관계). 겉보기 등급 ${m}이면 거리 ${Math.round(d).toLocaleString("ko-KR")} pc (${num(d * 3.26 / 1e4, 1)}만 광년)`;
    });
  });

  // 3-1 성단의 나이와 전향점: 나이 10^la 년
  Q.def("space-turnoff", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ la }) => {
      clear(g);
      const t = 10 ** la, Mto = (t / 1e10) ** (-1 / 2.5);
      const F = frame(g, 7, 10.2, -0.5, 1.5, [0.5, 0.5]);
      for (const [x, lb] of [[7, "천만"], [8, "1억"], [9, "10억"], [10, "100억"]]) txt(g, F.x(x), 220, lb, "s", "middle");
      for (const [y, lb] of [[0, "1"], [0.5, "3"], [1, "10"], [1.5, "30"]]) txt(g, F.X0 - 5, F.y(y) + 4, lb, "s", "end");
      txt(g, 490, 200, "성단의 나이 (년, 로그 눈금)", "s", "end"); txt(g, 66, 26, "전향점 별의 질량 (태양 질량)", "s");
      Q.plot(g, F, (x) => Math.log10((10 ** x / 1e10) ** (-0.4)), "b", 7, 10.2, 100);
      Q.dot(g, F.x(la), F.y(Math.log10(Mto)), "fd", 5);
      const sp = Mto > 16 ? "O" : Mto > 2.1 ? "B" : Mto > 1.4 ? "A" : Mto > 1.04 ? "F" : Mto > 0.8 ? "G" : "K";
      read.textContent = `나이 ${t >= 1e9 ? num(t / 1e8, 0) + "억" : num(t / 1e4, 0) + "만"} 년: 주계열 수명이 다한 별의 질량 ${num(Mto, 2)} 태양 질량 (${sp}형) → 이보다 무거운 별은 이미 거성으로 떠났다`;
    });
  });

  // 3-2 성간 소광: 소광량 A (등급), 실제 거리 1000 pc
  Q.def("space-dust", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ A }) => {
      clear(g);
      const f = 10 ** (-0.4 * A), dap = 1000 * 10 ** (A / 5), E = A / 3.1;
      bar(g, 30, f * 250, "lc", "도착하는 빛", `${num(f * 100, 1)}%`);
      bar(g, 70, dap / 20, "ld", "소광을 무시한 거리", `${Math.round(dap).toLocaleString("ko-KR")} pc`);
      bar(g, 110, 50, "lb", "실제 거리", "1,000 pc");
      txt(g, 170, 165, `색 초과 E(B−V) = A/3.1 = ${num(E, 2)} (붉어짐)`, "s");
      read.textContent = `소광 ${A}등급: 빛이 ${num(f * 100, 1)}%만 도착하고 붉게 보인다. 소광을 무시하면 거리를 ${num(dap / 1000, 2)}배로 잘못 잰다`;
    });
  });

  // 3-3 은하 회전 곡선: 반지름 r (kpc)
  Q.def("space-rot", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const Mvis = (x) => 9e10 * (1 - (1 + x / 3) * Math.exp(-x / 3)); // 태양 질량, 지수 원반 어림
      const vk = (x) => Math.sqrt(GC * Mvis(x) * 1.989e30 / (x * 3.086e19)) / 1000;
      const vf = (x) => 220 * (1 - Math.exp(-x / 2));
      const F = frame(g, 0, 50, 0, 300, [5, 50]); ticks(g, F, [0, 10, 20, 30, 40, 50], [0, 100, 200, 300]);
      txt(g, 490, 200, "은하 중심에서의 거리 (kpc)", "s", "end"); txt(g, 66, 26, "회전 속도 (km/s)", "s");
      Q.plot(g, F, vk, "c", 0.3, 50, 200); Q.plot(g, F, vf, "b", 0.1, 50, 200);
      Q.dot(g, F.x(r), F.y(vf(r)), "fd", 5);
      const Mdyn = (vf(r) * 1000) ** 2 * r * 3.086e19 / GC / 1.989e30;
      read.textContent = `${r} kpc: 관측 회전 속도 ${num(vf(r), 0)} km/s (파랑), 보이는 물질만으로 기대되는 값 ${num(vk(r), 0)} km/s (주황). 이 안의 질량 v²r/G ≈ ${num(Mdyn / 1e10, 0)} × 10¹⁰ 태양 질량`;
    });
  });

  // 3-4 적색 편이와 거리: z
  Q.def("space-z", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ z }) => {
      clear(g);
      const v = 3e5 * z, d = v / 70, lam = 656.3 * (1 + z);
      el("rect", { x: 40, y: 40, width: 440, height: 30, class: "lk" }, g);
      const X = (w) => 40 + (w - 600) / 300 * 440;
      Q.line(g, X(656.3), 35, X(656.3), 75, "gd"); txt(g, X(656.3), 30, "원래 656 nm", "s", "middle");
      if (lam < 900) { Q.line(g, X(lam), 35, X(lam), 75, "d"); txt(g, X(lam), 90, `관측 ${num(lam, 0)} nm`, "s td", "middle"); }
      bar(g, 110, v / 300, "lc", "후퇴 속도", `${Math.round(v).toLocaleString("ko-KR")} km/s`);
      bar(g, 145, d / 15, "lb", "거리 (허블 법칙)", `${Math.round(d).toLocaleString("ko-KR")} Mpc`);
      read.textContent = `적색 편이 z = ${z}: 수소선 656 nm가 ${num(lam, 1)} nm로, 후퇴 속도 cz ≈ ${num(v, 0)} km/s, 거리 v/H₀ ≈ ${num(d, 0)} Mpc (H₀ = 70, z가 작을 때의 어림)`;
    });
  });

  // 3-5 밀도 요동의 성장: 우주 크기 인자 10^la (현재 = 1)
  Q.def("space-growth", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ la }) => {
      clear(g);
      const ar = 1 / 1100, b = (x) => x < ar ? 1e-5 : 1e-5 * x / ar, dm = (x) => Math.max(1e-5, 2e-3 * x / ar);
      const F = frame(g, -4, 0, -6, 2, [0.5, 1]);
      for (const [x, lb] of [[-4, "1/10000"], [-3, "1/1000"], [-2, "1/100"], [-1, "1/10"], [0, "현재"]]) txt(g, F.x(x), 220, lb, "s", "middle");
      ticks(g, F, [], [-6, -4, -2, 0, 2]);
      txt(g, 490, 200, "우주의 크기 (현재 대비, 로그 눈금)", "s", "end"); txt(g, 66, 26, "밀도 요동 (10의 거듭제곱)", "s");
      Q.line(g, F.x(-4), F.y(0), F.x(0), F.y(0), "d"); txt(g, F.x(-0.1), F.y(0) - 4, "요동 1: 천체가 뭉침", "s td", "end");
      Q.plot(g, F, (x) => Math.log10(b(10 ** x)), "c", -4, 0, 200); Q.plot(g, F, (x) => Math.log10(dm(10 ** x)), "b", -4, 0, 200);
      const a = 10 ** la;
      read.textContent = `우주 크기 ${a >= 0.01 ? num(a, 2) : "1/" + num(1 / a, 0)}: 보통 물질만 있을 때 요동 ${b(a).toExponential(0)}, 암흑 물질과 함께일 때 ${dm(a).toExponential(0)} (모형). 암흑 물질이 먼저 뭉쳐 있어야 지금의 은하가 생길 수 있다`;
    });
  });
})();
