import { render } from "./lib/helpers.js";
import { marked } from "marked";
import { allPostsMetadata, slugs } from "./services/posts.service.js";

/** @type {import('#types').Router} */
export default [
  {
    path: "/",
    handler: async () => {
      return await render("index", {
        posts: allPostsMetadata,
      });
    },
  },
  {
    path: "/el-menda/",
    handler: async () => {
      return await render("about")
    }
  },
  {
    path: "/explora/",
    handler: async () => {
      const { default: taxonomies } = await import("./blog/taxonomies.js");
      return await render("explore", {
        tags: taxonomies.tags,
      });
    },
  },
  {
    path: "/explora/:tag/",
    staticPaths: async () => {
      const { default: taxonomies } = await import("./blog/taxonomies.js");

      return taxonomies.tags.map((tag) => ({ tag }));
    },
    handler: async (ctx) => {
      return await render("$tag", {
        tag: ctx.params.tag,
        posts: allPostsMetadata.filter((post) =>
          post.tags.includes(decodeURIComponent(ctx.params.tag))
        ),
      });
    },
  },
  {
    path: "/blog/:slug/",
    staticPaths: () => {
      return slugs;
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
];
