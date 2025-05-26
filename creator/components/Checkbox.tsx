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
        <div key={index} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`checkbox-${index}`}
            value={option}
            checked={selectedOptions.includes(option)}
            onChange={() => handleCheckboxChange(option)}
            className="h-5 w-4"
          />
          <label htmlFor={`checkbox-${index}`}>
            {option}
          </label>
        </div>
      ))}
    </div>
  );
}
