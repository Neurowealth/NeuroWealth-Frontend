import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Play, Square, RotateCcw, Activity, Wallet, TrendingUp, History, ArrowDownRight, ArrowUpRight, Zap } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useSimulation } from "./hooks/useSimulation";
import { cn } from "./lib/utils";

function App() {
  const { isRunning, balance, events, chartData, totalYield, start, stop, reset } = useSimulation();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans">
      <Toaster theme="dark" position="bottom-right" />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-8 h-8 text-indigo-400 fill-indigo-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                NeuroWealth
              </h1>
            </div>
            <p className="text-gray-400">Autonomous AI Agent on Stellar</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/10 shadow-2xl">
            <button 
              onClick={start}
              disabled={isRunning}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                isRunning 
                  ? "bg-indigo-500/20 text-indigo-400 opacity-50 cursor-not-allowed" 
                  : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02]"
              )}
            >
              <Play className="w-4 h-4" /> Start
            </button>
            <button 
              onClick={stop}
              disabled={!isRunning}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                !isRunning 
                  ? "bg-red-500/20 text-red-400 opacity-50 cursor-not-allowed" 
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02]"
              )}
            >
              <Square className="w-4 h-4 fill-current" /> Stop
            </button>
            <button 
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-[1.02]"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Wallet className="w-5 h-5" />
                  <span className="font-semibold text-sm tracking-wide uppercase">Total Portfolio</span>
                </div>
                <div className="text-4xl font-bold text-white tabular-nums tracking-tight">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-2 text-sm text-gray-400 flex items-center gap-1">
                  <span className="text-green-400 flex items-center"><ArrowUpRight className="w-3 h-3"/> Active</span>
                  <span>in Soroban Vault</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold text-sm tracking-wide uppercase">AI Yield Earned</span>
                </div>
                <div className="text-4xl font-bold text-white tabular-nums tracking-tight">
                  ${totalYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-2 text-sm text-gray-400 flex items-center gap-1">
                  <span className="text-cyan-400 flex items-center"><Activity className="w-3 h-3 mr-1"/> Auto-compounding</span>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Live Performance</h3>
                  <p className="text-sm text-gray-400">Realtime balance tracking</p>
                </div>
                {isRunning && (
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm text-green-400 font-medium">Stream Active</span>
                  </div>
                )}
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.75rem', color: '#fff' }}
                      itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#818cf8" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorBalance)" 
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl flex flex-col h-[700px] overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-black/50 sticky top-0 z-10">
              <div className="flex items-center gap-2 text-white">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold">Event Stream</h3>
              </div>
              <p className="text-sm text-gray-400 mt-1">Autonomous agent actions</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                  <Activity className="w-12 h-12 opacity-20" />
                  <p>Awaiting events...</p>
                </div>
              ) : (
                events.map((event) => (
                  <div 
                    key={event.id}
                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {event.type === 'Deposit' && <ArrowDownRight className="w-4 h-4 text-green-400" />}
                        {event.type === 'Withdrawal' && <ArrowUpRight className="w-4 h-4 text-red-400" />}
                        {event.type === 'Rebalancing' && <Activity className="w-4 h-4 text-indigo-400" />}
                        <span className="font-medium text-white">{event.type}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">{event.timestamp}</span>
                    </div>
                    
                    {event.amount && (
                      <div className="text-2xl font-bold text-gray-200 tabular-nums">
                        {event.type === 'Withdrawal' ? '-' : '+'}${event.amount.toFixed(2)}
                      </div>
                    )}
                    
                    {event.type === 'Rebalancing' && (
                      <div className="space-y-1 mt-2">
                        <div className="text-sm text-gray-300">
                          Yield protocol shift → <span className="font-semibold text-white">{event.protocol}</span>
                        </div>
                        <div className="inline-block px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                          Expected APY: {event.apy}%
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-mono">ID: {event.id}</span>
                      <span className="text-xs flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;
