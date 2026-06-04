import { useState } from "react";
import { ChevronLeft, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Category, COLOR_OPTIONS, ICONS, ICON_NAMES, IconName, Kind, useCategories } from "./CategoriesContext";
import { useSettings } from "./SettingsContext";

const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="px-5 pt-3 pb-3 flex items-center gap-3">
    <button onClick={onBack} className="w-10 h-10 rounded-xl glass flex items-center justify-center active:scale-95 transition-transform" aria-label="Back">
      <ChevronLeft className="w-5 h-5 text-foreground" />
    </button>
    <h2 className="font-syne text-[18px] font-bold text-foreground flex-1">{title}</h2>
  </div>
);

const IconPicker = ({ value, onChange }: { value: IconName; onChange: (n: IconName) => void }) => (
  <div className="grid grid-cols-7 gap-2 max-h-44 overflow-y-auto no-scrollbar p-1">
    {ICON_NAMES.map((n) => {
      const Icon = ICONS[n];
      const active = value === n;
      return (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`aspect-square rounded-xl flex items-center justify-center transition-all ${active ? "bg-primary/30 ring-2 ring-primary-glow" : "glass"}`}
          aria-label={n}
        >
          <Icon className="w-4 h-4 text-foreground" />
        </button>
      );
    })}
  </div>
);

const ColorPicker = ({ value, onChange }: { value: string; onChange: (c: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {COLOR_OPTIONS.map((c) => (
      <button
        key={c}
        onClick={() => onChange(c)}
        className={`w-7 h-7 rounded-full transition-all ${value === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" : ""}`}
        style={{ background: c }}
        aria-label={`Color ${c}`}
      />
    ))}
  </div>
);

interface EditorState {
  name: string;
  icon: IconName;
  color: string;
  amount?: string;
}

export const CategoryEditor = ({
  kind,
  title,
  onBack,
  withAmount,
}: {
  kind: Kind;
  title: string;
  onBack: () => void;
  withAmount?: boolean;
}) => {
  const cats = useCategories();
  const list = cats[kind];
  const { symbolOf, mainCurrency } = useSettings();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditorState | null>(null);

  const startAdd = () => {
    setEditingId("new");
    setDraft({ name: "", icon: "Tag", color: COLOR_OPTIONS[0], amount: withAmount ? "" : undefined });
  };
  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setDraft({ name: c.name, icon: c.icon, color: c.color, amount: withAmount ? String(c.amount ?? "") : undefined });
  };
  const cancel = () => { setEditingId(null); setDraft(null); };
  const save = () => {
    if (!draft || !draft.name.trim()) return;
    const payload: Partial<Category> = {
      name: draft.name.trim().slice(0, 30),
      icon: draft.icon,
      color: draft.color,
    };
    if (withAmount) payload.amount = parseFloat(draft.amount || "0") || 0;
    if (editingId === "new") {
      cats.add(kind, { name: payload.name!, icon: payload.icon!, color: payload.color!, amount: payload.amount });
    } else if (editingId) {
      cats.update(kind, editingId, payload);
    }
    cancel();
  };

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title={title} onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-44 px-5 space-y-3">
        {list.map((c) => {
          const Icon = ICONS[c.icon] ?? ICONS.Tag;
          const isEditing = editingId === c.id;
          if (isEditing && draft) {
            return (
              <EditorCard key={c.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} withAmount={withAmount} symbol={symbolOf(mainCurrency)} />
            );
          }
          return (
            <div key={c.id} className="glass rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${c.color}22`, border: `1px solid ${c.color}55` }}>
                <Icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{c.name}</p>
                {withAmount && (
                  <p className="text-[11px] text-muted-foreground">{symbolOf(mainCurrency)}{(c.amount ?? 0).toFixed(2)} / month</p>
                )}
              </div>
              <button onClick={() => startEdit(c)} className="w-9 h-9 rounded-xl glass flex items-center justify-center" aria-label="Edit">
                <Pencil className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button onClick={() => cats.remove(kind, c.id)} className="w-9 h-9 rounded-xl bg-destructive/15 flex items-center justify-center" aria-label="Remove">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          );
        })}

        {editingId === "new" && draft && (
          <EditorCard draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} withAmount={withAmount} symbol={symbolOf(mainCurrency)} />
        )}

        {editingId !== "new" && (
          <button
            onClick={startAdd}
            className="w-full glass rounded-2xl p-3.5 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform border border-dashed border-primary/30"
          >
            <Plus className="w-4 h-4 text-primary-glow" />
            <span className="font-syne text-[12px] font-bold uppercase tracking-wider text-foreground">Add Category</span>
          </button>
        )}
      </div>
    </div>
  );
};

