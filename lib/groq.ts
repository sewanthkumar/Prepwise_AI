import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const PROMPT_TEMPLATE = `Generate a detailed study plan.

Subject:
{subject}

Topics:
{topics}

Exam Date:
{examDate}

Instructions:
1. Create a daily study schedule.
2. Prioritize difficult concepts.
3. Include revision sessions.
4. Include practice sessions.
5. Add final revision days.
6. Estimate daily study hours.
7. Suggest exam strategy.
8. Recommend topic priority.

Output Structure:
Return ONLY a valid JSON object matching this structure. Do not wrap it in markdown block quotes.
{
  "examStrategy": "string",
  "topicPriority": ["string"],
  "dailySchedule": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "topics": ["string"],
      "hours": number,
      "type": "study" | "revision" | "practice"
    }
  ]
}`

export async function generateStudyPlan(subject: string, topics: string, examDate: string) {
  const prompt = PROMPT_TEMPLATE
    .replace('{subject}', subject)
    .replace('{topics}', topics)
    .replace('{examDate}', examDate)

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert academic advisor and study planner. You respond only with valid JSON as requested.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    response_format: { type: 'json_object' }
  })

  const content = chatCompletion.choices[0]?.message?.content

  if (!content) {
    throw new Error('Failed to generate study plan')
  }

  return JSON.parse(content)
}
