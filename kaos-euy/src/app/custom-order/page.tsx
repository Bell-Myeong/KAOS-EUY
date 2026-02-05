'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/uploads';
import type {
  ApiErrorResponse,
  CreateCustomRequestRequest,
  CreateCustomRequestResponse,
  PresignUploadRequest,
  PresignUploadResponse,
  UploadedFileMeta,
} from '@/types/custom-request';

const PRODUCT_TYPE_OPTIONS = [
  { value: 'tshirt', label: 'T-Shirt' },
  { value: 'polo', label: 'Polo' },
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'totebag', label: 'Totebag' },
  { value: 'uniform', label: 'Uniform' },
];

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  meta?: UploadedFileMeta;
}

function createUploadGroupId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `upload-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function isValidFile(file: File) {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  if (!ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number])) {
    return `허용되지 않은 확장자입니다. (${ALLOWED_EXTENSIONS.join(', ')})`;
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return '허용되지 않은 파일 타입입니다.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `파일 용량은 ${Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB 이하여야 합니다.`;
  }
  return null;
}

async function uploadToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress: (progress: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`업로드 실패 (status=${xhr.status})`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('네트워크 오류로 업로드에 실패했습니다.'));
    };

    xhr.send(file);
  });
}

export default function CustomOrderPage() {
  const [uploadGroupId] = useState<string>(() => createUploadGroupId());
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [form, setForm] = useState({
    requester_name: '',
    whatsapp: '',
    org_name: '',
    product_types: [] as string[],
    quantity_estimate: '',
    deadline_date: '',
    notes: '',
    company_website: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadingCount = uploads.filter((item) => item.status === 'uploading').length;
  const uploadedFiles = useMemo(
    () => uploads.filter((item) => item.status === 'success' && item.meta).map((item) => item.meta as UploadedFileMeta),
    [uploads]
  );

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleProductType = (value: string) => {
    setForm((prev) => {
      const exists = prev.product_types.includes(value);
      return {
        ...prev,
        product_types: exists
          ? prev.product_types.filter((item) => item !== value)
          : [...prev.product_types, value],
      };
    });
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';

    if (selected.length === 0) return;

    const remaining = MAX_FILE_COUNT - uploads.length;
    const filesToProcess = selected.slice(0, Math.max(0, remaining));

    if (selected.length > remaining) {
      setSubmitError(`파일은 최대 ${MAX_FILE_COUNT}개까지 업로드할 수 있습니다.`);
    }

    filesToProcess.forEach((file) => {
      const error = isValidFile(file);
      const id = `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
      if (error) {
        setUploads((prev) => [
          ...prev,
          { id, file, status: 'error', progress: 0, error },
        ]);
        return;
      }

      const newItem: UploadItem = {
        id,
        file,
        status: 'uploading',
        progress: 0,
      };

      setUploads((prev) => [...prev, newItem]);
      startUpload(newItem);
    });
  };

  const startUpload = async (item: UploadItem) => {
    try {
      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === item.id ? { ...upload, status: 'uploading', error: undefined, progress: 0 } : upload
        )
      );

      const presignPayload: PresignUploadRequest = {
        ownerType: 'custom_request',
        uploadGroupId,
        fileName: item.file.name,
        mimeType: item.file.type,
        sizeBytes: item.file.size,
      };

      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presignPayload),
      });

      const presignData = (await presignRes.json()) as PresignUploadResponse | ApiErrorResponse;
      if (!presignRes.ok) {
        const err = presignData as ApiErrorResponse;
        throw new Error(err.message || 'Signed URL 발급 실패');
      }

      const { signedUrl, bucket, path } = presignData as PresignUploadResponse;

      await uploadToSignedUrl(signedUrl, item.file, (progress) => {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === item.id ? { ...upload, progress } : upload
          )
        );
      });

      const meta: UploadedFileMeta = {
        bucket,
        path,
        original_name: item.file.name,
        mime_type: item.file.type,
        size_bytes: item.file.size,
      };

      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === item.id
            ? { ...upload, status: 'success', progress: 100, meta }
            : upload
        )
      );
    } catch (error) {
      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === item.id
            ? { ...upload, status: 'error', error: error instanceof Error ? error.message : '업로드 실패' }
            : upload
        )
      );
    }
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.requester_name.trim()) {
      errors.requester_name = '담당자 이름을 입력해주세요.';
    }
    if (!form.whatsapp.trim()) {
      errors.whatsapp = 'WhatsApp 연락처를 입력해주세요.';
    }
    if (form.product_types.length === 0) {
      errors.product_types = '제품 종류를 최소 1개 선택해주세요.';
    }
    const quantityValue = Number(form.quantity_estimate);
    if (!Number.isFinite(quantityValue) || quantityValue < 1) {
      errors.quantity_estimate = '수량을 올바르게 입력해주세요.';
    }
    if (uploadingCount > 0) {
      errors.files = '파일 업로드가 완료될 때까지 기다려주세요.';
    }
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError('필수 항목을 확인해주세요.');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const payload: CreateCustomRequestRequest = {
      requester_name: form.requester_name.trim(),
      whatsapp: form.whatsapp.trim(),
      org_name: form.org_name.trim() || undefined,
      upload_group_id: uploadGroupId,
      product_types: form.product_types,
      quantity_estimate: Number(form.quantity_estimate),
      deadline_date: form.deadline_date || undefined,
      notes: form.notes.trim() || undefined,
      files: uploadedFiles,
      company_website: form.company_website?.trim() || undefined,
    };

    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as CreateCustomRequestResponse | ApiErrorResponse;
      if (!res.ok) {
        const err = data as ApiErrorResponse;
        setSubmitError(err.message || '요청 전송에 실패했습니다.');
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
        return;
      }

      const success = data as CreateCustomRequestResponse;
      setSubmitSuccess(`요청이 접수되었습니다. 요청번호: ${success.requestNumber}`);
      setForm({
        requester_name: '',
        whatsapp: '',
        org_name: '',
        product_types: [],
        quantity_estimate: '',
        deadline_date: '',
        notes: '',
        company_website: '',
      });
      setUploads([]);
    } catch (error) {
      setSubmitError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-3">
            Custom Order for Teams
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Bandung vibe, custom for your team.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Kaos EUY로 팀의 무드를 한 번에 맞춰보세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">빠른 이동</span>
            <a href="#contact" className="hover:text-primary">담당자 정보</a>
            <a href="#order-info" className="hover:text-primary">주문 정보</a>
            <a href="#uploads" className="hover:text-primary">파일 업로드</a>
          </div>

          <div className="absolute left-[-9999px] top-0" aria-hidden="true">
            <label htmlFor="company_website">Company Website</label>
            <input
              id="company_website"
              type="text"
              name="company_website"
              value={form.company_website}
              onChange={(event) => handleChange('company_website', event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div id="contact" className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900">담당자 정보</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  담당자 이름 *
                </label>
                <input
                  type="text"
                  value={form.requester_name}
                  onChange={(event) => handleChange('requester_name', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="김민수"
                  autoComplete="name"
                />
                {fieldErrors.requester_name && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.requester_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.whatsapp}
                  onChange={(event) => handleChange('whatsapp', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="+62 812-3456-7890"
                  autoComplete="tel"
                />
                <p className="text-xs text-gray-500 mt-1">국가코드 포함 번호로 입력해주세요.</p>
                {fieldErrors.whatsapp && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.whatsapp}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                조직/팀명 (권장)
              </label>
              <input
                type="text"
                value={form.org_name}
                onChange={(event) => handleChange('org_name', event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                placeholder="Bandung FC"
                autoComplete="organization"
              />
            </div>
          </div>

          <div id="order-info" className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900">주문 정보</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                제품 종류 *
              </label>
              <p className="text-xs text-gray-500 mb-3">복수 선택 가능합니다.</p>
              <div className="flex flex-wrap gap-3">
                {PRODUCT_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold cursor-pointer transition-colors ${
                      form.product_types.includes(option.value)
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 text-gray-700 hover:border-primary/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.product_types.includes(option.value)}
                      onChange={() => toggleProductType(option.value)}
                      className="hidden"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {fieldErrors.product_types && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.product_types}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  예상 수량 *
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={form.quantity_estimate}
                  onChange={(event) => handleChange('quantity_estimate', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="50"
                />
                <p className="text-xs text-gray-500 mt-1">최소 1개 이상 입력해주세요.</p>
                {fieldErrors.quantity_estimate && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.quantity_estimate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  희망 납기일 (선택)
                </label>
                <input
                  type="date"
                  value={form.deadline_date}
                  onChange={(event) => handleChange('deadline_date', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                추가 요청사항 (선택)
              </label>
              <textarea
                value={form.notes}
                onChange={(event) => handleChange('notes', event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 min-h-[120px] focus:border-primary focus:outline-none"
                placeholder="원하는 소재/컬러/로고 위치 등 추가 요청을 남겨주세요."
              />
            </div>
          </div>

          <div id="uploads" className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900">파일 업로드 (선택)</h2>
            <p className="text-sm text-gray-500">
              허용 확장자: {ALLOWED_EXTENSIONS.join(', ')} · 최대 용량: {Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB · 최대 {MAX_FILE_COUNT}개
            </p>

            <input
              type="file"
              multiple
              onChange={handleFilesSelected}
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-primary/90"
              accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
            />

            {fieldErrors.files && (
              <p className="text-xs text-red-500">{fieldErrors.files}</p>
            )}

            <div className="space-y-3">
              {uploads.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(item.file.size / (1024 * 1024)).toFixed(2)}MB
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'uploading' && (
                        <span className="text-xs text-blue-600">업로드 중 {item.progress}%</span>
                      )}
                      {item.status === 'success' && (
                        <span className="text-xs text-green-600">업로드 완료</span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-xs text-red-600">실패</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeUpload(item.id)}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        삭제
                      </button>
                      {item.status === 'error' && (
                        <button
                          type="button"
                          onClick={() => startUpload(item)}
                          className="text-xs text-primary font-semibold"
                        >
                          재시도
                        </button>
                      )}
                    </div>
                  </div>
                  {item.status === 'uploading' && (
                    <div className="mt-2 h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === 'error' && item.error && (
                    <p className="text-xs text-red-500 mt-2">{item.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {submitSuccess}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
            견적 요청 보내기
          </Button>
        </form>
      </div>
    </div>
  );
}
