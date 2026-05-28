const now = Date.now();
const mmtNow = new Date(now + 6.5 * 3600 * 1000);
console.log("MMT Now:", mmtNow.toISOString());

const startOfDay = new Date(mmtNow);
startOfDay.setUTCHours(0, 0, 0, 0); 
console.log("MMT Start:", startOfDay.toISOString());

const elapsedMs = mmtNow.getTime() - startOfDay.getTime();
console.log("Elapsed ms:", elapsedMs);

const period = Math.floor(elapsedMs / 30000) + 1; // +1 if period starts at 1
console.log("Period:", period);
