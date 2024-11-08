type CheckboxProps = {
  question: string;
  options: string[];
  selectedOptions: string[]; // Track selected options
  onChange: (value: string[]) => void;
};

export default function Checkbox({ question, options, selectedOptions, onChange }: CheckboxProps) {
  const handleCheckboxChange = (option: string) => {
    const updatedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    
    onChange(updatedOptions); // Pass the updated array directly
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium">{question}</label>
      {options.map((option, index) => (
        <div key={index}>
          <input
            type="checkbox"
            id={`${question}-${index}`}
            value={option}
            checked={selectedOptions.includes(option)} // Set checked based on selected options
            onChange={() => handleCheckboxChange(option)}
          />
          <label htmlFor={`${question}-${index}`} className="ml-2">
            {option}
          </label>
        </div>
      ))}
    </div>
  );
}
