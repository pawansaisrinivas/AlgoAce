'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bot, Loader2 } from 'lucide-react'

import { Header } from '@/components/header'
import { CodeDisplay } from '@/components/code-display'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { generateCodeAction } from '@/lib/actions'

const formSchema = z.object({
  problemDescription: z
    .string()
    .min(50, 'Please provide a detailed problem description (min 50 characters).'),
  constraints: z.string().optional(),
  exampleInputsOutputs: z.string().optional(),
  language: z.string({ required_error: 'Please select a language.' }),
})

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problemDescription: '',
      constraints: '',
      exampleInputsOutputs: '',
      language: 'python',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setGeneratedCode('')
    const result = await generateCodeAction(values)
    setIsLoading(false)

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      })
    } else if (result.data) {
      const cleanedCode = result.data.code.replace(/^```(?:\w+)?\n/, '').replace(/```$/, '')
      setGeneratedCode(cleanedCode)
      toast({
        title: 'Success!',
        description: 'Your code has been generated.',
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50 dark:bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-xl font-headline">
                Problem Definition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="problemDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Problem Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Given an array of integers, return indices of the two numbers such that they add up to a specific target."
                            {...field}
                            rows={6}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="constraints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Constraints (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 2 <= nums.length <= 10^4"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="exampleInputsOutputs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Examples (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Input: nums = [2,7,11,15], target = 9 Output: [0,1]"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full text-lg py-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Bot className="mr-2 h-5 w-5" />
                    )}
                    Generate Code
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <CodeDisplay
            code={generatedCode}
            language={form.watch('language')}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  )
}
