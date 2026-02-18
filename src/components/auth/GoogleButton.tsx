"use client"

import { GoogleLogin } from '@react-oauth/google';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function GoogleButton({ text = "Sign in with Google" }: { text?: string }) {
    const router = useRouter();

    const handleSuccess = async (credentialResponse: any) => {
        try {
            const res = await api.post('/auth/google', {
                token: credentialResponse.credential
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            if (res.data.user.role === 'ADMIN' || res.data.user.role === 'EDITOR') {
                router.push('/admin');
            } else if (res.data.user.role === 'SUPER_ADMIN') {
                router.push('/super-admin');
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Google Login Failed:', error);
            toast.error('Google Login Failed. Please try again.');
        }
    };

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => {
                    console.log('Login Failed');
                    toast.error('Google Login Failed');
                }}
                theme="filled_black"
                text="signin_with"
                shape="rectangular"
                width="100%"
            />
        </div>
    );
}
