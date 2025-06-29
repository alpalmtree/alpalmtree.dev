class CodeHL extends HTMLElement {
  static init = () => {
    if (!customElements.get("code-hl")) {
      customElements.define("code-hl", CodeHL);
    }
  };

  #codeElement = this.querySelector("code");
  #copyCodeBtn = document.createElement("copy-code");
  content = this.#codeElement.textContent;

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
    this.prepend(this.#copyCodeBtn);

    if (!this.#name || !this.#group) return;

    this.#detailsElement = document.createElement("details");
    this.#detailsElement.name = this.#group;
    this.#detailsElement.open = this.hasAttribute('open');

    this.#summaryElement = document.createElement("summary");

    this.#summaryElement.textContent = this.#name;    
  }

  async connectedCallback() {
    const { highlightElement } = await import(
      "../../vendor/speed-highlight/index.js"
    );

    highlightElement(this.#codeElement);
    this.style.opacity = null;

    if (!this.#name || !this.#group) return;

    this.#detailsElement.append(this.#summaryElement, this.#codeElement.parentElement);
    this.append(this.#detailsElement)
    
  }
}

CodeHL.init();
