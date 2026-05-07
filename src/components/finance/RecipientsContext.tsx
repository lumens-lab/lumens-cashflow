import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Recipient {
  id: string;
  name: string;
  phone: string;
  avatar_url: string | null;
  notes: string | null;
}

interface Ctx {
  recipients: Recipient[];
  loading: boolean;
  addRecipient: (r: Omit<Recipient, "id">) => Promise<void>;
  removeRecipient: (id: string) => Promise<void>;
}

const C = createContext<Ctx | null>(null);

export const RecipientsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setRecipients([]); return; }
    setLoading(true);
    const { data } = await supabase.from("recipients" as any).select("*").order("created_at", { ascending: false });
    if (data) setRecipients(data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo<Ctx>(() => ({
    recipients,
    loading,
    addRecipient: async (r) => {
      if (!user) return;
      const { data, error } = await supabase.from("recipients" as any).insert({
        user_id: user.id, name: r.name, phone: r.phone, avatar_url: r.avatar_url, notes: r.notes,
      }).select().single();
      if (!error && data) setRecipients((p) => [data as any, ...p]);
    },
    removeRecipient: async (id) => {
      const { error } = await supabase.from("recipients" as any).delete().eq("id", id);
      if (!error) setRecipients((p) => p.filter((x) => x.id !== id));
    },
  }), [recipients, user, loading]);

  return <C.Provider value={value}>{children}</C.Provider>;
};

export const useRecipients = () => {
  const c = useContext(C);
  if (!c) throw new Error("useRecipients must be used within RecipientsProvider");
  return c;
};
