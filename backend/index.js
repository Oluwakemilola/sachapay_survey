import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PORT } from './config/env.js';
import connectDB from './database/mongodb.js';

import surveyRouter from "./routes/survey.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/api/survey", surveyRouter);

app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "SachaPay Survey API is running" 
  });
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
