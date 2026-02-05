import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { login } from '../../store/slices/authSlice';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';
import { useConfig } from '../../core/config/ConfigContext';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const { config } = useConfig();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await dispatch(login(data)).unwrap();
            toast.success('Welcome back!');
            navigate(redirect);
        } catch (error: any) {
            toast.error(error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">{config['site.name'].charAt(0)}</span>
                            </div>
                            <span className="text-xl font-display font-bold text-primary-900">{config['site.name']}</span>
                        </Link>
                        <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-neutral-600">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            leftIcon={<Mail className="w-5 h-5" />}
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                leftIcon={<Lock className="w-5 h-5" />}
                                error={errors.password?.message}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                                    {...register('remember')}
                                />
                                <span className="text-sm text-neutral-600">Remember me</span>
                            </label>
                            <Link to="/auth/forgot-password" className="text-sm text-primary-500 hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-neutral-600">
                            Don't have an account?{' '}
                            <Link to={`/auth/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-primary-500 font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Social Login */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-neutral-50 text-neutral-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                <span className="font-medium">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                <span className="font-medium">GitHub</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Hero */}
            <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
                <div className="text-white text-center max-w-lg">
                    <h2 className="text-3xl font-display font-bold mb-6">
                        Your Fitness Journey Starts Here
                    </h2>
                    <p className="text-white/80 text-lg mb-8">
                        Access exclusive deals, track your orders, and get personalized recommendations
                        tailored to your fitness goals.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-3xl font-bold">10K+</div>
                            <div className="text-white/60 text-sm">Happy Customers</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">500+</div>
                            <div className="text-white/60 text-sm">Products</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">4.9</div>
                            <div className="text-white/60 text-sm">Avg. Rating</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
