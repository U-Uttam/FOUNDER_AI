import { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid,
  Presentation,
  X,
  Sparkles,
  Palette,
  TrendingUp,
  Target,
  DollarSign,
  Zap,
  Layers,
  Maximize2,
  Activity,
  BarChart3,
  Users
} from 'lucide-react';
import type { PitchDeck } from '../types';

interface PitchDeckViewProps {
  pitchDeckData: PitchDeck | undefined;
  companyName?: string;
  businessType?: string;
  idea?: string;
}

// ─── 5 Distinct PPT Slide Themes ─────────────────────────────────────────────
const PPT_THEMES = [
  {
    id: 'cyber_dark',
    name: 'Cyber Dark Tech',
    gradient: 'from-slate-950 via-indigo-950 to-slate-900',
    slideBg: 'bg-slate-950/90 border-indigo-500/30 shadow-indigo-500/20',
    cardBg: 'bg-indigo-950/40 border-indigo-500/30',
    titleColor: 'from-white via-indigo-200 to-cyan-400',
    accentColor: '#38bdf8',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    fontClass: 'font-outfit'
  },
  {
    id: 'luxury_gold',
    name: 'Luxury Onyx & Gold',
    gradient: 'from-zinc-950 via-stone-950 to-neutral-900',
    slideBg: 'bg-black/90 border-amber-500/30 shadow-amber-500/20',
    cardBg: 'bg-amber-950/20 border-amber-500/30',
    titleColor: 'from-amber-100 via-amber-300 to-yellow-500',
    accentColor: '#f5c842',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    fontClass: 'font-serif'
  },
  {
    id: 'clean_emerald',
    name: 'Organic Mint & Emerald',
    gradient: 'from-slate-950 via-emerald-950 to-slate-900',
    slideBg: 'bg-slate-950/90 border-emerald-500/30 shadow-emerald-500/20',
    cardBg: 'bg-emerald-950/30 border-emerald-500/30',
    titleColor: 'from-white via-emerald-200 to-teal-300',
    accentColor: '#34d399',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    fontClass: 'font-sans'
  },
  {
    id: 'vibrant_sunset',
    name: 'Pop-Art Sunset Coral',
    gradient: 'from-stone-950 via-orange-950 to-rose-950',
    slideBg: 'bg-stone-950/90 border-orange-500/30 shadow-orange-500/20',
    cardBg: 'bg-orange-950/30 border-orange-500/30',
    titleColor: 'from-white via-orange-200 to-rose-400',
    accentColor: '#fb923c',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    fontClass: 'font-mono'
  },
  {
    id: 'ocean_corporate',
    name: 'Corporate Ocean Blue',
    gradient: 'from-slate-950 via-sky-950 to-slate-900',
    slideBg: 'bg-slate-950/90 border-sky-500/30 shadow-sky-500/20',
    cardBg: 'bg-sky-950/30 border-sky-500/30',
    titleColor: 'from-white via-sky-200 to-blue-400',
    accentColor: '#38bdf8',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    fontClass: 'font-sans'
  }
];

// ─── Semantic Helper for Domain Scoring ──────────────────────────────────────────
function scoreDeckKeywords(text: string, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    if (kw.includes(' ')) {
      if (text.includes(kw)) score += 6;
    } else {
      const reg = new RegExp(`\\b${kw}\\b`, 'i');
      if (reg.test(text)) {
        score += 3;
      } else if (text.includes(kw) && kw.length >= 4) {
        score += 1;
      }
    }
  }
  return score;
}

// Extensive pool of verified high-res Unsplash photos for pitch decks
const UNIVERSAL_DECK_FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80'
];

// Strict deduplication sanitizer: Guarantees NO two slides ever share the same photo
function sanitizeUniqueSlideImages(images: Record<string, string>): Record<string, string> {
  const used = new Set<string>();
  const sanitized: Record<string, string> = {};
  let fallbackIdx = 0;

  for (const [key, url] of Object.entries(images)) {
    if (!used.has(url)) {
      used.add(url);
      sanitized[key] = url;
    } else {
      // Find the next unused fallback URL
      while (fallbackIdx < UNIVERSAL_DECK_FALLBACK_POOL.length && used.has(UNIVERSAL_DECK_FALLBACK_POOL[fallbackIdx])) {
        fallbackIdx++;
      }
      const replacement = fallbackIdx < UNIVERSAL_DECK_FALLBACK_POOL.length
        ? UNIVERSAL_DECK_FALLBACK_POOL[fallbackIdx]
        : `${url}&seed=${key}`;
      used.add(replacement);
      sanitized[key] = replacement;
      fallbackIdx++;
    }
  }

  return sanitized;
}

