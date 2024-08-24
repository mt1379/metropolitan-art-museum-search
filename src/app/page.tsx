'use client';

import { useState, useCallback } from "react";
import SearchBar from "@/app/components/SearchBar/SearchBar";
import { SearchResults } from "@/app/components/SearchResults/SearchResults";
import Head from 'next/head';

export default function Home() {
  const [searchResults, setSearchResults] = useState<{ total: number; objectIDs: number[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (query.trim().length === 0) {
        setSearchResults(null);
        return;
      }
      const response = await fetch(`/api/search/${encodeURIComponent(query.trim())}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setError('An error occurred while fetching results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      <Head>
        <title>The Metropolitan Museum of Art Search</title>
        <meta name="description" content="Search the Metropolitan Museum of Art collection" />
      </Head>
      <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-16 xl:p-24 bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="w-full max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">The Metropolitan Museum of Art</h1>
            <p className="text-xl text-gray-600">Explore the vast collection of art and artifacts</p>
          </header>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Search Our Collection</h2>
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="mt-8 w-full min-h-[50vh]">
            {isLoading && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            {!isLoading && !error && searchResults?.objectIDs && searchResults.objectIDs.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <SearchResults 
                  key={searchResults.objectIDs.join(',')} 
                  total={searchResults.total} 
                  objectIDs={searchResults.objectIDs} 
                />
              </div>
            )}
            {!isLoading && !error && searchResults && searchResults.total === 0 && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
                <p className="font-bold">No Results</p>
                <p>No results found. Try a different search term.</p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} The Metropolitan Museum of Art. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}