import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchSingleton } from "../utils/api";

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

            const [settingsData, contentData] = await Promise.all([
                fetchSingleton("settings"),
                fetchSingleton("content"),
            ]);

            if (settingsData) {
                setSettings(settingsData);
                localStorage.setItem("aashaka_settings", JSON.stringify(settingsData));
            }

            if (contentData) {
                setContent(contentData);
                localStorage.setItem("admin_content_config", JSON.stringify(contentData));
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
