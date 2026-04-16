"use client";

import { useState, useEffect, useCallback } from "react";
import type { PlanId } from "@/lib/stripe";

interface SubscriptionState {
  plan: PlanId;
  status: string;
  usage: { searches: number; reports: number; exports: number };
  limits: { searches: number; reports: number; exports: number; leads_per_search: number };
  isLoading: boolean;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    plan: "free",
    status: "active",
    usage: { searches: 0, reports: 0, exports: 0 },
    limits: { searches: 3, reports: 1, exports: 0, leads_per_search: 20 },
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/user/subscription");
      if (res.ok) {
        const data = await res.json();
        setState({ ...data, isLoading: false });
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/subscription")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setState({ ...data, isLoading: false });
      })
      .catch(() => {
        if (!cancelled) setState((prev) => ({ ...prev, isLoading: false }));
      });
    return () => { cancelled = true; };
  }, []);

  const checkout = async (plan: "pro" | "scale") => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
    return data;
  };

  const openPortal = async () => {
    const res = await fetch("/api/stripe/portal");
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
    return data;
  };

  return { ...state, checkout, openPortal, refresh };
}
