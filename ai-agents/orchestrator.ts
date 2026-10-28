import { readFile, writeFile, readdir } from 'fs/promises';
import path from 'path';
import { createRunContext } from './utils/createRunContext';
import { planRequirement } from './agents/plannerAgent';
import { generateTests } from './agents/generatorAgent';
import { runPlaywright } from './runners/playwrightRunner';
import { analyzeRun } from './agents/analyzerAgent';

import {
    loadRequirementStatuses,
    saveRequirementStatuses,
} from './utils/requirementStatus';
import type {
    RequirementStatus,
    WorkflowStage,
} from './utils/requirementStatus';

/**
 * QA Agent Workflow Orchestrator
 *
 * Coordinates the QA automation workflow for pending requirements.
 *
 * Responsibilities:
 * - Discovers Markdown requirements or selects one by filename.
 * - Loads requirement statuses, including legacy completion records.
 * - Skips completed requirements and allows failed requirements to retry.
 * - Processes requirements sequentially with isolated workflow failures.
 * - Tracks the current stage and creates a shared RunContext.
 * - Invokes Planner, Generator, Runner, and Analyzer in sequence.
 * - Persists execution artifacts and the latest requirement status.
 * - Distinguishes workflow exceptions from unsuccessful test outcomes.
 *
 * Completion requires successful Playwright execution and a PASSED analysis.
 * Statuses are tracked by filename; editing completed files does not rerun them.
 * Retries start from planning rather than resuming an interrupted stage.
 *
 * Requirement discovery occurs once per invocation. File monitoring is
 * handled separately by watchRequirements.ts.
 */

async function main() {
    const requirementsDir = 'ai-agents/requirements';

    // Optionally process one requirement supplied by the watcher or CLI.
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

    const requirementFiles = (await readdir(requirementsDir))
        .filter(file => file.endsWith('.md'))
        .filter(file => !selectedRequirement || file === selectedRequirement)
        .sort();

    if (selectedRequirement && requirementFiles.length === 0) {
        throw new Error(`Requirement not found: ${selectedRequirement}`);
    }

    let statuses = await loadRequirementStatuses();

    for (const requirementFile of requirementFiles) {
        // Failed requirements remain eligible for another invocation.
        if (statuses[requirementFile]?.status === 'completed') {
            console.log(
                `Skipping completed requirement: ${requirementFile}`
            );
            continue;
        }

        let stage: WorkflowStage = 'prepare';
        let runId: string | undefined;
        let result: RequirementStatus;

        try {
            const requirementPath = path.join(
                requirementsDir,
                requirementFile
            );

            const requirementName = path.parse(requirementFile).name;

            const requirement = await readFile(
                requirementPath,
                'utf-8'
            );

            const runContext = await createRunContext(
                requirementName,
                requirementPath
            );

            runId = runContext.runId;

            console.log(`Workflow started: ${runId}`);

            // Generate the test plan.
            stage = 'plan';

            const plannerResult = await planRequirement(
                requirement,
                runContext
            );

            // Select framework context and generate test code.
            stage = 'generate';

            const generatorResult = await generateTests(
                plannerResult.testPlan,
                runContext
            );

            // Execute the generated test.
            stage = 'run';

            const runnerResult = await runPlaywright(
                generatorResult.testSpecPath
            );

            stage = 'save-results';

            await writeFile(
                path.join(runContext.runDir, 'runner-result.json'),
                JSON.stringify(runnerResult, null, 2),
                'utf-8'
            );

            // Analyze execution evidence, including failed test runs.
            stage = 'analyze';

            const analysis = await analyzeRun({
                requirement,
                testPlan: plannerResult.testPlan,
                generatedTest: generatorResult.testSpec,
                runnerResult,
            });

            stage = 'save-results';

            await writeFile(
                path.join(runContext.runDir, 'analysis.json'),
                JSON.stringify(analysis, null, 2),
                'utf-8'
            );

            console.log('Analysis:', analysis);

            if (
                runnerResult.success &&
                analysis.classification === 'PASSED'
            ) {
                result = {
                    status: 'completed',
                    runId,
                    updatedAt: new Date().toISOString(),
                };
            } else {
                // The workflow finished, but its outcome did not pass.
                // This does not imply that the Analyzer itself failed.
                result = {
                    status: 'failed',
                    failureType: 'TEST_RESULT',
                    stage: runnerResult.success ? 'analyze' : 'run',
                    runId,
                    classification: analysis.classification,
                    error: runnerResult.success
                        ? analysis.reason
                        : `Playwright exited with code ${runnerResult.exitCode}. ` +
                          analysis.reason,
                    updatedAt: new Date().toISOString(),
                };
            }
        } catch (error) {
            // Record the stage where execution was interrupted.
            const message = error instanceof Error
                ? error.message
                : String(error);

            result = {
                status: 'failed',
                failureType: 'WORKFLOW_ERROR',
                stage,
                runId,
                error: message,
                updatedAt: new Date().toISOString(),
            };

            console.error(
                `Requirement workflow failed: ${requirementFile} ` +
                `(stage: ${stage})`
            );
            console.error(error);
        }

        const updatedStatuses = {
            ...statuses,
            [requirementFile]: result,
        };

        // Stop the batch if status persistence fails.
        // Do not report completion or start more workflows without saved state.
        await saveRequirementStatuses(updatedStatuses);

        // Update memory only after the state file has been saved.
        statuses = updatedStatuses;

        if (result.status === 'completed') {
            console.log(
                `Requirement completed: ${requirementFile}`
            );
        } else {
            console.log(
                `Requirement failed: ${requirementFile} ` +
                `(type: ${result.failureType}, stage: ${result.stage}). ` +
                'Saved for manual retry.'
            );

            // Continue the batch while reporting an unsuccessful overall exit.
            process.exitCode = 1;
        }
    }
}

// Handle discovery, state loading, and state persistence errors.
main().catch(error => {
    console.error('QA Agent workflow failed:');
    console.error(error);
    process.exitCode = 1;
});