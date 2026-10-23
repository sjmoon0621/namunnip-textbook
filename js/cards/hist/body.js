/* 역사 속의 과학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st, X0, X1) => { const F = Q.frame(x0, x1, y0, y1, X0 || 60, X1 || 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };

  // 1-1 태음력과 계절의 어긋남: 지난 해 수 y
  Q.def("hist-luni", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ y }) => {
      clear(g);
      const lunar = 12 * 29.5306, drift = (n) => n * (365.2422 - lunar);
      const F = frame(g, 0, 19, 0, 210, [1, 30]); ticks(g, F, [0, 3, 6, 9, 12, 15, 18], [0, 60, 120, 180]);
      txt(g, 490, 200, "지난 해 수", "s", "end"); txt(g, 66, 26, "계절과 어긋난 날수", "s");
      Q.plot(g, F, drift, "d", 0, 19, 40);
      // 19년에 윤달 7번 (3, 6, 8, 11, 14, 17, 19년째)
      const leap = [3, 6, 8, 11, 14, 17, 19];
      let d = ""; for (let i = 0; i <= 190; i++) { const t = i / 10, nl = leap.filter((L) => L <= t).length; d += (i ? "L" : "M") + F.x(t) + " " + F.y(Math.max(0, drift(t) - nl * 29.53)); }
      el("path", { d, class: "b" }, g);
      Q.dot(g, F.x(y), F.y(drift(y)), "fd", 5);
      read.textContent = `${y}년 동안 12달짜리 태음력만 쓰면 계절과 ${num(drift(y), 0)}일 어긋난다 (해마다 약 10.9일). 19년에 윤달 7번을 넣으면 파란 선처럼 거의 0으로 돌아온다`;
    });
  });

  // 1-2 에라토스테네스: 그림자 각 a (°), 두 도시 거리 d (km)
  Q.def("hist-erat", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, d }) => {
      clear(g);
      const C = 360 / a * d, R = C / (2 * Math.PI);
      const cx = 140, cy = 120, r = 80, t = a * Math.PI / 180 * 4;
      el("circle", { cx, cy, r, class: "lk" }, g);
      Q.line(g, cx, cy, cx, cy - r, "k"); Q.line(g, cx, cy, cx + r * Math.sin(t), cy - r * Math.cos(t), "k");
      for (let i = 0; i < 4; i++) Q.line(g, 20, 20 + i * 8, 260, 20 + i * 8, "c");
      txt(g, cx + 6, cy - 30, `${a}° (과장)`, "s"); txt(g, 300, 70, `둘레 = 360 ÷ ${a} × ${d}`, "s"); txt(g, 300, 95, `= ${Math.round(C).toLocaleString("ko-KR")} km`, "s td");
      read.textContent = `그림자 각 ${a}°, 두 도시 사이 ${d} km: 지구 둘레 ${Math.round(C).toLocaleString("ko-KR")} km, 반지름 약 ${Math.round(R).toLocaleString("ko-KR")} km (실제 둘레 약 40,000 km)`;
    });
  });

  // 1-3 알콰리즈미의 완전제곱: x² + b x = c
  Q.def("hist-square", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b, c }) => {
      clear(g);
      const x = -b / 2 + Math.sqrt((b / 2) ** 2 + c), s = 120 / (x + b / 2);
      const X0 = 60, Y0 = 30, xs = x * s, hs = b / 2 * s;
      el("rect", { x: X0, y: Y0, width: xs, height: xs, class: "lb" }, g); txt(g, X0 + xs / 2, Y0 + xs / 2 + 4, "x²", "s", "middle");
      el("rect", { x: X0 + xs, y: Y0, width: hs, height: xs, class: "lc" }, g); el("rect", { x: X0, y: Y0 + xs, width: xs, height: hs, class: "lc" }, g);
      el("rect", { x: X0 + xs, y: Y0 + xs, width: hs, height: hs, class: "ld" }, g);
      txt(g, X0 + xs + hs / 2, Y0 + xs / 2 + 4, `${num(b / 2, 1)}x`, "s", "middle"); txt(g, X0 + xs + hs / 2, Y0 + xs + hs / 2 + 4, `${num((b / 2) ** 2, 1)}`, "s", "middle");
      txt(g, 260, 60, `x² + ${b}x = ${c}`, "s"); txt(g, 260, 85, `(x + ${num(b / 2, 1)})² = ${c} + ${num((b / 2) ** 2, 2)} = ${num(c + (b / 2) ** 2, 2)}`, "s"); txt(g, 260, 110, `x = √${num(c + (b / 2) ** 2, 2)} − ${num(b / 2, 1)} = ${num(x, 3)}`, "s td");
      read.textContent = `x² + ${b}x = ${c}: 막대 두 개(${num(b / 2, 1)}x씩)를 붙이고 빈 모서리 ${num((b / 2) ** 2, 2)}을 채우면 한 변 ${num(x + b / 2, 3)}인 정사각형이 되어 x = ${num(x, 3)}`;
    });
  });

  // 1-4 금성의 위상과 크기 (태양 중심 모형): 금성의 공전 위치 th (°, 0이면 내합)
  Q.def("hist-venus", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ th }) => {
      clear(g);
      const a = 0.723, t = th * Math.PI / 180, V = [a * Math.cos(t), a * Math.sin(t)], E = [1, 0];
      const dx = V[0] - E[0], dy = V[1] - E[1], d = Math.hypot(dx, dy);
      const cosA = (-(V[0]) * (-dx) + -(V[1]) * (-dy)) / (a * d); // 태양-금성-지구 사이 각의 코사인
      const k = (1 + cosA) / 2, size = 1 / d;
      const cx = 130, cy = 115, s = 80;
      el("circle", { cx, cy, r: s * a, class: "gd" }, g); el("circle", { cx, cy, r: s, class: "gd" }, g);
      Q.dot(g, cx, cy, "fc", 7); Q.dot(g, cx + s, cy, "fb", 5); Q.dot(g, cx + s * V[0], cy - s * V[1], "fd", 5);
      const R = 6 + size * 9, px = 380, py = 110;
      el("circle", { cx: px, cy: py, r: R, class: "lk" }, g);
      el("ellipse", { cx: px, cy: py, rx: Math.abs(1 - 2 * k) * R, ry: R, class: k > 0.5 ? "lc" : "lk" }, g);
      txt(g, px, py + R + 18, `밝은 부분 ${num(k * 100, 0)}%`, "s", "middle");
      read.textContent = `지구에서 금성까지 ${num(d, 2)} AU: 겉보기 크기는 가장 멀 때의 ${num(size / (1 / 1.723), 1)}배, 밝게 보이는 부분 ${num(k * 100, 0)}%. 보름달 모양부터 가는 초승달 모양까지 위상이 모두 보인다`;
    });
  });

  // 1-5 케플러의 정다면체: 쌍 k
  const KP = [["토성/목성", "정육면체", 0.577, 5.20 / 9.54], ["목성/화성", "정사면체", 0.333, 1.52 / 5.20], ["화성/지구", "정십이면체", 0.795, 1 / 1.52], ["지구/금성", "정이십면체", 0.795, 0.723 / 1], ["금성/수성", "정팔면체", 0.577, 0.387 / 0.723]];
  Q.def("hist-solids", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      KP.forEach(([nm, , p, a], i) => { const y = 22 + i * 36; el("rect", { x: 160, y, width: p * 300, height: 14, class: i === k ? "lc" : "lk" }, g); el("rect", { x: 160, y: y + 14, width: a * 300, height: 14, class: i === k ? "lb" : "gd" }, g); txt(g, 152, y + 22, nm, "s", "end"); });
      txt(g, 470, 210, "위: 정다면체 예측, 아래: 실제 궤도 반지름 비", "s", "end");
      const [nm, sol, p, a] = KP[k];
      read.textContent = `${nm} 사이에 ${sol}: 안접 구와 외접 구의 반지름 비 ${num(p, 3)}, 실제 궤도 반지름 비 ${num(a, 3)} (차이 ${num(Math.abs(p - a) / a * 100, 0)}%)`;
    }, (key, v) => KP[v][0]);
  });

  // 2-1 태양 곁을 지나는 별빛의 휨: 태양 중심에서의 거리 b (태양 반지름 단위)
  Q.def("hist-bend", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b }) => {
      clear(g);
      const ein = 1.75 / b, newt = 0.875 / b;
      const F = frame(g, 1, 6, 0, 2, [1, 0.5]); ticks(g, F, [1, 2, 3, 4, 5, 6], [0, 0.5, 1, 1.5, 2]);
      txt(g, 490, 200, "태양 중심에서 별빛이 지나는 거리 (태양 반지름)", "s", "end"); txt(g, 66, 26, "휘는 각 (초)", "s");
      Q.plot(g, F, (x) => 1.75 / x, "b", 1, 6, 100); Q.plot(g, F, (x) => 0.875 / x, "c", 1, 6, 100);
      Q.dot(g, F.x(b), F.y(ein), "fd", 5);
      read.textContent = `태양 반지름의 ${b}배 거리: 일반 상대론 예측 ${num(ein, 2)}″, 뉴턴식 계산 ${num(newt, 2)}″. 1919년 일식 관측값은 상대론 쪽에 가까웠다`;
    });
  });

  // 2-2 끓인 시간과 미생물 생존: 끓인 시간 t (분), 처음 미생물 100만 마리
  Q.def("hist-spore", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const N0 = 1e6, yeast = (x) => Math.log10(N0) - x / 0.2, hay = (x) => Math.log10(N0) - x / 10;
      const F = frame(g, 0, 60, -6, 6, [10, 2]); ticks(g, F, [0, 10, 20, 30, 40, 50, 60], [-6, -4, -2, 0, 2, 4, 6]);
      txt(g, 490, 200, "100 °C에서 끓인 시간 (분)", "s", "end"); txt(g, 66, 26, "살아남은 수 (10의 거듭제곱)", "s");
      Q.line(g, F.x(0), F.y(0), F.x(60), F.y(0), "d"); txt(g, F.x(60), F.y(0) - 4, "1마리", "s td", "end");
      Q.plot(g, F, yeast, "b", 0, 60, 100); Q.plot(g, F, hay, "c", 0, 60, 100);
      const py = Math.min(1, 10 ** yeast(t)), ph = Math.min(1, 10 ** hay(t));
      read.textContent = `${t}분 끓임: 효모 국물에 한 마리라도 살아남을 가능성 ${num(py * 100, py > 0.01 ? 0 : 3)}%, 건초 우린 물(열에 강한 포자)은 ${num(ph * 100, 0)}%. 같은 '끓였다'도 결과가 다르다`;
    });
  });

  // 2-3 현수선 아치: 처짐 비 h/L
  Q.def("hist-cat", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const L = 1, h = r * L; // 폭 1, 높이 h
      // a cosh(x/a) − a = h at x = 0.5
      let lo = 0.01, hi = 50; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (m * (Math.cosh(0.5 / m) - 1) > h) lo = m; else hi = m; }
      const a = (lo + hi) / 2;
      const X = (x) => 260 + x * 360, Y = (y) => 200 - y * 360 / Math.max(1, h * 1.3) * 0.5;
      let dc = "", dp = ""; for (let i = 0; i <= 100; i++) { const x = -0.5 + i / 100; const yc = h - (a * (Math.cosh(x / a) - 1)), yp = h * (1 - 4 * x * x); dc += (i ? "L" : "M") + X(x) + " " + Y(yc); dp += (i ? "L" : "M") + X(x) + " " + Y(yp); }
      el("path", { d: dp, class: "gd" }, g); el("path", { d: dc, class: "b" }, g);
      Q.line(g, X(-0.6), 200, X(0.6), 200, "k");
      read.textContent = `높이 ÷ 폭 = ${num(r, 2)}: 사슬을 거꾸로 세운 현수선(파랑)은 자기 무게를 압축력만으로 받친다. 회색 포물선은 ${r > 0.4 ? "높은 아치에서 현수선과 꽤 다르다" : "낮은 아치에서는 거의 같다"}`;
    });
  });

  // 2-4 스노의 콜레라 조사: 물 공급 회사 k
  const SNOW = [["사우스워크·복스홀", 40046, 1263], ["램버스", 26107, 98], ["런던의 나머지", 256423, 1422]];
  Q.def("hist-snow", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      SNOW.forEach(([nm, h, d], i) => bar(g, 40 + i * 44, d / h * 1e4 * 0.8, i === k ? "ld" : "lk", nm, `1만 가구당 ${num(d / h * 1e4, 0)}명`));
      const [nm, h, d] = SNOW[k];
      read.textContent = `${nm}: ${h.toLocaleString("ko-KR")}가구에서 콜레라 사망 ${d.toLocaleString("ko-KR")}명, 1만 가구당 ${num(d / h * 1e4, 0)}명. 오염된 템스강 하류 물을 쓴 회사가 약 8배 많았다 (1854년)`;
    }, (key, v) => SNOW[v][0]);
  });

  // 2-5 승객 1명을 1 km 옮기는 에너지: 승용차 탑승 인원 p
  Q.def("hist-pkm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const car = 0.62 / p, rows = [["승용차", car], ["시내버스 (승객 20명)", 0.15], ["고속 열차", 0.06], ["비행기", 0.45]];
      rows.forEach(([nm, e], i) => bar(g, 25 + i * 40, e * 400, i === 0 ? "lc" : "lk", nm, `${num(e, 2)} kWh`));
      read.textContent = `승용차에 ${p}명 탈 때 1인 1 km당 약 ${num(car, 2)} kWh (대략값). 고속 열차는 약 0.06 kWh로 ${num(car / 0.06, 0)}분의 1이다`;
    });
  });

  // 2-6 연쇄 반응: 증배 계수 k, 세대 n
  Q.def("hist-chain", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const F = frame(g, 0, 80, -2, 24, [10, 4]); ticks(g, F, [0, 20, 40, 60, 80], [0, 8, 16, 24]);
      txt(g, 490, 200, "세대 (원자로 약 0.1 ms, 폭탄 약 10 ns마다)", "s", "end"); txt(g, 66, 26, "중성자 수 (10의 거듭제곱)", "s");
      for (const kk of [0.98, 1, 2]) if (kk !== k) Q.plot(g, F, (n) => n * Math.log10(kk), "gd", 0, 80, 80);
      Q.plot(g, F, (n) => n * Math.log10(k), "b", 0, 80, 80);
      const N80 = 80 * Math.log10(k);
      read.textContent = `증배 계수 ${num(k, 2)}: 80세대 뒤 중성자 10^${num(N80, 1)}배. ` + (Math.abs(k - 1) < 0.005 ? "1이면 일정하게 유지 (원자로의 정상 운전)" : k < 1 ? "1보다 작으면 꺼져 간다" : k > 1.5 ? "1보다 훨씬 크면 1마이크로초 만에 폭발 (폭탄)" : "1보다 조금만 커도 점점 커져 제어봉으로 조절해야 한다");
    });
  });

  // 3-1 화소가 보이는가: 화소 밀도 ppi, 보는 거리 cm, 시력 1′
  Q.def("hist-pixel", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ppi, dcm }) => {
      clear(g);
      const pitch = 25.4 / ppi, ang = Math.atan(pitch / (dcm * 10)) * 180 / Math.PI * 60, need = 25.4 / (dcm * 10 * Math.tan(Math.PI / 180 / 60));
      for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) { const s = Math.max(2, Math.min(18, ang * 10)); el("rect", { x: 40 + i * (s + 1), y: 40 + j * (s + 1), width: s, height: s, class: (i + j) % 3 ? "lb" : "lc" }, g); }
      txt(g, 300, 70, `화소 하나 ${num(pitch, 3)} mm`, "s"); txt(g, 300, 95, `보이는 각 ${num(ang, 2)}′`, "s"); txt(g, 300, 120, ang > 1 ? "점이 하나하나 보인다" : "점이 녹아 매끈하게 보인다", ang > 1 ? "s td" : "s tb");
      read.textContent = `${ppi} ppi 화면을 ${dcm} cm에서 보면 화소 하나가 ${num(ang, 2)}′ (사람 눈의 구별 한계 약 1′). 이 거리에서 점이 안 보이려면 약 ${num(need, 0)} ppi 이상`;
    });
  });

  // 3-2 양자 도약의 크기: 수소 전이 n → 1
  Q.def("hist-leap", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const eV = 13.6 * (1 - 1 / (n * n)), J = eV * 1.602e-19, apple = 0.1 * 9.8 * 1;
      const rows = [["수소의 양자 도약", J], ["모기의 날갯짓 한 번 (어림)", 1e-7], ["사과가 1 m 떨어짐", apple]];
      rows.forEach(([nm, e], i) => bar(g, 40 + i * 44, (Math.log10(e) + 20) * 14, i === 0 ? "lc" : "lk", nm, `${e.toExponential(1)} J`));
      read.textContent = `수소 전자가 n = ${n}에서 1로: ${num(eV, 2)} eV = ${J.toExponential(2)} J. 사과가 1 m 떨어지는 에너지의 약 ${num((apple / J) / 10 ** Math.floor(Math.log10(apple / J)), 0)} × 10^${Math.floor(Math.log10(apple / J))}분의 1. 과학에서 양자 도약은 '가장 작은 단위의 불연속적 변화'이다`;
    });
  });

  // 3-3 피타고라스 음률: 완전 5도를 쌓은 횟수 k
  Q.def("hist-tune", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      let r = 1.5 ** k; while (r >= 2) r /= 2;
      const cents = 1200 * Math.log2(r), et = (700 * k) % 1200, diff = cents - et;
      const X = (c) => 50 + c / 1200 * 430;
      Q.line(g, X(0), 120, X(1200), 120, "ax");
      for (let i = 0; i <= 12; i++) { Q.line(g, X(i * 100), 112, X(i * 100), 128, "gd"); }
      for (let j = 0; j <= k; j++) { let rr = 1.5 ** j; while (rr >= 2) rr /= 2; Q.dot(g, X(1200 * Math.log2(rr)), 120, j === k ? "fd" : "fb", j === k ? 6 : 3.5); }
      txt(g, X(0), 150, "도", "s", "middle"); txt(g, X(1200), 150, "옥타브 위 도", "s", "middle");
      read.textContent = `5도를 ${k}번 쌓아 옥타브 안으로 접으면 진동수 비 ${num(r, 4)} (${num(cents, 1)} 센트), 평균율 ${et} 센트와 ${num(diff, 1)} 센트 차이` + (k === 12 ? ". 12번 쌓으면 처음 음보다 23.5 센트 높아 딱 맞지 않는다 (피타고라스 콤마)" : "");
    });
  });

  // 3-4 좁은 세상: 한 사람이 아는 사람 수 k
  Q.def("hist-small", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const N = 8e9, d = Math.log(N) / Math.log(k);
      const F = frame(g, 10, 1000, 0, 10, [100, 2]); ticks(g, F, [10, 200, 400, 600, 800, 1000], [0, 2, 4, 6, 8, 10]);
      txt(g, 490, 200, "한 사람이 아는 사람 수", "s", "end"); txt(g, 66, 26, "80억 명에 닿는 단계 수", "s");
      Q.plot(g, F, (x) => Math.log(N) / Math.log(x), "b", 10, 1000, 200);
      Q.dot(g, F.x(k), F.y(d), "fd", 5);
      read.textContent = `한 사람이 ${k}명을 알면 ${k}, ${k}², ${k}³ … 으로 늘어 ${num(d, 1)}단계면 80억 명에 닿는다 (아는 사람이 겹치지 않는다는 어림)`;
    });
  });

  // 3-5 가상 현실의 지연: 고개 돌리는 속도 w (°/s), 지연 ms
  Q.def("hist-lag", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w, ms }) => {
      clear(g);
      const err = w * ms / 1000, px = err * 20;
      el("rect", { x: 100, y: 50, width: 120, height: 90, class: "lk" }, g);
      el("rect", { x: 100 + Math.min(200, px), y: 50, width: 120, height: 90, class: "gd" }, g);
      txt(g, 100, 160, `화면이 ${num(err, 2)}° (화소 약 ${num(px, 0)}개) 뒤처짐`, "s", err > 0.5 ? "td" : "");
      read.textContent = `고개를 ${w}°/s로 돌릴 때 지연 ${ms} ms: 가상 세계가 ${num(err, 2)}° 늦게 따라온다. 지연을 20 ms 아래로 줄여야 어지러움이 적다고 알려져 있다`;
    });
  });

  // 3-6 위험의 가치 판단: 큰 재난을 더 무겁게 보는 정도 al
  Q.def("hist-risk", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ al }) => {
      clear(g);
      const A = 1 * 1 ** al, B = 0.001 * 1000 ** al;
      bar(g, 50, A * 60, "lb", "A: 해마다 1명 (확실)", num(A, 1), 220);
      bar(g, 100, Math.min(260, B * 60), "ld", "B: 1/1000 확률로 1000명", num(B, 1), 220);
      txt(g, 220, 160, `기댓값은 둘 다 1명, 느끼는 위험 비 B/A = ${num(B / A, 1)}`, "s");
      read.textContent = `큰 재난 가중 지수 ${num(al, 2)}: B가 A보다 ${num(B / A, 1)}배 위험하게 느껴진다. 같은 자료라도 무엇을 더 무겁게 보느냐에 따라 결론이 갈린다`;
    });
  });
})();
