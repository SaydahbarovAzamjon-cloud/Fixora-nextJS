// ─── GraphQL Queries — Technician User ───────────────────────────────────────
// Stub file. Replace with real Apollo Client gql tags when backend is ready.

export const GET_TECHNICIAN_PROFILE = `
  query GetTechnicianProfile($id: ID!) {
    technician(id: $id) {
      id
      name
      email
      phone
      avatar
      location
      bio
      rating
      totalReviews
      completedJobs
      responseTime
      isAvailable
      isVerified
      badges {
        id
        label
        type
      }
    }
  }
`;

export const GET_TECHNICIAN_STATS = `
  query GetTechnicianStats($technicianId: ID!, $period: StatsPeriod!) {
    technicianStats(technicianId: $technicianId, period: $period) {
      totalRequests
      activeJobs
      weeklyEarnings
      avgRating
      completionRate
      responseTimeAvg
      repeatClientRate
    }
  }
`;

export const GET_INCOMING_REQUESTS = `
  query GetIncomingRequests($technicianId: ID!, $filter: RequestFilter) {
    incomingRequests(technicianId: $technicianId, filter: $filter) {
      id
      client {
        id
        name
        avatar
        rating
        location
      }
      device {
        model
        type
        warranty
      }
      issue
      description
      urgency
      budget
      distance
      photos
      createdAt
      status
    }
  }
`;

export const GET_ACTIVE_JOBS = `
  query GetActiveJobs($technicianId: ID!, $status: JobStatus) {
    activeJobs(technicianId: $technicianId, status: $status) {
      id
      client {
        id
        name
      }
      device {
        model
        type
      }
      issue
      status
      progress
      price
      paid
      startedAt
      dueAt
      timeline {
        step
        done
        completedAt
      }
    }
  }
`;

export const GET_EARNINGS = `
  query GetEarnings($technicianId: ID!, $period: EarningsPeriod!) {
    earnings(technicianId: $technicianId, period: $period) {
      totalEarned
      totalPending
      nextPayoutAmount
      nextPayoutDate
      transactions {
        id
        client { name }
        job { id issue }
        amount
        status
        method
        createdAt
      }
      payouts {
        id
        amount
        status
        method
        completedAt
      }
    }
  }
`;

export const GET_NOTIFICATIONS = `
  query GetNotifications($technicianId: ID!) {
    notifications(technicianId: $technicianId) {
      id
      type
      title
      message
      read
      createdAt
      actionUrl
    }
  }
`;

export const MARK_NOTIFICATION_READ = `
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = `
  mutation MarkAllNotificationsRead($technicianId: ID!) {
    markAllNotificationsRead(technicianId: $technicianId) {
      success
      count
    }
  }
`;

export const UPDATE_AVAILABILITY = `
  mutation UpdateAvailability($technicianId: ID!, $isAvailable: Boolean!) {
    updateAvailability(technicianId: $technicianId, isAvailable: $isAvailable) {
      id
      isAvailable
    }
  }
`;

export const RESPOND_TO_REQUEST = `
  mutation RespondToRequest($requestId: ID!, $action: RequestAction!, $quote: QuoteInput) {
    respondToRequest(requestId: $requestId, action: $action, quote: $quote) {
      id
      status
    }
  }
`;

export const UPDATE_JOB_STATUS = `
  mutation UpdateJobStatus($jobId: ID!, $status: JobStatus!) {
    updateJobStatus(jobId: $jobId, status: $status) {
      id
      status
      progress
    }
  }
`;
