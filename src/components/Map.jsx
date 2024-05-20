import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_MAP_PUBLIC

const Map = ({ className, originCoord, destinationCoord }) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const originMarker = useRef(null)
  const destinationMarker = useRef(null)

  useEffect(() => {
    if (!map.current) {
      // initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/drblah/cls4ju9pw00dc01r67pmsgjwq',
        center: [174.8, -36.9],
        zoom: 0,
      })
    }

    if (originCoord.length !== 0) {
      if (originMarker.current) {
        originMarker.current.setLngLat(originCoord)
      } else {
        originMarker.current = new mapboxgl.Marker()
          .setLngLat(originCoord)
          .addTo(map.current)
      }
    }

    if (destinationCoord.length !== 0) {
      if (destinationMarker.current) {
        destinationMarker.current.setLngLat(destinationCoord)
      } else {
        destinationMarker.current = new mapboxgl.Marker()
          .setLngLat(destinationCoord)
          .addTo(map.current)
      }
    }

    if (originCoord.length === 0 && destinationCoord.length !== 0) {
      map.current.flyTo({
        center: destinationCoord,
        zoom: 13,
      })
    }

    // if both markers exist, fit the map to the markers
    if (originCoord.length !== 0 && destinationCoord.length !== 0) {
      // calculate the center point between the two markers
      const center = [
        (originCoord[0] + destinationCoord[0]) / 2,
        (originCoord[1] + destinationCoord[1]) / 2,
      ]

      map.current.flyTo({
        center: center,
        zoom: 10,
      })
    }
  }, [originCoord, destinationCoord])

  // update markers when coordinates change
  useEffect(() => {
    if (originMarker.current) originMarker.current.setLngLat(originCoord)
    if (destinationMarker.current)
      destinationMarker.current.setLngLat(destinationCoord)
  }, [originCoord, destinationCoord])

  return <div ref={mapContainer} className={className} />
}

Map.propTypes = {
  className: PropTypes.string,
  originCoord: PropTypes.array,
  destinationCoord: PropTypes.array,
}

export default Map
