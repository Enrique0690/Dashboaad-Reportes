import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function RoleFilter({
  roles,
  selectedRoles,
  onChange
}: {
  roles: string[];
  selectedRoles: string[];
  onChange: (newSelected: string[]) => void;
}) {
  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      onChange(selectedRoles.filter((r) => r !== role));
    } else {
      onChange([...selectedRoles, role]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-between">
          Filtrar por rol
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px]">
        <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto">
          {roles.map((rol) => (
            <label
              key={rol}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedRoles.includes(rol)}
                onCheckedChange={() => toggleRole(rol)}
              />
              <span className="text-sm">{rol}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}