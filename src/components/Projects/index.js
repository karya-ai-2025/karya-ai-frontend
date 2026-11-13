// Dynamic Project Components Registry
import HotLeadInBox, { SideLeftBar as HotLeadSidebar } from './HotLeadInBox';
import ContentProjectApp from './ContentProject';

// Project Registry - Add new projects here
export const PROJECT_COMPONENTS = {
  'hotlead-in-a-box':       HotLeadInBox,
  'outbound-list-builder':  HotLeadInBox,   // leads tab only
  'ai-email-sales-agency':  HotLeadInBox,   // campaigns tab only
  'brand-voice-social':     ContentProjectApp,
};

// Project Sidebar Registry
export const PROJECT_SIDEBARS = {
  'hotlead-in-a-box': HotLeadSidebar,
};

// Tab access per purchased slug — dashboard & settings always unlocked
export const PROJECT_TAB_ACCESS = {
  'hotlead-in-a-box':      { leads: true,  campaigns: true  },
  'outbound-list-builder': { leads: true,  campaigns: false },
  'ai-email-sales-agency': { leads: false, campaigns: true  },
};

// Project Metadata
export const PROJECT_METADATA = {
  'hotlead-in-a-box': {
    name: 'HotLead in a Box',
    description: 'Complete lead generation system with automated outreach',
    category: 'Lead Generation',
    version: '1.0.0',
    features: ['Automated Outreach', 'Lead Scoring', 'Pipeline Tracking', 'Analytics'],
    requiredIntegrations: ['CRM', 'Email Provider'],
    estimatedSetupTime: '30 minutes'
  },
  'outbound-list-builder': {
    name: 'B2B Contact Intelligence Engine',
    description: 'Build & enrich a living outbound list of verified decision-makers',
    category: 'Lead Generation',
    version: '1.0.0',
    features: ['Lead Generation', 'ICP Scoring', 'CRM Export'],
    requiredIntegrations: ['CRM'],
    estimatedSetupTime: '15 minutes'
  },
  'ai-email-sales-agency': {
    name: 'AI Email Outbound Engine',
    description: 'Automated multi-step cold email sequences personalised at scale',
    category: 'Email Outbound',
    version: '1.0.0',
    features: ['Email Campaigns', 'AI Personalisation', 'Reply Handling'],
    requiredIntegrations: ['Email Provider'],
    estimatedSetupTime: '20 minutes'
  },
  'brand-voice-social': {
    name: 'Brand Voice & Thought Leadership',
    description: 'AI-generated LinkedIn posts and newsletter content tailored to your brand',
    category: 'Content',
    version: '1.0.0',
    features: ['4 LinkedIn Posts/Month', 'Monthly Newsletter', 'Brand Voice Matching', 'Approve & Revise Workflow'],
    requiredIntegrations: [],
    estimatedSetupTime: '10 minutes',
  },
};

// Dynamic Component Loader
export const getProjectComponent = (slug) => {
  const normalizedSlug = slug?.toLowerCase();
  return PROJECT_COMPONENTS[normalizedSlug] || null;
};

// Dynamic Sidebar Loader
export const getProjectSidebar = (slug) => {
  const normalizedSlug = slug?.toLowerCase();
  return PROJECT_SIDEBARS[normalizedSlug] || null;
};

// Get Project Info
export const getProjectMetadata = (slug) => {
  const normalizedSlug = slug?.toLowerCase();
  return PROJECT_METADATA[normalizedSlug] || null;
};

// Check if project exists
export const projectExists = (slug) => {
  const normalizedSlug = slug?.toLowerCase();
  return PROJECT_COMPONENTS.hasOwnProperty(normalizedSlug);
};

// Get all available projects
export const getAllProjects = () => {
  return Object.keys(PROJECT_COMPONENTS).map(slug => ({
    slug,
    component: PROJECT_COMPONENTS[slug],
    sidebar: PROJECT_SIDEBARS[slug],
    metadata: PROJECT_METADATA[slug]
  }));
};

export default PROJECT_COMPONENTS;
