Si eres lectora habitual de este blog, ya sabrás que me gusta reinventar la rueda. Me gusta ir sin prisa, haciendo las cosas con cuidado y procurando pasármelo lo mejor posible por el camino.

El título no engaña. La primera versión de este blog estaba hecha con Astro; pero así como se me ocurren todas las ideas locas, un día me levanté y me pregunté: ¿seré capaz de hacerme un *Static Site Generator* desde absoluto cero?

Me gustan los retos, así que decidí ponerme manos a la obra. *Spoiler*: me gustó tanto que al final decidí quedarme con esto y bueno, lo que estás leyendo es el resultado de aproximadamente un fin de semana tonto que se me pasó volando.

## Más de lo que necesitamos

Tanto en otros proyectos como este, me di cuenta de que Astro es un proyecto increíble. En todos los sentidos. Te da prácticamente todo lo que necesitas para crear tanto sitios estáticos como aplicaciones web. Mecanismos de hidratación, *bundling* de assets, *View Transitions*, colecciones de contenido para tener intellisense y tipado...

Vamos, un montón de historias que en efecto son super útiles, pero que para un simple blog personal me parecen demasiado. Cada dos por tres, me encontraba buscando "cómo hacer X en Astro". Por supuesto la experiencia te lleva a menos búsquedas, pero aun así, me sentía abotargado por tanta información y por tantas piezas en movimiento que desconocía.

Astro es increíble, pero tiene mucha magia detrás que me incomoda. Tampoco me gusta sentirme productivo cuando no tengo prisa por hacer algo. Me gusta disfrutar del camino y no tanto del producto final.

## Conociendo hasta el más recóndito rincón de tu proyecto

Me propuse hacer un generador estático lo más minimalista posible. Sin funcionalidades innecesarias o que "están bien, pero no merecen la pena en cuanto a complejidad".

Esto significa: sin dependencias más allá de las estrictamente necesarias. Sin *file-based routing*. Sin paso de construcción para el código fuente y que tenga la mayor independencia posible del resto de la infraestructura (como el motor de plantillas o la gestión y bundling de *assets*).

Para esto, decidí simplemente usar Deno junto con la librería estándar. La experiencia ha sido formidable. Tanto durante el desarrollo como ahora que simplemente soy "usuario" (con privilegios, he de admitir), ya no tengo que buscar cómo hacer lo que sea en [inserte aquí su genereador estático]. Ahora, busco cómo hacerlo en Deno y, por consiguiente, también en la plataforma web.

No solo me estoy llevando el aprendizaje de cómo trabajar con un framework, sino sobre cómo trabajar con un runtime específico de JavaScript que tiene la fortuna de parecerse enormemente a la plataforma web. Todo son ventajas, si me pregunta.

## Al turrón

Estas son las 96 líneas que conforman el core de mi blog:

<code-hl>

