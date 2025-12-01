import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";
import { User, UserForm, UsersContextType } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import api from "@/lib/axios";

const ROLE_MAP = {
	admin: 1,
	manager: 2,
	inventory: 3,
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);

	const fetchUsers = useCallback(async () => {
		if (!user) return;
		try {
			const response = await api.get("/users");
			setUsers(response.data);
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	}, [user]);

	const addUser = async (data: Omit<UserForm, "id" | "createdAt">) => {
		if (!user) return;
		try {
			const response = await api.post("/users", {
				...data,
				role_id: ROLE_MAP[data.role as keyof typeof ROLE_MAP],
			});
			setUsers((prev) => [...prev, response.data.user]);

			toast({
				title: "Usuario añadido",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al crear usuario",
				description:
					error?.response?.data?.message ??
					error?.response?.data?.errors?.[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error adding user:", error);
		}
	};

	const updateUser = async (
		id: number,
		data: Partial<Omit<UserForm, "id" | "createdAt">>
	) => {
		if (!user) return;
		try {
			const response = await api.patch(`/users/${id}`, {
				...data,
				role_id: ROLE_MAP[data.role as keyof typeof ROLE_MAP],
			});
			setUsers((prev) =>
				prev.map((loc) => (loc.id === id ? response.data.user : loc))
			);
			toast({
				title: "Usuario actualizado",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al actualizar usuario",
				description:
					error?.response?.data?.message ??
					error?.response?.data?.errors?.[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error updating user:", error);
		}
	};

	const deleteUser = async (id: number) => {
		if (!user) return;
		try {
			const response = await api.delete(`/users/${id}`);
			setUsers((prev) => prev.filter((loc) => loc.id !== id));
			toast({
				title: "Usuario eliminado",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al eliminar usuario",
				description:
					error?.response?.data?.message ??
					error?.response?.data?.errors?.[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error deleting user:", error);
		}
	};

	return (
		<UsersContext.Provider
			value={{
				users,
				fetchUsers,
				addUser,
				updateUser,
				deleteUser,
			}}
		>
			{children}
		</UsersContext.Provider>
	);
}

export function useUsers() {
	const context = useContext(UsersContext);
	if (!context) {
		throw new Error("useUsers must be used within UsersProvider");
	}
	return context;
}
