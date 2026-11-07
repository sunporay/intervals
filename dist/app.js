"use strict";
(() => {
  const total = 11;
  const get = id => document.getElementById(id);
  const slide = get("slide"), viewer = get("viewer"), overview = get("overview");
  const input = get("page-input"), previous = get("previous"), next = get("next");
  const source = page => `slides/${String(page).padStart(2, "0")}.webp`;
  let current = 0, toastTimer, touchStart;
  const initialPage = () => Number(new URLSearchParams(location.hash.slice(1)).get("page")) || 1;

  function closeOverview() {
    if (overview.open && typeof overview.close === "function") overview.close();
    else overview.removeAttribute("open");
  }

  function goTo(value, updateHash = true) {
    const number = Number(value);
    const page = Math.max(1, Math.min(total, Number.isFinite(number) ? Math.round(number) : current || 1));
    if (page !== current) {
      current = page;
      get("image-error").hidden = true;
      slide.src = source(page);
      slide.alt = `統計區間報告，第 ${page} 頁，共 ${total} 頁`;
      input.value = String(page);
      previous.disabled = page === 1;
      next.disabled = page === total;
      get("reading-status").textContent = `第 ${page} 頁，共 ${total} 頁`;
      get("progress-fill").style.width = `${page / total * 100}%`;
      get("progress").setAttribute("aria-valuenow", String(page));
      for (const button of get("thumbnails").children) {
        button.setAttribute("aria-current", String(Number(button.dataset.page) === page));
      }
      document.title = `統計區間報告 · ${page} / ${total}`;
      if (page < total) { const image = new Image(); image.src = source(page + 1); }
    }
    if (updateHash && location.hash !== `#page=${page}`) history.replaceState(null, "", `#page=${page}`);
    input.value = String(page);
  }

  for (let page = 1; page <= total; page++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumbnail";
    button.dataset.page = String(page);
    button.setAttribute("aria-label", `閱讀第 ${page} 頁`);
    const image = document.createElement("img");
    image.src = `thumbs/${String(page).padStart(2, "0")}.webp`;
    image.alt = `第 ${page} 頁縮圖`;
    image.loading = "lazy";
    image.width = 360;
    image.height = 203;
    const label = document.createElement("span");
    label.textContent = `第 ${String(page).padStart(2, "0")} 頁`;
    button.append(image, label);
    button.addEventListener("click", () => { goTo(page); closeOverview(); });
    get("thumbnails").append(button);
  }

  previous.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));
  input.addEventListener("change", () => goTo(input.value));
  input.addEventListener("keydown", event => { if (event.key === "Enter") { goTo(input.value); input.blur(); } });
  get("overview-open").addEventListener("click", () => {
    if (typeof overview.showModal === "function") overview.showModal();
    else overview.setAttribute("open", "");
    get("thumbnails").children[current - 1]?.focus();
  });
  get("overview-close").addEventListener("click", closeOverview);
  overview.addEventListener("click", event => {
    if (event.target !== overview) return;
    const rect = overview.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeOverview();
  });

  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (viewer.classList.contains("focus-mode")) viewer.classList.remove("focus-mode");
      else if (viewer.requestFullscreen) await viewer.requestFullscreen();
      else viewer.classList.add("focus-mode");
    } catch { viewer.classList.toggle("focus-mode"); }
  }
  get("fullscreen").addEventListener("click", fullscreen);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") viewer.classList.remove("focus-mode");
    if (overview.open || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable || event.altKey || event.ctrlKey || event.metaKey) return;
    if (["ArrowRight", "ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && event.target === document.body)) { event.preventDefault(); goTo(current + 1); }
    if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); goTo(current - 1); }
    if (event.key === "Home") { event.preventDefault(); goTo(1); }
    if (event.key === "End") { event.preventDefault(); goTo(total); }
    if (event.key.toLowerCase() === "f") { event.preventDefault(); fullscreen(); }
  });
  window.addEventListener("hashchange", () => goTo(initialPage()));
  get("stage").addEventListener("pointerdown", event => { if (event.pointerType === "touch") touchStart = {x: event.clientX, y: event.clientY}; });
  get("stage").addEventListener("pointerup", event => {
    if (!touchStart || event.pointerType !== "touch") return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1));
    touchStart = undefined;
  });
  get("stage").addEventListener("pointercancel", () => { touchStart = undefined; });
  slide.addEventListener("error", () => { get("image-error").hidden = false; });
  slide.addEventListener("load", () => { get("image-error").hidden = true; });
  get("share").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      get("toast").textContent = "連結已複製，可以直接分享";
      get("toast").hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { get("toast").hidden = true; }, 2600);
    } catch { window.prompt("複製以下網址即可分享", location.href); }
  });
  goTo(initialPage());
})();
