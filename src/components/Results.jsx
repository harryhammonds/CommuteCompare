import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

import Slider from '@mui/material/Slider'
import Input from '@mui/material/Input'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import Button from '@mui/material/Button'

import Disclaimer from './Disclaimer'
import getCO2Figures from './getCO2Figures'

import carImage from '../assets/driving.svg'
import walkImage from '../assets/walking.svg'
import cycleImage from '../assets/cycling.svg'
import Filters from './Filters'

const Results = ({ className, matrix, walkMatrix, cycleMatrix }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicleType, setVehicleType] = useState('')

  const [electricityRenewCO2, setElectricityRenewCO2] = useState(40)
  const [electricityNonRenewCO2, setElectricityNonRenewCO2] = useState(250)
  const [renewableShare, setRenewableShare] = useState(80)
  const [fuelCost, setFuelCost] = useState(2.8)
  const [electricityCost, setElectricityCost] = useState(0.32)

  useEffect(() => {
    // need to check for missing API data on load
    if (searchQuery === '') {
      if (walkMatrix.distances && cycleMatrix.distances) {
        getWalkCycleData()
      }
      searchData('toyota 2023', 0)
    } else {
      searchData(searchQuery, 0)
    }
  }, [
    searchQuery,
    matrix,
    walkMatrix,
    cycleMatrix,
    vehicleType,
    fuelCost,
    electricityCost,
    renewableShare,
    electricityRenewCO2,
    electricityNonRenewCO2,
  ])

  const [walkDistance, setWalkDistance] = useState(0)
  const [walkTime, setWalkTime] = useState(0)
  const [cycleDistance, setCycleDistance] = useState(0)
  const [cycleTime, setCycleTime] = useState(0)

  const getWalkCycleData = async () => {
    if (walkMatrix.distances[0][1]) {
      setWalkDistance(walkMatrix.distances[0][1] / 1000)
    }
    if (walkMatrix.durations[0][1]) {
      setWalkTime(walkMatrix.durations[0][1] / 60)
    }
    if (cycleMatrix.distances[0][1]) {
      setCycleDistance(cycleMatrix.distances[0][1] / 1000)
    }
    if (cycleMatrix.durations[0][1]) {
      setCycleTime(cycleMatrix.durations[0][1] / 60)
    }
  }

  const [searchResults, setSearchResults] = useState({})

  const [searchOffset, setSearchOffset] = useState(0)
  const [isLastPage, setIsLastPage] = useState(false)

  const searchData = async (searchText, from) => {
    const response = await fetch(
      `/api/search?query=${encodeURIComponent(searchText)}&from=${from}&type=${vehicleType}`
    )

    const data = await response.json()

    const results = await getCO2Figures(
      data,
      matrix,
      fuelCost,
      electricityCost,
      renewableShare,
      electricityRenewCO2,
      electricityNonRenewCO2
    )

    let newResults = searchResults

    if (searchResults.results && searchOffset > 0) {
      newResults.results = [...searchResults.results, ...results.results]
    } else {
      newResults = results
    }

    if (results.results.length < 20 && searchOffset > 0) {
      setIsLastPage(true)
    }

    setSearchResults(newResults)
  }

  return (
    <div className={className}>
      <div className="flex relative items-center justify-between border-b-2 border-neutral-400">
        <FontAwesomeIcon icon={faSearch} className="text-neutral-700" />

        <input
          type="text"
          placeholder="please type vehicle make/model..."
          id="search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setSearchOffset(0)
          }}
          className="font-mono w-full bg-transparent px-4 py-2 placeholder-neutral-500 text-sm"
        />

        <Filters
          vehicleType={vehicleType}
          onChange={(e) => setVehicleType(e)}
        />
      </div>

      <div className="w-full mt-6">
        <div>
          <span className="font-mono-2 font-semibold">CO2</span>
          <div className="leading-[0.5rem] pt-1">---</div>
          <div className="">renewable electricity share (%)</div>
          <div className="flex">
            0%
            <div className="px-2 w-full">
              <Slider
                size="small"
                value={renewableShare}
                aria-label="Small"
                valueLabelDisplay="auto"
                color="secondary"
                onChange={(e, newValue) => setRenewableShare(newValue)}
              />
            </div>
            100%
          </div>
          gCO2e/kWh:{' '}
          <FormControl variant="standard" className="w-12">
            <Input
              id="elecRenew"
              color="secondary"
              value={electricityRenewCO2}
              onChange={(e) => setElectricityRenewCO2(e.target.value)}
            />
          </FormControl>
          renewable{' '}
          <FormControl variant="standard" className="w-12">
            <Input
              id="elecNonRenew"
              color="secondary"
              value={electricityNonRenewCO2}
              onChange={(e) => setElectricityNonRenewCO2(e.target.value)}
            />
          </FormControl>
          non-renewable
          <div className="font-mono-2 font-semibold pt-2">PRICE</div>
          <div className="leading-[0.5rem] pt-1">---</div>
          <div>
            regular fuel cost:{' '}
            <FormControl variant="standard">
              <Input
                id="cpl"
                color="secondary"
                value={fuelCost}
                onChange={(e) => setFuelCost(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </FormControl>
            <TextField
              variant="standard"
              select
              defaultValue="litre"
              color="secondary"
              SelectProps={{
                native: true,
              }}
            >
              <option key="litre" value="litre">
                / Litre
              </option>
              {/* <option key="gal" value="gal">
                / U.S. gal
              </option> */}
            </TextField>
          </div>
          <div className="pb-2">
            electricity cost:{' '}
            <FormControl variant="standard">
              <Input
                id="elecCost"
                color="secondary"
                value={electricityCost}
                onChange={(e) => setElectricityCost(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </FormControl>
            <span className="font-mono"> /kWh</span>
          </div>
        </div>
        <Disclaimer className="w-full text-center border-t border-b border-solid border-neutral-400 mt-3" />
        <div className="flex justify-between bg-white rounded-2xl my-2 border-2 border-neutral-700 border-solid p-2 px-4">
          <div>
            <h3 className="text-xl">Walking</h3>
            <p className="font-display text-lg">
              <span className="font-mono font-bold text-xl text-neutral-800">
                0{' '}
              </span>
              <span className="text-base">grams</span>{' '}
              <a
                href="https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Carbon_dioxide_equivalent"
                target="_blank"
                rel="noreferrer"
                className="decoration-dotted underline decoration-neutral-500"
                alt="CO2 equivalent definition"
              >
                CO<sub>2</sub>-e
              </a>
            </p>
            <p>
              distance: {walkDistance.toFixed(2)} km | time:{' '}
              {walkTime.toFixed(2)} minutes
            </p>
          </div>
          <div className="w-12 my-auto">
            <img src={walkImage} alt="car" />
          </div>
        </div>
        <div className="flex justify-between bg-white rounded-2xl my-2 border-2 border-neutral-700 border-solid p-2 px-4">
          <div>
            <h3 className="text-xl">Cycling</h3>
            <p className="font-display text-lg">
              <span className="font-mono font-bold text-xl text-neutral-800">
                0{' '}
              </span>
              <span className="text-base">grams</span>{' '}
              <a
                href="https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Carbon_dioxide_equivalent"
                target="_blank"
                rel="noreferrer"
                className="decoration-dotted underline decoration-neutral-500"
                alt="CO2 equivalent definition"
              >
                CO<sub>2</sub>-e
              </a>
            </p>
            <p>
              distance: {cycleDistance.toFixed(2)} km | time:{' '}
              {cycleTime.toFixed(2)} minutes
            </p>
          </div>
          <div className="w-20 my-auto">
            <img src={cycleImage} alt="car" />
          </div>
        </div>
        <span className="font-mono">----</span>
        <br />
        {searchResults && searchResults.results && (
          <div>
            {searchResults.results.map((result, index) => (
              <div
                key={index}
                className="flex justify-between bg-white rounded-2xl my-2 border-2 border-neutral-700 border-solid p-2 px-4"
              >
                <div>
                  <a
                    href={`https://www.fueleconomy.gov/feg/Find.do?action=sbs&id=${result.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <h3 className="underline decoration-dotted decoration-2 text-xl">
                      {result.make} {result.model},{' '}
                      <span className="text-neutral-500">{result.year}</span>
                    </h3>
                  </a>
                  <p className="font-display text-lg">
                    {/* assuming 100g carbon output with clean energy and 800g with the most pollutant energy with linear scale */}
                    <span className="font-mono font-bold text-xl text-neutral-800">
                      {result.gCO2eHwy.toFixed(0)}
                      {' - '}
                      {result.gCO2eCity.toFixed(0)}{' '}
                    </span>
                    <span className="text-base">grams</span>{' '}
                    <a
                      href="https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Carbon_dioxide_equivalent"
                      target="_blank"
                      rel="noreferrer"
                      className="decoration-dotted underline decoration-neutral-500"
                      alt="CO2 equivalent definition"
                    >
                      CO<sub>2</sub>-e
                    </a>
                    <span className="text-base">
                      {' '}
                      | $
                      <span className="font-mono font-bold text-xl text-neutral-800 pl-1">
                        {typeof result.costCity === 'number'
                          ? result.costCity.toFixed(2)
                          : result.costCity}
                      </span>{' '}
                      fuel cost
                    </span>
                  </p>
                  <p>
                    type: {result.atvType.toUpperCase()} | distance:{' '}
                    {result.distance.toFixed(2)} km | time:{' '}
                    {result.time.toFixed(2)} minutes
                  </p>
                </div>
                <div>
                  <img src={carImage} alt="car" />
                </div>
              </div>
            ))}
            {!isLastPage && (
              <Button
                variant="text"
                color="secondary"
                onClick={() => {
                  searchData(searchQuery, searchOffset + 20)
                  setSearchOffset(searchOffset + 20)
                }}
              >
                Load More
              </Button>
            )}
          </div>
        )}
        Data source:{' '}
        <a
          href="https://www.fueleconomy.gov/"
          className="underline decoration-solid"
          target="_blank"
          rel="noreferrer"
        >
          U.S. EPA
        </a>
        ,{' '}
        <a
          href="https://environment.govt.nz/assets/Publications/Files/voluntary-ghg-reporting-summary-tables-emissions-factors-2015.pdf"
          className="underline decoration-solid"
          target="_blank"
          rel="noreferrer"
        >
          NZ Government emissions factors
        </a>
      </div>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.string,
  matrix: PropTypes.object,
  walkMatrix: PropTypes.object,
  cycleMatrix: PropTypes.object,
  vehicleType: PropTypes.string,
}

export default Results
