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
        "After register and logging in go to the profile page and toggle the verify as seller button. The otp is sent to the number and enter the number and it will be verified. \n (Note: Make sure to register valid number) ",
    },
    {
      question: "How do I hire a freelancer?",
      answer:
        "Search for the service you need, browse through the freelancers' profiles, and select one that fits your requirements. You can then contact them directly to discuss your project through chat.",
    },
    {
      question: "What are the payment options?",
      answer:
        "We support payment options of Stripe for now . We have planned to add more payment options in the future.",
    },
    // {
    //   question: "Is there a service fee?",
    //   answer:
    //     "Yes, we charge a small service fee on each transaction to maintain the platform and provide customer support.",
    // },
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
