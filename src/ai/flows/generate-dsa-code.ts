// src/ai/flows/generate-dsa-code.ts
'use server';

/**
 * @fileOverview Generates DSA code based on a problem description, constraints, and examples.
 *
 * - generateDSACode - A function that generates DSA code.
 * - GenerateDSACodeInput - The input type for the generateDSACode function.
 * - GenerateDSACodeOutput - The return type for the generateDSACode function.
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
});
export type GenerateDSACodeInput = z.infer<typeof GenerateDSACodeInputSchema>;

const GenerateDSACodeOutputSchema = z.object({
  code: z.string().describe('The generated code for the DSA problem.'),
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
1.  **Analyze the Request**: Thoroughly understand the problem description, constraints, and examples.
2.  **Choose the Right Approach**: Select the most appropriate data structures and algorithms to solve the problem efficiently, keeping the constraints in mind.
3.  **Think Step-by-Step**: Before writing any code, outline the logic for your solution.
4.  **Generate the Code**: Write clean, readable, and well-structured code in the specified language. The solution must be self-contained in a single code block.
5.  **Verify the Solution**: Mentally trace the provided examples through your code to ensure it produces the correct output. Your solution MUST work for the given examples and edge cases based on the constraints.

**Problem Details:**

*   **Problem Description**: {{{problemDescription}}}
*   **Constraints**: {{{constraints}}}
*   **Examples**: {{{exampleInputsOutputs}}}
*   **Programming Language**: {{{language}}}

**Instructions for Output:**
*   Provide only the final, complete, and runnable code block.
*   Do not include any explanations, comments, or test cases outside of the main solution.
*   The code should be a single, self-contained block starting with the language identifier (e.g., \`\`\`python).

Here is the code:
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
