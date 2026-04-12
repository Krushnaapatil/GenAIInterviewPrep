const Groq = require("groq-sdk")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ------------------ SCHEMA ------------------

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate matches the job"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("Technical question that can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover")
    })).describe("Technical questions for the interview"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("Behavioral question that can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover")
    })).describe("Behavioral questions for the interview"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("Skill the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("How critical this skill gap is")
    })).describe("Skill gaps in the candidate profile"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("Day number starting from 1"),
        focus: z.string().describe("Main focus topic for this day"),
        tasks: z.array(z.string()).describe("List of tasks for this day")
    })).describe("Day-wise preparation plan"),
    title: z.string().describe("Job title for which the interview report is generated"),
})

// ------------------ HELPER ------------------

async function generateWithGroq(prompt, schema) {
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are an expert interview coach. Always respond with valid JSON only, matching this exact schema: ${JSON.stringify(zodToJsonSchema(schema))}. Do not include any explanation or markdown, just raw JSON.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 8192
        })

        const text = response.choices[0].message.content
        return JSON.parse(text)

    } catch (err) {
        console.error("Groq error:", err.message)
        throw new Error("AI service failed. Please try again.")
    }
}

// ------------------ INTERVIEW REPORT ------------------

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a detailed interview report for the following candidate.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return a JSON object with EXACTLY these field names and quantities:
{
  "matchScore": <number 0-100>,
  "title": <job title string>,
  "technicalQuestions": [   <-- EXACTLY 5 items, no more no less
    {
      "question": <string>,
      "intention": <string>,
      "answer": <string>
    }
  ],
  "behavioralQuestions": [  <-- EXACTLY 5 items, no more no less
    {
      "question": <string>,
      "intention": <string>,
      "answer": <string>
    }
  ],
  "skillGaps": [
    {
      "skill": <string>,
      "severity": <"low"|"medium"|"high">
    }
  ],
  "preparationPlan": [      <-- EXACTLY 7 items, one per day
    {
      "day": <number 1-7>,
      "focus": <string>,
      "tasks": [<string>, <string>]
    }
  ]
}

IMPORTANT:
- technicalQuestions must have EXACTLY 5 objects
- behavioralQuestions must have EXACTLY 5 objects
- preparationPlan must have EXACTLY 7 objects, one for each day from day 1 to day 7
- every field name must match exactly as shown above`

    return await generateWithGroq(prompt, interviewReportSchema)
}

// ------------------ PDF ------------------

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })
    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" }
    })
    await browser.close()
    return pdfBuffer
}

// ------------------ RESUME PDF ------------------

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("Full HTML content of the resume, ready to convert to PDF")
    })

    const prompt = `Generate a professional, ATS-friendly resume in HTML for this candidate:

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Requirements:
- Tailor the resume for the job description
- Simple, professional design with clean formatting
- Use inline CSS only
- Should be 1-2 pages when printed as PDF
- Do not sound AI-generated
- Return JSON with a single "html" field
`
    const result = await generateWithGroq(prompt, resumePdfSchema)
    return await generatePdfFromHtml(result.html)
}

module.exports = { generateInterviewReport, generateResumePdf }