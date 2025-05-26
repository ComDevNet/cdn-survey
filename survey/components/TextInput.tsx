type TextInputProps = {
  onChange: (value: string) => void;
};

export default function TextInput({ onChange }: TextInputProps) {
  return (
    <input
      type="text"
      onChange={(e) => onChange(e.target.value)}
      className="border-2 px-3 py-3 rounded-xl w-full mt-1 border-gray-600"
    />
  );
}
