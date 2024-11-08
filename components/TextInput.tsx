type TextInputProps = {
  onChange: (value: string) => void;
};

export default function TextInput({ onChange }: TextInputProps) {
  return (
    <input
      type="text"
      onChange={(e) => onChange(e.target.value)}
      className="border px-2 py-1 rounded w-full mt-2"
    />
  );
}
