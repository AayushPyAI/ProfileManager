"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Globe, Github, Linkedin, PhoneCall, Twitter, Home, User, Send, Globe2 } from "lucide-react";
import Image from "next/image";
import Background from "@/public/Group 2372.png";
import { HeaderTag } from "./Cards";
import {useForm ,  ValidationError } from "@formspree/react";

// Smooth scroll function
const scrollToSection = (id) => {
  if (typeof window !== "undefined") {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
};

const ContactPage = ({ profile }) => {
  const {github, linkedin, twitter, website } = profile.personal;

  return (
    <div id="contact" className="min-h-screen w-full px-6 py-12 space-y-20">

      {/* SECTION: HEADER */}
      <section id="contact" className="max-w-4xl mx-auto">
        <HeaderTag
          title="Connect with me!"
          subtitle="Got a Project In Mind?"
          icon={<PhoneCall />}
        />

        {/* Contact Layout */}
        <div className="flex flex-col md:flex-row w-full justify-between mt-10">
          
          {/* LEFT IMAGE */}
               
          <div className="w-full md:w-1/2 flex justify-center">
                <div 
      className="inset-0 flex items-center justify-center animate-bounce"
      style={{
        animation: 'float 6s ease-in-out infinite'
      }}
    >
            <Image src={Background} width={255} height={348} alt="Contact Illustration"  /></div>
          </div>

          {/* RIGHT FORM */}
          <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center">
            <SimpleContactForm  profileName={profile.personal.name}/>
          </div>
        </div>
      </section>

      {/* SECTION: FOOTER */}
      <section className="justify-center" id="footer">
        <footer className="w-full py-10 rounded-xl">
          <div className="max-w-5xl mx-auto flex flex-col items-center relative">

            {/* Vertical Divider */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-px bg-white/10" />

            {/* Navigation */}
            <nav className="flex items-center gap-10 text-gray-300 mb-8 relative z-10">
              <button
                onClick={() => scrollToSection("home")}
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Home size={18} /> Home
              </button>

              <button
                onClick={() => scrollToSection("about")}
                className="flex items-center gap-2 hover:text-white transition"
              >
                <User size={18} /> About me
              </button>

              <button
                onClick={() => scrollToSection("contact")}
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Phone size={18} /> Contact
              </button>
            </nav>

            {/* Social Icons */}
            <div className="flex items-center gap-6 mb-10 relative z-10">
              {twitter && <SocialIcon icon={<Twitter size={16} />} url={twitter} />}
              {github && <SocialIcon icon={<Github size={16} />} url={github} />}
              {linkedin && <SocialIcon icon={<Linkedin size={16}/>} url={linkedin} />}
              {website && <SocialIcon icon = {<Globe size={16}/>} url={website}/>}
            </div>
          </div>
        </footer>
      </section>

    </div>
  );
};

export default ContactPage;


function SimpleContactForm({ profileName }) {
const FormId = process.env.NEXT_PUBLIC_FORM_ID;
  const [state, handleSubmit] = useForm(FormId);
  const [message, setMessage] = useState("");

  if (state.succeeded) {
    return (
      <p className="text-green-400 text-sm">Message sent successfully!</p>
    );
  }

  return (
    <form onSubmit={(e) => {
        e.preventDefault();

        const fullMessage = `Hi! This is the query for ${profileName}\n\n${message}`;

        const formData = new FormData(e.target);
        formData.set("message", fullMessage);
        handleSubmit(formData);
      }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-white">Your name</label>
            <input
              name="name"
              type="text"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-[#2D333B] text-white outline-none border border-transparent focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white">Your email</label>
            <input
              name="email"
              id="email"
              type="email"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-[#2D333B] text-white outline-none border border-transparent focus:border-teal-500"
              required
            />
        <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>
       </div>
        <div>
          <label className="text-sm text-white">Your Message</label>
          <textarea
            name="message"
            id="message"
            rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            className="w-full mt-1 px-4 py-3 rounded-xl bg-[#2D333B] text-white outline-none border border-transparent focus:border-teal-500 resize-none"
            required
          />
        <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>

      <button
        type="submit"
        disabled={state.submitting}
          className="flex items-center gap-2 bg-[#00ADB5] text-white px-6 py-3 rounded-full text-sm hover:bg-teal-600 transition">
        {state.submitting ? "Sending..." : "Send Message"} <Send className="w-4 h-4" />
        </button>
      </form>
  );
}


function SocialIcon({ icon, url }) {
  const handleClick = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="
        w-10 h-10 rounded-full 
        bg-white/5 
        text-gray-300 
        flex items-center justify-center
        hover:bg-white/10 hover:text-white 
        transition
      "
      aria-label="social-link"
    >
      {icon}
    </button>
  );
}
