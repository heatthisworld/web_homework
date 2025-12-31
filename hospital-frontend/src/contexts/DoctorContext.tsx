import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchDoctors, type DoctorSummary } from '../services/patientService';

interface DoctorContextType {
  doctors: DoctorSummary[];
  loading: boolean;
  error: string;
  refreshDoctors: () => Promise<void>;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDoctors();
      setDoctors(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDoctors();
  }, [refreshDoctors]);

  return (
    <DoctorContext.Provider value={{ doctors, loading, error, refreshDoctors }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) throw new Error('useDoctor must be used within DoctorProvider');
  return context;
};