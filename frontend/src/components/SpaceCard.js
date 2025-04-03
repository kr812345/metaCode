
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import menu from '../../public/menu.svg';
import cardBg from '../../public/image.png';
import { useState } from 'react';

const SpaceCard = ({ title, id }) => {
    const [toggleMenu, setToggleMenu] = useState(false);
    const menuRef = useRef(null);

    const handleClick = () => {
        setToggleMenu(!toggleMenu);
    }

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setToggleMenu(false);
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
        <Link href={`/room`}>
            <div className="relative not-md:h-40 h-50 bg-[#FF007A] overflow-clip rounded-lg hover:shadow-[0px_0px_8px_rgba(13,242,255,1)] transition cursor-pointer border border-[#0DF2FF]">
                <div className=' w-full h-full '>
                    <Image src={cardBg} className='h-full object-cover' alt='spaceImage'/>
                </div>
                <div className="absolute justify-between w-full flex -mt-8 px-4 h-8">
                    <span className="text-[#0DF2FF] text-xs">Last active 2h ago</span>
                    <span className="text-white text-xs">3 members</span>
                </div>
            </div>
        </Link>
            <div className='relative flex justify-between items-center mt-1' ref={menuRef}>
                <h2 className="text-white text-md font-medium pl-2">{title}</h2>
                <Image src={menu} alt='menuIcon' onClick={handleClick}/>
                <div className={`absolute bg-[#0DF2FF] rounded-md right-5 ${!toggleMenu ? 'hidden' : ''}`}>
                    <ul className='p-2 text-white'>
                        <li className='hover:bg-gray-200 p-1 mb-1 rounded cursor-pointer border-[#ffffffa4] border '>Edit SpaceName</li>
                        <li className='hover:bg-gray-200 p-1 rounded cursor-pointer border-[#ffffffa4] border  text-red-500'>Delete Space</li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default SpaceCard;
