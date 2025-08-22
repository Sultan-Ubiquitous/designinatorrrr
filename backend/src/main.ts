import express, { Request, Response } from 'express';
import simpleLogger from './utils/logger.js';
import { toNodeHandler } from 'better-auth/node';
import githubRouter from './routes/github.js';
import codeFilesRouter from './routes/codefiles.js';
import auth from './utils/auth.js';
import cors from 'cors';
import { isAuthorized } from './middlewares/routeProtector.js';

const app = express();
const PORT = process.env.PORT || 8008;

app.use(
    cors({
        origin: "http://localhost:3003",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }),
);

app.all("/api/auth/*", toNodeHandler(auth));

// --- Middlewares ---


app.use(express.json());
app.use(simpleLogger());

app.use('/github', isAuthorized, githubRouter);
app.use('/codeFiles',isAuthorized, codeFilesRouter);


app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: "Baapu says Hi, All things Kadak" });
});

app.get('/sendhome', isAuthorized, async (req: Request, res: Response) => {
    res.redirect(301, 'http://localhost:3003/dashboard');
    return;
})

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});