import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

app.post("/inference", (req, res) => {
  setTimeout(() => {
    res.json({
      status: "complete",
      inputResolution: "10m",
      outputResolution: "1m",
      model: "S2DR3",
      psnr: 32.41,
      ssim: 0.941,
      inputImage: req.body.inputImage || "https://placehold.co/600x400/png?text=10m+Input",
      outputImage: "https://placehold.co/600x400/png?text=1m+S2DR3+Output"
    });
  }, 1500);
});