import axios from "axios";

const cache = new Map();

export async function allowedByRobots(url, userAgent = "joojle-bot") {
  try {
    const { origin } = new URL(url);

    if (cache.has(origin)) {
      return cache.get(origin);
    }

    const robotsUrl = `${origin}/robots.txt`;
    const { data } = await axios.get(robotsUrl, { timeout: 5000 });

    const disallowed = data
      .split("\n")
      .filter(line =>
        line.toLowerCase().includes("disallow") &&
        !line.includes("#")
      )
      .map(line => line.split(":")[1]?.trim());

    const allowed = !disallowed.some(path => url.includes(path));
    cache.set(origin, allowed);

    return allowed;
  } catch {
    return true; // لو robots غير موجود
  }
}
