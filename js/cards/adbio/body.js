/* 고급 생명과학 본문 카드의 조작 그림 (js/lib/qfig.js의 NMQ를 쓴다). 그림마다 NMQ.def("이름", …). */
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
  const big = (x) => (x >= 1e8 ? num(x / 1e8, 1) + "억" : x >= 1e4 ? num(x / 1e4, 1) + "만" : num(x, 0));

  // 1-1 DNA 녹는 온도와 GC 함량
  Q.def("adbio-tm", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ gc }) => {
      clear(g);
      const Tm = (x) => 69.3 + 0.41 * x;
      const F = frame(g, 20, 80, 70, 105, [10, 5]); ticks(g, F, [20, 30, 40, 50, 60, 70, 80], [70, 80, 90, 100]); axl(g, "GC 함량 (%)", "녹는 온도 Tm (°C)");
      Q.plot(g, F, Tm, "b", 20, 80, 20);
      Q.dot(g, F.x(gc), F.y(Tm(gc)), "fd", 5);
      read.textContent = `GC ${gc}%: Tm ≈ 69.3 + 0.41 × GC = ${num(Tm(gc), 1)} °C (0.15 M 염 용액). G–C 쌍은 수소 결합 3개, A–T 쌍은 2개라서 GC가 많을수록 두 가닥이 단단히 붙는다`;
    });
  });

  // 1-2 순환적 전자 흐름과 ATP/NADPH 비: 선형 전자 4개마다 순환 전자 x개
  Q.def("adbio-cyclic", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ x }) => {
      clear(g);
      const H = 12 + 2 * x, atp = H / 4.67, r = atp / 2;
      bar(g, 40, H * 10, "lk", "틸라코이드 안으로 들어간 H⁺", `${num(H, 1)}개`);
      bar(g, 80, atp * 60, "lb", "만든 ATP", `${num(atp, 2)}개`);
      bar(g, 120, 2 * 60, "lc", "만든 NADPH", "2개");
      read.textContent = `선형 전자 4개마다 순환 전자 ${num(x, 1)}개: ATP/NADPH = ${num(r, 2)}. 캘빈 회로가 쓰는 비는 3 : 2 = 1.5이므로 ` + (Math.abs(r - 1.5) < 0.05 ? "꼭 맞는다" : r < 1.5 ? "ATP가 모자란다" : "ATP가 남는다");
    });
  });

  // 1-3 캘빈의 ¹⁴C 추적: 표지 시간 t (초), 3-PGA → 당 인산 → 다른 산물
  Q.def("adbio-calvin", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const sim = (T) => { let A = 0, B = 0, C = 0; const dt = 0.05; for (let t = 0; t < T; t += dt) { const dA = 1 - 0.15 * A, dB = 0.15 * A - 0.08 * B, dC = 0.08 * B; A += dA * dt; B += dB * dt; C += dC * dt; } const s = A + B + C || 1; return [A / s, B / s, C / s]; };
    Q.bind(fig, ({ t }) => {
      clear(g);
      const F = frame(g, 0, 60, 0, 1, [10, 0.25]); ticks(g, F, [0, 10, 20, 30, 40, 50, 60], [0, 0.25, 0.5, 0.75, 1]); axl(g, "¹⁴CO₂를 준 시간 (초)", "방사성의 비율");
      const pts = [[], [], []]; for (let s = 0.5; s <= 60; s += 1) { const r = sim(s); r.forEach((v, i) => pts[i].push([F.x(s), F.y(v)])); }
      path(g, pts[0], "b"); path(g, pts[1], "c"); path(g, pts[2], "gd");
      const r = sim(Math.max(0.5, t));
      Q.line(g, F.x(t), F.y(0), F.x(t), F.y(1), "gd");
      read.textContent = `${t}초: 3-PGA(파랑) ${num(r[0] * 100, 0)}%, 당 인산(주황) ${num(r[1] * 100, 0)}%, 다른 물질(회색) ${num(r[2] * 100, 0)}%. 짧게 줄수록 맨 처음 산물인 3-PGA에 방사성이 몰린다(모형)`;
    });
  });

  // 1-4 광호흡의 비율: 잎 속 CO₂ 농축 배율 f, 온도 T (°C)
  Q.def("adbio-photoresp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ f, T }) => {
      clear(g);
      const S = 80 * Math.exp(-0.025 * (T - 25)), co2 = 8 * f * Math.exp(-0.012 * (T - 25)), o2 = 250 * Math.exp(-0.008 * (T - 25));
      const vc = S * co2 / o2, fo = 1 / (1 + vc);
      bar(g, 50, (1 - fo) * 250, "lb", "CO₂ 고정 (카복실화)", `${num((1 - fo) * 100, 0)}%`);
      bar(g, 95, fo * 250, "lc", "O₂ 고정 (산소화)", `${num(fo * 100, 0)}%`);
      read.textContent = `${T} °C, CO₂ 농도 ${num(f, 0)}배: 루비스코 반응의 ${num(fo * 100, 0)}%가 O₂를 붙잡는다. 산소화 2번마다 고정한 탄소 하나를 CO₂로 잃으므로 광합성의 약 ${num(fo / (1 - fo) * 50, 0)}%가 사라진다`;
    });
  });

  // 1-5 PFK의 다른 자리 조절: ATP 농도 (mM)
  Q.def("adbio-pfk", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const v = (S, atp) => { const K = 0.5 * (1 + (atp / 1.5) ** 2), h = 1 + atp / 3; return S ** h / (K ** h + S ** h); };
    Q.bind(fig, ({ atp }) => {
      clear(g);
      const F = frame(g, 0, 5, 0, 1, [0.5, 0.25]); ticks(g, F, [0, 1, 2, 3, 4, 5], [0, 0.25, 0.5, 0.75, 1]); axl(g, "과당 6-인산 농도 (mM)", "PFK 반응 속도 (최대 = 1)");
      Q.plot(g, F, (S) => v(S, 1), "gd", 0, 5, 150);
      Q.plot(g, F, (S) => v(S, atp), "b", 0, 5, 150);
      Q.dot(g, F.x(1), F.y(v(1, atp)), "fd", 5);
      read.textContent = `ATP ${num(atp, 1)} mM: 과당 6-인산 1 mM에서 반응 속도 ${num(v(1, atp) * 100, 0)}% (ATP 1 mM일 때 ${num(v(1, 1) * 100, 0)}%). ATP가 쌓이면 PFK가 느려져 해당 과정의 흐름이 줄어든다(모형)`;
    });
  });

  // 1-6 c 고리의 소단위 수와 ATP 수율
  Q.def("adbio-cring", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ c }) => {
      clear(g);
      const hp = c / 3, per = hp + 1, nadh = 10 / per, fad = 6 / per;
      const cx = 110, cy = 110; for (let i = 0; i < c; i++) { const a = 2 * Math.PI * i / c; Q.dot(g, cx + 60 * Math.cos(a), cy + 60 * Math.sin(a), "fb", Math.min(14, 170 / c)); }
      txt(g, cx, cy + 4, `c = ${c}`, "s", "middle");
      bar(g, 50, hp * 40, "lk", "ATP 1개당 H⁺", `${num(hp, 2)}개 (+수송 1)`, 330);
      bar(g, 95, nadh * 40, "lb", "NADH 1개당 ATP", `${num(nadh, 2)}개`, 330);
      bar(g, 140, fad * 40, "lc", "FADH₂ 1개당 ATP", `${num(fad, 2)}개`, 330);
      read.textContent = `c 고리 소단위 ${c}개: 한 바퀴에 H⁺ ${c}개, ATP 3개. NADH 하나가 H⁺ 10개를 퍼내므로 ATP ${num(nadh, 2)}개. 소의 미토콘드리아는 c = 8이다`;
    });
  });

  // 2-1 확산 시간: 거리 10^lg m, 확산 계수 10⁻⁹ m²/s
  const tfmt = (s) => (s < 1e-3 ? num(s * 1e6, 1) + " μs" : s < 1 ? num(s * 1000, 1) + " ms" : s < 120 ? num(s, 1) + "초" : s < 7200 ? num(s / 60, 0) + "분" : s < 2 * 86400 ? num(s / 3600, 1) + "시간" : s < 2 * 3.15e7 ? num(s / 86400, 0) + "일" : num(s / 3.15e7, 0) + "년");
  const dfmt = (m) => (m < 1e-3 ? num(m * 1e6, m < 1e-5 ? 1 : 0) + " μm" : m < 1 ? num(m * 1000, 1) + " mm" : num(m, 1) + " m");
  Q.def("adbio-diff", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lg }) => {
      clear(g);
      const x = 10 ** lg, t = x * x / (2e-9);
      const F = frame(g, -8, 0, -7, 9, [1, 2]);
      for (const [v, s] of [[-8, "10 nm"], [-6, "1 μm"], [-4, "100 μm"], [-2, "1 cm"], [0, "1 m"]]) txt(g, F.x(v), 220, s, "s", "middle");
      for (const [v, s] of [[-6, "1 μs"], [-3, "1 ms"], [0, "1초"], [3, "17분"], [6, "12일"], [9, "32년"]]) txt(g, F.X0 - 5, F.y(v) + 4, s, "s", "end");
      Q.plot(g, F, (u) => Math.log10(10 ** (2 * u) / 2e-9), "b", -8, 0, 50);
      Q.dot(g, F.x(lg), F.y(Math.log10(t)), "fd", 5);
      read.textContent = `작은 분자가 ${dfmt(x)}를 확산하는 데 약 ${tfmt(t)} (t ≈ x²/2D). 시냅스 틈 20 nm는 0.2 μs, 1 m는 수십 년이 걸린다`;
    }, (k, v) => dfmt(10 ** v));
  });

  // 2-2 신호 증폭: 단계마다 증폭 배율 a, 다섯 단계
  const STG = ["호르몬", "활성 G 단백질", "cAMP", "활성 PKA", "활성 인산화 효소", "포도당 1-인산"];
  Q.def("adbio-cascade", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ a }) => {
      clear(g);
      STG.forEach((s, i) => { const n = a ** i; bar(g, 5 + i * 33, Math.log10(n) * 30 + 2, i === 5 ? "lc" : "lb", s, n >= 1e4 ? big(n) + "개" : `${num(n, 0)}개`, 160); });
      read.textContent = `단계마다 ${a}배 증폭되면 호르몬 분자 하나가 포도당 1-인산 ${big(a ** 5)}개를 만든다. 막대는 로그 길이`;
    });
  });

  // 2-3 골드만 식: 바깥 K⁺ 농도 (mM), Na⁺ 투과도 비 pNa (K⁺ = 1), 37 °C
  Q.def("adbio-ghk", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ ko, pna }) => {
      clear(g);
      const z = 61.5, EK = z * Math.log10(ko / 140), ENa = z * Math.log10(145 / 15), pcl = 0.45;
      const V = z * Math.log10((ko + pna * 145 + pcl * 10) / (140 + pna * 15 + pcl * 110));
      const F = frame(g, 0, 4, -110, 70, [1, 20]); ticks(g, F, [], [-100, -80, -60, -40, -20, 0, 20, 40, 60]);
      Q.line(g, F.x(0), F.y(0), F.x(4), F.y(0), "gd");
      for (const [x, v, cls, s] of [[1, EK, "fb", "E_K"], [2, V, "fd", "막전위"], [3, ENa, "fc", "E_Na"]]) { Q.dot(g, F.x(x), F.y(v), cls, 7); txt(g, F.x(x), 220, s, "s", "middle"); txt(g, F.x(x) + 10, F.y(v) + 4, `${num(v, 0)} mV`, "s"); }
      read.textContent = `바깥 K⁺ ${ko} mM, P_Na/P_K = ${num(pna, 2)}: E_K = ${num(EK, 0)} mV, 막전위 ${num(V, 0)} mV. 막전위는 투과도가 큰 이온의 평형 전위 쪽으로 끌려간다`;
    });
  });

  // 2-4 시간적 가중: 입력 4개의 간격 Δt (ms), EPSP 5 mV, 시간 상수 10 ms, 역치 −55 mV
  Q.def("adbio-epsp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ dt }) => {
      clear(g);
      const V = (t) => { let s = -70; for (let i = 0; i < 4; i++) { const u = t - 5 - i * dt; if (u > 0) s += 5 / 0.697 * (Math.exp(-u / 10) - Math.exp(-u)); } return s; };
      const F = frame(g, 0, 120, -72, -50, [10, 5]); ticks(g, F, [0, 20, 40, 60, 80, 100, 120], [-70, -65, -60, -55]); axl(g, "시간 (ms)", "막전위 (mV)");
      Q.line(g, F.x(0), F.y(-55), F.x(120), F.y(-55), "c");
      Q.plot(g, F, (t) => Math.min(-50, V(t)), "b", 0, 120, 400);
      let mx = -70; for (let t = 0; t <= 120; t += 0.25) mx = Math.max(mx, V(t));
      read.textContent = `입력 간격 ${dt} ms: 최고 ${num(mx, 1)} mV → ` + (mx >= -55 ? "역치(주황)를 넘어 활동 전위가 생긴다" : "역치에 못 미쳐 아무 일도 없다") + `. 간격이 시간 상수 10 ms보다 짧아야 앞의 EPSP가 사라지기 전에 겹친다`;
    });
  });

  // 2-5 세균 증식과 선천 면역: 식세포가 세균을 없애는 빠르기 k (/시간), 세균은 30분마다 두 배
  Q.def("adbio-innate", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ k }) => {
      clear(g);
      const r = Math.log(2) / 0.5, net = r - k, P = (t) => 3 + net * t / Math.LN10;
      const F = frame(g, 0, 24, 0, 12, [4, 2]); ticks(g, F, [0, 4, 8, 12, 16, 20, 24], [0, 2, 4, 6, 8, 10, 12]); axl(g, "감염 뒤 시간 (시간)", "log 세균 수");
      Q.plot(g, F, (t) => Math.max(0, Math.min(12, P(t))), "b", 0, 24, 100);
      Q.plot(g, F, (t) => Math.min(12, 3 + r * t / Math.LN10), "gd", 0, 24, 100);
      read.textContent = `세균 1000마리가 들어왔을 때, 식세포가 시간당 ${num(k, 2)}의 비율로 없애면 알짜 증식률 ${num(net, 2)}/시간 → ` + (net < 0 ? `세균이 줄어 ${num((3) / (-net / Math.LN10), 1)}시간 뒤 사라진다` : `24시간 뒤 ${(10 ** Math.min(12, P(24))).toExponential(1)}마리로 는다. 후천 면역이 오기까지 버티지 못한다`);
    });
  });

  // 2-6 V(D)J 재조합의 다양성: 연결 부위 다양성 배율 10^j
  Q.def("adbio-vdj", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ j }) => {
      clear(g);
      const H = 40 * 23 * 6, Lk = 40 * 5, Ll = 30 * 4, L = Lk + Ll, comb = H * L, tot = comb * 10 ** j;
      bar(g, 30, Math.log10(H) * 40, "lb", "무거운 사슬 (V×D×J)", `${big(H)}`);
      bar(g, 70, Math.log10(L) * 40, "lb", "가벼운 사슬 (κ + λ)", `${L}`);
      bar(g, 110, Math.log10(comb) * 40, "lk", "짝 조합", `${big(comb)}`);
      bar(g, 150, Math.log10(tot) * 22, "lc", "연결 부위 다양성까지", tot >= 1e12 ? `${(tot).toExponential(1)}` : big(tot));
      read.textContent = `유전자 조각의 조합만으로 ${big(comb)}가지, 조각을 이을 때 염기가 더해지고 빠지는 다양성(×10^${num(j, 1)})까지 더하면 약 ${tot.toExponential(1)}가지 수용체`;
    });
  });

  // 3-1 복제의 정확도: 단계 s (0 중합 효소만, 1 교정 추가, 2 불일치 수선 추가)
  const FID = [["중합 효소의 염기 선택", 1e-5], ["+ 3′→5′ 교정", 1e-7], ["+ 불일치 수선", 1e-10]];
  Q.def("adbio-fid", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ s }) => {
      clear(g);
      FID.forEach(([nm, e], i) => bar(g, 40 + i * 42, (-Math.log10(e) - 4) * 40, i <= s ? (i === s ? "lc" : "lb") : "lk", nm, `염기 ${(1 / e).toExponential(0).replace("e+", " × 10^")}개당 1개`, 200));
      const err = FID[s][1] * 6.4e9;
      read.textContent = `${FID[s][0]}: 오류율 ${FID[s][1].toExponential(0)}. 사람 세포 하나의 64억 염기쌍을 복제하면 틀린 염기 약 ${err >= 10 ? num(err, 0) : num(err, 1)}개`;
    }, (k, x) => ["중합 효소만", "교정 추가", "수선 추가"][x]);
  });

  // 3-2 활성자와 전사: 활성자 농도 10^la (Kd 단위), 협동 인자 ω = 50, 중합 효소 결합 P/Kp = 0.01
  Q.def("adbio-act", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    const p = 0.01, w = 50, pb = (a) => (p * (1 + a * w)) / (1 + p + a + p * a * w);
    Q.bind(fig, ({ la }) => {
      clear(g);
      const F = frame(g, -2, 2, 0, 0.4, [0.5, 0.1]); ticks(g, F, [-2, -1, 0, 1, 2], [0, 0.1, 0.2, 0.3, 0.4]); axl(g, "log 활성자 농도 (결합 상수 단위)", "프로모터에 중합 효소가 붙은 확률");
      Q.plot(g, F, (x) => pb(10 ** x), "b", -2, 2, 200);
      const a = 10 ** la;
      Q.dot(g, F.x(la), F.y(pb(a)), "fd", 5);
      read.textContent = `활성자 ${num(a, 2)} Kd: 중합 효소가 붙어 있을 확률 ${num(pb(a) * 100, 1)}% (활성자가 없을 때 ${num(pb(0) * 100, 2)}%), 전사가 ${num(pb(a) / pb(0), 0)}배로 늘어난다(모형)`;
    });
  });

  // 3-3 인공 mRNA로 푼 암호: 반복 서열
  const COD = { UUU: "Phe", UCU: "Ser", CUC: "Leu", UUC: "Phe", CUU: "Leu", UAU: "Tyr", CUA: "Leu", AUC: "Ile", AAG: "Lys", AGA: "Arg", GAA: "Glu", UCA: "Ser", CAU: "His" };
  const REP = ["U", "UC", "UUC", "AAG", "UAUC"];
  Q.def("adbio-code", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ r }) => {
      clear(g);
      const u = REP[r], seq = u.repeat(Math.ceil(24 / u.length) + 4).slice(0, 26);
      txt(g, 20, 30, `5′-${seq.slice(0, 24)}…`, "s");
      const out = [];
      for (let f = 0; f < 3; f++) { const aa = []; for (let i = f; i + 3 <= f + 15; i += 3) aa.push(COD[seq.slice(i, i + 3)] || "?"); out.push(aa); txt(g, 20, 70 + f * 40, `읽기 틀 ${f + 1}`, "s"); txt(g, 110, 70 + f * 40, aa.join(" − "), "s"); }
      read.textContent = `폴리(${u}): ` + (u.length === 3 ? `세 읽기 틀이 각각 ${out.map((a) => a[0]).join(", ")}만 이어진 펩타이드를 만든다` : u.length === 1 ? "UUU만 되풀이되어 페닐알라닌만 이어진다" : u.length === 2 ? "두 코돈이 번갈아 나와 두 아미노산이 번갈아 이어진다" : "네 아미노산이 되풀이되는 펩타이드 하나");
    }, (k, x) => "폴리(" + REP[x] + ")");
  });

  // 3-4 단백질이 새 정상 상태에 이르는 시간: 단백질 반감기 (시간)
  Q.def("adbio-resp", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ h }) => {
      clear(g);
      const k = Math.LN2 / h, P = (t) => 1 - Math.exp(-k * t);
      const F = frame(g, 0, 48, 0, 1, [6, 0.25]); ticks(g, F, [0, 12, 24, 36, 48], [0, 0.25, 0.5, 0.75, 1]); axl(g, "유전자를 켠 뒤 시간 (시간)", "새 정상 상태의 비율");
      Q.plot(g, F, (t) => 1 - Math.exp(-Math.LN2 / 0.33 * t), "gd", 0, 48, 200);
      Q.plot(g, F, P, "b", 0, 48, 200);
      read.textContent = `단백질 반감기 ${num(h, 1)}시간: 새 정상 상태의 90%에 이르는 데 약 ${num(3.32 * h, 1)}시간 (반감기의 3.3배). 회색은 분열로 20분마다 희석되는 대장균`;
    });
  });

  // 3-5 비코이드 농도 기울기: 엄마 유전자 사본 수 배율 m
  Q.def("adbio-bcd", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ m }) => {
      clear(g);
      const lam = 0.2, C = (x, mm) => mm * Math.exp(-x / lam), th = 0.18, xb = (mm) => lam * Math.log(mm / th);
      const F = frame(g, 0, 1, 0, 2, [0.1, 0.5]); ticks(g, F, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 0.5, 1, 1.5, 2]); axl(g, "앞에서 뒤로의 위치 (배아 길이 = 1)", "비코이드 농도");
      Q.line(g, F.x(0), F.y(th), F.x(1), F.y(th), "c");
      Q.plot(g, F, (x) => C(x, 1), "gd", 0, 1, 100); Q.plot(g, F, (x) => Math.min(2, C(x, m)), "b", 0, 1, 100);
      Q.dot(g, F.x(xb(m)), F.y(th), "fd", 5);
      read.textContent = `비코이드 ${num(m, 1)}배: 문턱 농도(주황)에 닿는 경계가 앞에서 ${num(xb(m) * 100, 0)}% 위치 (1배일 때 ${num(xb(1) * 100, 0)}%). 양을 두 배로 하면 경계가 λ ln 2 ≈ 14%만큼 뒤로 밀린다`;
    });
  });

  // 4-1 한계 희석: 우물 하나에 들어가는 세포 수의 평균 λ
  Q.def("adbio-limit", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ l }) => {
      clear(g);
      const p0 = Math.exp(-l), p1 = l * Math.exp(-l), p2 = 1 - p0 - p1, mono = p1 / (1 - p0);
      bar(g, 30, p0 * 250, "lk", "세포 없음", `${num(p0 * 100, 0)}%`);
      bar(g, 70, p1 * 250, "lb", "세포 하나", `${num(p1 * 100, 0)}%`);
      bar(g, 110, p2 * 250, "lc", "세포 둘 이상", `${num(p2 * 100, 0)}%`);
      read.textContent = `우물마다 평균 ${num(l, 2)}개: 세포가 자란 우물 가운데 한 세포에서 나온 것(단일 클론)은 ${num(mono * 100, 0)}%. 평균을 1보다 작게 해야 단일 클론일 가능성이 높다(푸아송 분포)`;
    });
  });

  // 4-2 PCR 증폭: 순환 횟수 n, 효율 E
  Q.def("adbio-pcr", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ n, e }) => {
      clear(g);
      const N = (c, E) => 100 * (1 + E) ** c;
      const F = frame(g, 0, 40, 2, 14, [5, 2]); ticks(g, F, [0, 10, 20, 30, 40], [2, 4, 6, 8, 10, 12, 14]); axl(g, "순환 횟수", "log 사본 수");
      Q.plot(g, F, (c) => Math.log10(N(c, 1)), "gd", 0, 40, 50);
      Q.plot(g, F, (c) => Math.log10(N(c, e)), "b", 0, 40, 50);
      Q.dot(g, F.x(n), F.y(Math.log10(N(n, e))), "fd", 5);
      read.textContent = `주형 100개, 효율 ${num(e * 100, 0)}%, ${n}번 순환: 사본 ${N(n, e).toExponential(1)}개 (효율 100%면 ${N(n, 1).toExponential(1)}개). 효율이 조금만 낮아도 차이가 순환마다 곱해진다`;
    });
  });

  // 4-3 서열 읽기의 깊이: 평균 커버리지 c (랜더–워터먼)
  Q.def("adbio-cov", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ c }) => {
      clear(g);
      const F = frame(g, 0, 15, -7, 0, [1, 1]); ticks(g, F, [0, 5, 10, 15], [-6, -4, -2, 0]); axl(g, "평균 커버리지 (배)", "log 한 번도 안 읽힌 비율");
      Q.plot(g, F, (x) => Math.max(-7, -x / Math.LN10), "b", 0, 15, 100);
      Q.dot(g, F.x(c), F.y(Math.max(-7, -c / Math.LN10)), "fd", 5);
      const miss = Math.exp(-c);
      read.textContent = `${num(c, 1)}배로 읽으면 유전체의 ${num(miss * 100, miss < 0.01 ? 4 : 1)}%가 한 번도 읽히지 않는다 (e^−c). 사람 유전체 31억 염기쌍으로는 약 ${big(miss * 3.1e9)}개 염기`;
    });
  });

  // 4-4 표적 밖 편집의 위험: 세포 하나에서 표적 밖 편집이 일어날 확률 10^lp, 편집한 세포 수 10^ln
  Q.def("adbio-off", (fig, svg) => {
    const g = el("g", {}, svg), read = fig.querySelector(".q-read");
    Q.bind(fig, ({ lp, ln }) => {
      clear(g);
      const p = 10 ** lp, n = 10 ** ln, ex = p * n, any = 1 - Math.exp(-ex);
      bar(g, 50, Math.min(300, Math.log10(1 + ex) * 40), "lc", "표적 밖 편집 세포 수 (기댓값)", `${ex < 10 ? num(ex, 2) : big(ex)}개`);
      bar(g, 95, any * 300, "lb", "하나라도 생길 확률", `${num(any * 100, 1)}%`);
      read.textContent = `세포마다 ${p.toExponential(0)}의 확률, 세포 ${big(n)}개를 편집: 표적 밖 편집 세포 약 ${ex < 10 ? num(ex, 2) : big(ex)}개, 하나라도 생길 확률 ${num(any * 100, 1)}%. 아주 작은 확률도 세포 수가 많으면 거의 확실해진다`;
    });
  });
})();
