import React from "react";
import { motion } from "framer-motion";

export function Modal({ open, onClose, children, title }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-md shadow-lg w-full max-w-lg p-6 z-10">
                {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
                {children}
            </motion.div>
        </div>
    );
}
