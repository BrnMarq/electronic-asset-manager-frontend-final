import { useState, useEffect } from "react";
import { useAssets } from "@/contexts/AssetsContext";
import { useLocations } from "@/contexts/LocationsContext";
import { useTypes } from "@/contexts/TypesContext";
import { useUsers } from "@/contexts/UsersContext";
import { useAuth } from "@/contexts/AuthContext"; // Importar AuthContext
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Filter, X, Loader2 } from "lucide-react";
import AssetDialog from "@/components/AssetDialog";
import { Asset, AssetFilter, AssetStatus } from "@/types";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const defaultFilters: AssetFilter = {
	name: "",
	serial_number: 0,
	type_id: 0,
	description: "",
	responsible_id: 0,
	location_id: 0,
	status: "" as AssetStatus,
	cost: 0,
};

export default function Assets() {
	const { assetsInfo, fetchAssets } = useAssets();
	const { locations, fetchLocations } = useLocations();
	const { types, fetchTypes } = useTypes();
	const { users, fetchUsers } = useUsers();
	const { user } = useAuth(); // Obtener usuario para permisos

	const [dialogOpen, setDialogOpen] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
	const [currentPage, setCurrentPage] = useState(1);
	const [filters, setFilters] = useState<AssetFilter>(defaultFilters);
	const [isExporting, setIsExporting] = useState(false);

	// Lógica de permisos para el botón de crear
	const roleName =
		user?.role && typeof user.role === "object" ? user.role.name : user?.role;
	const canCreate = roleName === "admin" || roleName === "manager";

	const itemsPerPage = 9;
	const assets = assetsInfo.assets;
	const totalPages = Math.ceil(assetsInfo.total / itemsPerPage);

	const handleEdit = (asset: Asset) => {
		setSelectedAsset(asset);
		setDialogOpen(true);
	};

	const handleAdd = () => {
		setSelectedAsset(undefined);
		setDialogOpen(true);
	};

	useEffect(() => {
		if (showFilters) {
			fetchLocations();
			fetchTypes();
			fetchUsers();
		}
	}, [showFilters, fetchLocations, fetchTypes, fetchUsers]);

	useEffect(() => {
		fetchAssets(currentPage, itemsPerPage);
	}, [currentPage, fetchAssets]);

	useEffect(() => {
		const filtersCopy = { ...filters };
		Object.keys(filtersCopy).forEach((key) => {
			if (
				filtersCopy[key as keyof AssetFilter] === "" ||
				filtersCopy[key as keyof AssetFilter] === 0 ||
				filtersCopy[key as keyof AssetFilter] === "no_filter"
			) {
				delete filtersCopy[key as keyof AssetFilter];
			}
		});
		const delayDebounce = setTimeout(() => {
			fetchAssets(currentPage, itemsPerPage, filtersCopy);
		}, 500);
		return () => clearTimeout(delayDebounce);
	}, [currentPage, filters, fetchAssets]);

	const clearFilters = () => {
		setFilters(defaultFilters);
	};

	const hasActiveFilters = Object.values(filters).some(
		(v) => v !== "" && v !== 0 && v !== "no_filter"
	);

	const exportAssets = async () => {
		if (assetsInfo.total > 0) {
			const confirm = window.confirm(
				`Está a punto de exportar ${assetsInfo.total} activos. ¿Desea continuar?`
			);
			if (!confirm) return;
		}
		setIsExporting(true);
		try {
			const filtersCopy = { ...filters };
			Object.keys(filtersCopy).forEach((key) => {
				if (
					filtersCopy[key as keyof AssetFilter] === "" ||
					filtersCopy[key as keyof AssetFilter] === 0 ||
					filtersCopy[key as keyof AssetFilter] === "no_filter"
				) {
					delete filtersCopy[key as keyof AssetFilter];
				}
			});

			const response = await api.get("/assets/export", {
				params: filtersCopy,
				responseType: "blob",
			});

			const url = window.URL.createObjectURL(response.data);
			const link = document.createElement("a");
			link.href = url;

			const contentDisposition = response.headers["content-disposition"];
			let filename = `Inventario_Activos_${Date.now()}.xlsx`;
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
				if (filenameMatch && filenameMatch.length > 1) {
					filename = filenameMatch[1].replace(/"/g, "");
				}
			}

			link.setAttribute("download", filename);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error exporting assets:", error);
			toast({
				title: "Error de exportación",
				description: "No se pudo generar el archivo de activos.",
				variant: "destructive",
			});
		} finally {
			setIsExporting(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const variants: Record<
			string,
			{ variant: "default" | "secondary" | "destructive"; label: string }
		> = {
			active: { variant: "default", label: "Activo" },
			inactive: { variant: "secondary", label: "Inactivo" },
			decommissioned: { variant: "destructive", label: "Desincorporado" },
		};
		const config = variants[status] || variants.active;
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
				<div>
					<h1 className='text-3xl font-bold'>Gestión de Activos</h1>
					<p className='text-muted-foreground mt-1'>
						{assetsInfo.total} activos encontrados
					</p>
				</div>
				<div className='flex gap-2'>
					<Button
						onClick={exportAssets}
						variant='outline'
						disabled={isExporting}
					>
						{isExporting ? (
							<Loader2 className='h-4 w-4 mr-2 animate-spin' />
						) : (
							<Download className='h-4 w-4 mr-2' />
						)}
						{isExporting ? "Exportando..." : "Exportar"}
					</Button>

					{/* Renderizado condicional del botón de crear */}
					{canCreate && (
						<Button onClick={handleAdd}>
							<Plus className='h-4 w-4 mr-2' />
							Nuevo Activo
						</Button>
					)}
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle>Buscar y Filtrar Activos</CardTitle>
							<CardDescription>
								Usa búsqueda general o filtros específicos
							</CardDescription>
						</div>
						<div className='flex gap-2'>
							{hasActiveFilters && (
								<Button onClick={clearFilters} variant='outline' size='sm'>
									<X className='h-4 w-4 mr-2' />
									Limpiar
								</Button>
							)}
							<Button
								onClick={() => setShowFilters(!showFilters)}
								variant='outline'
								size='sm'
							>
								<Filter className='h-4 w-4 mr-2' />
								{showFilters ? "Ocultar" : "Mostrar"} Filtros
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{showFilters && (
						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t'>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Nombre</label>
								<Input
									placeholder='Filtrar por nombre'
									value={filters.name}
									onChange={(e) =>
										setFilters({ ...filters, name: e.target.value })
									}
								/>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium'>Número de Serie</label>
								<Input
									placeholder='Filtrar por serial'
									value={filters.serial_number}
									onChange={(e) =>
										setFilters({
											...filters,
											serial_number: parseInt(e.target.value),
										})
									}
								/>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium'>Tipo</label>
								<Select
									value={String(filters.type_id)}
									onValueChange={(value) =>
										setFilters({ ...filters, type_id: parseInt(value) })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder='Todos los tipos' />
									</SelectTrigger>
									<SelectContent className='bg-background z-50'>
										<SelectItem value='0'>Todos los tipos</SelectItem>
										{types.map((type) => (
											<SelectItem key={type.id} value={String(type.id)}>
												{type.name} ({type.category})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium'>Responsable</label>
								<Select
									value={String(filters.responsible_id)}
									onValueChange={(value) =>
										setFilters({ ...filters, responsible_id: parseInt(value) })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder='Todos los responsables' />
									</SelectTrigger>
									<SelectContent className='bg-background z-50'>
										<SelectItem value='0'>Todos los responsables</SelectItem>
										{users.map((user) => (
											<SelectItem key={user.id} value={String(user.id)}>
												{user.username}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium'>Ubicación</label>
								<Select
									value={String(filters.location_id)}
									onValueChange={(value) =>
										setFilters({ ...filters, location_id: parseInt(value) })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder='Todas las ubicaciones' />
									</SelectTrigger>
									<SelectContent className='bg-background z-50'>
										<SelectItem value='0'>Todas las ubicaciones</SelectItem>
										{locations.map((location) => (
											<SelectItem key={location.id} value={String(location.id)}>
												{location.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium'>Estado</label>
								<Select
									value={filters.status}
									onValueChange={(value) =>
										setFilters({ ...filters, status: value as AssetStatus })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder='Todos los estados' />
									</SelectTrigger>
									<SelectContent className='bg-background z-50'>
										<SelectItem value='no_filter'>Todos los estados</SelectItem>
										<SelectItem value='active'>Activo</SelectItem>
										<SelectItem value='inactive'>Inactivo</SelectItem>
										<SelectItem value='decommissioned'>
											Desincorporado
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium'>Costo</label>
								<Input
									type='number'
									placeholder='0'
									value={filters.cost}
									onChange={(e) =>
										setFilters({ ...filters, cost: parseInt(e.target.value) })
									}
								/>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium'>Descripción</label>
								<Input
									placeholder='Filtrar por descripción'
									value={filters.description}
									onChange={(e) =>
										setFilters({ ...filters, description: e.target.value })
									}
								/>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{assets.map((asset) => (
					<Card
						key={asset.id}
						className='hover:shadow-lg transition-shadow cursor-pointer'
						onClick={() => handleEdit(asset)}
					>
						<CardHeader>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<CardTitle className='text-lg'>{asset.name}</CardTitle>
									<CardDescription className='mt-1'>
										{asset.type.name}
									</CardDescription>
								</div>
								{getStatusBadge(asset.status)}
							</div>
						</CardHeader>
						<CardContent className='space-y-2'>
							<div className='text-sm'>
								<p className='text-muted-foreground'>
									Serial: {asset.serial_number || "N/A"}
								</p>
								<p className='text-muted-foreground'>
									Responsable: {asset.responsible.first_name}{" "}
									{asset.responsible.last_name}
								</p>
								<p className='text-muted-foreground'>
									Ubicación: {asset.location.name}
								</p>
								<p className='font-semibold mt-2 text-primary'>
									Costo: ${asset.cost.toLocaleString()}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{assetsInfo.total === 0 && (
				<Card>
					<CardContent className='py-12 text-center'>
						<p className='text-muted-foreground'>No se encontraron activos</p>
					</CardContent>
				</Card>
			)}

			{
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								className={
									currentPage === 1
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>

						{[...Array(totalPages)].map((_, i) => {
							const page = i + 1;
							if (
								page === 1 ||
								page === totalPages ||
								(page >= currentPage - 1 && page <= currentPage + 1)
							) {
								return (
									<PaginationItem key={page}>
										<PaginationLink
											onClick={() => setCurrentPage(page)}
											isActive={currentPage === page}
											className='cursor-pointer'
										>
											{page}
										</PaginationLink>
									</PaginationItem>
								);
							} else if (page === currentPage - 2 || page === currentPage + 2) {
								return (
									<PaginationItem key={page}>
										<PaginationEllipsis />
									</PaginationItem>
								);
							}
							return null;
						})}

						<PaginationItem>
							<PaginationNext
								onClick={() =>
									setCurrentPage((p) => Math.min(totalPages, p + 1))
								}
								className={
									currentPage === totalPages
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			}

			<AssetDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				asset={selectedAsset}
			/>
		</div>
	);
}
