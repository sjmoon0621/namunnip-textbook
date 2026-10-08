/* 내 노트 페이지 (notes.html): 메모 · 형광펜 · 오답노트 · 백업. 기록은 js/store.js, 위치 정보는 js/toc.js */
(() => {
  "use strict";
  const S = window.NMStore;
  if (!S || !window.TOC) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const R = ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"];

  // 블록 id → 위치. 목차 순서도 함께 기록해 정렬에 쓴다
  const where = {}; let order = 0; let total = 0;
  TOC.forEach((c) => c.chapters.forEach((ch) => ch.sections.forEach((s) => s.items.forEach((it) => {
    if (where[it.id]) return;   // 여러 곳에 재사용된 블록은 처음 자리를 대표로
    where[it.id] = { c, ch, s, it, order: order++ };
    if (it.kind !== "video") total++;
  }))));
  // 연습문제(기출) 기록은 블록이 아니라 문항 id(ex-…)로 저장되고, 기록의 extra.sec("phy-1-2")로 그 절에 묶는다
  const secAt = {};
  TOC.forEach((c) => c.chapters.forEach((ch) => ch.sections.forEach((s) => { secAt[`${c.id}-${ch.n}-${s.n}`] = { c, ch, s }; })));
  const exOf = (id) => (S.get(id)?.quiz || []).find((r) => r && r.extra)?.extra;
  Object.keys(S.all().blocks).forEach((id) => {
    const x = !where[id] && exOf(id), at = x && secAt[x.sec];
    if (at) where[id] = { ...at, it: { id, title: x.src, kind: "exam" }, order: order++, ex: x };
  });
  const link = (id) => { const w = where[id]; return !w ? null : w.ex ? w.ex.href : `c/${w.c.id}/${w.ch.n}-${w.s.n}.html#${id}`; };
  const date = (t) => t ? new Date(t).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : "";

  // 기록이 있는 블록을 과목·절 순서로 묶는다
  function grouped(filter) {
    const ids = Object.keys(S.all().blocks).filter(filter);
    ids.sort((a, b) => (where[a]?.order ?? 1e9) - (where[b]?.order ?? 1e9));
    const groups = [];
    ids.forEach((id) => {
      const w = where[id];
      const key = w ? `${w.c.id} ${w.ch.n}-${w.s.n}` : "기타";
      let g = groups[groups.length - 1];
      if (!g || g.key !== key) groups.push(g = { key, w, ids: [] });
      g.ids.push(id);
    });
    return groups;
  }
  const groupHead = (g) => g.w
    ? `<h3 class="nb-sec"><span class="mono">${esc(g.w.c.name)} · ${R[g.w.ch.n]} · ${g.w.ch.n}.${g.w.s.n}</span><a href="c/${g.w.c.id}/${g.w.ch.n}-${g.w.s.n}.html">${esc(g.w.s.title)}</a></h3>`
    : `<h3 class="nb-sec"><span class="mono">지금 교과서에 없는 카드</span></h3>`;
  const title = (id) => where[id] ? `<a class="nb-title" href="${link(id)}">${esc(where[id].it.title)}</a>` : `<span class="nb-title">${esc(id)}</span>`;
  const empty = (msg) => `<p class="nb-empty">${msg}</p>`;

  function renderMemo() {
    const gs = grouped((id) => S.get(id).note);
    document.getElementById("v-memo").innerHTML = gs.length ? gs.map((g) => groupHead(g) + g.ids.map((id) => {
      const b = S.get(id);
      return `<article class="nb-item">${title(id)}<span class="mono nb-date">${date(b.noteAt)}</span>
        <p class="nb-note">${esc(b.note)}</p>
        <div class="nb-actions"><a href="${link(id) || "#"}">카드에서 고치기</a><button type="button" data-del-note="${esc(id)}">지우기</button></div></article>`;
    }).join("")).join("") : empty("아직 메모가 없습니다. 카드 제목 오른쪽의 <b>메모</b> 버튼을 눌러 적어 보세요.");
  }

  function renderHl() {
    const gs = grouped((id) => (S.get(id).hl || []).length);
    document.getElementById("v-hl").innerHTML = gs.length ? gs.map((g) => groupHead(g) + g.ids.map((id) => {
      const hs = S.get(id).hl;
      return `<article class="nb-item">${title(id)}
        <ul class="nb-quotes">${hs.map((h, k) => `<li><mark class="hl">${esc(h.t)}</mark><button type="button" data-del-hl="${esc(id)}" data-k="${k}" aria-label="형광펜 지우기">×</button></li>`).join("")}</ul></article>`;
    }).join("")).join("") : empty("아직 칠한 곳이 없습니다. 카드의 글을 드래그해 고르면 <b>형광펜</b> 버튼이 나타납니다.");
  }

  let showResolved = false;
  function renderWrong() {
    const isWrong = (r) => r && r.firstOk === false && (showResolved || !r.resolved);
    const gs = grouped((id) => (S.get(id).quiz || []).some(isWrong));
    const all = Object.values(S.all().blocks).flatMap((b) => (b.quiz || []).filter((r) => r && r.firstOk === false));
    const resolved = all.filter((r) => r.resolved).length;
    const bar = `<div class="nb-bar"><p>처음 풀 때 틀린 문제 <b>${all.length}</b>개 · 해결 <b>${resolved}</b>개</p>
      <label class="mono small"><input type="checkbox" id="nb-show-resolved" ${showResolved ? "checked" : ""}> 해결한 문제도 보기</label></div>`;
    document.getElementById("v-wrong").innerHTML = bar + (gs.length ? gs.map((g) => groupHead(g) + g.ids.map((id) =>
      (S.get(id).quiz || []).map((r, qi) => isWrong(r) ? `
        <article class="nb-item nb-wrong${r.resolved ? " done" : ""}">${title(id)}<span class="mono nb-date">${date(r.at)} · ${r.tries}번 시도${r.ok ? " · 결국 맞힘" : ""}</span>
          ${r.extra ? "" : `<p class="nb-q">${esc(r.q)}</p>`}${r.extra && r.extra.img ? `<img class="nb-exam" src="${esc(r.extra.img)}" alt="${esc(r.extra.src)} 문항" loading="lazy">` : ""}
          <ul class="nb-chosen">${r.wrong.map((w) => `<li><span class="mono">내가 고른 답</span><b>${esc(w.t)}</b><span class="why-t">${esc(w.why)}</span></li>`).join("")}</ul>
          <details><summary>정답 보기</summary><p><b>${esc(r.answer)}</b> — ${esc(r.why)}</p></details>
          <div class="nb-actions"><a href="${link(id) || "#"}">다시 풀어 보기</a>
            <button type="button" data-resolve="${esc(id)}" data-qi="${qi}">${r.resolved ? "해결 취소" : "이해했어요"}</button>
            <button type="button" data-del-quiz="${esc(id)}" data-qi="${qi}">기록 지우기</button></div>
        </article>` : "").join("")).join("")).join("")
      : empty(all.length ? "남은 오답이 없습니다. 모두 해결했어요." : "처음 풀 때 틀린 확인 문제가 여기에 모입니다. 틀린 보기와 그 이유, 정답을 다시 볼 수 있습니다."));
    document.getElementById("nb-show-resolved").addEventListener("change", (e) => { showResolved = e.target.checked; renderWrong(); });
  }

  function renderStats() {
    const bs = Object.values(S.all().blocks);
    const seen = Object.entries(S.all().blocks).filter(([id, b]) => b.seen && where[id] && !["video", "exam"].includes(where[id].it.kind)).length;
    const qs = bs.flatMap((b) => (b.quiz || []).filter(Boolean));
    const first = qs.filter((r) => r.firstOk).length;
    document.getElementById("nb-stats").innerHTML = `
      <div><dt>본 카드·읽기</dt><dd>${seen} / ${total}</dd></div>
      <div><dt>푼 확인 문제</dt><dd>${qs.length}${qs.length ? ` <small>(첫 시도 정답 ${Math.round(first / qs.length * 100)}%)</small>` : ""}</dd></div>
      <div><dt>메모 · 형광펜</dt><dd>${bs.filter((b) => b.note).length} · ${bs.reduce((a, b) => a + (b.hl || []).length, 0)}</dd></div>
      <div><dt>남은 오답</dt><dd class="${qs.some((r) => r.firstOk === false && !r.resolved) ? "bad" : ""}">${qs.filter((r) => r.firstOk === false && !r.resolved).length}</dd></div>`;
  }

  function render() { renderStats(); renderMemo(); renderHl(); renderWrong(); }

  // 탭
  function tab() {
    const t = (location.hash || "#memo").slice(1);
    const name = ["memo", "hl", "wrong", "backup"].includes(t) ? t : "memo";
    document.querySelectorAll(".nb-view").forEach((v) => (v.hidden = v.dataset.view !== name));
    document.querySelectorAll(".nb-tabs a").forEach((a) => a.setAttribute("aria-current", a.dataset.tab === name ? "page" : "false"));
  }
  addEventListener("hashchange", tab);

  // 버튼들
  document.addEventListener("click", (e) => {
    const d = e.target.dataset || {};
    if (d.delNote && confirm("이 메모를 지울까요?")) S.setNote(d.delNote, "");
    else if (d.delHl) S.removeHighlight(d.delHl, +d.k);
    else if (d.resolve) S.setResolved(d.resolve, +d.qi, !S.get(d.resolve).quiz[+d.qi].resolved);
    else if (d.delQuiz && confirm("이 문제의 풀이 기록을 지울까요? 다음에 다시 풀면 새로 기록됩니다.")) S.clearQuiz(d.delQuiz, +d.qi);
    else return;
    render();
  });
  document.getElementById("nb-export").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([S.exportJSON()], { type: "application/json" }));
    a.download = `나뭇잎-교과서-노트-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  document.getElementById("nb-import").addEventListener("change", async (e) => {
    const f = e.target.files[0], msg = document.getElementById("nb-import-msg");
    if (!f) return;
    try { S.importJSON(await f.text()); msg.textContent = "불러와서 합쳤습니다."; render(); }
    catch (err) { msg.textContent = `불러오지 못했습니다: ${err.message}`; }
    e.target.value = "";
  });
  document.getElementById("nb-clear").addEventListener("click", () => {
    if (confirm("이 브라우저에 저장된 메모, 형광펜, 문제 기록을 모두 지울까요? 되돌릴 수 없습니다.")) { S.clearAll(); render(); }
  });
  if (!S.available) document.querySelector(".nb-hero .lead").insertAdjacentHTML("afterend", `<p class="nb-empty bad">이 브라우저에서는 기록을 저장할 수 없습니다(사생활 보호 모드이거나 저장 공간이 막혀 있음).</p>`);

  S.onChange(render);
  render(); tab();
})();
