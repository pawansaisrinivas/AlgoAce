// src/ai/flows/generate-dsa-code.ts
'use server';

/**
 * @fileOverview Generates and regenerates DSA code based on a problem description, constraints, and examples.
 *
 * - generateDSACode - A function that generates DSA code for the initial problem.
 * - regenerateDSACode - A function that fixes issues in previously generated code.
 * - GenerateDSACodeInput - The input type for the generateDSACode function.
 * - GenerateDSACodeOutput - The return type for the generateDSACode function.
 * - RegenerateDSACodeInput - The input type for the regenerateDSACode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDSACodeInputSchema = z.object({
  problemDescription: z.string().describe('The description of the DSA problem.'),
  constraints: z.string().describe('The constraints for the DSA problem.'),
  exampleInputsOutputs: z
    .string()
    .describe('Example inputs and outputs for the DSA problem.'),
  language: z.string().default('python').describe('The programming language for the code.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateDSACodeInput = z.infer<typeof GenerateDSACodeInputSchema>;

const GenerateDSACodeOutputSchema = z.object({
  code: z.string().describe('The generated code for the DSA problem.'),
  explanation: z.string().describe(
    'An explanation of why the code is correct, including a step-by-step analysis of how it passes the provided examples.'
  ),
});
export type GenerateDSACodeOutput = z.infer<typeof GenerateDSACodeOutputSchema>;

export async function generateDSACode(input: GenerateDSACodeInput): Promise<GenerateDSACodeOutput> {
  return generateDSACodeFlow(input);
}

const generateDSACodePrompt = ai.definePrompt({
  name: 'generateDSACodePrompt',
  input: {schema: GenerateDSACodeInputSchema},
  output: {schema: GenerateDSACodeOutputSchema},
  prompt: `You are an expert competitive programmer and software engineer specializing in data structures and algorithms. Your task is to generate a correct and efficient solution for the given problem.

Follow these steps carefully:
1.  **Analyze the Request**: Thoroughly understand the problem description, constraints, and examples from BOTH the text and the image if provided. The image is the primary source if there's a conflict.
2.  **Choose the Right Approach**: Select the most appropriate data structures and algorithms to solve the problem efficiently, keeping the constraints in mind.
3.  **Think Step-by-Step**: Before writing any code, outline the logic for your solution.
4.  **Generate the Code**: Write clean, readable, and well-structured code in the specified language. The solution must be self-contained in a single code block and use only standard libraries.
5.  **Verify and Explain**:
    *   Mentally trace the provided examples through your code to ensure it produces the correct output. Your solution MUST work for the given examples and edge cases based on the constraints.
    *   Provide a clear explanation of your approach and why it's correct.
    *   **Crucially, in your explanation, provide a section that explicitly confirms that your code passes the user-provided examples. If no examples are given, state that.**

**Problem Details:**

*   **Problem Description**: {{{problemDescription}}}
*   **Constraints**: {{{constraints}}}
*   **Examples**: {{{exampleInputsOutputs}}}
*   **Programming Language**: {{{language}}}
{{#if photoDataUri}}
*   **Problem Image**:
    {{media url=photoDataUri}}
{{/if}}

**Instructions for Output:**
*   Provide the final, complete, and runnable code block.
*   Provide a concise explanation of the code's logic and how it passes the provided examples. The explanation should be detailed enough to show your thought process on verification.
*   The code should be a single, self-contained block starting with the language identifier (e.g., \`\`\`python).

Here is the response:
  `,
});

const generateDSACodeFlow = ai.defineFlow(
  {
    name: 'generateDSACodeFlow',
    inputSchema: GenerateDSACodeInputSchema,
    outputSchema: GenerateDSACodeOutputSchema,
  },
  async input => {
    const {output} = await generateDSACodePrompt(input);
    return output!;
  }
);


// Regeneration Flow
const RegenerateDSACodeInputSchema = GenerateDSACodeInputSchema.extend({
    previousCode: z.string().describe('The previously generated or user-provided code that is incorrect.'),
    errorReport: z.string().describe('The user-reported error or issue with the code.'),
});
export type RegenerateDSACodeInput = z.infer<typeof RegenerateDSACodeInputSchema>;


export async function regenerateDSACode(input: RegenerateDSACodeInput): Promise<GenerateDSACodeOutput> {
    return regenerateDSACodeFlow(input);
}

const regenerateDSACodePrompt = ai.definePrompt({
    name: 'regenerateDSACodePrompt',
    input: {schema: RegenerateDSACodeInputSchema},
    output: {schema: GenerateDSACodeOutputSchema},
    prompt: `You are an expert competitive programmer acting as a code reviewer and debugger. A user has provided code that is incorrect. Your task is to analyze the original problem context (if available), the faulty code, and the user's feedback to provide a corrected, perfect solution.

**Original Problem Context (Use this to understand the goal):**
*   **Problem Description**: {{{problemDescription}}}
*   **Constraints**: {{{constraints}}}
*   **Examples**: {{{exampleInputsOutputs}}}
*   **Programming Language**: {{{language}}}
{{#if photoDataUri}}
*   **Problem Image**:
    {{media url=photoDataUri}}
{{/if}}

**User's Code for Debugging:**
*   **Incorrect Code**:
    \`\`\`{{{language}}}
    {{{previousCode}}}
    \`\`\`
*   **User-Reported Error**: {{{errorReport}}}

**Your Task:**
1.  **Analyze the Error**: Understand why the \`Incorrect Code\` fails based on the \`User-Reported Error\` and your own analysis of the code against the problem context.
2.  **Develop a Fix**: Formulate a new, correct approach. Do not just make minor edits; rewrite the code cleanly if necessary to ensure correctness and adherence to DSA principles.
3.  **Generate Corrected Code**: Write a new, clean, and fully functional version of the code that resolves the reported issue.
4.  **Verify and Explain**:
    *   Confirm that your new solution correctly handles the examples provided in the original problem.
    *   Write a clear explanation detailing what was wrong with the previous code and how your new code fixes the issue.
    *   **Crucially, in your explanation, provide a section that explicitly confirms that your corrected code now passes the user-provided examples.**

**Instructions for Output:**
*   Provide only the final, complete, and runnable corrected code block.
*   Provide a concise explanation of the fix and how it now works correctly with the examples. The explanation should be detailed enough to show your thought process on verification.
*   The code should be a single, self-contained block.

Here is the corrected response:
`
});

const regenerateDSACodeFlow = ai.defineFlow(
    {
        name: 'regenerateDSACodeFlow',
        inputSchema: RegenerateDSACodeInputSchema,
        outputSchema: GenerateDSACodeOutputSchema,
    },
    async input => {
        const {output} = await regenerateDSACodePrompt(input);
        return output!;
    }
);
