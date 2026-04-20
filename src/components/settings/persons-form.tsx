"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { PersonAvatar } from "@/components/persons/person-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPerson, deletePerson } from "@/lib/actions/persons";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

const PRESET_COLORS = [
  "#0D9488", "#7C3AED", "#EA580C", "#2563EB",
  "#DB2777", "#059669", "#D97706", "#0891B2",
];

interface PersonsFormProps {
  initialPersons: Person[];
}

export function PersonsForm({ initialPersons }: PersonsFormProps) {
  const [persons, setPersons] = useState<Person[]>(initialPersons);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const person = await createPerson({ name: name.trim(), color });
      setPersons((prev) => [...prev, person]);
      setName("");
    });
  }

  function handleDelete(id: string) {
    setDeleteId(id);
    startTransition(async () => {
      await deletePerson(id);
      setPersons((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Person list */}
      {persons.length > 0 && (
        <ul className="space-y-2" role="list">
          {persons.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <PersonAvatar name={person.name} color={person.color} size="sm" />
                <span className="text-sm font-medium text-foreground">{person.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(person.id)}
                disabled={deleteId === person.id}
                aria-label={`Delete ${person.name}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Add person form */}
      <form onSubmit={handleAdd} className="space-y-3">
        <Input
          label="Add person"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
        />

        {/* Color picker */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Color</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Choose color">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={`Select color ${c}`}
                onClick={() => setColor(c)}
                className={cn(
                  "h-7 w-7 rounded-full transition-transform duration-150 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  "flex items-center justify-center",
                  color === c ? "scale-110" : "hover:scale-105"
                )}
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden />
                )}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          loading={isPending}
          disabled={!name.trim()}
          className="w-full"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add person
        </Button>
      </form>
    </div>
  );
}