```js
import router from "../router.js";
import { serveDir } from "@std/http/file-server";

export const isBuild = Deno.args.at(0) === "build";

const routes = router.map((route) => ({
  path: new URLPattern({ pathname: route.path }),
  handler: route.handler,
}));

/** @param { Request } req */
function handleRequest(req) {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/resources")) {
    return serveDir(req, {
      fsRoot: Deno.cwd() + "/resources",
      urlRoot: "resources",
      headers: [
        "Cache-Control: no-store, no-cache, must-revalidate, max-age=0",
        "Pragma: no-cache",
        "Cache-Control: post-check=0, pre-check=0",
      ],
    });
  }

  for (const route of routes) {
    const match = route.path.exec(url);
    if (match) {
      const params = match.pathname.groups;
      return route.handler({ req, params });
    }
  }

  return new Response("Not found", { status: 404 });
}

const build = async () => {
  const { copySync } = await import("jsr:@std/fs/copy");
  const dynamicPaths = [];

  const buildPath = `${Deno.cwd()}/.build`;

  try {
    Deno.removeSync(buildPath, { recursive: true });
  } catch (_) { /** */ }

  Deno.mkdirSync(buildPath);
  copySync(`${Deno.cwd()}/resources`, `${buildPath}/resources`);

  for (const route of router) {
    if (route.path.includes(":")) {
      dynamicPaths.push(route);
      continue;
    }

    const res = await handleRequest(
      new Request(new URL(route.path, "http://localhost:8000/")),
    );
    const content = await res.text();

    if (route.path === "/") {
      Deno.writeTextFileSync(`${buildPath}/index.html`, content);
      continue;
    }

    Deno.mkdirSync(`${buildPath}/${route.path}`);
    Deno.writeTextFileSync(`${buildPath}/${route.path}/index.html`, content);
  }
  const staticPathsFromDynamic = [];
  for await (const route of dynamicPaths) {
    const params = await route.staticPaths();

    const transformedPath = params.map((p) => {
      let path = route.path;
      Object.entries(p).forEach(([k, v]) => {
        path = path.replace(`:${k}`, v);
      });
      return path;
    });
    staticPathsFromDynamic.push(...transformedPath);
  }

  for (const route of staticPathsFromDynamic) {
    const res = await handleRequest(
      new Request(new URL(route, "http://localhost:8000/")),
    );
    const content = await res.text();
    Deno.mkdirSync(`${buildPath}${route}`, { recursive: true });
    Deno.writeTextFileSync(`${buildPath}${route}/index.html`, content);
  }
};

if (import.meta.main) {
  isBuild ? build() : Deno.serve(handleRequest);
}
```
</code-hl>

El router en cuestión que importo en la primera línea es algo así:

<code-hl>

```js
/** @type {import('#types').Router} */
export default [
  {
    path: "/",
    name: "home",
    handler: async () => {
      return await render("index", {
        posts: allPostsMetadata,
      });
    },
  },
  {
    path: "/blog/:slug/",
    staticPaths: () => {
      return [{ slug: "slug-1" }, { slug: "slug-2" }];
    },
    handler: async (ctx) => {
      const { default: metadata } = await import(
        `${Deno.cwd()}/blog/${ctx.params.slug}/metadata.js`
      );
      const content = Deno.readTextFileSync(
        `${Deno.cwd()}/blog/${ctx.params.slug}/post.md`,
      );

      return await render("$post", {
        post: metadata,
        content: marked.parse(content),
      });
    },
  },
]
```

</code-hl>

1. Para servir los assets, estoy usando el método `serveDir` de la librería estándar `http` de Deno. Tan simple como suena, le pasas un directorio y te lo sirve como assets estáticos.
2. Las rutas definidas en el archivo de `routes.js` las transformo en [`URLPattern`s](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API) con sus respectivos handlers para poder hacer el enrutado durante desarrollo y durante el build. Creo que merece la pena mencionar que este método es terriblemente ineficiente para el enrutado; pero al tratarse de un routing que funciona solo durante el tiempo de construcción, merece la pena por tal de ahorrarnos una dependencia. Si en el futuro quisiera usar esta base para habilitar también la construcción de aplicaciones, probablemente usaría alguna librería de enrutado.
3. Tenemos una función (`handleRequest`) que acepta un objeto `Request` (nativo de la web, gracias Deno <3). Durante desarrollo, se lo pasamos directamente a `Deno.serve`. Durante la construcción de las páginas estáticas, nos servirá para proporcionarnos la misma respuesta que obtendríamos en el navegador para poder trabajar con ella.
4. El *build* es muy sencillo. Básicamente, tenemos los *paths* estáticos y los dinámicos (marcados con `:param_name` en la ruta). Los estáticos no tienen mucho misterio. Básicamente le pasamos un `Request`, leemos la respuesta y la guardamos como archivo. Los dinámicos tienen algo más de complejidad (fue un reto interesante jeje), así que usa el método `staticPaths` para generar rutas que funcionarían como rutas estáticas hardcodeadas. Al más puro estilo Astro o NextJS, sin más fantasía.

