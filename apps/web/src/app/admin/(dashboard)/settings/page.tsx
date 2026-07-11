"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import type { BusinessSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Settings, Clock, DollarSign, Globe } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<BusinessSettings>("/admin/settings")
      .then(setSettings)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  function updateField<K extends keyof BusinessSettings>(
    field: K,
    value: BusinessSettings[K]
  ) {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
    setSaved(false);
  }

  function toggleDay(day: number) {
    if (!settings) return;
    const days = settings.workingDays.includes(day)
      ? settings.workingDays.filter((d) => d !== day)
      : [...settings.workingDays, day].sort();
    updateField("workingDays", days);
  }

  async function handleSave() {
    if (!settings) return;
    setIsSaving(true);
    try {
      await api.put("/admin/settings", {
        haircut_price: settings.haircutPrice,
        deposit_amount: settings.depositAmount,
        duration_minutes: settings.durationMinutes,
        opening_time: settings.openingTime,
        closing_time: settings.closingTime,
        working_days: settings.workingDays,
        payment_instructions: settings.paymentInstructions,
        contact_phone: settings.contactPhone,
        contact_email: settings.contactEmail,
        address: settings.address,
        social_links: settings.socialLinks,
      });
      setSaved(true);
    } catch {
      // Error handled by API client
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Failed to load settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your barbershop preferences
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-1.5 bg-brass text-brand hover:bg-brass-light"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pricing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-brass" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Haircut Price (ETB)</Label>
              <Input
                id="price"
                type="number"
                value={settings.haircutPrice}
                onChange={(e) => updateField("haircutPrice", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit Amount (ETB)</Label>
              <Input
                id="deposit"
                type="number"
                value={settings.depositAmount}
                onChange={(e) => updateField("depositAmount", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Appointment Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={settings.durationMinutes}
                onChange={(e) =>
                  updateField("durationMinutes", parseInt(e.target.value) || 30)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-brass" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opening">Opening Time</Label>
                <Input
                  id="opening"
                  type="time"
                  value={settings.openingTime}
                  onChange={(e) => updateField("openingTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing">Closing Time</Label>
                <Input
                  id="closing"
                  type="time"
                  value={settings.closingTime}
                  onChange={(e) => updateField("closingTime", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Working Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`rounded-md border-2 px-3 py-1.5 text-xs font-semibold transition-colors ${
                      settings.workingDays.includes(day.value)
                        ? "border-brass bg-brass/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-brass/50"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-brass" />
              Payment Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={settings.paymentInstructions ?? ""}
              onChange={(e) =>
                updateField("paymentInstructions", e.target.value)
              }
              placeholder="Instructions shown to customers during payment step..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Contact & Social */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-brass" />
              Contact & Social
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={settings.contactPhone ?? ""}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                placeholder="+251 9XX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.contactEmail ?? ""}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                placeholder="contact@360yabu.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={settings.address ?? ""}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Shop location"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                value={settings.socialLinks?.instagram ?? ""}
                onChange={(e) =>
                  updateField("socialLinks", {
                    ...settings.socialLinks,
                    instagram: e.target.value,
                  })
                }
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram URL</Label>
              <Input
                id="telegram"
                value={settings.socialLinks?.telegram ?? ""}
                onChange={(e) =>
                  updateField("socialLinks", {
                    ...settings.socialLinks,
                    telegram: e.target.value,
                  })
                }
                placeholder="https://t.me/..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
