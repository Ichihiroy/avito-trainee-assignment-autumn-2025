import axios from "axios";
import type {
  Advertisement,
  AdsListResponse,
  AdsListParams,
  RejectAdPayload,
  RequestChangesPayload,
  StatsSummary,
  ActivityData,
  DecisionsData,
  Moderator,
  StatsParams,
} from "../types/api";

const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Ads endpoints
export const adsApi = {
  getAds: (params?: AdsListParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(key, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    return api.get<AdsListResponse>(`/ads?${queryParams.toString()}`);
  },

  getAdById: (id: number) => {
    return api.get<Advertisement>(`/ads/${id}`);
  },

  approveAd: (id: number) => {
    return api.post<{ message: string; ad: Advertisement }>(
      `/ads/${id}/approve`
    );
  },

  rejectAd: (id: number, payload: RejectAdPayload) => {
    return api.post<{ message: string; ad: Advertisement }>(
      `/ads/${id}/reject`,
      payload
    );
  },

  requestChanges: (id: number, payload: RequestChangesPayload) => {
    return api.post<{ message: string; ad: Advertisement }>(
      `/ads/${id}/request-changes`,
      payload
    );
  },
};

// Stats endpoints
export const statsApi = {
  getSummary: (params?: StatsParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    return api.get<StatsSummary>(`/stats/summary?${queryParams.toString()}`);
  },

  getActivityChart: (params?: StatsParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    return api.get<ActivityData[]>(
      `/stats/chart/activity?${queryParams.toString()}`
    );
  },

  getDecisionsChart: (params?: StatsParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    return api.get<DecisionsData>(
      `/stats/chart/decisions?${queryParams.toString()}`
    );
  },

  getCategoriesChart: (params?: StatsParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    return api.get<Record<string, number>>(
      `/stats/chart/categories?${queryParams.toString()}`
    );
  },
};

// Moderator endpoints
export const moderatorApi = {
  getMe: () => {
    return api.get<Moderator>("/moderators/me");
  },
};

export default api;
