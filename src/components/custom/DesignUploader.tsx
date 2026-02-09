'use client';

import { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, Type, Image as ImageIcon } from 'lucide-react';
import { useCustomDesignStore } from '@/stores/customDesign';
import { Button } from '@/components/common/Button';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { DESIGN_PRESETS } from '@/lib/custom/presets';

type UploadMode = 'preset' | 'image' | 'text';

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

export function DesignUploader() {
  const {
    activePosition,
    front,
    back,
    leftArm,
    rightArm,
    setPartImageUrl,
    setPartText,
    resetPart,
  } = useCustomDesignStore();

  const [mode, setMode] = useState<UploadMode>('preset');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getCurrentPart = () => {
    switch (activePosition) {
      case 'front': return front;
      case 'back': return back;
      case 'leftArm': return leftArm;
      case 'rightArm': return rightArm;
    }
  };

  const currentPart = getCurrentPart();

  useEffect(() => {
    const img = currentPart.image_url;
    if (img) {
      const isPreset = DESIGN_PRESETS.some((p) => p.url === img);
      setMode(isPreset ? 'preset' : 'image');
      return;
    }
    if (currentPart.text.trim().length > 0) {
      setMode('text');
      return;
    }
    setMode('preset');
  }, [activePosition, currentPart.image_url, currentPart.text]);

  const previewSrc = useMemo(() => {
    return localPreviewUrl ?? currentPart.image_url ?? null;
  }, [currentPart.image_url, localPreviewUrl]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      setUploadError(null);

      const uuid =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const path = `guest/${uuid}/${activePosition}-${Date.now()}-${safeFileName(file.name)}`;

      setIsUploading(true);
      try {
        setLocalPreviewUrl(URL.createObjectURL(file));
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.storage
          .from('designs')
          .upload(path, file, { contentType: file.type, upsert: false });

        if (error) throw error;

        const { data } = supabase.storage.from('designs').getPublicUrl(path);
        if (!data?.publicUrl) {
          throw new Error('Failed to get public URL');
        }

        setPartImageUrl(activePosition, data.publicUrl);
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsUploading(false);
      }
    },
    [activePosition, setPartImageUrl]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        void uploadFile(files[0]);
      }
    },
    [uploadFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void uploadFile(files[0]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPartText(activePosition, e.target.value);
  };

  const handleRemove = () => {
    resetPart(activePosition);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const positionLabels = {
    front: 'Front',
    back: 'Back',
    leftArm: 'Left Sleeve',
    rightArm: 'Right Sleeve',
  };

  const handleModeChange = (next: UploadMode) => {
    setMode(next);
    if (next === 'preset') {
      setPartText(activePosition, '');
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }
      if (inputRef.current) inputRef.current.value = '';
      const img = currentPart.image_url;
      const isPreset = img ? DESIGN_PRESETS.some((p) => p.url === img) : false;
      if (img && !isPreset) setPartImageUrl(activePosition, null);
      return;
    }
    if (next === 'image') {
      setPartText(activePosition, '');
      return;
    }
    setPartImageUrl(activePosition, null);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Design for {positionLabels[activePosition]}
        </h3>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleModeChange('preset')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
              mode === 'preset'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Preset
          </button>
          <button
            onClick={() => handleModeChange('image')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
              mode === 'image'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image
          </button>
          <button
            onClick={() => handleModeChange('text')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
              mode === 'text'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Type className="w-4 h-4" />
            Text
          </button>
        </div>
      </div>

      {mode === 'preset' ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Choose a preset design for the {positionLabels[activePosition].toLowerCase()}.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DESIGN_PRESETS.map((p) => {
              const selected = currentPart.image_url === p.url;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPartImageUrl(activePosition, p.url)}
                  className={`rounded-xl border p-2 text-left transition-colors ${
                    selected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  title={p.name}
                >
                  <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                    <Image src={p.url} alt={p.name} fill className="object-contain" />
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-800 line-clamp-1">{p.name}</p>
                </button>
              );
            })}
          </div>
          {currentPart.image_url ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">Selected: {currentPart.image_url}</p>
              <Button variant="outline" size="sm" onClick={handleRemove}>
                Clear
              </Button>
            </div>
          ) : null}
        </div>
      ) : mode === 'image' ? (
        <>
          {previewSrc ? (
            <div className="relative border-2 border-gray-200 rounded-xl p-4">
              <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden">
                {previewSrc.startsWith('blob:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt="Design preview"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={previewSrc}
                    alt="Design preview"
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-600">
                  {isUploading ? 'Uploading...' : currentPart.image_url ? 'Uploaded' : ''}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Change
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {uploadError && (
                <p className="mt-2 text-sm text-red-600">{uploadError}</p>
              )}
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900 mb-1">
                  {isDragging ? 'Drop your file here' : 'Upload your design'}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, SVG (max 10MB)
                </p>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </>
      ) : (
        <div className="space-y-3">
          <textarea
            value={currentPart.text}
            onChange={handleTextChange}
            placeholder="Enter your custom text..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
          />
          <p className="text-xs text-gray-500">
            Your text will be printed on the {positionLabels[activePosition].toLowerCase()} of the shirt.
          </p>
        </div>
      )}
    </div>
  );
}
