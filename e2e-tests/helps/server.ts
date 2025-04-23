import express from 'express';
import { Server } from 'http';
import path from 'path';

let server: Server;

export const startServer = async (folder: string) => {
    const app = express();
    const staticPath = path.join(process.cwd(), 'test/e2e/generated', folder);

    app.use(express.static(staticPath));

    app.all('/base/api/v1.0/*', (req, res) => {
        setTimeout(() => {
            res.json({
                method: req.method,
                path: req.path,
                query: req.query,
                body: req.body,
                headers: req.headers,
            });
        }, 100);
    });

    return new Promise<void>(resolve => {
        server = app.listen(3000, () => {
            console.log(`Server started for ${staticPath}`);
            resolve();
        });
    });
};

export const stopServer = () => {
    return new Promise<void>((resolve, reject) => {
        server.close(err => {
            if (err) reject(err);
            else resolve();
        });
    });
};
