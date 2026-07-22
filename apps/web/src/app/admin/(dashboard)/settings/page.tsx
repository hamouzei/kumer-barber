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
        haircut_price: parseFloat(settings.haircutPrice) || 500,
        deposit_amount: parseFloat(settings.depositAmount) || 0,
        duration_minutes: settings.durationMinutes,
        opening_time: settings.openingTime,
        closing_time: settings.closingTime,
        working_days: settings.workingDays,
        payment_instructions: settings.paymentInstructions || null,
        cbe_account: settings.cbeAccount || null,
        telebirr_account: settings.telebirrAccount || null,
        account_holder: settings.accountHolder || null,
        booking_policy: settings.bookingPolicy || null,
        contact_phone: settings.contactPhone || null,
        contact_email: settings.contactEmail || null,
        address: settings.address || null,
        google_maps_url: settings.googleMapsUrl || (settings.address?.startsWith("http") ? settings.address : null),
        social_links: settings.socialLinks || {},
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
              Pricing & Deposit
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

        {/* Bank Account Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-brass" />
              Bank Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountHolder">Account Holder Name</Label>
              <Input
                id="accountHolder"
                value={settings.accountHolder ?? ""}
                onChange={(e) => updateField("accountHolder", e.target.value)}
                placeholder="e.g. Yabu Barber Shop"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cbeAccount">CBE Account Number</Label>
              <Input
                id="cbeAccount"
                value={settings.cbeAccount ?? ""}
                onChange={(e) => updateField("cbeAccount", e.target.value)}
                placeholder="e.g. 1000 4821 7365 90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telebirrAccount">Telebirr Account Number</Label>
              <Input
                id="telebirrAccount"
                value={settings.telebirrAccount ?? ""}
                onChange={(e) => updateField("telebirrAccount", e.target.value)}
                placeholder="e.g. 0912 345 678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentInstructions">Additional Payment Notes</Label>
              <Textarea
                id="paymentInstructions"
                value={settings.paymentInstructions ?? ""}
                onChange={(e) =>
                  updateField("paymentInstructions", e.target.value)
                }
                placeholder="Instructions shown to customers during payment..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Booking Policy & Notice (Informative Information) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-brass" />
              Booking Policy & Customer Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookingPolicy">Customer Notice Text</Label>
              <Textarea
                id="bookingPolicy"
                value={settings.bookingPolicy ?? ""}
                onChange={(e) => updateField("bookingPolicy", e.target.value)}
                placeholder="Notice displayed to customers before payment (e.g., deposit rules, arrival times)..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                This notice will be displayed to customers when they reach the payment step. Leave blank to use default policy.
              </p>
            </div>
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
              <Label htmlFor="address">Shop Physical Address / Name</Label>
              <Input
                id="address"
                value={settings.address ?? ""}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="e.g. Bole Medhanealem, Next to Edna Mall, 2nd Floor, Addis Ababa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleMapsUrl">Google Maps Location Link / URL</Label>
              <Input
                id="googleMapsUrl"
                value={settings.googleMapsUrl ?? ""}
                onChange={(e) => updateField("googleMapsUrl", e.target.value)}
                placeholder="e.g. https://maps.app.goo.gl/xyz or https://www.google.com/maps/place/..."
              />
              <p className="text-xs text-muted-foreground">
                Paste your exact Google Maps share link here. Customers clicking &quot;Get Directions&quot; on the homepage will be taken straight to this exact pin on Google Maps.
              </p>
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
