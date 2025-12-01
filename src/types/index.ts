export type UserRole = "admin" | "manager" | "inventory";

export type AssetStatus = "active" | "inactive" | "decommissioned";

export interface User {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	role: {
		id: number;
		name: UserRole;
	};
	createdAt: string;
}

export interface UserForm {
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	role: UserRole;
	password: string;
}

export interface AssetType {
	id: number;
	name: string;
	category: string;
	description?: string;
}

export interface Location {
	id: number;
	name: string;
	description?: string;
}

export interface AssetForm {
	id: number;
	name: string;
	type_id: number;
	description?: string;
	serial_number: number;
	responsible_id: number;
	location_id: number;
	cost: number;
	status: AssetStatus;
	acquisition_date: string;
	created_at: string;
	created_by: number;
}

export interface AssetFilter {
	name?: string;
	serial_number?: number;
	type_id?: number;
	description?: string;
	location_id?: number;
	status?: AssetStatus;
	responsible_id?: number;
	page?: number;
	limit?: number;
	cost?: number;
}

export interface Asset {
	id: number;
	name: string;
	serial_number: number;
	type_id: number;
	description: string | null;
	responsible_id: number;
	location_id: number;
	status: AssetStatus;
	cost: number;
	acquisition_date: string;
	created_by: number;
	location: {
		id: number;
		name: string;
	};
	type: {
		id: number;
		name: string;
		category: string;
	};
	responsible: {
		id: number;
		first_name: string;
		last_name: string;
		username: string;
	};
}

export interface AssetInfo {
	assets: Asset[];
	total: number;
	activeAssets: number;
	inactiveAssets: number;
	decommissionedAssets: number;
	page: number;
	limit: number;
}

export interface AssetStats {
	cost: number;
	active: number;
	inactive: number;
}

export interface ChangelogEntry {
	id: number;
	asset_id: number;
	user_id: number;
	change_type: string;
	change_reason?: string;
	createdAt: string;
	user?: {
		id: number;
		first_name: string;
		last_name: string;
		username: string;
	};

	changes?: {
		field: string;
		oldValue: unknown;
		newValue: unknown;
	}[];

	old_name?: string;
	old_serial_number?: number;
	old_type_id?: number;
	old_description?: string;
	old_responsible_id?: number;
	old_location_id?: number;
	old_cost?: number;
	old_status?: string;
	old_acquisition_date?: string;
}

export interface AuthContextType {
	user: User | null;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
	isAuthenticated: boolean;
}

export interface AssetsContextType {
	assetsInfo: AssetInfo;
	assetsStats: AssetStats;
	changelog: ChangelogEntry[];
	fetchStats: () => void;
	fetchAssets: (page?: number, limit?: number, filters?: AssetFilter) => void;
	fetchAssetHistory: (id: number) => Promise<ChangelogEntry[]>;
	fetchChangelog: () => Promise<void>;
	addAsset: (
		asset: Omit<
			AssetForm,
			"id" | "created_at" | "created_by" | "acquisition_date"
		>
	) => void;
	updateAsset: (id: number, updates: Partial<AssetForm>) => void;
	deleteAsset: (id: number) => void;
}

export interface LocationsContextType {
	locations: Location[];
	fetchLocations: () => void;
	addLocation: (location: Omit<Location, "id">) => void;
	updateLocation: (id: number, updates: Partial<Location>) => void;
	deleteLocation: (id: number) => void;
}

export interface TypesContextType {
	types: AssetType[];
	fetchTypes: () => void;
	addType: (type: Omit<AssetType, "id">) => void;
	updateType: (id: number, updates: Partial<AssetType>) => void;
	deleteType: (id: number) => void;
}

export interface UsersContextType {
	users: User[];
	fetchUsers: () => void;
	addUser: (user: Omit<UserForm, "id" | "createdAt">) => void;
	updateUser: (
		id: number,
		updates: Partial<Omit<UserForm, "id" | "createdAt">>
	) => void;
	deleteUser: (id: number) => void;
}
