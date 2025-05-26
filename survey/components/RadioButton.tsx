type RadioButtonProps = {
  name: string; 
  options: string[];
  selectedOption: string | null;
  onChange: (value: string) => void;
};

export default function RadioButton({
  name,
  options,
  selectedOption,
  onChange,
}: RadioButtonProps) {
  return (
    <div>
      {options.map((option, index) => (
        <div key={index}>
          <label key={index} htmlFor={`${name}-radio-${index}`} className="flex items-center cursor-pointer mb-2">
          <input
            type="radio"
            id={`${name}-radio-${index}`}
            name={name}
            value={option}
            checked={selectedOption === option}
            onChange={() => onChange(option)}
            className="form-radio mr-2"
          />
            {option}
          </label>
        </div>
      ))}
    </div>
  );
}
