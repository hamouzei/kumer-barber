"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import type { WebsiteContentSection } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, FileText, Upload, ImageIcon, Check } from "lucide-react";

const SECTION_KEYS = ["hero", "about", "team"] as const;

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  about: "About Section",
  team: "Team Section",
};

export default function ContentManagementPage() {
  const [sections, setSections] = useState<WebsiteContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [uploadingImageKey, setUploadingImageKey] = useState<string | null>(null);

  const [editedData, setEditedData] = useState<
    Record<string, { title: string; body: string; metadata: Record<string, unknown> }>
  >({});

  const fetchContent = useCallback(async () => {
    try {
      const result = await api.get<WebsiteContentSection[]>("/admin/content");
      setSections(result);
      const edited: typeof editedData = {};
      for (const section of result) {
        edited[section.sectionKey] = {
          title: section.title ?? "",
          body: section.body ?? "",
          metadata: (section.metadata ?? {}) as Record<string, unknown>,
        };
      }
      setEditedData(edited);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  function updateField(key: string, field: string, value: string) {
    setSavedKey(null);
    setEditedData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  }

  function updateMetadataField(key: string, metaField: string, value: unknown) {
    setSavedKey(null);
    setEditedData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        metadata: {
          ...(prev[key]?.metadata ?? {}),
          [metaField]: value,
        },
      },
    }));
  }

  async function handleImageUpload(sectionKey: string, file: File) {
    setUploadingImageKey(sectionKey);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.upload<{ url: string }>("/uploads/content-image", formData);
      updateMetadataField(sectionKey, "imageUrl", res.url);
    } catch {
      // Error handled by API client
    } finally {
      setUploadingImageKey(null);
    }
  }

  async function handleSave(sectionKey: string) {
    setSavingKey(sectionKey);
    setSavedKey(null);
    try {
      const data = editedData[sectionKey];
      await api.put(`/admin/content/${sectionKey}`, {
        title: data?.title || null,
        body: data?.body || null,
        metadata: data?.metadata || {},
      });
      setSavedKey(sectionKey);
      setTimeout(() => setSavedKey(null), 3000);
    } catch {
      // Error handled by API client
    } finally {
      setSavingKey(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brass" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Content Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage text copy and images for your public website pages
        </p>
      </div>

      <Tabs defaultValue="hero">
        <TabsList>
          {SECTION_KEYS.map((key) => (
            <TabsTrigger key={key} value={key}>
              {SECTION_LABELS[key]}
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTION_KEYS.map((key) => {
          const data = editedData[key];
          if (!data) return null;

          const currentImageUrl = (data.metadata?.imageUrl as string) || "";

          return (
            <TabsContent key={key} value={key}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-brass" />
                    {SECTION_LABELS[key]}
                  </CardTitle>
                  <Button
                    onClick={() => handleSave(key)}
                    disabled={savingKey === key}
                    className="gap-1.5 bg-brass text-brand hover:bg-brass-light"
                    size="sm"
                  >
                    {savingKey === key ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : savedKey === key ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {savedKey === key ? "Saved!" : "Save Changes"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor={`${key}-title`}>Title / Headline</Label>
                    <Input
                      id={`${key}-title`}
                      value={data.title}
                      onChange={(e) =>
                        updateField(key, "title", e.target.value)
                      }
                      placeholder={`Enter ${SECTION_LABELS[key].toLowerCase()} title`}
                    />
                  </div>

                  {/* Team-specific Role/Subtitle metadata */}
                  {key === "team" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="team-role">Role / Subtitle</Label>
                        <Input
                          id="team-role"
                          value={(data.metadata?.role as string) ?? "Master Barber & Stylist"}
                          onChange={(e) =>
                            updateMetadataField(key, "role", e.target.value)
                          }
                          placeholder="e.g. Master Barber & Stylist"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="team-specialties">Specialties</Label>
                        <Input
                          id="team-specialties"
                          value={(data.metadata?.specialties as string) ?? "Fades, classic cuts, hot towel shaves"}
                          onChange={(e) =>
                            updateMetadataField(key, "specialties", e.target.value)
                          }
                          placeholder="e.g. Fades, classic cuts, styling"
                        />
                      </div>
                    </div>
                  )}

                  {/* Body Copy */}
                  <div className="space-y-2">
                    <Label htmlFor={`${key}-body`}>Body Content</Label>
                    <Textarea
                      id={`${key}-body`}
                      value={data.body}
                      onChange={(e) =>
                        updateField(key, "body", e.target.value)
                      }
                      placeholder={`Enter ${SECTION_LABELS[key].toLowerCase()} text content`}
                      rows={6}
                    />
                  </div>

                  {/* Image Upload for About and Team sections */}
                  {(key === "about" || key === "team") && (
                    <div className="space-y-3 border-t border-border pt-4">
                      <Label className="text-sm font-semibold">
                        {key === "team" ? "Barber Photo" : "Section Image"}
                      </Label>

                      {currentImageUrl ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border border-border p-4 bg-muted/30">
                          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-black">
                            <Image
                              src={currentImageUrl}
                              alt="Section Image Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-2 flex-1">
                            <p className="text-xs text-muted-foreground break-all">
                              {currentImageUrl}
                            </p>
                            <div className="flex gap-2">
                              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
                                {uploadingImageKey === key ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Upload className="h-3.5 w-3.5" />
                                )}
                                Replace Image
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  disabled={uploadingImageKey === key}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(key, file);
                                  }}
                                />
                              </label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateMetadataField(key, "imageUrl", "")}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-brass hover:bg-brass/5">
                          {uploadingImageKey === key ? (
                            <Loader2 className="h-7 w-7 animate-spin text-brass" />
                          ) : (
                            <ImageIcon className="h-7 w-7 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium text-muted-foreground">
                            {uploadingImageKey === key
                              ? "Uploading image..."
                              : `Click to upload ${key === "team" ? "Barber photo" : "About section image"}`}
                          </span>
                          <span className="text-[11px] text-muted-foreground/70">
                            JPG, PNG, or WEBP · Max 5 MB
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={uploadingImageKey === key}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(key, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
