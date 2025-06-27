import React from 'react'
import { motion } from "framer-motion";

function BgParticles() {
  return (
    <>
    {/* Particle effect layer */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
            {[...Array(60)].map((_, i) => (
              <motion.div 
              key={i} 
              className="absolute w-2 h-2 bg-yellow-400 shadow-xl rounded-full filter blur-sm"
              initial={{
                opacity: 0, 
                scale: 0, 
                x: Math.random() * document.documentElement.scrollWidth, 
                y: Math.random() * document.documentElement.scrollHeight
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.4, 0.5],
                x: [Math.random() * document.documentElement.scrollWidth, Math.random() * document.documentElement.scrollWidth],
                y: [Math.random() * document.documentElement.scrollHeight, Math.random() * document.documentElement.scrollHeight],
              }}
              transition={{ duration: 3 + Math.random() * 5, repeat: Infinity }}
            />
            
            ))}
          </div></>
  )
}

export default BgParticles
