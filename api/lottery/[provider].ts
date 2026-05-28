import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Fallback Mock Data
const MOCK_DATA: Record<string, any> = {
  ck: {"data":{"list":[{"issueNumber":"20260527100050809","number":"2","colour":"red","premium":"99662"},{"issueNumber":"20260527100050808","number":"4","colour":"red","premium":"91874"}],"pageNo":1,"totalPage":9087,"totalCount":90869},"code":0,"msg":"Succeed","msgCode":0,"serviceNowTime":"2026-05-27 13:14:30"},
  bigwin: {"data":{"list":[{"issueNumber":"20260527100050817","number":"8","colour":"red","premium":"38468"},{"issueNumber":"20260527100050816","number":"0","colour":"red,violet","premium":"56120"}],"pageNo":1,"totalPage":9088,"totalCount":90877},"code":0,"msg":"Succeed","msgCode":0,"serviceNowTime":"2026-05-27 13:18:46"},
  sixlottery: {"data":{"list":[{"issueNumber":"20260527100050821","number":"2","colour":"red","premium":"81732"},{"issueNumber":"20260527100050820","number":"9","colour":"green","premium":"21699"}],"pageNo":1,"totalPage":3329,"totalCount":33281},"code":0,"msg":"Succeed","msgCode":0,"serviceNowTime":"2026-05-27 13:20:56"}
};

const ROUTES: Record<string, any> = {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let provider = req.query.provider as string;
  if (!provider && req.url) {
    const parts = req.url.split('?')[0].split('/');
    provider = parts[parts.length - 1];
  }

  const config = ROUTES[provider];
  if (!provider || !config) {
    return res.status(400).json({ error: "Invalid provider", requestedProvider: provider });
  }

  try {
    const fetchResponse = await axios.post(config.url, config.body, {
      headers: config.headers,
      timeout: 5000,
    });
    
    return res.status(200).json(fetchResponse.data);
  } catch (error) {
    console.warn(`[Vercel Serverless] Failed to fetch from ${provider}, returning cached/mocked data.`);
    
    // Auto-advance mock data to simulate real-time updates if the user is testing
    const cached = MOCK_DATA[provider];
    if (cached && cached.data && cached.data.list && cached.data.list.length > 0) {
      const lastIssue = cached.data.list[0];
      try {
        const nextTargetNumStr = String(BigInt(lastIssue.issueNumber) + 1n);
        const nextIssueNumber = nextTargetNumStr.padStart(lastIssue.issueNumber.length, '0');
        
        const randomNum = Math.floor(Math.random() * 10);
        let randomColors = randomNum % 2 === 0 ? "red" : "green";
        if (randomNum === 0 || randomNum === 5) randomColors += ",violet";
        
        cached.data.list.unshift({
          issueNumber: nextIssueNumber,
          number: randomNum.toString(),
          colour: randomColors,
          premium: (Math.random() * 50000 + 20000).toFixed(0)
        });
        
        if (cached.data.list.length > 10) {
          cached.data.list.pop();
        }
      } catch (e) {
      }
    }
    
    return res.status(200).json(cached);
  }
}
