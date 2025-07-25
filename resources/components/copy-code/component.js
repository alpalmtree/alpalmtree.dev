class CopyCode extends HTMLElement {
  static init = () =>
    !customElements.get("copy-code") &&
    customElements.define("copy-code", CopyCode);
  
  #isFocus = false

  constructor() {
    super();
    this.addEventListener("click", this);
  }

  connectedCallback() {
    const template = document.getElementById('copy-code')
    this.append(template.content.cloneNode(true))
  }
  handleEvent = () => {
    if (this.#isFocus) return;

    this.#isFocus = true;
    const content = this.closest("code-hl").querySelector('code').textContent;
    navigator.clipboard.writeText(content);

    setTimeout(() => {
      this.querySelector("button").blur();
      this.#isFocus = false
    }, 700);
  };
}

CopyCode.init();
