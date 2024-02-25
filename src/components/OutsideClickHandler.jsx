import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const OutsideClickHandler = ({ onOutsideClick, children, className }) => {
  const ref = useRef()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, onOutsideClick]) // rerun if ref or onOutsideClick changes

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export default OutsideClickHandler

OutsideClickHandler.propTypes = {
  onOutsideClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}
