/* 절 페이지 읽기 도구: '이 절의 카드' 목록 접기(상태는 localStorage에 기억)와 카드 크게 보기(Esc로 닫기) */
(() => {
  "use strict";
  const FOLD_KEY = "namunnip-toc-folded";
  const fold = document.querySelector(".toc-fold");
  if (fold) {
    const setFold = (on, save) => {
      document.body.classList.toggle("toc-folded", on);
      fold.setAttribute("aria-expanded", String(!on));
      fold.title = on ? "카드 목록 펼치기" : "카드 목록 접기";
      fold.firstElementChild.textContent = on ? "목록" : "접기";
      if (save) try { localStorage.setItem(FOLD_KEY, on ? "1" : "0"); } catch (e) { console.warn("목록 상태를 저장하지 못함", e); }
    };
    let saved = null;
    try { saved = localStorage.getItem(FOLD_KEY); } catch (e) { saved = null; }
    setFold(saved === "1", false);
    fold.addEventListener("click", () => setFold(!document.body.classList.contains("toc-folded"), true));
  }

  const ICON_OPEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  let open = null;
  const close = () => {
    if (!open) return;
    const card = open, btn = card.querySelector(".card-max");
    open = null;
    card.classList.remove("is-max");
    document.body.classList.remove("has-max");
    btn.setAttribute("aria-pressed", "false"); btn.title = "크게 보기"; btn.innerHTML = ICON_OPEN;
    card.scrollIntoView({ block: "start" });
    btn.focus();
  };
  document.querySelectorAll("article.card").forEach((card) => {
    const head = card.querySelector(".card-head");
    if (!head) return;
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "card-max"; btn.innerHTML = ICON_OPEN;
    btn.title = "크게 보기"; btn.setAttribute("aria-label", "카드 크게 보기"); btn.setAttribute("aria-pressed", "false");
    head.appendChild(btn);
    btn.addEventListener("click", () => {
      if (open === card) { close(); return; }
      close();
      open = card;
      card.classList.add("is-max");
      document.body.classList.add("has-max");
      btn.setAttribute("aria-pressed", "true"); btn.title = "원래 크기로 (Esc)"; btn.innerHTML = ICON_CLOSE;
      card.scrollTop = 0;
    });
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  /* 카드 글(질문·복원·설명·연결·적용·판단): '한 단계씩'이면 처음엔 질문만 펼치고 나머지는 첫 줄만 보인다. 오른쪽 화살표로 접고 편다.
     '모두 보기'는 예전처럼 전부 펼친다. 고른 방식은 localStorage에 둔다. 노드는 옮기기만 해서 형광펜(notes.js)이 그대로 남는다 */
  const STEP_KEY = "namunnip-steps";
  let mode = "one";
  try { mode = localStorage.getItem(STEP_KEY) === "all" ? "all" : "one"; } catch (e) { mode = "one"; }
  const lists = [...document.querySelectorAll("article.card ol.steps")];
  const setOpen = (li, on) => {
    li.classList.toggle("open", on);
    const tg = li.querySelector(".step-tg"); if (tg) tg.setAttribute("aria-expanded", String(on));
    const ar = li.querySelector(".step-arrow");
    if (ar) { ar.setAttribute("aria-expanded", String(on)); ar.setAttribute("aria-label", on ? "접기" : "펼치기"); }
  };
  lists.forEach((ol) => {
    const items = [...ol.children].filter((li) => li.tagName === "LI" && li.querySelector(":scope > .tag"));
    items.forEach((li, k) => {
      const tag = li.querySelector(":scope > .tag");
      const body = document.createElement("div"); body.className = "step-body";
      while (tag.nextSibling) body.appendChild(tag.nextSibling);
      const tg = document.createElement("button"); tg.type = "button"; tg.className = "step-tg";
      li.insertBefore(tg, tag); tg.appendChild(tag);
      li.appendChild(body);
      // 오른쪽 끝의 화살표로 접고 편다. 꼬리표를 눌러도 같다
      const ar = document.createElement("button"); ar.type = "button"; ar.className = "step-arrow";
      ar.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      li.appendChild(ar);
      const flip = (e) => { e.stopPropagation(); if (mode === "one") setOpen(li, !li.classList.contains("open")); };
      ar.addEventListener("click", flip);
      tg.addEventListener("click", flip);
      li.addEventListener("click", (e) => {
        if (mode !== "one" || li.classList.contains("open") || e.target.closest("a, button, input, mark")) return;
        setOpen(li, true);
      });
    });
    const bar = document.createElement("div"); bar.className = "steps-mode"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "글 보기 방식");
    bar.innerHTML = '<button type="button" data-m="one">한 단계씩</button><button type="button" data-m="all">모두 보기</button>';
    const col = document.createElement("div"); col.className = "steps-col";   // 카드 본문 격자의 한 칸을 그대로 쓴다
    ol.parentNode.insertBefore(col, ol); col.append(bar, ol);
    bar.addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (b) apply(b.dataset.m, true); });
  });
  function apply(m, save) {
    mode = m === "all" ? "all" : "one";
    document.querySelectorAll(".steps-mode [data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    lists.forEach((ol) => {
      ol.classList.toggle("steps-fold", mode === "one");
      const items = [...ol.querySelectorAll(":scope > li")].filter((li) => li.querySelector(":scope > .step-tg"));
      items.forEach((li, k) => setOpen(li, mode === "all" || k === 0 || !!li.querySelector("mark.hl")));
    });
    if (save) try { localStorage.setItem(STEP_KEY, mode); } catch (e) { /* 저장 못 해도 동작은 한다 */ }
  }
  apply(mode, false);
})();
