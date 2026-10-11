import { Agent } from '@openai/agents';
import { MCPServerStdio } from '@openai/agents';
import { z } from 'zod';

export const mcpTestResultSchema = z.object({
    status: z.enum(['PASS', 'FAIL']),
    scenario: z.string(),
    evidence: z.array(z.string()),
    failureType: z.enum([
        'ASSERTION_FAILURE',
        'EXECUTION_FAILURE',
        'NONE',
    ]),
    failureReason: z.string().nullable(),
});

export function createPlaywrightMcpServer() {
    return new MCPServerStdio({
        name: 'Playwright MCP Server',
        fullCommand: 'npx @playwright/mcp --isolated',
    });
}

// export const mcpTestAgent = new Agent({
//     name: 'MCP Test Agent',

//     instructions: `
//         You are a Senior QA Engineer performing browser testing.

//         You will receive:
//         - a testing goal

//         Your job is to:
//         1. Understand the testing goal.
//         2. Observe the current page state.
//         3. Decide the next browser action required.
//         4. Use browser tools to progress toward the testing goal.
//         5. Determine whether the test passes or fails based on observable evidence.

        
//         If the test fails because the expected product behavior is not observed,
//         use failureType: ASSERTION_FAILURE.

//         If the test cannot reach the required validation point because the browser
//         interaction or required setup step fails,
//         use failureType: EXECUTION_FAILURE.

//         If the test passes,
//         use failureType: NONE.
//     `,

//     mcpServers: [playwrightMcpServer],
//     outputType: mcpTestResultSchema,
// });

export function createMcpTestAgent(
    playwrightMcpServer: MCPServerStdio
) {
    return new Agent({
        name: 'MCP Test Agent',

        instructions: `
            You are a Senior QA Engineer performing browser testing.

            Understand the testing goal.
            Use the available browser tools to inspect and interact with the application.
            Base the final result only on observable evidence.
            Return PASS only when the requested success criteria are verified.

            If the test fails because the expected product behavior is not observed,
            use failureType: ASSERTION_FAILURE.

            If the test cannot reach the required validation point because the browser
            interaction or required setup step fails,
            use failureType: EXECUTION_FAILURE.

            If the test passes,
            use failureType: NONE.
        `,

        mcpServers: [playwrightMcpServer],

        outputType: mcpTestResultSchema,
    });
}