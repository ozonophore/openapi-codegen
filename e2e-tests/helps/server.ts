import express, { Express } from 'express';
import { Server } from 'http';
import { resolve as resolvePath } from 'path';

let _app: Express;
let _server: Server;

/**
 * Запускает локальный сервер для E2E-тестов.
 * @param dir Папка внутри "./test/e2e/generated/", откуда будут браться статика и скрипты
 */
const start = async (dir: string) => {
    return new Promise<void>(resolve => {
        _app = express();

        // Парсинг JSON-тел
        _app.use(express.json());

        // Статическая раздача всех файлов из generated dir
        _app.use(
            express.static(resolvePath(`./test/e2e/generated/${dir}/esm`), {
                extensions: ['js', 'html', 'css'],
                index: 'index.html',
            })
        );

        // Специальный endpoint для эмуляции ошибки
        _app.all('/base/api/v1.0/error', (req, res) => {
            const status = parseInt(String(req.query.status), 10) || 500;
            res.status(status).json({
                status,
                message: 'hello world',
            });
        });

        // Общий прокси для остальных API-запросов
        _app.all('/base/api/v1.0/*', (req, res) => {
            setTimeout(() => {
                res.json({
                    method: req.method,
                    protocol: req.protocol,
                    hostname: req.hostname,
                    path: req.path,
                    url: req.url,
                    query: req.query,
                    body: req.body,
                    headers: req.headers,
                });
            }, 100);
        });

        _server = _app.listen(3000, () => {
            resolve();
        });
    });
};

/** Останавливает запущенный сервер */
const stop = async () => {
    return new Promise<void>((resolve, reject) => {
        _server.close(err => {
            if (err) reject(err);
            else resolve();
        });
    });
};

export default {
    start,
    stop,
};
