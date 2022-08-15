import React from 'react';
import Link from 'next/link';
import { Menu } from '../lib/interfaces';

interface MenuProps {
  menuItems: Menu[];
  children: JSX.Element;
}

const Footer: React.FC<MenuProps> = ({ menuItems, children }: MenuProps) => {
  const FooterMenu = () => (
    <nav className="flex flex-col max-w-lg mx-auto lg:max-w-screen-lg">
      <ul>
        {menuItems.map(({ label, path, id }) => {
          return (
            <li
              key={id}
              className="list-disc text-blue-300 hover:text-blue-100 ml-3"
            >
              <Link href={`/posts${path}`}>
                <a className="hover:underline focus:text-purple-600  active:text-purple-300">
                  {label}
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <footer className="w-full text-white bg-black p-4 mt-12">
      <FooterMenu />
      <div className="flex my-4 p-2">{children}</div>
    </footer>
  );
};

export default Footer;
