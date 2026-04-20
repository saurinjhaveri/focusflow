import { cn } from "@/lib/utils";

interface PersonAvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function PersonAvatar({ name, color, size = "md", className }: PersonAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0",
        "text-white select-none",
        SIZES[size],
        className
      )}
      style={{ backgroundColor: color }}
      aria-label={name}
      title={name}
    >
      {initials}
    </span>
  );
}
