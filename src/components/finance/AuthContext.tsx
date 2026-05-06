import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  email: string | null;
  transaction_pin_hash: string | null;
}

interface Ctx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: ProfileRow | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<ProfileRow>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<Ctx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (data) setProfile(data as ProfileRow);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) setTimeout(() => loadProfile(s.user.id), 0);
      else setProfile(null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const updateProfile = useCallback(async (patch: Partial<ProfileRow>) => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", session.user.id)
      .select()
      .single();
    if (!error && data) setProfile(data as ProfileRow);
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        profile,
        refreshProfile,
        updateProfile,
        signOut: async () => { await supabase.auth.signOut(); },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
