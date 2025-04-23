import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    timeout: 40000,
    retries: 0,
    workers: 1, // Для последовательного выполнения
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        baseURL: 'http://localhost:3000',
    },
    testDir: './e2e-tests',
};

export default config;
