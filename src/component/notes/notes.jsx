import React, { useEffect, useRef, useState } from "react";
import Button1 from "../buttons/button1/button1";
import { getMasterDataService } from "@/services";
import { IoIosArrowForward } from "react-icons/io";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import LoginModal from "../modal/loginModal";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  all_tabName,
  reset_tab,
} from "@/store/sliceContainer/masterContentSlice";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import LoaderAfterLogin from "../loaderAfterLogin";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import TileDetail from "./tileDetail";

const Notes = ({
  propsValue,
  tabName,
  resetRef,
  courseDetail,
  CourseID,
  keyValue,
  onlineCourseAry,
}) => {
  // console.log("keyValue",onlineCourseAry)

  const [modalShow, setModalShow] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isToasterOpen, setIsToasterOpen] = useState(false);
  const [data3, setData3] = useState('');
  const [title3, setTitle3] = useState('');
  const [status, setStatus] = useState("");
  const [layer1Data, setLayer1Data] = useState();
  const [showLayer, setShowLayer] = useState("layer1");
  const [data3Index, setData3Index] = useState(1);
  const [layer3updateData, setLayer3updateData] = useState([]);
  const [layer2List, setLayer2List] = useState();
  const [layer1Index, setLayer1Index] = useState();
  const [layer2Index, setLayer2Index] = useState();
  const [layer3Data, setLayer3Data] = useState();
  const [id, setId] = useState();
  const [breadcrumbData, setBreadcrumbData] = useState("");
  const [breadcrumbData2, setBreadcrumbData2] = useState("");
  const [BaseURL, setBaseURL] = useState("");
  const [page, setPage] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [checkLogin, setCheckLogin] = useState("");

  useEffect(() => {}, [checkLogin]);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const router = useRouter();
  const dispatch = useDispatch();
  let displayTabData = useSelector((state) => state.allCategory?.tabName);
  const versionData = useSelector((state) => state.allCategory?.versionData);
  const popupRef = useRef(null);
  const intervalRef = useRef(null);
  // console.log('versionData', versionData)
  useEffect(() => {
    let domain = localStorage.getItem("domain");
    if (process.env.NEXT_PUBLIC_TEST_URL) {
      setBaseURL(process.env.NEXT_PUBLIC_TEST_URL);
    } else {
      setBaseURL(domain.split(",")[0]);
    }
  }, []);

  useEffect(() => {
    const token = router.asPath;
    // console.log("token", token);
    setCheckLogin(token.startsWith("/private/myProfile"));
  }, []);

  // console.log('BaseURL', BaseURL)
  // let domain = localStorage.getItem('domain')
  // const BaseURL = process.env.NEXT_PUBLIC_TEST_URL ? process.env.NEXT_PUBLIC_TEST_URL : domain.split(',')[0]
  // console.log('domain', domain.split(',')[0])

  useEffect(() => {
    if (isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false);
      }, 1500);
    }
  }, [isToasterOpen]);

  useEffect(() => {
    // console.log("courseDetail 21",courseDetail)
    if (courseDetail) {
      setLayer1Data(courseDetail);
    }
  }, [courseDetail]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // console.log('tabsssss', displayTabData)

  const handleShowData = async () => {
    // if(courseDetail?.revert_api == "1#2#0#0" || courseDetail?.revert_api == "0#2#0#0"){
    //   await getLayer3Data(displayTabData?.index)
    // }
    // // await setLayer1()
    // // console.log('uuuuuuuu', showLayer)
    dispatch(reset_tab());
  };

  // useEffect(() => {
  //   setData3Index(1);
  //   setLayer3updateData([])
  //   if(displayTabData.layer) {
  //     handleShowData()
  //   }
  //   else{
  //     // let revertAPi =  layer1Data?.revert_api
  //     console.log("layer11111",keyValue,  courseDetail?.revert_api)
  //     if(courseDetail?.revert_api == "1#0#0#0" || courseDetail?.revert_api == "0#0#0#0" || "0#0#0#1"){
  //       setShowLayer("layer1");
  //       // return () => setShowLayer("layer1");
  //     }
  //     else if(courseDetail?.revert_api == "1#1#0#0" || courseDetail?.revert_api == "0#1#0#0" || "0#1#0#1") {
  //       // console.log("heyy yyy")
  //       getLayer2Data(0);
  //     }
  //     else if(courseDetail?.revert_api == "1#2#0#0" || courseDetail?.revert_api == "0#2#0#0" || "0#2#0#1") {
  //       // console.log("here")
  //       setShowLayer("layer1")
  //     }
  //     else if(courseDetail?.revert_api == "1#3#0#0" || courseDetail?.revert_api == "0#3#0#0" || "0#3#0#1") {
  //       console.log("hell")
  //       getLayer3Data(0)
  //     }
  //   }
  // }, [courseDetail, keyValue]);

  useEffect(() => {
    setData3Index(1);
    setLayer3updateData([]);
    if (displayTabData.layer) {
      handleShowData();
    } else {
      // let revertAPi =  layer1Data?.revert_api
      // console.log("layer11111", keyValue, courseDetail?.revert_api);
      let r_api = courseDetail?.revert_api.split("#");

      if (
        // courseDetail?.revert_api == "1#0#0#0" ||
        // courseDetail?.revert_api == "0#0#0#0" ||
        // courseDetail?.revert_api == "0#0#0#1" ||
        // courseDetail?.revert_api == "1#0#0#1"
        r_api[1] == 0
      ) {
        setShowLayer("layer1");
        // skipLayer1Data();
      } else if (
        // courseDetail?.revert_api == "1#1#0#0" ||
        // courseDetail?.revert_api == "0#1#0#0" ||
        // courseDetail?.revert_api == "0#1#0#1" ||
        // courseDetail?.revert_api == "1#1#0#1"
        r_api[1] == 1
      ) {
        // console.log('skip layer1')
        // getLayer2Data(0);
        skipLayer1Data()
      } else if (
        // courseDetail?.revert_api == "1#2#0#0" ||
        // courseDetail?.revert_api == "0#2#0#0" ||
        // courseDetail?.revert_api == "0#2#0#1" ||
        // courseDetail?.revert_api == "1#2#0#1"
        r_api[1] == 2
      ) {
        setShowLayer("layer1");
      } else if (
        // courseDetail?.revert_api == "1#3#0#0" ||
        // courseDetail?.revert_api == "0#3#0#0" ||
        // courseDetail?.revert_api == "0#3#0#1" ||
        // courseDetail?.revert_api == "1#3#0#1"
        r_api[1] == 3
      ) {
        // console.log("hell");
        setData3(0)
        setTitle3('')
        getLayer3Data(0);
        
      }
    }
  }, [courseDetail, keyValue]);

  useEffect(() => {
    // console.log('hhhhhhhhhhhhhhhhhhhhhhhh')
    setLayer3updateData([]);
    if (layer3Data?.list?.length > 0) {
      // handleNextData()
      filterPage();
    }
  }, [layer3Data]);

  const formatDate = (date) => {
    const cr_date = new Date(date * 1000);
    if (cr_date) {
      // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
      return format(cr_date, "d MMM, yyyy");
    }
  };

  const showErrorToast = (toastMsg) => {
    if (!isToasterOpen) {
      setIsToasterOpen(true);
      toast.error(toastMsg, {
        // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
        autoClose: 1000,
      });
    }
  };

  const skipLayer1Data = () => {
    // console.log('courseDetail', courseDetail)
    // console.log(courseDetail?.meta?.list?.flatMap(item => item?.list))
    setShowLayer("layer2");
    setLayer2List(courseDetail?.meta?.list?.flatMap(item => item?.list))
  }

  const getLayer2Data = (index, title) => {
    // window.scroll(0,0)
    setBreadcrumbData(title);
    setLayer1Index(index);
    setShowLayer("layer2");
    setLayer2List(layer1Data?.meta?.list[index]?.list);
    // console.log(layer1Data.meta?.list[index]);
  };

  // console.log('layer2list', layer2List)

  const getLayer3Data = async (index, title) => {
    // window.scroll(0,200)
    setBreadcrumbData2(title);
    setShowLayer("layer3");
    setLayer2Index(index);

    const subj_id = () => {
      // console.log(courseDetail)

      let r_api = courseDetail?.revert_api.split("#");
      if (
        // layer1Data?.revert_api == "1#1#0#0" ||
        // layer1Data?.revert_api == "1#3#0#0" ||
        // layer1Data?.revert_api == "0#1#0#0" ||
        // layer1Data?.revert_api == "0#3#0#0" ||
        r_api[1] == 1 ||
        r_api[1] == 3
      ) {
        return 0;
      } else {
        if (
          // layer1Data?.revert_api == "0#0#0#0" ||
          // layer1Data?.revert_api == "1#0#0#0"
          r_api[1] == 0
        ) {
          return layer1Data.meta?.list[0]?.id;
        } else {
          return layer1Data?.meta?.list[index]?.id;
        }
      }
    };

    const topi_id = () => {
      let r_api = courseDetail?.revert_api.split("#");
      // console.log("r_api", r_api);
      if (
        // layer1Data?.revert_api == "1#2#0#0" ||
        // layer1Data?.revert_api == "1#3#0#0" ||
        // layer1Data?.revert_api == "0#2#0#0" ||
        // layer1Data?.revert_api == "0#3#0#0"
        r_api[1] == 2 ||
        r_api[1] == 3
      ) {
        return 0;
      } else {
        return layer2List[index]?.id;
      }
    };
    const data = {
      tile_id: layer1Data?.id && layer1Data?.id,
      type: layer1Data?.type && layer1Data?.type,
      revert_api: layer1Data?.revert_api && layer1Data?.revert_api,
      topic_id: topi_id(),
      subject_id: subj_id(),
      layer: 3,
      page: 1,
    };
    // console.log('data', data)
    const result = await getDetail(data); /// Api Call
    // const result = "";
    // console.log('result', result);
    setLayer3Data(result);
  };

  const getDetail = async (data) => {
    try {
      // console.log(data)
      const token = get_token();
      const formData = {
        course_id: CourseID,
        tile_id: data.tile_id,
        type: data.type,
        revert_api: data.revert_api,
        topic_id: data.topic_id,
        subject_id: data.subject_id,
        layer: data.layer,
        page: data.page,
        parent_id: "",
      };
      // console.log('formData', formData)
      const response_getMasterData_service = await getMasterDataService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getMasterData_Data = decrypt(
        response_getMasterData_service.data,
        token
      );
      // console.log("response_getMasterData_Data", response_getMasterData_Data);
      if (response_getMasterData_Data.status) {
        return response_getMasterData_Data.data;
      }
    } catch (error) {
      console.log("error found: ", error);
      toast.error("Server Error");
      // router.push('/')
    }
  };

  const handleRead = (value) => {
    // console.log("Read Now", value);
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      if (onlineCourseAry.is_purchased == 1) {
        if (typeof window !== "undefined") {
          window.open(value.file_url, "_blank");
        }
      } else {
        showErrorToast("Please, purchase the course");
      }
    }
  };

  const handleWatch = (data, index) => {
    if(data?.live_status == 2 && data?.video_type == 8) {
      showErrorToast('Live class has been ended')
    }
    else{
      let playData = {
        vdc_id:data.vdc_id,
        file_url:data.file_url,
        title:data.title,
        video_type:data.video_type
      }
      const isLoggedIn = localStorage.getItem("jwt");
      if (!isLoggedIn) {
        setModalShow(true);
      } else {
        // console.log('guyggjh')
        if (onlineCourseAry?.is_purchased == 1) {
          // router.push(`/private/myProfile/view-pdf/${encodeURIComponent(value.file_url)}`)
          dispatch(
            all_tabName({
              index,
              tab: keyValue,
              layer: showLayer,
            })
          );
          router.push({
            pathname: `/private/myProfile/play/${data.id}`,
            query: playData,
          });
          // router.push(`/private/myProfile/play/${data.file_url}&type=${data.file_type}`)
          // console.log('watch')
        }
        else if (onlineCourseAry?.is_purchased == 0) {
          dispatch(
            all_tabName({
              index,
              tab: keyValue,
              layer: showLayer,
            })
          );
          router.push({
            pathname: `/private/myProfile/play/${data.id}`,
            query: playData,
          });
        }
        
        else {
          showErrorToast("Please, purchase the course");
        }
      }
    }
  };

  const setLayer1 = () => {
    // console.log('layer1Data87687868', courseDetail)
    let r_api = courseDetail?.revert_api.split("#");
    if (
      // courseDetail?.revert_api == "1#0#0#0" ||
      // courseDetail?.revert_api == "0#0#0#0" ||
      // courseDetail?.revert_api == "1#0#0#1"
      r_api[1] == 0
    ) {
      setShowLayer("layer1");
    } else if (
      // courseDetail?.revert_api == "1#1#0#0" ||
      // courseDetail?.revert_api == "0#1#0#0"
      r_api[1] == 1
    ) {
      setShowLayer("layer2");
    } else if (
      // courseDetail?.revert_api == "1#2#0#0" ||
      // courseDetail?.revert_api == "0#2#0#0"
      r_api[1] == 2
    ) {
      // console.log("hel");
      setShowLayer("layer2");
    }
  };

  const setLayer2 = () => {
    // console.log('layer1Data', courseDetail)
    let r_api = courseDetail?.revert_api.split("#");
    if (
      // courseDetail?.revert_api == "1#0#0#0" ||
      // courseDetail?.revert_api == "0#0#0#0" ||
      // courseDetail?.revert_api == "1#0#0#1"
      r_api[1] == 0
    ) {
      setShowLayer("layer2");
    } else if (
      // courseDetail?.revert_api == "1#1#0#0" ||
      // courseDetail?.revert_api == "0#1#0#0"
      r_api[1] == 1
    ) {
      setShowLayer("layer2");
    } else if (
      // courseDetail?.revert_api == "1#2#0#0" ||
      // courseDetail?.revert_api == "0#2#0#0"
      r_api[1] == 2
    ) {
      setShowLayer("layer1");
    }
  };
  const handleLayer1Click = (i, item) => {
    let r_api = layer1Data?.revert_api.split("#");
    if (
      // layer1Data?.revert_api == "1#2#0#0" ||
      // layer1Data?.revert_api == "0#2#0#0"
      r_api[1] == 2
    ) {
      setData3(i)
      setTitle3(item?.title)
      getLayer3Data(i, item.title);
    } else getLayer2Data(i, item.title);
  };

  const handleLayer2Click = (i, item) => {
    setData3(i)
    setTitle3(item?.title)
    getLayer3Data(i, item.title);
  };
  // console.log('layer2List', layer2List)

  const filterPage = () => {
    // console.log('layer3Data', layer3Data)
    let len = layer3Data?.list?.length;
    let length = len % 15 !== 0 ? Math.floor(len / 15) + 1 : len / 15;
    // for(let i = 0; i < length; i++) {
    //     Arr.push(i+1)
    // }
    // setPage(Arr)

    setPage(Array.from({ length }, (_, i) => i + 1));
  };

  useEffect(() => {
    if (layer3Data?.list?.length > 0 && data3Index > 0) {
      // console.log("page", data3Index, page.length)
      if (data3Index == 1) {
        setLayer3updateData(layer3Data?.list?.slice(0, 15));
      } else if (data3Index === page.length) {
        setLayer3updateData(
          layer3Data?.list?.slice((data3Index - 1) * 15, data3Index.length)
        );
      } else {
        setLayer3updateData(
          layer3Data?.list?.slice((data3Index - 1) * 15, data3Index * 15)
        );
      }
    }
  }, [data3Index, layer3Data]);

  // console.log('layer3updateData', layer3updateData)

  const handleTakeTest = (val, index) => {
    // console.log("val111111111", val);
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      if (onlineCourseAry.is_purchased == 1) {
        var firstAttempt = "0";
        if (val.state == ""){
          firstAttempt = "1";
        }
        // // else if (App.Server_Time.ToUnixTimeSeconds() > long.Parse(Current_Selected_Resource.end_date)){
        // //   firstAttempt = "0";
        // // }
        // else if (Number(val.is_reattempt) > 0){
        //   firstAttempt = "0";
        // }
        const formData = {
          jwt: localStorage.getItem("jwt"),
          user_id: localStorage.getItem("user_id"),
          course_id: CourseID,
          test_id: val?.id,
          lang: val?.lang_used ? val?.lang_used : 1,
          state: val?.state ? val?.state : 0,
          test_type: val?.test_type,
          first_attempt: firstAttempt,
          appid: localStorage.getItem("appId"),
        };

        // console.log("formData", formData);
        const encryptData = btoa(JSON.stringify(formData));
        // console.log("encryptData", encryptData);
        // const encryptData = encrypt(JSON.stringify(formData));
        popupRef.current = window.open(
          `${BaseURL}/web/LiveTest/attempt_now_window?data=${encryptData}`,
          "popupWindow",
          `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
        );
        // Start interval to check if the popup is still open
        intervalRef.current = setInterval(() => {
          if (popupRef.current && popupRef.current.closed) {
            clearInterval(intervalRef.current);
            popupRef.current = null;
            // onPopupClose(); // Call the function to handle the popup close event
            getLayer3Data(data3, title3);
            // console.log('867867687687')
          }
        }, 500); // Check every 500ms
      } else {
        showErrorToast("Please, purchase the course");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleRankTest = (val) => {
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      if (onlineCourseAry.is_purchased == 1) {
        const formData = {
          jwt: localStorage.getItem("jwt"),
          user_id: localStorage.getItem("user_id"),
          course_id: CourseID,
          test_id: val?.id,
          lang: val?.lang_used ? val?.lang_used : 1,
          state: val?.state ? val?.state : 0,
          test_type: val?.test_type,
          first_attempt: 1,
          appid: localStorage.getItem("appId"),
        };
        // console.log("formData", formData);
        const encryptData = btoa(JSON.stringify(formData));
        // console.log("encryptData", encryptData);

        window.open(
          `${BaseURL}/web/LiveTest/result_window?data=${encryptData}`,
          "popupWindow",
          `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
        );
      } else {
        showErrorToast("Please, purchase the course");
      }
    }
  };

  const handleResultTest = (val, index) => {
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      if (onlineCourseAry.is_purchased == 1) {
        var firstAttempt = "0";
        if (val.state == "") {
          firstAttempt = "1";
        }
        // // else if (App.Server_Time.ToUnixTimeSeconds() > long.Parse(Current_Selected_Resource.end_date)){
        // //   firstAttempt = "0";
        // // }
        else if (Number(val.is_reattempt) > 0) {
          firstAttempt = "0";
        }
        const formData = {
          jwt: localStorage.getItem("jwt"),
          user_id: localStorage.getItem("user_id"),
          course_id: CourseID,
          test_id: val?.id,
          lang: val?.lang_used ? val?.lang_used : 1,
          state: val?.state ? val?.state : 0,
          test_type: val?.test_type,
          first_attempt: firstAttempt,
          appid: localStorage.getItem("appId"),
        };

        // console.log("formData", formData);
        const encryptData = btoa(JSON.stringify(formData));
        // console.log("encryptData", encryptData);
        // const encryptData = encrypt(JSON.stringify(formData));
        window.open(
          `${BaseURL}/web/LiveTest/learn_result_window?data=${encryptData}`,
          "popupWindow",
          `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
        );
      } else {
        showErrorToast("Please, purchase the course");
      }
    }
  };

  const handleUpcomingTest = (item, i) => {
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      if (onlineCourseAry.is_purchased == 1) {
        const givenStartTime = new Date(item?.start_date * 1000);
        showErrorToast(
          `Test will start at ${givenStartTime.toLocaleTimeString()}`
        );
      } else {
        showErrorToast("Please, purchase the course");
      }
    }
  };

  return (
    <>
      <LoginModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
      />
      <Toaster position="top-right" reverseOrder={false} toastOptions={{duration: 1500}}/>
      {/* <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              opacity: "1",
            },
          },
          error: {
            style: {
              opacity: "1",
            },
          },
        }}
      /> */}
      <div className="container-fluid p-4 pt-0">
        <div className={` ${checkLogin ? "row" : "row"}`}>
          <div
            className={`${
              checkLogin
                ? "col-lg-8 col-md-12"
                : "col-lg-7 offset--1  col-md-12"
            }`}
          >
            <section className={` ${checkLogin ? "px-2 " : ""}`}>
              <div className=" custom-breadcrumb">
                {/* <span
            ref={resetRef}
            className={showLayer == "layer1" ? "breadcrumb" : "breadcrumb"}
            onClick={() => {
              setShowLayer("layer1");
            }}
          >
            {showLayer == "layer1" ||
            showLayer == "layer2" ||
            showLayer == "layer3"
              ? // ? ` > ${layer2List.title}`
                `Subjects >`
              : ""}
          </span> */}
                <span
                  ref={resetRef}
                  className={
                    showLayer == "layer2" ? "active-breadcrumb" : "breadcrumb"
                  }
                  style={{cursor: 'pointer'}}
                  onClick={setLayer1}
                >
                  {/* {(layer2List != undefined && showLayer == "layer2") || */}
                  {(showLayer == "layer2" || showLayer == "layer3") &&
                  breadcrumbData ? (
                    // ? ` > ${layer2List.title}`
                    <>
                      {breadcrumbData} <i className="bi bi-chevron-right"></i>
                    </>
                  ) : (
                    ""
                  )}
                </span>
                <span
                  className={
                    showLayer == "layer3" ? "active-breadcrumb" : "breadcrumb"
                  }
                  style={{cursor: 'pointer'}}
                  onClick={setLayer2}
                >
                  {showLayer == "layer3" && breadcrumbData2 ? (
                    // ? ` > ${layer2List.list[layer2Index].title}`
                    <>
                      {breadcrumbData2} <i className="bi bi-chevron-right"></i>
                    </>
                  ) : (
                    ""
                  )}
                </span>
              </div>
              <div className="py-2 contentHeight">
                {showLayer == "layer3" ? (
                  layer3Data?.list?.length > 0 &&
                  layer3updateData?.length > 0 ? (
                    <div>
                      {layer3updateData?.map((item, i) => {
                        return (
                          // <div
                          //   className=" pg-tabs-description mt-3"
                          //   key={i}
                          // //   onClick={() => handleOpenVideo(item)}
                          // >
                          //   <div className="tabs-deschovr d-flex align-items-center rounded">
                          //     <div className="w-100 pg-sb-topic d-flex align-items-center justify-content-between">
                          //       <div className="d-flex justify-content-between">
                          //         <img
                          //           src={item.thumbnail_url ? item.thumbnail_url : "/assets/images/noImage.jfif"}
                          //           height={"60px"}
                          //         />
                          //         <div className="subjectDetails">
                          //           <p className="m-0 sub_name">{item.title}</p>
                          //           {item.role == "PDF" && (
                          //             <p className="m-0 sub_topics">
                          //               {item.release_date}
                          //             </p>
                          //           )}
                          //         </div>
                          //       </div>
                          //       <div className="pg-sb-topic pe-2">
                          //         <div className="btnsalltbba text-center d-flex">
                          //           {" "}
                          //           {
                          //           // (isLogin &&
                          //           item.is_purchased == 0 ?
                          //           // item.is_locked == "1" ?
                          //           // <>
                          //           //   <img style={{ width: "32px" }} src="/assets/images/locked.png" alt="" />
                          //           // </>
                          //           // :
                          //             item.is_locked == 0 ?
                          //             <>
                          //             {layer1Data.type == "pdf" && <Button1 value="Read" handleClick={handleRead} /> }
                          //             {layer1Data.type == "video" && <Button1 value="Watch Now" handleClick={handleWatch(item, i)} />}
                          //             {layer1Data.type == "test" && <Button1 value="Test" />}
                          //             </>
                          //             :
                          //             <>
                          //               <img style={{ width: "32px" }} src="/assets/images/locked.png" alt="" />
                          //             </>
                          //           :
                          //           <>
                          //           {layer1Data?.type == "pdf" && <Button1 value="Read" handleClick={() => handleRead(item)} /> }
                          //           {layer1Data?.type == "video" && <Button1 value="Watch Now" handleClick={() => handleWatch(item, i)} />}
                          //           {layer1Data?.type == "test" &&
                          //             (compareTime(item.start_date  , item.end_date) == "pending" &&
                          //             <Button1 value="Upcoming"
                          //               // handleClick={() => handleTakeTest(item, i)}
                          //             />
                          //             )}
                          //             {layer1Data?.type == "test" && (compareTime(item.start_date  , item.end_date) == "attempt" &&
                          //             <Button1 value="Attempt Now"
                          //               handleClick={() => handleTakeTest(item, i)}
                          //             />
                          //             )}
                          //             {layer1Data?.type == "test" && (compareTime(item.start_date  , item.end_date) == "result" &&
                          //             <Button1 value={item?.state == 1 ? "View Result" : "LeaderBoard"}
                          //               handleClick={() => item?.state == 1 ? handleResultTest(item, i) : handleRankTest(item, i)}
                          //             />
                          //             )}
                          //           </>
                          //           }
                          //         </div>
                          //       </div>
                          //     </div>
                          //   </div>
                          // </div>
                          <TileDetail
                            item={item}
                            layer1Data={layer1Data}
                            handleRead={handleRead}
                            handleWatch={handleWatch}
                            handleTakeTest={handleTakeTest}
                            handleResultTest={handleResultTest}
                            handleRankTest={handleRankTest}
                            handleUpcomingTest={handleUpcomingTest}
                            i={i}
                            onlineCourseAry={onlineCourseAry}
                            key={i}
                          />
                        );
                      })}
                      {/* {console.log('page', data3Index)} */}
                      {page.length > 1 && (
                        <div className="pagination_button m-2">
                          <button
                            onClick={() =>
                              data3Index > 1 && setData3Index(data3Index - 1)
                            }
                            style={data3Index == 1 ? { color: "grey" } : {}}
                          >
                            Prev
                          </button>
                          {/* {console.log('page', val)} */}
                          {page.map((val, index) => {
                            if (val != page?.length+1) {
                              return (
                                <button
                                  key={index}
                                  onClick={() => setData3Index(val)}
                                  style={
                                    val == data3Index
                                      ? {
                                          backgroundColor: "#FF7426",
                                          color: "white",
                                        }
                                      : {}
                                  }
                                >
                                  {val}
                                </button>
                              );
                            }
                          })}
                          <button
                            onClick={() =>
                              data3Index < page.length &&
                              data3Index != page.length &&
                              setData3Index(data3Index + 1)
                            }
                            style={
                              data3Index == page?.length
                                ? { color: "grey" }
                                : {}
                            }
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  ) : showError ? (
                    <ErrorPageAfterLogin />
                  ) : (
                    <LoaderAfterLogin />
                  )
                ) : showLayer == "layer2" ? (
                  layer2List &&
                  layer2List?.map((item, i) => {
                    // topic_PDF_Ary &&
                    // topic_PDF_Ary.map((item, i) => {
                    return (
                      <div
                        className=" pg-tabs-description mt-3"
                        onClick={() => handleLayer2Click(i, item)}
                        key={i}
                      >
                        <div className="tabs-deschovr d-flex align-items-center rounded">
                          <div
                            className="pg-sb-topic d-flex align-items-center"
                            style={{ width: "97%" }}
                          >
                            <span className="videoimage">
                              <img
                                src={
                                  item.image_icon
                                    ? item.image_icon.length
                                      ? item.image_icon
                                      : item.image
                                    : "/assets/images/noImage.jfif"
                                }
                                height={"60px"}
                              />
                              {/* <img src={item} height={'50px'}/> */}
                              {/* <i className="fa fa-file-text" aria-hidden="true"></i> */}
                            </span>

                            {/* <h3>{item.title}</h3> */}
                            <div className="subjectDetails">
                              <p className="sub_name">{item.title}</p>
                              {item.role == "subject" && (
                                <p className="m-0 sub_topics">
                                  {item.content} Topics
                                </p>
                              )}
                              {item.role == "topic" && (
                                <p className="m-0 sub_topics">
                                  {item.content} PDF's
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="pg-sb-topic pe-2">
                            <span className="rightChevron">
                              {/* {item.is_locked == '0' ?   */}
                              {/* <i className="fa fa-angle-right" aria-hidden="true"></i> */}
                              <IoIosArrowForward />
                              {/* :  <img src={lock_icon}/>} */}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  showLayer == "layer1" &&
                  layer1Data &&
                  layer1Data?.meta?.list?.map((item, i) => {
                    // subject_PDF_Ary &&
                    // subject_PDF_Ary.map((item, i) => {
                    return (
                      <div
                        className=" pg-tabs-description mt-3"
                        onClick={() => handleLayer1Click(i, item)}
                        key={i}
                      >
                        {/* {console.log('item.title', item)} */}
                        <div className="tabs-deschovr d-flex align-items-center rounded">
                          <div
                            className="pg-sb-topic d-flex align-items-center"
                            style={{ width: "97%" }}
                          >
                            <span className="videoimage">
                              <img
                                src={
                                  item.image_icon
                                    ? item.image_icon.length
                                      ? item.image_icon
                                      : item.image
                                    : "/assets/images/noImage.jfif"
                                }
                                height={"60px"}
                              />
                              {/* <img src={item} height={'50px'}/> */}
                              {/* <i className="fa fa-file-text" aria-hidden="true"></i> */}
                            </span>

                            {/* <h3>{item.title}</h3> */}
                            <div className="subjectDetails">
                              <p className="sub_name">{item.title}</p>
                              {item.role == "subject" && (
                                <p className="m-0 sub_topics">
                                  {item.content} Topics
                                </p>
                              )}
                              {item.role == "topic" && (
                                <p className="m-0 sub_topics">
                                  {item.content} PDF's
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="pg-sb-topic pe-2">
                            <span className="rightChevron text-center">
                              {/* {item.is_locked == '0' ?   */}
                              {/* <i className="fa fa-angle-right" aria-hidden="true"></i> */}
                              <IoIosArrowForward />
                              {/* :  <img src={lock_icon}/>} */}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notes;
