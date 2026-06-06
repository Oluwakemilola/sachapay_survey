import express from "express";
import {
  submitSurvey,
  getSurveyResponses,
  getWaitlist,
  exportWaitlist,
  submitWaitlist,
} from "../controller/survey.js";

const surveyRouter = express.Router();

// Public
surveyRouter.post("/submit", submitSurvey);

surveyRouter.get("/responses", getSurveyResponses);
surveyRouter.get("/waitlist", getWaitlist);
surveyRouter.post("/waitlist", submitWaitlist);
surveyRouter.get("/waitlist/export", exportWaitlist);

export default surveyRouter;
