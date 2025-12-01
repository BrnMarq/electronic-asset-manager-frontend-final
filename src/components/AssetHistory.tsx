import { useEffect, useState } from "react";
import { useAssets } from "@/contexts/AssetsContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Loader2, User as UserIcon, ArrowRight } from "lucide-react";
import { ChangelogEntry, Asset } from "@/types"; 

interface AssetHistoryProps {
	assetId: string;
	currentAsset?: Asset;
}

export default function AssetHistory({
	assetId,
	currentAsset,
}: AssetHistoryProps) {
	const { fetchAssetHistory } = useAssets();
	const [history, setHistory] = useState<ChangelogEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadHistory = async () => {
			if (!assetId) return;
			setLoading(true);
			const data = await fetchAssetHistory(parseInt(assetId));
			setHistory(data);
			setLoading(false);
		};
		loadHistory();
	}, [assetId, fetchAssetHistory]);

	const getActionLabel = (action: string) => {
		const labels: Record<string, string> = {
			create: "Creado",
			update: "Actualizado",
			delete: "Eliminado",
		};
		const variants: Record<
			string,
			"default" | "secondary" | "destructive" | "outline"
		> = {
			create: "default",
			update: "secondary",
			delete: "destructive",
		};
		return (
			<Badge variant={variants[action] || "outline"}>
				{labels[action] || action}
			</Badge>
		);
	};

	const fieldLabels: Record<string, string> = {
		name: "Nombre",
		serial_number: "N° Serial",
		type_id: "ID Tipo",
		description: "Descripción",
		responsible_id: "ID Responsable",
		location_id: "ID Ubicación",
		cost: "Costo",
		status: "Estado",
		acquisition_date: "Fecha Adquisición",
	};

	const getComputedChanges = (entry: ChangelogEntry, index: number) => {
		if (entry.changes && entry.changes.length > 0) {
			return entry.changes;
		}

		if (entry.change_type === "create") return [];
		const computedDiffs = [];

		const fieldsToCheck: Array<keyof typeof fieldLabels> = [
			"name",
			"serial_number",
			"description",
			"cost",
			"status",
			"location_id",
			"responsible_id",
		];

		const newerEntry = index > 0 ? history[index - 1] : null;

		for (const field of fieldsToCheck) {
			const oldKey = `old_${field}` as keyof ChangelogEntry;
			const oldValue = entry[oldKey];
			let newValue: any = null;

			if (index === 0 && currentAsset) {
				if (field === "location_id") newValue = currentAsset.location_id;
				else if (field === "responsible_id")
					newValue = currentAsset.responsible_id;
				else if (field === "type_id") newValue = currentAsset.type_id;
				else newValue = currentAsset[field as keyof Asset];
			} else if (newerEntry) {
				newValue = newerEntry[oldKey];
			}
			if (
				oldValue !== undefined &&
				newValue !== undefined &&
				String(oldValue) !== String(newValue)
			) {
				computedDiffs.push({
					field: field,
					oldValue: oldValue,
					newValue: newValue,
				});
			}
		}

		return computedDiffs;
	};

	if (loading) {
		return (
			<div className='flex justify-center py-8'>
				<Loader2 className='h-6 w-6 animate-spin text-primary' />
			</div>
		);
	}

	if (history.length === 0) {
		return (
			<Card>
				<CardContent className='py-8 text-center'>
					<p className='text-muted-foreground'>
						No hay historial disponible para este activo.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-y-4 max-h-[60vh] overflow-y-auto pr-2'>
			{history.map((entry, index) => {
				const changesToShow = getComputedChanges(entry, index);
				return (
					<Card key={entry.id} className='relative overflow-hidden'>
						<CardContent className='pt-6'>
							<div className='flex items-start gap-4'>
								<div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1'>
									<Clock className='h-5 w-5 text-muted-foreground' />
								</div>

								<div className='flex-1'>
									<div className='flex flex-wrap items-center justify-between gap-2 mb-1'>
										<div className='flex items-center gap-2'>
											{getActionLabel(entry.change_type)}
											{entry.change_reason &&
												entry.change_reason !== "No reason provided" && (
													<span className='text-xs text-muted-foreground italic'>
														({entry.change_reason})
													</span>
												)}
										</div>
										<span className='text-xs text-muted-foreground'>
											{new Date(entry.createdAt).toLocaleString("es-ES")}
										</span>
									</div>

									<div className='flex items-center gap-2 mb-4 text-sm font-medium text-foreground/80'>
										<UserIcon className='h-3 w-3' />
										<span>
											{entry.user
												? `${entry.user.first_name} ${entry.user.last_name}`
												: `Usuario #${entry.user_id}`}
										</span>
									</div>

									{changesToShow.length > 0 ? (
										<div className='bg-muted/30 rounded-md border text-sm'>
											{changesToShow.map((change, idx) => (
												<div
													key={idx}
													className='grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-2 border-b last:border-0'
												>
													<span className='font-semibold text-muted-foreground'>
														{fieldLabels[change.field] || change.field}
													</span>

													<ArrowRight className='h-3 w-3 text-muted-foreground/50' />

													<div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
														<span className='line-through text-destructive/70 text-xs'>
															{String(change.oldValue)}
														</span>
														<span className='text-success font-medium'>
															{String(change.newValue)}
														</span>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className='text-sm text-muted-foreground italic pl-1'>
											{entry.change_type === "create"
												? "Activo creado inicialmente."
												: "Registro histórico sin cambios detectables."}
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}