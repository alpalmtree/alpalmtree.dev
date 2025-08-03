import { Edge } from "edge.js";
import { expandGlob } from "jsr:@std/fs";
import { DOMParser } from "jsr:@b-fuze/deno-dom";
import { codeToHtml } from "npm:shiki";

import globals from "../globals.js";

/** @param {string} text */
export const highlightCodeSnippets = async (text) => {
  const document = new DOMParser().parseFromString(text, "text/html");

  for (const el of document.querySelectorAll("code-hl pre")) {
    const lang = [...el.firstElementChild.classList].find((name) => name.startsWith("language-"))
      .replace("language-", "");

    const temp = document.createElement('template')
    
    temp.innerHTML = await codeToHtml(el.textContent, {
      lang,
      theme: "nord",
    })

    el.replaceWith(temp.content) 

  }

  return document.documentElement.innerHTML;
};

export const edge = Edge.create();
edge.mount(new URL("../views", import.meta.url));
edge.global("$", globals);

/**
 * @param {string} name
 * @param {any} data
 */
export const render = async (name, data) => {
  const html = await edge.render(name, data);

  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=utf-8",
    },
  });
};

/**
 * @param {string} pattern
 */
export const importGlob = async (pattern) => {
  const imports = {};
  for await (const file of expandGlob(pattern)) {
    imports[file.path.replace(Deno.cwd(), "")] = await import(
      `file://${file.path}`
    );
  }

  const get = (cb) => {
    const filtered = Object.entries(imports).filter(([k, _v]) => {
      return cb(k);
    }).map((found) => {
      return Object.fromEntries([found]);
    });

    return filtered;
  };

  return {
    all: imports,
    get,
  };
};
