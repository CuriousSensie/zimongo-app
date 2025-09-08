"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import ZoomableImage from "./ZoomableImage";
import { LeadFile } from "@/types/lead";
import { NEXT_PUBLIC_S3_BASE_URL } from "@/constant/env";
import Image from "next/image";

interface ImageCarouselProps {
  images: LeadFile[];
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative bg-slate-50 rounded-lg overflow-hidden">
        {/* Main Image Display */}
        <div className="relative aspect-video bg-slate-100 flex items-center justify-center">
          <ZoomableImage
            src={`${NEXT_PUBLIC_S3_BASE_URL}/${images[currentIndex].path}`}
            alt={images[currentIndex].originalName}
            className="object-contain rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-105"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-105"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded-md">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="p-3 bg-white border-t">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide md:justify-center">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 relative w-12 h-12  md:w-16 md:h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    index === currentIndex
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Image
                    src={`${NEXT_PUBLIC_S3_BASE_URL}/${image.path}`}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="w-full h-full object-cover"
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-blue-500/20" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Info */}
      <div className="mt-2 text-center">
        <p className="text-sm text-slate-600 flex items-center justify-center gap-1">
          <ImageIcon className="w-4 h-4" />
          {images[currentIndex].originalName}
        </p>
        {images[currentIndex].size && (
          <p className="text-xs text-slate-500 mt-1">
            {(images[currentIndex].size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;