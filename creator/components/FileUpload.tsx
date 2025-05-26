import { useState } from 'react';

type FileUploadProps = {
  onChange: (file: File | null) => void;
};

export default function FileUpload({ onChange }: FileUploadProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFileName(file ? file.name : null);
    onChange(file);
  };

  return (
    <div className="flex flex-col items-center">
      <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-orange-500 rounded-lg shadow-lg tracking-wide uppercase border border-orange-400 cursor-pointer hover:bg-orange-500 hover:text-white transition-all duration-700">
        <svg
          className="w-8 h-8"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M16.88 9.94l-5.66-5.66a1.5 1.5 0 00-2.12 0l-5.66 5.66a1.5 1.5 0 000 2.12l5.66 5.66a1.5 1.5 0 002.12 0l5.66-5.66a1.5 1.5 0 000-2.12zM10 14.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
        <span className="mt-2 text-base leading-normal">
          {selectedFileName || 'Select a file'}
        </span>
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {selectedFileName && (
        <p className="mt-2 text-sm text-gray-600">Selected file: {selectedFileName}</p>
      )}
    </div>
  );
}
