import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Save, AlertTriangle, LogOut, Key, Trash2, Plus } from "lucide-react";
import { db, handleFirestoreError } from "../lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { cn } from "../lib/utils";

export function AdminPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [adminMessage, setAdminMessage] = useState("");
  const [overrideNumber, setOverrideNumber] = useState<string>("");

  // Key Generator State
  const [keys, setKeys] = useState<any[]>([]);
  const [newKeyText, setNewKeyText] = useState("");
  const [expireHours, setExpireHours] = useState("24");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    const loadConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, "admin", "config"));
        if (configDoc.exists()) {
          const data = configDoc.data();
          setAdminMessage(data.adminMessage || "");
          setOverrideNumber(data.overrideNumber !== undefined ? String(data.overrideNumber) : "");
        }
      } catch (err) {
        handleFirestoreError(err);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();

    // Listen to keys
    const q = query(collection(db, "keys"));
    const unsub = onSnapshot(q, (snapshot) => {
      const loadedKeys: any[] = [];
      snapshot.forEach(doc => loadedKeys.push({ id: doc.id, ...doc.data() }));
      // sort by created at locally
      loadedKeys.sort((a, b) => b.createdAt - a.createdAt);
      setKeys(loadedKeys);
    }, (error) => {
      console.error("Error loading keys:", error);
    });

    return () => unsub();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const dataToSave: any = {
        adminMessage,
        authSecret: "PREMIUM"
      };

      if (overrideNumber && overrideNumber.trim() !== "") {
        const num = parseInt(overrideNumber, 10);
        if (!isNaN(num) && num >= 0 && num <= 9) {
          dataToSave.overrideNumber = num;
        } else {
          throw new Error("Override Number must be between 0 and 9");
        }
      }

      await setDoc(doc(db, "admin", "config"), dataToSave);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save configuration");
      handleFirestoreError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyText.trim() || !newKeyText.match(/^[a-zA-Z0-9_\-]+$/)) {
      setErrorMsg("Key must be alphanumeric without spaces.");
      return;
    }
    
    const hours = parseInt(expireHours, 10);
    if (isNaN(hours) || hours <= 0) {
      setErrorMsg("Expiration hours must be a positive number.");
      return;
    }

    setGenerating(true);
    setErrorMsg("");
    
    try {
      const expiresAt = Date.now() + (hours * 3600 * 1000);
      await setDoc(doc(db, "keys", newKeyText), {
        key: newKeyText,
        expiresAt,
        createdAt: Date.now(),
        secret: "PREMIUM"
      });
      setNewKeyText("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate key");
      handleFirestoreError(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!window.confirm("Delete this key? The user will be logged out immediately.")) return;
    try {
      await deleteDoc(doc(db, "keys", keyId));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete key");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex bg-[#0a0a0c] text-white min-h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-t-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#0a0a0c] text-[#e2e2e7] min-h-screen font-sans">
      <header className="h-16 border-b border-[#2d2d33] flex items-center justify-between px-6 bg-[#111116] shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="p-2 hover:bg-[#1c1c24] rounded-md transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">System Override</h1>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-[#1c1c24]"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Terminate Session</span>
        </button>
      </header>

      <main className="flex-1 p-6 sm:p-10 max-w-4xl w-full mx-auto space-y-12">
        
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Global Settings Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Global Settings</h2>
            <p className="text-gray-500">Modify active tracking parameters and broadcast announcements across all connected clients.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-[#111116] border border-[#2d2d33] rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                Broadcast Message
                <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full text-[10px] uppercase font-mono tracking-widest border border-gray-700">All Providers</span>
              </h3>
              <p className="text-sm text-gray-500 mb-4">Displays an un-dismissible banner across the dashboard interface.</p>
              
              <textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="e.g., API maintenance scheduled in 45 minutes..."
                className="w-full bg-[#16161d] border border-[#2d2d33] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all min-h-[120px] resize-y"
              />
            </div>

            <div className="bg-[#111116] border border-[#2d2d33] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Shield className="w-48 h-48" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                Prediction Interference 
                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] uppercase font-mono tracking-widest border border-red-500/20">Critical</span>
              </h3>
              <p className="text-sm text-gray-500 mb-6 relative z-10">Force the algorithmic prediction engine to output a specific number globally.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Number (0-9)</label>
                  <input
                    type="text"
                    placeholder="Leave blank for auto-predict"
                    value={overrideNumber}
                    onChange={(e) => setOverrideNumber(e.target.value)}
                    className="w-full bg-[#16161d] border border-[#2d2d33] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all font-mono text-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]",
                success ? "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
              )}
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : success ? (
                <>Saved Successfully</>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Commit Changes
                </>
              )}
            </button>
          </div>
        </section>

        {/* Access Key Management Section */}
        <section>
          <div className="mb-6 pt-6 border-t border-[#2d2d33]">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Password / Key Generator</h2>
            <p className="text-gray-500">Create access passwords for users and set active expiration windows. Revoking passwords will boot active users automatically.</p>
          </div>

          <div className="bg-[#111116] border border-[#2d2d33] rounded-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#2d2d33] bg-[#16161d]">
              <form onSubmit={handleCreateKey} className="flex gap-4 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Custom Text Password</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP-ACCESS-123"
                    value={newKeyText}
                    onChange={(e) => setNewKeyText(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-[#2d2d33] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Expire (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expireHours}
                    onChange={(e) => setExpireHours(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-[#2d2d33] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={generating}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 h-[46px]"
                >
                  <Plus className="w-5 h-5" />
                  Generate
                </button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2d2d33] text-xs text-gray-500 uppercase tracking-widest bg-[#16161d]">
                    <th className="p-4 font-bold">Access Key</th>
                    <th className="p-4 font-bold">Created</th>
                    <th className="p-4 font-bold">Expires</th>
                    <th className="p-4 font-bold text-center">Status</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#2d2d33]">
                  {keys.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 italic">No access keys generated.</td>
                    </tr>
                  )}
                  {keys.map((k) => {
                    const isExpired = k.expiresAt < Date.now();
                    return (
                      <tr key={k.id} className="hover:bg-[#16161d]/50 transition-colors">
                        <td className="p-4 font-mono font-medium text-white break-all">{k.key}</td>
                        <td className="p-4 text-gray-400">
                          {new Date(k.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-gray-400">
                          {new Date(k.expiresAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          {isExpired ? (
                            <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded font-bold text-[10px] uppercase">Expired</span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded font-bold text-[10px] uppercase">Active</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteKey(k.id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors inline-block"
                            title="Revoke / Delete Key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
