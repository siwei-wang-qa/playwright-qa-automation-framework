import { mkdir } from 'fs/promises';
import path from 'path';
import { getTimestamp } from '../../helpers/timestamp';
import { RunContext } from '../types/runContext';

/**
 * Creates the execution context for a single QA Agent workflow run.
 *
 * Responsibilities:
 * - Generates a unique run ID for the requirement execution.
 * - Creates an isolated run directory for workflow artifacts.
 * - Stores the requirement identity and artifact location in RunContext.
 *
 * The same RunContext is shared across Planner, Generator,
 * Runner, and Analyzer so all artifacts belong to the same workflow run.
 */

export async function createRunContext(
    requirementName: string,
    requirementPath: string
): Promise<RunContext> {

    const runId =
        `${requirementName}-${getTimestamp()}`;

    const runDir =
        path.join('ai-agents', 'runs', runId);

    await mkdir(runDir, { recursive: true });

    return {
        runId,
        requirementName,
        requirementPath,
        runDir,
    };
}
