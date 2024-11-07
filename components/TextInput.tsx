type TextInputProps = {
    question: string;
    onChange: (value: string) => void;
  };
  
  export default function TextInput({ question, onChange }: TextInputProps) {
    return (
      <div className="mb-4">
        <label className="block mb-2 font-medium">{question}</label>
        <input
          type="text"
          className="border px-2 py-1 rounded w-full"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
  