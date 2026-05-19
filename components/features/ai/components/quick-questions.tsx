"use client"

import { Button } from "@/components/ui/button"

interface QuickQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
  isLoading: boolean
}

export function QuickQuestions({ questions, onQuestionClick, isLoading }: QuickQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 flex-shrink-0">
      {questions.map((question, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onQuestionClick(question)}
          disabled={isLoading}
          className="text-xs bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/40 transition-colors duration-200 rounded-full py-1 px-3 shadow-none h-auto font-normal"
        >
          {question}
        </Button>
      ))}
    </div>
  )
}