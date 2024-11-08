type TextAreaProps = {
  onChange: (value: string) => void;
};

export default function TextArea({ onChange }: TextAreaProps) {
  return (
    <textarea
      onChange={(e) => onChange(e.target.value)}
      className="border px-2 py-1 rounded w-full mt-2"
      rows={4}
    />
  );
}
