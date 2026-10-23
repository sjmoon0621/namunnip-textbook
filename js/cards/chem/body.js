/* 화학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;

  // 몰: 물 18, 이산화 탄소 44, 설탕 342 g/mol
  Q.def("chem-mole", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const S = [["물", 18, "H₂O"], ["이산화 탄소", 44, "CO₂"], ["설탕", 342, "C₁₂H₂₂O₁₁"]];
    Q.bind(fig, ({ s, m }) => {
      clear(g);
      const [nm, M, f] = S[s], n = m / M;
      el("rect", { x: 30, y: 150, width: 140, height: 14, class: "lk" }, g); Q.line(g, 100, 164, 100, 190, "k"); Q.line(g, 60, 190, 140, 190, "k");
      el("rect", { x: 70, y: 150 - Math.min(110, m / 3.3), width: 60, height: Math.min(110, m / 3.3), class: "lb" }, g);
      txt(g, 100, 210, `${m} g ${f}`, "s", "middle");
      txt(g, 200, 60, `÷ ${M} g/mol`, "s"); Q.arrow(g, 200, 70, 290, 70, "k");
      const k = Math.min(40, Math.round(n * 10));
      for (let i = 0; i < k; i++) Q.dot(g, 310 + (i % 10) * 18, 40 + Math.floor(i / 10) * 18, "fc", 6);
      txt(g, 310, 140, `${num(n, 3)} mol`, "s tc");
      txt(g, 310, 165, `분자 ${num(n * 6.02, 2)} × 10²³개`, "s");
      txt(g, 310, 190, "(점 하나 = 0.1 mol)", "s");
      read.textContent = `${nm} ${m} g = ${num(n, 3)} mol = 분자 약 ${num(n * 6.02, 2)} × 10²³개`;
    }, (k, v) => k === "s" ? S[v][0] : num(v));
  });

  // 한계 반응물: 2H2 + O2 → 2H2O
  Q.def("chem-limit", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const mol = (x, y, cls, n, lab) => { for (let i = 0; i < n; i++) { Q.dot(g, x + (i % 4) * 22, y + Math.floor(i / 4) * 22, cls, 8); } txt(g, x + 33, 30, lab, "s", "middle"); };
    Q.bind(fig, ({ h, o }) => {
      clear(g);
      const r = Math.min(h / 2, o), w = 2 * r, hl = h - 2 * r, ol = o - r;
      txt(g, 20, 120, "전", "s"); txt(g, 290, 120, "후", "s");
      mol(40, 50, "fb", h, "H₂"); mol(140, 50, "fd", o, "O₂");
      Q.arrow(g, 240, 115, 280, 115, "k");
      mol(310, 50, "fc", w, "H₂O"); mol(410, 50, "fb", hl, "남은 H₂");
      if (ol) for (let i = 0; i < ol; i++) Q.dot(g, 410 + (i % 4) * 22, 160 + Math.floor(i / 4) * 22, "fd", 8);
      const lim = h === 0 || o === 0 ? "" : 2 * o < h ? "산소가 한계 반응물" : 2 * o > h ? "수소가 한계 반응물" : "남는 것 없이 모두 반응";
      read.textContent = `물 ${num(w)} mol 생성, 남은 수소 ${num(hl)} mol, 남은 산소 ${num(ol)} mol` + (lim ? ` (${lim})` : "");
    });
  });

  // 물의 전기 분해: 1 A × t 분, 전자 몰수 = 60t/96500, H2 = e/2, O2 = e/4 (22.4 L/mol)
  Q.def("chem-elec", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      const e = 60 * t / 96500, vH = e / 2 * 22400, vO = e / 4 * 22400, k = 0.4;
      el("rect", { x: 60, y: 150, width: 300, height: 60, class: "lb" }, g);
      for (const [x, v, lab, cls] of [[120, vH, "(−)극 수소", "lc"], [300, vO, "(+)극 산소", "ld"]]) {
        el("rect", { x: x - 18, y: 20, width: 36, height: 170, class: "gd" }, g);
        el("rect", { x: x - 18, y: 20, width: 36, height: Math.min(170, v * k), class: cls }, g);
        Q.line(g, x, 190, x, 214, "k");
        txt(g, x, 226, lab, "s", "middle"); txt(g, x + 24, 30 + Math.min(160, v * k), `${num(v, 0)} mL`, "s");
      }
      read.textContent = `${t}분: 전하량 ${60 * t} C, 전자 ${num(e, 4)} mol → 수소 ${num(vH, 0)} mL, 산소 ${num(vO, 0)} mL` + (t ? ` (비 ${num(vH / vO, 1)} : 1)` : "");
    });
  });

  // AB2 쌍극자 합: 2 μ cos(θ/2), μ = 1.5
  Q.def("chem-dipole", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 200, cy = 90, R = 110;
    Q.bind(fig, ({ a }) => {
      clear(g);
      const h = a / 2 * Math.PI / 180, net = 2 * 1.5 * Math.cos(h);
      const P = (s) => [cx + s * R * Math.sin(h), cy + R * Math.cos(h)];
      for (const s of [-1, 1]) {
        const [x, y] = P(s);
        Q.line(g, cx, cy, x, y, "k");
        el("circle", { cx: x, cy: y, r: 14, class: "lb" }, g); txt(g, x, y + 5, "B", "s", "middle"); txt(g, x + s * 22, y + 4, "δ+", "s");
        Q.arrow(g, cx + (x - cx) * 0.75, cy + (y - cy) * 0.75 + 0, cx + (x - cx) * 0.2, cy + (y - cy) * 0.2, "c", "fc");
      }
      el("circle", { cx, cy, r: 18, class: "ld" }, g); txt(g, cx, cy + 5, "A", "s", "middle"); txt(g, cx + 24, cy - 14, "δ−", "s");
      if (net > 0.02) Q.arrow(g, 420, 60 + net * 45, 420, 60, "d", "fd");
      txt(g, 420, 45, "합", "s td", "middle");
      read.textContent = `결합각 ${num(a, 1)}°: 분자 쌍극자 = 2 × 1.5 × cos(${num(a / 2, 2)}°) = ${num(net, 2)}` + (net < 0.02 ? " (무극성)" : " (극성)");
    });
  });

  // 전자쌍 반발: 전자쌍 수 d, 비공유 전자쌍 l → 모양과 결합각
  Q.def("chem-vsepr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 180, cy = 120;
    const T = {
      "2,0": ["직선형", 180, "CO₂, BeCl₂"], "3,0": ["평면 삼각형", 120, "BF₃"], "3,1": ["굽은형", 117, "SO₂"],
      "4,0": ["정사면체", 109.5, "CH₄"], "4,1": ["삼각뿔", 107, "NH₃"], "4,2": ["굽은형", 104.5, "H₂O"]
    };
    const dirs = { 2: [[1, 0], [-1, 0]], 3: [[0, -1], [-0.87, 0.5], [0.87, 0.5]], 4: [[0, -1], [-0.94, 0.33], [0.47, 0.6], [0.6, 0.15]] };
    Q.bind(fig, ({ d, l }) => {
      clear(g);
      const L = Math.min(l, d - 2), key = `${d},${L}`, [shape, ang, ex] = T[key];
      dirs[d].forEach(([x, y], i) => {
        const lone = i < L, R = 80;
        if (lone) el("ellipse", { cx: cx + x * 45, cy: cy + y * 45, rx: 26, ry: 16, transform: `rotate(${Math.atan2(y, x) * 180 / Math.PI} ${cx + x * 45} ${cy + y * 45})`, class: "la" }, g);
        else { Q.line(g, cx, cy, cx + x * R, cy + y * R, i === 3 ? "gd" : "k"); el("circle", { cx: cx + x * R, cy: cy + y * R, r: 12, class: "lb" }, g); }
      });
      el("circle", { cx, cy, r: 18, class: "ld" }, g);
      txt(g, 330, 70, `모양 ${shape}`, "s"); txt(g, 330, 100, `결합각 약 ${ang}°`, "s"); txt(g, 330, 130, `예 ${ex}`, "s");
      read.textContent = `전자쌍 ${d}개(비공유 ${L}개): ${shape}, 결합각 약 ${ang}°, 예 ${ex}` + (l > L ? " (비공유 전자쌍은 이 경우 최대 " + (d - 2) + "개까지 표시)" : "");
    });
  });

  // 14~17족 수소 화합물의 끓는점 (°C), 2~5주기
  Q.def("chem-bp", (fig, svg) => {
    const D = {
      14: [["CH₄", -161], ["SiH₄", -112], ["GeH₄", -88], ["SnH₄", -52]],
      15: [["NH₃", -33], ["PH₃", -88], ["AsH₃", -62], ["SbH₃", -17]],
      16: [["H₂O", 100], ["H₂S", -60], ["H₂Se", -41], ["H₂Te", -2]],
      17: [["HF", 20], ["HCl", -85], ["HBr", -67], ["HI", -35]]
    };
    const cls = { 14: "k", 15: "a", 16: "b", 17: "c" }, F = Q.frame(1.7, 5.3, -180, 120, 70, 460, 20, 220);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ f }) => {
      clear(g);
      Q.line(g, 70, 220, 460, 220, "ax"); Q.line(g, 70, 220, 70, 20, "ax"); Q.line(g, 70, F.y(0), 460, F.y(0), "gd");
      for (let p = 2; p <= 5; p++) txt(g, F.x(p), 236, `${p}주기`, "s", "middle");
      for (const t of [-150, -100, -50, 0, 50, 100]) txt(g, 64, F.y(t) + 4, `${t}`, "s", "end");
      for (const k of [14, 15, 16, 17]) {
        const on = k === f, w = el("g", { opacity: on ? 1 : 0.3 }, g);
        let d = ""; D[k].forEach(([, b], i) => { d += (i ? "L" : "M") + F.x(i + 2) + " " + F.y(b); });
        el("path", { d, class: cls[k] }, w);
        D[k].forEach(([n, b], i) => { Q.dot(w, F.x(i + 2), F.y(b), "f" + (cls[k] === "k" ? "k" : cls[k]), 4); if (on) txt(w, F.x(i + 2) + 8, F.y(b) - 6, n, "s"); });
      }
      const [n2, b2] = D[f][0], rest = D[f].slice(1).map(([n, b]) => `${n} ${b}`).join(", ");
      read.textContent = `${f}족: ${n2} ${b2} °C / ${rest} °C` + (f === 14 ? " (2주기도 경향을 따른다)" : ` (2주기 ${n2}만 수소 결합으로 높다)`);
    });
  });

  // 동적 평형 A ⇄ B: 정반응 k[A], 역반응 1·[B], [A]0 = 1
  Q.def("chem-dyneq", (fig, svg) => {
    const F = Q.frame(0, 10, 0, 1.05, 50, 330, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t, k }) => {
      clear(g);
      const Ae = 1 / (k + 1), A = (s) => Ae + (1 - Ae) * Math.exp(-(k + 1) * s), B = (s) => 1 - A(s);
      Q.line(g, 50, 200, 330, 200, "ax"); Q.line(g, 50, 200, 50, 20, "ax");
      txt(g, 330, 216, "시간", "s", "end"); txt(g, 56, 18, "농도 (M)", "s");
      Q.plot(g, F, A, "b", 0, 10, 200); Q.plot(g, F, B, "c", 0, 10, 200);
      txt(g, 300, F.y(A(10)) - 6, "A", "s tb"); txt(g, 300, F.y(B(10)) - 6, "B", "s tc");
      Q.line(g, F.x(t), 20, F.x(t), 200, "gd");
      const vf = k * A(t), vr = B(t), sc = 120 / k;
      el("rect", { x: 380, y: 200 - vf * sc, width: 40, height: vf * sc, class: "lb" }, g);
      el("rect", { x: 440, y: 200 - vr * sc, width: 40, height: vr * sc, class: "lc" }, g);
      txt(g, 400, 216, "정반응", "s", "middle"); txt(g, 460, 216, "역반응", "s", "middle");
      const eq = Math.abs(vf - vr) < 0.01;
      read.textContent = `[A] ${num(A(t), 2)} M, [B] ${num(B(t), 2)} M / 정반응 속도 ${num(vf, 2)}, 역반응 속도 ${num(vr, 2)}` + (eq ? " (평형, 두 속도가 같다)" : "");
    });
  });

  // H2 + I2 ⇄ 2HI, K = 49: 45x² − 49(a+b)x + 49ab = 0
  Q.def("chem-kc", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), K = 49;
    Q.bind(fig, ({ a, b }) => {
      clear(g);
      const p = K * (a + b), x = (p - Math.sqrt(p * p - 4 * (K - 4) * K * a * b)) / (2 * (K - 4));
      const H = a - x, I = b - x, HI = 2 * x, s = 50;
      const bar = (x0, v0, v1, lab, cls) => {
        el("rect", { x: x0, y: 190 - v0 * s, width: 30, height: v0 * s, class: "gd" }, g);
        el("rect", { x: x0 + 34, y: 190 - v1 * s, width: 30, height: v1 * s, class: cls }, g);
        txt(g, x0 + 32, 206, lab, "s", "middle");
      };
      Q.line(g, 30, 190, 330, 190, "ax");
      bar(40, a, H, "H₂", "lb"); bar(140, b, I, "I₂", "ld"); bar(240, 0, HI, "HI", "lc");
      txt(g, 40, 20, "왼쪽 점선 처음, 오른쪽 평형", "s");
      txt(g, 360, 80, "[HI]² / ([H₂][I₂])", "s"); txt(g, 360, 110, `= ${num(HI * HI / (H * I), 1)}`, "s tc");
      read.textContent = `평형 [H₂] ${num(H, 2)}, [I₂] ${num(I, 2)}, [HI] ${num(HI, 2)} M → K = ${num(HI * HI / (H * I), 1)}`;
    });
  });

  // Q와 K 비교 (로그 눈금 10⁻² ~ 10⁴), K = 49
  Q.def("chem-qk", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), K = 49, X = (v) => 40 + (Math.log10(v) + 2) / 6 * 440;
    Q.bind(fig, ({ h, r }) => {
      clear(g);
      const q = h * h / (r * r);
      Q.line(g, 40, 100, 480, 100, "ax");
      for (let e = -2; e <= 4; e++) { Q.line(g, X(10 ** e), 94, X(10 ** e), 106, "k"); txt(g, X(10 ** e), 124, ({ "-2": "10⁻²", "-1": "10⁻¹", 0: "1", 1: "10", 2: "10²", 3: "10³", 4: "10⁴" })[e], "s", "middle"); }
      Q.line(g, X(K), 70, X(K), 130, "d"); txt(g, X(K), 62, "K = 49", "s td", "middle");
      const xq = Math.max(40, Math.min(480, X(q)));
      Q.dot(g, xq, 100, "fb", 7); txt(g, xq, 160, `Q = ${num(q, 2)}`, "s tb", "middle");
      if (Math.abs(Math.log10(q / K)) > 0.02) Q.arrow(g, xq, 85, xq + (q < K ? 1 : -1) * Math.min(80, Math.abs(X(K) - xq) - 4), 85, "b", "fb");
      const dir = Math.abs(Math.log10(q / K)) <= 0.02 ? "평형 상태" : q < K ? "Q < K, 정반응 쪽으로 진행(HI가 늘어난다)" : "Q > K, 역반응 쪽으로 진행(HI가 줄어든다)";
      read.textContent = `Q = ${num(h, 1)}² / (${num(r, 2)} × ${num(r, 2)}) = ${num(q, 2)} → ${dir}`;
    });
  });

  // 2NO2 ⇄ N2O4, K = 5, NO2 환산 1 mol, 부피 V: K = yV/(1−2y)²
  Q.def("chem-shift", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), K = 5, n0 = 1;
    Q.bind(fig, ({ V }) => {
      clear(g);
      const p = 4 * K * n0 + V, y = (p - Math.sqrt(p * p - 16 * K * K * n0 * n0)) / (8 * K), no2 = n0 - 2 * y, c = no2 / V;
      const w = 60 + V * 60;
      el("rect", { x: 30, y: 60, width: w, height: 90, fill: `rgba(170,70,20,${Math.min(0.95, c * 1.6).toFixed(2)})` }, g);
      el("rect", { x: 30, y: 60, width: w, height: 90, class: "k" }, g);
      el("rect", { x: 30 + w, y: 95, width: 300 - w + 10, height: 20, class: "lk" }, g);
      txt(g, 30, 175, `부피 ${num(V, 2)} L`, "s");
      const s = 140;
      el("rect", { x: 370, y: 200 - no2 * s, width: 40, height: no2 * s, class: "lc" }, g);
      el("rect", { x: 430, y: 200 - y * 2 * s, width: 40, height: y * 2 * s, class: "lb" }, g);
      txt(g, 390, 216, "NO₂", "s", "middle"); txt(g, 450, 216, "N₂O₄(×2)", "s", "middle");
      read.textContent = `부피 ${num(V, 2)} L: NO₂ ${num(no2, 3)} mol (${num(c, 3)} M), N₂O₄ ${num(y, 3)} mol`;
    });
  });

  // pH: [H3O+] = 10^x, Kw = 1e-14
  Q.def("chem-ph", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), s = 11;
    Q.bind(fig, ({ x }) => {
      clear(g);
      const pH = -x, pOH = 14 - pH;
      Q.line(g, 40, 190, 300, 190, "ax");
      el("rect", { x: 70, y: 190 - (14 + x) * s, width: 60, height: (14 + x) * s, class: "lc" }, g);
      el("rect", { x: 190, y: 190 - (14 - pOH) * s, width: 60, height: (14 - pOH) * s, class: "lb" }, g);
      txt(g, 100, 206, "H₃O⁺", "s", "middle"); txt(g, 220, 206, "OH⁻", "s", "middle");
      txt(g, 44, 30, "농도의 지수 (−14 에서 0까지)", "s");
      const hue = pH < 7 ? 0 + pH / 7 * 120 : 120 + (pH - 7) / 7 * 140;
      el("rect", { x: 340, y: 60, width: 140, height: 80, fill: `hsl(${num(hue, 0)},70%,50%)` }, g);
      txt(g, 410, 165, `pH ${num(pH, 1)}`, "s", "middle");
      txt(g, 410, 185, Math.abs(pH - 7) < 0.01 ? "중성" : pH < 7 ? "산성" : "염기성", "s", "middle");
      read.textContent = `[H₃O⁺] = 10^${num(x, 1)} M, [OH⁻] = 10^${num(-pOH, 1)} M → pH ${num(pH, 1)}, pOH ${num(pOH, 1)}`;
    });
  });

  // 묽힘: 1.0 M 원액 v mL → 전체 V mL
  Q.def("chem-dilute", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const P = []; for (let i = 0; i < 40; i++) P.push([rnd(), rnd()]);
    Q.bind(fig, ({ v, V }) => {
      clear(g);
      const Vt = Math.max(V, v), n = v / 1000, M = n / (Vt / 1000), k = Math.round(v / 2.5);
      const box = (x, w, h, cnt) => {
        el("rect", { x, y: 200 - h, width: w, height: h, class: "lb" }, g); el("rect", { x, y: 20, width: w, height: 180, class: "gd" }, g);
        for (let i = 0; i < cnt; i++) Q.dot(g, x + 6 + P[i][0] * (w - 12), 200 - 6 - P[i][1] * (h - 12), "fc", 3);
      };
      box(40, 100, v * 1.5, k); txt(g, 90, 214, `원액 ${v} mL`, "s", "middle");
      Q.arrow(g, 160, 110, 220, 110, "k"); txt(g, 190, 100, "물", "s", "middle");
      box(240, 120, Vt * 0.35, k); txt(g, 300, 214, `전체 ${Vt} mL`, "s", "middle");
      txt(g, 390, 80, `용질 ${num(n, 3)} mol`, "s"); txt(g, 390, 110, `농도 ${num(M, 3)} M`, "s tc");
      read.textContent = `1.0 M × ${v} mL = ${num(M, 3)} M × ${Vt} mL (용질 ${num(n * 1000, 0)} mmol 그대로)`;
    });
  });

  // 중화 이온 수: 0.1 M HCl 10 mL + 0.1 M NaOH v mL (단위 0.1 mmol)
  Q.def("chem-ions", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ v }) => {
      clear(g);
      const H = Math.max(0, 10 - v), OH = Math.max(0, v - 10), Cl = 10, Na = v, s = 7;
      const B = [["H⁺", H, "lc"], ["Cl⁻", Cl, "lk"], ["Na⁺", Na, "la"], ["OH⁻", OH, "lb"]];
      Q.line(g, 30, 190, 300, 190, "ax");
      B.forEach(([n, c, cls], i) => { el("rect", { x: 45 + i * 65, y: 190 - c * s, width: 45, height: c * s, class: cls }, g); txt(g, 67 + i * 65, 206, n, "s", "middle"); txt(g, 67 + i * 65, 184 - c * s, `${c}`, "s", "middle"); });
      const tot = H + OH + Cl + Na;
      txt(g, 330, 60, `전체 이온 ${tot}`, "s"); txt(g, 330, 90, `생긴 물 ${Math.min(v, 10)}`, "s");
      txt(g, 330, 120, v < 10 ? "산성" : v === 10 ? "중화점, 중성" : "염기성", "s tc");
      txt(g, 330, 150, "(단위 0.1 mmol)", "s");
      read.textContent = `NaOH ${v} mL: H⁺ ${H}, Cl⁻ ${Cl}, Na⁺ ${Na}, OH⁻ ${OH} (× 0.1 mmol), 전체 ${tot}`;
    });
  });

  // 아세트산 0.1 M 20 mL를 0.1 M NaOH로 적정, Ka = 1.8e-5
  const Ka = 1.8e-5, pKa = -Math.log10(Ka);
  const titrPH = (v) => {
    const na = 0.1 * 20, nb = 0.1 * v, Vt = 20 + v;   // mmol, mL
    if (v < 1e-9) return -Math.log10(Math.sqrt(Ka * 0.1));
    if (nb < na - 1e-9) { const r = nb / (na - nb), p = pKa + Math.log10(r); return Math.max(p, -Math.log10(Math.sqrt(Ka * 0.1))); }
    if (Math.abs(nb - na) < 1e-9) { const c = na / Vt, oh = Math.sqrt(1e-14 / Ka * c); return 14 + Math.log10(oh); }
    const oh = (nb - na) / Vt + Math.sqrt(1e-14 / Ka * na / Vt); return 14 + Math.log10(oh);
  };
  Q.def("chem-titr", (fig, svg) => {
    const F = Q.frame(0, 30, 0, 14, 50, 330, 20, 210);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, 50, 210, 330, 210, "ax"); Q.line(bg, 50, 210, 50, 20, "ax");
    for (const p of [0, 7, 14]) txt(bg, 44, F.y(p) + 4, `${p}`, "s", "end");
    for (const v of [0, 10, 20, 30]) txt(bg, F.x(v), 226, `${v}`, "s", "middle");
    txt(bg, 56, 18, "pH", "s"); txt(bg, 330, 238, "NaOH (mL)", "s", "end");
    el("rect", { x: 50, y: F.y(10), width: 280, height: F.y(8.2) - F.y(10), class: "lc", opacity: 0.4 }, bg);
    Q.plot(bg, F, titrPH, "b", 0, 30, 600);
    Q.bind(fig, ({ v }) => {
      clear(g);
      const p = titrPH(v);
      Q.dot(g, F.x(v), F.y(p), "fd", 5);
      const a = Math.max(0, Math.min(1, (p - 8.2) / 1.8));
      el("path", { d: "M400 60 L440 60 L440 110 L480 190 L360 190 L400 110 Z", fill: `rgba(220,40,120,${(a * 0.8).toFixed(2)})` }, g);
      el("path", { d: "M400 60 L440 60 L440 110 L480 190 L360 190 L400 110 Z", class: "k" }, g);
      read.textContent = `NaOH ${num(v, 1)} mL: pH ${num(p, 2)}` + (Math.abs(v - 20) < 0.05 ? " (중화점)" : "") + (a > 0.05 ? ", 페놀프탈레인 붉은색" : ", 페놀프탈레인 무색");
    }, (k, v) => num(v, 1));
  });

  // 세계 인구(십억 명)와 합성 질소 비료 사용량(백만 t N), 대략값
  const POP = [[1900, 1.6], [1920, 1.9], [1940, 2.3], [1960, 3.0], [1980, 4.4], [2000, 6.1], [2020, 7.8]];
  const FER = [[1900, 0], [1920, 0.3], [1940, 1.5], [1960, 10], [1980, 60], [2000, 82], [2020, 110]];
  const lerp = (T, x) => { for (let i = 1; i < T.length; i++) if (x <= T[i][0]) { const [a, p] = T[i - 1], [b, q] = T[i]; return p + (q - p) * (x - a) / (b - a); } return T[T.length - 1][1]; };
  Q.def("chem-haber", (fig, svg) => {
    const F = Q.frame(1900, 2020, 0, 8, 60, 460, 20, 200), G = Q.frame(1900, 2020, 0, 120, 60, 460, 20, 200);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, 60, 200, 460, 200, "ax"); Q.line(bg, 60, 200, 60, 20, "ax"); Q.line(bg, 460, 200, 460, 20, "ax");
    for (let y = 1900; y <= 2020; y += 40) txt(bg, F.x(y), 216, `${y}`, "s", "middle");
    txt(bg, 64, 16, "인구(십억 명)", "s tb"); txt(bg, 456, 16, "질소 비료(백만 t)", "s tc", "end");
    Q.plot(bg, F, (x) => lerp(POP, x), "b", 1900, 2020, 120); Q.plot(bg, G, (x) => lerp(FER, x), "c", 1900, 2020, 120);
    Q.bind(fig, ({ y }) => {
      clear(g);
      Q.line(g, F.x(y), 20, F.x(y), 200, "gd");
      Q.dot(g, F.x(y), F.y(lerp(POP, y)), "fb", 5); Q.dot(g, F.x(y), G.y(lerp(FER, y)), "fc", 5);
      read.textContent = `${y}년: 세계 인구 약 ${num(lerp(POP, y) * 10, 0)}억 명, 합성 질소 비료 약 ${num(lerp(FER, y) * 100, 0)}만 t` + (y < 1913 ? " (하버-보슈법 공장 가동 전)" : "");
    });
  });
})();
