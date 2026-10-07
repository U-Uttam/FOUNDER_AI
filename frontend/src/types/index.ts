export interface WorkflowStep {
  agent: string;
  status: string;
  timestamp: string;
  summary?: string;
}

export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
}

export interface CustomerSegment {
  segment: string;
  needs: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface MarketResearch {
  market_size: string;
  industry_growth: string;
  competitors: Competitor[];
  customer_segments: CustomerSegment[];
  swot: SWOT;
  industry_trends: string[];
}

export interface POI {
  name: string;
  lat: number;
  lng: number;
  address: string;
  rating: number;
  user_ratings_total: number;
  category?: string;
  distance?: number;
}

export interface PeakHoursDistribution {
  morning_pct: number;
  afternoon_pct: number;
  evening_pct: number;
  night_pct: number;
}

export interface DemographicMix {
  working_professionals_pct: number;
  students_pct: number;
  commuters_pct: number;
  residents_pct: number;
}

export interface LocationSWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface LocationPredictions {
  daily_footfall: number;
  conversion_rate_pct: number;
  daily_orders: number;
  average_ticket_size: number;
  daily_revenue: number;
  monthly_revenue_estimate: number;
  break_even_months: number;
  rent_estimate_monthly: number;
  peak_hours: PeakHoursDistribution;
  weekday_daily_revenue: number;
  weekend_daily_revenue: number;
  demographics: DemographicMix;
  swot?: LocationSWOT;
  recommendations?: string[];
}

export interface LocationMetrics {
  estimated_footfall: number;
  potential_score: number;
  risk_score: number;
  infrastructure_score?: number;
  accessibility_score?: number;
  competitor_density?: number;
  monthly_revenue_estimate: number;
  average_ticket_size: number;
  daily_orders: number;
  conversion_rate_pct?: number;
  break_even_months?: number;
  rent_estimate_monthly?: number;
}

export interface LocationAnalysis {
  location_name: string;
  resolved_address?: string;
  city?: string;
  country?: string;
  coords: { lat: number; lng: number };
  competitors: POI[];
  colleges: POI[];
  schools?: POI[];
  offices: POI[];
  hospitals: POI[];
  restaurants?: POI[];
  banks?: POI[];
  hotels?: POI[];
  gyms?: POI[];
  metro_stations: POI[];
  shopping_malls: POI[];
  counts: { [key: string]: number };
  metrics: LocationMetrics;
  predictions?: LocationPredictions;
  explanations?: { [key: string]: string };
  all_pois?: { [key: string]: POI[] };
}

export interface BrandColor {
  name: string;
  hex: string;
  use: string;
}

export interface Typography {
  headings: string;
  body: string;
  rationale: string;
}

export interface LogoConcept {
  id: number;
  layout_key?: string;
  name: string;
  layout: string;
  explanation: string;
  svg: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    text?: string;
    bg?: string;
  };
}

export interface BrandDesign {
  brand_name: string;
  company_name?: string;
  short_name?: string;
  initials?: string;
  tagline?: string;
  business_category?: string;
  brand_personality?: string[];
  logo_style?: string;
  logo_layout?: string;
  icon_concept?: string;
  recommended_template?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color?: string;
  bg_color?: string;
  design_reason?: string;
}

export interface Branding {
  company_name: string;
  tagline: string;
  brand_story: string;
  mission: string;
  vision: string;
  logo_prompt: string;
  logo_svg?: string;
  logo_concepts?: LogoConcept[];
  selected_logo_concept?: number;
  brand_design?: BrandDesign;
  brand_identity?: string;
  brand_voice?: string[];
  brand_colors: BrandColor[];
  typography: Typography;
  validation_report?: any;
}

export interface BusinessModel {
  key_partners: string[];
  value_propositions: string;
  revenue_streams: string[];
  cost_structure: string[];
}

export interface RoadmapPhase {
  phase: string;
  tasks: string[];
}

export interface CustomerPersona {
  name: string;
  role: string;
  goals: string;
  pain_points: string;
}

export interface CustomerJourneyStage {
  stage: string;
  action: string;
  feeling: string;
}