## Las piezas móviles

Sería muy presuntuoso y naíf por mi parte decir que basta con esto. Lo único que resuelve lo anteriormente expuesto es el tema de enrutado para desarrollo y *build* así como la generación de HTML estático. Al final esto fue lo más difícil de conseguir; y el resto de cuestiones no son más que piezas móviles que están separadas de la lógica general.

Así como pensaba que me sentía capaz de hacer un generador de sitios estáticos desde cero, no es lo mismo para el resto de piezas aquí listadas. Temas como *parsing* o *bundling* se escapan por completo de mis capacidades actuales, por lo que tiene todo el sentido del mundo que use librerías (creo yo, ¿no?).

- [Edge.js](https://edgejs.dev/docs/introduction): Motor de plantillas al más puro estilo blade. Permite usar componibilidad frente a herencia, insertar expresiones de JavaScript y usar directivas para el flujo de renderizado. Aunque se puede usar (y de hecho, lo uso) de forma totalmente independiente, pertenece al ecosistema de [AdonisJS](https://adonisjs.com/).
- [Marked](https://marked.js.org/): Librería de conversión de markdown a HTML. Muy, muy simple.
- [Speed Highlight](https://github.com/speed-highlight/core): Librería para hacer *syntax highlight* de los ejemplos de código. Lo uso direactamente en el cliente porque es muy ligera (~ 3kb en total) y me evita tener que extraer y sobreescribir los ejemplos del markdown. Estoy pensando, no obstante, en tomarme el tiempo extra para hacerlo. Ya veremos.
- [Esbuild](https://esbuild.github.io/): Creo que a estas alturas, huelgan las explicaciones sobre qué es Esbuild. Básicamente, prefiero usarlo antes que trabajar directamente con Vite o proyectos del estilo porque me permite usar los mecanismos nativos de la web durante tiempo de desarrollo; y sé que una vez que se haya hecho el paso de construcción, todo seguirá funcionando igual. Me parece mucho menos intrusivo y, si el día de mañana quiero cambiar a otro *bundler*, puedo hacerlo sin problema.


Mención honorífica a [sharp](https://sharp.pixelplumbing.com/). Es lo que uso para crear imágenes redimensionadas en `webp` para los distintos breakpoints.

Con respecto al frontend, puro y simple vanilla javascript con web components. Sencillo, exquisito. Una delicia para trabajar.

Si quieres, le puedes echar un vistazo al <a href="https://github.com/alpalmtree/alpalmtree.dev" aria-label="código fuente de este blog">código fuente</a> para ver el resto de tonterías:

## Conclusiones

La clave está en sopesar las situaciones. En mi caso, me sentía capaz de crear y mantener un generador de sitios estáticos, así que lo hice. Me lo pasé super bien y aprendí un montón de cosas por el camino. Pero no me sentí capaz de enfrentarme a temas como motores de plantillas, conversión de markdown a HTML o syntax highlighing, así que decidí usar librerías.

¿De qué te sientes tú capaz? ¿Con qué te merece la pena pelearte por tal de aprender y sacar a relucir tu creatividad? Eso ya es cosa tuya. Si quieres usar Astro, por favor, hazlo. Se merecen todo el amor del mundo. Si quieres usar un framework para la interactividad en lugar de vanilla JS, a tope.

El código lo tenemos que disfrutar todas. Si no disfrutas lo que estás haciendo (y lo estás haciendo en tu tiempo libre), busca herramientas que te ayuden a mitigar eso. Yo estoy quizás un poco ido de la olla y me encanta complicarme la vida, pero respeto totalmente lo que tú decidas hacer; y si por algún motivo, mis indagaciones y resultados te inspiran, me iré a dormir más contento todavía.

Gracias por leerme y hasta la próxima ❤️.


