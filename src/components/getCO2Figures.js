export default function getCO2Figures(
  data,
  matrix,
  fuelCost,
  electricityCost,
  renewableShare,
  electricityRenewCO2,
  electricityNonRenewCO2
) {
  const results = data.results

  let electricityFactor =
    (electricityNonRenewCO2 * (100 - renewableShare) +
      electricityRenewCO2 * renewableShare) /
    100

  for (let i = 0; i < results.length; i++) {
    if (matrix && matrix.distances && matrix.distances[0][1]) {
      results[i].distance = matrix.distances[0][1] / 1000 // convert to km
    }
    if (matrix && matrix.durations && matrix.durations[0][1]) {
      results[i].time = matrix.durations[0][1] / 60 // convert to minutes
    }

    // CO2e factors: https://environment.govt.nz/assets/Publications/Files/voluntary-ghg-reporting-summary-tables-emissions-factors-2015.pdf
    if (results[i].atvType === 'Diesel' && results[i].distance) {
      results[i].gCO2eHwy =
        (2.72 / ((1.60934 * results[i].highway08) / 3.78541)) *
        results[i].distance *
        1000 // kgCO2e_per_L / (mpg * km_per_mile / L_per_gal)

      results[i].gCO2eCity =
        (2.72 / ((1.60934 * results[i].city08) / 3.78541)) *
        results[i].distance *
        1000

      results[i].costCity =
        (3.78541 / (1.60934 * results[i].city08)) *
        fuelCost *
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
      results[i].gCO2eHwy =
        (2.36 / ((1.60934 * results[i].highway08) / 3.78541)) *
        results[i].distance *
        1000

      results[i].gCO2eCity =
        (2.36 / ((1.60934 * results[i].city08) / 3.78541)) *
        results[i].distance *
        1000

      if (results[i].fuelType1 === 'Premium Gasoline') {
        // 7% higher price
        results[i].costCity =
          (3.78541 / (1.60934 * results[i].city08)) *
          fuelCost *
          results[i].distance *
          1.07
      } else {
        results[i].costCity =
          (3.78541 / (1.60934 * results[i].city08)) *
          fuelCost *
          results[i].distance
      }
    }

    if (results[i].atvType === 'Plug-in Hybrid' && results[i].distance) {
      results[i].gCO2eHwy =
        (2.36 / ((1.60934 * results[i].highwayA08) / 3.78541)) *
        results[i].distance *
        1000

      results[i].gCO2eCity =
        (2.36 / ((1.60934 * results[i].cityA08) / 3.78541)) *
        results[i].distance *
        1000

      results[i].costCity = 'Varies'
    }

    if (results[i].atvType === 'EV' && results[i].distance) {
      results[i].gCO2eHwy =
        (33.7 / (results[i].highway08 * 1.60934)) *
        results[i].distance *
        electricityFactor // 33.7 kWh/gallon to kWh/km, kWh/gal / (mi/gal * km/mi) = kWh/gal / km/gal = kWh/km

      results[i].gCO2eCity =
        (33.7 / (results[i].city08 * 1.60934)) *
        results[i].distance *
        electricityFactor

      results[i].costCity =
        ((electricityCost * 33.7) / (results[i].city08 * 1.60934)) *
        results[i].distance
    }

    if (
      // technically not the same but close enough and very few vehicles anyway
      (results[i].atvType === 'Bifuel (CNG)' ||
        results[i].atvType === 'Bifuel (LPG)') &&
      results[i].distance
    ) {
      results[i].gCO2eHwy =
        (1.51 / ((1.60934 * results[i].highwayA08) / 3.78541)) *
        results[i].distance *
        1000

      results[i].gCO2eCity =
        (1.51 / ((1.60934 * results[i].cityA08) / 3.78541)) *
        results[i].distance *
        1000

      results[i].costCity = 'Unsupported'
    }

    if (results[i].atvType === 'CNG' && results[i].distance) {
      results[i].gCO2eHwy =
        (1.51 / ((1.60934 * results[i].highway08) / 3.78541)) *
        results[i].distance *
        1000

      results[i].gCO2eCity =
        (1.51 / ((1.60934 * results[i].city08) / 3.78541)) *
        results[i].distance *
        1000

      results[i].costCity = 'Unsupported'
    }

    if (results[i].atvType === 'Gasoline' || results[i].atvType === '') {
      results[i].atvType = 'Petrol'
    }
  }
  return data
}
