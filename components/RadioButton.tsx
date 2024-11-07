type RadioButtonProps = {
    question: string;
    options: string[];
    onChange: (value: string) => void;
  };
  
  export default function RadioButton({ question, options, onChange }: RadioButtonProps) {
    return (
      <div className="mb-4">
        <label className="block mb-2 font-medium">{question}</label>
        {options.map((option, index) => (
          <div key={index}>
            <input
              type="radio"
              id={`${question}-${index}`}
              name={question}
              value={option}
              onChange={(e) => onChange(e.target.value)}
            />
            <label htmlFor={`${question}-${index}`} className="ml-2">
              {option}
            </label>
          </div>
        ))}
      </div>
    );
  }
  