const EditorCard = ({
  draft, setDraft, onSave, onCancel, withAmount, symbol,
}: {
  draft: EditorState;
  setDraft: (s: EditorState) => void;
  onSave: () => void;
  onCancel: () => void;
  withAmount?: boolean;
  symbol: string;
}) => {
  const Icon = ICONS[draft.icon] ?? ICONS.Tag;
  return (
    <div className="glass-strong rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${draft.color}22`, border: `1px solid ${draft.color}55` }}>
          <Icon className="w-5 h-5" style={{ color: draft.color }} />
        </div>
        <input
          autoFocus
          value={draft.name}
          maxLength={30}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Category name"
          className="flex-1 glass rounded-xl px-3 py-2 outline-none text-[13px] text-foreground placeholder:text-muted-foreground bg-transparent"
        />
      </div>

      {withAmount && (
        <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
          <span className="font-mono-jb text-muted-foreground">{symbol}</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.amount}
            onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
            placeholder="Monthly limit"
            className="flex-1 bg-transparent outline-none font-mono-jb text-[14px] text-foreground"
          />
        </div>
      )}

      <div>
        <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Color</p>
        <ColorPicker value={draft.color} onChange={(c) => setDraft({ ...draft, color: c })} />
      </div>

      <div>
        <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Icon</p>
        <IconPicker value={draft.icon} onChange={(n) => setDraft({ ...draft, icon: n })} />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button onClick={onCancel} className="py-2.5 rounded-xl glass flex items-center justify-center gap-1 font-syne font-bold text-[11px] uppercase tracking-wider text-foreground">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
        <button onClick={onSave} className="py-2.5 rounded-xl gradient-primary-bg text-primary-foreground flex items-center justify-center gap-1 font-syne font-bold text-[11px] uppercase tracking-wider">
          <Check className="w-3.5 h-3.5" /> Save
        </button>
      </div>
    </div>
  );
};

/* ---------- Accounts Editor ---------- */

