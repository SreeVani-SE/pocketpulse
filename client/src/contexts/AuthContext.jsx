import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function safeParseProfile() {
  const raw = localStorage.getItem("pp_profile");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("pp_token"));
  const [profile, setProfile] = useState(() => safeParseProfile());

  const value = useMemo(
    () => ({
      token,
      profile,
      isAuthed: Boolean(token),
      login: ({ token, profile }) => {
        setToken(token);
        setProfile(profile);
        localStorage.setItem("pp_token", token);
        localStorage.setItem("pp_profile", JSON.stringify(profile));
      },
      logout: () => {
        setToken(null);
        setProfile(null);
        localStorage.removeItem("pp_token");
        localStorage.removeItem("pp_profile");
      },
    }),
    [token, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
