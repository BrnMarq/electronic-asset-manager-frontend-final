import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";
import {
	AssetInfo,
	AssetForm,
	AssetsContextType,
	ChangelogEntry,
	AssetStats,
} from "@/types";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import api from "@/lib/axios";

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function AssetsProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [assetsInfo, setAssetsInfo] = useState<AssetInfo>({
		assets: [],
		total: 0,
		activeAssets: 0,        
		inactiveAssets: 0,      
		decommissionedAssets: 0,
		page: 1,
		limit: 10,
	});
	const [assetsStats, setAssetsStats] = useState<AssetStats>({
		inactive: 0,
		active: 0,
		cost: 0,
	});

	const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

	const fetchStats = useCallback(async () => {
		if (!user) return;
		try {
			const response = await api.get("/assets/stats");
			setAssetsStats(response.data);
		} catch (error) {
			console.error("Error fetching stats:", error);
		}
	}, [user]);

	const fetchChangelog = useCallback(async () => {
		if (!user) return;
		try {
			const response = await api.get("/changelog");
			setChangelog(response.data);
		} catch (error) {
			console.error("Error fetching changelog:", error);
		}
	}, [user]);

	const fetchAssets = useCallback(
		async (page = 1, limit = 10, filters = {}) => {
			try {
				const response = await api.get("/assets", {
					params: {
						page,
						limit,
						...filters,
					},
				});
				setAssetsInfo(response.data);
			} catch (error) {
				console.error("Error fetching assets:", error);
			}
		},
		[]
	);

	const fetchAssetHistory = useCallback(
		async (id: number) => {
			if (!user) return [];
			try {
				const response = await api.get(`/assets/${id}`);
				return response.data.changelog || [];
			} catch (error) {
				console.error("Error fetching asset history:", error);
				return [];
			}
		},
		[user]
	);

	const addAsset = async (
		assetData: Omit<
			AssetForm,
			"id" | "created_at" | "created_by" | "acquisition_date"
		>
	) => {
		if (!user) return;
		try {
			const response = await api.post("/assets", {
				...assetData,
				acquisition_date: new Date().toISOString(),
			});
			if (response.status === 201) {
				fetchAssets();
			}
			toast({
				title: "Activo creado",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al crear el activo",
				description:
					error?.response.data?.message ??
					error?.response.data?.errors?.[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error adding asset:", error);
		}
	};

	const updateAsset = async (id: number, updates: Partial<AssetForm>) => {
		if (!user) return;
		try {
			const response = await api.patch(`/assets/${id}`, updates);
			if (response.status === 200) {
				setAssetsInfo((prev) => ({
					...prev,
					assets: prev.assets.map((asset) =>
						asset.id === id ? response.data.asset : asset
					),
				}));
			}
			toast({
				title: "Activo actualizado",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al actualizar el activo",
				description:
					error?.response.data?.message ??
					error?.response.data?.errors?.[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error updating asset:", error);
		}
	};

	const deleteAsset = async (id: number) => {
		if (!user) return;
		try {
			const response = await api.delete(`/assets/${id}`);
			if (response.status === 200) {
				setAssetsInfo((prev) => ({
					...prev,
					assets: prev.assets.filter((asset) => asset.id !== id),
					total: prev.total - 1,
				}));
			}

			toast({
				title: "Activo eliminado",
				description: response.data.message,
			});
		} catch (error) {
			toast({
				title: "Error al eliminar el activo",
				description:
					error?.response.data?.message ??
					error?.response.data?.errors?.[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Error deleting asset:", error);
		}
	};

	return (
		<AssetsContext.Provider
			value={{
				assetsInfo,
				assetsStats,
				changelog,
				fetchStats,
				fetchAssets,
				fetchChangelog,
				fetchAssetHistory,
				addAsset,
				updateAsset,
				deleteAsset,
			}}
		>
			{children}
		</AssetsContext.Provider>
	);
}

export function useAssets() {
	const context = useContext(AssetsContext);
	if (!context) {
		throw new Error("useAssets must be used within AssetsProvider");
	}
	return context;
}
