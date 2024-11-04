import React, { useState, useEffect } from 'react';
import VideoPlayerDRM from '@/component/player';
import { useRouter } from 'next/router';

const PlayId = () => {
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const router = useRouter();
    // console.log("router",router)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });

            const handleResize = () => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            };

            window.addEventListener('resize', handleResize);

            // Clean up the event listener on component unmount
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    useEffect(() => {
        // Check if router is ready
        if (router.isReady) {
            // Ensure to set loading to false when the router is ready
            setIsLoading(false);
        }
    }, [router.isReady]);

    const renderPlayer = () => {
        const videoType = parseInt(router?.query?.video_type);

        if (isLoading) {
            return <p>Loading...</p>; // Display loading state
        }

        switch (videoType) {
            case 7:
            case 8:
                return (
                    <VideoPlayerDRM
                        vdc_id={router?.query?.vdc_id}
                        NonDRMVideourl={router?.query?.file_url}
                        item={null}
                        title={router?.query?.title}
                        videoMetaData={null}
                        start_date={router.query.start_date}
                        end_date={router.query.end_date}
                        video_type={router.query.video_type}
                    />
                );
            case 1:
            case 4:
                return (
                    <iframe
                        id="youtubePlayer"
                        width={windowSize.width}
                        height={windowSize.height - 10}
                        src={`https://www.youtube.com/embed/${router?.query?.file_url}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                );
            default:
                return <p>No supported video format found.</p>;
        }
    };

    return (
        <>
            {renderPlayer()}
        </>
    );
};

export default PlayId;
