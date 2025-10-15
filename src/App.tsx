import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Upload from './components/Upload.tsx';
import Archive from './components/Archive.tsx';
import Compare from './components/Compare.tsx';
import Assistant from './components/Assistant.tsx';
import Onboarding from './components/Onboarding.tsx';
import Settings from './components/Settings.tsx';
import ShiftPlanner from './components/ShiftPlanner.tsx';
import LeavePlanner from './components/LeavePlanner.tsx';
import { View, Payslip, User, Shift, LeavePlan, Absence } from './types.ts';

// wrapper responsive
const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full min-h-[100dvh] overflow-x-hidden bg-gray-50 flex flex-col items-center">
    <div className="w-full max-w-[800px] flex-1 px-4 sm:px-6 py-4">{children}</div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const item = window.localStorage.getItem('payslip_user');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading user from localStorage', error);
      return null;
    }
  });

  const [payslips, setPayslips] = useState<Payslip[]>(() => {
    try {
      const item = window.localStorage.getItem('payslip_data');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const item = window.localStorage.getItem('payslip_shifts');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  const [leavePlans, setLeavePlans] = useState<LeavePlan[]>(() => {
    try {
      const item = window.localStorage.getItem('payslip_leave_plans');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  const [absences, setAbsences] = useState<Absence[]>(() => {
    try {
      const item = window.localStorage.getItem('payslip_absences');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(
    payslips.length > 0 ? payslips[0] : null
  );
  const [payslipsToCompare, setPayslipsToCompare] = useState<[Payslip, Payslip] | null>(null);
  const [alert, setAlert] = useState<string | null>(null);

  // salvataggi su localStorage
  useEffect(() => {
    if (user) window.localStorage.setItem('payslip_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem('payslip_data', JSON.stringify(payslips));
  }, [payslips]);

  useEffect(() => {
    window.localStorage.setItem('payslip_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    window.localStorage.setItem('payslip_leave_plans', JSON.stringify(leavePlans));
  }, [leavePlans]);

  useEffect(() => {
    window.localStorage.setItem('payslip_absences', JSON.stringify(absences));
  }, [absences]);

  // funzioni di gestione
  const handleAnalysisComplete = (newPayslip: Payslip) => {
    const namesMatch =
      user &&
      newPayslip.employee.firstName.trim().toLowerCase() === user.firstName.trim().toLowerCase() &&
      newPayslip.employee.lastName.trim().toLowerCase() === user.lastName.trim().toLowerCase();

    setSelectedPayslip(newPayslip);

    if (namesMatch) {
      const updated = [...payslips, newPayslip].sort((a, b) => {
        const dateA = new Date(a.period.year, a.period.month - 1);
        const dateB = new Date(b.period.year, b.period.month - 1);
        return dateB.getTime() - dateA.getTime();
      });
      setPayslips(updated);
      setAlert(null);
    } else {
      setAlert(
        'Attenzione: I dati anagrafici sulla busta paga non corrispondono al tuo profilo. Questa analisi è temporanea e non verrà salvata nell’archivio.'
      );
    }

    setCurrentView(View.Dashboard);
  };

  const handleSelectPayslipForDashboard = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setAlert(null);
    setCurrentView(View.Dashboard);
  };

  const handleCompare = (p: [Payslip, Payslip]) => {
    setPayslipsToCompare(p);
    setCurrentView(View.Compare);
  };

  const handleDeletePayslip = (id: string) => {
    const updated = payslips.filter((p) => p.id !== id);
    setPayslips(updated);
    if (selectedPayslip?.id === id)
      setSelectedPayslip(updated.length > 0 ? updated[0] : null);
  };

  const handleUpdateUser = (u: User) => setUser(u);

  const handleSaveShift = (s: Shift) => {
    setShifts((prev) => {
      const existing = prev.find((x) => x.date === s.date);
      if (existing) return prev.map((x) => (x.date === s.date ? { ...s, id: existing.id } : x));
      const i = prev.findIndex((x) => x.id === s.id);
      if (i !== -1) {
        const updated = [...prev];
        updated[i] = s;
        return updated;
      }
      return [...prev, s];
    });
    setAbsences((prev) => prev.filter((a) => a.date !== s.date));
  };

  const handleSaveLeavePlan = (p: LeavePlan) => {
    setLeavePlans((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i !== -1) {
        const updated = [...prev];
        updated[i] = p;
        return updated;
      }
      return [...prev, p];
    });
  };

  const handleSaveAbsence = (a: Absence) => {
    setAbsences((prev) => {
      const existing = prev.find((x) => x.date === a.date);
      if (existing) return prev.map((x) => (x.date === a.date ? { ...a, id: existing.id } : x));
      const i = prev.findIndex((x) => x.id === a.id);
      if (i !== -1) {
        const updated = [...prev];
        updated[i] = a;
        return updated;
      }
      return [...prev, a];
    });
    setShifts((prev) => prev.filter((s) => s.date !== a.date));
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard payslip={selectedPayslip} alert={alert} payslips={payslips} />;
      case View.Upload:
        return <Upload onAnalysisComplete={handleAnalysisComplete} />;
      case View.Archive:
        return (
          <Archive
            payslips={payslips}
            onSelectPayslip={handleSelectPayslipForDashboard}
            onCompare={handleCompare}
            onDeletePayslip={handleDeletePayslip}
          />
        );
      case View.Compare:
        return <Compare payslips={payslipsToCompare} />;
      case View.Assistant:
        return <Assistant payslips={payslips} mode="general" />;
      case View.ShiftPlanner:
        return (
          <ShiftPlanner
            shifts={shifts}
            onSave={handleSaveShift}
            absences={absences}
            onSaveAbsence={handleSaveAbsence}
          />
        );
      case View.LeavePlanner:
        return (
          <LeavePlanner
            leavePlans={leavePlans}
            onSave={handleSaveLeavePlan}
          />
        );
      case View.Settings:
        return <Settings user={user!} onSave={handleUpdateUser} />;
      default:
        return <Dashboard payslip={selectedPayslip} alert={alert} payslips={payslips} />;
    }
  };

  if (!user) return <Onboarding onSave={setUser} />;

  return (
    <PageContainer>
      <Layout user={user} currentView={currentView} setCurrentView={setCurrentView}>
        {renderView()}
      </Layout>
    </PageContainer>
  );
};

export default App;
