export type OperationType = "sale" | "rent" | "both";
export type PropertyStatus = "draft" | "active" | "pending" | "sold" | "rented";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  brandColor?: string;
}

export interface AgentProfile {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  title?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
}

export interface Property {
  id: string;
  workspaceId: string;
  agentId?: string;
  title: string;
  slug: string;
  status: PropertyStatus;
  operationType: OperationType;
  location: string;
  price?: number;
  currency?: string;
  featured?: boolean;
}

export interface Lead {
  id: string;
  workspaceId: string;
  propertyId?: string;
  agentId?: string;
  name: string;
  phone?: string;
  email?: string;
  source: string;
  stage: string;
}
