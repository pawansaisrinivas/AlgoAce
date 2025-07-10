'use server'

import { z } from 'zod'
import { generateDSACode } from '@/ai/flows/generate-dsa-code'

const formSchema = z.object({
  problemDescription: z.string().min(1, 'Problem description is required.'),
  constraints: z.string().optional(),
  exampleInputsOutputs: z.string().optional(),
  language: z.string(),
})

export async function generateCodeAction(values: z.infer<typeof formSchema>) {
  const validatedFields = formSchema.safeParse(values)

  if (!validatedFields.success) {
    return { data: null, error: 'Invalid input.' }
  }

  try {
    const result = await generateDSACode({
      problemDescription: validatedFields.data.problemDescription,
      constraints: validatedFields.data.constraints || '',
      exampleInputsOutputs: validatedFields.data.exampleInputsOutputs || '',
      language: validatedFields.data.language,
    })
    return { data: result, error: null }
  } catch (error) {
    console.error('AI Code Generation Error:', error)
    return { data: null, error: 'Failed to generate code. The AI model may be temporarily unavailable. Please try again later.' }
  }
}
