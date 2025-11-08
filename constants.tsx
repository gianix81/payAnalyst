import React from 'react';
import { View, User } from './types.ts';
import { HomeIcon, UploadIcon, ArchiveIcon, CompareIcon, AssistantIcon, SettingsIcon, ShiftIcon, LeaveIcon, AdminIcon } from './components/common/Icons.tsx';

const baseItems = [
    { id: View.Dashboard, label: 'Dashboard', icon: <HomeIcon /> },
    { id: View.Upload, label: 'Carica Busta Paga', icon: <UploadIcon /> },
    { id: View.Archive, label: 'Archivio', icon: <ArchiveIcon /> },
    { id: View.Compare, label: 'Confronta', icon: <CompareIcon /> },
    { id: View.Assistant, label: 'Assistente AI', icon: <AssistantIcon /> },
    { id: View.ShiftPlanner, label: 'Pianifica Turni', icon: <ShiftIcon /> },
    { id: View.LeavePlanner, label: 'Pianifica Ferie/ROL', icon: <LeaveIcon /> },
    { id: View.Settings, label: 'Impostazioni', icon: <SettingsIcon /> },
];

export const getNavItems = (user: User | null) => {
    if (user?.role === 'admin') {
        const adminItem = { id: View.AdminPanel, label: 'Pannello Admin', icon: <AdminIcon /> };
        // Inserisce il pannello admin dopo l'assistente AI
        const adminNavItems = [...baseItems];
        adminNavItems.splice(5, 0, adminItem);
        return adminNavItems;
    }
    return baseItems;
};