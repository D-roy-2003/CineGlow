"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Calendar,
  Play,
  TrendingUp,
  X,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ShinyText from "@/components/ShinyText"
import TiltedCard from "@/components/TiltedCard"
import dynamic from "next/dynamic"
import { fetchRecommendations, fetchMovieDetailsGemini, fetchMovieDetailsTMDb, fetchFeaturedMoviesTMDb, fetchTrendingTodayTMDb, fetchTopRatedMoviesTMDb, fetchPopularTVShowsTMDb } from "@/lib/utils"
import Image from 'next/image';
import { useIsMobile } from "@/hooks/use-mobile";

// Demo data matching the reference images
const demoMovies = [
  {
    id: 1,
    title: "Avatar",
    year: "2009",
    genre: "Sci-Fi",
    rating: 7.6,
    type: "Movie",
    poster: "/placeholder.svg?height=400&width=300",
    description:
      "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
  },
  {
    id: 2,
    title: "The King of Staten Island",
    year: "2019",
    genre: "Comedy",
    rating: 7.8,
    type: "TV",
    poster: "/placeholder.svg?height=400&width=300",
    description:
      "A semi-biographical comedy-drama about a young man living with his mother and sister in Staten Island.",
  },
  {
    id: 3,
    title: "Avatar: The Last Airbender",
    year: "2006",
    genre: "Animation",
    rating: 5.9,
    type: "Movie",
    poster: "/placeholder.svg?height=400&width=300",
    description: "The story follows the adventures of Aang, a young successor to a long line of Avatars.",
  },
  {
    id: 4,
    title: "Avengers: Infinity War",
    year: "2018",
    genre: "Action",
    rating: 8.2,
    type: "Movie",
    poster: "/placeholder.svg?height=400&width=300",
    description:
      "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos.",
  },
  {
    id: 5,
    title: "Marvel Disk Wars: The Avengers",
    year: "2014",
    genre: "Animation",
    rating: 6.5,
    type: "TV",
    poster: "/placeholder.svg?height=400&width=300",
    description: "An animated series featuring the Avengers in a unique disk-based adventure.",
  },
  {
    id: 6,
    title: "LEGO Marvel Super Heroes: Avengers Reassembled",
    year: "2024",
    genre: "Animation",
    rating: 6.5,
    type: "Movie",
    poster: "/placeholder.svg?height=400&width=300",
    description: "The LEGO Avengers team up for another brick-building adventure.",
  },
]

// Add more featured movies data after the existing featuredMovie
const featuredMovies = [
  {
    id: 7,
    title: "Squid Game",
    year: "2021",
    genre: "Thriller",
    rating: 7.9,
    type: "TV Series",
    poster: "/placeholder.svg?height=600&width=400",
    description:
      "Hundreds of cash-strapped players accept a strange invitation to compete in children's games for a tempting prize, but the stakes are deadly.",
  },
  {
    id: 12,
    title: "Wednesday",
    year: "2022",
    genre: "Comedy",
    rating: 8.1,
    type: "TV Series",
    poster: "/placeholder.svg?height=600&width=400",
    description:
      "A coming-of-age supernatural mystery comedy horror series that follows Wednesday Addams as she navigates her years as a student at Nevermore Academy.",
  },
  {
    id: 13,
    title: "Stranger Things",
    year: "2016",
    genre: "Sci-Fi",
    rating: 8.7,
    type: "TV Series",
    poster: "/placeholder.svg?height=600&width=400",
    description:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
  },
  {
    id: 14,
    title: "The Crown",
    year: "2016",
    genre: "Drama",
    rating: 8.6,
    type: "TV Series",
    poster: "/placeholder.svg?height=600&width=400",
    description:
      "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the twentieth century.",
  },
  {
    id: 15,
    title: "Money Heist",
    year: "2017",
    genre: "Crime",
    rating: 8.2,
    type: "TV Series",
    poster: "/placeholder.svg?height=600&width=400",
    description:
      "An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.",
  },
  {
    id: 16,
    title: "Breaking Bad",
    year: "2008",
    genre: "Crime",
    rating: 9.5,
    type: "TV Series",
    poster: "/placeholder.svg?height=600&width=400",
    description:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family's future.",
  },
  {
    id: 17,
    title: "The Witcher",
    year: "2019",
    genre: "Fantasy",
    rating: 8.2,
    type: "TV Series",
    poster: "/placeholder.svg?height=600&width=400",
    description:
      "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
  },
  {
    id: 18,
    title: "Ozark",
    year: "2017",
    genre: "Crime",
    rating: 8.4,
    type: "TV Series",
    poster: "/placeholder.svg?height=600&width=400",
    description:
      "A financial advisor drags his family from Chicago to the Missouri Ozarks, where he must launder money to appease a drug boss.",
  },
  {
    id: 19,
    title: "Dark",
    year: "2017",
    genre: "Sci-Fi",
    rating: 8.8,
    type: "TV Series",
    poster: "/placeholder.svg?height=600&width=400",
    description:
      "A family saga with a supernatural twist, set in a German town, where the disappearance of two young children exposes the relationships among four families.",
  },
  {
    id: 20,
    title: "Bridgerton",
    year: "2020",
    genre: "Romance",
    rating: 7.3,
    type: "TV Series",
    poster: "/placeholder.svg?height=600&width=400",
    description:
      "Wealth, lust, and betrayal set in the backdrop of Regency era England, seen through the eyes of the powerful Bridgerton family.",
  },
]

