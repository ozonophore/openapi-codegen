import express from 'express';
import fs from 'fs';
import { Server } from 'http';
import path from 'path';

let server: Server;

export const startServer = async (_folder: string) => {
    const app = express();
    const baseDir = path.join(process.cwd(), 'test/e2e/generated');

    // Обслуживание статических файлов из папки generated
    // app.use(express.static(baseDir));

    // Явный маршрут для динамических импортов
    app.get('/:folder/*', (req, res) => {
        const folder = req.params.folder;
        const filePath = req.params[0];
        const fullPath = path.join(baseDir, folder, filePath);

        // Логируем входящий запрос
        // console.log('\n=== НОВЫЙ ЗАПРОС ===');
        // console.log('URL:', req.originalUrl);
        // console.log('Params:', req.params);
        // console.log('Query:', req.query);
        // console.log('Полный путь к файлу:', fullPath);
        // console.log('Существует файл?', fs.existsSync(fullPath));

        const sendOptions = {
            // root: baseDir,
            headers: {
                'Content-Type': 'application/javascript',
            },
        };

        const handler = (err: Error | null) => {
            if (err) {
                // console.log('ОШИБКА ОТПРАВКИ ФАЙЛА:');
                // console.log('Статус:', res.statusCode);
                // console.log('Ошибка:', err.message);
                // console.log('Стек:', err.stack);
                res.status(404).end();
                // } else {
                // console.log('ФАЙЛ УСПЕШНО ОТПРАВЛЕН');
                // console.log('Content-Type:', res.get('Content-Type'));
            }
        };

        if (!path.extname(fullPath)) {
            // console.log('Попытка отправки файла с добавлением .js');
            res.sendFile(`${fullPath}.js`, sendOptions, handler);
        } else {
            // console.log('Попытка отправки файла без изменений');
            res.sendFile(fullPath, handler);
        }
    });

    // Статические файлы
    app.use(
        express.static(baseDir, {
            setHeaders: (res, filePath) => {
                if (filePath.endsWith('.js')) {
                    res.setHeader('Content-Type', 'application/javascript');
                }
            },
        })
    );

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

    // API endpoints
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
