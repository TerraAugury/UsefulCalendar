const VALID_TABS = ["appointments", "calendar", "categories", "settings"];

function getTabFromHash() {
  const hash = window.location.hash.replace("#", "");
  return VALID_TABS.includes(hash) ? hash : null;
}

export function initRouter({ buttons, sections, initialTab, onTabChange }) {
  const setActive = (tabId, { updateHash } = {}) => {
    const nextTab = VALID_TABS.includes(tabId) ? tabId : VALID_TABS[0];
    sections.forEach((section) => {
      const isActive = section.dataset.tab === nextTab;
      section.hidden = !isActive;
    });
    buttons.forEach((button) => {
      const isActive = button.dataset.tabTarget === nextTab;
      button.dataset.active = isActive ? "true" : "false";
      button.setAttribute("aria-current", isActive ? "page" : "false");
    });
    if (updateHash) {
      window.location.hash = nextTab;
    }
    if (typeof onTabChange === "function") {
      onTabChange(nextTab);
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setActive(button.dataset.tabTarget, { updateHash: true });
    });
  });

  window.addEventListener("hashchange", () => {
    const tab = getTabFromHash();
    if (tab) {
      setActive(tab, { updateHash: false });
    }
  });

  const startTab = getTabFromHash() || initialTab || VALID_TABS[0];
  setActive(startTab, { updateHash: true });

  return { setActive };
}
