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

      // El backend (PostgreSQL) solo guarda "nombre" y "email", no un
      // "username" separado. Normalizamos aquí todos los alias que usan
      // las distintas páginas (name, nombre_completo, username, role) para
      // que no importe cuál de ellos lea cada componente.
      const backendUser = data.user;
      userData = backendUser
        ? {
            id: backendUser.id,
            name: backendUser.nombre,
            nombre_completo: backendUser.nombre,
            username: backendUser.email?.split("@")[0] || backendUser.nombre,
            email: backendUser.email,
            role: backendUser.role,
            organizationId: backendUser.organizationId,
          }
        : {
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
    let userData = null;
    let token = null;

    // 1. Registrar contra el backend Node.js / Express (fuente de verdad)
    try {
      const data = await api.register({ nombre_completo, username, email, password });
      token = data.token;
      userData = {
        id: data.user.id,
        nombre_completo: data.user.name,
        username,
        email: data.user.email,
      };
    } catch (err) {
      // Si el backend está caído, seguimos permitiendo trabajar offline con
      // datos locales, pero avisamos que las llamadas protegidas fallarán
      // hasta que el backend esté disponible.
      if (err.status === 409) throw err; // correo/usuario duplicado: no hacer fallback

      const localUsers = JSON.parse(localStorage.getItem("smartflow_users_db") || "[]");
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

      token = `demo-token::offline_${newUser.id}`;
      userData = { id: newUser.id, nombre_completo, username, email };
    }

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