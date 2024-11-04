import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import { getLiveTestService } from "@/services";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import LiveTestCard from "../cards/liveTestCard";
import { useRouter } from "next/router";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import LoaderAfterLogin from "../loaderAfterLogin";
import toast, { Toaster } from "react-hot-toast";

const LiveTest = () => {
  const [key, setKey] = useState("LIVE");
  const [showError, setShowError] = useState(false);
  const [liveTests, setLiveTests] = useState([]);
  const router = useRouter();
  const token = get_token();
  const popupRef = useRef(null);
  const intervalRef = useRef(null);

  // const fetchLiveTest = async (type) => {
  //   const formData = {
  //     page: 1,
  //     type: type,
  //   };
  //   const encryptedData = encrypt(JSON.stringify(formData), token);
  //   const response = await getLiveTestService(encryptedData);
  //   const decryptedData = decrypt(response.data, token);

  //   if (!decryptedData?.status) {
  //     if (decryptedData.message === msg) {
  //       localStorage.removeItem("jwt");
  //       localStorage.removeItem("user_id");
  //       router.push("/");
  //     }
  //     throw new Error(decryptedData.message || "Error fetching data");
  //   }

  //   return decryptedData.data;
  // };

  // const { data: liveTests, isLoading, isError } = useQuery(
  //   ['liveTests', key],
  //   () => fetchLiveTest(key === 'LIVE' ? 0 : key === 'UPCOMING' ? 1 : 2),
  //   {
  //     onError: () => {
  //       setShowError(true);
  //     },
  //     retry: false,
  //     refetchOnWindowFocus: false,
  //   }
  // );

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const fetchLiveTest = async (type) => {
    try {
      const formData = {
        page: 1,
        type: type,
      };
      const encryptedData = encrypt(JSON.stringify(formData), token);
      const response = await getLiveTestService(encryptedData);
      const decryptedData = decrypt(response.data, token);
      // console.log("decryptedData", decryptedData);
      if (decryptedData?.status) {
        if (decryptedData?.data?.length == 0) {
          setShowError(true);
        } else {
          setLiveTests(decryptedData.data);
        }
      } else {
        if (decryptedData.message == msg) {
          localStorage.removeItem("jwt");
          localStorage.removeItem("user_id");
          router.push("/");
          setLiveTests([]);
          setShowError(true);
        } else {
          setLiveTests([]);
          setShowError(true);
        }
        // throw new Error(decryptedData.message || "Error fetching data");
      }
    } catch (error) {
      console.log("error found: ", error);
      router.push("/");
    }
  };

  useEffect(() => {
    setShowError(false);
    setLiveTests([]);
    if (key == "LIVE") {
      fetchLiveTest(0);
    } else if (key == "UPCOMING") {
      fetchLiveTest(1);
    } else {
      fetchLiveTest(2);
    }
  }, [key]);
  const handleTabChange = (k) => {
    setKey(k);
    setShowError(false); // Reset the error when changing tabs
  };

  const handleCallFunction = () => {
    // console.log("test");
    fetchLiveTest(key === "LIVE" ? 0 : key === "UPCOMING" ? 1 : 2);
  };

  return (
    <>
      {/* <Toaster position="top-right" reverseOrder={false} />  */}
      <section className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <Tabs
              defaultActiveKey="LIVE"
              id="uncontrolled-tab-example"
              className="CustomTab mb-3"
              activeKey={key}
              onSelect={(k) => handleTabChange(k)}
            >
              {/* {["LIVE", "UPCOMING", "COMPLETED"].map((tabKey) => (
                <Tab eventKey={tabKey} title={tabKey} key={tabKey}>
                  <div className="row">
                    {isLoading ? (
                      <LoaderAfterLogin />
                    ) : isError || !liveTests?.length ? (
                      <ErrorPageAfterLogin />
                    ) : (
                      liveTests.map((item, index) => (
                        <LiveTestCard testData={item} value={key} key={index} />
                      ))
                    )}
                  </div>
                </Tab>
              ))} */}

              <Tab eventKey="LIVE" title="LIVE">
                <div className="row">
                  {liveTests?.length > 0 ? (
                    liveTests.map((item, index) => {
                      return (
                        <LiveTestCard
                          testData={item}
                          value={key}
                          key={index}
                          popupRef={popupRef}
                          intervalRef={intervalRef}
                          handleCallFunction={handleCallFunction}
                        />
                      );
                    })
                  ) : (
                    <>
                      {showError ? (
                        <ErrorPageAfterLogin />
                      ) : (
                        <LoaderAfterLogin />
                      )}
                    </>
                  )}
                </div>
              </Tab>
              <Tab eventKey="UPCOMING" title="UPCOMING">
                <div className="row">
                  {liveTests?.length > 0 ? (
                    liveTests.map((item, index) => {
                      return (
                        <LiveTestCard
                          testData={item}
                          value={key}
                          key={index}
                          popupRef={popupRef}
                          intervalRef={intervalRef}
                          handleCallFunction={handleCallFunction}
                        />
                      );
                    })
                  ) : (
                    <>
                      {showError ? (
                        <ErrorPageAfterLogin />
                      ) : (
                        <LoaderAfterLogin />
                      )}
                    </>
                  )}
                </div>
              </Tab>
              <Tab eventKey="COMPLETED" title="COMPLETED">
                <div className="row">
                  {liveTests?.length > 0 ? (
                    liveTests.map((item, index) => {
                      return (
                        <LiveTestCard
                          testData={item}
                          value={key}
                          key={index}
                          popupRef={popupRef}
                          intervalRef={intervalRef}
                          handleCallFunction={handleCallFunction}
                        />
                      );
                    })
                  ) : (
                    <>
                      {showError ? (
                        <ErrorPageAfterLogin />
                      ) : (
                        <LoaderAfterLogin />
                      )}
                    </>
                  )}
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </section>
    </>
  );
};

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default LiveTest;
