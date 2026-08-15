import api from './api/axios';
import { API_ENDPOINTS } from './api/endpoints';

// Helper to get current logged in user ID
const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      return u.id || u.email || 'guest';
    }
  } catch (e) {}
  return 'guest';
};

// Helper to retrieve notifications from local storage scoped by user ID
const getLocalStorageNotifications = (userId = getCurrentUserId()) => {
  const key = `smarthire_notifications_${userId}`;
  const data = localStorage.getItem(key);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

// Helper to save notifications to local storage scoped by user ID
const saveLocalStorageNotifications = (notifications, userId = getCurrentUserId()) => {
  const key = `smarthire_notifications_${userId}`;
  localStorage.setItem(key, JSON.stringify(notifications));
};

export const notificationService = {
  // Flag indicating if we have switched to local storage fallback due to missing backend routes
  useMock: false,

  /**
   * Fetch all notifications for the authenticated user
   */
  getNotifications: async (params = {}) => {
    const { page = 1, limit = 10, filter = 'all', search = '' } = params;
    try {
      if (notificationService.useMock) throw new Error('Mock mode is active');
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params });
      return response.data;
    } catch (error) {
      console.warn('Notification API: getNotifications failed. Using local storage fallback.', error.message);
      notificationService.useMock = true;
      
      let items = getLocalStorageNotifications();

      // Apply status filter
      if (filter === 'unread') {
        items = items.filter(n => !n.is_read);
      } else if (filter === 'read') {
        items = items.filter(n => n.is_read);
      }

      // Apply search term filter
      if (search) {
        const query = search.toLowerCase().trim();
        items = items.filter(n => 
          n.title?.toLowerCase().includes(query) || 
          n.message?.toLowerCase().includes(query)
        );
      }

      // Pagination calculation
      const total = items.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedItems = items.slice(start, end);

      return {
        items: paginatedItems,
        total,
        page,
        limit,
        totalPages
      };
    }
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id) => {
    try {
      if (notificationService.useMock) throw new Error('Mock mode is active');
      const response = await api.patch(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}/read`);
      return response.data;
    } catch (error) {
      console.warn(`Notification API: markAsRead(${id}) failed. Using local storage fallback.`, error.message);
      const notifications = getLocalStorageNotifications();
      const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
      saveLocalStorageNotifications(updated);
      return updated.find(n => n.id === id);
    }
  },

  /**
   * Mark all notifications as read for the user
   */
  markAllAsRead: async () => {
    try {
      if (notificationService.useMock) throw new Error('Mock mode is active');
      const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
      return response.data;
    } catch (error) {
      console.warn('Notification API: markAllAsRead failed. Using local storage fallback.', error.message);
      const notifications = getLocalStorageNotifications();
      const updated = notifications.map(n => ({ ...n, is_read: true }));
      saveLocalStorageNotifications(updated);
      return updated;
    }
  },

  /**
   * Delete a single notification
   */
  deleteNotification: async (id) => {
    try {
      if (notificationService.useMock) throw new Error('Mock mode is active');
      const response = await api.delete(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Notification API: deleteNotification(${id}) failed. Using local storage fallback.`, error.message);
      const notifications = getLocalStorageNotifications();
      const updated = notifications.filter(n => n.id !== id);
      saveLocalStorageNotifications(updated);
      return { success: true, id };
    }
  },

  /**
   * Delete all read notifications for the user
   */
  deleteAllRead: async () => {
    try {
      if (notificationService.useMock) throw new Error('Mock mode is active');
      const response = await api.post(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/delete-read`);
      return response.data;
    } catch (error) {
      console.warn('Notification API: deleteAllRead failed. Using local storage fallback.', error.message);
      const notifications = getLocalStorageNotifications();
      const updated = notifications.filter(n => !n.is_read);
      saveLocalStorageNotifications(updated);
      return { success: true };
    }
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async () => {
    try {
      if (notificationService.useMock) throw new Error('Mock mode is active');
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      return response.data; // Expected response: { count: number }
    } catch (error) {
      console.warn('Notification API: getUnreadCount failed. Using local storage fallback.', error.message);
      const notifications = getLocalStorageNotifications();
      const count = notifications.filter(n => !n.is_read).length;
      return { count };
    }
  },

  /**
   * Helper to dispatch update events to the UI
   */
  triggerInAppRefresh: () => {
    window.dispatchEvent(new CustomEvent('smarthire_notifications_update'));
  },

  /**
   * Trigger the backend email notification API
   */
  sendEmail: async (payload) => {
    try {
      const response = await api.post(API_ENDPOINTS.EMAILS.SEND, payload);
      return response.data;
    } catch (error) {
      console.warn('Email API: Failed to send email via API. Suppressing error to keep workflow uninterrupted.', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Central trigger for Application Submission.
   * Generates in-app notifications for both Recruiter and Seeker,
   * and invokes the backend email API for both.
   */
  notifyApplicationSubmitted: async (applicationId, jobData, seekerData) => {
    const jobTitle = jobData?.title || 'Job Listing';
    const companyName = jobData?.company?.name || jobData?.company_name || 'Employer';
    const seekerName = seekerData?.name || 'A candidate';
    const seekerEmail = seekerData?.email || 'seeker@example.com';
    const recruiterEmail = jobData?.recruiter?.email || 'recruiter@example.com';
    const recruiterId = jobData?.recruiter_id || jobData?.recruiter?.id || 2; // Default mock recruiter id

    // 1. Create In-App Notification for Seeker
    const seekerNotification = {
      id: Date.now() + 1,
      type: 'APPLICATION',
      title: 'Application Submitted',
      message: `You applied for ${jobTitle} at ${companyName}.`,
      is_read: false,
      created_at: new Date().toISOString(),
      application_id: applicationId,
      job_id: jobData?.id
    };

    // 2. Create In-App Notification for Recruiter
    const recruiterNotification = {
      id: Date.now() + 2,
      type: 'APPLICATION',
      title: 'New Application Received',
      message: `${seekerName} applied for ${jobTitle}.`,
      is_read: false,
      created_at: new Date().toISOString(),
      application_id: applicationId,
      job_id: jobData?.id
    };

    // Store in-app notifications in mock database
    try {
      // In a real backend, we would hit POST /notifications for each
      if (!notificationService.useMock) {
        await Promise.all([
          api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...seekerNotification, user_id: seekerData?.id }),
          api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...recruiterNotification, user_id: recruiterId })
        ]).catch(() => {
          // If endpoints are not ready on the backend, fall back
          throw new Error('API create notification not available');
        });
      } else {
        throw new Error('Mock mode active');
      }
    } catch (e) {
      const local = getLocalStorageNotifications();
      // Add seeker's notification (relevant to current user since they are the seeker)
      local.unshift(seekerNotification);
      
      // Also add recruiter's notification for testing/recruiter role toggle support
      local.unshift(recruiterNotification);
      
      saveLocalStorageNotifications(local);
    }

    // Refresh count in header UI
    notificationService.triggerInAppRefresh();

    // 3. Dispatch emails (Non-blocking)
    notificationService.sendEmail({
      recipient_email: seekerEmail,
      event: 'APPLICATION_SUBMITTED',
      context: {
        application_id: applicationId,
        job_title: jobTitle,
        company_name: companyName,
        candidate_name: seekerName
      }
    });

    notificationService.sendEmail({
      recipient_email: recruiterEmail,
      event: 'APPLICATION_SUBMITTED_RECRUITER',
      context: {
        application_id: applicationId,
        job_title: jobTitle,
        company_name: companyName,
        candidate_name: seekerName
      }
    });
  },

  /**
   * Central trigger for Application Withdrawal.
   * Generates in-app notifications for both Recruiter and Seeker,
   * and invokes the backend email API for both.
   */
  notifyApplicationWithdrawn: async (applicationId, jobData, seekerData) => {
    const jobTitle = jobData?.title || 'Job Listing';
    const companyName = jobData?.company?.name || jobData?.company_name || 'Employer';
    const seekerName = seekerData?.name || 'A candidate';
    const seekerEmail = seekerData?.email || 'seeker@example.com';
    const recruiterEmail = jobData?.recruiter?.email || 'recruiter@example.com';
    const recruiterId = jobData?.recruiter_id || jobData?.recruiter?.id || 2; // Default mock recruiter id

    // 1. Create In-App Notification for Seeker
    const seekerNotification = {
      id: Date.now() + 3,
      type: 'APPLICATION',
      title: 'Application Withdrawn',
      message: `You withdrew your application for ${jobTitle} at ${companyName}.`,
      is_read: false,
      created_at: new Date().toISOString(),
      application_id: applicationId,
      job_id: jobData?.id
    };

    // 2. Create In-App Notification for Recruiter
    const recruiterNotification = {
      id: Date.now() + 4,
      type: 'APPLICATION',
      title: 'Application Withdrawn',
      message: `${seekerName} withdrew their application for ${jobTitle}.`,
      is_read: false,
      created_at: new Date().toISOString(),
      application_id: applicationId,
      job_id: jobData?.id
    };

    // Store in-app notifications in mock database
    try {
      if (!notificationService.useMock) {
        await Promise.all([
          api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...seekerNotification, user_id: seekerData?.id }),
          api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...recruiterNotification, user_id: recruiterId })
        ]).catch(() => {
          throw new Error('API create notification not available');
        });
      } else {
        throw new Error('Mock mode active');
      }
    } catch (e) {
      const local = getLocalStorageNotifications();
      local.unshift(seekerNotification);
      local.unshift(recruiterNotification);
      saveLocalStorageNotifications(local);
    }

    // Refresh count in header UI
    notificationService.triggerInAppRefresh();

    // 3. Dispatch emails (Non-blocking)
    notificationService.sendEmail({
      recipient_email: seekerEmail,
      event: 'APPLICATION_WITHDRAWN',
      context: {
        application_id: applicationId,
        job_title: jobTitle,
        company_name: companyName,
        candidate_name: seekerName
      }
    });

    notificationService.sendEmail({
      recipient_email: recruiterEmail,
      event: 'APPLICATION_WITHDRAWN_RECRUITER',
      context: {
        application_id: applicationId,
        job_title: jobTitle,
        company_name: companyName,
        candidate_name: seekerName
      }
    });
  },

  /**
   * Notify Job Seeker that application moved to Screening stage
   */
  notifyApplicationScreening: async (applicationId, jobData, seekerData) => {
    const jobTitle = jobData?.title || 'Job Listing';
    const companyName = jobData?.company?.name || jobData?.company_name || 'Employer';
    const seekerEmail = seekerData?.email || 'seeker@example.com';
    const seekerId = seekerData?.id || 3;

    const notification = {
      id: Date.now() + 10,
      type: 'STATUS_UPDATE',
      title: 'Application Moved to Screening',
      message: `Your application for ${jobTitle} has moved to the Screening stage.`,
      is_read: false,
      created_at: new Date().toISOString(),
      application_id: applicationId,
      job_id: jobData?.id,
      navigation_url: '/applications'
    };

    try {
      if (!notificationService.useMock) {
        await api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...notification, user_id: seekerId }).catch(() => {
          throw new Error('API failed');
        });
      } else {
        throw new Error('Mock mode active');
      }
    } catch (e) {
      const local = getLocalStorageNotifications();
      local.unshift(notification);
      saveLocalStorageNotifications(local);
    }

    notificationService.triggerInAppRefresh();

    notificationService.sendEmail({
      recipient_email: seekerEmail,
      event: 'APPLICATION_SCREENING',
      context: {
        application_id: applicationId,
        job_title: jobTitle,
        company_name: companyName,
        candidate_name: seekerData?.name || 'Candidate'
      }
    });
  },

  /**
   * Notify Job Seeker that an Interview has been Scheduled
   */
  notifyInterviewScheduled: async (applicationId, jobData, seekerData) => {
    const jobTitle = jobData?.title || 'Job Listing';
    const companyName = jobData?.company?.name || jobData?.company_name || 'Employer';
    const seekerEmail = seekerData?.email || 'seeker@example.com';
    const seekerId = seekerData?.id || 3;

    const notification = {
      id: Date.now() + 11,
      type: 'INTERVIEW',
      title: 'Interview Scheduled',
      message: `Your interview for ${jobTitle} has been scheduled.`,
      is_read: false,
      created_at: new Date().toISOString(),
      application_id: applicationId,
      job_id: jobData?.id,
      navigation_url: '/applications'
    };

    try {
      if (!notificationService.useMock) {
        await api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...notification, user_id: seekerId }).catch(() => {
          throw new Error('API failed');
        });
      } else {
        throw new Error('Mock mode active');
      }
    } catch (e) {
      const local = getLocalStorageNotifications();
      local.unshift(notification);
      saveLocalStorageNotifications(local);
    }

    notificationService.triggerInAppRefresh();

    notificationService.sendEmail({
      recipient_email: seekerEmail,
      event: 'INTERVIEW_SCHEDULED',
      context: {
        application_id: applicationId,
        job_title: jobTitle,
        company_name: companyName,
        candidate_name: seekerData?.name || 'Candidate'
      }
    });
  },

  /**
   * Notify Job Seeker that they have been Selected
   */
  notifyApplicationSelected: async (applicationId, jobData, seekerData) => {
    const jobTitle = jobData?.title || 'Job Listing';
    const companyName = jobData?.company?.name || jobData?.company_name || 'Employer';
    const seekerEmail = seekerData?.email || 'seeker@example.com';
    const seekerId = seekerData?.id || 3;

    const notification = {
      id: Date.now() + 12,
      type: 'STATUS_UPDATE',
      title: 'Application Selected',
      message: `Congratulations! You have been selected for ${jobTitle}.`,
      is_read: false,
      created_at: new Date().toISOString(),
      application_id: applicationId,
      job_id: jobData?.id,
      navigation_url: '/applications'
    };

    try {
      if (!notificationService.useMock) {
        await api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...notification, user_id: seekerId }).catch(() => {
          throw new Error('API failed');
        });
      } else {
        throw new Error('Mock mode active');
      }
    } catch (e) {
      const local = getLocalStorageNotifications();
      local.unshift(notification);
      saveLocalStorageNotifications(local);
    }

    notificationService.triggerInAppRefresh();

    notificationService.sendEmail({
      recipient_email: seekerEmail,
      event: 'APPLICATION_SELECTED',
      context: {
        application_id: applicationId,
        job_title: jobTitle,
        company_name: companyName,
        candidate_name: seekerData?.name || 'Candidate'
      }
    });
  },

  /**
   * Notify Job Seeker that they have been Rejected
   */
  notifyApplicationRejected: async (applicationId, jobData, seekerData) => {
    const jobTitle = jobData?.title || 'Job Listing';
    const companyName = jobData?.company?.name || jobData?.company_name || 'Employer';
    const seekerEmail = seekerData?.email || 'seeker@example.com';
    const seekerId = seekerData?.id || 3;

    const notification = {
      id: Date.now() + 13,
      type: 'STATUS_UPDATE',
      title: 'Application Rejected',
      message: `Your application for ${jobTitle} was not selected.`,
      is_read: false,
      created_at: new Date().toISOString(),
      application_id: applicationId,
      job_id: jobData?.id,
      navigation_url: '/applications'
    };

    try {
      if (!notificationService.useMock) {
        await api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...notification, user_id: seekerId }).catch(() => {
          throw new Error('API failed');
        });
      } else {
        throw new Error('Mock mode active');
      }
    } catch (e) {
      const local = getLocalStorageNotifications();
      local.unshift(notification);
      saveLocalStorageNotifications(local);
    }

    notificationService.triggerInAppRefresh();

    notificationService.sendEmail({
      recipient_email: seekerEmail,
      event: 'APPLICATION_REJECTED',
      context: {
        application_id: applicationId,
        job_title: jobTitle,
        company_name: companyName,
        candidate_name: seekerData?.name || 'Candidate'
      }
    });
  },

  /**
   * Notify Recruiter (and future job seekers) that a Job has been Published
   */
  notifyJobPublished: async (jobId, jobTitle, recruiterData, recipientIds = []) => {
    const recruiterId = recruiterData?.id || 2;
    const recruiterEmail = recruiterData?.email || 'recruiter@example.com';

    const notification = {
      id: Date.now() + 20,
      type: 'JOB',
      title: 'Job Published',
      message: `Your job "${jobTitle}" has been published successfully.`,
      is_read: false,
      created_at: new Date().toISOString(),
      job_id: jobId,
      navigation_url: `/jobs/${jobId}`
    };

    try {
      if (!notificationService.useMock) {
        await api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...notification, user_id: recruiterId });
        if (recipientIds && recipientIds.length > 0) {
          await Promise.all(
            recipientIds.map(userId => 
              api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...notification, user_id: userId })
            )
          );
        }
      } else {
        throw new Error('Mock mode active');
      }
    } catch (e) {
      const local = getLocalStorageNotifications();
      local.unshift(notification);
      saveLocalStorageNotifications(local);
    }

    notificationService.triggerInAppRefresh();

    notificationService.sendEmail({
      recipient_email: recruiterEmail,
      event: 'JOB_PUBLISHED',
      context: {
        job_id: jobId,
        job_title: jobTitle,
        recruiter_name: recruiterData?.name || 'Recruiter'
      }
    });
  },

  /**
   * Notify Recruiter (and future applicants/seekers) that a Job has been Closed
   */
  notifyJobClosed: async (jobId, jobTitle, recruiterData, recipientIds = []) => {
    const recruiterId = recruiterData?.id || 2;
    const recruiterEmail = recruiterData?.email || 'recruiter@example.com';

    const notification = {
      id: Date.now() + 21,
      type: 'JOB',
      title: 'Job Closed',
      message: `Your job "${jobTitle}" has been closed.`,
      is_read: false,
      created_at: new Date().toISOString(),
      job_id: jobId,
      navigation_url: '/recruiter/jobs'
    };

    try {
      if (!notificationService.useMock) {
        await api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...notification, user_id: recruiterId });
        if (recipientIds && recipientIds.length > 0) {
          await Promise.all(
            recipientIds.map(userId => 
              api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...notification, user_id: userId })
            )
          );
        }
      } else {
        throw new Error('Mock mode active');
      }
    } catch (e) {
      const local = getLocalStorageNotifications();
      local.unshift(notification);
      saveLocalStorageNotifications(local);
    }

    notificationService.triggerInAppRefresh();

    notificationService.sendEmail({
      recipient_email: recruiterEmail,
      event: 'JOB_CLOSED',
      context: {
        job_id: jobId,
        job_title: jobTitle,
        recruiter_name: recruiterData?.name || 'Recruiter'
      }
    });
  },

  /**
   * Notify Recruiter (and future job seekers) that a Job has been Reopened
   */
  notifyJobReopened: async (jobId, jobTitle, recruiterData, recipientIds = []) => {
    const recruiterId = recruiterData?.id || 2;
    const recruiterEmail = recruiterData?.email || 'recruiter@example.com';

    const notification = {
      id: Date.now() + 22,
      type: 'JOB',
      title: 'Job Reopened',
      message: `Your job "${jobTitle}" has been reopened.`,
      is_read: false,
      created_at: new Date().toISOString(),
      job_id: jobId,
      navigation_url: `/jobs/${jobId}`
    };

    try {
      if (!notificationService.useMock) {
        await api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...notification, user_id: recruiterId });
        if (recipientIds && recipientIds.length > 0) {
          await Promise.all(
            recipientIds.map(userId => 
              api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, { ...notification, user_id: userId })
            )
          );
        }
      } else {
        throw new Error('Mock mode active');
      }
    } catch (e) {
      const local = getLocalStorageNotifications();
      local.unshift(notification);
      saveLocalStorageNotifications(local);
    }

    notificationService.triggerInAppRefresh();

    notificationService.sendEmail({
      recipient_email: recruiterEmail,
      event: 'JOB_REOPENED',
      context: {
        job_id: jobId,
        job_title: jobTitle,
        recruiter_name: recruiterData?.name || 'Recruiter'
      }
    });
  }
};

export default notificationService;
