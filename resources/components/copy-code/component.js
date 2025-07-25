class CopyCode extends HTMLElement {
  static init = () =>
    !customElements.get("copy-code") &&
    customElements.define("copy-code", CopyCode);

  constructor() {
    super();
    this.addEventListener("click", this);
  }

  connectedCallback() {
    const template = document.getElementById('copy-code')
    this.append(template.content.cloneNode(true))
  }
  handleEvent = () => {
    const content = this.closest("code-hl").querySelector('code').textContent;
    navigator.clipboard.writeText(content);

    setTimeout(() => {
      this.querySelector("button").blur();
    }, 700);
  };
}

CopyCode.init();
