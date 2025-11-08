import { db } from './firebase.ts';
import { collection, addDoc, deleteDoc, doc, setDoc, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { Payslip, Shift, LeavePlan, Absence, User } from '../types.ts';

const USERS = 'users';
const PAYSLIPS = 'payslips';
const SHIFTS = 'shifts';
const LEAVE_PLANS = 'leave_plans';
const ABSENCES = 'absences';

// User
export const getUserProfile = async (uid: string) => {
    const userDoc = await getDoc(doc(db, USERS, uid));
    return userDoc.exists() ? userDoc.data() as User : null;
};

export const saveUserProfile = (uid: string, user: Omit<User, 'uid'>) => {
    return setDoc(doc(db, USERS, uid), user, { merge: true });
};

// Payslips
export const addPayslip = (uid: string, payslip: Payslip) => {
    // Rimuoviamo l'ID dal corpo del documento, dato che Firestore lo gestisce.
    const { id, ...payslipData } = payslip;
    return addDoc(collection(db, USERS, uid, PAYSLIPS), payslipData);
};

export const deletePayslip = (uid: string, payslipId: string) => {
    return deleteDoc(doc(db, USERS, uid, PAYSLIPS, payslipId));
};

export const getPayslips = (uid: string, callback: (payslips: Payslip[]) => void) => {
    const q = query(collection(db, USERS, uid, PAYSLIPS), orderBy('period.year', 'desc'), orderBy('period.month', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const payslips = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Payslip));
        callback(payslips);
    });
};

// Shifts
export const saveShift = (uid: string, shift: Shift) => {
    return setDoc(doc(db, USERS, uid, SHIFTS, shift.id), shift, { merge: true });
};
export const deleteShift = (uid: string, shiftId: string) => {
    return deleteDoc(doc(db, USERS, uid, SHIFTS, shiftId));
};
export const getShifts = (uid: string, callback: (shifts: Shift[]) => void) => {
    const q = query(collection(db, USERS, uid, SHIFTS));
    return onSnapshot(q, (snapshot) => {
        const shifts = snapshot.docs.map(doc => doc.data() as Shift);
        callback(shifts);
    });
};

// Absences
export const saveAbsence = (uid: string, absence: Absence) => {
    return setDoc(doc(db, USERS, uid, ABSENCES, absence.id), absence, { merge: true });
};
export const deleteAbsence = (uid: string, absenceId: string) => {
    return deleteDoc(doc(db, USERS, uid, ABSENCES, absenceId));
};
export const getAbsences = (uid: string, callback: (absences: Absence[]) => void) => {
     const q = query(collection(db, USERS, uid, ABSENCES));
    return onSnapshot(q, (snapshot) => {
        const absences = snapshot.docs.map(doc => doc.data() as Absence);
        callback(absences);
    });
};

// Leave Plans
export const saveLeavePlan = (uid: string, plan: LeavePlan) => {
    return setDoc(doc(db, USERS, uid, LEAVE_PLANS, plan.id), plan, { merge: true });
};
export const deleteLeavePlan = (uid: string, planId: string) => {
    return deleteDoc(doc(db, USERS, uid, LEAVE_PLANS, planId));
};
export const getLeavePlans = (uid: string, callback: (plans: LeavePlan[]) => void) => {
     const q = query(collection(db, USERS, uid, LEAVE_PLANS), orderBy('startDate', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const plans = snapshot.docs.map(doc => doc.data() as LeavePlan);
        callback(plans);
    });
};