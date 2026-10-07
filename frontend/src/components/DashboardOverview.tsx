import { useState } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  IndianRupee, 
  Compass, 
  CheckCircle2, 
  Clock, 
  Loader2,
  TrendingUp,
  Award,
  ChevronRight,
  Download,
  Search,
  Globe,
  Presentation,
  FileCheck,
  Megaphone,
  Briefcase,
  PiggyBank,
  ChevronLeft,
  Sparkles,
  Zap,
  RefreshCw,
  AlertCircle,
  Trash2
} from 'lucide-react';
import type { Startup } from '../types';
import { api } from '../services/api';

interface DashboardOverviewProps {
  currentStartup: Startup | null;
  onSubmitIdea: (idea: string, budget: number, location: string) => void;
  isLoading: boolean;
  onSelectStartup: (startup: Startup) => void;
  startupHistory: Startup[];
  onNewProject: () => void;
  onRetryStartup?: (id: string) => void;
  onDeleteStartup?: (id: string) => void;
}

const agentFeatures = [
  { icon: Search, label: 'Market Research', desc: 'TAM, CAGR, SWOT & competitor analysis', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
  { icon: MapPin, label: 'Digital Twin Map', desc: 'Real POI data, footfall & revenue scoring', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { icon: Award, label: 'Brand Kit', desc: 'Name, tagline, colors & typography', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/20' },
  { icon: PiggyBank, label: 'Financial Model', desc: 'Forecasts, break-even & cashflow', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { icon: Globe, label: 'Website Generator', desc: 'Responsive landing page with custom copy', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/20' },
  { icon: Presentation, label: 'Pitch Deck', desc: 'Investor-ready slide deck generator', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20' },
  { icon: Megaphone, label: 'Marketing Kit', desc: '30-day social plan & SEO keywords', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/20' },
  { icon: FileCheck, label: 'Compliance', desc: 'FSSAI, GST & legal licensing checklist', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
];

const agentSteps = [
  { id: 'founder', label: 'Founder Agent', desc: 'Parsing pitch parameters & business category' },
  { id: 'research', label: 'Research Agent', desc: 'Analyzing market size, CAGR & competitors SWOT' },
  { id: 'digital_twin', label: 'Digital Twin Agent', desc: 'Profiling spatial data & estimating footfall' },
  { id: 'branding', label: 'Branding Agent', desc: 'Crafting brand story, naming & color codes' },
  { id: 'product', label: 'Product Agent', desc: 'Designing buyer personas & 4-phase roadmap' },
  { id: 'finance', label: 'Finance Agent', desc: 'Allocating capital, pricing & 3-yr forecast' },
  { id: 'marketing', label: 'Marketing Agent', desc: 'Generating SEO keywords & 30-day socials' },
  { id: 'compliance', label: 'Compliance Agent', desc: 'Formulating legal licensing guidelines' },
  { id: 'website', label: 'Website Agent', desc: 'Selecting theme template & custom copy' },
  { id: 'pitch_deck', label: 'Pitch Deck Agent', desc: 'Synthesizing investor presentation deck slides' },
  { id: 'project_manager', label: 'Project Manager Agent', desc: 'Validating alignment & final output compiling' }
];

const statusBadge = (status: string) => {
  if (status === 'COMPLETED') return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Completed</span>;
  if (status === 'PROCESSING') return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">Processing</span>;
  if (status === 'PENDING_APPROVAL') return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">Review Ready</span>;
  if (status === 'FAILED') return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">Failed</span>;
  return null;
};

export default function DashboardOverview({
  currentStartup,
  onSubmitIdea,
  isLoading,
  onSelectStartup,
  startupHistory,
  onNewProject,
  onRetryStartup,
  onDeleteStartup
}: DashboardOverviewProps) {
  
  const [step, setStep] = useState(1);
  const [ideaInput, setIdeaInput] = useState('');
  const [budgetInput, setBudgetInput] = useState('1000000');
  const [locationInput, setLocationInput] = useState('Anna Nagar, Chennai');
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRetry = async () => {
    if (!currentStartup || isRetrying) return;
    if (onRetryStartup) {
      onRetryStartup(currentStartup.id);
      return;
    }
    setIsRetrying(true);
    setRetryError('');
    try {
      await api.retryStartup(currentStartup.id);
      window.location.reload();
    } catch (err: any) {
      setRetryError(err.message || 'Failed to retry workflow.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaInput || !budgetInput || !locationInput) return;
    onSubmitIdea(ideaInput, parseFloat(budgetInput), locationInput);
  };

  const handleFillExample = () => {
    setIdeaInput('I want to open a premium wood-fired coffee shop in Anna Nagar, Chennai with a modern co-working setup.');
    setBudgetInput('1000000');
    setLocationInput('Anna Nagar, Chennai');
    setStep(2);
  };

  const getStepStatus = (stepId: string) => {
    if (!currentStartup) return 'pending';
    if (currentStartup.status === 'COMPLETED') return 'completed';
    const stepsMap: Record<string, string> = {
      founder: 'founder',
      research: 'market_research',
      digital_twin: 'location_analysis',
      branding: 'branding',
      product: 'product',
      finance: 'finance',
      marketing: 'marketing',
      compliance: 'compliance',
      website: 'website',
      pitch_deck: 'pitch_deck',
      project_manager: 'project_manager'
    };
    const targetKey = stepsMap[stepId];
    if (targetKey === 'founder') {
      return currentStartup.workflow_steps.some(s => s.agent === 'founder') ? 'completed' : 'processing';
    }
    if (targetKey && (currentStartup as any)[targetKey]) return 'completed';
    const agentKeyMap: Record<string, string> = {
      founder: 'founder', research: 'research', digital_twin: 'digital_twin', branding: 'branding',
      product: 'product', finance: 'finance', marketing: 'marketing', compliance: 'compliance',
      website: 'website', pitch_deck: 'pitch_deck', project_manager: 'project_manager'
    };
    if (currentStartup.status === 'PROCESSING' && currentStartup.current_agent === agentKeyMap[stepId]) return 'processing';
    return 'pending';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-outfit font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-700 dark:from-slate-100 dark:to-indigo-400 bg-clip-text text-transparent">
          Startup Co-Founder Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
          Transform your raw ideas into comprehensive, investor-ready business plans, brand identities, responsive websites, and financial cashflow models automatically using LangGraph AI agents.
        </p>
      </div>

      {!currentStartup ? (
        <div className="space-y-8">
          {/* Wizard Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-8 rounded-2xl space-y-6">
              
              {/* Step progress indicator */}
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'}`}>
                  {step === 1 ? <Sparkles size={12} /> : <CheckCircle2 size={12} />}
                  <span>Step 1: Your Idea</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <Zap size={12} />
                  <span>Step 2: Configuration</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                        Raw Startup Pitch
                      </label>
                      <textarea
                        value={ideaInput}
                        onChange={(e) => setIdeaInput(e.target.value)}
                        placeholder="e.g., I want to open a premium specialty coffee shop with high-quality single-origin beans, a library theme, and co-working cabins..."
                        rows={5}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 resize-none"
                      />
                      <p className="text-[10px] text-slate-400">Be as descriptive as possible — the more detail, the better your startup plan.</p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => { if (ideaInput.trim()) setStep(2); }}
                        disabled={!ideaInput.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition duration-150 shadow-md shadow-indigo-600/10 disabled:opacity-40"
                      >
                        <span>Next: Configure</span>
                        <ArrowRight size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleFillExample}
                        className="px-4 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-sm font-medium transition duration-150"
                      >
                        Load Example Idea
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {/* Idea preview */}
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                      <span className="text-[9px] font-black uppercase text-indigo-400 block mb-1">Your Idea</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{ideaInput}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <IndianRupee size={14} /> Budget (INR)
                        </label>
                        <input
                          type="number"
                          value={budgetInput}
                          onChange={(e) => setBudgetInput(e.target.value)}
                          placeholder="1000000"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                        />
                        {budgetInput && (
                          <p className="text-[10px] text-slate-400">= ₹{parseFloat(budgetInput).toLocaleString('en-IN')}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <MapPin size={14} /> Location
                        </label>
                        <input
                          type="text"
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          placeholder="e.g. Anna Nagar, Chennai"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-sm font-medium transition duration-150"
                      >
                        <ChevronLeft size={16} />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition duration-150 shadow-md shadow-indigo-600/10 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <><Loader2 className="animate-spin" size={16} /><span>Launching Agents...</span></>
                        ) : (
                          <><Sparkles size={16} /><span>Initialize 11 Co-Founder Agents</span><ArrowRight size={16} /></>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* History Panel */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Recent Generations
              </h2>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {startupHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center space-y-2">
                    <Compass size={24} className="stroke-1" />
                    <p className="text-xs">No startup plans found yet.</p>
                    <p className="text-[10px] text-slate-500">Your generated plans will appear here.</p>
                  </div>
                ) : (
                  startupHistory.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => onSelectStartup(s)}
                      className={`w-full text-left p-4 border rounded-xl transition duration-150 group space-y-2 cursor-pointer ${
                        (currentStartup as Startup | null)?.id === s.id
                          ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/30'
                          : 'border-slate-100 dark:border-slate-900 hover:bg-slate-100/30 dark:hover:bg-slate-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                            {(s.branding?.company_name || s.idea).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {s.branding?.company_name || 'Extracting Parameters...'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{s.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {onDeleteStartup && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingId(deletingId === s.id ? null : s.id);
                              }}
                              title="Delete startup proposal"
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-0.5" />
                        </div>
                      </div>

                      {deletingId === s.id ? (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="pt-2 border-t border-rose-500/20 flex items-center justify-between gap-2 animate-fade-in"
                        >
                          <span className="text-[10px] font-bold text-rose-500">Delete proposal?</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setIsDeleting(true);
                                try {
                                  if (onDeleteStartup) {
                                    await onDeleteStartup(s.id);
                                  }
                                } finally {
                                  setIsDeleting(false);
                                  setDeletingId(null);
                                }
                              }}
                              disabled={isDeleting}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-md transition disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingId(null);
                              }}
                              className="px-2.5 py-1 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-semibold rounded-md transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          {statusBadge(s.status)}
                          <span className="text-[9px] text-slate-400">
                            ₹{(s.budget / 100000).toFixed(1)}L
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* What AI Builds Feature Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                What Your AI Co-Founders Build
              </h2>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {agentFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="glass-card p-4 rounded-xl flex flex-col gap-3 hover:shadow-md hover:scale-[1.02] transition-all cursor-default">
                    <div className={`w-9 h-9 rounded-xl ${feat.bg} flex items-center justify-center`}>
                      <Icon size={18} className={feat.color} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{feat.label}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Progress / Completed Screen */
        <div className="space-y-8">
          {/* Active Generation Control */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-indigo-500">
                {currentStartup.status === 'PROCESSING' ? 'LangGraph Processing' : 
                 currentStartup.status === 'PENDING_APPROVAL' ? 'Awaiting Your Approval' : 
                 currentStartup.status === 'COMPLETED' ? 'Generation Complete' : 'Generation Failed'}
              </p>
              <h2 className="text-xl font-bold font-outfit mt-1">
                {currentStartup.branding?.company_name || 'Planning Brand Setup'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl truncate">
                {currentStartup.idea}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Location</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{currentStartup.location}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Budget</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">₹{currentStartup.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                {(currentStartup.status === 'COMPLETED' || currentStartup.status === 'FAILED') && (
                  <button
                    onClick={onNewProject}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-semibold transition"
                  >
                    {currentStartup.status === 'COMPLETED' ? 'Create Another' : 'Try Another Idea'}
                  </button>
                )}
                {onDeleteStartup && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete proposal "${currentStartup.branding?.company_name || currentStartup.idea}"?`)) {
                        onDeleteStartup(currentStartup.id);
                      }
                    }}
                    className="p-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    title="Delete proposal"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {currentStartup.status === 'PROCESSING' ? (
            /* Processing Timeline */
            <div className="glass-panel p-8 rounded-2xl space-y-6">
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-indigo-500" size={20} />
                <h3 className="text-lg font-bold font-outfit">Orchestrator Execution Status</h3>
              </div>
              
              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-8 space-y-6">
                {agentSteps.map((step) => {
                  const status = getStepStatus(step.id);
                  return (
                    <div key={step.id} className="relative">
                      <span className={`absolute -left-[45px] top-1 w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all duration-300 ${
                        status === 'completed'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
                          : status === 'processing'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-800 dark:text-indigo-400 animate-pulse'
                          : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-600'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle2 size={12} className="text-emerald-500" />
                        ) : status === 'processing' ? (
                          <Loader2 size={12} className="animate-spin text-indigo-500" />
                        ) : (
                          <Clock size={12} />
                        )}
                      </span>
                      <div className="space-y-1">
                        <h4 className={`text-sm font-bold font-outfit ${
                          status === 'completed' ? 'text-slate-800 dark:text-slate-200' :
                          status === 'processing' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'
                        }`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentStartup.status === 'FAILED' ? (
            /* Failed State */
            <div className="space-y-6">
              <div className="glass-panel p-8 rounded-2xl border-l-4 border-rose-500 bg-rose-500/5 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl flex-shrink-0">
                    <AlertCircle size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold font-outfit text-slate-800 dark:text-slate-100">
                      Agent Workflow Failed
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      One or more AI co-founder agents encountered an error during execution. This may be due to an API timeout or unexpected model response. You can retry the full workflow from scratch — all 11 agents will re-run cleanly.
                    </p>
                    {retryError && (
                      <p className="text-xs text-rose-500 font-semibold mt-2">{retryError}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/15 disabled:opacity-50 transition"
                  >
                    {isRetrying ? (
                      <><Loader2 size={13} className="animate-spin" /><span>Retrying...</span></>
                    ) : (
                      <><RefreshCw size={13} /><span>Retry All 11 Agents</span></>
                    )}
                  </button>
                  <button
                    onClick={onNewProject}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-xl transition"
                  >
                    Start New Idea Instead
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Completed Dashboard Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Brand Summary */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Company</span>
                    <Award size={18} />
                  </div>
                  <h3 className="text-lg font-extrabold font-outfit truncate text-slate-800 dark:text-slate-100">
                    {currentStartup.branding?.company_name || 'Nectar Brews'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1.5 truncate">
                    "{currentStartup.branding?.tagline}"
                  </p>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-900/60 pt-3 mt-4 flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full">
                    Branded
                  </span>
                </div>
              </div>

              {/* Finance Projections */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Projections (Y1)</span>
                    <TrendingUp size={18} />
                  </div>
                  <h3 className="text-lg font-extrabold font-outfit text-slate-800 dark:text-slate-100">
                    ₹{currentStartup.finance?.revenue_forecast.year_1.toLocaleString() || '18,00,000'}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">ROI:</span>
                    <span className="text-xs font-bold text-emerald-500">
                      {currentStartup.finance?.roi_percentage || 42}%
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-900/60 pt-3 mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                  Payback: <span className="font-bold text-slate-700 dark:text-slate-300">{currentStartup.finance?.payback_period_months || 18} Months</span>
                </div>
              </div>

              {/* Location Viability */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Digital Twin</span>
                    <MapPin size={18} />
                  </div>
                  <h3 className="text-lg font-extrabold font-outfit text-slate-800 dark:text-slate-100">
                    Score: {currentStartup.location_analysis?.metrics.potential_score || 85}/100
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Footfall:</span>
                    <span className="text-xs font-bold text-indigo-500">
                      {currentStartup.location_analysis?.metrics.estimated_footfall.toLocaleString() || '3,400'}/day
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-900/60 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Risk: {currentStartup.location_analysis?.metrics.risk_score || 35}%</span>
                  <span className="text-emerald-500 font-bold uppercase">Optimal</span>
                </div>
              </div>

              {/* USP */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Unique Selling Prop</span>
                    <Compass size={18} />
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3">
                    {currentStartup.product?.usp || 'Premium wood-fired coffee sourcing combined with custom co-working hotdesks.'}
                  </p>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-900/60 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>Category</span>
                  <span className="text-indigo-500">{currentStartup.website?.template_category.replace('_', ' ') || 'Local Business'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Download Center */}
          {currentStartup.status === 'COMPLETED' && (
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
                <Download size={18} className="text-indigo-500" />
                <h3 className="text-base font-extrabold font-outfit text-slate-800 dark:text-slate-100">Deliverables Download Center</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download professional-grade execution reports compiled by your AI Co-Founder agents in standard Markdown formats.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {[
                  { type: 'business_plan', label: 'Business Plan', desc: 'Strategic objectives & SWOT analysis', icon: Briefcase },
                  { type: 'financials', label: 'Financial Report', desc: 'Operating budgets & cash flow models', icon: PiggyBank },
                  { type: 'marketing', label: 'Marketing Kit', desc: 'SEO targets & 30-day social calendar', icon: Megaphone },
                  { type: 'roadmap', label: 'Launch Roadmap', desc: '4-phase project execution Gantt', icon: TrendingUp },
                  { type: 'location', label: 'Location Report', desc: 'Demographics counts & POIs maps data', icon: MapPin },
                  { type: 'compliance', label: 'Compliance Checklist', desc: 'FSSAI, GST & licensing guidelines', icon: FileCheck },
                  { type: 'pitch_deck', label: 'Investor Pitch Deck', desc: 'Presentation slides structure outline', icon: Presentation },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <div 
                      key={r.type} 
                      className="p-4 border border-slate-100 dark:border-slate-900 rounded-xl bg-white/40 dark:bg-slate-900/10 flex flex-col justify-between hover:shadow-md hover:border-indigo-500/20 transition group"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-indigo-500">
                          <Icon size={16} />
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.label}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{r.desc}</p>
                      </div>
                      
                      <button
                        onClick={() => window.open(api.getDownloadUrl(currentStartup.id, r.type), '_blank')}
                        className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <Download size={12} />
                        <span>Download File</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PM Notes on Completed */}
          {currentStartup.status === 'COMPLETED' && (
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-emerald-500 dark:border-emerald-600 bg-emerald-500/5 dark:bg-emerald-950/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} />
                <h3 className="text-sm font-extrabold uppercase tracking-wider">Project Manager Executive Brief</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                All business planning packages have been verified and compiled successfully. Use the left sidebar tabs to explore the granular reports (market research, digital maps, finance spreadsheets, logo builders, and compliance requirements).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
