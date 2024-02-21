import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil } from '@fortawesome/free-solid-svg-icons'

const InputPreview = ({ value, onClick, className }) => {
  if (value === null || value === '') {
    return null
  } else {
    return (
      <div className={className} onClick={onClick}>
        <span className="pr-2">{value}</span>
        <FontAwesomeIcon icon={faPencil} />
      </div>
    )
  }
}

InputPreview.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
}

export default InputPreview
