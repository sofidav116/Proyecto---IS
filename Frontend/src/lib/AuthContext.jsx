import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { setToken, getToken, api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const savedUser = localStorage.getItem("smartflow_session");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (identifier, password) => {
    let userData = null;
    let token = null;

    // 1. Intentar autenticar contra el backend Node.js / Express
    try {
      const data = await api.login(identifier, password);
      token = data.token || data.accessToken || `token_${Date.now()}`;
      userData = data.user || {
        id: data.id || "usr_1",
        nombre_completo: data.nombre_completo || data.nombre || "Usuario",
        username: data.username || identifier.split("@")[0],
        email: data.email || identifier,
      };
    } catch {
      // 2. Fallback: Si la API del backend falla o el usuario no existe en la BD real,
      // buscamos en la base de datos local guardada al registrarse
      const localUsers = JSON.parse(localStorage.getItem("smartflow_users_db") || "[]");
      const foundLocalUser = localUsers.find(
        (u) =>
          (u.email?.toLowerCase() === identifier.toLowerCase() ||
           u.username?.toLowerCase() === identifier.toLowerCase()) &&
          u.password_hash === password
      );

      if (!foundLocalUser) {
        throw new Error("Correo, usuario o contraseña incorrectos.");
      }

      token = `demo_token_${Date.now()}`;
      userData = {
        id: foundLocalUser.id,
        nombre_completo: foundLocalUser.nombre_completo || foundLocalUser.nombre,
        username: foundLocalUser.username,
        email: foundLocalUser.email,
      };
    }

    setToken(token);
    setUser(userData);
    localStorage.setItem("smartflow_session", JSON.stringify(userData));
    return userData;
  }, []);

  const register = useCallback(async ({ nombre_completo, username, email, password }) => {
    // Guardar usuario en la base de datos local
    const localUsers = JSON.parse(localStorage.getItem("smartflow_users_db") || "[]");

    const emailExists = localUsers.some((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (emailExists) throw new Error("El correo ya está registrado.");

    const usernameExists = localUsers.some((u) => u.username?.toLowerCase() === username.toLowerCase());
    if (usernameExists) throw new Error("El nombre de usuario ya está en uso.");

    const newUser = {
      id: `usr_${Date.now()}`,
      nombre_completo,
      username,
      email,
      password_hash: password,
      creado_en: new Date().toISOString(),
    };

    localUsers.push(newUser);
    localStorage.setItem("smartflow_users_db", JSON.stringify(localUsers));

    const token = `token_${Date.now()}`;
    const userData = {
      id: newUser.id,
      nombre_completo: newUser.nombre_completo,
      username: newUser.username,
      email: newUser.email,
    };

    setToken(token);
    setUser(userData);
    localStorage.setItem("smartflow_session", JSON.stringify(userData));
    return userData;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("smartflow_session");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
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