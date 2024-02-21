import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import OutsideClickHandler from './OutsideClickHandler'
import { mod } from './Mod'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

const Autocomplete = ({
  source,
  placeholder,
  value,
  onComplete,
  randomUUID,
  className,
  id,
}) => {
  const [inputValue, setInputValue] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)

  const input = useRef()

  // KEY PRESS ON SHOWSUGGESTIONS
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showSuggestions) {
        switch (event.key) {
          case 'Tab':
          case 'ArrowDown':
            event.preventDefault()
            setActiveSuggestion((prevActiveSuggestion) =>
              mod(prevActiveSuggestion + 1, suggestions.length)
            )
            break
          case 'ArrowUp':
            event.preventDefault()
            setActiveSuggestion((prevActiveSuggestion) =>
              mod(prevActiveSuggestion - 1, suggestions.length)
            )
            break
          case 'Enter':
            setInputValue(suggestions[activeSuggestion][0])
            setShowSuggestions(false)
            break
          default:
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // remove event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSuggestions]) // run the effect when showSuggestions changes

  // MAPBOX ORIGIN AND DESTINATION
  const getMapboxSuggestions = async (value) => {
    try {
      const response = await fetch(
        `/api/suggest?value=${value}&randomUUID=${randomUUID}`
      )
      const data = await response.json()
      const suggestionsList = []

      for (let i = 0; i < data.suggestions.length; i++) {
        suggestionsList.push({
          0: data.suggestions[i].name || '',
          1: data.suggestions[i].full_address || '',
          2: data.suggestions[i].mapbox_id || '',
        })
      }

      setSuggestions(suggestionsList)
    } catch (error) {
      console.error(error)
    }
  }

  /*   const getMapboxFeature = async (mapboxId) => {
    try {
      const response = await fetch(
        `/api/retrieve?mapboxId=${mapboxId}&randomUUID=${randomUUID}`
      )
      const data = await response.json()
      onComplete(data.features[0].geometry.coordinates)
    } catch (error) {
      console.error(error)
    }
  } */

  // TRIP TIME
  const getTimeSuggestions = async (value) => {
    let suggestionsList = []
    const periods = [' AM', ' PM']

    periods.forEach((period) => {
      // 12 hours, 10 minute increments
      for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 60; j += 10) {
          // remove 0th hour and use modular arithmetic for correct ordering
          if (j < 10 && i !== 1) {
            suggestionsList.push({ 0: mod(i - 1, 13) + ':' + '0' + j + period })
          } else if (i !== 1) {
            suggestionsList.push({ 0: mod(i - 1, 13) + ':' + j + period })
          }
        }
      }
    })

    const isValidTimeFormat = (value) => {
      const timeFormat = /^[1-9][0-2]?:[0-5][1-9]( |$)/ // allows a space or nothing after last digit
      return timeFormat.test(value)
    }

    if (isValidTimeFormat(value)) {
      let shortValue = value.split(' ')[0] // remove AM/PM component
      suggestionsList.push({ 0: shortValue + ' AM' })
      suggestionsList.push({ 0: shortValue + ' PM' })
    }

    suggestionsList = suggestionsList.filter((suggestion) => {
      return suggestion[0].startsWith(value.toUpperCase())
    })

    const isCompleteTimeFormat = (value) => {
      const timeFormat = /^[1-9][0-2]?:[0-5][0-9] (AM|PM)$/
      return timeFormat.test(value.toUpperCase())
    }

    if (isCompleteTimeFormat(value)) {
      value = value.toUpperCase()
      setInputValue(value)
      setShowSuggestions(false)
    } else {
      setShowSuggestions(true)
    }

    setSuggestions(suggestionsList)
  }

  if (source !== 'mapbox' && source !== 'time') {
    setSuggestions([])
  }

  const onChange = (e) => {
    setInputValue(e.target.value)

    if (source === 'mapbox' && e.target.value.length > 3 && randomUUID) {
      getMapboxSuggestions(e.target.value)
      setShowSuggestions(true)
    }

    if (source === 'time') {
      getTimeSuggestions(e.target.value)
    }

    setActiveSuggestion(0)
  }

  const onClick = (e) => {
    const text = e.target.innerText.replace(/\n/g, ', ')
    setInputValue(text)

    onComplete({
      0: text,
      1: suggestions[0][2] || null,
    })

    setShowSuggestions(false)
  }

  const clearText = () => {
    setInputValue('')

    setShowSuggestions(false)
  }

  let suggestionsListComponent

  if (showSuggestions) {
    suggestionsListComponent = (
      <ul className="max-h-80 overflow-y-scroll cursor-pointer hide-scrollbar">
        {suggestions.map((suggestion, index) => {
          let className = 'hover:bg-blue-100 bg-white'

          if (index === activeSuggestion) {
            className = 'bg-blue-100'
          }

          return (
            <li
              className={className}
              key={suggestion[2] || suggestion[0]} // mapbox_id or time
              onClick={onClick}
            >
              {suggestion[0]}
              {suggestion[1] ? <br /> : null}
              {suggestion[1]}
            </li>
          )
        })}
      </ul>
    )
  }

  let clearTextStyle

  if (inputValue.length === 0) {
    clearTextStyle = 'hidden'
  } else {
    clearTextStyle = 'absolute right-2 top-2'
  }

  return (
    <>
      <OutsideClickHandler onOutsideClick={() => setShowSuggestions(false)}>
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={onChange}
            onClick={onChange}
            placeholder={placeholder}
            ref={input}
            className={className}
            id={id}
          />
          <button
            className={clearTextStyle}
            onClick={clearText}
            alt="Clear text"
          >
            <FontAwesomeIcon icon={faX} size="xs" />
          </button>
        </div>
        {suggestionsListComponent}
      </OutsideClickHandler>
    </>
  )
}

Autocomplete.propTypes = {
  source: PropTypes.string.isRequired,
  value: PropTypes.string,
  onComplete: PropTypes.func,
  placeholder: PropTypes.string,
  randomUUID: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
}

export default Autocomplete
