import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Upload from './components/Upload.tsx';
import Archive from './components/Archive.tsx';
import Compare from './components/Compare.tsx';
import Assistant from './components/Assistant.tsx';
import Login from './components/Login.tsx';
import Settings from './components/Settings.tsx';
import ShiftPlanner from './components/ShiftPlanner.tsx';
import LeavePlanner from './components/LeavePlanner.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import Spinner from './components/common/Spinner.tsx';
import { View, Payslip, User, Shift, LeavePlan, Absence } from './types.ts';
import { auth, onAuthStateChanged, signOut } from './services/firebase.ts';
import * as firestoreService from './services/firestoreService.ts';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.Dashboard);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [leavePlans, setLeavePlans] = useState<LeavePlan[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);

    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
    const [payslipsToCompare, setPayslipsToCompare] = useState<[Payslip, Payslip] | null>(null);
    const [alert, setAlert] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                let userProfile = await firestoreService.getUserProfile(firebaseUser.uid);

                if (!userProfile) {
                    const isAdmin = firebaseUser.email?.toLowerCase() === 'gderosa@ymail.com' || firebaseUser.email?.toLowerCase() === 'gcarandente@gmail.com';
                    const nameParts = firebaseUser.displayName?.split(' ') || ['Nuovo', 'Utente'];
                    const firstName = nameParts[0];
                    const lastName = nameParts.slice(1).join(' ');

                    const newUser: Omit<User, 'uid'> = {
                        email: firebaseUser.email!,
                        firstName,
                        lastName,
                        role: isAdmin ? 'admin' : 'user',
                        dateOfBirth: '',
                        placeOfBirth: '',
                    };
                    await firestoreService.saveUserProfile(firebaseUser.uid, newUser);
                    userProfile = { ...newUser, uid: firebaseUser.uid };
                }
                setUser({ ...userProfile, uid: firebaseUser.uid });
            } else {
                setUser(null);
                setPayslips([]);
                setShifts([]);
                setLeavePlans([]);
                setAbsences([]);
                setSelectedPayslip(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const unsubPayslips = firestoreService.getPayslips(user.uid, (data) => {
            setPayslips(data);
             if (data.length > 0 && (!selectedPayslip || !data.some(p => p.id === selectedPayslip.id))) {
                setSelectedPayslip(data[0]);
            } else if (data.length === 0) {
                setSelectedPayslip(null);
            }
        });
        const unsubShifts = firestoreService.getShifts(user.uid, setShifts);
        const unsubAbsences = firestoreService.getAbsences(user.uid, setAbsences);
        const unsubLeavePlans = firestoreService.getLeavePlans(user.uid, setLeavePlans);
        
        return () => {
            unsubPayslips();
            unsubShifts();
            unsubAbsences();
            unsubLeavePlans();
        };
    }, [user, selectedPayslip]);


    const handleAnalysisComplete = (newPayslip: Payslip) => {
        if (!user) return;
        
        const namesMatch = user.role === 'admin' || 
            (newPayslip.employee.firstName.trim().toLowerCase() === user.firstName.trim().toLowerCase() &&
             newPayslip.employee.lastName.trim().toLowerCase() === user.lastName.trim().toLowerCase());

        setSelectedPayslip(newPayslip);

        if (namesMatch) {
            firestoreService.addPayslip(user.uid, newPayslip);
            setAlert(null);
        } else {
            setAlert("Attenzione: I dati anagrafici sulla busta paga non corrispondono al tuo profilo. Questa analisi è temporanea e non verrà salvata nell'archivio.");
        }
        
        setCurrentView(View.Dashboard);
    };
    
    const handleSelectPayslipForDashboard = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setAlert(null);
        setCurrentView(View.Dashboard);
    };

    const handleCompare = (payslipsForComparison: [Payslip, Payslip]) => {
        setPayslipsToCompare(payslipsForComparison);
        setCurrentView(View.Compare);
    }
    
    const handleDeletePayslip = (payslipId: string) => {
        if (!user) return;
        firestoreService.deletePayslip(user.uid, payslipId);
    }
    
    const handleUpdateUser = (updatedUserData: Omit<User, 'uid' | 'role' | 'email'>) => {
        if (!user) return;
        const updatedProfile: User = { ...user, ...updatedUserData };
        firestoreService.saveUserProfile(user.uid, updatedProfile);
        setUser(updatedProfile);
    };

    const handleSaveShift = async (shift: Shift) => {
        if (!user) return;
        await firestoreService.saveShift(user.uid, shift);
        // Se c'è un'assenza per lo stesso giorno, la rimuoviamo
        const existingAbsence = absences.find(a => a.date === shift.date);
        if (existingAbsence) {
            await firestoreService.deleteAbsence(user.uid, existingAbsence.id);
        }
    };

    const handleDeleteShift = (shiftId: string) => {
        if (!user) return;
        firestoreService.deleteShift(user.uid, shiftId);
    };

    const handleSaveLeavePlan = (plan: LeavePlan) => {
        if (!user) return;
        firestoreService.saveLeavePlan(user.uid, plan);
    };

    const handleDeleteLeavePlan = (planId: string) => {
        if (!user) return;
        firestoreService.deleteLeavePlan(user.uid, planId);
    };

    const handleSaveAbsence = async (absence: Absence) => {
        if (!user) return;
        await firestoreService.saveAbsence(user.uid, absence);
        // Se c'è un turno per lo stesso giorno, lo rimuoviamo
        const existingShift = shifts.find(s => s.date === absence.date);
        if (existingShift) {
           await firestoreService.deleteShift(user.uid, existingShift.id);
        }
    };

    const handleDeleteAbsence = (absenceId: string) => {
        if (!user) return;
        firestoreService.deleteAbsence(user.uid, absenceId);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setCurrentView(View.Dashboard);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const registeredUsers = useMemo(() => {
        const usersMap = new Map<string, User>();
        if (user && user.role === 'admin') {
             usersMap.set(user.uid, user);
        }
        payslips.forEach(p => {
            const employeeTaxId = p.employee.taxId;
            if (employeeTaxId && !Array.from(usersMap.values()).some(u => u.taxId === employeeTaxId)) {
                usersMap.set(employeeTaxId, { // Nota: usa taxId come chiave temporanea
                    uid: `generated-${employeeTaxId}`,
                    firstName: p.employee.firstName,
                    lastName: p.employee.lastName,
                    taxId: employeeTaxId,
                    email: `(non disponibile)`,
                    dateOfBirth: '',
                    placeOfBirth: '',
                    role: 'user',
                });
            }
        });
        return Array.from(usersMap.values());
    }, [payslips, user]);


    const renderView = () => {
        switch (currentView) {
            case View.Dashboard:
                return <Dashboard payslip={selectedPayslip} alert={alert} payslips={payslips} />;
            case View.Upload:
                return <Upload onAnalysisComplete={handleAnalysisComplete} />;
            case View.Archive:
                return <Archive 
                            payslips={payslips} 
                            onSelectPayslip={handleSelectPayslipForDashboard} 
                            onCompare={handleCompare}
                            onDeletePayslip={handleDeletePayslip}
                        />;
            case View.Compare:
                return <Compare payslips={payslipsToCompare} />;
            case View.Assistant:
                return <Assistant payslips={payslips} mode="general" />;
            case View.AdminPanel:
                 return user?.role === 'admin' ? <AdminPanel users={registeredUsers} /> : <Dashboard payslip={selectedPayslip} alert={alert} payslips={payslips} />;
            case View.ShiftPlanner:
                return <ShiftPlanner 
                            shifts={shifts} 
                            onSave={handleSaveShift} 
                            onDelete={handleDeleteShift}
                            absences={absences}
                            onSaveAbsence={handleSaveAbsence}
                            onDeleteAbsence={handleDeleteAbsence}
                        />;
            case View.LeavePlanner:
                return <LeavePlanner leavePlans={leavePlans} onSave={handleSaveLeavePlan} onDelete={handleDeleteLeavePlan} />;
            case View.Settings:
                return <Settings user={user!} onSave={handleUpdateUser} />;
            default:
                return <Dashboard payslip={selectedPayslip} alert={alert} payslips={payslips} />;
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <Spinner />
            </div>
        );
    }
    
    if (!user) {
        return <Login />;
    }

    return (
        <Layout user={user} currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
            {renderView()}
        </Layout>
    );
};

export default App;