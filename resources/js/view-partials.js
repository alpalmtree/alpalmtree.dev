globalThis.addEventListener('page:changed', async ({ detail }) => {
    const res = await fetch(detail);
    const text = await res.text();
    const doc = (new DOMParser()).parseFromString(text, "text/html")

    const docHead = doc.querySelector('head')
    const viewPartial = doc.querySelector('view-partial')

    document.startViewTransition(() => {
        document.querySelector('head').replaceWith(docHead)
        document.querySelector('view-partial').replaceWith(viewPartial)
    })

})

globalThis.addEventListener('popstate', () => {
    globalThis.dispatchEvent(
        new CustomEvent('page:changed', {
            detail: globalThis.location.pathname
        })
    )
})

customElements.define(
    "view-link",
    class extends HTMLElement {
        #to = this.querySelector('a').getAttribute("href");

        connectedCallback() {
            this.addEventListener("click", (e) => {
                e.preventDefault();
                globalThis.history.pushState("", null, this.#to);
                this.dispatchEvent(
                    new CustomEvent("page:changed", {
                        detail: this.#to,
                        bubbles: true
                    })
                )
            });
        }
    },
);

customElements.define(
    "view-partial",
    class extends HTMLElement {
        #script = this.getAttribute('script')

        constructor() {
            super();
        }

        async connectedCallback() {
            if (!this.#script) return;
            const { default: main } = await import(this.#script)
            main()
        }
    },
);