import {
    copyFile as __copyFile,
    cp as __cp,
    exists as __exists,
    mkdir as __mkdir,
    readdir as __readdir,
    readFile as __readFile,
    rmdir as __rmdir,
    stat as __stat,
    statSync,
    unlink as __unlink,
    writeFile as __writeFile,
} from 'fs';
import { dirname } from 'path';
import { promisify } from 'util';

import { normalizeHelper } from './pathHelpers';

// Промисифицируем базовые функции fs
const mkdirBase = promisify(__mkdir);
const rmdirBase = promisify(__rmdir);
const readdir = promisify(__readdir);
const unlink = promisify(__unlink);
const stat = promisify(__stat);

// Экспортируемые промисифицированные функции
const readFile = promisify(__readFile);
const writeFile = promisify(__writeFile);
const copyFile = promisify(__copyFile);
const exists = promisify(__exists);
const cp = promisify(__cp);

// Рекурсивное создание директорий (замена mkdirp)
const mkdir = async (path: string): Promise<void> => {
    try {
        await mkdirBase(path);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // Родительская директория не существует, создаем ее рекурсивно
            await mkdir(dirname(path));
            await mkdirBase(path);
        } else if (error.code !== 'EEXIST') {
            // Пропускаем ошибку, если директория уже существует
            throw error;
        }
    }
};

// Рекурсивное удаление директорий и файлов (замена rimraf)
const rmdir = async (path: string): Promise<void> => {
    try {
        const stats = await stat(path);
        if (stats.isDirectory()) {
            const files = await readdir(path);
            for (const file of files) {
                const curPath = `${path}/${file}`;
                await rmdir(curPath); // Рекурсивно удаляем содержимое
            }
            await rmdirBase(path); // Удаляем пустую директорию
        } else {
            await unlink(path); // Удаляем файл
        }
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            // Пропускаем ошибку, если путь не существует
            throw error;
        }
    }
};

function isDirectory(path: string): boolean {
    try {
        return statSync(normalizeHelper(path)).isDirectory();
    } catch {
        return false;
    }
}

function isPathToFile(path: string): boolean {
    try {
        return statSync(normalizeHelper(path)).isFile();
    } catch {
        return false;
    }
}

const fileSystemHelpers = {
    readdir,
    readFile,
    writeFile,
    copyFile,
    exists,
    cp,
    mkdir,
    rmdir,
    isDirectory,
    isPathToFile,
};

export { fileSystemHelpers };
