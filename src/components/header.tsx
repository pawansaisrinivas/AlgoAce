import { Bot, Github } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Bot className="h-7 w-7 mr-2 text-primary" />
          <span className="text-xl font-bold font-headline tracking-tight">AlgoAce</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <a href="https://github.com/pawansaisrinivas" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" aria-label="GitHub">
              <Github className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
