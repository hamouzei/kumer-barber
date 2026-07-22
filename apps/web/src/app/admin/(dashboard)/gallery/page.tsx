"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import type { GalleryImage } from "@/types";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Upload,
  Trash2,
  Pencil,
  Plus,
  ImageIcon,
} from "lucide-react";

export default function GalleryManagementPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editTarget, setEditTarget] = useState<GalleryImage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editOrder, setEditOrder] = useState<number>(0);
  const [savingEdit, setSavingEdit] = useState(false);

  // Upload state
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const result = await api.get<GalleryImage[]>("/admin/gallery");
      setImages(result);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", uploadFile);
      if (uploadTitle.trim()) {
        formData.append("title", uploadTitle.trim());
      }
      await api.upload("/admin/gallery", formData);
      setShowUpload(false);
      setUploadTitle("");
      setUploadFile(null);
      await fetchImages();
    } catch {
      // Error handled by API client
    } finally {
      setUploading(false);
    }
  }

  function startEditing(img: GalleryImage) {
    setEditTarget(img);
    setEditTitle(img.title ?? "");
    setEditOrder(img.displayOrder ?? 0);
  }

  async function handleEditSave() {
    if (!editTarget) return;
    setSavingEdit(true);
    try {
      await api.put(`/admin/gallery/${editTarget.imageId}`, {
        title: editTitle.trim() || null,
        display_order: editOrder,
      });
      setEditTarget(null);
      await fetchImages();
    } catch {
      // Error handled by API client
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/gallery/${deleteTarget.imageId}`);
      setDeleteTarget(null);
      await fetchImages();
    } catch {
      // Error handled by API client
    } finally {
      setDeleting(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Gallery
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your portfolio images
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="gap-1.5 bg-brass text-brand hover:bg-brass-light"
        >
          <Plus className="h-4 w-4" />
          Add Image
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
          <ImageIcon className="h-12 w-12" />
          <p>No images yet. Upload your first image.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.imageId} className="overflow-hidden group">
              <div className="relative aspect-square">
                <Image
                  src={image.imageUrl}
                  alt={image.title ?? "Gallery image"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <CardContent className="flex items-center justify-between p-3">
                <div className="truncate pr-2">
                  <p className="text-sm font-medium truncate">
                    {image.title ?? "Untitled"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Order: {image.displayOrder}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(image)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    title="Edit Title & Order"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(image)}
                    className="shrink-0 text-muted-foreground hover:text-red-600"
                    title="Delete Image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="e.g. Fade Cut"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              {uploadFile ? (
                <div className="flex items-center gap-3 rounded-md border border-border p-3">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm">
                    {uploadFile.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadFile(null)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-brass">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to select an image
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setUploadFile(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpload(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
              className="bg-brass text-brand hover:bg-brass-light"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editTarget !== null} onOpenChange={(open) => {
        if (!open) setEditTarget(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Gallery Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Title / Caption</Label>
              <Input
                id="editTitle"
                placeholder="e.g. Fade Cut"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editOrder">Display Order</Label>
              <Input
                id="editOrder"
                type="number"
                value={editOrder}
                onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={savingEdit}
              className="bg-brass text-brand hover:bg-brass-light"
            >
              {savingEdit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Image"
        description={`Are you sure you want to delete "${deleteTarget?.title ?? "this image"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}
