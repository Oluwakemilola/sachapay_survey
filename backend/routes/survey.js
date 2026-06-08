import express from "express";
import {
  submitSurvey,
  getSurveyResponses,
  getWaitlist,
  exportWaitlist,
  submitWaitlist,
  exportAllResponses,
} from "../controller/survey.js";

const surveyRouter = express.Router();

// Public
surveyRouter.post("/submit", submitSurvey);

surveyRouter.get("/responses", getSurveyResponses);
surveyRouter.get("/waitlist", getWaitlist);
surveyRouter.post("/waitlist", submitWaitlist);
surveyRouter.get("/waitlist/export", exportWaitlist);
surveyRouter.get("/export",          exportAllResponses); 

export default surveyRouter;
