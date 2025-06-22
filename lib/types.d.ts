export type Route = {
    path: string,
    staticPaths?: <T>() => T 
    handler: (ctx: Context) => Response,
    name: string,
}

export type Router = Array<Route>

export type Context = {
    req: Request,
    params: { [key: string]: unknown }
}