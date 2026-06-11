import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { AlumniRegisterPage } from "./pages/AlumniRegisterPage";
import { StudentRegisterPage } from "./pages/StudentRegisterPage";
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DashboardPage } from "./pages/DashboardPage";
import { LeadsPage } from "./pages/LeadsPage";
import { LeadDetailsPage } from "./pages/LeadDetailsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { StudentDetailsPage } from "./pages/StudentDetailsPage";
import { AgentsPage } from "./pages/AgentsPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { FollowUpsPage } from "./pages/FollowUpsPage";
import { TelecallersPage } from "./pages/TelecallersPage";
import { AgentManagersPage } from "./pages/AgentManagersPage";
import { AgentManagerDetailsPage } from "./pages/AgentManagerDetailsPage";
import { AgentDetailsPage } from "./pages/AgentDetailsPage";
import { VisaAgentsPage } from "./pages/VisaAgentsPage";
import { OffersPage } from "./pages/OffersPage";
import { WebinarsPage } from "./pages/WebinarsPage";
import { QueuePage } from "./pages/QueuePage";
import { CommissionsPage } from "./pages/CommissionsPage";
import { ApplicationStatusPage } from "./pages/ApplicationStatusPage";

// New Admin Pages
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { UsersPage } from "./pages/UsersPage";
import { StudentRegistrationsPage } from "./pages/StudentRegistrationsPage";
import { TrackingPage } from "./pages/TrackingPage";
import { TelecallerStatsPage } from "./pages/TelecallerStatsPage";
import { CounsellorPanelPage } from "./pages/CounsellorPanelPage";
import { AgentPanelPage } from "./pages/AgentPanelPage";
import { PipelinePage } from "./pages/PipelinePage";
import { VisaPanelPage } from "./pages/VisaPanelPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { PartnerOffersPage } from "./pages/PartnerOffersPage";
import { MarketingPage } from "./pages/MarketingPage";
import { AlertsPage } from "./pages/AlertsPage";
import { GamificationPage } from "./pages/GamificationPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SearchBusinessPage } from "./pages/SearchBusinessPage";
import { WhatsAppLogsPage } from "./pages/notifications/WhatsAppLogsPage";
import { AlumniManagersPage } from "./pages/AlumniManagersPage";
import { AlumniManagerDetailsPage } from "./pages/AlumniManagerDetailsPage";

// Student Portal Pages
import { StudentLayout } from "./components/layouts/StudentLayout";
import { StudentDashboardPage } from "./pages/student/StudentDashboardPage";
import { StudentApplicationPage } from "./pages/student/StudentApplicationPage";
import { StudentDocumentsPage } from "./pages/student/StudentDocumentsPage";
import { StudentPaymentsPage } from "./pages/student/StudentPaymentsPage";
import { StudentSubscriptionPage } from "./pages/student/StudentSubscriptionPage";
import { StudentAITrainingPage } from "./pages/student/StudentAITrainingPage";
import { StudentChatPage } from "./pages/student/StudentChatPage";
import { StudentAlumniPage } from "./pages/student/StudentAlumniPage";
import { StudentReferralPage } from "./pages/student/StudentReferralPage";
import { StudentProfilePage } from "./pages/student/StudentProfilePage";
import { MyBookingsPage } from "./pages/student/MyBookingsPage";
import { StudentManualPage } from "./pages/student/StudentManualPage";
import { StudentJobsPage } from "./pages/student/StudentJobsPage";

// Visa Agent Portal Pages
import { VisaAgentLayout } from "./components/layouts/VisaAgentLayout";
import { VisaAgentDashboardPage } from "./pages/visa-agent/VisaAgentDashboardPage";
import { VisaAgentPipelinePage } from "./pages/visa-agent/VisaAgentPipelinePage";
import { ClientsListPage } from "./pages/visa-agent/ClientsListPage";
import { CreateClientPage } from "./pages/visa-agent/CreateClientPage";
import { ClientProfilePage } from "./pages/visa-agent/ClientProfilePage";
import { VisaAgentProfilePage } from "./pages/visa-agent/VisaAgentProfilePage";
import { RemindersPage } from "./pages/visa-agent/RemindersPage";
import { VisaAgentPaymentsPage } from "./pages/visa-agent/VisaAgentPaymentsPage";
import { VisaAgentAppointmentsPage } from "./pages/visa-agent/VisaAgentAppointmentsPage";

// Visa Client Portal Pages
import { VisaClientLayout } from "./components/layouts/VisaClientLayout";
import { ClientLoginPage } from "./pages/visa-client/ClientLoginPage";
import { ClientDashboardPage } from "./pages/visa-client/ClientDashboardPage";

