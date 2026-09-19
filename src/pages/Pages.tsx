import { lazy } from 'react'
import { Link } from 'react-router-dom'
import errorImage from '../assets/error/teto-but-re.webp'
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
export const ApiDocsPage = lazy(() => import('./ApiDocsPage').then(m => ({ default: m.ApiDocsPage })))
export const UpgradePage = lazy(() => import('./UpgradePage').then(m => ({ default: m.UpgradePage })))
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

export function NotFoundPage() { 
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500 flex flex-col items-center">
        <img src={errorImage} alt="Not Found" className="w-24 h-24 md:w-32 md:h-32 object-contain mb-2" />
        <div className="space-y-2 px-4">
          <h2 className="text-2xl md:text-3xl font-headline text-white font-bold tracking-tight">
            <span className="text-realm-green mr-3">404</span>
            Page Not Found
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant font-body max-w-sm mx-auto">
            The page you are looking for could not be found
          </p>
        </div>
        <div className="pt-4">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-4 py-2.5 font-headline text-sm font-semibold text-black bg-realm-green rounded hover:bg-primary-fixed transition-colors duration-200"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  ) 
}
