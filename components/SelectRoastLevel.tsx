import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoastLevel } from "~/lib/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
export function SelectRoastLevel({
  placeholder,
  options,
  portalHost,
  onChange,
}: {
  onChange: (...event: any[]) => void;
  portalHost?: string;
  placeholder?: string;
  options: RoastLevel[];
}) {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  return (
    <Select onValueChange={(val) => onChange(val?.value)}>
      <SelectTrigger className="w-[250px]">
        <SelectValue
          className="text-foreground text-sm native:text-lg"
          placeholder={placeholder ?? ""}
        />
      </SelectTrigger>
      <SelectContent
        portalHost={portalHost}
        insets={contentInsets}
        className="w-[250px]"
      >
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              label={option.label}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
