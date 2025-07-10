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
  prompt: `You are an expert software engineer specializing in data structures and algorithms.

  You will generate code that solves the following problem, taking into account the constraints and example inputs/outputs. The solution must work for hidden test cases.

  Problem Description: {{{problemDescription}}}
  Constraints: {{{constraints}}}
  Example Inputs/Outputs: {{{exampleInputsOutputs}}}

  Programming Language: {{{language}}}

  Ensure the generated code is efficient, well-documented, and follows best practices.
  The code should be fully functional and directly runnable.
  Do not include any explanation, comments, or test code outside of the required code block.
  In the generated response include only the code block. Start the code block with the language name.

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
