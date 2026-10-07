import { 
  TrendingUp, 
  UsersRound, 
  BookOpenText, 
  Eye, 
  SearchCode,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  AlertOctagon,
  Rocket,
  MessageSquare
} from 'lucide-react';
import type { MarketResearch } from '../types';

// Helper to reliably extract plain string from primitives or LLM generated nested objects
function extractText(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    return (
      val.opportunity ||
      val.trend ||
      val.text ||
      val.point ||
      val.title ||
      val.description ||
      val.strength ||
      val.weakness ||
      val.name ||
      val.segment ||
      val.needs ||
      Object.values(val)
        .filter(v => typeof v === 'string' || typeof v === 'number')
        .join(' - ') ||
      JSON.stringify(val)
    );
  }
  return String(val);
}

interface MarketResearchViewProps {
  researchData: MarketResearch | undefined;
}

export default function MarketResearchView({ researchData }: MarketResearchViewProps) {
  if (!researchData) {
    return (
      <div className="p-8 text-center text-slate-400">
        No market research data generated.
      </div>
    );
  }

  const market_size = extractText(researchData.market_size || 'N/A');
  const industry_growth = extractText(researchData.industry_growth || 'N/A');
  const competitor_analysis = (researchData as any).competitor_analysis as string | undefined;
  const customer_analysis = (researchData as any).customer_analysis as string | undefined;
  
  const raw_growth = (researchData as any).growth_opportunities;
  const growth_opportunities: string[] = Array.isArray(raw_growth)
    ? raw_growth.map(extractText).filter(Boolean)
    : [];

  const raw_trends = researchData.industry_trends;
  const industry_trends: string[] = Array.isArray(raw_trends)
    ? raw_trends.map(extractText).filter(Boolean)
    : [];

  const raw_competitors = Array.isArray(researchData.competitors) ? researchData.competitors : [];
  const competitors = raw_competitors.map(c => ({
    name: extractText((c as any).name || 'Competitor'),
    strength: extractText((c as any).strength || 'Market presence'),
    weakness: extractText((c as any).weakness || 'Market vulnerability'),
    category_tier: (c as any).category_tier,
    address: (c as any).address
  }));

  const raw_segments = Array.isArray(researchData.customer_segments) ? researchData.customer_segments : [];
  const customer_segments = raw_segments.map(s => ({
    segment: extractText((s as any).segment || (s as any).name || 'Target Segment'),
    needs: extractText((s as any).needs || (s as any).description || 'Specialized customer needs')
  }));

  const swot = researchData.swot || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  };

  const toCleanArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map(extractText).filter(Boolean);
  };

  const swotConfig = [
    {
      key: 'strengths',
      label: 'Strengths',
      sublabel: 'Internal',
      icon: ShieldCheck,
      items: toCleanArray(swot.strengths),
      color: 'indigo',
      bar: '#4f46e5',
      bg: 'bg-indigo-50/40 dark:bg-indigo-950/10',
      border: 'border-indigo-100 dark:border-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      dot: 'bg-indigo-400'
    },
    {
      key: 'weaknesses',
      label: 'Weaknesses',
      sublabel: 'Internal',
      icon: AlertTriangle,
      items: toCleanArray(swot.weaknesses),
      color: 'rose',
      bar: '#ef4444',
      bg: 'bg-rose-50/40 dark:bg-rose-950/10',
      border: 'border-rose-100 dark:border-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      dot: 'bg-rose-400'
    },
    {
      key: 'opportunities',
      label: 'Opportunities',
      sublabel: 'External',
      icon: Lightbulb,
      items: toCleanArray(swot.opportunities),
      color: 'emerald',
      bar: '#10b981',
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/10',
      border: 'border-emerald-100 dark:border-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-400'
    },
    {
      key: 'threats',
      label: 'Threats',
      sublabel: 'External',
      icon: AlertOctagon,
      items: toCleanArray(swot.threats),
      color: 'amber',
      bar: '#f59e0b',
      bg: 'bg-amber-50/40 dark:bg-amber-950/10',
      border: 'border-amber-100 dark:border-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-400'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-slate-800 dark:text-slate-100">
          Market Analysis & Research Report
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Industry metrics, profiling competitors, target customer needs, and strategic SWOT matrices.
        </p>
      </div>

      {/* Key Metrics Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <SearchCode size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              Total Addressable Market (TAM)
            </span>
            <span className="text-lg font-extrabold font-outfit text-slate-800 dark:text-slate-200">
              {market_size}
            </span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              Market Growth Rate (CAGR)
            </span>
            <span className="text-lg font-extrabold font-outfit text-slate-800 dark:text-slate-200">
              {industry_growth}
            </span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <Eye size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              Competitors Profiled
            </span>
            <span className="text-lg font-extrabold font-outfit text-slate-800 dark:text-slate-200">
              {competitors.length} Local Players
            </span>
          </div>
        </div>
      </div>

      {/* SWOT Matrix — Four Quadrant Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <BookOpenText size={16} /> SWOT Analysis Matrix
        </h3>

        {/* Aggregate Visual Bar */}
        <div className="glass-panel p-4 rounded-2xl flex gap-1 h-8 overflow-hidden">
          {swotConfig.map((q, i) => (
            <div
              key={i}
              className="h-full rounded-lg flex items-center justify-center transition-all duration-500"
              style={{ 
                width: `${Math.max(1, q.items.length) * 25}%`,
                backgroundColor: q.bar,
                opacity: 0.85
              }}
              title={`${q.label}: ${q.items.length} items`}
            >
              <span className="text-white text-[9px] font-black truncate px-1">{q.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {swotConfig.map((q) => {
            const Icon = q.icon;
            return (
              <div key={q.key} className={`p-6 rounded-2xl border ${q.bg} ${q.border} space-y-3`}>
                <div className={`flex items-center justify-between`}>
                  <div className={`flex items-center gap-2 ${q.text}`}>
                    <Icon size={18} />
                    <h4 className="font-bold font-outfit text-sm uppercase tracking-wider">{q.label}</h4>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${q.border} ${q.text}`}>
                    {q.sublabel}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {q.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1.5 flex flex-col gap-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${q.dot}`} />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item}</span>
                    </li>
                  ))}
                  {q.items.length === 0 && (
                    <li className="text-xs text-slate-400 italic">No points specified.</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitor Landscape & Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Competitor Scorecards */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Eye size={16} /> Competitor Landscape
          </h3>

          {competitor_analysis && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border-l-4 border-indigo-500/50">
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                {competitor_analysis}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {competitors.map((comp, idx) => (
              <div key={idx} className="p-4 border border-slate-100 dark:border-slate-900 bg-white/40 dark:bg-slate-900/20 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-xs font-black text-indigo-500 dark:text-indigo-400">
                      {comp.name.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{comp.name}</h4>
                        {(comp as any).category_tier && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                            {(comp as any).category_tier}
                          </span>
                        )}
                      </div>
                      {(comp as any).address && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-xs mt-0.5">
                          {(comp as any).address}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">#{idx + 1}</span>
                </div>
                
                {/* Strength vs Weakness split bar */}
                <div className="space-y-1">
                  <div className="flex h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400" style={{ width: '55%' }} />
                    <div className="bg-rose-400" style={{ width: '45%' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div>
                      <span className="text-emerald-500 font-bold block uppercase tracking-wide">▲ Strength</span>
                      <span className="text-slate-600 dark:text-slate-400">{comp.strength}</span>
                    </div>
                    <div>
                      <span className="text-rose-500 font-bold block uppercase tracking-wide">▼ Vulnerability</span>
                      <span className="text-slate-600 dark:text-slate-400">{comp.weakness}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <UsersRound size={16} /> Customer Segments
          </h3>

          {customer_analysis && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border-l-4 border-emerald-500/50">
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                {customer_analysis}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {customer_segments.map((seg, idx) => {
              const colors = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500'];
              return (
                <div key={idx} className="p-4 border border-slate-100 dark:border-slate-900 bg-white/40 dark:bg-slate-900/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center text-white text-xs font-black`}>
                      {idx + 1}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{seg.segment}</h4>
                  </div>
                  <div className="ml-10">
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 block mb-0.5">Key Need</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{seg.needs}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Growth Opportunities */}
      {growth_opportunities && growth_opportunities.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Rocket size={16} /> Growth Opportunities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {growth_opportunities.map((opp, idx) => (
              <div key={idx} className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/30 rounded-xl flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {opp}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry Trends */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <MessageSquare size={16} /> Industry Trends & Macro Factors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {industry_trends.map((trend, idx) => (
            <div key={idx} className="p-4 border border-slate-100 dark:border-slate-900/60 rounded-xl flex items-start gap-3 bg-white/30 dark:bg-slate-900/10 hover:bg-white/50 dark:hover:bg-slate-900/20 transition">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {trend}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

