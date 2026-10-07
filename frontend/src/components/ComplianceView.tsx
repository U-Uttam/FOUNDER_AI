import { useState, useMemo } from 'react';
import { 
  FileCheck, 
  Clock, 
  Coins, 
  ShieldAlert,
  CheckSquare,
  Square,
  Trophy,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Download,
  Copy,
  Check,
  Search,
  Building,
  FileText,
  ShieldCheck,
  Scale,
  Sparkles,
  Filter,
  AlertTriangle,
  FolderLock,
  ChevronDown,
  ChevronUp,
  FileSignature,
  FileSpreadsheet
} from 'lucide-react';
import type { ComplianceData, LicenseInfo } from '../types';

interface ComplianceViewProps {
  complianceData: ComplianceData | undefined;
  companyName?: string;
  businessType?: string;
  location?: string;
  idea?: string;
}

// ─── Official Statutory Portal Directory ────────────────────────────────────────
interface PortalInfo {
  name: string;
  authority: string;
  url: string;
  badge: string;
  color: string;
}

function resolveAuthorityPortal(licName: string, location: string): PortalInfo {
  const n = licName.toLowerCase();
  const loc = location.toLowerCase();

  if (n.includes('fssai') || n.includes('food')) {
    return {
      name: 'FoSCoS Food Safety Compliance System',
      authority: 'Food Safety and Standards Authority of India (FSSAI)',
      url: 'https://foscos.fssai.gov.in',
      badge: 'Central Regulatory Portal',
      color: 'emerald'
    };
  }

  if (n.includes('gst') || n.includes('gstin') || n.includes('tax')) {
    return {
      name: 'GST Common Portal (CBIC)',
      authority: 'Goods & Services Tax Network (GSTN)',
      url: 'https://www.gst.gov.in',
      badge: 'National Tax Gateway',
      color: 'indigo'
    };
  }

  if (n.includes('mca') || n.includes('incorporation') || n.includes('pvt') || n.includes('llp') || n.includes('company')) {
    return {
      name: 'MCA21 V3 Portal (SPICe+)',
      authority: 'Ministry of Corporate Affairs, Govt of India',
      url: 'https://www.mca.gov.in',
      badge: 'Corporate Affairs Portal',
      color: 'violet'
    };
  }

  if (n.includes('trademark') || n.includes('ipr') || n.includes('patent') || n.includes('brand')) {
    return {
      name: 'IP India Comprehensive e-Filing Gateway',
      authority: 'Controller General of Patents, Designs and Trade Marks',
      url: 'https://ipindiaonline.gov.in',
      badge: 'Intellectual Property Gateway',
      color: 'rose'
    };
  }

  if (n.includes('udyam') || n.includes('msme')) {
    return {
      name: 'Udyam Registration Portal',
      authority: 'Ministry of Micro, Small and Medium Enterprises',
      url: 'https://udyamregistration.gov.in',
      badge: 'Zero-Cost Central Scheme',
      color: 'amber'
    };
  }

  if (n.includes('shop') || n.includes('establishment') || n.includes('labour') || n.includes('labor')) {
    if (loc.includes('tamil nadu') || loc.includes('chennai') || loc.includes('coimbatore')) {
      return {
        name: 'TN Labour Online Portal',
        authority: 'Department of Labour, Govt of Tamil Nadu',
        url: 'https://labour.tn.gov.in',
        badge: 'State Labour Gateway',
        color: 'sky'
      };
    }
    if (loc.includes('karnataka') || loc.includes('bangalore') || loc.includes('bengaluru')) {
      return {
        name: 'e-Karmika Labour Services',
        authority: 'Department of Labour, Govt of Karnataka',
        url: 'https://ekarmika.karnataka.gov.in',
        badge: 'State Labour Gateway',
        color: 'sky'
      };
    }
    if (loc.includes('maharashtra') || loc.includes('mumbai') || loc.includes('pune')) {
      return {
        name: 'Aaple Sarkar Labour Portal',
        authority: 'Department of Labour, Govt of Maharashtra',
        url: 'https://lms.mahaonline.gov.in',
        badge: 'State Labour Gateway',
        color: 'sky'
      };
    }
    return {
      name: 'National e-Shram & Labour Gateway',
      authority: 'Ministry of Labour and Employment',
      url: 'https://labour.gov.in',
      badge: 'Labour Department Portal',
      color: 'sky'
    };
  }

  if (n.includes('trade') || n.includes('municipal') || n.includes('health') || n.includes('corporation')) {
    if (loc.includes('chennai') || loc.includes('tamil nadu')) {
      return {
        name: 'GCC Trade License Online Portal',
        authority: 'Greater Chennai Corporation (GCC Revenue Dept)',
        url: 'https://chennaicorporation.gov.in/gcc/online-services/trade-licence/',
        badge: 'Municipal Urban Body',
        color: 'cyan'
      };
    }
    if (loc.includes('bangalore') || loc.includes('bengaluru') || loc.includes('karnataka')) {
      return {
        name: 'BBMP Trade License Citizen Portal',
        authority: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
        url: 'https://bbmp.gov.in',
        badge: 'Municipal Urban Body',
        color: 'cyan'
      };
    }
    if (loc.includes('mumbai') || loc.includes('maharashtra')) {
      return {
        name: 'BMC Citizen Portal (Shops & Trade)',
        authority: 'Brihanmumbai Municipal Corporation (BMC)',
        url: 'https://portal.mcgm.gov.in',
        badge: 'Municipal Urban Body',
        color: 'cyan'
      };
    }
    return {
      name: 'ServicePlus National e-District Portal',
      authority: 'Ministry of Electronics & Information Technology / Local Municipal Body',
      url: 'https://serviceonline.gov.in',
      badge: 'Municipal Urban Body',
      color: 'cyan'
    };
  }

  if (n.includes('fire') || n.includes('safety') || n.includes('noc')) {
    return {
      name: 'Fire & Rescue Services e-NOC Portal',
      authority: 'State Directorate of Fire & Emergency Services',
      url: 'https://serviceonline.gov.in',
      badge: 'Public Safety Authority',
      color: 'rose'
    };
  }

  if (n.includes('pollution') || n.includes('pcb') || n.includes('environmental') || n.includes('waste')) {
    return {
      name: 'OCMMS Online Consent Management',
      authority: 'State Pollution Control Board (CPCB/SPCB)',
      url: 'https://ocmms.nic.in',
      badge: 'Environmental Protection Body',
      color: 'teal'
    };
  }

  if (n.includes('vet') || n.includes('pet') || n.includes('animal')) {
    return {
      name: 'Veterinary Council of India & State Registrar',
      authority: 'Veterinary Council of India & Dept of Animal Husbandry',
      url: 'https://vci.dadf.gov.in',
      badge: 'Clinical Statutory Council',
      color: 'emerald'
    };
  }

  // General default fallback
  return {
    name: 'National Government Services Portal',
    authority: 'Government of India Single Window System',
    url: 'https://services.india.gov.in',
    badge: 'National Portal',
    color: 'indigo'
  };
}

