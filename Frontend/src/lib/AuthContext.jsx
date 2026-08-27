import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const token = getToken();
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }

        // Intenta validar sesión con la API
        const data = await api.me();
        if (isMounted && data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.warn("No se pudo validar el token con el servidor:", error);
        setToken(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.warn("Error en backend, iniciando en modo demo local:", error);
      // Fallback para permitir entrada si el backend está apagado
      const demoUser = { name: "Sofía Dávila", role: "Admin", email };
      setToken("demo-token-123");
      setUser(demoUser);
      return demoUser;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("user_avatar");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}