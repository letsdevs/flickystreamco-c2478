import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import LiveStreamCard from '@/components/LiveStreamCard';
import PageTransition from '@/components/PageTransition';
import { useCategories, useChannels } from '@/hooks/use-live-streams';

export interface LiveStream {
  channel_name: string;
  logo: string;
  catagory: string;
  url: string;
  license_key: string;
}

const LiveStreams = () => {
  const [activeTab, setActiveTab] = useState<string>('dangal');

  // Fetch categories
  const { data: categories, isLoading: loadingCats, isError: catsError, error: catsErr, refetch: refetchCats } = useCategories();

  // Fetch channels for the active category
  const { data: channels, isLoading: loadingChans, isError: chansError, error: chansErr, refetch: refetchChans } = useChannels(activeTab);

  // Handle manual refresh
  const handleRefresh = () => {
    toast({
      title: 'Refreshing channels',
      description: `Fetching the latest channels for ${activeTab}...`
    });
    refetchCats();
    refetchChans();
  };

  return (
    <PageTransition>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Live TV Channels</h1>
            <p className="text-gray-400 mt-2">
              {categories ? `${categories.length} categories available` : 'Loading categories...'}
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            className="flex items-center gap-2"
            disabled={loadingCats || loadingChans}
          >
            <RefreshCw className={`h-4 w-4 ${(loadingCats || loadingChans) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {catsError || chansError ? (
          <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Failed to load data</h2>
            <p className="text-gray-400 mb-4 max-w-md">
              {catsErr instanceof Error ? catsErr.message : chansErr instanceof Error ? chansErr.message : 'An unexpected error occurred. Please try again.'}
            </p>
            <Button onClick={handleRefresh} variant="destructive">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <Tabs 
              defaultValue={activeTab} 
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="bg-background/30 backdrop-blur-sm">
                {loadingCats
                  ? <span className="text-gray-400 px-4">Loading categories...</span>
                  : categories?.map((category) => (
                      <TabsTrigger 
                        key={category} 
                        value={category}
                        className="capitalize"
                      >
                        {category}
                      </TabsTrigger>
                    ))
                }
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {loadingChans ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div 
                        key={i}
                        className="bg-card/30 animate-pulse rounded-lg h-[320px]"
                      ></div>
                    ))}
                  </div>
                ) : channels && channels.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {channels.map((stream) => (
                      <LiveStreamCard key={stream.channel_name} stream={stream} />
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-400">No channels available for this category.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default LiveStreams;
