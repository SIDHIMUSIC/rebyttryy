"use client";
import { useState } from "react";

export default function TenantLogin() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "tenant");
      window.location.href = "/tenant/dashboard";
    } else {
      alert(data.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-black text-white p-6">
      <div className="p-8 border border-emerald-400 rounded-xl shadow-[0_0_30px_#10b981] w-full max-w-sm">
        <h1 className="text-2xl mb-6 text-emerald-400 font-bold">👤 Tenant Login</h1>

        <input
          placeholder="Phone number"
          className="block w-full mb-3 p-2 bg-transparent border border-emerald-400 rounded"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="block w-full mb-4 p-2 bg-transparent border border-emerald-400 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-emerald-400 text-black px-4 py-2 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <a href="/tenant/signup" className="block text-center mt-4 text-sm text-slate-400 underline">
          New tenant? Sign up
        </a>
      </div>
    </div>
  );
}
