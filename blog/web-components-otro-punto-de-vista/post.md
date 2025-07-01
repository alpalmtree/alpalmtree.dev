Honestly, I believe there's no middle ground: web components are either over or underrated. While some people state [that the cost of Web Components](https://dev.to/ryansolid/web-components-are-not-the-future-48bh) is not worth the use case, some others state that "you don't need React (or any other frontend framework) anymore".

Actually, yes, there is a middle ground of course. Don't blindly believe strangers on the internet. Not so long ago I came across [this article](https://nolanlawson.com/2023/08/23/use-web-components-for-what-theyre-good-at/) talking about what Web Components are good at — and it does have a great point. There are few articles in this line, I'd recommend you do a little research on the topic.

However, most literature I read on the internet makes the mistake, from my point of view, of comparing Web Components with other libraries (hereafter, *React*, since it's much more ergonomic to write than *\<insert_your_framework_here\>*). I believe this is intrinsically wrong, since Web Components are a technology (or better yet, a **group of technologies**) native to the web platform; and as such, we can have a lot of different use cases — so the list of "what are web components good at" grows with every case that works for you.

If you are totally new to Web Components, I'd highly recommend following any tutorial you find out there and then revisiting this post. Anything works, really. There is a **heck of a lot** of articles and videos on this subject. Pick your favorite content creator and most certainly they'll have a video/article about Web Components. Trust me (or don't, I'm just another stranger on the internet).

## The three pillars: Shadow DOM, `template` element and Custom Elements
Web components are the name given to this set of native technologies available in modern browsers. Probably, Custom Elements would be at the basic level of the Web Components [prototype](https://en.wikipedia.org/wiki/Prototype_theory). As such, most literature out there focuses and exemplifies use cases with Custom Elements.

### Shadow DOM
Broadly speaking, the Shadow DOM API allows you to create a sort of scope inside an HTMLElement (yes, HTMLElement, not necessarily a custom element). You can read more about it [in MDN's documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM).

This is typically used together with Custom Elements because is a great way of providing our beloved encapsulation we see in React (or \<your_framework_here\>, remember). When attaching a shadow DOM to an HTMLElement:

<code-hl group="shadow-dom" name="app.js" open>

```js
const appRoot = document.getElementById("app-root");

appRoot.attachShadow({ mode: "open" });
const paragraph = document.createElement("p");
paragraph.textContent = "Inside shadow DOM";

// Notice how we are appending it to the shadowRoot property, created with the attachShadow method
appRoot.shadowRoot.appendChild(paragraph);

// appRoot.appendChild(paragraph) --> would work, but it won't be visible in the browser.
```
</code-hl>

<code-hl group="shadow-dom" name="app.html">

```html
<p>Outside shadow DOM</p>
<div id="app-root"></div>
```
</code-hl>

We can see the following in our browser's inspector:

<code-hl>

```html
<p>Outside shadow DOM</p>
<div id="app-root">
  #shadow-root (open)
    <p>Inside shadow DOM</p>
</div>
```
</code-hl>

As you might have (at least partially) guessed, statements like the following won't affect the paragraph contained inside the `shadowRoot` of the element:

<code-hl>

```html
<style>
  p {
    color: red;
  }
</style>
<script type="module">
  document
    .querySelectorAll("p")
    .forEach(
      (p) => (p.textContent = "Modified from JS")
    );
</script>
```
</code-hl>


That's cool, isn't it? You should know, however, that the shadow DOM comes with a few quirks of its own. I highly recommend reading this article about [shadow DOM and a11y](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) and this other one about [issues with styles encapsulation](https://www.matuzo.at/blog/2023/pros-and-cons-of-shadow-dom).

Overall, I'd argue it's a rather useful technology, but you can totally avoid it, and it'd be ok. No one is going to web-component-shame you for not using it (and if they do, they are not your friends). It's definitely got its **lights and shadows** (*BA DUM TSS*).

### The `template` element
Looking at the example above (or if you are used to creating elements in vanilla JS), we can very easily see how creating and attaching elements to the DOM can be pretty boilerplate-ish. This is one of the reasons why we have the `template` element. While you could still create one and setting its `innerHTML` via JavaScript, they allow for pretty interesting patterns. Learn more about it [on MDN's documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template).

The most interesting bit, I'd argue, is the fact that even if they exist in the DOM, they won't be visible until you append it somehow (either manually or using the declarative shadow DOM). In case you want the content that you will later append to exist in the DOM (for instance, if you are server-side-rendering/statically-generating it), your users won't see any flashed content neither you have to worry about using any workaround (classic AngularJS' `ng-cloak`, if you know what I mean).

<code-hl group="template" name="app.js" open>

```js
const appRoot = document.getElementById("app-root");
const form = document.getElementById("hi-form");
const messageTemplate = document.getElementById("message-template");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = new FormData(e.target).get("name");
  e.target.reset();

  const message = messageTemplate.content.cloneNode(true);
  message.querySelector("strong").textContent = name;

  appRoot.querySelector("p")?.replaceWith(message);
});

const initialMessage = messageTemplate.content.cloneNode(true);
initialMessage.querySelector("strong").textContent = "stranger";
appRoot.appendChild(initialMessage);
```
</code-hl>

<code-hl group="template" name="app.html">

```html
<div id="app-root">
    <form action="#" id="hi-form">
        <input type="text" placeholder="Tell us your name" name="name" />
        <button type="submit">Send</button>
    </form>
</div>
<template id="message-template">
    <p>Hello, <strong></strong>! Welcome to my app!</p>
</template>
```
</code-hl>

Creating elements with `document.createElement` and manipulating the attributes and properties imperatively is still slightly faster, but this allows for "server side rendering" some content that you will later use via JavaScript, with a much cleaner approach; and much safer and performant than setting the `innerHTML` property (as we can see in several Web Components tutorials out there).

#### The `template` element and the shadow DOM
If you found the two technologies useful so far, I have great news: they DO pair **very** well, allowing even for more complex composition while not having to write a single line of JavaScript:

<code-hl group="template-shadow" name="app.html" open>

```html
<div id="app-root">
    <p>
      I belong to the light DOM and I'll be placed between two red paragraphs
    </p>

    <template shadowrootmode="open">
      <style>
        p {
          color: red;
        }
      </style>

      <p>I belong to the shadow DOM and hence I'm red</p>
      <slot></slot>
      <p>I also belong to the shadow DOM</p>
    </template>
</div>
```
</code-hl>

<code-hl group="template-shadow" name="app.js">

```js
// we are referencing the shadow root directly,
// attached automatically by the browser thanks
// to the "shadowrootmode" attribute
const appRoot = document.getElementById("app-root").shadowRoot;

// Length: 2
const shadowParagraphs = appRoot.querySelectorAll("p");
// Length: 1
const lightDOMParagraphs = document.querySelectorAll("p");
```
</code-hl>

The [`slot`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/slot) element is our friend here. Notice that it comes with a few quirks as well, but as a rule of thumb: whatever is slotted, will be in the light DOM, while the template itself will be in the shadow DOM. This allows for pretty interesting patterns, where you can compose some base layout with encapsulated logic and styles and snap in there your elements from the light DOM.

### Custom Elements
Now that I hope I made my point clear, let's dive right into the *good sauce*. As you hopefully have learned already, the three technologies can be perfectly decoupled and used as stand-alone solutions for problems you may encounter in your day-to-day **vanilla JS apps**.

Why the nuance? Well, let's remember that Web Components are (altogether) a mechanism baked right into the web platform, much like a `querySelector` or a `MutationObserver`. As such, they aim at solving problems that might or might not be solved already by another framework or library. Take the encapsulation for instance. If you are using *React*, most certainly there is a solution for that already (single file components, CSS modules, classes or functions for the logic...). Of course, also for the "write declarative HTML and re-use it via JavaScript"-bit. Custom element are no different.

As stated in the foreword of this post, there is **a heck of a lot** of articles written about Custom Elements (usually, under the namespace of Web Components, even though, as we already know, it's just one of the corners of the triangle). Let me try to shift the mindset a bit. I'm not going to talk about reusable components, but at what they are good at if we isolate them from the Web Components trio.

#### Declaratively hydrating parts of your application
The "confusion" (or merely coining by the community) of the concept *Web Components* as interchangeable with *Custom Elements* have led to a very interesting concept: *HTML Web Components*. I believe [this article](https://adactio.com/journal/20618) is a pretty good summary of this concept.

Simply put: you don't (necessarily) have to use `template`s, the shadow DOM or do any sort of client side rendering. You just use custom elements to wrap a piece of HTML and hydrate it. What a good-old `querySelector` would do, but on steroids. Let's put an example by making one of the previous examples a tiny little bit more complicated:

<code-hl group="custom-elements" name="app.html" open>

```html
<body>
  <header>
    <nav>
      <ul>
        <li>Some static content</li>
        <li>
          <input
            id="toggle-schema"
            type="checkbox"
            aria-label="toggle dark and light mode"
          />
        </li>
      </ul>
    </nav>
  </header>
  <div id="app-root">
    <form action="#" id="hi-form">
      <input type="text" placeholder="Tell us your name" name="name" />
      <button type="submit">Send</button>
    </form>
  </div>
  <template id="message-template">
    <p>Hello, <strong></strong>! Welcome to my app!</p>
  </template>
</body>
```
</code-hl>

<code-hl group="custom-elements" name="app.js">

```js
const toggleSchema = document.getElementById("toggle-schema");
const appRoot = document.getElementById("app-root");
const form = document.getElementById("hi-form");
const messageTemplate = document.getElementById("message-template");

const doToggle = (toggle) => {
  document.body.dataset.theme = toggle.checked ? "dark" : "light";
};

const createMessage = (text) => {
  const message = messageTemplate.content.cloneNode(true);
  message.querySelector("strong").textContent = text;
  appRoot.querySelector("p")?.replaceWith(message) ??
    appRoot.appendChild(message);
};

toggleSchema.addEventListener("change", ({ target }) => {
  doToggle(target);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = new FormData(e.target).get("name");
  e.target.reset();

  createMessage(name);
});

// Setting some initial state imperatively when the document loads
doToggle(toggleSchema);
createMessage("stranger");
```
</code-hl>

There are few things I'd like to highlight. Keep in mind that this example is extremely simple, let us imagine we have a much larger application:

1. Even though we have clearly separated hydration regions, we are still looking in the whole DOM. We could still select the specific regions (`nav`, `div#app-root`) and then select elements inside, but it can get pretty boilerplate-ish.
2. We are manually/imperatively initializing everything.
3. Should any element not be present in the DOM by the time of the execution of the script, it would be ignored, and we should account for any DOM mutation if we want our new elements to be hydrated. Imagine that our template element had any logic inside or that you are sending the `appRoot` element "over the wire", with solutions like [Turbo](https://turbo.hotwired.dev/) or [HTMX](https://htmx.org/).
4. Overall, we are writing a script with global variables and a step-by-step declaration. This is fine and can be mitigated by taking some architectural decisions, but still. If you wanted to start in a single file and then move the logic to separate files, you'd for sure need a refactor.

Let's now see the same example using Custom Elements:

<code-hl group="custom-elements-2" name="app.html" open>

```html
<body>
  <header>
    <nav>
      <ul>
        <li>Some static content</li>
        <li>
          <toggle-element>
            <input
              id="toggle-schema"
              type="checkbox"
              aria-label="toggle dark and light mode"
            />
          </toggle-element>
        </li>
      </ul>
    </nav>
  </header>
  <app-root>
    <form action="#">
      <input type="text" placeholder="Tell us your name" name="name" />
      <button type="submit">Send</button>
    </form>
    <!-- We have moved the template inside the custom element for convenience -->
    <template id="message-template">
      <p>Hello, <strong></strong>! Welcome to my app!</p>
    </template>
  </app-root>
</body>
```
</code-hl>

<code-hl group="custom-elements-2" name="app.js">

```js
customElements.define(
  "toggle-element",
  class extends HTMLElement {
    toggle = this.querySelector("input[type=checkbox]");
    doToggle = () => {
      document.body.dataset.theme = this.toggle.checked ? "dark" : "light";
    };

    connectedCallback() {
      this.doToggle();
      this.addEventListener("change", this.doToggle);
    }
  }
);

customElements.define(
  "app-root",
  class extends HTMLElement {
    form = this.querySelector("form");
    messageTemplate = this.querySelector("template");

    createMessage = (text) => {
      const message = this.messageTemplate.content.cloneNode(true);
      message.querySelector("strong").textContent = text;
      this.querySelector("p")?.replaceWith(message) ??
        this.appendChild(message);
    };

    connectedCallback() {
      this.createMessage("stranger");
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = new FormData(e.target).get("name");
        e.target.reset();

        this.createMessage(name);
      });
    }
  }
);
```
</code-hl>

With this approach:

1. The regions are clearly defined by their respective custom elements wrapper.
2. The code is "better organized" (I reckon it's also a matter of taste). Each function for manipulating the DOM as well as the references belong to an actual HTML Element that we called `toggle-element` and `app-root`. They are contained inside each instance and hence not polluting the global scope.
3. Since we are selecting them from the Custom Element, we can have much looser selectors. It is much more unlikely that we add an element with the same selector inside a custom element than in the DOM in general.
4. They are *actual* DOM elements. While this can come with few downsides, it's worth noticing that `document.querySelector("toggle-element").doToggle()` is as valid as accessing any other method native of a DOM element. This allows for pretty interesting state sharing that we should resolve via prop drilling or global state management in *React*.
5. Notice the `connectedCallback` method. This method will be automatically called by the browser whenever the element enters the DOM. There is a `disconnectedCallback` method as well for when the element exits the DOM. This means that they have actual lifecycle methods. Natively, without the need for any `MutationObserver`.
6. In general, whenever the browser detects that a Custom Element is created (either via `document.createElement` or directly in the HTML), it will automatically create the instance and perform whatever you declared. If you ask me, it's like CSS but for JavaScript. Imagine having to re-declare styles every time you manipulate the DOM. Not fun, uh?

We could of course still break things down even more. For instance, by moving the `form` element to its own custom element. But I believe this would defeat the purpose of this post.

## Wrapping things up
I hope it's clear by now that it's not fair to compare Web Components to *React*. Web Components are a conglomerate of technologies native to the web platform, and as such, they come with their own downsides and quirks that *React* is trying to solve. As did jQuery in the past.

What I believe Web Components are excellent at is at mitigating some common pain points we find in our day-to-day developments in vanilla JavaScript. You can totally make a mix and match of all three technologies, just use one or two of them, commit only until the point you feel is right.

The most beautiful thing about Web Components is that they are not going anywhere as long as the web platform lives. They won't become yet another outdated dependency in your project that you promised your team lead you'd update one year ago. They can only improve from here. Who knows, maybe in the future we'll see some reactivity baked in, a more ergonomic approach to componentization and rendering, improvements in accessibility and performance, browser compatibility...

Who knows. Maybe, and only **maybe** then we could compare Web Components with a framework. Until then, we'd better compare them with a `querySelector`, with setting the `innerHTML` property or by overthinking selectors so our styles and logic don't mess up with the wrong element.