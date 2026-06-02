import cors from "cors";
import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import { fileURLToPath } from "node:url";
import { authRouter } from "./routes/auth.js";
import { documentsRouter } from "./routes/documents.js";
import { personalizationRouter } from "./routes/personalization.js";
import { prisma } from "./prisma.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";
const uploadsRoot = fileURLToPath(new URL("../uploads", import.meta.url));

app.use(
  cors({
    origin: webOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadsRoot));

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

app.use("/api/documents", documentsRouter);
app.use("/api/personalization", personalizationRouter);
app.use("/api/auth", authRouter);

app.use((_request: Request, response: Response) => {
  response.status(404).json({ message: "Không tìm thấy endpoint." });
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error);
  response.status(500).json({ message: "Máy chủ đang gặp lỗi. Vui lòng thử lại sau." });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
