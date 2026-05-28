const d1 = new Date("2026-05-27T13:14:30Z");
const p1 = Math.floor(d1.getTime() / 30000);
console.log("Epoch period at 13:14:30:", p1);
console.log("Wanted period:", 50809);
console.log("Offset:", p1 - 50809);

const d2 = new Date("2026-05-27T13:20:56Z");
const p2 = Math.floor(d2.getTime() / 30000);
console.log("Epoch period at 13:20:56:", p2);
console.log("Wanted period:", 50821);
console.log("Offset:", p2 - 50821);

const dNow = new Date();
const pNow = Math.floor(dNow.getTime() / 30000);
console.log("Current Wanted Period:", pNow - 58852303);
