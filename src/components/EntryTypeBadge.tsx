import type { EntryType } from "@/lib/entry-type"

const TYPE_STYLES: Record<EntryType, string> = {
	expense: "bg-red-100 text-red-700 border-red-700",
	income: "bg-emerald-100 text-emerald-700 border-emerald-700",
	movement: "bg-blue-100 text-blue-700 border-blue-700",
}

export function EntryTypeBadge({ type }: { type: EntryType }) {
	return (
		<span
			className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wide border-2 rounded-sm ${TYPE_STYLES[type]}`}
		>
			{type}
		</span>
	)
}
