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
      name: wantsWaitlist ? name : null,
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
    const responses = await SurveyResponse.find().sort({ createdAt: -1 });

    // Summary stats
    const total = responses.length;
    const waitlistCount = responses.filter((r) => r.wantsWaitlist).length;

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
    const rows = waitlist.map((w) => [
      w.name || "",
      w.phone || "",
      w.email || "",
      w.orgType || "",
      w.teamSize || "",
      new Date(w.createdAt).toLocaleDateString("en-NG"),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sachapay_waitlist.csv",
    );
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitWaitlist = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
      return;
    }
    const waitlist = await SurveyResponse.findOne({ phone });
    if (waitlist) {
      res.status(400).json({
        success: false,
        message: "Phone number already exists on the waitlist",
      });
      return;
    }
    const response = await SurveyResponse.create({
      ...req.body,
      wantsWaitlist: true,
    });
    res.status(201).json({
      success: true,
      message: "Thank you. Your response has been recorded.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ─────────────────────────────────────────────
// GET /api/survey/export
// ─────────────────────────────────────────────

export const exportAllResponses = async (req, res) => {
  try {
    const responses = await SurveyResponse.find()
      .sort({ createdAt: -1 });

    // CSV Headers
    const headers = [
      "No",
      "Date",
      "Time",
      "Org Type",
      "Team Size",
      "Payment Method",
      "Had Delay",
      "Willing To Pay",
      "Wants Waitlist",
      "Name",
      "Phone",
      "Email",
      "Source",
      "IP Address"
    ];

    // Map friendly labels
    const orgTypeMap = {
      "school":    "School",
      "church":    "Church / NGO",
      "farm":      "Farm",
      "logistics": "Logistics",
      "shop":      "Shop / Salon",
      "ngo":       "NGO",
      "other":     "Other"
    };

    const teamSizeMap = {
      "1-5":  "1 to 5",
      "6-20": "6 to 20",
      "21-50":"21 to 50",
      "50+":  "50 and above"
    };

    const paymentMap = {
      "bank-manual": "Manual Bank Transfer",
      "cash":        "Cash",
      "opay":        "Opay / Moniepoint",
      "platform":    "Existing Platform"
    };

    const delayMap = {
      "many":  "Yes - Multiple times",
      "once":  "Yes - Once",
      "never": "Never"
    };

    const payMap = {
      "nothing":   "Would not pay",
      "500-1000":  "₦500 - ₦1,000",
      "1000-3000": "₦1,000 - ₦3,000",
      "3000-5000": "₦3,000 - ₦5,000",
      "5000+":     "Above ₦5,000"
    };

    // Build rows
    const rows = responses.map((r, i) => {
      const date = new Date(r.createdAt);
      return [
        i + 1,
        date.toLocaleDateString("en-NG"),
        date.toLocaleTimeString("en-NG"),
        orgTypeMap[r.orgType]          || r.orgType      || "",
        teamSizeMap[r.teamSize]        || r.teamSize     || "",
        paymentMap[r.paymentMethod]    || r.paymentMethod|| "",
        delayMap[r.delayExperience]    || r.delayExperience || "",
        payMap[r.willingToPay]         || r.willingToPay || "",
        r.wantsWaitlist ? "Yes" : "No",
        r.name  || "",
        r.phone || "",
        r.email || "",
        r.source || "landing-page",
        r.ipAddress || ""
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
    });

    // Summary section at bottom
    const total         = responses.length;
    const waitlistCount = responses.filter(r => r.wantsWaitlist).length;
    const neverDelay    = responses.filter(r => r.delayExperience === "never").length;
    const hadDelay      = responses.filter(r => r.delayExperience !== "never").length;
    const willingToPay  = responses.filter(r => r.willingToPay && r.willingToPay !== "nothing").length;

    const summary = [
      "",
      `"SUMMARY"`,
      `"Total Responses","${total}"`,
      `"Joined Waitlist","${waitlistCount}"`,
      `"Never Had Delay","${neverDelay}"`,
      `"Had Delay At Least Once","${hadDelay}"`,
      `"Willing To Pay Something","${willingToPay}"`,
      `"Not Willing To Pay","${total - willingToPay}"`,
    ];

    const csv = [
      headers.map(h => `"${h}"`).join(","),
      ...rows,
      ...summary
    ].join("\n");

    const filename = `sachapay_survey_${new Date().toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    return res.send(csv);

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};