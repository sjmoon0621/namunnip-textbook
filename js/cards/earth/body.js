/* 지구과학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
(() => {
  "use strict";
  const Q = window.NMQ;
  if (!Q) return;
  const { el, clear, txt, num } = Q;
  const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const yrs = (ma) => { if (ma < 1) return `${Math.round(ma * 100)}만`; const e = Math.floor(ma / 100), m = Math.round(ma % 100) * 100; return (e ? `${e}억` : "") + (m ? `${e ? " " : ""}${m}만` : ""); };
  const axes = (g, F, x0, x1, y0, y1) => { Q.line(g, x0, y1, x1, y1, "ax"); Q.line(g, x0, y1, x0, y0, "ax"); };

  // 1-1 해수의 층상 구조: 표층 수온 Ts, 바람 세기 w → 혼합층 두께, 수심-수온 곡선
  Q.def("earth-layers", (fig, svg) => {
    const F = Q.frame(0, 30, 0, 1000, 60, 300, 20, 210);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ Ts, w }) => {
      clear(g);
      const mix = 20 + w * 18, Td = 4, thick = 600;
      const T = (z) => z <= mix ? Ts : z >= mix + thick ? Td : Td + (Ts - Td) * (1 - (z - mix) / thick) ** 2;
      Q.line(g, 60, 20, 300, 20, "ax"); Q.line(g, 60, 20, 60, 210, "ax");
      for (const t of [0, 10, 20, 30]) txt(g, F.x(t), 14, `${t}`, "s", "middle");
      for (const z of [0, 500, 1000]) txt(g, 54, F.y(z) + 4, `${z}`, "s", "end");
      txt(g, 300, 228, "수온 (°C)", "s", "end"); txt(g, 64, 228, "수심 (m)", "s");
      let d = ""; for (let z = 0; z <= 1000; z += 5) d += (z ? "L" : "M") + F.x(T(z)).toFixed(1) + " " + F.y(z).toFixed(1);
      el("path", { d, class: "b" }, g);
      el("rect", { x: 340, y: 20, width: 150, height: F.y(mix) - 20, class: "ld" }, g);
      el("rect", { x: 340, y: F.y(mix), width: 150, height: F.y(mix + thick) - F.y(mix), class: "lc" }, g);
      el("rect", { x: 340, y: F.y(mix + thick), width: 150, height: 210 - F.y(mix + thick), class: "lb" }, g);
      txt(g, 415, F.y(mix + thick / 2) + 4, "수온 약층", "s", "middle"); txt(g, 415, 200, "심해층", "s", "middle");
      if (F.y(mix) - 20 > 14) txt(g, 415, (20 + F.y(mix)) / 2 + 4, "혼합층", "s", "middle");
      read.textContent = `표층 ${Ts} °C, 바람 ${w}: 혼합층 약 ${num(mix, 0)} m, 그 아래 수온 약층에서 ${Ts} °C → ${Td} °C로 급히 낮아진다`;
    });
  });

  // 1-2 해수 밀도 (선형 근사): ρ = 1027 (1 − 0.00017 (T − 10) + 0.00076 (S − 35))
  const rho = (T, S) => 1027 * (1 - 0.00017 * (T - 10) + 0.00076 * (S - 35));
  Q.def("earth-ts", (fig, svg) => {
    const F = Q.frame(33, 37, -2, 30, 60, 330, 20, 200);
    const bg = el("g", {}, svg), g = el("g", {}, svg), read = fig.querySelector(".q-read");
    axes(bg, F, 60, 330, 20, 200);
    for (const s of [33, 34, 35, 36, 37]) txt(bg, F.x(s), 216, `${s}`, "s", "middle");
    for (const t of [0, 10, 20, 30]) txt(bg, 54, F.y(t) + 4, `${t}`, "s", "end");
    txt(bg, 330, 230, "염분 (psu)", "s", "end"); txt(bg, 66, 16, "수온 (°C)", "s");
    for (const r of [1022, 1024, 1026, 1028]) {
      let d = ""; for (let i = 0; i <= 40; i++) { const S = 33 + i * 0.1; const T = 10 + (1 - r / 1027 + 0.00076 * (S - 35)) / 0.00017; d += (i ? "L" : "M") + F.x(S).toFixed(1) + " " + F.y(T).toFixed(1); }
      const p = el("path", { d, class: "gd" }, bg);
      const Sl = 36.6, Tl = 10 + (1 - r / 1027 + 0.00076 * (Sl - 35)) / 0.00017; if (Tl > -2 && Tl < 30) txt(bg, F.x(Sl), F.y(Tl) - 3, `${r}`, "s");
      void p;
    }
    Q.bind(fig, ({ T, S }) => {
      clear(g);
      const r = rho(T, S);
      Q.dot(g, F.x(S), F.y(T), "fd", 6);
      el("rect", { x: 370, y: 40, width: 120, height: 160, class: "lb" }, g);
      const depth = Math.max(0, Math.min(1, (r - 1022) / 6.5));
      el("rect", { x: 405, y: 40 + depth * 140, width: 50, height: 20, class: "ld" }, g);
      txt(g, 430, 32, "가라앉는 깊이", "s", "middle");
      read.textContent = `수온 ${T} °C, 염분 ${num(S, 1)} psu: 밀도 약 ${num(r, 1)} kg/m³` + (r > 1027.5 ? " (심층수가 될 만큼 무겁다)" : r < 1024.5 ? " (표층에 머문다)" : "");
    });
  });

  // 1-3 온대 저기압의 통과: 관측자 위치 x (0 동쪽 앞 → 1 서쪽 뒤)
  Q.def("earth-front", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      // 단면: 오른쪽이 동쪽. 온난 전선 x=330, 한랭 전선 x=170
      el("path", { d: "M330 180 L520 60 L520 180 Z", class: "ld" }, g);
      el("path", { d: "M170 180 L120 60 L20 60 L20 180 Z", class: "lb" }, g);
      el("rect", { x: 170, y: 140, width: 160, height: 40, class: "lc" }, g);
      Q.line(g, 20, 180, 500, 180, "ax");
      txt(g, 440, 170, "찬 공기", "s", "middle"); txt(g, 250, 165, "따뜻한 공기", "s", "middle"); txt(g, 70, 170, "찬 공기", "s", "middle");
      txt(g, 330, 198, "온난 전선", "s", "middle"); txt(g, 170, 198, "한랭 전선", "s", "middle");
      el("ellipse", { cx: 430, cy: 70, rx: 70, ry: 14, class: "lk" }, g); el("ellipse", { cx: 150, cy: 70, rx: 30, ry: 40, class: "lk" }, g);
      const px = 490 - x * 460;
      Q.arrow(g, px, 20, px, 175, "d", "fd"); txt(g, px, 14, "관측 지점", "s td", "middle");
      let w;
      if (px > 330) w = ["온난 전선 앞", "층운형 구름, 넓은 지역에 약한 비", "남동풍", "기온 낮음"];
      else if (px > 170) w = ["두 전선 사이", "날씨 맑음", "남서풍", "기온 높음"];
      else w = ["한랭 전선 뒤", "적운형 구름이 지난 뒤 맑아짐, 직전에 소나기", "북서풍", "기온 낮아짐"];
      read.textContent = `${w[0]}: ${w[1]}, ${w[2]}, ${w[3]}`;
    });
  });

  // 1-4 태풍의 위험 반원: 회전 풍속 40 m/s + 이동 속도 v
  Q.def("earth-typhoon", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 200, cy = 115, R = 80;
    Q.bind(fig, ({ v }) => {
      clear(g);
      el("circle", { cx, cy, r: R + 20, class: "gd" }, g);
      el("path", { d: `M${cx} ${cy - R - 20} A ${R + 20} ${R + 20} 0 0 1 ${cx} ${cy + R + 20} Z`, class: "ld", opacity: 0.5 }, g);
      el("circle", { cx, cy, r: 8, class: "lk" }, g);
      Q.arrow(g, cx, cy, cx, cy - 50 - v * 2, "k", "fk"); txt(g, cx + 8, cy - 40, `이동 ${v} m/s`, "s");
      // 반시계 회전: 오른쪽(동) 북향, 왼쪽(서) 남향
      Q.arrow(g, cx + R, cy + 30, cx + R, cy - 30, "c", "fc"); Q.arrow(g, cx - R, cy - 30, cx - R, cy + 30, "b", "fb");
      const right = 40 + v, left = 40 - v;
      txt(g, cx + R + 26, cy, `${right} m/s`, "s tc"); txt(g, cx - R - 26, cy, `${left} m/s`, "s tb", "end");
      txt(g, cx + 60, cy + R + 36, "위험 반원", "s", "middle"); txt(g, cx - 60, cy + R + 36, "안전 반원", "s", "middle");
      el("rect", { x: 380, y: 200 - right * 3, width: 40, height: right * 3, class: "lc" }, g);
      el("rect", { x: 440, y: 200 - left * 3, width: 40, height: left * 3, class: "lb" }, g);
      txt(g, 400, 216, "오른쪽", "s", "middle"); txt(g, 460, 216, "왼쪽", "s", "middle");
      read.textContent = `회전 바람 40 m/s, 북쪽으로 ${v} m/s 이동: 진행 방향 오른쪽 ${right} m/s, 왼쪽 ${left} m/s`;
    });
  });

  // 1-5 엘니뇨: 무역풍 세기 w (0 약함 ~ 2 강함)
  Q.def("earth-enso", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ w }) => {
      clear(g);
      const tw = 40 + w * 40, te = 140 - w * 45;   // 수온 약층 깊이(그림 y): 서쪽, 동쪽
      el("rect", { x: 40, y: 60, width: 440, height: 150, class: "lb" }, g);
      el("path", { d: `M40 60 L480 60 L480 ${te} L40 ${tw + 60} Z`, class: "ld" }, g);
      Q.line(g, 40, tw + 60, 480, te, "c");
      txt(g, 60, 52, "서태평양(인도네시아)", "s"); txt(g, 470, 52, "동태평양(페루)", "s", "end");
      txt(g, 260, (tw + 60 + te) / 2 - 8, "따뜻한 물", "s", "middle"); txt(g, 260, 195, "찬 물", "s", "middle");
      if (w > 0.05) Q.arrow(g, 400, 30, 400 - 60 - w * 40, 30, "k", "fk");
      txt(g, 410, 34, w > 0.05 ? "무역풍" : "무역풍 거의 없음", "s");
      const sstE = 20 + (2 - w) * 4, state = w < 0.7 ? "엘니뇨" : w > 1.4 ? "라니냐" : "평상시";
      read.textContent = `무역풍 ${num(w, 1)}: ${state}, 동태평양 표층 수온 약 ${num(sstE, 0)} °C, 페루 연안 용승 ${w < 0.7 ? "약함" : "강함"}`;
    });
  });

  // 1-6 이산화 탄소 강제력: F = 5.35 ln(C/280), 평형 기온 변화 ≈ 0.8 F
  Q.def("earth-forcing", (fig, svg) => {
    const F = Q.frame(280, 1120, 0, 8, 60, 470, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ c }) => {
      clear(g);
      axes(g, F, 60, 470, 20, 200);
      for (const x of [280, 560, 840, 1120]) txt(g, F.x(x), 216, `${x}`, "s", "middle");
      for (const y of [0, 2, 4, 6, 8]) txt(g, 54, F.y(y) + 4, `${y}`, "s", "end");
      txt(g, 470, 230, "CO₂ 농도 (ppm)", "s", "end"); txt(g, 66, 16, "강제력 (W/m²)", "s");
      Q.plot(g, F, (C) => 5.35 * Math.log(C / 280), "c", 280, 1120, 200);
      const f = 5.35 * Math.log(c / 280);
      Q.dot(g, F.x(c), F.y(f), "fd", 5);
      Q.line(g, F.x(420), 20, F.x(420), 200, "gd"); txt(g, F.x(420) + 4, 32, "현재 약 420", "s");
      read.textContent = `CO₂ ${c} ppm: 복사 강제력 ${num(f, 2)} W/m², 평형 기온 상승 약 ${num(0.8 * f, 1)} °C (산업화 이전 280 ppm 기준)`;
    });
  });

  // 2-1 방사성 동위 원소: 반감기 수 n → 모원소, 자원소
  Q.def("earth-halflife", (fig, svg) => {
    const F = Q.frame(0, 5, 0, 100, 60, 330, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n }) => {
      clear(g);
      axes(g, F, 60, 330, 20, 200);
      for (let k = 0; k <= 5; k++) txt(g, F.x(k), 216, `${k}`, "s", "middle");
      for (const y of [0, 50, 100]) txt(g, 54, F.y(y) + 4, `${y}`, "s", "end");
      txt(g, 330, 230, "지난 반감기 수", "s", "end"); txt(g, 66, 16, "남은 모원소 (%)", "s");
      Q.plot(g, F, (t) => 100 * 0.5 ** t, "b", 0, 5, 200); Q.plot(g, F, (t) => 100 - 100 * 0.5 ** t, "c", 0, 5, 200);
      Q.line(g, F.x(n), 20, F.x(n), 200, "gd");
      const p = 100 * 0.5 ** n;
      el("rect", { x: 380, y: 200 - p * 1.6, width: 40, height: p * 1.6, class: "lb" }, g); el("rect", { x: 440, y: 200 - (100 - p) * 1.6, width: 40, height: (100 - p) * 1.6, class: "lc" }, g);
      txt(g, 400, 216, "모원소", "s", "middle"); txt(g, 460, 216, "자원소", "s", "middle");
      read.textContent = `반감기 ${num(n, 1)}번: 모원소 ${num(p, 1)}%, 자원소 ${num(100 - p, 1)}% (모원소 : 자원소 = 1 : ${num((100 - p) / p, 2)})`;
    });
  });

  // 2-2 지구 46억 년을 하루로
  Q.def("earth-day", (fig, svg) => {
    const E = [[4600, "지구 탄생"], [3500, "가장 오래된 생명의 흔적"], [2400, "대기에 산소가 쌓이기 시작"], [541, "고생대 시작, 다양한 동물"], [252, "중생대 시작(대멸종 뒤)"], [66, "신생대 시작(공룡 멸종)"], [0.3, "현생 인류"]];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      el("rect", { x: 30, y: 90, width: 460, height: 30, class: "gd" }, g);
      for (const [a, b, cls] of [[4600, 541, "lk"], [541, 252, "la"], [252, 66, "lc"], [66, 0, "ld"]]) el("rect", { x: 30 + (4600 - a) / 4600 * 460, y: 90, width: (a - b) / 4600 * 460, height: 30, class: cls }, g);
      for (let h = 0; h <= 24; h += 6) txt(g, 30 + h / 24 * 460, 140, `${h}시`, "s", "middle");
      txt(g, 30, 80, "선캄브리아 시대", "s");
      const [ma, nm] = E[k], hr = (4600 - ma) / 4600 * 24, x = 30 + (4600 - ma) / 4600 * 460;
      Q.arrow(g, x, 40, x, 88, "d", "fd");
      const hh = Math.floor(hr), mm = Math.floor((hr - hh) * 60), ss = Math.round(((hr - hh) * 60 - mm) * 60);
      txt(g, Math.min(430, Math.max(60, x)), 32, nm, "s td", "middle");
      read.textContent = `${nm}: 약 ${yrs(ma)} 년 전 → 하루로 치면 ${hh}시 ${mm}분 ${ss}초`;
    }, (k, v) => E[v][1]);
  });

  // 2-3 화성암: SiO2 함량과 냉각 속도
  Q.def("earth-igneous", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ si, c }) => {
      clear(g);
      const type = si < 52 ? 0 : si < 63 ? 1 : 2, deep = c === 0;
      const names = deep ? ["반려암", "섬록암", "화강암"] : ["현무암", "안산암", "유문암"];
      const shade = 0.85 - (si - 45) / 30 * 0.7;
      el("rect", { x: 60, y: 30, width: 180, height: 150, fill: `rgba(60,60,60,${shade.toFixed(2)})` }, g);
      const r = rng(9), n = deep ? 18 : 70, s = deep ? 22 : 7;
      for (let i = 0; i < n; i++) el("rect", { x: 60 + r() * (180 - s), y: 30 + r() * (150 - s), width: s * (0.6 + r() * 0.6), height: s * (0.6 + r() * 0.6), fill: r() < 0.5 ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.35)" }, g);
      el("rect", { x: 60, y: 30, width: 180, height: 150, class: "k" }, g);
      txt(g, 150, 200, names[type], "s", "middle");
      txt(g, 290, 60, `SiO₂ ${si}%`, "s"); txt(g, 290, 90, deep ? "땅속 깊이 천천히 식음" : "지표 가까이 빨리 식음", "s");
      txt(g, 290, 120, deep ? "알갱이 큼 (심성암)" : "알갱이 작음 (화산암)", "s"); txt(g, 290, 150, si < 52 ? "색 어두움 (염기성암)" : si < 63 ? "중간 (중성암)" : "색 밝음 (산성암)", "s");
      read.textContent = `SiO₂ ${si}%, ${deep ? "천천히" : "빨리"} 식음 → ${names[type]}`;
    }, (k, v) => k === "c" ? (v ? "빨리" : "천천히") : num(v));
  });

  // 2-4 셰일의 광역 변성: 온도, 압력 → 변성 정도
  Q.def("earth-meta", (fig, svg) => {
    const F = Q.frame(0, 800, 0, 12, 60, 330, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ T, P }) => {
      clear(g);
      axes(g, F, 60, 330, 20, 200);
      for (const t of [0, 200, 400, 600, 800]) txt(g, F.x(t), 216, `${t}`, "s", "middle");
      for (const p of [0, 4, 8, 12]) txt(g, 54, F.y(p) + 4, `${p}`, "s", "end");
      txt(g, 330, 230, "온도 (°C)", "s", "end"); txt(g, 66, 16, "압력 (천 기압)", "s");
      const grade = Math.min(4, Math.max(0, Math.floor((T - 150) / 130 + P / 6)));
      const N = ["셰일 (퇴적암)", "점판암", "천매암", "편암", "편마암"];
      Q.dot(g, F.x(T), F.y(P), "fd", 6);
      el("rect", { x: 370, y: 40, width: 120, height: 120, class: "lk" }, g);
      for (let i = 0; i < 6 + grade * 2; i++) { const y = 50 + i * (100 / (6 + grade * 2)); if (grade) el("path", { d: `M375 ${y} Q 430 ${y + (grade > 2 ? 8 : 0)} 485 ${y}`, class: grade >= 4 ? "c" : "k" }, g); }
      txt(g, 430, 180, N[grade], "s", "middle");
      read.textContent = `${T} °C, ${P}천 기압: ${N[grade]}` + (grade ? (grade >= 3 ? ", 광물이 압력에 수직으로 늘어선 엽리가 뚜렷하다" : ", 얇게 쪼개지는 결이 생긴다") : "");
    });
  });

  // 2-5 한반도 암석의 나이
  Q.def("earth-korea", (fig, svg) => {
    const R = [[2500, "경기 육괴, 영남 육괴의 편마암", "선캄브리아 시대"], [480, "강원도 남부의 석회암 (조선 누층군)", "고생대 전기"], [300, "삼척, 태백의 석탄층 (평안 누층군)", "고생대 후기~중생대 초"], [170, "서울, 대보 화강암", "중생대 쥐라기"], [100, "경상 분지의 공룡 발자국 퇴적층", "중생대 백악기"], [1, "제주도, 한탄강의 현무암", "신생대 제4기"]];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const X = (ma) => 480 - Math.log10(ma + 1) / Math.log10(3001) * 420;
      Q.line(g, 60, 120, 480, 120, "ax");
      for (const m of [1, 10, 100, 1000]) { Q.line(g, X(m), 115, X(m), 125, "k"); txt(g, X(m), 142, `${m}`, "s", "middle"); }
      txt(g, 480, 160, "백만 년 전 (로그 눈금)", "s", "end");
      R.forEach(([ma], i) => Q.dot(g, X(ma), 120, i === k ? "fd" : "fk", i === k ? 7 : 4));
      const [ma, nm, era] = R[k];
      txt(g, Math.min(400, Math.max(120, X(ma))), 90, nm, "s td", "middle");
      read.textContent = `${nm}: 약 ${yrs(ma)} 년 전, ${era}`;
    }, (k, v) => R[v][2]);
  });

  // 3-1 화성의 역행: 지구 1년, 화성 1.88년 공전, 시간 t (년)
  Q.def("earth-retro", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 140, cy = 115;
    const pos = (a, T, t) => [a * Math.cos(2 * Math.PI * t / T), a * Math.sin(2 * Math.PI * t / T)];
    const lon = (t) => { const [ex, ey] = pos(1, 1, t), [mx, my] = pos(1.52, 1.88, t + 0.15); return Math.atan2(my - ey, mx - ex); };
    Q.bind(fig, ({ t }) => {
      clear(g);
      el("circle", { cx, cy, r: 55, class: "gd" }, g); el("circle", { cx, cy, r: 84, class: "gd" }, g); Q.dot(g, cx, cy, "fc", 7);
      const [ex, ey] = pos(1, 1, t), [mx, my] = pos(1.52, 1.88, t + 0.15);
      Q.dot(g, cx + ex * 55, cy - ey * 55, "fb", 5); Q.dot(g, cx + mx * 55, cy - my * 55, "fd", 5);
      Q.line(g, cx + ex * 55, cy - ey * 55, cx + ex * 55 + (mx - ex) * 70, cy - ey * 55 - (my - ey) * 70, "gd");
      // 하늘에서의 겉보기 위치(황경) 변화 그래프
      const F = Q.frame(0, 2, -Math.PI, Math.PI, 280, 500, 30, 200);
      Q.line(g, 280, 200, 500, 200, "ax"); Q.line(g, 280, 30, 280, 200, "ax");
      let d = "", prev = null, off = 0;
      for (let i = 0; i <= 200; i++) { const s = i / 100; let L = lon(s); if (prev !== null) { if (L - prev > Math.PI) off -= 2 * Math.PI; if (L - prev < -Math.PI) off += 2 * Math.PI; } prev = L; const y = ((L + off) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI; d += (i ? "L" : "M") + F.x(s).toFixed(1) + " " + F.y(y).toFixed(1); }
      el("path", { d, class: "d" }, g);
      const L0 = lon(t), L1 = lon(t + 0.01), dl = Math.atan2(Math.sin(L1 - L0), Math.cos(L1 - L0));
      const y0 = ((L0 % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      Q.dot(g, F.x(Math.min(2, t)), F.y(y0), "fk", 4);
      txt(g, 500, 216, "시간 (년)", "s", "end"); txt(g, 286, 24, "화성의 겉보기 위치", "s");
      read.textContent = `${num(t, 2)}년: 화성이 별자리 사이에서 ${dl > 0 ? "서쪽에서 동쪽으로 (순행)" : "동쪽에서 서쪽으로 (역행)"} 움직인다`;
    });
  });

  // 3-2 흑체 복사: 플랑크 곡선, 빈 법칙
  Q.def("earth-planck", (fig, svg) => {
    const F = Q.frame(100, 2000, 0, 1.05, 60, 470, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const B = (l, T) => { const x = l * 1e-9; return 1 / (x ** 5 * (Math.exp(0.014388 / (x * T)) - 1)); };
    Q.bind(fig, ({ T }) => {
      clear(g);
      axes(g, F, 60, 470, 20, 200);
      const lm = 2.898e6 / T, norm = B(lm, T);
      el("rect", { x: F.x(380), y: 20, width: F.x(750) - F.x(380), height: 180, class: "la", opacity: 0.25 }, g);
      for (const l of [500, 1000, 1500, 2000]) txt(g, F.x(l), 216, `${l}`, "s", "middle");
      txt(g, 470, 230, "파장 (nm)", "s", "end"); txt(g, 66, 16, "복사 세기 (최댓값을 1로)", "s");
      Q.plot(g, F, (l) => B(l, T) / norm, "d", 100, 2000, 300);
      if (lm <= 2000) { Q.line(g, F.x(lm), 20, F.x(lm), 200, "gd"); txt(g, F.x(lm) + 4, 34, `λmax ${num(lm, 0)} nm`, "s"); }
      const col = T < 4000 ? "붉은색" : T < 5500 ? "주황색~노란색" : T < 7500 ? "흰색에 가까운 노란색" : "푸른 흰색";
      read.textContent = `표면 온도 ${T} K: 최대 세기 파장 ${num(lm, 0)} nm, 별의 색 ${col}`;
    });
  });

  // 3-3 주계열성: 질량 M → 광도 M^3.5, 표면 온도, 수명 10^10 M^-2.5 년
  Q.def("earth-hr", (fig, svg) => {
    const F = Q.frame(Math.log10(40000), Math.log10(2500), -4, 6, 60, 470, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      axes(g, F, 60, 470, 20, 200);
      for (const T of [30000, 10000, 5000, 3000]) txt(g, F.x(Math.log10(T)), 216, `${T}`, "s", "middle");
      for (const L of [-4, -2, 0, 2, 4, 6]) txt(g, 54, F.y(L) + 4, `10${["⁻⁴", "", "⁻²", "", "⁰", "", "²", "", "⁴", "", "⁶"][L + 4]}`, "s", "end");
      txt(g, 470, 230, "표면 온도 (K, 왼쪽이 뜨거움)", "s", "end"); txt(g, 66, 16, "광도 (태양 = 1)", "s");
      const ms = (M) => [Math.log10(5800 * M ** 0.55), 3.5 * Math.log10(M)];
      let d = ""; for (let i = 0; i <= 60; i++) { const M = 10 ** (-1 + i * 2.3 / 60); const [lt, lL] = ms(M); d += (i ? "L" : "M") + F.x(lt).toFixed(1) + " " + F.y(lL).toFixed(1); }
      el("path", { d, class: "b" }, g);
      Q.dot(g, F.x(Math.log10(5800)), F.y(0), "fc", 4); txt(g, F.x(Math.log10(5800)) + 6, F.y(0) + 14, "태양", "s");
      for (const [t, L, lab] of [[3.55, 2.5, "적색 거성"], [4.1, -3, "백색 왜성"]]) txt(g, F.x(t), F.y(L), lab, "s", "middle");
      const [lt, lL] = ms(m);
      Q.dot(g, F.x(lt), F.y(lL), "fd", 6);
      const life = 1e10 * m ** -2.5;
      read.textContent = `질량 ${num(m, 1)} 태양: 표면 온도 약 ${Math.round(10 ** lt / 100) * 100} K, 광도 약 ${num(10 ** lL, lL < 0 ? 3 : 0)}배, 주계열 수명 약 ${life >= 1e8 ? num(life / 1e8, 0) + "억" : Math.round(life / 1e4).toLocaleString("ko-KR") + "만"} 년`;
    });
  });

  // 3-4 허블 분류 그림
  Q.def("earth-galaxy", (fig, svg) => {
    const T = [["E0 타원 은하", "e", 0], ["E7 타원 은하", "e", 0.7], ["S0 렌즈형 은하", "s0", 0], ["Sa 나선 은하", "s", 0.2], ["Sc 나선 은하", "s", 0.8], ["SBb 막대 나선 은하", "sb", 0.5], ["Irr 불규칙 은하", "i", 0]];
    const g = el("g", {}, svg), read = fig.querySelector(".q-read"), cx = 180, cy = 110;
    Q.bind(fig, ({ k }) => {
      clear(g);
      const [nm, t, p] = T[k];
      if (t === "e") el("ellipse", { cx, cy, rx: 70, ry: 70 * (1 - p), class: "lc" }, g);
      if (t === "s0") { el("ellipse", { cx, cy, rx: 90, ry: 22, class: "la" }, g); el("ellipse", { cx, cy, rx: 30, ry: 18, class: "lc" }, g); }
      if (t === "s" || t === "sb") {
        const bulge = t === "s" ? 30 - p * 20 : 16;
        if (t === "sb") el("rect", { x: cx - 50, y: cy - 7, width: 100, height: 14, class: "lc" }, g);
        for (const s of [0, Math.PI]) { let d = ""; for (let i = 0; i <= 60; i++) { const a = i / 60 * (2.2 + p * 2) * Math.PI / 2, r = (t === "sb" ? 50 : 12) + i * 1.3; d += (i ? "L" : "M") + (cx + r * Math.cos(a + s)).toFixed(1) + " " + (cy + r * 0.8 * Math.sin(a + s)).toFixed(1); } el("path", { d, class: "b", style: `stroke-width:${6 - p * 3}` }, g); }
        el("circle", { cx, cy, r: bulge, class: "lc" }, g);
      }
      if (t === "i") { const r = rng(4); for (let i = 0; i < 40; i++) Q.dot(g, cx - 70 + r() * 140, cy - 50 + r() * 100, r() < 0.5 ? "fb" : "fa", 2 + r() * 4); }
      const info = { e: "별이 늙고 가스가 적어 새 별이 거의 태어나지 않는다", s0: "원반은 있지만 나선팔이 없다", s: "원반과 나선팔에 가스가 많아 젊은 별이 태어난다", sb: "중심을 가로지르는 막대 끝에서 나선팔이 뻗는다", i: "모양이 일정하지 않고 가스가 많다" }[t];
      txt(g, 300, 90, nm, "s"); txt(g, 300, 120, info.length > 18 ? info.slice(0, 18) : info, "s"); if (info.length > 18) txt(g, 300, 140, info.slice(18), "s");
      read.textContent = `${nm}: ${info}`;
    }, (k, v) => T[v][0].split(" ")[0]);
  });

  // 3-5 허블 법칙: v = H0 d
  Q.def("earth-hubble", (fig, svg) => {
    const F = Q.frame(0, 400, 0, 32000, 70, 470, 20, 200);
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const G = [[20, 1300], [45, 3500], [80, 5300], [120, 8800], [160, 10800], [210, 15100], [260, 17600], [310, 22200], [360, 24800]];
    Q.bind(fig, ({ H, d }) => {
      clear(g);
      axes(g, F, 70, 470, 20, 200);
      for (const x of [0, 100, 200, 300, 400]) txt(g, F.x(x), 216, `${x}`, "s", "middle");
      for (const y of [0, 10000, 20000, 30000]) txt(g, 64, F.y(y) + 4, `${y / 1000}천`, "s", "end");
      txt(g, 470, 230, "거리 (Mpc)", "s", "end"); txt(g, 76, 16, "후퇴 속도 (km/s)", "s");
      G.forEach(([x, y]) => Q.dot(g, F.x(x), F.y(y), "fb", 3.5));
      Q.plot(g, F, (x) => H * x, "c", 0, 400, 50);
      Q.dot(g, F.x(d), F.y(H * d), "fd", 6);
      read.textContent = `H₀ = ${H} km/s/Mpc: ${d} Mpc 떨어진 은하의 후퇴 속도 ${num(H * d, 0)} km/s, 우주 나이 어림 1/H₀ ≈ ${num(97.8 / H * 100, 0)}억 년`;
    });
  });
})();
