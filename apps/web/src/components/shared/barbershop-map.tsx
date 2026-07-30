"use client";

import { useState } from "react";
import { MapPin, Navigation, Phone, Clock, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarbershopMapProps {
  address?: string | null;
  googleMapsUrl?: string | null;
  contactPhone?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
}

export function BarbershopMap({
  address = "Bole Medhanealem, Next to Edna Mall, Addis Ababa, Ethiopia",
  googleMapsUrl,
  contactPhone = "+251938391771",
  openingTime = "09:00",
  closingTime = "20:00",
}: BarbershopMapProps) {
  const [isLocating, setIsLocating] = useState(false);

  const isAddressUrl = address?.startsWith("http://") || address?.startsWith("https://");
  const directMapsUrl = googleMapsUrl || (isAddressUrl ? address : null);

  const displayAddress = isAddressUrl
    ? "Bole Medhanealem, Next to Edna Mall, Addis Ababa, Ethiopia"
    : address && address.trim().length > 0
    ? address
    : "Bole Medhanealem, Next to Edna Mall, Addis Ababa, Ethiopia";

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    displayAddress
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  function handleGetDirections() {
    if (directMapsUrl) {
      window.open(directMapsUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setIsLocating(true);
    const dest = encodeURIComponent(displayAddress);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const { latitude, longitude } = position.coords;
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${dest}`;
          window.open(directionsUrl, "_blank", "noopener,noreferrer");
        },
        () => {
          setIsLocating(false);
          const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
          window.open(fallbackUrl, "_blank", "noopener,noreferrer");
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <div className="grid lg:grid-cols-12 gap-0">

        {/* Info Panel */}
        <div className="lg:col-span-5 p-7 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass mb-3">
                Location & Directions
              </p>
              <h3 className="font-heading text-2xl font-bold tracking-tight">
                Visit Our Studio
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Click below to open Google Maps turn-by-turn navigation
                directly to our barbershop.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brass/10 mt-0.5">
                  <MapPin className="h-4 w-4 text-brass" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Address
                  </p>
                  <p className="text-sm font-medium mt-0.5">
                    {displayAddress}
                  </p>
                </div>
              </div>

              {contactPhone && (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brass/10 mt-0.5">
                    <Phone className="h-4 w-4 text-brass" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Phone
                    </p>
                    <a
                      href={`tel:${contactPhone}`}
                      className="text-sm font-medium hover:text-brass transition-colors mt-0.5 block"
                    >
                      {contactPhone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brass/10 mt-0.5">
                  <Clock className="h-4 w-4 text-brass" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Hours
                  </p>
                  <p className="text-sm font-medium mt-0.5">
                    Mon – Sun: {openingTime} – {closingTime}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Directions Button */}
          <div className="pt-2">
            <Button
              onClick={handleGetDirections}
              disabled={isLocating}
              size="lg"
              className="w-full bg-brass text-night hover:bg-brass-light font-semibold text-sm h-12 gap-2"
            >
              {isLocating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening Google Maps...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Get Directions
                  <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-60" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Map Embed */}
        <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px] bg-muted">
          <iframe
            title="Barbershop Location Google Map"
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full grayscale-[15%] contrast-[105%] hover:grayscale-0 transition-all duration-500"
          />
        </div>

      </div>
    </div>
  );
}
