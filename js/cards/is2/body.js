/* 통합과학2 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;

  // 지질 시대: 46억 년을 24시간 시계로 (나이 단위 억 년, 대략값)
  Q.def("is2-clock", (fig, svg) => {
    const E = [[46, "지구 형성"], [38, "최초의 생명 흔적"], [24, "대기에 산소가 쌓임"], [6.35, "다세포 생물(에디아카라)"], [5.39, "캄브리아기 시작"], [4.7, "육상 식물"], [2.3, "공룡 출현"], [0.66, "공룡 멸종"], [0.003, "현생 인류"]];
    const cx = 130, cy = 130, R = 105;
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    el("circle", { cx, cy, r: R, class: "lk" }, bg); el("circle", { cx, cy, r: R, class: "k" }, bg);
    for (let h = 0; h < 24; h++) {
      const a = -Math.PI / 2 + 2 * Math.PI * h / 24;
      Q.line(bg, cx + (R - 6) * Math.cos(a), cy + (R - 6) * Math.sin(a), cx + R * Math.cos(a), cy + R * Math.sin(a), "ax");
      if (h % 3 === 0) txt(bg, cx + (R - 18) * Math.cos(a), cy + (R - 18) * Math.sin(a) + 4, String(h), "s", "middle");
    }
    E.forEach(([age]) => { const a = -Math.PI / 2 + 2 * Math.PI * (1 - age / 46); Q.dot(bg, cx + R * Math.cos(a), cy + R * Math.sin(a), "fb", 3); });
    Q.bind(fig, ({ e }) => {
      clear(g);
      const [age, name] = E[e], frac = 1 - age / 46, a = -Math.PI / 2 + 2 * Math.PI * frac;
      Q.line(g, cx, cy, cx + (R - 4) * Math.cos(a), cy + (R - 4) * Math.sin(a), "d");
      Q.dot(g, cx + R * Math.cos(a), cy + R * Math.sin(a), "fd", 6);
      const sec = frac * 86400, hh = Math.floor(sec / 3600), mm = Math.floor(sec % 3600 / 60), ss = Math.floor(sec % 60);
      txt(g, 270, 100, name, "");
      txt(g, 270, 128, age >= 1 ? `약 ${num(age, 2)}억 년 전` : `약 ${num(age * 1e4, 0)}만 년 전`, "s");
      txt(g, 270, 156, `하루 시계로 ${hh}시 ${mm}분 ${ss}초`, "td");
      read.textContent = `${name}: 자정까지 ${Math.round(86400 - sec)}초 남음`;
    }, (k, v) => E[v][1]);
  });

  // 산화 환원: Zn + Cu²⁺ → Zn²⁺ + Cu (입자 4쌍)
  Q.def("is2-redox", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ t }) => {
      clear(g);
      el("rect", { x: 40, y: 30, width: 70, height: 180, class: "lk" }, g); el("rect", { x: 40, y: 30, width: 70, height: 180, class: "k" }, g);
      txt(g, 75, 22, "아연판", "s", "middle");
      el("rect", { x: 130, y: 60, width: 360, height: 150, class: "lb" }, g); txt(g, 310, 52, "황산 구리 수용액", "s", "middle");
      for (let i = 0; i < 4; i++) {
        const y = 80 + i * 34, gone = i < t;
        // 아연 원자(판 안) 또는 녹아 나간 Zn²⁺
        if (!gone) { el("circle", { cx: 95, cy: y, r: 12, class: "lk" }, g); el("circle", { cx: 95, cy: y, r: 12, class: "k" }, g); txt(g, 95, y + 4, "Zn", "s", "middle"); }
        else { el("circle", { cx: 200, cy: y, r: 12, class: "lc" }, g); txt(g, 200, y + 4, "Zn²⁺", "s", "middle"); }
        // 구리 이온 또는 판에 붙은 구리 원자
        if (!gone) { el("circle", { cx: 400, cy: y, r: 12, class: "la" }, g); txt(g, 400, y + 4, "Cu²⁺", "s", "middle"); }
        else { el("circle", { cx: 122, cy: y, r: 11, class: "ld" }, g); txt(g, 122, y + 4, "Cu", "s", "middle"); }
      }
      if (t > 0 && t <= 4) { const y = 80 + (t - 1) * 34; Q.arrow(g, 110, y - 16, 380, y - 16, "d dsh", "fd"); txt(g, 250, y - 20, "전자 2개", "s td", "middle"); }
      read.textContent = `아연 ${t}개가 산화되어 전자 ${2 * t}개를 내놓고, 구리 이온 ${t}개가 그 전자를 받아 환원되었다`;
    });
  });

  // 중화 반응: 염산 10 mL(H⁺ 10단위)에 NaOH v mL(OH⁻ v단위)
  Q.def("is2-neutral", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ v }) => {
      clear(g);
      const H = Math.max(0, 10 - v), OH = Math.max(0, v - 10), W = Math.min(10, v), Na = v, Cl = 10;
      const bars = [["H⁺", H, "ld"], ["OH⁻", OH, "lb"], ["H₂O(새로 생긴)", W, "la"], ["Na⁺", Na, "lk"], ["Cl⁻", Cl, "lk"]];
      bars.forEach(([name, n, cls], i) => {
        const y = 20 + i * 42;
        txt(g, 120, y + 20, name, "s", "end");
        el("rect", { x: 130, y, width: n * 17, height: 28, class: cls }, g);
        txt(g, 136 + n * 17, y + 20, String(n), "s");
      });
      const st = H > 0 ? "산성" : OH > 0 ? "염기성" : "중성";
      read.textContent = `NaOH ${v} mL: H⁺ ${H}, OH⁻ ${OH}, 새로 생긴 물 ${W} (상대 개수) → ${st}`;
    });
  });

  // 발열·흡열: 에너지 높이 모식
  Q.def("is2-heat", (fig, svg) => {
    const R = [["철의 산화(손난로)", 150, 210, "발열"], ["중화 반응", 150, 190, "발열"], ["질산 암모늄 녹이기(냉찜질 팩)", 170, 130, "흡열"]];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const [name, y1, y2, kind] = R[r];
      Q.line(g, 40, 225, 300, 225, "ax"); Q.line(g, 40, 225, 40, 20, "ax"); txt(g, 46, 18, "물질의 에너지", "s");
      Q.line(g, 60, y1 - 50, 140, y1 - 50, "k"); txt(g, 100, y1 - 58, "반응물", "s", "middle");
      Q.line(g, 200, y2 - 50, 280, y2 - 50, "k"); txt(g, 240, y2 - 58, "생성물", "s", "middle");
      Q.arrow(g, 170, y1 - 50, 170, y2 - 50, kind === "발열" ? "d" : "b", kind === "발열" ? "fd" : "fb");
      // 주위 온도계
      el("rect", { x: 380, y: 40, width: 18, height: 160, class: "lk" }, g); el("rect", { x: 380, y: 40, width: 18, height: 160, class: "k" }, g);
      const h = kind === "발열" ? 110 : 40;
      el("rect", { x: 383, y: 200 - h, width: 12, height: h, class: kind === "발열" ? "ld" : "lb" }, g);
      txt(g, 410, 200 - h + 4, kind === "발열" ? "주위 온도 ↑" : "주위 온도 ↓", "s");
      read.textContent = `${name}: ${kind} 반응, 열이 ${kind === "발열" ? "주위로 나간다" : "주위에서 들어온다"}`;
    }, (k, v) => R[v][0]);
  });

  // 생태계: 정육면체의 겉넓이/부피
  Q.def("is2-ear", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      const s = 20, x = 60, y = 200 - a * s, d = a * s * 0.45;
      el("path", { d: `M${x} ${y} L${x + d} ${y - d} L${x + d + a * s} ${y - d} L${x + a * s} ${y} Z`, class: "lb" }, g);
      el("path", { d: `M${x + a * s} ${y} L${x + d + a * s} ${y - d} L${x + d + a * s} ${y - d + a * s} L${x + a * s} ${y + a * s} Z`, class: "lc" }, g);
      el("rect", { x, y, width: a * s, height: a * s, class: "la" }, g);
      el("rect", { x, y, width: a * s, height: a * s, class: "k" }, g);
      const S = 6 * a * a, V = a ** 3;
      txt(g, 330, 70, `한 변 ${a}`, "");
      txt(g, 330, 100, `겉넓이 6 × ${a}² = ${S}`, "s");
      txt(g, 330, 125, `부피 ${a}³ = ${V}`, "s");
      txt(g, 330, 155, `겉넓이 ÷ 부피 = ${num(S / V)}`, "td");
      read.textContent = `한 변이 ${a}배가 되면 부피는 ${V}배, 겉넓이는 ${a * a}배: 부피당 겉넓이 ${num(S / V)}`;
    });
  });

  // 생태 피라미드: 전달 효율 e%
  Q.def("is2-pyramid", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), names = ["생산자", "1차 소비자", "2차 소비자", "3차 소비자"];
    Q.bind(fig, ({ e }) => {
      clear(g);
      let E = 10000;
      const vals = names.map(() => { const v = E; E *= e / 100; return v; });
      vals.forEach((v, i) => {
        const w = Math.max(6, 400 * Math.sqrt(v / 10000)), y = 190 - i * 48;
        el("rect", { x: 260 - w / 2, y, width: w, height: 40, class: ["la", "lc", "lb", "ld"][i] }, g);
        txt(g, 20, y + 25, names[i], "s");
        txt(g, 500, y + 25, num(v, 1), "s", "end");
      });
      read.textContent = `효율 ${e}%: 생산자 10000 → 3차 소비자 ${num(vals[3], 2)} (막대 폭은 에너지의 제곱근에 비례하게 줄여 그렸다)`;
    });
  });

  // 온실 효과: 한 층 대기 모형 Ts = Te (2 / (2 − f))^(1/4), Te = 255 K
  Q.def("is2-green", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ f }) => {
      clear(g);
      const a = f / 100, Ts = 255 * Math.pow(2 / (2 - a), 0.25), C = Ts - 273.15;
      el("rect", { x: 20, y: 200, width: 480, height: 30, class: "lc" }, g); txt(g, 30, 220, "지표", "s");
      el("rect", { x: 20, y: 80, width: 480, height: 40, class: "lb", opacity: 0.25 + a * 0.6 }, g); txt(g, 30, 104, "대기(온실 기체)", "s");
      Q.arrow(g, 80, 20, 120, 198, "c", "fc"); txt(g, 60, 16, "햇빛", "s tc");
      Q.arrow(g, 250, 198, 250, 124, "d", "fd"); txt(g, 258, 160, "지표의 적외선", "s td");
      if (a > 0) { Q.arrow(g, 300, 124, 300, 198, "d dsh", "fd"); txt(g, 308, 170, "되돌아옴", "s td"); }
      Q.arrow(g, 400, 78, 400, 18, "d", "fd"); txt(g, 408, 40, "우주로", "s td");
      txt(g, 500, 190, `지표 평균 ${num(C, 1)} °C`, "", "end");
      read.textContent = `대기가 적외선의 ${f}%를 붙잡으면 지표 평균 약 ${num(C, 1)} °C (대기가 없으면 약 −18 °C)`;
    });
  });

  // 태양 에너지의 흐름
  Q.def("is2-flow", (fig, svg) => {
    const P = [
      ["바람과 해류", ["햇빛", "지표·대기 가열(열)", "온도 차", "바람·해류(운동)", "풍력 발전"]],
      ["물의 순환", ["햇빛", "바닷물 증발(열)", "구름·비", "높은 곳의 물(위치)", "수력 발전"]],
      ["광합성과 먹이", ["햇빛", "광합성", "포도당(화학)", "먹이 사슬", "우리의 밥"]],
      ["화석 연료", ["햇빛", "옛 생물의 광합성", "땅속에 묻힘", "석탄·석유(화학)", "연소·발전"]],
    ];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const [name, steps] = P[p];
      steps.forEach((s, i) => {
        const x = 10 + i * 102, y = 90;
        el("rect", { x, y, width: 92, height: 56, class: i === 0 ? "lc" : i === steps.length - 1 ? "la" : "lb" }, g);
        const words = s.split("(");
        txt(g, x + 46, y + 26, words[0], "s", "middle");
        if (words[1]) txt(g, x + 46, y + 44, "(" + words[1], "s", "middle");
        if (i) Q.arrow(g, x - 10, y + 28, x - 1, y + 28, "k", "fk");
      });
      txt(g, 260, 50, name, "", "middle");
      read.textContent = `${name}: ${steps.join(" → ")}`;
    }, (k, v) => P[v][0]);
  });

  // 송전: P = 100 MW, R = 10 Ω, 전압 단계
  Q.def("is2-trans", (fig, svg) => {
    const VS = [22.9, 66, 154, 220, 345, 500, 765];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), P = 1e8, R = 10;
    Q.bind(fig, ({ v }) => {
      clear(g);
      const V = VS[v - 1] * 1e3, I = P / V, L = I * I * R, pct = 100 * L / P;
      txt(g, 20, 30, `송전 전압 ${VS[v - 1]} kV`, "");
      txt(g, 20, 70, "전류", "s"); el("rect", { x: 80, y: 56, width: Math.min(420, I / 4400 * 420), height: 20, class: "lb" }, g); txt(g, 86 + Math.min(410, I / 4400 * 420), 71, `${num(I, 0)} A`, "s");
      txt(g, 20, 120, "손실", "s"); el("rect", { x: 80, y: 106, width: Math.min(420, pct / 100 * 420), height: 20, class: "ld" }, g); txt(g, 86 + Math.min(380, pct / 100 * 420), 121, `${pct < 1 ? num(pct, 2) : num(pct, 1)} %`, "s");
      txt(g, 20, 170, "전류는 전압에 반비례, 손실은 전압의 제곱에 반비례", "s");
      read.textContent = pct >= 100 ? `${VS[v - 1]} kV로는 전력을 보낼 수 없을 만큼 손실이 크다(계산상 ${num(pct, 0)}%)` : `${VS[v - 1]} kV: 전류 ${num(I, 0)} A, 손실 ${num(L / 1e6, 2)} MW (보내는 전력의 ${num(pct, 2)}%)`;
    }, (k, x) => String(VS[x - 1]));
  });

  // 에너지 효율: 같은 밝기의 전등 (소비 전력 W, 빛 효율, 대략값)
  Q.def("is2-eff", (fig, svg) => {
    const B = [["백열전구", 60, 0.04], ["형광등", 14, 0.12], ["LED 전구", 8, 0.3]];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ b }) => {
      clear(g);
      const [name, W, e] = B[b], s = 6;
      txt(g, 20, 30, `${name}: 소비 전력 ${W} W`, "");
      el("rect", { x: 20, y: 50, width: W * s, height: 34, class: "lk" }, g); el("rect", { x: 20, y: 50, width: W * s, height: 34, class: "k" }, g);
      txt(g, 26 + W * s, 72, `들어간 전기 ${W} J/s`, "s");
      el("rect", { x: 20, y: 110, width: W * e * s, height: 34, class: "lc" }, g);
      el("rect", { x: 20 + W * e * s, y: 110, width: W * (1 - e) * s, height: 34, class: "ld" }, g);
      txt(g, 20, 165, `빛 ${num(W * e, 1)} J/s (${num(e * 100, 0)}%)`, "s tc");
      txt(g, 20, 185, `열 ${num(W * (1 - e), 1)} J/s`, "s td");
      read.textContent = `${name}: 빛 + 열 = ${W} J/s로 보존되지만, 빛으로 쓰인 것은 ${num(e * 100, 0)}%`;
    }, (k, v) => B[v][0]);
  });

  // 감염병 진단: 1000명 격자, 민감도 95%, 특이도 98%
  Q.def("is2-bayes", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const N = 1000, inf = Math.round(N * p / 100), tp = Math.round(inf * 0.95), fp = Math.round((N - inf) * 0.02);
      // 50 × 20 격자: 앞쪽 inf칸이 감염자
      for (let i = 0; i < N; i++) {
        const x = 10 + (i % 50) * 10, y = 10 + Math.floor(i / 50) * 10;
        let cls = "lk";
        if (i < inf) cls = i < tp ? "ld" : "lb";            // 감염자: 진짜 양성(빨강) / 거짓 음성(파랑)
        else if (i - inf < fp) cls = "lc";                  // 비감염자 가운데 거짓 양성(노랑)
        el("rect", { x, y, width: 9, height: 9, class: cls }, g);
      }
      txt(g, 10, 228, `진짜 양성 ${tp}명(빨강), 거짓 양성 ${fp}명(노랑), 거짓 음성 ${inf - tp}명(파랑)`, "s");
      const ppv = tp / (tp + fp);
      txt(g, 10, 250, `양성 ${tp + fp}명 가운데 실제 감염 ${tp}명 → ${num(100 * ppv, 0)}%`, "s td");
      read.textContent = `감염자 비율 ${p}%: 양성이 실제 감염일 확률 약 ${num(100 * ppv, 0)}%`;
    });
  });

  // 빅데이터: 교란 변수(기온)가 만든 상관 (가상 자료, 고정 난수)
  Q.def("is2-confound", (fig, svg) => {
    let s = 11;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const nrm = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
    const pts = Array.from({ length: 80 }, () => ({ t: rnd(), a: nrm(), b: nrm() }));
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      Q.line(g, 50, 230, 500, 230, "ax"); Q.line(g, 50, 230, 50, 15, "ax");
      txt(g, 500, 250, "아이스크림 판매", "s", "end"); txt(g, 56, 14, "물놀이 사고", "s");
      const xs = [], ys = [];
      pts.forEach(({ t, a, b }) => {
        const x = k * 2 * (t - 0.5) + 0.35 * a, y = k * 2 * (t - 0.5) + 0.35 * b;
        xs.push(x); ys.push(y);
        Q.dot(g, 275 + x * 150, 122 - y * 70, t > 0.5 ? "fd" : "fb", 3.5);
      });
      const mx = xs.reduce((u, v) => u + v) / xs.length, my = ys.reduce((u, v) => u + v) / ys.length;
      let sxy = 0, sxx = 0, syy = 0;
      xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
      const r = sxy / Math.sqrt(sxx * syy);
      read.textContent = `상관계수 약 ${num(r, 2)} (빨강: 더운 날, 파랑: 서늘한 날)`;
    });
  });

  // 인공지능 학습: 두 무리의 점과 경계선 y = m x + c (가상 자료, 고정 난수)
  Q.def("is2-learn", (fig, svg) => {
    let s = 5;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const pts = [];
    for (let i = 0; i < 30; i++) pts.push({ x: 1 + rnd() * 4, y: 5 + rnd() * 4, k: 1 });
    for (let i = 0; i < 30; i++) pts.push({ x: 4 + rnd() * 5, y: 1 + rnd() * 4, k: 0 });
    const F = Q.frame(0, 10, 0, 10, 50, 500, 15, 255);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, F.X0, F.Y1, F.X1, F.Y1, "ax"); Q.line(bg, F.X0, F.Y1, F.X0, F.Y0, "ax");
    txt(bg, F.X1, F.Y1 + 18, "특징 1", "s", "end"); txt(bg, F.X0 + 6, F.Y0 + 10, "특징 2", "s");
    Q.bind(fig, ({ m, c }) => {
      clear(g);
      let ok = 0;
      pts.forEach((p) => {
        const above = p.y > m * p.x + c, right = (above ? 1 : 0) === p.k;
        if (right) ok++;
        Q.dot(g, F.x(p.x), F.y(p.y), p.k ? "fd" : "fb", 4);
        if (!right) el("circle", { cx: F.x(p.x), cy: F.y(p.y), r: 8, class: "k" }, g);
      });
      Q.plot(g, F, (x) => m * x + c, "c");
      read.textContent = `맞힌 비율 ${ok}/${pts.length} = ${num(100 * ok / pts.length, 0)}% (동그라미는 틀린 점, 선 위쪽을 빨강으로 판정)`;
    });
  });

  // 과학기술과 윤리: 공개 범위에 따른 방역 효과와 식별 위험 (모식)
  Q.def("is2-tradeoff", (fig, svg) => {
    const L = ["지역만", "동까지", "방문 장소", "장소+시각", "+나이·성별"];
    const benefit = [10, 30, 60, 80, 85], risk = [2, 8, 25, 55, 90];
    const X = (i) => 70 + i * 100, Y = (v) => 200 - v * 1.7;
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, 50, 200, 500, 200, "ax"); Q.line(bg, 50, 200, 50, 20, "ax");
    L.forEach((s, i) => txt(bg, X(i), 218, s, "s", "middle"));
    const path = (arr) => arr.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join("");
    el("path", { d: path(benefit), class: "a" }, bg); el("path", { d: path(risk), class: "d" }, bg);
    txt(bg, X(4) + 10, Y(85) - 6, "방역 효과", "s ta", "end"); txt(bg, X(4) - 4, Y(90) + 16, "개인이 드러날 위험", "s td", "end");
    Q.bind(fig, ({ d }) => {
      clear(g);
      Q.line(g, X(d), 20, X(d), 200, "k dsh");
      Q.dot(g, X(d), Y(benefit[d]), "fa", 5); Q.dot(g, X(d), Y(risk[d]), "fd", 5);
      read.textContent = `${L[d]} 공개: 방역 효과 ${benefit[d]}, 식별 위험 ${risk[d]} (상대값)`;
    }, (k, v) => L[v]);
  });

  // 자연선택: 내성 비율 p, 생존 이점 s배 (세대마다 비가 s배)
  Q.def("is2-select", (fig, svg) => {
    const F = Q.frame(0, 15, 0, 1, 50, 500, 20, 220);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, F.X0, F.Y1, F.X1, F.Y1, "ax"); Q.line(bg, F.X0, F.Y1, F.X0, F.Y0, "ax");
    [0, 0.5, 1].forEach((v) => txt(bg, F.X0 - 6, F.y(v) + 4, `${v * 100}%`, "s", "end"));
    [0, 5, 10, 15].forEach((n) => txt(bg, F.x(n), F.Y1 + 16, String(n), "s", "middle"));
    txt(bg, F.X1, F.Y1 + 32, "세대", "s", "end");
    Q.bind(fig, ({ s }) => {
      clear(g);
      let p = 0.01, d = "", half = null;
      for (let n = 0; n <= 15; n++) {
        d += (n ? "L" : "M") + F.x(n) + " " + F.y(p);
        Q.dot(g, F.x(n), F.y(p), "fd", 3);
        if (half === null && p >= 0.5) half = n;
        p = p * s / (p * s + (1 - p));
      }
      el("path", { d, class: "d" }, g);
      read.textContent = s === 1 ? "생존율 차이가 없으면 비율이 변하지 않는다" : `내성 세균이 절반을 넘는 때: ${half === null ? "15세대 안에는 없음" : half + "세대"}`;
    });
  });
})();
