export type AgentOption = {
  id: string;
  display_name: string;
  slug: string;
  profile_id?: string | null;
  title?: string | null;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  avatar_url?: string | null;
  is_public?: boolean;
};

export type PropertyLeadInterestRecord = {
  lead_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  status: string;
  created_at: string;
  message: string | null;
  internal_note: string | null;
};

export type PropertyRecord = {
  id: string;
  title: string;
  slug: string;
  property_type: string;
  status: string;
  operation_type: string;
  location_label: string;
  city: string | null;
  state: string | null;
  price_amount: number | null;
  currency_code: string;
  public_code: string | null;
  description?: string | null;
  address_line?: string | null;
  neighborhood?: string | null;
  country_code?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spots?: number | null;
  lot_area_m2?: number | null;
  construction_area_m2?: number | null;
  is_featured: boolean;
  created_by?: string | null;
  agent_id: string | null;
  property_images: Array<{
    id: string;
    workspace_id: string;
    property_id: string;
    storage_bucket: string;
    storage_path: string;
    alt_text: string | null;
    sort_order: number;
    is_cover: boolean;
    created_at: string;
    updated_at: string;
  }>;
  agents?: { id: string; display_name: string } | { id: string; display_name: string }[] | null;
  lead_interests?: PropertyLeadInterestRecord[];
};

export type TeamMemberRecord = {
  membership_id: string;
  profile_id: string;
  workspace_role: string;
  is_active: boolean;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  joined_at: string | null;
  agent_profile: {
    id: string;
    display_name: string;
    slug: string;
    title: string | null;
    bio: string | null;
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    avatar_url: string | null;
    is_public: boolean;
    is_active: boolean;
  } | null;
};

export type StandaloneAgentRecord = {
  id: string;
  display_name: string;
  slug: string;
  title: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  is_public: boolean;
  is_active: boolean;
  profile_id: string | null;
};
