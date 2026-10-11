import 'dotenv/config';
import { run } from '@openai/agents';
import { createMcpTestAgent, createPlaywrightMcpServer } from './agents/mcpTestAgent';
import { mkdir, readFile, writeFile, readdir, } from 'fs/promises';
import path from 'path';
import { getTimestamp } from '../helpers/timestamp';

async function main() {

    const requirementsDir =
        'mcp-testing/requirements';

    const requirementFiles =
        (await readdir(requirementsDir))
            .filter(file => file.endsWith('.md'));

    const batchId = `batch-${getTimestamp()}`;

    const batchDir = path.join(
        'mcp-testing',
        'runs',
        batchId
    );

    await mkdir(batchDir, {
        recursive: true,
    });

    const summary = {
        total: requirementFiles.length,
        passed: 0,
        failed: 0,
        assertionFailures: 0,
        executionFailures: 0,
    };



    for (const requirementFile of requirementFiles) {
        const playwrightMcpServer = createPlaywrightMcpServer();

        const requirementName =
            path.parse(requirementFile).name;

        const runDir = path.join(
            batchDir,
            requirementName
        );

        await mkdir(runDir, {
            recursive: true,
        });

        let testResult: {
            status: 'PASS' | 'FAIL';
            failureType: 'NONE' | 'ASSERTION_FAILURE' | 'EXECUTION_FAILURE';
        } | undefined;

        try {

            console.log(
                `Connecting MCP Server for: ${requirementFile}`
            );
            await playwrightMcpServer.connect();

            const requirementPath =
                path.join(
                    requirementsDir,
                    requirementFile
                );

            const testingGoal =
                await readFile(
                    requirementPath,
                    'utf-8'
                );

            console.log(
                `Running requirement: ${requirementFile}`
            );

            const mcpTestAgent = createMcpTestAgent(playwrightMcpServer);
            const result = await run(
                mcpTestAgent,
                testingGoal
            );

            testResult = result.finalOutput;

            if (!testResult) {
                throw new Error(
                    `No final output returned for ${requirementFile}`
                );
            }

            console.log('Agent result:');
            console.log(
                JSON.stringify(
                    result.finalOutput,
                    null,
                    2
                )
            );


            await writeFile(
                path.join(runDir, 'result.json'),
                JSON.stringify(
                    result.finalOutput,
                    null,
                    2
                )
            );

            console.log(
                `Result saved to: ${runDir}`
            );



        } catch (error) {

            console.error(
                `Requirement failed: ${requirementFile}`
            );

            const errorResult = {
                status: 'FAIL' as const,
                scenario: requirementFile,
                evidence: [],
                failureType: 'EXECUTION_FAILURE' as const,
                failureReason:
                    error instanceof Error
                        ? error.message
                        : String(error),
            };

            testResult = errorResult;

            await writeFile(
                path.join(runDir, 'result.json'),
                JSON.stringify(errorResult, null, 2)
            );

        }
        finally {
            try {
                await playwrightMcpServer.close();

                console.log(
                    `MCP Server closed for: ${requirementFile}`
                );
            } catch (closeError) {
                console.error(
                    `Failed to close MCP Server for: ${requirementFile}`,
                    closeError
                );
            }
        }

        if (testResult?.status === 'PASS') {
            summary.passed++;
        } else {
            summary.failed++;

            if (testResult?.failureType === 'ASSERTION_FAILURE') {
                summary.assertionFailures++;
            }

            if (testResult?.failureType === 'EXECUTION_FAILURE') {
                summary.executionFailures++;
            }
        }

    }

    const summaryPath = path.join(
        batchDir,
        'summary.json'
    );

    await writeFile(
        summaryPath,
        JSON.stringify(summary, null, 2)
    );

    console.log(
        `Batch summary saved to: ${summaryPath}`
    );

    console.log('\n=== MCP Test Summary ===');

    console.log(
        JSON.stringify(
            summary,
            null,
            2
        )
    );

}

main().catch(console.error);