/* 카드: 확진자의 이동 경로, 어디까지 공개해야 할까? — 이해관계자 평가표와 판단 기준 */
(() => {
  const root = document.getElementById("card-is2-ethics");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const table = $(".eth-table"), rules = root.querySelectorAll("[data-rule]"), out = $(".eth-out"), bReset = $(".eth-reset");

  const OPTS = ["공개하지 않음", "장소·시간만", "개인 정보까지"];
  const WHO = ["확진자", "같은 곳에 다녀간 사람", "공개된 가게 주인", "방역 당국", "그 밖의 시민"];
  // 예시 평가(−2 ~ +2). 학생이 바꾸라고 둔 출발점일 뿐, 정답이 아니다.
  const EXAMPLE = [
    [1, -1, -2],
    [-1, 2, 2],
    [0, -1, -1],
    [0, 1, 0],
    [-1, 1, 0],
  ];
  let R = EXAMPLE.map((r) => r.slice()), rule = "sum";

  const RULES = {
    sum: ["모두의 점수 합이 가장 큰 방법", (col) => col.reduce((a, b) => a + b, 0)],
    min: ["가장 손해 보는 사람의 점수가 가장 높은 방법", (col) => Math.min(...col)],
    floor: ["누구도 −2(심각한 피해)를 입지 않는 방법 가운데 합이 가장 큰 것", (col) => (Math.min(...col) <= -2 ? -Infinity : col.reduce((a, b) => a + b, 0))],
  };

  function build() {
    let h = `<thead><tr><th scope="col">누구에게</th>${OPTS.map((o, j) => `<th scope="col" data-col="${j}">${String.fromCharCode(65 + j)}. ${o}</th>`).join("")}</tr></thead><tbody>`;
    WHO.forEach((w, i) => {
      h += `<tr><th scope="row">${w}</th>`;
      OPTS.forEach((_, j) => {
        h += `<td data-col="${j}"><select aria-label="${w}, ${OPTS[j]}" data-i="${i}" data-j="${j}">` +
          [2, 1, 0, -1, -2].map((v) => `<option value="${v}">${v > 0 ? "+" + v : v === 0 ? "0" : "−" + -v}</option>`).join("") + `</select></td>`;
      });
      h += `</tr>`;
    });
    h += `</tbody><tfoot><tr><th scope="row">합</th>${OPTS.map((_, j) => `<td data-col="${j}" class="sum"></td>`).join("")}</tr>` +
      `<tr><th scope="row">가장 낮은 점수</th>${OPTS.map((_, j) => `<td data-col="${j}" class="min"></td>`).join("")}</tr></tfoot>`;
    table.innerHTML = h;
    table.querySelectorAll("select").forEach((s) => s.addEventListener("input", () => { R[+s.dataset.i][+s.dataset.j] = +s.value; update(); }));
  }

  const col = (j) => R.map((r) => r[j]);
  const winners = (key) => {
    const sc = OPTS.map((_, j) => RULES[key][1](col(j))), best = Math.max(...sc);
    return best === -Infinity ? [] : sc.map((v, j) => (v === best ? j : -1)).filter((j) => j >= 0);
  };
  const names = (ws) => ws.length ? ws.map((j) => String.fromCharCode(65 + j)).join(", ") : "없음";

  function update() {
    table.querySelectorAll("select").forEach((s) => {
      const v = R[+s.dataset.i][+s.dataset.j];
      s.value = String(v); s.dataset.v = String(v);
    });
    OPTS.forEach((_, j) => {
      const c = col(j), sum = c.reduce((a, b) => a + b, 0), mn = Math.min(...c);
      table.querySelector(`tfoot .sum[data-col="${j}"]`).textContent = sum > 0 ? `+${sum}` : sum < 0 ? `−${-sum}` : "0";
      table.querySelector(`tfoot .min[data-col="${j}"]`).textContent = mn > 0 ? `+${mn}` : mn < 0 ? `−${-mn}` : "0";
    });
    const ws = winners(rule);
    table.querySelectorAll("[data-col]").forEach((c) => c.classList.toggle("win", ws.includes(+c.dataset.col)));
    rules.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rule === rule)));
    const all = Object.keys(RULES).map((k) => [k, names(winners(k))]);
    const same = new Set(all.map((a) => a[1])).size === 1;
    out.innerHTML = `<b>이 기준으로 고른 방법: ${names(ws)}</b>` +
      (ws.length > 1 ? " (동점이라 이 기준만으로는 정할 수 없습니다)" : ws.length === 0 ? " (모든 방법에 −2를 받는 사람이 있습니다. 새로운 방법을 찾아야 합니다)" : "") +
      `<br><span>세 기준의 결과 — 합: ${all[0][1]} · 가장 손해 보는 사람: ${all[1][1]} · 심각한 피해 없음: ${all[2][1]}. ` +
      (same ? "지금 평가에서는 세 기준이 같은 답을 냅니다." : "같은 평가표인데 기준에 따라 답이 달라집니다.") + `</span>`;
  }

  rules.forEach((b) => b.addEventListener("click", () => { rule = b.dataset.rule; update(); }));
  bReset.addEventListener("click", () => { R = EXAMPLE.map((r) => r.slice()); update(); });
  build(); update();
})();
