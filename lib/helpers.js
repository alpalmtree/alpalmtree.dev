import { Edge } from 'edge.js'
import { expandGlob } from "jsr:@std/fs";

import globals from "../globals.js"

const edge = Edge.create()
edge.mount(new URL('../views', import.meta.url))

/**
 * @param {string} name 
 * @param {any} data 
 */
export const render = async (name, data) => {
    const html = await edge.render(name, {...globals, ...data})
    return new Response(html, {
        headers: {
            'content-type': 'text/html;charset=utf-8'
        }
    })
}

/**
 * @param {string} pattern 
 */
export const importGlob = async (pattern) => {
    const imports = {}
    for await (const file of expandGlob(pattern)) {
        imports[file.path.replace(Deno.cwd(), "")] = await import(`file://${file.path}`)
    }

    const get = (cb) => {
        const filtered = Object.entries(imports).filter(([k, _v]) => {
            return cb(k)
        }).map((found) => {
            return Object.fromEntries([found])
        })
      
        return  filtered
    }

    return {
        all: imports,
        get
    }
}

