import cors from "cors";
import "dotenv/config";
import express, { type Request, type Response } from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

app.use(
  cors({
    origin: webOrigin,
    credentials: true
  })
);
app.use(express.json());

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({
    status: "ok",
    service: "itss-document-api",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (_request: Request, response: Response) => {
  response.status(200).json({
    status: "ok",
    service: "itss-document-api",
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
