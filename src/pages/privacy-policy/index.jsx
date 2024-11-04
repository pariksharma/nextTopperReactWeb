import Footer from '@/component/footer/footer'
import Header from '@/component/header/header'
import { policyService } from '@/services';
import { decrypt, get_token } from '@/utils/helpers';
import React, { useEffect, useState } from 'react'

const index = () => {
  
  const [policyData, setPolicyData] = useState('');
  const token = get_token()

  useEffect(() => {
    fetchPolicyService()
  }, [])
 
  const fetchPolicyService = async () => {
    try{
      const formData = {}
      const response_policy_service = await policyService();
      if(response_policy_service.status) {
        setPolicyData(response_policy_service.data)
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }
  return (
    <>
        <Header />
        <div className="container-fluid privacyPolicy">
          <div
            className=""
            dangerouslySetInnerHTML={{ __html: policyData && policyData }}
          ></div>
        </div>
        <Footer />
    </>
  )
}

export default index