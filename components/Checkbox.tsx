type CheckboxProps = {
    question: string;
    options: string[];
    onChange: (value: string[]) => void;
  };
  
  export default function Checkbox({ question, options, onChange }: CheckboxProps) {
    const handleCheckboxChange = (option: string) => {
      onChange((prev: string[]) => {
        const updatedOptions = prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option];
        return updatedOptions;
      });
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
  