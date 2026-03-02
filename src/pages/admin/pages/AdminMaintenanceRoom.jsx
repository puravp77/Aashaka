import { useState, useEffect } from "react";
import { Truck, Activity, Save, Loader2, AlertCircle, Info } from "lucide-react";
import { useSettings } from "../../../context/SettingsContext";
import "./AdminPages.css";

export default function AdminMaintenanceRoom() {
    const { refreshSettings } = useSettings();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        shippingRates: {
            flatRate: 0,
            freeShippingThreshold: 0
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // 1. Try to load from localStorage first (most recent user changes)
                const localData = localStorage.getItem("aashaka_settings");
                if (localData) {
                    setSettings(JSON.parse(localData));
                    setFetching(false);
                    // Continue to sync from server in background if not static
                }

                // 2. Try server if not on static host
                if (!window.location.hostname.includes("github.io")) {
                    const response = await fetch("http://localhost:5000/settings");
                    if (response.ok) {
                        const data = await response.json();
                        setSettings(data);
                        localStorage.setItem("aashaka_settings", JSON.stringify(data));
                        return;
                    }
                }

                // 3. Fallback to public file if server fails or is static host
                if (!localData) {
                    const response = await fetch("/data/settings.json");
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Save to localStorage immediately
            localStorage.setItem("aashaka_settings", JSON.stringify(settings));

            // 2. Try to save to server if not on static host
            if (!window.location.hostname.includes("github.io")) {
                const response = await fetch("http://localhost:5000/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(settings)
                });

                if (!response.ok) throw new Error("Server save failed");
            }

            refreshSettings();
            alert("Settings updated successfully!");
        } catch (error) {
            console.error("Save error:", error);
            alert("Settings saved locally, but server update failed.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="adm-loading-state">
                <Loader2 className="adm-spinner" size={40} />
                <p>Loading configuration...</p>
            </div>
        );
    }

    return (
        <div className="adm-settings-container">
            <div className="adm-settings-grid">
                {/* Maintenance Mode Card */}
                <div className="adm-card adm-maint-card">
                    <div className="adm-card-head">
                        <div className="adm-card-icon" style={{ background: settings.maintenanceMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: settings.maintenanceMode ? '#ef4444' : '#10b981' }}>
                            <Activity size={20} />
                        </div>
                        <div>
                            <h3>Maintenance Mode</h3>
                            <p>Control public access to your store frontend.</p>
                        </div>
                    </div>

                    <div className="adm-card-body p-24 adm-maint-body">
                        <div className="adm-setting-row">
                            <div className="adm-setting-info">
                                <strong>Enable Maintenance Mode</strong>
                                <p>When active, customers will see a maintenance page and won't be able to browse or buy products.</p>
                            </div>
                            <label className="adm-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                />
                                <span className="adm-slider"></span>
                            </label>
                        </div>

                        {settings.maintenanceMode && (
                            <div className="adm-alert warning mt-16">
                                <AlertCircle size={18} />
                                <span>The website is currently hidden from the public. Only admins can view it.</span>
                            </div>
                        )}

                        {!settings.maintenanceMode && (
                            <div className="adm-alert info mt-16">
                                <Info size={18} />
                                <span>Maintenance mode is currently off. Customers can access the storefront normally.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Shipping Rates Card */}
                <div className="adm-card adm-shipping-card">
                    <div className="adm-card-head">
                        <div className="adm-card-icon adm-card-icon-primary-soft">
                            <Truck size={20} />
                        </div>
                        <div>
                            <h3>Shipping Rates</h3>
                            <p>Configure how much customers pay for delivery.</p>
                        </div>
                    </div>

                    <div className="adm-card-body p-24 adm-shipping-body">
                        <div className="adm-form-grid adm-shipping-grid">
                            <div className="adm-input-group">
                                <label>Standard Flat Rate (₹)</label>
                                <div className="adm-input-with-icon">
                                    <span className="adm-currency-prefix">₹</span>
                                    <input
                                        type="number"
                                        className="adm-input adm-input-with-currency"
                                        value={settings.shippingRates.flatRate}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            shippingRates: { ...settings.shippingRates, flatRate: parseFloat(e.target.value) || 0 }
                                        })}
                                    />
                                </div>
                                <span className="adm-input-hint">Applied to all orders below the free shipping threshold.</span>
                            </div>

                            <div className="adm-input-group">
                                <label>Free Shipping Threshold (₹)</label>
                                <div className="adm-input-with-icon">
                                    <span className="adm-currency-prefix">₹</span>
                                    <input
                                        type="number"
                                        className="adm-input adm-input-with-currency"
                                        value={settings.shippingRates.freeShippingThreshold}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            shippingRates: { ...settings.shippingRates, freeShippingThreshold: parseFloat(e.target.value) || 0 }
                                        })}
                                    />
                                </div>
                                <span className="adm-input-hint">Orders above this amount will have zero shipping cost.</span>
                            </div>
                        </div>

                        <div className="adm-alert info">
                            <Info size={18} />
                            <span>Setting the threshold to 0 will make all orders free shipping.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="adm-form-footer adm-settings-actions mt-24">
                <button
                    className="adm-btn primary adm-btn-min-w"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="adm-spinner" size={18} /> : <Save size={18} />}
                    <span>Save Configuration</span>
                </button>
            </div>
        </div>
    );
}
