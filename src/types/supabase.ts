export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assigned_badges: {
        Row: {
          badge_id: string
          granted_at: string | null
          id: string
          month: string | null
          server_id: string | null
          user_id: string | null
        }
        Insert: {
          badge_id: string
          granted_at?: string | null
          id?: string
          month?: string | null
          server_id?: string | null
          user_id?: string | null
        }
        Update: {
          badge_id?: string
          granted_at?: string | null
          id?: string
          month?: string | null
          server_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assigned_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_badges_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          discord_username: string | null
          id: string
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          discord_username?: string | null
          id?: string
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          discord_username?: string | null
          id?: string
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          name: string
          slug: string
          target_type: Database["public"]["Enums"]["badge_target_type"]
          type: Database["public"]["Enums"]["badge_type"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          name: string
          slug: string
          target_type?: Database["public"]["Enums"]["badge_target_type"]
          type?: Database["public"]["Enums"]["badge_type"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          name: string
          slug: string
          target_type?: Database["public"]["Enums"]["badge_target_type"]
          type?: Database["public"]["Enums"]["badge_type"]
        }
        Relationships: []
      }
      blog_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      category_requests: {
        Row: {
          created_at: string
          description: string
          id: string
          requester_id: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          requester_id: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          requester_id?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cooldowns: {
        Row: {
          expires_at: string
          id: string
          server_id: string | null
          user_id: string | null
        }
        Insert: {
          expires_at: string
          id?: string
          server_id?: string | null
          user_id?: string | null
        }
        Update: {
          expires_at?: string
          id?: string
          server_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cooldowns_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooldowns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otm_competitors: {
        Row: {
          category: string
          created_at: string | null
          id: string
          month: string | null
          server_id: string | null
          user_id: string | null
          vote_url: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          month?: string | null
          server_id?: string | null
          user_id?: string | null
          vote_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          month?: string | null
          server_id?: string | null
          user_id?: string | null
          vote_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "otm_competitors_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otm_competitors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otm_votes: {
        Row: {
          category: string | null
          competitor_id: string | null
          created_at: string | null
          id: string
          server_id: string | null
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          competitor_id?: string | null
          created_at?: string | null
          id?: string
          server_id?: string | null
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          competitor_id?: string | null
          created_at?: string | null
          id?: string
          server_id?: string | null
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "otm_votes_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "otm_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otm_votes_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otm_votes_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otm_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otm_winners: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          month: string
          server_id: string | null
          user_id: string | null
          winner_image_url: string | null
          winner_name: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          month: string
          server_id?: string | null
          user_id?: string | null
          winner_image_url?: string | null
          winner_name?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          month: string
          server_id?: string | null
          user_id?: string | null
          winner_image_url?: string | null
          winner_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "otm_winners_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otm_winners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          discord_avatar: string | null
          discord_banner: string | null
          discord_id: string | null
          discord_username: string | null
          id: string
          role: string
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          discord_avatar?: string | null
          discord_banner?: string | null
          discord_id?: string | null
          discord_username?: string | null
          id: string
          role?: string
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          discord_avatar?: string | null
          discord_banner?: string | null
          discord_id?: string | null
          discord_username?: string | null
          id?: string
          role?: string
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          message: string
          reporter_id: string
          server_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          reporter_id: string
          server_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          reporter_id?: string
          server_id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      server_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender_id: string | null
          server_id: string
          subject: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender_id?: string | null
          server_id: string
          subject: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string | null
          server_id?: string
          subject?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_messages_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: true
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      server_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          server_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          server_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          server_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_ratings_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          average_rating: number | null
          banner_url: string | null
          bedrock_ip: string | null
          category: string
          created_at: string | null
          description: string | null
          discord_url: string | null
          featured: boolean | null
          gallery: string[] | null
          icon_url: string | null
          id: string
          ip_or_code: string | null
          last_edited_at: string | null
          name: string
          owner_id: string | null
          port: number | null
          rating_count: number | null
          slug: string
          social_links: Json | null
          status: string
          submitter_role: string | null
          tags: string[] | null
          type: string
          updated_at: string | null
          verify_discord: boolean | null
          votes: number | null
          website_url: string | null
          weighted_rating: number | null
          yesterday_rating_rank: number | null
          yesterday_vote_rank: number | null
        }
        Insert: {
          average_rating?: number | null
          banner_url?: string | null
          bedrock_ip?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          discord_url?: string | null
          featured?: boolean | null
          gallery?: string[] | null
          icon_url?: string | null
          id?: string
          ip_or_code?: string | null
          last_edited_at?: string | null
          name: string
          owner_id?: string | null
          port?: number | null
          rating_count?: number | null
          slug: string
          social_links?: Json | null
          status?: string
          submitter_role?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string | null
          verify_discord?: boolean | null
          votes?: number | null
          website_url?: string | null
          weighted_rating?: number | null
          yesterday_rating_rank?: number | null
          yesterday_vote_rank?: number | null
        }
        Update: {
          average_rating?: number | null
          banner_url?: string | null
          bedrock_ip?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          discord_url?: string | null
          featured?: boolean | null
          gallery?: string[] | null
          icon_url?: string | null
          id?: string
          ip_or_code?: string | null
          last_edited_at?: string | null
          name?: string
          owner_id?: string | null
          port?: number | null
          rating_count?: number | null
          slug?: string
          social_links?: Json | null
          status?: string
          submitter_role?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          verify_discord?: boolean | null
          votes?: number | null
          website_url?: string | null
          weighted_rating?: number | null
          yesterday_rating_rank?: number | null
          yesterday_vote_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "servers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          role_title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          role_title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          role_title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string | null
          id: string
          server_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          server_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          server_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      get_top_storage_consumers: {
        Args: never
        Returns: {
          bucket_id: string
          created_at: string
          mimetype: string
          name: string
          size_kb: number
        }[]
      }
      reset_all_cooldowns: { Args: never; Returns: undefined }
      reset_otm_cooldowns: { Args: never; Returns: undefined }
      update_yesterday_ranks: { Args: never; Returns: undefined }
    }
    Enums: {
      badge_target_type: "user" | "server"
      badge_type: "manual" | "automatic"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      badge_target_type: ["user", "server"],
      badge_type: ["manual", "automatic"],
    },
  },
} as const
