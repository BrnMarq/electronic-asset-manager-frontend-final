import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, History, LogOut, Menu, Users, MapPin, Tags } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
	children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const { user, logout } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	const handleLogout = () => {
		logout();
		navigate("/");
	};

    const userRole = typeof user?.role === 'object' ? user.role.name : user?.role;
	const allNavItems = [
		{ 
            path: "/dashboard", 
            label: "Dashboard", 
            icon: LayoutDashboard, 
            roles: ["admin", "manager", "inventory"] 
        },
		{ 
            path: "/assets", 
            label: "Activos", 
            icon: Package, 
            roles: ["admin", "manager", "inventory"] 
        },
		{ 
            path: "/locations", 
            label: "Ubicaciones", 
            icon: MapPin, 
            roles: ["admin", "manager"] 
        },
		{ 
            path: "/types", 
            label: "Tipos", 
            icon: Tags, 
            roles: ["admin", "manager"] 
        },
		{ 
            path: "/users", 
            label: "Usuarios", 
            icon: Users, 
            roles: ["admin"] 
        },
	];

    const navItems = allNavItems.filter(item => 
        userRole && item.roles.includes(userRole)
    );

	const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
		<nav className={`flex ${mobile ? "flex-col" : "items-center"} gap-2`}>
			{navItems.map((item) => {
				const Icon = item.icon;
				const isActive = location.pathname === item.path;
				return (
					<Link
						key={item.path}
						to={item.path}
						onClick={() => mobile && setOpen(false)}
					>
						<Button
							variant={isActive ? "default" : "ghost"}
							className={`w-full justify-start ${!mobile && "px-3"}`}
						>
							<Icon className='h-4 w-4 mr-2' />
							{item.label}
						</Button>
					</Link>
				);
			})}
		</nav>
	);

	return (
		<div className='min-h-screen bg-background'>
			<header className='border-b bg-card shadow-sm sticky top-0 z-10'>
				<div className='container mx-auto px-4 h-16 flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Sheet open={open} onOpenChange={setOpen}>
							<SheetTrigger asChild className='lg:hidden'>
								<Button variant='ghost' size='icon'>
									<Menu className='h-5 w-5' />
								</Button>
							</SheetTrigger>
							<SheetContent side='left' className='w-64'>
								<div className='flex flex-col gap-4 mt-8'>
									<NavLinks mobile />
									<Button
										variant='destructive'
										onClick={handleLogout}
										className='w-full justify-start'
									>
										<LogOut className='h-4 w-4 mr-2' />
										Cerrar Sesión
									</Button>
								</div>
							</SheetContent>
						</Sheet>
						<Link to='/dashboard' className='flex items-center gap-2'>
							<div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
								<Package className='h-5 w-5 text-primary-foreground' />
							</div>
							<span className='font-bold text-lg hidden sm:inline'>
								Gestión de Activos
							</span>
						</Link>
					</div>

					<div className='hidden lg:flex items-center gap-4'>
						<NavLinks />
					</div>

					<div className='flex items-center gap-4'>
						<div className='hidden sm:block text-right'>
							<p className='text-sm font-medium'>{user?.username}</p>
							<p className='text-xs text-muted-foreground capitalize'>
								{userRole}
							</p>
						</div>
						<Button
							variant='ghost'
							size='icon'
							onClick={handleLogout}
							className='hidden lg:flex'
						>
							<LogOut className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</header>

			<main className='container mx-auto px-4 py-8'>{children}</main>
		</div>
	);
}