import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Calendar as CalendarIcon, BookOpen, Clock, BrainCircuit, CheckCircle2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: plan, error } = await supabase
    .from('study_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !plan) {
    notFound()
  }

  const generatedPlan = plan.generated_plan

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-10">
      <div className="flex items-center gap-4">
        <Link href="/plans">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{plan.subject}</h1>
          <div className="flex items-center text-muted-foreground mt-1 text-sm">
            <CalendarIcon className="mr-1 h-4 w-4" />
            Exam Date: {format(new Date(plan.exam_date), 'MMMM d, yyyy')}
            <span className="mx-2">•</span>
            <span>Generated on {format(new Date(plan.created_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Exam Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                {generatedPlan.examStrategy}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Daily Schedule
              </CardTitle>
              <CardDescription>Your day-by-day roadmap to the exam</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-0">
              <div className="space-y-0">
                {generatedPlan.dailySchedule?.map((day: any, i: number) => (
                  <div key={i} className="flex gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-start w-16 shrink-0">
                      <div className="bg-primary text-primary-foreground font-bold rounded-full w-10 h-10 flex items-center justify-center">
                        {day.day}
                      </div>
                      <span className="text-xs text-muted-foreground mt-2 text-center leading-tight">
                        {day.date}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={day.type === 'revision' ? 'secondary' : day.type === 'practice' ? 'default' : 'outline'}>
                          {day.type.toUpperCase()}
                        </Badge>
                        <span className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {day.hours}h
                        </span>
                      </div>
                      <ul className="space-y-2 mt-3">
                        {day.topics?.map((topic: string, j: number) => (
                          <li key={j} className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground/50" />
                            <span className="text-sm">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Topic Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {generatedPlan.topicPriority?.map((topic: string, i: number) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-tight pt-1 text-muted-foreground">{topic}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Syllabus Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {plan.topics}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
