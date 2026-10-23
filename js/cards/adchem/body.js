/* 고급 화학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const frame = (g, x0, x1, y0, y1, st) => { const F = Q.frame(x0, x1, y0, y1, 60, 490, 15, 205); Q.axes(g, F, { step: st || 1, label: false }); return F; };
  const ticks = (g, F, xs, ys) => { for (const x of xs) txt(g, F.x(x), 220, `${x}`, "s", "middle"); for (const y of ys) txt(g, F.X0 - 5, F.y(y) + 4, `${y}`, "s", "end"); };
  const bar = (g, y, w, cls, label, val, x0) => { const X = x0 || 170; el("rect", { x: X, y, width: Math.max(1, w), height: 22, class: cls }, g); txt(g, X - 8, y + 16, label, "s", "end"); txt(g, X + 6 + Math.max(1, w), y + 16, val, "s"); };
  const sbar = (g, y, v, sc, cls, label, val) => { const X = 300, w = v * sc; el("rect", { x: Math.min(X, X + w), y, width: Math.max(1, Math.abs(w)), height: 22, class: cls }, g); Q.line(g, X, y - 4, X, y + 26, "gd"); txt(g, 150, y + 16, label, "s", "end"); txt(g, w >= 0 ? X + w + 6 : X + 6, y + 16, val, "s"); };
  const axl = (g, a, b) => { txt(g, 490, 200, a, "s", "end"); txt(g, 66, 26, b, "s"); };
  const path = (g, pts, cls) => { let d = ""; pts.forEach(([x, y], i) => { d += (i ? "L" : "M") + x + " " + y; }); return el("path", { d, class: cls }, g); };
  const R = 8.314;
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (n) => String(n).split("").map((c) => SUP[+c]).join("");
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };

  // 1-1 수소 1s 오비탈의 동경 분포: 반지름 x = r/a₀
  Q.def("adchem-1s", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const P = (u) => 4 * u * u * Math.exp(-2 * u), Fc = (u) => 1 - Math.exp(-2 * u) * (1 + 2 * u + 2 * u * u);
      const F = frame(g, 0, 5, 0, 0.6, [0.5, 0.1]); ticks(g, F, [0, 1, 2, 3, 4, 5], [0, 0.2, 0.4, 0.6]); axl(g, "핵에서의 거리 r/a₀", "동경 확률 밀도");
      const pts = [[F.x(0), F.y(0)]]; for (let i = 0; i <= 80; i++) { const u = x * i / 80; pts.push([F.x(u), F.y(P(u))]); } pts.push([F.x(x), F.y(0)]);
      path(g, pts, "la");
      Q.plot(g, F, P, "b", 0, 5, 200);
      read.textContent = `반지름 ${num(x, 2)}a₀(${num(x * 52.9, 0)} pm) 안에서 전자를 찾을 확률 ${num(Fc(x) * 100, 1)}%. 가장 찾기 쉬운 거리는 a₀ = 52.9 pm(보어 반지름)`;
    });
  });

  // 1-2 바닥상태 전자 배치: 원자 번호 Z (1~36)
  const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr".split(" ");
  const SUB = [["1s", 2], ["2s", 2], ["2p", 6], ["3s", 2], ["3p", 6], ["4s", 2], ["3d", 10], ["4p", 6]];
  const config = (Z) => { let e = Z; const f = SUB.map(([n, c]) => { const k = Math.min(c, e); e -= k; return k; }); if (Z === 24 || Z === 29) { f[5] = 1; f[6] += 1; } return f; };
  Q.def("adchem-config", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ Z }) => {
      clear(g);
      const f = config(Z);
      SUB.forEach(([n, c], i) => { const x = 30 + i * 60; el("rect", { x, y: 40, width: 48, height: 120, class: "lk" }, g); el("rect", { x, y: 160 - 120 * f[i] / c, width: 48, height: 120 * f[i] / c, class: i >= 5 ? "lc" : "lb" }, g); txt(g, x + 24, 180, n, "s", "middle"); txt(g, x + 24, 32, `${f[i]}/${c}`, "s", "middle"); });
      const s = SUB.map(([n], i) => (f[i] ? n + sup(f[i]) : "")).filter(Boolean).join(" ");
      read.textContent = `${SYM[Z - 1]} (Z = ${Z}): ${s}` + (Z === 24 || Z === 29 ? ". 3d를 반쯤 또는 가득 채우는 쪽이 안정하여 4s에서 전자 하나가 옮겨 간다" : "");
    });
  });

  // 1-3 이온 쌍의 퍼텐셜 에너지: 핵간 거리 r (Å), Na⁺와 Cl⁻
  Q.def("adchem-ion", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const r0 = 2.36, B = 1389 * r0 ** 8 / 9, E = (r) => -1389 / r + B / r ** 9;
    Q.bind(fig, ({ r }) => {
      clear(g);
      const F = frame(g, 1.8, 6, -600, 300, [0.5, 100]); ticks(g, F, [2, 3, 4, 5, 6], [-600, -400, -200, 0, 200]); axl(g, "핵간 거리 (Å)", "퍼텐셜 에너지 (kJ/mol)");
      Q.plot(g, F, (x) => Math.max(-600, Math.min(300, E(x))), "b", 1.95, 6, 200);
      Q.plot(g, F, (x) => Math.max(-600, -1389 / x), "gd", 2.3, 6, 100);
      Q.dot(g, F.x(r), F.y(Math.max(-600, Math.min(300, E(r)))), "fd", 5);
      read.textContent = `r = ${num(r, 2)} Å: 에너지 ${num(E(r), 0)} kJ/mol. ` + (Math.abs(r - r0) < 0.05 ? "가장 낮은 평형 거리 2.36 Å, −523 kJ/mol" : r < r0 ? "전자 구름이 겹쳐 반발이 이겨 밀어낸다" : "쿨롱 인력(회색)이 이겨 끌어당긴다");
    });
  });

  // 1-4 형식 전하: N₂O의 세 루이스 구조
  const N2O = [["N=N=O", [-1, 1, 0]], ["N≡N−O", [0, 1, -1]], ["N−N≡O", [-2, 1, 1]]];
  Q.def("adchem-fc", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ v }) => {
      clear(g);
      const [nm, fc] = N2O[v];
      ["끝 N", "가운데 N", "O"].forEach((a, i) => sbar(g, 30 + i * 40, fc[i], 50, fc[i] < 0 ? "lb" : "lc", a, `${fc[i] > 0 ? "+" : ""}${fc[i]}`));
      txt(g, 300, 160, nm, "s", "middle");
      const tot = fc.reduce((s, x) => s + Math.abs(x), 0);
      read.textContent = `${nm}: 형식 전하 ${fc.join(", ")} (합 0, 절댓값 합 ${tot}). ` + (v === 2 ? "−2가 생기고 전기 음성도가 큰 O에 +가 놓여 기여가 가장 작다" : v === 1 ? "음전하가 전기 음성도가 가장 큰 O에 놓여 기여가 크다" : "형식 전하가 작아 기여가 크다. 실제 분자는 앞의 두 구조의 공명 혼성");
    }, (k, x) => N2O[x][0]);
  });

  // 1-5 전자쌍 반발과 혼성: 전자 영역 수 d, 비공유 전자쌍 수 l
  const SHAPE = { "2-0": ["직선형", "180°", "sp", "CO₂"], "3-0": ["평면 삼각형", "120°", "sp²", "BF₃"], "3-1": ["굽은형", "약 119°", "sp²", "SO₂"], "4-0": ["정사면체", "109.5°", "sp³", "CH₄"], "4-1": ["삼각뿔", "약 107°", "sp³", "NH₃"], "4-2": ["굽은형", "약 104.5°", "sp³", "H₂O"] };
  Q.def("adchem-vsepr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ d, l }) => {
      clear(g);
      const L = Math.min(l, d - 2), cx = 260, cy = 105;
      for (let i = 0; i < d; i++) { const a = -Math.PI / 2 + 2 * Math.PI * i / d, x = cx + 70 * Math.cos(a), y = cy + 70 * Math.sin(a); if (i < L) el("ellipse", { cx: cx + 45 * Math.cos(a), cy: cy + 45 * Math.sin(a), rx: 16, ry: 10, transform: `rotate(${a * 180 / Math.PI} ${cx + 45 * Math.cos(a)} ${cy + 45 * Math.sin(a)})`, class: "la" }, g); else { Q.line(g, cx, cy, x, y, "b"); Q.dot(g, x, y, "fb", 8); } }
      Q.dot(g, cx, cy, "fd", 10);
      const [s, ang, hy, ex] = SHAPE[`${d}-${L}`];
      read.textContent = `전자 영역 ${d}개(비공유 전자쌍 ${L}개): 혼성 ${hy}, 분자 모양 ${s}, 결합각 ${ang} (예 ${ex})` + (l > L ? `. 영역이 ${d}개이면 비공유 전자쌍은 ${d - 2}개까지만 생각한다` : "");
    });
  });

  // 1-6 알케인의 구조 이성질체 수: 탄소 수 n
  const ISO = [1, 1, 1, 2, 3, 5, 9, 18, 35, 75];
  Q.def("adchem-iso", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      ISO.forEach((c, i) => bar(g, 2 + i * 23, c * 3.5, i + 1 === n ? "lc" : "lk", `C${i + 1}H${2 * (i + 1) + 2}`, `${c}`, 140));
      read.textContent = `탄소 ${n}개 알케인 C${n}H${2 * n + 2}: 구조 이성질체 ${ISO[n - 1]}가지. 탄소가 하나 늘 때마다 가지를 칠 자리가 늘어 거의 두 배씩 늘어난다 (C20은 36만 가지 넘음)`;
    });
  });

  // 1-7 작용기와 끓는점: 탄소 수 n, 알케인과 1차 알코올
  const BPA = [-162, -89, -42, -0.5, 36, 69, 98, 126], BPO = [65, 78, 97, 117, 138, 157, 176, 195];
  Q.def("adchem-bp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      const F = frame(g, 1, 8, -180, 200, [1, 40]); ticks(g, F, [1, 2, 3, 4, 5, 6, 7, 8], [-160, -80, 0, 80, 160]); axl(g, "탄소 수", "끓는점 (°C)");
      path(g, BPA.map((y, i) => [F.x(i + 1), F.y(y)]), "c"); path(g, BPO.map((y, i) => [F.x(i + 1), F.y(y)]), "b");
      BPA.forEach((y, i) => Q.dot(g, F.x(i + 1), F.y(y), "fc", 3)); BPO.forEach((y, i) => Q.dot(g, F.x(i + 1), F.y(y), "fb", 3));
      Q.line(g, F.x(n), F.y(BPA[n - 1]), F.x(n), F.y(BPO[n - 1]), "gd");
      read.textContent = `탄소 ${n}개: 알케인(주황) ${BPA[n - 1]} °C, 알코올(파랑) ${BPO[n - 1]} °C, 차이 ${num(BPO[n - 1] - BPA[n - 1], 0)} °C. 하이드록시기의 수소 결합 효과는 사슬이 길어질수록 묻힌다`;
    });
  });

  // 2-1 맥스웰–볼츠만 속력 분포: 몰질량 M (g/mol), 온도 T (K)
  Q.def("adchem-mb", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const f = (v, M, T) => { const m = M / 1000; return 4 * Math.PI * (m / (2 * Math.PI * R * T)) ** 1.5 * v * v * Math.exp(-m * v * v / (2 * R * T)); };
    Q.bind(fig, ({ M, T }) => {
      clear(g);
      const F = frame(g, 0, 2500, 0, 0.005, [250, 0.001]); ticks(g, F, [0, 500, 1000, 1500, 2000, 2500], []); axl(g, "분자의 속력 (m/s)", "분포 (질소 300 K = 회색)");
      Q.plot(g, F, (v) => f(v, 28, 300), "gd", 0, 2500, 200);
      Q.plot(g, F, (v) => Math.min(0.005, f(v, M, T)), "b", 0, 2500, 300);
      const m = M / 1000, vp = Math.sqrt(2 * R * T / m), va = Math.sqrt(8 * R * T / (Math.PI * m)), vr = Math.sqrt(3 * R * T / m);
      read.textContent = `몰질량 ${M} g/mol, ${T} K: 가장 흔한 속력 ${num(vp, 0)} m/s, 평균 ${num(va, 0)} m/s, 제곱 평균 제곱근 ${num(vr, 0)} m/s. 속력은 √(T/M)에 비례`;
    });
  });

  // 2-2 물 위에서 모은 기체: 수온 T (°C), 대기압 760 mmHg, 모은 부피 250 mL
  Q.def("adchem-water", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T }) => {
      clear(g);
      const pw = 10 ** (8.07131 - 1730.63 / (233.426 + T)), pg = 760 - pw, n = (pg / 760) * 0.250 / (0.08206 * (T + 273.15));
      bar(g, 40, 760 * 0.4, "lk", "전체 압력", "760 mmHg");
      bar(g, 80, pg * 0.4, "lb", "모은 기체의 부분 압력", `${num(pg, 1)} mmHg`);
      bar(g, 120, pw * 0.4, "lc", "수증기의 부분 압력", `${num(pw, 1)} mmHg`);
      read.textContent = `수온 ${T} °C: 수증기압 ${num(pw, 1)} mmHg를 빼면 기체의 부분 압력 ${num(pg, 1)} mmHg. 250 mL 속 기체는 ${num(n * 1000, 2)} mmol (수증기를 무시하면 ${num(((760 / 760) * 0.25 / (0.08206 * (T + 273.15)) / n - 1) * 100, 1)}% 크게 계산)`;
    });
  });

  // 2-3 실제 기체: 이산화 탄소의 압축 인자, 온도 T (K), 압력 P (bar)
  Q.def("adchem-vdw", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const a = 3.64, b = 0.04267, Rb = 0.08314;
    const Vm = (P, T) => { let V = Rb * T / P; for (let i = 0; i < 60; i++) { const f = (P + a / (V * V)) * (V - b) - Rb * T, df = P - a / (V * V) + 2 * a * b / (V * V * V); V -= f / df; if (V < b * 1.05) V = b * 1.05; } return V; };
    Q.bind(fig, ({ T, P }) => {
      clear(g);
      const Z = (p) => p * Vm(p, T) / (Rb * T);
      const F = frame(g, 0, 60, 0.5, 1.05, [10, 0.1]); ticks(g, F, [0, 10, 20, 30, 40, 50, 60], [0.5, 0.6, 0.7, 0.8, 0.9, 1]); axl(g, "압력 (bar)", "압축 인자 Z = PV/nRT");
      Q.line(g, F.x(0), F.y(1), F.x(60), F.y(1), "gd");
      Q.plot(g, F, (p) => Math.max(0.5, Z(p)), "b", 1, 60, 120);
      Q.dot(g, F.x(P), F.y(Math.max(0.5, Z(P))), "fd", 5);
      read.textContent = `CO₂, ${T} K, ${P} bar: Z = ${num(Z(P), 3)}. 1몰의 부피 ${num(Vm(P, T), 3)} L (이상 기체라면 ${num(Rb * T / P, 3)} L). 분자 사이 인력이 부피를 줄인다`;
    });
  });

  // 2-4 모세관 현상: 관의 반지름 r (mm)
  Q.def("adchem-cap", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const hw = 2 * 0.0728 / (1000 * 9.8 * r * 1e-3) * 1000, hm = 2 * 0.485 * Math.cos(140 * Math.PI / 180) / (13534 * 9.8 * r * 1e-3) * 1000;
      sbar(g, 50, Math.min(hw, 180) / 180, 180, "lb", "물 (올라감)", `${num(hw, 1)} mm`);
      sbar(g, 95, Math.max(hm, -60) / 180, 180, "lc", "수은 (내려감)", `${num(hm, 1)} mm`);
      read.textContent = `반지름 ${num(r, 2)} mm 유리관: 물은 h = 2γcosθ/(ρgr) = ${num(hw, 1)} mm 올라가고, 수은은 ${num(-hm, 1)} mm 내려간다. 관이 가늘수록 높이는 반지름에 반비례하여 커진다`;
    });
  });

  // 2-5 단위세포: 0 단순 입방, 1 체심 입방, 2 면심 입방
  const CELL = [["단순 입방", 1, 6, Math.PI / 6, "폴로늄"], ["체심 입방", 2, 8, Math.PI * Math.sqrt(3) / 8, "철, 나트륨"], ["면심 입방", 4, 12, Math.PI / (3 * Math.sqrt(2)), "구리, 알루미늄"]];
  Q.def("adchem-cell", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ v }) => {
      clear(g);
      const [nm, n, cn, pf, ex] = CELL[v];
      el("rect", { x: 40, y: 40, width: 120, height: 120, class: "lk" }, g);
      for (const [x, y] of [[40, 40], [160, 40], [40, 160], [160, 160]]) Q.dot(g, x, y, "fb", 9);
      if (v === 1) Q.dot(g, 100, 100, "fc", 9);
      if (v === 2) for (const [x, y] of [[100, 40], [100, 160], [40, 100], [160, 100], [100, 100]]) Q.dot(g, x, y, "fc", 9);
      bar(g, 50, n * 40, "lb", "단위세포의 원자 수", `${n}`, 330);
      bar(g, 90, cn * 12, "lc", "배위수", `${cn}`, 330);
      bar(g, 130, pf * 150, "ld", "채움률", `${num(pf * 100, 1)}%`, 330);
      read.textContent = `${nm}: 꼭짓점 원자 8개 × 1/8` + (v === 1 ? " + 중심 1개" : v === 2 ? " + 면 중심 6개 × 1/2" : "") + ` = ${n}개, 배위수 ${cn}, 공간의 ${num(pf * 100, 1)}%를 채움 (예 ${ex})`;
    }, (k, x) => CELL[x][0]);
  });

  // 2-6 질산 칼륨의 용해도 곡선: 온도 T (°C)
  const SOL = [13.3, 20.9, 31.6, 45.8, 63.9, 85.5, 110, 138, 169, 202, 246];
  const sol = (T) => { const i = Math.min(9, Math.floor(T / 10)), f = T / 10 - i; return SOL[i] + (SOL[i + 1] - SOL[i]) * f; };
  Q.def("adchem-sol", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T }) => {
      clear(g);
      const F = frame(g, 0, 100, 0, 250, [10, 50]); ticks(g, F, [0, 20, 40, 60, 80, 100], [0, 50, 100, 150, 200, 250]); axl(g, "온도 (°C)", "물 100 g에 녹는 KNO₃ (g)");
      Q.plot(g, F, sol, "b", 0, 100, 200);
      Q.dot(g, F.x(T), F.y(sol(T)), "fd", 5); Q.dot(g, F.x(20), F.y(31.6), "fk", 4);
      const w = sol(T) / (100 + sol(T)) * 100, m = sol(T) / 101.1 / 0.1;
      read.textContent = `${T} °C 포화 용액: 물 100 g에 ${num(sol(T), 1)} g (질량 백분율 ${num(w, 1)}%, 몰랄 농도 ${num(m, 1)} m). 20 °C로 식히면 ${T > 20 ? num(sol(T) - 31.6, 1) + " g이 결정으로 나온다" : "결정이 나오지 않는다"}`;
    });
  });

  // 2-7 어는점 내림으로 몰질량 구하기: 측정한 ΔTf (°C), 용질 2.00 g, 물 100 g
  Q.def("adchem-molar", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dT }) => {
      clear(g);
      const M = 1.86 * 2.0 / (dT * 0.1), e = 0.01 / dT;
      bar(g, 50, Math.min(320, M), "lb", "구한 몰질량", `${num(M, 0)} g/mol`);
      bar(g, 95, e * 1000, "lc", "온도계 ±0.01 °C의 영향", `±${num(e * 100, 1)}% (±${num(M * e, 0)} g/mol)`);
      read.textContent = `ΔTf = ${num(dT, 2)} °C: 몰랄 농도 ${num(dT / 1.86, 3)} m, 몰질량 = Kf × 용질 질량 ÷ (ΔTf × 용매 kg) = ${num(M, 0)} g/mol. 어는점 내림이 작을수록 측정 오차가 크게 번진다`;
    });
  });

  // 3-1 내부 에너지와 엔탈피: 기체 몰수 변화 Δn, 25 °C
  Q.def("adchem-bomb", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dn }) => {
      clear(g);
      const w = dn * R * 298 / 1000;
      sbar(g, 60, w, 20, w >= 0 ? "lc" : "lb", "ΔH − ΔU = ΔnRT", `${w >= 0 ? "+" : ""}${num(w, 2)} kJ/mol`);
      txt(g, 300, 130, "Δn = −1.5 (H₂ + ½O₂ → H₂O(l)), 0 (C₆H₁₂O₆ 연소), +1 (CaCO₃ 분해)", "s", "middle");
      read.textContent = `기체 몰수가 ${dn}만큼 변하면, 일정한 압력에서 계가 바깥에 하는 일이 ΔnRT = ${num(w, 2)} kJ/mol이다. 그래서 통 열량계로 잰 ΔU와 ΔH가 그만큼 다르다`;
    });
  });

  // 3-2 결합 엔탈피로 어림한 알케인 연소열: 탄소 수 n
  Q.def("adchem-bond", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const dH = (n) => ((n - 1) * 348 + (2 * n + 2) * 413 + (3 * n + 1) / 2 * 495) - (2 * n * 799 + (2 * n + 2) * 463);
    Q.bind(fig, ({ n }) => {
      clear(g);
      const h = dH(n), pg = -h / (14 * n + 2);
      bar(g, 50, -h / 25, "lb", "1몰당 연소열", `${num(-h, 0)} kJ/mol`);
      bar(g, 95, pg * 4, "lc", "1 g당 연소열", `${num(pg, 1)} kJ/g`);
      read.textContent = `C${n}H${2 * n + 2}: 끊는 결합 C−C ${n - 1}개, C−H ${2 * n + 2}개, O=O ${num((3 * n + 1) / 2, 1)}개, 만드는 결합 C=O ${2 * n}개, O−H ${2 * n + 2}개 → ΔH ≈ ${num(h, 0)} kJ/mol`;
    });
  });

  // 3-3 아인슈타인 고체 두 개의 에너지 나누기: A가 가진 에너지 양자 qA (모두 60개, 진동자 30개씩)
  const lnC = (n, k) => { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; };
  Q.def("adchem-micro", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const N = 30, q = 60, lw = (a) => lnC(a + N - 1, a) + lnC(q - a + N - 1, q - a);
    const mx = lw(30); let Z = 0; for (let a = 0; a <= q; a++) Z += Math.exp(lw(a) - mx);
    Q.bind(fig, ({ qa }) => {
      clear(g);
      const F = frame(g, 0, 60, 0, 0.12, [10, 0.02]); ticks(g, F, [0, 10, 20, 30, 40, 50, 60], [0, 0.04, 0.08, 0.12]); axl(g, "A가 가진 에너지 양자 수", "확률");
      for (let a = 0; a <= q; a++) el("rect", { x: F.x(a) - 3, y: F.y(Math.exp(lw(a) - mx) / Z), width: 6, height: F.y(0) - F.y(Math.exp(lw(a) - mx) / Z), class: a === qa ? "lc" : "lb" }, g);
      const p = Math.exp(lw(qa) - mx) / Z;
      read.textContent = `A가 ${qa}개, B가 ${q - qa}개: 미시 상태 수 ${Math.exp(lw(qa)).toExponential(2)}, 확률 ${p < 1e-4 ? p.toExponential(1) : num(p * 100, 2) + "%"}. 고르게 나눈 30:30이 가장 흔하고, 한쪽에 몰린 상태는 거의 일어나지 않는다`;
    });
  });

  // 3-4 질산 암모늄의 용해: 온도 T (K), ΔH = +25.7 kJ/mol, ΔS = +108.7 J/(mol·K)
  Q.def("adchem-gibbs", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T }) => {
      clear(g);
      const G = (t) => 25.7 - t * 0.1087;
      const F = frame(g, 150, 400, -20, 10, [50, 5]); ticks(g, F, [150, 200, 250, 300, 350, 400], [-20, -10, 0, 10]); axl(g, "온도 (K)", "ΔG (kJ/mol)");
      Q.line(g, F.x(150), F.y(0), F.x(400), F.y(0), "gd");
      Q.plot(g, F, G, "b", 150, 400, 50);
      Q.dot(g, F.x(T), F.y(G(T)), "fd", 5);
      read.textContent = `${T} K: ΔG = ΔH − TΔS = 25.7 − ${T} × 0.1087 = ${num(G(T), 1)} kJ/mol → ` + (G(T) < 0 ? "저절로 녹는다 (흡열인데도 엔트로피 증가가 이긴다)" : "저절로 녹지 않는다") + `. 경계 온도 ΔH/ΔS ≈ 236 K`;
    });
  });

  // 3-5 과망가니즈산 적정: 0.0200 M KMnO₄ 부피 V (mL), 철(II) 시료 25.0 mL
  Q.def("adchem-mno4", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ V }) => {
      clear(g);
      const nM = 0.02 * V / 1000, nF = 5 * nM, c = nF / 0.025;
      bar(g, 50, nM * 1e6 * 0.4, "lc", "넣은 MnO₄⁻", `${num(nM * 1000, 3)} mmol`);
      bar(g, 95, nF * 1e6 * 0.4 / 5, "lb", "반응한 Fe²⁺ (5배)", `${num(nF * 1000, 3)} mmol`);
      read.textContent = `종말점까지 ${num(V, 1)} mL: MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O이므로 Fe²⁺는 ${num(nF * 1000, 2)} mmol, 시료의 농도 ${num(c, 4)} M`;
    });
  });

  // 3-6 표준 전지 전위: 산화 전극 a, 환원 전극 c
  const EO = [["Mg", -2.37], ["Al", -1.66], ["Zn", -0.76], ["Fe", -0.44], ["Ni", -0.26], ["Pb", -0.13], ["H₂", 0], ["Cu", 0.34], ["Ag", 0.8]];
  Q.def("adchem-ecell", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a, c }) => {
      clear(g);
      const F = frame(g, -2.5, 1, 0, 1, [0.5, 1]); ticks(g, F, [-2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1], []); txt(g, 490, 200, "표준 환원 전위 E° (V)", "s", "end");
      EO.forEach(([s, e], i) => { const y = 40 + (i % 3) * 45; Q.dot(g, F.x(e), y, i === a ? "fb" : i === c ? "fc" : "fk", i === a || i === c ? 7 : 4); txt(g, F.x(e), y - 10, s, "s", "middle"); });
      const E = EO[c][1] - EO[a][1];
      read.textContent = `${EO[a][0]} 전극(산화, 파랑) | ${EO[c][0]} 전극(환원, 주황): E°전지 = ${num(EO[c][1], 2)} − (${num(EO[a][1], 2)}) = ${num(E, 2)} V → ` + (E > 0 ? "저절로 흐르는 전지" : E === 0 ? "전위차 없음" : "반대로 흘러야 한다. 두 전극을 바꾸어라");
    });
  });

  // 3-7 네른스트 식: 다니엘 전지, 반응 지수 Q = [Zn²⁺]/[Cu²⁺] = 10^lq
  Q.def("adchem-nernst", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lq }) => {
      clear(g);
      const E = (x) => 1.10 - 0.02958 * x;
      const F = frame(g, -4, 40, -0.1, 1.3, [4, 0.2]); ticks(g, F, [0, 10, 20, 30, 40], [0, 0.4, 0.8, 1.2]); axl(g, "log Q", "전지 전위 (V)");
      Q.line(g, F.x(-4), F.y(0), F.x(40), F.y(0), "gd");
      Q.plot(g, F, E, "b", -4, 40, 20);
      Q.dot(g, F.x(lq), F.y(E(lq)), "fd", 5);
      read.textContent = `log Q = ${lq}: E = 1.10 − (0.0592/2) log Q = ${num(E(lq), 3)} V, ΔG = −nFE = ${num(-2 * 96.485 * E(lq), 0)} kJ/mol. E = 0인 log Q ≈ 37.2가 평형 상수 K`;
    });
  });

  // 3-8 구리 도금: 전류 I (A), 시간 t (분), 넓이 10 cm²
  Q.def("adchem-plate", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ I, t }) => {
      clear(g);
      const q = I * t * 60, mol = q / (2 * 96485), m = mol * 63.55, th = m / 8.96 / 10 * 1e4;
      bar(g, 40, q / 30, "lk", "흐른 전하량", `${num(q, 0)} C`);
      bar(g, 80, m * 50, "lb", "석출된 구리", `${num(m, 3)} g`);
      bar(g, 120, th * 4, "lc", "도금 두께 (10 cm²)", `${num(th, 1)} μm`);
      read.textContent = `${num(I, 1)} A로 ${t}분: 전하량 ${num(q, 0)} C = 전자 ${num(q / 96485 * 1000, 2)} mmol, Cu²⁺ + 2e⁻ → Cu이므로 구리 ${num(mol * 1000, 2)} mmol = ${num(m, 3)} g`;
    });
  });

  // 4-1 N₂O₄ ⇌ 2NO₂ 평형: 처음 농도 C (M), Kc = 4.6 × 10⁻³ (25 °C)
  Q.def("adchem-n2o4", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const K = 4.6e-3, X = (C) => (-K + Math.sqrt(K * K + 16 * K * C)) / 8;
    Q.bind(fig, ({ C }) => {
      clear(g);
      const F = frame(g, 0, 0.2, 0, 1, [0.02, 0.2]); ticks(g, F, [0, 0.05, 0.1, 0.15, 0.2], [0, 0.2, 0.4, 0.6, 0.8, 1]); axl(g, "처음 N₂O₄ 농도 (M)", "해리된 비율");
      Q.plot(g, F, (c) => X(c) / c, "b", 0.002, 0.2, 200);
      const x = X(C);
      Q.dot(g, F.x(C), F.y(x / C), "fd", 5);
      read.textContent = `처음 ${num(C, 3)} M: 평형에서 [N₂O₄] = ${num(C - x, 4)} M, [NO₂] = ${num(2 * x, 4)} M, ${num(x / C * 100, 1)}% 해리. Q = [NO₂]²/[N₂O₄] = ${num((2 * x) ** 2 / (C - x) * 1000, 2)} × 10⁻³ = K`;
    });
  });

  // 4-2 온도와 평형 상수 (암모니아 합성): 온도 T (K), ΔH° = −92.2 kJ, K(298 K) = 6.0 × 10⁵
  Q.def("adchem-vh", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const LK = (T) => Math.log10(6e5) + (92200 / R) * (1 / T - 1 / 298) / Math.LN10;
    Q.bind(fig, ({ T }) => {
      clear(g);
      const F = frame(g, 298, 900, -8, 6, [50, 2]); ticks(g, F, [300, 400, 500, 600, 700, 800, 900], [-8, -4, 0, 4]); axl(g, "온도 (K)", "log K");
      Q.plot(g, F, LK, "b", 298, 900, 200);
      Q.dot(g, F.x(T), F.y(LK(T)), "fd", 5);
      read.textContent = `${T} K: K ≈ 10^${num(LK(T), 2)} = ${(10 ** LK(T)).toExponential(1)}. 발열 반응이라 온도가 오르면 K가 줄어든다 (ln K = −ΔH°/RT + ΔS°/R)`;
    });
  });

  // 4-3 공통 이온 효과: 염화 은, 넣은 Cl⁻ 농도 10^lc M, Ksp = 1.8 × 10⁻¹⁰
  Q.def("adchem-ksp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const K = 1.8e-10, s = (c) => (-c + Math.sqrt(c * c + 4 * K)) / 2;
    Q.bind(fig, ({ lc }) => {
      clear(g);
      const F = frame(g, -8, -1, -10, -4, [1, 1]); ticks(g, F, [-8, -7, -6, -5, -4, -3, -2, -1], [-10, -8, -6, -4]); axl(g, "log [넣은 Cl⁻]", "log 용해도 (M)");
      Q.plot(g, F, (x) => Math.log10(s(10 ** x)), "b", -8, -1, 200);
      const c = 10 ** lc;
      Q.dot(g, F.x(lc), F.y(Math.log10(s(c))), "fd", 5);
      read.textContent = `Cl⁻ ${c.toExponential(1)} M가 있으면 AgCl 용해도 ${s(c).toExponential(2)} M (${(s(c) * 143.3).toExponential(1)} g/L). 순수한 물에서는 √Ksp = 1.34 × 10⁻⁵ M`;
    });
  });

  // 4-4 약산의 이온화도: 아세트산 농도 10^lc M, Ka = 1.8 × 10⁻⁵
  Q.def("adchem-alpha", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const K = 1.8e-5, al = (C) => (-K + Math.sqrt(K * K + 4 * K * C)) / (2 * C);
    Q.bind(fig, ({ lc }) => {
      clear(g);
      const F = frame(g, -5, 0, 0, 100, [1, 20]); ticks(g, F, [-5, -4, -3, -2, -1, 0], [0, 20, 40, 60, 80, 100]); axl(g, "log 농도 (M)", "이온화도 (%)");
      Q.plot(g, F, (x) => al(10 ** x) * 100, "b", -5, 0, 200);
      const C = 10 ** lc, a = al(C);
      Q.dot(g, F.x(lc), F.y(a * 100), "fd", 5);
      read.textContent = `아세트산 ${C.toExponential(1)} M: 이온화도 ${num(a * 100, 1)}%, pH ${num(-Math.log10(a * C), 2)}. 묽을수록 더 많이 이온화하지만 [H₃O⁺] 자체는 줄어든다`;
    });
  });

  // 4-5 약염기의 pH: 암모니아 농도 10^lc M, Kb = 1.8 × 10⁻⁵
  Q.def("adchem-base", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const K = 1.8e-5, oh = (C) => (-K + Math.sqrt(K * K + 4 * K * C)) / 2;
    Q.bind(fig, ({ lc }) => {
      clear(g);
      const pH = (x) => 14 + Math.log10(oh(10 ** x));
      const F = frame(g, -4, 0, 9, 13, [0.5, 1]); ticks(g, F, [-4, -3, -2, -1, 0], [9, 10, 11, 12, 13]); axl(g, "log 농도 (M)", "pH");
      Q.plot(g, F, pH, "b", -4, 0, 100); Q.plot(g, F, (x) => Math.min(13, 14 + x), "gd", -4, -1, 50);
      Q.dot(g, F.x(lc), F.y(pH(lc)), "fd", 5);
      read.textContent = `암모니아 ${(10 ** lc).toExponential(1)} M: [OH⁻] = ${oh(10 ** lc).toExponential(2)} M, pH ${num(pH(lc), 2)} (회색은 같은 농도의 강염기). 짝산 NH₄⁺의 Ka = Kw/Kb = 5.6 × 10⁻¹⁰`;
    });
  });

  // 4-6 약산–강염기 적정 곡선: pKa, 넣은 NaOH 부피 V (mL), 0.100 M 산 25.0 mL를 0.100 M NaOH로
  const pHof = (V, pKa) => { const Ka = 10 ** -pKa, CA = 0.1 * 25 / (25 + V), CN = 0.1 * V / (25 + V); let lo = -14, hi = 0; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2, h = 10 ** m, f = h + CN - CA * Ka / (Ka + h) - 1e-14 / h; if (f > 0) hi = m; else lo = m; } return -(lo + hi) / 2; };
  Q.def("adchem-titr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ pKa, V }) => {
      clear(g);
      const F = frame(g, 0, 50, 0, 14, [5, 2]); ticks(g, F, [0, 10, 20, 30, 40, 50], [0, 2, 4, 6, 8, 10, 12, 14]); axl(g, "넣은 NaOH (mL)", "pH");
      Q.plot(g, F, (v) => pHof(v, pKa), "b", 0, 50, 250);
      Q.dot(g, F.x(12.5), F.y(pHof(12.5, pKa)), "fk", 4); Q.dot(g, F.x(V), F.y(pHof(V, pKa)), "fd", 5);
      read.textContent = `pKa ${num(pKa, 1)}, ${num(V, 1)} mL에서 pH ${num(pHof(V, pKa), 2)}. 반중화점(12.5 mL, 검은 점) pH ≈ pKa, 당량점(25 mL) pH ${num(pHof(25, pKa), 2)}`;
    });
  });

  // 4-7 온도 10 °C 상승의 효과: 활성화 에너지 Ea (kJ/mol), 25 °C → 35 °C
  Q.def("adchem-q10", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const rr = (Ea) => Math.exp(Ea * 1000 / R * (1 / 298.15 - 1 / 308.15));
    Q.bind(fig, ({ Ea }) => {
      clear(g);
      const F = frame(g, 0, 150, 1, 8, [25, 1]); ticks(g, F, [0, 25, 50, 75, 100, 125, 150], [1, 2, 4, 6, 8]); axl(g, "활성화 에너지 (kJ/mol)", "35 °C 속도 ÷ 25 °C 속도");
      Q.plot(g, F, (e) => Math.min(8, rr(e)), "b", 0, 150, 150);
      Q.line(g, F.x(0), F.y(2), F.x(150), F.y(2), "gd");
      Q.dot(g, F.x(Ea), F.y(Math.min(8, rr(Ea))), "fd", 5);
      read.textContent = `Ea = ${Ea} kJ/mol: 10 °C 오르면 속도 상수가 ${num(rr(Ea), 2)}배. '10 °C에 두 배'라는 어림은 Ea ≈ 53 kJ/mol 근처에서만 맞는다`;
    });
  });

  // 4-8 적분 속도식: 반응 차수 0, 1, 2 ([A]₀ = 1 M, k = 0.1)
  const ORD = ["0차", "1차", "2차"];
  Q.def("adchem-integ", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const A = [(t) => Math.max(0, 1 - 0.1 * t), (t) => Math.exp(-0.1 * t), (t) => 1 / (1 + 0.1 * t)];
    Q.bind(fig, ({ o }) => {
      clear(g);
      const F = frame(g, 0, 40, 0, 1, [5, 0.25]); ticks(g, F, [0, 10, 20, 30, 40], [0, 0.25, 0.5, 0.75, 1]); axl(g, "시간 (분)", "[A] (M)");
      A.forEach((f, i) => Q.plot(g, F, f, i === o ? "b" : "gd", 0, 40, 200));
      const hl = o === 0 ? ["5", "2.5", "1.25"] : o === 1 ? ["6.93", "6.93", "6.93"] : ["10", "20", "40"];
      read.textContent = `${ORD[o]} 반응: 반감기가 차례로 ${hl.join(" → ")}분. ` + (o === 0 ? "[A]가 줄수록 짧아진다 ([A]–t가 직선)" : o === 1 ? "늘 같다 (ln[A]–t가 직선)" : "점점 길어진다 (1/[A]–t가 직선)");
    }, (k, x) => ORD[x]);
  });

  // 4-9 충돌 이론: 활성화 에너지보다 큰 에너지로 부딪치는 비율, 온도 T (K), Ea (kJ/mol)
  Q.def("adchem-coll", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const f = (E, T) => { const kT = R * T / 1000; return 2 * Math.sqrt(E / Math.PI) * kT ** -1.5 * Math.exp(-E / kT); };
    const frac = (Ea, T) => { const x = Ea / (R * T / 1000); return 1 - erf(Math.sqrt(x)) + 2 * Math.sqrt(x / Math.PI) * Math.exp(-x); };
    Q.bind(fig, ({ T, Ea }) => {
      clear(g);
      const F = frame(g, 0, 30, 0, 0.5, [5, 0.1]); ticks(g, F, [0, 5, 10, 15, 20, 25, 30], [0, 0.1, 0.2, 0.3, 0.4, 0.5]); axl(g, "분자의 운동 에너지 (kJ/mol)", "분포 (300 K = 회색)");
      const pts = [[F.x(Ea), F.y(0)]]; for (let i = 0; i <= 60; i++) { const E = Ea + (30 - Ea) * i / 60; pts.push([F.x(E), F.y(Math.min(0.5, f(E, T)))]); } pts.push([F.x(30), F.y(0)]);
      path(g, pts, "la");
      Q.plot(g, F, (E) => Math.min(0.5, f(E, 300)), "gd", 0.01, 30, 200); Q.plot(g, F, (E) => Math.min(0.5, f(E, T)), "b", 0.01, 30, 200);
      Q.line(g, F.x(Ea), F.y(0), F.x(Ea), F.y(0.5), "c");
      read.textContent = `${T} K, Ea = ${Ea} kJ/mol: 활성화 에너지를 넘는 분자 ${num(frac(Ea, T) * 100, 2)}% (300 K일 때 ${num(frac(Ea, 300) * 100, 2)}%, ${num(frac(Ea, T) / frac(Ea, 300), 1)}배)`;
    });
  });

  // 4-10 연속 반응 A → I → P: 두 번째 단계의 속도 상수 k₂ = 10^lk (k₁ = 1)
  Q.def("adchem-mech", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lk }) => {
      clear(g);
      const k2 = 10 ** lk, A = (t) => Math.exp(-t), I = (t) => (Math.abs(k2 - 1) < 1e-6 ? t * Math.exp(-t) : (Math.exp(-t) - Math.exp(-k2 * t)) / (k2 - 1)), P = (t) => 1 - A(t) - I(t);
      const F = frame(g, 0, 10, 0, 1, [1, 0.25]); ticks(g, F, [0, 2, 4, 6, 8, 10], [0, 0.25, 0.5, 0.75, 1]); axl(g, "시간", "농도");
      Q.plot(g, F, A, "gd", 0, 10, 200); Q.plot(g, F, I, "c", 0, 10, 200); Q.plot(g, F, P, "b", 0, 10, 200);
      const tm = Math.abs(k2 - 1) < 1e-6 ? 1 : Math.log(k2) / (k2 - 1);
      read.textContent = `k₂/k₁ = ${num(k2, 2)}: 중간체(주황)는 최대 ${num(I(tm), 2)}까지 쌓인다. ` + (k2 < 0.5 ? "둘째 단계가 느려 속도 결정 단계이다" : k2 > 2 ? "첫째 단계가 느려 속도 결정 단계이고, 중간체는 거의 쌓이지 않는다" : "두 단계의 빠르기가 비슷하다");
    }, (k, v) => num(10 ** v, 2));
  });

  // 4-11 촉매: 활성화 에너지를 낮춘 양 dE (kJ/mol), 촉매 없을 때 80 kJ/mol, 25 °C
  Q.def("adchem-cat", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dE }) => {
      clear(g);
      const F = frame(g, 0, 10, -50, 100, [1, 25]); ticks(g, F, [], [-50, -25, 0, 25, 50, 75, 100]); axl(g, "반응 진행", "에너지 (kJ/mol)");
      const prof = (h) => (x) => (x < 5 ? h * Math.exp(-((x - 5) ** 2) / 2) : -40 + (h + 40) * Math.exp(-((x - 5) ** 2) / 2));
      const base = (x) => (x < 3 ? 0 : x > 7 ? -40 : 0);
      Q.plot(g, F, (x) => Math.max(prof(80)(x), base(x)), "gd", 0, 10, 200);
      Q.plot(g, F, (x) => Math.max(prof(80 - dE)(x), base(x)), "b", 0, 10, 200);
      const r = Math.exp(dE * 1000 / (R * 298.15));
      read.textContent = `활성화 에너지 80 → ${80 - dE} kJ/mol: 25 °C에서 속도가 ${r < 1e4 ? num(r, 0) : r.toExponential(1)}배. 반응열(−40 kJ/mol)과 평형은 그대로이다`;
    });
  });
})();
