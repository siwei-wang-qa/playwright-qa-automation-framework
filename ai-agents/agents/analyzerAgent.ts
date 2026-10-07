import 'dotenv/config';
import { Agent, run } from '@openai/agents';
import { RunnerResult } from '../types/runnerResult';
import { z } from 'zod';

/**
 * QA Analyzer Agent
 *
 * Analyzes Playwright execution results and classifies
 * the most likely cause of a test outcome.
 *
 * Responsibilities:
 * - Evaluates the requirement, test plan, generated test, and runner result.
 * - Distinguishes product defects from test-code, framework,
 *   environment, and unknown issues.
 * - Returns a structured AnalyzerResult using a Zod schema.
 * - Provides evidence-based reasoning without modifying any code.
 *
 * The Analyzer is diagnostic only.
 * Workflow decisions and future healing actions are handled by
 * the Orchestrator and Healer.
 */

type AnalyzerInput = {
    requirement: string;
    testPlan: string;
    generatedTest: string;
    runnerResult: RunnerResult;
};

const AnalyzerResultSchema = z.object({
    classification: z.enum([
        'PASSED',
        'PRODUCT_BUG',
        'TEST_CODE_ISSUE',
        'FRAMEWORK_ISSUE',
        'ENVIRONMENT_ISSUE',
        'UNKNOWN',
    ]),
    reason: z.string(),
});

type AnalyzerResult = z.infer<typeof AnalyzerResultSchema>;

const analyzerAgent = new Agent({
    name: 'QA Analyzer Agent',

    instructions: `
        You are a Senior QA Failure Analyzer.

        Your responsibility is to analyze Playwright test execution results
        and determine the most likely cause of a test failure.

        Classify the result as one of:

        - PASSED
        - PRODUCT_BUG
        - TEST_CODE_ISSUE
        - FRAMEWORK_ISSUE
        - ENVIRONMENT_ISSUE
        - UNKNOWN

        Do not assume that every failed test is a product bug.
        Base your analysis only on the evidence provided.

        If there is not enough evidence to determine the cause,
        classify it as UNKNOWN.

        Classify network failures, service unavailability,
        navigation failures caused by the test environment,
        or other external execution problems as ENVIRONMENT_ISSUE
        when supported by the evidence.
    `,

    outputType: AnalyzerResultSchema,
});

export async function analyzeRun(
    input: AnalyzerInput
): Promise<AnalyzerResult> {
    const analyzerInput = `
        REQUIREMENT:
        ${input.requirement}

        TEST PLAN:
        ${input.testPlan}

        GENERATED TEST:
        ${input.generatedTest}

        RUNNER RESULT:
        ${JSON.stringify(input.runnerResult, null, 2)}
    `;

    const result = await run(
        analyzerAgent,
        analyzerInput
    );

    if (!result.finalOutput) {
        throw new Error('Analyzer did not return a final output.');
    }

    return result.finalOutput;
}
