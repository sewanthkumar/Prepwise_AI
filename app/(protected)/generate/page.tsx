'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Save, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  subject: z.string().min(2, {
    message: 'Subject must be at least 2 characters.',
  }),
  topics: z.string().min(10, {
    message: 'Please provide more details about the topics.',
  }),
  examDate: z.date({
    message: 'An exam date is required.',
  }),
})

export default function GeneratePlanPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      topics: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)
    setGeneratedPlan(null)
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: values.subject,
          topics: values.topics,
          examDate: values.examDate.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate plan')
      }

      setGeneratedPlan(data.plan)
      toast.success('Study plan generated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSavePlan() {
    if (!generatedPlan) return

    setIsSaving(true)
    try {
      const values = form.getValues()
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: values.subject,
          topics: values.topics,
          examDate: values.examDate.toISOString(),
          generatedPlan,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save plan')
      }

      toast.success('Study plan saved!')
      router.push(`/plans/${data.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save plan')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Study Plan</h1>
          <p className="text-muted-foreground">
            Enter your subject details and exam date to let AI create a personalized schedule.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible for better results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject / Course Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Data Structures and Algorithms" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="topics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Syllabus Topics</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List the topics you need to cover..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        You can paste your entire syllabus here.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="examDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Exam Date</FormLabel>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger
                          className={cn(
                            "w-[240px] inline-flex items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date)
                              setCalendarOpen(false)
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {generatedPlan ? (
          <Card className="h-full flex flex-col border-primary/50 shadow-lg shadow-primary/5">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-xl">Your AI Study Plan</CardTitle>
              <CardDescription>
                Review your generated plan below. Don't forget to save it!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-6 space-y-6 max-h-[600px]">
              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Exam Strategy</h3>
                <p className="text-sm text-muted-foreground">{generatedPlan.examStrategy}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Topic Priority</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {generatedPlan.topicPriority?.map((topic: string, i: number) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Daily Schedule</h3>
                <div className="space-y-4">
                  {generatedPlan.dailySchedule?.map((day: any, i: number) => (
                    <div key={i} className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Day {day.day} - {day.date}</span>
                        <span className="text-xs font-semibold px-2 py-1 bg-background rounded-full border">
                          {day.type.toUpperCase()} • {day.hours}h
                        </span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {day.topics?.map((topic: string, j: number) => (
                          <li key={j}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-4 bg-muted/20">
              <Button onClick={handleSavePlan} className="w-full" size="lg" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save This Plan
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="h-full flex flex-col items-center justify-center min-h-[400px] border-dashed text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-4 opacity-20" />
            <p>Fill out the form and click Generate</p>
            <p className="text-sm">Your AI study plan will appear here</p>
          </Card>
        )}
      </div>
    </div>
  )
}
