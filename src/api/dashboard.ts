import axios from 'axios';

export interface DashboardOverview {
  totalUsers: number;
  totalBusinesses: number;
  totalReports: number;
  activeUsers: number;
  verifiedBusinesses: number;
}

export interface DashboardPending {
  reports: number;
  aadhaarVerifications: number;
  businessVerifications: number;
}

export interface DashboardRecent {
  newUsers: number;
  newBusinesses: number;
  newReports: number;
}

export interface DashboardStats {
  overview: DashboardOverview;
  pending: DashboardPending;
  recent: DashboardRecent;
}

export interface DashboardResponse {
  statusCode: number;
  data: DashboardStats;
  message: string;
  success: boolean;
}

class DashboardAPI {
  private getAuthHeaders() {
    if (typeof window !== 'undefined') {
      const adminAccessToken = localStorage.getItem('adminAccessToken');
      if (adminAccessToken) {
        return {
          'Authorization': `Bearer ${adminAccessToken}`,
          'Content-Type': 'application/json',
        };
      }
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  async getDashboardStats(): Promise<DashboardResponse> {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/dashboard/stats`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch dashboard stats';
      throw new Error(message);
    }
  }
}

export const dashboardAPI = new DashboardAPI();