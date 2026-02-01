import { exec } from "child_process";
import { verify } from "../../backend/utils/auth.js";

export default function handler(req, res) {
  try {
    verify(req);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  exec("npm run crawl", (err) => {
    if (err) {
      return res.status(500).json({ error: "Crawler failed" });
    }
    res.json({ success: true });
  });
}
