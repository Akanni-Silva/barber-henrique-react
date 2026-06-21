// src/types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  getToken: () => string | null;
}
