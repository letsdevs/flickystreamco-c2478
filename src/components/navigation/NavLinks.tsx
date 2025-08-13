
import { Link, useLocation } from 'react-router-dom';

const NavLinks = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movie' },
    { name: 'TV Shows', path: '/tv' },
    { name: 'Sports', path: '/sports' },
    { name: 'LiveTv', path: '/live' },
    { name: 'Trending', path: '/trending' },
  ];

  return (
    <nav className="hidden md:flex space-x-6">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`text-sm transition-colors hover:text-white ${
            isActive(link.path) ? 'text-white font-medium' : 'text-white/70'
          }`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
};

export default NavLinks;
