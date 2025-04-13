import React from 'react';

const Button = ({handle,text,type}) => {
    return (
        <button 
                onClick={handle}
                type={type} 
                className="bg-[#FF007A] border-2 border-pink-600 shadow-md text-white mx-auto rounded-lg px-6 py-2 hover:bg-[#ff7aba] transition
            ">
                {text}
        </button>
    );
}

export default Button;
