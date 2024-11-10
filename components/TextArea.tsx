type TextAreaProps = {
  onChange: (value: string) => void;
};

export default function TextArea({ onChange }: TextAreaProps) {
  return (
    <textarea
      onChange={(e) => onChange(e.target.value)}
      className="border-2 px-3 py-3 rounded-xl w-full mt-1 border-gray-600"
      rows={4}
    />
  );
}
