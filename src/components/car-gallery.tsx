"use client";

import { useState } from "react";
import type { Car } from "@/lib/car-schema";
import { imageSrc } from "@/lib/format";

export function CarGallery({ car }: { car: Car }) {
  const [index, setIndex] = useState(0);
  const photos = car.images;
  const current = photos[index];

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center border border-foreground/12 bg-muted font-mono text-xs tracking-wider text-muted-foreground uppercase">
        No photo
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="overflow-hidden border border-foreground/12 bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- listing photos are volume paths */}
        <img
          src={imageSrc(current.path)}
          alt=""
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      {photos.length > 1 ? (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {photos.map((photo, photoIndex) => (
            <li key={photo.id}>
              <button
                type="button"
                className={
                  photoIndex === index
                    ? "overflow-hidden border border-foreground/20 ring-2 ring-ring"
                    : "overflow-hidden border border-foreground/12"
                }
                onClick={() => setIndex(photoIndex)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- listing photos are volume paths */}
                <img src={imageSrc(photo.path)} alt="" className="aspect-square w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
