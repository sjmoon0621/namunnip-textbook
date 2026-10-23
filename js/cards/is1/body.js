/* 통합과학1 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;

  // 시간과 공간의 측정: 10의 거듭제곱 길이 눈금
  Q.def("is1-scale", (fig, svg) => {
    const things = [
      [-15, "원자핵"], [-10, "원자"], [-8, "바이러스"], [-5, "세포"], [-3, "모래알"], [0, "사람 키"],
      [3, "산의 높이"], [7, "지구 지름"], [9, "태양 지름"], [11, "지구–태양 거리"], [16, "1광년"], [21, "우리은하 지름"], [27, "관측 가능한 우주"],
    ];
    const X = (n) => 20 + (n + 15) * (480 / 42);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, 20, 120, 500, 120, "ax");
    for (let n = -15; n <= 27; n++) Q.line(bg, X(n), 116, X(n), n % 5 === 0 ? 128 : 124, "ax");
    [-15, -10, -5, 0, 5, 10, 15, 20, 25].forEach((n) => txt(bg, X(n), 146, n ? `10${n < 0 ? "⁻" : ""}${String(Math.abs(n)).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("")}` : "1 m", "s", "middle"));
    things.forEach(([n], i) => Q.dot(bg, X(n), 120, "fb", 3));
    Q.bind(fig, ({ n }) => {
      clear(g);
      let best = things[0];
      things.forEach((t) => { if (Math.abs(t[0] - n) < Math.abs(best[0] - n)) best = t; });
      Q.line(g, X(n), 60, X(n), 120, "d");
      Q.dot(g, X(n), 120, "fd", 6);
      txt(g, Math.min(470, Math.max(50, X(n))), 50, `10^${n} m 근처: ${best[1]}`, "td", "middle");
      txt(g, 260, 190, `한 칸 = 10배, 1 m에서 ${Math.abs(n)}칸 ${n >= 0 ? "오른쪽" : "왼쪽"}`, "s", "middle");
      read.textContent = `10^${n} m는 1 m의 ${n >= 0 ? "10^" + n + "배" : "10^" + (-n) + "분의 1"}`;
    });
  });

  // 기본량과 단위: 유도 단위를 kg, m, s의 지수로
  Q.def("is1-units", (fig, svg) => {
    const U = [
      ["속력", "m/s", [0, 1, -1]], ["가속도", "m/s²", [0, 1, -2]], ["힘 N", "kg·m/s²", [1, 1, -2]],
      ["에너지 J", "kg·m²/s²", [1, 2, -2]], ["압력 Pa", "kg/(m·s²)", [1, -1, -2]], ["일률 W", "kg·m²/s³", [1, 2, -3]],
    ];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), base = ["kg", "m", "s"], cls = ["la", "lb", "lc"];
    Q.bind(fig, ({ u }) => {
      clear(g);
      const [name, unit, e] = U[u];
      txt(g, 260, 30, `${name} = ${unit}`, "", "middle");
      base.forEach((b, i) => {
        const x = 90 + i * 150, h = Math.abs(e[i]) * 25, y0 = 120;
        Q.line(g, x - 50, y0, x + 50, y0, "ax");
        if (e[i]) el("rect", { x: x - 25, y: e[i] > 0 ? y0 - h : y0, width: 50, height: h, class: cls[i] }, g);
        txt(g, x + 32, y0 + 5, b, "");
        txt(g, x, e[i] >= 0 ? y0 - h - 6 : y0 + h + 16, `지수 ${e[i]}`, "s", "middle");
      });
      read.textContent = `${name}: kg^${e[0]} · m^${e[1]} · s^${e[2]}`;
    }, (k, v) => U[v][0]);
  });

  // 디지털 신호: 표본화와 양자화
  Q.def("is1-sample", (fig, svg) => {
    const F = Q.frame(0, 2, -1.2, 1.2, 20, 500, 20, 220);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const sig = (t) => 0.9 * Math.sin(2 * Math.PI * t) + 0.25 * Math.sin(6 * Math.PI * t + 0.6) * 0.6;
    Q.line(bg, F.X0, F.y(0), F.X1, F.y(0), "ax");
    Q.plot(bg, F, sig, "gd", 0, 2, 300);
    Q.bind(fig, ({ s, b }) => {
      clear(g);
      const L = 2 ** b, q = (v) => Math.round(((v + 1.2) / 2.4) * (L - 1)) / (L - 1) * 2.4 - 1.2;
      for (let k = 0; k < L; k++) { const y = -1.2 + 2.4 * k / (L - 1); if (L <= 16) Q.line(g, F.X0, F.y(y), F.X1, F.y(y), "gd dsh"); }
      let d = "", prev = null;
      const n = s * 2;
      for (let i = 0; i <= n; i++) {
        const t = i / s, v = q(sig(t));
        Q.line(g, F.x(t), F.y(0), F.x(t), F.y(sig(t)), "ax");
        Q.dot(g, F.x(t), F.y(v), "fd", 3.5);
        d += (i ? `L${F.x(t)} ${F.y(prev)}L` : "M") + `${F.x(t)} ${F.y(v)}`;
        prev = v;
      }
      el("path", { d, class: "d" }, g);
      read.textContent = `1주기에 ${s}번 재고, 값을 ${L}단계(${b}비트)로 나타낸다` + (s < 6 ? ", 표본이 적어 빠른 떨림이 사라진다" : "");
    });
  });

  // 스펙트럼: 원소의 방출선과 별빛의 흡수선 (파장 nm)
  Q.def("is1-spec", (fig, svg) => {
    const E = [["수소", [656.3, 486.1, 434.0, 410.2]], ["나트륨", [589.0, 589.6]], ["칼슘", [393.4, 396.8]], ["헬륨", [447.1, 471.3, 492.2, 501.6, 587.6, 667.8]]];
    const star = [656.3, 486.1, 434.0, 410.2, 589.0, 589.6, 393.4, 396.8];
    const X = (w) => 20 + (w - 380) * 480 / 320;   // 380~700 nm
    const hue = (w) => w < 440 ? 270 - (w - 380) * 0.6 : w < 490 ? 230 - (w - 440) * 1.2 : w < 580 ? 170 - (w - 490) * 1.1 : w < 645 ? 60 - (w - 580) * 0.8 : 5;
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    for (let w = 380; w < 700; w += 2) el("rect", { x: X(w), y: 40, width: X(w + 2) - X(w) + 0.5, height: 50, style: `fill:hsl(${hue(w)},70%,55%)` }, bg);
    star.forEach((w) => Q.line(bg, X(w), 40, X(w), 90, "k"));
    txt(bg, 20, 32, "별빛 (흡수 스펙트럼)", "s");
    for (let w = 400; w <= 700; w += 50) txt(bg, X(w), 215, `${w} nm`, "s", "middle");
    Q.bind(fig, ({ e }) => {
      clear(g);
      const [name, lines] = E[e];
      el("rect", { x: 20, y: 130, width: 480, height: 50, class: "lk" }, g);
      el("rect", { x: 20, y: 130, width: 480, height: 50, style: "fill:#111" }, g);
      let hit = 0;
      lines.forEach((w) => {
        el("rect", { x: X(w) - 1.2, y: 130, width: 2.4, height: 50, style: `fill:hsl(${hue(w)},80%,60%)` }, g);
        const m = star.some((s) => Math.abs(s - w) < 0.6);
        if (m) { hit++; Q.line(g, X(w), 92, X(w), 128, "d dsh"); }
      });
      txt(g, 20, 122, `${name} (방출 스펙트럼)`, "s");
      read.textContent = `${name}의 선 ${lines.length}개 가운데 ${hit}개가 별빛의 흡수선과 겹친다` + (hit === lines.length ? ": 이 별에 있다" : hit ? "" : ": 이 별의 흡수선과 맞지 않는다");
    }, (k, v) => E[v][0]);
  });

  // 원소의 생성: 핵자당 결합 에너지 (MeV, 대표값)
  Q.def("is1-bind", (fig, svg) => {
    const N = [["²H", 2, 1.11], ["⁴He", 4, 7.07], ["¹²C", 12, 7.68], ["¹⁶O", 16, 7.98], ["²⁸Si", 28, 8.45], ["⁵⁶Fe", 56, 8.79], ["⁹⁰Zr", 90, 8.71], ["¹⁹⁷Au", 197, 7.92], ["²³⁸U", 238, 7.57]];
    const X = (A) => 50 + Math.log(A) / Math.log(250) * 450, Y = (e) => 230 - e * 24;
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.line(bg, 50, 230, 505, 230, "ax"); Q.line(bg, 50, 230, 50, 15, "ax");
    [0, 2, 4, 6, 8].forEach((e) => txt(bg, 44, Y(e) + 4, String(e), "s", "end"));
    [1, 10, 100].forEach((A) => txt(bg, X(A), 246, String(A), "s", "middle"));
    txt(bg, 505, 246, "질량수(로그 눈금)", "s", "end"); txt(bg, 56, 14, "핵자당 결합 에너지 (MeV)", "s");
    let d = "";
    N.forEach(([, A, e], i) => { d += (i ? "L" : "M") + X(A) + " " + Y(e); });
    el("path", { d, class: "b" }, bg);
    N.forEach(([s, A, e]) => { Q.dot(bg, X(A), Y(e), "fb", 3); txt(bg, X(A), Y(e) - 8, s, "s", "middle"); });
    Q.bind(fig, ({ i }) => {
      clear(g);
      const [s, A, e] = N[i];
      Q.dot(g, X(A), Y(e), "fd", 7);
      Q.line(g, X(56), Y(8.79), X(56), 230, "c dsh");
      read.textContent = `${s}: 질량수 ${A}, 핵자당 약 ${e} MeV` + (A < 56 ? ", 철보다 가벼워 융합하면 에너지가 나온다" : A === 56 ? ", 가장 단단히 묶인 핵" : ", 철보다 무거워 융합으로 만들려면 에너지가 든다");
    }, (k, v) => N[v][0]);
  });

  // 원소의 주기성: 전자 껍질 채우기 (원자 번호 1~20)
  Q.def("is1-shell", (fig, svg) => {
    const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca".split(" ");
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ z }) => {
      clear(g);
      const cap = [2, 8, 8, 2], sh = [];
      let left = z;
      cap.forEach((c) => { if (left > 0) { sh.push(Math.min(c, left)); left -= c; } });
      const cx = 150, cy = 125;
      el("circle", { cx, cy, r: 14, class: "ld" }, g); txt(g, cx, cy + 4, `+${z}`, "s", "middle");
      sh.forEach((n, k) => {
        const r = 34 + k * 26;
        el("circle", { cx, cy, r, class: "gd" }, g);
        for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + 2 * Math.PI * i / Math.max(n, 1); Q.dot(g, cx + r * Math.cos(a), cy + r * Math.sin(a), k === sh.length - 1 ? "fb" : "fk", 4); }
      });
      const v = sh[sh.length - 1], group = z <= 2 ? (z === 1 ? 1 : 18) : v === 8 ? 18 : v <= 2 ? v : v + 10;
      txt(g, 300, 80, `${SYM[z - 1]} (원자 번호 ${z})`, "");
      txt(g, 300, 110, `전자 배치 (${sh.join(", ")})`, "s");
      txt(g, 300, 135, `원자가 전자 ${z === 2 || v === 8 ? 0 : v}개`, "s tb");
      txt(g, 300, 160, `${sh.length}주기 ${group}족`, "s");
      read.textContent = `${SYM[z - 1]}: 껍질 ${sh.length}개, 바깥 껍질 전자 ${v}개` + (v === 8 || z === 2 ? " (가득 차서 반응성이 거의 없다)" : "");
    }, (k, v) => `${v} ${SYM[v - 1]}`);
  });

  // 화학 결합: NaCl 전자 이동, H₂·H₂O 전자쌍 공유 (바깥 껍질만 그림)
  Q.def("is1-bond", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const names = ["이온 결합 NaCl", "공유 결합 H₂", "공유 결합 H₂O"];
    const atom = (x, y, r, label, n, cls, skip) => {
      el("circle", { cx: x, cy: y, r, class: "gd" }, g);
      txt(g, x, y + 5, label, "", "middle");
      for (let i = 0; i < n; i++) { if (skip && skip(i)) continue; const a = Math.PI + 2 * Math.PI * i / 8; Q.dot(g, x + r * Math.cos(a), y + r * Math.sin(a), cls, 4.5); }
    };
    Q.bind(fig, ({ m, t }) => {
      clear(g);
      if (m === 0) {
        const nx = 150, cx = 370, y = 105;
        atom(nx, y, 50, t < 1 ? "Na" : "Na⁺", 0, "fb");
        atom(cx, y, 60, t < 1 ? "Cl" : "Cl⁻", 7, "fk");
        const ex = nx + 50 + (cx - 60 - (nx + 50)) * t;   // 나트륨의 바깥 전자 1개가 염소 쪽으로
        Q.dot(g, ex, y, "fd", 5.5);
        if (t === 1) txt(g, 260, 200, "Na⁺ (2, 8)  Cl⁻ (2, 8, 8): 서로 끌어당긴다", "s", "middle");
        read.textContent = t < 1 ? "나트륨의 바깥 전자 1개(빨강)가 염소로 옮겨 간다" : "전자를 잃은 Na⁺와 얻은 Cl⁻가 전기적 인력으로 결합한다";
      } else if (m === 1) {
        const d = 160 - 70 * t;
        atom(260 - d / 2, 105, 40, "H", 0); atom(260 + d / 2, 105, 40, "H", 0);
        Q.dot(g, 260 - d / 2 + 40, 105 - 6 * t, "fd", 5); Q.dot(g, 260 + d / 2 - 40, 105 + 6 * t, "fd", 5);
        read.textContent = t < 1 ? "두 수소가 전자를 하나씩 내놓으며 가까워진다" : "전자쌍 하나를 함께 써서 각 수소는 헬륨처럼 전자 2개를 갖는다";
      } else {
        const ox = 260, oy = 120, hx = 120 - 30 * t;
        atom(ox, oy, 50, "O", 8, "fk", (i) => i === 0 || i === 4);
        atom(ox - hx, oy - 30, 32, "H", 0); atom(ox + hx, oy - 30, 32, "H", 0);
        Q.dot(g, ox - hx + 32, oy - 30 + 10 * t, "fd", 5); Q.dot(g, ox + hx - 32, oy - 30 + 10 * t, "fd", 5);
        read.textContent = t < 1 ? "산소(바깥 전자 6개)와 수소 두 개가 다가간다" : "전자쌍 두 개를 공유해 산소는 바깥 전자 8개, 수소는 각 2개가 된다";
      }
    }, (k, v) => k === "m" ? names[v] : num(v));
  });

  // 구성 물질: 단위체 k가지로 길이 n인 사슬 k^n가지
  Q.def("is1-chain", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cls = ["la", "lb", "lc", "ld"];
    Q.bind(fig, ({ k, n }) => {
      clear(g);
      const w = Math.min(44, 460 / n);
      for (let i = 0; i < n; i++) {
        const x = 30 + i * w;
        el("circle", { cx: x + w / 2, cy: 70, r: w / 2 - 4, class: cls[i % 4] }, g);
        txt(g, x + w / 2, 75, `${k}`, "s", "middle");
        if (i) Q.line(g, x - 4, 70, x + 4, 70, "k");
      }
      const v = k ** n, e = Math.floor(Math.log10(v));
      txt(g, 30, 140, `자리 ${n}개 × 자리마다 ${k}가지 → ${k}^${n}`, "");
      txt(g, 30, 175, e < 7 ? `= ${v.toLocaleString("ko-KR")}가지` : `≈ ${(v / 10 ** e).toFixed(2)} × 10^${e}가지`, "td");
      read.textContent = `단위체 ${k}가지, 길이 ${n}: ${k}^${n}가지` + (k === 20 ? " (아미노산)" : k === 4 ? " (DNA 염기)" : "");
    });
  });

  // 물질의 전기적 성질: 에너지 띠 모식
  Q.def("is1-band", (fig, svg) => {
    const M = [["구리(도체)", 0, 30], ["규소(반도체)", 1.1, 3], ["게르마늄(반도체)", 0.67, 6], ["다이아몬드(절연체)", 5.5, 0]];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const [name, gap, ne] = M[m], top = 30, vb = 200, h = Math.max(0, gap) * 18;
      const cbBot = m === 0 ? vb - 50 : vb - 50 - h, cbTop = top;
      el("rect", { x: 140, y: vb - 50, width: 240, height: 50, class: "lb" }, g);
      el("rect", { x: 140, y: cbTop, width: 240, height: cbBot - cbTop + (m === 0 ? 20 : 0), class: "lc" }, g);
      txt(g, 130, vb - 22, "원자가 띠", "s", "end"); txt(g, 130, cbTop + 24, "전도띠", "s", "end");
      if (gap > 0) { Q.arrow(g, 400, vb - 50, 400, cbBot, "k", "fk"); txt(g, 410, (vb - 50 + cbBot) / 2 + 4, `띠 간격 ${gap} eV`, "s"); }
      else txt(g, 400, vb - 46, "띠가 겹친다", "s");
      // 원자가 띠의 전자(채워짐)와 전도띠로 올라간 전자
      for (let i = 0; i < 24; i++) Q.dot(g, 150 + i * 9.6, vb - 25 + (i % 2) * 8, "fk", 2.5);
      for (let i = 0; i < ne; i++) Q.dot(g, 152 + (i * 37) % 228, cbBot - 10 - ((i * 13) % Math.max(8, cbBot - cbTop - 20)), "fd", 3.5);
      read.textContent = `${name}: 전도띠의 자유 전자 ${ne === 0 ? "거의 없음" : ne > 20 ? "아주 많음" : "조금"} (모식)`;
    }, (k, v) => M[v][0]);
  });

  // 지구시스템: 물의 연간 흐름 (천 km³, 대략값)
  Q.def("is1-water", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ p }) => {
      clear(g);
      const evO = 413 * p / 100, prO = 373, prL = 113, etL = 73, run = 40, adv = evO - prO;   // 바다 위 대기에서 육지 쪽으로 넘어가는 양
      const dO = prO + run - evO, dA = evO + etL - prO - prL, dL = prL - etL - run;
      el("rect", { x: 20, y: 180, width: 240, height: 60, class: "lb" }, g); txt(g, 140, 215, "바다", "", "middle");
      el("rect", { x: 300, y: 180, width: 200, height: 60, class: "lc" }, g); txt(g, 400, 215, "육지", "", "middle");
      el("rect", { x: 120, y: 15, width: 280, height: 40, class: "lk" }, g); txt(g, 260, 40, "대기", "", "middle");
      Q.arrow(g, 80, 178, 140, 58, "b", "fb"); txt(g, 60, 120, `증발 ${num(evO, 0)}`, "s tb", "end");
      Q.arrow(g, 200, 58, 200, 178, "b", "fb"); txt(g, 206, 120, `강수 ${prO}`, "s tb");
      Q.arrow(g, 360, 178, 330, 58, "c", "fc"); txt(g, 320, 140, `증발산 ${etL}`, "s tc", "end");
      Q.arrow(g, 420, 58, 450, 178, "c", "fc"); txt(g, 456, 120, `강수 ${prL}`, "s tc");
      Q.arrow(g, 300, 228, 262, 228, "k", "fk"); txt(g, 281, 252, `강물 ${run}`, "s", "middle");
      read.textContent = `한 해 변화량: 바다 ${num(dO, 0)}, 대기 ${num(dA, 0)}, 육지 ${num(dL, 0)} (천 km³)` + (Math.abs(dA) < 0.5 ? ", 모두 균형" : ", 균형이 깨져 대기의 수증기가 " + (dA > 0 ? "늘어난다" : "줄어든다"));
    }, (k, v) => `${v}%`);
  });

  // 판구조론: 해양저 확장과 고지자기 줄무늬 (모식: 한쪽 2 cm/년, 50만 년마다 자기 역전)
  Q.def("is1-spread", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 260, s = 22;   // 1백만 년 = 22 px (= 20 km)
    Q.bind(fig, ({ t }) => {
      clear(g);
      const steps = Math.round(t * 2);   // 0.5백만 년 단위
      for (let i = 0; i < steps; i++) {
        const age0 = i * 0.5, x0 = age0 * s, w = 0.5 * s, cls = i % 2 ? "lk" : "lb";
        el("rect", { x: cx + x0, y: 70, width: w, height: 60, class: cls }, g);
        el("rect", { x: cx - x0 - w, y: 70, width: w, height: 60, class: cls }, g);
      }
      el("rect", { x: cx - t * s, y: 70, width: 2 * t * s, height: 60, class: "k" }, g);
      Q.line(g, cx, 40, cx, 160, "d"); txt(g, cx, 34, "해령", "s td", "middle");
      el("path", { d: `M${cx - 6} 70 L${cx} 52 L${cx + 6} 70`, class: "d" }, g);
      Q.arrow(g, cx + 30, 150, cx + 90, 150, "k", "fk"); Q.arrow(g, cx - 30, 150, cx - 90, 150, "k", "fk");
      txt(g, 20, 200, "파랑: 지금과 같은 방향(정자기), 회색: 반대 방향(역자기)", "s");
      read.textContent = `${num(t)}백만 년 동안 한쪽으로 ${num(t * 20)} km, 양쪽 합쳐 ${num(t * 40)} km 넓어졌다`;
    });
  });

  // 중력장 내의 운동: 자유 낙하와 수평 던지기 (높이 4.9 m, 0.1초 간격)
  Q.def("is1-proj", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), H = 4.9, s = 48, ox = 40, oy = 25;
    const Y = (h) => oy + (H - h) * s;
    Q.bind(fig, ({ v }) => {
      clear(g);
      Q.line(g, 20, Y(0), 510, Y(0), "k"); txt(g, 505, Y(0) - 6, "땅", "s", "end");
      for (let t = 0; t <= 1.0001; t += 0.1) {
        const h = H - 0.5 * 9.8 * t * t;
        Q.line(g, 20, Y(h), 510, Y(h), "gd dsh");
        Q.dot(g, ox, Y(h), "fb", 5);
        Q.dot(g, ox + 40 + v * t * 34, Y(h), "fd", 5);
      }
      txt(g, ox, Y(0) + 18, "떨어뜨린 공", "s tb", "middle");
      txt(g, Math.min(470, ox + 40 + v * 34), Y(0) + 16, "던진 공", "s td", "middle");
      read.textContent = `높이 4.9 m: 두 공 모두 1초 뒤 땅에 닿는다. 던진 공의 수평 거리 ${num(v)} m`;
    });
  });

  // 충격량: 같은 넓이(0.3 N·s)를 시간 dt에 나누어 받는 힘 (반 사인 모양 모식)
  Q.def("is1-impulse", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), J = 0.3;
    const X = (t) => 50 + t * 2000, Y = (f) => 220 - f * 1.2;
    Q.bind(fig, ({ dt }) => {
      clear(g);
      Q.line(g, 50, 220, 500, 220, "ax"); Q.line(g, 50, 220, 50, 20, "ax");
      txt(g, 500, 238, "시간(초)", "s", "end"); txt(g, 56, 18, "힘(N)", "s");
      [0.05, 0.1, 0.15, 0.2].forEach((t) => txt(g, X(t), 238, String(t), "s", "middle"));
      [50, 100, 150].forEach((f) => txt(g, 44, Y(f) + 4, String(f), "s", "end"));
      const Fmax = J * Math.PI / (2 * dt);   // 반 사인의 넓이 = 2 Fmax dt / π
      let d = `M${X(0)} ${Y(0)}`;
      for (let i = 0; i <= 60; i++) { const t = dt * i / 60; d += `L${X(t)} ${Y(Math.min(170, Fmax * Math.sin(Math.PI * t / dt)))}`; }
      el("path", { d: d + `L${X(dt)} ${Y(0)}Z`, class: "lc" }, g);
      el("path", { d, class: "c" }, g);
      Q.line(g, X(0), Y(J / dt), X(dt), Y(J / dt), "d dsh");
      read.textContent = `넓이(충격량) 0.3 N·s, 시간 ${num(dt)}초 → 평균 힘 ${num(J / dt, 1)} N` + (Fmax > 170 ? " (그래프가 칸을 넘는다)" : "");
    });
  });

  // 효소: 활성화 에너지 언덕 (모식)
  Q.def("is1-enzyme", (fig, svg) => {
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const R = 170, P = 210, top0 = 40;   // 반응물·생성물 높이(svg y), 효소 없을 때 꼭대기
    const curve = (peak) => { let d = ""; for (let i = 0; i <= 100; i++) { const x = 40 + i * 4.4, u = i / 100; const base = R + (P - R) * u; const bump = (Math.min(R, P) - peak + 20) * Math.exp(-((u - 0.5) ** 2) / 0.02); d += (i ? "L" : "M") + x + " " + (base - bump); } return d; };
    Q.line(bg, 30, 240, 500, 240, "ax"); Q.line(bg, 30, 240, 30, 20, "ax");
    txt(bg, 500, 256, "반응 진행", "s", "end"); txt(bg, 36, 16, "에너지", "s");
    el("path", { d: curve(top0), class: "gd" }, bg);
    txt(bg, 60, R - 8, "반응물", "s"); txt(bg, 470, P - 8, "생성물", "s", "end");
    Q.bind(fig, ({ e }) => {
      clear(g);
      const peak = top0 + e * 1.6;
      el("path", { d: curve(peak), class: "a" }, g);
      Q.line(g, 60, R, 262, R, "ax dsh");
      Q.arrow(g, 262, R, 262, peak + 4, "d", "fd");
      txt(g, 270, (R + peak) / 2, "활성화 에너지", "s td");
      const ea = R - peak;
      read.textContent = e ? `활성화 에너지가 효소 없을 때의 ${num(100 * ea / (R - top0), 0)}%로 낮아졌다. 반응물과 생성물의 높이는 그대로이다` : "효소가 없을 때의 언덕";
    });
  });

  // 유전자와 단백질: 사람 HBB 앞부분 ATG GTG CAT CTG ACT CCT GAG GAG, 여섯째 코돈(시작 다음부터) 돌연변이
  Q.def("is1-codon", (fig, svg) => {
    const AA = { ATG: "Met", GTG: "Val", CAT: "His", CTG: "Leu", ACT: "Thr", CCT: "Pro", GAG: "Glu", GAA: "Glu", TAG: "종결" };
    const V = [["정상", "GAG"], ["낫 모양 (A→T)", "GTG"], ["같은 뜻 (G→A)", "GAA"], ["종결 (G→T)", "TAG"]];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const cod = ["ATG", "GTG", "CAT", "CTG", "ACT", "CCT", V[m][1], "GAG"];
      txt(g, 10, 50, "DNA", "s"); txt(g, 10, 95, "mRNA", "s"); txt(g, 10, 150, "아미노산", "s");
      let stop = false;
      cod.forEach((c, i) => {
        const x = 70 + i * 56, hot = i === 6;
        el("rect", { x: x - 2, y: 32, width: 52, height: 26, class: hot && m ? "ld" : "lk" }, g);
        txt(g, x + 24, 50, c, "", "middle");
        txt(g, x + 24, 95, c.replace(/T/g, "U"), "", "middle");
        if (!stop) {
          const a = AA[c];
          el("circle", { cx: x + 24, cy: 145, r: 20, class: a === "종결" ? "ld" : hot && m === 1 ? "lc" : "la" }, g);
          txt(g, x + 24, 150, a, "s", "middle");
          if (a === "종결") stop = true;
        }
      });
      txt(g, 70 + 6 * 56 + 24, 205, "여섯째 코돈", "s td", "middle");
      read.textContent = `${V[m][0]}: ${V[m][1]} → ` + (m === 0 ? "글루탐산(Glu)" : m === 1 ? "발린(Val)으로 바뀜, 헤모글로빈이 엉겨 붙는다" : m === 2 ? "여전히 글루탐산, 단백질 그대로" : "종결 코돈, 여기서 사슬이 끊긴다");
    }, (k, v) => V[v][0]);
  });

  // 측정과 어림: 우연 오차(정규분포 흩어짐)와 계통 오차
  Q.def("is1-error", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    // 같은 그림이 매번 나오도록 고정된 의사 난수
    let s = 7;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const z = Array.from({ length: 60 }, () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd()));
    const X = (v) => 260 + (v - 14.25) * 800;
    Q.bind(fig, ({ n, b }) => {
      clear(g);
      Q.line(g, 20, 150, 500, 150, "ax");
      for (let v = 13.95; v <= 14.551; v += 0.05) { Q.line(g, X(v), 146, X(v), 154, "ax"); if (Math.round(v * 100) % 10 === 0) txt(g, X(v), 172, v.toFixed(1), "s", "middle"); }
      Q.line(g, X(14.2), 30, X(14.2), 150, "a dsh"); txt(g, X(14.2), 24, "참값 14.2", "s ta", "middle");
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const v = 14.2 + b + 0.08 * z[i]; sum += v;
        Q.dot(g, X(v), 140 - (i % 10) * 9, "fb", 3);
      }
      const m = sum / n;
      Q.line(g, X(m), 40, X(m), 150, "d"); txt(g, X(m), 200, `평균 ${m.toFixed(3)}`, "td", "middle");
      read.textContent = `${n}번 측정한 평균 ${m.toFixed(3)} cm, 참값과의 차 ${(m - 14.2).toFixed(3)} cm`;
    });
  });
})();
