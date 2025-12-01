import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Package } from "lucide-react";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const success = await login(username, password);

		if (success) {
			navigate("/dashboard");
		}

		setLoading(false);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent p-4'>
			<Card className='w-full max-w-md shadow-lg'>
				<CardHeader className='space-y-4 text-center'>
					<div className='mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-glow'>
						<Package className='w-8 h-8 text-primary-foreground' />
					</div>
					<div>
						<CardTitle className='text-2xl font-bold'>
							Sistema de Gestión de Activos
						</CardTitle>
						<CardDescription className='mt-2'>
							Ingresa tus credenciales para acceder al sistema
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='username'>Usuario</Label>
							<Input
								id='username'
								type='text'
								placeholder='Ingresa tu usuario'
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								autoComplete='username'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password'>Contraseña</Label>
							<Input
								id='password'
								type='password'
								placeholder='Ingresa tu contraseña'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								autoComplete='current-password'
							/>
						</div>
						<Button type='submit' className='w-full' disabled={loading}>
							{loading ? "Iniciando sesión..." : "Iniciar Sesión"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
