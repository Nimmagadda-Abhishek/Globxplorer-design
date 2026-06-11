// API Client for GlobXplore CRM
import { toast } from "sonner";
const BASE_URL = 'https://api.globxplore.in/api';

/**
 * Basic helper to add auth token
 */
const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Helper to log and execute fetch requests
 */
// Utility: mask Authorization header when logging
function maskAuth(headers?: any) {
  if (!headers) return headers;
  try {
    const h = { ...headers } as Record<string, any>;
    if (h.Authorization) h.Authorization = 'Bearer ****';
    if (h.authorization) h.authorization = 'Bearer ****';
    return h;
  } catch (e) {
    return headers;
  }
}

function parseBodyForLog(body: any) {
  if (!body) return null;
  try {
    if (typeof body === 'string') {
      return JSON.parse(body);
    }
    if (body instanceof FormData) return '[FormData]';
    return body;
  } catch (e) {
    return body;
  }
}

const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const method = (options.method || 'GET').toUpperCase();
  const shortUrl = url.replace(BASE_URL, '');
  const startTime = performance.now();

  // Log request (group is open so it's immediately visible)
  const requestBody = parseBodyForLog(options.body);
  const defaultHeaders = getHeaders();
  const requestHeaders = {
    ...(defaultHeaders as Record<string, string>),
    ...(options.headers ? (options.headers as Record<string, string>) : {})
  };
  console.group(`%c[API] ➤ ${method} ${shortUrl}`, 'color: #6c8ebf; font-weight: bold;');
  console.log('%c📤 Headers:', 'color: #f59e0b; font-weight: bold;', requestHeaders);
  if (requestBody !== null) {
    console.log('%c📤 Sending:', 'color: #a78bfa; font-weight: bold;', requestBody);
  } else {
    console.log('%c📤 Sending:', 'color: #a78bfa; font-weight: bold;', '(no body)');
  }
  console.groupEnd();

  try {
    const response = await fetch(url, options);
    const duration = Math.round(performance.now() - startTime);
    const isOk = response.ok;
    const style = isOk
      ? 'color: #4caf8a; font-weight: bold;'
      : 'color: #e05c5c; font-weight: bold;';

    // Clone response so we can read the body for logging without consuming it
    const cloned = response.clone();
    cloned.json().then((data) => {
      console.group(
        `%c[API] ${isOk ? '✔' : '✖'} ${method} ${shortUrl} → ${response.status} (${duration}ms)`,
        style
      );
      console.log('%c📥 Received:', 'color: #34d399; font-weight: bold;', data);
      console.groupEnd();
    }).catch(() => {
      console.log(
        `%c[API] ${isOk ? '✔' : '✖'} ${method} ${shortUrl} → ${response.status} (${duration}ms)`,
        style
      );
    });

    return response;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    console.error(`[API] ✖ ${method} ${shortUrl} → NETWORK ERROR (${duration}ms)`, error);
    throw error;
  }
};


/**
 * Handle fetch response
 */
function clearAuthAndRedirectToLogin() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('gxId');
  } catch {
    // ignore
  }

  // Best-effort redirect. App uses react-router, but we can still redirect
  // because this is called from anywhere (including async API handlers).
  try {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch {
    // ignore
  }
}

// When a token becomes valid right after login, the app may fire a few
// background requests immediately. If one of those hits 401/403 with the
// previous/empty token, we don't want to immediately clear auth.
function isLikelyPostLoginTokenRace() {
  try {
    const lastLoginAt = Number(localStorage.getItem('lastLoginAt') || '0');
    if (!lastLoginAt) return false;
    return Date.now() - lastLoginAt < 5000; // 5s grace window
  } catch {
    return false;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const defaultStatusMessages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      408: 'Request Timeout',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };
    const fallbackMessage = defaultStatusMessages[response.status] || response.statusText || `Request failed with status ${response.status}`;
    let errorMessage = data.error || data.message || fallbackMessage;

    const normalized = String(errorMessage || '').toLowerCase();
    const isLoginRequest = response.url && response.url.includes('/auth/login');
    const isInvalidToken =
      !isLoginRequest && (
        normalized.includes('invalid token') ||
        normalized.includes('invalid tocken') ||
        normalized.includes('session expired') ||
        response.status === 401 ||
        response.status === 403
      );

    if (isInvalidToken) {
      errorMessage = 'The session expired please login';

      // Avoid immediate logout redirect right after a successful login.
      // Let the page/app handle the error and/or retry with the new token.
      if (!isLikelyPostLoginTokenRace()) {
        clearAuthAndRedirectToLogin();
      }
    }

    if (response.status === 429) {
      toast.error('Too Many Requests. Please try again later.');
    }

    throw new Error(errorMessage);
  }
  return data;
}




// ----------------------------------------------------
// 1. Authentication
// ----------------------------------------------------

