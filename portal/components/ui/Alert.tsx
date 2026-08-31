import { cn } from "@/lib/utils";

type Tone = "error" | "success" | "info";

const tones: Record<Tone, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800",
};

const roleFor: Record<Tone, "alert" | "status"> = {
  error: "alert",
  success: "status",
  info: "status",
};

export function Alert({
  tone = "info",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return (
    <div
      role={roleFor[tone]}
      className={cn("rounded-md border px-4 py-3 text-sm", tones[tone], className)}
      {...props}
    >
      {children}
    </div>
  );
}
