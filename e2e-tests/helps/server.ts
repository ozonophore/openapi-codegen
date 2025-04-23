import express from 'express';
import { Server } from 'http';
import path from 'path';

let server: Server;

export const startServer = async (_folder: string) => {
    const app = express();
    const baseDir = path.join(process.cwd(), 'test/e2e/generated');

    // Обслуживание статических файлов из папки generated
    // app.use(express.static(baseDir));

    // Настраиваем статические файлы с правильными MIME-типами
    app.use(
        express.static(baseDir, {
            setHeaders: (res, filePath) => {
                if (filePath.endsWith('.js')) {
                    res.setHeader('Content-Type', 'application/javascript');
                }
            },
        })
    );

    // Явный маршрут для динамических импортов
    app.get('/:folder/:module', (req, res) => {
        const folder = req.params.folder;
        const module = req.params.module;
        res.sendFile(path.join(baseDir, folder, `${module}.js`));
    });

    // // Явные маршруты для index.html
    // app.get('/:folder/index.html', (req, res) => {
    //     const folderPath = path.join(baseDir, req.params.folder);
    //     res.sendFile(path.join(folderPath, 'index.html'));
    // });

    // // Маршруты для JavaScript файлов
    // app.get('/:folder/:file(.+.js)', (req, res) => {
    //     const folderPath = path.join(baseDir, req.params.folder);
    //     res.sendFile(path.join(folderPath, req.params.file));
    // });

    // // Маршруты для CSS и других ресурсов
    // app.get('/:folder/:file(.+.(css|ico|png|svg))', (req, res) => {
    //     const folderPath = path.join(baseDir, req.params.folder);
    //     res.sendFile(path.join(folderPath, req.params.file));
    // });

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
            console.log(`Server started for ${baseDir}`);
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
