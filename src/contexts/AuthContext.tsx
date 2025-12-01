import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { User, AuthContextType } from "@/types";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const storedUser = localStorage.getItem("currentUser");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	const login = async (
		username: string,
		password: string
	): Promise<boolean> => {
		try {
			const response = await api.post("/auth/login", {
				username,
				password,
			});

			const { token } = response.data;
			const user = jwtDecode<User>(token);

			localStorage.setItem("authToken", token);
			localStorage.setItem("currentUser", JSON.stringify(user));
			setUser(user);

			toast({
				title: "Acceso exitoso",
				description: "Bienvenido al sistema de gestión de activos",
			});

			return true;
		} catch (error) {
			toast({
				title: "Error de autenticación",
				description:
					error?.response?.data?.message ??
					error?.response?.data?.errors[0]?.msg ??
					"Error desconocido",
				variant: "destructive",
			});
			console.error("Login failed:", error);
			return false;
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("currentUser");
		localStorage.removeItem("authToken");
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				logout,
				isAuthenticated: !!user,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
