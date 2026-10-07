import { useState, useEffect, useMemo } from 'react';
import {
  Laptop, Tablet, Smartphone, Code, Eye, RotateCcw, Copy, Check,
  ExternalLink, Download, Sparkles, Palette, Type, Sliders, Zap, Edit3, Box
} from 'lucide-react';
import type { WebsiteData, CustomerPersona } from '../types';

interface WebsitePreviewProps {
  websiteData: WebsiteData | undefined;
  companyName: string;
  businessType?: string;
  idea?: string;
  personas?: CustomerPersona[];
}

// ─── Semantic Helper for Domain Scoring ──────────────────────────────────────────
function scoreDomainKeywords(text: string, keywords: string[]): number {
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

// ─── Universal Semantic Image Cluster Registry ─────────────────────────────────
interface ImageCluster {
  id: string;
  keywords: string[];
  images: string[];
  subMatches?: { keywords: string[]; image: string }[];
}

const SEMANTIC_IMAGE_CLUSTERS: ImageCluster[] = [
  {
    id: 'ethnic_fashion',
    keywords: [
      'saree', 'sari', 'kanchipuram', 'silk', 'ethnic wear', 'ethnic', 'lehenga', 'sherwani',
      'festive styling', 'festive wear', 'bridal', 'kurti', 'salwar', 'zari', 'handloom',
      'designer silk', 'wedding styling', 'traditional wear', 'vastra', 'pattu'
    ],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469668-935cb746270c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'modern_fashion',
    keywords: [
      'fashion', 'boutique', 'apparel', 'garment', 'clothing', 'tailor', 'tailoring',
      'textile', 'wardrobe', 'menswear', 'womenswear', 'kidswear', 'designer wear',
      'department store', 'dress', 'outfit', 'fitting assistance', 'stitch', 'alteration'
    ],
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=80'
    ],
    subMatches: [
      { keywords: ['tailor', 'fitting', 'stitch', 'alteration', 'measure', 'bespoke'], image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80' }
    ]
  },
  {
    id: 'automotive_care',
    keywords: [
      'car wash', 'auto detailing', 'vehicle wash', 'car spa', 'foam wash', 'ceramic coating',
      'auto care', 'car polish', 'bike wash', 'snow foam', 'steam vacuum', 'nano coating',
      'detailing', 'car cleaning', 'car repair', 'mechanic', 'garage', 'vehicle', 'ev charging'
    ],
    images: [
      'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1520340356584-f9917d1beb6d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fe?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80'
    ],
    subMatches: [
      { keywords: ['wash', 'clean', 'sponge', 'exterior'], image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['foam', 'snow', 'pressure', 'spray'], image: 'https://images.unsplash.com/photo-1520340356584-f9917d1beb6d?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['vacuum', 'interior', 'steam', 'cabin', 'upholstery'], image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fe?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['polish', 'buff', 'scratch', 'buffer'], image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['ceramic', 'coating', 'nano', 'ppf', 'wax'], image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=80' }
    ]
  },
  {
    id: 'culinary_restaurant',
    keywords: [
      'biryani', 'restaurant', 'bistro', 'dining', 'catering', 'thali', 'curry',
      'spices', 'chukka', 'varuval', 'dosa', 'dum biryani', 'banana leaf', 'tiffin',
      'cuisine', 'food', 'eatery', 'dhaba', 'kitchen', 'chef', 'gourmet'
    ],
    images: [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1000&q=80'
    ],
    subMatches: [
      { keywords: ['biryani', 'dum', 'handi', 'rice', 'pulao'], image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['leaf', 'thali', 'south', 'meal', 'platter', 'dosa'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['curry', 'mutton', 'chicken', 'chukka', 'gravy', 'masala'], image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['chef', 'cook', 'kitchen', 'pan', 'gourmet', 'culinary'], image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=80' }
    ]
  },
  {
    id: 'cafe_bakery',
    keywords: [
      'coffee', 'cafe', 'espresso', 'barista', 'latte', 'bakery', 'croissant',
      'sourdough', 'pastry', 'cold brew', 'roastery', 'tea stall', 'chai', 'boba', 'cake'
    ],
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=1000&q=80'
    ],
    subMatches: [
      { keywords: ['latte', 'art', 'barista', 'pour', 'espresso', 'brew'], image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['bake', 'bread', 'croissant', 'pastry', 'sourdough', 'cake'], image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80' }
    ]
  },
  {
    id: 'fitness_gym',
    keywords: [
      'gym', 'fitness', 'crossfit', 'workout', 'bodybuilding', 'strength training',
      'personal trainer', 'yoga studio', 'pilates', 'athletic', 'climbing', 'bouldering'
    ],
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1000&q=80'
    ],
    subMatches: [
      { keywords: ['trainer', 'coach', 'personal', 'weights', 'lifting', 'muscle'], image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['yoga', 'stretch', 'pilates', 'mat', 'zen', 'flexibility'], image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80' }
    ]
  },
  {
    id: 'salon_beauty',
    keywords: [
      'salon', 'beauty parlour', 'barber', 'haircut', 'spa', 'facial', 'skincare',
      'manicure', 'pedicure', 'grooming lounge', 'massage', 'cosmetics'
    ],
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512290900672-1f480302b28c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80'
    ],
    subMatches: [
      { keywords: ['barber', 'beard', 'haircut', 'shave', 'styling'], image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['spa', 'facial', 'skincare', 'massage', 'therapy'], image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80' }
    ]
  },
  {
    id: 'pet_care',
    keywords: [
      'pet care', 'dog grooming', 'cat cafe', 'veterinary', 'vet clinic', 'animal hospital',
      'pet clinic', 'puppy', 'kitten', 'vaccination', 'pet care', 'animal clinic',
      'canine', 'feline', 'pet boarding', 'dog care', 'cat care', 'pet surgery', 'pet', 'paws'
    ],
    images: [
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1000&q=80'
    ],
    subMatches: [
      { keywords: ['vaccin', 'immun', 'checkup', 'preventive', 'wellness exam'], image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['groom', 'bath', 'spa', 'shear', 'coat', 'fur', 'brushing'], image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['surg', 'emergency', 'diagnost', 'x-ray', 'icu', 'critical', 'treatment'], image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=80' }
    ]
  },
  {
    id: 'medical_healthcare',
    keywords: [
      'doctor', 'clinic', 'hospital', 'dental', 'dentist', 'pharmacy',
      'physiotherapy', 'diagnostics', 'medical center', 'healthcare', 'medicine'
    ],
    images: [
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1000&q=80'
    ],
    subMatches: [
      { keywords: ['dental', 'dentist', 'teeth', 'smile', 'orthodont'], image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['pharmacy', 'medicine', 'drugstore', 'chemist', 'prescription'], image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80' }
    ]
  },
  {
    id: 'grocery_agriculture',
    keywords: [
      'grocery', 'supermarket', 'kirana', 'organic produce', 'vegetable market',
      'fruit market', 'provisions', 'fresh produce', 'daily mart', 'farm', 'hydroponic'
    ],
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'laundry_cleaning',
    keywords: [
      'laundry', 'dry clean', 'dry cleaning', 'laundromat', 'steam iron',
      'wash fold', 'washing machine', 'laundrette', 'commercial laundry'
    ],
    images: [
      'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'real_estate_architecture',
    keywords: [
      'real estate', 'property', 'interior design', 'architect', 'villa', 'apartment', 'home decor', 'realty', 'construction'
    ],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'education_academics',
    keywords: [
      'education', 'academy', 'school', 'coaching institute', 'tutor', 'learning center', 'edtech', 'university', 'classroom'
    ],
    images: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'logistics_freight',
    keywords: [
      'logistics', 'delivery service', 'courier', 'fleet', 'transport', 'shipping', 'freight', 'warehouse', 'cargo'
    ],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580674285054-476b61e74852?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'crafts_maker_art',
    keywords: [
      'pottery', 'ceramics', 'clay', 'art studio', 'photography studio', 'woodworking',
      'carpentry', 'maker', 'craft', 'artisan', 'sculpture', 'painting', 'handmade', 'art'
    ],
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1000&q=80'
    ],
    subMatches: [
      { keywords: ['pottery', 'ceramic', 'clay'], image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['photo', 'camera', 'portrait'], image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1000&q=80' }
    ]
  },
  {
    id: 'tech_software_drones',
    keywords: [
      'software', 'saas', 'tech', 'technology', 'artificial intelligence', 'mobile app', 'cloud platform',
      'developer agency', 'drone', 'aerial', 'robotics', 'automation', 'cybersecurity', 'coding'
    ],
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80'
    ],
    subMatches: [
      { keywords: ['drone', 'aerial', 'uav'], image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80' },
      { keywords: ['analytics', 'dashboard', 'graph'], image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80' }
    ]
  },
  {
    id: 'clean_energy_solar',
    keywords: [
      'solar', 'solar panel', 'clean energy', 'renewable', 'green tech', 'sustainability', 'ev charging'
    ],
    images: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'hospitality_travel',
    keywords: [
      'hotel', 'resort', 'boutique hotel', 'travel', 'vacation', 'hospitality', 'hostel', 'tourism'
    ],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80'
    ]
  }
];

const UNIVERSAL_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80'
];

// ─── Smart Service Image Resolver (Universal Multi-Domain Engine with Strict Deduplication) ──
function resolveServiceImage(
  title: string,
  desc: string,
  companyName: string,
  businessType: string,
  idea: string,
  index: number,
  imageQuery?: string,
  usedImages?: Set<string>
): string {
  // 1. Direct URL check
  const directCandidate = (imageQuery && imageQuery.startsWith('http')) ? imageQuery : (title && title.startsWith('http')) ? title : null;
  if (directCandidate) {
    if (!usedImages || !usedImages.has(directCandidate)) {
      usedImages?.add(directCandidate);
      return directCandidate;
    }
  }

  // 2. Synthesize semantic token texts
  // specificItemText is for fine-grained sub-matches (MUST NOT be contaminated by companyName/idea)
  const qStr = (imageQuery || '').toLowerCase();
  const tStr = `${title} ${desc}`.toLowerCase();
  const specificItemText = `${qStr} ${tStr}`.trim();

  // generalContext is used ONLY for scoring which industry cluster wins
  const cStr = `${companyName} ${businessType} ${idea}`.toLowerCase();

  let topCluster: ImageCluster | null = null;
  let maxScore = 0;

  for (const cluster of SEMANTIC_IMAGE_CLUSTERS) {
    let score = 0;
    // Score heavily on AI image_query tokens (4x), title (3x), general context (1.5x)
    if (qStr) score += scoreDomainKeywords(qStr, cluster.keywords) * 4;
    score += scoreDomainKeywords(tStr, cluster.keywords) * 3;
    score += scoreDomainKeywords(cStr, cluster.keywords) * 1.5;

    if (score > maxScore) {
      maxScore = score;
      topCluster = cluster;
    }
  }

  // 3. Winning cluster matching
  if (topCluster && maxScore >= 2) {
    // Check fine-grained sub-concept matches in winning cluster ONLY using specific item text
    if (topCluster.subMatches && specificItemText.length > 0) {
      for (const sub of topCluster.subMatches) {
        if (sub.keywords.some(k => specificItemText.includes(k.toLowerCase()))) {
          // Guarantee that this sub-match image is not repeated!
          if (!usedImages || !usedImages.has(sub.image)) {
            usedImages?.add(sub.image);
            return sub.image;
          }
        }
      }
    }

    // Pick the first unused image from topCluster.images
    if (usedImages) {
      for (let i = 0; i < topCluster.images.length; i++) {
        const candidate = topCluster.images[(index + i) % topCluster.images.length];
        if (!usedImages.has(candidate)) {
          usedImages.add(candidate);
          return candidate;
        }
      }
    } else {
      return topCluster.images[index % topCluster.images.length];
    }
  }

  // 4. Fallback: Search universal fallback images for an unused one
  if (usedImages) {
    for (let i = 0; i < UNIVERSAL_FALLBACK_IMAGES.length; i++) {
      const candidate = UNIVERSAL_FALLBACK_IMAGES[(index + i) % UNIVERSAL_FALLBACK_IMAGES.length];
      if (!usedImages.has(candidate)) {
        usedImages.add(candidate);
        return candidate;
      }
    }
  }

  const finalChoice = UNIVERSAL_FALLBACK_IMAGES[index % UNIVERSAL_FALLBACK_IMAGES.length];
  usedImages?.add(finalChoice);
  return finalChoice;
}

// ─── Universal Industry Content Generator ──────────────────────────────────────
function getIndustryPack(
  companyName: string,
  _templateCategory: string = '',
  businessType: string = '',
  idea: string = '',
  websiteData?: WebsiteData,
  personas?: CustomerPersona[]
) {
  const displayCategory = websiteData?.template_category?.replace(/_/g, ' ') || businessType || 'Premier Services';
  const categoryCapitalized = displayCategory.charAt(0).toUpperCase() + displayCategory.slice(1);

  const heroTitle = websiteData?.hero?.title || `Welcome to ${companyName}`;
  const heroSubtitle = websiteData?.hero?.subtitle || (idea ? `Leading the way in ${idea}. Built for exceptional quality, modern execution, and customer trust.` : `The premier destination for ${businessType || 'modern services'}.`);
  const ctaText = websiteData?.hero?.cta_text || 'Explore Services';
  const aboutTitle = websiteData?.about?.title || `About ${companyName}`;
  const aboutContent = websiteData?.about?.content || (idea ? `${companyName} was created to deliver uncompromising excellence for "${idea}". We combine industry expertise, modern convenience, and customer-first service.` : `${companyName} brings unparalleled quality and dedication to every client.`);

  // Comprehensive page-wide image deduplication set — ZERO duplicate images anywhere on site
  const usedImages = new Set<string>();

  const heroImage = (websiteData?.hero?.background_image && websiteData.hero.background_image.startsWith('http'))
    ? websiteData.hero.background_image
    : resolveServiceImage('hero banner', 'welcome experience', companyName, businessType, idea, 0, websiteData?.hero?.background_image, usedImages);
  usedImages.add(heroImage);

  const aboutImage = resolveServiceImage('about story', 'our mission and facility', companyName, businessType, idea, 1, undefined, usedImages);
  usedImages.add(aboutImage);

  // Dynamic services mapped directly from AI response with matching contextual photos
  const rawServices = websiteData?.services && websiteData.services.length > 0 ? websiteData.services : [
    { title: `Signature ${businessType || 'Offering'}`, description: `Tailored premium experience crafted with high standards for ${companyName} clients.` },
    { title: 'Customized Solutions', description: `Flexible service packages customized to your specific needs and timeline.` },
    { title: 'Express & Dedicated Care', description: `Fast, dependable turnaround backed by our satisfaction guarantee.` }
  ];

  const services = rawServices.map((s: any, i: number) => {
    const sImg = (s.image_url && s.image_url.startsWith('http') && !usedImages.has(s.image_url))
      ? s.image_url
      : resolveServiceImage(s.title || '', s.description || '', companyName, businessType, idea, i + 2, s.image_query || s.image_url, usedImages);
    usedImages.add(sImg);
    return {
      title: s.title,
      description: s.description,
      price: s.price || (i === 0 ? 'Signature' : i === 1 ? 'Popular' : 'Premium Tier'),
      image: sImg
    };
  });

  // Dynamic portfolio items derived from actual services and domain — EACH GETS A UNIQUE IMAGE!
  const portfolio = rawServices.slice(0, 6).map((s: any, i: number) => {
    const pImg = resolveServiceImage(`showcase gallery ${s.title}`, 'client portfolio result', companyName, businessType, idea, i + 10, undefined, usedImages);
    usedImages.add(pImg);
    return {
      title: s.title,
      tag: i === 0 ? 'Featured' : (i === 1 ? 'Best Seller' : 'Specialty'),
      image: pImg
    };
  });

  // Ensure 6 portfolio items with domain-aware imagery without duplicates
  while (portfolio.length < 6) {
    const idx = portfolio.length;
    const pImg = resolveServiceImage(`gallery feature 0${idx + 1}`, 'portfolio work', companyName, businessType, idea, idx + 15, undefined, usedImages);
    usedImages.add(pImg);
    portfolio.push({
      title: `${companyName} Experience 0${idx + 1}`,
      tag: 'Showcase',
      image: pImg
    });
  }

  // Dynamic pillars reflecting the company
  const pillars = [
    { title: 'Premium Quality Standard', desc: `Every offering at ${companyName} is executed to uncompromising benchmarks of quality and precision.` },
    { title: 'Customer-Centric Care', desc: 'Transparent communication, personalized attention, and dedicated service from start to finish.' },
    { title: 'Modern Innovation', desc: 'Leveraging contemporary techniques and modern technology to provide seamless customer satisfaction.' }
  ];

  // Dynamic Persona-Driven Testimonials bound directly to product.personas
  const avatarList = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80'
  ];

  let testimonials: any[] = [];

  if (personas && personas.length > 0) {
    testimonials = personas.slice(0, 3).map((p, idx) => {
      const cleanPain = p.pain_points ? p.pain_points.replace(/\.$/, '').trim() : 'finding reliable quality';
      const cleanGoal = p.goals ? p.goals.replace(/\.$/, '').trim() : 'achieving peace of mind';
      const quotes = [
        `"Before partnering with ${companyName}, our biggest pain point was ${cleanPain.toLowerCase()}. Their team completely eliminated that friction and helped us ${cleanGoal.toLowerCase()}. The quality is unmatched!"`,
        `"Finding ${companyName} was a game changer for us. They directly resolved our struggles with ${cleanPain.toLowerCase()} and made achieving ${cleanGoal.toLowerCase()} effortless. Highly recommended!"`,
        `"The level of consistency and craftsmanship at ${companyName} blew us away. They truly understand what it takes to ${cleanGoal.toLowerCase()} while solving ${cleanPain.toLowerCase()}."`
      ];
      return {
        quote: quotes[idx % quotes.length],
        author: p.name || `Client ${idx + 1}`,
        role: p.role || 'Verified Customer',
        rating: 5,
        avatar: avatarList[idx % avatarList.length]
      };
    });
  }

  // Fallback to contextual testimonials if product.personas is empty or not yet generated
  if (!testimonials || testimonials.length === 0) {
    const isPetBiz = /pet|vet|animal|dog|cat|puppy|kitten/i.test(`${companyName} ${businessType} ${idea}`);
    const isFoodBiz = /food|restaurant|cafe|coffee|biryani|dining|bakery/i.test(`${companyName} ${businessType} ${idea}`);
    if (isPetBiz) {
      testimonials = [
        { quote: `Dr. and the team at ${companyName} took such gentle, loving care of our Golden Retriever during his surgery and vaccinations. Truly compassionate!`, author: 'Ananya Roy', role: 'Pet Parent (Golden Retriever)', rating: 5, avatar: avatarList[0] },
        { quote: `Best veterinary clinic in town. Transparent consultation fees, zero wait time, and genuine love for animals. Our cat is finally stress-free!`, author: 'Karthik Raman', role: 'Cat & Dog Parent', rating: 5, avatar: avatarList[1] },
        { quote: `From routine wellness check-ups to puppy nutrition guidance, ${companyName} has been a blessing for our family. Highly recommend!`, author: 'Meera Nambiar', role: 'Rescue Puppy Parent', rating: 5, avatar: avatarList[2] }
      ];
    } else if (isFoodBiz) {
      testimonials = [
        { quote: `The flavors and presentation at ${companyName} are sensational. Every visit feels like a masterclass in culinary excellence!`, author: 'Siddharth Rao', role: 'Food Critic & Regular Patron', rating: 5, avatar: avatarList[0] },
        { quote: `Uncompromised authenticity and fresh ingredients. ${companyName} has easily become our favorite spot in the neighborhood.`, author: 'Divya Krishnan', role: 'Weekend Visitor', rating: 5, avatar: avatarList[1] },
        { quote: `Fast, hospitable service and exceptional taste. You can feel the passion they put into every single plate!`, author: 'Arjun Sen', role: 'Verified Customer', rating: 5, avatar: avatarList[2] }
      ];
    } else {
      testimonials = [
        { quote: `The level of quality and professionalism at ${companyName} is truly impressive. They exceeded our highest expectations!`, author: 'Aarav Sharma', role: 'Verified Customer', rating: 5, avatar: avatarList[0] },
        { quote: `Outstanding experience with ${companyName}. The attention to detail and customer care is completely unmatched.`, author: 'Pooja Iyer', role: 'Client', rating: 5, avatar: avatarList[1] },
        { quote: `Reliable, transparent, and top-tier service. Highly recommend ${companyName} to anyone in the area!`, author: 'Vikram Mehta', role: 'Regular Patron', rating: 5, avatar: avatarList[2] }
      ];
    }
  }

  // Dynamic FAQs from AI or company-relevant
  const faqs = websiteData?.faqs && websiteData.faqs.length > 0 ? websiteData.faqs : [
    { question: `How can I book or place an order with ${companyName}?`, answer: `You can reach us through our contact details below, or click the action button to connect with our team directly.` },
    { question: `What sets ${companyName} apart?`, answer: `Our combination of high-grade craftsmanship, transparent pricing, and relentless focus on client satisfaction.` },
    { question: `Do you provide custom solutions or consultations?`, answer: `Yes! We work closely with our clients to tailor our ${businessType || 'services'} exactly around your requirements.` }
  ];

  const contact = websiteData?.contact || {
    address: 'Commercial Hub, Main Boulevard',
    phone: '+91 98765 43210',
    email: `hello@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'startup'}.com`,
    hours: 'Mon - Sat: 9:00 AM - 8:00 PM'
  };

  return {
    categoryName: `${companyName} — ${categoryCapitalized}`,
    heroImage,
    aboutImage,
    heroTitle,
    heroSubtitle,
    ctaText,
    aboutTitle,
    aboutContent,
    pillars,
    services,
    portfolio,
    testimonials,
    faqs,
    contact
  };
}

export const WEBSITE_TEMPLATES = [
  { id: 'cyber_neon',       name: 'Sci-Fi Cyber Sidebar Layout', tagline: 'HUD layout with sticky left sidebar navigation bar & glowing neon matrix cards', primaryColor: '#6366f1', accentColor: '#38bdf8', bgColor: '#060b18', cardBg: '#0f172a', textColor: '#f8fafc', headingFont: 'Outfit', styleTag: 'Sidebar HUD' },
  { id: 'luxury_gold',      name: 'Vogue Luxury Editorial Layout', tagline: 'High-end 50/50 split hero, gold frame rules & dark onyx serif cards', primaryColor: '#d4a017', accentColor: '#f5c842', bgColor: '#0a0a0a', cardBg: '#141414', textColor: '#f5f0e8', headingFont: 'Playfair Display', styleTag: 'Vogue Serif' },
  { id: 'nature_fresh',     name: 'Floating Pill Minimalist Light', tagline: '100% light theme with floating pill navbar, asymmetric green cards & pill badges', primaryColor: '#2d6a4f', accentColor: '#52b788', bgColor: '#f8fffe', cardBg: '#ffffff', textColor: '#1b3a2a', headingFont: 'Plus Jakarta Sans', styleTag: 'Light Minimal' },
  { id: 'sunset_bold',      name: 'Neo-Brutalist Pop-Art Ticker', tagline: 'Top marquee news ticker, 3px solid black borders & hard 3D box shadows', primaryColor: '#ea4c1e', accentColor: '#f97316', bgColor: '#0f0805', cardBg: '#1a100a', textColor: '#fff7ed', headingFont: 'Space Grotesk', styleTag: 'Brutalist' },
  { id: 'ocean_corporate',  name: 'Executive Split-Screen Portal', tagline: 'Top utility contact bar + 50/50 split-screen hero & corporate grid cards', primaryColor: '#0369a1', accentColor: '#06b6d4', bgColor: '#f0f7ff', cardBg: '#ffffff', textColor: '#0c1a2e', headingFont: 'Inter', styleTag: 'Executive' }
];

function generateFullHTML(tmplId: string, companyName: string, tmpl: any, pack: any, heroTitle: string, heroSubtitle: string, ctaText: string) {
  const { primaryColor, accentColor, bgColor, cardBg, textColor } = tmpl;

  const scriptGuard = `
    <base target="_self">
    <script>
      // Global image error handler to prevent broken image icons
      document.addEventListener('error', function(e) {
        if (e.target && e.target.tagName === 'IMG') {
          e.target.onerror = null;
          e.target.src = '${pack.heroImage}';
        }
      }, true);

      document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('click', function(e) {
          var a = e.target.closest('a');
          if (a) {
            var href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
              e.preventDefault();
              e.stopPropagation();
              var targetId = href.substring(1);
              var targetEl = document.getElementById(targetId);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }
        }, true);
      });

      function toggleFaq(idx) {
        var ans = document.getElementById('faq-ans-' + idx);
        var icon = document.getElementById('faq-icon-' + idx);
        if (ans) {
          if (ans.style.display === 'block') {
            ans.style.display = 'none';
            if (icon) icon.innerText = '+';
          } else {
            ans.style.display = 'block';
            if (icon) icon.innerText = '−';
          }
        }
      }

      function handleForm(e) {
        e.preventDefault();
        var btn = document.getElementById('submit-btn');
        if (btn) {
          btn.innerText = '✓ Message Transmitted!';
          btn.style.opacity = '0.8';
          setTimeout(function() {
            btn.innerText = 'Send Message';
            btn.style.opacity = '1';
            e.target.reset();
          }, 3000);
        }
        return false;
      }
    </script>
  `;

  if (tmplId === 'cyber_neon') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${companyName} — Cyber Sidebar HUD</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=JetBrains+Mono:wght@500;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background-color: ${bgColor}; color: ${textColor}; font-family: 'Outfit', sans-serif; display: flex; min-height: 100vh; }
    a { color: inherit; text-decoration: none; cursor: pointer; }
    .sidebar { width: 260px; background: #040814; border-right: 1px solid ${primaryColor}40; padding: 32px 24px; position: fixed; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: space-between; z-index: 100; }
    .main-content { margin-left: 260px; flex: 1; padding: 48px; }
    .cyber-btn { background: ${primaryColor}; color: #fff; font-weight: 800; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 2px; padding: 12px 24px; border: none; font-size: 11px; cursor: pointer; box-shadow: 0 0 16px ${primaryColor}80; transition: all 0.3s; display: inline-block; }
    .cyber-btn:hover { background: ${accentColor}; color: #000; box-shadow: 0 0 24px ${accentColor}; }
    .card { background: ${cardBg}; border: 1px solid ${primaryColor}40; padding: 24px; border-radius: 16px; transition: all 0.3s; }
    .card:hover { border-color: ${accentColor}; box-shadow: 0 0 20px ${accentColor}40; transform: translateY(-4px); }
  </style>
  ${scriptGuard}
</head>
<body>
  <aside class="sidebar">
    <div>
      <div style="font-size:10px;color:${accentColor};font-weight:900;letter-spacing:3px;margin-bottom:8px;">// CYBER HUD v4.0</div>
      <a href="#home" style="font-size:22px;font-weight:900;color:#fff;letter-spacing:1px;display:block;margin-bottom:36px;">${companyName}</a>
      <nav style="display:flex;flex-direction:column;gap:16px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:0.85;">
        <a href="#home">Home</a><a href="#about">About</a><a href="#services">Services</a><a href="#portfolio">Portfolio</a><a href="#testimonials">Reviews</a><a href="#faq">FAQ</a><a href="#contact">Contact</a>
      </nav>
    </div>
    <div><a href="#contact" class="cyber-btn" style="width:100%;text-align:center;">${ctaText}</a></div>
  </aside>
  <main class="main-content">
    <section id="home" style="min-height:480px;display:flex;flex-direction:column;justify-content:center;border-bottom:1px solid ${primaryColor}30;padding-bottom:60px;">
      <div style="display:inline-block;border:1px solid ${accentColor};padding:4px 12px;font-size:10px;color:${accentColor};font-family:'JetBrains Mono',monospace;text-transform:uppercase;margin-bottom:16px;width:fit-content;">// ${pack.categoryName}</div>
      <h1 style="font-size:46px;font-weight:900;line-height:1.1;margin-bottom:16px;background:linear-gradient(90deg, #fff, ${primaryColor});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${heroTitle}</h1>
      <p style="font-size:15px;opacity:0.75;max-width:640px;margin-bottom:28px;">${heroSubtitle}</p>
      <div style="display:flex;gap:16px;">
        <a href="#contact" class="cyber-btn">${ctaText}</a>
        <a href="#services" style="border:1px solid ${accentColor};color:${accentColor};padding:12px 24px;font-size:11px;font-weight:800;font-family:'JetBrains Mono',monospace;text-transform:uppercase;">View Services</a>
      </div>
      <div style="margin-top:40px;height:280px;border:1px solid ${primaryColor}40;border-radius:16px;overflow:hidden;">
        <img src="${pack.heroImage}" style="width:100%;height:100%;object-fit:cover;opacity:0.8;" />
      </div>
    </section>
    <section id="about" style="padding:60px 0;border-bottom:1px solid ${primaryColor}30;">
      <span style="font-size:10px;color:${accentColor};font-family:'JetBrains Mono',monospace;">// MISSION ARCHITECTURE</span>
      <h2 style="font-size:36px;font-weight:900;margin:12px 0;">${pack.aboutTitle}</h2>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:32px;align-items:center;margin-bottom:32px;">
        <p style="font-size:14px;opacity:0.75;line-height:1.7;">${pack.aboutContent}</p>
        <div style="height:220px;border:1px solid ${primaryColor}40;border-radius:16px;overflow:hidden;">
          <img src="${pack.aboutImage}" style="width:100%;height:100%;object-fit:cover;" loading="eager" onerror="this.onerror=null;this.src='${pack.heroImage}';" />
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
        ${pack.pillars.map((p: any) => `
          <div class="card">
            <h4 style="font-size:16px;color:${accentColor};margin-bottom:8px;">${p.title}</h4>
            <p style="font-size:12px;opacity:0.65;">${p.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>
    <section id="services" style="padding:60px 0;border-bottom:1px solid ${primaryColor}30;">
      <span style="font-size:10px;color:${accentColor};font-family:'JetBrains Mono',monospace;">// SERVICE MATRIX</span>
      <h2 style="font-size:36px;font-weight:900;margin:12px 0;">${companyName} Services</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:28px;">
        ${pack.services.map((s: any) => `
          <div class="card" style="padding:0;overflow:hidden;">
            <img src="${s.image}" style="width:100%;height:160px;object-fit:cover;" />
            <div style="padding:20px;">
              <span style="background:${accentColor}20;color:${accentColor};font-size:10px;font-family:'JetBrains Mono',monospace;padding:3px 8px;font-weight:700;">${s.price}</span>
              <h3 style="font-size:16px;font-weight:800;margin:10px 0 6px;">${s.title}</h3>
              <p style="font-size:12px;opacity:0.65;margin-bottom:16px;">${s.description}</p>
              <a href="#contact" class="cyber-btn" style="padding:6px 14px;font-size:9px;">Book &rarr;</a>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    <section id="portfolio" style="padding:60px 0;border-bottom:1px solid ${primaryColor}30;">
      <span style="font-size:10px;color:${accentColor};font-family:'JetBrains Mono',monospace;">// PORTFOLIO SHOWCASE</span>
      <h2 style="font-size:36px;font-weight:900;margin:12px 0;">Recent ${companyName} Milestones</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:28px;">
        ${pack.portfolio.map((item: any) => `
          <div class="card" style="padding:0;height:200px;position:relative;overflow:hidden;">
            <img src="${item.image}" style="width:100%;height:100%;object-fit:cover;opacity:0.8;" />
            <div style="position:absolute;inset:0;background:linear-gradient(to top, #040814, transparent);padding:16px;display:flex;flex-direction:column;justify-content:flex-end;">
              <span style="font-size:9px;color:${accentColor};font-family:'JetBrains Mono',monospace;">${item.tag}</span>
              <h4 style="font-size:14px;font-weight:800;">${item.title}</h4>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    <section id="testimonials" style="padding:60px 0;border-bottom:1px solid ${primaryColor}30;">
      <span style="font-size:10px;color:${accentColor};font-family:'JetBrains Mono',monospace;">// CLIENT FEEDBACK</span>
      <h2 style="font-size:36px;font-weight:900;margin:12px 0;">Reviews for ${companyName}</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:28px;">
        ${pack.testimonials.map((t: any) => `
          <div class="card">
            <p style="font-size:12px;font-style:italic;opacity:0.8;margin-bottom:16px;">"${t.quote}"</p>
            <div style="display:flex;align-items:center;gap:10px;">
              <img src="${t.avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" />
              <div><h4 style="font-size:13px;font-weight:800;">${t.author}</h4><p style="font-size:10px;opacity:0.5;">${t.role}</p></div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    <section id="faq" style="padding:60px 0;border-bottom:1px solid ${primaryColor}30;">
      <span style="font-size:10px;color:${accentColor};font-family:'JetBrains Mono',monospace;">// FAQ DATABASE</span>
      <h2 style="font-size:36px;font-weight:900;margin:12px 0;">Frequently Asked Questions</h2>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:28px;max-width:800px;">
        ${pack.faqs.map((f: any, idx: any) => `
          <div class="card" style="padding:0;">
            <div onclick="toggleFaq(${idx})" style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
              <h4 style="font-size:14px;font-weight:800;">${f.question}</h4>
              <span id="faq-icon-${idx}" style="color:${accentColor};font-weight:bold;">+</span>
            </div>
            <div id="faq-ans-${idx}" style="display:none;padding:0 20px 16px;font-size:12px;opacity:0.75;border-top:1px solid ${primaryColor}30;">
              <p style="padding-top:10px;">${f.answer}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    <section id="contact" style="padding:60px 0;">
      <span style="font-size:10px;color:${accentColor};font-family:'JetBrains Mono',monospace;">// CONTACT DISPATCH</span>
      <h2 style="font-size:36px;font-weight:900;margin:12px 0;">Connect With ${companyName}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:28px;">
        <div><p style="font-size:13px;opacity:0.75;margin-bottom:24px;">📍 Address: ${pack.contact.address}<br>📞 Phone: ${pack.contact.phone}<br>✉️ Email: ${pack.contact.email}<br>⏰ Hours: ${pack.contact.hours}</p></div>
        <form onsubmit="handleForm(event)" class="card" style="display:flex;flex-direction:column;gap:12px;">
          <input type="text" placeholder="Name" required style="padding:10px;background:#000;border:1px solid ${primaryColor}60;color:#fff;font-size:11px;" />
          <input type="email" placeholder="Email" required style="padding:10px;background:#000;border:1px solid ${primaryColor}60;color:#fff;font-size:11px;" />
          <textarea rows="3" placeholder="Message" required style="padding:10px;background:#000;border:1px solid ${primaryColor}60;color:#fff;font-size:11px;"></textarea>
          <button id="submit-btn" type="submit" class="cyber-btn">Send Message</button>
        </form>
      </div>
    </section>
  </main>
</body>
</html>`;
  }

  // LUXURY GOLD EDITORIAL
  if (tmplId === 'luxury_gold') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${companyName} — Vogue Luxury Editorial</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background-color: ${bgColor}; color: ${textColor}; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; }
    h1, h2, h3, h4, .serif { font-family: 'Playfair Display', serif; }
    a { color: inherit; text-decoration: none; cursor: pointer; }
    .gold-btn { background: ${primaryColor}; color: #000; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; padding: 12px 28px; border: none; font-size: 11px; cursor: pointer; transition: all 0.3s; display: inline-block; }
    .gold-btn:hover { background: ${accentColor}; transform: translateY(-2px); }
    .card { background: ${cardBg}; border: 1px solid ${primaryColor}30; transition: all 0.3s; }
    .card:hover { border-color: ${primaryColor}; transform: translateY(-4px); }
  </style>
  ${scriptGuard}
</head>
<body>
  <header style="border-bottom:1px solid ${primaryColor}40;padding:24px 36px;text-align:center;background:#050505;">
    <div style="font-size:9px;letter-spacing:6px;color:${primaryColor};text-transform:uppercase;margin-bottom:6px;">— ESTABLISHED 2025 —</div>
    <a href="#home" style="font-size:32px;font-weight:800;color:${accentColor};" class="serif">${companyName}</a>
    <nav style="display:flex;gap:28px;justify-content:center;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:16px;opacity:0.8;">
      <a href="#home">Home</a><a href="#about">About</a><a href="#services">Services</a><a href="#portfolio">Portfolio</a><a href="#testimonials">Reviews</a><a href="#faq">FAQ</a><a href="#contact">Contact</a>
    </nav>
  </header>
  <section id="home" style="display:grid;grid-template-columns:1fr 1fr;min-height:500px;border-bottom:1px solid ${primaryColor}30;">
    <div style="padding:80px 48px;display:flex;flex-direction:column;justify-content:center;background:#080808;">
      <span style="font-size:10px;letter-spacing:4px;color:${accentColor};text-transform:uppercase;">${pack.categoryName}</span>
      <h1 style="font-size:42px;font-weight:700;color:#f5ead5;margin:16px 0;line-height:1.2;">${heroTitle}</h1>
      <p style="font-size:14px;opacity:0.75;margin-bottom:28px;">${heroSubtitle}</p>
      <div><a href="#contact" class="gold-btn">${ctaText}</a></div>
    </div>
    <div style="position:relative;overflow:hidden;">
      <img src="${pack.heroImage}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.3) brightness(0.7);" />
    </div>
  </section>
  <section id="about" style="padding:80px 48px;max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
    <img src="${pack.aboutImage}" style="width:100%;height:400px;object-fit:cover;border:1px solid ${primaryColor}40;" />
    <div>
      <span style="font-size:10px;letter-spacing:4px;color:${primaryColor};text-transform:uppercase;">Our Heritage</span>
      <h2 style="font-size:36px;margin:12px 0;color:${textColor};">${pack.aboutTitle}</h2>
      <p style="font-size:13px;opacity:0.75;margin-bottom:28px;">${pack.aboutContent}</p>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${pack.pillars.map((p: any) => `
          <div style="border-left:2px solid ${primaryColor};padding-left:16px;">
            <h4 style="font-size:15px;color:${accentColor};">${p.title}</h4>
            <p style="font-size:11px;opacity:0.65;">${p.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="services" style="padding:80px 48px;background:#050505;border-top:1px solid ${primaryColor}30;">
    <div style="max-width:1200px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:48px;">
        <span style="font-size:10px;letter-spacing:4px;color:${primaryColor};text-transform:uppercase;">Exquisite Services</span>
        <h2 style="font-size:38px;color:${textColor};">${companyName} Offerings</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        ${pack.services.map((s: any) => `
          <div class="card" style="padding:24px;">
            <div style="height:180px;overflow:hidden;margin-bottom:16px;border:1px solid ${primaryColor}40;">
              <img src="${s.image}" style="width:100%;height:100%;object-fit:cover;" loading="eager" onerror="this.onerror=null;this.src='${pack.heroImage}';" />
            </div>
            <span style="font-size:10px;color:${primaryColor};letter-spacing:2px;font-weight:700;">${s.price}</span>
            <h3 style="font-size:20px;margin:10px 0;color:${textColor};">${s.title}</h3>
            <p style="font-size:12px;opacity:0.65;margin-bottom:20px;">${s.description}</p>
            <a href="#contact" class="gold-btn" style="padding:8px 16px;font-size:10px;">Reserve &rarr;</a>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="portfolio" style="padding:80px 48px;max-width:1200px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <span style="font-size:10px;letter-spacing:4px;color:${primaryColor};text-transform:uppercase;">Gallery</span>
      <h2 style="font-size:38px;color:${textColor};">${companyName} Portfolio</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
      ${pack.portfolio.map((item: any) => `
        <div style="height:220px;position:relative;overflow:hidden;border:1px solid ${primaryColor}40;">
          <img src="${item.image}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.2);" />
          <div style="position:absolute;inset:0;background:linear-gradient(to top, #000, transparent);padding:16px;display:flex;flex-direction:column;justify-content:flex-end;">
            <span style="font-size:9px;color:${primaryColor};letter-spacing:2px;">${item.tag}</span>
            <h4 style="font-size:14px;color:#fff;" class="serif">${item.title}</h4>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  <section id="testimonials" style="padding:80px 48px;background:#050505;border-top:1px solid ${primaryColor}30;">
    <div style="max-width:1200px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:48px;">
        <span style="font-size:10px;letter-spacing:4px;color:${primaryColor};text-transform:uppercase;">Praise</span>
        <h2 style="font-size:38px;color:${textColor};">Reviews for ${companyName}</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        ${pack.testimonials.map((t: any) => `
          <div class="card" style="padding:28px;">
            <div style="color:${accentColor};font-size:14px;margin-bottom:12px;">★ ★ ★ ★ ★</div>
            <p style="font-size:13px;font-style:italic;opacity:0.8;margin-bottom:20px;">"${t.quote}"</p>
            <h4 style="font-size:13px;color:${textColor};">${t.author}</h4>
            <p style="font-size:10px;opacity:0.5;">${t.role}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="faq" style="padding:80px 48px;max-width:800px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <span style="font-size:10px;letter-spacing:4px;color:${primaryColor};text-transform:uppercase;">FAQ</span>
      <h2 style="font-size:38px;color:${textColor};">Frequently Asked Questions</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${pack.faqs.map((f: any, idx: any) => `
        <div class="card">
          <div onclick="toggleFaq(${idx})" style="padding:20px 24px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
            <h4 style="font-size:15px;color:${textColor};" class="serif">${f.question}</h4>
            <span id="faq-icon-${idx}" style="color:${primaryColor};font-weight:bold;">+</span>
          </div>
          <div id="faq-ans-${idx}" style="display:none;padding:0 24px 20px;font-size:13px;opacity:0.7;border-top:1px solid ${primaryColor}20;">
            <p style="padding-top:12px;">${f.answer}</p>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  <section id="contact" style="padding:80px 48px;background:#050505;border-top:1px solid ${primaryColor}30;">
    <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;">
      <div>
        <span style="font-size:10px;letter-spacing:4px;color:${primaryColor};text-transform:uppercase;">Inquiries</span>
        <h2 style="font-size:38px;margin:12px 0 20px;color:${textColor};">Connect With ${companyName}</h2>
        <p style="font-size:13px;opacity:0.7;margin-bottom:24px;">📍 ${pack.contact.address}<br>📞 ${pack.contact.phone}<br>✉️ ${pack.contact.email}<br>⏰ ${pack.contact.hours}</p>
      </div>
      <form onsubmit="handleForm(event)" class="card" style="padding:32px;display:flex;flex-direction:column;gap:16px;">
        <input type="text" placeholder="Your Name" required style="padding:12px;background:#000;border:1px solid ${primaryColor}40;color:#fff;font-size:12px;" />
        <input type="email" placeholder="Your Email" required style="padding:12px;background:#000;border:1px solid ${primaryColor}40;color:#fff;font-size:12px;" />
        <textarea rows="4" placeholder="Your Requirement" required style="padding:12px;background:#000;border:1px solid ${primaryColor}40;color:#fff;font-size:12px;"></textarea>
        <button id="submit-btn" type="submit" class="gold-btn">Send Message</button>
      </form>
    </div>
  </section>
</body>
</html>`;
  }

  // ORGANIC LIGHT MINIMAL
  if (tmplId === 'nature_fresh') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${companyName} — Light Minimal</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background-color: ${bgColor}; color: ${textColor}; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; }
    a { color: inherit; text-decoration: none; cursor: pointer; }
    .pill-btn { background: ${primaryColor}; color: #fff; font-weight: 700; border-radius: 9999px; padding: 12px 28px; border: none; font-size: 12px; cursor: pointer; transition: all 0.3s; display: inline-block; }
    .pill-btn:hover { background: ${accentColor}; transform: translateY(-2px); }
    .card { background: ${cardBg}; border-radius: 28px; border: 1px solid #e2eaf4; box-shadow: 0 10px 30px rgba(0,0,0,0.04); transition: all 0.3s; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
    .pill-badge { background: ${accentColor}25; color: ${primaryColor}; font-weight: 800; font-size: 11px; padding: 6px 16px; border-radius: 9999px; display: inline-block; }
  </style>
  ${scriptGuard}
</head>
<body>
  <header style="position:sticky;top:16px;z-index:100;max-width:1100px;margin:0 auto;padding:0 24px;">
    <div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);border:1px solid #e2eaf4;border-radius:9999px;padding:12px 28px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 10px 30px rgba(0,0,0,0.05);">
      <a href="#home" style="font-size:18px;font-weight:900;color:${primaryColor};display:flex;align-items:center;gap:8px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${accentColor};"></span>
        ${companyName}
      </a>
      <nav style="display:flex;gap:20px;font-size:12px;font-weight:700;color:#334155;">
        <a href="#home">Home</a><a href="#about">About</a><a href="#services">Services</a><a href="#portfolio">Portfolio</a><a href="#testimonials">Reviews</a><a href="#faq">FAQ</a><a href="#contact">Contact</a>
      </nav>
      <a href="#contact" class="pill-btn">${ctaText}</a>
    </div>
  </header>
  <section id="home" style="padding:100px 24px 60px;max-width:1100px;margin:0 auto;text-align:center;">
    <span class="pill-badge">${pack.categoryName}</span>
    <h1 style="font-size:52px;font-weight:900;color:${primaryColor};margin:20px 0;line-height:1.15;max-width:850px;margin-left:auto;margin-right:auto;">${heroTitle}</h1>
    <p style="font-size:16px;color:#475569;max-width:600px;margin:0 auto 32px;">${heroSubtitle}</p>
    <div style="display:flex;gap:16px;justify-content:center;">
      <a href="#contact" class="pill-btn">${ctaText}</a>
      <a href="#services" style="background:#e8f5e9;color:${primaryColor};border-radius:9999px;padding:12px 28px;font-weight:700;font-size:12px;">Explore Solutions</a>
    </div>
    <div style="margin-top:48px;border-radius:32px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.08);max-height:400px;">
      <img src="${pack.heroImage}" style="width:100%;height:100%;object-fit:cover;" />
    </div>
  </section>
  <section id="about" style="padding:80px 24px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
    <img src="${pack.aboutImage}" style="width:100%;height:380px;object-fit:cover;border-radius:32px;" />
    <div>
      <span class="pill-badge">About Us</span>
      <h2 style="font-size:36px;font-weight:900;color:${textColor};margin:12px 0 16px;">${pack.aboutTitle}</h2>
      <p style="font-size:14px;color:#475569;margin-bottom:28px;">${pack.aboutContent}</p>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${pack.pillars.map((p: any) => `
          <div style="background:#f0fdf4;padding:16px 20px;border-radius:20px;border:1px solid #bbf7d0;">
            <h4 style="font-size:15px;font-weight:800;color:${primaryColor};">${p.title}</h4>
            <p style="font-size:12px;color:#334155;">${p.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="services" style="padding:80px 24px;background:#f0fdf4;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:48px;">
        <span class="pill-badge">Services</span>
        <h2 style="font-size:38px;font-weight:900;color:${textColor};margin-top:8px;">${companyName} Solutions</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        ${pack.services.map((s: any) => `
          <div class="card" style="overflow:hidden;">
            <img src="${s.image}" style="width:100%;height:180px;object-fit:cover;" />
            <div style="padding:24px;">
              <span style="background:${accentColor}30;color:${primaryColor};font-size:11px;font-weight:800;padding:4px 12px;border-radius:9999px;">${s.price}</span>
              <h3 style="font-size:18px;font-weight:800;margin:12px 0 8px;color:${textColor};">${s.title}</h3>
              <p style="font-size:13px;color:#64748b;line-height:1.6;margin-bottom:20px;">${s.description}</p>
              <a href="#contact" class="pill-btn" style="padding:8px 20px;font-size:11px;">Select Plan &rarr;</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="portfolio" style="padding:80px 24px;max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <span class="pill-badge">Showcase</span>
      <h2 style="font-size:38px;font-weight:900;color:${textColor};margin-top:8px;">Recent ${companyName} Projects</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
      ${pack.portfolio.map((item: any) => `
        <div class="card" style="overflow:hidden;height:240px;position:relative;">
          <img src="${item.image}" style="width:100%;height:100%;object-fit:cover;" />
          <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.7), transparent);padding:20px;display:flex;flex-direction:column;justify-content:flex-end;">
            <span style="font-size:10px;color:${accentColor};font-weight:800;">${item.tag}</span>
            <h4 style="font-size:16px;color:#fff;font-weight:800;">${item.title}</h4>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  <section id="testimonials" style="padding:80px 24px;background:#f0fdf4;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:48px;">
        <span class="pill-badge">Customer Reviews</span>
        <h2 style="font-size:38px;font-weight:900;color:${textColor};margin-top:8px;">Client Feedback for ${companyName}</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        ${pack.testimonials.map((t: any) => `
          <div class="card" style="padding:28px;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="color:#f59e0b;font-size:14px;margin-bottom:12px;">★ ★ ★ ★ ★</div>
              <p style="font-size:13px;color:#334155;line-height:1.7;margin-bottom:20px;">"${t.quote}"</p>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <img src="${t.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;" />
              <div><h4 style="font-size:14px;font-weight:800;color:${textColor};">${t.author}</h4><p style="font-size:11px;color:#64748b;">${t.role}</p></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="faq" style="padding:80px 24px;max-width:800px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <span class="pill-badge">FAQ</span>
      <h2 style="font-size:38px;font-weight:900;color:${textColor};margin-top:8px;">Frequently Asked Questions</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${pack.faqs.map((f: any, idx: any) => `
        <div class="card" style="padding:0;">
          <div onclick="toggleFaq(${idx})" style="padding:20px 24px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
            <h4 style="font-size:15px;font-weight:800;color:${textColor};">${f.question}</h4>
            <span id="faq-icon-${idx}" style="font-size:20px;color:${primaryColor};font-weight:bold;">+</span>
          </div>
          <div id="faq-ans-${idx}" style="display:none;padding:0 24px 20px;font-size:13px;color:#64748b;">
            <p style="padding-top:12px;border-top:1px solid #e2eaf4;">${f.answer}</p>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  <section id="contact" style="padding:80px 24px;max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;">
      <div>
        <span class="pill-badge">Contact Us</span>
        <h2 style="font-size:38px;font-weight:900;color:${textColor};margin:12px 0 16px;">Contact ${companyName}</h2>
        <p style="font-size:14px;color:#64748b;margin-bottom:32px;">📍 ${pack.contact.address}<br>📞 ${pack.contact.phone}<br>✉️ ${pack.contact.email}<br>⏰ ${pack.contact.hours}</p>
      </div>
      <form onsubmit="handleForm(event)" class="card" style="padding:32px;display:flex;flex-direction:column;gap:16px;">
        <input type="text" placeholder="Full Name" required style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #cbd5e1;font-size:13px;" />
        <input type="email" placeholder="Email Address" required style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #cbd5e1;font-size:13px;" />
        <textarea rows="4" placeholder="Your Message" required style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #cbd5e1;font-size:13px;"></textarea>
        <button id="submit-btn" type="submit" class="pill-btn" style="width:100%;">Send Message</button>
      </form>
    </div>
  </section>
</body>
</html>`;
  }

  // NEO BRUTALIST
  if (tmplId === 'sunset_bold') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${companyName} — Neo-Brutalist Ticker</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background-color: ${bgColor}; color: ${textColor}; font-family: 'Space Grotesk', sans-serif; line-height: 1.6; }
    a { color: inherit; text-decoration: none; cursor: pointer; }
    .marquee { background: ${primaryColor}; color: #000; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; padding: 8px 0; overflow: hidden; white-space: nowrap; border-bottom: 3px solid #000; }
    .bold-btn { background: ${primaryColor}; color: #fff; font-weight: 800; padding: 12px 28px; border: 3px solid #000; box-shadow: 5px 5px 0 #000; cursor: pointer; text-transform: uppercase; font-size: 11px; transition: all 0.2s; display: inline-block; }
    .bold-btn:hover { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 #000; }
    .card { background: ${cardBg}; border: 3px solid #000; box-shadow: 6px 6px 0 #000; padding: 24px; transition: all 0.2s; }
    .card:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0 ${accentColor}; }
    .badge { background: ${accentColor}; color: #000; font-weight: 800; padding: 4px 12px; border: 2px solid #000; text-transform: uppercase; font-size: 10px; display: inline-block; }
  </style>
  ${scriptGuard}
</head>
<body>
  <div class="marquee">
    <span>⚡ OFFICIAL LAUNCH ⚡ TOP RATED SERVICES ⚡ 100% SATISFACTION GUARANTEED ⚡ BOOK YOUR SLOT NOW ⚡</span>
  </div>
  <header style="background:${cardBg};border-bottom:3px solid #000;padding:16px 36px;display:flex;align-items:center;justify-content:space-between;">
    <a href="#home" style="font-size:24px;font-weight:800;color:${accentColor};letter-spacing:-1px;">${companyName}⚡</a>
    <nav style="display:flex;gap:20px;font-size:11px;font-weight:800;text-transform:uppercase;">
      <a href="#home">Home</a><a href="#about">About</a><a href="#services">Services</a><a href="#portfolio">Portfolio</a><a href="#testimonials">Reviews</a><a href="#faq">FAQ</a><a href="#contact">Contact</a>
    </nav>
    <a href="#contact" class="bold-btn">${ctaText}</a>
  </header>
  <section id="home" style="padding:80px 24px;max-width:1100px;margin:0 auto;text-align:center;">
    <span class="badge">${pack.categoryName}</span>
    <h1 style="font-size:56px;font-weight:800;color:#fff;margin:20px 0;line-height:1.1;">${heroTitle}</h1>
    <p style="font-size:15px;opacity:0.85;max-width:640px;margin:0 auto 32px;">${heroSubtitle}</p>
    <div style="display:flex;gap:16px;justify-content:center;">
      <a href="#contact" class="bold-btn">${ctaText}</a>
      <a href="#services" style="border:3px solid #000;background:#fff;color:#000;padding:12px 28px;font-weight:800;font-size:11px;text-transform:uppercase;box-shadow:5px 5px 0 #000;">Explore Solutions</a>
    </div>
    <div style="margin-top:44px;border:3px solid #000;box-shadow:8px 8px 0 ${accentColor};height:380px;overflow:hidden;">
      <img src="${pack.heroImage}" style="width:100%;height:100%;object-fit:cover;" />
    </div>
  </section>
  <section id="about" style="padding:80px 24px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
    <div>
      <span class="badge">Who We Are</span>
      <h2 style="font-size:38px;font-weight:800;color:#fff;margin:16px 0;">${pack.aboutTitle}</h2>
      <p style="font-size:14px;opacity:0.85;margin-bottom:28px;">${pack.aboutContent}</p>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${pack.pillars.map((p: any) => `
          <div class="card" style="padding:16px;">
            <h4 style="font-size:16px;color:${accentColor};">${p.title}</h4>
            <p style="font-size:12px;opacity:0.8;">${p.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card" style="padding:0;overflow:hidden;height:400px;">
      <img src="${pack.aboutImage}" style="width:100%;height:100%;object-fit:cover;" />
    </div>
  </section>
  <section id="services" style="padding:80px 24px;background:#140a05;border-top:3px solid #000;border-bottom:3px solid #000;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:48px;">
        <span class="badge">Solutions</span>
        <h2 style="font-size:40px;font-weight:800;color:#fff;margin-top:8px;">${companyName} Services</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        ${pack.services.map((s: any) => `
          <div class="card" style="padding:0;overflow:hidden;">
            <img src="${s.image}" style="width:100%;height:180px;object-fit:cover;" />
            <div style="padding:20px;">
              <span class="badge">${s.price}</span>
              <h3 style="font-size:18px;font-weight:800;color:#fff;margin:10px 0 8px;">${s.title}</h3>
              <p style="font-size:12px;opacity:0.8;margin-bottom:16px;">${s.description}</p>
              <a href="#contact" class="bold-btn" style="padding:8px 16px;font-size:10px;">Select Plan &rarr;</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="portfolio" style="padding:80px 24px;max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <span class="badge">Showcase</span>
      <h2 style="font-size:40px;font-weight:800;color:#fff;margin-top:8px;">Recent ${companyName} Works</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
      ${pack.portfolio.map((item: any) => `
        <div class="card" style="padding:0;height:220px;position:relative;overflow:hidden;">
          <img src="${item.image}" style="width:100%;height:100%;object-fit:cover;" />
          <div style="position:absolute;inset:0;background:linear-gradient(to top, #000, transparent);padding:16px;display:flex;flex-direction:column;justify-content:flex-end;">
            <span style="font-size:10px;color:${accentColor};font-weight:800;">${item.tag}</span>
            <h4 style="font-size:16px;color:#fff;font-weight:800;">${item.title}</h4>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  <section id="testimonials" style="padding:80px 24px;background:#140a05;border-top:3px solid #000;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:48px;">
        <span class="badge">Reviews</span>
        <h2 style="font-size:40px;font-weight:800;color:#fff;margin-top:8px;">Client Feedback for ${companyName}</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        ${pack.testimonials.map((t: any) => `
          <div class="card">
            <div style="color:${accentColor};font-size:14px;margin-bottom:12px;">★ ★ ★ ★ ★</div>
            <p style="font-size:13px;opacity:0.85;margin-bottom:20px;">"${t.quote}"</p>
            <div style="display:flex;align-items:center;gap:12px;">
              <img src="${t.avatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid #000;" />
              <div><h4 style="font-size:14px;color:#fff;">${t.author}</h4><p style="font-size:11px;opacity:0.5;">${t.role}</p></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="faq" style="padding:80px 24px;max-width:800px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <span class="badge">FAQ</span>
      <h2 style="font-size:40px;font-weight:800;color:#fff;margin-top:8px;">Answers & Details</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${pack.faqs.map((f: any, idx: any) => `
        <div class="card" style="padding:0;">
          <div onclick="toggleFaq(${idx})" style="padding:20px 24px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
            <h4 style="font-size:15px;color:#fff;font-weight:800;">${f.question}</h4>
            <span id="faq-icon-${idx}" style="font-size:20px;color:${accentColor};font-weight:bold;">+</span>
          </div>
          <div id="faq-ans-${idx}" style="display:none;padding:0 24px 20px;font-size:13px;opacity:0.85;border-top:2px solid #000;">
            <p style="padding-top:12px;">${f.answer}</p>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  <section id="contact" style="padding:80px 24px;max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;">
      <div>
        <span class="badge">Contact Us</span>
        <h2 style="font-size:40px;font-weight:800;color:#fff;margin:16px 0;">Contact ${companyName}</h2>
        <p style="font-size:14px;opacity:0.8;margin-bottom:24px;">📍 ${pack.contact.address}<br>📞 ${pack.contact.phone}<br>✉️ ${pack.contact.email}<br>⏰ ${pack.contact.hours}</p>
      </div>
      <form onsubmit="handleForm(event)" class="card" style="display:flex;flex-direction:column;gap:16px;">
        <input type="text" placeholder="Your Name" required style="padding:12px;background:#000;border:2px solid #000;color:#fff;font-size:12px;" />
        <input type="email" placeholder="Your Email" required style="padding:12px;background:#000;border:2px solid #000;color:#fff;font-size:12px;" />
        <textarea rows="4" placeholder="Your Requirement" required style="padding:12px;background:#000;border:2px solid #000;color:#fff;font-size:12px;"></textarea>
        <button id="submit-btn" type="submit" class="bold-btn" style="width:100%;">Send Message</button>
      </form>
    </div>
  </section>
</body>
</html>`;
  }

  // CORPORATE EXECUTIVE SPLIT
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${companyName} — Corporate Executive</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background-color: ${bgColor}; color: ${textColor}; font-family: 'Inter', sans-serif; line-height: 1.6; }
    a { color: inherit; text-decoration: none; cursor: pointer; }
    .corp-btn { background: ${primaryColor}; color: #fff; font-weight: 700; padding: 10px 24px; border-radius: 6px; border: none; font-size: 12px; cursor: pointer; transition: all 0.3s; display: inline-block; }
    .corp-btn:hover { background: ${accentColor}; }
    .card { background: ${cardBg}; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 24px; transition: all 0.3s; }
    .card:hover { border-color: ${primaryColor}; box-shadow: 0 10px 24px rgba(0,0,0,0.1); }
  </style>
  ${scriptGuard}
</head>
<body>
  <div style="background:#0f172a;color:#94a3b8;font-size:11px;padding:8px 36px;display:flex;justify-content:space-between;align-items:center;">
    <div>📞 ${pack.contact.phone} | ✉️ ${pack.contact.email}</div>
    <div>⏰ Hours: ${pack.contact.hours}</div>
  </div>
  <header style="position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid #e2e8f0;padding:16px 36px;display:flex;align-items:center;justify-content:space-between;">
    <a href="#home" style="font-size:22px;font-weight:800;color:${primaryColor};">${companyName}</a>
    <nav style="display:flex;gap:24px;font-size:13px;font-weight:600;color:#334155;">
      <a href="#home">Home</a><a href="#about">About</a><a href="#services">Services</a><a href="#portfolio">Portfolio</a><a href="#testimonials">Reviews</a><a href="#faq">FAQ</a><a href="#contact">Contact</a>
    </nav>
    <a href="#contact" class="corp-btn">${ctaText}</a>
  </header>
  <section id="home" style="display:grid;grid-template-columns:1fr 1fr;min-height:500px;background:#fff;">
    <div style="background:#0c1a2e;color:#fff;padding:80px 48px;display:flex;flex-direction:column;justify-content:center;">
      <span style="background:${accentColor}30;color:${accentColor};font-weight:700;font-size:11px;padding:4px 12px;border-radius:4px;width:fit-content;text-transform:uppercase;">${pack.categoryName}</span>
      <h1 style="font-size:44px;font-weight:800;margin:16px 0;line-height:1.2;">${heroTitle}</h1>
      <p style="font-size:15px;color:#94a3b8;margin-bottom:28px;">${heroSubtitle}</p>
      <div><a href="#contact" class="corp-btn">${ctaText}</a></div>
    </div>
    <div style="padding:60px 48px;display:flex;align-items:center;">
      <img src="${pack.heroImage}" style="width:100%;height:380px;object-fit:cover;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,0.1);" />
    </div>
  </section>
  <section id="about" style="padding:80px 36px;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
    <img src="${pack.aboutImage}" style="width:100%;height:380px;object-fit:cover;border-radius:12px;" />
    <div>
      <span style="color:${primaryColor};font-weight:700;font-size:12px;text-transform:uppercase;">About Our Firm</span>
      <h2 style="font-size:34px;font-weight:800;color:#0f172a;margin:12px 0 16px;">${pack.aboutTitle}</h2>
      <p style="font-size:14px;color:#475569;margin-bottom:24px;">${pack.aboutContent}</p>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${pack.pillars.map((p: any) => `
          <div style="background:#fff;padding:16px;border-radius:8px;border-left:4px solid ${primaryColor};box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <h4 style="font-size:15px;font-weight:700;color:#0f172a;">${p.title}</h4>
            <p style="font-size:12px;color:#64748b;">${p.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="services" style="padding:80px 36px;background:#fff;border-top:1px solid #e2e8f0;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:48px;">
        <span style="color:${primaryColor};font-weight:700;font-size:12px;text-transform:uppercase;">Enterprise Services</span>
        <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin-top:8px;">${companyName} Offerings</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        ${pack.services.map((s: any) => `
          <div class="card" style="padding:0;overflow:hidden;">
            <img src="${s.image}" style="width:100%;height:180px;object-fit:cover;" />
            <div style="padding:24px;">
              <span style="background:${primaryColor}15;color:${primaryColor};font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;">${s.price}</span>
              <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:12px 0 8px;">${s.title}</h3>
              <p style="font-size:13px;color:#64748b;line-height:1.6;margin-bottom:20px;">${s.description}</p>
              <a href="#contact" class="corp-btn" style="padding:8px 16px;font-size:11px;">Request Quote &rarr;</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="portfolio" style="padding:80px 36px;max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <span style="color:${primaryColor};font-weight:700;font-size:12px;text-transform:uppercase;">Case Studies</span>
      <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin-top:8px;">${companyName} Portfolio</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
      ${pack.portfolio.map((item: any) => `
        <div class="card" style="padding:0;height:220px;position:relative;overflow:hidden;">
          <img src="${item.image}" style="width:100%;height:100%;object-fit:cover;" />
          <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,23,42,0.85), transparent);padding:20px;display:flex;flex-direction:column;justify-content:flex-end;">
            <span style="font-size:10px;color:${accentColor};font-weight:700;">${item.tag}</span>
            <h4 style="font-size:16px;color:#fff;font-weight:700;">${item.title}</h4>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  <section id="testimonials" style="padding:80px 36px;background:#fff;border-top:1px solid #e2e8f0;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:48px;">
        <span style="color:${primaryColor};font-weight:700;font-size:12px;text-transform:uppercase;">Testimonials</span>
        <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin-top:8px;">Client Feedback for ${companyName}</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        ${pack.testimonials.map((t: any) => `
          <div class="card">
            <p style="font-size:13px;color:#475569;line-height:1.7;margin-bottom:20px;">"${t.quote}"</p>
            <div style="display:flex;align-items:center;gap:12px;">
              <img src="${t.avatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />
              <div><h4 style="font-size:14px;font-weight:700;color:#0f172a;">${t.author}</h4><p style="font-size:11px;color:#64748b;">${t.role}</p></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  <section id="faq" style="padding:80px 36px;max-width:800px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <span style="color:${primaryColor};font-weight:700;font-size:12px;text-transform:uppercase;">Support</span>
      <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin-top:8px;">Frequently Asked Questions</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${pack.faqs.map((f: any, idx: any) => `
        <div class="card" style="padding:0;">
          <div onclick="toggleFaq(${idx})" style="padding:20px 24px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
            <h4 style="font-size:15px;font-weight:700;color:#0f172a;">${f.question}</h4>
            <span id="faq-icon-${idx}" style="font-size:20px;color:${primaryColor};font-weight:bold;">+</span>
          </div>
          <div id="faq-ans-${idx}" style="display:none;padding:0 24px 20px;font-size:13px;color:#64748b;">
            <p style="padding-top:12px;border-top:1px solid #e2e8f0;">${f.answer}</p>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  <section id="contact" style="padding:80px 36px;max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;">
      <div>
        <span style="color:${primaryColor};font-weight:700;font-size:12px;text-transform:uppercase;">Contact Us</span>
        <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin:12px 0 16px;">Connect With ${companyName}</h2>
        <p style="font-size:14px;color:#64748b;margin-bottom:24px;">📍 ${pack.contact.address}<br>📞 ${pack.contact.phone}<br>✉️ ${pack.contact.email}<br>⏰ ${pack.contact.hours}</p>
      </div>
      <form onsubmit="handleForm(event)" class="card" style="display:flex;flex-direction:column;gap:16px;">
        <input type="text" placeholder="Full Name" required style="width:100%;padding:12px;border-radius:6px;border:1px solid #cbd5e1;font-size:13px;" />
        <input type="email" placeholder="Email Address" required style="width:100%;padding:12px;border-radius:6px;border:1px solid #cbd5e1;font-size:13px;" />
        <textarea rows="4" placeholder="Message" required style="width:100%;padding:12px;border-radius:6px;border:1px solid #cbd5e1;font-size:13px;"></textarea>
        <button id="submit-btn" type="submit" class="corp-btn" style="width:100%;">Submit Query</button>
      </form>
    </div>
  </section>
</body>
</html>`;
  }

function TemplateThumbnail({ tmpl }: { tmpl: typeof WEBSITE_TEMPLATES[0] }) {
  return (
    <div className="w-full h-24 rounded-xl overflow-hidden relative border border-white/10 group-hover:border-white/30 transition shadow-inner" style={{ backgroundColor: tmpl.bgColor }}>
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `radial-gradient(${tmpl.primaryColor} 1px, transparent 1px)`, backgroundSize: '12px 12px' }} />
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded-md border border-white/10" style={{ backgroundColor: `${tmpl.cardBg}CC` }}>
        <div className="w-8 h-1.5 rounded-full" style={{ backgroundColor: tmpl.primaryColor }} />
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tmpl.accentColor }} />
        </div>
      </div>
      <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg border border-white/10" style={{ backgroundColor: tmpl.cardBg }}>
        <div className="w-3/4 h-2 rounded mb-1" style={{ backgroundColor: tmpl.textColor }} />
        <div className="w-1/2 h-1 rounded" style={{ backgroundColor: tmpl.accentColor }} />
      </div>
    </div>
  );
}

export function WebsitePreview({ websiteData, companyName, businessType = '', idea = '', personas }: WebsitePreviewProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('cyber_neon');
  const [previewMode, setPreviewMode] = useState<'preview' | 'code' | 'customize'>('preview');
  const [deviceSize, setDeviceSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [customPrimaryColor, setCustomPrimaryColor] = useState<string>('');
  const [customAccentColor, setCustomAccentColor] = useState<string>('');
  const [customHeadingFont, setCustomHeadingFont] = useState<string>('');
  const [editableHeroTitle, setEditableHeroTitle] = useState<string>('');
  const [editableHeroSubtitle, setEditableHeroSubtitle] = useState<string>('');
  const [editableCtaText, setEditableCtaText] = useState<string>('');

  const activeTemplate = useMemo(() => {
    return WEBSITE_TEMPLATES.find(t => t.id === selectedTemplateId) || WEBSITE_TEMPLATES[0];
  }, [selectedTemplateId]);

  const industryPack = useMemo(() => {
    return getIndustryPack(companyName, websiteData?.template_category || '', businessType, idea, websiteData, personas);
  }, [companyName, websiteData, businessType, idea, personas]);

  useEffect(() => {
    setCustomPrimaryColor(websiteData?.colors?.primary || activeTemplate.primaryColor);
    setCustomAccentColor(websiteData?.colors?.accent || activeTemplate.accentColor);
    setCustomHeadingFont(websiteData?.fonts?.heading || activeTemplate.headingFont);
    setEditableHeroTitle(industryPack.heroTitle);
    setEditableHeroSubtitle(industryPack.heroSubtitle);
    setEditableCtaText(industryPack.ctaText);
  }, [selectedTemplateId, websiteData, industryPack, activeTemplate]);

  const resolvedTemplate = useMemo(() => ({
    ...activeTemplate,
    primaryColor: customPrimaryColor || activeTemplate.primaryColor,
    accentColor: customAccentColor || activeTemplate.accentColor,
    headingFont: customHeadingFont || activeTemplate.headingFont
  }), [activeTemplate, customPrimaryColor, customAccentColor, customHeadingFont]);

  const compiledHTML = useMemo(() => {
    return generateFullHTML(
      selectedTemplateId,
      companyName,
      resolvedTemplate,
      industryPack,
      editableHeroTitle,
      editableHeroSubtitle,
      editableCtaText
    );
  }, [selectedTemplateId, companyName, resolvedTemplate, industryPack, editableHeroTitle, editableHeroSubtitle, editableCtaText]);

  const [iframeUrl, setIframeUrl] = useState<string>('');

  useEffect(() => {
    if (!compiledHTML) return;
    const blob = new Blob([compiledHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    setIframeUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [compiledHTML]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(compiledHTML);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const domainSlug = useMemo(() => {
    return (companyName || 'my-startup').toLowerCase().replace(/[^a-z0-9]/g, '');
  }, [companyName]);

  const getDeviceWidth = () => {
    switch (deviceSize) {
      case 'mobile': return 'max-w-[380px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'max-w-full';
    }
  };

  const getDeviceLabel = () => {
    switch (deviceSize) {
      case 'mobile': return 'Mobile View (380px)';
      case 'tablet': return 'Tablet View (768px)';
      default: return 'Desktop Responsive View';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* ─── 1. Header Toolbar ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <Box size={20} />
            </span>
            <div>
              <h2 className="text-2xl font-black font-outfit tracking-tight text-white flex items-center gap-2">
                <span>Website Designer Studio</span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">100% Adapted to {companyName}</span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            5 distinct layout architectures — 100% adapted to your startup idea <strong>{companyName}</strong> ({businessType}).
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button 
              onClick={() => {
                setPreviewMode('preview');
                document.getElementById('live-website-frame')?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${previewMode === 'preview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Eye size={14} /><span>Live Preview</span>
            </button>
            <button 
              onClick={() => setPreviewMode('customize')} 
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${previewMode === 'customize' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Sliders size={14} /><span>Customize Theme</span>
            </button>
            <button 
              onClick={() => setPreviewMode('code')} 
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${previewMode === 'code' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Code size={14} /><span>Export HTML</span>
            </button>
          </div>

          {previewMode === 'preview' && (
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
              {[{ id: 'desktop', icon: Laptop }, { id: 'tablet', icon: Tablet }, { id: 'mobile', icon: Smartphone }].map(d => (
                <button 
                  key={d.id} 
                  onClick={() => setDeviceSize(d.id as any)} 
                  className={`p-2 rounded-xl transition ${deviceSize === d.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  title={d.id.toUpperCase() + ' View'}
                >
                  <d.icon size={14} />
                </button>
              ))}
            </div>
          )}

          {iframeUrl && (
            <a 
              href={iframeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              <ExternalLink size={14} />
              <span>Open Fullscreen Website ↗</span>
            </a>
          )}

          <button onClick={handleCopyCode} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition">
            {copiedCode ? <><Check size={14} /><span>HTML Copied!</span></> : <><Download size={14} /><span>Export HTML</span></>}
          </button>
        </div>
      </div>

      {/* ─── 2. Live Website Preview Window (Displayed Promptly Below Header) ────────────────────────── */}
      {previewMode === 'preview' && (
        <div id="live-website-frame" className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{getDeviceLabel()}</span>
              <span className="text-slate-700">·</span>
              <span style={{ color: activeTemplate.primaryColor }}>Architecture: {activeTemplate.name}</span>
            </div>
            <span className="text-indigo-400">Click URL bar to open in fullscreen tab</span>
          </div>

          <div className={`w-full ${getDeviceWidth()} transition-all duration-300 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-slate-950`}>
            {/* Simulated Browser Address Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>

              <a 
                href={iframeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Click to open fullscreen interactive website in new tab"
                className="bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl flex-1 text-center py-2 text-[11px] text-slate-300 hover:text-white flex items-center justify-center gap-2 font-mono transition shadow-inner group"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>https://{domainSlug}.com</span>
                <ExternalLink size={12} className="text-indigo-400 group-hover:translate-x-0.5 transition" />
              </a>

              <button 
                onClick={() => setIframeUrl(prev => prev + '')} 
                title="Reload Preview"
                className="p-1.5 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Live Interactive Iframe */}
            <div className="h-[800px] w-full bg-white relative">
              {iframeUrl ? (
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-0 bg-white"
                  title="Live Website Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Loading Live Website Preview...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. Live Customizer Mode ────────────────────────── */}
      {previewMode === 'customize' && (
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders size={18} className="text-indigo-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">Live Theme & Content Customizer</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 border border-slate-800 bg-slate-900/60 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Palette size={12} className="text-indigo-400" /> Primary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={customPrimaryColor} onChange={e => setCustomPrimaryColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0" />
                <input type="text" value={customPrimaryColor} onChange={e => setCustomPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 font-mono text-slate-200" />
              </div>
            </div>
            <div className="p-4 border border-slate-800 bg-slate-900/60 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Palette size={12} className="text-purple-400" /> Accent Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={customAccentColor} onChange={e => setCustomAccentColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0" />
                <input type="text" value={customAccentColor} onChange={e => setCustomAccentColor(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 font-mono text-slate-200" />
              </div>
            </div>
            <div className="p-4 border border-slate-800 bg-slate-900/60 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Type size={12} className="text-amber-400" /> Heading Font</label>
              <select value={customHeadingFont} onChange={e => setCustomHeadingFont(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 font-bold focus:outline-none">
                <option value="Outfit">Outfit (Modern Bold)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                <option value="Space Grotesk">Space Grotesk (Futuristic)</option>
                <option value="Inter">Inter (Clean Corporate)</option>
              </select>
            </div>
            <div className="p-4 border border-slate-800 bg-slate-900/60 rounded-2xl space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Edit3 size={12} className="text-emerald-400" /> Hero Headline</label>
              <input type="text" value={editableHeroTitle} onChange={e => setEditableHeroTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 font-bold" />
            </div>
            <div className="p-4 border border-slate-800 bg-slate-900/60 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Zap size={12} className="text-indigo-400" /> CTA Button Text</label>
              <input type="text" value={editableCtaText} onChange={e => setEditableCtaText(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-200" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => setPreviewMode('preview')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition">
              <Eye size={14} /><span>Apply & Preview</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 4. Export Code Mode ────────────────────────── */}
      {previewMode === 'code' && (
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" /><div className="w-3 h-3 rounded-full bg-amber-500" /><div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">index.html — {companyName} · {activeTemplate.name} (7 Sections)</span>
            </div>
            <button onClick={handleCopyCode} className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
              {copiedCode ? <><Check size={12} /><span>Copied!</span></> : <><Copy size={12} /><span>Copy HTML</span></>}
            </button>
          </div>
          <pre className="text-left font-mono text-[11px] leading-relaxed p-6 bg-slate-950 text-slate-200 overflow-x-auto max-h-[600px] whitespace-pre">
            <code>{compiledHTML}</code>
          </pre>
        </div>
      )}

      {/* ─── 5. Architecture Template Selector (5 Layout Options) ────────────────────────── */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Select Architecture Template</h3>
          </div>
          <span className="text-[10px] text-indigo-400 font-bold uppercase">5 Radically Different Layout Designs</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {WEBSITE_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  setSelectedTemplateId(tmpl.id);
                  if (previewMode !== 'preview') setPreviewMode('preview');
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${isSelected ? 'border-indigo-500 shadow-2xl shadow-indigo-600/30 ring-2 ring-indigo-500/50 bg-indigo-600/10' : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-900'}`}
              >
                <TemplateThumbnail tmpl={tmpl} />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10" style={{ backgroundColor: `${tmpl.primaryColor}20`, color: tmpl.primaryColor }}>{tmpl.styleTag}</span>
                    {isSelected && <span className="p-0.5 bg-indigo-500 text-white rounded-full"><Check size={10} /></span>}
                  </div>
                  <h4 className="text-xs font-black text-white leading-tight">{tmpl.name}</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">{tmpl.tagline}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default WebsitePreview;
