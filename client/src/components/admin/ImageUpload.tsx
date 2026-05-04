import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  label?: string;
  currentImage?: string;
  category?: string;
  previewMode?: 'cover' | 'doctor';
}

const DOCTOR_CANVAS_WIDTH = 1200;
const DOCTOR_CANVAS_HEIGHT = 1600;
const DOCTOR_PADDING_X = 56;
const DOCTOR_PADDING_TOP = 52;
const DOCTOR_PADDING_BOTTOM = 52;

async function readFileAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Fayl oxunmadı'));
    reader.readAsDataURL(file);
  });
}

async function loadImageFromDataUrl(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Şəkil açılmadı'));
    image.src = dataUrl;
  });
}

async function canvasToJpegBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Şəkil çevrilmədi'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      0.92
    );
  });
}

async function normalizeDoctorPortrait(file: File) {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const sourceImage = await loadImageFromDataUrl(sourceDataUrl);

  const canvas = document.createElement('canvas');
  canvas.width = DOCTOR_CANVAS_WIDTH;
  canvas.height = DOCTOR_CANVAS_HEIGHT;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas dəstəyi tapılmadı');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const availableWidth = canvas.width - DOCTOR_PADDING_X * 2;
  const availableHeight = canvas.height - DOCTOR_PADDING_TOP - DOCTOR_PADDING_BOTTOM;
  const scale = Math.min(
    availableWidth / sourceImage.width,
    availableHeight / sourceImage.height
  );

  const drawWidth = sourceImage.width * scale;
  const drawHeight = sourceImage.height * scale;
  const offsetX = (canvas.width - drawWidth) / 2;
  const extraVerticalSpace = Math.max(availableHeight - drawHeight, 0);
  const offsetY = DOCTOR_PADDING_TOP + extraVerticalSpace * 0.18;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(sourceImage, offsetX, offsetY, drawWidth, drawHeight);

  const normalizedBlob = await canvasToJpegBlob(canvas);
  const normalizedDataUrl = await readFileAsDataUrl(normalizedBlob);
  const base64 = normalizedDataUrl.split(',')[1];
  const normalizedFilename = file.name.replace(/\.[^.]+$/, '') || 'doctor-photo';

  return {
    base64,
    previewUrl: normalizedDataUrl,
    filename: `${normalizedFilename}-3x4.jpg`,
    contentType: 'image/jpeg',
  };
}

export default function ImageUpload({
  onUpload,
  label = 'Şəkil Yüklə',
  currentImage,
  category = 'uploads',
  previewMode = 'cover',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const isDoctorPreview = previewMode === 'doctor';

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      setStatus('success');
      setMessage('Şəkil uğurla yükləndi!');
      onUpload(data.url);
      setTimeout(() => setStatus('idle'), 2000);
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.message || 'Yükləmə xətası');
      setTimeout(() => setStatus('idle'), 3000);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Валидация типа файла
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setMessage('Yalnız şəkil faylları qəbul edilir');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    // Валидация размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatus('error');
      setMessage('Fayl ölçüsü 5MB-dan çox ola bilməz');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('loading');

    try {
      const uploadPayload = isDoctorPreview
        ? await normalizeDoctorPortrait(file)
        : {
            filename: file.name,
            base64: (await readFileAsDataUrl(file)).split(',')[1],
            contentType: file.type,
            previewUrl: await readFileAsDataUrl(file),
          };

      setPreview(uploadPayload.previewUrl);

      uploadMutation.mutate({
        filename: uploadPayload.filename,
        base64: uploadPayload.base64,
        contentType: uploadPayload.contentType,
        category,
      });
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Şəkil hazırlanmadı');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Preview */}
      {preview && (
        <div
          className={`relative w-full overflow-hidden rounded-lg border border-gray-200 ${
            isDoctorPreview ? 'h-44 bg-white p-3' : 'h-32'
          }`}
        >
          <img
            src={preview}
            alt="Preview"
            className={`h-full w-full ${
              isDoctorPreview ? 'rounded-md object-contain object-center' : 'object-cover'
            }`}
          />
        </div>
      )}

      {/* Upload Button */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploadMutation.isPending}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending || status === 'loading'}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            status === 'success'
              ? 'bg-green-100 text-green-700'
              : status === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
          }`}
        >
          {status === 'loading' || uploadMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Yüklənir...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Yükləndi
            </>
          ) : status === 'error' ? (
            <>
              <AlertCircle className="w-4 h-4" />
              Xəta
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {label}
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <p
          className={`text-xs ${
            status === 'success'
              ? 'text-green-700'
              : status === 'error'
              ? 'text-red-700'
              : 'text-gray-600'
          }`}
        >
          {message}
        </p>
      )}

      {isDoctorPreview ? (
        <p className="text-xs text-gray-500">
          Tövsiyə olunan ölçü: `1200×1600 px` və ya `900×1200 px` (`3:4` portret). Sistem həkim
          fotolarını ağ fonda `3:4` formata avtomatik yerləşdirir, yuxarıdan kəsməmək üçün təhlükəsiz
          boşluqlar əlavə edir və kart görünüşünə uyğunlaşdırır.
        </p>
      ) : null}
    </div>
  );
}
