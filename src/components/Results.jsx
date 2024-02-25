import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faFilter } from '@fortawesome/free-solid-svg-icons'

import Slider from '@mui/material/Slider'
// import Input from '@mui/material/Input'
// import TextField from '@mui/material/TextField'
// import InputAdornment from '@mui/material/InputAdornment'
// import FormControl from '@mui/material/FormControl'

import Disclaimer from './Disclaimer'

import carImage from '../assets/driving.svg'
import walkImage from '../assets/walking.svg'
import cycleImage from '../assets/cycling.svg'

const Results = ({ className, matrix, walkMatrix, cycleMatrix }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const [renewableShare, setRenewableShare] = useState(70)
  // const [fuelCost, setFuelCost] = useState(2.8)
  // const [electricityCost, setElectricityCost] = useState(0.32)

  const [walkDistance, setWalkDistance] = useState(0)
  const [walkTime, setWalkTime] = useState(0)
  const [cycleDistance, setCycleDistance] = useState(0)
  const [cycleTime, setCycleTime] = useState(0)

  useEffect(() => {
    getWalkCycleData()
  }, [walkMatrix, cycleMatrix])

  const getWalkCycleData = () => {
    if (walkMatrix && walkMatrix.distances[0][1]) {
      setWalkDistance(walkMatrix.distances[0][1] / 1000)
    }
    if (walkMatrix && walkMatrix.durations[0][1]) {
      setWalkTime(walkMatrix.durations[0][1] / 60)
    }
    if (cycleMatrix && cycleMatrix.distances[0][1]) {
      setCycleDistance(cycleMatrix.distances[0][1] / 1000)
    }
    if (cycleMatrix && cycleMatrix.durations[0][1]) {
      setCycleTime(cycleMatrix.durations[0][1] / 60)
    }
  }

  const getCO2Figures = async (data) => {
    // MOVE TO NEW FILE
    const results = data.results

    for (let i = 0; i < results.length; i++) {
      if (matrix && matrix.distances && matrix.distances[0][1]) {
        results[i].distance = matrix.distances[0][1] / 1000 // convert to km
      }
      if (matrix && matrix.durations && matrix.durations[0][1]) {
        results[i].time = (matrix.durations[0][1] / 60).toFixed(2) // convert to minutes
      }

      // CO2e factors: https://environment.govt.nz/assets/Publications/Files/voluntary-ghg-reporting-summary-tables-emissions-factors-2015.pdf
      if (results[i].atvType === 'Diesel' && results[i].distance) {
        results[i].kgCO2eHwy =
          (2.72 / ((1.60934 * results[i].highway08) / 3.78541)) *
          results[i].distance // kgCO2e_per_L / (mpg * km_per_mile / L_per_gal)

        results[i].kgCO2eCity =
          (2.72 / ((1.60934 * results[i].city08) / 3.78541)) *
          results[i].distance
      }

      if (
        (results[i].atvType === 'Gasoline' ||
          results[i].atvType === 'FFV' ||
          results[i].atvType === 'Hybrid' ||
          results[i].atvType === 'FCV' ||
          results[i].atvType === '') &&
        results[i].distance
      ) {
        results[i].kgCO2eHwy =
          (2.36 / ((1.60934 * results[i].highway08) / 3.78541)) *
          results[i].distance

        results[i].kgCO2eCity =
          (2.36 / ((1.60934 * results[i].city08) / 3.78541)) *
          results[i].distance
      }

      if (results[i].atvType === 'Plug-in Hybrid' && results[i].distance) {
        results[i].kgCO2eHwy =
          (2.36 / ((1.60934 * results[i].highwayA08) / 3.78541)) *
          results[i].distance

        results[i].kgCO2eCity =
          (2.36 / ((1.60934 * results[i].cityA08) / 3.78541)) *
          results[i].distance
      }

      if (results[i].atvType === 'EV' && results[i].distance) {
        results[i].kgCO2eHwyElec = 33.7 / (results[i].highway08 * 1.60934) // 33.7 kWh/gallon to kWh/km, kWh/gal / (mi/gal * km/mi) = kWh/gal / km/gal = kWh/km

        results[i].kgCO2eCityElec = 33.7 / (results[i].city08 * 1.60934)
      }

      if (
        // technically not the same but close enough and very few vehicles anyway
        (results[i].atvType === 'Bifuel (CNG)' ||
          results[i].atvType === 'Bifuel (LPG)') &&
        results[i].distance
      ) {
        results[i].kgCO2eHwy =
          (1.51 / ((1.60934 * results[i].highwayA08) / 3.78541)) *
          results[i].distance

        results[i].kgCO2eCity =
          (1.51 / ((1.60934 * results[i].cityA08) / 3.78541)) *
          results[i].distance
      }

      if (results[i].atvType === 'CNG' && results[i].distance) {
        results[i].kgCO2eHwy =
          (1.51 / ((1.60934 * results[i].highway08) / 3.78541)) *
          results[i].distance

        results[i].kgCO2eCity =
          (1.51 / ((1.60934 * results[i].city08) / 3.78541)) *
          results[i].distance
      }

      if (results[i].atvType === 'Gasoline' || results[i].atvType === '') {
        results[i].atvType = 'Petrol'
      }

      if (results[i].kgCO2eHwy) {
        results[i].gCO2eHwy = (1000 * results[i].kgCO2eHwy).toFixed(2)

        results[i].gCO2eCity = (1000 * results[i].kgCO2eCity).toFixed(2)
      }
    }
    return data
  }

  const searchData = async (searchText, from) => {
    const response = await fetch(
      `/api/search?query=${encodeURIComponent(searchText)}&from=${from}`
    )
    const data = await response.json()
    const results = await getCO2Figures(data)
    setSearchResults(results)
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between border-b-2 border-neutral-400">
        <FontAwesomeIcon icon={faSearch} className="text-neutral-700" />

        <input
          type="text"
          placeholder="please type vehicle make/model..."
          id="search"
          value={searchQuery}
          onChange={(e) => {
            const newValue = e.target.value
            setSearchQuery(newValue)
            searchData(newValue, 0)
          }}
          className="font-mono w-full bg-transparent px-4 py-2 placeholder-neutral-500 text-sm"
        />

        <button onClick={() => alert('coming soon')} alt="filter and sort">
          <FontAwesomeIcon icon={faFilter} className="text-neutral-600 p-3" />
        </button>
      </div>

      <div className="w-full mt-6">
        <span className="">renewable electricity share (%)</span>
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
        {/* <div>
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
            <option key="gal" value="gal">
              / U.S. gal
            </option>
          </TextField>
        </div>
        <div className="pb-2">
          electricity cost:{' '}
          <FormControl variant="standard">
            <Input
              id="cpl"
              color="secondary"
              value={electricityCost}
              onChange={(e) => setElectricityCost(e.target.value)}
              startAdornment={
                <InputAdornment position="start">$</InputAdornment>
              }
            />
          </FormControl>
          <span className="font-mono"> /kWh</span>
        </div> */}
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
                      {result.gCO2eHwy ||
                        (
                          result.kgCO2eHwyElec *
                          1000 *
                          ((1 - renewableShare / 100) * 0.7 + 0.1)
                        ).toFixed(2)}
                      {' - '}
                      {result.gCO2eCity ||
                        (
                          result.kgCO2eCityElec *
                          1000 *
                          ((1 - renewableShare / 100) * 0.7 + 0.1)
                        ).toFixed(2)}{' '}
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
                    type: {result.atvType.toUpperCase()} | distance:{' '}
                    {result.distance} km | time: {result.time} minutes
                  </p>
                </div>
                <div>
                  <img src={carImage} alt="car" />
                </div>
              </div>
            ))}
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
}

export default Results
