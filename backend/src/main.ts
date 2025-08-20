import express, { Request, Response } from 'express';
import simpleLogger from './utils/logger.js';
import { toNodeHandler } from 'better-auth/node';
import githubRouter from './routes/github.js';
// import {auth} from "./utils/auth";

const app = express();

const PORT = process.env.PORT || 8000;

// app.all("/api/auth/*", toNodeHandler(auth));

// --- Middlewares ---
app.use(express.json());
app.use(simpleLogger());

app.use('/github', githubRouter);

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: "Baapu says Hi, All things Kadak" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});