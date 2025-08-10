import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMovieDetails } from "../api/tmdb";
import ReviewSection from "../components/ReviewSection";
import TrailerSection from "../components/TrailerSection";
import CastSection from "../components/CastSection";
import SimilarMoviesSection from "../components/SimilarMoviesSection";
import RecommendationsSection from "../components/RecommendationsSection";

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "trailers" | "cast" | "reviews"
  >("overview");

  useEffect(() => {
    if (id) {
      getMovieDetails(id).then(setMovie);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "reviews" && id) {
      // Remove any existing Disqus embed to prevent duplicates
      const oldScript = document.querySelector(
        'script[src*="disqus.com/embed.js"]'
      );
      if (oldScript) oldScript.remove();

      // Configure Disqus
      (window as any).disqus_config = function () {
        this.page.url = window.location.href;
        this.page.identifier = `movie-${id}`;
      };

      // Append Disqus embed script
      const d = document,
        s = d.createElement("script");
      s.src = "https://cinepapa.disqus.com/embed.js";
      s.setAttribute("data-timestamp", Date.now().toString());
      (d.head || d.body).appendChild(s);
    }
  }, [activeTab, id]);

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-white mb-6">{movie.title}</h1>

      {/* Tabs */}
      <div className="flex mb-6">
        {["overview", "trailers", "cast", "reviews"].map((tab) => (
          <button
            key={tab}
            className={`mr-4 px-4 py-2 rounded ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="text-white">{movie.overview}</div>
      )}

      {activeTab === "trailers" && <TrailerSection mediaId={parseInt(id!)} />}

      {activeTab === "cast" && <CastSection mediaId={parseInt(id!)} />}

      {activeTab === "reviews" && (
        <div className="space-y-8">
          <ReviewSection mediaId={parseInt(id!)} mediaType="movie" />

          {/* Disqus Comments */}
          <div id="disqus_thread" className="mt-8"></div>
        </div>
      )}

      {/* Similar & Recommendations */}
      <SimilarMoviesSection mediaId={parseInt(id!)} />
      <RecommendationsSection mediaId={parseInt(id!)} />
    </div>
  );
};

export default MovieDetailsPage;
