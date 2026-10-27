import { mkdir, readFile, writeFile, rename } from 'fs/promises';
import path from 'path';

const statusPath = path.join(
    'ai-agents',
    'runs',
    'requirement-status.json'
);

type CompletedRequirements = Record<string, { runId: string }>;

export async function loadCompletedRequirements():
    Promise<CompletedRequirements> {
    try {
        const content = await readFile(statusPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return {};
        }

        throw error;
    }
}

export async function saveCompletedRequirements(
    completed: CompletedRequirements
): Promise<void> {
    await mkdir(path.dirname(statusPath), { recursive: true });

    const temporaryPath = `${statusPath}.tmp`;

    await writeFile(
        temporaryPath,
        JSON.stringify(completed, null, 2),
        'utf-8'
    );

    await rename(temporaryPath, statusPath);
}