// Create seamless loop by duplicating items
const extendedFeaturedMovies = [
  ...featuredMovies.slice(-2), // Last 2 items at the beginning
  ...featuredMovies,
  ...featuredMovies.slice(0, 2), // First 2 items at the end
]

const popularGenres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Animation"]
const trendingSearches = ["The Last of Us", "House of the Dragon", "Breaking Bad"]
const recentSearches = ["Game of Thrones", "Star Wars", "The Office"]

function HomePageComponent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [trendingToday, setTrendingToday] = useState<any[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<any[]>([]);
  const [topRatedStart, setTopRatedStart] = useState(0);
  const [popularTVShows, setPopularTVShows] = useState<any[]>([]);
  const [popularTVStart, setPopularTVStart] = useState(0);
  // Fetch featured movies from TMDb on mount
  useEffect(() => {
    fetchFeaturedMoviesTMDb(10).then(setFeaturedMovies);
  }, []);
  // Add auto-scroll for the new featured movie box
  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % featuredMovies.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [featuredMovies])
  useEffect(() => {
    fetchTrendingTodayTMDb(8).then(setTrendingToday);
    fetchTopRatedMoviesTMDb(8).then(setTopRatedMovies);
    fetchPopularTVShowsTMDb(8).then(setPopularTVShows);
  }, []);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery
    if (!searchTerm.trim()) return

    setIsLoading(true)
    setHasSearched(true)

    // Fetch recommendations from backend
    let movieNames: string[] = []
    try {
      movieNames = await fetchRecommendations(searchTerm, 5)
    } catch (e) {
      setSearchResults([])
      setIsLoading(false)
      return
    }
    // For each movie, fetch TMDb details in parallel
    const enriched = await Promise.all(
      movieNames.map(async (title) => {
        const details = await fetchMovieDetailsTMDb(title)
        return {
          id: title,
          title: details.title || title,
          year: details.year || "",
          rating: details.rating || 0,
          type: details.type || "Movie",
          poster: details.poster || "/placeholder.svg?height=400&width=300",
          description: "",
        }
      })
    )
    setSearchResults(enriched)
    setIsLoading(false)
  }

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query)
    handleSearch(query)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setHasSearched(false)
  }

  const filteredResults = searchResults.filter((movie) => {
    if (activeFilter === "All") return true
    if (activeFilter === "Movies") return movie.type === "Movie"
    if (activeFilter === "TV Shows") return movie.type === "TV"
    return true
  })

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-emerald-400"
    if (rating >= 7) return "text-amber-400"
    if (rating >= 6) return "text-orange-400"
    return "text-red-400"
  }

  const getRatingStars = (rating: number) => {
    const stars = Math.floor(rating / 2)
    const hasHalf = rating % 2 >= 1
    return { full: stars, half: hasHalf }
  }

  const isMobile = useIsMobile();
  const [trendingStart, setTrendingStart] = useState(0);
  const cardsPerRow = isMobile ? 2 : 4;
  const trendingLen = trendingToday.length;
  const trendingEnd = Math.min(trendingStart + cardsPerRow, trendingLen);
  const visibleTrending = trendingToday.slice(trendingStart, trendingEnd);
  // Touch/swipe handlers for mobile
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0 && trendingStart + cardsPerRow < trendingLen) {
        setTrendingStart(trendingStart + cardsPerRow);
      } else if (deltaX > 0 && trendingStart - cardsPerRow >= 0) {
        setTrendingStart(trendingStart - cardsPerRow);
      }
    }
    touchStartX.current = null;
  };

  const topRatedLen = topRatedMovies.length;
  const topRatedEnd = Math.min(topRatedStart + cardsPerRow, topRatedLen);
  const visibleTopRated = topRatedMovies.slice(topRatedStart, topRatedEnd);
  const popularTVLen = popularTVShows.length;
  const popularTVEnd = Math.min(popularTVStart + cardsPerRow, popularTVLen);
  const visiblePopularTV = popularTVShows.slice(popularTVStart, popularTVEnd);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      {/* Enhanced Header */}
      <header className="relative z-10 p-4 lg:p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Enhanced Logo */}
            <motion.a
              href="/"
              className="relative flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Zap className="w-7 h-7 text-white drop-shadow-lg" />
                  </motion.div>
                </div>
                <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl opacity-30 blur-lg"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <ShinyText
                text="CineGlow"
                speed={6}
                className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent ml-2"
              />
            </motion.a>
          </motion.div>

          <motion.div
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.a
              href="/"
              className="text-gray-300 hover:text-white transition-colors relative group"
              whileHover={{ scale: 1.05 }}
            >
              Home
              <motion.div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover:w-full transition-all duration-300" />
            </motion.a>
            <motion.a
              href="#"
              className="text-gray-300 hover:text-white transition-colors relative group"
              whileHover={{ scale: 1.05 }}
            >
              Search
              <motion.div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover:w-full transition-all duration-300" />
            </motion.a>
            <motion.a
              href="#"
              className="text-gray-300 hover:text-white transition-colors relative group"
              whileHover={{ scale: 1.05 }}
            >
              Favorites
              <motion.div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover:w-full transition-all duration-300" />
            </motion.a>
          </motion.div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 lg:px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Search Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative max-w-2xl mx-auto mb-6">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-xl" />
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search for movies & TV shows"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 pr-12 h-14 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 text-lg rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent backdrop-blur-sm"
                  />
                  {searchQuery && (
                    <motion.button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Enhanced Filter Tabs: Only show after search */}
            {hasSearched && (
              <div className="flex items-center justify-center gap-2 mb-6">
                {["All", "Movies", "TV Shows"].map((filter) => (
                  <motion.div key={filter} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setActiveFilter(filter)}
                      variant={activeFilter === filter ? "default" : "ghost"}
                      className={`px-6 py-3 rounded-full transition-all duration-300 ${
                        activeFilter === filter
                          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                          : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
                      }`}
                    >
                      {filter}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Search Results */}
          <AnimatePresence>
            {hasSearched && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Results for <span className="text-fuchsia-400">"{searchQuery}"</span>
                    </h2>
                    <p className="text-gray-400">
                      {isLoading ? "Searching..." : `${filteredResults.length} results found`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      Relevance
                    </Button>
                    <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={`p-2 ${viewMode === "grid" ? "bg-slate-700 text-white" : "text-gray-400"}`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={`p-2 ${viewMode === "list" ? "bg-slate-700 text-white" : "text-gray-400"}`}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="animate-pulse"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="bg-slate-800/50 rounded-2xl h-96" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}
                  >
                    {filteredResults.map((movie, index) => (
                      <Card
                        key={movie.id}
                        className="bg-gradient-to-b from-[#232a36] to-[#181c23] border border-[#2e3542] rounded-2xl shadow-none aspect-[2/3] flex flex-col justify-between p-0 relative overflow-hidden"
                      >
                        {/* Poster fills the card */}
                        {movie.poster && (
                          <Image
                            src={movie.poster}
                            alt={movie.title}
                            fill
                            className="object-cover"
                            priority={index < 8}
                          />
                        )}
                        {/* Overlay: badges, play icon, title, rating */}
                        <div className="absolute inset-0 flex flex-col justify-between z-10">
                          <div className="flex justify-between px-4 pt-4">
                            <span className="bg-fuchsia-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{movie.year}</span>
                            <span className={`${movie.type === "Movie" ? "bg-fuchsia-500" : "bg-cyan-500"} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                              {movie.type}
                            </span>
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <Play className="w-14 h-14 text-white/70" />
                          </div>
                          <div className="flex items-center justify-between px-4 pb-4">
                            <span className="font-bold text-white text-base drop-shadow">{movie.title}</span>
                            <span className="flex items-center gap-1 text-emerald-400 font-bold text-base drop-shadow">
                              <Star className="w-4 h-4 fill-current" />
                              {movie.rating}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Enhanced Featured Section with Auto-Scroll */}
          {/* REMOVE OLD FEATURED MOVIE BOX */}
          {/* NEW FEATURED MOVIE BOX */}
          {!hasSearched && (
            <section className="mb-12">
              <div className="relative w-full max-w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[340px]">
                {/* Poster on top for mobile, left for desktop */}
                <div className="w-full md:w-[340px] flex items-center justify-center bg-slate-800/60 min-h-[340px] order-1 md:order-2 p-4 md:p-0">
                  {featuredMovies.length > 0 && featuredMovies[currentFeaturedIndex].poster ? (
                    <img
                      src={featuredMovies[currentFeaturedIndex].poster}
                      alt={featuredMovies[currentFeaturedIndex].title}
                      className="object-cover rounded-2xl w-full max-w-xs md:w-[260px] md:h-[340px] shadow-xl border border-slate-700"
                    />
                  ) : (
                    <div className="object-cover rounded-2xl w-full max-w-xs md:w-[260px] md:h-[340px] bg-slate-700 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                {/* Details below poster on mobile, left on desktop */}
                <div className="flex-1 flex flex-col justify-center gap-4 md:gap-6 p-4 md:p-10 min-w-[0] order-2 md:order-1 items-center md:items-start text-center md:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-fuchsia-600 text-white text-sm px-3 py-1 rounded-full">{featuredMovies.length > 0 ? featuredMovies[currentFeaturedIndex].type : ''}</Badge>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">{featuredMovies.length > 0 ? featuredMovies[currentFeaturedIndex].title : ''}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-4 mb-2">
                    <span className="flex items-center gap-1 text-gray-300 text-base md:text-lg"><Calendar className="w-5 h-5" />{featuredMovies.length > 0 ? featuredMovies[currentFeaturedIndex].year : ''}</span>
                    <Badge className="bg-slate-700 text-gray-200 text-sm md:text-base px-3 py-1 rounded-full">{featuredMovies.length > 0 ? featuredMovies[currentFeaturedIndex].genre : ''}</Badge>
                    <span className="flex items-center gap-1 text-emerald-400 text-base md:text-lg font-semibold"><Star className="w-5 h-5" />{featuredMovies.length > 0 ? featuredMovies[currentFeaturedIndex].rating : ''}</span>
                  </div>
                  <p className="text-gray-200 text-base md:text-lg mb-2 md:mb-4 max-w-xl">{featuredMovies.length > 0 ? featuredMovies[currentFeaturedIndex].description : ''}</p>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-2 w-full justify-center md:justify-start">
                    <Button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-6 md:px-8 py-3 rounded-full text-base md:text-lg font-semibold flex items-center gap-2 shadow-lg"><Play className="w-5 h-5" /> Watch Now</Button>
                    <Button variant="ghost" className="bg-white/10 text-white px-6 md:px-8 py-3 rounded-full text-base md:text-lg font-semibold flex items-center gap-2 border border-slate-600 cursor-not-allowed opacity-60" disabled><Star className="w-5 h-5" /> Add to Favorites</Button>
                  </div>
                </div>
                {/* Carousel Controls */}
                <button
                  onClick={() => setCurrentFeaturedIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length)}
                  className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentFeaturedIndex((prev) => (prev + 1) % featuredMovies.length)}
                  className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                {/* Carousel Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {featuredMovies.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-3 h-3 rounded-full ${currentFeaturedIndex === idx ? 'bg-fuchsia-500' : 'bg-white/30'} transition-all`}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Enhanced Popular Genres */}
          {!hasSearched && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-violet-400" />
                Popular Genres
              </h3>
              <div className="flex flex-wrap gap-3">
                {popularGenres.map((genre, index) => (
                  <motion.button
                    key={genre}
                    onClick={() => handleQuickSearch(genre)}
                    className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm rounded-full text-gray-300 hover:text-white transition-all duration-300 border border-slate-700 hover:border-violet-500/50 flex items-center gap-2 shadow-lg hover:shadow-violet-500/10"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                  >
                    <Star className="w-4 h-4 text-fuchsia-400" />
                    {genre}
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Trending Today - now just below Popular Genres */}
          {!hasSearched && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <ShinyText text="Trending Today" speed={8} className="text-2xl font-bold text-white" />
                <Button variant="ghost" className="text-fuchsia-400 hover:text-fuchsia-300">
                  See All →
                </Button>
              </div>
              <div className="relative">
                {/* Left Arrow */}
                <button
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white disabled:opacity-40"
                  onClick={() => setTrendingStart(Math.max(0, trendingStart - cardsPerRow))}
                  disabled={trendingStart === 0}
                  aria-label="Previous"
                  style={{ display: trendingLen > cardsPerRow ? undefined : 'none' }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                {/* Trending Row as flexbox with smooth sliding */}
                <div
                  className="overflow-hidden"
                  onTouchStart={isMobile ? handleTouchStart : undefined}
                  onTouchEnd={isMobile ? handleTouchEnd : undefined}
                  style={{ width: isMobile ? 'calc(2 * 100% / 2 + 0.5rem)' : 'calc(4 * 100% / 4 + 1.5rem)' }}
                >
                  <div
                    className="flex gap-6 transition-transform duration-500"
                    style={{
                      transform: `translateX(-${(trendingStart / cardsPerRow) * 100}%)`,
                      willChange: 'transform',
                    }}
                  >
                    {trendingToday.map((movie: any, index: number) => (
                      <motion.div
                        key={movie.id}
                        className={
                          `flex-shrink-0 w-1/2 lg:w-1/4` // 2 per row mobile, 4 per row desktop
                        }
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                      >
                        <TiltedCard>
                          <Card
                            className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-700/50 transition-all duration-300 group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-violet-500/10 will-change-transform"
                            style={{ boxShadow: undefined }} // Remove any custom border/ring
                          >
                            <CardContent className="p-0">
                              <div className="aspect-[2/3] bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
                                {movie.poster && (
                                  <Image
                                    src={movie.poster}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                    priority={index < 8}
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <motion.div
                                  className="absolute inset-0 flex items-center justify-center"
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                  style={{ willChange: 'transform' }}
                                >
                                  <Play className="w-12 h-12 text-white/60 group-hover:text-white/80 transition-colors drop-shadow-lg" />
                                </motion.div>
                                <div className="absolute top-3 left-3">
                                  <Badge className="bg-fuchsia-500/90 text-white text-xs shadow-lg">{movie.year}</Badge>
                                </div>
                                <div className="absolute top-3 right-3">
                                  <Badge
                                    className={`${
                                      movie.type === "Movie" ? "bg-fuchsia-500/90 text-white" : "bg-cyan-500/90 text-white"
                                    } text-xs shadow-lg`}
                                  >
                                    {movie.type}
                                  </Badge>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3">
                                  <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{movie.title}</h4>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      {[...Array(4)].map((_, i) => (
                                        <motion.div
                                          key={i}
                                          className="w-2 h-1 bg-emerald-400 rounded-full"
                                          initial={{ scaleX: 0 }}
                                          animate={{ scaleX: 1 }}
                                          transition={{ delay: i * 0.1, duration: 0.3 }}
                                        />
                                      ))}
                                    </div>
                                    <div className={`flex items-center gap-1 ${getRatingColor(movie.rating)}`}> 
                                      <Star className="w-3 h-3 fill-current" />
                                      <span className="text-xs font-medium">{movie.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TiltedCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* Right Arrow */}
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white disabled:opacity-40"
                  onClick={() => setTrendingStart(Math.min(trendingLen - cardsPerRow, trendingStart + cardsPerRow))}
                  disabled={trendingStart + cardsPerRow >= trendingLen}
                  aria-label="Next"
                  style={{ display: trendingLen > cardsPerRow ? undefined : 'none' }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.section>
          )}

          {/* Top Rated Movies Section */}
          {!hasSearched && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <ShinyText text="Top Rated Movies" speed={8} className="text-2xl font-bold text-white" />
              </div>
              <div className="relative">
                {/* Left Arrow */}
                <button
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white disabled:opacity-40"
                  onClick={() => setTopRatedStart(Math.max(0, topRatedStart - cardsPerRow))}
                  disabled={topRatedStart === 0}
                  aria-label="Previous"
                  style={{ display: topRatedLen > cardsPerRow ? undefined : 'none' }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                {/* Carousel Row */}
                <div
                  className="overflow-hidden"
                  style={{ width: isMobile ? 'calc(2 * 100% / 2 + 0.5rem)' : 'calc(4 * 100% / 4 + 1.5rem)' }}
                  onTouchStart={isMobile ? handleTouchStart : undefined}
                  onTouchEnd={isMobile ? (e) => {
                    // Copy swipe logic for this carousel
                    if (touchStartX.current === null) return;
                    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
                    if (Math.abs(deltaX) > 50) {
                      if (deltaX < 0 && topRatedStart + cardsPerRow < topRatedLen) {
                        setTopRatedStart(topRatedStart + cardsPerRow);
                      } else if (deltaX > 0 && topRatedStart - cardsPerRow >= 0) {
                        setTopRatedStart(topRatedStart - cardsPerRow);
                      }
                    }
                    touchStartX.current = null;
                  } : undefined}
                >
                  <div
                    className="flex gap-6 transition-transform duration-500"
                    style={{
                      transform: `translateX(-${(topRatedStart / cardsPerRow) * 100}%)`,
                      willChange: 'transform',
                    }}
                  >
                    {topRatedMovies.map((movie: any, index: number) => (
                      <motion.div
                        key={movie.id}
                        className={
                          `flex-shrink-0 w-1/2 lg:w-1/4`
                        }
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                      >
                        <TiltedCard>
                          <Card
                            className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-700/50 transition-all duration-300 group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-violet-500/10 will-change-transform"
                            style={{ boxShadow: undefined }}
                          >
                            <CardContent className="p-0">
                              <div className="aspect-[2/3] bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
                                {movie.poster && (
                                  <Image
                                    src={movie.poster}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                    priority={index < 8}
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <motion.div
                                  className="absolute inset-0 flex items-center justify-center"
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                  style={{ willChange: 'transform' }}
                                >
                                  <Play className="w-12 h-12 text-white/60 group-hover:text-white/80 transition-colors drop-shadow-lg" />
                                </motion.div>
                                <div className="absolute top-3 left-3">
                                  <Badge className="bg-fuchsia-500/90 text-white text-xs shadow-lg">{movie.year}</Badge>
                                </div>
                                <div className="absolute top-3 right-3">
                                  <Badge className="bg-fuchsia-500/90 text-white text-xs shadow-lg">{movie.type}</Badge>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3">
                                  <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{movie.title}</h4>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      {[...Array(4)].map((_, i) => (
                                        <motion.div
                                          key={i}
                                          className="w-2 h-1 bg-emerald-400 rounded-full"
                                          initial={{ scaleX: 0 }}
                                          animate={{ scaleX: 1 }}
                                          transition={{ delay: i * 0.1, duration: 0.3 }}
                                        />
                                      ))}
                                    </div>
                                    <div className={`flex items-center gap-1 ${getRatingColor(movie.rating)}`}> 
                                      <Star className="w-3 h-3 fill-current" />
                                      <span className="text-xs font-medium">{movie.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TiltedCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* Right Arrow */}
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white disabled:opacity-40"
                  onClick={() => setTopRatedStart(Math.min(topRatedLen - cardsPerRow, topRatedStart + cardsPerRow))}
                  disabled={topRatedStart + cardsPerRow >= topRatedLen}
                  aria-label="Next"
                  style={{ display: topRatedLen > cardsPerRow ? undefined : 'none' }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.section>
          )}

          {/* Popular TV Shows Section */}
          {!hasSearched && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <ShinyText text="Popular TV Shows" speed={8} className="text-2xl font-bold text-white" />
              </div>
              <div className="relative">
                {/* Left Arrow */}
                <button
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white disabled:opacity-40"
                  onClick={() => setPopularTVStart(Math.max(0, popularTVStart - cardsPerRow))}
                  disabled={popularTVStart === 0}
                  aria-label="Previous"
                  style={{ display: popularTVLen > cardsPerRow ? undefined : 'none' }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                {/* Carousel Row */}
                <div
                  className="overflow-hidden"
                  style={{ width: isMobile ? 'calc(2 * 100% / 2 + 0.5rem)' : 'calc(4 * 100% / 4 + 1.5rem)' }}
                  onTouchStart={isMobile ? handleTouchStart : undefined}
                  onTouchEnd={isMobile ? (e) => {
                    // Copy swipe logic for this carousel
                    if (touchStartX.current === null) return;
                    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
                    if (Math.abs(deltaX) > 50) {
                      if (deltaX < 0 && popularTVStart + cardsPerRow < popularTVLen) {
                        setPopularTVStart(popularTVStart + cardsPerRow);
                      } else if (deltaX > 0 && popularTVStart - cardsPerRow >= 0) {
                        setPopularTVStart(popularTVStart - cardsPerRow);
                      }
                    }
                    touchStartX.current = null;
                  } : undefined}
                >
                  <div
                    className="flex gap-6 transition-transform duration-500"
                    style={{
                      transform: `translateX(-${(popularTVStart / cardsPerRow) * 100}%)`,
                      willChange: 'transform',
                    }}
                  >
                    {popularTVShows.map((movie: any, index: number) => (
                      <motion.div
                        key={movie.id}
                        className={
                          `flex-shrink-0 w-1/2 lg:w-1/4`
                        }
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                      >
                        <TiltedCard>
                          <Card
                            className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-700/50 transition-all duration-300 group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-violet-500/10 will-change-transform"
                            style={{ boxShadow: undefined }}
                          >
                            <CardContent className="p-0">
                              <div className="aspect-[2/3] bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
                                {movie.poster && (
                                  <Image
                                    src={movie.poster}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                    priority={index < 8}
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <motion.div
                                  className="absolute inset-0 flex items-center justify-center"
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                  style={{ willChange: 'transform' }}
                                >
                                  <Play className="w-12 h-12 text-white/60 group-hover:text-white/80 transition-colors drop-shadow-lg" />
                                </motion.div>
                                <div className="absolute top-3 left-3">
                                  <Badge className="bg-cyan-500/90 text-white text-xs shadow-lg">{movie.year}</Badge>
                                </div>
                                <div className="absolute top-3 right-3">
                                  <Badge className="bg-cyan-500/90 text-white text-xs shadow-lg">{movie.type}</Badge>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3">
                                  <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{movie.title}</h4>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      {[...Array(4)].map((_, i) => (
                                        <motion.div
                                          key={i}
                                          className="w-2 h-1 bg-emerald-400 rounded-full"
                                          initial={{ scaleX: 0 }}
                                          animate={{ scaleX: 1 }}
                                          transition={{ delay: i * 0.1, duration: 0.3 }}
                                        />
                                      ))}
                                    </div>
                                    <div className={`flex items-center gap-1 ${getRatingColor(movie.rating)}`}> 
                                      <Star className="w-3 h-3 fill-current" />
                                      <span className="text-xs font-medium">{movie.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TiltedCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* Right Arrow */}
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white disabled:opacity-40"
                  onClick={() => setPopularTVStart(Math.min(popularTVLen - cardsPerRow, popularTVStart + cardsPerRow))}
                  disabled={popularTVStart + cardsPerRow >= popularTVLen}
                  aria-label="Next"
                  style={{ display: popularTVLen > cardsPerRow ? undefined : 'none' }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.section>
          )}

          {/* Enhanced Trending Searches */}
          {!hasSearched && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-fuchsia-400" />
                  Trending Searches
                </h3>
                <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 shadow-lg">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  POPULAR NOW
                </Badge>
              </div>
              <div className="space-y-3">
                {trendingSearches.map((search, index) => (
                  <motion.button
                    key={search}
                    onClick={() => handleQuickSearch(search)}
                    className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm rounded-2xl text-left transition-all duration-300 border border-slate-700 hover:border-violet-500/50 group shadow-lg hover:shadow-violet-500/10"
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {index + 1}
                      </motion.div>
                      <span className="text-white font-medium">{search}</span>
                    </div>
                    <TrendingUp className="w-5 h-5 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Enhanced Recent Searches */}
          {!hasSearched && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Recent Searches</h3>
                <Button variant="ghost" className="text-fuchsia-400 hover:text-fuchsia-300">
                  Clear All
                </Button>
              </div>
              <div className="space-y-3">
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={search}
                    onClick={() => handleQuickSearch(search)}
                    className="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-700/50 backdrop-blur-sm rounded-2xl text-left transition-all duration-300 border border-slate-700/50 hover:border-slate-600 group shadow-lg"
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <Search className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
                      <span className="text-gray-300 group-hover:text-white transition-colors">{search}</span>
                    </div>
                    <X className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  )
}

export default dynamic(() => Promise.resolve(HomePageComponent), { ssr: false })
