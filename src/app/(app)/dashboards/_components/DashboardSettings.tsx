"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardsApi, type Dashboard } from "@/services/dashboards.service";
import { toast } from "sonner";
import { Copy, Globe, Lock, ExternalLink } from "lucide-react";

interface DashboardSettingsProps {
  dashboard: Dashboard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function DashboardSettings({ dashboard, open, onOpenChange, onUpdated }: Readonly<DashboardSettingsProps>) {
  const [isPublic, setIsPublic] = useState(dashboard.is_public);
  const [loading, setLoading] = useState(false);

  const publicLink = `${globalThis.location.origin}/public/dashboard/${dashboard.share_token}`;

  const handleToggleShare = async (checked: boolean) => {
    try {
      setLoading(true);
      await dashboardsApi.share(dashboard.id, checked);
      setIsPublic(checked);
      onUpdated();
      toast.success(checked ? "Dashboard is now public" : "Public access disabled");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update sharing settings");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold font-mono lowercase">Dashboard Settings</DialogTitle>
          <DialogDescription className="text-xs lowercase">
            Manage public access and sharing for this dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/20 border-2 border-dashed border-border/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isPublic ? <Globe className="h-3.5 w-3.5 text-primary" /> : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                <Label className="text-xs font-bold uppercase tracking-tight">Public Access</Label>
              </div>
              <p className="text-[10px] text-muted-foreground lowercase">Anyone with the link can view this dashboard.</p>
            </div>
            <Switch 
              checked={isPublic} 
              onCheckedChange={handleToggleShare} 
              disabled={loading}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {isPublic && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={publicLink}
                  className="flex-1 h-9 rounded-none border-2 border-border font-mono text-[11px] bg-muted/10 focus-visible:ring-0 focus-visible:border-foreground"
                  onClick={(e: React.MouseEvent<HTMLInputElement>) => (e.target as HTMLInputElement).select()}
                />
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-none border-2 border-border hover:border-foreground" onClick={copyLink}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-none border-2 border-border hover:border-foreground" asChild>
                  <a href={publicLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
