import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const loginSchema = z.object({
	username: z.string().min(1, 'Tên đăng nhập không được để trống'),
	password: z.string().min(1, 'Mật khẩu không được để trống'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const { login, isLoading, error } = useAuth();
	const navigate = useNavigate();

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginFormValues) => {
		const success = await login({
			username: data.username,
			password: data.password,
		});

		if (success) {
			navigate('/dashboard');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background-light))] dark:bg-[hsl(var(--background-dark))]">
			
			<div className="fixed inset-0 z-0">
				<div
					className="w-full h-full bg-cover bg-center opacity-40 grayscale-[20%]"
					style={{
						backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCqc2taMKjkTq5kMrg7tkbvNbrW1cLE-l8kdkj7hDUV9GQ2G8v5bJ2CXjx9BLj_5XqO7gTotoLGzRP_O6euRFERQbQ6SbAqdCUhHJ_6bt8S-LT-8x6SshX7UuKVgor-2xa9e-GdiQmaO6yiLNA93_ZdQRFqTlNMX3L2KEK00tiRWsunNv9Oc9aj9mWsLvJ6e8b-fBcXvJM6rQ_DvPODTkqPGdJTYP_wRl4kypshK4DthMklt5GzzZLE8gNjSJrR_Mu3F_iQYgkJMY0j')`,
					}}
				/>
				<div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-[hsl(var(--background-light))]/90 dark:to-[hsl(var(--background-dark))]/90" />
			</div>

			
			<div className="relative z-10 w-full max-w-md">
				<div className="bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
					
					<div className="p-8 pb-4 flex flex-col items-center text-center">
						<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
							<img
								alt="Hoài Đức A School Logo"
								className="w-16 h-16 object-contain"
								src="/logo.png"
							/>
						</div>
						<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
							Đăng nhập hệ thống
						</h1>
						<p className="text-slate-500 dark:text-slate-400 text-sm">
							Hoài Đức A High School • Admin Portal
						</p>
					</div>

					
					<Form {...form}>
						<form
							className="p-8 pt-4 space-y-5"
							onSubmit={form.handleSubmit(onSubmit)}
						>
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tên đăng nhập</FormLabel>
										<FormControl>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
													<User className="h-4 w-4" />
												</div>
												<Input
													{...field}
													type="text"
													placeholder="Nhập tên đăng nhập admin"
													className="pl-10"
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mật khẩu</FormLabel>
										<FormControl>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
													<Lock className="h-4 w-4" />
												</div>
												<Input
													{...field}
													type={showPassword ? 'text' : 'password'}
													placeholder="••••••••"
													className="pl-10 pr-12"
												/>
												<button
													type="button"
													className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition-colors"
													onClick={() => setShowPassword(!showPassword)}
												>
													{showPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<p className="text-sm text-slate-500 dark:text-slate-400 text-right">
								Quên mật khẩu? Liên hệ quản trị hệ thống để được hỗ trợ.
							</p>

									{error && (
								<div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
									{error}
								</div>
							)}

							<Button type="submit" className="w-full h-10" disabled={isLoading}>
								{isLoading ? (
									<>
										<svg
											className="animate-spin -ml-1 mr-2 h-4 w-4"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										<span>Đang đăng nhập...</span>
									</>
								) : (
									<>
										<LogIn className="h-4 w-4" />
										<span>Đăng nhập</span>
									</>
								)}
							</Button>
						</form>
					</Form>

					
					<div className="px-8 pb-8 text-center">
						<div className="relative flex items-center py-2">
							<div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
							<span className="flex-shrink mx-4 text-slate-400 text-xs font-light">
								Hỗ trợ hệ thống
							</span>
							<div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
						</div>
						<p className="mt-4 text-xs text-slate-400">
							© {new Date().getFullYear()} Hệ thống Thư viện THPT Hoài Đức A. <br /> Bảo lưu mọi
							quyền.
						</p>
					</div>
				</div>

				
				<div className="mt-6 flex justify-center space-x-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
					<a className="hover:text-primary transition-colors" href="#">
						Hỗ trợ
					</a>
					<a className="hover:text-primary transition-colors" href="#">
						Hướng dẫn
					</a>
					<a className="hover:text-primary transition-colors" href="#">
						Chính sách
					</a>
				</div>
			</div>
		</div>
	);
}
