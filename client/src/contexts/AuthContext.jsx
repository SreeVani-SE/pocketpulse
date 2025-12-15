import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);

  // 🔁 Rehydrate auth on refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("pp_token");
    const savedProfile = localStorage.getItem("pp_profile");

    if (savedToken && savedProfile) {
      setToken(savedToken);
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

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
