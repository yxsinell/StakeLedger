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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_pockets: {
        Row: {
          balance: number
          bank_id: string
          id: string
          pocket_type: string
        }
        Insert: {
          balance?: number
          bank_id: string
          id?: string
          pocket_type: string
        }
        Update: {
          balance?: number
          bank_id?: string
          id?: string
          pocket_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_pockets_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
        ]
      }
      banks: {
        Row: {
          created_at: string
          currency: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bet_cashouts: {
        Row: {
          bet_id: string
          cashout_amount: number
          created_at: string
          id: string
          idempotency_key: string | null
          remaining_stake: number
          source_bet_id: string | null
          split_group_id: string | null
        }
        Insert: {
          bet_id: string
          cashout_amount: number
          created_at?: string
          id?: string
          idempotency_key?: string | null
          remaining_stake: number
          source_bet_id?: string | null
          split_group_id?: string | null
        }
        Update: {
          bet_id?: string
          cashout_amount?: number
          created_at?: string
          id?: string
          idempotency_key?: string | null
          remaining_stake?: number
          source_bet_id?: string | null
          split_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bet_cashouts_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bet_cashouts_source_bet_id_fkey"
            columns: ["source_bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
        ]
      }
      bet_funding: {
        Row: {
          amount: number
          bet_id: string
          created_at: string
          id: string
          pocket_type: string
          reserved_transaction_id: string | null
        }
        Insert: {
          amount: number
          bet_id: string
          created_at?: string
          id?: string
          pocket_type: string
          reserved_transaction_id?: string | null
        }
        Update: {
          amount?: number
          bet_id?: string
          created_at?: string
          id?: string
          pocket_type?: string
          reserved_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bet_funding_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bet_funding_reserved_transaction_id_fkey"
            columns: ["reserved_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      bet_legs: {
        Row: {
          bet_id: string
          event_id: string | null
          id: string
          market: string
          market_id: string | null
          odds: number
          selection: string
        }
        Insert: {
          bet_id: string
          event_id?: string | null
          id?: string
          market: string
          market_id?: string | null
          odds: number
          selection: string
        }
        Update: {
          bet_id?: string
          event_id?: string | null
          id?: string
          market?: string
          market_id?: string | null
          odds?: number
          selection?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_legs_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bet_legs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "catalog_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bet_legs_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "catalog_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          bank_id: string
          created_at: string
          funding_status: string
          goal_id: string | null
          id: string
          idempotency_key: string | null
          odds: number
          profit_amount: number | null
          reserved_transaction_id: string | null
          result: string | null
          return_amount: number | null
          settled_at: string | null
          settlement_amount: number | null
          stake_amount: number
          stake_level: string | null
          status: string
        }
        Insert: {
          bank_id: string
          created_at?: string
          funding_status?: string
          goal_id?: string | null
          id?: string
          idempotency_key?: string | null
          odds: number
          profit_amount?: number | null
          reserved_transaction_id?: string | null
          result?: string | null
          return_amount?: number | null
          settled_at?: string | null
          settlement_amount?: number | null
          stake_amount: number
          stake_level?: string | null
          status: string
        }
        Update: {
          bank_id?: string
          created_at?: string
          funding_status?: string
          goal_id?: string | null
          id?: string
          idempotency_key?: string | null
          odds?: number
          profit_amount?: number | null
          reserved_transaction_id?: string | null
          result?: string | null
          return_amount?: number | null
          settled_at?: string | null
          settlement_amount?: number | null
          stake_amount?: number
          stake_level?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_reserved_transaction_id_fkey"
            columns: ["reserved_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_aliases: {
        Row: {
          alias: string
          competition_id: string | null
          created_at: string
          created_by: string
          id: string
          normalized_alias: string | null
          team_id: string | null
        }
        Insert: {
          alias: string
          competition_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          normalized_alias?: string | null
          team_id?: string | null
        }
        Update: {
          alias?: string
          competition_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          normalized_alias?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_aliases_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "catalog_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_aliases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_aliases_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "catalog_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_competitions: {
        Row: {
          country: string | null
          created_at: string
          created_by: string
          external_id: string | null
          id: string
          name: string
          normalization_status: string
          normalized_name: string | null
          provider: string | null
          sport: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          created_by: string
          external_id?: string | null
          id?: string
          name: string
          normalization_status?: string
          normalized_name?: string | null
          provider?: string | null
          sport: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          created_by?: string
          external_id?: string | null
          id?: string
          name?: string
          normalization_status?: string
          normalized_name?: string | null
          provider?: string | null
          sport?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_competitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_events: {
        Row: {
          away_team_id: string
          competition_id: string
          created_at: string
          created_by: string
          external_id: string | null
          home_team_id: string
          id: string
          provider: string | null
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          away_team_id: string
          competition_id: string
          created_at?: string
          created_by: string
          external_id?: string | null
          home_team_id: string
          id?: string
          provider?: string | null
          starts_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          away_team_id?: string
          competition_id?: string
          created_at?: string
          created_by?: string
          external_id?: string | null
          home_team_id?: string
          id?: string
          provider?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_events_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "catalog_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_events_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "catalog_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_events_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "catalog_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_markets: {
        Row: {
          created_at: string
          created_by: string
          event_id: string
          external_id: string | null
          id: string
          name: string
          normalized_name: string | null
          provider: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id: string
          external_id?: string | null
          id?: string
          name: string
          normalized_name?: string | null
          provider?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string
          external_id?: string | null
          id?: string
          name?: string
          normalized_name?: string | null
          provider?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_markets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_markets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "catalog_events"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_teams: {
        Row: {
          country: string | null
          created_at: string
          created_by: string
          external_id: string | null
          id: string
          name: string
          normalization_status: string
          normalized_name: string | null
          provider: string | null
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          created_by: string
          external_id?: string | null
          id?: string
          name: string
          normalization_status?: string
          normalized_name?: string | null
          provider?: string | null
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          created_by?: string
          external_id?: string | null
          id?: string
          name?: string
          normalization_status?: string
          normalized_name?: string | null
          provider?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_history: {
        Row: {
          base_amount: number | null
          bet_id: string | null
          created_at: string
          current_amount: number | null
          daily_profit: number | null
          event_type: string
          goal_id: string
          id: string
          mission_date: string | null
          remaining_amount: number | null
          suggested_odds: number | null
        }
        Insert: {
          base_amount?: number | null
          bet_id?: string | null
          created_at?: string
          current_amount?: number | null
          daily_profit?: number | null
          event_type: string
          goal_id: string
          id?: string
          mission_date?: string | null
          remaining_amount?: number | null
          suggested_odds?: number | null
        }
        Update: {
          base_amount?: number | null
          bet_id?: string | null
          created_at?: string
          current_amount?: number | null
          daily_profit?: number | null
          event_type?: string
          goal_id?: string
          id?: string
          mission_date?: string | null
          remaining_amount?: number | null
          suggested_odds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_history_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_history_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          bank_id: string
          base_amount: number
          closed_at: string | null
          closure_reason: string | null
          created_at: string
          daily_profit: number
          deadline: string
          id: string
          stake_preference: number | null
          status: string
          strategy: string | null
          suggested_odds: number | null
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_id: string
          base_amount: number
          closed_at?: string | null
          closure_reason?: string | null
          created_at?: string
          daily_profit?: number
          deadline: string
          id?: string
          stake_preference?: number | null
          status?: string
          strategy?: string | null
          suggested_odds?: number | null
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_id?: string
          base_amount?: number
          closed_at?: string | null
          closure_reason?: string | null
          created_at?: string
          daily_profit?: number
          deadline?: string
          id?: string
          stake_preference?: number | null
          status?: string
          strategy?: string | null
          suggested_odds?: number | null
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_follows: {
        Row: {
          bank_id: string | null
          created_at: string
          id: string
          recommendation_id: string
          user_id: string
        }
        Insert: {
          bank_id?: string | null
          created_at?: string
          id?: string
          recommendation_id: string
          user_id: string
        }
        Update: {
          bank_id?: string | null
          created_at?: string
          id?: string
          recommendation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_follows_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_follows_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          created_at: string
          created_by: string
          event_id: string
          icp: Json
          id: string
          market_id: string
          odds: number
          published_at: string | null
          rationale: string | null
          selection: string
          status: string
          type: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id: string
          icp?: Json
          id?: string
          market_id: string
          odds: number
          published_at?: string | null
          rationale?: string | null
          selection: string
          status?: string
          type: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string
          icp?: Json
          id?: string
          market_id?: string
          odds?: number
          published_at?: string | null
          rationale?: string | null
          selection?: string
          status?: string
          type?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "catalog_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "catalog_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_limits: {
        Row: {
          created_at: string
          id: string
          max_daily_loss: number | null
          max_odds: number | null
          max_stake_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_daily_loss?: number | null
          max_odds?: number | null
          max_stake_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_daily_loss?: number | null
          max_odds?: number | null
          max_stake_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_idempotencies: {
        Row: {
          created_at: string
          idempotency_key: string
          request_payload: Json
          response_payload: Json
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          idempotency_key: string
          request_payload: Json
          response_payload: Json
          transaction_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          idempotency_key?: string
          request_payload?: Json
          response_payload?: Json
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_idempotencies_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_idempotencies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          bank_id: string
          created_at: string
          id: string
          idempotency_key: string | null
          method: string | null
          pocket_type: string
          related_transaction_id: string | null
          transfer_id: string | null
          type: string
        }
        Insert: {
          amount: number
          bank_id: string
          created_at?: string
          id?: string
          idempotency_key?: string | null
          method?: string | null
          pocket_type: string
          related_transaction_id?: string | null
          transfer_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          bank_id?: string
          created_at?: string
          id?: string
          idempotency_key?: string | null
          method?: string | null
          pocket_type?: string
          related_transaction_id?: string | null
          transfer_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_bank_with_pockets: {
        Args: {
          p_currency: string
          p_initial_bonus: number
          p_initial_cash: number
          p_initial_freebet: number
          p_name: string
        }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      is_catalog_editor: { Args: never; Returns: boolean }
      record_cash_transaction: {
        Args: {
          p_amount: number
          p_bank_id: string
          p_idempotency_key: string
          p_method: string
          p_type: string
        }
        Returns: Json
      }
      record_cash_transfer: {
        Args: {
          p_actor_user_id: string
          p_amount: number
          p_destination_bank_id: string
          p_idempotency_key: string
          p_source_bank_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
