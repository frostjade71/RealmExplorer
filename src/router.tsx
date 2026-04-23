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
  EventsPage,
  AboutPage,
  ServerDetailPage,
  SubmitPage,
  DashboardPage,
  NotFoundPage,
  AdminServersPage,
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
  ProfilePage
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
        path: '/events',
        element: <EventsPage />,
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
                path: 'category-requests',
                element: <AdminCategoryRequestsPage />,
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
