import React, { useEffect, useState } from 'react'
import { format } from "date-fns";
import MQTTLivePollOptions from './MQTTLivePollOptions';

const MQTTLivePoll = ({listenURL, port, settingNode, chatNode, course_id, isPublic, locked_room, pollData, renderCountdown, video_id, pollSocketURL, pendingTime, blinkerShow}) => {

    const [combinedPollDatas, setCombinedPollDatas] = useState([])
    const [expiredPolls, setExpiredPolls] = useState([]); // Tracks polls whose delay has passed
    

    useEffect(() => {
        setCombinedPollDatas(pollData.reverse())
    }, [pollData])

    useEffect(() => {
      const timer = setInterval(() => {
        const currentUnixTime = Math.floor(Date.now() / 1000); // Current Unix time in seconds
  
        // Check for polls whose delay is less than or equal to the current time
        const updatedExpiredPolls = combinedPollDatas.filter((poll) => poll?.delay <= currentUnixTime);
  
        // Update the state only if there are changes to avoid unnecessary re-renders
        if (updatedExpiredPolls.length !== expiredPolls.length) {
          setExpiredPolls(updatedExpiredPolls);
        }
      }, 1000); // Check every second
  
      return () => clearInterval(timer); // Clean up the timer on component unmount
    }, [combinedPollDatas, expiredPolls]);

    // console.log('combinedPoll', combinedPollDatas)

  return (
    <div className="holder">
      {combinedPollDatas?.length > 0 &&
        combinedPollDatas.map((poll, index) => {
          const isExpired = expiredPolls.some((expiredPoll) => expiredPoll?.firebase_id === poll?.firebase_id);

          if (isExpired) {
            // blinkerShow()
            return <MQTTLivePollOptions
              key={poll?.firebase_id}
              poll={poll}
              renderCountdown={renderCountdown}
              index={index}
              video_id = {video_id}
              pollSocketURL = {pollSocketURL}
              pendingTime = {pendingTime}
              // handleSubmitAnswer = {handleSubmitAnswer}
              // database = {database}
              // chat_node = {chat_node}
              // getFireBaseKey = {getFireBaseKey}
            />
          }
        }
        )}
    </div>
  )
}

export default MQTTLivePoll