import { NextResponse } from 'next/server'
import { generateStudyPlan } from '@/lib/groq'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, topics, examDate } = body

    if (!subject || !topics || !examDate) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const plan = await generateStudyPlan(subject, topics, examDate)

    return NextResponse.json({ success: true, plan })
  } catch (error: any) {
    console.error('Error generating plan:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
