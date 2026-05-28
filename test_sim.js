const periodDuration = 30000;
const now = new Date("2026-05-27T13:14:30Z").getTime();
const currentPeriod = Math.floor(now / periodDuration);

// last finished period
const p = currentPeriod - 1; 

const suffix = p - 59278780;
const stringPeriod = String(suffix).padStart(5, '0');

const mmtDate = new Date((p * periodDuration) + (6.5 * 3600 * 1000));
const dateStr = mmtDate.toISOString().slice(0, 10).replace(/-/g, '');

const issueNumber = `${dateStr}1000${stringPeriod}`;
console.log(issueNumber);