export interface ProductData {
  usp: string;
  value_proposition?: string;
  personas: CustomerPersona[];
  business_model: BusinessModel;
  customer_journey?: CustomerJourneyStage[];
  roadmap: RoadmapPhase[];
}

export interface BudgetCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface CashFlowMonth {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface BreakEven {
  monthly_fixed_costs: number;
  average_order_value: number;
  variable_cost_per_order: number;
  monthly_orders_needed: number;
  daily_orders_needed: number;
}

export interface FinanceData {
  budget_allocation: BudgetCategory[];
  pricing_strategy: string;
  revenue_forecast: {
    year_1: number;
    year_2: number;
    year_3: number;
  };
  break_even: BreakEven;
  roi_percentage: number;
  payback_period_months: number;
  expense_analysis: {
    rent_monthly: number;
    salaries_monthly: number;
    ingredients_monthly: number;
    marketing_utilities_monthly: number;
  };
  expense_breakdown?: { item: string; monthly_cost: number }[];
  profit_estimation?: {
    net_profit_margin_percentage: number;
    annual_net_profit_y1: number;
    annual_net_profit_y2: number;
    annual_net_profit_y3: number;
  };
  cash_flow: CashFlowMonth[];
}

export interface SocialPost {
  day: number;
  platform: string;
  post_type: string;
  caption: string;
}

export interface MarketingData {
  seo_keywords: string[];
  marketing_strategy: string;
  email_campaign: {
    subject: string;
    body: string;
  };
  social_media_plan: SocialPost[];
}

export interface LicenseInfo {
  name: string;
  type: string;
  description: string;
  cost_estimate: string;
  time_estimate: string;
  statutory_authority?: string;
  penalties_for_non_compliance?: string;
  prerequisites?: string[];
  portal_url?: string;
  category_stage?: 'pre_incorporation' | 'registration' | 'operational_license' | 'ongoing';
}

export interface ComplianceData {
  required_licenses: LicenseInfo[];
  additional_guidance: string;
}

export interface WebsiteData {
  template_category: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta_text: string;
    background_image: string;
  };
  about: {
    title: string;
    content: string;
  };
  services: { title: string; description: string; image_query?: string; image_url?: string; price?: string }[];
  contact: {
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
  faqs: { question: string; answer: string }[];
  testimonials?: { quote: string; author: string; role: string; rating?: number; avatar?: string }[];
}

export interface Slide {
  title: string;
  bullets: string[];
}

export interface PitchDeck {
  slides: Slide[];
}

export interface Startup {
  id: string;
  idea: string;
  budget: number;
  location: string;
  business_type?: string;
  status: 'PENDING' | 'PROCESSING' | 'PENDING_APPROVAL' | 'COMPLETED' | 'FAILED';
  current_agent: string;
  workflow_steps: WorkflowStep[];
  
  market_research?: MarketResearch;
  location_analysis?: LocationAnalysis;
  branding?: Branding;
  finance?: FinanceData;
  product?: ProductData;
  marketing?: MarketingData;
  website?: WebsiteData;
  pitch_deck?: PitchDeck;
  compliance?: ComplianceData;
  
  created_at: string;
  updated_at: string;
}

export interface LocationCompareResponse {
  location1_analysis: LocationAnalysis;
  location2_analysis: LocationAnalysis;
  recommendation: {
    winner: string;
    winner_summary?: string;
    confidence_score?: string;
    rationale: string;
    comparison_metrics?: {
      footfall_comparison?: string;
      revenue_comparison?: string;
      risk_comparison?: string;
      rent_efficiency?: string;
      break_even_comparison?: string;
    };
    side_by_side_metrics?: {
      location1: {
        name: string;
        potential_score: number;
        risk_score: number;
        daily_footfall: number;
        monthly_revenue: number;
        monthly_rent: number;
        break_even_months: number;
        competitors_count: number;
      };
      location2: {
        name: string;
        potential_score: number;
        risk_score: number;
        daily_footfall: number;
        monthly_revenue: number;
        monthly_rent: number;
        break_even_months: number;
        competitors_count: number;
      };
    };
    pros_cons?: Record<string, { pros: string[]; cons: string[] }>;
    demographic_fit?: Record<string, string>;
    action_plan?: string[];
  };
}
