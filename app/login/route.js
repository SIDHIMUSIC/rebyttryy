"use client";
import { useState } from "react";

export default function OwnerLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/owner-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "owner");
      const redirect = localStorage.getItem("redirect") || "/";
      localStorage.removeItem("redirect");
      window.location.href = redirect;
    } else {
      alert(data.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="p-8 border border-cyan-400 rounded-xl shadow-[0_0_30px_#00f7ff] w-full max-w-sm">
        <h1 className="text-2xl mb-6 text-cyan-400 font-bold">🏢 Owner Login</h1>

        <input
          placeholder="Username"
          className="block w-full mb-3 p-2 bg-transparent border border-cyan-400 rounded"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="block w-full mb-4 p-2 bg-transparent border border-cyan-400 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-cyan-400 text-black px-4 py-2 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <a href="/tenant/login" className="block text-center mt-4 text-sm text-slate-400 underline">
          Tenant login →
        </a>
      </div>
    </div>
  );
}
