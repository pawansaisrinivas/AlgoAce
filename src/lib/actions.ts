'use server'

import { z } from 'zod'
import { generateDSACode, regenerateDSACode } from '@/ai/flows/generate-dsa-code'

const formSchema = z.object({
  problemDescription: z.string(),
  constraints: z.string().optional(),
  exampleInputsOutputs: z.string().optional(),
  language: z.string(),
  photoDataUri: z.string().optional(),
})

export async function generateCodeAction(values: z.infer<typeof formSchema>) {
  const validatedFields = formSchema.safeParse(values)

  if (!validatedFields.success) {
    return { data: null, error: 'Invalid input.' }
  }
  
  if (!validatedFields.data.problemDescription && !validatedFields.data.photoDataUri) {
    return { data: null, error: 'Please provide a problem description or an image.' };
  }

  try {
    const result = await generateDSACode({
      problemDescription: validatedFields.data.problemDescription,
      constraints: validatedFields.data.constraints || '',
      exampleInputsOutputs: validatedFields.data.exampleInputsOutputs || '',
      language: validatedFields.data.language,
      photoDataUri: validatedFields.data.photoDataUri,
    })
    return { data: result, error: null }
  } catch (error) {
    console.error('AI Code Generation Error:', error)
    return { data: null, error: 'Failed to generate code. The AI model may be temporarily unavailable. Please try again later.' }
  }
}

const regenerationSchema = formSchema.extend({
    previousCode: z.string().min(1, 'Code to debug is required.'),
    errorReport: z.string().min(1, 'Error report is required.'),
});


export async function regenerateCodeAction(values: z.infer<typeof regenerationSchema>) {
    const validatedFields = regenerationSchema.safeParse(values);

    if (!validatedFields.success) {
        let errorMessage = 'Invalid input for debugging.';
        if (validatedFields.error.errors[0]?.path[0] === 'previousCode') {
            errorMessage = 'Please provide the code you want to debug.'
        } else if (validatedFields.error.errors[0]?.path[0] === 'errorReport') {
            errorMessage = 'Please describe the error or issue with the code.'
        }
        return { data: null, error: errorMessage };
    }

    try {
        const result = await regenerateDSACode({
            problemDescription: validatedFields.data.problemDescription || 'The user did not provide a detailed problem description. Focus on debugging the provided code based on the error report.',
            constraints: validatedFields.data.constraints || '',
            exampleInputsOutputs: validatedFields.data.exampleInputsOutputs || '',
            language: validatedFields.data.language,
            photoDataUri: validatedFields.data.photoDataUri,
            previousCode: validatedFields.data.previousCode,
            errorReport: validatedFields.data.errorReport,
        });
        return { data: result, error: null };
    } catch (error) {
        console.error('AI Code Regeneration Error:', error);
        return { data: null, error: 'Failed to regenerate code. The AI model may be temporarily unavailable. Please try again later.' };
    }
}
