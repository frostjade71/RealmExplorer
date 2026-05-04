export { HomePage } from './HomePage'
export { ServerDetailPage } from './ServerDetailPage'
export { DirectoryPage as ServersPage } from './DirectoryPage'
import { EventsPage } from './EventsPage'
export { EventsPage }
export const ROTMPage = () => <EventsPage category="realm" />
export const SOTMPage = () => <EventsPage category="server" />
export const BOTMPage = () => <EventsPage category="builder" />
export const DOTMPage = () => <EventsPage category="developer" />
export { LeaderboardsPage } from './LeaderboardsPage'
export { OTMStandingsPage } from './OTMStandingsPage'
export { AboutPage } from './AboutPage'
export { SubmitPage } from './SubmitPage'
export { DashboardPage } from './DashboardPage'
export { ServerAnalyticsPage } from './ServerAnalyticsPage'
export { TeamPage } from './TeamPage'
export { BlogPage } from './BlogPage'
export { AdminBlogPage } from './AdminBlogPage'
export { BlogPostDetailPage } from './BlogPostDetailPage'
export { ProfilePage } from './ProfilePage'
export { TermsPage } from './TermsPage'
export { PrivacyPage } from './PrivacyPage'
export { DocsPage } from './DocsPage'
export { UpgradePage } from './UpgradePage'

export function NotFoundPage() { return <div className="p-12 text-center text-white font-pixel">404 - Not Found</div> }

export { AdminServersPage } from './AdminServersPage'
export { AdminUsersPage } from './AdminUsersPage'
export { AdminSettingsPage } from './AdminSettingsPage'
export { AdminOverviewPage } from './AdminOverviewPage'
export { AdminEventsPage } from './AdminEventsPage'
export { AdminAuditLogsPage } from './AdminAuditLogsPage'
export { AdminCategoryRequestsPage } from './AdminCategoryRequestsPage'
export { AdminEditAboutPage } from './AdminEditAboutPage'
export { AdminReportsPage } from './AdminReportsPage'
export { AdminBadgesPage } from './AdminBadgesPage'
export { AuthCallbackPage } from './AuthCallbackPage'
