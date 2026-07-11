"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import type { GalleryImage } from "@/types";
import { Loader2, ImageOff } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    api
      .get<GalleryImage[]>("/gallery")
      .then(setImages)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="page-transition">
      {/* Hero */}
      <section className="bg-brand py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-linen sm:text-5xl">
            Our Work
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-linen/60">
            Browse through our portfolio of precision cuts and styles.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brass" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
              <ImageOff className="h-12 w-12" />
              <p className="text-lg">Gallery coming soon</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <button
                  key={image.imageId}
                  onClick={() => setSelectedImage(image)}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.title ?? "Gallery image"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {image.title && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <p className="text-sm font-medium text-white">
                        {image.title}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog
        open={selectedImage !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null);
        }}
      >
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          {selectedImage && (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg sm:aspect-[4/3]">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.title ?? "Gallery image"}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
