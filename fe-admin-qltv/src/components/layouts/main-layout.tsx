import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'

export function MainLayout() {
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<main className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<Header />
				<div className="flex-1 overflow-y-auto p-8">
					<Outlet />
				</div>
			</main>
		</div>
	)
}
