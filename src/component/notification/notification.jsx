import React, { useEffect, useState } from "react";
import { getNotificationService } from "@/services";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { format } from "date-fns";
import ErrorPage from "../errorPage";
import LoaderAfterLogin from "../loaderAfterLogin";
import ErrorPageAfterLogin from "../errorPageAfterLogin";

const Notification = () => {
  const [notificationData, setNotificationData] = useState([]);
  const [showError, setShowError] = useState(false)
  const [appLogo, setAppLogo] = useState('')
  const router = useRouter();

  useEffect(() => {
    setShowError(false)
    fetchNotification();
    setAppLogo(localStorage.getItem('logo'))
  }, []);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const fetchNotification = async () => {
    try{
      const token = get_token();
      const formData = {
        page: 1,
      };
      const response_getNotification_service = await getNotificationService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getNotification_data = decrypt(
        response_getNotification_service.data,
        token
      );
      console.log("response_getNotification_data", response_getNotification_data);
      if (response_getNotification_data?.status) {
        if(response_getNotification_data?.data?.length < 0){
          setShowError(true)
        }
        else setNotificationData(response_getNotification_data?.data);
      } else {
        setShowError(true)
        if (response_getNotification_data.message == msg) {
          toast.error(response_getNotification_data.message);
          setTimeout(() => {
            localStorage.removeItem("jwt");
            localStorage.removeItem("user_id");
            if (router.pathname.startsWith("/private")) {
              router.push("/");
            } else location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.log("error found: ", error)
      router.push('/')
    }
  };

  const formatDate = (value) => {
    const cr_date = new Date(value * 1000);
    if (cr_date) {
      // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
      return format(cr_date, "d MMMM, yyyy | h:mm a");
    }
  };
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {/* <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              opacity:'1'
            },
          },
          error: {
            style: {
             opacity:'1'
            },
          },
        }}
      /> */}
      {/* <div>Notification</div> */}
      <section className="container-fluid mt-3">
        <div className="row">
          <div className="col-md-12">
            {notificationData?.length > 0 ? (
              notificationData?.map((item, index) => {
                return (
                    <div className={`card p-2 mx-auto NotifyCard active mb-2`} key={index}>
                      <div className="d-flex gap-2 ">
                        <div className="m-0 position-relative">
                          <p className="m-0 activeNotification"></p>
                          <img
                            className="notifyImg"
                            src={appLogo ? appLogo : "/assets/images/notifyImg.svg"}
                            alt=""
                          />
                        </div>
                        <div className="pt-1">
                          <h5 className="m-0 notifyTitle">{item.title}</h5>
                          <p
                            className="m-0 notify_Text"
                            dangerouslySetInnerHTML={{ __html: item.message }}
                          ></p>
                          <p className="m-0 notifyDate">
                            <i className="bi bi-clock"></i>{" "}
                            {formatDate(item.created)}
                          </p>
                        </div>
                      </div>
                    </div>
                );
              })
            ) : <>
              {showError ? 
              <ErrorPageAfterLogin /> 
              :
              <LoaderAfterLogin />}
            </>}
          </div>
        </div>
      </section>
    </>
  );
};

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default Notification;
