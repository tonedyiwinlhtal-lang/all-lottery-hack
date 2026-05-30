import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db, handleFirestoreError } from "../lib/firebase";

export function Login() {
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "PREMIUM") {
      localStorage.setItem("isAdmin", "true");
      navigate("/admin");
      return;
    }

    if (!password.trim()) {
      showError("Please enter an access key.");
      return;
    }

    setLoading(true);
    try {
      const keyDoc = await getDoc(doc(db, "keys", password));
      if (keyDoc.exists()) {
        const data = keyDoc.data();
        if (data.expiresAt > Date.now()) {
          localStorage.setItem("userKey", password);
          navigate("/");
        } else {
          showError("This access key has expired.");
        }
      } else {
        showError("Invalid access key provided.");
      }
    } catch (err) {
      handleFirestoreError(err);
      showError("Error validating key. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 3000);
  };

  return (
    <div className="flex bg-[#0a0a0c] text-[#e2e2e7] min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#111116] border border-[#2d2d33] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 flex items-center justify-center rounded-xl mb-4 border border-red-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">System Login</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-[#16161d] border border-[#2d2d33] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all font-mono disabled:opacity-50"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="flex flex-row items-center gap-2 p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm transition-all duration-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] mt-2"
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <button 
          onClick={() => navigate('/')} 
          className="mt-6 w-full text-center text-xs text-gray-500 hover:text-gray-400 transition-colors uppercase tracking-widest font-bold hidden"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
