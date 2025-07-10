// components/code-display.tsx
'use client'

import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CodeDisplayProps {
  code: string
  language: string
  isLoading: boolean
}

export function CodeDisplay({ code, language, isLoading }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-headline">Generated Code</CardTitle>
        {isClient && code && !isLoading && (
          <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy code">
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="relative h-full p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-4/5 rounded-sm" />
                <Skeleton className="h-5 w-full rounded-sm" />
                <Skeleton className="h-5 w-3/4 rounded-sm" />
                <Skeleton className="h-5 w-4/6 rounded-sm" />
                <Skeleton className="h-5 w-5/6 rounded-sm" />
              </div>
            ) : code ? (
              <pre className="text-sm overflow-auto md:text-base"> {/* MODIFIED LINE: Added overflow-auto and responsive text sizes */}
                <code className={`language-${language} font-code`}>{code}</code>
              </pre>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <p>Your generated code will appear here.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