export const AccountsEditor = ({ onBack }: { onBack: () => void }) => {
  const { accounts, addAccount, updateAccount, removeAccount } = useSettings();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; type: "Checking" | "Savings" | "Credit Card" | "Cash" | "Other"; details: string } | null>(null);

  const startAdd = () => { setEditingId("new"); setDraft({ name: "", type: "Checking", details: "" }); };
  const startEdit = (a: typeof accounts[number]) => { setEditingId(a.id); setDraft({ name: a.name, type: a.type, details: (a as any).details ?? "" }); };
  const cancel = () => { setEditingId(null); setDraft(null); };
  const save = () => {
    if (!draft || !draft.name.trim()) return;
    if (editingId === "new") {
      addAccount({ name: draft.name.trim().slice(0, 30), type: draft.type, includeInTotals: true, ...(draft.details ? { details: draft.details.slice(0, 60) } as any : {}) });
    } else if (editingId) {
      updateAccount(editingId, { name: draft.name.trim().slice(0, 30), type: draft.type, ...(draft.details ? { details: draft.details.slice(0, 60) } as any : {}) });
    }
    cancel();
  };

  const TYPES: ("Checking" | "Savings" | "Credit Card" | "Cash" | "Other")[] = ["Checking", "Savings", "Credit Card", "Cash", "Other"];

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Accounts Setting" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-44 px-5 space-y-3">
        {accounts.map((a) => {
          const isEditing = editingId === a.id;
          if (isEditing && draft) {
            return <AccountEditorCard key={a.id} draft={draft} setDraft={setDraft} types={TYPES} onSave={save} onCancel={cancel} />;
          }
          return (
            <div key={a.id} className="glass rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <span className="font-syne text-[11px] font-bold text-primary-glow">{a.name[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{a.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{a.type}{(a as any).details ? ` · ${(a as any).details}` : ""}</p>
              </div>
              <button onClick={() => updateAccount(a.id, { includeInTotals: !a.includeInTotals })} className={`relative w-10 h-5 rounded-full transition-colors ${a.includeInTotals ? "gradient-primary-bg" : "bg-muted"}`} aria-label="Include in totals">
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${a.includeInTotals ? "translate-x-5" : ""}`} />
              </button>
              <button onClick={() => startEdit(a)} className="w-9 h-9 rounded-xl glass flex items-center justify-center" aria-label="Edit">
                <Pencil className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button onClick={() => removeAccount(a.id)} className="w-9 h-9 rounded-xl bg-destructive/15 flex items-center justify-center" aria-label="Remove">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          );
        })}

        {editingId === "new" && draft && (
          <AccountEditorCard draft={draft} setDraft={setDraft} types={TYPES} onSave={save} onCancel={cancel} />
        )}

        {editingId !== "new" && (
          <button
            onClick={startAdd}
            className="w-full glass rounded-2xl p-3.5 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform border border-dashed border-primary/30"
          >
            <Plus className="w-4 h-4 text-primary-glow" />
            <span className="font-syne text-[12px] font-bold uppercase tracking-wider text-foreground">Add Account</span>
          </button>
        )}
      </div>
    </div>
  );
};

const AccountEditorCard = ({
  draft, setDraft, types, onSave, onCancel,
}: {
  draft: { name: string; type: "Checking" | "Savings" | "Credit Card" | "Cash" | "Other"; details: string };
  setDraft: (s: typeof draft) => void;
  types: typeof draft.type[];
  onSave: () => void;
  onCancel: () => void;
}) => (
  <div className="glass-strong rounded-2xl p-4 space-y-3">
    <input
      autoFocus
      value={draft.name}
      maxLength={30}
      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
      placeholder="Account name"
      className="w-full glass rounded-xl px-3 py-2 outline-none text-[13px] text-foreground placeholder:text-muted-foreground bg-transparent"
    />
    <select
      value={draft.type}
      onChange={(e) => setDraft({ ...draft, type: e.target.value as typeof draft.type })}
      className="w-full glass rounded-xl px-3 py-2 outline-none text-[13px] text-foreground bg-transparent"
    >
      {types.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
    <input
      value={draft.details}
      onChange={(e) => setDraft({ ...draft, details: e.target.value })}
      placeholder="Details (last 4 digits, branch…)"
      maxLength={60}
      className="w-full glass rounded-xl px-3 py-2 outline-none text-[13px] text-foreground placeholder:text-muted-foreground bg-transparent"
    />
    <div className="grid grid-cols-2 gap-2">
      <button onClick={onCancel} className="py-2.5 rounded-xl glass flex items-center justify-center gap-1 font-syne font-bold text-[11px] uppercase tracking-wider text-foreground">
        <X className="w-3.5 h-3.5" /> Cancel
      </button>
      <button onClick={onSave} className="py-2.5 rounded-xl gradient-primary-bg text-primary-foreground flex items-center justify-center gap-1 font-syne font-bold text-[11px] uppercase tracking-wider">
        <Check className="w-3.5 h-3.5" /> Save
      </button>
    </div>
  </div>
);
