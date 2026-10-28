import { mkdir, readFile, writeFile, rename } from 'fs/promises';
import path from 'path';

const statusPath = path.join(
    'ai-agents',
    'runs',
    'requirement-status.json'
);

export type WorkflowStage =
    | 'prepare'
    | 'plan'
    | 'generate'
    | 'run'
    | 'analyze'
    | 'save-results';

type CompletedStatus = {
    status: 'completed';
    runId: string;
    updatedAt: string | null;
};

type FailedStatus = {
    status: 'failed';
    failureType: 'WORKFLOW_ERROR' | 'TEST_RESULT';
    stage: WorkflowStage;
    runId?: string;
    error: string;
    classification?: string;
    updatedAt: string;
};

export type RequirementStatus =
    | CompletedStatus
    | FailedStatus;

export type RequirementStatuses =
    Record<string, RequirementStatus>;

const workflowStages: WorkflowStage[] = [
    'prepare',
    'plan',
    'generate',
    'run',
    'analyze',
    'save-results',
];

function isObject(
    value: unknown
): value is Record<string, unknown> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    );
}

function parseStatus(value: unknown): RequirementStatus {
    if (!isObject(value)) {
        throw new Error('Requirement status must be an object.');
    }

    // Convert legacy completion records without inventing a timestamp.
    if (
        !Object.hasOwn(value, 'status') &&
        typeof value.runId === 'string'
    ) {
        return {
            status: 'completed',
            runId: value.runId,
            updatedAt: null,
        };
    }

    if (
        value.status === 'completed' &&
        typeof value.runId === 'string' &&
        (
            typeof value.updatedAt === 'string' ||
            value.updatedAt === null
        )
    ) {
        return {
            status: 'completed',
            runId: value.runId,
            updatedAt: value.updatedAt,
        };
    }

    if (
        value.status === 'failed' &&
        (
            value.failureType === 'WORKFLOW_ERROR' ||
            value.failureType === 'TEST_RESULT'
        ) &&
        workflowStages.includes(value.stage as WorkflowStage) &&
        typeof value.error === 'string' &&
        typeof value.updatedAt === 'string' &&
        (
            value.runId === undefined ||
            typeof value.runId === 'string'
        ) &&
        (
            value.classification === undefined ||
            typeof value.classification === 'string'
        )
    ) {
        return {
            status: 'failed',
            failureType: value.failureType,
            stage: value.stage as WorkflowStage,
            runId: value.runId,
            error: value.error,
            classification: value.classification,
            updatedAt: value.updatedAt,
        };
    }

    throw new Error('Invalid requirement status record.');
}

export async function loadRequirementStatuses():
    Promise<RequirementStatuses> {
    let content: string;

    try {
        content = await readFile(statusPath, 'utf-8');
    } catch (error) {
        // No state file is expected on the first run.
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return {};
        }

        throw error;
    }

    const parsed: unknown = JSON.parse(content);

    if (!isObject(parsed)) {
        throw new Error('Requirement status file must contain an object.');
    }

    const entries = Object.entries(parsed).map(
        ([filename, value]) => {
            try {
                return [filename, parseStatus(value)] as const;
            } catch {
                throw new Error(
                    `Invalid status record for requirement: ${filename}`
                );
            }
        }
    );

    return Object.fromEntries(entries);
}

export async function saveRequirementStatuses(
    statuses: RequirementStatuses
): Promise<void> {
    await mkdir(path.dirname(statusPath), { recursive: true });

    // Write to a temporary file before replacing the state file.
    const temporaryPath = `${statusPath}.tmp`;

    await writeFile(
        temporaryPath,
        JSON.stringify(statuses, null, 2),
        'utf-8'
    );

    await rename(temporaryPath, statusPath);
}