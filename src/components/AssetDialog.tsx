import { useLayoutEffect, useEffect, useState } from "react";
import { useAssets } from "@/contexts/AssetsContext";
import { useLocations } from "@/contexts/LocationsContext";
import { useTypes } from "@/contexts/TypesContext";
import { useUsers } from "@/contexts/UsersContext";
import { useAuth } from "@/contexts/AuthContext";
import { Asset, AssetForm, AssetStatus } from "@/types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Eye, Edit, History } from "lucide-react";
import AssetHistory from "./AssetHistory";

interface AssetDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	asset?: Asset;
}

export default function AssetDialog({
	open,
	onOpenChange,
	asset,
}: AssetDialogProps) {
	const { user } = useAuth();
	const { addAsset, updateAsset, deleteAsset } = useAssets();
	const { locations, fetchLocations } = useLocations();
	const { types, fetchTypes } = useTypes();
	const { users, fetchUsers } = useUsers();

	// Estado para las pestañas
	const [activeTab, setActiveTab] = useState("details");
	const roleName =
		user?.role && typeof user.role === "object" ? user.role.name : user?.role;

	// Permisos
	const canEdit = roleName === "admin" || roleName === "manager";
	const canChangeLocation = roleName === "manager" || roleName === "admin";
	const canChangeStatus = roleName === "admin";
	const canViewHistory = roleName === "admin";

	const [formData, setFormData] = useState<
		Omit<AssetForm, "id" | "created_at" | "created_by" | "acquisition_date">
	>({
		name: "",
		type_id: 0,
		description: "",
		serial_number: 0,
		responsible_id: 0,
		location_id: 0,
		cost: 0,
		status: "active" as AssetStatus,
	});

	useLayoutEffect(() => {
		if (open) {
			fetchLocations();
			fetchTypes();
			fetchUsers();

			// Lógica de pestaña por defecto:
			// Si es un activo existente, mostrar Información.
			// Si es nuevo (y el usuario puede crear), mostrar Formulario.
			if (asset) {
				setActiveTab("details");
			} else {
				setActiveTab("edit");
			}
		}
	}, [open, asset, fetchLocations, fetchTypes, fetchUsers]);

	useEffect(() => {
		if (asset) {
			setFormData({
				name: asset.name,
				type_id: asset.type.id,
				description: asset.description || "",
				serial_number: asset.serial_number || 0,
				responsible_id: asset.responsible.id,
				location_id: asset.location.id,
				cost: asset.cost,
				status: asset.status,
			});
		} else {
			setFormData({
				name: "",
				type_id: 0,
				description: "",
				serial_number: 0,
				responsible_id: 0,
				location_id: 0,
				cost: 0,
				status: "active" as AssetStatus,
			});
		}
	}, [asset, open]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (asset) {
			updateAsset(asset.id, formData);
			onOpenChange(false);
			return;
		}

		addAsset(formData);

		onOpenChange(false);
	};

	const handleDelete = () => {
		if (asset && confirm("¿Estás seguro de eliminar este activo?")) {
			deleteAsset(asset.id);
			onOpenChange(false);
		}
	};

	const ReadOnlyField = ({
		label,
		value,
	}: {
		label: string;
		value: string | number;
	}) => (
		<div className='space-y-1'>
			<Label className='text-xs text-muted-foreground'>{label}</Label>
			<div className='p-2 bg-muted/50 rounded-md text-sm font-medium border border-transparent min-h-[36px] flex items-center'>
				{value || "-"}
			</div>
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{asset ? asset.name : "Nuevo Activo"}</DialogTitle>
					<DialogDescription>
						{asset
							? `Serial: ${asset.serial_number} • ${asset.type.name}`
							: "Completa el formulario para agregar un nuevo activo"}
					</DialogDescription>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
					<TabsList className='grid w-full grid-cols-3'>
						{/* 1. INFORMACIÓN */}
						<TabsTrigger value='details' disabled={!asset}>
							<Eye className='w-4 h-4 mr-2' /> Información
						</TabsTrigger>

						{/* 2. EDITAR: Solo si el rol lo permite (Admin/Manager) */}
						{canEdit && (
							<TabsTrigger value='edit'>
								<Edit className='w-4 h-4 mr-2' />{" "}
								{asset ? "Editar" : "Formulario"}
							</TabsTrigger>
						)}

						{asset && canViewHistory && (
							<TabsTrigger value='history'>
								<History className='w-4 h-4 mr-2' /> Historial
							</TabsTrigger>
						)}
					</TabsList>

					{asset && (
						<TabsContent value='details' className='space-y-6 pt-4'>
							<div className='grid grid-cols-2 gap-4'>
								<ReadOnlyField label='Nombre' value={asset.name} />
								<ReadOnlyField label='Tipo' value={asset.type.name} />
								<ReadOnlyField label='Categoría' value={asset.type.category} />
								<ReadOnlyField label='Serial' value={asset.serial_number} />
							</div>

							<ReadOnlyField
								label='Descripción'
								value={asset.description || "Sin descripción"}
							/>

							<div className='border-t pt-4 mt-4'>
								<h4 className='text-sm font-semibold mb-3 text-primary'>
									Ubicación y Responsable
								</h4>
								<div className='grid grid-cols-2 gap-4'>
									<ReadOnlyField
										label='Ubicación Actual'
										value={asset.location.name}
									/>
									<ReadOnlyField
										label='Responsable'
										value={`${asset.responsible.first_name} ${asset.responsible.last_name}`}
									/>
								</div>
							</div>

							<div className='border-t pt-4 mt-4'>
								<h4 className='text-sm font-semibold mb-3 text-primary'>
									Estado y Valor
								</h4>
								<div className='grid grid-cols-2 gap-4'>
									<ReadOnlyField
										label='Costo'
										value={`$${asset.cost.toLocaleString()}`}
									/>
									<div className='space-y-1'>
										<Label className='text-xs text-muted-foreground'>
											Estado
										</Label>
										<div className='mt-1'>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${
																									asset.status === "active"
																										? "bg-green-100 text-green-800"
																										: asset.status ===
																										  "inactive"
																										? "bg-yellow-100 text-yellow-800"
																										: "bg-red-100 text-red-800"
																								}`}
											>
												{asset.status === "decommissioned"
													? "Desincorporado"
													: asset.status}
											</span>
										</div>
									</div>
									<ReadOnlyField
										label='Fecha de Adquisición'
										value={new Date(
											asset.acquisition_date
										).toLocaleDateString()}
									/>
								</div>
							</div>
						</TabsContent>
					)}

					<TabsContent value='edit'>
						<form onSubmit={handleSubmit} className='space-y-4 pt-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Nombre *</Label>
									<Input
										id='name'
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='type'>Tipo *</Label>
									<Select
										value={String(formData.type_id)}
										onValueChange={(value) =>
											setFormData({ ...formData, type_id: parseInt(value, 10) })
										}
										required
									>
										<SelectTrigger>
											<SelectValue placeholder='Seleccionar tipo' />
										</SelectTrigger>
										<SelectContent>
											{types.map((type) => (
												<SelectItem key={type.id} value={String(type.id)}>
													{type.name} ({type.category})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='serial_number'>Número de Serie</Label>
									<Input
										id='serial_number'
										value={formData.serial_number}
										onChange={(e) => {
											const value = parseInt(e.target.value, 10);
											if (!isNaN(value)) {
												setFormData({ ...formData, serial_number: value });
											}
										}}
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='description'>Descripción</Label>
								<Textarea
									id='description'
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									rows={3}
								/>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='responsible'>Responsable *</Label>
									<Select
										value={String(formData.responsible_id)}
										onValueChange={(value) =>
											setFormData({
												...formData,
												responsible_id: parseInt(value, 10),
											})
										}
										required
									>
										<SelectTrigger>
											<SelectValue placeholder='Seleccionar responsable' />
										</SelectTrigger>
										<SelectContent>
											{users.map((user) => (
												<SelectItem key={user.id} value={String(user.id)}>
													{user.username} ({user.first_name} {user.last_name})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='location'>Ubicación *</Label>
									<Select
										value={String(formData.location_id)}
										disabled={asset && !canChangeLocation}
										onValueChange={(value) =>
											setFormData({
												...formData,
												location_id: parseInt(value, 10),
											})
										}
										required
									>
										<SelectTrigger>
											<SelectValue placeholder='Seleccionar ubicación' />
										</SelectTrigger>
										<SelectContent>
											{locations.map((location) => (
												<SelectItem
													key={location.id}
													value={String(location.id)}
												>
													{location.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{asset && !canChangeLocation && (
										<span className='text-[10px] text-muted-foreground'>
											Solo Gerentes pueden reubicar
										</span>
									)}
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='cost'>Costo *</Label>
									<Input
										id='cost'
										type='number'
										min='0'
										step='0.01'
										value={formData.cost}
										onChange={(e) =>
											setFormData({
												...formData,
												cost: parseFloat(e.target.value) || 0,
											})
										}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='status'>Estado *</Label>
									<Select
										value={formData.status}
										disabled={asset && !canChangeStatus}
										onValueChange={(value: AssetStatus) =>
											setFormData({ ...formData, status: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='active'>Activo</SelectItem>
											<SelectItem value='inactive'>Inactivo</SelectItem>
											<SelectItem value='decommissioned'>
												Desincorporado
											</SelectItem>
										</SelectContent>
									</Select>
									{asset && !canChangeStatus && (
										<span className='text-[10px] text-muted-foreground'>
											Solo Admin puede cambiar estado
										</span>
									)}
								</div>
							</div>

							{/* {asset && (
								<div className='space-y-2 pt-2'>
									<Label htmlFor='change_reason'>
										Motivo del Cambio (para historial)
									</Label>
									<Input
										id='change_reason'
										placeholder='Ej: Mantenimiento, Upgrade, etc.'
									/>
								</div>
							)} */}

							<DialogFooter className='flex justify-between pt-4'>
								<div>
									{asset && canChangeStatus && (
										<Button
											type='button'
											variant='destructive'
											onClick={handleDelete}
										>
											<Trash2 className='h-4 w-4 mr-2' />
											Eliminar
										</Button>
									)}
								</div>
								<div className='flex gap-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => onOpenChange(false)}
									>
										Cancelar
									</Button>
									<Button type='submit'>
										{asset ? "Guardar Cambios" : "Crear Activo"}
									</Button>
								</div>
							</DialogFooter>
						</form>
					</TabsContent>

					{asset && canViewHistory && (
						<TabsContent value='history'>
							<AssetHistory assetId={String(asset.id)} currentAsset={asset} />
						</TabsContent>
					)}
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
