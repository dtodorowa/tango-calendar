export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      event_i18n: {
        Row: {
          description: string;
          event_id: string;
          is_human_edited: boolean;
          locale: string;
          note: string;
          source_hash: string;
          title: string;
        };
        Insert: {
          description?: string;
          event_id: string;
          is_human_edited?: boolean;
          locale: string;
          note?: string;
          source_hash?: string;
          title: string;
        };
        Update: {
          description?: string;
          event_id?: string;
          is_human_edited?: boolean;
          locale?: string;
          note?: string;
          source_hash?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_i18n_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          }
        ];
      };
      events: {
        Row: {
          categories: string[];
          created_at: string;
          dtstart_local: string;
          duration_minutes: number;
          hero_photo: string | null;
          id: string;
          org_id: string;
          price_amount: number | null;
          price_kind: string;
          rrule: string;
          source_lang: string;
          status: string;
          tags: string[];
          timezone: string;
          updated_at: string;
          venue_id: string;
        };
        Insert: {
          categories: string[];
          created_at?: string;
          dtstart_local: string;
          duration_minutes: number;
          hero_photo?: string | null;
          id?: string;
          org_id: string;
          price_amount?: number | null;
          price_kind?: string;
          rrule: string;
          source_lang?: string;
          status?: string;
          tags?: string[];
          timezone?: string;
          updated_at?: string;
          venue_id: string;
        };
        Update: {
          categories?: string[];
          created_at?: string;
          dtstart_local?: string;
          duration_minutes?: number;
          hero_photo?: string | null;
          id?: string;
          org_id?: string;
          price_amount?: number | null;
          price_kind?: string;
          rrule?: string;
          source_lang?: string;
          status?: string;
          tags?: string[];
          timezone?: string;
          updated_at?: string;
          venue_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_venue_id_fkey';
            columns: ['venue_id'];
            isOneToOne: false;
            referencedRelation: 'venues';
            referencedColumns: ['id'];
          }
        ];
      };
      memberships: {
        Row: {
          created_at: string;
          id: string;
          org_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          org_id: string;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          org_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'memberships_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          }
        ];
      };
      occurrence_overrides: {
        Row: {
          event_id: string;
          id: string;
          occ_date: string;
          override_start_local: string | null;
          override_venue_id: string | null;
          status: string;
        };
        Insert: {
          event_id: string;
          id?: string;
          occ_date: string;
          override_start_local?: string | null;
          override_venue_id?: string | null;
          status: string;
        };
        Update: {
          event_id?: string;
          id?: string;
          occ_date?: string;
          override_start_local?: string | null;
          override_venue_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'occurrence_overrides_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'occurrence_overrides_override_venue_id_fkey';
            columns: ['override_venue_id'];
            isOneToOne: false;
            referencedRelation: 'venues';
            referencedColumns: ['id'];
          }
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          slug: string;
          social_links: string[];
          website: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          slug: string;
          social_links?: string[];
          website?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          slug?: string;
          social_links?: string[];
          website?: string | null;
        };
        Relationships: [];
      };
      venues: {
        Row: {
          address: string;
          city: string;
          country: string;
          created_at: string;
          id: string;
          lat: number;
          lng: number;
          name: string;
          org_id: string;
        };
        Insert: {
          address: string;
          city: string;
          country?: string;
          created_at?: string;
          id?: string;
          lat: number;
          lng: number;
          name: string;
          org_id: string;
        };
        Update: {
          address?: string;
          city?: string;
          country?: string;
          created_at?: string;
          id?: string;
          lat?: number;
          lng?: number;
          name?: string;
          org_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'venues_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      are_http_urls: { Args: { urls: string[] }; Returns: boolean };
      create_organization: {
        Args: {
          p_email?: string;
          p_name: string;
          p_phone?: string;
          p_slug: string;
          p_social_links?: string[];
          p_website?: string;
        };
        Returns: {
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          slug: string;
          social_links: string[];
          website: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'organizations';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      is_org_member: { Args: { target_org: string }; Returns: boolean };
      is_org_owner: { Args: { target_org: string }; Returns: boolean };
      save_event: {
        Args: { p_event: Json; p_id: string; p_translations: Json };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {}
  },
  public: {
    Enums: {}
  }
} as const;
