import React, { useEffect, useState } from 'react'
import Footer from '@/component/footer/footer'
import Header from '@/component/header/header'
import { aboutUsService } from '@/services'
import { decrypt, encrypt, get_token } from '@/utils/helpers'

const index = () => {

  const [aboutUsData, setAboutUsData] = useState('');
  const token = get_token()

  useEffect(() => {
    fetchAboutService()
  }, [])

  const fetchAboutService = async () => {
    try{
      // console.log('hjghhgjh')
      const formData = {}
      const response_aboutUs_service = await aboutUsService();
      if(response_aboutUs_service.status) {
        setAboutUsData(response_aboutUs_service.data)
      }
      // console.log('response_aboutUs_data', response_aboutUs_service)
      // const response_aboutUs_data = decrypt(response_aboutUs_service.data, token);
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }
   
  return (
    <>
    <Header search={"disable"} />
      <div className="container-fluid detailTopContainer mb-5">
        <div className={`row`}>
          <div className={`col-sm-12 col-md-7 col-lg-6`}>
            <div className="d-flex align-items-center careertextContent">
              <div>
                <h3 className="m-0 bannerTitle mb-4">
                  About us
                </h3>
                <p className="careerBannerText">
                  Have questions? Here you’ll find the answers most valued by our partners, along with access to step-by-step
                  instructions & support.
                </p>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-5 d-flex justify-content-end">
            <img
              className="careerBannerImg d-none d-md-none d-lg-block mt-3 mb-3"
              src="/assets/images/faqImage.svg"
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="container-fluid careerMainSection mb-5">
        <div className="row mt-5">
          {/* <div className="text-center whycont_width col-md-12 mx-auto mb-3">
            <h4 className="m-0 mb-3 whyTtile">Frequently Asked Questions</h4>
            {faqData?.length > 0 && (
            <div className="p-0 mt-4">
                <div className="accordion accordion-flush" id="faqlist" style={{textAlign: 'start'}}>
                  {faqData?.map((item, index) => {
                    return <div className="accordion-item" key = {index}>
                    <h2
                      className="accordion-header"
                      onClick={() => index != active ? setActive(index) : setActive(-1)}
                    >
                      <button
                        className={`accordion-button ${
                          active !== index && "collapsed"
                        }`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-content-0"
                      >
                        {item.question}
                      </button>
                    </h2>
                    <div
                      id="faq-content-0"
                      className={`accordion-collapse collapse accrdbtn ${
                        active == index && "show"
                      }`}
                      data-bs-parent="#faqlist"
                    >
                      <div className="accordion-body">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  })}
                </div>
              </div>
            )}
          </div> */}
        </div>
        </div>
      <Footer />
    </>
    // <Header />
    // <div className='container-fluid p-0 mt-5' >
    //   <div className='' dangerouslySetInnerHTML={{ __html: aboutUsData && aboutUsData }}>
    //   </div>
    // </div>
    // <Footer />
    
  )
}

export default index