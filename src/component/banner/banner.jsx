import React, { useState, useCallback, lazy, Suspense } from 'react';
import Carousel from "react-bootstrap/Carousel";
import { bannerAry } from '../../../public/assets/sampleArry';
import CarouselItem from './carouselItem';
import { isValidData } from '@/utils/helpers';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

const Banner = () => {
    const [index, setIndex] = useState(0);
    const router = useRouter();
    const bannerData = useSelector((state) => state.allCategory?.allCategory?.banner_list_web)
    // console.log('bannerData123', bannerData)
    const courseType = useSelector((state) => state.allCategory?.allCategory?.course_type_master)
    // console.log('courseType', courseType)
    
    const status = isValidData(bannerData)
    const handleSelect = useCallback((selectedIndex) => {
        setIndex(selectedIndex);
    }, []);

    const handleBannerLinks = (value) => {
        // console.log(value)
        if(value.link_type == 2) {
            window.open(value.link, '_blank')
        }
        else if(value.link_type == 1) {
            router.push(`/view-courses/details/${":" + value.course_id + "&"+"parent:"}`)
        }
        else if(value.link_type == 3) {
            const ary = (courseType.filter(item => item.id == value.master_cat)[0])
            router.push(`/view-courses/${ary.name + ':' +ary.id}`)
        }
    }

    // console.log(courseType.filter(item => item.id == 27))


    return (
        <div className='banner_container'>
            <div className="row align-items-center ">
                <div className={`owl-carousel owl-theme owl_custom owl-loaded owl-drag `}>
                    <Carousel
                        controls={false}
                        activeIndex={index}
                        onSelect={handleSelect}
                        className="owl-theme owl_custom owl-loaded owl-drag result p-0"
                        data-bs-touch="false"
                    >   
                    {/* {console.log("BannerData",bannerData)} */}
                        {status && 
                            bannerData?.map((item, index) => (
                                <Carousel.Item key={index} onClick = {() => handleBannerLinks(item)} style={{cursor: 'pointer'}}>
                                    <CarouselItem value = {item.banner_url} />
                                </Carousel.Item>
                            ))
                        }
                    </Carousel>
                </div>
            </div>
        </div>
    );
}

export default Banner;
