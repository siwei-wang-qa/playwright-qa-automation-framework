import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

export default defineConfig({
    testDir: './ai-agents/runs',

    use: {
        baseURL: env.baseURL,
        ...devices['Desktop Chrome'],
    },
});