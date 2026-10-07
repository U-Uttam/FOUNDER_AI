import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Map as MapIcon, 
  MapPin, 
  School, 
  GraduationCap,
  Building, 
  Train, 
  ShoppingBag, 
  Sparkles, 
  ArrowRightLeft, 
  Info,
  Loader2,
  PlusCircle,
  Utensils,
  CreditCard,
  Hotel,
  Dumbbell,
  Search,
  Filter,
  ShieldCheck,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  Compass,
  DollarSign,
  Activity,
  CheckCircle2,
  Layers,
  Eye,
  EyeOff,
  Crosshair,
  ListFilter,
  ChevronDown,
  ChevronUp,
  Navigation,
  Trophy,
  Target,
  Scale
} from 'lucide-react';
import type { LocationAnalysis, LocationCompareResponse, POI } from '../types';
import { api } from '../services/api';

// Map Tile Providers
const MAP_THEMES = {
  dark_satellite: {
    name: 'Dark Satellite (Hybrid)',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite & Road Labels',
    maxZoom: 20
  },
  google_roadmap: {
    name: 'Google Maps (Roads)',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20
  },
  osm: {
    name: 'OpenStreetMap (Detailed)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  esri_dark: {
    name: 'Midnight Dark (Canvas)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri Dark Canvas',
    maxZoom: 16
  },
  satellite: {
    name: 'Esri Satellite (Pure Aerial)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri & OpenStreetMap',
    maxZoom: 19
  }
};

