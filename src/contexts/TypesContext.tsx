import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";
import { AssetType, TypesContextType } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import api from "@/lib/axios";

const TypesContext = createContext<TypesContextType | undefined>(undefined);

export function TypesProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [types, setTypes] = useState<AssetType[]>([]);

	const fetchTypes = useCallback(async () => {
		if (!user) return;
		try {
			const response = await api.get("/types");
			setTypes(response.data);
		} catch (error) {
			console.error("Error fetching types:", error);
		}
	}, [user]);

	const addType = async (type: Omit<AssetType, "id">) => {
		if (!user) return;
		try {
			const response = await api.post("/types", type);
			setTypes((prevTypes) => [...prevTypes, response.data.type]);
			toast({
				title: "Tipo creado",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al crear tipo",
				description:
					error?.response?.data?.message ??
					error?.response?.data?.errors?.[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error adding type:", error);
		}
	};

	const updateType = async (id: number, updates: Partial<AssetType>) => {
		if (!user) return;
		try {
			const response = await api.patch(`/types/${id}`, updates);
			setTypes((prevTypes) =>
				prevTypes.map((type) => (type.id === id ? response.data.type : type))
			);
			toast({
				title: "Tipo actualizado",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al actualizar tipo",
				description:
					error?.response?.data?.message ??
					error?.response?.data?.errors?.[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error updating type:", error);
		}
	};

	const deleteType = async (id: number) => {
		if (!user) return;
		try {
			const response = await api.delete(`/types/${id}`);
			setTypes((prevTypes) => prevTypes.filter((type) => type.id !== id));
			toast({
				title: "Tipo eliminado",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al eliminar tipo",
				description:
					error?.response?.data?.message ??
					error?.response?.data?.errors?.[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error deleting location:", error);
		}
	};

	return (
		<TypesContext.Provider
			value={{
				types,
				fetchTypes,
				addType,
				updateType,
				deleteType,
			}}
		>
			{children}
		</TypesContext.Provider>
	);
}

export function useTypes() {
	const context = useContext(TypesContext);
	if (!context) {
		throw new Error("useTypes must be used within TypesProvider");
	}
	return context;
}
