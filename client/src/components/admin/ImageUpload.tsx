import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  label?: string;
  currentImage?: string;
}

export default function ImageUpload({ onUpload, label = 'Şəkil Yüklə', currentImage }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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

    // Показать превью
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);

    // Загрузить файл
    setStatus('loading');
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(file);
    });

    uploadMutation.mutate({
      filename: file.name,
      base64,
    });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Preview */}
      {preview && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
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
    </div>
  );
}
