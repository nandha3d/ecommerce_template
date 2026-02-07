import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { register as registerUser } from '../../store/slices/authSlice';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';
import { useConfig } from '../../core/config/ConfigContext';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const { config } = useConfig();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const password = watch('password', '');

    const passwordStrength = React.useMemo(() => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }, [password]);

    const onSubmit = async (data: RegisterFormData) => {
        if (!acceptTerms) {
            toast.error('Please accept the terms and conditions');
            return;
        }
        try {
            await dispatch(registerUser(data)).unwrap();
            toast.success('Account created successfully!');
            navigate(redirect);
        } catch (error: any) {
            toast.error(error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Left Side - Hero */}
            <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
                <div className="text-white text-center max-w-lg">
                    <h2 className="text-3xl font-display font-bold mb-6">
                        Join the {config['site.name']} Family
                    </h2>
                    <p className="text-white/80 text-lg mb-8">
                        Create your account today and unlock exclusive benefits, personalized
                        recommendations, and member-only deals.
                    </p>
                    <div className="space-y-4 text-left">
                        {[
                            'Free shipping on orders over $50',
                            'Exclusive member discounts',
                            'Early access to new products',
                            'Personalized supplement recommendations',
                        ].map((benefit, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white/90">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
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
                            Create Account
                        </h1>
                        <p className="text-neutral-600">
                            Start your fitness journey today
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            leftIcon={<User className="w-5 h-5" />}
                            error={errors.name?.message}
                            {...register('name')}
                        />

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
                                placeholder="Create a password"
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
                            {password && (
                                <div className="mt-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded ${passwordStrength >= level
                                                    ? level <= 1 ? 'bg-danger' : level <= 2 ? 'bg-warning' : 'bg-success'
                                                    : 'bg-neutral-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {passwordStrength <= 1 && 'Weak'}
                                        {passwordStrength === 2 && 'Fair'}
                                        {passwordStrength === 3 && 'Good'}
                                        {passwordStrength >= 4 && 'Strong'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <Input
                                label="Confirm Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                leftIcon={<Lock className="w-5 h-5" />}
                                error={errors.password_confirmation?.message}
                                {...register('password_confirmation')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-600">
                                I agree to the{' '}
                                <Link to="/pages/terms" className="text-primary-500 hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/pages/privacy" className="text-primary-500 hover:underline">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                            disabled={!acceptTerms}
                        >
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-neutral-600">
                            Already have an account?{' '}
                            <Link to={`/auth/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-primary-500 font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
