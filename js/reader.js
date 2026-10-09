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
})();
