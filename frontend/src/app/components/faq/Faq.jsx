"use client";
import "./Faq.css";
import React, { useState } from "react";

const faqData = {
  faqs: [
    {
      question: "What is this platform?",
      answer:
        "This platform connects freelancers with clients looking for various services such as web development, graphic design, content writing, and more.",
    },
    {
      question: "How do I register as a freelancer?",
      answer:
        "Click on the 'Sign Up' button on the homepage, fill in your details, and select 'Freelancer' during the registration process.",
    },
    {
      question: "How do I hire a freelancer?",
      answer:
        "Search for the service you need, browse through the freelancers' profiles, and select one that fits your requirements. You can then contact them directly to discuss your project.",
    },
    {
      question: "What are the payment options?",
      answer:
        "We support various payment options including credit cards, PayPal, and bank transfers. Payments are processed securely through our platform.",
    },
    {
      question: "Is there a service fee?",
      answer:
        "Yes, we charge a small service fee on each transaction to maintain the platform and provide customer support.",
    },
  ],
};

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <div className="flex flex-col items-center mb-5">
        <p className="text-4xl">Frequently Asked Questions</p>
        <hr className="border-4 border-black w-[520px] transform -skew-x-12 mt-2" />
      </div>

      {faqData.faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <div
            className={`faq-question ${activeIndex === index ? "active" : ""}`}
            onClick={() => toggleAccordion(index)}
          >
            {faq.question}
            <span className="faq-icon">
              {activeIndex === index ? "-" : "+"}
            </span>
          </div>
          {activeIndex === index && (
            <div className="faq-answer">{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Faq;
