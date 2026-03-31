import { useId } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	ReportDatePreset,
	ReportDateRangeKey,
} from "@/lib/reports/date-range";

interface ReportDateRangeControlsProps {
	preset: ReportDatePreset;
	dateFrom: string;
	dateTo: string;
	onPresetChange: (preset: ReportDatePreset) => void;
	onDateChange: (key: ReportDateRangeKey, value: string) => void;
}

const presetOptions = [
	{
		label: "Current",
		items: [
			{ value: "today", label: "Today" },
			{ value: "weekToDate", label: "Week to Date" },
			{ value: "monthToDate", label: "Month to Date" },
			{ value: "yearToDate", label: "Year to Date" },
		],
	},
	{
		label: "Previous",
		items: [
			{ value: "yesterday", label: "Yesterday" },
			{ value: "lastWeek", label: "Last Week" },
			{ value: "lastMonth", label: "Last Month" },
			{ value: "lastYear", label: "Last Year" },
		],
	},
	{
		label: "Rolling",
		items: [
			{ value: "last7Days", label: "Last 7 Days" },
			{ value: "last30Days", label: "Last 30 Days" },
			{ value: "last365Days", label: "Last 365 Days" },
		],
	},
	{
		label: "Custom",
		items: [{ value: "manual", label: "Manual" }],
	},
] as const satisfies {
	label: string;
	items: { value: ReportDatePreset; label: string }[];
}[];

export function ReportDateRangeControls({
	preset,
	dateFrom,
	dateTo,
	onPresetChange,
	onDateChange,
}: ReportDateRangeControlsProps) {
	const inputId = useId();
	const dateFromId = `${inputId}-date-from`;
	const dateToId = `${inputId}-date-to`;

	return (
		<div className="flex flex-wrap items-end gap-4">
			<div className="flex min-w-[14rem] flex-col gap-1">
				<label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
					Range
				</label>
				<Select
					value={preset}
					onValueChange={(value) => onPresetChange(value as ReportDatePreset)}
				>
					<SelectTrigger
						aria-label="Date range preset"
						className="w-full min-w-[14rem]"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{presetOptions.map((group, index) => (
							<div key={group.label}>
								<SelectGroup>
									<SelectLabel>{group.label}</SelectLabel>
									{group.items.map((item) => (
										<SelectItem key={item.value} value={item.value}>
											{item.label}
										</SelectItem>
									))}
								</SelectGroup>
								{index < presetOptions.length - 1 ? <SelectSeparator /> : null}
							</div>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-1">
				<label
					htmlFor={dateFromId}
					className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
				>
					From
				</label>
				<input
					id={dateFromId}
					type="date"
					value={dateFrom}
					onChange={(event) => onDateChange("dateFrom", event.target.value)}
					className="h-9 rounded-sm border-2 border-black bg-white px-3 py-1 text-sm shadow-brutal-sm focus-visible:outline-none focus-visible:shadow-brutal"
				/>
			</div>

			<div className="flex flex-col gap-1">
				<label
					htmlFor={dateToId}
					className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
				>
					To
				</label>
				<input
					id={dateToId}
					type="date"
					value={dateTo}
					onChange={(event) => onDateChange("dateTo", event.target.value)}
					className="h-9 rounded-sm border-2 border-black bg-white px-3 py-1 text-sm shadow-brutal-sm focus-visible:outline-none focus-visible:shadow-brutal"
				/>
			</div>
		</div>
	);
}
