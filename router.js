import { render } from "./lib/helpers.js";
import { marked } from "marked";
import { slugs, allPostsMetadata } from "./services/posts.service.js";

/** @type {import('#types').Router} */
export default [
    {
        path: "/",
        name: "home",
        handler: async () => {
            return await render("index", {
                posts: allPostsMetadata
            })
        }
    },
    {
        path: "/explore/",
        name: "explore",
        handler: async () => {
            return await render("explore")
        }
    },
    {
        path: "/explore/:tag/",
        staticPaths: async () => {
            const { default: taxonomies } = await import("./blog/taxonomies.js")

            return taxonomies.tags.map(tag => ({ tag })) 
        },
        handler: async (ctx) => {
           return await render("$tag", ctx.params)
        }
    },
    {
        path: "/blog/:slug/",
        staticPaths: () => {  
            return slugs

        },
        handler: async (ctx) => {
            const { default: metadata } = await import(`${Deno.cwd()}/blog/${ctx.params.slug}/metadata.js`);
            const content = Deno.readTextFileSync(`${Deno.cwd()}/blog/${ctx.params.slug}/post.md`)

            return await render("$post", {
                post: metadata,
                content: marked.parse(content)
            })
        }
    }
]