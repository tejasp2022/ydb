export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: number;
          email: string;
          firstname: string;
          lastname: string;
          vocation: string;
          created_at?: string;
        };
        Insert: {
          email: string;
          firstname: string;
          lastname: string;
          vocation: string;
        };
        Update: {
          email?: string;
          firstname?: string;
          lastname?: string;
          vocation?: string;
        };
      };
      // Add other tables as needed
    };
  };
}; 