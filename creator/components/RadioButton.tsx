"use client"

type RadioButtonProps = {
  options: string[]
  selectedOption: string | null
  onChange: (value: string) => void
  name?: string // Add name prop for proper grouping
}

export default function RadioButton({ options, selectedOption, onChange, name = "radio-group" }: RadioButtonProps) {
  return (
    <div>
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="radio"
            id={`${name}-${index}`}
            name={name} // Use the name prop for proper grouping
            value={option}
            checked={selectedOption === option}
            onChange={() => onChange(option)}
            className="h-4 w-4"
          />
          <label htmlFor={`${name}-${index}`} className="ml-2">
            {option}
          </label>
        </div>
      ))}
    </div>
  )
}
