class Toggle extends HTMLElement {
  static init = () =>
    !customElements.get("x-toggle")
      ? customElements.define("x-toggle", Toggle)
      : null;

  constructor() {
    super();
    this.addEventListener("change", this);
  }

  // references
  checkbox = this.querySelector("input");
  html = document.querySelector("html");

  handleEvent = () => {
    const isChecked = this.checkbox.checked;

    if (isChecked) {
      this.html.dataset.theme = "dark";
      localStorage.setItem("prefers_schema", "dark");
    } else {
      this.html.dataset.theme = "light";
      localStorage.setItem("prefers_schema", "light");
    }
  };

  connectedCallback() {
    const browserSchema = globalThis.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches
      ? "dark"
      : "light";
    const siteSchema = localStorage.getItem("prefers_schema");

    if (siteSchema) {
      this.html.dataset.theme = siteSchema;
      this.checkbox.checked = siteSchema === "dark";
      return;
    }

    this.html.dataset.theme = browserSchema;
    this.checkbox.checked = browserSchema === "dark";
  }
}

Toggle.init();
