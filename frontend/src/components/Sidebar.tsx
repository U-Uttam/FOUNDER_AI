import { 
  LayoutDashboard, 
  Search, 
  MapPin, 
  Award, 
  Briefcase, 
  PiggyBank, 
  Megaphone, 
  Globe, 
  Presentation, 
  FileCheck,
  Moon,
  Sun,
  ShieldCheck,
  Loader2,
  Lock,
  CheckCircle2,
  ChevronRight,
  Plus,
  Zap,
  Trash2
} from 'lucide-react';
import type { Startup } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  currentStartup: Startup | null;
  onNewProject: () => void;
  onDeleteStartup?: (id: string) => void;
}

const tabs = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard, stateKey: null, emoji: '🏠' },
  { id: 'research', name: 'Market Research', icon: Search, stateKey: 'market_research', emoji: '📊' },
  { id: 'digital_twin', name: 'Digital Twin Map', icon: MapPin, stateKey: 'location_analysis', emoji: '🗺️' },
  { id: 'branding', name: 'Brand Kit', icon: Award, stateKey: 'branding', emoji: '🎨' },
  { id: 'product', name: 'Product Roadmap', icon: Briefcase, stateKey: 'product', emoji: '📋' },
  { id: 'finance', name: 'Financial Plan', icon: PiggyBank, stateKey: 'finance', emoji: '💰' },
  { id: 'marketing', name: 'Marketing Pack', icon: Megaphone, stateKey: 'marketing', emoji: '📣' },
  { id: 'website', name: 'Website Generator', icon: Globe, stateKey: 'website', emoji: '🌐' },
  { id: 'pitch_deck', name: 'Pitch Deck', icon: Presentation, stateKey: 'pitch_deck', emoji: '🎤' },
  { id: 'compliance', name: 'Compliance', icon: FileCheck, stateKey: 'compliance', emoji: '⚖️' },
];

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode, 
  currentStartup,
  onNewProject,
  onDeleteStartup
}: SidebarProps) {


  const getTabStatus = (stateKey: string | null) => {
    if (!currentStartup) return 'locked';
    if (!stateKey) return 'available';
    
    const hasData = !!(currentStartup as any)[stateKey];
    if (hasData) return 'completed';

    const agentMap: Record<string, string> = {
      market_research: 'research',
      location_analysis: 'digital_twin',
      branding: 'branding',
      product: 'product',
      finance: 'finance',
      marketing: 'marketing',
      website: 'website',
      pitch_deck: 'pitch_deck',
      compliance: 'compliance'
    };

    if (currentStartup.status === 'PROCESSING' && currentStartup.current_agent === agentMap[stateKey]) {
      return 'processing';
    }

    return 'locked';
  };

  // Calculate completion progress
  const dataKeys = tabs.filter(t => t.stateKey).map(t => t.stateKey as string);
  const completedCount = currentStartup 
    ? dataKeys.filter(k => !!(currentStartup as any)[k]).length
    : 0;
  const totalCount = dataKeys.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <aside className="w-64 border-r border-slate-200/50 dark:border-slate-800/40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 z-30">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <span className="font-outfit font-extrabold text-lg tracking-tight text-slate-800 dark:text-slate-100 block leading-tight">
              FounderAI
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest block">
              Multi-Agent Co-Founder
            </span>
          </div>
        </div>

        {/* Completion Progress (shown only when there's an active project) */}
        {currentStartup && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Generation Progress
              </span>
              <span className={`text-[10px] font-black ${completedCount === totalCount ? 'text-emerald-500' : 'text-indigo-500'}`}>
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${completedCount === totalCount ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {dataKeys.map((key, i) => {
                const done = !!(currentStartup as any)[key];
                const processing = currentStartup.status === 'PROCESSING' && 
                  currentStartup.current_agent === {
                    market_research: 'research', location_analysis: 'digital_twin', branding: 'branding',
                    product: 'product', finance: 'finance', marketing: 'marketing',
                    website: 'website', pitch_deck: 'pitch_deck', compliance: 'compliance'
                  }[key];
                return (
                  <div 
                    key={i} 
                    className={`w-4 h-1.5 rounded-full transition-all duration-300 ${done ? 'bg-emerald-500' : processing ? 'bg-indigo-400 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* New Project Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onNewProject}
          disabled={!currentStartup}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-slate-200 disabled:to-slate-200 disabled:dark:from-slate-800/50 disabled:dark:to-slate-800/50 disabled:text-slate-400 disabled:dark:text-slate-600 disabled:shadow-none text-white rounded-xl text-xs font-bold transition-all duration-150 shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 disabled:cursor-not-allowed group"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-200" />
          <span>New Startup Proposal</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        {tabs.map((tab) => {
          const status = getTabStatus(tab.stateKey);
          const isSelected = activeTab === tab.id;
          const isLocked = status === 'locked';
          const isDone = status === 'completed';
          const isProcessing = status === 'processing';

          return (
            <button
              key={tab.id}
              onClick={() => !isLocked && setActiveTab(tab.id)}
              disabled={isLocked}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : isLocked
                  ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <tab.icon 
                  size={16} 
                  className={`flex-shrink-0 ${
                    isSelected ? 'text-white' : 
                    isDone ? 'text-emerald-500' :
                    isProcessing ? 'text-indigo-500 animate-pulse' :
                    'text-slate-400'
                  }`} 
                />
                <span className="text-xs font-medium">{tab.name}</span>
              </div>
              
              {/* Status indicator */}
              <div className="flex-shrink-0">
                {isSelected && isDone && <CheckCircle2 size={13} className="text-white/70" />}
                {isSelected && !isDone && <ChevronRight size={13} className="text-white/50" />}
                {!isSelected && isProcessing && <Loader2 size={12} className="animate-spin text-indigo-500" />}
                {!isSelected && isDone && <CheckCircle2 size={12} className="text-emerald-500" />}
                {!isSelected && isLocked && !isDone && <Lock size={10} className="text-slate-300 dark:text-slate-700" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer: Active Project + Dark Mode */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/40 space-y-3">
        {currentStartup && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                currentStartup.status === 'PROCESSING' ? 'bg-amber-400 animate-pulse' :
                currentStartup.status === 'COMPLETED' ? 'bg-emerald-500' :
                currentStartup.status === 'PENDING_APPROVAL' ? 'bg-indigo-400' :
                'bg-rose-500'
              }`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-1 truncate">
                {currentStartup.status === 'PROCESSING' ? `Agent: ${currentStartup.current_agent}` :
                 currentStartup.status === 'COMPLETED' ? 'Complete' :
                 currentStartup.status === 'PENDING_APPROVAL' ? 'Review Ready' : 
                 currentStartup.status}
              </span>
              {onDeleteStartup && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete startup "${currentStartup.branding?.company_name || currentStartup.idea}"?`)) {
                      onDeleteStartup(currentStartup.id);
                    }
                  }}
                  title="Delete startup proposal"
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <p className="text-xs font-semibold truncate text-slate-700 dark:text-slate-300">
              {currentStartup.branding?.company_name || 'Extracting parameters...'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{currentStartup.location}</p>
            {currentStartup.status === 'PROCESSING' && (
              <div className="flex items-center gap-1.5 text-[9px] text-indigo-500 font-bold">
                <Zap size={9} />
                <span>LangGraph agents running</span>
              </div>
            )}
          </div>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-900/40 text-xs font-medium transition group"
        >
          {darkMode ? (
            <>
              <Sun size={16} className="text-amber-500" />
              <span>Switch to Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-indigo-500" />
              <span>Switch to Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
