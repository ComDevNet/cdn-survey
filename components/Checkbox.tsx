type CheckboxProps = {
  options: string[];
  selectedOptions: string[];
  onChange: (value: string[]) => void;
};

export default function Checkbox({ options, selectedOptions, onChange }: CheckboxProps) {
  const handleCheckboxChange = (option: string) => {
    const updatedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onChange(updatedOptions);
  };

  return (
    <div>
      {options.map((option, index) => (
        <div key={index}>
          <input
            type="checkbox"
            id={`checkbox-${index}`}
            value={option}
            checked={selectedOptions.includes(option)}
            onChange={() => handleCheckboxChange(option)}
          />
          <label htmlFor={`checkbox-${index}`} className="ml-2">
            {option}
          </label>
        </div>
      ))}
    </div>
  );
}
