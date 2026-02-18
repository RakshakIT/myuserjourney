import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { getTrackingCodeHtml, injectTrackingCodes } from "./tracking-inject";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("/{*path}", async (_req, res) => {
    try {
      let html = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      const codes = await getTrackingCodeHtml();
      html = injectTrackingCodes(html, codes);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
