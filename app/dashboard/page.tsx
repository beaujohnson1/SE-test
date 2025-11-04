"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileImage, Download, Sparkles, X, Coins } from "lucide-react";
import Image from "next/image";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";

interface UploadedPhoto {
  id: string;
  name: string;
  url: string;
  size: number;
  restored: boolean;
  restoredUrl?: string;
  exported: boolean;
}

export default function Dashboard() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<UploadedPhoto | null>(null);
  const [processing, setProcessing] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  // Load photos from database on mount
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        console.log("Loading photos from /api/photos...");
        const response = await fetch("/api/photos");
        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Photos loaded:", data.photos);
          setPhotos(data.photos || []);
        } else {
          console.error("Failed to load photos:", response.statusText);
          toast.error("Failed to load photos");
        }
      } catch (error) {
        console.error("Error loading photos:", error);
        toast.error("Error loading photos");
      }
    };
    loadPhotos();
  }, []);

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.random() * 20;
          });
        }, 200);

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const { id, url, name, size } = await response.json();

        const uploadedPhoto: UploadedPhoto = {
          id,
          name,
          url,
          size,
          restored: false,
          exported: false,
        };

        setPhotos((prev) => [uploadedPhoto, ...prev]);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  const removePhoto = async (id: string) => {
    try {
      const response = await fetch(`/api/photos?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPhotos((prev) => prev.filter((photo) => photo.id !== id));
        toast.success("Photo deleted");
      } else {
        toast.error("Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo");
    }
  };

  const handleRestoreClick = (photo: UploadedPhoto) => {
    setSelectedPhoto(photo);
    setRestoreModalOpen(true);
  };

  const handleExportClick = (photo: UploadedPhoto) => {
    setSelectedPhoto(photo);
    setExportModalOpen(true);
  };

  const handlePhotoClick = (photo: UploadedPhoto) => {
    if (photo.restored) {
      setSelectedPhoto(photo);
      setSliderPosition(50);
      setComparisonModalOpen(true);
    }
  };

  const confirmRestore = async () => {
    if (!selectedPhoto) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: selectedPhoto.url,
          photoId: selectedPhoto.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          toast.error("Insufficient credits. Please purchase more credits.");
        } else {
          toast.error(data.message || "Failed to restore photo");
        }
        return;
      }

      // Update photo with restored URL
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === selectedPhoto.id
            ? { ...p, restored: true, restoredUrl: data.restoredUrl }
            : p
        )
      );

      toast.success(`Photo restored successfully! ${data.creditsRemaining} credits remaining`);
      setRestoreModalOpen(false);
    } catch (error) {
      console.error("Restore error:", error);
      toast.error("Failed to restore photo");
    } finally {
      setProcessing(false);
      setSelectedPhoto(null);
    }
  };

  const confirmExport = async () => {
    if (!selectedPhoto) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: selectedPhoto.restoredUrl || selectedPhoto.url,
          photoId: selectedPhoto.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          toast.error("Insufficient credits. Please purchase more credits.");
        } else {
          toast.error(data.message || "Failed to export photo");
        }
        return;
      }

      // Update photo as exported
      setPhotos((prev) =>
        prev.map((p) => (p.id === selectedPhoto.id ? { ...p, exported: true } : p))
      );

      // Download the upscaled image (fetch as blob to avoid opening in new tab)
      try {
        const imageResponse = await fetch(data.upscaledUrl);
        const blob = await imageResponse.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${selectedPhoto.name.replace(/\.[^/.]+$/, "")}-upscaled.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        toast.error("Failed to download the image");
      }

      toast.success(`Photo exported! ${data.creditsRemaining} credits remaining`);
      setExportModalOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export photo");
    } finally {
      setProcessing(false);
      setSelectedPhoto(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif tracking-tight">My Photos</h1>
        <p className="text-muted-foreground mt-2">
          Upload photos to restore and export in 4K quality
        </p>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <div className="space-y-4">
              <FileImage className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {dragActive
                    ? "Drop your photos here"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, or JPEG up to 10MB
                </p>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Uploaded Photos ({photos.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="group relative overflow-hidden">
                <div
                  className={`aspect-square relative bg-muted ${photo.restored ? 'cursor-pointer' : ''}`}
                  onClick={() => handlePhotoClick(photo)}
                >
                  <Image
                    src={photo.restoredUrl || photo.url}
                    alt={photo.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  {photo.restored && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Restored
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <p className="font-medium text-sm truncate" title={photo.name}>
                    {photo.name}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 gap-1"
                      disabled={photo.restored}
                      onClick={() => handleRestoreClick(photo)}
                    >
                      <Sparkles className="h-3 w-3" />
                      {photo.restored ? "Restored" : "Restore"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      disabled={!photo.restored || photo.exported}
                      onClick={() => handleExportClick(photo)}
                    >
                      <Download className="h-3 w-3" />
                      Export
                    </Button>
                  </div>
                </CardContent>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 left-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && !uploading && (
        <div className="text-center py-12 text-muted-foreground">
          <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>No photos uploaded yet</p>
          <p className="text-sm mt-1">Upload your first photo to get started</p>
        </div>
      )}

      {/* Restore Modal */}
      <Dialog open={restoreModalOpen} onOpenChange={setRestoreModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Photo</DialogTitle>
            <DialogDescription>
              Transform this old photo into a stunning high-quality image with AI
            </DialogDescription>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-4">
              <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 rounded-full p-2">
                    <Coins className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">
                      This will use 1 credit
                    </p>
                    <p className="text-sm text-gray-600">
                      AI will restore this photo by removing damage, enhancing colors,
                      and improving clarity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreModalOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button onClick={confirmRestore} disabled={processing}>
              {processing ? "Restoring..." : "Restore Photo (1 Credit)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export in High Quality</DialogTitle>
            <DialogDescription>
              Upscale and export your restored photo with enhanced details
            </DialogDescription>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-4">
              <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
                <Image
                  src={selectedPhoto.restoredUrl || selectedPhoto.url}
                  alt={selectedPhoto.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Coins className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">
                      This will use 1 credit
                    </p>
                    <p className="text-sm text-gray-600">
                      Photo will be upscaled 2x with AI-powered detail enhancement for
                      high-quality output
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportModalOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button onClick={confirmExport} disabled={processing}>
              {processing ? "Exporting..." : "Export (1 Credit)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Before/After Comparison Modal */}
      <Dialog open={comparisonModalOpen} onOpenChange={setComparisonModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Before & After Comparison</DialogTitle>
            <DialogDescription>
              Drag the slider to see the transformation
            </DialogDescription>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-4">
              {/* Before/After Slider */}
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                {/* After Image (Restored) */}
                <Image
                  src={selectedPhoto.restoredUrl || selectedPhoto.url}
                  alt="After"
                  fill
                  className="object-cover"
                />
                {/* Before Image (Original) with clip path */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <Image
                    src={selectedPhoto.url}
                    alt="Before"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Slider line and handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <div className="w-1 h-4 bg-gray-400" />
                  </div>
                </div>
                {/* Slider input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                />
                {/* Labels */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Before
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  After
                </div>
              </div>

              {/* Photo Info */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{selectedPhoto.name}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setComparisonModalOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setComparisonModalOpen(false);
                if (selectedPhoto) {
                  handleExportClick(selectedPhoto);
                }
              }}
              disabled={selectedPhoto?.exported}
            >
              <Download className="h-4 w-4 mr-2" />
              {selectedPhoto?.exported ? "Exported" : "Export (1 Credit)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
