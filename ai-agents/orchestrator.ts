import { readFile, writeFile, readdir } from 'fs/promises';
import path from 'path';
import { createRunContext } from './utils/createRunContext';
import { planRequirement } from './agents/plannerAgent';
import { generateTests } from './agents/generatorAgent';
import { runPlaywright } from './runners/playwrightRunner';
import { analyzeRun } from './agents/analyzerAgent';

/**
 * QA Agent Workflow Orchestrator
 *
 * Coordinates the end-to-end QA automation workflow for a requirement.
 *
 * Responsibilities:
 * - Loads the requirement to be processed.
 * - Creates a shared RunContext for the workflow execution.
 * - Invokes Planner, Generator, Runner, and Analyzer in sequence.
 * - Passes exact outputs between workflow components.
 * - Persists execution and analysis artifacts inside the run directory.
 *
 * The Orchestrator owns workflow sequencing and artifact coordination.
 * Individual components remain reusable and do not discover or invoke
 * other workflow components themselves.
 */

async function main() {

    const requirementsDir =
        'ai-agents/requirements';

    const requirementFiles =
        (await readdir(requirementsDir)).filter(file => file.endsWith('.md'));;

    for (const requirementFile of requirementFiles) {
        const requirementPath =
            path.join(requirementsDir, requirementFile);

        const requirementName =
            path.parse(requirementPath).name;

        const requirement =
            await readFile(
                requirementPath,
                'utf-8'
            );

        const runContext =
            await createRunContext(
                requirementName,
                requirementPath
            );

        console.log(
            `Workflow started: ${runContext.runId}`
        );

        const plannerResult =
            await planRequirement(
                requirement,
                runContext
            );

        const generatorResult =
            await generateTests(
                plannerResult.testPlan,
                runContext
            );

        const runnerResult =
            await runPlaywright(
                generatorResult.testSpecPath
            );

        await writeFile(
            path.join(
                runContext.runDir,
                'runner-result.json'
            ),
            JSON.stringify(
                runnerResult,
                null,
                2
            ),
            'utf-8'
        );

        const analysis =
            await analyzeRun({
                requirement,
                testPlan: plannerResult.testPlan,
                generatedTest: generatorResult.testSpec,
                runnerResult,
            });

        await writeFile(
            path.join(
                runContext.runDir,
                'analysis.json'
            ),
            JSON.stringify(
                analysis,
                null,
                2
            ),
            'utf-8'
        );

        console.log(
            'Analysis:',
            analysis
        );
    }
}

main().catch((error) => {
    console.error('QA Agent workflow failed:');
    console.error(error);
});