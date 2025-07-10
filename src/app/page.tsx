'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bot, Loader2, UploadCloud, X } from 'lucide-react'
import Image from 'next/image'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
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
import { Input } from '@/components/ui/input'
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
    .min(10, 'Please provide a detailed problem description (min 10 characters).'),
  constraints: z.string().optional(),
  exampleInputsOutputs: z.string().optional(),
  language: z.string({ required_error: 'Please select a language.' }),
  photoDataUri: z.string().optional(),
})

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload an image smaller than 4MB.',
        })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUri = reader.result as string
        setImagePreview(dataUri)
        form.setValue('photoDataUri', dataUri)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    form.setValue('photoDataUri', undefined)
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if(fileInput) fileInput.value = ''
  }

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
    <div className="flex flex-col min-h-screen bg-background dark:bg-zinc-950">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-2 lg:gap-8 items-start">
          <Card className="lg:sticky lg:top-24 mb-8 lg:mb-0">
            <CardHeader>
              <CardTitle className="text-2xl font-headline tracking-tight">
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
                    name="photoDataUri"
                    render={() => (
                      <FormItem>
                        <FormLabel>Problem Image (Optional)</FormLabel>
                        <FormControl>
                          {imagePreview ? (
                            <div className="relative">
                              <Image
                                src={imagePreview}
                                alt="Problem preview"
                                width={500}
                                height={300}
                                className="w-full h-auto max-h-[300px] object-contain rounded-md border bg-muted"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7"
                                onClick={removeImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-1 text-sm text-muted-foreground">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 4MB)</p>
                              </div>
                              <Input
                                id="image-upload"
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif"
                                onChange={handleImageChange}
                              />
                            </label>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            <SelectItem value="javascript">JavaScript</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full text-base py-6"
                    size="lg"
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
      <Footer />
    </div>
  )
}
