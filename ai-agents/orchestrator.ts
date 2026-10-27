import { readFile, writeFile, readdir } from 'fs/promises';
import path from 'path';
import { createRunContext } from './utils/createRunContext';
import { planRequirement } from './agents/plannerAgent';
import { generateTests } from './agents/generatorAgent';
import { runPlaywright } from './runners/playwrightRunner';
import { analyzeRun } from './agents/analyzerAgent';
import {
    loadCompletedRequirements,
    saveCompletedRequirements,
} from './utils/requirementStatus';

/**
 * QA Agent Workflow Orchestrator
 *
 * Coordinates the QA automation workflow for pending requirements.
 *
 * Responsibilities:
 * - Discovers Markdown requirement files.
 * - Loads completion records and skips completed requirements.
 * - Processes pending requirements sequentially.
 * - Creates a shared RunContext for each workflow execution.
 * - Invokes Planner, Generator, Runner, and Analyzer in sequence.
 * - Passes exact outputs between workflow components.
 * - Persists execution and analysis artifacts inside each run directory.
 * - Records completion only when Playwright succeeds and Analyzer returns PASSED.
 * - Isolates failures so remaining requirements can still be processed.
 * - Leaves unsuccessful requirements pending for the next invocation.
 *
 * Completion is tracked by filename, so edits to completed files do not
 * automatically trigger another run. Requirement discovery happens once
 * per invocation; this orchestrator does not watch for new files.
 *
 * The Orchestrator owns workflow sequencing and artifact coordination.
 * Individual components remain reusable and do not discover or invoke
 * other workflow components themselves.
 */

async function main() {
    const requirementsDir = 'ai-agents/requirements';

    // Optionally process a single requirement supplied by the watcher.
    const requirementIndex = process.argv.indexOf('--requirement');

    const selectedRequirement = requirementIndex === -1
        ? undefined
        : process.argv[requirementIndex + 1];

    if (
        requirementIndex !== -1 &&
        (!selectedRequirement || !selectedRequirement.endsWith('.md'))
    ) {
        throw new Error('--requirement requires a Markdown filename.');
    }

    // Discover Markdown files and optionally select one requirement.
    const requirementFiles = (await readdir(requirementsDir))
        .filter(file => file.endsWith('.md'))
        .filter(file => !selectedRequirement || file === selectedRequirement)
        .sort();

    if (selectedRequirement && requirementFiles.length === 0) {
        throw new Error(`Requirement not found: ${selectedRequirement}`);
    }

    // Load records of previously completed requirements.
    const completed = await loadCompletedRequirements();

    for (const requirementFile of requirementFiles) {
        // Skip requirements that have already completed successfully.
        if (Object.hasOwn(completed, requirementFile)) {
            console.log(
                `Skipping completed requirement: ${requirementFile}`
            );
            continue;
        }

        // Handle each requirement independently so failures do not stop the batch.
        try {
            const requirementPath = path.join(
                requirementsDir,
                requirementFile
            );

            const requirementName = path.parse(requirementPath).name;

            const requirement = await readFile(
                requirementPath,
                'utf-8'
            );

            const runContext = await createRunContext(
                requirementName,
                requirementPath
            );

            console.log(`Workflow started: ${runContext.runId}`);

            // Generate a test plan from the requirement.
            const plannerResult = await planRequirement(
                requirement,
                runContext
            );

            // Generate test code from the test plan.
            const generatorResult = await generateTests(
                plannerResult.testPlan,
                runContext
            );

            // Execute the generated tests.
            const runnerResult = await runPlaywright(
                generatorResult.testSpecPath
            );

            await writeFile(
                path.join(runContext.runDir, 'runner-result.json'),
                JSON.stringify(runnerResult, null, 2),
                'utf-8'
            );

            // Analyze the test execution results.
            const analysis = await analyzeRun({
                requirement,
                testPlan: plannerResult.testPlan,
                generatedTest: generatorResult.testSpec,
                runnerResult,
            });

            await writeFile(
                path.join(runContext.runDir, 'analysis.json'),
                JSON.stringify(analysis, null, 2),
                'utf-8'
            );

            console.log('Analysis:', analysis);

            // Mark completion only when execution and analysis both pass.
            if (
                runnerResult.success &&
                analysis.classification === 'PASSED'
            ) {
                const updatedCompleted = {
                    ...completed,
                    [requirementFile]: {
                        runId: runContext.runId,
                    },
                };

                await saveCompletedRequirements(updatedCompleted);

                // Update the in-memory records only after saving succeeds.
                Object.assign(completed, updatedCompleted);

                console.log(
                    `Requirement completed: ${requirementFile}`
                );
            } else {
                console.log(
                    `Requirement not completed: ${requirementFile}; ` +
                    'will retry next run.'
                );

                // Report an unsuccessful outcome without stopping the batch.
                process.exitCode = 1;
            }
        } catch (error) {
            console.error(
                `Requirement workflow failed: ${requirementFile}`
            );
            console.error(error);

            // Continue processing while reporting failure when the process exits.
            process.exitCode = 1;
        }
    }
}

// Handle errors outside the loop, such as loading records or reading the directory.
main().catch(error => {
    console.error('QA Agent workflow failed:');
    console.error(error);
    process.exitCode = 1;
});