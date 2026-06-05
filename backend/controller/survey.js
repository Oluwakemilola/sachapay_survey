// ─────────────────────────────────────────────
// SachaPay — Survey Controller
// File: backend/src/controllers/survey.controller.js
// ─────────────────────────────────────────────
import SurveyResponse from "../model/surveyresponse.js";
// ── Submit survey response ────────────────────
// POST /api/survey/submit
// Public — no auth required
export const submitSurvey = async (req, res) => {
  try {
    const {
      orgType,
      teamSize,
      paymentMethod,
      delayExperience,
      willingToPay,
      wantsWaitlist,
      name,
      phone,
      email,
      source,
    } = req.body;

    // Get IP address
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      null;

    const response = await SurveyResponse.create({
      orgType,
      teamSize,
      paymentMethod,
      delayExperience,
      willingToPay,
      wantsWaitlist: wantsWaitlist === true || wantsWaitlist === "yes",
      name:  wantsWaitlist ? name  : null,
      phone: wantsWaitlist ? phone : null,
      email: wantsWaitlist ? email : null,
      source: source || "landing-page",
      ipAddress,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you. Your response has been recorded.",
      id: response._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get all survey responses ──────────────────
// GET /api/survey/responses
// Admin only — requires auth
export const getSurveyResponses = async (req, res) => {
  try {
    const responses = await SurveyResponse.find()
      .sort({ createdAt: -1 });

    // Summary stats
    const total = responses.length;
    const waitlistCount = responses.filter(r => r.wantsWaitlist).length;

    // Willingness to pay breakdown
    const payBreakdown = responses.reduce((acc, r) => {
      const key = r.willingToPay || "no-answer";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Org type breakdown
    const orgBreakdown = responses.reduce((acc, r) => {
      const key = r.orgType || "no-answer";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Delay experience breakdown
    const delayBreakdown = responses.reduce((acc, r) => {
      const key = r.delayExperience || "no-answer";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      success: true,
      summary: {
        total,
        waitlistCount,
        payBreakdown,
        orgBreakdown,
        delayBreakdown,
      },
      responses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get waitlist only ─────────────────────────
// GET /api/survey/waitlist
// Admin only
export const getWaitlist = async (req, res) => {
  try {
    const waitlist = await SurveyResponse.find({ wantsWaitlist: true })
      .select("name phone email orgType teamSize createdAt")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: waitlist.length,
      waitlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Export waitlist as CSV ────────────────────
// GET /api/survey/waitlist/export
// Admin only
export const exportWaitlist = async (req, res) => {
  try {
    const waitlist = await SurveyResponse.find({ wantsWaitlist: true })
      .select("name phone email orgType teamSize createdAt")
      .sort({ createdAt: -1 });

    const headers = ["Name", "Phone", "Email", "Org Type", "Team Size", "Date"];
    const rows = waitlist.map(w => [
      w.name || "",
      w.phone || "",
      w.email || "",
      w.orgType || "",
      w.teamSize || "",
      new Date(w.createdAt).toLocaleDateString("en-NG"),
    ]);

    const csv = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=sachapay_waitlist.csv");
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};