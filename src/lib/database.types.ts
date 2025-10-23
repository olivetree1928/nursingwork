export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'patient' | 'caregiver';
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'patient' | 'caregiver';
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'patient' | 'caregiver';
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      caregiver_profiles: {
        Row: {
          id: string;
          user_id: string;
          gender: 'male' | 'female' | 'other' | null;
          age: number | null;
          years_of_experience: number;
          skills: string[];
          bio: string | null;
          hourly_rate: number;
          is_available: boolean;
          rating_average: number;
          total_reviews: number;
          certifications: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          gender?: 'male' | 'female' | 'other' | null;
          age?: number | null;
          years_of_experience?: number;
          skills?: string[];
          bio?: string | null;
          hourly_rate: number;
          is_available?: boolean;
          rating_average?: number;
          total_reviews?: number;
          certifications?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          gender?: 'male' | 'female' | 'other' | null;
          age?: number | null;
          years_of_experience?: number;
          skills?: string[];
          bio?: string | null;
          hourly_rate?: number;
          is_available?: boolean;
          rating_average?: number;
          total_reviews?: number;
          certifications?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          patient_id: string;
          caregiver_id: string;
          service_type: string;
          start_time: string;
          end_time: string;
          total_hours: number;
          hourly_rate: number;
          total_cost: number;
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          special_requirements: string | null;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          caregiver_id: string;
          service_type: string;
          start_time: string;
          end_time: string;
          total_hours: number;
          hourly_rate: number;
          total_cost: number;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          special_requirements?: string | null;
          address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          caregiver_id?: string;
          service_type?: string;
          start_time?: string;
          end_time?: string;
          total_hours?: number;
          hourly_rate?: number;
          total_cost?: number;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          special_requirements?: string | null;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          caregiver_id: string;
          patient_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          caregiver_id: string;
          patient_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          caregiver_id?: string;
          patient_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      training_resources: {
        Row: {
          id: string;
          title: string;
          description: string;
          content_type: 'video' | 'article' | 'document';
          content_url: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          content_type: 'video' | 'article' | 'document';
          content_url: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          content_type?: 'video' | 'article' | 'document';
          content_url?: string;
          category?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'booking' | 'payment' | 'review' | 'system';
          is_read: boolean;
          related_booking_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: 'booking' | 'payment' | 'review' | 'system';
          is_read?: boolean;
          related_booking_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'booking' | 'payment' | 'review' | 'system';
          is_read?: boolean;
          related_booking_id?: string | null;
          created_at?: string;
        };
      };
      payment_records: {
        Row: {
          id: string;
          booking_id: string;
          patient_id: string;
          amount: number;
          payment_method: string;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          transaction_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          patient_id: string;
          amount: number;
          payment_method: string;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          patient_id?: string;
          amount?: number;
          payment_method?: string;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
