import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchCurrentPatientDetails, type PatientDetails } from '../services/patientService';

interface PatientContextType {
  patient: PatientDetails | null;
  loading: boolean;
  error: string;
  refreshPatient: () => Promise<void>;
  updateLocalPatient: (updates: Partial<PatientDetails>) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode; debugMode: boolean }> = ({ children, debugMode }) => {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshPatient = useCallback(async () => {
    if (debugMode) return;
    
    try {
      setLoading(true);
      const data = await fetchCurrentPatientDetails();
      setPatient(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [debugMode]);

  const updateLocalPatient = useCallback((updates: Partial<PatientDetails>) => {
    setPatient(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  useEffect(() => {
    refreshPatient();
  }, [refreshPatient]);

  return (
    <PatientContext.Provider value={{ patient, loading, error, refreshPatient, updateLocalPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) throw new Error('usePatient must be used within PatientProvider');
  return context;
};