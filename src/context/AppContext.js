import { createContext } from 'react';

export const AppContext = createContext(null);
export { AppProvider } from './AppProvider';
export { useApp } from './useApp';
