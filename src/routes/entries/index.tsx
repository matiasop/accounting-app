import { useState, useEffect } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef, FilterFn } from "@tanstack/react-table"

import { EntryTypeBadge } from "@/components/EntryTypeBadge"
import { Button } from "@/components/ui/button"
import type { EntryType } from "@/lib/entry-type"
import { entriesWithAccountsQueryOptions } from "@/queries/entries"
import { deleteEntry } from "@/functions/entries"

type EntryWithAccounts = Awaited<
	ReturnType<typeof entriesWithAccountsQueryOptions>["queryFn"]
>[number]

export const Route = createFileRoute("/entries/")({
	component: EntriesList,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(entriesWithAccountsQueryOptions()),
})

const globalFilterFn: FilterFn<EntryWithAccounts> = (
	row,
	_columnId,
	filterValue,
) => {
	const search = String(filterValue).toLowerCase()
	const description = row.original.description.toLowerCase()
	const amount = String(row.original.amount)
	return description.includes(search) || amount.includes(search)
}

function EntriesList() {
	const queryClient = useQueryClient()
	const { data: entries = [] } = useQuery(entriesWithAccountsQueryOptions())
	const [globalFilter, setGlobalFilter] = useState("")
	const [deleteTarget, setDeleteTarget] = useState<EntryWithAccounts | null>(
		null,
	)

	const deleteMutation = useMutation({
		mutationFn: (data: { id: number }) => deleteEntry({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["entries"] })
			queryClient.invalidateQueries({ queryKey: ["accounts"] })
			setDeleteTarget(null)
		},
	})

	const columns: ColumnDef<EntryWithAccounts, unknown>[] = [
		{
			accessorKey: "date",
			header: "Date (UTC)",
			cell: ({ getValue }) => {
				const raw = getValue() as string
				return `${raw.split("T")[0]} ${raw.slice(11, 16)}`
			},
		},
		{ accessorKey: "description", header: "Description" },
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ getValue }) => (
				<EntryTypeBadge type={getValue() as EntryType} />
			),
		},
		{ accessorKey: "creditAccountName", header: "Credit Account" },
		{ accessorKey: "debitAccountName", header: "Debit Account" },
		{
			accessorKey: "amount",
			header: "Amount",
			cell: ({ getValue }) => (getValue() as number).toLocaleString(),
		},
		{ accessorKey: "category", header: "Category" },
		{
			accessorKey: "subcategory",
			header: "Subcategory",
			cell: ({ getValue }) => (getValue() as string) || "-",
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link
							to="/entries/create"
							search={{ editId: row.original.id }}
						>
							Edit
						</Link>
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setDeleteTarget(row.original)}
					>
						Delete
					</Button>
				</div>
			),
		},
	]

	const table = useReactTable({
		data: entries,
		columns,
		state: { globalFilter },
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: { pageSize: 50 },
		},
	})

	return (
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-extrabold tracking-tight text-foreground uppercase">
							Entries
						</h1>
						<p className="mt-1 text-sm text-muted-foreground font-medium">
							{table.getPrePaginationRowModel().rows.length} entries
							total
						</p>
					</div>
					<Button asChild>
						<Link to="/entries/create">New Entry</Link>
					</Button>
				</div>

				{/* Search */}
				<div className="mb-4">
					<DebouncedInput
						value={globalFilter}
						onChange={(value) => setGlobalFilter(String(value))}
						placeholder="Search by description or amount..."
						className="h-9 w-full max-w-sm rounded-sm border-2 border-black bg-white px-3 py-1 text-sm shadow-brutal-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-brutal"
					/>
				</div>

				{/* Table */}
				<div className="rounded-sm border-2 border-black bg-white shadow-brutal overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="border-b-2 border-black bg-primary/20">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className="px-4 py-3 text-left font-bold text-foreground uppercase text-xs tracking-wide cursor-pointer select-none hover:bg-primary/30"
											onClick={header.column.getToggleSortingHandler()}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
											{{
												asc: " \u2191",
												desc: " \u2193",
											}[header.column.getIsSorted() as string] ?? null}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody className="divide-y divide-black/20">
							{table.getRowModel().rows.length === 0 ? (
								<tr>
									<td
										colSpan={columns.length}
										className="px-4 py-8 text-center text-muted-foreground"
									>
										No entries found.
									</td>
								</tr>
							) : (
								table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="hover:bg-primary/10 transition-colors"
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												className="px-4 py-3 text-foreground"
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										))}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="mt-4 flex items-center justify-between text-sm text-foreground font-medium">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							{"<<"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							{"<"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							{">"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							{">>"}
						</Button>
					</div>
					<span>
						Page{" "}
						<strong>
							{table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</strong>
					</span>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{deleteTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
					<div className="rounded-sm border-[3px] border-black bg-white p-6 shadow-brutal-lg max-w-md w-full mx-4">
						<h3 className="text-lg font-extrabold text-foreground uppercase">
							Delete Entry
						</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							Are you sure you want to delete &quot;{deleteTarget.description}
							&quot;? This action cannot be undone.
						</p>
						{deleteMutation.isError && (
							<p className="mt-2 text-sm text-red-500">
								{deleteMutation.error.message}
							</p>
						)}
						<div className="mt-4 flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => setDeleteTarget(null)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								disabled={deleteMutation.isPending}
								onClick={() =>
									deleteMutation.mutate({ id: deleteTarget.id })
								}
							>
								{deleteMutation.isPending ? "Deleting..." : "Delete"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

function DebouncedInput({
	value: initialValue,
	onChange,
	debounce = 300,
	...props
}: {
	value: string
	onChange: (value: string) => void
	debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
	const [value, setValue] = useState(initialValue)

	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value)
		}, debounce)
		return () => clearTimeout(timeout)
	}, [value, debounce, onChange])

	return (
		<input
			{...props}
			value={value}
			onChange={(e) => setValue(e.target.value)}
		/>
	)
}
