import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { User, Mail, Lock, Shield, Camera, Save, Key, UserCheck, Loader2 } from "lucide-react";
import "../../admin/AdminLayout.css";
import "./AdminPages.css";

export default function AdminProfile() {
    const { adminUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("profile"); // profile, security

    // Local state for the form, initialized from user context
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        role: "",
    });

    useEffect(() => {
        if (adminUser) {
            setFormData({
                username: adminUser.username || "Purav",
                email: adminUser.id || adminUser.email || "",
                role: adminUser.role || "Administrator",
            });
        }
    }, [adminUser]);

    const [securityData, setSecurityData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert("Profile updated successfully!");
        }, 1000);
    };

    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert("Password updated successfully!");
            setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }, 1000);
    };

    const userInitial = formData.username ? formData.username.charAt(0).toUpperCase() : "P";

    return (
        <div className="adm-profile-container">
            <div className="adm-profile-header">
                <div className="adm-profile-cover">
                    <div className="adm-cover-overlay"></div>
                </div>
                <div className="adm-profile-meta">
                    <div className="adm-profile-avatar-wrapper">
                        <div className="adm-profile-avatar">
                            {userInitial}
                        </div>
                        <button className="adm-avatar-edit" title="Change Avatar">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div className="adm-profile-info">
                        <h1>{formData.username}</h1>
                        <p><Shield size={14} /> {formData.role}</p>
                    </div>
                </div>
                <div className="adm-profile-tabs">
                    <button
                        className={`adm-profile-tab ${tab === "profile" ? "active" : ""}`}
                        onClick={() => setTab("profile")}
                    >
                        <User size={16} /> <span>Personal Info</span>
                    </button>
                    <button
                        className={`adm-profile-tab ${tab === "security" ? "active" : ""}`}
                        onClick={() => setTab("security")}
                    >
                        <Lock size={16} /> <span>Security Settings</span>
                    </button>
                </div>
            </div>

            <div className="adm-profile-content">
                {tab === "profile" ? (
                    <form className="adm-card adm-profile-form" onSubmit={handleProfileSubmit}>
                        <div className="adm-card-head">
                            <div className="adm-card-icon">
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <h3>Personal Information</h3>
                                <p>Update your personal details and how others see you.</p>
                            </div>
                        </div>

                        <div className="adm-form-grid">
                            <div className="adm-input-group">
                                <label>Display Name</label>
                                <div className="adm-input-with-icon">
                                    <User size={18} className="adm-field-icon" />
                                    <input
                                        type="text"
                                        className="adm-input has-icon"
                                        placeholder="Your Name"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="adm-input-group">
                                <label>Email Address</label>
                                <div className="adm-input-with-icon">
                                    <Mail size={18} className="adm-field-icon" />
                                    <input
                                        type="email"
                                        className="adm-input has-icon"
                                        value={formData.email}
                                        disabled
                                    />
                                </div>
                                <span className="adm-input-hint">Email cannot be changed directly for security.</span>
                            </div>

                            <div className="adm-input-group">
                                <label>Access Role</label>
                                <div className="adm-input-with-icon">
                                    <Shield size={18} className="adm-field-icon" />
                                    <input
                                        type="text"
                                        className="adm-input has-icon"
                                        value={formData.role}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="adm-form-footer">
                            <button type="submit" className="adm-btn primary" disabled={loading}>
                                {loading ? <Loader2 className="adm-spinner" size={18} /> : <Save size={18} />}
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="adm-card adm-profile-form" onSubmit={handleSecuritySubmit}>
                        <div className="adm-card-head">
                            <div className="adm-card-icon">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3>Security & Password</h3>
                                <p>Manage your account security and authentication methods.</p>
                            </div>
                        </div>

                        <div className="adm-form-grid">
                            <div className="adm-input-group">
                                <label>Current Password</label>
                                <div className="adm-input-with-icon">
                                    <Lock size={18} className="adm-field-icon" />
                                    <input
                                        type="password"
                                        className="adm-input has-icon"
                                        placeholder="Enter current password"
                                        value={securityData.currentPassword}
                                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="adm-divider"></div>

                            <div className="adm-input-group">
                                <label>New Password</label>
                                <div className="adm-input-with-icon">
                                    <Key size={18} className="adm-field-icon" />
                                    <input
                                        type="password"
                                        className="adm-input has-icon"
                                        placeholder="Minimum 8 characters"
                                        value={securityData.newPassword}
                                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="adm-input-group">
                                <label>Confirm New Password</label>
                                <div className="adm-input-with-icon">
                                    <Key size={18} className="adm-field-icon" />
                                    <input
                                        type="password"
                                        className="adm-input has-icon"
                                        placeholder="Re-type new password"
                                        value={securityData.confirmPassword}
                                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="adm-form-footer">
                            <button type="submit" className="adm-btn primary" disabled={loading}>
                                {loading ? <Loader2 className="adm-spinner" size={18} /> : <Shield size={18} />}
                                <span>Update Password</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
