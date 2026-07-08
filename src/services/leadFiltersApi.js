// Lead filter lookups — regions / segments / seniority.
// Same pattern as getIndustries: populate the agent's refinement chips dynamically.
// IMPORTANT: always send the lowercase value (region_name / segment_name / level_name)
// to /leads/generate — never the display_name (which is for UI only).

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const fetchJson = async (path) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Failed to fetch ${path}`);
  }
  return data.data || [];
};

// → [{ region_name, display_name }]
export const getRegions = () => fetchJson('/leads/filters/regions');

// → [{ segment_name, display_name, min_employees, max_employees }]
export const getSegments = () => fetchJson('/leads/filters/segments');

// → [{ level_name, display_name }]
export const getSeniority = () => fetchJson('/leads/filters/seniority');

export default { getRegions, getSegments, getSeniority };
