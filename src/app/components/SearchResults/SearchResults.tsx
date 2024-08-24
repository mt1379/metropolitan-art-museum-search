import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageModal } from '../ImageModal/ImageModal';

interface SearchResultsProps {
    total: number;
    objectIDs: number[];
}

interface ArtObject {
    objectID: number;
    title: string;
    primaryImage: string;
    primaryImageSmall: string;
    additionalImages: string[];
    artistDisplayName: string;
    objectDate: string;
    medium: string;
    dimensions: string;
    department: string;
    culture: string;
}

export const SearchResults = ({ total, objectIDs }: SearchResultsProps) => {
    const [loadedItems, setLoadedItems] = useState<ArtObject[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const loaderRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState<ArtObject | null>(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    const loadMoreItems = useCallback(async () => {
        if (loading || currentIndex >= objectIDs.length) return;

        setLoading(true);
        const itemsToLoad = objectIDs.slice(currentIndex, currentIndex + 10);
        const newItems = await Promise.all(
            itemsToLoad.map(async (id) => {
                const response = await fetch(`/api/object/${id}`);
                return response.json();
            })
        );

        setLoadedItems(prev => [...prev, ...newItems]);
        setCurrentIndex(prev => prev + 10);
        setLoading(false);
    }, [loading, currentIndex, objectIDs]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    loadMoreItems();
                }
            },
            { threshold: 0.85 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [loadMoreItems, loading]);

    useEffect(() => {
        setLoadedItems([]);
        setCurrentIndex(0);
        loadMoreItems();
    }, [objectIDs]);

    const handleImageClick = (item: ArtObject) => {
        if (item.primaryImage || (item.additionalImages && item.additionalImages.length > 0)) {
            setScrollPosition(window.pageYOffset);
            setSelectedItem(item);
        }
    };

    return (
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Search Results (Total: {total})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loadedItems.map((item, index) => (
                    <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
                        <div 
                            className={`relative h-48 sm:h-64 ${(item.primaryImage || item.additionalImages?.length > 0) ? 'cursor-pointer' : ''}`} 
                            onClick={() => handleImageClick(item)}
                        >
                            {item.primaryImageSmall && item.primaryImageSmall !== '/placeholder-image.jpg' ? (
                                <img 
                                    src={item.primaryImageSmall} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">No image available</span>
                                </div>
                            )}
                            {item.additionalImages && item.additionalImages.length > 0 && (
                                <div className="absolute bottom-2 right-2 bg-white bg-opacity-75 px-2 py-1 rounded text-sm">
                                    +{item.additionalImages.length} more
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <h3 className="font-bold text-xl mb-2 text-gray-800 line-clamp-2" title={item.title || 'Untitled'}>{item.title || 'Untitled'}</h3>
                            <div className="flex-grow">
                                {item.artistDisplayName && (
                                    <p className="text-gray-600 mb-2">{item.artistDisplayName}</p>
                                )}
                                {item.objectDate && (
                                    <p className="text-sm text-gray-500 mb-1">Date: {item.objectDate}</p>
                                )}
                                {item.medium && (
                                    <p className="text-sm text-gray-500 mb-1">Medium: {item.medium}</p>
                                )}
                                {item.dimensions && (
                                    <p className="text-sm text-gray-500 mb-1">Dimensions: {item.dimensions}</p>
                                )}
                                {item.department && (
                                    <p className="text-sm text-gray-500 mb-1">Department: {item.department}</p>
                                )}
                                {item.culture && (
                                    <p className="text-sm text-gray-500">Culture: {item.culture}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {objectIDs.length > 0 && currentIndex < objectIDs.length && (
                <div ref={loaderRef} className="text-center py-8">
                    {loading ? (
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                    ) : (
                        <p className="text-gray-600">Scroll for more</p>
                    )}
                </div>
            )}
            {selectedItem && (
                <ImageModal
                    images={[selectedItem.primaryImage, ...selectedItem.additionalImages].filter(Boolean)}
                    title={selectedItem.title}
                    onClose={() => {
                        setSelectedItem(null);
                        window.scrollTo(0, scrollPosition);
                    }}
                />
            )}
        </div>
    );
};
