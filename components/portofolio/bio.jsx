import React, { useState } from 'react'
import Image from 'next/image'
import BioBackground from "@/public/doodle items.png"
import Person from "@/public/Group 62.png"

const Bio = ({ Bio }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Determine if text is long enough to need "Read More"
  const isLongText = Bio && Bio.length > 300
  const displayText = isLongText && !isExpanded ? Bio.substring(0, 500) + '...' : Bio

  return (
    <div className="flex flex-col md:flex-row w-full  items-center justify-center text-white px-4 md:px-8">
      
      {/* Left Text Section */}
      <div className="w-full md:w-1/2 p-4 md:p-8 lg:p-12 flex flex-col justify-center items-center order-2 md:order-1">
        <div className="max-w-2xl w-full space-y-6">
          {/* Static Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left">
            About <span className='text-[#00ADB5]'>me</span>
          </h1>
          
          {/* Bio Content */}
          <div className="space-y-4">
            <div className="text-base md:text-lg text-gray-300 leading-relaxed text-center md:text-left">
              {displayText}
            </div>
            
            {/* Read More Button */}
            {isLongText && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#00ADB5] hover:text-[#00ADB5]/80 font-medium text-sm md:text-base transition-colors duration-200"
              >
                {isExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Right Image Section */}
      <div className="w-full md:w-1/2 relative h-[400px] md:h-[500px] lg:h-[600px] order-1 md:order-2 flex items-center justify-center">
        {/* Container for both images */}
        <div className="relative w-full h-full max-w-lg mx-auto">
          {/* Background Doodle */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <div className="relative w-full h-4/5 md:h-full">
              <Image 
                src={BioBackground} 
                alt="doodle background" 
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          
          {/* Person Image - Overlapping */}
          <div className="absolute inset-0 flex items-center justify-center">
                <div 
      className="absolute inset-0 flex items-center justify-center"
      style={{
        animation: 'float 6s ease-in-out infinite'
      }}
    >
      <div className="relative w-4/5 md:w-3/4 h-4/5 group-hover:scale-105 transition-transform duration-500">        
        <Image 
          src={Person} 
          alt="person" 
          fill
          className="object-contain drop-shadow-2xl relative z-10"
          priority
          sizes="(max-width: 768px) 80vw, 40vw"
        />
        
        </div>
    </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default Bio;