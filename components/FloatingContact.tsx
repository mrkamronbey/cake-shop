"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Phone } from "lucide-react";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Telegram",
      href: "https://t.me/sweetcake_uz",
      icon: <Send className="w-4 h-4" />,
      bg: "bg-sky-500",
    },
    {
      label: "+998 90 123 45 67",
      href: "tel:+998901234567",
      icon: <Phone className="w-4 h-4" />,
      bg: "bg-emerald-500",
    },
  ];

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <>
            {links.map((l, i) => (
              <motion.a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.9 }}
                transition={{ duration: 0.18, delay: i * 0.05 }}
                className={`${l.bg} text-white flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold hover:opacity-90 transition-opacity`}
              >
                {l.icon}
                {l.label}
              </motion.a>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        className="w-14 h-14 rounded-full bg-salmon-500 text-white shadow-xl flex items-center justify-center cursor-pointer hover:bg-salmon-600 transition-colors"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
