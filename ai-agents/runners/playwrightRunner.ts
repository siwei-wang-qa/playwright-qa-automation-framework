import { exec } from 'child_process';
import { promisify } from 'util';
import { RunnerResult } from '../types/runnerResult';
import path from 'path';

/**
 * Playwright Runner
 *
 * Executes a generated Playwright test spec and returns
 * the raw execution result to the workflow.
 *
 * Responsibilities:
 * - Receives the exact generated test path from the Orchestrator.
 * - Executes only that test using the AI-generated Playwright config.
 * - Captures the process exit code, stdout, and stderr.
 * - Returns a structured RunnerResult without interpreting the failure.
 *
 * The Runner does not discover tests, analyze failures,
 * or manage workflow artifacts.
 * Those responsibilities belong to the Orchestrator and Analyzer.
 */

const execAsync = promisify(exec);

type ExecError = Error & {
    code?: number;
    stdout?: string;
    stderr?: string;
};

export async function runPlaywright(generatedTestPath: string): Promise<RunnerResult> {

    const testPath = path.relative(
        path.join('ai-agents', 'runs'),
        generatedTestPath
    ).replace(/\\/g, '/');

    try {
        const { stdout, stderr } = await execAsync(
            `npx playwright test "${testPath}" --config=playwright.generated.config.ts`
        );

        return {
            success: true,
            exitCode: 0,
            stdout: stdout,
            stderr: stderr
        };
    } catch (error) {
        const execError = error as ExecError;

        return {
            success: false,
            exitCode: execError.code ?? 1,
            stdout: execError.stdout ?? '',
            stderr: execError.stderr ?? execError.message
        };
    }
}


