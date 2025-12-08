import React from 'react'
const Button = ({ 
  title, 
  icon, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      className={`btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {title}
    </button>
  );
};

export default Button;