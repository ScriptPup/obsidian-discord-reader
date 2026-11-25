// include dependencies
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Server } from 'http';

export const startServer = async (): Promise<Server> => {
    return new Promise((res, _) => {
        const app = express();

        // create the proxy
        /** @type {import('http-proxy-middleware').RequestHandler<import('express').Request, import('express').Response>} */

        const exampleProxy = createProxyMiddleware({
            target: 'https://discord.com/api', // target host with the same base path
            changeOrigin: true, // needed for virtual hosted sites
            ws: true
        });

        // mount `exampleProxy` in web server
        app.use('/api', exampleProxy);
        const server = app.listen(3000,
            () => { res(server); console.log("Proxy server started."); }
        );
    });   
}