// ─── Default Document Checklist Items ─────────────────────────────────────────
interface DocumentItem {
  id: string;
  name: string;
  category: 'Entity & Founders' | 'Premises & Utilities' | 'Certifications & Technical';
  description: string;
  critical: boolean;
}

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: 'pan_aadhaar',
    name: 'Founder PAN Card & Aadhaar (Mobile Linked)',
    category: 'Entity & Founders',
    description: 'Statutory photo identity and address verification required for DSC, MCA, and GST',
    critical: true
  },
  {
    id: 'dsc_token',
    name: 'Class-3 Digital Signature Certificate (DSC Token)',
    category: 'Entity & Founders',
    description: 'Mandatory cryptographic signature token for electronic MCA SPICe+ and statutory filings',
    critical: true
  },
  {
    id: 'passport_photos',
    name: 'Passport Size Photographs (Directors / Partners)',
    category: 'Entity & Founders',
    description: 'Recent colored passport photos with white background for bank and municipal verification',
    critical: false
  },
  {
    id: 'lease_agreement',
    name: 'Registered Commercial Lease Deed / Rental Agreement',
    category: 'Premises & Utilities',
    description: 'Stamped agreement clearly stating commercial permission with minimum 11 months validity',
    critical: true
  },
  {
    id: 'landlord_noc',
    name: 'Landlord No-Objection Certificate (NOC)',
    category: 'Premises & Utilities',
    description: 'Signed letter from property owner authorizing commercial business operations on premises',
    critical: true
  },
  {
    id: 'electricity_bill',
    name: 'Recent Electricity Bill or Property Tax Receipt (< 60 Days)',
    category: 'Premises & Utilities',
    description: 'Statutory address proof showing exact consumer name, survey/door number, and pincode',
    critical: true
  },
  {
    id: 'cancelled_cheque',
    name: 'Cancelled Cheque / Bank Statement with Printed Entity Name',
    category: 'Entity & Founders',
    description: 'Proof of operative current account for GSTIN portal bank account linkage within 30 days',
    critical: true
  },
  {
    id: 'fire_sanction',
    name: 'Building Sanction Plan & Fire Extinguisher Installation Audit',
    category: 'Certifications & Technical',
    description: 'Required for commercial trade license, health officer inspection, and municipal clearance',
    critical: false
  },
  {
    id: 'fssai_water_report',
    name: 'Potable Water Testing Certificate / Hygiene SOP',
    category: 'Certifications & Technical',
    description: 'Mandatory for food, beverage, cafe, hospital, and pet care clinical facilities',
    critical: false
  }
];

