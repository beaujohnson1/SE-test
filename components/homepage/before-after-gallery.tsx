"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const photoData = [
  { before: "/beforeafterphotos/before1.jpg", after: "/beforeafterphotos/after1.png" },
  { before: "/beforeafterphotos/before2.jpg", after: "/beforeafterphotos/after2.png" },
  { before: "/beforeafterphotos/before3.jpg", after: "/beforeafterphotos/after3.png" },
  { before: "/beforeafterphotos/before4.jpg", after: "/beforeafterphotos/after4.png" },
  { before: "/beforeafterphotos/before5.jpg", after: "/beforeafterphotos/after5.png" },
  { before: "/beforeafterphotos/before6.jpg", after: "/beforeafterphotos/after6.png" },
  { before: "/beforeafterphotos/before7.jpg", after: "/beforeafterphotos/after7.png" },
  { before: "/beforeafterphotos/before8.jpg", after: "/beforeafterphotos/after8.png" },
  { before: "/beforeafterphotos/before9.jpg", after: "/beforeafterphotos/after9.png" },
  { before: "/beforeafterphotos/before10.jpg", after: "/beforeafterphotos/after10.png" },
  { before: "/beforeafterphotos/before11.jpg", after: "/beforeafterphotos/after11.png" },
  { before: "/beforeafterphotos/before12.jpg", after: "/beforeafterphotos/after12.png" },
  { before: "/beforeafterphotos/before13.jpg", after: "/beforeafterphotos/after13.png" },
  { before: "/beforeafterphotos/before14.jpg", after: "/beforeafterphotos/after14.png" },
  { before: "/beforeafterphotos/before15.jpg", after: "/beforeafterphotos/after15.png" },
  { before: "/beforeafterphotos/before16.jpg", after: "/beforeafterphotos/after16.png" },
];

function BeforeAfterTile({ before, after }: { before: string; after: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseDown = () => setIsDragging(true);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-square overflow-hidden rounded-lg bg-gray-900 select-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Full) */}
      <div className="absolute inset-0">
        <Image
          src={after}
          alt="After restoration"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          draggable={false}
        />
        <div className="absolute top-2 right-2 bg-white/90 text-gray-900 text-xs px-2 py-1 rounded font-medium">
          After
        </div>
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={before}
          alt="Before restoration"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          draggable={false}
        />
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          Before
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* Handle Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-4 bg-gray-400"></div>
            <div className="w-0.5 h-4 bg-gray-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BeforeAfterGallery() {
  return (
    <section id="examples" className="bg-black py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-white text-4xl lg:text-5xl font-normal tracking-tight mb-4">
            See the Magic in Action
          </h2>
          <p className="font-sans text-gray-400 text-lg font-light max-w-2xl mx-auto">
            Drag the slider on any photo to reveal the stunning transformation. Watch as faded memories become vibrant, high-resolution treasures.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photoData.map((photo, index) => (
            <BeforeAfterTile
              key={index}
              before={photo.before}
              after={photo.after}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
