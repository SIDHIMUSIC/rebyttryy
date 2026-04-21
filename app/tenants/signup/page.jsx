"use client";
import { useState } from "react";

export default function TenantSignup() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    roomNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!form.name || !form.phone || !form.password) {
      alert("Name, phone and password are required");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
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
      alert(data.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-black text-white p-6">
      <div className="p-8 border border-emerald-400 rounded-xl shadow-[0_0_30px_#10b981] w-full max-w-sm">
        <h1 className="text-2xl mb-6 text-emerald-400 font-bold">📝 Tenant Sign Up</h1>

        {["name", "phone", "email", "roomNumber", "password"].map((f) => (
          <input
            key={f}
            placeholder={f === "roomNumber" ? "Room Number (optional)" : f.charAt(0).toUpperCase() + f.slice(1)}
            type={f === "password" ? "password" : "text"}
            className="block w-full mb-3 p-2 bg-transparent border border-emerald-400 rounded"
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
          />
        ))}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-emerald-400 text-black px-4 py-2 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <a href="/tenant/login" className="block text-center mt-4 text-sm text-slate-400 underline">
          Already have an account? Login
        </a>
      </div>
    </div>
  );
}
