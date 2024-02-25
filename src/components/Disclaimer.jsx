import { useState } from 'react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo } from '@fortawesome/free-solid-svg-icons'
import Button from '@mui/material/Button'
import OutsideClickHandler from './OutsideClickHandler'

const Disclaimer = ({ className }) => {
  const [isClicked, setIsClicked] = useState(false)

  function onClick() {
    setIsClicked(!isClicked)
  }

  function onClickOutside() {
    setIsClicked(false)
  }

  return (
    <OutsideClickHandler
      onOutsideClick={() => onClickOutside()}
      className={className}
    >
      <Button variant="text" color="secondary" onClick={() => onClick()}>
        <FontAwesomeIcon icon={faInfo} className="p-2 fa-sm" />
        Disclaimer
      </Button>
      {isClicked && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-red-200 p-4 rounded-lg shadow-lg w-full sm:w-auto">
          <button onClick={onClick} className="p-1 float-right">
            X
          </button>
          <h2 className="font-display">INFORMATION AND ASSUMPTIONS</h2>
          <p>
            This is a work in progress coding project so please do not take the
            information seriously for now.
          </p>
          {/* <p>
            For now, premium fuel is loosely defined and is assumed to have a 7%
            higher price.
          </p> 
          <p>CNG/LPG/Hydrogen data should be considered inaccurate.</p>
          <p>Electricity mix and site data not precise.</p>*/}
          <p>
            Although based on government data, the information presented is
            based on my calculations which may not be correct due to incorrect
            assumptions about the data or otherwise. This software was not
            endorsed by any agency.
          </p>
          <p>American car names, models, years in the data.</p>
          <p>Use at your own risk.</p>
        </div>
      )}
    </OutsideClickHandler>
  )
}

export default Disclaimer

Disclaimer.propTypes = {
  className: PropTypes.string,
}
