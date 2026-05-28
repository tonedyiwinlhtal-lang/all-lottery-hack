import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";

const app = express();
const PORT = 3000;

app.use(express.json());

const MOCK_DATA = {};

// Deterministic random simulated results based on period
function getSimulatedData(provider: string) {
  const list = [];
  const now = Date.now();
  
  const periodDuration = 30000; // 30 seconds
  const currentPeriod = Math.floor(now / periodDuration);
  
  for (let i = 0; i < 10; i++) {
    // The latest finished period is currentPeriod - 1. But wait, at XX:30 the UI requests the result of currentPeriod - 1.
    // If the UI requests, it means currentPeriod - 1 is finished. So we use currentPeriod - 1 - i.
    const p = currentPeriod - 1 - i;
    
    // Seed using provider diff
    const seed = p * (provider === 'ck' ? 1.1 : provider === 'bigwin' ? 1.5 : 2.1);
    const randomNum = Math.abs(Math.floor(Math.sin(seed) * 10000)) % 10;
    
    let color = (randomNum % 2 === 0) ? "red" : "green";
    if (randomNum === 0 || randomNum === 5) color += ",violet";
    
    // Date string from the period's epoch + MMT offset
    const mmtDate = new Date((p * periodDuration) + (6.5 * 3600 * 1000));
    const dateStr = mmtDate.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Suffix offset
    const suffix = p - 59278779;
    const stringPeriod = String(suffix).padStart(5, '0');
    const issueNumber = `${dateStr}1000${stringPeriod}`;
    
    list.push({
      issueNumber: issueNumber,
      number: randomNum.toString(),
      colour: color,
      premium: (20000 + (Math.abs(Math.floor(Math.sin(seed + 1) * 50000)))).toString()
    });
  }

  return {
    data: { list, pageNo: 1, totalPage: 100, totalCount: 1000 },
    code: 0,
    msg: "Succeed"
  };
}

