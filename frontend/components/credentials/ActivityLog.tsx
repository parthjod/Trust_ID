"use client";

import { CheckCircle, Share2, Plus, AlertCircle } from "lucide-react";
import type { ActivityEvent, ActivityType } from "@/types";

type ActivityLogProps = {
  events: ActivityEvent[];
};

const ACTIVITY_CONFIG: Record<ActivityType, { icon: typeof CheckCircle; color: string }> = {
  did_created:        { icon: Plus,         color: "text-green-400" },
  credential_added:   { icon: Plus,         color: "text-green-400" },
  credential_revoked: { icon: AlertCircle,  color: "text-red-400" },
  proof_shared:       { icon: Share2,       color: "text-brand-400" },
  proof_verified:     { icon: CheckCircle,  color: "text-blue-400" },
  alert:              { icon: AlertCircle,  color: "text-yellow-400" },
};

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ActivityLog({ events }: ActivityLogProps) {
  if (!events || events.length === 0) {
    return (
      <section>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Recent Activity
        </h2>
        <div className="glow-card rounded-xl bg-surface-900 p-6 text-center">
          <p className="text-slate-500 text-sm">No activity yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
        Recent Activity
      </h2>
      <div className="glow-card rounded-xl bg-surface-900 divide-y divide-slate-800/60">
        {events.map((item) => {
          const config = ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG.alert;
          const Icon = config.icon;
          return (
            <div key={item.id} className="flex items-center gap-4 px-4 py-3">
              <div className={`w-8 h-8 rounded-lg bg-surface-950 flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-200">{item.label}</div>
                <div className="text-xs text-slate-600">{item.detail}</div>
              </div>
              <span className="text-xs text-slate-600 shrink-0">
                {formatTimestamp(item.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
