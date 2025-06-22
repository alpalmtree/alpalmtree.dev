import { render } from "./lib/helpers.js";

/** @type {import('#types').Router} */
export default [
    {
        path: "/",
        name: "home",
        handler: async () => {
            return await render("index")
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
        staticPaths: () => {
            const tags = ["hello", "world", "whatever"]

            return tags.map(tag => ({ tag })) 
        },
        handler: async (ctx) => {
           return await render("$tag", ctx.params)
        }
    },
]