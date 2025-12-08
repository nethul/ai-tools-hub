'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return <>{children}</>;
};
