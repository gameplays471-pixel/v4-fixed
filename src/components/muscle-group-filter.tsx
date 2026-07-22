"use client";

import { Button } from "@/components/ui/button";

interface MuscleGroupFilterProps {
  groups: readonly string[];
  selectedGroups: string[];
  onChange: (groups: string[]) => void;
}

export function MuscleGroupFilter({ groups, selectedGroups, onChange }: MuscleGroupFilterProps) {
  const toggleGroup = (group: string) => {
    onChange(
      selectedGroups.includes(group)
        ? selectedGroups.filter((selectedGroup) => selectedGroup !== group)
        : [...selectedGroups, group],
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-muted-foreground">Grupos musculares</label>
        {selectedGroups.length > 0 && (
          <Button variant="ghost" size="sm" type="button" className="h-7 px-2 text-xs" onClick={() => onChange([])}>
            Limpar
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => {
          const selected = selectedGroups.includes(group);
          return (
            <Button
              key={group}
              variant={selected ? "default" : "outline"}
              size="sm"
              type="button"
              onClick={() => toggleGroup(group)}
              className="h-8 rounded-full px-3 text-xs"
              aria-pressed={selected}
            >
              {group}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
