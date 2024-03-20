import { useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import OutsideClickHandler from './OutsideClickHandler'

const Filters = ({ vehicleType, onChange }) => {
  const [isClicked, setIsClicked] = useState(false)

  function onClick() {
    setIsClicked(!isClicked)
  }

  function onClickOutside() {
    setIsClicked(false)
  }

  function onRadioChange(e) {
    onChange(e.target.value)
  }

  return (
    <>
      <OutsideClickHandler onOutsideClick={() => onClickOutside()}>
        <button onClick={() => onClick()} alt="filter and sort">
          <FontAwesomeIcon icon={faFilter} className="text-neutral-600 p-3" />
        </button>
        {isClicked && (
          <div className="absolute transform left-[10%] top-12 z-10 bg-indigo-100 p-4 rounded-md shadow-lg w-full sm:w-auto">
            <button onClick={onClick} className="p-1 float-right">
              X
            </button>
            FILTER - TYPE SELECTION
            <form className="w-[23rem] pt-2">
              <div className="p-1">
                <input
                  type="radio"
                  name="fuel"
                  id="fuel-all"
                  value=""
                  onChange={onRadioChange}
                  checked={vehicleType === ''}
                />
                <label htmlFor="fuel-all"> All fuel types </label>
              </div>
              <div className="p-1">
                <input
                  type="radio"
                  name="fuel"
                  id="fuel-EV"
                  value="EV"
                  onChange={onRadioChange}
                  checked={vehicleType === 'EV'}
                />
                <label htmlFor="fuel-EV"> EV </label>
              </div>
              <div className="p-1">
                <input
                  type="radio"
                  name="fuel"
                  id="fuel-Hybrid"
                  value="Hybrid"
                  onChange={onRadioChange}
                  checked={vehicleType === 'Hybrid'}
                />
                <label htmlFor="fuel-Hybrid"> Hybrid </label>
              </div>
              <div className="p-1">
                <input
                  type="radio"
                  name="fuel"
                  id="fuel-PHEV"
                  value="PHEV"
                  onChange={onRadioChange}
                  checked={vehicleType === 'PHEV'}
                />
                <label htmlFor="fuel-PHEV"> PHEV </label>
              </div>
            </form>
          </div>
        )}
      </OutsideClickHandler>
    </>
  )
}

export default Filters

Filters.propTypes = {
  vehicleType: PropTypes.string,
  onChange: PropTypes.func,
}
