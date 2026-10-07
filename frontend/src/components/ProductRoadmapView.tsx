import { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle,
  Blocks,
  Network,
  Gem,
  Coins,
  DollarSign,
  ArrowRight,
  Smile,
  SmilePlus,
  Meh,
  AlertCircle
} from 'lucide-react';
import type { ProductData, CustomerJourneyStage } from '../types';

interface ProductRoadmapViewProps {
  productData: ProductData | undefined;
}

const phaseColors = [
  { bg: 'bg-indigo-500', light: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-200 dark:border-indigo-900/40', text: 'text-indigo-600 dark:text-indigo-400', pill: 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400', pill: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900/40', text: 'text-amber-600 dark:text-amber-400', pill: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' },
  { bg: 'bg-violet-500', light: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200 dark:border-violet-900/40', text: 'text-violet-600 dark:text-violet-400', pill: 'bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300' },
];

const feelingIcon = (feeling: string) => {
  const f = feeling.toLowerCase();
  if (f.includes('excit') || f.includes('happy') || f.includes('delight') || f.includes('joy')) return <SmilePlus size={16} className="text-emerald-500" />;
  if (f.includes('satisf') || f.includes('confid') || f.includes('pleased')) return <Smile size={16} className="text-indigo-500" />;
  if (f.includes('frustrat') || f.includes('confus') || f.includes('overwhelm')) return <Meh size={16} className="text-amber-500" />;
  if (f.includes('anxious') || f.includes('concern') || f.includes('worried')) return <AlertCircle size={16} className="text-rose-500" />;
  return <Smile size={16} className="text-slate-400" />;
};

export default function ProductRoadmapView({ productData }: ProductRoadmapViewProps) {
  if (!productData) {
    return (
      <div className="p-8 text-center text-slate-400">
        No product data generated.
      </div>
    );
  }

  const { usp, personas, business_model, roadmap, customer_journey } = productData;
  const value_proposition = (productData as any).value_proposition as string | undefined;
  const [activePersonaIdx, setActivePersonaIdx] = useState(0);

  useEffect(() => {
    setActivePersonaIdx(0);
  }, [productData]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-slate-800 dark:text-slate-100">
          Product & Business Architecture
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Define core USPs, target customer personas, Lean Business Canvas grids, and deployment roadmaps.
        </p>
      </div>

      {/* USP Banner */}
      <div className="p-6 border border-indigo-100 dark:border-indigo-950/40 bg-indigo-500/5 dark:bg-indigo-950/10 rounded-2xl flex gap-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex-shrink-0 flex items-center justify-center">
          <Gem size={24} />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Unique Selling Proposition (USP)
          </h3>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
            {usp}
          </p>
          {value_proposition && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-indigo-100/50 dark:border-indigo-900/30 mt-2">
              <span className="font-bold uppercase text-[9px] text-indigo-400 block mb-0.5">Value Proposition</span>
              {value_proposition}
            </p>
          )}
        </div>
      </div>

      {/* Customer Personas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Persona Selector */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users size={16} /> Customer Personas
          </h3>
          <div className="flex flex-col gap-2">
            {personas.map((persona, idx) => {
              const personaColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500'];
              return (
                <button
                  key={idx}
                  onClick={() => setActivePersonaIdx(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center gap-3 ${
                    activePersonaIdx === idx
                      ? 'border-indigo-500/50 bg-indigo-500/5 dark:bg-indigo-950/10'
                      : 'border-slate-100 dark:border-slate-900 bg-white/20 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/20'
                  }`}
                >
                  {/* Avatar circle */}
                  <div className={`w-9 h-9 rounded-xl ${personaColors[idx % personaColors.length]} flex items-center justify-center text-white text-sm font-black flex-shrink-0`}>
                    {persona.name.charAt(0)}
                  </div>
                  <div>
                    <div className={`text-xs font-extrabold ${activePersonaIdx === idx ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {persona.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{persona.role}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona Detail Panel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          {personas[activePersonaIdx] && (
            <div className="space-y-4 h-full">
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-900 pb-4">
                <div className={`w-14 h-14 rounded-2xl ${['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'][activePersonaIdx % 3]} flex items-center justify-center text-white text-2xl font-black`}>
                  {personas[activePersonaIdx].name.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Persona</span>
                  <h4 className="text-base font-extrabold font-outfit text-slate-800 dark:text-slate-200 mt-0.5">
                    {personas[activePersonaIdx].name}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">{personas[activePersonaIdx].role}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <SmilePlus size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Goals & Aspirations</span>
                  </div>
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                      {personas[activePersonaIdx].goals}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Frustrations & Pain Points</span>
                  </div>
                  <div className="p-3 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl border border-rose-100 dark:border-rose-900/30">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                      {personas[activePersonaIdx].pain_points}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Journey Map */}
      {customer_journey && customer_journey.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ArrowRight size={16} /> Customer Journey Map
          </h3>
          <div className="relative">
            {/* Horizontal connector line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-emerald-200 to-violet-200 dark:from-indigo-900/40 dark:via-emerald-900/40 dark:to-violet-900/40 mx-8" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
              {customer_journey.map((step: CustomerJourneyStage, idx) => {
                const stageColors = [
                  'border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/10',
                  'border-sky-200 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/10',
                  'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/10',
                  'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10',
                  'border-violet-200 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/10',
                ];
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${stageColors[idx % stageColors.length]} space-y-3 flex flex-col items-center text-center`}>
                    {/* Stage node */}
                    <div className={`w-10 h-10 rounded-full bg-white dark:bg-slate-950 border-2 flex items-center justify-center shadow-sm ${
                      idx === 0 ? 'border-indigo-400' : idx === customer_journey.length - 1 ? 'border-violet-400' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {feelingIcon(step.feeling)}
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">{step.stage}</span>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-semibold">{step.action}</p>
                      <p className="text-[9px] text-slate-400 italic mt-1">{step.feeling}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lean Business Model Canvas */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Blocks size={16} /> Lean Business Model Canvas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Network, color: 'indigo', label: 'Key Partners', items: business_model.key_partners, dot: 'bg-indigo-400' },
            { icon: Gem, color: 'emerald', label: 'Value Props', text: business_model.value_propositions, dot: 'bg-emerald-400' },
            { icon: DollarSign, color: 'rose', label: 'Cost Structure', items: business_model.cost_structure, dot: 'bg-rose-400' },
            { icon: Coins, color: 'teal', label: 'Revenue Streams', items: business_model.revenue_streams, dot: 'bg-teal-400' },
          ].map((card, idx) => {
            const Icon = card.icon;
            const colorMap: Record<string, string> = { indigo: 'text-indigo-500', emerald: 'text-emerald-500', rose: 'text-rose-500', teal: 'text-teal-500' };
            return (
              <div key={idx} className="glass-panel p-5 rounded-2xl space-y-3 hover:shadow-xl transition-shadow">
                <div className={`flex items-center gap-2 ${colorMap[card.color]}`}>
                  <Icon size={16} />
                  <h4 className="text-xs font-bold uppercase tracking-wider">{card.label}</h4>
                </div>
                {card.items ? (
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {card.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${card.dot} flex-shrink-0 mt-1.5`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{card.text}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gantt-style Roadmap */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          Execution Rollout Roadmap
        </h3>
        
        {/* Phase track bars */}
        <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-6">
          {roadmap.map((phase, idx) => {
            const c = phaseColors[idx % phaseColors.length];
            return (
              <div
                key={idx}
                className={`${c.bg} h-full flex items-center justify-center`}
                style={{ width: `${100 / roadmap.length}%` }}
                title={phase.phase}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmap.map((phase, idx) => {
            const c = phaseColors[idx % phaseColors.length];
            return (
              <div key={idx} className={`p-5 rounded-2xl border ${c.border} ${c.light}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center text-white text-xs font-black`}>
                    {idx + 1}
                  </div>
                  <h4 className={`text-sm font-extrabold font-outfit ${c.text}`}>
                    {phase.phase}
                  </h4>
                </div>
                
                <div className="space-y-2">
                  {phase.tasks.map((task, taskIdx) => (
                    <div 
                      key={taskIdx} 
                      className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle size={13} className={`${c.text} flex-shrink-0`} />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>

                {/* Task pill count */}
                <div className="mt-4 pt-3 border-t border-current/10 flex justify-between items-center">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${c.text}`}>
                    Phase {idx + 1}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.pill}`}>
                    {phase.tasks.length} tasks
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
