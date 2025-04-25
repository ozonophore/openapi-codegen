import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    timeout: 40_000, // максимальная задержка beforeAll и самих тестов
    retries: 0,
    workers: 1, // Для последовательного выполнения
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        baseURL: 'http://localhost:3000',
        launchOptions: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
    },
    testDir: './e2e-tests',
    globalSetup: './e2e-tests/global-setup.ts',
};

export default config;
