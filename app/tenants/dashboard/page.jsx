"use client";
import { useEffect, useState, useCallback } from "react";
import Script from "next/script";

export default function TenantDashboard() {
  const [me, setMe] = useState(null);
  const [bills, setBills] = useState([]);
  const [totals, setTotals] = useState({ totalDue: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const load = useCallback(async () => {
    if (!token) {
      window.location.href = "/tenant/login";
      return;
    }
    setLoading(true);
    const [meRes, billsRes] = await Promise.all([
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/tenant/bills", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    const meData = await meRes.json();
    const billsData = await billsRes.json();

    if (!meData.success || meData.role !== "tenant") {
      localStorage.removeItem("token");
      window.location.href = "/tenant/login";
      return;
    }
    setMe(meData.tenant);
    if (billsData.success) {
      setBills(billsData.bills);
      setTotals(billsData.totals);
      if (billsData.totals.totalDue > 0) {
        setPayAmount(String(billsData.totals.totalDue));
      }
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/portal";
  };

  const handlePay = async () => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      alert("Enter a valid amount");
      return;
    }
    setPaying(true);

    const orderRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: amt }),
    });
    const order = await orderRes.json();

    if (!order.success) {
      setPaying(false);
      alert(order.message || "Could not create order");
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      setPaying(false);
      alert("Razorpay SDK not loaded yet, please retry");
      return;
    }

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Rent Payment",
      description: `Rent payment for ${me?.name || "tenant"}`,
      order_id: order.orderId,
      prefill: {
        name: me?.name || "",
        contact: me?.phone || "",
        email: me?.email || "",
      },
      theme: { color: "#10b981" },
      handler: async function (resp) {
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(resp),
        });
        const v = await verifyRes.json();
        setPaying(false);
        if (v.success) {
          window.location.href = `/receipt/${v.transactionId}`;
        } else {
          alert(v.message || "Verification failed");
        }
      },
      modal: {
        ondismiss: () => setPaying(false),
      },
    });
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <div>
          <h1 className="text-xl font-bold text-emerald-400">
            Hi, {me?.name}
          </h1>
          <p className="text-sm text-slate-400">
            Room {me?.roomNumber || "—"} · {me?.phone}
          </p>
        </div>
        <button
          onClick={logout}
          className="text-sm border border-slate-600 px-3 py-1 rounded hover:bg-slate-800"
        >
          Logout
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-xl p-5 border border-red-500/40">
            <p className="text-slate-400 text-sm">Old Balance (Bakaya)</p>
            <p className="text-3xl font-bold text-red-400 mt-2">
              ₹{totals.totalDue}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-emerald-500/40">
            <p className="text-slate-400 text-sm">Total Paid</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">
              ₹{totals.totalPaid}
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-5 border border-emerald-500/30">
          <h2 className="font-semibold mb-3">Pay Now</h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="Enter amount (₹)"
              className="flex-1 p-2 rounded bg-slate-900 border border-slate-600"
            />
            <button
              onClick={handlePay}
              disabled={paying}
              className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded font-semibold text-black disabled:opacity-50"
            >
              {paying ? "Processing..." : "Pay with Razorpay"}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Payment is auto-applied to your oldest unpaid month first.
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h2 className="font-semibold mb-3">Your Bills</h2>
          {bills.length === 0 && (
            <p className="text-slate-400 text-sm">No bills yet.</p>
          )}
          <div className="divide-y divide-slate-700">
            {bills.map((b) => (
              <div key={b._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.month || "—"}</p>
                  <p className="text-xs text-slate-400">
                    Rent ₹{b.totalRent} · Paid ₹{b.paidAmount} · Due ₹
                    {b.remainingAmount}
                  </p>
                  {b.transactions?.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {b.transactions.map((t) => (
                        <a
                          key={t._id}
                          href={`/receipt/${t._id}`}
                          className="block text-xs text-emerald-400 underline"
                        >
                          Receipt · {t.razorpayPaymentId || t._id}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    b.status === "paid"
                      ? "bg-emerald-600/30 text-emerald-300"
                      : b.status === "partial"
                      ? "bg-yellow-600/30 text-yellow-300"
                      : "bg-red-600/30 text-red-300"
                  }`}
                >
                  {b.status || "pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
