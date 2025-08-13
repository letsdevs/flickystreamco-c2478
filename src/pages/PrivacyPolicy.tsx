import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Import ArtPlayer CSS via CDN in your index.html or ensure it's included
// <link rel="stylesheet" href="https://unpkg.com/artplayer/dist/artplayer.css" />

const LiveTV = () => {
  const [channels, setChannels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const playerRef = useRef(null);
  const artPlayerInstance = useRef(null);

  const API_TOKEN = '9a0568ad9d3b07a7f6e45af5b79dbd1b';
  const BASE_URL = 'https://letsembed.cc/API/LiveTv/';

  // Fetch channels (either all or search results)
  const fetchChannels = async (query = '', pageNum = 1) => {
    try {
      const url = query
        ? `${BASE_URL}?api=search&name=${encodeURIComponent(query)}&token=${API_TOKEN}&page=${pageNum}`
        : `${BASE_URL}?api=all&token=${API_TOKEN}&page=${pageNum}`;
      const response = await fetch(url);
      const data = await response.json();
      setChannels(data.items || []);
      setTotalPages(Math.ceil(data.total / 10)); // Assuming 10 items per page
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  // Initialize ArtPlayer when a channel is selected
  const initializePlayer = (channel) => {
    if (artPlayerInstance.current) {
      artPlayerInstance.current.destroy();
    }

    if (typeof window.Artplayer === 'undefined') {
      console.error('ArtPlayer not loaded');
      return;
    }

    artPlayerInstance.current = new window.Artplayer({
      container: playerRef.current,
      url: channel.m3u8,
      type: 'm3u8',
      poster: channel.logo,
      title: channel.name,
      autoSize: true,
      playbackRate: true,
      aspectRatio: true,
      screenshot: true,
      setting: true,
      pip: true,
      fullscreen: true,
      controls: true,
    });
  };

  // Load channels on mount and when page or search query changes
  useEffect(() => {
    fetchChannels(searchQuery, page);
  }, [searchQuery, page]);

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchChannels(searchQuery, 1);
  };

  // Handle channel selection
  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
    initializePlayer(channel);
  };

  // Pagination controls
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <AnimatePresence mode="wait">
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-4xl glass">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Live TV</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search for a channel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <Button type="submit">Search</Button>
              </div>
            </form>

            {/* Player Section */}
            {selectedChannel && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{selectedChannel.name}</h3>
                <div
                  ref={playerRef}
                  className="w-full aspect-video bg-black"
                  style={{ maxHeight: '500px' }}
                ></div>
              </div>
            )}

            {/* Channel List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => handleChannelClick(channel)}
                >
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-full h-24 object-contain mb-2"
                  />
                  <h4 className="text-lg font-medium">{channel.name}</h4>
                  <p className="text-sm text-white/60">{channel.category.join(', ')}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center">
              <Button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="disabled:opacity-50"
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatePresence>
  );
};

export default PrivacyPolicy;
