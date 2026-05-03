import type { ServerStatus } from '../types';
import { supabase } from './supabase';

export async function sendApprovalNotification(params: {
  serverName: string;
  adminName: string;
  slug: string;
  iconUrl?: string | null;
  type?: 'new_listing' | 'asset_update';
  target?: 'public' | 'logs';
  previousStatus?: string | null;
}) {
  try {
    const { error } = await supabase.functions.invoke('discord-notification', {
      body: {
        type: 'approval',
        payload: {
          serverName: params.serverName,
          adminName: params.adminName,
          slug: params.slug,
          iconUrl: params.iconUrl,
          approvalType: params.type || 'new_listing',
          target: params.target || 'public',
          previousStatus: params.previousStatus,
        }
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to send Discord approval notification:', error);
  }
}

export async function sendStaffReviewNotification(params: {
  serverName: string;
  status?: ServerStatus;
  iconUrl?: string | null;
}) {
  try {
    const { error } = await supabase.functions.invoke('discord-notification', {
      body: {
        type: 'staff_review',
        payload: {
          serverName: params.serverName,
          status: params.status || 'pending',
          iconUrl: params.iconUrl,
        }
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to send Staff notification:', error);
  }
}

export async function sendLogNotification(params: {
  action: string;
  adminName?: string | null;
  details: string;
  color?: number;
}) {
  try {
    const { error } = await supabase.functions.invoke('discord-notification', {
      body: {
        type: 'log',
        payload: {
          action: params.action,
          adminName: params.adminName,
          details: params.details,
          color: params.color,
        }
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to send Discord log:', error);
  }
}

export async function sendErrorNotification(params: {
  error: any;
  context: string;
  userEmail?: string | null;
}) {
  try {
    const { error } = await supabase.functions.invoke('discord-notification', {
      body: {
        type: 'error',
        payload: {
          error: params.error,
          context: params.context,
          userEmail: params.userEmail,
        }
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to send Discord error log:', error);
  }
}