export default function ComplianceView({ 
  complianceData,
  companyName = 'My Startup',
  businessType = 'Startup',
  location = 'India',
  idea = ''
}: ComplianceViewProps) {
  if (!complianceData) {
    return (
      <div className="p-8 text-center text-slate-400">
        No compliance guidelines data generated.
      </div>
    );
  }

  const { required_licenses, additional_guidance } = complianceData;

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'licenses' | 'docs' | 'contracts' | 'risk'>('licenses');
  
  // Checklist State
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [completedDocs, setCompletedDocs] = useState<Record<string, boolean>>({});
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  
  // Fee Mode Toggle (Self e-filing vs CA/CS assisted)
  const [assistanceMode, setAssistanceMode] = useState<'diy' | 'ca_assisted'>('ca_assisted');
  
  // Expanded Cards Accordion
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  
  // Contract Template State
  const [selectedContract, setSelectedContract] = useState<'nda' | 'mou' | 'resolution' | 'lease_rider' | 'privacy'>('nda');
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedDossier, setCopiedDossier] = useState(false);

  const toggleCheck = (name: string) => {
    setCompletedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleDoc = (id: string) => {
    setCompletedDocs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpand = (name: string) => {
    setExpandedCards(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // ─── Stats Calculations ─────────────────────────────────────────────────────
  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const totalCount = required_licenses.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = completedCount === totalCount && totalCount > 0;

  const completedDocsCount = Object.values(completedDocs).filter(Boolean).length;
  const totalDocsCount = DEFAULT_DOCUMENTS.length;
  const docProgressPct = Math.round((completedDocsCount / totalDocsCount) * 100);

  // Helper for Priority config
  const getPriorityConfig = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('mandatory') || t.includes('required') || t.includes('essential')) {
      return {
        badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        dot: 'bg-rose-500',
        icon: <AlertCircle size={12} className="text-rose-500" />,
        priority: 1,
        label: 'Mandatory',
        textColor: 'text-rose-600 dark:text-rose-400'
      };
    }
    if (t.includes('recommend') || t.includes('important') || t.includes('advised')) {
      return {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        dot: 'bg-amber-500',
        icon: <TrendingUp size={12} className="text-amber-500" />,
        priority: 2,
        label: 'Recommended',
        textColor: 'text-amber-600 dark:text-amber-400'
      };
    }
    return {
      badge: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
      dot: 'bg-slate-400',
      icon: <CheckSquare size={12} className="text-slate-400" />,
      priority: 3,
      label: 'Optional',
      textColor: 'text-slate-500'
    };
  };

  // Helper to extract numeric cost
  const parseCostNumbers = (costStr: string) => {
    const matches = costStr.replace(/,/g, '').match(/\d+/g);
    if (!matches || matches.length === 0) return { min: 0, max: 0 };
    const nums = matches.map(Number);
    return { min: Math.min(...nums), max: Math.max(...nums) };
  };

  // Helper to extract days
  const parseDays = (timeStr: string) => {
    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 7;
  };

  // Total Estimated Budget
  const budgetCalculations = useMemo(() => {
    let statutoryMin = 0;
    let statutoryMax = 0;
    let maxDays = 0;

    required_licenses.forEach(lic => {
      const { min, max } = parseCostNumbers(lic.cost_estimate);
      statutoryMin += min;
      statutoryMax += max;
      const days = parseDays(lic.time_estimate);
      if (days > maxDays) maxDays = days;
    });

    const caOverhead = assistanceMode === 'ca_assisted' ? 12000 : 0;
    return {
      totalMin: statutoryMin + caOverhead,
      totalMax: statutoryMax + caOverhead,
      statutoryMin,
      statutoryMax,
      caOverhead,
      criticalPathDays: maxDays,
      parallelExecutionDays: Math.max(14, Math.round(maxDays * 0.75))
    };
  }, [required_licenses, assistanceMode]);

  // Stage inferrer
  const getLicenseStage = (lic: LicenseInfo): { id: string; label: string; color: string } => {
    if (lic.category_stage) {
      if (lic.category_stage === 'pre_incorporation') return { id: 'pre_inc', label: '1. Pre-Incorporation', color: 'indigo' };
      if (lic.category_stage === 'registration') return { id: 'tax_reg', label: '2. Tax & Legal Entity', color: 'blue' };
      if (lic.category_stage === 'operational_license') return { id: 'ops', label: '3. Municipal & Operational', color: 'teal' };
      return { id: 'ongoing', label: '4. Ongoing & Governance', color: 'emerald' };
    }
    const n = lic.name.toLowerCase();
    if (n.includes('mca') || n.includes('dsc') || n.includes('din') || n.includes('incorporation')) {
      return { id: 'pre_inc', label: '1. Pre-Incorporation', color: 'indigo' };
    }
    if (n.includes('gst') || n.includes('pan') || n.includes('tan') || n.includes('msme') || n.includes('udyam')) {
      return { id: 'tax_reg', label: '2. Tax & Legal Entity', color: 'blue' };
    }
    if (n.includes('fssai') || n.includes('trade') || n.includes('fire') || n.includes('health') || n.includes('shop') || n.includes('vet')) {
      return { id: 'ops', label: '3. Municipal & Operational', color: 'teal' };
    }
    return { id: 'ongoing', label: '4. Ongoing & Governance', color: 'emerald' };
  };

  // Filtered Licenses
  const filteredLicenses = useMemo(() => {
    return required_licenses.filter(lic => {
      const pConf = getPriorityConfig(lic.type);
      const stage = getLicenseStage(lic);
      
      const matchesSearch = 
        lic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lic.statutory_authority && lic.statutory_authority.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = 
        selectedPriority === 'all' || 
        (selectedPriority === 'mandatory' && pConf.priority === 1) ||
        (selectedPriority === 'recommended' && pConf.priority === 2) ||
        (selectedPriority === 'optional' && pConf.priority === 3);

      const matchesStage =
        selectedStage === 'all' ||
        selectedStage === stage.id;

      return matchesSearch && matchesPriority && matchesStage;
    }).sort((a, b) => getPriorityConfig(a.type).priority - getPriorityConfig(b.type).priority);
  }, [required_licenses, searchQuery, selectedPriority, selectedStage]);

  // ─── Legal Contracts Generator Logic ─────────────────────────────────────────
  const generatedContracts = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const jurisdiction = location.split(',')[0].trim() || 'Chennai';

    const ndaText = `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is executed on this ${todayStr} ("Effective Date"), by and between:

PARTY A: ${companyName}, a startup venture specializing in ${businessType}, with its principal place of business proposed in ${location} (hereinafter referred to as the "Company", which expression shall include its successors, affiliates, and assigns);
AND
PARTY B: The Counterparty / Prospective Co-Founder / Investor / Vendor executing this document (hereinafter referred to as the "Recipient").

RECITALS:
WHEREAS, the Parties are entering into business discussions regarding: "${idea}" (the "Purpose");
WHEREAS, during these discussions, either Party may disclose proprietary technical, operational, financial, and strategic information to the other Party.

NOW, THEREFORE, the Parties agree as follows:
1. DEFINITION OF CONFIDENTIAL INFORMATION:
"Confidential Information" includes all business plans, customer personas, financial projections, software architectures, algorithms, vendor lists, pricing models, and trade secrets related to ${companyName}.
2. OBLIGATIONS OF RECEIVING PARTY:
The Recipient agrees:
   (a) To hold all Confidential Information in strict confidence, exercising at least reasonable care;
   (b) Not to disclose such information to any third party without prior written consent;
   (c) Not to reverse engineer, copy, or commercialize any proprietary concepts related to ${companyName}.
3. INTELLECTUAL PROPERTY OWNERSHIP:
All proprietary data, logos, customer lists, and software code shall remain the sole and exclusive property of the Disclosing Party.
4. TERM AND DURATION:
This Agreement and the duty of confidentiality shall remain in effect for a period of two (2) years from the Effective Date.
5. GOVERNING LAW & JURISDICTION:
This Agreement shall be construed and governed by the laws of India. The courts of ${jurisdiction} shall have exclusive territorial jurisdiction.

IN WITNESS WHEREOF, the Parties have caused this Agreement to be executed as of the date first above written.

For ${companyName}:                               For Recipient:
Authorized Signatory: ________________________   Authorized Signatory: ________________________
Title: Founder / Director                        Title: _______________________________________
`;

    const mouText = `CO-FOUNDER MEMORANDUM OF UNDERSTANDING (MoU) & EQUITY VESTING FRAMEWORK

CONFIDENTIAL FOUNDER AGREEMENT
PROJECT: ${companyName} (${businessType})
LOCATION: ${location}
DATE: ${todayStr}

1. CORE PURPOSE:
This Memorandum of Understanding sets forth the binding covenants between the founding members to incorporate and scale ${companyName}, building upon the core proposition: "${idea}".

2. ROLES AND RESPONSIBILITIES:
- Founder 1 (CEO / Product Lead): Strategy, fundraising, legal compliance, and customer acquisition.
- Founder 2 (CTO / Operations Lead): Architecture, engineering, operational delivery, and infrastructure.

3. EQUITY DISTRIBUTION & 4-YEAR VESTING:
- Total Authorized Equity: 100%
- Vesting Schedule: Four (4) Year linear vesting with a Twelve (12) Month Cliff period.
- Acceleration: Double-trigger acceleration upon change of control or hostile acquisition.
- If any Founder ceases full-time commitment prior to the 12-month cliff, 100% of unvested equity shall revert to the Company pool at nominal book value.

4. INTELLECTUAL PROPERTY ASSIGNMENT:
Each Founder irrevocably assigns all right, title, and interest in any designs, software code, branding assets, logos, and business processes created for ${companyName} to the incorporated legal entity.

5. DECISION MAKING & DEADLOCK RESOLUTION:
Day-to-day operational decisions require simple majority. Fundamental matters (equity issuance, debt beyond ₹5,00,000, sale of assets) require unanimous consent. In the event of a deadlock, the matter shall be referred to an independent advisor or mediator in ${jurisdiction}.

6. GOVERNING JURISDICTION:
Courts of ${jurisdiction}, India.

Agreed & Confirmed by Founding Members:
Founder 1: ____________________________    Date: ________________________
Founder 2: ____________________________    Date: ________________________
`;

    const resolutionText = `CERTIFIED TRUE COPY OF THE BOARD RESOLUTION OF ${companyName.toUpperCase()} PRIVATE LIMITED

HELD AT THE REGISTERED OFFICE ON ${todayStr}

RESOLVED THAT:
1. OPENING OF CURRENT BANK ACCOUNT:
Consent of the Board of Directors be and is hereby accorded to open a Current Bank Account in the name of "${companyName} Private Limited" with [Bank Name], located in ${location}.

2. AUTHORIZED SIGNATORIES:
The Board hereby authorizes the Directors of the Company to operate the said Current Account jointly/severally, sign cheques, execute banking mandates, authorize digital payments, and transact on internet banking portals on behalf of the Company.

3. GST & STATUTORY TAX AUTHORIZATION:
Further resolved that the Founder/Director be authorized to apply for GST Registration (GSTIN), MSME Udyam Registration, Municipal Trade License, and FSSAI (if applicable), and represent the Company before the tax and municipal authorities.

CERTIFIED TRUE COPY:
For and on behalf of ${companyName} Private Limited

________________________________________
Director (DIN: _____________________)
`;

    const leaseRiderText = `COMMERCIAL LEASE AGREEMENT RIDER & COMPLIANCE CLEARANCE CLAUSE

ATTACHMENT TO COMMERCIAL LEASE DEED FOR: ${companyName}
PROPERTY LOCATION: ${location}
DATE: ${todayStr}

SPECIAL TENANT COVENANTS FOR REGULATORY CLEARANCES:

1. COMMERCIAL SANCTION & ZONING:
The Landlord represents and warrants that the scheduled premises holds valid municipal commercial zoning clearance and is authorized for operating a commercial ${businessType} establishment.

2. STATUTORY NO-OBJECTION (NOC):
The Landlord unconditionally consents and agrees to sign all requisite No-Objection Certificates (NOC) necessary for the Tenant to procure:
   (a) Goods and Services Tax (GSTIN) Registration;
   (b) Municipal Health Trade License & Shop Act Registration;
   (c) Fire Safety Clearance NOC and Commercial Power Connection sanction.

3. UTILITIES & POWER LOAD SANCTION:
The Landlord agrees to facilitate electricity board sanction for commercial 3-phase power load adequate for operating commercial machinery and equipment without hindrance.

4. SEVERABILITY & FORCE MAJEURE DUE TO LICENSING:
In the unforeseen event that the municipal corporation denies commercial trade licensing due to structural defects or lack of approved building plans by the property owner, the Tenant shall have the right to terminate this lease with immediate return of the full security deposit without penalty.

TENANT: ${companyName}                            LANDLORD:
Signature: __________________________            Signature: __________________________
`;

    const privacyText = `WEBSITE TERMS OF SERVICE & DPDP ACT 2023 PRIVACY POLICY

FOR: ${companyName} (${businessType})
EFFECTIVE DATE: ${todayStr}

1. OVERVIEW & CONSENT:
Welcome to ${companyName}. By accessing our digital platforms, you agree to these Terms and our data privacy protocols compliant with the Digital Personal Data Protection Act, 2023 (DPDP Act, India).

2. DATA WE COLLECT & USE:
We collect user details (Name, Contact Info, Order History, Payment Identifiers) strictly for providing requested services under our business model: "${idea}".

3. RIGHTS OF DATA PRINCIPALS:
As a customer of ${companyName}, you retain the right to:
   - Request access to your personal data;
   - Request correction or erasure of obsolete personal data;
   - Withdraw consent for marketing notifications at any time.

4. DATA SECURITY:
All personal data is encrypted in transit using industry-standard TLS protocols. We do not sell or monetize personal identifiable information to third parties.

5. GRIEVANCE OFFICER:
In accordance with DPDP rules, our designated Grievance Officer can be contacted at: compliance@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.
`;

    return {
      nda: ndaText,
      mou: mouText,
      resolution: resolutionText,
      lease_rider: leaseRiderText,
      privacy: privacyText
    };
  }, [companyName, businessType, location, idea]);

  const handleCopyContract = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleDownloadContract = (title: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${companyName.toLowerCase().replace(/\s+/g, '_')}_${title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportDossier = () => {
    const today = new Date().toLocaleDateString();
    let dossier = `# ${companyName.toUpperCase()} — STATUTORY COMPLIANCE & LEGAL AUDIT DOSSIER\n`;
    dossier += `_Compiled on ${today} | Business Type: ${businessType} | Location: ${location}_\n\n`;
    dossier += `## 1. Executive Summary\n`;
    dossier += `- **Total Registrations Identified**: ${totalCount}\n`;
    dossier += `- **Registrations Completed**: ${completedCount} / ${totalCount} (${progressPct}%)\n`;
    dossier += `- **Document Readiness**: ${completedDocsCount} / ${totalDocsCount} (${docProgressPct}%)\n`;
    dossier += `- **Estimated Govt Statutory Fees**: ₹${budgetCalculations.statutoryMin.toLocaleString()} - ₹${budgetCalculations.statutoryMax.toLocaleString()}\n`;
    dossier += `- **Estimated Critical Path Timeline**: ${budgetCalculations.parallelExecutionDays} - ${budgetCalculations.criticalPathDays} Days\n\n`;

    dossier += `## 2. Regulatory Licenses & Permits Register\n`;
    required_licenses.forEach((lic, idx) => {
      const isDone = !!completedItems[lic.name];
      const portal = resolveAuthorityPortal(lic.name, location);
      dossier += `### ${idx + 1}. [${isDone ? 'X' : ' '}] ${lic.name} (${lic.type})\n`;
      dossier += `- **Authority**: ${lic.statutory_authority || portal.authority}\n`;
      dossier += `- **Cost Estimate**: ${lic.cost_estimate}\n`;
      dossier += `- **Time Estimate**: ${lic.time_estimate}\n`;
      dossier += `- **Official Portal**: ${lic.portal_url || portal.url}\n`;
      dossier += `- **Scope**: ${lic.description}\n`;
      if (lic.penalties_for_non_compliance) {
        dossier += `- **Non-Compliance Penalty**: ${lic.penalties_for_non_compliance}\n`;
      }
      dossier += `\n`;
    });

    dossier += `## 3. KYC & Incorporation Document Checklist\n`;
    DEFAULT_DOCUMENTS.forEach(doc => {
      const isReady = !!completedDocs[doc.id];
      dossier += `- [${isReady ? 'X' : ' '}] **${doc.name}** (${doc.category}) — ${doc.description}\n`;
    });
    dossier += `\n`;

    dossier += `## 4. Statutory Advisory Notes\n`;
    dossier += `${additional_guidance}\n\n`;

    const blob = new Blob([dossier], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${companyName.toLowerCase().replace(/\s+/g, '_')}_compliance_dossier.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ─── Top Header Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30">
              <FolderLock size={22} />
            </span>
            <div>
              <h2 className="text-2xl font-black font-outfit text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Compliance & Legal Vault
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 uppercase tracking-widest">
                  Live Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory licensing roadmap, penalty prevention shields, official authority portals, and customized legal agreements for <strong className="text-slate-700 dark:text-slate-200">{companyName}</strong> in <strong className="text-slate-700 dark:text-slate-200">{location}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportDossier}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            {copiedDossier ? <Check size={14} className="text-emerald-300" /> : <Download size={14} />}
            <span>Export Full Legal Dossier (.md)</span>
          </button>
        </div>
      </div>

      {/* ─── All Done Celebration Banner ─────────────────────────────────────── */}
      {allDone && (
        <div className="p-5 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border border-emerald-500/40 rounded-2xl flex items-center gap-4 animate-pulse-glow shadow-lg shadow-emerald-500/10">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-500">
            <Trophy size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black font-outfit text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span>🎉 100% Statutory Clearance Achieved!</span>
            </h3>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
              All {totalCount} mandatory and recommended registrations have been verified. {companyName} is legally protected and ready to commence operations in {location}.
            </p>
          </div>
        </div>
      )}

      {/* ─── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('licenses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'licenses'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck size={15} />
          <span>Licenses & Permits Hub</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold">
            {required_licenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'docs'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet size={15} />
          <span>KYC & Document Vault</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold">
            {completedDocsCount}/{totalDocsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'contracts'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileSignature size={15} />
          <span>Legal Agreement Generator</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-extrabold">
            5 Drafts
          </span>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'risk'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert size={15} />
          <span>Penalty & Risk Matrix</span>
        </button>
      </div>

      {/* ─── TAB 1: LICENSES & PERMITS HUB ──────────────────────────────────── */}
      {activeTab === 'licenses' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Metric Overview Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Progress Card */}
            <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><FileCheck size={14} /> Licensing Status</span>
                <span className="font-outfit text-base font-black text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${allDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
                <span>{completedCount} Completed</span>
                <span>{totalCount - completedCount} Pending</span>
              </div>
            </div>

            {/* Estimated Budget Card */}
            <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Coins size={14} className="text-amber-500" /> Est. Total Filing Cost</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  {assistanceMode === 'ca_assisted' ? 'CA Assisted' : 'DIY'}
                </span>
              </div>
              <div className="text-xl font-black font-outfit text-slate-900 dark:text-white">
                ₹{budgetCalculations.totalMin.toLocaleString()} - ₹{budgetCalculations.totalMax.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex justify-between">
                <span>Govt: ₹{budgetCalculations.statutoryMin.toLocaleString()}</span>
                <span>{assistanceMode === 'ca_assisted' ? 'CA Fee: ₹12,000' : 'Zero CA Fee'}</span>
              </div>
            </div>

            {/* Turnaround Time Card */}
            <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-sky-500" /> Time to Launch</span>
                <span className="text-[10px] text-emerald-500 font-bold">Parallelized</span>
              </div>
              <div className="text-xl font-black font-outfit text-slate-900 dark:text-white">
                ~{budgetCalculations.parallelExecutionDays} - {budgetCalculations.criticalPathDays} Days
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Fastest critical path via SPICe+ & FoSCoS
              </div>
            </div>

            {/* Assistance Mode Toggle Card */}
            <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale size={14} /> Filing Mode
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setAssistanceMode('diy')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                    assistanceMode === 'diy' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  DIY / Direct
                </button>
                <button
                  onClick={() => setAssistanceMode('ca_assisted')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                    assistanceMode === 'ca_assisted' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  CA Assisted
                </button>
              </div>
              <div className="text-[10px] text-slate-400 text-center">
                {assistanceMode === 'ca_assisted' ? 'Includes legal vetting & DSC tokens' : 'Self e-filing directly on portals'}
              </div>
            </div>
          </div>

          {/* Search, Filter & Stage Segment Controls */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search licenses, portals, or penalties..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Priority Select */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter size={13} />
                <span className="font-semibold hidden sm:inline">Priority:</span>
                <select
                  value={selectedPriority}
                  onChange={e => setSelectedPriority(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="mandatory">Mandatory Only</option>
                  <option value="recommended">Recommended Only</option>
                  <option value="optional">Optional Only</option>
                </select>
              </div>

              {/* Stage Select */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-semibold hidden sm:inline">Stage:</span>
                <select
                  value={selectedStage}
                  onChange={e => setSelectedStage(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Stages</option>
                  <option value="pre_inc">1. Pre-Incorporation</option>
                  <option value="tax_reg">2. Tax & Legal Entity</option>
                  <option value="ops">3. Municipal & Operational</option>
                  <option value="ongoing">4. Ongoing & Governance</option>
                </select>
              </div>
            </div>
          </div>

          {/* License Cards List */}
          <div className="space-y-4">
            {filteredLicenses.length === 0 ? (
              <div className="p-12 text-center glass-panel rounded-2xl text-slate-400 text-xs">
                No compliance licenses found matching your filter criteria.
              </div>
            ) : (
              filteredLicenses.map((lic, idx) => {
                const isDone = !!completedItems[lic.name];
                const isExpanded = !!expandedCards[lic.name];
                const priorityConf = getPriorityConfig(lic.type);
                const stage = getLicenseStage(lic);
                const portal = resolveAuthorityPortal(lic.name, location);
                const officialPortalUrl = lic.portal_url || portal.url;
                const authorityName = lic.statutory_authority || portal.authority;

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all duration-200 ${
                      isDone
                        ? 'border-emerald-500/30 bg-emerald-500/5 dark:border-emerald-900/30 dark:bg-emerald-950/10'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:border-indigo-500/40'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="p-5 flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleCheck(lic.name)}
                        className="mt-1 flex-shrink-0 transition-transform hover:scale-110 active:scale-90"
                        title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                      >
                        {isDone ? (
                          <CheckSquare size={22} className="text-emerald-500" />
                        ) : (
                          <Square size={22} className="text-indigo-400 dark:text-indigo-500 hover:text-indigo-600" />
                        )}
                      </button>

                      {/* Main Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className={`text-base font-extrabold font-outfit transition-all ${
                              isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                            }`}>
                              {lic.name}
                            </h4>

                            {/* Stage Badge */}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {stage.label}
                            </span>
                          </div>

                          {/* Priority Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${priorityConf.badge}`}>
                              {priorityConf.icon}
                              {lic.type}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className={`text-xs leading-relaxed font-medium ${
                          isDone ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          {lic.description}
                        </p>

                        {/* Authority & Portal Quick Bar */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Building size={13} className="text-indigo-500" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">{authorityName}</span>
                          </div>

                          <a
                            href={officialPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-[11px]"
                          >
                            <span>Open {portal.name}</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>

                        {/* Cost & Processing Time Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Est. Govt Fee</span>
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                              <Coins size={12} />
                              {lic.cost_estimate}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Processing Time</span>
                            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 mt-0.5">
                              <Clock size={12} />
                              {lic.time_estimate}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Status</span>
                            <span className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${isDone ? 'text-emerald-500' : 'text-slate-400'}`}>
                              <ShieldCheck size={12} />
                              {isDone ? 'Cleared' : 'Pending Action'}
                            </span>
                          </div>

                          {/* Accordion Toggle */}
                          <button
                            onClick={() => toggleExpand(lic.name)}
                            className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center justify-between transition-colors"
                          >
                            <span className="text-[10px] font-bold">Details & Risk</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>

                        {/* Expandable Details Drawer */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-3 animate-fade-in">
                            {/* Non-compliance penalty */}
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-extrabold uppercase tracking-wider text-[10px] block">Statutory Non-Compliance Penalty</span>
                                <span className="text-[11px] font-medium leading-relaxed">
                                  {lic.penalties_for_non_compliance || `Commencing commercial operations without ${lic.name} exposes founders to monetary fines, property sealing, and retrospective penalty under local state jurisdiction.`}
                                </span>
                              </div>
                            </div>

                            {/* Prerequisites */}
                            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                Mandatory Application Prerequisites
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {(lic.prerequisites && lic.prerequisites.length > 0 ? lic.prerequisites : [
                                  'PAN & Aadhaar of Signatory',
                                  'Commercial Lease Agreement',
                                  'Recent Electricity Bill',
                                  'Bank Account Mandate'
                                ]).map((req, rIdx) => (
                                  <span key={rIdx} className="px-2 py-0.5 bg-white dark:bg-slate-900 rounded-md text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                                    • {req}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Advisory Notes Box */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-amber-500 bg-amber-500/5 dark:bg-amber-950/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <ShieldAlert size={18} />
              <h3 className="text-sm font-extrabold uppercase tracking-wider font-outfit">Corporate Legal Counsel Advisory</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {additional_guidance}
            </p>
          </div>
        </div>
      )}

      {/* ─── TAB 2: KYC & INCORPORATION DOCUMENT VAULT ──────────────────────── */}
      {activeTab === 'docs' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Progress Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="text-indigo-500" size={18} />
                <span>Incorporation & KYC Readiness Audit</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ensure these foundational physical and digital records are organized in your company drive prior to portal submissions.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Readiness Score</span>
                <span className="text-2xl font-black font-outfit text-indigo-600 dark:text-indigo-400">{docProgressPct}%</span>
              </div>
              <div className="w-24 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${docProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_DOCUMENTS.map((doc) => {
              const isChecked = !!completedDocs[doc.id];

              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-0.5 flex-shrink-0">
                      {isChecked ? (
                        <CheckSquare size={20} className="text-emerald-500" />
                      ) : (
                        <Square size={20} className="text-slate-400 hover:text-indigo-500" />
                      )}
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-extrabold font-outfit ${
                          isChecked ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {doc.name}
                        </h4>
                        {doc.critical && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            Critical
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {doc.description}
                      </p>
                      <span className="text-[10px] text-indigo-500 font-semibold block pt-0.5">
                        Category: {doc.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: LEGAL AGREEMENT GENERATOR ───────────────────────────────── */}
      {activeTab === 'contracts' && (
        <div className="space-y-6 animate-fade-in">
          {/* Contracts Sub Navigation */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {[
              { id: 'nda', label: 'Mutual Non-Disclosure Agreement (NDA)', icon: FileSignature },
              { id: 'mou', label: 'Co-Founder MoU & Equity Vesting', icon: Scale },
              { id: 'resolution', label: 'Board Resolution (Bank & Tax)', icon: Building },
              { id: 'lease_rider', label: 'Commercial Lease Compliance Rider', icon: FileText },
              { id: 'privacy', label: 'DPDP Act Website Privacy Policy', icon: ShieldCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = selectedContract === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedContract(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contract Preview Paper Canvas */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>Pre-Drafted for {companyName}</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Ready to sign. Tailored with your business model, jurisdiction ({location}), and company name.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyContract(generatedContracts[selectedContract])}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
                >
                  {copiedContract ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedContract ? 'Copied' : 'Copy Draft'}</span>
                </button>

                <button
                  onClick={() => handleDownloadContract(selectedContract, generatedContracts[selectedContract])}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                >
                  <Download size={13} />
                  <span>Download (.txt)</span>
                </button>
              </div>
            </div>

            {/* Document Text Area */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-300 max-h-[500px] overflow-y-auto whitespace-pre-wrap select-all">
              {generatedContracts[selectedContract]}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: PENALTY & RISK MATRIX ───────────────────────────────────── */}
      {activeTab === 'risk' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 space-y-1">
            <h3 className="text-sm font-black font-outfit uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={18} />
              <span>Statutory Risk Assessment & Liability Safeguard</span>
            </h3>
            <p className="text-xs text-rose-700/80 dark:text-rose-300/80 font-medium">
              Operating a startup in India without mandatory municipal and statutory filings can lead to immediate operational injunctions, substantial compounding fines, and director disqualification.
            </p>
          </div>

          {/* Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <AlertCircle size={14} /> FSSAI Non-Compliance (Sec 63)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/10 text-rose-500">
                  Critical
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Commencing commercial food, beverage, or consumable production without registration carries imprisonment of up to 6 months and monetary fines up to <strong>₹5,00,000</strong>.
              </p>
              <div className="pt-1 text-[11px] text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300">Safeguard Action:</strong> Apply on FoSCoS portal immediately upon signing commercial lease.
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <AlertCircle size={14} /> GST Evasion / Delayed Linkage (Sec 122)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/10 text-rose-500">
                  High Risk
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Operating without GSTIN when turnover threshold is breached or conducting inter-state commerce attracts a penalty of <strong>100% of tax evaded</strong> or minimum ₹10,000.
              </p>
              <div className="pt-1 text-[11px] text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300">Safeguard Action:</strong> Submit GST REG-01 online within 30 days of incorporation.
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <AlertCircle size={14} /> Municipal Trade License Omission
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-500">
                  Moderate Risk
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Local corporations (GCC, BBMP, BMC) conduct routine commercial ward inspections. Missing licenses can cause <strong>premises sealing</strong> and utility disconnection notices.
              </p>
              <div className="pt-1 text-[11px] text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300">Safeguard Action:</strong> Apply through the state e-district / municipal online portal.
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> DPDP Act 2023 Digital Compliance
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/10 text-indigo-500">
                  Tech / Digital Risk
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Handling consumer data without consent disclosures or adequate cybersecurity controls exposes digital platforms to penalties up to <strong>₹250 Crore</strong> by the Data Protection Board.
              </p>
              <div className="pt-1 text-[11px] text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300">Safeguard Action:</strong> Deploy our pre-drafted Website Terms & Privacy Policy to your landing page.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
