class CodeHL extends HTMLElement {
  static init = () => {
    if (!customElements.get("code-hl")) {
      customElements.define("code-hl", CodeHL);
    }
  };

  #copyCodeBtn = document.createElement("copy-code");
  /** For details grouping */
  #group = this.getAttribute("group");
  #name = this.getAttribute("name");

  /** @type {HTMLDetailsElement} */
  #template = document.getElementById("code-hl").cloneNode(true).content;

  connectedCallback() {
    if (!this.#name || !this.#group) {
      this.prepend(this.#copyCodeBtn);
      return;
    }
    const detailsElement = this.#template.querySelector('details')
    const summaryElement = this.#template.querySelector('summary')

    detailsElement.name = this.#group
    detailsElement.open = this.hasAttribute("open");

    summaryElement.textContent = this.#name
    summaryElement.append(this.#copyCodeBtn)

    this.#template.querySelector('slot').replaceWith(
      this.querySelector('pre')
    )

    this.append(this.#template);
  }
}

CodeHL.init();
