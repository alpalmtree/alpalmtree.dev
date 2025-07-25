El dos de julio de este mismo año, [Deno anunció la vuelta de `deno bundle`](https://deno.com/blog/v2.4); y está guapísimo.

Si no sabes nada de Deno, te recomiendo que sigas algún tutorial. No tardarás mucho en conocer el concepto de las importaciones a través de URLs e `importmaps`.

## Deno y el navegador

Te lo resumo muy brevemente: En los albores de las primeras versiones de Deno, se concibió para que pudiéramos usar dependencias sin necesidad de instalación, sino a través de URLs. Por ejemplo:

<code-hl>

```js
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
```
</code-hl>

Si alguna vez has usado importmaps en el navegador, sabrás que una de las desventajas que tiene es que pierdes por completo el intellisense. Puedes seguir la documentación de la librería en cuestión (o de tu propio código), pero trabajas como quien dice a ciegas.

Sin embargo; y dado que las urls o dependencias remotas son el principal mecanismo de importación en Deno, este problema está más que resuelto. Si tienes un *workspace* de Deno activado, verás cómo, una vez cacheada la dependencia, obtienes el mismo intellisense que si de un módulo de Node se tratara.

Años más tarde, el equipo de Deno reculó y creó [JSR](https://jsr.io/) para poder trabajar con las dependencias de una forma mucho más ergonómica, al estilo de npm. Pero el concepto seguía estando ahí: una dependencia remota que se cachea en local si necesidad de una carpeta de `node_modules`.

## ¿Qué tiene que ver esto con `deno bundle`?

En julio de 2021, el equipo de Deno [decidió eliminar `deno bundle`](https://github.com/denoland/deno/issues/11073) bajo el pretexto de que "los bundlers en JavaScript tienen mucha complejidad" que no podían asumir en esos momentos.

Esto significó que ahora, para poder realizar un bundle (especialmente para el servidor), necesitabas buscar otras herramientas. Posiblemente, la que más se popularizó fue esbuild.

El *gran* problema venía por la manera en la que Deno trabajaba sus importaciones. Esbuild y otras herramientas del palo, esperan que el código exista "en la carpeta del proyecto". Para las dependencias remotas, hubo que crear *plugins* y herramientas específicas que pudieran trabajar con imports de URL. Como de costumbre, te tocaba a ti buscar la herramienta adecuada y entender y asumir las limitaciones. Reconozco que me parece un movimiento muy noble optar por deprecar una funcionalidad que se te escapa de la capacidad, pero en cierto modo, dejaba un paso más lejos la esperanza de un *runtime* completo sin dependencias externas y con un ecosistema unificado.

## Vite, Parcel y otras vainas

Indudablemente, proyectos como Vite, Rspack o Parcel han sido (y siguen siendo) unas herramientas espectaculares que sirven no solo para hacer un simple bundle, sino también para ofrecerte una experiencia de desarrollo más cómoda y moderna. No obstante, su dependencia de la carpeta de `node_modules` las hacen radicalmente opuestas, en mi opinión, a la filosofía de *remote first* de Deno. Antes de la versión 2+ de Deno, normalmente para trabajar en una aplicación *Full Stack* o para trabajar en el frontend, lo más ergonómico era montarte un *setup* híbrido con Deno y Node; y pese a ello, en lo personal, no me merecía la pena y acababa descartando Deno por completo.

Es una faena, la verdad, porque me gusta muchísimo trabajar con importmaps y dependencias remotas. Me parece que agilizan mucho el flujo de trabajo y que se acercan mucho más a una aproximación "vanilla". Pero, por otro lado, es indudable que el paso de construcción es algo relativamente importante. Para prototipar, usar CDNs y evitar paso de construcción está genial, pero en aplicaciones reales es importante ahorrarle al navegador cuanta más descarga y menos procesamiento, mejor.

Entonces, si queremos tener un paso de construcción para nuestro front, ¿qué opciones tenemos? Te cuento las que he visto por ahí:

1. **A tope con un setup de node_modules**: Si usas Vite o herramientas similares, no hace falta que me explaye más. Levantas un servidor de desarrollo ya sea para levantar el cliente completo o para integrarlo con tu backend. Desde Deno 2.x, puedes usar Deno para ejecutarlas de forma totalmente normal, así que técnicamente puedes prescindir de Node y no es necesario hacer un *setup* híbrido.
2. **Hacer vendoring manual de las dependencias**: Si quieres evitar la complejidad que supone incorporar un paso de contrucción en tiempo de desarrollo, pero quieres implementarlo una vez que vayas a desplegar tu código final, lo más fiable sería hacer un vendoring manual (copiar y pegar código, vamos). Guardas tus dependencias en una carpeta `vendor` con rutas reconocibles por tu *bundler* de confianza; y a correr. Es interesante mencionar que Deno ofrece la posibilidad de crear una carpeta `vendor` de forma automática, pero sigues necesitando algún *plugin* para que tu *bundler* las pille.
3. **Lo dicho, usar algún plugin pensado para Deno**: Como mencionaba antes, muchos son de la comunidad, otros de colaboradoras oficiales de Deno, pero todos cuentan con algún *gotcha* y, en lo personal, nunca he terminado de tener una buena experiencia.

## O bien, si ya tienes Deno en la versión 2.4 ...

¡Tenemos `deno bundle`! Sigue implementando esbuild entre bambalinas, pero ahora es una CLI mantenida de forma oficial por el equipo de Deno. Forma parte de su ecosistema y resuelve todos los quebraderos de cabeza que nos daban los escenarios anteriormente descritos.

No solo nos devuelve la posibilidad de incluir en nuestros bundles las dependencias remotas, sino que además lo hace con algunas cosas muy útiles. Por ejemplo, la posibilidad de decidir si lo minificas o no, poder seleccionar el navegador como plataforma específica, decidir si queremos hacer *code splitting* ...

Aún seguimos esperando una API para poder usarlo de forma programática, pero por lo pronto, resulta súper útil. Es prácticamente como usar esbuild pero sin tener que sacrificar tu workflow habitual de CDNs e importmaps.

## Escribiendo frontend con Deno

