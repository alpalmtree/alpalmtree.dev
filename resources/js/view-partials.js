const nodeIsEqual = (node1, node2) => {
  if (node1.hasAttribute("href") || node1.hasAttribute("src")) {
    return node1.outerHTML.replace(/\?rel=\d+/g, "") ===
      node2.outerHTML.replace(/\?rel=\d+/g, "");
  }
  return node1.isEqualNode(node2);
};

const replaceDOM = async (detail) => {
  const res = await fetch(detail);
  const text = await res.text();
  const doc = (new DOMParser()).parseFromString(text, "text/html");

  const currentHead = document.querySelector("head");
  const newHead = doc.querySelector("head");
  const viewPartial = doc.querySelector("view-partial");

  const scheduleRemove = [];
  for (const child of currentHead.children) {
    if (![...newHead.children].some((node) => nodeIsEqual(child, node))) {
      scheduleRemove.push(child);
    }
  }

  for (const child of newHead.children) {
    if (![...currentHead.children].some((node) => nodeIsEqual(child, node))) {
      currentHead.append(child);
    }
  }
  scheduleRemove.forEach((el) => el.remove());
  document.querySelector("view-partial").replaceWith(viewPartial);
};

globalThis.addEventListener("page:changed", ({ detail }) => {
  document.startViewTransition(async () => {
    await replaceDOM(detail);
  });
});

globalThis.addEventListener("popstate", () => {
  globalThis.dispatchEvent(
    new CustomEvent("page:changed", {
      detail: globalThis.location.pathname,
    }),
  );
});

customElements.define(
  "view-link",
  class extends HTMLElement {
    #to = this.querySelector("a").getAttribute("href");

    connectedCallback() {
      this.addEventListener("click", (e) => {
        e.preventDefault();
        globalThis.history.pushState("", null, this.#to);
        this.dispatchEvent(
          new CustomEvent("page:changed", {
            detail: this.#to,
            bubbles: true,
          }),
        );
      });
    }
  },
);

customElements.define(
  "view-partial",
  class extends HTMLElement {
    #script = this.getAttribute("script");

    constructor() {
      super();
    }

    async connectedCallback() {
      if (!this.#script) return;
      const { default: main } = await import(this.#script);
      main?.();
    }
  },
);
