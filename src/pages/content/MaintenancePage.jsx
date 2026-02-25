import React from 'react';
import { Hammer, Mail, Phone, Clock } from 'lucide-react';
import './MaintenancePage.css';

const MaintenancePage = () => {
    return (
        <div className="maintenance-container">
            <div className="maintenance-glass-card">
                <div className="maintenance-icon-wrapper">
                    <Hammer className="hammer-icon" size={48} />
                </div>

                <h1 className="maintenance-title">Under Maintenance</h1>
                <p className="maintenance-description">
                    We're currently making some improvements to Aashaka to provide you with a better shopping experience.
                    We'll be back online shortly!
                </p>

                <div className="maintenance-details">
                    <div className="detail-item">
                        <Clock size={20} />
                        <span>Expected back: Soon</span>
                    </div>
                </div>

                <div className="maintenance-footer">
                    <h3>Need to reach us?</h3>
                    <div className="contact-links">
                        <a href="mailto:support@aashaka.com" className="contact-item">
                            <Mail size={18} />
                            <span>Email</span>
                        </a>
                        <a href="tel:+919106618331" className="contact-item">
                            <Phone size={18} />
                            <span>Call</span>
                        </a>
                    </div>
                </div>
            </div>

            <div className="maintenance-bg-decor">
                <div className="decor-orb orb-1"></div>
                <div className="decor-orb orb-2"></div>
            </div>
        </div>
    );
};

export default MaintenancePage;
