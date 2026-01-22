
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Box, Brain, Cpu, Share2, History } from 'lucide-react';

const milestones = [
  {
    year: "1995",
    title: "Shor's Algorithm",
    description: "Peter Shor demonstrates that quantum computers can factor large numbers exponentially faster than classical ones, sparking the field.",
    icon: <Share2 size={20} />
  },
  {
    year: "1998",
    title: "Toric Code",
    description: "Alexei Kitaev introduces topological quantum codes, laying the theoretical foundation for the surface code used today.",
    icon: <Box size={20} />
  },
  {
    year: "2012",
    title: "Surface Code Maturity",
    description: "The surface code becomes the leading candidate for error correction due to its high threshold and 2D neighbor-only connectivity.",
    icon: <CheckCircle size={20} />
  },
  {
    year: "2019",
    title: "Quantum Supremacy",
    description: "Google's Sycamore processor performs a calculation in 200 seconds that would take a supercomputer 10,000 years.",
    icon: <Cpu size={20} />
  },
  {
    year: "2023",
    title: "QEC Break-Even",
    description: "Researchers demonstrate that adding more qubits to a logical qubit can actually reduce the error rate, a key requirement for scaling.",
    icon: <Zap size={20} />
  },
  {
    year: "2024",
    title: "AlphaQubit",
    description: "DeepMind and Quantum AI introduce neural decoding, beating the standard algorithm by learning complex noise patterns directly from data.",
    icon: <Brain size={20} />
  }
];

export const Timeline: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 relative">
      {/* Central Line */}
      <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-stone-300 transform md:-translate-x-1/2" />

      <div className="flex flex-col gap-16">
        {milestones.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`flex flex-col md:flex-row items-start md:items-center gap-8 relative ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
          >
            {/* Content Side */}
            <div className={`flex-1 w-full md:w-auto ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'} pl-20 md:pl-0`}>
              <div className="group relative bg-white p-8 rounded-xl border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 hover:border-l-nobel-gold">
                <span className="text-nobel-gold font-bold font-serif text-2xl block mb-2">{item.year}</span>
                <h3 className="text-stone-900 font-bold text-xl mb-3 font-serif">{item.title}</h3>
                <p className="text-stone-600 text-base leading-relaxed">{item.description}</p>
                <div className="absolute top-4 right-4 text-stone-200 group-hover:text-nobel-gold/20 transition-colors">
                  <History size={24} />
                </div>
              </div>
            </div>

            {/* Center Node */}
            <div className="absolute left-[28px] md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-stone-900 border-4 border-[#F5F4F0] shadow-lg z-10 text-nobel-gold group-hover:scale-110 transition-transform duration-300">
               {item.icon}
            </div>

            {/* Empty Side for layout balance */}
            <div className="hidden md:block flex-1"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
