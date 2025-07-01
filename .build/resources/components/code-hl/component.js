class CodeHL extends HTMLElement {
  static init = () => {
    if (!customElements.get("code-hl")) {
      customElements.define("code-hl", CodeHL);
    }
  };

  #codeElement = this.querySelector("code");
  #copyCodeBtn = document.createElement("copy-code");

  /** For details grouping */
  #group = this.getAttribute("group");
  #name = this.getAttribute("name");

  /** @type {HTMLDetailsElement} */
  #detailsElement = null;

  /** @type {HTMLElement} */
  #summaryElement = null;

  constructor() {
    super();

    this.style.opacity = "0";

    const lang = [...this.#codeElement.classList].find((name) =>
      name.startsWith("language-")
    ).replace("language-", "");

    this.#codeElement.classList.add(`shj-lang-${lang}`);

    if (!this.#name || !this.#group) {
      this.prepend(this.#copyCodeBtn);
      return;
    }

    this.#detailsElement = document.createElement("details");
    this.#detailsElement.name = this.#group;
    this.#detailsElement.open = this.hasAttribute("open");

    this.#summaryElement = document.createElement("summary");

    this.#summaryElement.textContent = this.#name;
    this.#summaryElement.append(this.#copyCodeBtn)
  }

  async connectedCallback() {
    if (
      !document.querySelector("head").querySelector(
        "[data-css=shj-github-dark]",
      )
    ) {
      const style = document.createElement("link");
      style.dataset.css = "shj-github-dark";
      style.rel = "stylesheet";
      style.href = "/resources/vendor/speed-highlight/themes/github-dark.css";
      document.querySelector("head").append(style);
    }

    const { highlightElement } = await import(
      "../../vendor/speed-highlight/index.js"
    );

    highlightElement(this.#codeElement);
    this.style.opacity = null;

    if (!this.#name || !this.#group) return;

    this.#detailsElement.append(
      this.#summaryElement,
      this.#codeElement.parentElement,
    );
    this.append(this.#detailsElement);
  }
}

CodeHL.init();
