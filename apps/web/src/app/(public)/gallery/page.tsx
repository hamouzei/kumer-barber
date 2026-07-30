"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import type { GalleryImage } from "@/types";
import { Loader2, ImageOff, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
      {/* Header */}
      <section className="bg-night py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass mb-3 anim-fade-up">
              Portfolio
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-ivory sm:text-5xl anim-fade-up anim-delay-1">
              Our Work
            </h1>
            <p className="mt-4 text-base text-ivory/45 leading-relaxed anim-fade-up anim-delay-2">
              Browse through our portfolio of precision cuts and styles.
              Every photo is a real client, a real cut.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brass" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <ImageOff className="h-7 w-7" />
              </div>
              <p className="text-lg font-medium">Gallery coming soon</p>
              <p className="text-sm text-muted-foreground/60">
                Check back later for photos of our latest work.
              </p>
            </div>
          ) : (
            <div className="masonry-grid">
              {images.map((image, idx) => (
                <button
                  key={image.imageId}
                  onClick={() => setSelectedImage(image)}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-xl border border-border bg-muted transition-all duration-300 hover:brass-glow hover:border-brass/20",
                    "anim-fade-up",
                    idx < 5 ? `anim-delay-${idx + 1}` : ""
                  )}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.title ?? "Gallery image"}
                    width={600}
                    height={idx % 3 === 0 ? 750 : idx % 3 === 1 ? 600 : 500}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-night/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {image.title && (
                      <div className="p-4">
                        <p className="text-sm font-medium text-ivory">
                          {image.title}
                        </p>
                      </div>
                    )}
                  </div>
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
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none [&>button]:hidden">
          {selectedImage && (
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/10 text-ivory backdrop-blur-sm transition-colors hover:bg-ivory/20"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title ?? "Gallery image"}
                  width={1200}
                  height={900}
                  className="w-full object-contain"
                  sizes="90vw"
                  priority
                />
                {selectedImage.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/80 to-transparent p-6">
                    <p className="text-base font-medium text-ivory">
                      {selectedImage.title}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
