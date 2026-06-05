// ─────────────────────────────────────────────
// SachaPay — Survey Response Model
// File: backend/models/SurveyResponse.js
// ─────────────────────────────────────────────
import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  // Survey answers
  orgType:          { type: String, default: null },
  // school, church, farm, logistics, shop, ngo, other

  teamSize:         { type: String, default: null },
  // 1-5, 6-20, 21-50, 50+

  paymentMethod:    { type: String, default: null },
  // bank-manual, cash, opay, platform

  delayExperience:  { type: String, default: null },
  // many, once, never

  willingToPay:     { type: String, default: null },
  // nothing, 500-1000, 1000-3000, 3000-5000, 5000+

  // Waitlist
  wantsWaitlist:    { type: Boolean, default: false },
  name:             { type: String, default: null },
  phone:            { type: String, default: null },
  email:            { type: String, default: null },

  // Metadata
  source:           { type: String, default: "landing-page" },
  // landing-page, whatsapp, facebook, direct

  ipAddress:        { type: String, default: null },
  submittedAt:      { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("SurveyResponse", surveySchema);