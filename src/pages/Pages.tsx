import { lazy } from 'react'

import { HomePage } from './HomePage'
import { ServerDetailPage } from './ServerDetailPage'
import { DirectoryPage as ServersPage } from './DirectoryPage'
import { ProjectsPage } from './ProjectsPage'
import { BlogPage } from './BlogPage'
import { BlogPostDetailPage } from './BlogPostDetailPage'
import { TeamPage } from './TeamPage'
import { AboutPage } from './AboutPage'
import { OTMStandingsPage } from './OTMStandingsPage'

export {
  HomePage,
  ServerDetailPage,
  ServersPage,
  ProjectsPage,
  BlogPage,
  BlogPostDetailPage,
  TeamPage,
  AboutPage,
  OTMStandingsPage
}

export const WhyProjectsPage = lazy(() => import('./WhyProjectsPage').then(m => ({ default: m.WhyProjectsPage })))
export const ProjectSubmitPage = lazy(() => import('./ProjectSubmitPage').then(m => ({ default: m.ProjectSubmitPage })))
export const ProjectDetailPage = lazy(() => import('./ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })))
export const LeaderboardsPage = lazy(() => import('./LeaderboardsPage').then(m => ({ default: m.LeaderboardsPage })))
export const SubmitPage = lazy(() => import('./SubmitPage').then(m => ({ default: m.SubmitPage })))
export const DashboardPage = lazy(() => import('./DashboardPage').then(m => ({ default: m.DashboardPage })))
export const AdminBlogPage = lazy(() => import('./AdminBlogPage').then(m => ({ default: m.AdminBlogPage })))
export const ProfilePage = lazy(() => import('./ProfilePage').then(m => ({ default: m.ProfilePage })))
export const TermsPage = lazy(() => import('./TermsPage').then(m => ({ default: m.TermsPage })))
export const PrivacyPage = lazy(() => import('./PrivacyPage').then(m => ({ default: m.PrivacyPage })))
export const CopyrightPage = lazy(() => import('./CopyrightPage').then(m => ({ default: m.CopyrightPage })))
export const DocsPage = lazy(() => import('./DocsPage').then(m => ({ default: m.DocsPage })))
export const UpgradePage = lazy(() => import('./UpgradePage').then(m => ({ default: m.UpgradePage })))
export const StatusPage = lazy(() => import('./StatusPage').then(m => ({ default: m.StatusPage })))
export const AppealPage = lazy(() => import('./AppealPage').then(m => ({ default: m.AppealPage })))
export const AdminAppealsPage = lazy(() => import('./AdminAppealsPage').then(m => ({ default: m.AdminAppealsPage })))
export const AdminServersPage = lazy(() => import('./AdminServersPage').then(m => ({ default: m.AdminServersPage })))
export const AdminProjectsPage = lazy(() => import('./AdminProjectsPage').then(m => ({ default: m.AdminProjectsPage })))
export const AdminUsersPage = lazy(() => import('./AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))
export const AdminSettingsPage = lazy(() => import('./AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })))
export const AdminOverviewPage = lazy(() => import('./AdminOverviewPage').then(m => ({ default: m.AdminOverviewPage })))
export const AdminEventsPage = lazy(() => import('./AdminEventsPage').then(m => ({ default: m.AdminEventsPage })))
export const AdminAuditLogsPage = lazy(() => import('./AdminAuditLogsPage').then(m => ({ default: m.AdminAuditLogsPage })))
export const AdminCategoryRequestsPage = lazy(() => import('./AdminCategoryRequestsPage').then(m => ({ default: m.AdminCategoryRequestsPage })))
export const AdminEditAboutPage = lazy(() => import('./AdminEditAboutPage').then(m => ({ default: m.AdminEditAboutPage })))
export const AdminReportsPage = lazy(() => import('./AdminReportsPage').then(m => ({ default: m.AdminReportsPage })))
export const AdminBadgesPage = lazy(() => import('./AdminBadgesPage').then(m => ({ default: m.AdminBadgesPage })))
export { AuthCallbackPage } from './AuthCallbackPage'

const LazyEventsPage = lazy(() => import('./EventsPage').then(m => ({ default: m.EventsPage })))
export const ROTMPage = () => <LazyEventsPage category="realm" />
export const SOTMPage = () => <LazyEventsPage category="server" />
export const BOTMPage = () => <LazyEventsPage category="builder" />
export const DOTMPage = () => <LazyEventsPage category="developer" />

export function NotFoundPage() { return <div className="p-12 text-center text-white font-pixel">404 - Not Found</div> }
