import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons'

const BackButton = ({ onClick, className }) => {
  return (
    <button className={className} onClick={onClick} alt="Go back">
      <FontAwesomeIcon icon={faRotateLeft} />
    </button>
  )
}

BackButton.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
}

export default BackButton
