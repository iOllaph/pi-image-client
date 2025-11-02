import WebSocket from "ws";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";

// -------------------- Configuration --------------------
const RELAY_WS_URL = "wss://youwebsocket"; // WebSocket URL
const TEMP_DIR = "/tmp"; // temp folder to save images
const PRINTER_NAME = "Brother_QL-800"; // change if your printer has a different name

// -------------------- Print Function --------------------
async function printJob(filePath) {
  try {
    // Ensure file exists
    await fs.access(filePath);

    // Send file to printer
    return new Promise((resolve, reject) => {
      exec(`lp -d ${PRINTER_NAME} ${filePath}`, (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve({ status: "OK", result: stdout.trim() });
      });
    });
  } catch (err) {
    return { status: "FAIL", error: err.message };
  }
}

// -------------------- WebSocket Client --------------------
const socket = new WebSocket(RELAY_WS_URL);

socket.on("open", () => {
  console.log("✅ Connected to relay WebSocket");
});

socket.on("message", async (data) => {
  let job;
  try {
    job = JSON.parse(data.toString());
    if (!job.imageBase64) throw new Error("Missing imageBase64");
  } catch (err) {
    console.error("❌ Invalid message:", err.message);
    return;
  }

  // Use timestamp as temp filename
  const tempFile = path.join(TEMP_DIR, `job-${Date.now()}.png`);

  try {
    // Save Base64 image to temp file
    const imageBuffer = Buffer.from(job.imageBase64, "base64");
    await fs.writeFile(tempFile, imageBuffer);
    console.log(`💾 Image saved to ${tempFile}`);

    // Print the file
    const result = await printJob(tempFile);

    // Clean up temp file
    await fs.unlink(tempFile);

    // Send result back
    socket.send(JSON.stringify(result));
    console.log(`✅ Job completed: ${result.status}`);
  } catch (err) {
    console.error("❌ Job failed:", err.message);
    socket.send(JSON.stringify({ status: "FAIL", error: err.message }));
  }
});

socket.on("close", () => {
  console.log("⚠️ WebSocket closed. Reconnecting in 5s...");
  setTimeout(() => socket.connect(RELAY_WS_URL), 5000);
});

socket.on("error", (err) => {
  console.error("❌ WebSocket error:", err.message);
});
