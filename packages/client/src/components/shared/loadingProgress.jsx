import React from 'react'
import '../../assets/css/loadingProgress.css'
import CircularProgress from '@material-ui/core/CircularProgress'
function LoadingProgress(props) {
  return (
    <div
      className={
        'progress__container d-flex justify-content-center align-items-center'
      }
    >
      <CircularProgress />
      <p className="ml-3 mt-3">{props.text}</p>
    </div>
  )
}
export default LoadingProgress
