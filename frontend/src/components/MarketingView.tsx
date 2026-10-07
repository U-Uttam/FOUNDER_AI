import { useState } from 'react';
import { 
  Megaphone, 
  Search, 
  Mail, 
  Copy, 
  Check, 
  Calendar,
  Layers,
  Heart,
  MessageCircle,
  Share2,
  Bookmark
} from 'lucide-react';
import type { MarketingData } from '../types';

interface MarketingViewProps {
  marketingData: MarketingData | undefined;
}

export default function MarketingView({ marketingData }: MarketingViewProps) {
  if (!marketingData) {
    return (
      <div className="p-8 text-center text-slate-400">
        No marketing data generated.
      </div>
    );
  }

  const { seo_keywords, marketing_strategy, email_campaign, social_media_plan } = marketingData;
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPostIdx, setCopiedPostIdx] = useState<number | null>(null);

  const handleCopyEmail = () => {
    const text = `Subject: ${email_campaign.subject}\n\n${email_campaign.body}`;
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1500);
  };

  const handleCopyPost = (caption: string, idx: number) => {
    navigator.clipboard.writeText(caption);
    setCopiedPostIdx(idx);
    setTimeout(() => setCopiedPostIdx(null), 1500);
  };

  // Platform styling config
  const getPlatformConfig = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return {
      gradient: 'from-purple-500 via-pink-500 to-orange-400',
      bg: 'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-400/10',
      border: 'border-pink-200/60 dark:border-pink-900/40',
      badge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      ),
      likes: Math.floor(Math.random() * 800) + 120,
      comments: Math.floor(Math.random() * 60) + 10
    };
    if (p.includes('linkedin')) return {
      gradient: 'from-blue-600 to-blue-700',
      bg: 'bg-blue-600/10 dark:bg-blue-950/20',
      border: 'border-blue-200/60 dark:border-blue-900/40',
      badge: 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
        </svg>
      ),
      likes: Math.floor(Math.random() * 300) + 50,
      comments: Math.floor(Math.random() * 30) + 5
    };
    if (p.includes('facebook')) return {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10 dark:bg-blue-950/20',
      border: 'border-blue-200/60 dark:border-blue-900/40',
      badge: 'bg-sky-600/10 text-sky-600 dark:text-sky-400 border border-sky-600/20',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      ),
      likes: Math.floor(Math.random() * 500) + 80,
      comments: Math.floor(Math.random() * 40) + 8
    };
    // Twitter/X
    return {
      gradient: 'from-slate-800 to-slate-900',
      bg: 'bg-slate-900/10 dark:bg-slate-800/20',
      border: 'border-slate-200/60 dark:border-slate-800/40',
      badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
        </svg>
      ),
      likes: Math.floor(Math.random() * 400) + 60,
      comments: Math.floor(Math.random() * 50) + 5
    };
  };

  // Build calendar heatmap: 30 day grid
  const postDaySet = new Set(social_media_plan.map(p => p.day));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-slate-800 dark:text-slate-100">
          Marketing & Go-To-Market Kit
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          SEO target search queries, structured marketing strategies, email marketing copies, and social schedules.
        </p>
      </div>

      {/* Strategy + SEO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Strategy */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Megaphone size={16} /> GTM Marketing Strategy
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
            {marketing_strategy}
          </p>
        </div>

        {/* SEO Keywords */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Search size={16} /> SEO Keywords
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {seo_keywords.map((word, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/40 rounded-xl text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900/40 transition cursor-default"
              >
                #{word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Gmail-style Email Client */}
      <div className="glass-panel rounded-2xl overflow-hidden space-y-0">
        {/* Email client title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-center gap-2 ml-3">
              <Mail size={16} className="text-indigo-500" />
              <span className="text-sm font-extrabold font-outfit">Launch Email Campaign</span>
            </div>
          </div>
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-semibold transition"
          >
            {copiedEmail ? (
              <><Check size={12} className="text-emerald-500" /><span>Copied!</span></>
            ) : (
              <><Copy size={12} /><span>Copy Email</span></>
            )}
          </button>
        </div>

        {/* Email meta headers */}
        <div className="bg-slate-50/60 dark:bg-slate-900/40 px-6 py-3 space-y-2 border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-bold w-12">From:</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[8px] font-black">F</div>
              <span className="text-slate-700 dark:text-slate-300 font-medium">FounderAI Marketing</span>
              <span className="text-slate-400">&lt;launch@founderai.hub&gt;</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-bold w-12">To:</span>
            <span className="text-slate-600 dark:text-slate-400">Your Customer Mailing List &lt;subscribers@yourbrand.com&gt;</span>
          </div>
          <div className="flex items-start gap-3 text-xs">
            <span className="text-slate-400 font-bold w-12">Subject:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{email_campaign.subject}</span>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-8 bg-white dark:bg-slate-950/30">
          <div className="max-w-2xl mx-auto">
            <div className="border border-slate-200/60 dark:border-slate-800/60 rounded-xl overflow-hidden">
              {/* Email header banner */}
              <div className="bg-indigo-600 px-8 py-6 text-center">
                <span className="text-white font-black text-xl font-outfit">Your Brand Newsletter</span>
              </div>
              {/* Email content */}
              <div className="p-8 bg-white dark:bg-slate-950 font-sans text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {email_campaign.body}
              </div>
              {/* Email footer */}
              <div className="bg-slate-50 dark:bg-slate-900/60 px-8 py-4 text-center border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400">© 2025 FounderAI. Unsubscribe | Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar size={16} /> 30-Day Posting Calendar
        </h3>
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
            const hasPost = postDaySet.has(day);
            const post = social_media_plan.find(p => p.day === day);
            return (
              <div
                key={day}
                className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all cursor-default group relative ${
                  hasPost 
                    ? 'bg-indigo-500 text-white shadow-sm hover:scale-110' 
                    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600'
                }`}
                title={post ? `Day ${day}: ${post.platform} — ${post.post_type}` : `Day ${day}: No post`}
              >
                {day}
                {hasPost && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] rounded-lg p-2 w-28 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
                    <span className="font-black block">{post?.platform}</span>
                    <span className="text-slate-300">{post?.post_type}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-500" />
            <span>Post scheduled ({social_media_plan.length} posts)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800" />
            <span>Rest day</span>
          </div>
        </div>
      </div>

      {/* Social Post Preview Cards */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers size={16} /> 30-Day Social Media Post Planner
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {social_media_plan.map((post, idx) => {
            const conf = getPlatformConfig(post.platform);
            return (
              <div 
                key={idx} 
                className={`rounded-2xl border ${conf.border} ${conf.bg} overflow-hidden flex flex-col`}
              >
                {/* Platform header bar */}
                <div className={`bg-gradient-to-r ${conf.gradient} px-4 py-2.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2 text-white">
                    {conf.icon}
                    <span className="text-[10px] font-black uppercase tracking-wider">{post.platform}</span>
                  </div>
                  <span className="text-white/80 text-[10px] font-bold">DAY {post.day}</span>
                </div>
                
                {/* Simulated post card */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {/* Author row */}
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${conf.gradient} flex items-center justify-center text-white text-[9px] font-black`}>
                      B
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block">YourBrand</span>
                      <span className="text-[9px] text-slate-400">@yourbrand · {post.post_type}</span>
                    </div>
                  </div>
                  
                  {/* Caption */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed line-clamp-3">
                    "{post.caption}"
                  </p>
                  
                  {/* Engagement row */}
                  <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800/40 pt-2">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Heart size={10} className="text-rose-400" /> {conf.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={10} /> {conf.comments}</span>
                      <span className="flex items-center gap-1"><Share2 size={10} /></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark size={10} className="text-slate-400" />
                      <button
                        onClick={() => handleCopyPost(post.caption, idx)}
                        className="p-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                      >
                        {copiedPostIdx === idx ? (
                          <Check size={9} className="text-emerald-500" />
                        ) : (
                          <Copy size={9} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