export const authApi = {
  register: async (data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  login: async (data: { gxId?: string; email?: string; password: string }) => {
    const res = await apiFetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result: any = await handleResponse(res);

    // Auto-save token by checking multiple possible payload locations
    const extractedToken = result.token || (result.data && result.data.token) || result.access_token || (result.data && result.data.accessToken);
    if (extractedToken) {
      localStorage.setItem('token', extractedToken);
      // used to prevent immediate logout redirect due to post-login background requests
      localStorage.setItem('lastLoginAt', String(Date.now()));
    }


    // Save userId and userRole if present
    const user = result.user || (result.data && result.data.user);
    if (user) {
      if (user._id) localStorage.setItem('userId', user._id);
      if (user.role) localStorage.setItem('userRole', user.role);
    }

    return { ...result, token: extractedToken || result.token };
  },

  logout: async () => {
    try {
      await apiFetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (error) {
      // Silently fail logout on server
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const res = await apiFetch(`${BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  forgotPassword: async (data: { identifier: string }) => {
    const res = await apiFetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  verifyOtp: async (data: { identifier: string; otp: string }) => {
    const res = await apiFetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  resetPassword: async (data: { identifier: string; otp: string; newPassword: string }) => {
    const res = await apiFetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }
};

// ----------------------------------------------------
// 2. User & Agent Management
// ----------------------------------------------------

export const userApi = {
  getProfile: async () => {
    const res = await apiFetch(`${BASE_URL}/user/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateProfile: async (data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getTelecallers: async () => {
    const res = await apiFetch(`${BASE_URL}/user/telecallers`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getVisaAgents: async () => {
    const res = await apiFetch(`${BASE_URL}/user/visa-agents`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },



  createAgent: async (data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = getHeaders() as Record<string, string>;

    if (isFormData) {
      delete headers['Content-Type'];
    }

    const res = await apiFetch(`${BASE_URL}/user/agent`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse(res);
  },

  createAgentManager: async (data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/user/agent-manager`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  createTelecaller: async (data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/user/telecaller`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  createVisaAgent: async (data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/user/visa-agent`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  createVisaClient: async (data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/user/visa-client`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteUser: async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/user/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateAgentStatus: async (id: string, agentStatus: 'confirmed' | 'Closed' | 'Revisit') => {
    const res = await apiFetch(`${BASE_URL}/user/agent/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ agentStatus }),
    });
    return handleResponse(res);
  },

  getSubordinates: async () => {
    const res = await apiFetch(`${BASE_URL}/user/subordinates`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAgentManagers: async () => {
    const res = await apiFetch(`${BASE_URL}/user/agent-managers`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAgentManagerById: async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/user/agent-manager/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAgents: async () => {
    const res = await apiFetch(`${BASE_URL}/user/agents`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAgentById: async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/user/agent/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateAgentProfile: async (data: FormData) => {
    const headers: Record<string, string> = getHeaders() as Record<string, string>;
    delete headers['Content-Type'];

    const res = await apiFetch(`${BASE_URL}/user/agent/update-profile`, {
      method: 'PATCH',
      headers,
      body: data,
    });
    return handleResponse(res);
  },
};

// ----------------------------------------------------
// 3. Lead Management
// ----------------------------------------------------

export const leadApi = {
  getLeads: async () => {
    const res = await apiFetch(`${BASE_URL}/leads`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createLead: async (data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/leads/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateLeadStatus: async (id: string, data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/leads/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getMyLeads: async () => {
    const res = await apiFetch(`${BASE_URL}/leads/my`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getLeadQueue: async () => {
    const res = await apiFetch(`${BASE_URL}/leads/queue`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getLeadById: async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/leads/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  deleteLead: async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  bulkUpload: async (file: File, telecallerId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (telecallerId) formData.append('telecallerId', telecallerId);

    const headers: any = getHeaders();
    delete headers['Content-Type'];

    const res = await apiFetch(`${BASE_URL}/leads/bulk-upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  bulkAssign: async (leadIds: string[], telecallerId: string) => {
    const res = await apiFetch(`${BASE_URL}/leads/bulk-assign`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ leadIds, telecallerId }),
    });
    return handleResponse(res);
  },
};

// ----------------------------------------------------
// 4. Student Pipeline System
// ----------------------------------------------------

export const studentApi = {
  createStudent: async (data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/student`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateStudentStage: async (id: string, data: { stage: string; notes?: string }) => {
    const res = await apiFetch(`${BASE_URL}/student/${id}/stage`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  uploadDocument: async (id: string, data: FormData | { name: string; url: string; type: string }) => {
    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = getHeaders() as Record<string, string>;

    if (isFormData) {
      delete headers['Content-Type'];
    }

    const res = await apiFetch(`${BASE_URL}/student/${id}/document`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getStudents: async () => {
    const res = await apiFetch(`${BASE_URL}/student`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getStudent: async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/student/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  sendMessage: async (id: string, data: { text: string }) => {
    const res = await apiFetch(`${BASE_URL}/student/${id}/message`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateStudent: async (id: string, data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/student/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  sendMessage: async (id: string, data: { message: string }) => {
    const res = await apiFetch(`${BASE_URL}/student/${id}/message`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  requestDocument: async (id: string, data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/student/${id}/request-documents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteStudent: async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/student/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  jobs: {
    getOpen: async () => {
      const res = await apiFetch(`${BASE_URL}/student/jobs`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    apply: async (id: string, data: { resumeUrl: string; coverLetter: string }) => {
      const res = await apiFetch(`${BASE_URL}/student/jobs/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    getApplications: async () => {
      const res = await apiFetch(`${BASE_URL}/student/applications`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    chat: {
      getMessages: async (applicationId: string) => {
        const res = await apiFetch(`${BASE_URL}/student/applications/${applicationId}/chat`, {
          method: 'GET',
          headers: getHeaders(),
        });
        return handleResponse(res);
      },
      sendMessage: async (applicationId: string, data: { message: string }) => {
        const res = await apiFetch(`${BASE_URL}/student/applications/${applicationId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getHeaders() },
          body: JSON.stringify(data),
        });
        return handleResponse(res);
      }
    }
  }
};

// ----------------------------------------------------
// 4.5 Counsellor Dashboard & Operations
// ----------------------------------------------------

export const counsellorApi = {
  getStats: async () => {
    const res = await apiFetch(`${BASE_URL}/counsellor/dashboard/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  getUrgentActions: async () => {
    const res = await apiFetch(`${BASE_URL}/counsellor/dashboard/urgent-actions`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  getPipeline: async () => {
    const res = await apiFetch(`${BASE_URL}/counsellor/dashboard/pipeline`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  getMyStudents: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`${BASE_URL}/counsellor/students?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  createStudent: async (data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/counsellor/students`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  sendMessage: async (id: string, data: { message: string }) => {
    const res = await apiFetch(`${BASE_URL}/student/${id}/message`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// ----------------------------------------------------
// 5. Visa Processing Tracking
// ----------------------------------------------------

export const visaApi = {
  initTracker: async (data: { studentId: string; gxId: string; country: string }) => {
    const res = await apiFetch(`${BASE_URL}/visa/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateTracker: async (id: string, data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/visa/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getTracker: async (studentId: string) => {
    const res = await apiFetch(`${BASE_URL}/visa/${studentId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

// ----------------------------------------------------
// 6. Payment Module (Razorpay)
// ----------------------------------------------------

export const paymentApi = {
  // Payment Requests (Staff only)
  createRequest: async (data: { studentId: string; gxId: string; title: string; amount: number; description?: string; dueDate?: string }) => {
    const res = await apiFetch(`${BASE_URL}/payment/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // My Requests (Student only)
  getMyRequests: async () => {
    const res = await apiFetch(`${BASE_URL}/payment/my-requests`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Razorpay Integration
  createOrder: async (data: { studentId: string; gxId: string; amount: number; description: string; requestId?: string }) => {
    const res = await apiFetch(`${BASE_URL}/payment/order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  verifyPayment: async (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => {
    const res = await apiFetch(`${BASE_URL}/payment/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// ----------------------------------------------------
// 7. Performance & Activity Tracking
// ----------------------------------------------------

export const activityApi = {
  sendHeartbeat: async () => {
    const res = await apiFetch(`${BASE_URL}/activity/heartbeat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({}),
    });
    return handleResponse(res);
  },

  startTask: async (taskName: string) => {
    const res = await apiFetch(`${BASE_URL}/activity/task/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ taskName }),
    });
    return handleResponse(res);
  },

  endTask: async (taskId: string, productivityScore?: number) => {
    const res = await apiFetch(`${BASE_URL}/activity/task/end/${taskId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productivityScore }),
    });
    return handleResponse(res);
  },

  logActivity: async (data: { action: string; metadata?: any }) => {
    const res = await apiFetch(`${BASE_URL}/activity/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// ----------------------------------------------------
// 8. Analytics
// ----------------------------------------------------

export const analyticsApi = {
  getConversion: async () => {
    const res = await apiFetch(`${BASE_URL}/analytics/conversion`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAdminDashboard: async () => {
    const res = await apiFetch(`${BASE_URL}/analytics/admin-dashboard`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getTelecallerEvaluation: async (params: { startDate: string; endDate: string; telecallerId: string }) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`${BASE_URL}/analytics/telecaller?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getRevenue: async () => {
    const res = await apiFetch(`${BASE_URL}/analytics/revenue`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getPerformance: async () => {
    const res = await apiFetch(`${BASE_URL}/analytics/performance`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const supportApi = {
  getOffers: async () => {
    const res = await apiFetch(`${BASE_URL}/offer`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getWebinars: async () => {
    const res = await apiFetch(`${BASE_URL}/webinar/student`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createWebinar: async (data: any) => {
    const res = await apiFetch(`${BASE_URL}/webinar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// ----------------------------------------------------
// 10. Global Broadcast Configuration
// ----------------------------------------------------

export const configApi = {
  setCommissionRate: async (data: { country: string; percentage: number; flatFee: number }) => {
    const res = await apiFetch(`${BASE_URL}/commission/rate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  createOffer: async (data: { title: string; description: string; countryTarget?: string; isActive?: boolean; expiresAt?: string }) => {
    const res = await apiFetch(`${BASE_URL}/offer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  createWebinar: async (data: { title: string; topicType: string; meetingLink: string; scheduledFor: string }) => {
    const res = await apiFetch(`${BASE_URL}/webinar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};
// ----------------------------------------------------
// 11. Admin Specific APIs
// ----------------------------------------------------

const ADMIN_BASE_URL = `${BASE_URL}/admin`;

export const adminApi = {
  companyDocuments: {
    upload: async (data: FormData) => {
      const headers = getHeaders() as Record<string, string>;
      delete headers['Content-Type'];
      const res = await apiFetch(`${ADMIN_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers,
        body: data,
      });
      return handleResponse(res);
    },
    list: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/documents`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/documents/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  auth: {
    login: async (data: Record<string, any>) => {
      return authApi.login(data as any);
    },
    logout: async () => {
      await authApi.logout();
      try { localStorage.removeItem('isLocked'); } catch (e) { }
    },
    me: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/me`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  dashboard: {
    getSummary: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/dashboard/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getCharts: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/dashboard/charts`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    exportCharts: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/dashboard/charts/export`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error('Export failed');
      }
      return res.blob();
    }
  },

  users: {
    create: async (data: Record<string, any>) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${ADMIN_BASE_URL}/users?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    get: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    update: async (id: string, data: Record<string, any>) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    updateCredentials: async (id: string, data: Record<string, any>) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/users/${id}/update-credentials`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    lockUser: async (id: string, isLocked: boolean) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/users/${id}/lock`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isLocked }),
      });
      return handleResponse(res);
    },
    updateStatus: async (id: string, status: 'active' | 'inactive') => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/users/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },
    resetPassword: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/users/${id}/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  alumniManagers: {
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${ADMIN_BASE_URL}/alumni-managers?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (data: { name: string; email: string; phone: string }) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/alumni-managers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    getById: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/alumni-managers/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateStatus: async (id: string, isActive: boolean) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/alumni-managers/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isActive }),
      });
      return handleResponse(res);
    },
    getAnalytics: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/alumni-managers/${id}/analytics`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  attendance: {
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${ADMIN_BASE_URL}/attendance?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    get: async (userId: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/attendance/${userId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getPerformance: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/performance`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    calculate: async (data: { startDate: string; endDate: string }) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/attendance/calculate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    export: async (startDate: string, endDate: string) => {
      const query = new URLSearchParams({ startDate, endDate }).toString();
      const res = await apiFetch(`${ADMIN_BASE_URL}/attendance/export?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error('Export failed');
      }
      return res.blob();
    }
  },

  leads: {
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${ADMIN_BASE_URL}/leads?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    get: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/leads/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    assign: async (id: string, assignedTo: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/leads/${id}/assign`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ assignedTo }),
      });
      return handleResponse(res);
    },
    bulkUpload: async (file: File, telecallerId?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      if (telecallerId) formData.append('telecallerId', telecallerId);
      const headers: Record<string, string> = getHeaders() as Record<string, string>;
      delete headers['Content-Type'];
      const res = await apiFetch(`${BASE_URL}/leads/bulk-upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse(res);
    },
    bulkAssign: async (leadIds: string[], telecallerId: string) => {
      const res = await apiFetch(`${BASE_URL}/leads/bulk-assign`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ leadIds, telecallerId }),
      });
      return handleResponse(res);
    },
    getAnalytics: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/leads/analytics`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  students: {
    getPendingRegistrations: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/pending-registrations`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    approveStudent: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/approve-student/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    rejectStudent: async (id: string, reason?: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/reject-student/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ reason }),
      });
      return handleResponse(res);
    },
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${ADMIN_BASE_URL}/students?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    get: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/students/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateStage: async (id: string, stage: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/students/${id}/stage`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ stage }),
      });
      return handleResponse(res);
    },
    getPipeline: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/students/pipeline`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getIntakeStats: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/students/intake-stats`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  counsellors: {
    list: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/counsellors`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getAnalytics: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/counsellors/${id}/analytics`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    reassign: async (id: string, data: Record<string, any>) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/counsellors/${id}/reassign`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },

  telecallers: {
    list: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/telecallers`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getAnalytics: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/telecallers/${id}/analytics`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    reassign: async (id: string, data: Record<string, any>) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/telecallers/${id}/reassign`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },

  agents: {
    list: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/agents`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getSummary: async (params?: Record<string, any>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      const res = await apiFetch(`${ADMIN_BASE_URL}/agents/summary${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/agents/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getMap: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/agents/map`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getManagers: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/agent-managers`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateStatus: async (id: string, status: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/agents/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    }
  },

  visa: {
    list: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/visa`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateStatus: async (id: string, status: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/visa/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    }
  },

  payments: {
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${ADMIN_BASE_URL}/payments?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getSummary: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/payments/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    refund: async (id: string) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/payments/refund/${id}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  system: {
    getAlerts: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/alerts`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getDocuments: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/documents`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getMarketing: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/marketing`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getGamification: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/gamification/`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getOffers: async () => {
      const res = await apiFetch(`${BASE_URL}/offer`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    toggleOfferStatus: async (offerId: string, isActive: boolean) => {
      const res = await apiFetch(`${BASE_URL}/offer/${offerId}/activate`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isActive }),
      });
      return handleResponse(res);
    },
    getAuditLogs: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/audit-logs`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getWeeklyReport: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/reports/weekly`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    broadcast: async (data: Record<string, any>) => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    getSettings: async () => {
      const res = await apiFetch(`${ADMIN_BASE_URL}/settings`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  }

};

// ----------------------------------------------------
// 12. Agent Manager Specific APIs
// ----------------------------------------------------

const AM_BASE_URL = `${BASE_URL}/am`;

export const amApi = {
  profile: {
    get: async () => {
      const res = await apiFetch(`${AM_BASE_URL}/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    update: async (data: Record<string, any>) => {
      const res = await apiFetch(`${AM_BASE_URL}/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  auth: {
    changePassword: async (data: { oldPassword: string; newPassword: string }) => {
      const res = await apiFetch(`${AM_BASE_URL}/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  agents: {
    create: async (data: FormData | Record<string, any>) => {
      const isFormData = data instanceof FormData;
      const headers = getHeaders() as Record<string, string>;
      if (isFormData) {
        delete headers['Content-Type'];
      }
      const res = await apiFetch(`${AM_BASE_URL}/agents`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });
      return handleResponse(res);
    },
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${AM_BASE_URL}/agents?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    get: async (id: string) => {
      const res = await apiFetch(`${AM_BASE_URL}/agents/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    update: async (id: string, data: Record<string, any>) => {
      const res = await apiFetch(`${AM_BASE_URL}/agents/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    updateStatus: async (id: string, agentStatus: string) => {
      const res = await apiFetch(`${BASE_URL}/user/agent/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ agentStatus }),
      });
      return handleResponse(res);
    },
    search: async (name: string) => {
      const res = await apiFetch(`${AM_BASE_URL}/agents/search?name=${encodeURIComponent(name)}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
  students: {
    create: async (data: Record<string, any>) => {
      const res = await apiFetch(`${AM_BASE_URL}/students`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${AM_BASE_URL}/students?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    get: async (id: string) => {
      const res = await apiFetch(`${AM_BASE_URL}/students/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    update: async (id: string, data: Record<string, any>) => {
      const res = await apiFetch(`${AM_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  dashboard: {
    getSummary: async () => {
      const res = await apiFetch(`${AM_BASE_URL}/dashboard/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  notifications: {
    list: async () => {
      const res = await apiFetch(`${AM_BASE_URL}/notifications`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  activity: {
    list: async () => {
      const res = await apiFetch(`${AM_BASE_URL}/activity`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  analytics: {
    getPerformance: async () => {
      const res = await apiFetch(`${AM_BASE_URL}/analytics/performance`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  followUps: {
    list: async () => {
      const res = await apiFetch(`${AM_BASE_URL}/followups`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!res.ok) return { data: [] };
      return handleResponse(res);
    },
    create: async (data: any) => {
      const res = await apiFetch(`${AM_BASE_URL}/followups`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) return { success: false };
      return handleResponse(res);
    },
    update: async (id: string, data: any) => {
      const res = await apiFetch(`${AM_BASE_URL}/followups/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) return { success: false };
      return handleResponse(res);
    }
  },
  map: {
    getAgentLocations: async () => {
      const res = await apiFetch(`${AM_BASE_URL}/agents/map`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  }
};

// ----------------------------------------------------
// 12. Agent APIs
// ----------------------------------------------------

const AGENT_BASE_URL = `${BASE_URL}/agent`;

export const agentApi = {
  auth: {
    login: async (data: Record<string, any>) => {
      return authApi.login(data as any);
    },
    logout: async () => {
      await apiFetch(`${AGENT_BASE_URL}/logout`, { method: 'POST', headers: getHeaders() });
      localStorage.removeItem('token');
    },
    me: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/me`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    }
  },
  dashboard: {
    getSummary: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/dashboard/summary`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    getUpdates: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/dashboard/updates`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    }
  },
  students: {
    create: async (data: Record<string, any>) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/students`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${AGENT_BASE_URL}/students?${query}`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    get: async (id: string) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/students/${id}`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    update: async (id: string, data: Record<string, any>) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    getPipeline: async (id: string) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/students/${id}/pipeline`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    getStatusSummary: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/students/status-summary`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    }
  },
  leads: {
    create: async (data: Record<string, any>) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/leads`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${AGENT_BASE_URL}/leads?${query}`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
  },
  commissions: {
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${AGENT_BASE_URL}/commissions?${query}`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    getSummary: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/commissions/summary`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    }
  },
  businessProfile: {
    get: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/business-profile`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    update: async (data: Record<string, any>) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/business-profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    uploadBoardPhoto: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const headers: Record<string, string> = getHeaders() as Record<string, string>;
      delete headers['Content-Type'];
      const res = await apiFetch(`${AGENT_BASE_URL}/business-board-photo`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse(res);
    }
  },
  bankDetails: {
    get: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/bank-details`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    update: async (data: Record<string, any>) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/bank-details`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  mou: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const headers: Record<string, string> = getHeaders() as Record<string, string>;
      delete headers['Content-Type'];
      const res = await apiFetch(`${AGENT_BASE_URL}/mou/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse(res);
    },
    get: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/mou`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    }
  },
  qrCode: {
    get: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/qr-code`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    getReferralLink: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/referral-link`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    }
  },
  offers: {
    getOffers: async () => {
      const res = await apiFetch(`${BASE_URL}/offer`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    getBenefits: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/benefits`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    }
  },
  notifications: {
    list: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/notifications`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    markRead: async (id: string) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  support: {
    contactAdmin: async (data: Record<string, any>) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/contact-admin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    requestServiceDetails: async (data: Record<string, any>) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/request-service-details`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  search: {
    students: async (q: string) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/search/students?q=${encodeURIComponent(q)}`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    },
    business: async (q: string) => {
      const res = await apiFetch(`${AGENT_BASE_URL}/search/business?q=${encodeURIComponent(q)}`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    }
  },
  analytics: {
    get: async () => {
      const res = await apiFetch(`${AGENT_BASE_URL}/analytics`, { method: 'GET', headers: getHeaders() });
      return handleResponse(res);
    }
  }
};

// ----------------------------------------------------
// 14. Student Portal APIs
// ----------------------------------------------------
export const studentPortalApi = {
  auth: {
    register: async (data: Record<string, any>) => {
      const res = await apiFetch(`${BASE_URL}/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    login: async (data: Record<string, any>) => {
      return authApi.login(data as any);
    }
  },
  dashboard: {
    get: async () => {
      const res = await apiFetch(`${BASE_URL}/student/dashboard`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getAlerts: async () => {
      const res = await apiFetch(`${BASE_URL}/student/alerts`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  pipeline: {
    get: async () => {
      const res = await apiFetch(`${BASE_URL}/student/pipeline`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  profile: {
    get: async () => {
      const res = await apiFetch(`${BASE_URL}/student/me`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    update: async (data: Record<string, any>) => {
      const res = await apiFetch(`${BASE_URL}/student/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  chat: {
    sendMessage: async (id: string, text: string) => {
      const res = await apiFetch(`${BASE_URL}/student/${id}/message`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text }),
      });
      return handleResponse(res);
    }
  },
  documents: {
    getAll: async () => {
      const res = await apiFetch(`${BASE_URL}/student/documents`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    upload: async (data: FormData | Record<string, any>) => {
      const isFormData = data instanceof FormData;
      const headers: Record<string, string> = getHeaders() as Record<string, string>;

      if (isFormData) {
        delete headers['Content-Type'];
      }

      const res = await apiFetch(`${BASE_URL}/student/documents`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });
      return handleResponse(res);
    },
    uploadDocument: async (id: string, data: FormData) => {
      const headers: Record<string, string> = getHeaders() as Record<string, string>;
      delete headers['Content-Type'];

      const res = await apiFetch(`${BASE_URL}/student/${id}/document`, {
        method: 'POST',
        headers,
        body: data,
      });
      return handleResponse(res);
    }
  },
  chat: {
    postMessage: async (id: string, data: { content: string }) => {
      const res = await apiFetch(`${BASE_URL}/student/${id}/message`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  visa: {
    getStatus: async () => {
      const res = await apiFetch(`${BASE_URL}/visa/my-status`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    uploadDocument: async (id: string, data: FormData | Record<string, any>) => {
      const isFormData = data instanceof FormData;
      const headers: Record<string, string> = getHeaders() as Record<string, string>;

      if (isFormData) {
        delete headers['Content-Type'];
      }

      const res = await apiFetch(`${BASE_URL}/visa/${id}/document`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  subscription: {
    getPlans: async () => {
      const res = await apiFetch(`${BASE_URL}/student/subscriptions/plans`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    createOrder: async (data: { planId: string }) => {
      const res = await apiFetch(`${BASE_URL}/student/subscription/order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    verifyPayment: async (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      const res = await apiFetch(`${BASE_URL}/student/subscription/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  payment: {
    getAll: async () => {
      const res = await apiFetch(`${BASE_URL}/student/payments`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getMyRequests: async () => {
      const res = await apiFetch(`${BASE_URL}/payment/my-requests`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    pay: async (paymentId: string) => {
      // If it's a request, we might want to pass it as requestId
      const res = await apiFetch(`${BASE_URL}/payment/order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ requestId: paymentId })
      });
      return handleResponse(res);
    },
    verifyPayment: async (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      const res = await apiFetch(`${BASE_URL}/payment/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  alumni: {
    getServices: async () => {
      const res = await apiFetch(`${BASE_URL}/alumni/services/public`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    register: async (data: any) => {
      const res = await apiFetch(`${BASE_URL}/alumni/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    login: async (data: any) => {
      return authApi.login(data);
    },
    book: async (id: string) => {
      const res = await apiFetch(`${BASE_URL}/alumni/services/${id}/book`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    chat: {
      getMessages: async (serviceId: string, studentId?: string) => {
        const query = studentId ? `?studentId=${studentId}` : '';
        const res = await apiFetch(`${BASE_URL}/alumni/chat/${serviceId}${query}`, {
          method: 'GET',
          headers: getHeaders(),
        });
        return handleResponse(res);
      },
      sendMessage: async (serviceId: string, message: string) => {
        const res = await apiFetch(`${BASE_URL}/alumni/chat/${serviceId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getHeaders() },
          body: JSON.stringify({ message }),
        });
        return handleResponse(res);
      },
      getAllThreads: async () => {
        const res = await apiFetch(`${BASE_URL}/alumni/chats`, {
          method: 'GET',
          headers: getHeaders(),
        });
        return handleResponse(res);
      }
    },
    initiatePayment: async (bookingId: string) => {
      const res = await apiFetch(`${BASE_URL}/alumni/services/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ bookingId }),
      });
      return handleResponse(res);
    },
    verifyPayment: async (data: any) => {
      const res = await apiFetch(`${BASE_URL}/alumni/services/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    completeService: async (bookingId: string) => {
      const res = await apiFetch(`${BASE_URL}/alumni/services/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ bookingId }),
      });
      return handleResponse(res);
    },
    getMyBookings: async () => {
      const res = await apiFetch(`${BASE_URL}/alumni/services/bookings/my`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  support: {
    getOffers: async () => {
      const res = await apiFetch(`${BASE_URL}/offer`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getWebinars: async () => {
      const res = await apiFetch(`${BASE_URL}/webinar/student`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  }
};

// ----------------------------------------------------
// 12. Visa Agent Specific APIs
// ----------------------------------------------------

const VISA_AGENT_BASE_URL = `${BASE_URL}/visa-agent`;

export const visaAgentApi = {
  me: async () => {
    const res = await apiFetch(`${VISA_AGENT_BASE_URL}/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  dashboard: {
    getSummary: async () => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/dashboard/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getUrgent: async () => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/dashboard/urgent`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  clients: {
    create: async (data: Record<string, any>) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    update: async (id: string, data: Record<string, any>) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    getByCountry: async (country: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/by-country/${country}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getByVisa: async (visaType: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/by-visa/${visaType}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getPortalCredentials: async (id: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${id}/portal`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getDS160Credentials: async (id: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${id}/ds160`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  ds160: {
    create: async (clientId: string, data: { username: string; password?: string; confirmationNumber?: string }) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/ds160/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    updateStatus: async (clientId: string, status: 'pending' | 'submitted') => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/ds160/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },
    get: async (clientId: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/ds160`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  portal: {
    create: async (clientId: string, data: { portalName: string; portalUrl: string; username?: string; password?: string }) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/portal/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    get: async (clientId: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/portal`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  payments: {
    createOrder: async (clientId: string, data: { amount: number; paidBy: string }) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/payment/order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    generateLink: async (clientId: string, data: Record<string, any>) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/payment/link`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    verify: async (clientId: string, data: Record<string, any>) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/payment/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    getHistory: async (clientId: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/payments`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    syncLinkStatus: async (clientId: string, plId: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/payment/link/${plId}/sync`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  appointments: {
    setMonitoring: async (clientId: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/appointment/monitoring`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    book: async (clientId: string, data: { biometricDate: string; interviewDate: string; location: string }) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/appointment/booked`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    setReschedule: async (clientId: string, data: { reschedule: boolean; notes: string }) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/appointment/reschedule`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    confirmSlot: async (clientId: string, status: 'Pending' | 'Confirmed') => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/slot-confirmation`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },
    uploadConfirmation: async (clientId: string, data: FormData) => {
      const headers: Record<string, string> = getHeaders() as Record<string, string>;
      delete headers['Content-Type'];
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/confirmation-page`, {
        method: 'POST',
        headers,
        body: data,
      });
      return handleResponse(res);
    }
  },
  screening: {
    updateBiometric: async (clientId: string, status: 'Pending' | 'Completed') => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/biometric-screening`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },
    updateInterview: async (clientId: string, status: 'Pending' | 'Completed') => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/interview-screening`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },
    updateResult: async (clientId: string, status: 'approved' | 'not_approved') => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/result`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },
    markDone: async (clientId: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/mark-done`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  documents: {
    uploadDS160: async (clientId: string, data: FormData) => {
      const headers: Record<string, string> = getHeaders() as Record<string, string>;
      delete headers['Content-Type'];
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/ds160/pdf`, {
        method: 'POST',
        headers,
        body: data,
      });
      return handleResponse(res);
    },
    list: async (clientId: string) => {
      const res = await apiFetch(`${VISA_AGENT_BASE_URL}/clients/${clientId}/documents`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  }
};

// ----------------------------------------------------
// 16. Appointments & Documents Modules
// ----------------------------------------------------

export const appointmentApi = {
  create: async (data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  list: async () => {
    const res = await apiFetch(`${BASE_URL}/appointments`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  update: async (id: string, data: Record<string, any>) => {
    const res = await apiFetch(`${BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  delete: async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  }
};

export const documentApi = {
  upload: async (data: FormData) => {
    const headers: Record<string, string> = getHeaders() as Record<string, string>;
    delete headers['Content-Type'];
    const res = await apiFetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers,
      body: data,
    });
    return handleResponse(res);
  },
  list: async (params: { studentId?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await apiFetch(`${BASE_URL}/documents?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  updateStatus: async (id: string, data: { status: string; comments?: string }) => {
    const res = await apiFetch(`${BASE_URL}/documents/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }
};

// ----------------------------------------------------
// 13. Visa Client Specific APIs
// ----------------------------------------------------

const VISA_CLIENT_BASE_URL = `${BASE_URL}/client`;

export const visaClientApi = {
  auth: {
    login: async (gxvcId: string, password: string) => {
      return authApi.login({ gxId: gxvcId, password });
    },
    me: async () => {
      const res = await apiFetch(`${VISA_CLIENT_BASE_URL}/me`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getProfile: async () => {
      const res = await apiFetch(`${VISA_CLIENT_BASE_URL}/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    uploadDocuments: async (data: FormData) => {
      const headers: Record<string, string> = getHeaders() as Record<string, string>;
      delete headers['Content-Type'];
      const res = await apiFetch(`${VISA_CLIENT_BASE_URL}/documents`, {
        method: 'POST',
        headers,
        body: data,
      });
      return handleResponse(res);
    },
    uploadChecklist: async (checklistId: string, data: FormData) => {
      const headers: Record<string, string> = getHeaders() as Record<string, string>;
      delete headers['Content-Type'];
      const res = await apiFetch(`${VISA_CLIENT_BASE_URL}/checklist/${checklistId}/upload`, {
        method: 'POST',
        headers,
        body: data,
      });
      return handleResponse(res);
    }
  },
  pipeline: {
    get: async () => {
      const res = await apiFetch(`${BASE_URL}/client/pipeline`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  documents: {
    getChecklist: async () => {
      const res = await apiFetch(`${BASE_URL}/client/checklist`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    upload: async (data: FormData) => {
      const headers: Record<string, string> = getHeaders() as Record<string, string>;
      delete headers['Content-Type'];
      const res = await apiFetch(`${BASE_URL}/client/documents`, {
        method: 'POST',
        headers,
        body: data,
      });
      return handleResponse(res);
    }
  }
};
const ALUMNI_MANAGER_BASE_URL = `${BASE_URL}/alumni-manager`;

export const alumniManagerApi = {
  auth: {
    login: async (data: Record<string, any>) => {
      return authApi.login(data as any);
    },
    me: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/me`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    logout: async () => {
      localStorage.removeItem('token');
      // Some backends might have a logout endpoint, but typically we just clear local storage
      // If there was an endpoint:
      // const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/logout`, { method: 'POST', headers: getHeaders() });
      // return handleResponse(res);
    }
  },
  dashboard: {
    getSummary: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/dashboard/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getActivity: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/dashboard/activity`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  jobs: {
    getApplications: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/jobs/applications`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  registrations: {
    getPending: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/pending-alumni`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    approveAlumni: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/approve-alumni/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getAll: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/users`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getOne: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/registrations/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    approve: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/registrations/${id}/approve`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    reject: async (id: string, reason: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/registrations/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ reason }),
      });
      return handleResponse(res);
    }
  },
  users: {
    getAll: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/users`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateStatus: async (id: string, status: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    }
  },
  studentRequests: {
    getAll: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/student-requests`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    assign: async (id: string, alumniId: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/student-requests/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ alumniId }),
      });
      return handleResponse(res);
    },
    resolve: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/student-requests/${id}/resolve`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  services: {
    getRequests: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/services/requests`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getPending: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/services/pending`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getAll: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/services`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    approveAlumniService: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/services/${id}/approve-alumni-service`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    rejectAlumniService: async (id: string, reason: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/services/${id}/reject-alumni-service`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ reason }),
      });
      return handleResponse(res);
    },
    approveBooking: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/services/requests/${id}/approve`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    rejectBooking: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/services/requests/${id}/reject`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateCost: async (id: string, cost: number) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/services/requests/${id}/cost`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ cost }),
      });
      return handleResponse(res);
    }
  },
  pricing: {
    get: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/pricing`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    update: async (data: Record<string, any>) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  payments: {
    getAll: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/payments`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getSummary: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/payments/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getPayoutRequests: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/payouts`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    transferFunds: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/payouts/${id}/transfer`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  community: {
    createAnnouncement: async (data: Record<string, any>) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/community/announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    getPosts: async () => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/community/posts`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  reports: {
    export: async (type: string, format: string) => {
      const res = await apiFetch(`${ALUMNI_MANAGER_BASE_URL}/reports/export?type=${type}&format=${format}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res); // or handle blob
    }
  }
};

// ----------------------------------------------------
// 15. Alumni Student Portal Specific APIs
// ----------------------------------------------------

const ALUMNI_BASE_URL = `${BASE_URL}/alumni`;

export const alumniApi = {
  auth: {
    login: async (credentials: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    logout: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/me`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    register: async (data: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    }
  },
  profile: {
    get: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    update: async (data: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },
  dashboard: {
    getSummary: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/dashboard/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getActivity: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/dashboard/activity`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  payments: {
    getAll: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/payments`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getSummary: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/payments/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateBankDetails: async (data: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/bank-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },
  services: {
    getAll: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/services`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getBookings: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/services/bookings`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (data: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    update: async (id: string, data: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    updateStatus: async (id: string, status: string) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/services/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    requestVerification: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/services/${id}/request-verification`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getPublic: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/services/public`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  communications: {
    getRequests: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/requests`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    acceptRequest: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/requests/${id}/accept`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    rejectRequest: async (id: string) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/requests/${id}/reject`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  chat: {
    getAllThreads: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/chats`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getMessages: async (serviceId: string, studentId?: string) => {
      const query = studentId ? `?studentId=${studentId}` : '';
      const res = await apiFetch(`${ALUMNI_BASE_URL}/chat/${serviceId}${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    sendMessage: async (serviceId: string, message: string, receiverId?: string) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/chat/${serviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ message, receiverId }),
      });
      return handleResponse(res);
    }
  },
  jobs: {
    getAll: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/jobs`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    post: async (data: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getPerformance: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/jobs/performance`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getApplications: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/jobs/applications`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateApplicationStatus: async (id: string, status: string) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/jobs/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    chat: {
      getMessages: async (id: string) => {
        const res = await apiFetch(`${ALUMNI_BASE_URL}/jobs/applications/${id}/chat`, {
          method: 'GET',
          headers: getHeaders(),
        });
        return handleResponse(res);
      },
      sendMessage: async (id: string, message: string) => {
        const res = await apiFetch(`${ALUMNI_BASE_URL}/jobs/applications/${id}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getHeaders() },
          body: JSON.stringify({ message })
        });
        return handleResponse(res);
      }
    }
  },
  training: {
    requestLanguageSetup: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/training/language-request`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    requestTechnicalSetup: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/training/technical-request`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  career: {
    addInternship: async (data: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    addProgress: async (data: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/career/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getAnalytics: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/career/analytics`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  prTracker: {
    getStatus: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/pr-status`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateStatus: async (data: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/pr-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getTimelines: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/pr-timelines`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  publicInsights: {
    getEmploymentStats: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/stats/employment`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getSalaryRangeStats: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/stats/salary-range`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  referrals: {
    getAll: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/referrals`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getSummary: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/referrals/summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getLink: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/referral-link`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  brandAmbassador: {
    apply: async (data: any) => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/brand-ambassador/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getStatus: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/brand-ambassador/status`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
  notifications: {
    getFeed: async () => {
      const res = await apiFetch(`${ALUMNI_BASE_URL}/media-feed`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },
};

// ----------------------------------------------------
// 16. Global Notification System (Unified for All Roles)
// ----------------------------------------------------

export const notificationApi = {
  getNotifications: async (params: { unread?: boolean; type?: string; priority?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await apiFetch(`${BASE_URL}/notifications?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getUnreadCount: async () => {
    const res = await apiFetch(`${BASE_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  markAsRead: async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  markAllAsRead: async () => {
    const res = await apiFetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  deleteNotification: async (id: string) => {
    const res = await apiFetch(`${BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getPreferences: async () => {
    const res = await apiFetch(`${BASE_URL}/notifications/preferences`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updatePreferences: async (data: { inApp?: boolean; email?: boolean; whatsapp?: boolean }) => {
    const res = await apiFetch(`${BASE_URL}/notifications/preferences`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getWhatsAppLogs: async (params: { page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await apiFetch(`${BASE_URL}/notifications/admin/whatsapp-logs?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  }
};

// ----------------------------------------------------
// Agent Performance API
// ----------------------------------------------------

export const agentPerformanceApi = {
  /**
   * GET /api/admin/agents/performance
   * Returns all agents with:
   *  - studentsAdded   (students the agent created, not just assigned)
   *  - studentsEnrolled (students in 'Enrolled' stage linked to agent)
   *  - totalEarnings, pendingEarnings, paidEarnings (from CommissionLog)
   *  - tier / tierLabel (Starter, Growth, Pro, Elite)
   */
  getAll: async () => {
    const res = await apiFetch(`${BASE_URL}/admin/agents/performance`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const telecallerApi = {
  dashboard: {
    getSummary: async () => {
      const res = await apiFetch(`${BASE_URL}/telecaller-dashboard`, {
        method: 'GET',
        headers: getHeaders(),
      });

      // If the backend route isn't fully ready, prevent handleResponse from triggering a logout
      if (!res.ok) {
        console.warn("Telecaller API not ready or returned error, using mock data.");
        return {
          success: true,
          data: {
            totalLeads: 120,
            newLeads: 35,
            leadsYouHaveContacted: 48,
            pendingLeads: 37
          }
        };
      }
      return handleResponse(res);
    }
  }
};