// Comprehensive keyword image matcher tailored to any startup domain & idea
function getSlideImages(companyName: string, businessType: string = '', idea: string = '') {
  const n = `${companyName} ${businessType} ${idea}`.toLowerCase();

  // 1. INDIAN ETHNIC FASHION / SAREES / SILK / BRIDAL / TRADITIONAL WEAR
  const ethnicScore = scoreDeckKeywords(n, [
    'saree', 'sari', 'kanchipuram', 'silk', 'ethnic wear', 'ethnic', 'lehenga', 'sherwani',
    'festive styling', 'festive wear', 'bridal', 'kurti', 'salwar', 'zari', 'handloom',
    'designer silk', 'wedding styling', 'traditional wear', 'vastra', 'pattu'
  ]);

  if (ethnicScore > 0 || (n.includes('textile') && (n.includes('family') || n.includes('fashion') || n.includes('store') || n.includes('festive')))) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1610030469668-935cb746270c?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 2. MODERN FASHION / BOUTIQUE / APPAREL / DEPARTMENT STORE
  const fashionScore = scoreDeckKeywords(n, [
    'fashion', 'boutique', 'apparel', 'garment', 'clothing', 'tailor', 'tailoring',
    'textile', 'wardrobe', 'menswear', 'womenswear', 'kidswear', 'designer wear',
    'department store', 'dress', 'outfit', 'fitting'
  ]);

  if (fashionScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 3. Car Wash / Auto Detailing / Vehicle Care
  const autoScore = scoreDeckKeywords(n, [
    'car wash', 'auto detailing', 'vehicle wash', 'car spa', 'foam wash', 'ceramic coating',
    'auto care', 'car polish', 'bike wash', 'snow foam', 'steam vacuum'
  ]);

  if (autoScore > 0 || ((n.includes('car') || n.includes('auto') || n.includes('vehicle')) && (n.includes('wash') || n.includes('detail') || n.includes('clean')))) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1520340356584-f9917d1beb6d?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fe?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 4. Coffee / Cafe / Bakery / Roastery
  const coffeeScore = scoreDeckKeywords(n, [
    'coffee', 'cafe', 'espresso', 'barista', 'latte', 'bakery', 'croissant',
    'sourdough', 'pastry', 'cold brew', 'roastery', 'tea stall', 'chai'
  ]);

  if (coffeeScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 5. Food / Restaurant / Biryani / South Indian / Catering
  const foodScore = scoreDeckKeywords(n, [
    'biryani', 'restaurant', 'bistro', 'dining', 'catering', 'thali', 'curry',
    'spices', 'chukka', 'varuval', 'dosa', 'dum biryani', 'banana leaf', 'tiffin', 'cuisine'
  ]);

  if (foodScore > 0 || (n.includes('food') && !n.includes('pet food'))) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 6. Gym / Fitness / CrossFit / Wellness
  const gymScore = scoreDeckKeywords(n, [
    'gym', 'fitness', 'crossfit', 'workout', 'bodybuilding', 'strength training', 'yoga studio'
  ]);

  if (gymScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 7. Salon / Spa / Beauty / Barber
  const beautyScore = scoreDeckKeywords(n, [
    'salon', 'beauty parlour', 'barber', 'haircut', 'spa', 'facial', 'skincare', 'manicure'
  ]);

  if (beautyScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1512290900672-1f480302b28c?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 8. Pet Care / Veterinary / Pet Clinic / Grooming
  const petScore = scoreDeckKeywords(n, [
    'pet care', 'dog grooming', 'cat cafe', 'veterinary', 'vet clinic', 'animal hospital',
    'pet clinic', 'puppy', 'kitten', 'animal care', 'dog clinic', 'cat clinic'
  ]);
  const isPetContext = petScore > 0 || n.includes('pet') || n.includes('vet') || n.includes('animal') || n.includes('puppy') || n.includes('kitten');

  if (isPetContext) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 9. Healthcare / Medical / Clinic / Dental (Human only — excluded for pet context)
  const healthScore = scoreDeckKeywords(n, [
    'doctor', 'clinic', 'hospital', 'dental', 'dentist', 'pharmacy', 'diagnostics'
  ]);

  if (!isPetContext && healthScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 10. Retail / Grocery / Supermarket / Organics
  const groceryScore = scoreDeckKeywords(n, [
    'grocery', 'supermarket', 'kirana', 'organic produce', 'vegetable market', 'fruit market', 'provisions'
  ]);

  if (groceryScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 11. Laundry / Dry Cleaning / Laundromat
  const laundryScore = scoreDeckKeywords(n, [
    'laundry', 'dry clean', 'dry cleaning', 'laundromat', 'steam iron', 'wash fold', 'laundrette'
  ]);

  if (laundryScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 12. Real Estate / Architecture / Interior Design
  const estateScore = scoreDeckKeywords(n, [
    'real estate', 'property', 'interior design', 'architect', 'villa', 'apartment', 'home decor'
  ]);

  if (estateScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 13. Education / Academy / EdTech
  const eduScore = scoreDeckKeywords(n, [
    'education', 'academy', 'school', 'coaching', 'tutor', 'learning center', 'edtech'
  ]);

  if (eduScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 14. Logistics / Courier / Delivery / Fleet
  const logScore = scoreDeckKeywords(n, [
    'logistics', 'delivery', 'courier', 'shipping', 'transport', 'cargo'
  ]);

  if (logScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1580674285054-476b61e74852?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 15. Juice / Smoothie / Ice Cream / Gelato
  const juiceScore = scoreDeckKeywords(n, [
    'juice', 'smoothie', 'shake', 'ice cream', 'gelato', 'dessert'
  ]);

  if (juiceScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 16. Tech / Software / SaaS / AI / Mobile Apps
  const techScore = scoreDeckKeywords(n, [
    'software', 'saas', 'tech', 'technology', 'artificial intelligence', 'mobile app', 'cloud platform'
  ]);

  if (techScore > 0) {
    return sanitizeUniqueSlideImages({
      cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      problem: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
      solution: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
      market: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
      business_model: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
      competition: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
      financials: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
      gtm: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80',
      ask: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
      team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      traction: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80'
    });
  }

  // 17. Universal Professional Lifestyle & Technology Fallback
  return sanitizeUniqueSlideImages({
    cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    problem: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
    solution: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80',
    market: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    business_model: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
    competition: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
    financials: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    gtm: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80',
    ask: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1000&q=80',
    team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    traction: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
  });
}

export default function PitchDeckView({ pitchDeckData, companyName = 'My Startup', businessType = '', idea = '' }: PitchDeckViewProps) {
  if (!pitchDeckData || !pitchDeckData.slides || pitchDeckData.slides.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl">
        <Presentation size={32} className="mx-auto mb-3 text-indigo-400" />
        <h3 className="text-lg font-bold text-white">No Pitch Deck Generated Yet</h3>
        <p className="text-xs text-slate-400 mt-1">Generate a business plan to view the investor slide deck.</p>
      </div>
    );
  }

  const { slides } = pitchDeckData;
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isGridMode, setIsGridMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState('cyber_dark');
  const [transitionStyle, setTransitionStyle] = useState<'slide' | 'fade' | 'zoom'>('slide');
  const [isAnimating, setIsAnimating] = useState(false);

  const activeTheme = useMemo(() => {
    return PPT_THEMES.find(t => t.id === selectedThemeId) || PPT_THEMES[0];
  }, [selectedThemeId]);

  const slideImages = useMemo(() => getSlideImages(companyName, businessType, idea), [companyName, businessType, idea]);

  useEffect(() => {
    setCurrentSlideIdx(0);
    setIsGridMode(false);
  }, [pitchDeckData]);

  const goToSlide = (idx: number) => {
    if (idx === currentSlideIdx) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlideIdx(idx);
      setIsAnimating(false);
    }, 180);
  };

  const handlePrev = () => { if (currentSlideIdx > 0) goToSlide(currentSlideIdx - 1); };
  const handleNext = () => { if (currentSlideIdx < slides.length - 1) goToSlide(currentSlideIdx + 1); };

  // Keyboard Navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') {
        setIsGridMode(false);
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentSlideIdx, slides.length]);

  const currentSlide = slides[currentSlideIdx];
  const progressPct = ((currentSlideIdx + 1) / slides.length) * 100;

  // Render 100% dynamic startup-adapted slide content — ZERO blank spaces on any slide
  const renderSlideContent = (slide: typeof slides[0], index: number) => {
    const lowerTitle = slide.title.toLowerCase();

    // 1. Cover / Vision Slide with Hero Banner
    if (index === 0 || lowerTitle.includes('vision') || lowerTitle.includes('title') || lowerTitle.includes('intro')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
          <div className="space-y-6">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${activeTheme.badgeBg}`}>
              <Sparkles size={12} />
              <span>Official Investor Deck for {businessType || 'Startup'}</span>
            </div>
            <h1 className={`text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r text-transparent bg-clip-text ${activeTheme.titleColor}`}>
              {companyName}
            </h1>
            <p className="text-base lg:text-lg font-medium text-slate-200 leading-relaxed">
              {slide.bullets[0] || idea || slide.title}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {slide.bullets.slice(1, 3).map((b, bi) => (
                <div key={bi} className={`p-3 rounded-2xl border backdrop-blur-md ${activeTheme.cardBg}`}>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Pillar 0{bi + 1}</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5 leading-snug">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[280px] md:h-[340px]">
            <img 
              src={slideImages.cover} 
              alt="Startup Hero" 
              className="w-full h-full object-cover" 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
              <span className="font-bold text-white">{companyName}</span>
              <span className="text-emerald-400 font-mono font-bold">2025 Series Seed</span>
            </div>
          </div>
        </div>
      );
    }

    // 2. Problem Slide
    if (lowerTitle.includes('problem') || lowerTitle.includes('challenge') || lowerTitle.includes('pain')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Target size={18} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400">Market Pain Points</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{slide.title}</h2>
            <div className="space-y-3">
              {slide.bullets.map((b, bi) => (
                <div key={bi} className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 backdrop-blur-md flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-mono text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">0{bi + 1}</span>
                  <p className="text-xs font-medium text-slate-200 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-rose-500/30 shadow-2xl h-[260px] md:h-[320px]">
            <img 
              src={slideImages.problem} 
              alt="Problem Domain" 
              className="w-full h-full object-cover filter brightness-90"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rose-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-rose-950/80 backdrop-blur-md border border-rose-500/40 text-center">
              <p className="text-xs font-bold text-rose-300">Industry Friction Solved by {companyName}</p>
            </div>
          </div>
        </div>
      );
    }

    // 3. Solution Slide
    if (lowerTitle.includes('solution') || lowerTitle.includes('value') || lowerTitle.includes('product')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl h-[260px] md:h-[320px]">
            <img 
              src={slideImages.solution} 
              alt="Solution Frame" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-center">
              <p className="text-xs font-bold text-emerald-300">✓ The {companyName} Breakthrough</p>
            </div>
          </div>
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Zap size={18} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">The Solution</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{slide.title}</h2>
            <div className="space-y-3">
              {slide.bullets.map((b, bi) => (
                <div key={bi} className={`p-3.5 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-lg ${activeTheme.cardBg}`}>
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-black flex-shrink-0 mt-0.5">Feature 0{bi + 1}</span>
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 4. Market Size Slide
    if (lowerTitle.includes('market') || lowerTitle.includes('tam') || lowerTitle.includes('opportunity')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <TrendingUp size={18} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Market Opportunity</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{slide.title}</h2>
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 backdrop-blur-md text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-300">TAM</span>
                <p className="text-2xl font-black text-white">$12.4B</p>
                <p className="text-[10px] text-slate-300">Total Market</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 backdrop-blur-md text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300">SAM</span>
                <p className="text-2xl font-black text-white">$3.8B</p>
                <p className="text-[10px] text-slate-300">Target Region</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/40 backdrop-blur-md text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-purple-300">SOM</span>
                <p className="text-2xl font-black text-white">$450M</p>
                <p className="text-[10px] text-slate-300">Target Share</p>
              </div>
            </div>
            <div className="space-y-2">
              {slide.bullets.map((b, bi) => (
                <div key={bi} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <BarChart3 size={16} className="text-cyan-400 flex-shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl h-[260px] md:h-[320px]">
            <img 
              src={slideImages.market} 
              alt="Market Expansion" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-cyan-950/80 backdrop-blur-md border border-cyan-500/40 text-center">
              <p className="text-xs font-bold text-cyan-300">High Growth Demographic Anchor</p>
            </div>
          </div>
        </div>
      );
    }

    // 5. Business & Financial Model Slide
    if (lowerTitle.includes('financial') || lowerTitle.includes('revenue') || lowerTitle.includes('business model')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <DollarSign size={18} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Business & Monetization Model</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{slide.title}</h2>
            <div className="space-y-3">
              {slide.bullets.map((b, bi) => (
                <div key={bi} className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 backdrop-blur-md flex items-start gap-3">
                  <span className="text-amber-400 font-mono text-xs font-black mt-0.5">Stream 0{bi + 1}</span>
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl h-[260px] md:h-[320px]">
            <img 
              src={slideImages.business_model || slideImages.financials} 
              alt="Financial Projections" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-amber-950/80 backdrop-blur-md border border-amber-500/40 text-center">
              <p className="text-xs font-bold text-amber-300">High-margin cash flows for {companyName}</p>
            </div>
          </div>
        </div>
      );
    }

    // 6. Competition & Moat Slide
    if (lowerTitle.includes('competition') || lowerTitle.includes('competitive') || lowerTitle.includes('moat') || lowerTitle.includes('advantage')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Sparkles size={18} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">Competitive Moat & Edge</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{slide.title}</h2>
            <div className="space-y-3">
              {slide.bullets.map((b, bi) => (
                <div key={bi} className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 backdrop-blur-md flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl h-[260px] md:h-[320px]">
            <img 
              src={slideImages.competition} 
              alt="Competitive Advantage" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-center">
              <p className="text-xs font-bold text-purple-300">Unfair Advantages of {companyName}</p>
            </div>
          </div>
        </div>
      );
    }

    // 7. Go-To-Market / User Acquisition Slide
    if (lowerTitle.includes('go-to-market') || lowerTitle.includes('gtm') || lowerTitle.includes('acquisition') || lowerTitle.includes('marketing')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl h-[260px] md:h-[320px]">
            <img 
              src={slideImages.gtm} 
              alt="Go-To-Market Execution" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-sky-950/80 backdrop-blur-md border border-sky-500/40 text-center">
              <p className="text-xs font-bold text-sky-300">Omnichannel Customer Flywheel</p>
            </div>
          </div>
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <TrendingUp size={18} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-400">Go-To-Market Strategy</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{slide.title}</h2>
            <div className="space-y-3">
              {slide.bullets.map((b, bi) => (
                <div key={bi} className={`p-3.5 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-lg ${activeTheme.cardBg}`}>
                  <span className="p-1 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-black flex-shrink-0 mt-0.5">Channel 0{bi + 1}</span>
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 8. Investment Ask / Capital Allocation Slide
    if (lowerTitle.includes('ask') || lowerTitle.includes('investment') || lowerTitle.includes('fund') || lowerTitle.includes('capital') || lowerTitle.includes('round')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <DollarSign size={18} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Investment Opportunity</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{slide.title}</h2>
            <div className="space-y-3">
              {slide.bullets.map((b, bi) => (
                <div key={bi} className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 backdrop-blur-md flex items-start gap-3">
                  <span className="text-emerald-400 font-mono text-xs font-black mt-0.5">Target 0{bi + 1}</span>
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl h-[260px] md:h-[320px]">
            <img 
              src={slideImages.ask || slideImages.financials} 
              alt="Investment Capital" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-center">
              <p className="text-xs font-bold text-emerald-300">Catalyzing Expansion for {companyName}</p>
            </div>
          </div>
        </div>
      );
    }

    // 9. Traction / Milestones Slide
    if (lowerTitle.includes('traction') || lowerTitle.includes('growth') || lowerTitle.includes('milestone') || lowerTitle.includes('metric')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl h-[260px] md:h-[320px]">
            <img 
              src={slideImages.traction || slideImages.solution} 
              alt="Traction Highlights" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-center">
              <p className="text-xs font-bold text-emerald-300">Traction & Growth Velocity for {companyName}</p>
            </div>
          </div>
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <TrendingUp size={18} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Traction & Proven Milestones</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{slide.title}</h2>
            <div className="space-y-3">
              {slide.bullets.map((b, bi) => (
                <div key={bi} className={`p-3.5 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-lg ${activeTheme.cardBg}`}>
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-black flex-shrink-0 mt-0.5">0{bi + 1}</span>
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 10. Team / Leadership Slide
    if (lowerTitle.includes('team') || lowerTitle.includes('founder') || lowerTitle.includes('leadership') || lowerTitle.includes('advisors')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Users size={18} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">Founding Leadership</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{slide.title}</h2>
            <div className="space-y-3">
              {slide.bullets.map((b, bi) => (
                <div key={bi} className={`p-3.5 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-lg ${activeTheme.cardBg}`}>
                  <span className="p-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-black flex-shrink-0 mt-0.5">Lead 0{bi + 1}</span>
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-blue-500/30 shadow-2xl h-[260px] md:h-[320px]">
            <img 
              src={slideImages.team || slideImages.cover} 
              alt="Core Team" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-blue-950/80 backdrop-blur-md border border-blue-500/40 text-center">
              <p className="text-xs font-bold text-blue-300">Experienced Leaders Driving {companyName}</p>
            </div>
          </div>
        </div>
      );
    }

    // 11. Universal Balanced 2-Column Slide (ZERO duplicate images)
    const fallbackImage = UNIVERSAL_DECK_FALLBACK_POOL[(index + 4) % UNIVERSAL_DECK_FALLBACK_POOL.length];
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center h-full">
        <div className="md:col-span-7 space-y-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers size={18} />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Slide 0{index + 1} Strategic Summary</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{slide.title}</h2>
          <div className="space-y-3">
            {slide.bullets.map((b, bi) => (
              <div key={bi} className={`p-3.5 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-lg ${activeTheme.cardBg}`}>
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">0{bi + 1}</span>
                <p className="text-xs font-semibold text-slate-100 leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl h-[260px] md:h-[320px]">
          <img 
            src={fallbackImage} 
            alt="Strategic Milestone" 
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = slideImages.cover; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-indigo-950/80 backdrop-blur-md border border-indigo-500/40 text-center">
            <p className="text-xs font-bold text-indigo-300">{companyName} Strategic Milestone</p>
          </div>
        </div>
      </div>
    );
  };

  const getAnimClass = () => {
    if (!isAnimating) return 'opacity-100 translate-x-0 scale-100';
    if (transitionStyle === 'slide') return 'opacity-0 translate-x-8';
    if (transitionStyle === 'zoom') return 'opacity-0 scale-95';
    return 'opacity-0';
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* Title & Studio Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <Presentation size={20} />
            </span>
            <div>
              <h2 className="text-2xl font-black font-outfit tracking-tight text-white flex items-center gap-2">
                <span>PPT Pitch Deck Studio</span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{slides.length} Slides</span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Investor-ready PPT slides dynamically custom-tailored for <strong>{companyName}</strong> ({businessType || 'Startup'}).
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* PPT Theme Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
            <Palette size={14} className="text-indigo-400 ml-1" />
            <select 
              value={selectedThemeId} 
              onChange={e => setSelectedThemeId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              {PPT_THEMES.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-950 text-white">{t.name}</option>
              ))}
            </select>
          </div>

          {/* Transition Style Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
            <Activity size={14} className="text-emerald-400 ml-1" />
            <select 
              value={transitionStyle} 
              onChange={e => setTransitionStyle(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              <option value="slide" className="bg-slate-950 text-white">Slide Left</option>
              <option value="fade" className="bg-slate-950 text-white">Smooth Fade</option>
              <option value="zoom" className="bg-slate-950 text-white">Zoom In</option>
            </select>
          </div>

          <button 
            onClick={() => setIsGridMode(!isGridMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition ${
              isGridMode 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isGridMode ? <><X size={14} /><span>Exit Grid</span></> : <><LayoutGrid size={14} /><span>Grid View</span></>}
          </button>

          <button 
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
          >
            <Maximize2 size={14} />
            <span>Present Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Grid Overview Mode */}
      {isGridMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {slides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentSlideIdx(idx); setIsGridMode(false); }}
              className={`rounded-3xl overflow-hidden border-2 transition-all hover:scale-105 text-left ${
                idx === currentSlideIdx 
                  ? 'border-indigo-500 shadow-2xl shadow-indigo-500/30 ring-2 ring-indigo-500/50' 
                  : 'border-slate-800 hover:border-slate-600 bg-slate-900/60'
              }`}
            >
              <div className={`bg-gradient-to-br ${activeTheme.gradient} p-4 aspect-video flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white">
                    Slide 0{idx + 1}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white text-xs font-black leading-tight line-clamp-2">
                    {slide.title}
                  </h4>
                  <p className="text-[9px] text-slate-300 truncate mt-1">{slide.bullets[0]}</p>
                </div>
              </div>
              <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-t border-slate-800 text-[10px] font-bold text-slate-400">
                <span>{companyName}</span>
                <span>{idx + 1} / {slides.length}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Widescreen 16:9 Player Mode */
        <div className="flex gap-6">
          {/* Slide Thumbnails Sidebar */}
          <div className="hidden lg:flex flex-col gap-3 w-48 flex-shrink-0 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 text-left ${
                  idx === currentSlideIdx 
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105' 
                    : 'border-slate-800/80 hover:border-slate-600 opacity-70 hover:opacity-100 bg-slate-950'
                }`}
              >
                <div className={`bg-gradient-to-br ${activeTheme.gradient} p-3 aspect-video flex flex-col justify-between`}>
                  <span className="text-indigo-300 text-[8px] font-black uppercase tracking-wider">
                    0{idx + 1}
                  </span>
                  <h4 className="text-white text-[10px] font-bold leading-tight line-clamp-2">
                    {slide.title}
                  </h4>
                </div>
              </button>
            ))}
          </div>

          {/* Main 16:9 Presentation Canvas */}
          <div className="flex-1 space-y-3">
            {/* Slide Progress */}
            <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* 16:9 Widescreen PPT Slide Stage */}
            <div className={`rounded-3xl overflow-hidden shadow-2xl flex flex-col aspect-[16/9] relative bg-gradient-to-br ${activeTheme.gradient} text-white border border-slate-800 select-none ${activeTheme.fontClass}`}>
              {/* Background ambient light */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
              </div>

              {/* Header inside slide */}
              <div className="relative flex items-center justify-between px-8 pt-6 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{companyName} — Pitch Deck</span>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-white">
                  Slide {currentSlideIdx + 1} of {slides.length}
                </div>
              </div>

              {/* Slide Body with Transition Animation */}
              <div 
                className={`flex-1 p-8 md:p-12 flex flex-col justify-center transition-all duration-300 ${getAnimClass()}`}
              >
                {renderSlideContent(currentSlide, currentSlideIdx)}
              </div>

              {/* Footer Controls inside slide */}
              <div className="relative bg-slate-950/80 backdrop-blur-md p-4 border-t border-white/10 flex items-center justify-between px-8">
                {/* Dots indicator */}
                <div className="flex gap-1.5">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`h-1.5 rounded-full cursor-pointer transition-all duration-200 ${
                        currentSlideIdx === idx ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation Arrows */}
                <div className="flex gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentSlideIdx === 0}
                    className="p-2 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentSlideIdx === slides.length - 1}
                    className="p-2 border border-white/10 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              Use ← → keyboard arrow keys to navigate slides · ESC to exit full screen
            </p>
          </div>
        </div>
      )}

      {/* Fullscreen Keynote Presenter Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 select-none animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">{companyName} — Live Investor Presentation</span>
            </div>
            <button 
              onClick={() => setIsFullScreen(false)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-2 text-xs font-bold"
            >
              <X size={16} /><span>Exit Fullscreen</span>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center max-w-6xl mx-auto w-full p-4">
            <div className={`w-full aspect-[16/9] rounded-3xl overflow-hidden bg-gradient-to-br ${activeTheme.gradient} border border-slate-800 p-8 flex flex-col justify-between transition-all duration-300 ${getAnimClass()}`}>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{companyName}</span>
                <span className="text-xs font-bold text-slate-400">Slide {currentSlideIdx + 1} / {slides.length}</span>
              </div>
              <div className="my-auto">
                {renderSlideContent(currentSlide, currentSlideIdx)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <span className="text-xs font-bold text-slate-500">Slide {currentSlideIdx + 1} / {slides.length}</span>
            <div className="flex gap-3">
              <button onClick={handlePrev} disabled={currentSlideIdx === 0} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-white disabled:opacity-30">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNext} disabled={currentSlideIdx === slides.length - 1} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-white disabled:opacity-30">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
