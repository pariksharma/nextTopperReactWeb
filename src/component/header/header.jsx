import React, { useEffect, useRef, useState } from "react";
import Button1 from "../buttons/button1/button1";
import { useRouter } from "next/router";
import LoginModal from "../modal/loginModal";
import { Nav, NavDropdown } from "react-bootstrap";
import LogoutModal from "../modal/logoutModal";
import { getCourse_Catergory_Service, getCourse_service, getMyProfileService, getVersionService } from "@/services";
import { decrypt, encrypt, get_token, userLoggedIn } from "@/utils/helpers";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { all_CategoryAction, all_version, profile_data } from "@/store/sliceContainer/masterContentSlice";
import Loader from "../loader";

const edulogo = "/assets/images/eduLogo.png";
const userLogo = "/assets/images/loginLogo.png";

const Header = ({ search }) => {
  const [modalShow, setModalShow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoutShow, setLogoutShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setloading] = useState(false);
  const [searchCourseList, setSearchCourseList] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [logo, setLogo] = useState('')
  const [userData, setUserData] = useState("");
  const [appId, setAppId] = useState('');
  const state = useSelector((state) => state?.appDetail?.app_detail);
  const router = useRouter();
  const token = get_token();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null); // Ref to store debounce timeout

  const dispatch = useDispatch()

  const userName = useSelector((state) => state?.allCategory?.profileDetail)
  


  // console.log('userName', userName)

  useEffect(() => {
    setAppId(localStorage.getItem('appId'))
    const login = localStorage.getItem("jwt");
    login && setIsLoggedIn(true);
    login && fetchMyProfile();
    const isLogo = localStorage.getItem('logo');
    isLogo && setLogo(isLogo)
    fetchContentData()
    setIsVisible(false)
  }, []);

  const UserLoggedIn = () => {
    const login = localStorage.getItem("jwt");
    return login;
  }

  useEffect(() => {
    UserLoggedIn()
    setIsLoggedIn(UserLoggedIn())
  })

  useEffect(() => {
    getVersion();
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsVisible(false); // Hide the div when clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup the event listener on unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  // useEffect(() => {
  //   fetchSearchCourse(searchInputValue)
  // }, [searchInputValue]);

  useEffect(() => {
    setloading(true)
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      if (searchInputValue) {
        fetchSearchCourse(searchInputValue);
        setIsVisible(true);
        setloading(false)
      } else {
        setIsVisible(false);
      }
    }, 500); 
    return () => {
      clearTimeout(debounceTimeout.current);
    };
  }, [searchInputValue]);



  const handleShow = () => {
    setModalShow(false);
  };

  const handleClick = () => {
    setModalShow(true);
  };

  const fetchMyProfile = async () => {
    try {
      const formData = {};
      const response_getMyProfile_service = await getMyProfileService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getMyProfile_data = decrypt(
        response_getMyProfile_service.data,
        token
      );
      // console.log('response_getMyProfile_data', response_getMyProfile_data)
      if (response_getMyProfile_data.status) {
        setUserData(response_getMyProfile_data.data)
        dispatch(profile_data(response_getMyProfile_data.data))
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/'
    }
  }

  const fetchSearchCourse = async (value) => {
    try {
      if (value) {
        const formData = {
          page: 1,
          search: value,
          main_cat: 0,
          sub_cat: 1,
          course_type: 0,
        };
        const response_getCourses_service = await getCourse_service(encrypt(JSON.stringify(formData), token))
        const response_getCourses_data = decrypt(response_getCourses_service.data, token);
        if (response_getCourses_data.status) {
          setSearchCourseList(response_getCourses_data.data)
        }
        else {
          setSearchCourseList([])
        }
        // console.log('response_getCourses_data', response_getCourses_data)
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  const handleSearchCourseDetail = (value) => {
    router.push(
      `/view-courses/details/${"" + ":" + value.id + "&" + value.combo_course_ids + 'parent:'
      }`
    );
  }

  const handleRemoveSearch = () => {
    setSearchInputValue('')
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input when the button is clicked
    }
  }

  const fetchContentData = async () => {
    try {
      const formData = new FormData();
      const response_content_service = await getCourse_Catergory_Service(formData);
      // console.log('bannerResponse', decrypt(response_content_service.data, token))
      const content_service_Data = decrypt(response_content_service.data, token)
      if (content_service_Data.status) {
        dispatch(all_CategoryAction(content_service_Data.data))
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  const getVersion = async () => {
    try {
      const formData = {};
      const response_getVersion_service = await getVersionService(encrypt(JSON.stringify(formData), token))
      const response_getVersion_data = decrypt(response_getVersion_service.data, token);
      if (response_getVersion_data.status) {
        dispatch(all_version(response_getVersion_data?.data?.permissions))
        // setVersionData(response_getVersion_data?.data?.permissions)
      }
      // console.log('response_getVersion_data', response_getVersion_data)
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  const handleRedirect = () => {
    const isLoggedIn = userLoggedIn();
    if (isLoggedIn) {
      router.push('/private/myProfile/ourCourse')
    }
    else {
      router.push("/")
    }
  }


  return (
    <nav
      className="px-0 px-sm-5 px-md-5 navbar navbar-expand bg-white fixed-top"
      id="eduNav"
      style={{zIndex: '9'}}
    >
      {/* <LoginModal show={modalShow} handleShow = {handleShow} /> */}
      <LoginModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
      />
      <LogoutModal
        show={logoutShow}
        onHide={() => {
          setLogoutShow(false);
        }}
      />
      <div className="container-fluid">
        <div className="m-0 logoImgContainer">
          {/* {logo && ( */}
          <img
            className={appId != 655 ? "logoImg" : "logoImg2"}
            src={logo ? logo : state.logo}
            alt=""
            onClick={handleRedirect}
            style={{ cursor: "pointer"}}
          />
          {/* )} */}
        </div>
        {!router.pathname.startsWith("/private") && search !== "disable" && (
          <div
            className="input-group ms-3 search"
            onClick={() => setIsVisible(true)}
          >
            {/* <span className="searchIcon d-none d-md-block input-group-text border-0" id="basic-addon1"> */}
            {/* <i className="bi bi-search"></i> */}
            {/* <CiSearch /> */}
            {/* <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.1833 18C17.013 17.8919 16.8506 17.7718 16.6973 17.6407C15.3362 16.2795 13.975 14.9252 12.6139 13.5776C12.565 13.5295 12.5199 13.4776 12.4791 13.4224C11.5507 14.2111 10.4447 14.7626 9.25612 15.0293C8.06753 15.296 6.83196 15.2701 5.65561 14.9537C3.84257 14.5044 2.26863 13.3816 1.2536 11.8135C0.243963 10.2947 -0.185398 8.46319 0.043956 6.65383C0.27331 4.84447 1.14606 3.17805 2.50275 1.95912C3.85943 0.740187 5.60941 0.0501375 7.43291 0.0150766C9.25641 -0.0199844 11.0316 0.602299 12.4342 1.76818C13.2132 2.39907 13.8554 3.18215 14.3216 4.0696C14.7878 4.95705 15.0682 5.93023 15.1456 6.92968C15.2415 7.92495 15.1366 8.92937 14.8371 9.88333C14.5376 10.8373 14.0495 11.7214 13.402 12.4832C13.451 12.5363 13.4959 12.5853 13.5408 12.6262C14.902 13.9873 16.2631 15.3485 17.6243 16.7096C17.7554 16.8629 17.8755 17.0253 17.9836 17.1956V17.4814C17.9439 17.6047 17.8754 17.7168 17.7838 17.8084C17.6922 17.9 17.5801 17.9684 17.4569 18.0082L17.1833 18ZM1.3271 7.60756C1.3271 8.84728 1.69473 10.0592 2.38349 11.09C3.07224 12.1208 4.05118 12.9241 5.19654 13.3986C6.34189 13.873 7.60221 13.9971 8.81811 13.7553C10.034 13.5134 11.1509 12.9164 12.0275 12.0398C12.9041 11.1632 13.5011 10.0463 13.743 8.83041C13.9848 7.61451 13.8607 6.35419 13.3863 5.20883C12.9118 4.06348 12.1084 3.08453 11.0776 2.39578C10.0468 1.70703 8.83499 1.33939 7.59526 1.33939C6.7725 1.33939 5.95781 1.5016 5.19778 1.8167C4.43776 2.13181 3.74729 2.59363 3.16589 3.17579C2.58449 3.75795 2.12356 4.44902 1.80945 5.20946C1.49533 5.96989 1.3342 6.7848 1.33527 7.60756H1.3271Z" fill="#484848"/>
                      </svg> */}
            {/* </span> */}
            <span
              className="searchIcon d-none d-md-block input-group-text border-0"
              id="basic-addon1"
            >
              <img
                loading="lazy"
                src="/assets/images/search-icon.svg"
                alt=""
                style={{ width: "12px" }}
              />
            </span>
            <input
              type="text"
              className="d-none d-md-block searchBar"
              placeholder="What are you looking for..."
              aria-label="Username"
              aria-describedby="basic-addon1"
              onChange={(e) => setSearchInputValue(e.target.value)}
              value={searchInputValue}
              ref={inputRef}
            />
            <span
              className="searchIcon d-none d-md-block input-group-text border-0"
              style={{
                borderTopRightRadius: "5px",
                borderBottomRightRadius: "5px",
              }}
              id="basic-addon1"
            >
              {searchInputValue && (
                <img
                  loading="lazy"
                  src="/assets/images/searchRemove.svg"
                  alt=""
                  style={{ width: "12px" }}
                  onClick={handleRemoveSearch}
                />
              )}
            </span>
            {(isVisible && searchInputValue) &&
              <ul ref={searchRef} className="px-2 py-3 list-unstyled searchDropDown" >
                {!loading ?
                  searchCourseList.length > 0
                    ? searchCourseList.map((item, index) => {
                      return <li className="mb-2 d-flex align-items-center" key={index} onClick={() => handleSearchCourseDetail(item)} style={{cursor: 'pointer'}}>
                        <img className="listImg" src={item.cover_image && item.cover_image} alt="" />
                        <p className="m-0 list_Title">{item.title}</p>
                        <img
                          className="ms-4 my-3 redirectImg"
                          src="/assets/images/redirectLogo.png"
                          alt=""
                        />
                        <div className="clearfix"></div>
                      </li>
                    })
                  : (
                    <>
                      <p className="m-0">No Course Found</p>
                    </>
                  )
                : (
                  <div className="row align-items-center justify-content-center sldr_container">
                    <div className="spinner-border" role="status" />
                  </div>
                )}
              </ul>
            }
          </div>
        )}
        {!isLoggedIn ? (
          <div className="navbar-collapse">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Button1 value="Login/Register" handleClick={handleClick} />
              </li>
            </ul>
          </div>
        ) : (
          // <div className="d-flex">
          //   {/* <img src={userLogo} alt='' style={{width: '38px'}} onClick={() => {
          //     localStorage.removeItem('jwt')
          //     location.reload()
          //   }} /> */}
          //   <p>Hi {userData && userData?.name.split(" ")[0]}</p>
          //   <Nav pullRight>
          //     <NavDropdown
          //       eventKey={1}
          //       title={
          //         <div className="pull-left">
          //           <img
          //             className="thumbnail-image"
          //             src={userLogo}
          //             alt="user pic"
          //             style={{ width: "38px" }}
          //           />

          //           {/* {user.username} */}
          //         </div>
          //       }
          //       id="basic-nav-dropdown"
          //     >
          //       <NavDropdown.Item eventKey={1.1} onClick={() => router.push('/private/myProfile/MyCourse')}>
          //         <img src="/assets/images/user1.png" alt="" />
          //         Profile
          //       </NavDropdown.Item>
          //       <NavDropdown.Item divider />
          //       <NavDropdown.Item eventKey={1.3}
          //       onClick={() => setLogoutShow(true) }
          //       >
          //         {/* <i className="fa fa-sign-out"></i>  */}
          //         <img src="/assets/images/logout.png" alt="" />
          //         Logout
          //       </NavDropdown.Item>
          //     </NavDropdown>
          //   </Nav>
          // </div>

          <div className="profile_cont d-flex">
            {userName.name && (
              <p className="headerUserName mb-0" title={userName.name}>
                {userName.name ? "Hi" : ""} {userName.name}
              </p>
            )}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                id="dropdown-custom-components"
                className="p-0 avatar"
                // title="bhotopp"
              >
                <img
                  loading="lazy"
                  src={
                    userData?.profile_picture
                      ? userData?.profile_picture
                      : "/assets/images/loginLogo.png"
                  }
                  alt="user pic"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                  }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item
                  eventKey={1.1}
                  onClick={() => router.push("/private/myProfile/profile")}
                >
                  <img
                    loading="lazy"
                    className="list_Icon"
                    src="/assets/images/user1.png"
                    alt=""
                  />
                  My Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  eventKey={1.3}
                  onClick={() => setLogoutShow(true)}
                >
                  <img
                    loading="lazy"
                    className="list_Icon"
                    src="/assets/images/logout.png"
                    alt=""
                  />
                  LogOut
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
