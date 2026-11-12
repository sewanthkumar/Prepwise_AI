import Link from 'next/link'
import { PlusCircle, BookOpen, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null // Layout will handle redirect
  }

  // Fetch plans
  const { data: plans, error } = await supabase
    .from('study_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalPlans = plans?.length || 0
  
  // Calculate upcoming exams
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingExams = plans?.filter(plan => new Date(plan.exam_date) >= today)
    .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()) || []
  
  const nextExam = upcomingExams.length > 0 ? upcomingExams[0] : null
  const recentPlans = plans?.slice(0, 5) || []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here is an overview of your study plans.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlans}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Exam</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextExam ? format(new Date(nextExam.exam_date), 'MMM d, yyyy') : 'None'}
            </div>
            {nextExam && (
              <p className="text-xs text-muted-foreground mt-1">
                {nextExam.subject}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>Recent Plans</CardTitle>
            <CardDescription>
              Your most recently generated study plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-semibold">No plans yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first study plan to get started.
                </p>
                <Link href="/generate">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Plan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {recentPlans.map(plan => (
                  <div key={plan.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{plan.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        Exam: {format(new Date(plan.exam_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Link href={`/plans/${plan.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-4 lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/generate" className="w-full">
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Generate New Plan
              </Button>
            </Link>
            <Link href="/plans" className="w-full">
              <Button variant="outline" className="w-full">
                View All Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
