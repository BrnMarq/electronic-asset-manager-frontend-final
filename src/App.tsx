import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AssetsProvider } from "./contexts/AssetsContext";
import { LocationsProvider } from "./contexts/LocationsContext";
import { TypesProvider } from "./contexts/TypesContext";
import { UsersProvider } from "./contexts/UsersContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Locations from "./pages/Locations";
import Types from "./pages/Types";
import Users from "./pages/Users";
import Changelog from "./pages/Changelog";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to='/' />;
}

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<BrowserRouter>
				<AuthProvider>
					<AssetsProvider>
						<LocationsProvider>
							<TypesProvider>
								<UsersProvider>
									<Routes>
										<Route path='/' element={<Login />} />
										<Route
											path='/dashboard'
											element={
												<ProtectedRoute>
													<Dashboard />
												</ProtectedRoute>
											}
										/>
										<Route
											path='/assets'
											element={
												<ProtectedRoute>
													<Assets />
												</ProtectedRoute>
											}
										/>
										<Route
											path='/changelog'
											element={
												<ProtectedRoute>
													<Changelog />
												</ProtectedRoute>
											}
										/>
										<Route
											path='/locations'
											element={
												<ProtectedRoute>
													<Locations />
												</ProtectedRoute>
											}
										/>
										<Route
											path='/types'
											element={
												<ProtectedRoute>
													<Types />
												</ProtectedRoute>
											}
										/>
										<Route
											path='/users'
											element={
												<ProtectedRoute>
													<Users />
												</ProtectedRoute>
											}
										/>
										<Route path='*' element={<NotFound />} />
									</Routes>
								</UsersProvider>
							</TypesProvider>
						</LocationsProvider>
					</AssetsProvider>
				</AuthProvider>
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
