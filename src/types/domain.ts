export type OperationType = "sale" | "rent" | "both";
export type PropertyStatus =
  | "draft"
  | "active"
  | "pending"
  | "sold"
  | "rented"
  | "archived";
export type PropertyType =
  | "house"
  | "apartment"
  | "land"
  | "office"
  | "commercial"
  | "warehouse"
  | "building"
  | "development"
  | "mixed_use";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  legalName?: string | null;
  brandName?: string | null;
  brandPrimaryColor?: string | null;
  brandAccentColor?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceRole = "owner" | "admin" | "agent" | "staff";

export interface Profile {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  defaultWorkspaceId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  profileId: string;
  role: WorkspaceRole;
  isActive: boolean;
  invitedBy?: string | null;
  joinedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  workspaceId: string;
  profileId?: string | null;
  slug: string;
  displayName: string;
  title?: string | null;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  avatarUrl?: string | null;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  workspaceId: string;
  agentId?: string | null;
  title: string;
  slug: string;
  publicCode?: string | null;
  description?: string | null;
  propertyType: PropertyType;
  status: PropertyStatus;
  operationType: OperationType;
  isFeatured: boolean;
  locationLabel: string;
  addressLine?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  countryCode: string;
  priceAmount?: number | null;
  currencyCode: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpots?: number | null;
  lotAreaM2?: number | null;
  constructionAreaM2?: number | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  workspaceId: string;
  propertyId: string;
  storageBucket: string;
  storagePath: string;
  altText?: string | null;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
  updatedAt: string;
}
