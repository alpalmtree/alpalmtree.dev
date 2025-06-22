import { Edge } from 'edge.js'
import globals from "../globals.js"

const edge = Edge.create()
edge.mount(new URL('../views', import.meta.url))

/**
 * @param {string} name 
 * @param {T} data 
 */
export const render = async (name, data) => {
    const html = await edge.render(name, {...globals, ...data})
    return new Response(html, {
        headers: {
            'content-type': 'text/html;charset=utf-8'
        }
    })
}