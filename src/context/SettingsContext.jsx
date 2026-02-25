import { createContext, useContext, useState, useEffect, useCallback } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        shippingRates: {
            flatRate: 50,
            freeShippingThreshold: 1000,
        },
    });

    const [content, setContent] = useState({
        heroHeading: "Timeless Jewellery, Modern Grace",
        heroSubtitle: "Discover curated pieces crafted to elevate every day.",
        ctaLabel: "Explore Collection",
        ctaLink: "/jewellery/oxidised",
    });

    const refreshSettings = useCallback(async () => {
        try {
            // 1. Settings from localStorage
            const localSettings = localStorage.getItem("aashaka_settings");
            if (localSettings) setSettings(JSON.parse(localSettings));

            // 2. Content from localStorage
            const localContent = localStorage.getItem("admin_content_config");
            if (localContent) setContent(JSON.parse(localContent));

            // 3. Try Server
            if (!window.location.hostname.includes("github.io")) {
                const [setRes, conRes] = await Promise.all([
                    fetch("http://localhost:5000/settings"),
                    fetch("http://localhost:5000/content")
                ]);

                if (setRes.ok) {
                    const data = await setRes.json();
                    setSettings(data);
                    localStorage.setItem("aashaka_settings", JSON.stringify(data));
                }
                if (conRes.ok) {
                    const data = await conRes.json();
                    setContent(data);
                    localStorage.setItem("admin_content_config", JSON.stringify(data));
                }
            } else {
                // Static Fallback
                const res = await fetch("/data/settings.json");
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            }
        } catch (err) {
            console.error("Failed to load configuration:", err);
        }
    }, []);

    useEffect(() => {
        refreshSettings();
    }, [refreshSettings]);

    return (
        <SettingsContext.Provider value={{ settings, content, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
