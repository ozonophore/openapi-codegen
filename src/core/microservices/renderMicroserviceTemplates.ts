/**
 * Render microservice coordination templates to disk
 */

import camelCase from 'camelcase';
import fs from 'fs';
import * as Handlebars from 'handlebars/runtime';
import path from 'path';

import templateAvatarService from '../../templatesCompiled/microservices/avatarService';
import templateSwarmApiServer from '../../templatesCompiled/microservices/swarmApiServer';
import templateSwarmCoordinator from '../../templatesCompiled/microservices/swarmCoordinator';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { getClassName } from '../utils/getClassName';
import { registerHandlebarHelpers } from '../utils/registerHandlebarHelpers';
import { AvatarSwarm } from './types';

function getSwarmNaming(rawName: string): { swarmName: string; swarmNameCamel: string } {
    const swarmName = getClassName(rawName);
    return {
        swarmName,
        swarmNameCamel: camelCase(swarmName),
    };
}

/**
 * Вычисляет checksum по содержимому всех .ts файлов в директории.
 * @param dir абсолютный или относительный путь к директории
 * @returns hex-checksum или пустая строка если директория отсутствует
 */
export function calculateDirectoryChecksum(dir: string): string {
    if (!fs.existsSync(dir)) {
        return '';
    }

    const files: string[] = [];
    const walk = (currentDir: string): void => {
        for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.name.endsWith('.ts')) {
                files.push(fullPath);
            }
        }
    };

    walk(dir);
    files.sort();

    let combined = '';
    for (const file of files) {
        combined += fs.readFileSync(file, 'utf8');
    }

    return calculateStringChecksum(combined);
}

function calculateStringChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

/**
 * Рендерит swarmCoordinator.hbs и avatarService.hbs в директорию вывода.
 * @param swarm модель Avatar Swarm
 * @param outputDir корневая директория вывода swarm
 */
export function renderMicroserviceTemplates(swarm: AvatarSwarm, outputDir: string): void {
    registerHandlebarHelpers({
        httpClient: HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
    });

    const { swarmName, swarmNameCamel } = getSwarmNaming(swarm.name);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const coordinatorTemplate = Handlebars.template(templateSwarmCoordinator);
    const coordinatorCode = coordinatorTemplate({ swarmName, swarmNameCamel });
    fs.writeFileSync(path.join(outputDir, 'coordinator.ts'), coordinatorCode);

    const avatarTemplate = Handlebars.template(templateAvatarService);
    for (const avatar of swarm.avatars) {
        const serviceName = getClassName(avatar.name);
        const avatarDir = path.join(outputDir, avatar.name);

        if (!fs.existsSync(avatarDir)) {
            fs.mkdirSync(avatarDir, { recursive: true });
        }

        const avatarCode = avatarTemplate({ serviceName, swarmName, swarmNameCamel });
        fs.writeFileSync(path.join(avatarDir, 'avatar.ts'), avatarCode);
    }
}

/**
 * Рендерит swarmApiServer.hbs в директорию вывода.
 * @param swarm модель Avatar Swarm
 * @param outputDir корневая директория вывода swarm
 * @param [port] порт HTTP-сервера координации
 */
export function renderApiServerTemplate(swarm: AvatarSwarm, outputDir: string, port: number = 3100): void {
    registerHandlebarHelpers({
        httpClient: HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
    });

    const { swarmName, swarmNameCamel } = getSwarmNaming(swarm.name);
    const avatars = swarm.avatars.map(avatar => ({
        name: avatar.name,
        serviceId: avatar.id,
    }));

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const apiServerTemplate = Handlebars.template(templateSwarmApiServer);
    const apiServerCode = apiServerTemplate({ swarmName, swarmNameCamel, port, avatars });
    fs.writeFileSync(path.join(outputDir, 'api-server.ts'), apiServerCode);
}
