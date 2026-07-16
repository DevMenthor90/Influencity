// AUTH
export interface AuthResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface User {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

// DEALS
export type ContentType = 'TikTokPost' | 'InstagramReel' | 'InstagramStory' | 'YouTubeVideo';
export type Currency = 'COP' | 'USD';
export type DealStatus = 'Confirmado' | 'Publicado' | 'Cancelado';

export interface Deal {
  id: string;
  dealNumber: number;
  creatorName: string;
  clientName: string;
  campaignName: string;
  contentType: ContentType;
  currency: Currency;
  totalValue: number;
  creatorPayment: number;
  commission: number;
  status: DealStatus;
  publicationLink?: string;
  publicationDate?: string;
  notes?: string;
  approvedToBill: boolean;
  creatorPaymentReceived: boolean;
  creatorPaymentDate?: string;
  commissionReceived: boolean;
  commissionReceivedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealRequest {
  creatorName: string;
  clientName: string;
  campaignName: string;
  contentType: ContentType;
  currency: Currency;
  totalValue: number;
}

export interface UpdateDealRequest {
  creatorName?: string;
  clientName?: string;
  campaignName?: string;
  contentType?: string;
  currency?: string;
  totalValue?: number;
  status?: string;
  publicationLink?: string;
  publicationDate?: string;
  notes?: string;
  approvedToBill?: boolean;
  creatorPaymentReceived?: boolean;
  creatorPaymentDate?: string;
  commissionReceived?: boolean;
  commissionReceivedDate?: string;
}

export interface DealFilters {
  campaignName?: string;
  creatorName?: string;
  clientName?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardData {
  totalActiveDeals: number;
  totalValueThisMonth: number;
  totalCommissionsThisMonth: number;
  pendingCommissions: number;
  totalPublishedDeals: number;
  totalCancelledDeals: number;
  dealsWithoutLink: number;
  pendingApprovalToBill: number;
  pendingCommissionCount: number;
}
