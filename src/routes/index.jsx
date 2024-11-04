import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/home'

const RoutePage = ({tenantName}) => {

  const [profile, setProfile] = useState({})

//   useEffect(() => {
//     setProfile(profileMap[tenantName]);
//   }, [tenantName])


//   if(profile){

  return (
    <>
        {/* <Routes> */}
            {/* <Route exact path='/' element={<Home />} /> */}
        {/* </Routes> */}
        {/* {tenantName &&  */}
          <Home />
        {/* } */}
    </>
  )
// }
}

export default RoutePage