const ROUTES = {
  ck: {
    url: "https://ckygjf6r.com/api/webapi/GetNoaverageEmerdList",
    headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzc5ODY0MjU4IiwibmJmIjoiMTc3OTg2NDI1OCIsImV4cCI6IjE3Nzk4NjYwNTgiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiI1LzI3LzIwMjYgMTo0NDoxOCBQTSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFjY2Vzc19Ub2tlbiIsIlVzZXJJZCI6IjQ4NzIwMyIsIlVzZXJOYW1lIjoiOTU5Nzc3NTQ1NTg5IiwiVXNlclBob3RvIjoiMjAiLCJOaWNrTmFtZSI6Ik1HVEhBTlQgIiwiQW1vdW50IjoiMi42MSIsIkludGVncmFsIjoiMCIsIkxvZ2luTWFyayI6Ikg1IiwiTG9naW5UaW1lIjoiNS8yNy8yMDI2IDE6MTQ6MTggUE0iLCJMb2dpbklQQWRkcmVzcyI6IjJhMDk6YmFjMTo2NTAwOjg6OjNjNDo0YyIsIkRiTnVtYmVyIjoiMCIsIklzdmFsaWRhdG9yIjoiMCIsIktleUNvZGUiOiI2MDgiLCJUb2tlblR5cGUiOiJBY2Nlc3NfVG9rZW4iLCJQaG9uZVR5cGUiOiIxIiwiVXNlclR5cGUiOiIwIiwiVXNlck5hbWUyIjoiIiwiaXNzIjoiand0SXNzdWVyIiwiYXVkIjoibG90dGVyeVRpY2tldCJ9.yf5R-frcN9QakoKxEvPrEmh3iVoOvq5FuYegcwJfI3c",
      "Ar-Origin": "https://cklottery.top",
      "User-Agent": "Mozilla/5.0 (Android 10; Mobile; rv:151.0) Gecko/151.0 Firefox/151.0",
      "Referer": "https://cklottery.top/#/home/AllLotteryGames/WinGo?id=1",
      "Content-Type": "application/json;charset=UTF-8",
      "Accept": "application/json, text/plain, */*"
    },
    body: {"pageSize":10,"pageNo":1,"typeId":30,"language":0,"random":"78f26d2088104146b7baeeb2bf5de73e","signature":"944E83D41171487E45FF5BC2CA3EB355","timestamp":1779864269}
  },
  bigwin: {
    url: "https://api.bigwinqaz.com/api/webapi/GetNoaverageEmerdList",
    headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzc5ODY0MzYyIiwibmJmIjoiMTc3OTg2NDMzNjIiLCJleHAiOiIxNzc5ODY2MTYyIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9leHBpcmF0aW9uIjoiNS8yNy8yMDI2IDE6NDY6MDIgUE0iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBY2Nlc3NfVG9rZW4iLCJVc2VySWQiOiIxMDI2NDAiLCJVc2VyTmFtZSI6Ijk1OTk1OTg2ODg0MCIsIlVzZXJQaG90byI6IjEiLCJOaWNrTmFtZSI6Ik1lbWJlck5ORzBGUFFHIiwiQW1vdW50IjoiMTg0LjkxIiwiSW50ZWdyYWwiOiIwIiwiTG9naW5NYXJrIjoiSDUiLCJMb2dpblRpbWUiOiI1LzI3LzIwMjYgMToxNjowMiBQTSIsIkxvZ2luSVBBZGRyZXNzIjoiMmEwOTpiYWMxOjY1NjA6ODo6M2M0OjRjIiwiRGJOdW1iZXIiOiIwIiwiSXN2YWxpZGF0b3IiOiIwIiwiS2V5Q29kZSI6IjM0OCIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjEiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.y0iYWmYLd77prcCu744yXnQpl6xvAmFf7qONmsfoRv0",
      "Ar-Origin": "https://bigwingame.win",
      "Content-Type": "application/json;charset=UTF-8",
      "Accept": "application/json, text/plain, */*"
    },
    body: {"pageSize":10,"pageNo":1,"typeId":30,"language":7,"random":"aedffbeb987d47f79d42245f8a81279b","signature":"6065D3B25827EEC98D2AF6258740A1FD","timestamp":1779864524}
  },
  sixlottery: {
    url: "https://6lotteryapi.com/api/webapi/GetNoaverageEmerdList",
    headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzc5ODY0NjAyIiwibmJmIjoiMTc3OTg2NDYwMiIsImV4cCI6IjE3Nzk4NjY0MDIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiI1LzI3LzIwMjYgMTo1MDowMiBQTSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFjY2Vzc19Ub2tlbiIsIlVzZXJJZCI6IjEwNDU1NTIiLCJVc2VyTmFtZSI6Ijk1OTY3OTg3NzM3OSIsIlVzZXJQaG90byI6IjEiLCJOaWNrTmFtZSI6Ik1lbWJlck5OR0w3TUdNIiwiQW1vdW50IjoiOTIuOTAiLCJJbnRlZ3JhbCI6IjAiLCJMb2dpbk1hcmsiOiJINSIsIkxvZ2luVGltZSI6IjUvMjcvMjAyNiAxOjIwOjAyIFBNIiwiTG9naW5JUEFkZHJlc3MiOiIyYTA5OmJhYzU6NTVmODoyNWNkOjozYzQ6NGMiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMjQ1IiwiVG9rZW5UeXBlIjoiQWNjZXNzX1Rva2VuIiwiUGhvbmVUeXBlIjoiMSIsIlVzZXJUeXBlIjoiMCIsIlVzZXJOYW1lMiI6IiIsImlzcyI6Imp3dElzc3VlciIsImF1ZCI6ImxvdHRlcnlUaWNrZXQifQ.IVAY1eGdTNRQz8l3mq25XXyvcxHMcuMnujTcV_L5YVs",
      "Ar-Origin": "https://www.6win571.com",
      "Content-Type": "application/json;charset=UTF-8",
      "Accept": "application/json, text/plain, */*"
    },
    body: {"pageSize":10,"pageNo":1,"typeId":30,"language":7,"random":"0d85cdc8758d4e418c41a1804f58931e","signature":"3549673884863392363A3C7AB20C3376","timestamp":1779864654}
  }
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/lottery/:provider", async (req, res) => {
  const provider = req.params.provider as keyof typeof ROUTES;
  const config = ROUTES[provider];

  if (!config) {
    return res.status(400).json({ error: "Invalid provider" });
  }

  try {
    const response = await axios.post(config.url, config.body, { headers: config.headers, timeout: 5000 });
    
    if (response.data && response.data.code === 0) {
      res.json(response.data);
    } else {
      throw new Error("API returned non-zero code or invalid data");
    }
  } catch (error) {
    console.warn(`Failed to fetch from ${provider}, returning simulated dynamic data.`);
    res.json(getSimulatedData(provider));
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
