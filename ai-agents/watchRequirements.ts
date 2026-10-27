import { readdir, readFile } from 'fs/promises';
import { createHash } from 'crypto';
import { spawn } from 'child_process';
import path from 'path';
import { setTimeout as delay } from 'timers/promises';

const requirementsDir = 'ai-agents/requirements';
const orchestratorPath = path.resolve('ai-agents/orchestrator.ts');
const pollInterval = 2*60*1000;

// Track filenames handled during this watcher session.
const handled = new Set<string>();

// Track content hashes to wait for files to finish being saved.
let previousHashes = new Map<string, string>();

function runRequirement(filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Reuse the current Node executable and tsx loader.
        // Passing arguments separately also supports filenames containing spaces.
        const child = spawn(
            process.execPath,
            [
                ...process.execArgv,
                orchestratorPath,
                '--requirement',
                filename,
            ],
            {
                stdio: 'inherit',
                shell: false,
            }
        );

        child.once('error', reject);

        child.once('close', (code, signal) => {
            if (code !== 0) {
                console.error(
                    `Workflow did not complete successfully: ${filename} ` +
                    `(exit code: ${code}, signal: ${signal})`
                );
            }

            resolve();
        });
    });
}

async function main() {
    console.log(`Watching requirements: ${requirementsDir}`);
    console.log('Press Ctrl+C to stop.');

    while (true) {
        const entries = await readdir(
            requirementsDir,
            { withFileTypes: true }
        );

        const filenames = entries
            .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
            .map(entry => entry.name)
            .sort();

        const currentHashes = new Map<string, string>();

        for (const filename of filenames) {
            if (handled.has(filename)) {
                continue;
            }

            const filePath = path.join(requirementsDir, filename);

            let content: string;

            try {
                content = await readFile(filePath, 'utf-8');
            } catch (error) {
                // A file may be removed between directory discovery and reading.
                if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                    continue;
                }

                throw error;
            }

            if (!content.trim()) {
                continue;
            }

            const hash = createHash('sha256')
                .update(content)
                .digest('hex');

            currentHashes.set(filename, hash);

            // Wait for identical content across two polls before processing.
            if (previousHashes.get(filename) !== hash) {
                continue;
            }

            console.log(`Checking requirement: ${filename}`);

            // Process requirements sequentially, without overlapping workflows.
            await runRequirement(filename);

            // Avoid repeatedly calling agents for an unchanged failed requirement.
            handled.add(filename);
        }

        previousHashes = currentHashes;

        await delay(pollInterval);
    }
}

main().catch(error => {
    console.error('Requirement watcher failed:');
    console.error(error);
    process.exitCode = 1;
});