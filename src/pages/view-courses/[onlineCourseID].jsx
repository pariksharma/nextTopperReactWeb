import React, { useState, useEffect, useRef } from "react";
import Header from "../../component/header/header";
import Footer from "../../component/footer/footer";
import { useRouter } from "next/router";
import Card1 from "@/component/cards/card1";
import { get_token, isValidData } from "@/utils/helpers";
import { getCourse_service, getCourse_Catergory_Service } from "@/services";
import { encrypt, decrypt } from "@/utils/helpers";
import * as Icon from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useSelector } from "react-redux";
import ErrorPage from "@/component/errorPage";
import Loader from "@/component/loader";

const OC_image = "/assets/images/courseRightImg.svg";

const OnlineCourse = ({ onlineCourseID }) => {
  const [showError, setShowError] = useState(false);
  const [key, setKey] = useState("Course Detail");
  const [onlineCourse, setOnlineCourse] = useState("");
  const [id, setId] = useState("");
  const [titleName, setTitleName] = useState("");
  const [cat_description, setCat_description] = useState("");
  const [onlineCourse_ID, setonlineCourse_ID] = useState(onlineCourseID);
  const resetPdfLayerRef = useRef();
  const resetCourseCurriculumLayerRef = useRef();
  const Router = useRouter();
  const courseTypeData = useSelector(
    (state) => state.allCategory?.allCategory?.course_type_master
  );

  useEffect(() => {
    const { onlineCourseID } = Router.query;
    if (onlineCourseID) {
      setonlineCourse_ID(onlineCourseID);
    }
  }, [Router.query]);

  useEffect(() => {
    const currentPath = Router.asPath;
    localStorage.setItem("redirectdetails", currentPath);
    setShowError(false);
    if (onlineCourse_ID) {
      // window.scrollTo(0, 0);
      fetchCourseDetail(
        onlineCourse_ID.slice(
          onlineCourse_ID.indexOf(":") + 1,
          onlineCourse_ID.length
        )
      );
      setId(
        onlineCourse_ID.slice(
          onlineCourse_ID.indexOf(":") + 1,
          onlineCourse_ID.length
        )
      );
      setTitleName(onlineCourse_ID.slice(0, onlineCourse_ID.indexOf(":")));
    }
  }, [onlineCourse_ID, courseTypeData]);

  useEffect(() => {
    if (titleName) {
      setCat_description(
        courseTypeData &&
          courseTypeData.filter((item) => item.name == titleName)
      );
    }
  }, [titleName]);

  const fetchCourseDetail = async (id) => {
    try {
      const token = get_token();
      const formData = {
        course_type: id,
        page: 1,
        sub_cat: 1,
        main_cat: 0,
        // 'course_ids': id
      };
      const response_getCourse_service = await getCourse_service(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getCourse_data = decrypt(
        response_getCourse_service.data,
        token
      );
      // console.log("response_getCourse_data", response_getCourse_data);
      if (response_getCourse_data.status) {
        if (response_getCourse_data?.data?.length == 0) {
          setShowError(true);
        } else setOnlineCourse(response_getCourse_data?.data);
        // console.log('detail', response_getCourse_data.data);
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  return (
    <>
      <Header />
      <div className="container-fluid p-0 mt-5">
        <div
          className={
            titleName &&
            (titleName == "Bookstore" ||
              titleName == "e-BOOK" ||
              titleName == "Books" ||
              titleName.startsWith("Boo"))
              ? `bookStoreContainer row`
              : `course_Container row`
          }
        >
          <div className="col-md-12 m-0" style={{ paddingTop: "15px" }}>
            <nav aria-label="breadcrumb ">
              <ol className="breadcrumb mb-0 cursor">
                <li className="breadcrumb-item" onClick={() => Router.push('/')}>
                  {`Home`}
                  <i className="bi bi-chevron-right"></i>
                  {/* <Icon.ChevronRight /> */}
                </li>
                <li
                  className="breadcrumb-item active"
                  // onClick={() => navigate("/view-courses")}
                >
                  {`${titleName}`}
                  <i className="bi bi-chevron-right"></i>
                  {/* <Icon.ChevronRight /> */}
                </li>
                {/* {courseDetails && <li className="breadcrumb-item highlight">{courseDetails.course_detail.title}</li>} */}
              </ol>
            </nav>
          </div>
          <div
            className={`col-sm-12 col-md-8
                ${
                  titleName &&
                  (titleName == "Bookstore" ||
                    titleName == "e-BOOK" ||
                    titleName == "Books" ||
                    titleName.startsWith("Boo"))
                    ? `col-lg-6`
                    : `col-lg-8`
                }`}
          >
            <div className="onlineCourseTitle">
              <p className="mb-1 title">{titleName}</p>
              <p
                className="onlineCourseDetail"
                // contentEditable='true'
                dangerouslySetInnerHTML={{
                  __html: cat_description && cat_description[0]?.description,
                }}
              ></p>
            </div>
          </div>
          <div
            className={`col-sm-12 col-md-4 d-none d-sm-none d-md-none d-lg-block course_imageContainer  ${
              titleName &&
              (titleName == "Bookstore" ||
                titleName == "e-BOOK" ||
                titleName == "Books" ||
                titleName.startsWith("Boo"))
                ? `col-lg-6`
                : `col-lg-4`
            }`}
          >
            <div className="imgContainer">
              {titleName &&
              (titleName == "Bookstore" ||
                titleName == "e-BOOK" ||
                titleName == "Books" ||
                titleName.startsWith("Boo")) ? (
                <img
                  className="bookImg pb-4"
                  src="/assets/images/bookStoreRightImg.svg"
                  alt=""
                />
              ) : (
                <img src={OC_image} alt="" />
              )}
            </div>
          </div>
        </div>
        <div className="course_cardContainer  mb-3">
          <div className="row">
            {onlineCourse?.length > 0 ? (
              onlineCourse.map((item, index) => {
                return <Card1 value={item} titleName={titleName} key={index} />;
              })
            ) : showError ? (
              <ErrorPage />
            ) : (
              <Loader />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

// export const getStaticPaths = async () => {
//   try {
//     const token = get_token();
//     const formData = {};
//     const response_getCourse_service = await getCourse_Catergory_Service(encrypt(JSON.stringify(formData), token));
//     const response_getCourse_data = decrypt(response_getCourse_service.data, token);

//     const courseTypeMaster = response_getCourse_data?.data?.course_type_master || [];
//     const uniqueItems = Array.from(
//       new Set(courseTypeMaster.map(item => item.id))
//     ).map(id => {
//       return courseTypeMaster.find(item => item.id === id);
//     });
//     const paths = uniqueItems.slice(0, 10).map(item => {
//       return {
//         params: {
//           onlineCourseID: `${encodeURIComponent(item.name)}:${item.id}`
//         },
//       };
//     });

//     return {
//       paths,
//       fallback: 'blocking', // or 'false' depending on your needs
//     };
//   } catch (error) {
//     console.error("Error in getStaticPaths:", error);
//     return {
//       paths: [],
//       fallback: false, // No fallback if an error occurs
//     };
//   }
// };

// export const getStaticProps = async ({ params }) => {
//   const { onlineCourseID } = params;
//   return {
//     props: {
//       onlineCourseID: onlineCourseID || null, // Provide initialTab as a prop
//     },
//   };
// };

export default OnlineCourse;
