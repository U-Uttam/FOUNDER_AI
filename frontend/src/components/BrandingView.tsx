import { useState, useEffect, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Palette, 
  Sparkles,
  Download,
  Wand2,
  Sparkle,
  Loader2,
  CreditCard,
  Smartphone,
  Globe,
  Store,
  Image as ImageIcon,
  Package,
  Layers,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import type { Branding, LogoConcept } from '../types';
import { api } from '../services/api';

interface BrandingViewProps {
  brandingData: Branding | undefined;
  businessType?: string;
  idea?: string;
  startupId?: string;
}

// ─── Handcrafted Domain Vector Emblem Paths (Human Designer Quality) ────────────
function getDomainEmblemSvg(domain: string, _color1: string, color2: string) {
  const d = domain.toLowerCase();

  // 1. South Indian / Traditional Food / Heritage / Banana Leaf / Marutham / Annapoorna / Meals
  if (
    d.includes('marutham') || d.includes('banana') || d.includes('leaf') ||
    d.includes('south indian') || d.includes('tamil') || d.includes('traditional') ||
    d.includes('annapoorna') || d.includes('curry') || d.includes('dosa') ||
    d.includes('idli') || d.includes('feast') || d.includes('meals') ||
    d.includes('heritage') || d.includes('bhojan')
  ) {
    return `
      <!-- Artisan Curated Botanical Heritage Leaf & Sacred Diya Accent -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="M-36,26 C-46,-12 -22,-44 32,-44 C38,-44 42,-40 38,-32 C26,12 -12,38 -36,26 Z" fill="url(#logoGrad)" />
        <path d="M-32,24 C-10,4 12,-16 32,-42" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.9" fill="none" />
        <path d="M-18,14 C-10,18 -4,16 6,10" stroke="#FFFFFF" stroke-width="1.8" opacity="0.65" fill="none" />
        <path d="M-8,3 C0,7 6,4 18,-2" stroke="#FFFFFF" stroke-width="1.8" opacity="0.65" fill="none" />
        <path d="M4,-9 C12,-5 18,-8 26,-15" stroke="#FFFFFF" stroke-width="1.8" opacity="0.65" fill="none" />
        <path d="M28,-42 C34,-52 38,-48 34,-36 C31,-40 29,-41 28,-42 Z" fill="${color2}" />
        <circle cx="34" cy="-44" r="3.5" fill="${color2}" />
      </g>
    `;
  }

  // 2. Tea / Chai / Teahouse / Brew / TeaVerse
  if (d.includes('tea') || d.includes('chai') || d.includes('teaverse') || d.includes('teahouse') || d.includes('brew')) {
    return `
      <!-- Minimalist Ceramic Tea Bowl & Aromatic Sprout -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="M-32,-6 C-32,26 32,26 32,-6 Z" fill="url(#logoGrad)" />
        <path d="M-34,-6 L34,-6" stroke="${color2}" stroke-width="3.5" />
        <path d="M-10,-14 C-10,-32 0,-34 0,-44" stroke="${color2}" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85" />
        <path d="M10,-14 C10,-28 18,-30 18,-38" stroke="${color2}" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.6" />
        <path d="M-12,-40 C-6,-54 10,-48 8,-36 C-2,-34 -8,-38 -12,-40 Z" fill="${color2}" />
        <line x1="-38" y1="32" x2="38" y2="32" stroke="${color2}" stroke-width="3" />
      </g>
    `;
  }

  // 3. Coffee / Cafe / Espresso / Roast
  if (d.includes('coffee') || d.includes('cafe') || d.includes('espresso') || d.includes('roast') || d.includes('cappuccino') || d.includes('barista') || d.includes('bakery')) {
    return `
      <!-- Modern Roastery Emblem & Interlocking Beans -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="-10" cy="-6" rx="20" ry="28" fill="url(#logoGrad)" transform="rotate(-24 -10 -6)" />
        <path d="M-18,-28 Q-6,-6 -14,14" stroke="#070A14" stroke-width="3.5" fill="none" />
        <ellipse cx="12" cy="4" rx="16" ry="24" fill="${color2}" transform="rotate(32 12 4)" opacity="0.9" />
        <path d="M8,-12 Q18,6 10,22" stroke="#070A14" stroke-width="3" fill="none" />
        <circle cx="28" cy="-28" r="3.5" fill="${color2}" />
      </g>
    `;
  }

  // 4. AI / Cybersecurity / Software / Tech / Cloud / Nexora / SaaS
  if (d.includes('cyber') || d.includes('ai') || d.includes('security') || d.includes('nexora') || d.includes('software') || d.includes('tech') || d.includes('saas') || d.includes('network') || d.includes('cloud')) {
    return `
      <!-- Precision Hexagonal Neural Apex Matrix -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <polygon points="0,-48 40,-24 40,24 0,48 -40,24 -40,-24" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
        <polygon points="0,-24 22,-11 0,2 -22,-11" fill="${color2}" opacity="0.9" />
        <polygon points="0,2 22,-11 22,14 0,27" fill="url(#logoGrad)" opacity="0.8" />
        <polygon points="0,2 -22,-11 -22,14 0,27" fill="url(#logoGrad)" opacity="0.5" />
        <circle cx="0" cy="-48" r="4.5" fill="${color2}" />
        <circle cx="40" cy="24" r="4.5" fill="${color2}" />
        <circle cx="-40" cy="24" r="4.5" fill="${color2}" />
      </g>
    `;
  }

  // 5. Organic Grocery / Retail / Green / Farming / Food Market / GreenBasket
  if (d.includes('grocery') || d.includes('basket') || d.includes('greenbasket') || d.includes('green') || d.includes('organic') || d.includes('market') || d.includes('farm') || d.includes('produce') || d.includes('fresh') || d.includes('store')) {
    return `
      <!-- Minimalist Sprout Within Woven Arch -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="M-36,24 C-36,-14 36,-14 36,24" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
        <path d="M-26,24 L26,24" stroke="url(#logoGrad)" stroke-width="4" />
        <path d="M0,18 C-24,2 -24,-24 0,-34 C-2,-14 6,-4 0,18 Z" fill="url(#logoGrad)" />
        <path d="M0,18 C24,2 24,-24 0,-34 C2,-14 -6,-4 0,18 Z" fill="${color2}" opacity="0.9" />
        <circle cx="0" cy="-40" r="4" fill="${color2}" />
      </g>
    `;
  }

  // 6. Fitness / Gym / Workout / Athletics / Forge / FitForge
  if (d.includes('fit') || d.includes('forge') || d.includes('fitness') || d.includes('gym') || d.includes('workout') || d.includes('crossfit') || d.includes('strength') || d.includes('iron') || d.includes('muscle')) {
    return `
      <!-- Geometric Spartan Wing & Anvil Power -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <polygon points="0,-46 36,-10 24,34 0,44 -24,34 -36,-10" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
        <polygon points="4,-32 18,-6 2,-6 10,24 -14,-2 -2,-2" fill="${color2}" />
      </g>
    `;
  }

  // 7. Restaurant / Dining / Kitchen / Culinary / Biryani / Food
  if (d.includes('restaurant') || d.includes('dining') || d.includes('kitchen') || d.includes('biryani') || d.includes('food')) {
    return `
      <!-- Master Chef Cloche & Culinary Crown -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="M-38,18 C-38,-14 38,-14 38,18 Z" fill="url(#logoGrad)" />
        <line x1="-44" y1="22" x2="44" y2="22" stroke="${color2}" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="0" cy="-22" r="7" fill="${color2}" />
        <polygon points="0,-36 3,-30 9,-30 4,-26 6,-20 0,-24 -6,-20 -4,-26 -9,-30 -3,-30" fill="${color2}" />
      </g>
    `;
  }

  // 8. Finance / FinTech / Wealth / Banking
  if (d.includes('finance') || d.includes('money') || d.includes('invest') || d.includes('wealth') || d.includes('bank') || d.includes('capital') || d.includes('fund') || d.includes('venture')) {
    return `
      <!-- Precision Geometric Diamond Vault & Dynamic Growth Peak -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <polygon points="0,-48 38,-14 0,44 -38,-14" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
        <polyline points="-20,6 -6,-8 6,0 20,-20" stroke="${color2}" stroke-width="4.5" fill="none" />
        <polyline points="10,-20 20,-20 20,-10" stroke="${color2}" stroke-width="4.5" fill="none" />
      </g>
    `;
  }

  // 9. Real Estate / Architecture / Housing
  if (d.includes('real estate') || d.includes('property') || d.includes('house') || d.includes('home') || d.includes('building') || d.includes('estate') || d.includes('architecture')) {
    return `
      <!-- Bauhaus Minimalist Roofline & Modern Keystone -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <polygon points="0,-44 42,-4 32,-4 32,36 -32,36 -32,-4 -42,-4" fill="none" stroke="url(#logoGrad)" stroke-width="5" />
        <polygon points="0,-26 24,-2 0,22 -24,-2" fill="${color2}" opacity="0.85" />
        <rect x="-8" y="14" width="16" height="22" fill="url(#logoGrad)" />
      </g>
    `;
  }

  // 10. Healthcare / Medical
  if (d.includes('health') || d.includes('medical') || d.includes('clinic') || d.includes('pharma') || d.includes('care') || d.includes('wellness') || d.includes('doctor')) {
    return `
      <!-- Modern Swiss Cross & Harmonious Healing Circle -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <circle cx="0" cy="0" r="42" fill="none" stroke="${color2}" stroke-width="3" stroke-dasharray="6,4" />
        <path d="M-10,-32 L10,-32 L10,-10 L32,-10 L32,10 L10,10 L10,32 L-10,32 L-10,10 L-32,10 L-32,-10 L-10,-10 Z" fill="url(#logoGrad)" />
        <circle cx="0" cy="0" r="6" fill="#070A14" />
      </g>
    `;
  }

  // 11. Automotive / Detailing / Transport / Mobility
  if (d.includes('auto') || d.includes('car') || d.includes('motor') || d.includes('vehicle') || d.includes('mobility') || d.includes('drive')) {
    return `
      <!-- Sleek Aerodynamic Apex Silhouette -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="M-42,12 C-28,-8 14,-14 42,4 L36,14 L-38,14 Z" fill="url(#logoGrad)" />
        <circle cx="-18" cy="18" r="9" fill="#070A14" stroke="${color2}" stroke-width="4" />
        <circle cx="22" cy="18" r="9" fill="#070A14" stroke="${color2}" stroke-width="4" />
        <line x1="-42" y1="28" x2="42" y2="28" stroke="${color2}" stroke-width="3" />
      </g>
    `;
  }

  // 12. Pet Care / Animals / Dogs / Cats / Vet
  if (d.includes('pet') || d.includes('dog') || d.includes('cat') || d.includes('animal') || d.includes('vet') || d.includes('grooming') || d.includes('paw')) {
    return `
      <!-- Elegant Minimalist Paw & Hearth -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="0" cy="12" rx="20" ry="16" fill="url(#logoGrad)" />
        <circle cx="-22" cy="-12" r="8" fill="${color2}" />
        <circle cx="-8" cy="-24" r="8.5" fill="${color2}" />
        <circle cx="8" cy="-24" r="8.5" fill="${color2}" />
        <circle cx="22" cy="-12" r="8" fill="${color2}" />
      </g>
    `;
  }

  // 13. Fashion / Clothing / Apparel / Boutique / Textile
  if (d.includes('fashion') || d.includes('cloth') || d.includes('apparel') || d.includes('boutique') || d.includes('textile') || d.includes('saree') || d.includes('silk') || d.includes('wear')) {
    return `
      <!-- Haute Couture Hanger & Diamond Crest -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="M0,-36 C6,-36 10,-32 8,-26 C6,-20 0,-18 0,-12" fill="none" stroke="${color2}" stroke-width="4" />
        <polygon points="0,-10 42,16 -42,16" fill="none" stroke="url(#logoGrad)" stroke-width="4.5" />
        <line x1="-38" y1="22" x2="38" y2="22" stroke="${color2}" stroke-width="3" />
        <circle cx="0" cy="6" r="4.5" fill="${color2}" />
      </g>
    `;
  }

  // 14. Salon / Beauty / Spa / Hair / Cosmetics
  if (d.includes('salon') || d.includes('beauty') || d.includes('spa') || d.includes('hair') || d.includes('cosmetic') || d.includes('facial') || d.includes('barber')) {
    return `
      <!-- Stylized Lotus Blossom & Shears of Grace -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="M0,28 C-28,10 -28,-22 0,-38 C28,-22 28,10 0,28 Z" fill="none" stroke="url(#logoGrad)" stroke-width="4" />
        <path d="M0,22 C-14,6 -14,-14 0,-26 C14,-14 14,6 0,22 Z" fill="${color2}" opacity="0.85" />
        <circle cx="0" cy="-42" r="4" fill="${color2}" />
      </g>
    `;
  }

  // 15. Laundry / Dry Clean / Cleaning / Housekeeping
  if (d.includes('laundry') || d.includes('clean') || d.includes('wash') || d.includes('dry clean') || d.includes('iron')) {
    return `
      <!-- Pure Water Sparkle & Fresh Fold -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="M0,-42 C20,-16 26,4 18,22 C10,38 -10,38 -18,22 C-26,4 -20,-16 0,-42 Z" fill="url(#logoGrad)" />
        <path d="M-6,2 C-2,14 6,18 10,8" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" />
        <circle cx="24" cy="-18" r="5" fill="${color2}" />
        <circle cx="-22" cy="10" r="3.5" fill="${color2}" />
      </g>
    `;
  }

  // 16. Bakery / Cake / Sweets / Pastry
  if (d.includes('bakery') || d.includes('cake') || d.includes('sweet') || d.includes('pastry') || d.includes('bread') || d.includes('dessert')) {
    return `
      <!-- Artisan Wheat Sheaf & Confection Crown -->
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="M-30,22 C-30,-10 30,-10 30,22 Z" fill="url(#logoGrad)" />
        <line x1="-36" y1="26" x2="36" y2="26" stroke="${color2}" stroke-width="4" />
        <path d="M-14,-14 C-14,-32 0,-34 0,-44" stroke="${color2}" stroke-width="3" fill="none" opacity="0.8" />
        <path d="M14,-14 C14,-28 6,-30 6,-38" stroke="${color2}" stroke-width="2.5" fill="none" opacity="0.6" />
        <circle cx="0" cy="-16" r="5" fill="${color2}" />
      </g>
    `;
  }

  // 17. Universal Human Designer Default: Golden Ratio Star & Monolith
  return `
    <!-- Sculptural Star of Excellence -->
    <g stroke-linecap="round" stroke-linejoin="round">
      <polygon points="0,-46 12,-12 46,0 12,12 0,46 -12,12 -46,0 -12,-12" fill="url(#logoGrad)" />
      <circle cx="0" cy="0" r="9" fill="${color2}" />
    </g>
  `;
}

// ─── Extract Initials for Monogram ─────────────────────────────────────────────
function getInitials(name: string): string {
  if (!name) return 'FA';
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  const camel = clean.match(/[A-Z][a-z0-9]*/g);
  if (camel && camel.length >= 2) {
    return (camel[0][0] + camel[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

// ─── Render Local Dynamic Concept Templates (Human Designer Quality) ──────────
function buildClientConcept(conceptIdx: number, name: string, tag: string, domain: string, pCol: string, aCol: string): LogoConcept {
  const nameUpper = (name || 'STARTUP').toUpperCase();
  const tagUpper = (tag || 'PREMIUM BRAND').toUpperCase();
  const initials = getInitials(name);
  const emblem = getDomainEmblemSvg(domain, pCol, aCol);

  if (conceptIdx === 0) {
    // Concept 1: Modern Icon + Wordmark (Horizontal Balanced Luxury Identity)
    const fontSize = nameUpper.length <= 12 ? 26 : (nameUpper.length <= 18 ? 20 : 16);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pCol}" />
      <stop offset="100%" stop-color="${aCol}" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${aCol}" />
      <stop offset="100%" stop-color="${pCol}" />
    </linearGradient>
  </defs>
  <!-- Architectural Canvas Foundation -->
  <rect width="100%" height="100%" fill="#070A14" rx="24"/>
  
  <!-- Subtle Designer Framing Perimeter -->
  <rect x="22" y="22" width="456" height="456" rx="16" fill="none" stroke="${pCol}" stroke-width="1" stroke-opacity="0.18"/>
  <circle cx="22" cy="22" r="3" fill="${aCol}" opacity="0.5"/>
  <circle cx="478" cy="22" r="3" fill="${aCol}" opacity="0.5"/>
  <circle cx="22" cy="478" r="3" fill="${aCol}" opacity="0.5"/>
  <circle cx="478" cy="478" r="3" fill="${aCol}" opacity="0.5"/>

  <!-- Left: Emblem Pillar -->
  <g transform="translate(138, 250)">
    <circle cx="0" cy="0" r="68" fill="#0C1322" stroke="url(#logoGrad)" stroke-width="2.5" />
    <circle cx="0" cy="0" r="58" fill="none" stroke="${aCol}" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4,4" />
    ${emblem}
  </g>
  
  <!-- Right: Editorial Typographic Block -->
  <g transform="translate(232, 236)">
    <text x="0" y="10" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="${fontSize}" fill="#FFFFFF" letter-spacing="3.5">${nameUpper}</text>
    <line x1="0" y1="26" x2="216" y2="26" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="216" cy="26" r="3" fill="${aCol}"/>
    <text x="0" y="48" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="10.5" fill="${aCol}" letter-spacing="4.5">${tagUpper}</text>
  </g>
</svg>`;
    return {
      id: 0,
      layout_key: 'icon_wordmark',
      name: 'Concept 1: Modern Icon + Wordmark',
      layout: 'Modern Icon + Wordmark',
      explanation: 'Balanced horizontal corporate identity combining a tailored domain emblem with modern editorial typography.',
      svg
    };
  }

  if (conceptIdx === 1) {
    // Concept 2: Circular Heritage Guild Emblem (Royal Radial Seal)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pCol}" />
      <stop offset="100%" stop-color="${aCol}" />
    </linearGradient>
    <path id="circlePathTop" d="M 75,250 A 175,175 0 1,1 425,250" fill="none" />
    <path id="circlePathBottom" d="M 425,250 A 175,175 0 0,1 75,250" fill="none" />
  </defs>
  <rect width="100%" height="100%" fill="#070A14" rx="24"/>
  
  <!-- Concentric Guild Rings -->
  <circle cx="250" cy="250" r="218" fill="#090E1B" stroke="url(#logoGrad)" stroke-width="3"/>
  <circle cx="250" cy="250" r="198" fill="none" stroke="${aCol}" stroke-width="1.2" stroke-opacity="0.5" stroke-dasharray="6,4"/>
  <circle cx="250" cy="250" r="132" fill="#0E1628" stroke="url(#logoGrad)" stroke-width="2"/>
  <circle cx="250" cy="250" r="124" fill="none" stroke="${aCol}" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="3,3"/>
  
  <!-- Central Handcrafted Vector Symbol -->
  <g transform="translate(250, 250)">
    ${emblem}
  </g>
  
  <!-- Classical Radial Curved Typography -->
  <text font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="17" fill="#FFFFFF" letter-spacing="4.5">
    <textPath href="#circlePathTop" startOffset="50%" text-anchor="middle">${nameUpper}</textPath>
  </text>
  <text font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="11" fill="${aCol}" letter-spacing="4">
    <textPath href="#circlePathBottom" startOffset="50%" text-anchor="middle">★ ${tagUpper} ★</textPath>
  </text>
</svg>`;
    return {
      id: 1,
      layout_key: 'circular_emblem',
      name: 'Concept 2: Circular Heritage Emblem',
      layout: 'Circular Heritage Emblem',
      explanation: 'Prestigious circular seal with concentric rings, curved typography, and central crest.',
      svg
    };
  }

  // Concept 3: Minimalist Initials Monogram (Artisan Crest)
  const fontInitSize = initials.length <= 2 ? 60 : 44;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pCol}" />
      <stop offset="100%" stop-color="${aCol}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#050811" rx="24"/>
  
  <!-- Monogram Crest Enclosure -->
  <g transform="translate(250, 195)">
    <polygon points="0,-102 72,-72 102,0 72,72 0,102 -72,72 -102,0 -72,-72" fill="#0A0E1A" stroke="url(#logoGrad)" stroke-width="3" />
    <polygon points="0,-88 62,-62 88,0 62,62 0,88 -62,62 -88,0 -62,-62" fill="none" stroke="${aCol}" stroke-width="1" stroke-opacity="0.45" stroke-dasharray="5,4" />
    <text x="0" y="22" font-family="'Cinzel', 'Outfit', serif" font-weight="900" font-size="${fontInitSize}" fill="url(#logoGrad)" text-anchor="middle" letter-spacing="4">${initials}</text>
  </g>
  
  <!-- Wordmark Below Crest -->
  <g transform="translate(250, 365)">
    <text x="0" y="0" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" text-anchor="middle" letter-spacing="4.5">${nameUpper}</text>
    <line x1="-50" y1="16" x2="50" y2="16" stroke="url(#logoGrad)" stroke-width="2" stroke-linecap="round"/>
    <text x="0" y="40" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="10.5" fill="${aCol}" text-anchor="middle" letter-spacing="3.5">${tagUpper}</text>
  </g>
</svg>`;
  return {
    id: 2,
    layout_key: 'monogram',
    name: 'Concept 3: Geometric Monogram',
    layout: 'Geometric Monogram',
    explanation: 'Clean, bold initials crest enclosed inside an engineered hexagonal seal for high scalability.',
    svg
  };
}

export default function BrandingView({ brandingData, businessType = '', idea = '', startupId }: BrandingViewProps) {
  if (!brandingData) {
    return (
      <div className="p-8 text-center text-slate-400">
        No branding kit data generated.
      </div>
    );
  }

  const { 
    company_name, 
    tagline, 
    brand_story, 
    mission, 
    vision, 
    logo_prompt, 
    brand_colors, 
    logo_svg, 
    logo_concepts,
    selected_logo_concept 
  } = brandingData;

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [isSavingConcept, setIsSavingConcept] = useState(false);

  // Active Concept Selection
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(selected_logo_concept || 0);

  // Live Customizable State
  const [customBrandName, setCustomBrandName] = useState(company_name || 'Startup');
  const [customTagline, setCustomTagline] = useState(tagline || 'ELEVATING EXCELLENCE');
  const [logoPrimaryColor, setLogoPrimaryColor] = useState('#6366F1');
  const [logoAccentColor, setLogoAccentColor] = useState('#F59E0B');

  // AI Logo Re-generation State
  const [isGeneratingAiLogo, setIsGeneratingAiLogo] = useState<boolean>(false);
  const [aiStyle, setAiStyle] = useState<string>('luxury');
  const [aiGeneratedConcepts, setAiGeneratedConcepts] = useState<LogoConcept[] | null>(null);

  // Mockup Preview Tab State
  const [activeMockupTab, setActiveMockupTab] = useState<'card' | 'app' | 'website' | 'store'>('card');

  useEffect(() => {
    setCustomBrandName(company_name || 'Startup');
    setCustomTagline(tagline || 'ELEVATING EXCELLENCE');
    setLogoPrimaryColor(brand_colors?.[0]?.hex || '#6366F1');
    setLogoAccentColor(brand_colors?.[2]?.hex || brand_colors?.[1]?.hex || '#F59E0B');
    setAiGeneratedConcepts(null);
    if (typeof selected_logo_concept === 'number') {
      setSelectedConceptIndex(selected_logo_concept);
    }
  }, [company_name, tagline, brand_colors, selected_logo_concept]);

  const domainCombined = `${customBrandName} ${businessType} ${idea}`;

  // 3 Primary Logo Concepts (combines backend generated concepts with live customized overrides)
  const concepts: LogoConcept[] = useMemo(() => {
    // If user clicked AI Re-generate and fresh backend concepts were returned
    if (aiGeneratedConcepts && aiGeneratedConcepts.length >= 3) {
      return aiGeneratedConcepts;
    }

    // If backend provided 3 concepts and user hasn't altered text/colors from backend default
    const isUnchanged = (
      customBrandName === company_name &&
      customTagline === tagline &&
      logoPrimaryColor === (brand_colors?.[0]?.hex || '#6366F1')
    );

    if (isUnchanged && logo_concepts && logo_concepts.length >= 3) {
      return logo_concepts;
    }

    // Otherwise generate dynamic high-fidelity concepts with user's customized colors and text
    return [0, 1, 2].map(idx => 
      buildClientConcept(idx, customBrandName, customTagline, domainCombined, logoPrimaryColor, logoAccentColor)
    );
  }, [aiGeneratedConcepts, logo_concepts, customBrandName, customTagline, domainCombined, logoPrimaryColor, logoAccentColor, company_name, tagline, brand_colors]);

  const activeConcept = concepts[selectedConceptIndex] || concepts[0] || {
    id: 0,
    name: 'Concept 1: Modern Icon + Wordmark',
    layout: 'Modern Icon + Wordmark',
    explanation: 'Clean and premium identity',
    svg: logo_svg || ''
  };

  // ─── Concept Selection & Persistence ────────────────────────────────
  const handleSelectConcept = async (idx: number) => {
    setSelectedConceptIndex(idx);
    if (startupId) {
      setIsSavingConcept(true);
      try {
        await api.selectLogoConcept(startupId, idx);
      } catch (err) {
        console.warn('Could not persist concept to backend:', err);
      } finally {
        setIsSavingConcept(false);
      }
    }
  };

  // ─── AI Regeneration Trigger ─────────────────────────────────────────
  const handleGenerateAiLogo = async () => {
    setIsGeneratingAiLogo(true);
    try {
      const res = await api.generateLogoSvg(customBrandName, businessType, idea, aiStyle);
      if (res && res.logo_concepts && res.logo_concepts.length >= 3) {
        setAiGeneratedConcepts(res.logo_concepts);
        setSelectedConceptIndex(0);
      }
    } catch (err) {
      console.error('Failed to generate AI SVG logo:', err);
    } finally {
      setIsGeneratingAiLogo(false);
    }
  };

  // ─── Download Handlers ───────────────────────────────────────────────
  const handleDownloadSvg = () => {
    if (startupId) {
      window.location.href = api.getBrandingAssetUrl(startupId, 'svg', selectedConceptIndex);
      return;
    }
    const blob = new Blob([activeConcept.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customBrandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_logo.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = (transparent: boolean = false) => {
    if (startupId) {
      const fmt = transparent ? 'png_transparent' : 'png';
      window.location.href = api.getBrandingAssetUrl(startupId, fmt, selectedConceptIndex, 1024);
      return;
    }
    // Client-side Canvas fallback (1024x1024)
    const svgString = activeConcept.svg;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (!transparent) {
          ctx.fillStyle = '#070a14';
          ctx.fillRect(0, 0, 1024, 1024);
        }
        ctx.drawImage(img, 0, 0, 1024, 1024);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${customBrandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_logo${transparent ? '_transparent' : ''}.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDownloadFavicon = () => {
    if (startupId) {
      window.location.href = api.getBrandingAssetUrl(startupId, 'favicon_png', selectedConceptIndex, 512);
      return;
    }
    handleDownloadPng(false);
  };

  const handleDownloadBrandKitZip = () => {
    if (startupId) {
      window.location.href = api.getBrandKitZipUrl(startupId, selectedConceptIndex);
    } else {
      handleDownloadSvg();
    }
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(activeConcept.svg);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  const copyColorToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(logo_prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1500);
  };

  return (
    <div className="space-y-10 animate-fade-in text-slate-100">
      
      {/* ─── Header: Your Brand Identity ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black font-outfit text-white tracking-tight">Your Brand Identity</h2>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              100% Free Vector Logo System
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Programmatic vector branding for <strong>{company_name}</strong> ({businessType}) powered by Gemini intelligence and local SVG engine.
          </p>
        </div>

        {/* Quick Brand Kit ZIP Action */}
        <button
          onClick={handleDownloadBrandKitZip}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
        >
          <Package size={15} />
          <span>Download Brand Kit (.ZIP)</span>
        </button>
      </div>

      {/* ─── STEP 9 & 10: 3 LOGO CONCEPTS SIDE-BY-SIDE ──────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" />
            <h3 className="text-lg font-black font-outfit text-white">3 Distinct Logo Concepts</h3>
            <span className="text-[10px] text-slate-400 font-medium">Click any concept to preview & select</span>
          </div>
          {isSavingConcept && (
            <span className="text-xs text-indigo-400 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Saving selection...
            </span>
          )}
        </div>

        {/* The 3 Concept Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {concepts.slice(0, 3).map((concept, idx) => {
            const isSelected = selectedConceptIndex === idx;
            return (
              <div 
                key={idx}
                onClick={() => handleSelectConcept(idx)}
                className={`relative rounded-3xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isSelected 
                    ? 'bg-slate-900/90 border-indigo-500 ring-2 ring-indigo-500/50 shadow-2xl shadow-indigo-500/20 scale-[1.02]' 
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 opacity-85 hover:opacity-100'
                }`}
              >
                {/* Active Selection Badge */}
                {isSelected && (
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <CheckCircle2 size={11} />
                    <span>Selected</span>
                  </div>
                )}

                {/* Concept Preview */}
                <div className="space-y-4">
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-inner relative group-hover:border-indigo-500/40 transition">
                    <div dangerouslySetInnerHTML={{ __html: concept.svg }} className="w-full h-full" />
                  </div>

                  {/* Concept Meta */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        {concept.layout}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Concept #{idx + 1}</span>
                    </div>
                    <h4 className="text-sm font-black font-outfit text-white tracking-wide">
                      {concept.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      "{concept.explanation}"
                    </p>
                  </div>
                </div>

                {/* Select Button */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: logoPrimaryColor }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: logoAccentColor }} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectConcept(idx);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check size={12} />
                        <span>Selected Logo</span>
                      </>
                    ) : (
                      <span>Select this logo</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── BRAND ASSET PACKAGE READY (Download Suite) ─────────────────────────── */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 shadow-2xl bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <h3 className="text-base font-black font-outfit text-white flex items-center gap-2">
                <span>Brand Asset Package Ready</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">Active: {activeConcept.name}</span>
              </h3>
              <p className="text-xs text-slate-400">Export production-ready vectors, high-definition PNGs, and transparent logos for "{customBrandName}".</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {/* 1. Download SVG */}
          <button
            onClick={handleDownloadSvg}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition text-left flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between w-full">
              <FileCode size={16} className="text-emerald-400" />
              <Download size={13} className="text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-white">Download SVG</p>
              <p className="text-[10px] text-slate-400 font-mono">Editable Vector</p>
            </div>
          </button>

          {/* 2. Download PNG */}
          <button
            onClick={() => handleDownloadPng(false)}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition text-left flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between w-full">
              <ImageIcon size={16} className="text-indigo-400" />
              <Download size={13} className="text-slate-500 group-hover:text-indigo-400 transition" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-white">Download PNG</p>
              <p className="text-[10px] text-slate-400 font-mono">1024x1024 HD</p>
            </div>
          </button>

          {/* 3. Download Transparent PNG */}
          <button
            onClick={() => handleDownloadPng(true)}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition text-left flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between w-full">
              <Sparkle size={16} className="text-cyan-400" />
              <Download size={13} className="text-slate-500 group-hover:text-cyan-400 transition" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-white">Transparent PNG</p>
              <p className="text-[10px] text-slate-400 font-mono">No Background</p>
            </div>
          </button>

          {/* 4. Download Favicon */}
          <button
            onClick={handleDownloadFavicon}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition text-left flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between w-full">
              <Globe size={16} className="text-amber-400" />
              <Download size={13} className="text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-white">Download Favicon</p>
              <p className="text-[10px] text-slate-400 font-mono">512x512 Web Icon</p>
            </div>
          </button>

          {/* 5. Download Brand Kit ZIP */}
          <button
            onClick={handleDownloadBrandKitZip}
            className="p-3 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 hover:border-indigo-400 transition text-left flex flex-col justify-between group shadow-md"
          >
            <div className="flex items-center justify-between w-full">
              <Package size={16} className="text-amber-300" />
              <Download size={13} className="text-amber-300 group-hover:scale-110 transition" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-black text-white">Brand Kit .ZIP</p>
              <p className="text-[10px] text-indigo-200 font-mono">All Brand Assets</p>
            </div>
          </button>
        </div>
      </div>

      {/* ─── REAL-TIME LOGO STAGE & LIVE CUSTOMIZERS ───────────────────────────── */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-6">
        
        {/* Top Control Bar & AI Prompt */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-gradient-to-br from-amber-500 via-indigo-600 to-purple-600 rounded-xl text-white shadow-md">
              <Wand2 size={20} />
            </span>
            <div>
              <h3 className="text-lg font-black font-outfit text-white">Live Design Customizer & Studio</h3>
              <p className="text-xs text-slate-400">Tune brand colors, company name, and taglines with instant vector re-rendering.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={aiStyle}
              onChange={(e) => setAiStyle(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 rounded-xl outline-none focus:border-amber-400"
            >
              <option value="luxury">👑 Style: Royal Luxury</option>
              <option value="modern tech">⚡ Style: Modern Cyber Tech</option>
              <option value="artisan organic">🎨 Style: Vintage Artisan</option>
              <option value="bold shield">🛡️ Style: Metallic Power Shield</option>
              <option value="futuristic ai">🚀 Style: Futuristic AI</option>
            </select>

            <button
              onClick={handleGenerateAiLogo}
              disabled={isGeneratingAiLogo}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingAiLogo ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Re-generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Re-generate Concepts</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Studio Grid: Active Logo Stage & Customizers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Featured Active Logo Stage (Left) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/90 rounded-3xl border border-slate-800 shadow-2xl relative group">
            <div className="w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
              <div dangerouslySetInnerHTML={{ __html: activeConcept.svg }} className="w-full h-full" />
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                ✨ Active: {activeConcept.name}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">Customized vector emblem for <strong>{customBrandName}</strong></p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-4">
              <button 
                onClick={handleCopySvg}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-600 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1"
              >
                {copiedSvg ? <><Check size={13} className="text-emerald-400" /><span>Copied</span></> : <><Copy size={13} /><span>SVG Code</span></>}
              </button>
              <button 
                onClick={() => handleDownloadPng(false)}
                className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-bold text-indigo-300 rounded-xl transition flex items-center gap-1"
              >
                <ImageIcon size={13} />
                <span>PNG HD</span>
              </button>
              <button 
                onClick={handleDownloadSvg} 
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 rounded-xl transition flex items-center gap-1"
              >
                <Download size={13} />
                <span>Vector SVG</span>
              </button>
            </div>
          </div>

          {/* Customizer Controls (Right) */}
          <div className="lg:col-span-7 space-y-5 text-xs">
            
            {/* Live Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 border border-slate-800 bg-slate-900/60 rounded-2xl space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette size={12} className="text-indigo-400" /> Primary Brand Color
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={logoPrimaryColor} 
                    onChange={e => setLogoPrimaryColor(e.target.value)} 
                    className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-0" 
                  />
                  <input 
                    type="text" 
                    value={logoPrimaryColor} 
                    onChange={e => setLogoPrimaryColor(e.target.value)} 
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 font-mono text-slate-200" 
                  />
                </div>
              </div>

              <div className="p-3.5 border border-slate-800 bg-slate-900/60 rounded-2xl space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette size={12} className="text-amber-400" /> Accent Highlight Color
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={logoAccentColor} 
                    onChange={e => setLogoAccentColor(e.target.value)} 
                    className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-0" 
                  />
                  <input 
                    type="text" 
                    value={logoAccentColor} 
                    onChange={e => setLogoAccentColor(e.target.value)} 
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 font-mono text-slate-200" 
                  />
                </div>
              </div>
            </div>

            {/* Editable Text Customizers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Startup / Brand Name</label>
                <input 
                  type="text" 
                  value={customBrandName} 
                  onChange={e => setCustomBrandName(e.target.value)} 
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 font-bold" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brand Tagline</label>
                <input 
                  type="text" 
                  value={customTagline} 
                  onChange={e => setCustomTagline(e.target.value)} 
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-200" 
                />
              </div>
            </div>

            {/* Design Reason Rationale */}
            {brandingData.brand_design?.design_reason && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-slate-300 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  Design Architecture Rationale
                </span>
                <p>{brandingData.brand_design.design_reason}</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ─── REAL-LIFE BRAND PRODUCT MOCKUP SUITE ──────────────────────────────── */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black font-outfit text-white flex items-center gap-2">
              <span>Brand Application Mockups</span>
              <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">Live Visual Context</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">See how your chosen logo looks on business cards, mobile app launchers, websites, and storefront signs.</p>
          </div>

          {/* Mockup Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveMockupTab('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeMockupTab === 'card' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <CreditCard size={14} />
              <span>Business Card</span>
            </button>
            <button
              onClick={() => setActiveMockupTab('app')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeMockupTab === 'app' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Smartphone size={14} />
              <span>App Icon</span>
            </button>
            <button
              onClick={() => setActiveMockupTab('website')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeMockupTab === 'website' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Globe size={14} />
              <span>Website</span>
            </button>
            <button
              onClick={() => setActiveMockupTab('store')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeMockupTab === 'store' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Store size={14} />
              <span>Storefront</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Business Card */}
        {activeMockupTab === 'card' && (
          <div className="flex items-center justify-center p-8 bg-slate-950/80 rounded-3xl border border-slate-800">
            <div className="w-full max-w-md aspect-[1.75/1] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-slate-900">
                  <div dangerouslySetInnerHTML={{ __html: activeConcept.svg }} className="w-full h-full" />
                </div>
                <div className="text-right">
                  <h4 className="text-lg font-black font-outfit text-white tracking-wider uppercase">{customBrandName}</h4>
                  <p className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mt-0.5">{customTagline}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-between items-end text-[11px] text-slate-400 font-mono">
                <div>
                  <p className="text-white font-bold">FOUNDER & CEO</p>
                  <p className="text-[10px] text-slate-500">contact@{customBrandName.toLowerCase().replace(/[^a-z]/g, '')}.com</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">www.{customBrandName.toLowerCase().replace(/[^a-z]/g, '')}.com</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: App Icon */}
        {activeMockupTab === 'app' && (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-950 scale-100 hover:scale-105 transition">
                  <div dangerouslySetInnerHTML={{ __html: activeConcept.svg }} className="w-full h-full" />
                </div>
                <span className="text-[11px] font-bold text-slate-300">{customBrandName}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-slate-950 opacity-90">
                  <div dangerouslySetInnerHTML={{ __html: activeConcept.svg }} className="w-full h-full" />
                </div>
                <span className="text-[10px] text-slate-400">Launcher</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic">iOS & Android App Launcher Grid Preview</p>
          </div>
        )}

        {/* Tab 3: Website Header */}
        {activeMockupTab === 'website' && (
          <div className="p-6 bg-slate-950/80 rounded-3xl border border-slate-800">
            <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-slate-950">
                    <div dangerouslySetInnerHTML={{ __html: activeConcept.svg }} className="w-full h-full" />
                  </div>
                  <span className="font-black font-outfit text-white text-base tracking-tight">{customBrandName}</span>
                </div>

                <div className="hidden sm:flex items-center gap-6 text-xs text-slate-400 font-semibold">
                  <span className="text-white">Home</span>
                  <span>Products</span>
                  <span>Solutions</span>
                  <span>Pricing</span>
                </div>

                <button className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
                  Get Started
                </button>
              </div>

              <div className="py-8 text-center space-y-2">
                <h4 className="text-xl font-black font-outfit text-white">Welcome to {customBrandName}</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">{brand_story || customTagline}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Storefront Signage */}
        {activeMockupTab === 'store' && (
          <div className="flex items-center justify-center p-8 bg-slate-950/80 rounded-3xl border border-slate-800">
            <div className="w-full max-w-lg aspect-[2/1] rounded-2xl bg-slate-950 border border-slate-800 p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-transparent to-black" />
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900 relative z-10">
                <div dangerouslySetInnerHTML={{ __html: activeConcept.svg }} className="w-full h-full" />
              </div>
              <h4 className="text-2xl font-black font-outfit text-white tracking-widest uppercase mt-4 relative z-10 drop-shadow-md">
                {customBrandName}
              </h4>
              <p className="text-xs text-amber-400 font-bold tracking-widest uppercase relative z-10">
                {customTagline}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ─── HERO BRAND PROFILE & STORY ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Company Profile */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top right, ${logoPrimaryColor}, transparent 70%)` }}
          />
          
          <div className="relative flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
                <div dangerouslySetInnerHTML={{ __html: activeConcept.svg }} className="w-full h-full" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Active Emblem</span>
            </div>

            {/* Brand Text */}
            <div className="flex-1 space-y-4">
              <div>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  ✦ Approved Brand Identity
                </span>
                <h3 className="text-3xl font-black font-outfit text-white tracking-tight mt-2">
                  {customBrandName}
                </h3>
                {customTagline && (
                  <p className="text-sm font-semibold text-slate-300 italic mt-0.5">
                    "{customTagline}"
                  </p>
                )}
              </div>

              {brand_story && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <p><strong className="text-white">Brand Story:</strong> {brand_story}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Mission & Vision</h4>
            </div>
            {mission && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Mission</span>
                <p>{mission}</p>
              </div>
            )}
            {vision && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Vision</span>
                <p>{vision}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── COLOR PALETTE COORDINATES ─────────────────────────────────────────── */}
      {brand_colors && brand_colors.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-indigo-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Brand Color Coordinates</h3>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Click HEX to Copy</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {brand_colors.map((col, idx) => (
              <div 
                key={idx}
                onClick={() => copyColorToClipboard(col.hex)}
                className="p-3 rounded-2xl border border-slate-800 bg-slate-900/60 cursor-pointer hover:border-indigo-500 transition space-y-2 group"
              >
                <div className="h-12 rounded-xl shadow-inner border border-white/10" style={{ backgroundColor: col.hex }} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white truncate">{col.name}</span>
                  <span className="text-[9px] font-mono text-slate-400 group-hover:text-indigo-400 font-bold">
                    {copiedColor === col.hex ? 'COPIED!' : col.hex}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MIDJOURNEY / DALL·E PROMPT ────────────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            External Image Model Prompt (Midjourney / DALL·E)
          </h3>
        </div>
        <div className="p-4 border border-indigo-500/30 bg-indigo-950/20 rounded-2xl flex items-start justify-between gap-4">
          <p className="text-xs text-slate-300 italic font-mono leading-relaxed select-all flex-1">
            "{logo_prompt}"
          </p>
          <button
            onClick={copyPromptToClipboard}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
          >
            {copiedPrompt ? (
              <>
                <Check size={12} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
