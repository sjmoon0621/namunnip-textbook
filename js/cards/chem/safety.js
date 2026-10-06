/* 카드: 시약병의 그림 문자만 보고 위험을 알아챌 수 있을까? — GHS 그림 문자, 사고 대처, 폐액 분류 문제 */
(() => {
  const root = document.getElementById("card-chem-safety");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  // 그림 문자 SVG (빨간 마름모 + 기호를 단순화해 그림)
  const ICON = {
    flame: '<path d="M32 46c-8 0-12-6-10-13 2-6 7-8 6-14 6 4 8 9 7 13 2-2 3-4 3-7 4 4 6 9 4 14-1 4-5 7-10 7z" fill="#222"/>',
    corr: '<path d="M18 22h12l-4 6h-8zM34 22h12l-2 6h-8z" fill="#222"/><path d="M22 30v6M40 30v6" stroke="#222" stroke-width="2"/><path d="M16 42h14M36 44q4-4 10 0" stroke="#222" stroke-width="3" fill="none"/>',
    skull: '<circle cx="32" cy="28" r="9" fill="#222"/><circle cx="29" cy="27" r="2" fill="#fff"/><circle cx="35" cy="27" r="2" fill="#fff"/><path d="M22 40l20 8M42 40l-20 8" stroke="#222" stroke-width="3"/>',
    excl: '<path d="M30 18h4l-1 20h-2z" fill="#222"/><circle cx="32" cy="44" r="2.5" fill="#222"/>',
    health: '<circle cx="32" cy="20" r="4" fill="#222"/><path d="M24 48v-16q8-6 16 0v16z" fill="#222"/><path d="M28 34l4 4 4-4-4 6z" fill="#fff"/>',
    env: '<path d="M18 46h28" stroke="#222" stroke-width="2"/><path d="M38 44q4-14 0-24M38 30l-6-4M38 34l6-3" stroke="#222" stroke-width="2" fill="none"/><path d="M20 40q6-6 12 0q-6 6-12 0z" fill="#222"/>',
    oxid: '<circle cx="32" cy="40" r="8" fill="none" stroke="#222" stroke-width="3"/><path d="M32 34c-5 0-7-4-6-8 1-4 4-5 4-9 4 3 5 6 4 9 1-1 2-3 2-5 3 3 4 7 2 10-1 2-3 3-6 3z" fill="#222"/>',
  };
  const pict = (k) => `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><rect x="12" y="12" width="40" height="40" transform="rotate(45 32 32)" fill="#fff" stroke="#d12" stroke-width="4"/>${ICON[k]}</svg>`;
  const Q = {
    label: [
      { pic: "flame", q: "이 그림 문자가 붙은 에탄올 병을 어디에 두어야 할까요?", opts: [["가스버너 옆 실험대", 0, "인화성 액체는 불씨와 열원에서 멀리 둡니다."], ["불꽃·열원에서 떨어진 환기되는 시약장", 1, "맞습니다. 증기가 모이지 않게 환기되고 불씨가 없는 곳에 둡니다."], ["햇빛이 잘 드는 창가", 0, "열과 햇빛은 증기압을 높여 위험합니다."]] },
      { pic: "corr", q: "진한 염산병에 붙은 그림 문자의 뜻은?", opts: [["피부·눈을 손상시키고 금속을 부식시킨다", 1, "맞습니다. 보안경과 장갑을 반드시 씁니다."], ["불이 잘 붙는다", 0, "그것은 불꽃 그림입니다."], ["환경에만 해롭다", 0, "환경 그림은 물고기와 나무입니다."]] },
      { pic: "skull", q: "해골 그림 문자가 있는 시약을 다룰 때 가장 알맞은 것은?", opts: [["냄새를 직접 맡아 확인한다", 0, "급성 독성 물질은 적은 양을 들이마셔도 위험합니다."], ["흄 후드 안에서 장갑을 끼고 다룬다", 1, "맞습니다. 급성 독성은 삼키거나 들이마시거나 피부로 흡수되면 생명이 위험할 수 있습니다."], ["양이 적으면 맨손으로 다뤄도 된다", 0, "양이 적어도 피부로 흡수될 수 있습니다."]] },
      { pic: "env", q: "황산 구리(II) 용액 병의 이 그림 문자가 알려 주는 것은?", opts: [["하수구에 버리면 안 된다", 1, "맞습니다. 수생 생물에 독성이 있어 폐액통에 모읍니다."], ["물과 섞으면 폭발한다", 0, "폭발성은 폭탄 그림입니다."], ["피부에 닿아도 괜찮다", 0, "이 그림은 환경 위험을 뜻할 뿐 피부 안전을 보장하지 않습니다."]] },
      { pic: "oxid", q: "과산화 수소(30%)의 이 그림 문자(원 위의 불꽃)의 뜻은?", opts: [["다른 물질이 잘 타도록 산소를 내놓는다", 1, "맞습니다. 산화성 물질은 가연물과 따로 보관합니다."], ["스스로 불이 붙는다", 0, "스스로 타는 인화성은 원 없는 불꽃 그림입니다."], ["독성이 전혀 없다", 0, "그림 문자는 여러 개가 함께 붙을 수 있습니다."]] },
    ],
    act: [
      { q: "실험 중 묽은 황산이 눈에 튀었습니다.", opts: [["눈을 비벼 닦는다", 0, "비비면 손상이 커집니다."], ["세안기로 눈꺼풀을 벌리고 15분 이상 씻은 뒤 알린다", 1, "맞습니다. 콘택트렌즈가 있으면 빼고 계속 씻습니다."], ["묽은 염기를 떨어뜨려 중화한다", 0, "중화열과 염기 자체가 눈을 더 다치게 합니다."]] },
      { q: "알코올램프가 넘어져 실험대 위의 에탄올에 불이 붙었습니다.", opts: [["물을 붓는다", 0, "에탄올은 물에 섞이지만 불붙은 액체가 튀어 번질 수 있습니다. 작은 불은 덮어 끕니다."], ["젖은 천이나 방화포로 덮고 주변 가연물을 치운다", 1, "맞습니다. 산소를 차단해 끕니다. 크면 소화기를 쓰고 대피합니다."], ["입으로 분다", 0, "불길이 퍼지고 얼굴을 다칠 수 있습니다."]] },
      { q: "진한 산을 묽혀야 합니다. 바른 순서는?", opts: [["산에 물을 한꺼번에 붓는다", 0, "많은 열이 한 곳에서 나서 끓어 튈 수 있습니다."], ["물에 산을 조금씩 저으며 넣는다", 1, "맞습니다. 많은 물이 열을 나눠 흡수합니다."], ["순서는 상관없다", 0, "순서가 안전을 좌우합니다."]] },
      { q: "시험관을 가열하는 중입니다. 입구는 어디를 향해야 할까요?", opts: [["나를 향하게", 0, "끓어 넘친 액체가 얼굴로 튈 수 있습니다."], ["사람이 없는 쪽으로 비스듬히", 1, "맞습니다. 그리고 바닥만 가열하지 말고 흔들며 고르게 데웁니다."], ["옆 친구를 향하게", 0, "다른 사람도 다칠 수 있습니다."]] },
    ],
    waste: [
      { q: "실험이 끝난 묽은 염산 폐액은 어디에?", opts: [["산성 폐액통", 1, "맞습니다. 다른 폐액과 섞지 않습니다."], ["싱크대", 0, "배관을 부식시키고 환경에 해롭습니다."], ["유기 용매 폐액통", 0, "성질이 다른 폐액을 섞으면 반응할 수 있습니다."]] },
      { q: "헥세인과 아이오딘을 쓴 폐액은?", opts: [["유기(비할로젠) 용매 폐액통", 1, "맞습니다. 유기 용매는 불이 붙기 쉬워 따로 모읍니다."], ["산성 폐액통", 0, "유기 용매는 산과 따로 모읍니다."], ["물에 많이 희석해 싱크대로", 0, "헥세인은 물에 섞이지 않고 하수에 들어가면 안 됩니다."]] },
      { q: "질산 은 용액이 남았습니다.", opts: [["중금속 폐액통", 1, "맞습니다. 은, 구리, 납 같은 금속 이온은 따로 모아 처리합니다."], ["산성 폐액통", 0, "금속 이온 폐액은 따로 분류합니다."], ["일반 쓰레기통", 0, "액체 시약은 쓰레기통에 버리지 않습니다."]] },
      { q: "산성 폐액과 시안화물이 든 폐액을 같은 통에 버려도 될까요?", opts: [["된다, 둘 다 해로운 액체니까", 0, "산과 시안화물이 만나면 맹독성 기체가 생깁니다."], ["절대 안 된다", 1, "맞습니다. 폐액을 성질별로 나누는 가장 큰 이유가 섞였을 때의 반응입니다."], ["양이 적으면 괜찮다", 0, "적은 양도 위험한 기체를 낼 수 있습니다."]] },
    ],
  };
  const NAME = { label: "그림 문자", act: "사고 대처", waste: "폐액" };
  let stage = "label", idx = 0, score = 0, tried = 0, answered = false;
  function render() {
    const it = Q[stage][idx];
    $(".sf-q").innerHTML = `<div style="display:flex;gap:14px;align-items:center;margin:10px 0">${it.pic ? pict(it.pic) : ""}<p style="margin:0"><b>${idx + 1}/${Q[stage].length}</b> ${it.q}</p></div>`;
    $(".sf-opts").innerHTML = it.opts.map(([t], i) => `<button class="chip" data-i="${i}">${t}</button>`).join("");
    $(".verdict").textContent = ""; $(".verdict").className = "verdict small"; answered = false;
    $(".n-g").textContent = NAME[stage];
  }
  root.addEventListener("click", (e) => {
    const s = e.target.closest("[data-g]"), o = e.target.closest("[data-i]");
    if (s) { stage = s.dataset.g; idx = 0; root.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", String(x === s))); render(); }
    if (o) {
      const [, ok, why] = Q[stage][idx].opts[+o.dataset.i];
      if (!answered) { tried++; if (ok) score++; answered = true; }
      $(".verdict").textContent = why; $(".verdict").className = "verdict small " + (ok ? "good" : "bad");
      $(".n-s").textContent = score; $(".n-n").textContent = tried;
      if (ok) setTimeout(() => { idx = (idx + 1) % Q[stage].length; render(); }, 1600);
    }
  });
  render();
})();
