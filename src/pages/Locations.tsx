import { useState, useEffect } from "react";
import { useLocations } from "@/contexts/LocationsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Location } from "@/types";

export default function Locations() {
	const {
		locations,
		fetchLocations,
		addLocation,
		updateLocation,
		deleteLocation,
	} = useLocations();
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [editingLocation, setEditingLocation] = useState<Location | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});

	useEffect(() => {
		fetchLocations();
	}, [fetchLocations]);

	const handleAdd = () => {
		addLocation(formData);
		setIsAddOpen(false);
		setFormData({ name: "", description: "" });
	};

	const handleEdit = () => {
		if (!editingLocation) {
			return;
		}
		updateLocation(editingLocation.id, formData);
		setIsEditOpen(false);
		setEditingLocation(null);
		setFormData({ name: "", description: "" });
	};

	const handleDelete = async () => {
		if (deleteId) {
			await deleteLocation(deleteId);
			setDeleteId(null);
		}
	};

	const openEdit = (location: Location) => {
		setEditingLocation(location);
		setFormData({
			name: location.name,
			description: location.description || "",
		});
		setIsEditOpen(true);
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold'>Ubicaciones</h1>
					<p className='text-muted-foreground'>
						Gestiona las ubicaciones de los activos
					</p>
				</div>
				<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className='h-4 w-4 mr-2' />
							Agregar Ubicación
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Agregar Ubicación</DialogTitle>
						</DialogHeader>
						<div className='space-y-4 pt-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>Nombre</Label>
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
								<Label htmlFor='description'>Descripción</Label>
								<Textarea
									id='description'
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
								/>
							</div>
							<Button onClick={handleAdd} className='w-full'>
								Agregar
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<div className='bg-card rounded-lg border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Descripción</TableHead>
							<TableHead className='text-right'>Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{locations.map((location) => (
							<TableRow key={location.id}>
								<TableCell className='font-medium'>{location.name}</TableCell>
								<TableCell>{location.description || "-"}</TableCell>
								<TableCell className='text-right space-x-2'>
									<Button
										variant='ghost'
										size='icon'
										onClick={() => openEdit(location)}
									>
										<Pencil className='h-4 w-4' />
									</Button>
									<Button
										variant='ghost'
										size='icon'
										onClick={() => setDeleteId(location.id)}
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar Ubicación</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 pt-4'>
						<div className='space-y-2'>
							<Label htmlFor='edit-name'>Nombre</Label>
							<Input
								id='edit-name'
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-description'>Descripción</Label>
							<Textarea
								id='edit-description'
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
							/>
						</div>
						<Button onClick={handleEdit} className='w-full'>
							Actualizar
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. Se eliminará permanentemente la
							ubicación.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
