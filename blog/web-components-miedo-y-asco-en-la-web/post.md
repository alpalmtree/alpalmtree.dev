Sinceramente, creo que lejos queda la virtud del término medio. Mientras que algunas personas piensan [que el coste de los Web Components](https://dev.to/ryansolid/web-components-are-not-the-future-48bh) no justifica su caso de uso, otras opinan que "se acabó usar React".

Bueno, de hecho sí que existe un término medio (no te fíes de todo lo que diga un extraño en internet). Hace algún tiempo me topé con [este artículo](https://nolanlawson.com/2023/08/23/use-web-components-for-what-theyre-good-at/) al respecto; y creo que la argumentación está bastante bien expuesta. Existen otros al respecto donde se alaba el uso de los Web Components "para lo que de verdad son útiles".

Y sin embargo, ya sea a favor o en contra, casi toda la literatura que podemos encontrar en este respecto comente siempre el mismo error: comparar los Web Components con una librería / framework (de aquí en adelante, diremos simplemente *React*). Opino que es un error porque olvidan la idiosincrasia de los Web Components. A fin de cuentas, son una tecnología (de hecho, **un conjunto de tecnologías**) nativas de la plataforma web. Como tal, existen tantos casos de uso como programadoras hay en el mundo. La lista de casos que podemos enumerar como respuesta a la pregunta de "*¿Para qué me sirven los Web Components?*" crece con cada caso en el que tú le encuentres alguna utilidad.

Si esta es la primera vez que oyes hablar de los Web Components, te recomiendo que primero busques algún tutorial y entonces vuelvas por aquí. Cualquiera nos vale. Hay **una barbaridad** de artículos y vídeos sobre los Web Components. Te apuesto lo que quieras (menos dinero) a que tu *influencer* de referencia tiene algo al respecto.

## Los tres pilares: El Shadow DOM, el elemento `template` y los Custom Elements

El término "Web Components" es realmente el nombre que se le da a estas tres tecnologías que podemos encontrar en cualquier navegador moderno. Normalmente, la tecnología más llamativa es la de los Custom Elements; y, por ende, es lo que más se usa para hablar y para poner ejemplos de uso de los Web Components.

Vamos a repasarlas una por una, con casos de uso aislados los unos de los otros y en el contexto de Vanilla JavaScript.

### Shadow DOM
En términos generales, el Shadow DOM nos permite crear un "DOM" encapsulado dentro de cualquier elemento HTML que pueda contener nodos anidados. Échale un ojo al artículo en [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM).

Normalmente, se suele usar mucho con los Custom Elements porque, mientras que los primeros ayudan a servir de *namespace* para métodos y propiedades, el Shadow DOM nos proporciona una encapsulación similar a la que podríamos ver en algunos frameworks.

Veamos (muy por encima) un ejemplo:

<code-hl group="shadow-dom" name="app.js" open>

```js
const appRoot = document.getElementById("app-root");

appRoot.attachShadow({ mode: "open" });
const paragraph = document.createElement("p");
paragraph.textContent = "Inside shadow DOM";

appRoot.shadowRoot.appendChild(paragraph);
```
</code-hl>

<code-hl group="shadow-dom" name="app.html">

```html
<p>Outside shadow DOM</p>
<div id="app-root"></div>
```
</code-hl>

Veremos lo siguiente en el inspector del navegador:

<code-hl>

```html
<p>Outside shadow DOM</p>
<div id="app-root">
  #shadow-root (open)
    <p>Inside shadow DOM</p>
</div>
```
</code-hl>

Como podrás imaginar, cosas como las siguientes no afectan al párrafo que se encuentra dentro del Shadow DOM:

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

Así que, si en algún momento te encuentras con la necesidad de tener un trozo de HTML al que no le afecten estilos ni scripts generales de la página, el Shadow DOM es tu herramienta.

No obstante, tiene también sus cosillas medio raras, especialmente en lo relacionado con la accesibilidad; y muchas veces la encapsulación de estilos es algo que no es deseable para una aplicación entera.

En definitiva, considero que es una herramienta muy útil; pero puedes evitarla totalmente. Nadie va a meterse contigo porque uses Web Components y no uses el Shadow DOM (y si lo hacen, no son tus amigos).

### El elemento `template`

Si sabes de qué va el tema de crear elementos HTML complejos con JavaScript, sabrás que puede llegar a ser algo tedioso. Por esto mismo tenemos el elemento `template`.

La manera más sencilla, sin `template`s, sería probablemente haciendo uso de la propiedad `innerHTML`. Pero sabemos que no solo es ineficiente, sino que también puede llegar a ser problemático para casos de XSS. En general, ninguna parte de tu HTML que pueda estar controlada por algún tipo de input que no controles. Si aún sí quieres hacerlo con `innerHTML`, tienes que asegurarte de que esas partes dinámicas estás correctamente sanitizadas; y aún hay partes que se te podrían escapar. Un rollo, vamos.

Aquí es donde entra el elemento `template`. Los `template`s pueden existir en el DOM que haya renderizado tu servidor, de modo que puedes usarlos para compartir información front-back. Sin embargo, no es hasta que tú explícitamente decides hacer algo con ellos que realmente se hacen visibles, de modo que tienes también la oportunidad de inyectar contenido dinámico de forma segura.

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

Crear elementos HTML con `document.createElement` y manipular sus atributos y propiedades de forma imperativa es ligeramente más rápido, pero creo que las ventajas de hacerlo a través de `template`s son evidentes. Es mucho más ergonómico que crearlos de forma programática y mucho más eficiente y seguro que usar `innerHTML` (además de, como mencioné anteriormente, poder renderizar en el servidor un trozo de HTML que luego puedes usar en el lado del cliente).

#### El elemento `template` y el Shadow DOM

Si hasta ahora estas dos tecnologías te han parecido útiles, tengo buenas noticias: forman un dúo **muy** bueno. Combiándolas y haciendo uso del elemento `slot`, podemos conseguir elementos mixtos de *light* y *shadow* DOM con composiciones relativamente complejas. Un ejemplo muy tonto pero que creo que ilustra muy bien las posibilidades. Nótese cómo no estamos escribiendo ni una sola línea de JavaScript para que funcione:

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
const appRoot = document.getElementById("app-root").shadowRoot;

// Length: 2
const shadowParagraphs = appRoot.querySelectorAll("p");
// Length: 1
const lightDOMParagraphs = document.querySelectorAll("p");
```
</code-hl>

Como ya mencioné anteriormente, el Shadow DOM tiene sus cosillas; y peor incluso si empezamos a mezclarlo también con el *light* DOM. Pero bueno, es cuestión de aprender a usarlos con cabeza. Personalmente, me fascina cómo podemos conseguir elementos híbridos donde tenemos una parte renderizada en el cliente (aunque de facto exista ya en el HTML del documento), con lógica y estilos encapsulados; y otra parte que sigue el flujo normal que esperas de tu DOM, con los estilos y lógica globales.

### Custom Elements

Llegados a este punto, espero que ya te hayas familiarizado algo más con las otras dos tecnologías; y que hayas apreciado cómo se pueden utilizar de forma totalmente independiente. Junto con los *Custom Elements*, encontramos una tríada de herramientas que nos pueden hacer la vida mucho más fácil en nuestras aplicaciones escritas en **Vanilla JavaScript**.

El matiz es importante. Recordemos que los Web Components son, en su conjunto, unas herramientas que podemos encontrar integradas en la plataforma web, no muy diferente de un `querySelector` o de un `MutationObserver`. Dada su idiosincrasia, los problemas que ayudan a resolver pueden estar ya cubiertos por algún framework o librería. Por ejemplo, temas como la encapsulación, la creación de plantillas de forma declarativa para usarlas a través de JavaScript o, como veremos, la organización de propiedades y métodos: Si ya estás usando algún framework como Angular, React o Vue, ya cuentas con mecanismos que resuelven todo esto, además de ofrecerte reactividad y otras cosillas tope guapas con mucha magia detrás.

Para hablar de los Custom Elements, me gustaría alejarme del discurso tradicional de los cientos de tutoriales que hay por internet; y centrarme en lo que opino que son increíbles aislándolos de las otras dos herramientas:

#### Hidratar tu HTML de forma declarativa

Creo que la "confusión" (o simplemente, el uso de la comunidad) de los términos "Web Components" y "Custom Elements" nos han dado la clave bajo un concepto muy interesante: *HTML Web Components*.

En resumidas cuentas, este modelo de Web Components hace principalmente uso de los Custom Elements en un contexto en el que su contenido no necesita ser renderizado con JavaScript, sino que ya se encuentra en el DOM. Es una manera de asegurarte una mejora progresiva de tus aplicaciones sin necesidad de usar constantemente `querySelector`s. Para ejemplificarlo, vamos a complicar un poco más uno de los ejemplos anteriores:

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

doToggle(toggleSchema);
createMessage("stranger");
```
</code-hl>

Aquí están pasando varias cosillas:

1. Aunque tengamos regiones de hidratación claramente diferenciadas, estamos buscando en el DOM completo. En una aplicación más compleja, posiblemente merecería la pena seleccionar primero estas regiones (por ejemplo, `nav`, `div#app-root`...) y luego ya buscar los elementos que queramos hidratar dentro de estas regiones.
2. Tanto en este ejemplo como si queremos seleccionar primero las regiones individuales, estamos inicializándolo todo manualmente y de forma imperativa...
3. ... de modo que si algún elemento no estuviera presente en el DOM en el momento de la ejecución del script, nos lo saltamos por completo. Tenemos que tener en cuenta cualquier mutación que se haga del DOM. Quizás para mutaciones controladas por nosotras mismas no es para tanto (aunque sí un poco tedioso), pero imagínate que estamos mandando HTML *over the wire*, con librerías como [Turbo](https://turbo.hotwired.dev/) o [HTMX](https://htmx.org/).
4. *Grosso modo*, estamos declarando variables y métodos en el *scope* global y estamos ejecutando las órdenes paso a paso de forma imperativa. Esto se puede mitigar mediante la toma de decisiones de arquitectura; pero, ¿y si te digo que los Custom Elements pueden ayudarnos precisamente con esto?

Veamos el ejemplo usando *HTML Web Components* (o, como a mí me gusta llamarlos, simplemente *Custom Elements*):

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

Veamos qué está pasando aquí y por qué está tan jodidamente guapo en comparación con el ejemplo anterior:

1. Las regiones de hidratación están claramente marcadas por sus respectivos Custom Elements, por lo que podemos hacer las búsquedas directamente dentro de estas regiones de forma declarativa, sin necesidad de andar seleccionándolas primero.
2. Los Custom Elements ya nos dan esa organización de la que hablábamos antes. Cada método y propiedad relacionados con la manipulación del DOM están contenidos dentro de una clase, de modo que no estamos contaminando el *scope* global.
3. En relación con el primer punto, dado que ya estamos seleccionando los elementos dentro de un *scope* muy específico, podemos usar selectores mucho menos complejos.
4. Son **Elementos HTML reales**. Hacer un `document.querySelector("toggle-element").doToggle()` es igual de válido y nos dará el mismo resultado que acceder a cualquier método o propiedad nativos de un elemento HTML específico. Esto simplifica el modelo mental de cómo compartir estado en el DOM sin necesidad de recurrir al clásico *prop drilling* o a librerías de gestión de estado.
5. Fíjate en el método `connectedCallback`. Este método se invoca automáticamente cuando el navegador detecta que el elemento está presente en el DOM. Tenemos también la contraparte `disconnectedCallback`, que hace lo que su propio nombre indica. Esto significa que tenemos *lifecycle methods* sin necesidad de andar usando un `MutationObserver` o de ejecutar las acciones respectivas de forma imperativa.
6. En líneas generales, cuando el navegador detecta que hemos creado un Custom Element (ya sea a través de `document.createElement` o bien directamente en el HTML de tu servidor), se encarga automáticamente de crear la instancia respectiva y de llamar a los métodos correspondientes. Me gusta compararlo con CSS. Imagínate que tuvieras que declarar los estilos cada vez que manipulas el DOM. Pues lo mismo, pero para JavaScript.

## Resumiendo, que es gerundio

Espero haber dejado clara mi postura: no es justo comparar los Web Components con un framework. Los Web Components son un conjunto de herramientas nativas de la plataforma web y, como tal, tienen sus cosas raras y decepcionantes también que otros frameworks como [Lit](https://lit.dev/) están intentando solventar. Igual que pasó con jQuery y el `querySelector` en el pasado.

Lo que sí creo que es un puntazo sobre los Web Components es que ayudan a mitigar los quebraderos de cabeza que nos podemos encontrar en nuestras aplicaciones hechas con vanilla JavaScript. A fin de cuentas, son el resultado de décadas de avance en la plataforma web.

Puedes usar las tres herramientas, solo un par, o usarlas solo en una pequeña parte de tu aplicación. Lo más bonito que tienen los Web Components es que no van a ser una dependencia más en tu proyecto que prometiste a tu jefe que ibas a actualizar hace ya un año. Son parte de la plataforma web, y por tanto son "gratis". Puedes usarlos solamente hasta el punto en el que te sientas cómoda y no más allá.

Los Web Components han venido para quedarse. Van mejorando poco a poco; y tan solo pueden seguir mejorando. Quién sabe si en un futuro veremos algún mecanismo de reactividad, alguna manera más ergonómica de atacar la componetización y el renderizado en el cliente, mejoras en accesibilidad y rendimiento, compatibilidad entre navegadores...

Quién sabe qué nos deparan los avances de la plataforma web. Quizás entonces; y solo entonces, podamos compararlo con React o cualquier otro framework. Hasta entonces, tan solo podemos compararlos con los miles de mecanismos que ya encontramos en la plataforma web.
