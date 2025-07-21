'use client';

import { FileUpload } from '@/components/ui/file-upload';
import { useState } from 'react';

const FileUploadComponent: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = async (incomingFiles: File[]) => {
    const pdfFiles = incomingFiles.filter(file => file.type === 'application/pdf');
    setFiles(pdfFiles);

    if (pdfFiles.length > 0) {
      const formData = new FormData();
      formData.append('pdf', pdfFiles[0]); // 🔥 Use `'file'` or what your backend expects

      try {
        const response = await fetch('http://localhost:8000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error('Upload failed:', response.statusText);
        } else {
          const result = await response.json();
          console.log('Upload success:', result);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    } else {
      console.warn('No PDF file selected');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 flex justify-center items-center border border-dashed bg-yellow-100 dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
};

export default FileUploadComponent;
