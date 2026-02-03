import { Label, RadioGroup, clx } from "@medusajs/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: any
  handleChange: (...args: any[]) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-y-3">
      <h3 className="text-base font-semibold text-ui-fg-base">{title}</h3>
      <RadioGroup data-testid={dataTestId} onValueChange={handleChange}>
        <div className="space-y-1">
          {items?.map((i) => (
            <div
              key={i.value}
              className="flex items-center"
            >
              <RadioGroup.Item
                checked={i.value === value}
                className="hidden peer"
                id={i.value}
                value={i.value}
              />
              <Label
                htmlFor={i.value}
                className={clx(
                  "w-full px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                  {
                    "bg-gray-200 text-gray-900 font-medium": i.value === value,
                    "text-gray-700 hover:bg-gray-50": i.value !== value,
                  }
                )}
                data-testid="radio-label"
                data-active={i.value === value}
              >
                {i.label}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
