import axios from "axios";

async function run() {
    try {
        const res = await axios.post("https://ckygjf6r.com/api/webapi/GetNoaverageEmerdList", {
            pageSize: 10,
            pageNo: 1,
            typeId: 30,
            language: 0
        }, {
            headers: {
                "Ar-Origin": "https://cklottery.top",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Content-Type": "application/json;charset=UTF-8",
                "Accept": "application/json, text/plain, */*"
            }
        });
        console.log("CK:", res.data);
    } catch(e) { console.error("CK err:", e.message); }
}

run();
