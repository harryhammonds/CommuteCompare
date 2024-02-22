import { useState } from 'react'
import './App.css'
import '@fontsource/courier-prime/400.css'
import '@fontsource/courier-prime/700.css'
import '@fontsource/kosugi'
import '@fontsource/kosugi-maru'

import { useSearchParams } from 'react-router-dom'
import Autocomplete from './components/Autocomplete'
import Map from './components/Map'
import InputPreview from './components/InputPreview'
import BackButton from './components/BackButton'
import Results from './components/Results'
import { v4 as uuidv4 } from 'uuid'

const randomUUID = uuidv4()

function App() {
  // SEARCH PARAMS
  const [searchParams, setSearchParams] = useSearchParams()

  const setParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set(key, value)
    setSearchParams(newParams)
  }
  const [values, setValues] = useState([])
  const [activeStep, setActiveStep] = useState(0)

  const [destinationCoord, setDestinationCoord] = useState([])
  const [originCoord, setOriginCoord] = useState([])

  const getMapboxFeature = async (mapboxId) => {
    try {
      const response = await fetch(
        `/api/retrieve?mapboxId=${mapboxId}&randomUUID=${randomUUID}`
      )
      const data = await response.json()

      return [
        data.features[0].geometry.coordinates[0],
        data.features[0].geometry.coordinates[1],
      ]
    } catch (error) {
      console.error(error)
    }
  }

  const updateDest = async (mapboxId) => {
    setParam('destination', mapboxId)
    const coord = await getMapboxFeature(mapboxId)
    setDestinationCoord(coord)
  }

  const updateOrigin = async (mapboxId) => {
    setParam('origin', mapboxId)
    const coord = await getMapboxFeature(mapboxId)
    setOriginCoord(coord)
  }

  const [matrix, setMatrix] = useState({})
  const [walkMatrix, setWalkMatrix] = useState({})
  const [cycleMatrix, setCycleMatrix] = useState({})

  function convertTimeToISO(timeStr) {
    const currentDate = new Date()
    const [time, modifier] = timeStr.split(' ')
    let [hours, minutes] = time.split(':')

    if (modifier === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12
    } else if (modifier === 'AM' && hours === '12') {
      hours = '00'
    }

    hours = parseInt(hours)
    minutes = parseInt(minutes)

    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate() + 1).padStart(2, '0')

    if (hours < 10) {
      hours = '0' + hours
    }

    if (minutes < 10) {
      minutes = '0' + minutes
    }

    const formattedDate = `${currentDate.getFullYear()}-${month}-${day}T${hours}:${minutes}`

    return formattedDate
  }

  const prepareMatrix = async (timeVal) => {
    const time = convertTimeToISO(timeVal)

    if (originCoord.length === 0) {
      const origin = await getMapboxFeature(searchParams.get('origin'))
      setOriginCoord(origin)
    }

    if (destinationCoord.length === 0) {
      const destination = await getMapboxFeature(
        searchParams.get('destination')
      )
      setOriginCoord(destination)
    }

    try {
      const driving = await fetch(
        `/api/matrix/driving-traffic/${originCoord[0]},${originCoord[1]};${destinationCoord[0]},${destinationCoord[1]}?depart_at=${time}`
      )
      const data = await driving.json()
      setMatrix(data)
    } catch (error) {
      console.error(error)
    }

    try {
      const cycling = await fetch(
        `/api/matrix/cycling/${originCoord[0]},${originCoord[1]};${destinationCoord[0]},${destinationCoord[1]}`
      )
      const data = await cycling.json()
      setCycleMatrix(data)
    } catch (error) {
      console.error(error)
    }

    try {
      const walking = await fetch(
        `/api/matrix/walking/${originCoord[0]},${originCoord[1]};${destinationCoord[0]},${destinationCoord[1]}`
      )
      const data = await walking.json()
      setWalkMatrix(data)
    } catch (error) {
      console.error(error)
    }
  }

  function getStepClass(step) {
    if (activeStep === step && step === 3) {
      return 'pb-8 transition-all translate-y-[-300px] duration-1000 w-96'
    } else if (activeStep === step) {
      return 'pb-8 pt-2 transition-all w-96'
    } else if (activeStep === 3) {
      return 'opacity-0 transition-all w-96'
    } else if (activeStep === 4) {
      return 'hidden transition-all'
    } else {
      return ''
    }
  }

  function getHeaderClass(step) {
    if (activeStep === step || (activeStep === 4 && step === 3)) {
      return 'pt-6 pb-3 w-max'
    } else {
      return 'pt-6 pb-3 w-max pl-8 text-neutral-400 transition-all duration-500'
    }
  }

  const value = (index) => {
    return (values && values[index] && values[index][0]) || '' //searchParams.get('origin') ||
  }

  function activeStepIndicator() {
    const indicators = []
    if (activeStep < 4) {
      for (let i = 0; i < 4; i++) {
        if (activeStep === i) {
          indicators.push(
            <div
              className="w-2 h-2 bg-neutral-400 rounded-full mx-3 my-20 transition-all duration-1000"
              key={i}
            ></div>
          )
        } else {
          indicators.push(
            <div
              className="w-1 h-1 bg-black rounded-full mx-3 my-3 transition-all duration-1000"
              key={i}
            ></div>
          )
        }
      }
    }
    return indicators
  }

  return (
    <>
      <div className="flex justify-between items-center py-6 pl-6 sm:pl-10 pr-6">
        <h1 className="font-display text-xl">COMMUTE ANALYSIS</h1>
        <a
          href="https://github.com/harryhammonds/CommuteCompare"
          target="_blank"
          rel="noreferrer"
        >
          <h2 className="text-xs sm:text-sm">github.com/harryhammonds</h2>
        </a>
      </div>
      <div className="flex flex-col md:flex-row w-full">
        <div className="h-72 md:h-[100vh] w-full md:pl-8">
          <Map
            className="w-full h-full"
            originCoord={originCoord}
            destinationCoord={destinationCoord}
          />
        </div>

        <div
          className={`flex justify-between ${activeStep === 4 ? 'md:w-[60rem]' : 'md:w-[50rem]'} md:pt-12 transition-all`}
        >
          <div className="flex items-start flex-col pl-6 [&_h2]:text-xl w-full">
            <div className={getStepClass(0)}>
              <h2 className={getHeaderClass(0)}>
                <span className="text-4xl">1.</span> Destination
              </h2>
              {activeStep === 0 ? (
                <Autocomplete
                  source="mapbox"
                  value={value(0)}
                  placeholder="please enter commute destination..."
                  onComplete={(e) => {
                    updateDest(e[1])
                    setValues((values) => [e, ...values.slice(1)]) // update first value
                    setActiveStep(1)
                  }}
                  randomUUID={randomUUID}
                  className="border-2 border-gray-400 border-solid font-mono pt-2 pl-2 pr-6 w-96 transition-all"
                  id="destination"
                />
              ) : (
                <InputPreview
                  value={value(0)}
                  onClick={() => setActiveStep(0)}
                  className="text-neutral-400 font-mono w-[80vw] text-left pl-12 underline decoration-dashed underline-offset-2 cursor-pointer transition-all"
                />
              )}
            </div>
            <div className={getStepClass(1)}>
              <h2 className={getHeaderClass(1)}>
                <span className="text-4xl">2.</span> Home Address
              </h2>
              {activeStep === 1 ? (
                <Autocomplete
                  source="mapbox"
                  value={
                    //(values && values[1] && values[1][0]) || //searchParams.get('origin') ||
                    //''
                    value(1)
                  }
                  placeholder="please enter commute origin..."
                  onComplete={(e) => {
                    updateOrigin(e[1])
                    setValues((values) => [values[0], e, ...values.slice(2)]) // update second value
                    setActiveStep(2)
                  }}
                  randomUUID={randomUUID}
                  className="border-2 border-gray-400 border-solid font-mono pt-2 pl-2 pr-6 w-96"
                  id="origin"
                />
              ) : (
                <InputPreview
                  value={value(1)} // or get from search params -> address from a const made available to the input form !!! TODAY
                  onClick={() => setActiveStep(1)}
                  className="text-neutral-400 font-mono w-[80vw] text-left pl-12 underline decoration-dashed underline-offset-2 cursor-pointer transition-all"
                />
              )}
            </div>
            <div className={getStepClass(2)}>
              <h2 className={getHeaderClass(2)}>
                <span className="text-4xl">3.</span> Time of Day
              </h2>
              {activeStep === 2 ? (
                <Autocomplete
                  source="time"
                  value={
                    //(values && values[2] && values[2][0]) || //searchParams.get('time') ||
                    //''
                    value(2)
                  }
                  placeholder="please enter journey start time..."
                  onComplete={(e) => {
                    prepareMatrix(e[0])
                    setParam('time', e[0])
                    setValues((values) => [
                      values[0],
                      values[1],
                      e,
                      ...values.slice(3),
                    ]) // update third value
                    setActiveStep(3)
                    setTimeout(() => {
                      setActiveStep(4)
                    }, 1000)
                  }}
                  className="border-2 border-gray-400 border-solid font-mono pt-2 pl-2 pr-6 w-96"
                  id="time"
                />
              ) : (
                <InputPreview
                  value={value(2)}
                  onClick={() => setActiveStep(2)}
                  className="text-neutral-400 font-mono w-[80vw] text-left pl-12 underline decoration-dashed underline-offset-2 cursor-pointer transition-all"
                />
              )}
            </div>
            <div className={getStepClass(3)}>
              <h2 className={getHeaderClass(3)}>
                <span className="text-4xl">4.</span> Compare Modes
              </h2>
            </div>
            <div className={activeStep === 4 ? 'w-full' : 'hidden'}>
              <h2 className={getHeaderClass(3)}>
                <span className="text-4xl">4.</span> Compare Modes{' '}
                <BackButton
                  className="inline pl-3 cursor-pointer transition-all"
                  onClick={() => setActiveStep(-1)}
                />
              </h2>

              {activeStep === 4 && (
                <Results
                  className="text-left w-full py-2 pr-2 sm:px-6"
                  matrix={matrix}
                  walkMatrix={walkMatrix}
                  cycleMatrix={cycleMatrix}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col items-center pt-20">
            {activeStepIndicator()}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
