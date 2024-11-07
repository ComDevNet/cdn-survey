type FileUploadProps = {
    question: string;
    onChange: (value: File | null) => void;
  };
  
  export default function FileUpload({ question, onChange }: FileUploadProps) {
    return (
      <div className="mb-4">
        <label className="block mb-2 font-medium">{question}</label>
        <input
          type="file"
          className="border px-2 py-1 rounded"
          onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
        />
      </div>
    );
  }
  