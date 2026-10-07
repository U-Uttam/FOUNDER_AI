import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import MarketResearchView from './components/MarketResearchView';
import DigitalTwinView from './components/DigitalTwinView';
import BrandingView from './components/BrandingView';
import ProductRoadmapView from './components/ProductRoadmapView';
import FinanceView from './components/FinanceView';
import MarketingView from './components/MarketingView';
import WebsitePreview from './components/WebsitePreview';
import PitchDeckView from './components/PitchDeckView';
import ComplianceView from './components/ComplianceView';
import { api } from './services/api';
import type { Startup } from './types';
import { Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(true); // Premium Dark mode default
  const [currentStartup, setCurrentStartup] = useState<Startup | null>(null);
  const [startupHistory, setStartupHistory] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const pollingRef = useRef<any>(null);

  // Fetch all startups history on initial mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.getStartups();
        setStartupHistory(history);
        // Load the latest startup if one exists
        if (history.length > 0) {
          setCurrentStartup(history[0]);
        }
      } catch (err: any) {
        setApiError('Failed to connect to backend server. Make sure the FastAPI backend is running on port 8000.');
      }
    };
    fetchHistory();
  }, []);

  // Poll for active processing startup
  useEffect(() => {
    if (currentStartup && currentStartup.status === 'PROCESSING') {
      // Start polling
      if (!pollingRef.current) {
        pollingRef.current = setInterval(async () => {
          try {
            const latest = await api.getStartup(currentStartup.id);
            setCurrentStartup(latest);
            
            if (latest.status === 'COMPLETED' || latest.status === 'PENDING_APPROVAL' || latest.status === 'FAILED') {
              // Clear interval and reload history
              if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
              }
              const history = await api.getStartups();
              setStartupHistory(history);
            }
          } catch (err) {
            console.error('Polling error:', err);
          }
        }, 1500);
      }
    } else {
      // Clear interval if not processing
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [currentStartup]);

  const handleSubmitIdea = async (idea: string, budget: number, location: string) => {
    setIsLoading(true);
    setApiError('');
    try {
      const startup = await api.createStartup(idea, budget, location);
      setCurrentStartup(startup);
      setActiveTab('overview'); // Direct back to progress timeline
      
      // Instantly prepend to history
      setStartupHistory(prev => [startup, ...prev]);
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit startup proposal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProject = () => {
    setCurrentStartup(null);
    setActiveTab('overview');
  };

  const handleSelectStartup = (startup: Startup) => {
    setCurrentStartup(startup);
    setActiveTab('overview');
  };

  const handleApproveStartup = async (id: string) => {
    setIsLoading(true);
    try {
      const approved = await api.approveStartup(id);
      setCurrentStartup(approved);
      const history = await api.getStartups();
      setStartupHistory(history);
    } catch (err: any) {
      setApiError(err.message || 'Failed to approve startup configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryStartup = async (id: string) => {
    setIsLoading(true);
    setApiError('');
    try {
      const retried = await api.retryStartup(id);
      setCurrentStartup(retried);
      setActiveTab('overview');
      const history = await api.getStartups();
      setStartupHistory(history);
    } catch (err: any) {
      setApiError(err.message || 'Failed to retry startup workflow.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLocation = async (newLocation: string) => {
    if (!currentStartup) return;
    setIsLoading(true);
    setApiError('');
    try {
      const updated = await api.updateLocation(currentStartup.id, newLocation);
      setCurrentStartup(updated);
      setActiveTab('overview'); // Redirect to timeline overview to watch processing
      const history = await api.getStartups();
      setStartupHistory(history);
    } catch (err: any) {
      setApiError(err.message || 'Failed to update location.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStartup = async (id: string) => {
    try {
      await api.deleteStartup(id);
      const updatedHistory = startupHistory.filter(s => s.id !== id);
      setStartupHistory(updatedHistory);
      if (currentStartup?.id === id) {
        setCurrentStartup(updatedHistory.length > 0 ? updatedHistory[0] : null);
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to delete startup proposal.');
    }
  };

  // Render the corresponding active dashboard panel
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            currentStartup={currentStartup}
            onSubmitIdea={handleSubmitIdea}
            isLoading={isLoading}
            onSelectStartup={handleSelectStartup}
            startupHistory={startupHistory}
            onNewProject={handleNewProject}
            onRetryStartup={handleRetryStartup}
            onDeleteStartup={handleDeleteStartup}
          />
        );
      case 'research':
        return <MarketResearchView researchData={currentStartup?.market_research} />;
      case 'digital_twin':
        return (
          <DigitalTwinView 
            locationData={currentStartup?.location_analysis} 
            businessType={currentStartup?.business_type || 'Cafe'} 
            budget={currentStartup?.budget || 1000000}
            onUpdateLocation={handleUpdateLocation}
          />
        );
      case 'branding':
        return (
          <BrandingView 
            brandingData={currentStartup?.branding} 
            businessType={currentStartup?.business_type || 'Startup'} 
            idea={currentStartup?.idea}
            startupId={currentStartup?.id}
          />
        );
      case 'product':
        return <ProductRoadmapView productData={currentStartup?.product} />;
      case 'finance':
        return <FinanceView financeData={currentStartup?.finance} />;
      case 'marketing':
        return <MarketingView marketingData={currentStartup?.marketing} />;
      case 'website':
        return (
          <WebsitePreview 
            websiteData={currentStartup?.website} 
            companyName={currentStartup?.branding?.company_name || 'My Startup'} 
            businessType={currentStartup?.business_type || 'Startup'}
            idea={currentStartup?.idea}
            personas={currentStartup?.product?.personas}
          />
        );
      case 'pitch_deck':
        return (
          <PitchDeckView 
            pitchDeckData={currentStartup?.pitch_deck} 
            companyName={currentStartup?.branding?.company_name || 'My Startup'} 
            businessType={currentStartup?.business_type || 'Startup'}
            idea={currentStartup?.idea}
          />
        );
      case 'compliance':
        return (
          <ComplianceView 
            complianceData={currentStartup?.compliance}
            companyName={currentStartup?.branding?.company_name || 'My Startup'}
            businessType={currentStartup?.business_type || 'Startup'}
            location={currentStartup?.location || 'India'}
            idea={currentStartup?.idea}
          />
        );
      default:
        return <div className="p-8 text-center text-slate-400">Section not found.</div>;
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-200">
        
        {/* Sidebar Nav */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentStartup={currentStartup}
          onNewProject={handleNewProject}
          onDeleteStartup={handleDeleteStartup}
        />

        {/* Main Content Area */}
        <main className="pl-64 min-h-screen">
          <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-8">
            
            {/* API Connection Error banner */}
            {apiError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-xs font-semibold leading-relaxed flex items-center justify-between">
                <span>{apiError}</span>
                <button 
                  onClick={() => setApiError('')}
                  className="underline hover:opacity-80"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* PM Approval Required Banner */}
            {currentStartup && currentStartup.status === 'PENDING_APPROVAL' && (
              <div className="p-6 border border-amber-500/20 bg-amber-500/10 dark:bg-amber-950/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse relative z-20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                      Project Manager Review Complete
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {currentStartup.branding?.validation_report?.resolved_conflicts?.length || 0} inconsistencies were auto-resolved. Review the deliverables and click approve to unlock the final launch reports.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleApproveStartup(currentStartup.id)}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-amber-600/15 whitespace-nowrap"
                >
                  {isLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Approve & Compile Final Package</span>
                </button>
              </div>
            )}

            {/* Active view */}
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
