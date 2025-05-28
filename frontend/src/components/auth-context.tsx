"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: number;
  name: string;
  email: string;
  fitnessGoals: string[];
  level: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthData = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem("token");
    if (token) {
      // Basic token format validation before making request
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Invalid token format found in localStorage");
        clearAuthData();
        setLoading(false);
        return;
      }

      // Verify token is still valid by making a request
      fetch("http://localhost:3001/api/auth/verify", {
        headers: {
          "x-auth-token": token.trim(),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          } else {
            clearAuthData();
          }
        })
        .catch((error) => {
          console.error("Token verification failed:", error);
          clearAuthData();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Validate token format before storing
    if (data.token) {
      const tokenParts = data.token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format received from server");
      }
      localStorage.setItem("token", data.token.trim());
      setUser(data.user);
    } else {
      throw new Error("No token received from server");
    }
  };

  const register = async (userData: any) => {
    const response = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    // Validate token format before storing
    if (data.token) {
      const tokenParts = data.token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format received from server");
      }
      localStorage.setItem("token", data.token.trim());
      setUser(data.user);
    } else {
      throw new Error("No token received from server");
    }
  };

  const logout = () => {
    clearAuthData();
    // Redirect to login page using React Router
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
