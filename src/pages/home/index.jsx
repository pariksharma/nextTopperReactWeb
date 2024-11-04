import React, { useEffect, useState } from 'react'
import Header from '@/component/header/header'
import Banner from '@/component/banner/banner'
import TrendingCourses from '@/component/trendingCourses/trendingCourses'
import Free_Test_Course from '@/component/freeTest&Course/freeTest&Course'
import OurProduct from '@/component/ourProducts/ourProduct'
import Blogs from '@/component/currentAffair/currentAffair'
import Testimonial from '@/component/testimonial/testimonial'
import GetInTouch from '@/component/getInTouch/getInTouch'
import Footer from '@/component/footer/footer'
import { getCourse_Catergory_Service, getCourse_service, getCurrentAffair_service, getMyCourseService } from '@/services'
import { useSelector, useDispatch } from 'react-redux'
import { decrypt, get_token, encrypt, userLoggedIn } from '@/utils/helpers'
import { all_CategoryAction, all_CourseAction, all_CurrentAffair } from '@/store/sliceContainer/masterContentSlice'
import Achievement from '@/component/achievement/achievement'
import { useRouter } from 'next/router'

const index = () => {

  const [isLoggedIn, setIsLoggedIn] = useState('');
  const dispatch = useDispatch();
  const router = useRouter()

  useEffect(() => {
    const loggIn = userLoggedIn();
    if(loggIn) {
      setIsLoggedIn(loggIn)
    }
    else {
      setIsLoggedIn('');
    }
  }, [])


  useEffect(() => {
    // fetchContentData();
    fetchCourseData();
    fetchCurrentAffair();
    // window.scrollTo(0, 0)
    
    if(isLoggedIn) {
      fetchMyCourseService();
    }
  }, [isLoggedIn])


  

  const token = get_token()
  // const fetchContentData = async () => {
  //   try{  
  //     const formData = new FormData();
  //     const response_content_service = await getCourse_Catergory_Service(formData);
  //     console.log('bannerResponse', decrypt(response_content_service.data, token))
  //     const content_service_Data = decrypt(response_content_service.data, token)
  //     if(content_service_Data.status){
  //       dispatch(all_CategoryAction(content_service_Data.data))
  //     }
  //   } catch (error) {
  //     console.log("error found: ", error)
  //     // router.push('/')
  //   }
  // }

  const fetchCourseData = async () => {
    try{
      const formData = {
        'course_type':0,
        'page':1,
        'sub_cat':1,
        'main_cat':0
      }
      const response_getCourse_service = await getCourse_service(encrypt(JSON.stringify(formData),token));
      const response_getCourse_data = decrypt(response_getCourse_service.data, token)
      // console.log('course', response_getCourse_data)
      if(response_getCourse_data.status){
        dispatch(all_CourseAction(response_getCourse_data.data))
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  const fetchCurrentAffair = async () => {
    try{
      const formData = {}
      const response_getCurrentAffairs_service = await getCurrentAffair_service(encrypt(JSON.stringify(formData), token))
      // console.log('response_getCurrentAffairs_data', response_getCurrentAffairs_service)
      const response_getCurrentAffairs_data = decrypt(response_getCurrentAffairs_service.data, token);
      if(response_getCurrentAffairs_data.status){
        dispatch(all_CurrentAffair(response_getCurrentAffairs_data.data))
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  const fetchMyCourseService = async () => {
    try{
      const formData = {};
      const response_MyCourse_service = await getMyCourseService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_MyCourse_data = decrypt(
        response_MyCourse_service.data,
        token
      );
      // console.log('response_MyCourse_data', response_MyCourse_data)
      if (response_MyCourse_data.message == msg) {
        // toast.error(response_MyCourse_data.message);
        localStorage.removeItem("jwt");
        localStorage.removeItem("user_id");
        router.push("/");
      } else {
        // toast.error(response_MyCourse_data.message);
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };
  
  return (
    <>
        <Header />
        <Banner />
        <TrendingCourses />
        <Free_Test_Course />
        <OurProduct value = "product" />
        <Achievement />
        <Blogs />
        <Testimonial />
        <GetInTouch />
        <Footer />
    </>
  )
}

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default index