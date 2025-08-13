// LiveStreamCard.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from './ui/button';

export interface LiveStream {
  channel_name: string;
  logo: string;
  catagory: string; // API sends this as "catagory"
  url: string;
  license_key: string;
}

interface LiveStreamCardProps {
  stream: LiveStream;
}

const LiveStreamCard: FC<LiveStreamCardProps> = ({ stream }) => {
  const navigate = useNavigate();

  const handleWatchClick = () => {
    navigate(`/watch/live/${encodeURIComponent(stream.channel_name)}`, {
      state: { stream },
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="bg-card/30 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-accent/50 shadow-lg shadow-black/20 flex flex-col"
    >
      {/* Channel Logo */}
      <div className="relative w-full aspect-video flex items-center justify-center bg-black">
        <img
          src={stream.logo}
          alt={stream.channel_name}
          className="max-h-full max-w-full object-contain p-4"
          loading="lazy"
        />
        {/* Category Badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-accent/90 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">
            {stream.catagory}
          </span>
        </div>
      </div>

      {/* Channel Info */}
      <div className="p-4 flex flex-col">
        <h3 className="text-white font-semibold text-lg line-clamp-2">
          {stream.channel_name}
        </h3>

        {/* Watch Button */}
        <Button
          onClick={handleWatchClick}
          className="mt-3 w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Play className="w-4 h-4 mr-2" />
          Watch Live
        </Button>
      </div>
    </motion.div>
  );
};

export default LiveStreamCard;