// Alumni Manager Portal Pages
import { AlumniManagerLayout } from "./components/layouts/AlumniManagerLayout";
import { AlumniManagerDashboardPage } from "./pages/alumni-manager/AlumniManagerDashboardPage";
import { PricingControlPage } from "./pages/alumni-manager/PricingControlPage";
import { AlumniCommunityPage } from "./pages/alumni-manager/AlumniCommunityPage";
import { AlumniRegistrationsPage } from "./pages/alumni-manager/AlumniRegistrationsPage";
import { AlumniUsersPage } from "./pages/alumni-manager/AlumniUsersPage";
import { AlumniStudentsPage } from "./pages/alumni-manager/AlumniStudentsPage";
import { AlumniServiceRequestsPage } from "./pages/alumni-manager/AlumniServiceRequestsPage";
import { AlumniPaymentsPage } from "./pages/alumni-manager/AlumniPaymentsPage";
import { AlumniManagerJobApplicationsPage } from "./pages/alumni-manager/AlumniManagerJobApplicationsPage";

// Alumni Student Portal Pages
import { AlumniStudentLayout } from "./components/layouts/AlumniStudentLayout";
import { AlumniDashboardPage } from "./pages/alumni/AlumniDashboardPage";
import { AlumniStudentPaymentsPage } from "./pages/alumni/AlumniStudentPaymentsPage";
import { AlumniServicesPage } from "./pages/alumni/AlumniServicesPage";
import { AlumniCommunicationPage } from "./pages/alumni/AlumniCommunicationPage";
import { AlumniJobsPage } from "./pages/alumni/AlumniJobsPage";
import { AlumniPRTrackerPage } from "./pages/alumni/AlumniPRTrackerPage";
import { AlumniStudentRequestsPage } from "./pages/alumni/AlumniStudentRequestsPage";
import { AlumniAnalyticsPage } from "./pages/alumni/AlumniAnalyticsPage";
import { AlumniReferralsPage } from "./pages/alumni/AlumniReferralsPage";
import { AlumniBrandAmbassadorPage } from "./pages/alumni/AlumniBrandAmbassadorPage";
import { AlumniProfilePage } from "./pages/alumni/AlumniProfilePage";
import { AlumniBookingsPage } from "./pages/alumni/AlumniBookingsPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/alumni/register",
    Component: AlumniRegisterPage,
  },
  {
    path: "/student/register",
    Component: StudentRegisterPage,
  },
  {
    path: "/",
    Component: DashboardLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: DashboardPage },
      
      // Dashboard & Analytics
      { path: "analytics", Component: AnalyticsPage },
      { path: "reports", Component: DashboardPage }, // Reusing dashboard for now or separate reports
      { path: "notifications", Component: NotificationsPage },
      { path: "whatsapp-logs", Component: WhatsAppLogsPage },
      { path: "profile", Component: ProfilePage },
      { path: "my-business", Component: ProfilePage },
      { path: "search-business", Component: SearchBusinessPage },
      
      // User & Team Management
      { path: "users", Component: UsersPage },
      { path: "tracking", Component: TrackingPage },
      { path: "telecaller-stats", Component: TelecallerStatsPage },
      { path: "counsellor-panel", Component: CounsellorPanelPage },
      { path: "agent-panel", Component: AgentPanelPage },
      { path: "student-registrations", Component: StudentRegistrationsPage },
      { path: "alumni-managers", element: <AlumniManagersPage /> },
      { path: "alumni-managers/:id", element: <AlumniManagerDetailsPage /> },
      
      // Core Operations
      { path: "leads", Component: LeadsPage },
      { path: "assigned-leads", Component: LeadsPage },
      { path: "leads/:id", Component: LeadDetailsPage },
      { path: "pipeline", Component: PipelinePage },
      { path: "visa-panel", Component: VisaPanelPage },
      { path: "payments", Component: PaymentsPage },
      
      // Content & Partners
      { path: "partner-offers", Component: PartnerOffersPage },
      { path: "documents", Component: DocumentsPage },
      { path: "marketing", Component: MarketingPage },
      
      // Engagement & Tools
      { path: "alerts", Component: AlertsPage },
      { path: "gamification", Component: GamificationPage },
      { path: "settings", Component: SettingsPage },

      // Legacy Routes
      { path: "commissions", Component: CommissionsPage },
      { path: "applications/status", Component: ApplicationStatusPage },
      { path: "students", Component: StudentsPage },
      { path: "students/:id", Component: StudentDetailsPage },
      { path: "agents", Component: AgentsPage },
      { path: "agents/:id", Component: AgentDetailsPage },
      { path: "agent-managers", Component: AgentManagersPage },
      { path: "agent-managers/:id", Component: AgentManagerDetailsPage },
      { path: "visa-agents", Component: VisaAgentsPage },
      { path: "messages", Component: MessagesPage },
      { path: "follow-ups", Component: FollowUpsPage },
      { path: "telecallers", Component: TelecallersPage },
      { path: "offers", Component: OffersPage },
      { path: "webinars", Component: WebinarsPage },
      { path: "queue", Component: QueuePage },
      { path: "kt-docs", Component: DocumentsPage },
      { path: "support", Component: SettingsPage },
    ],
  },
  {
    path: "/student",
    Component: StudentLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: StudentDashboardPage },
      { path: "application", Component: StudentApplicationPage },
      { path: "documents", Component: StudentDocumentsPage },
      { path: "payments", Component: StudentPaymentsPage },
      { path: "subscription", Component: StudentSubscriptionPage },
      { path: "ai-training", Component: StudentAITrainingPage },
      { path: "chat", Component: StudentChatPage },
      { path: "alumni", Component: StudentAlumniPage },
      { path: "my-bookings", Component: MyBookingsPage },
      { path: "referral", Component: StudentReferralPage },
      { path: "notifications", Component: NotificationsPage },
      { path: "profile", Component: StudentProfilePage },
      { path: "manual", Component: StudentManualPage },
      { path: "jobs", Component: StudentJobsPage },
    ],
  },
  {
    path: "/visa-agent",
    Component: VisaAgentLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: VisaAgentDashboardPage },
      { path: "pipeline", Component: VisaAgentPipelinePage },
      { path: "clients", Component: ClientsListPage },
      { path: "clients/create", Component: CreateClientPage },
      { path: "clients/:id", Component: ClientProfilePage },
      { path: "countries/:id", Component: ClientsListPage },
      { path: "visa-type/:id", Component: ClientsListPage },
      { path: "payments", Component: VisaAgentPaymentsPage },

      { path: "appointments", Component: VisaAgentAppointmentsPage }, 
      { path: "reminders", Component: RemindersPage },
      { path: "documents", Component: DocumentsPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "notifications", Component: NotificationsPage },
      { path: "profile", Component: VisaAgentProfilePage },
    ],
  },
  {
    path: "/alumni-manager",
    Component: AlumniManagerLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: AlumniManagerDashboardPage },
      { path: "registrations", Component: AlumniRegistrationsPage },
      { path: "users", Component: AlumniUsersPage },
      { path: "students", Component: AlumniStudentsPage },
      { path: "service-requests", Component: AlumniServiceRequestsPage },
      { path: "pricing", Component: PricingControlPage },
      { path: "payments", Component: AlumniPaymentsPage },
      { path: "job-applications", Component: AlumniManagerJobApplicationsPage },
      { path: "community", Component: AlumniCommunityPage },
      { path: "reports", Component: AnalyticsPage }, // Placeholder using Analytics
      { path: "notifications", Component: NotificationsPage },
      { path: "profile", Component: ProfilePage },
      { path: "settings", Component: SettingsPage },
    ],
  },
  {
    path: "/alumni",
    Component: AlumniStudentLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: AlumniDashboardPage },
      { path: "payments", Component: AlumniStudentPaymentsPage },
      { path: "services", Component: AlumniServicesPage },
      { path: "bookings", Component: AlumniBookingsPage },
      { path: "communication", Component: AlumniCommunicationPage },
      { path: "jobs", Component: AlumniJobsPage },
      { path: "pr-tracker", Component: AlumniPRTrackerPage },
      { path: "students", Component: AlumniStudentRequestsPage },
      { path: "analytics", Component: AlumniAnalyticsPage },
      { path: "referrals", Component: AlumniReferralsPage },
      { path: "brand-ambassador", Component: AlumniBrandAmbassadorPage },
      { path: "notifications", Component: NotificationsPage },
      { path: "profile", Component: AlumniProfilePage },
    ],
  },
  {
    path: "/client/login",
    Component: ClientLoginPage,
  },
  {
    path: "/client",
    Component: VisaClientLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: ClientDashboardPage },
      { path: "profile", Component: ProfilePage },
      { path: "roadmap", Component: ClientDashboardPage },
      { path: "checklist", Component: ClientDashboardPage },
      { path: "payments", Component: PaymentsPage },
      { path: "support", Component: SettingsPage },
    ],
  },
]);

