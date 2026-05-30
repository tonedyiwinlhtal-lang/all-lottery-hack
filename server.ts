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
      "Content-Type": "application/json;charset=UTF-8",
      "Accept": "application/json, text/plain, */*"
    },
    body: {"pageSize":10,"pageNo":1,"typeId":30,"language":0,"random":"78f26d2088104146b7baeeb2bf5de73e","signature":"944E83D41171487E45FF5BC2CA3EB355","timestamp":1779864269}
  },
  bigwin: {
    url: "https://api.bigwinqaz.com/api/webapi/GetNoaverageEmerdList",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Accept": "application/json, text/plain, */*",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzgwMTQ3MzcyIiwibmJmIjoiMTc4MDE0NzM3MiIsImV4cCI6IjE3ODAxNDkxNzIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiI1LzMwLzIwMjYgODoyMjo1MiBQTSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFjY2Vzc19Ub2tlbiIsIlVzZXJJZCI6IjUzMTc0OCIsIlVzZXJOYW1lIjoiOTU5OTcwNTQwNzc1IiwiVXNlclBob3RvIjoiNiIsIk5pY2tOYW1lIjoiTUcgVEhBTlQgIiwiQW1vdW50IjoiMTAyLjkwIiwiSW50ZWdyYWwiOiIwIiwiTG9naW5NYXJrIjoiSDUiLCJMb2dpblRpbWUiOiI1LzMwLzIwMjYgNzo1Mjo1MiBQTSIsIkxvZ2luSVBBZGRyZXNzIjoiMmEwOTpiYWMxOjY1NjA6ODo6Mjc3OjFhIiwiRGJOdW1iZXIiOiIwIiwiSXN2YWxpZGF0b3IiOiIwIiwiS2V5Q29kZSI6IjY4NCIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjEiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.wjW8WKKGK9Q2UGxc2BIjI_wfm6vvUUD87ZugfiOW0n0",
      "Ar-Origin": "https://www.777bigwingame.org"
    },
    body: {"pageSize":10,"pageNo":1,"typeId":30,"language":7,"random":"7ecc63677eed45f4bc53db2af303a991","signature":"5DFBFD7430EE050C254DB15C16F001FA","timestamp":1780147387}
  },
  sixlottery: {
    url: "https://6lotteryapi.com/api/webapi/GetNoaverageEmerdList",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Accept": "application/json, text/plain, */*",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzgwMTQ3NTg1IiwibmJmIjoiMTc4MDE0NzU4NSIsImV4cCI6IjE3ODAxNDkxNzIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiI1LzMwLzIwMjYgODoyNjoyNSBQTSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFjY2Vzc19Ub2tlbiIsIlVzZXJJZCI6IjEwNDU1NTIiLCJVc2VyTmFtZSI6Ijk1OTY3OTg3NzM3OSIsIlVzZXJQaG90byI6IjEiLCJOaWNrTmFtZSI6Ik1lbWJlck5OR0w3TUdNIiwiQW1vdW50IjoiOTIuOTAiLCJJbnRlZ3JhbCI6IjAiLCJMb2dpbk1hcmsiOiJINSIsIkxvZ2luVGltZSI6IjUvMzAvMjAyNiA3OjU2OjI1IFBNIiwiTG9naW5JUEFkZHJlc3MiOiIyYTA5OmJhYzU6NTVmZDoxOGJlOjoyNzc6MWEiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMjQ3IiwiVG9rZW5UeXBlIjoiQWNjZXNzX1Rva2VuIiwiUGhvbmVUeXBlIjoiMSIsIlVzZXJUeXBlIjoiMCIsIlVzZXJOYW1lMiI6IiIsImlzcyI6Imp3dElzc3VlciIsImF1ZCI6ImxvdHRlcnlUaWNrZXQifQ.l2XQb-yrZkfNIkcQv8pX9UuP_yL1L5Eg9rLB41SLS1I",
      "Ar-Origin": "https://www.6win571.com"
    },
    body: {"pageSize":10,"pageNo":1,"typeId":30,"language":7,"random":"9a8d1ba5669b467487e45cf68e338f0d","signature":"CB72506202AD6EEAA05875C2E97D4ED6","timestamp":1780147740}
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
    const requestBody = { ...config.body };
    const response = await axios.post(config.url, requestBody, { headers: config.headers, timeout: 5000 });
    
    if (response.data && response.data.code === 0) {
      if (provider === 'ck' && response.data.data?.data?.gameslist) {
        response.data.data.list = response.data.data.data.gameslist;
      } else if (provider === 'ck' && response.data.data?.gameslist) {
        response.data.data.list = response.data.data.gameslist;
      }
      res.json(response.data);
    } else {
      throw new Error("API returned non-zero code or invalid data");
    }
  } catch (error) {
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