// Helper hook component to recenter leaflet map on coords changes with smooth flyTo
function ChangeMapView({ center, zoom = 16, isFly = false }: { center: [number, number]; zoom?: number; isFly?: boolean }) {
  const map = useMap();
  const lat = center[0];
  const lng = center[1];

  useEffect(() => {
    if (!lat || !lng) return;
    if (isFly) {
      map.flyTo([lat, lng], 17, {
        animate: true,
        duration: 1.2
      });
    } else {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, isFly, map]);
  return null;
}

interface DigitalTwinViewProps {
  locationData: LocationAnalysis | undefined;
  businessType: string;
  budget: number;
  onUpdateLocation?: (newLocation: string) => void;
}

export default function DigitalTwinView({ locationData, businessType, budget, onUpdateLocation }: DigitalTwinViewProps) {
  if (!locationData) {
    return (
      <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl">
        <Compass className="mx-auto h-12 w-12 text-slate-500 mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Location Analysis Data Available</h3>
        <p className="text-xs text-slate-500 mt-1">Please enter a location during startup initialization to view the Spatial Digital Twin Map.</p>
      </div>
    );
  }

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'map_overview' | 'predictions' | 'swot_demographics' | 'strategy' | 'compare'>('map_overview');

  // Map Tile & Visual Customizers (Default to Dark Satellite with road labels)
  const [activeMapTheme, setActiveMapTheme] = useState<keyof typeof MAP_THEMES>('dark_satellite');
  const [showRadiusRings, setShowRadiusRings] = useState<boolean>(true);

  // Category filter state for map - DEFAULT TO 'all' to show all places on map load!
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [poiSearchQuery, setPoiSearchQuery] = useState<string>('');

  // Expandable Category Drawer in Sidebar - Default to Competitors so user sees them immediately!
  const [expandedCategoryDrawer, setExpandedCategoryDrawer] = useState<string | null>('coffee_shops');

  // Center map override state for clicking specific landmarks
  const [mapCenterOverride, setMapCenterOverride] = useState<[number, number] | null>(null);

  // Comparison state
  const [compareLoc1, setCompareLoc1] = useState(locationData.location_name);
  const [compareLoc2, setCompareLoc2] = useState('T Nagar, Chennai');
  const [comparison, setComparison] = useState<LocationCompareResponse | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState('');
  
  // State for clicked map pin details
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  // Re-analyze location state
  const [newLocationInput, setNewLocationInput] = useState(locationData.location_name);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  useEffect(() => {
    setCompareLoc1(locationData.location_name);
    setNewLocationInput(locationData.location_name);
    setComparison(null);
    setCompareError('');
    setSelectedPOI(null);
    setMapCenterOverride(null);
  }, [locationData.location_name]);

  const handleReanalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationInput.trim() || !onUpdateLocation || isReanalyzing) return;
    setIsReanalyzing(true);
    onUpdateLocation(newLocationInput.trim());
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareLoc1 || !compareLoc2) return;
    setIsComparing(true);
    setCompareError('');
    try {
      const result = await api.compareLocations(compareLoc1, compareLoc2, businessType, budget);
      setComparison(result);
    } catch (err: any) {
      setCompareError(err.message || 'Failed to compare locations');
    } finally {
      setIsComparing(false);
    }
  };

  // Helper to extract POIs by category key with unified fallback & deduplication
  const getCategoryPOIs = (catKey: string): POI[] => {
    let rawList: POI[] = [];
    if (catKey === 'coffee_shops' || catKey === 'competitors') {
      rawList = (locationData.all_pois?.['competitors']?.length ? locationData.all_pois['competitors'] : null)
        || (locationData.all_pois?.['coffee_shops']?.length ? locationData.all_pois['coffee_shops'] : null)
        || locationData.competitors
        || [];
    } else if (catKey === 'restaurants') {
      rawList = (locationData.all_pois?.['restaurants']?.length ? locationData.all_pois['restaurants'] : null)
        || locationData.restaurants
        || [];
    } else if (catKey === 'schools') {
      rawList = (locationData.all_pois?.['schools']?.length ? locationData.all_pois['schools'] : null)
        || locationData.schools
        || [];
    } else if (catKey === 'colleges') {
      rawList = (locationData.all_pois?.['colleges']?.length ? locationData.all_pois['colleges'] : null)
        || locationData.colleges
        || [];
    } else if (catKey === 'offices') {
      rawList = (locationData.all_pois?.['offices']?.length ? locationData.all_pois['offices'] : null)
        || locationData.offices
        || [];
    } else if (catKey === 'hospitals') {
      rawList = (locationData.all_pois?.['hospitals']?.length ? locationData.all_pois['hospitals'] : null)
        || locationData.hospitals
        || [];
    } else if (catKey === 'banks') {
      rawList = (locationData.all_pois?.['banks']?.length ? locationData.all_pois['banks'] : null)
        || locationData.banks
        || [];
    } else if (catKey === 'hotels') {
      rawList = (locationData.all_pois?.['hotels']?.length ? locationData.all_pois['hotels'] : null)
        || locationData.hotels
        || [];
    } else if (catKey === 'gyms') {
      rawList = (locationData.all_pois?.['gyms']?.length ? locationData.all_pois['gyms'] : null)
        || locationData.gyms
        || [];
    } else if (catKey === 'shopping') {
      rawList = (locationData.all_pois?.['shopping']?.length ? locationData.all_pois['shopping'] : null)
        || locationData.shopping_malls
        || [];
    } else if (catKey === 'metro') {
      rawList = (locationData.all_pois?.['metro']?.length ? locationData.all_pois['metro'] : null)
        || locationData.metro_stations
        || [];
    } else if (locationData.all_pois && locationData.all_pois[catKey]) {
      rawList = locationData.all_pois[catKey];
    }

    // Deduplicate POIs with fuzzy similarity & coordinate proximity
    const isDuplicate = (a: POI, b: POI) => {
      const n1 = (a.name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      const n2 = (b.name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (n1 === n2) return true;
      const noise = new Set(['clinic', 'hospital', 'center', 'centre', 'care', 'branch', 'store', 'pvt', 'ltd', 'the', 'and', 'pet', 'vet']);
      const tokens1 = n1.split(/\s+/).filter(w => !noise.has(w));
      const tokens2 = n2.split(/\s+/).filter(w => !noise.has(w));
      if (tokens1.length > 0 && tokens2.length > 0) {
        const s1 = new Set(tokens1);
        const s2 = new Set(tokens2);
        if (tokens1.every(t => s2.has(t)) || tokens2.every(t => s1.has(t))) return true;
        for (const t1 of tokens1) {
          for (const t2 of tokens2) {
            if (t1.length >= 4 && t2.length >= 4) {
              if (t1.replace(/kk/g, 'k') === t2.replace(/kk/g, 'k')) return true;
            }
          }
        }
      }
      if (a.lat && a.lng && b.lat && b.lng) {
        const dLat = Math.abs(a.lat - b.lat);
        const dLng = Math.abs(a.lng - b.lng);
        if (dLat < 0.0006 && dLng < 0.0006 && tokens1.some(t => tokens2.includes(t))) return true;
      }
      return false;
    };

    const deduplicated: POI[] = [];
    for (const p of rawList) {
      if (!p || !p.name) continue;
      if (!deduplicated.some(existing => isDuplicate(p, existing))) {
        deduplicated.push(p);
      }
    }
    return deduplicated;
  };

  // Compile raw map pins from all categories
  const allPins = useMemo(() => {
    const list: { type: string; categoryLabel: string; name: string; address: string; lat: number; lng: number; rating: number; user_ratings_total: number; distance: number }[] = [];
    
    // Primary Centroid Target
    list.push({
      type: 'center',
      categoryLabel: 'Target Location',
      name: `Startup Centroid: ${locationData.location_name}`,
      address: locationData.resolved_address || 'Primary Business Site',
      lat: locationData.coords.lat,
      lng: locationData.coords.lng,
      rating: 5,
      user_ratings_total: 0,
      distance: 0
    });

    const categoryDefinitions = [
      { id: 'coffee_shops', label: `Direct Competitor (${businessType})` },
      { id: 'restaurants', label: 'Restaurant / Dining' },
      { id: 'schools', label: 'School / Academy' },
      { id: 'colleges', label: 'College / University' },
      { id: 'offices', label: 'Corporate Office' },
      { id: 'hospitals', label: 'Hospital / Clinic' },
      { id: 'banks', label: 'Bank / ATM' },
      { id: 'hotels', label: 'Hotel / Hospitality' },
      { id: 'gyms', label: 'Gym / Fitness' },
      { id: 'shopping', label: 'Retail & Supermarket' },
      { id: 'metro', label: 'Transit Node' },
    ];

    categoryDefinitions.forEach(cat => {
      const items = getCategoryPOIs(cat.id);
      items.forEach(item => {
        list.push({
          type: cat.id,
          categoryLabel: item.category || cat.label,
          name: item.name,
          address: item.address,
          lat: item.lat,
          lng: item.lng,
          rating: item.rating || 4.5,
          user_ratings_total: item.user_ratings_total || 50,
          distance: item.distance || 0
        });
      });
    });

    return list;
  }, [locationData, businessType]);

  // Filtered map pins
  const filteredPins = useMemo(() => {
    return allPins.filter(pin => {
      if (pin.type === 'center') return true;
      // Always include selected POI regardless of category or search filter
      if (selectedPOI && Math.abs(pin.lat - selectedPOI.lat) < 0.00005 && Math.abs(pin.lng - selectedPOI.lng) < 0.00005) {
        return true;
      }
      const matchesCategory = selectedCategoryFilter === 'all' || pin.type === selectedCategoryFilter || (selectedCategoryFilter === 'coffee_shops' && pin.type === 'competitors');
      const matchesSearch = !poiSearchQuery.trim() || pin.name.toLowerCase().includes(poiSearchQuery.toLowerCase()) || pin.address.toLowerCase().includes(poiSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allPins, selectedCategoryFilter, poiSearchQuery, selectedPOI]);

  // Leaflet Marker Icon Factory (Minimalist Glowing DivIcons + Pulsing Active Marker)
  const getMarkerIcon = (type: string, isSelected: boolean = false) => {
    if (isSelected) {
      return L.divIcon({
        className: 'custom-div-icon-selected',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(6, 182, 212, 0.4); animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 52px; height: 52px; border-radius: 50%; border: 2px dashed #06b6d4; animation: spin 10s linear infinite;"></div>
            <div style="background: linear-gradient(135deg, #06b6d4, #6366f1); width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 25px rgba(6, 182, 212, 1); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 14px; font-weight: 900; z-index: 1000;">
              📍
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });
    }

    let color = '#6366f1'; // Centroid default (Indigo)
    if (type === 'coffee_shops' || type === 'competitors') color = '#f43f5e'; // Rose Neon
    else if (type === 'restaurants') color = '#fb923c'; // Orange Neon
    else if (type === 'schools') color = '#84cc16'; // Lime Green
    else if (type === 'colleges') color = '#fbbf24'; // Amber Neon
    else if (type === 'offices') color = '#38bdf8'; // Sky Neon
    else if (type === 'metro') color = '#34d399'; // Emerald Neon
    else if (type === 'shopping') color = '#c084fc'; // Purple Neon
    else if (type === 'hospitals') color = '#f472b6'; // Pink Neon
    else if (type === 'banks') color = '#facc15'; // Yellow
    else if (type === 'hotels') color = '#2dd4bf'; // Teal
    else if (type === 'gyms') color = '#a3e635'; // Lime

    if (type === 'center') {
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 20px rgba(99,102,241,1);" class="animate-pulse"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -11]
      });
    }

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 14px ${color}; transition: transform 0.2s;" class="hover:scale-150"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -7]
    });
  };

  const getPinLabel = (type: string) => {
    switch (type) {
      case 'center': return 'Target Centroid';
      case 'coffee_shops': return 'Direct Competitor';
      case 'restaurants': return 'Restaurant / Fast Food';
      case 'schools': return 'School / Academy';
      case 'colleges': return 'College / University';
      case 'offices': return 'Corporate Office';
      case 'shopping': return 'Retail & Supermarket';
      case 'hospitals': return 'Hospital / Clinic';
      case 'metro': return 'Transit Node';
      case 'banks': return 'Bank / ATM';
      case 'hotels': return 'Hotel / Tourism';
      case 'gyms': return 'Gym / Fitness';
      default: return 'Business Landmark';
    }
  };

  // Safe prediction extractions
  const preds = locationData.predictions || {
    daily_footfall: locationData.metrics.estimated_footfall,
    conversion_rate_pct: locationData.metrics.conversion_rate_pct || 2.8,
    daily_orders: locationData.metrics.daily_orders,
    average_ticket_size: locationData.metrics.average_ticket_size,
    daily_revenue: locationData.metrics.daily_orders * locationData.metrics.average_ticket_size,
    monthly_revenue_estimate: locationData.metrics.monthly_revenue_estimate,
    break_even_months: locationData.metrics.break_even_months || 3.5,
    rent_estimate_monthly: locationData.metrics.rent_estimate_monthly || locationData.metrics.monthly_revenue_estimate * 0.15,
    peak_hours: { morning_pct: 30, afternoon_pct: 35, evening_pct: 25, night_pct: 10 },
    weekday_daily_revenue: locationData.metrics.daily_orders * locationData.metrics.average_ticket_size * 0.9,
    weekend_daily_revenue: locationData.metrics.daily_orders * locationData.metrics.average_ticket_size * 1.25,
    demographics: { working_professionals_pct: 40, students_pct: 30, commuters_pct: 20, residents_pct: 10 },
    swot: {
      strengths: ["High corporate density", "Direct transit accessibility"],
      weaknesses: ["Competitive market pressure"],
      opportunities: ["Expand lunch rush peak capacity"],
      threats: ["Local commercial rent inflation"]
    },
    recommendations: [
      "Optimize service speed for morning 8 AM - 10 AM transit rush.",
      "Launch corporate loyalty passes for neighboring office buildings."
    ]
  };

  const selectedTile = MAP_THEMES[activeMapTheme];

  // 10 Detailed Anchor Categories Configuration
  const DEMAND_ANCHOR_CATEGORIES = [
    { id: 'coffee_shops', name: `Direct Competitors (${businessType})`, count: getCategoryPOIs('coffee_shops').length, icon: MapPin, color: 'text-rose-400', badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
    { id: 'restaurants', name: 'Restaurants & Fast Food', count: getCategoryPOIs('restaurants').length, icon: Utensils, color: 'text-orange-400', badgeBg: 'bg-orange-500/20 border-orange-500/40 text-orange-300' },
    { id: 'schools', name: 'Schools & Academies', count: getCategoryPOIs('schools').length, icon: School, color: 'text-lime-400', badgeBg: 'bg-lime-500/20 border-lime-500/40 text-lime-300' },
    { id: 'colleges', name: 'Colleges & Universities', count: getCategoryPOIs('colleges').length, icon: GraduationCap, color: 'text-amber-400', badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
    { id: 'offices', name: 'IT / Corporate Offices', count: getCategoryPOIs('offices').length, icon: Building, color: 'text-sky-400', badgeBg: 'bg-sky-500/20 border-sky-500/40 text-sky-300' },
    { id: 'hospitals', name: 'Hospitals & Diagnostics', count: getCategoryPOIs('hospitals').length, icon: PlusCircle, color: 'text-pink-400', badgeBg: 'bg-pink-500/20 border-pink-500/40 text-pink-300' },
    { id: 'banks', name: 'Banks & ATMs', count: getCategoryPOIs('banks').length, icon: CreditCard, color: 'text-yellow-400', badgeBg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' },
    { id: 'hotels', name: 'Hotels & Hospitality', count: getCategoryPOIs('hotels').length, icon: Hotel, color: 'text-teal-400', badgeBg: 'bg-teal-500/20 border-teal-500/40 text-teal-300' },
    { id: 'gyms', name: 'Gyms & Fitness', count: getCategoryPOIs('gyms').length, icon: Dumbbell, color: 'text-lime-400', badgeBg: 'bg-lime-500/20 border-lime-500/40 text-lime-300' },
    { id: 'shopping', name: 'Retail, Supermarkets & Malls', count: getCategoryPOIs('shopping').length, icon: ShoppingBag, color: 'text-purple-400', badgeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
    { id: 'metro', name: 'Transit Nodes (Metro & Bus)', count: getCategoryPOIs('metro').length, icon: Train, color: 'text-emerald-400', badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' }
  ];

  const currentMapCenter: [number, number] = mapCenterOverride || [locationData.coords.lat, locationData.coords.lng];

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* Sleek Top Banner Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                <Compass size={24} />
              </span>
              <div>
                <h2 className="text-2xl font-black font-outfit tracking-tight text-white flex items-center gap-2">
                  <span>Spatial Digital Twin Canvas</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase">
                    Live Verified Analytics
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <MapPin size={14} className="text-rose-400 shrink-0" />
                  <strong className="text-slate-200">{locationData.location_name}</strong>
                  {locationData.city && <span>• {locationData.city}</span>}
                  <span className="text-[10px] bg-slate-800/80 border border-slate-700 text-indigo-300 px-2 py-0.5 rounded-md font-mono">
                    ({locationData.coords.lat.toFixed(4)}, {locationData.coords.lng.toFixed(4)})
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center backdrop-blur-md">
              <span className="text-[9px] uppercase font-bold text-emerald-400 block">Viability Potential</span>
              <span className="text-lg font-black text-emerald-300 font-outfit">
                {locationData.metrics.potential_score}/100
              </span>
            </div>
            <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center backdrop-blur-md">
              <span className="text-[9px] uppercase font-bold text-rose-400 block">Risk Rating</span>
              <span className="text-lg font-black text-rose-300 font-outfit">
                {locationData.metrics.risk_score}/100
              </span>
            </div>
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-center backdrop-blur-md">
              <span className="text-[9px] uppercase font-bold text-indigo-400 block">Est. Daily Traffic</span>
              <span className="text-lg font-black text-indigo-300 font-outfit">
                {preds.daily_footfall.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-800/80 pb-4">
        <button
          onClick={() => setActiveTab('map_overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'map_overview'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <MapIcon size={14} />
          <span>Interactive Canvas & Map</span>
        </button>

        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'predictions'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <TrendingUp size={14} />
          <span>Predictive Financial & Footfall</span>
        </button>

        <button
          onClick={() => setActiveTab('swot_demographics')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'swot_demographics'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <Users size={14} />
          <span>SWOT & Demographics</span>
        </button>

        <button
          onClick={() => setActiveTab('strategy')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'strategy'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Strategic Recommendations</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'compare'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <ArrowRightLeft size={14} />
          <span>Geospatial Comparison Engine</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE MAP & CATEGORIZED LANDMARKS */}
      {activeTab === 'map_overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left 3 cols: Leaflet Map Canvas */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-panel p-4 rounded-3xl flex flex-col min-h-[660px] h-[680px] relative">
              
              {/* Map Floating Control Toolbar */}
              <div className="space-y-2.5 mb-3">
                
                {/* Top Row: Search & Map Display Options */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  {/* POI Search */}
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={poiSearchQuery}
                      onChange={(e) => setPoiSearchQuery(e.target.value)}
                      placeholder="Search landmarks or addresses..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Theme Selector, Recenter & Visibility */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Map theme picker */}
                    <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
                      <Layers size={13} className="text-indigo-400 mr-1.5 shrink-0" />
                      <select
                        value={activeMapTheme}
                        onChange={(e) => setActiveMapTheme(e.target.value as any)}
                        className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1 text-xs"
                      >
                        <option value="dark_satellite" className="bg-slate-900 text-slate-200">Dark Satellite (Hybrid)</option>
                        <option value="satellite" className="bg-slate-900 text-slate-200">Esri Satellite (Aerial)</option>
                        <option value="google_roadmap" className="bg-slate-900 text-slate-200">Google Maps (Roads)</option>
                        <option value="esri_dark" className="bg-slate-900 text-slate-200">Midnight Dark (Canvas)</option>
                        <option value="osm" className="bg-slate-900 text-slate-200">OpenStreetMap (Detailed)</option>
                      </select>
                    </div>

                    {/* Recenter button */}
                    <button
                      onClick={() => {
                        setMapCenterOverride(null);
                        setSelectedPOI(null);
                      }}
                      title="Recenter Map to Target Location"
                      className="p-2 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/50 transition text-xs flex items-center gap-1"
                    >
                      <Crosshair size={14} />
                    </button>

                    {/* Radius toggle */}
                    <button
                      onClick={() => setShowRadiusRings(!showRadiusRings)}
                      title="Toggle Catchment Circles"
                      className={`p-2 rounded-xl border text-xs transition ${
                        showRadiusRings 
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                          : 'bg-slate-900 border-slate-700/80 text-slate-400'
                      }`}
                    >
                      {showRadiusRings ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Filter Layer Category Pills with proper alignment */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs scrollbar-none no-scrollbar">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 select-none">
                    <Filter size={12} className="text-indigo-400" />
                    <span>Filter Layer:</span>
                  </div>
                  
                  {/* Show All POIs option */}
                  <button
                    onClick={() => {
                      setSelectedCategoryFilter('all');
                      setExpandedCategoryDrawer(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedCategoryFilter === 'all'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                        : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>All POIs</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      selectedCategoryFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {Math.max(0, allPins.length - 1)}
                    </span>
                  </button>

                  {DEMAND_ANCHOR_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryFilter(cat.id);
                        setExpandedCategoryDrawer(cat.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        selectedCategoryFilter === cat.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                          : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${cat.color.replace('text-', 'bg-')}`} />
                      <span>{cat.name.split(' ')[0]}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                        selectedCategoryFilter === cat.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>

              </div>

              {/* Live Leaflet Map Container */}
              <div className="flex-1 rounded-2xl overflow-hidden border border-slate-700/50 relative z-10 shadow-inner min-h-[440px]">
                {/* Floating Active Selected Landmark HUD */}
                {selectedPOI && (
                  <div className="absolute top-3 left-14 z-[1000] bg-slate-950/90 backdrop-blur-md border border-cyan-500/60 rounded-2xl p-3 shadow-2xl animate-fade-in text-slate-100 max-w-xs pointer-events-auto">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Selected Landmark</span>
                      </div>
                      <button 
                        onClick={() => { setSelectedPOI(null); setMapCenterOverride(null); }}
                        className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800 transition"
                        title="Dismiss Selection"
                      >
                        ✕
                      </button>
                    </div>
                    <h4 className="text-xs font-black text-white mt-1 leading-tight">{selectedPOI.name}</h4>
                    <p className="text-[10px] text-slate-300 mt-1 leading-tight truncate">{selectedPOI.address}</p>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
                      {selectedPOI.rating && selectedPOI.rating > 0 ? (
                        <span className="text-amber-400 font-bold">★ {selectedPOI.rating} ({selectedPOI.user_ratings_total || 50})</span>
                      ) : <span className="text-slate-500">Verified Location</span>}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPOI.name + ' ' + selectedPOI.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline font-bold flex items-center gap-0.5"
                      >
                        Google Maps ↗
                      </a>
                    </div>
                  </div>
                )}

                <MapContainer 
                  center={currentMapCenter} 
                  zoom={16} 
                  maxZoom={20}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                  attributionControl={false}
                >
                  <ChangeMapView center={currentMapCenter} zoom={16} isFly={!!mapCenterOverride} />
                  
                  <TileLayer
                    key={activeMapTheme}
                    attribution=""
                    url={selectedTile.url}
                    maxZoom={selectedTile.maxZoom || 20}
                  />
                  
                  {/* Catchment Radius Circles */}
                  {showRadiusRings && (
                    <>
                      <Circle 
                        center={[locationData.coords.lat, locationData.coords.lng]}
                        radius={500}
                        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.08, weight: 1.5, dashArray: '4, 4' }}
                      />
                      <Circle 
                        center={[locationData.coords.lat, locationData.coords.lng]}
                        radius={1000}
                        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1.5, dashArray: '4, 4' }}
                      />
                      <Circle 
                        center={[locationData.coords.lat, locationData.coords.lng]}
                        radius={1500}
                        pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.03, weight: 1.5, dashArray: '4, 4' }}
                      />
                    </>
                  )}

                  {filteredPins.map((pin, idx) => {
                    const isSelected = selectedPOI && Math.abs(pin.lat - selectedPOI.lat) < 0.00005 && Math.abs(pin.lng - selectedPOI.lng) < 0.00005;
                    return (
                      <Marker 
                        key={`${pin.lat}_${pin.lng}_${idx}`}
                        position={[pin.lat, pin.lng]} 
                        icon={getMarkerIcon(pin.type, !!isSelected)}
                        zIndexOffset={isSelected ? 1000 : 0}
                        eventHandlers={{
                          click: () => {
                            setSelectedPOI({
                              name: pin.name,
                              lat: pin.lat,
                              lng: pin.lng,
                              address: pin.address,
                              rating: pin.rating,
                              user_ratings_total: pin.user_ratings_total
                            });
                            setMapCenterOverride([pin.lat, pin.lng]);
                          }
                        }}
                      >
                        <Popup>
                          <div className="text-slate-100 p-1 min-w-[170px]">
                            {isSelected && (
                              <span className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/30 inline-block mb-1">
                                Active Selection
                              </span>
                            )}
                            <strong className="text-xs font-black block text-indigo-300">{pin.name}</strong>
                            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5 uppercase">
                              {getPinLabel(pin.type)}
                            </span>
                            {pin.distance > 0 && (
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                                Distance: {pin.distance}m from site
                              </span>
                            )}
                            <span className="text-[9px] text-slate-400 block mt-1 leading-tight">
                              {pin.address}
                            </span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pin.name + ' ' + pin.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-[9px] text-cyan-400 hover:text-cyan-300 font-bold"
                            >
                              Open in Google Maps ↗
                            </a>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
              
              {/* Map Bottom Bar Legend */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-[10px] font-semibold text-slate-400">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-500 uppercase">Catchment Rings:</span>
                  <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 glow-emerald"/>500m Core</span>
                  <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500"/>1000m Trade</span>
                  <span className="flex items-center gap-1.5 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-500"/>1500m Catchment</span>
                </div>
                <span className="text-[10px] text-indigo-400 font-bold">
                  {selectedCategoryFilter === 'all' ? 'Showing All' : 'Filtered Layer'}: {filteredPins.length - 1} Markers Shown
                </span>
              </div>
              
              {/* Clicked POI Details Card */}
              <div className="mt-2.5 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0 border border-indigo-500/20">
                  <Info size={16} />
                </div>
                <div className="flex-1 truncate">
                  {selectedPOI ? (
                    <>
                      <h4 className="text-xs font-bold text-white truncate">{selectedPOI.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{selectedPOI.address}</p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-xs font-bold text-slate-300">Selected Landmark Inspector</h4>
                      <p className="text-[10px] text-slate-500">Click on any pin or select a place from the right sidebar list to view metadata.</p>
                    </>
                  )}
                </div>
                {selectedPOI && selectedPOI.rating > 0 && (
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-amber-400">★ {selectedPOI.rating}</span>
                    <span className="text-[9px] text-slate-500 block">({selectedPOI.user_ratings_total} reviews)</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right 2 cols: ACCURATE CATEGORIZED PLACES & BRAND NAMES LIST */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ACCURATE Demand Anchors List with Real Brand Names */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ListFilter size={18} className="text-indigo-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                    Nearby Demand Anchors (1.5km)
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Verified Local Brands
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                Click any anchor category below to view the <strong>exact real names & brands</strong> and highlight them on the map:
              </p>

              {/* Show All Reset Button */}
              <button
                onClick={() => {
                  setSelectedCategoryFilter('all');
                  setExpandedCategoryDrawer(null);
                }}
                className={`w-full p-2.5 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-between ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400/50 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-500/40'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Crosshair size={14} className="text-indigo-400" /> Show All Nearby Places
                </span>
                <span className="px-2 py-0.5 bg-slate-800 rounded-lg text-[10px] font-mono text-indigo-300">
                  {allPins.length - 1} Total Places
                </span>
              </button>
              
              {/* Categorized Interactive Accordion List */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {DEMAND_ANCHOR_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategoryFilter === cat.id;
                  const isExpanded = expandedCategoryDrawer === cat.id;
                  const IconComp = cat.icon;
                  const categoryPOIs = getCategoryPOIs(cat.id);

                  return (
                    <div 
                      key={cat.id} 
                      className={`rounded-2xl border transition-all ${
                        isSelected 
                          ? 'bg-slate-900/90 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg' 
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Header Button */}
                      <button
                        onClick={() => {
                          setSelectedCategoryFilter(cat.id);
                          setExpandedCategoryDrawer(isExpanded ? null : cat.id);
                        }}
                        className="w-full p-3 text-xs font-bold flex items-center justify-between text-left group"
                      >
                        <span className="flex items-center gap-2.5">
                          <IconComp size={16} className={cat.color} />
                          <span className="font-semibold text-slate-200 group-hover:text-white transition">{cat.name}</span>
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-xl text-xs font-black font-mono border ${cat.badgeBg}`}>
                            {cat.count}
                          </span>
                          {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-500" />}
                        </div>
                      </button>

                      {/* Expandable Place List Drawer */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-1.5 animate-fade-in">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-1">
                            Verified Places in {locationData.location_name}:
                          </span>

                          {categoryPOIs.length > 0 ? (
                            categoryPOIs.map((place, pIdx) => {
                              const isPlaceSelected = selectedPOI?.name === place.name;
                              return (
                                <div
                                  key={pIdx}
                                  onClick={() => {
                                    setSelectedPOI({
                                      name: place.name,
                                      lat: place.lat,
                                      lng: place.lng,
                                      address: place.address,
                                      rating: place.rating || 4.5,
                                      user_ratings_total: place.user_ratings_total || 50
                                    });
                                    setMapCenterOverride([place.lat, place.lng]);
                                    window.scrollTo({ top: 100, behavior: 'smooth' });
                                  }}
                                  className={`p-2 rounded-xl border transition flex items-center justify-between group text-[11px] cursor-pointer ${
                                    isPlaceSelected
                                      ? 'bg-cyan-500/20 border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-md'
                                      : 'bg-slate-950/60 border-slate-800/80 hover:border-indigo-500/40 hover:bg-indigo-500/10'
                                  }`}
                                >
                                  <div className="truncate pr-2">
                                    <div className="flex items-center gap-1.5">
                                      {isPlaceSelected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                                      )}
                                      <span className={`font-bold block truncate ${isPlaceSelected ? 'text-cyan-200 font-black' : 'text-slate-200 group-hover:text-indigo-300'}`}>
                                        {place.name}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 block truncate leading-tight mt-0.5">
                                      {place.address}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {place.distance && place.distance > 0 && (
                                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                        isPlaceSelected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-emerald-500/10 text-emerald-400'
                                      }`}>
                                        {place.distance}m
                                      </span>
                                    )}
                                    <Navigation size={12} className={`${isPlaceSelected ? 'text-cyan-400' : 'text-slate-500 group-hover:text-indigo-400'} transition`} />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-[10px] text-slate-500 p-2 text-center italic">No direct listings cataloged in immediate 1.5km radius.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Viability Index Card */}
            <div className="glass-panel p-6 rounded-3xl space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity size={14} className="text-indigo-400" /> Location Viability Index
              </h3>
              
              {/* Business Potential Score */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Business Potential Score</span>
                  <span className="text-indigo-400">{locationData.metrics.potential_score}/100</span>
                </div>
                <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700 shadow-md shadow-indigo-500/50" 
                    style={{ width: `${locationData.metrics.potential_score}%` }}
                  />
                </div>
              </div>

              {/* Risk Score */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Risk Score</span>
                  <span className="text-rose-400">{locationData.metrics.risk_score}/100</span>
                </div>
                <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-700 shadow-md shadow-rose-500/50" 
                    style={{ width: `${locationData.metrics.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Key Financial Snapshot metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 border border-slate-800 rounded-2xl bg-slate-900/50">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Est. Daily Traffic</span>
                  <span className="text-lg font-black font-outfit text-white">
                    {preds.daily_footfall.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 border border-slate-800 rounded-2xl bg-slate-900/50">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Projected Monthly Rev</span>
                  <span className="text-lg font-black font-outfit text-indigo-300">
                    ₹{preds.monthly_revenue_estimate.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: PREDICTIVE FINANCIAL & FOOTFALL ENGINE */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <TrendingUp size={22} className="text-indigo-400" />
                <div>
                  <h3 className="text-base font-extrabold font-outfit text-white">
                    Predictive Footfall & Financial Revenue Model
                  </h3>
                  <p className="text-xs text-slate-400">
                    Empirical mathematical forecast combining spatial gravity decay, demand conversion rates, and ticket size math.
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold px-3 py-1 rounded-full uppercase">
                {businessType} Baseline
              </span>
            </div>

            {/* 6 Key Predictive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/60 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <Users size={12} className="text-indigo-400" /> Daily Pedestrian Traffic
                </span>
                <p className="text-2xl font-black font-outfit text-white">
                  {preds.daily_footfall.toLocaleString()} <span className="text-xs font-normal text-slate-400">people/day</span>
                </p>
                <p className="text-[10px] text-slate-400">Derived from 1.5km spatial gravity anchor decay equation.</p>
              </div>

              <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/60 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-400" /> Customer Conversion Rate
                </span>
                <p className="text-2xl font-black font-outfit text-emerald-400">
                  {preds.conversion_rate_pct}% <span className="text-xs font-normal text-slate-400">converting</span>
                </p>
                <p className="text-[10px] text-slate-400">Yields approximately <strong>{preds.daily_orders} orders/day</strong>.</p>
              </div>

              <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/60 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <DollarSign size={12} className="text-amber-400" /> Average Ticket Size
                </span>
                <p className="text-2xl font-black font-outfit text-amber-400">
                  ₹{preds.average_ticket_size.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ order</span>
                </p>
                <p className="text-[10px] text-slate-400">Benchmark order value for {businessType} tier.</p>
              </div>

              <div className="p-4 border border-indigo-500/30 rounded-2xl bg-indigo-500/10 space-y-2">
                <span className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                  <TrendingUp size={12} /> Projected Monthly Revenue
                </span>
                <p className="text-2xl font-black font-outfit text-indigo-300">
                  ₹{preds.monthly_revenue_estimate.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400">Calculated as 30 days × {preds.daily_orders} daily orders × ₹{preds.average_ticket_size}.</p>
              </div>

              <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/60 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <Building size={12} className="text-rose-400" /> Estimated Monthly Rent
                </span>
                <p className="text-2xl font-black font-outfit text-white">
                  ₹{preds.rent_estimate_monthly.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ mo</span>
                </p>
                <p className="text-[10px] text-slate-400">Estimated ~14% of projected gross revenue.</p>
              </div>

              <div className="p-4 border border-emerald-500/30 rounded-2xl bg-emerald-500/10 space-y-2">
                <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <Clock size={12} /> Financial Break-even
                </span>
                <p className="text-2xl font-black font-outfit text-emerald-400">
                  ~{preds.break_even_months} <span className="text-xs font-normal text-slate-400">months</span>
                </p>
                <p className="text-[10px] text-slate-400">Expected payback period on ₹{budget.toLocaleString()} capital.</p>
              </div>

            </div>

            {/* Peak Hours Traffic Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900/40 space-y-4">
                <h4 className="text-xs font-extrabold uppercase text-slate-200 flex items-center gap-2">
                  <Clock size={14} className="text-indigo-400" /> Projected Peak Traffic Distribution
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-300">Morning Rush (7 AM - 11 AM)</span>
                      <span className="text-indigo-400">{preds.peak_hours.morning_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${preds.peak_hours.morning_pct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-300">Lunch Peak (11 AM - 3 PM)</span>
                      <span className="text-amber-400">{preds.peak_hours.afternoon_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${preds.peak_hours.afternoon_pct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-300">Evening Shift (3 PM - 7 PM)</span>
                      <span className="text-emerald-400">{preds.peak_hours.evening_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${preds.peak_hours.evening_pct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-300">Night Hours (7 PM - 11 PM)</span>
                      <span className="text-purple-400">{preds.peak_hours.night_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-400 h-full rounded-full" style={{ width: `${preds.peak_hours.night_pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekday vs Weekend split card */}
              <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900/40 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-slate-200 flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-400" /> Weekday vs Weekend Revenue Model
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Differential revenue expectation factoring surrounding office workers (Mon-Fri) and weekend shoppers (Sat-Sun).
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 my-2">
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Weekday Daily Average</span>
                    <span className="text-lg font-black font-outfit text-white">
                      ₹{preds.weekday_daily_revenue.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Driven by office lunch & transit</span>
                  </div>
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Weekend Daily Average</span>
                    <span className="text-lg font-black font-outfit text-emerald-400">
                      ₹{preds.weekend_daily_revenue.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Driven by retail & leisure visitors</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 font-medium">
                  <strong>Co-Founder Pro-Tip:</strong> Schedule primary staff shifts during 11:30 AM - 2:30 PM on weekdays to maximize table turnover.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: SWOT & TARGET DEMOGRAPHICS */}
      {activeTab === 'swot_demographics' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users size={14} className="text-indigo-400" /> Target Customer Demographic Composition
            </h3>
            <p className="text-xs text-slate-400">Estimated audience breakdown based on surrounding educational institutions, tech parks, and transit hubs.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-400 block">Working Professionals</span>
                <span className="text-2xl font-black font-outfit text-sky-300">
                  {preds.demographics.working_professionals_pct}%
                </span>
                <p className="text-[10px] text-slate-400">Corporate offices & tech park employees.</p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Students & Youth</span>
                <span className="text-2xl font-black font-outfit text-amber-300">
                  {preds.demographics.students_pct}%
                </span>
                <p className="text-[10px] text-slate-400">Colleges & educational institutions.</p>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Transit Commuters</span>
                <span className="text-2xl font-black font-outfit text-emerald-300">
                  {preds.demographics.commuters_pct}%
                </span>
                <p className="text-[10px] text-slate-400">Metro & bus station daily footfall.</p>
              </div>

              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block">Local Neighborhood Residents</span>
                <span className="text-2xl font-black font-outfit text-indigo-300">
                  {preds.demographics.residents_pct}%
                </span>
                <p className="text-[10px] text-slate-400">Nearby residential apartment catchments.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles size={18} className="text-indigo-400" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
                Spatial Location SWOT Matrix
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Key Strengths
                </h4>
                <ul className="space-y-1.5 text-slate-300 font-medium">
                  {(preds.swot?.strengths || []).map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border border-amber-500/30 bg-amber-500/10 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Key Weaknesses
                </h4>
                <ul className="space-y-1.5 text-slate-300 font-medium">
                  {(preds.swot?.weaknesses || []).map((wk, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border border-indigo-500/30 bg-indigo-500/10 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={14} /> Market Opportunities
                </h4>
                <ul className="space-y-1.5 text-slate-300 font-medium">
                  {(preds.swot?.opportunities || []).map((op, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{op}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border border-rose-500/30 bg-rose-500/10 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Spatial Threats & Risks
                </h4>
                <ul className="space-y-1.5 text-slate-300 font-medium">
                  {(preds.swot?.threats || []).map((th, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{th}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STRATEGIC RECOMMENDATIONS */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck size={20} className="text-emerald-400" />
              <h3 className="text-base font-extrabold font-outfit text-white">
                Actionable Co-Founder Location Strategy
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              AI-generated site execution guidelines tailored to {locationData.location_name} and {businessType}.
            </p>

            <div className="space-y-3">
              {(preds.recommendations || []).map((rec, idx) => (
                <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0 mt-0.5 border border-emerald-500/20">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Action Item #{idx + 1}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 font-medium leading-relaxed">{rec}</p>
                  </div>
                </div>
              ))}
            </div>

            {locationData.explanations && (
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold uppercase text-slate-400">Deep AI Score Explanations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {locationData.explanations.potential_score && (
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-1">
                      <span className="font-bold text-indigo-400">Business Viability Rationale</span>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {locationData.explanations.potential_score}
                      </p>
                    </div>
                  )}
                  {locationData.explanations.risk_score && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-1">
                      <span className="font-bold text-rose-400">Risk Factor Evaluation</span>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {locationData.explanations.risk_score}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: GEOSPATIAL COMPARISON ENGINE */}
      {activeTab === 'compare' && (
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <ArrowRightLeft size={22} className="text-indigo-400" />
              <div>
                <h3 className="text-base font-extrabold font-outfit text-white">Geospatial Comparison Engine</h3>
                <p className="text-xs text-slate-400">Compare any two target location profiles side by side using live OpenStreetMap spatial analytics.</p>
              </div>
            </div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase">Side-By-Side Engine</span>
          </div>

          <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-3 items-end gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Location</label>
              <input 
                type="text" 
                value={compareLoc1}
                onChange={(e) => setCompareLoc1(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comparison Location</label>
              <input 
                type="text" 
                value={compareLoc2}
                onChange={(e) => setCompareLoc2(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isComparing}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition"
            >
              {isComparing ? (
                <><Loader2 size={14} className="animate-spin" /><span>Computing comparison...</span></>
              ) : (
                <><ArrowRightLeft size={14} /><span>Compare Location Viability</span></>
              )}
            </button>
          </form>

          {compareError && <p className="text-xs text-rose-400 font-bold">{compareError}</p>}

          {comparison && (() => {
            const rec = comparison.recommendation;
            const loc1 = comparison.location1_analysis;
            const loc2 = comparison.location2_analysis;
            const m1 = loc1?.metrics;
            const m2 = loc2?.metrics;
            if (!m1 || !m2) return null;

            const isLoc1Winner = rec.winner?.toLowerCase().includes(compareLoc1.toLowerCase().split(',')[0].trim());
            const totalFootfall = Math.max((m1.estimated_footfall || 0) + (m2.estimated_footfall || 0), 1);
            const loc1FootfallPct = Math.round(((m1.estimated_footfall || 0) / totalFootfall) * 100);
            const loc2FootfallPct = 100 - loc1FootfallPct;

            const totalRev = Math.max((m1.monthly_revenue_estimate || 0) + (m2.monthly_revenue_estimate || 0), 1);
            const loc1RevPct = Math.round(((m1.monthly_revenue_estimate || 0) / totalRev) * 100);
            const loc2RevPct = 100 - loc1RevPct;

            const compList1 = loc1.all_pois?.competitors || loc1.competitors || [];
            const compList2 = loc2.all_pois?.competitors || loc2.competitors || [];

            const offices1 = loc1.all_pois?.offices || loc1.offices || [];
            const offices2 = loc2.all_pois?.offices || loc2.offices || [];
            const colleges1 = loc1.all_pois?.colleges || loc1.colleges || [];
            const colleges2 = loc2.all_pois?.colleges || loc2.colleges || [];
            const transit1 = loc1.all_pois?.metro || loc1.metro_stations || [];
            const transit2 = loc2.all_pois?.metro || loc2.metro_stations || [];

            const prosConsKeys = Object.keys(rec.pros_cons || {});
            const prosCons1 = rec.pros_cons?.[compareLoc1] || rec.pros_cons?.[loc1.location_name] || (prosConsKeys.length > 0 ? rec.pros_cons![prosConsKeys[0]] : undefined);
            const prosCons2 = rec.pros_cons?.[compareLoc2] || rec.pros_cons?.[loc2.location_name] || (prosConsKeys.length > 1 ? rec.pros_cons![prosConsKeys[1]] : undefined);

            const demoKeys = Object.keys(rec.demographic_fit || {});
            const demo1 = rec.demographic_fit?.[compareLoc1] || rec.demographic_fit?.[loc1.location_name] || (demoKeys.length > 0 ? rec.demographic_fit![demoKeys[0]] : undefined);
            const demo2 = rec.demographic_fit?.[compareLoc2] || rec.demographic_fit?.[loc2.location_name] || (demoKeys.length > 1 ? rec.demographic_fit![demoKeys[1]] : undefined);

            return (
              <div className="space-y-8 pt-6 border-t border-slate-800 animate-in fade-in duration-300">
                {/* 1. Winner Hero Banner */}
                <div className="p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-indigo-950/40 shadow-2xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                        <Trophy size={26} className="animate-bounce" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                          Definitive Commercial Winner
                        </span>
                        <h4 className="text-xl font-black font-outfit text-white flex items-center gap-2">
                          {rec.winner}
                        </h4>
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles size={13} /> {rec.confidence_score || '91% Match Confidence'}
                    </span>
                  </div>

                  {rec.winner_summary && (
                    <p className="text-sm font-semibold text-emerald-200/90 leading-relaxed">
                      {rec.winner_summary}
                    </p>
                  )}

                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      Executive Viability Rationale
                    </span>
                    <p className="font-normal">{rec.rationale}</p>
                  </div>
                </div>

                {/* 2. Side-by-Side Head-to-Head Cards */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Scale size={18} className="text-indigo-400" />
                    <h4 className="text-sm font-extrabold font-outfit uppercase tracking-wider text-slate-200">
                      Head-to-Head Quantitative Scorecard
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location 1 Card */}
                    <div className={`p-6 rounded-3xl border transition-all ${
                      isLoc1Winner 
                        ? 'border-emerald-500/40 bg-slate-900/80 shadow-lg shadow-emerald-500/10' 
                        : 'border-slate-800 bg-slate-900/40'
                    } space-y-5`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                            <h5 className="text-base font-extrabold font-outfit text-white">{compareLoc1}</h5>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{loc1.resolved_address}</p>
                        </div>
                        {isLoc1Winner && (
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-lg uppercase">
                            Winner
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Viability Score</span>
                          <span className="text-2xl font-black font-outfit text-indigo-400">{m1.potential_score}/100</span>
                        </div>
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Risk Index</span>
                          <span className="text-2xl font-black font-outfit text-rose-400">{m1.risk_score}/100</span>
                        </div>
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Daily Footfall</span>
                          <span className="text-lg font-black font-outfit text-white">{m1.estimated_footfall.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 block">visitors / day</span>
                        </div>
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Est. Revenue</span>
                          <span className="text-lg font-black font-outfit text-emerald-400">₹{m1.monthly_revenue_estimate.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 block">per month</span>
                        </div>
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Est. Rent</span>
                          <span className="text-sm font-bold text-slate-200">
                            ₹{(m1.rent_estimate_monthly || Math.round(m1.monthly_revenue_estimate * 0.14)).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400 block">~14% revenue</span>
                        </div>
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Break-even</span>
                          <span className="text-sm font-bold text-indigo-300">
                            ~{m1.break_even_months || 14} months
                          </span>
                          <span className="text-[9px] text-slate-400 block">payback period</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                        <span>Direct Competitors: <strong>{compList1.length} found</strong></span>
                        <span>Demand Anchors: <strong>{offices1.length + colleges1.length + transit1.length} nodes</strong></span>
                      </div>
                    </div>

                    {/* Location 2 Card */}
                    <div className={`p-6 rounded-3xl border transition-all ${
                      !isLoc1Winner 
                        ? 'border-emerald-500/40 bg-slate-900/80 shadow-lg shadow-emerald-500/10' 
                        : 'border-slate-800 bg-slate-900/40'
                    } space-y-5`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                            <h5 className="text-base font-extrabold font-outfit text-white">{compareLoc2}</h5>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{loc2.resolved_address}</p>
                        </div>
                        {!isLoc1Winner && (
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-lg uppercase">
                            Winner
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Viability Score</span>
                          <span className="text-2xl font-black font-outfit text-purple-400">{m2.potential_score}/100</span>
                        </div>
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Risk Index</span>
                          <span className="text-2xl font-black font-outfit text-rose-400">{m2.risk_score}/100</span>
                        </div>
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Daily Footfall</span>
                          <span className="text-lg font-black font-outfit text-white">{m2.estimated_footfall.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 block">visitors / day</span>
                        </div>
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Est. Revenue</span>
                          <span className="text-lg font-black font-outfit text-emerald-400">₹{m2.monthly_revenue_estimate.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 block">per month</span>
                        </div>
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Est. Rent</span>
                          <span className="text-sm font-bold text-slate-200">
                            ₹{(m2.rent_estimate_monthly || Math.round(m2.monthly_revenue_estimate * 0.14)).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400 block">~14% revenue</span>
                        </div>
                        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Break-even</span>
                          <span className="text-sm font-bold text-purple-300">
                            ~{m2.break_even_months || 14} months
                          </span>
                          <span className="text-[9px] text-slate-400 block">payback period</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                        <span>Direct Competitors: <strong>{compList2.length} found</strong></span>
                        <span>Demand Anchors: <strong>{offices2.length + colleges2.length + transit2.length} nodes</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Visual Differential Bars */}
                <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <h4 className="text-xs font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                    <TrendingUp size={14} className="text-indigo-400" /> Relative Market Share & Dynamics
                  </h4>

                  {/* Footfall Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-indigo-400">{compareLoc1}: {m1.estimated_footfall.toLocaleString()} ({loc1FootfallPct}%)</span>
                      <span className="text-purple-400">{compareLoc2}: {m2.estimated_footfall.toLocaleString()} ({loc2FootfallPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                      <div className="bg-indigo-500 h-full transition-all" style={{ width: `${loc1FootfallPct}%` }} />
                      <div className="bg-purple-500 h-full transition-all" style={{ width: `${loc2FootfallPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Pedestrian Gravity Distribution</span>
                      <span>Total: {totalFootfall.toLocaleString()} pedestrians</span>
                    </div>
                  </div>

                  {/* Revenue Bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-emerald-400">{compareLoc1}: ₹{m1.monthly_revenue_estimate.toLocaleString()} ({loc1RevPct}%)</span>
                      <span className="text-teal-400">{compareLoc2}: ₹{m2.monthly_revenue_estimate.toLocaleString()} ({loc2RevPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${loc1RevPct}%` }} />
                      <div className="bg-teal-500 h-full transition-all" style={{ width: `${loc2RevPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Gross Monthly Revenue Potential</span>
                      <span>Combined: ₹{totalRev.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Comparison Metrics Narrative Grid */}
                {rec.comparison_metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rec.comparison_metrics.footfall_comparison && (
                      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                          <Users size={12} /> Footfall Differential
                        </span>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                          {rec.comparison_metrics.footfall_comparison}
                        </p>
                      </div>
                    )}
                    {rec.comparison_metrics.revenue_comparison && (
                      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                          <DollarSign size={12} /> Revenue Differential
                        </span>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                          {rec.comparison_metrics.revenue_comparison}
                        </p>
                      </div>
                    )}
                    {rec.comparison_metrics.risk_comparison && (
                      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                        <span className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1.5">
                          <ShieldCheck size={12} /> Risk & Payback Profile
                        </span>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                          {rec.comparison_metrics.risk_comparison}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Competitor Face-Off (Real Brands & Names) */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Target size={18} className="text-rose-400" />
                      <h4 className="text-sm font-extrabold font-outfit uppercase tracking-wider text-white">
                        Direct Competitor Landscape Face-Off
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Real Identified Brands</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Loc 1 Competitors */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>{compareLoc1} ({compList1.length} found)</span>
                      </div>
                      <div className="space-y-2">
                        {compList1.slice(0, 5).map((c, i) => (
                          <div key={i} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{c.name}</span>
                            <span className="text-[10px] text-slate-500 line-clamp-1">{c.address || 'Immediate radius'}</span>
                          </div>
                        ))}
                        {compList1.length === 0 && (
                          <p className="text-xs text-slate-500 italic">No direct competitors in immediate 1.5km radius.</p>
                        )}
                      </div>
                    </div>

                    {/* Loc 2 Competitors */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>{compareLoc2} ({compList2.length} found)</span>
                      </div>
                      <div className="space-y-2">
                        {compList2.slice(0, 5).map((c, i) => (
                          <div key={i} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{c.name}</span>
                            <span className="text-[10px] text-slate-500 line-clamp-1">{c.address || 'Immediate radius'}</span>
                          </div>
                        ))}
                        {compList2.length === 0 && (
                          <p className="text-xs text-slate-500 italic">No direct competitors in immediate 1.5km radius.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Pros & Cons Matrix */}
                {(prosCons1 || prosCons2) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prosCons1 && (
                      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
                        <h5 className="text-xs font-extrabold uppercase text-indigo-400 tracking-wider">
                          {compareLoc1}: Commercial Viability
                        </h5>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Key Advantages</span>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {(prosCons1.pros || []).map((p, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Key Risk Factors</span>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {(prosCons1.cons || []).map((c, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-rose-400 font-bold">✕</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {prosCons2 && (
                      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
                        <h5 className="text-xs font-extrabold uppercase text-purple-400 tracking-wider">
                          {compareLoc2}: Commercial Viability
                        </h5>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Key Advantages</span>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {(prosCons2.pros || []).map((p, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Key Risk Factors</span>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {(prosCons2.cons || []).map((c, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-rose-400 font-bold">✕</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Target Demographic Persona Fit */}
                {(demo1 || demo2) && (
                  <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
                    <h4 className="text-xs font-extrabold uppercase text-slate-200 tracking-wider flex items-center gap-2">
                      <Users size={14} className="text-indigo-400" /> Target Demographic Persona Fit
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {demo1 && (
                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                          <span className="font-bold text-indigo-300">{compareLoc1} Persona</span>
                          <p className="text-slate-300 leading-relaxed font-medium">{demo1}</p>
                        </div>
                      )}
                      {demo2 && (
                        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                          <span className="font-bold text-purple-300">{compareLoc2} Persona</span>
                          <p className="text-slate-300 leading-relaxed font-medium">{demo2}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. Founder Action Plan */}
                {rec.action_plan && rec.action_plan.length > 0 && (
                  <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-3xl space-y-4">
                    <h4 className="text-xs font-extrabold uppercase text-indigo-300 tracking-wider flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400" /> Founder Strategic Action Plan for {rec.winner}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {rec.action_plan.map((act, i) => (
                        <div key={i} className="p-4 bg-slate-950/60 border border-slate-800/90 rounded-2xl space-y-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center border border-indigo-500/30">
                            {i + 1}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">{act}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* RE-ANALYZE LOCATION PANEL */}
      {onUpdateLocation && (
        <div className="glass-panel p-6 rounded-3xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-emerald-400" />
              <h3 className="text-base font-extrabold font-outfit text-white">Re-Analyze Any Location</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Full Pipeline Update</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Specify any location or address globally (e.g., "Tambaram, Chennai", "Koramangala, Bengaluru", "Connaught Place, Delhi", "Brooklyn, NY") to recalculate spatial map parameters, POI brand lists, predictions, and financials.
          </p>
          <form onSubmit={handleReanalyze} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Location / Address</label>
              <input
                type="text"
                value={newLocationInput}
                onChange={(e) => setNewLocationInput(e.target.value)}
                placeholder="e.g. Tambaram, Chennai or Koramangala, Bengaluru"
                disabled={isReanalyzing}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isReanalyzing || !newLocationInput.trim() || newLocationInput.trim() === locationData.location_name}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-40 transition whitespace-nowrap"
            >
              {isReanalyzing ? (
                <><Loader2 size={14} className="animate-spin" /><span>Analyzing Location...</span></>
              ) : (
                <><Sparkles size={14} /><span>Re-Run All Co-Founders</span></>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
