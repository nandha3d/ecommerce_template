import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { Button } from '../../../components/ui/Button';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            // Adjust endpoint if necessary, e.g., /auth/login or /admin/login
            const response = await api.post('/auth/login', data);

            // Adjusted for backend response structure
            const token = response.data.data?.tokens?.access_token;
            if (token) {
                localStorage.setItem('auth_token', token);
            }

            toast.success('Welcome back!');
            navigate('/admin/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at 0% 0%, var(--secondary) 0%, transparent 50%), radial-gradient(circle at 100% 100%, hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.15) 0%, transparent 50%), var(--bg-main)',
            overflow: 'hidden',
            position: 'relative',
            padding: 'var(--space-xl)'
        }}>
            {/* Background glow elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'var(--primary)', opacity: 0.03, filter: 'blur(120px)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'var(--primary)', opacity: 0.03, filter: 'blur(150px)', borderRadius: '50%' }}></div>

            <div className="animate-fade-in" style={{ width: '100%', maxWidth: '460px', zIndex: 1 }}>
                <div className="card glass" style={{
                    padding: '48px 40px',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(40px) saturate(200%)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Top accent line */}
                    <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.3), transparent)` }}></div>

                    <div className="flex-column flex-center" style={{ gap: 'var(--space-md)', marginBottom: '40px', position: 'relative' }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 12px 24px hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.25)`,
                            marginBottom: 'var(--space-sm)',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', inset: '1px', borderRadius: '11px', background: 'linear-gradient(135deg, var(--glass-bg), transparent)', pointerEvents: 'none' }}></div>
                            <Lock size={32} color="var(--text-on-primary)" strokeWidth={2.5} />
                        </div>
                        <h1 style={{
                            fontSize: '2.25rem',
                            fontWeight: 900,
                            letterSpacing: '-1.5px',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, var(--text-main), var(--primary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            ADMIN LOGIN
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '1rem', opacity: 0.7 }}>
                            Secure access to your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex-column" style={{ gap: 'var(--space-xl)' }}>
                        <div className="flex-column" style={{ gap: 'var(--space-lg)' }}>
                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label" style={{ opacity: 0.7, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 'var(--space-md)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        className="input"
                                        style={{
                                            paddingLeft: '48px',
                                            height: '52px',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.95rem'
                                        }}
                                        placeholder="you@example.com"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && <span className="badge badge-error" style={{ marginTop: 'var(--space-xs)', alignSelf: 'flex-start' }}>{errors.email.message}</span>}
                            </div>

                            <div className="flex-column" style={{ gap: 'var(--space-xs)' }}>
                                <label className="label" style={{ opacity: 0.7, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 'var(--space-md)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        className="input"
                                        style={{
                                            paddingLeft: '48px',
                                            height: '52px',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.95rem'
                                        }}
                                        placeholder="••••••••"
                                        {...register('password')}
                                    />
                                </div>
                                {errors.password && <span className="badge badge-error" style={{ marginTop: 'var(--space-xs)', alignSelf: 'flex-start' }}>{errors.password.message}</span>}
                            </div>

                            <div className="flex-between" style={{ marginTop: 'var(--space-xs)' }}>
                                <label className="checkbox-container">
                                    <input type="checkbox" {...register('remember' as any)} />
                                    <span className="checkmark"></span>
                                    Keep me logged in
                                </label>
                                <a href="#" onClick={(e) => { e.preventDefault(); toast.error('Please contact your system administrator'); }} style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'var(--transition)' }}>
                                    Forgot Password?
                                </a>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="btn-primary"
                            style={{
                                height: '52px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: `0 12px 24px -4px hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.3)`,
                                border: 'none',
                                marginTop: 'var(--space-sm)',
                                justifyContent: 'center',
                                transition: 'var(--transition)'
                            }}
                        >
                            SIGN IN
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
