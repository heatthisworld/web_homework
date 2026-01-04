import React, { useState, useEffect } from "react";
import "./patient.css";
import { usePatient } from "../../contexts/PatientContext";
import { cancelRegistration } from "../../services/patientService";

// Toast 提示组件
interface ToastProps {
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ type, title, message, onClose, duration = 3000 }) => {
    const [isHiding, setIsHiding] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsHiding(true);
            setTimeout(onClose, 300);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    return (
        <div className={`toast toast-${type} ${isHiding ? 'hiding' : ''}`}>
            <div className="toast-icon">{icons[type]}</div>
            <div className="toast-content">
                <div className="toast-title">{title}</div>
                <div className="toast-message">{message}</div>
            </div>
        </div>
    );
};

// 确认模态框组件
interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'primary';
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
                                                       isOpen, title, message, onConfirm, onCancel, confirmText = "确定", cancelText = "取消", type = 'primary', isLoading = false
                                                   }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-modal-header">
                    <div className="confirm-modal-icon">{type === 'danger' ? '⚠️' : '❓'}</div>
                    <h4>{title}</h4>
                </div>
                <div className="confirm-modal-body">{message}</div>
                <div className="confirm-modal-footer">
                    <button className="confirm-modal-btn" onClick={onCancel} disabled={isLoading}>{cancelText}</button>
                    <button className={`confirm-modal-btn ${type}`} onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? "处理中..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RecordsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"registration" | "medical">("registration");
    const { patient, loading, error, refreshPatient } = usePatient();
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    // Toast 状态
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title: string; message: string } | null>(null);

    // 确认取消模态框状态
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);

    const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
        setToast({ type, title, message });
    };

    const registrationRecords = patient?.visitHistory
        .filter((v) => v.status !== "cancelled")
        .map((v) => ({
            id: v.id,
            department: v.department || "-",
            doctor: v.doctor || "-",
            date: v.appointmentTime?.split("T")[0] || "-",
            time: v.appointmentTime?.split("T")[1]?.slice(0, 5) || "-",
            status: v.status === "completed" ? "已就诊" : "待就诊",
            recordId: `REG-${v.id}`
        })) || [];

    const medicalRecords = patient?.medicalHistory.map((m) => ({
        id: m.id,
        department: "-",
        doctor: m.doctor || "-",
        date: m.visitDate?.split("T")[0] || "-",
        diagnosis: m.diagnosis || "-",
        medications: m.medications || []
    })) || [];

    const handleCancelClick = (id: number) => {
        setPendingCancelId(id);
        setShowCancelConfirm(true);
    };

    const handleCancelConfirm = async () => {
        if (!pendingCancelId) return;

        setCancellingId(pendingCancelId);
        setShowCancelConfirm(false);

        try {
            await cancelRegistration(pendingCancelId);
            await refreshPatient();
            showToast('success', '取消成功', '挂号已成功取消');
        } catch (err) {
            showToast('error', '取消失败', err instanceof Error ? err.message : "取消失败");
        } finally {
            setCancellingId(null);
            setPendingCancelId(null);
        }
    };

    const handleCancelCancel = () => {
        setShowCancelConfirm(false);
        setPendingCancelId(null);
    };

    if (loading) return <div className="records-page patient-page"><div className="announcement-item">正在加载，请稍候...</div></div>;

    return (
        <div className="records-page patient-page">
            <h3>我的记录</h3>
            {error && <div className="error-message">{error}</div>}

            {/* Toast 提示 */}
            {toast && (
                <div className="toast-container">
                    <Toast
                        type={toast.type}
                        title={toast.title}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}

            <div className="internal-tabs">
                <div className={`internal-tab ${activeTab === "registration" ? "active" : ""}`} onClick={() => setActiveTab("registration")}>挂号记录</div>
                <div className={`internal-tab ${activeTab === "medical" ? "active" : ""}`} onClick={() => setActiveTab("medical")}>病历记录</div>
            </div>

            {activeTab === "registration" && (
                <div className="registration-records">
                    {registrationRecords.length ? registrationRecords.map((record) => (
                        <div key={record.id} className="record-item">
                            <div className="record-header">
                                <div className="record-department">{record.department}</div>
                                <div className="record-status">{record.status}</div>
                            </div>
                            <div className="record-content">
                                <p><strong>医生:</strong> {record.doctor}</p>
                                <p><strong>时间:</strong> {record.date} {record.time}</p>
                                <p><strong>挂号ID:</strong> {record.recordId}</p>
                            </div>
                            {record.status === "待就诊" && (
                                <button
                                    className="cancel-btn"
                                    onClick={() => handleCancelClick(record.id)}
                                    disabled={cancellingId === record.id}
                                >
                                    {cancellingId === record.id ? "取消中..." : "取消挂号"}
                                </button>
                            )}
                        </div>
                    )) : <div className="no-records">暂无挂号记录</div>}
                </div>
            )}

            {activeTab === "medical" && (
                <div className="medical-records">
                    {medicalRecords.length ? medicalRecords.map((record) => (
                        <div key={record.id} className="record-item">
                            <div className="record-header">
                                <div className="record-department">{record.department}</div>
                                <div className="record-date">{record.date}</div>
                            </div>
                            <div className="record-content">
                                <p><strong>医生:</strong> {record.doctor}</p>
                                <p><strong>诊断:</strong> {record.diagnosis}</p>
                                <p><strong>用药:</strong> {record.medications.join(", ")}</p>
                            </div>
                        </div>
                    )) : <div className="no-records">暂无病历记录</div>}
                </div>
            )}

            {/* 确认取消模态框 */}
            <ConfirmModal
                isOpen={showCancelConfirm}
                title="确认取消挂号"
                message="确定要取消这个挂号吗？此操作不可恢复。"
                onConfirm={handleCancelConfirm}
                onCancel={handleCancelCancel}
                confirmText="确定取消"
                cancelText="再想想"
                type="danger"
                isLoading={cancellingId !== null}
            />
        </div>
    );
};

export default RecordsPage;