import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/resources.css";

function Resources({ getEmailFromToken }) {
    const guidelines = [
        {
            id: 1,
            title: "Stay Hydrated",
            description: "Drink plenty of water before donating blood to avoid dizziness.",
            icon: "💧",
        },
        {
            id: 2,
            title: "Eat a Healthy Meal",
            description: "Eat a balanced meal before donating. Avoid fatty foods.",
            icon: "🍎",
        },
        {
            id: 3,
            title: "Bring Your ID",
            description: "Always carry a valid ID for verification at donation centers.",
            icon: "🆔",
        },
        {
            id: 4,
            title: "Avoid Alcohol",
            description: "Refrain from consuming alcohol at least 24 hours before donation.",
            icon: "🚫🍺",
        },
        {
            id: 5,
            title: "Rest After Donation",
            description: "Avoid strenuous activities and rest for a few hours after donating.",
            icon: "🛏️",
        },
    ];

    const faqs = [
        {
            question: "Who can donate blood?",
            answer: "Anyone aged 18–65, weighing over 50kg, and in good health can donate blood.",
        },
        {
            question: "How often can I donate blood?",
            answer: "You can donate blood every 56 days, or every 8 weeks.",
        },
        {
            question: "Does blood donation hurt?",
            answer: "You may feel a slight pinch during insertion, but it is generally painless.",
        },
        {
            question: "How long does blood donation take?",
            answer: "The entire process takes about an hour, but the actual donation lasts 10–15 minutes.",
        },
    ];

    return (
        <div className="resources">

            {/* Guidelines section */}
            <div className="guidelines-container">
                <div className="guidelines-cards-container">
                    {guidelines.map((card) => (
                        <div key={card.id} className="guidelines-card">
                            <div className="card-icon">{card.icon}</div>
                            <h3>{card.title}</h3>
                            <p>{card.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQs Section */}
            <section className="faq-section">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-container">
                    {faqs.map((faq, index) => (
                        <div key={index} className="faq-card">
                            <h3>{faq.question}</h3>
                            <p>{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Resources;
