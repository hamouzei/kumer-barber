"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { WebsiteContentSection } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, FileText } from "lucide-react";

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
  const [editedData, setEditedData] = useState<
    Record<string, { title: string; body: string; metadata: Record<string, unknown> }>
  >({});

  const fetchContent = useCallback(async () => {
    try {
      const result = await api.get<WebsiteContentSection[]>("/admin/content");
      setSections(result);
      // Initialize edit state
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
    setEditedData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  }

  async function handleSave(sectionKey: string) {
    setSavingKey(sectionKey);
    try {
      const data = editedData[sectionKey];
      await api.put(`/admin/content/${sectionKey}`, {
        title: data?.title || null,
        body: data?.body || null,
        metadata: data?.metadata || {},
      });
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
          Content
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your website&apos;s text content
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
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${key}-title`}>Title</Label>
                    <Input
                      id={`${key}-title`}
                      value={data.title}
                      onChange={(e) =>
                        updateField(key, "title", e.target.value)
                      }
                      placeholder={`Enter ${SECTION_LABELS[key].toLowerCase()} title`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${key}-body`}>Body</Label>
                    <Textarea
                      id={`${key}-body`}
                      value={data.body}
                      onChange={(e) =>
                        updateField(key, "body", e.target.value)
                      }
                      placeholder={`Enter ${SECTION_LABELS[key].toLowerCase()} content`}
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
