import { useState, useEffect } from "react";
import { useTypes } from "@/contexts/TypesContext";
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
import { AssetType } from "@/types";

export default function Types() {
	const { types, addType, updateType, deleteType, fetchTypes } = useTypes();
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [editingType, setEditingType] = useState<AssetType | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		category: "",
		description: "",
	});

	useEffect(() => {
		fetchTypes();
	}, [fetchTypes]);

	const handleAdd = () => {
		addType(formData);
		setIsAddOpen(false);
		setFormData({ name: "", category: "", description: "" });
	};

	const handleEdit = () => {
		updateType(editingType.id, formData);
		setIsEditOpen(false);
		setEditingType(null);
		setFormData({ name: "", category: "", description: "" });
	};

	const handleDelete = async () => {
		if (deleteId) {
			await deleteType(deleteId);
			setDeleteId(null);
		}
	};

	const openEdit = (type: AssetType) => {
		setEditingType(type);
		setFormData({
			name: type.name,
			category: type.category,
			description: type.description || "",
		});
		setIsEditOpen(true);
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold'>Tipos de Activos</h1>
					<p className='text-muted-foreground'>
						Gestiona los tipos y categorías de activos
					</p>
				</div>
				<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className='h-4 w-4 mr-2' />
							Agregar Tipo
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Agregar Tipo</DialogTitle>
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
								<Label htmlFor='category'>Categoría</Label>
								<Input
									id='category'
									value={formData.category}
									onChange={(e) =>
										setFormData({ ...formData, category: e.target.value })
									}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='description'>Descripción</Label>
								<Input
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
							<TableHead>Categoría</TableHead>
							<TableHead>Descripción</TableHead>
							<TableHead className='text-right'>Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{types.map((type) => (
							<TableRow key={type.id}>
								<TableCell className='font-medium'>{type.name}</TableCell>
								<TableCell>{type.category}</TableCell>
								<TableCell>{type.description}</TableCell>
								<TableCell className='text-right space-x-2'>
									<Button
										variant='ghost'
										size='icon'
										onClick={() => openEdit(type)}
									>
										<Pencil className='h-4 w-4' />
									</Button>
									<Button
										variant='ghost'
										size='icon'
										onClick={() => setDeleteId(type.id)}
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
						<DialogTitle>Editar Tipo</DialogTitle>
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
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-category'>Categoría</Label>
							<Input
								id='edit-category'
								value={formData.category}
								onChange={(e) =>
									setFormData({ ...formData, category: e.target.value })
								}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-category'>Descripción</Label>
							<Input
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
							Esta acción no se puede deshacer. Se eliminará permanentemente el
							tipo de activo.
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
