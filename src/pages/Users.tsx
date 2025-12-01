import { useState, useEffect } from "react";
import { useUsers } from "@/contexts/UsersContext";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { User, UserForm, UserRole } from "@/types";

const ROLE_NAME_MAP = {
	admin: "Administrador",
	manager: "Gerente",
	inventory: "Inventario",
};

export default function Users() {
	const { users, fetchUsers, addUser, updateUser, deleteUser } = useUsers();
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		password: "",
		role: "inventory" as UserRole,
	});

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	useEffect(() => {
		if (isAddOpen) {
			setFormData({
				username: "",
				email: "",
				first_name: "",
				last_name: "",
				password: "",
				role: "inventory" as UserRole,
			});
		}
	}, [isAddOpen]);

	const handleAdd = () => {
		addUser(formData);
		setIsAddOpen(false);
		setFormData({
			username: "",
			email: "",
			first_name: "",
			last_name: "",
			password: "",
			role: "inventory",
		});
	};

	const handleEdit = () => {
		updateUser(editingUser.id, formData);
		setIsEditOpen(false);
		setEditingUser(null);
		setFormData({
			username: "",
			email: "",
			first_name: "",
			last_name: "",
			password: "",
			role: "inventory",
		});
	};

	const handleDelete = async () => {
		if (deleteId) {
			await deleteUser(deleteId);
			setDeleteId(null);
		}
	};

	const openEdit = (user: User) => {
		setEditingUser(user);
		setFormData({
			username: user.username,
			email: user.email,
			first_name: user.first_name,
			last_name: user.last_name,
			password: "",
			role: user.role.name,
		});
		setIsEditOpen(true);
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold'>Usuarios</h1>
					<p className='text-muted-foreground'>
						Gestiona los usuarios del sistema
					</p>
				</div>
				<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className='h-4 w-4 mr-2' />
							Agregar Usuario
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Agregar Usuario</DialogTitle>
						</DialogHeader>
						<div className='space-y-4 pt-4'>
							<div className='space-y-2'>
								<Label htmlFor='username'>Nombre de Usuario</Label>
								<Input
									id='username'
									value={formData.username}
									onChange={(e) =>
										setFormData({ ...formData, username: e.target.value })
									}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='first_name'>Nombre</Label>
								<Input
									id='first_name'
									value={formData.first_name}
									onChange={(e) =>
										setFormData({ ...formData, first_name: e.target.value })
									}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='last_name'>Apellido</Label>
								<Input
									id='last_name'
									value={formData.last_name}
									onChange={(e) =>
										setFormData({ ...formData, last_name: e.target.value })
									}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='role'>Rol</Label>
								<Select
									value={formData.role}
									onValueChange={(value: UserRole) =>
										setFormData({ ...formData, role: value })
									}
									required
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='admin'>Administrador</SelectItem>
										<SelectItem value='manager'>Gerente</SelectItem>
										<SelectItem value='inventory'>Inventario</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='password'>Password</Label>
								<Input
									id='password'
									type='password'
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									required
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
							<TableHead>Usuario</TableHead>
							<TableHead>Nombre</TableHead>
							<TableHead>Apellido</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Rol</TableHead>
							<TableHead>Fecha de Creación</TableHead>
							<TableHead className='text-right'>Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.id}>
								<TableCell className='font-medium'>{user.username}</TableCell>
								<TableCell>{user.first_name}</TableCell>
								<TableCell>{user.last_name}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell className='capitalize'>
									{ROLE_NAME_MAP[user.role.name]}
								</TableCell>
								<TableCell>
									{new Date(user.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell className='text-right space-x-2'>
									<Button
										variant='ghost'
										size='icon'
										onClick={() => openEdit(user)}
									>
										<Pencil className='h-4 w-4' />
									</Button>
									<Button
										variant='ghost'
										size='icon'
										onClick={() => setDeleteId(user.id)}
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
						<DialogTitle>Editar Usuario</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 pt-4'>
						<div className='space-y-2'>
							<Label htmlFor='edit-username'>Nombre de Usuario</Label>
							<Input
								id='edit-username'
								value={formData.username}
								onChange={(e) =>
									setFormData({ ...formData, username: e.target.value })
								}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-first_name'>Nombre</Label>
							<Input
								id='first_name'
								value={formData.first_name}
								onChange={(e) =>
									setFormData({ ...formData, first_name: e.target.value })
								}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-last_name'>Apellido</Label>
							<Input
								id='last_name'
								value={formData.last_name}
								onChange={(e) =>
									setFormData({ ...formData, last_name: e.target.value })
								}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-email'>Email</Label>
							<Input
								id='edit-email'
								type='email'
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								required
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='edit-role'>Rol</Label>
							<Select
								value={formData.role}
								onValueChange={(value: UserRole) =>
									setFormData({ ...formData, role: value })
								}
								required
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='admin'>Administrador</SelectItem>
									<SelectItem value='manager'>Gerente</SelectItem>
									<SelectItem value='inventory'>Inventario</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='edit-password'>Password</Label>
							<Input
								id='edit-password'
								type='password'
								value={formData.password}
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
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
							usuario.
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
