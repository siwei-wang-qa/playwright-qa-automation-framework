import 'dotenv/config';
import { Agent, run } from '@openai/agents';
import { writeFile } from 'fs/promises';
import path from 'path';
import { RunContext } from '../types/runContext';
import { buildFrameworkContext } from '../utils/buildFrameworkContext';

/**
 * QA Test Generator Agent
 *
 * Converts a QA test plan into executable Playwright TypeScript tests.
 *
 * Responsibilities:
 * - Receives the test plan produced by the Planner.
 * - Builds framework-aware context using the existing Page Objects,
 *   fixtures, and test data.
 * - Generates only required automated test cases supported by the test plan.
 * - Reuses existing framework APIs instead of inventing selectors or helpers.
 * - Saves the generated test spec inside the current workflow run directory.
 *
 * Framework discovery and import-path resolution are delegated to
 * buildFrameworkContext().
 *
 * Workflow sequencing and RunContext ownership are handled by the Orchestrator.
 */

type GeneratorResult = {
    testSpec: string;
    testSpecPath: string;
};


const generatorAgent = new Agent({
    name: 'QA Test Generator',

    instructions: `
    You are a Senior QA Automation Engineer specializing in Playwright and TypeScript.

    Your responsibility is to generate Playwright automated tests
    from a provided test plan.

    IMPORTANT:
    Follow the existing automation framework and coding patterns.

    Reuse existing:
    - Page Objects
    - Fixtures
    - Test data

    If required test data or framework support does not exist:
    - Do not invent unsupported behavior.
    - Clearly identify what is missing.
    - Propose the required addition.
    - Do not modify existing framework files unless explicitly allowed.

    Do not invent selectors, helper methods, or framework APIs
    when an existing implementation is available.

    Generate only tests that are supported by the provided test plan
    and framework context.

    Test selection rules:
    - Generate automated tests only for Required Test Cases.
    - Do not generate tests for Recommended Additional Tests unless explicitly requested.
    - Do not generate tests for items listed under Clarifications Needed.

    Output rules:
    - Return only valid Playwright TypeScript test code.
    - Do not include Markdown code fences.
    - Do not include explanations before or after the code.

    Import rules:
    - Use only the import paths provided under AVAILABLE IMPORT PATHS.
    - Do not change or recalculate these import paths.
    - Determine the required exported symbols from the provided framework file contents.
    - Import only the symbols required by the generated tests.
  `,
});


export async function generateTests(
    testPlan: string,
    runContext: RunContext
): Promise<GeneratorResult> {

    const testSpecPath =
        path.join(
            runContext.runDir,
            'generated.spec.ts'
        );

    const testSpecDir =
        path.dirname(testSpecPath);


    const frameworkContext =
        await buildFrameworkContext(
            testPlan,
            testSpecDir
        );

    const generatorInput = `
        TEST PLAN:

        ${testPlan}

        FRAMEWORK CONTEXT:

        ${frameworkContext}
    `;

    const result = await run(
        generatorAgent,
        generatorInput
    );

    if (!result.finalOutput) {
        throw new Error(
            'Generator did not return a final output.'
        );
    }

    const testSpec = result.finalOutput;

    await writeFile(
        testSpecPath,
        testSpec,
        'utf-8'
    );

    return {
        testSpec,
        testSpecPath,
    };
}
