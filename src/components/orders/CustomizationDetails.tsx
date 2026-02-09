'use client';

import { useMemo } from 'react';

type CustomPosition = 'front' | 'back' | 'leftArm' | 'rightArm';

type CustomizationPart = {
  applied: boolean;
  image_url: string | null;
  text: string;
  position: { x: number; y: number };
  scale: number;
};

type CustomizationPartsByPosition = Record<CustomPosition, CustomizationPart>;

function safeString(v: unknown) {
  return typeof v === 'string' ? v : '';
}

function safeNumber(v: unknown, fallback = 0) {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function normalizePart(raw: any): CustomizationPart {
  const imageUrl = safeString(raw?.image_url);
  const text = safeString(raw?.text);
  const pos = raw?.position ?? {};
  const x = safeNumber(pos?.x, 0);
  const y = safeNumber(pos?.y, 0);
  const scale = safeNumber(raw?.scale, 1);
  const applied = Boolean(raw?.applied) || Boolean(imageUrl) || text.trim().length > 0;

  return {
    applied,
    image_url: imageUrl ? imageUrl : null,
    text,
    position: { x, y },
    scale: Math.max(0.5, Math.min(2, scale)),
  };
}

export function getCustomizationParts(customization: unknown): CustomizationPartsByPosition | null {
  if (!customization || typeof customization !== 'object') return null;
  const parts = (customization as any).parts;
  if (!parts || typeof parts !== 'object') return null;

  const fallback: CustomizationPart = {
    applied: false,
    image_url: null,
    text: '',
    position: { x: 0, y: 0 },
    scale: 1,
  };

  return {
    front: normalizePart((parts as any).front ?? fallback),
    back: normalizePart((parts as any).back ?? fallback),
    leftArm: normalizePart((parts as any).leftArm ?? fallback),
    rightArm: normalizePart((parts as any).rightArm ?? fallback),
  };
}

function hasAnyContent(parts: CustomizationPartsByPosition | null) {
  if (!parts) return false;
  return (Object.keys(parts) as CustomPosition[]).some((pos) => {
    const p = parts[pos];
    return Boolean(p.image_url) || p.text.trim().length > 0;
  });
}

function downloadJson(filename: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function CustomizationDetails(props: {
  customization: unknown;
  downloadName?: string;
  variant?: 'admin' | 'customer';
}) {
  const parts = useMemo(() => getCustomizationParts(props.customization), [props.customization]);
  const show = hasAnyContent(parts);
  const variant = props.variant ?? 'customer';

  if (!show || !parts) return null;

  const posLabel: Record<CustomPosition, string> = {
    front: 'Front',
    back: 'Back',
    leftArm: 'Left sleeve',
    rightArm: 'Right sleeve',
  };

  const wrapClass =
    variant === 'admin'
      ? 'rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3'
      : 'rounded-lg border border-gray-200 bg-white p-3 space-y-3';

  return (
    <div className={wrapClass}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Customization
        </p>
        {props.downloadName ? (
          <button
            type="button"
            onClick={() => downloadJson(props.downloadName!, props.customization)}
            className="text-xs text-primary hover:underline"
          >
            Download JSON
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(parts) as CustomPosition[]).map((pos) => {
          const part = parts[pos];
          const imageUrl = part.image_url;
          const text = part.text.trim();
          const kind: 'image' | 'text' | 'none' = imageUrl ? 'image' : text ? 'text' : 'none';

          return (
            <div key={pos} className="rounded-lg bg-gray-50 border border-gray-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{posLabel[pos]}</p>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border ${
                    kind === 'image'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : kind === 'text'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  {kind === 'image' ? 'Image' : kind === 'text' ? 'Text' : 'None'}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-3 items-start">
                <div className="relative aspect-square rounded-md bg-white border border-gray-200 overflow-hidden">
                  {(imageUrl || text) ? (
                    <div
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(-50%, -50%) translate(${part.position.x}%, ${part.position.y}%) scale(${part.scale})`,
                      }}
                    >
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={`${pos} design`}
                          className="w-14 h-14 object-contain drop-shadow-sm"
                        />
                      ) : (
                        <div className="max-w-[96px] text-center text-[11px] font-semibold text-gray-900 leading-snug whitespace-pre-wrap break-words">
                          {text}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1 text-xs text-gray-700">
                  <p>
                    <span className="text-gray-500">x/y:</span>{' '}
                    {Math.round(part.position.x)}, {Math.round(part.position.y)}
                  </p>
                  <p>
                    <span className="text-gray-500">scale:</span> {part.scale.toFixed(2)}
                  </p>
                  {kind === 'image' && imageUrl ? (
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-primary hover:underline"
                    >
                      Open image
                    </a>
                  ) : null}
                  {kind === 'text' && text ? (
                    <p className="text-gray-600 line-clamp-3">
                      <span className="text-gray-500">text:</span> {text}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

