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