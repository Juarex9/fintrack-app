import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.use(cors({ origin: true, credentials: false}));
app.use(express.json());

app.get("/healt", (_req, res) => {
    res.json({ ok: true});
});

app.use(errorHandler)