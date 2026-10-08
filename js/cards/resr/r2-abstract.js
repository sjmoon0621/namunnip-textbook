/* 카드: 이 초록과 그림, 무엇이 빠지고 무엇이 지나칠까? — 가상의 학생 초록과 막대그래프에서 문제 찾기 */
(() => {
  const root = document.getElementById("card-resr-abstract");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const SENT = [
    { t: "식물은 인류의 생존에 매우 중요하므로 식물의 생장은 반드시 연구해야 할 주제이다.", p: "서론", bad: "배경이 막연하고 과장되었습니다. 왜 하필 이 질문(액체 비료와 강낭콩)을 연구했는지가 드러나지 않습니다." },
    { t: "본 연구에서는 액체 비료가 강낭콩 모종의 생장에 미치는 영향을 알아보았다.", p: "서론" },
    { t: "강낭콩에 비료를 주고 키를 재었다.", p: "방법", bad: "대조군, 표본 수, 배정 방법, 비료 농도, 기간이 없습니다. 결과를 믿을 근거가 빠졌습니다." },
    { t: "그 결과 비료를 준 강낭콩이 훨씬 잘 자랐다.", p: "결과", bad: "\"훨씬\" 대신 평균, 차이, 불확실성(구간이나 p값)을 숫자로 적어야 합니다." },
    { t: "이상하게 작게 자란 화분 2개는 실험 실수로 보고 제외하였다.", p: "방법", bad: "제외 기준이 없습니다. 결과가 마음에 들지 않아 뺀 것과 구별되지 않습니다. 미리 정한 기준과 기록된 이유를 밝혀야 합니다." },
    { t: "따라서 비료는 식물의 생장을 촉진한다는 것이 증명되었다.", p: "결론", bad: "강낭콩 모종, 한 농도, 2주의 결과를 \"식물\" 전체로 넓혔고, 실험으로 \"증명\"했다고 썼습니다." },
    { t: "앞으로 비료의 농도와 기간을 달리한 실험이 필요하다.", p: "결론" },
  ];
  const FIXED = [
    ["서론", "질소 비료가 잎의 생장을 돕는다는 문헌을 바탕으로, 가정에서 쓰는 액체 비료가 강낭콩 모종의 초기 생장을 높이는지 알아보았다."],
    ["방법", "모종 30개를 창에서의 거리가 같은 줄끼리 짝지어 무작위로 처리군(액체 비료 1000배 희석액, 주 2회)과 대조군(같은 양의 물)에 15개씩 배정하고, 2주 동안 자란 키를 쟀다."],
    ["방법", "넘어져 줄기가 꺾인 화분은 분석에서 빼기로 미리 정했고, 이에 따라 대조군 1개를 제외하였다."],
    ["결과", "처리군은 대조군보다 평균 1.4 cm 더 자랐다(12.5 cm 대 11.1 cm, 95% 신뢰구간 0.2~2.6 cm, 웰치 t 검정 p = 0.02)."],
    ["결론", "이 조건에서 액체 비료가 강낭콩 모종의 키 생장을 높인다는 가설이 지지되었다."],
    ["결론", "농도와 기간, 다른 품종에서의 효과는 추가 실험이 필요하다."],
  ];
  /* 그림의 문제 지점: k, 영역 목록 [[x, y, w, h], …], 문제면 bad, 괜찮으면 ok */
  const HS = [
    { k: "axis", r: [[4, 20, 40, 165]], bad: "세로축에 이름과 단위가 없습니다. 무엇을 어떤 단위로 쟀는지 알 수 없습니다." },
    { k: "trunc", r: [[20, 188, 40, 18]], bad: "세로축이 0이 아니라 9에서 시작합니다. 막대 길이가 값에 비례하지 않아 약 13% 차이가 1.7배로 보입니다." },
    { k: "digits", r: [[100, 88, 60, 16], [220, 26, 60, 16]], bad: "11.0667, 12.4667처럼 자릿수가 측정 정밀도(mm)보다 많습니다." },
    { k: "err", r: [[100, 106, 60, 90], [220, 44, 60, 152]], bad: "오차 막대와 반복 수(n)가 없어 차이가 우연보다 큰지 판단할 수 없습니다." },
    { k: "title", r: [[150, 0, 120, 22]], bad: "\"결과\"는 그림 설명이 아닙니다. 그림 아래에 번호와 무엇을 그렸는지(조건, n, 오차 막대의 뜻)를 적습니다." },
    { k: "xlab", r: [[96, 200, 230, 18]], ok: "가로축의 집단 이름은 알맞습니다. 범주형 비교이므로 막대그래프도 알맞습니다." },
  ];
  let view = "txt", fixed = false, checked = false;
  const picked = new Set(), pickedF = new Set();

  function renderText() {
    const box = $(".ab-text");
    if (fixed) { box.innerHTML = FIXED.map(([p, t]) => `<span class="ab-s">${t}<sup>${p}</sup></span> `).join(""); return; }
    box.innerHTML = SENT.map((s, i) => {
      let cls = "ab-s";
      if (checked) cls += s.bad ? (picked.has(i) ? " hit" : " miss") : (picked.has(i) ? " false" : "");
      return `<button type="button" class="${cls}" data-i="${i}" aria-pressed="${picked.has(i)}">${s.t}${checked ? `<sup>${s.p}</sup>` : ""}</button> `;
    }).join("");
  }

  function svgFig() {
    const W = 340, H = 268;
    if (fixed) {
      const Y = (v) => 196 - v / 14 * 170;
      const bars = [["대조군", 11.07, 0.42], ["비료", 12.47, 0.38]];
      return `<svg class="ab-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="고친 그림: 세로축 0부터, 오차 막대와 설명이 있는 막대그래프">
        <text x="12" y="16" font-size="11" fill="#5d5d61">자란 키 (cm)</text>
        ${[0, 4, 8, 12].map((v) => `<line x1="48" x2="320" y1="${Y(v)}" y2="${Y(v)}" stroke="#d9dad2"/><text x="42" y="${Y(v) + 4}" font-size="10" text-anchor="end" fill="#8d8d92">${v}</text>`).join("")}
        <line x1="48" x2="48" y1="22" y2="196" stroke="#232326"/>
        ${bars.map(([n, m, se], i) => { const x = 100 + i * 120; return `<rect x="${x}" y="${Y(m)}" width="60" height="${196 - Y(m)}" fill="${i ? "#3b7c2a" : "#8d8d92"}"/>
          <line x1="${x + 30}" x2="${x + 30}" y1="${Y(m + se)}" y2="${Y(m - se)}" stroke="#232326" stroke-width="1.4"/>
          <line x1="${x + 24}" x2="${x + 36}" y1="${Y(m + se)}" y2="${Y(m + se)}" stroke="#232326" stroke-width="1.4"/>
          <line x1="${x + 24}" x2="${x + 36}" y1="${Y(m - se)}" y2="${Y(m - se)}" stroke="#232326" stroke-width="1.4"/>
          <text x="${x + 30}" y="${Y(m + se) - 5}" font-size="11" text-anchor="middle" fill="#232326">${m.toFixed(1)}</text>
          <text x="${x + 30}" y="212" font-size="12" text-anchor="middle" fill="#232326">${n}</text>`; }).join("")}
        <text x="8" y="240" font-size="10.5" fill="#5d5d61">그림 1. 2주 동안 자란 강낭콩 모종의 키.</text>
        <text x="8" y="256" font-size="10.5" fill="#5d5d61">막대는 평균, 오차 막대는 평균의 표준오차 (대조군 n = 14, 비료 n = 15).</text>
      </svg>`;
    }
    const Y = (v) => 196 - (v - 9) / 3.6 * 160;
    const bars = [["대조군", "11.0667"], ["비료", "12.4667"]];
    const hs = HS.map((h, i) => {
      let cls = "hs" + (pickedF.has(i) ? " on" : "");
      if (checked && pickedF.has(i) && h.ok) cls = "hs ok";
      if (checked && !pickedF.has(i) && h.bad) cls = "hs miss";
      return h.r.map((r) => `<rect class="${cls}" data-h="${i}" x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}"></rect>`).join("");
    }).join("");
    return `<svg class="ab-svg" viewBox="0 0 ${W} 224" role="img" aria-label="진단할 그림: 제목이 결과이고 세로축이 9에서 시작하는 막대그래프">
      <text x="210" y="16" font-size="14" font-weight="600" text-anchor="middle" fill="#232326">결과</text>
      ${[9, 10, 11, 12].map((v) => `<line x1="48" x2="320" y1="${Y(v)}" y2="${Y(v)}" stroke="#d9dad2"/><text x="42" y="${Y(v) + 4}" font-size="10" text-anchor="end" fill="#8d8d92">${v}</text>`).join("")}
      <line x1="48" x2="48" y1="30" y2="196" stroke="#232326"/>
      ${bars.map(([n, v], i) => { const x = 100 + i * 120, m = +v; return `<rect x="${x}" y="${Y(m)}" width="60" height="${196 - Y(m)}" fill="${i ? "#3b7c2a" : "#e0a02a"}"/>
        <text x="${x + 30}" y="${Y(m) - 5}" font-size="11" text-anchor="middle" fill="#232326">${v}</text>
        <text x="${x + 30}" y="212" font-size="12" text-anchor="middle" fill="#232326">${n}</text>`; }).join("")}
      ${hs}
    </svg>`;
  }
  const renderFig = () => { $(".ab-fig").innerHTML = svgFig(); };

  function report() {
    const v = $(".verdict"), list = $(".ab-list");
    v.className = "verdict small"; list.innerHTML = "";
    if (!checked || fixed) { v.textContent = fixed ? (view === "txt" ? "고친 초록입니다. 위첨자로 표시한 부분의 순서를 보세요. 방법과 결과에 숫자가 들어갔습니다." : "고친 그림입니다. 축 이름과 단위, 0부터 시작하는 축, 오차 막대와 그 뜻, 반복 수를 그림 설명에 적었습니다.") : ""; return; }
    if (view === "txt") {
      const bad = SENT.map((s, i) => [s, i]).filter(([s]) => s.bad);
      const hit = bad.filter(([, i]) => picked.has(i)).length, fp = [...picked].filter((i) => !SENT[i].bad).length;
      v.textContent = `문제 문장 ${bad.length}개 중 ${hit}개를 찾았습니다.${fp ? ` 문제가 없는 문장 ${fp}개를 골랐습니다(취소선).` : ""}${hit < bad.length ? " 노란 밑줄은 놓친 문장입니다." : ""}`;
      v.classList.add(hit === bad.length && !fp ? "good" : "bad");
      list.innerHTML = bad.map(([s]) => `<li><b>${s.t.slice(0, 14)}…</b> ${s.bad}</li>`).join("");
    } else {
      const bad = HS.map((h, i) => [h, i]).filter(([h]) => h.bad);
      const hit = bad.filter(([, i]) => pickedF.has(i)).length;
      const okPicked = HS.filter((h, i) => h.ok && pickedF.has(i));
      v.textContent = `고칠 곳 ${bad.length}곳 중 ${hit}곳을 찾았습니다.${hit < bad.length ? " 노란 점선은 놓친 곳입니다." : ""}`;
      v.classList.add(hit === bad.length && !okPicked.length ? "good" : "bad");
      list.innerHTML = bad.map(([h, i]) => `<li>${pickedF.has(i) ? "찾음" : "놓침"} — ${h.bad}</li>`).join("") + okPicked.map((h) => `<li>괜찮은 곳 — ${h.ok}</li>`).join("");
    }
  }
  const render = () => { renderText(); renderFig(); report(); };

  root.querySelector(".card-fig").addEventListener("click", (e) => {
    const hs = e.target.closest(".hs");
    if (hs) { const i = +hs.dataset.h; pickedF.has(i) ? pickedF.delete(i) : pickedF.add(i); render(); return; }
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.i) { const i = +b.dataset.i; picked.has(i) ? picked.delete(i) : picked.add(i); }
    else if (b.dataset.v) {
      view = b.dataset.v; checked = false;
      root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      root.querySelectorAll(".ab-pane").forEach((p) => { p.hidden = p.dataset.pane !== view; });
    } else if (b.classList.contains("check")) checked = true;
    else if (b.classList.contains("fixed")) { fixed = !fixed; b.setAttribute("aria-pressed", String(fixed)); }
    else if (b.classList.contains("reset")) { picked.clear(); pickedF.clear(); checked = false; fixed = false; $(".fixed").setAttribute("aria-pressed", "false"); }
    else return;
    render();
  });
  if (/[?&]demo\b/.test(location.search)) { [2, 3, 6].forEach((i) => picked.add(i)); checked = true; }
  render();
})();
