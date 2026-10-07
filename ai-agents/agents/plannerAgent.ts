import 'dotenv/config';
import { Agent, run } from '@openai/agents';
import { writeFile } from 'fs/promises';
import path from 'path';
import { RunContext } from '../types/runContext';

/**
 * QA Planner Agent
 *
 * Converts a software requirement into a structured QA test plan.
 *
 * Responsibilities:
 * - Analyzes the provided requirement and acceptance criteria.
 * - Generates required test cases with acceptance-criteria traceability.
 * - Separates required tests, recommended tests, and clarification items.
 * - Avoids inventing behavior that is not supported by the requirement.
 * - Saves the generated test plan inside the current workflow run directory.
 *
 * The Planner processes one requirement at a time.
 * Requirement discovery and workflow orchestration are handled by the Orchestrator.
 */

type PlannerResult = {
    testPlan: string;
    testPlanPath: string;
};

const plannerAgent = new Agent({
    name: 'QA Planner Agent',

    instructions: `
    You are a Senior QA Test Planner.

    Your responsibility is to analyze software requirements
    and create a clear test plan.

    IMPORTANT:
    Do not invent requirements.
    When a requirement is ambiguous, ask for clarification
    rather than making an assumption about the intended behavior.

    Clearly distinguish between:
    - Required tests based on acceptance criteria
    - Recommended additional tests
    - Clarifications needed

    Test case design rules:
    - Avoid duplicate or overlapping test cases.
    - If multiple acceptance criteria belong to the same user flow,
        combine them into one test case when practical.
    - Each test case may validate multiple acceptance criteria.
    - Include the covered acceptance criteria for each required test.
  `,
});

export async function planRequirement(
    requirement: string,
    runContext: RunContext
): Promise<PlannerResult> {

    const result = await run(
        plannerAgent,
        requirement
    );

    if (!result.finalOutput) {
        throw new Error(
            'Planner did not return a final output.'
        );
    }

    const testPlan = result.finalOutput;

    const testPlanPath =
        path.join(runContext.runDir, 'test-plan.md');

    await writeFile(
        testPlanPath,
        testPlan,
        'utf-8'
    );

    return {
        testPlan,
        testPlanPath,
    };
}
