'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { FileText, PlusCircle, Search, Trash2, Calendar as CalendarIcon, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    try {
      const response = await fetch('/api/plans')
      if (!response.ok) throw new Error('Failed to fetch plans')
      const data = await response.json()
      setPlans(data)
    } catch (error) {
      toast.error('Could not load your study plans')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/plans/${deleteId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      setPlans(plans.filter(p => p.id !== deleteId))
      toast.success('Plan deleted')
    } catch (error) {
      toast.error('Could not delete plan')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const filteredPlans = plans.filter(plan => 
    plan.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.topics.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Study Plans</h1>
          <p className="text-muted-foreground">
            Manage your generated exam preparation roadmaps.
          </p>
        </div>
        <Link href="/generate">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Plan
          </Button>
        </Link>
      </div>

      <div className="flex items-center max-w-sm relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by subject or topic..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-semibold">No plans found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {searchQuery 
              ? "We couldn't find any plans matching your search." 
              : "You haven't generated any study plans yet. Create one to get started."}
          </p>
          {!searchQuery && (
            <Link href="/generate">
              <Button>Generate Plan</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlans.map(plan => (
            <Card key={plan.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-1" title={plan.subject}>{plan.subject}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Exam: {format(new Date(plan.exam_date), 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {plan.topics}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-md">
                    {plan.generated_plan?.dailySchedule?.length || 0} Days
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t flex justify-between gap-2">
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => setDeleteId(plan.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
                <Link href={`/plans/${plan.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    View Details
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your study plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
