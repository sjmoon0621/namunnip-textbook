/* 카드: 공룡을 없앤 범인은 소행성일까, 화산일까? — 증거 × 가설 표, 설명한 증거 수와 어긋남 */
(() => {
  const root = document.getElementById("card-is2-mass-extinction");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  // [증거, 설명, 충돌, 화산, 산소 부족]  (+1 설명, -1 어긋남, 0 관계 적음)
  const EV = {
    kpg: [
      ["경계층의 이리듐 농집", "지각에는 드문 이리듐이 전 세계 같은 층에 많다", 1, 0, 0],
      ["충격 석영·작은 유리구슬", "엄청난 충격과 고온에서만 생기는 광물이 경계층에 있다", 1, -1, 0],
      ["칙술루브 크레이터", "멕시코 유카탄반도의 지름 약 180 km 크레이터, 나이 약 6600만 년", 1, 0, 0],
      ["데칸 현무암 대지", "인도에 쌓인 거대한 현무암, 분출 시기가 경계와 겹친다", 0, 1, 0],
      ["전 세계 그을음층", "넓은 지역의 대형 화재를 뜻하는 그을음", 1, 0, 0],
      ["경계 직후 고사리 포자 급증", "식생이 무너진 뒤 고사리가 먼저 되살아났다", 1, 1, 0],
    ],
    pt: [
      ["시베리아 현무암 대지", "러시아의 거대한 현무암, 분출 시기가 경계와 겹친다", 0, 1, 1],
      ["탄소 동위원소 급변", "가벼운 탄소가 갑자기 대기·바다에 많이 들어왔다", 0, 1, 1],
      ["검은 셰일 (무산소 퇴적물)", "산소 없는 바닥에서 쌓이는 유기물 많은 퇴적층", 0, 1, 1],
      ["바다 온도 약 10 °C 상승", "산소 동위원소로 추정한 급격한 온난화", 0, 1, 1],
      ["확실한 충돌 크레이터·충격 석영 없음", "경계와 시기가 맞는 충돌 흔적이 뚜렷하지 않다", -1, 0, 0],
      ["석회질 껍데기 생물이 특히 많이 사라짐", "바다 산성화에 약한 생물이 더 많이 멸종", 0, 1, 1],
    ],
  };
  let ev = "kpg", seen = new Set();
  function render() {
    const rows = EV[ev], sym = (x) => (x > 0 ? '<b class="good">+</b>' : x < 0 ? '<b class="bad">−</b>' : "·");
    $(".ext-tbl").innerHTML = `<table><thead><tr><th>증거</th><th>충돌</th><th>화산</th><th>산소 부족</th></tr></thead><tbody>${rows.map((r, i) => seen.has(i)
      ? `<tr><td style="text-align:left"><b>${r[0]}</b><br><span class="dim">${r[1]}</span></td><td>${sym(r[2])}</td><td>${sym(r[3])}</td><td>${sym(r[4])}</td></tr>`
      : `<tr><td colspan="4" style="text-align:left"><button class="chip" data-i="${i}">증거 ${i + 1} 조사하기</button></td></tr>`).join("")}</tbody></table>`;
    const score = (c) => { let p = 0, n = 0; seen.forEach((i) => { const v = rows[i][c]; if (v > 0) p++; if (v < 0) n++; }); return { p, n }; };
    [[2, ".s-i"], [3, ".s-v"], [4, ".s-a"]].forEach(([c, s]) => { const r = score(c); $(s).textContent = seen.size ? `설명 ${r.p} · 어긋남 ${r.n}` : "—"; $(s).className = s.slice(1) + (r.n ? " bad" : ""); });
    const v = $(".verdict");
    if (seen.size < rows.length) { v.textContent = `증거 ${seen.size}/${rows.length}개 조사함`; v.className = "verdict small"; return; }
    v.textContent = ev === "kpg"
      ? "충돌 가설이 가장 많은 증거를 설명하고 어긋나는 증거가 없습니다. 다만 데칸 현무암은 충돌로 설명되지 않아, 화산 활동이 이미 약해진 생태계를 함께 몰아붙였다는 견해도 있습니다."
      : "충돌 가설과 어긋나는 증거가 있고, 화산 활동과 그로 인한 온난화·산소 부족이 대부분의 증거를 함께 설명합니다. 두 가설은 '화산 → 온난화 → 바다 산소 부족'의 연쇄로 이어집니다.";
    v.className = "verdict small good";
  }
  root.addEventListener("click", (e) => {
    const i = e.target.closest("[data-i]"), b = e.target.closest("[data-e]");
    if (i) { seen.add(+i.dataset.i); render(); }
    if (b) { ev = b.dataset.e; seen = new Set(); root.querySelectorAll("[data-e]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); render(); }
  });
  render();
  if (/[?&]demo\b/.test(location.search)) { EV.kpg.forEach((_, k) => seen.add(k)); render(); }
})();
