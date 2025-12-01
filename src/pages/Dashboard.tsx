import { useEffect, useLayoutEffect } from "react";
import { useAssets } from "@/contexts/AssetsContext";
import { useAuth } from "@/contexts/AuthContext";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Package, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
	const { assetsStats, fetchStats } = useAssets();
	const { user } = useAuth();

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	const getActionBadge = (action: string) => {
		const variants: Record<
			string,
			{
				variant: "default" | "secondary" | "destructive" | "outline";
				label: string;
			}
		> = {
			created: { variant: "default", label: "Creado" },
			updated: { variant: "secondary", label: "Actualizado" },
			relocated: { variant: "outline", label: "Reubicado" },
			cost_updated: { variant: "secondary", label: "Costo Actualizado" },
			status_changed: { variant: "outline", label: "Estado Cambiado" },
			decommissioned: { variant: "destructive", label: "Desincorporado" },
		};
		const config = variants[action] || variants.updated;
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold text-foreground'>Dashboard</h1>
				<p className='text-muted-foreground mt-1'>
					Bienvenido, {user?.username} ({user?.role.name})
				</p>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card className='shadow-md hover:shadow-lg transition-shadow'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total de Activos
						</CardTitle>
						<Package className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{assetsStats.active + assetsStats.inactive}
						</div>
						<p className='text-xs text-muted-foreground'>
							Registrados en sistema
						</p>
					</CardContent>
				</Card>

				<Card className='shadow-md hover:shadow-lg transition-shadow'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Activos Activos
						</CardTitle>
						<CheckCircle className='h-4 w-4 text-success' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-success'>
							{assetsStats.active}
						</div>
						<p className='text-xs text-muted-foreground'>En operación</p>
					</CardContent>
				</Card>

				<Card className='shadow-md hover:shadow-lg transition-shadow'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Activos Inactivos
						</CardTitle>
						<AlertCircle className='h-4 w-4 text-warning' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-warning'>
							{assetsStats.inactive}
						</div>
						<p className='text-xs text-muted-foreground'>Fuera de servicio</p>
					</CardContent>
				</Card>

				<Card className='shadow-md hover:shadow-lg transition-shadow'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Valor Total</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>${assetsStats.cost}</div>
						<p className='text-xs text-muted-foreground'>
							Inversión en activos
						</p>
					</CardContent>
				</Card>
			</div>

			{/* <Card className='shadow-md'>
				<CardHeader>
					<CardTitle>Actividad Reciente</CardTitle>
					<CardDescription>
						Últimas modificaciones en el inventario
					</CardDescription>
				</CardHeader>
				<CardContent>
					{recentChanges.length === 0 ? (
						<p className='text-sm text-muted-foreground'>
							No hay actividad reciente
						</p>
					) : (
						<div className='space-y-4'>
							{recentChanges.map((entry) => {
								const asset = assets.find((a) => a.id === entry.assetId);
								return (
									<div
										key={entry.id}
										className='flex items-start gap-4 pb-4 border-b last:border-0'
									>
										<div className='flex-1'>
											<div className='flex items-center gap-2 mb-1'>
												{getActionBadge(entry.action)}
												<span className='font-medium text-sm'>
													{asset?.name || "Activo eliminado"}
												</span>
											</div>
											<p className='text-xs text-muted-foreground'>
												Por {entry.username} •{" "}
												{new Date(entry.timestamp).toLocaleString()}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card> */}
		</div>
	);
}
