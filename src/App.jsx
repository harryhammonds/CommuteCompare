import { useState, useEffect } from 'react'
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
import { convertTimeToISO } from './components/convertTimeToISO'
import { v4 as uuidv4 } from 'uuid'

const randomUUID = uuidv4()

function App() {
  const [activeStep, setActiveStep] = useState(0)
  // to stop useEffect from running if we are intentionally changing our destination (activeStep === 0) inputs
  const [alreadyLoaded, setAlreadyLoaded] = useState(false)

  // SEARCH PARAMS
  useEffect(() => {
    if ((activeStep === 0 && !alreadyLoaded) || activeStep === 3) {
      const timeParam = searchParams.get('time')
      const originParam = searchParams.get('origin')
      const destinationParam = searchParams.get('destination')

      if (originParam && destinationParam && timeParam) {
        const origin = async () => {
          if (mapOriginCoord.length === 0) {
            const feature = await getMapboxFeature(originParam)
            return feature
          } else {
            return mapOriginCoord
          }
        }

        const destination = async () => {
          if (mapDestinationCoord.length === 0) {
            const feature = await getMapboxFeature(destinationParam)
            return feature
          } else {
            return mapDestinationCoord
          }
        }

        const prepareData = async () => {
          const originCoord = await origin()
          const destinationCoord = await destination()
          await prepareMatrix(timeParam, originCoord, destinationCoord)
        }

        prepareData()

        if (activeStep === 0) {
          setActiveStep(4)
        }
      }
    }
  }, [activeStep])

  const [searchParams, setSearchParams] = useSearchParams()

  const setParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set(key, value)
    setSearchParams(newParams)
  }
  const [values, setValues] = useState([])

  const [mapDestinationCoord, setMapDestinationCoord] = useState([])
  const [mapOriginCoord, setMapOriginCoord] = useState([])

  const getMapboxFeature = async (mapboxId) => {
    try {
      const response = await fetch(
        `/api/retrieve?mapboxId=${mapboxId}&randomUUID=${randomUUID}`
      )
      const data = await response.json()

      return data.features[0].geometry.coordinates
    } catch (error) {
      console.error(error)
    }
  }

  const updateDest = async (mapboxId) => {
    setParam('destination', mapboxId)
    const coord = await getMapboxFeature(mapboxId)
    setMapDestinationCoord(coord)
  }

  const updateOrigin = async (mapboxId) => {
    setParam('origin', mapboxId)
    const coord = await getMapboxFeature(mapboxId)
    setMapOriginCoord(coord)
  }

  const [matrix, setMatrix] = useState({})
  const [walkMatrix, setWalkMatrix] = useState({})
  const [cycleMatrix, setCycleMatrix] = useState({})

  const prepareMatrix = async (timeVal, originCoord, destinationCoord) => {
    const time = convertTimeToISO(timeVal)

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
      return 'pb-8 transition-all translate-y-[-300px] duration-1000 w-80 sm:w-96'
    } else if (activeStep === step) {
      return 'pb-8 pt-2 transition-all w-80 sm:w-96'
    } else if (activeStep === 3) {
      return 'opacity-0 transition-all w-80 sm:w-96'
    } else if (activeStep === 4) {
      return 'hidden transition-all w-80 sm:w-96'
    } else {
      return 'w-80 sm:w-96'
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

  function goBack() {
    if (mapOriginCoord.length === 0 || mapDestinationCoord.length === 0) {
      setSearchParams('') // clear search params
      setActiveStep(0)
    } else {
      setActiveStep(-1)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center py-auto pl-6 sm:pl-10 pr-6 h-16">
        <h1 className="font-display text-xl">COMMUTE ANALYSIS</h1>
        <a
          href="https://github.com/harryhammonds/CommuteCompare"
          target="_blank"
          rel="noreferrer"
        >
          <h2 className="text-xs sm:text-sm">github.com/harryhammonds</h2>
        </a>
      </div>
      <div className="flex flex-col md:flex-row w-full flex-grow overflow-y-auto">
        <div className="h-72 md:h-full w-full md:pl-8">
          <Map
            className="w-full h-full"
            originCoord={mapOriginCoord}
            destinationCoord={mapDestinationCoord}
          />
        </div>

        <div
          className={`flex justify-between ${activeStep === 4 ? 'md:w-[75rem]' : 'md:w-[60rem]'} md:pt-12 max-h-screen transition-all overflow-y-auto`}
        >
          <div className="flex items-start flex-col pl-3 sm:pl-6 [&_h2]:text-xl">
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
                  className="border-2 border-gray-400 border-solid font-mono pt-2 pl-2 pr-6 text-sm sm:text-base w-[20rem] sm:w-96 transition-all"
                  id="destination"
                />
              ) : (
                <InputPreview
                  value={value(0)}
                  onClick={() => setActiveStep(0)}
                  className="text-neutral-400 font-mono text-left pl-12 underline decoration-dashed underline-offset-2 cursor-pointer transition-all"
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
                  value={value(1)}
                  placeholder="please enter commute origin..."
                  onComplete={(e) => {
                    updateOrigin(e[1])
                    setValues((values) => [values[0], e, ...values.slice(2)]) // update second value
                    setActiveStep(2)
                  }}
                  randomUUID={randomUUID}
                  className="border-2 border-gray-400 border-solid font-mono pt-2 pl-2 pr-6 text-sm sm:text-base w-[20rem] sm:w-96 transition-all"
                  id="origin"
                />
              ) : (
                <InputPreview
                  value={value(1)} // or get from search params -> address from a const made available to the input form !!! TODAY
                  onClick={() => setActiveStep(1)}
                  className="text-neutral-400 font-mono text-left pl-12 underline decoration-dashed underline-offset-2 cursor-pointer transition-all"
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
                  value={value(2)}
                  placeholder="please enter journey start time..."
                  onComplete={(e) => {
                    //prepareMatrix(e[0])
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
                      setAlreadyLoaded(true)
                    }, 1000)
                  }}
                  className="border-2 border-gray-400 border-solid font-mono pt-2 pl-2 pr-6 text-sm sm:text-base w-[20rem] sm:w-96 transition-all"
                  id="time"
                />
              ) : (
                <InputPreview
                  value={value(2)}
                  onClick={() => setActiveStep(2)}
                  className="text-neutral-400 font-mono text-left pl-12 underline decoration-dashed underline-offset-2 cursor-pointer transition-all"
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
                  onClick={() => goBack()}
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
