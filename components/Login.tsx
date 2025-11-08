import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../services/firebase.ts';
import { LogoIcon, GoogleIcon } from './common/Icons.tsx';

const Login: React.FC = () => {
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
            // App.tsx will automatically handle the user state change via onAuthStateChanged
        } catch (error) {
            console.error("Error signing in with Google", error);
            setError("Impossibile accedere con Google. Riprova.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
             <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center transition-all">
                 <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center space-x-2 text-blue-600">
                        <LogoIcon />
                        <span className="font-bold text-3xl">GioIA</span>
                    </div>
                     <h1 className="text-xl text-gray-800 mt-4">Il tuo assistente per le buste paga</h1>
                     <p className="text-gray-500 mt-2">Accedi in modo sicuro per iniziare ad analizzare, archiviare e comprendere i tuoi dati retributivi.</p>
                </div>
                
                <div className="flex justify-center mt-8">
                     <button 
                        onClick={handleGoogleSignIn}
                        className="inline-flex items-center justify-center w-full max-w-xs px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        Accedi con Google
                    </button>
                </div>
                {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
            </div>
        </div>
    );
};

export default Login;