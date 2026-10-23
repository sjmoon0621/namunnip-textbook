/* 고급 지구과학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st) => { const F = Q.frame(x0, x1, y0, y1, 60, 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const axl = (g, a, b) => { txt(g, 490, 200, a, "s", "end"); txt(g, 66, 26, b, "s"); };
  const path = (g, pts, cls) => { let d = ""; pts.forEach(([x, y], i) => { d += (i ? "L" : "M") + x + " " + y; }); return el("path", { d, class: cls }, g); };
  const D = Math.PI / 180;

  // 1-1 모호로비치치 불연속면: 지각 두께 h (km), 지각 6.0 km/s, 맨틀 8.0 km/s
  Q.def("adearth-moho", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ h }) => {
      clear(g);
      const v1 = 6, v2 = 8, ic = Math.asin(v1 / v2), td = (x) => x / v1, th = (x) => x / v2 + 2 * h * Math.cos(ic) / v1;
      const xc = 2 * h * Math.sqrt((v2 + v1) / (v2 - v1));
      const F = frame(g, 0, 400, 0, 60, [50, 10]); ticks(g, F, [0, 100, 200, 300, 400], [0, 20, 40, 60]); axl(g, "진앙 거리 (km)", "P파 도착 시간 (s)");
      Q.plot(g, F, td, "b", 0, 400, 50); Q.plot(g, F, (x) => (x > 2 * h * Math.tan(ic) ? th(x) : NaN), "c", 0, 400, 200);
      Q.dot(g, F.x(xc), F.y(td(xc)), "fd", 5);
      read.textContent = `지각 두께 ${h} km: 임계각 ${num(ic / D, 1)}°. 맨틀을 따라 온 굴절파(주황)가 진앙 거리 ${num(xc, 0)} km부터 직접파(파랑)를 앞지른다. 교차 거리 = 2h√((v₂+v₁)/(v₂−v₁))`;
    });
  });

  // 1-2 묻힌 구의 중력 이상: 깊이 z (m), 밀도 차 dr (g/cm³), 반지름 50 m
  Q.def("adearth-grav", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ z, dr }) => {
      clear(g);
      const G = 6.674e-11, R = 50, dm = 4 / 3 * Math.PI * R ** 3 * dr * 1000, gz = (x) => G * dm * z / (x * x + z * z) ** 1.5 * 1e5; // mGal
      const F = frame(g, -500, 500, -1, 1, [100, 0.25]); ticks(g, F, [-500, -250, 0, 250, 500], [-1, -0.5, 0, 0.5, 1]); axl(g, "수평 거리 (m)", "중력 이상 (mGal)");
      Q.line(g, F.x(-500), F.y(0), F.x(500), F.y(0), "gd");
      Q.plot(g, F, (x) => Math.max(-1, Math.min(1, gz(x))), dr >= 0 ? "b" : "c", -500, 500, 200);
      read.textContent = `깊이 ${z} m, 밀도 차 ${num(dr, 1)} g/cm³: 바로 위에서 ${num(gz(0), 3)} mGal. 이상의 폭(최댓값의 절반이 되는 곳 사이)이 약 ${num(2 * 0.766 * z, 0)} m라서 폭으로 깊이를 어림한다`;
    });
  });

  // 1-3 고지자기 복각과 고위도: 복각 I (°)
  Q.def("adearth-incl", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ I }) => {
      clear(g);
      const lat = Math.atan(Math.tan(I * D) / 2) / D;
      const F = frame(g, 0, 90, 0, 90, [10, 10]); ticks(g, F, [0, 30, 60, 90], [0, 30, 60, 90]); axl(g, "위도 (°)", "복각 (°)");
      Q.plot(g, F, (l) => Math.atan(2 * Math.tan(l * D)) / D, "b", 0, 89.9, 200);
      Q.dot(g, F.x(lat), F.y(I), "fd", 5);
      read.textContent = `암석의 복각 ${I}°: tan I = 2 tan λ에서 그 암석이 생길 때의 위도 약 ${num(lat, 1)}°. 지금 위도와 다르면 그 땅이 그만큼 남북으로 움직였다`;
    });
  });

  // 1-4 해양 지각의 나이와 수심: 나이 t (백만 년)
  Q.def("adearth-depth", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const d = (a) => 2.5 + 0.35 * Math.sqrt(a), q = (a) => 480 / Math.sqrt(Math.max(a, 0.5));
      const F = frame(g, 0, 150, 0, 7, [25, 1]); ticks(g, F, [0, 50, 100, 150], [0, 2, 4, 6]); axl(g, "해양 지각의 나이 (백만 년)", "수심 (km, 아래로 깊음)");
      Q.plot(g, F, (a) => 7 - d(a), "b", 0, 150, 200);
      Q.dot(g, F.x(t), F.y(7 - d(t)), "fd", 5);
      read.textContent = `나이 ${t}백만 년: 수심 약 ${num(d(t), 2)} km, 지각 열류량 약 ${num(q(t), 0)} mW/m². 판이 해령에서 멀어지며 식고 수축하여 √t에 비례해 깊어진다(모형)`;
    });
  });

  // 1-5 감람석 고용체의 밀도: 철 성분 비율 x (Fa 몰분율)
  Q.def("adearth-ol", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const rho = 3.22 + (4.39 - 3.22) * x, M = 140.7 + (203.8 - 140.7) * x;
      bar(g, 50, (rho - 3) * 200, "lb", "밀도", `${num(rho, 2)} g/cm³`);
      bar(g, 95, (M - 120) * 2.5, "lc", "몰질량 (화학식 하나)", `${num(M, 1)} g/mol`);
      read.textContent = `(Mg${num(1 - x, 2)}Fe${num(x, 2)})₂SiO₄: Fe²⁺가 Mg²⁺ 자리를 ${num(x * 100, 0)}% 채워 밀도 ${num(rho, 2)} g/cm³. 크기가 비슷한 두 이온이 같은 자리를 나누어 쓰는 고용체라 성질이 조성에 따라 연속적으로 변한다`;
    });
  });

  // 1-6 복굴절과 간섭색: 복굴절 값 dn, 재물대 회전각 a (°), 두께 30 μm
  Q.def("adearth-biref", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dn, a }) => {
      clear(g);
      const R = 30000 * dn, I = (lam) => Math.sin(2 * a * D) ** 2 * Math.sin(Math.PI * R / lam) ** 2;
      const F = frame(g, 400, 700, 0, 1, [50, 0.25]); ticks(g, F, [400, 500, 600, 700], [0, 0.5, 1]); axl(g, "빛의 파장 (nm)", "직교 니콜에서의 밝기");
      Q.plot(g, F, I, "b", 400, 700, 300);
      read.textContent = `복굴절 ${num(dn, 3)}, 두께 30 μm: 지연 ${num(R, 0)} nm (${R < 550 ? "1차" : R < 1100 ? "2차" : R < 1650 ? "3차" : "고차"} 간섭색). 회전각 ${a}°에서 밝기 계수 sin²2θ = ${num(Math.sin(2 * a * D) ** 2, 2)}, 0°와 90°에서 소광`;
    });
  });

  // 1-7 감압 용융: 맨틀의 잠재 온도 Tp (°C)
  Q.def("adearth-melt", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ Tp }) => {
      clear(g);
      const sol = (z) => 1120 + 4.0 * z - 0.006 * z * z, ad = (z) => Tp + 0.4 * z;
      let zc = 0; for (let z = 0; z <= 200; z += 0.5) if (ad(z) >= sol(z)) { zc = z; }
      const F = frame(g, 1000, 1900, 0, 200, [100, 25]);
      for (const x of [1000, 1200, 1400, 1600, 1800]) txt(g, F.x(x), 220, `${x}`, "s", "middle");
      for (const y of [0, 50, 100, 150, 200]) txt(g, F.X0 - 5, F.y(200 - y) + 4, `${y}`, "s", "end");
      txt(g, 490, 200, "온도 (°C)", "s", "end"); txt(g, 66, 26, "깊이 (km, 아래로 깊음)", "s");
      const p1 = [], p2 = []; for (let z = 0; z <= 200; z += 2) { p1.push([F.x(sol(z)), F.y(200 - z)]); p2.push([F.x(ad(z)), F.y(200 - z)]); }
      path(g, p1, "c"); path(g, p2, "b");
      if (zc > 0) Q.dot(g, F.x(ad(zc)), F.y(200 - zc), "fd", 5);
      read.textContent = `잠재 온도 ${Tp} °C의 맨틀이 솟아오르면 ` + (zc > 0 ? `깊이 약 ${num(zc, 0)} km에서 고상선(주황)을 넘어 녹기 시작한다. 뜨거울수록 깊은 곳부터 녹아 마그마가 많이 생긴다` : "고상선에 닿지 않아 녹지 않는다") + "(모형)";
    });
  });

  // 1-8 Rb–Sr 등시선: 나이 t (억 년)
  Q.def("adearth-iso", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const S = [0.2, 0.8, 1.5, 2.3, 3.0];
    Q.bind(fig, ({ t }) => {
      clear(g);
      const lam = 1.42e-11, m = Math.exp(lam * t * 1e8) - 1, i0 = 0.704;
      const F = frame(g, 0, 3.5, 0.7, 0.8, [0.5, 0.02]); ticks(g, F, [0, 1, 2, 3], [0.7, 0.72, 0.74, 0.76, 0.78, 0.8]); axl(g, "⁸⁷Rb/⁸⁶Sr", "⁸⁷Sr/⁸⁶Sr");
      Q.plot(g, F, (x) => Math.min(0.8, i0 + m * x), "b", 0, 3.5, 20);
      Q.line(g, F.x(0), F.y(i0), F.x(3.5), F.y(i0), "gd");
      for (const x of S) Q.dot(g, F.x(x), F.y(Math.min(0.8, i0 + m * x)), "fk", 4);
      read.textContent = `${num(t, 1)}억 년 전에 굳은 광물들: 등시선의 기울기 e^{λt} − 1 = ${num(m, 4)}, y절편 0.704가 처음 Sr 비. 기울기에서 나이 t = ln(1 + 기울기)/λ`;
    });
  });

  // 1-9 화석의 생존 범위 겹치기: 찾은 화석의 수 n (1~3)
  const FOS = [["삼엽충 A종", 485, 359], ["완족류 B종", 420, 300], ["산호 C종", 380, 330]];
  Q.def("adearth-range", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const F = Q.frame(500, 280, 0, 4, 140, 490, 15, 175);
      for (const x of [500, 450, 400, 350, 300]) { txt(g, F.x(x), 195, `${x}`, "s", "middle"); Q.line(g, F.x(x), 20, F.x(x), 180, "gd"); }
      txt(g, 490, 212, "백만 년 전", "s", "end");
      let lo = 0, hi = 1e9;
      FOS.forEach(([nm, a, b], i) => { const y = 30 + i * 40; const on = i < n; el("rect", { x: F.x(a), y, width: F.x(b) - F.x(a), height: 20, class: on ? "lb" : "lk" }, g); txt(g, 132, y + 15, nm, "s", "end"); if (on) { hi = Math.min(hi, a); lo = Math.max(lo, b); } });
      el("rect", { x: F.x(hi), y: 20, width: Math.max(1, F.x(lo) - F.x(hi)), height: 160, class: "la" }, g);
      read.textContent = `화석 ${n}종이 함께 나오면 지층의 나이는 ${hi}~${lo}백만 년 전 (폭 ${hi - lo}백만 년). 생존 범위가 겹치는 구간만 남는다`;
    });
  });

  // 1-10 겉보기 경사: 진경사 δ (°), 단면과 주향 사이의 각 β (°)
  Q.def("adearth-dip", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d, b }) => {
      clear(g);
      const ap = (bb) => Math.atan(Math.tan(d * D) * Math.sin(bb * D)) / D;
      const F = frame(g, 0, 90, 0, 90, [10, 10]); ticks(g, F, [0, 30, 60, 90], [0, 30, 60, 90]); axl(g, "단면이 주향과 이루는 각 (°)", "겉보기 경사 (°)");
      Q.plot(g, F, ap, "b", 0, 90, 200);
      Q.dot(g, F.x(b), F.y(ap(b)), "fd", 5);
      read.textContent = `진경사 ${d}°인 지층을 주향과 ${b}°를 이루는 단면에서 보면 겉보기 경사 ${num(ap(b), 1)}° (tan α = tan δ sin β). 경사 방향(90°)에서만 진경사가 보이고, 주향 방향(0°)에서는 수평으로 보인다`;
    });
  });

  // 1-11 저어콘 U–Pb 나이: ²⁰⁶Pb/²³⁸U 비 R
  const KOR = [["경기 육괴 편마암", 1.9e9], ["대보 화강암", 1.7e8], ["경상 분지 퇴적층", 1.0e8], ["제주도 현무암", 1.0e6]];
  Q.def("adearth-upb", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const lam = 1.55125e-10, age = (R) => Math.log(1 + R) / lam;
    Q.bind(fig, ({ R }) => {
      clear(g);
      const F = frame(g, 0, 0.4, 0, 2.5, [0.05, 0.5]); ticks(g, F, [0, 0.1, 0.2, 0.3, 0.4], [0, 0.5, 1, 1.5, 2, 2.5]); axl(g, "²⁰⁶Pb/²³⁸U", "나이 (10억 년)");
      Q.plot(g, F, (r) => age(r) / 1e9, "b", 0, 0.4, 100);
      KOR.forEach(([nm, t], i) => { const r = Math.exp(lam * t) - 1; Q.dot(g, F.x(r), F.y(t / 1e9), "fk", 4); if (i === 0) txt(g, F.x(r) - 6, F.y(t / 1e9) - 8, nm, "s", "end"); });
      const t = age(R);
      Q.dot(g, F.x(R), F.y(t / 1e9), "fd", 5);
      read.textContent = `²⁰⁶Pb/²³⁸U = ${num(R, 4)}: 나이 ${t >= 1e8 ? num(t / 1e8, 1) + "억 년" : num(t / 1e4, 0) + "만 년"}. 한반도의 암석: ` + KOR.map(([nm, a]) => `${nm} ${a >= 1e9 ? num(a / 1e8, 0) + "억" : a >= 1e8 ? num(a / 1e8, 1) + "억" : num(a / 1e4, 0) + "만"} 년`).join(", ");
    });
  });

  // 2-1 응결만으로 자라는 물방울: 목표 반지름 r (μm)
  Q.def("adearth-drop", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const K = 5e-13, r0 = 1e-6, t = ((r * 1e-6) ** 2 - r0 * r0) / (2 * K);
      const F = frame(g, 0, 100, 0, 3, [10, 0.5]); ticks(g, F, [0, 20, 40, 60, 80, 100], [0, 1, 2, 3]); axl(g, "물방울 반지름 (μm)", "응결로 자라는 데 걸리는 시간 (시간)");
      Q.plot(g, F, (x) => Math.min(3, ((x * 1e-6) ** 2 - r0 * r0) / (2 * K) / 3600), "b", 1, 100, 200);
      Q.dot(g, F.x(Math.min(100, r)), F.y(Math.min(3, t / 3600)), "fd", 5);
      const n = (1000 / r) ** 3;
      read.textContent = `반지름 ${r} μm까지 응결로만 자라는 데 약 ${t < 3600 ? num(t / 60, 0) + "분" : num(t / 3600, 1) + "시간"} (r² ∝ t). 빗방울(1 mm)이 되려면 이 크기의 물방울 약 ${n >= 1e4 ? num(n / 1e4, 0) + "만" : num(n, 0)}개가 합쳐져야 한다`;
    });
  });

  // 2-2 상승 응결 고도와 어는 고도: 지상 기온 T, 이슬점 Td (°C)
  Q.def("adearth-lcl", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T, Td }) => {
      clear(g);
      const td = Math.min(Td, T), zl = 125 * (T - td), Tl = T - 9.8 * zl / 1000, zf = zl + Math.max(0, Tl) / 6.5 * 1000;
      const F = frame(g, -30, 40, 0, 8000, [10, 1000]); ticks(g, F, [-30, -10, 10, 30], [0, 2000, 4000, 6000, 8000]); axl(g, "기온 (°C)", "높이 (m)");
      path(g, [[F.x(T), F.y(0)], [F.x(Tl), F.y(zl)]], "c");
      path(g, [[F.x(Tl), F.y(zl)], [F.x(Tl - 6.5 * (8000 - zl) / 1000), F.y(8000)]], "b");
      path(g, [[F.x(td), F.y(0)], [F.x(Tl), F.y(zl)]], "gd");
      Q.dot(g, F.x(Tl), F.y(zl), "fd", 5);
      read.textContent = `지상 ${T} °C, 이슬점 ${td} °C: 공기 덩이가 건조 단열(주황)로 식어 약 ${num(zl, 0)} m에서 포화, 구름 바닥. 그 위는 습윤 단열(파랑, 약 6.5 °C/km)로 식어 약 ${num(zf, 0)} m에서 0 °C에 이른다`;
    });
  });

  // 2-3 로스비 수: 흐름의 크기 L (10^lg m), 속력 U (m/s), 위도 35°
  Q.def("adearth-ro", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lg, U }) => {
      clear(g);
      const f = 2 * 7.292e-5 * Math.sin(35 * D), L = 10 ** lg, Ro = U / (f * L);
      const F = frame(g, -1, 7, -3, 6, [1, 1]);
      for (const [x, s] of [[-1, "10 cm"], [1, "10 m"], [3, "1 km"], [5, "100 km"], [7, "10000 km"]]) txt(g, F.x(x), 220, s, "s", "middle");
      for (const y of [-2, 0, 2, 4, 6]) txt(g, F.X0 - 5, F.y(y) + 4, `10^${y}`, "s", "end");
      Q.line(g, F.x(-1), F.y(0), F.x(7), F.y(0), "c");
      Q.plot(g, F, (x) => Math.log10(U / (f * 10 ** x)), "b", -1, 7, 50);
      Q.dot(g, F.x(lg), F.y(Math.log10(Ro)), "fd", 5);
      txt(g, F.x(7) - 4, F.y(0) - 6, "Ro = 1", "s", "end");
      read.textContent = `크기 ${L >= 1000 ? num(L / 1000, L >= 1e4 ? 0 : 1) + " km" : num(L, L < 1 ? 1 : 0) + " m"}, 속력 ${U} m/s: 로스비 수 U/(fL) = ${Ro >= 100 ? num(Ro, 0) : num(Ro, 2)}. ` + (Ro > 10 ? "전향력은 무시해도 된다" : Ro < 0.3 ? "전향력이 운동을 지배한다 (지균 균형)" : "관성과 전향력이 함께 중요하다");
    }, (k, v) => { const L = 10 ** v; return L >= 1000 ? num(L / 1000, L >= 1e4 ? 0 : 1) + " km" : num(L, L < 1 ? 1 : 0) + " m"; });
  });

  // 2-4 경도풍: 곡률 반지름 R (km), 기압 경도력 G (10⁻³ m/s²), 위도 35°
  Q.def("adearth-grad", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ R, G }) => {
      clear(g);
      const f = 2 * 7.292e-5 * Math.sin(35 * D), r = R * 1000, gg = G * 1e-3, vg = gg / f;
      const vc = -f * r / 2 + Math.sqrt(f * f * r * r / 4 + r * gg), disc = f * f * r * r / 4 - r * gg, va = disc >= 0 ? f * r / 2 - Math.sqrt(disc) : NaN;
      bar(g, 40, vg * 4, "lk", "지균풍", `${num(vg, 1)} m/s`);
      bar(g, 80, vc * 4, "lb", "저기압 둘레 경도풍", `${num(vc, 1)} m/s`);
      bar(g, 120, isNaN(va) ? 1 : va * 4, "lc", "고기압 둘레 경도풍", isNaN(va) ? "불가능 (경도력이 너무 큼)" : `${num(va, 1)} m/s`);
      read.textContent = `곡률 반지름 ${R} km, 기압 경도력 ${num(G, 1)} × 10⁻³ m/s²: 같은 경도력에서 저기압 둘레 바람은 지균풍보다 약하고 고기압 둘레 바람은 강하다. 고기압 중심 근처는 경도가 클 수 없어 바람이 약하다`;
    });
  });

  // 2-5 각운동량 보존과 아열대 제트: 적도에서 정지한 공기가 옮겨 간 위도 φ (°)
  Q.def("adearth-ang", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const Om = 7.292e-5, a = 6.371e6, u = (ph) => Om * a * Math.sin(ph * D) ** 2 / Math.cos(ph * D);
      const F = frame(g, 0, 40, 0, 250, [5, 50]); ticks(g, F, [0, 10, 20, 30, 40], [0, 50, 100, 150, 200, 250]); axl(g, "위도 (°)", "서풍의 속력 (m/s)");
      Q.plot(g, F, (ph) => Math.min(250, u(ph)), "b", 0, 40, 200);
      Q.line(g, F.x(0), F.y(40), F.x(40), F.y(40), "gd");
      Q.dot(g, F.x(p), F.y(Math.min(250, u(p))), "fd", 5);
      read.textContent = `적도에서 정지해 있던 공기가 각운동량을 보존하며 위도 ${p}°로 가면 서풍 ${num(u(p), 0)} m/s. 실제 아열대 제트(회색 근처 40 m/s)보다 훨씬 커서, 해들리 순환은 그 전에 불안정해져 끊긴다`;
    });
  });

  // 2-6 바닷속 음속과 소파 채널: 표층 수온 Ts (°C)
  Q.def("adearth-sofar", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ Ts }) => {
      clear(g);
      const T = (z) => 2 + (Ts - 2) * Math.exp(-z / 600), c = (z) => { const t = T(z); return 1449.2 + 4.6 * t - 0.055 * t * t + 0.00029 * t ** 3 + 0.016 * z; };
      let zm = 0, cm = 1e9; for (let z = 0; z <= 4000; z += 10) if (c(z) < cm) { cm = c(z); zm = z; }
      const F = frame(g, 1470, 1550, 0, 4000, [10, 500]);
      for (const x of [1480, 1500, 1520, 1540]) txt(g, F.x(x), 220, `${x}`, "s", "middle");
      for (const y of [0, 1000, 2000, 3000, 4000]) txt(g, F.X0 - 5, F.y(4000 - y) + 4, `${y}`, "s", "end");
      txt(g, 490, 200, "음속 (m/s)", "s", "end"); txt(g, 66, 26, "깊이 (m, 아래로 깊음)", "s");
      const pts = []; for (let z = 0; z <= 4000; z += 20) pts.push([F.x(c(z)), F.y(4000 - z)]); path(g, pts, "b");
      Q.dot(g, F.x(cm), F.y(4000 - zm), "fd", 5);
      read.textContent = `표층 ${Ts} °C: 음속이 가장 느린 깊이 약 ${num(zm, 0)} m (${num(cm, 0)} m/s). 위에서는 수온이, 아래에서는 수압이 음속을 키워, 그 깊이로 소리가 모여 멀리 간다(모형)`;
    });
  });

  // 2-7 폭풍 해일: 바람 속력 U (m/s), 대륙붕 수심 h (m), 중심 기압 강하 dp (hPa)
  Q.def("adearth-surge", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ U, h, dp }) => {
      clear(g);
      const tau = 1.2 * 2.5e-3 * U * U, Lsh = 100e3, wind = tau * Lsh / (1025 * 9.8 * h), baro = dp / 100;
      bar(g, 40, baro * 150, "lb", "기압 강하에 의한 상승", `${num(baro * 100, 0)} cm`);
      bar(g, 80, Math.min(300, wind * 150), "lc", "바람에 의한 쌓임", `${num(wind * 100, 0)} cm`);
      bar(g, 120, Math.min(300, (baro + wind) * 150), "ld", "합계", `${num((baro + wind) * 100, 0)} cm`);
      read.textContent = `바람 ${U} m/s, 폭 100 km 대륙붕 수심 ${h} m, 기압 강하 ${dp} hPa: 기압 1 hPa에 약 1 cm, 바람의 쌓임은 τL/(ρgh)로 얕을수록 커진다(모형)`;
    });
  });

  // 2-8 해수면 경사와 지형류: 경사 (100 km에 dh cm), 위도 φ
  Q.def("adearth-geo", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dh, p }) => {
      clear(g);
      const f = 2 * 7.292e-5 * Math.sin(p * D), v = 9.8 * (dh / 100) / 1e5 / f;
      const F = frame(g, 5, 60, 0, 3, [5, 0.5]); ticks(g, F, [10, 20, 30, 40, 50, 60], [0, 1, 2, 3]); axl(g, "위도 (°)", "지형류의 속력 (m/s)");
      Q.plot(g, F, (x) => Math.min(3, 9.8 * (dh / 100) / 1e5 / (2 * 7.292e-5 * Math.sin(x * D))), "b", 5, 60, 200);
      Q.dot(g, F.x(p), F.y(Math.min(3, v)), "fd", 5);
      read.textContent = `100 km에 ${dh} cm 기울어진 해수면, 위도 ${p}°: 지형류 v = (g/f)(Δη/Δx) ≈ ${num(v, 2)} m/s. 북반구에서는 높은 쪽을 오른쪽에 두고 흐른다`;
    });
  });

  // 2-9 스베르드럽 수송: 편서풍과 무역풍의 응력 τ₀ (N/m²)
  Q.def("adearth-sv", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ tau }) => {
      clear(g);
      const beta = 2e-11, Ly = 3e6, W = 1e7, V = tau * Math.PI / Ly / (1025 * beta), T = V * W / 1e6, ub = T * 1e6 / (1e5 * 1000);
      bar(g, 40, V * 30, "lk", "내부의 남북 수송 (폭 1 m당)", `${num(V, 1)} m²/s`);
      bar(g, 80, T * 3, "lb", "대양 전체 수송", `${num(T, 0)} Sv`);
      bar(g, 120, ub * 200, "lc", "서안 경계류 (폭 100 km, 깊이 1 km)", `${num(ub, 2)} m/s`);
      read.textContent = `바람 응력 ${num(tau, 2)} N/m²: 내부 바다는 β 효과로 천천히 남쪽으로 움직이고(스베르드럽 수송 ${num(T, 0)} Sv), 그 물이 폭 100 km 남짓한 서쪽 가장자리로 몰려 북쪽으로 ${num(ub, 2)} m/s로 돌아간다(모형)`;
    });
  });

  // 2-10 만의 공명: 만의 길이 L (km), 수심 h (m), 반일주조 12.42시간
  Q.def("adearth-bay", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ L, h }) => {
      clear(g);
      const Tn = 4 * L * 1000 / Math.sqrt(9.8 * h) / 3600, r = Tn / 12.42, amp = 1 / Math.sqrt((1 - r * r) ** 2 + (0.15 * r) ** 2);
      const F = frame(g, 0, 2, 0, 8, [0.25, 1]); ticks(g, F, [0, 0.5, 1, 1.5, 2], [0, 2, 4, 6, 8]); axl(g, "만의 고유 주기 ÷ 조석 주기", "조차 증폭 배율");
      Q.plot(g, F, (x) => Math.min(8, 1 / Math.sqrt((1 - x * x) ** 2 + (0.15 * x) ** 2)), "b", 0, 2, 300);
      Q.dot(g, F.x(Math.min(2, r)), F.y(Math.min(8, amp)), "fd", 5);
      read.textContent = `길이 ${L} km, 수심 ${h} m인 만: 고유 주기 4L/√(gh) = ${num(Tn, 1)}시간, 조석 주기의 ${num(r, 2)}배 → 조차가 약 ${num(amp, 1)}배로 커진다(마찰을 넣은 모형)`;
    });
  });

  // 2-11 지연 진동자 모형: 지연 δ (무차원), dT/dt = T − T³ − αT(t − δ)
  Q.def("adearth-enso", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d }) => {
      clear(g);
      const dt = 0.02, N = Math.round(60 / dt), lag = Math.round(d / dt), T = new Float64Array(N); for (let i = 0; i <= lag; i++) T[i] = 0.1;
      for (let i = lag; i < N - 1; i++) T[i + 1] = T[i] + dt * (T[i] - T[i] ** 3 - 0.75 * T[i - lag]);
      const zc = []; for (let i = Math.round(20 / dt); i < N - 1; i++) if (T[i] <= 0 && T[i + 1] > 0) zc.push(i * dt);
      const per = zc.length > 1 ? (zc[zc.length - 1] - zc[0]) / (zc.length - 1) : NaN;
      const F = frame(g, 0, 60, -1.5, 1.5, [10, 0.5]); ticks(g, F, [0, 20, 40, 60], [-1, 0, 1]); axl(g, "시간 (무차원)", "동태평양 수온 편차");
      Q.line(g, F.x(0), F.y(0), F.x(60), F.y(0), "gd");
      const pts = []; for (let i = 0; i < N; i += 10) pts.push([F.x(i * dt), F.y(Math.max(-1.5, Math.min(1.5, T[i])))]); path(g, pts, "b");
      read.textContent = `지연 ${num(d, 1)}: ` + (isNaN(per) ? "진동이 생기지 않는다" : `주기 약 ${num(per, 1)} (지연의 ${num(per / d, 1)}배)의 진동`) + `. 바람이 만든 해양 파동이 대양을 건너 돌아오는 지연이 엘니뇨와 라니냐를 번갈아 일으킨다(모형)`;
    });
  });

  // 3-1 항성일과 태양일: 지난 날수 n
  Q.def("adearth-sid", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const m = 3.9343 * n, h = Math.floor(m / 60), mm = m - 60 * h;
      const F = frame(g, 0, 365, 0, 24, [30, 4]); ticks(g, F, [0, 90, 180, 270, 365], [0, 6, 12, 18, 24]); axl(g, "지난 날수", "같은 별이 일찍 남중하는 시간 (시)");
      Q.plot(g, F, (x) => 3.9343 * x / 60, "b", 0, 365, 50);
      Q.dot(g, F.x(n), F.y(m / 60), "fd", 5);
      read.textContent = `${n}일 뒤 같은 별은 ${h}시간 ${num(mm, 0)}분 일찍 남중한다. 지구가 공전으로 하루에 약 1°씩 돌아, 태양일(24시간)이 항성일(23시간 56분 4초)보다 3분 56초 길다`;
    });
  });

  // 3-2 회합 주기: 외행성의 공전 주기 P (년)
  Q.def("adearth-syn", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ P }) => {
      clear(g);
      const S = 1 / Math.abs(1 - 1 / P), a = P ** (2 / 3);
      const F = frame(g, 1, 30, 0, 4, [5, 0.5]); ticks(g, F, [1, 5, 10, 15, 20, 25, 30], [0, 1, 2, 3, 4]); axl(g, "공전 주기 (년)", "회합 주기 (년)");
      Q.plot(g, F, (x) => Math.min(4, 1 / Math.abs(1 - 1 / x)), "b", 1.05, 30, 300);
      Q.dot(g, F.x(P), F.y(Math.min(4, S)), "fd", 5);
      read.textContent = `공전 주기 ${num(P, 2)}년인 외행성: 회합 주기 1/(1 − 1/P) = ${num(S, 2)}년, 궤도 긴반지름 ${num(a, 2)} AU (케플러 제3법칙). 화성(1.88년)은 약 2.14년마다 충이 된다`;
    });
  });

  // 3-3 연주 시차의 오차와 거리: 연주 시차 p (밀리초), 측정 오차 0.02 mas
  Q.def("adearth-plx", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lp }) => {
      clear(g);
      const p = 10 ** lp, d = 1000 / p, e = 0.02 / p;
      const F = frame(g, -1, 2, 0, 50, [0.5, 10]);
      for (const [x, s] of [[-1, "0.1"], [0, "1"], [1, "10"], [2, "100"]]) txt(g, F.x(x), 220, s, "s", "middle");
      ticks(g, F, [], [0, 10, 20, 30, 40, 50]); axl(g, "연주 시차 (밀리초, 로그 눈금)", "거리의 상대 오차 (%)");
      Q.plot(g, F, (x) => Math.min(50, 2 / 10 ** x), "b", -1, 2, 100);
      Q.dot(g, F.x(lp), F.y(Math.min(50, e * 100)), "fd", 5);
      read.textContent = `시차 ${num(p, p < 1 ? 2 : 1)} 밀리초: 거리 ${d >= 1000 ? num(d / 1000, 1) + " kpc" : num(d, 0) + " pc"}, 오차 ±0.02 밀리초면 거리 오차 약 ${num(e * 100, 1)}%. 먼 별일수록 시차가 작아 같은 오차가 크게 번진다`;
    }, (k, v) => num(10 ** v, v < 0 ? 2 : 1));
  });

  // 3-4 발머 흡수선의 세기와 온도: 표면 온도 T (K), 전자 압력 20 N/m²
  Q.def("adearth-balmer", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const k = 1.380649e-23, eV = 1.602e-19, me = 9.109e-31, h = 6.626e-34, Pe = 20;
    const f2 = (T) => { const b = 4 * Math.exp(-10.2 * eV / (k * T)); const s = (2 * k * T / Pe) * 0.5 * (2 * Math.PI * me * k * T / (h * h)) ** 1.5 * Math.exp(-13.6 * eV / (k * T)); return (b / (1 + b)) / (1 + s); };
    let mx = 0; for (let T = 4000; T <= 25000; T += 50) mx = Math.max(mx, f2(T));
    Q.bind(fig, ({ T }) => {
      clear(g);
      const F = frame(g, 4000, 25000, 0, 1, [3000, 0.25]); ticks(g, F, [5000, 10000, 15000, 20000, 25000], [0, 0.5, 1]); axl(g, "표면 온도 (K)", "n = 2 수소의 상대량 (최대 = 1)");
      Q.plot(g, F, (x) => f2(x) / mx, "b", 4000, 25000, 300);
      Q.dot(g, F.x(T), F.y(f2(T) / mx), "fd", 5);
      read.textContent = `${T} K: 발머 흡수선을 만드는 n = 2 수소가 최대의 ${num(f2(T) / mx * 100, 0)}%. 낮으면 들뜬 원자가 적고, 높으면 이온화되어 사라져 약 1만 K(A형 별)에서 가장 강하다(볼츠만·사하 식)`;
    });
  });

  // 3-5 별의 질량과 수명, 중심 온도: 질량 M (태양 = 1)
  Q.def("adearth-msl", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lm }) => {
      clear(g);
      const M = 10 ** lm, life = 1e10 * M ** -2.5, Tc = 1.5e7 * M ** 0.2, L = M ** 3.5;
      bar(g, 30, (Math.log10(L) + 3) * 35, "lc", "광도 (태양 = 1)", L >= 100 ? num(L, 0) : num(L, 3));
      bar(g, 70, Tc / 1e6 * 6, "lb", "중심 온도 (어림)", `${num(Tc / 1e6, 1)}백만 K`);
      bar(g, 110, (Math.log10(life) - 5) * 35, "lk", "주계열 수명", life >= 1e8 ? `${num(life / 1e8, 0)}억 년` : `${num(life / 1e6, 0)}백만 년`);
      read.textContent = `질량 ${num(M, 2)}배: 광도 ∝ M^3.5, 수명 ∝ M/L ∝ M^−2.5 → ${life >= 1e9 ? num(life / 1e8, 0) + "억" : num(life / 1e6, 0) + "백만"} 년. 무거운 별은 연료가 많지만 훨씬 빨리 태운다(어림)`;
    }, (k, v) => num(10 ** v, 2));
  });

  // 3-6 무거운 별의 연소 단계 (태양 질량 25배)
  const STG = [["수소", 7e6], ["헬륨", 8e5], ["탄소", 500], ["네온", 0.9], ["산소", 0.4], ["규소", 1 / 365]];
  const yfmt = (y) => (y >= 1e6 ? num(y / 1e6, 1) + "백만 년" : y >= 1e4 ? num(y / 1e4, 0) + "만 년" : y >= 1 ? num(y, 0) + "년" : y >= 1 / 12 ? num(y * 12, 0) + "개월" : num(y * 365, 0) + "일");
  Q.def("adearth-stages", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ s }) => {
      clear(g);
      STG.forEach(([nm, y], i) => bar(g, 5 + i * 33, (Math.log10(y) + 3) * 30, i === s ? "lc" : "lb", `${nm} 연소`, yfmt(y), 140));
      read.textContent = `${STG[s][0]} 연소: 약 ${yfmt(STG[s][1])}. 무거운 원소로 갈수록 핵자당 얻는 에너지가 줄고 중성미자로 새는 에너지가 늘어 단계마다 수명이 짧아진다(막대는 로그 길이, 대략값)`;
    }, (k, x) => STG[x][0]);
  });

  // 3-7 스트룀그렌 구: 이온화 광자 수 10^lq (개/s), 수소 밀도 n (개/cm³)
  Q.def("adearth-hii", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lq, n }) => {
      clear(g);
      const Qp = 10 ** lq, Rs = (3 * Qp / (4 * Math.PI * n * n * 2.6e-13)) ** (1 / 3) / 3.086e18;
      const rr = Math.min(95, 10 * Math.log10(1 + Rs) * 3 + 5);
      el("circle", { cx: 260, cy: 105, r: rr, class: "lc" }, g); Q.dot(g, 260, 105, "fk", 4);
      read.textContent = `광자 ${Qp.toExponential(0)}개/s, 수소 ${n}개/cm³: 스트룀그렌 반지름 (3Q/4πn²α)^(1/3) ≈ ${num(Rs, Rs < 1 ? 2 : 1)} pc. 그 안에서 이온화와 재결합이 균형을 이루며 붉은 Hα 빛을 낸다(원의 크기는 로그)`;
    });
  });

  // 3-8 우리은하의 회전 곡선과 질량: 중심 거리 r (kpc)
  Q.def("adearth-rot", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const vf = (x) => 230 * (1 - Math.exp(-x / 2)), vk = (x) => 230 * Math.sqrt(8 / x) * (1 - Math.exp(-4));
      const F = frame(g, 0, 30, 0, 300, [5, 50]); ticks(g, F, [0, 5, 10, 15, 20, 25, 30], [0, 100, 200, 300]); axl(g, "은하 중심에서의 거리 (kpc)", "회전 속력 (km/s)");
      Q.plot(g, F, vf, "b", 0, 30, 200); Q.plot(g, F, (x) => (x > 8 ? vk(x) : vf(x)), "gd", 0.1, 30, 200);
      Q.dot(g, F.x(r), F.y(vf(r)), "fd", 5);
      const M = (vf(r) * 1e3) ** 2 * r * 3.086e19 / 6.674e-11 / 1.989e30;
      read.textContent = `${r} kpc에서 회전 속력 ${num(vf(r), 0)} km/s → 그 안의 질량 v²r/G ≈ ${num(M / 1e10, 1)} × 10¹⁰ 태양 질량. 보이는 별만 있다면 회색처럼 바깥에서 느려져야 한다(모형)`;
    });
  });

  // 3-9 활동 은하핵: 밝기 변동 시간 10^lt (시간), 블랙홀 질량 10^lm (태양 질량)
  Q.def("adearth-agn", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lt, lm }) => {
      clear(g);
      const t = 10 ** lt * 3600, R = 3e8 * t / 1.496e11, M = 10 ** lm, Rs = 2 * 6.674e-11 * M * 1.989e30 / 9e16 / 1.496e11, LE = 1.26e31 * M / 3.828e26;
      bar(g, 40, (Math.log10(R) + 2) * 50, "lb", "빛이 건너는 크기 cΔt", `${num(R, R < 10 ? 1 : 0)} AU`);
      bar(g, 80, Math.max(1, (Math.log10(Rs) + 2) * 50), "lk", "슈바르츠실트 반지름", `${num(Rs, Rs < 10 ? 2 : 0)} AU`);
      bar(g, 120, (Math.log10(LE) - 8) * 40, "lc", "에딩턴 광도", `태양의 ${LE.toExponential(1)}배`);
      read.textContent = `밝기가 ${num(10 ** lt, 10 ** lt < 10 ? 1 : 0)}시간 만에 변하면 빛을 내는 곳은 ${num(R, 0)} AU보다 작다. 블랙홀 ${M.toExponential(0)} 태양 질량의 에딩턴 광도는 은하 전체(태양의 약 10¹⁰배)를 넘을 수 있다`;
    });
  });

  // 3-10 허블 상수와 우주의 나이 어림: H₀ (km/s/Mpc)
  Q.def("adearth-hub", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ H }) => {
      clear(g);
      const tH = 977.8 / H;
      const F = frame(g, 0, 400, 0, 30000, [50, 5000]); ticks(g, F, [0, 100, 200, 300, 400], [0, 10000, 20000, 30000]); axl(g, "거리 (Mpc)", "후퇴 속도 (km/s)");
      Q.plot(g, F, (d) => Math.min(30000, H * d), "b", 0, 400, 10);
      for (const [d, v] of [[50, 3700], [120, 8100], [200, 14500], [300, 21500], [380, 26000]]) Q.dot(g, F.x(d), F.y(v), "fk", 3);
      read.textContent = `H₀ = ${H} km/s/Mpc: 허블 시간 1/H₀ = ${num(tH * 10, 0)}억 년. 거리 = 후퇴 속도 ÷ H₀이므로 H₀가 크면 우주가 작고 젊다. 검은 점은 가상의 은하 자료`;
    });
  });

  // 3-11 평탄한 우주의 나이: 물질 밀도 매개변수 Ωm, H₀ = 70
  Q.def("adearth-age", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const age = (m) => { const tH = 977.8 / 70; if (m >= 0.999) return tH * 2 / 3; const l = 1 - m; return tH * (2 / (3 * Math.sqrt(l))) * Math.asinh(Math.sqrt(l / m)); };
    Q.bind(fig, ({ m }) => {
      clear(g);
      const F = frame(g, 0.05, 1, 8, 20, [0.1, 2]); ticks(g, F, [0.2, 0.4, 0.6, 0.8, 1], [8, 10, 12, 14, 16, 18, 20]); axl(g, "물질 밀도 매개변수 Ωm (평탄, 나머지는 암흑 에너지)", "우주의 나이 (10억 년)");
      Q.plot(g, F, age, "b", 0.05, 1, 200);
      Q.dot(g, F.x(m), F.y(age(m)), "fd", 5);
      read.textContent = `Ωm = ${num(m, 2)}, ΩΛ = ${num(1 - m, 2)}: 나이 ${num(age(m) * 10, 0)}억 년. 물질만 있으면(Ωm = 1) 약 93억 년으로 가장 오래된 별보다 젊어지고, 암흑 에너지가 있으면 나이가 늘어난다`;
    });
  });
})();
