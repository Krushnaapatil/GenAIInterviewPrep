const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume pdf and job description.
 */

async function generateInterViewReportController(req, res) {
  if (!req.file) {
    return res.status(400).json({
      message: "Resume PDF is required.",
    });
  }

  // ✅ only change in the entire file
  const resumeContent = await pdfParse(req.file.buffer);

  const { selfDescription, jobDescription, title, jobTitle } = req.body;

  const interViewReportByAi = await generateInterviewReport({
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
  });

  const resolvedTitle = title || jobTitle || interViewReportByAi.title;

  if (!resolvedTitle) {
    return res.status(400).json({
      message:
        "Job title is required. Send `title` in the request body or ensure the AI response includes it.",
    });
  }

  const interviewReport = await interviewReportModel.create({
    user: req.user.id,
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
    ...interViewReportByAi,
    title: resolvedTitle,
  });

  res.status(201).json({
    message: "Interview report generated successfully.",
    interviewReport,
  });
}

/**
 * @description Controller to get interview report by interviewId. Only the owner of the report can access it.
 */
async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;
  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });
  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report not found." });
  }
  res
    .status(200)
    .json({
      message: "Interview report fetched successfully.",
      interviewReport,
    });
}

/**
 * @description Controller to get all interview reports of logged in user. Only the owner of the reports can access them.
 */
async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );
  res
    .status(200)
    .json({
      message: "Interview reports fetched successfully.",
      interviewReports,
    });
}

async function generateResumePdfController(req, res) {
  const { interviewReportId } = req.params;
  const interviewReport =
    await interviewReportModel.findById(interviewReportId);
  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report not found." });
  }
  const { resume, jobDescription, selfDescription } = interviewReport;
  const pdfBuffer = await generateResumePdf({
    resume,
    jobDescription,
    selfDescription,
  });
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });
  res.send(pdfBuffer);
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
