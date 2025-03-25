import React from 'react';

const Input = ({name,type,placeholder}) => {
    return (
        <input 
                type={type}
                name={name}
                placeholder={placeholder}
                className="w-full bg-[#a7a7a7] bg-opacity-20 border-2 outline-none border-[#0DF2FF] rounded-lg p-2 mb-4 text-white"
            />
    );
}

export default Input;
