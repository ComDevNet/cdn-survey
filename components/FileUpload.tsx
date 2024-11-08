type FileUploadProps = {
  onChange: (file: File | null) => void;
};

export default function FileUpload({ onChange }: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onChange(event.target.files[0]);
    } else {
      onChange(null);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} className="block mt-2" />
    </div>
  );
}
