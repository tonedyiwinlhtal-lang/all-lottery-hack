import axios from "axios";

async function run() {
    try {
        const res = await axios.post("https://api.bigwinqaz.com/api/webapi/GetGameIssueList", {
            pageSize: 10,
            pageNo: 1,
            typeId: 30,
            language: 0
        });
        console.log("Bigwin GetGameIssueList:", res.data);
    } catch(e) { console.error("Bigwin err:", e.message); }
    
    try {
        const res = await axios.post("https://api.bigwinqaz.com/api/webapi/GetNoaverageEmerdList");
        console.log("Bigwin GetNoaverageEmerdList empty:", res.data);
    } catch(e) { console.error("Bigwin err:", e.message); }

    try {
        const res = await axios.get("https://api.bigwinqaz.com/api/webapi/GetNoaverageEmerdList?pageSize=10&pageNo=1&typeId=30&language=0");
        console.log("Bigwin GetNoaverageEmerdList GET:", res.data);
    } catch(e) { console.error("Bigwin err:", e.message); }
}

run();
