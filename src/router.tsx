import { createBrowserRouter } from 'react-router-dom'

// Layouts and Protection
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './components/AdminLayout'
import { AuthCallbackPage } from './pages/AuthCallbackPage'

import { Layout } from './components/Layout'

// Pages
import {
  HomePage,
  ServersPage,
  ProjectsPage,
  WhyProjectsPage,
  ProjectSubmitPage,
  ProjectDetailPage,
  ROTMPage,
  SOTMPage,
  BOTMPage,
  DOTMPage,
  AboutPage,
  ServerDetailPage,
  SubmitPage,
  DashboardPage,
  NotFoundPage,
  AdminServersPage,
  AdminProjectsPage,
  AdminUsersPage,
  AdminSettingsPage,
  AdminOverviewPage,
  AdminEventsPage,
  LeaderboardsPage,
  OTMStandingsPage,
  AdminAuditLogsPage,
  AdminCategoryRequestsPage,
  AdminEditAboutPage,
  AdminReportsPage,
  TeamPage,
  BlogPage,
  AdminBlogPage,
  BlogPostDetailPage,
  ProfilePage,

  AdminBadgesPage,
  TermsPage,
  PrivacyPage,
  CopyrightPage,
  DocsPage,
  UpgradePage,
  StatusPage,
  AppealPage,
  AdminAppealsPage
} from './pages/Pages'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/servers',
        element: <ServersPage />,
      },
      {
        path: '/projects',
        element: <ProjectsPage />,
      },
      {
        path: '/pj',
        element: <WhyProjectsPage />,
      },
      {
        path: '/projects/:slug',
        element: <ProjectDetailPage />,
      },
      {
        path: '/rotm',
        element: <ROTMPage />,
      },
      {
        path: '/sotm',
        element: <SOTMPage />,
      },
      {
        path: '/botm',
        element: <BOTMPage />,
      },
      {
        path: '/dotm',
        element: <DOTMPage />,
      },
      {
        path: '/leaderboards',
        element: <LeaderboardsPage />,
      },
      {
        path: '/otm-standings',
        element: <OTMStandingsPage />,
      },
      {
        path: '/about',
        element: <AboutPage />,
      },
      {
        path: '/team',
        element: <TeamPage />,
      },
      {
        path: '/blog',
        element: <BlogPage />,
      },
      {
        path: '/blog/:slug',
        element: <BlogPostDetailPage />,
      },
      {
        path: '/terms',
        element: <TermsPage />,
      },
      {
        path: '/privacy',
        element: <PrivacyPage />,
      },
      {
        path: '/copyright',
        element: <CopyrightPage />,
      },
      {
        path: '/docs',
        element: <DocsPage />,
      },
      {
        path: '/status',
        element: <StatusPage />,
      },
      {
        path: '/upgrade',
        element: <UpgradePage />,
      },
      {
        path: '/appeal',
        element: <AppealPage />,
      },
      {
        path: '/profile/:username',
        element: <ProfilePage />,
      },
      {
        path: '/server/:slug',
        element: <ServerDetailPage />,
      },
      {
        path: '/auth/callback',
        element: <AuthCallbackPage />,
      },
      // Explorer Protected Routes
      {
        element: <ProtectedRoute />, // default requires authentication
        children: [
          {
            path: '/submit',
            element: <SubmitPage />,
          },
          {
            path: '/submit/:id',
            element: <SubmitPage />,
          },
          {
            path: '/submit/project',
            element: <ProjectSubmitPage />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },

        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ]
  },
  // Admin Protected Routes (No standard layout)
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole="moderator" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminOverviewPage />,
          },
          {
            path: 'servers',
            element: <AdminServersPage />,
          },
          {
            path: 'projects',
            element: <AdminProjectsPage />,
          },
          { 
            path: 'reports', 
            element: <AdminReportsPage />, 
          },
          {
            path: 'blog',
            element: <AdminBlogPage />,
          },
          // All below require Admin role
          {
            element: <ProtectedRoute requiredRole="admin" />,
            children: [
              {
                path: 'users',
                element: <AdminUsersPage />,
              },
              {
                path: 'settings',
                element: <AdminSettingsPage />,
              },
              {
                path: 'events',
                element: <AdminEventsPage />,
              },
              {
                path: 'audit-logs',
                element: <AdminAuditLogsPage />,
              },
              {
                path: 'badges',
                element: <AdminBadgesPage />,
              },
              {
                path: 'category-requests',
                element: <AdminCategoryRequestsPage />,
              },
              {
                path: 'appeals',
                element: <AdminAppealsPage />,
              },
              {
                path: 'about',
                element: <AdminEditAboutPage />,
              },
            ]
          }
        ]
      }
    ],
  }
])
