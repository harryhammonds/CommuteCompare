export function convertTimeToISO(timeStr) {
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

  const currentHours = currentDate.getHours()
  const currentMinutes = currentDate.getMinutes()

  if (
    hours < currentHours ||
    (hours === currentHours && minutes <= currentMinutes)
  ) {
    // add 1 day to the current date if the time has already passed
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')

  if (hours < 10) {
    hours = '0' + hours
  }

  if (minutes < 10) {
    minutes = '0' + minutes
  }

  const formattedDate = `${currentDate.getFullYear()}-${month}-${day}T${hours}:${minutes}`

  return formattedDate
}
