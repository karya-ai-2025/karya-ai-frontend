// Dynamic Project Components Registry
import HotLeadInBox, { SideLeftBar as HotLeadSidebar } from './HotLeadInBox';

// Project Registry - Add new projects here
export const PROJECT_COMPONENTS = {
  'hotlead-in-a-box': HotLeadInBox,
};

// Project Sidebar Registry
export const PROJECT_SIDEBARS = {
  'hotlead-in-a-box': HotLeadSidebar,
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
