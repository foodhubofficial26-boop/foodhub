import { useCallback, useEffect, useMemo, useState } from 'react';
import { type FileError, type FileRejection, useDropzone } from 'react-dropzone';
import axios from 'axios';
import { setAuthHeaders } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

interface FileWithPreview extends File {
  preview?: string;
  errors: readonly FileError[];
}

interface FileWithPreview extends File {
  preview?: string;
  errors: readonly FileError[];
}

type UseUploadOptions = {
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
};

type UseUploadReturn = ReturnType<typeof useUpload>;

const useUpload = (options: UseUploadOptions) => {
  const {
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
  } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([]);
  const [successes, setSuccesses] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>({});

  const isSuccess = useMemo(() => {
    if (errors.length === 0 && successes.length === 0) return false;
    if (errors.length === 0 && successes.length === files.length) return true;
    return false;
  }, [errors.length, successes.length, files.length]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const validFiles = acceptedFiles
        .filter((file) => !files.find((x) => x.name === file.name))
        .map((file) => {
          (file as FileWithPreview).preview = URL.createObjectURL(file);
          (file as FileWithPreview).errors = [];
          return file as FileWithPreview;
        });

      const invalidFiles = fileRejections.map(({ file, errors }) => {
        (file as FileWithPreview).preview = URL.createObjectURL(file);
        (file as FileWithPreview).errors = errors;
        return file as FileWithPreview;
      });

      setFiles([...files, ...validFiles, ...invalidFiles]);
    },
    [files]
  );

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles,
    multiple: maxFiles !== 1,
  });

  const onUpload = useCallback(async () => {
    setLoading(true);
    setAuthHeaders();

    const filesWithErrors = errors.map((x) => x.name);
    const filesToUpload =
      filesWithErrors.length > 0
        ? [
          ...files.filter((f) => filesWithErrors.includes(f.name)),
          ...files.filter((f) => !successes.includes(f.name)),
        ]
        : files;

    const responses = await Promise.all(
      filesToUpload.map(async (file) => {
        try {
          const formData = new FormData();
          formData.append('image', file);
          const res = await axios.post(`${API_URL}/api/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const url: string = res.data?.url || '';
          return { name: file.name, message: undefined as string | undefined, url };
        } catch (err: unknown) {
          const axErr = err as { response?: { data?: { message?: string } }; message?: string };
          const message = axErr?.response?.data?.message || axErr?.message || 'Upload failed';
          return { name: file.name, message, url: '' };
        }
      })
    );

    const responseErrors = responses
      .filter((x) => x.message !== undefined)
      .map((x) => ({ name: x.name, message: x.message as string }));
    setErrors(responseErrors);

    const responseSuccesses = responses.filter((x) => x.message === undefined);
    setSuccesses(Array.from(new Set([...successes, ...responseSuccesses.map((x) => x.name)])));

    // Store Cloudinary URLs keyed by filename
    const newUrls: Record<string, string> = {};
    for (const s of responseSuccesses) {
      if (s.url) newUrls[s.name] = s.url;
    }
    setUploadedUrls((prev) => ({ ...prev, ...newUrls }));

    setLoading(false);
  }, [files, errors, successes]);

  useEffect(() => {
    if (files.length === 0) {
      setErrors([]);
    }
    if (files.length <= maxFiles) {
      let changed = false;
      const newFiles = files.map((file) => {
        if (file.errors.some((e) => e.code === 'too-many-files')) {
          file.errors = file.errors.filter((e) => e.code !== 'too-many-files');
          changed = true;
        }
        return file;
      });
      if (changed) setFiles(newFiles);
    }
  }, [files.length, maxFiles]);

  return {
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    uploadedUrls,
    maxFileSize,
    maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  };
};

export { useUpload, type UseUploadOptions, type UseUploadReturn };
