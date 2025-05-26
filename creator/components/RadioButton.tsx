type RadioButtonProps = {
  options: string[];
  selectedOption: string | null;
  onChange: (value: string) => void;
};

export default function RadioButton({ options, selectedOption, onChange }: RadioButtonProps) {
  return (
    <div>
      {options.map((option, index) => (
        <div key={index}>
          <input
            type="radio"
            id={`radio-${index}`}
            name="radio-group"
            value={option}
            checked={selectedOption === option}
            onChange={() => onChange(option)}
          />
          <label htmlFor={`radio-${index}`} className="ml-2">
            {option}
          </label>
        </div>
      ))}
    </div>
  );
}
