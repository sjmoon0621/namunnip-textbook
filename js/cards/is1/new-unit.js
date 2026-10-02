/* 카드: 두 양을 나누면 왜 쓸모 있는 새 단위가 생길까? — 생활 속 유도량 조립, 기본량으로 풀기 */
(() => {
  const root = document.getElementById("card-is1-new-unit");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  // 단위: 기호, SI 지수 {m, s, kg}와 세는 양 {원, 명}
  const Q = {
    d: ["거리", "km", { m: 1 }], t: ["시간", "h", { s: 1 }], v: ["연료 부피", "L", { m: 3 }], n: ["사람 수", "명", { 명: 1 }],
    a: ["넓이", "km²", { m: 2 }], k: ["질량", "kg", { kg: 1 }], w: ["돈", "원", { 원: 1 }], e: ["에너지", "kWh", { kg: 1, m: 2, s: -2 }],
  };
  const NAMED = {
    "d/t": ["속력", "버스가 1시간에 60 km를 간다 → 60 km/h"], "d/v": ["연비", "15 km/L인 차는 휘발유 1 L로 15 km를 간다"],
    "n/a": ["인구 밀도", "서울은 약 15,600명/km², 우리나라 평균은 약 515명/km²"], "w/k": ["단가", "사과가 6,000원/kg이면 2 kg은 12,000원"],
    "e/d": ["전기차 전비(거리당 에너지)", "17 kWh/100 km이면 100 km에 17 kWh를 쓴다"], "d/e": ["전기차 전비(에너지당 거리)", "6 km/kWh이면 1 kWh로 6 km를 간다"],
    "w/e": ["전기 요금 단가", "약 150원/kWh이면 10 kWh는 1,500원"], "k/v": ["밀도", "물은 1 kg/L, 휘발유는 약 0.74 kg/L"],
    "w/n": ["1인당 금액", "학급 회비 5,000원/명"], "k/n": ["1인당 질량", "1인당 쌀 소비 약 56 kg/명(1년)"], "e/t": ["일률(전력)", "1 kWh/h = 1 kW, 전기 난로의 소비 전력"],
    "n/t": ["처리량", "놀이 기구가 시간당 600명/h을 태운다"], "w/t": ["시급", "최저 시급 약 10,000원/h"], "e/n": ["1인당 에너지 사용", "1인당 하루 약 30 kWh/명"],
    "k/a": ["면적당 수확량", "벼 수확 약 500 kg/1000 m²(10 a)"], "w/a": ["땅값 (면적당)", "1 km²는 너무 커서 보통 원/m²를 씀"],
    "d*k": ["(이름 없음) 질량 × 거리", "택배 요금을 매길 때 쓰는 톤킬로미터(t·km)가 이것입니다"], "n*t": ["연인원 시간", "10명이 3시간 일하면 30명·h의 노동량"],
    "e*t": ["(이름 없음)", "에너지 × 시간은 거의 쓰지 않습니다"], "t*t": ["(시간²)", "가속도 단위 m/s²의 분모에 나옵니다"],
  };
  let A = "d", B = "t", op = "/";
  const chips = (host, key, sel) => { host.insertAdjacentHTML("beforeend", Object.entries(Q).map(([k, q]) => `<button class="chip" data-${key}="${k}" aria-pressed="${k === sel}">${q[0]} (${q[1]})</button>`).join("")); };
  chips($(".qa"), "a", A); chips($(".qb"), "b", B);
  const sup = (n) => String(n).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  function upd() {
    const qa = Q[A], qb = Q[B];
    $(".nu-unit").textContent = op === "/" ? `${qa[1]} / ${qb[1]}` : `${qa[1]} · ${qb[1]}`;
    const ex = {}; Object.entries(qa[2]).forEach(([k, v]) => (ex[k] = (ex[k] || 0) + v)); Object.entries(qb[2]).forEach(([k, v]) => (ex[k] = (ex[k] || 0) + (op === "/" ? -v : v)));
    const si = Object.entries(ex).filter(([, v]) => v).map(([k, v]) => (v === 1 ? k : k + sup(v))).join("·");
    $(".nu-si").textContent = `기본량으로 풀면: ${si || "차원 없음 (같은 양끼리 나눔 → 비율, %)"}`;
    const hit = NAMED[`${A}${op}${B}`];
    if (A === B && op === "/") { $(".nu-name").innerHTML = "<b>비율</b> — 같은 양끼리 나누면 단위가 사라집니다"; $(".nu-ex").textContent = "예: 올해 강수량 ÷ 평년 강수량 = 120%"; }
    else if (hit) { $(".nu-name").innerHTML = `<b>${hit[0]}</b>`; $(".nu-ex").textContent = `예: ${hit[1]}`; }
    else { $(".nu-name").innerHTML = "<b>이름 없는 단위</b> — 쓸모 있는 상황을 상상해 이름을 붙여 보세요"; $(".nu-ex").textContent = op === "/" ? `"${qb[0]} 하나당 ${qa[0]}"을 비교해야 할 때가 있을까요?` : `"${qa[0]}"와 "${qb[0]}"가 함께 클수록 커지는 총량이 필요할 때가 있을까요?`; }
    root.querySelectorAll("[data-a]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.a === A)));
    root.querySelectorAll("[data-b]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.b === B)));
    root.querySelectorAll("[data-o]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.o === op)));
  }
  root.addEventListener("click", (e) => { const b = e.target.closest("[data-a],[data-b],[data-o]"); if (!b) return; if (b.dataset.a) A = b.dataset.a; if (b.dataset.b) B = b.dataset.b; if (b.dataset.o) op = b.dataset.o; upd(); });
  upd();
})();
