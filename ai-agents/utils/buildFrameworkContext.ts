import { readFile, readdir } from 'fs/promises';
import 'dotenv/config';
import { Agent, run } from '@openai/agents';
import { z } from 'zod';
import path from 'path';

/**
 * Builds the framework context used by the QA Test Generator Agent.
 *
 * Responsibilities:
 * - Scans the existing Playwright framework (pages, fixtures, and test-data).
 * - Uses the Framework Context Selector Agent to identify only the files
 *   relevant to the current test plan.
 * - Validates the AI-selected files against the actual framework inventory.
 * - Reads the selected framework files and provides their contents to the
 *   Generator Agent so it can reuse existing Page Objects, fixtures, and data.
 * - Calculates deterministic relative import paths from the generated test
 *   location to the selected fixture and test-data files.
 *
 * Design principle:
 * AI decides which framework files are relevant.
 * Deterministic Node.js code validates files, resolves paths, and reads content.
 *
 * This prevents the Generator Agent from scanning the entire framework,
 * inventing framework APIs, or guessing local import paths.
 */


const FrameworkSelectionSchema = z.object({
    pages: z.array(z.string()),
    fixtures: z.array(z.string()),
    testData: z.array(z.string()),
});

const frameworkSelectorAgent = new Agent({
    name: 'Framework Context Selector',

    instructions: `
        You are a QA automation framework context selector.

        Given a test plan and an inventory of available framework files,
        select only the files that are relevant for generating the tests.

        Rules:
        - Select only files that exist in the provided inventory.
        - Do not invent file names.
        - Select only files relevant to the test plan.
        - Include Page Objects needed for the test flow.
        - Include fixtures needed to access those Page Objects.
        - Include test data files when the test requires that data.
        - Do not generate test code.
    `,

    outputType: FrameworkSelectionSchema,
});

function getImportPath(
    fromDir: string,
    targetFile: string
): string {
    let importPath = path
        .relative(fromDir, targetFile)
        .replace(/\\/g, '/')
        .replace(/\.ts$/, '');

    if (!importPath.startsWith('.')) {
        importPath = `./${importPath}`;
    }

    return importPath;
}

async function readSelectedFiles(
    directory: string,
    files: string[]
): Promise<string[]> {

    return Promise.all(
        files.map(async file => {
            const filePath = path.join(
                directory,
                file
            );

            const content = await readFile(
                filePath,
                'utf-8'
            );

            return `
FILE: ${filePath}
${content}
`;
        })
    );
}

export async function buildFrameworkContext(
    testPlan: string,
    testSpecDir: string
): Promise<string> {

    const pageFiles = await readdir('pages');
    const fixtureFiles = await readdir('fixtures');
    const testDataFiles = await readdir('test-data');

    const frameworkInventory = `
        PAGES:
        ${pageFiles.join('\n')}

        FIXTURES:
        ${fixtureFiles.join('\n')}

        TEST DATA:
        ${testDataFiles.join('\n')}
        `;

    const selectorInput = `
        TEST PLAN:

        ${testPlan}

        AVAILABLE FRAMEWORK FILES:

        ${frameworkInventory}
        `;

    const selectionResult = await run(
        frameworkSelectorAgent,
        selectorInput
    );

    if (!selectionResult.finalOutput) {
        throw new Error(
            'Framework Selector did not return a final output.'
        );
    }

    const selectedFiles = selectionResult.finalOutput;

    console.log(
        'Selected framework files:',
        selectedFiles
    );

    const validPages = selectedFiles.pages.filter(
        file => pageFiles.includes(file)
    );

    const validFixtures = selectedFiles.fixtures.filter(
        file => fixtureFiles.includes(file)
    );

    const validTestData = selectedFiles.testData.filter(
        file => testDataFiles.includes(file)
    );

    const fixtureImportPaths = validFixtures.map(
        file => ({
            file,
            importPath: getImportPath(
                testSpecDir,
                path.join('fixtures', file)
            ),
        })
    );

    const testDataImportPaths = validTestData.map(
        file => ({
            file,
            importPath: getImportPath(
                testSpecDir,
                path.join('test-data', file)
            ),
        })
    );

    const availableImportPaths = [
        ...fixtureImportPaths,
        ...testDataImportPaths,
    ]
        .map(
            item =>
                `FILE: ${item.file}
IMPORT PATH: ${item.importPath}`
        )
        .join('\n\n');

    const pageContents = await readSelectedFiles(
        'pages',
        validPages
    );

    const fixtureContents = await readSelectedFiles(
        'fixtures',
        validFixtures
    );

    const testDataContents = await readSelectedFiles(
        'test-data',
        validTestData
    );

    const frameworkContext = `
    AVAILABLE IMPORT PATHS:
    ${availableImportPaths}

    PAGES:
    ${pageContents.join('\n')}

    FIXTURES:
    ${fixtureContents.join('\n')}

    TEST DATA:
    ${testDataContents.join('\n')}
`;

    return frameworkContext;

}

