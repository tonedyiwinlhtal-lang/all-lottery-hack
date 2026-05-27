import { useState, useEffect } from "react";
import axios from "axios";
import { Provider, LotteryResponse, LotteryResult, TrackedPrediction } from "../types";
import { HistoryTable } from "./HistoryTable";
import { AnalyticsChart } from "./AnalyticsChart";
import { PredictionEngine } from "./PredictionEngine";
import { PredictionHistoryTable } from "./PredictionHistoryTable";
import { WinRatioChart } from "./WinRatioChart";
import { generatePrediction, getNextIssue } from "../lib/prediction";
import { BarChart3, Clock, RefreshCw, Zap, Menu, ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils";

const PROVIDERS: { id: Provider; name: string }[] = [
  { id: "ck", name: "CK 30S" },
  { id: "bigwin", name: "BigWin 30S" },
  { id: "sixlottery", name: "6Lottery 30S" },
];

export function Dashboard() {
  const [activeProvider, setActiveProvider] = useState<Provider>("ck");
  const [data, setData] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [predictionHistory, setPredictionHistory] = useState<TrackedPrediction[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);

  const nextTargetIssue = data.length > 0 ? getNextIssue(data[0].issueNumber) : "";
  const pendingForActive = predictionHistory.find(
    p => p.provider === activeProvider && p.status === 'PENDING' && String(p.issueNumber) === String(nextTargetIssue)
  );
  
  const derivedPrediction = pendingForActive ? {
    number: pendingForActive.predictedNumber,
    confidence: pendingForActive.confidence,
    colours: pendingForActive.predictedNumber % 2 === 0 ? 
      (pendingForActive.predictedNumber === 0 ? ['red', 'violet'] : ['red']) : 
      (pendingForActive.predictedNumber === 5 ? ['green', 'violet'] : ['green']),
    isSmall: pendingForActive.isSmall
  } : null;

  const fetchData = async (provider: Provider) => {
    setLoading(true);
    try {
      const response = await axios.post<LotteryResponse>(`/api/lottery/${provider}`);
      const list = response.data.data.list;
      setData(list);
      setLastUpdated(new Date());

      const nextIssue = list.length > 0 ? getNextIssue(list[0].issueNumber) : "WAITING...";

      if (nextIssue !== "WAITING...") {
        setPredictionHistory(prev => {
           let updated = prev.map(p => {
               if (p.status === 'PENDING' && p.provider === provider) {
                   const actual = list.find((item: any) => String(item.issueNumber) === String(p.issueNumber));
                   if (actual) {
                       const resultNum = parseInt(actual.number, 10);
                       const isSmallActual = resultNum < 5;
                       return {
                           ...p,
                           status: isSmallActual === p.isSmall ? 'WIN' : 'LOSE',
                           actualNumber: resultNum
                       };
                   }
               }
               return p;
           });
           
           // Insert new pending
           const existingPending = updated.find(p => String(p.issueNumber) === String(nextIssue) && p.provider === provider);
           if (!existingPending) {
               const newPredictionObj = generatePrediction(list);
               if (newPredictionObj) {
                 updated = [{
                     issueNumber: nextIssue,
                     provider,
                     isSmall: newPredictionObj.isSmall,
                     predictedNumber: newPredictionObj.number,
                     confidence: newPredictionObj.confidence,
                     status: 'PENDING'
                 }, ...updated];
               }
           }
           return updated;
        });
      }
      
      // Trigger prediction sequence
      setIsPredicting(true);
      setTimeout(() => setIsPredicting(false), 2000); // 2 second mock processing time
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeProvider);
    setTimeLeft(30);
    
    // Auto-refresh interval (30 seconds)
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchData(activeProvider);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProvider]);

  return (
    <div className="flex h-screen w-full flex-col bg-[#0a0a0c] text-[#e2e2e7] font-sans overflow-hidden select-none">
      {/* Header */}
      <header className="h-16 border-b border-[#2d2d33] flex items-center justify-between px-4 sm:px-8 bg-[#111116] shrink-0">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1 sm:gap-2 pr-4 sm:pr-6 border-r border-[#2d2d33]">
            <button className="p-2 hover:bg-[#1c1c24] rounded-md transition-colors text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#1c1c24] rounded-md transition-colors text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/20 shrink-0">
              P
            </div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap">
              PREDICT<span className="text-blue-500">PRO</span>
              <span className="text-xs font-mono opacity-50 ml-2 uppercase text-gray-400 hidden xl:inline">v2.4.0-STABLE</span>
            </h1>
          </div>
          <nav className="hidden lg:flex gap-1 ml-4 xl:ml-8">
            <button className="px-4 py-2 bg-[#23232a] text-sm rounded-md border border-[#3b3b45] text-blue-400">Terminal</button>
            <button className="px-4 py-2 hover:bg-[#1c1c24] text-sm rounded-md transition-colors text-gray-400 hover:text-gray-200">Architecture</button>
            <button className="px-4 py-2 hover:bg-[#1c1c24] text-sm rounded-md transition-colors text-gray-400 hover:text-gray-200">Security</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-green-500 font-medium">API CONNECTED: 200 OK</span>
          </div>
          <span className="opacity-40 text-gray-500 hidden md:block">TS: {Math.floor(Date.now() / 1000)}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex gap-0 overflow-hidden relative">
        {/* Sidebar: Game Sources */}
        <aside className={cn(
          "border-r border-[#2d2d33] bg-[#0e0e12] flex flex-col shrink-0 overflow-hidden transition-all duration-300",
          isSidebarOpen ? "w-72" : "w-0 border-r-0"
        )}>
          <div className="w-72 h-full flex flex-col">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Data Streams</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 font-bold uppercase tracking-wider hidden sm:block">
                    Auto-Refresh in {timeLeft}s
                  </span>
                  <button 
                    onClick={() => { fetchData(activeProvider); setTimeLeft(30); }}
                    disabled={loading}
                    className="text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {PROVIDERS.map((provider) => {
                  const isActive = activeProvider === provider.id;
                  return (
                    <div 
                      key={provider.id}
                      onClick={() => setActiveProvider(provider.id)}
                      className={cn(
                        "p-4 rounded-lg cursor-pointer transition-colors",
                        isActive 
                          ? "bg-[#1c1c24] border-l-4 border-blue-500 ring-1 ring-white/5 shadow-xl" 
                          : "bg-[#111116] border border-[#2d2d33] hover:bg-[#16161d] opacity-70"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn("font-bold text-sm", isActive ? "text-white" : "text-gray-300")}>{provider.name}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 rounded",
                          isActive ? "bg-blue-500/20 text-blue-400" : "bg-gray-700 text-gray-300"
                        )}>30s</span>
                      </div>
                      <p className="text-[11px] opacity-60 mb-2 text-gray-400 font-mono">
                        {provider.id === 'ck' ? 'ckygjf6r.com/api/webapi' : 
                         provider.id === 'bigwin' ? 'api.bigwinqaz.com/api' : 
                         '6lotteryapi.com/webapi'}
                      </p>
                      {isActive && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-[#2d2d33] rounded-full overflow-hidden">
                            <div className={cn("h-full bg-blue-500 transition-all", loading ? "w-0" : "w-[100%]")}></div>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">{loading ? '0%' : '100%'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-[#2d2d33] bg-[#111116]">
              <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Access Token Hash</div>
              <div className="p-2 bg-black/40 rounded border border-[#2d2d33] font-mono text-[9px] break-all leading-tight opacity-50 text-gray-400">
                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzc5ODY0...
              </div>
            </div>
          </div>
        </aside>

        {/* Main Viewport */}
        <section className="flex-1 flex flex-col bg-[#0a0a0c] overflow-y-auto">
          {/* Top Dashboard: Active Prediction */}
          <div className="p-8 grid gap-6 xl:grid-cols-12 shrink-0">
            <div className="xl:col-span-8 group">
              <PredictionEngine data={data} prediction={derivedPrediction} isPredicting={isPredicting || loading} timeLeft={timeLeft} />
            </div>
            
            <div className="xl:col-span-4 h-full">
              <div className="h-full bg-[#111116] border border-[#2d2d33] rounded-2xl p-6 flex flex-col shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trend Analysis</h4>
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-h-[200px] flex flex-col gap-6">
                  <div className="flex-1 flex flex-col min-h-[120px]">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 font-bold">Number Frequency</span>
                    <AnalyticsChart data={data} />
                  </div>
                  <div className="flex-1 flex flex-col min-h-[120px] border-t border-[#2d2d33] pt-4">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 font-bold">Cumulative Win Ratio</span>
                    <WinRatioChart data={predictionHistory.filter(p => p.provider === activeProvider)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Dashboard: Recent History & Predictions */}
          <div className="px-8 pb-8 flex-1 min-h-[400px] grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-[#111116] border border-[#2d2d33] rounded-2xl h-full flex flex-col overflow-hidden shadow-inner flex-1 max-h-full">
              <div className="px-6 py-4 border-b border-[#2d2d33] flex justify-between items-center bg-[#16161d] shrink-0">
                <h3 className="text-sm font-bold tracking-wide text-gray-200">
                  HISTORICAL DATA FEED 
                  <span className="text-gray-500 ml-2 font-normal text-[10px] uppercase">Real-time response</span>
                </h3>
                <div className="flex gap-2 items-center">
                  <div className="px-2 py-1 bg-black/40 rounded border border-[#2d2d33] text-[10px] text-gray-400 font-mono">
                    TOTAL: {data.length > 0 ? data.length : 0}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto h-[300px] xl:h-auto">
                <HistoryTable data={data} />
              </div>
            </div>

            <div className="bg-[#111116] border border-[#2d2d33] rounded-2xl h-full flex flex-col overflow-hidden shadow-inner flex-1 max-h-full">
              <div className="px-6 py-4 border-b border-[#2d2d33] flex justify-between items-center bg-[#16161d] shrink-0">
                <h3 className="text-sm font-bold tracking-wide text-gray-200">
                  PREDICTION HISTORY 
                  <span className="text-gray-500 ml-2 font-normal text-[10px] uppercase">Auto-evaluated</span>
                </h3>
                <div className="flex gap-2 items-center">
                  <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded border border-green-500/20 text-[10px] font-bold font-mono">
                    W: {predictionHistory.filter(p => p.provider === activeProvider && p.status === 'WIN').length}
                  </div>
                  <div className="px-2 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/20 text-[10px] font-bold font-mono">
                    L: {predictionHistory.filter(p => p.provider === activeProvider && p.status === 'LOSE').length}
                  </div>
                  <div className="px-2 py-1 bg-black/40 rounded border border-[#2d2d33] text-[10px] text-gray-400 font-mono hidden sm:block">
                    TRACKED: {predictionHistory.filter(p => p.provider === activeProvider).length}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto h-[300px] xl:h-auto">
                <PredictionHistoryTable data={predictionHistory} provider={activeProvider} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Status */}
      <footer className="h-8 border-t border-[#2d2d33] bg-[#0a0a0c] px-4 flex items-center justify-between text-[10px] text-gray-600 uppercase font-mono shrink-0">
        <div className="flex gap-4">
          <span>Session: Local-Admin</span>
          <span className="hidden sm:inline">Port: 443</span>
          <span className="hidden sm:inline">Mode: Read/Write</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-blue-500/60 hidden sm:inline">System Latency: {Math.floor(Math.random() * 20 + 5)}ms</span>
          <span className="bg-blue-600 text-white px-2 rounded-sm font-sans font-medium uppercase tracking-wider">v2.4.0</span>
        </div>
      </footer>
    </div>
  );
}
