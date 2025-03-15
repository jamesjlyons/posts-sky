import { createContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  showLoginDialog: boolean;
  setShowLoginDialog: (value: boolean) => void;
  handleLogout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);