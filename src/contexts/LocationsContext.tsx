import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";
import { Location, LocationsContextType } from "@/types";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";

const LocationsContext = createContext<LocationsContextType | undefined>(
	undefined
);

export function LocationsProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [locations, setLocations] = useState<Location[]>([]);

	const fetchLocations = useCallback(async () => {
		if (!user) return;
		try {
			const response = await api.get("/locations");
			setLocations(response.data);
		} catch (error) {
			console.error("Error fetching locations:", error);
		}
	}, [user]);

	const addLocation = async (data: { name: string; description?: string }) => {
		if (!user) return;
		try {
			const response = await api.post("/locations", data);
			if (response.status === 201) {
				setLocations((prev) => [...prev, response.data.location]);
			}

			toast({
				title: "Ubicación creada",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al crear la ubicación",
				description:
					error?.response.data?.message ??
					error?.response.data?.errors?.[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error adding location:", error);
		}
	};

	const updateLocation = async (
		id: number,
		data: { name: string; description?: string }
	) => {
		if (!user) return;
		try {
			const response = await api.patch(`/locations/${id}`, data);
			if (response.status === 200) {
				setLocations((prev) =>
					prev.map((loc) => (loc.id === id ? response.data.location : loc))
				);
			}
			toast({
				title: "Ubicación actualizada",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al actualizar la ubicación",
				description:
					error?.response.data?.message ??
					error?.response.data.errors[0].msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error updating location:", error);
		}
	};

	const deleteLocation = async (id: number) => {
		if (!user) return;
		try {
			const response = await api.delete(`/locations/${id}`);
			if (response.status === 200)
				setLocations((prev) => prev.filter((loc) => loc.id !== id));

			toast({
				title: "Ubicación eliminada",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al eliminar ubicación",
				description:
					error?.response.data?.message ??
					error?.response.data.errors[0].msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error deleting location:", error);
		}
	};

	return (
		<LocationsContext.Provider
			value={{
				locations,
				fetchLocations,
				addLocation,
				updateLocation,
				deleteLocation,
			}}
		>
			{children}
		</LocationsContext.Provider>
	);
}

export function useLocations() {
	const context = useContext(LocationsContext);
	if (!context) {
		throw new Error("useLocations must be used within LocationsProvider");
	}
	return context;
}
