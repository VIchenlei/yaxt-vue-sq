import ol from 'openlayers'
let mapIcon = {
  'vehiclePoint': {
    'red': {img: '/img/redpoint.png'},
    'green': {img: '/img/greenpoint.png'},
    'yellow': {img: '/img/yellowpoint.png'}
  },
  'staff': {
    'nosignal': {
      img: '/img/specialstaff.png'
    },
    'normal': {
      img: '/img/standstaff.png'
    },
    'unregistered': {
      img: '/img/unregisteredstaff.png'
    },
    'monkey': {
      img: '/img/monkeycar.png'
    },
    'point': {
      img: '/img/greenpoint.png'
    },
    'nosignalpoint': {
      img: '/img/nosignalpoing.png'
    }
  },
  'vehicle': {
    'greencar': {
      img: '/img/greencar.png'
    },
    'yellowcar': {
      img: '/img/yellowcar.png'
    },
    'redcar': {
      img: '/img/redcar.png'
    },
    'tunnelcar': {
      img: '/img/drivevehicle.png'
    },
    'cmjcar': {
      img: '/img/caimei.png'
    },
    'tunnelONcar': {
      img: '/img/drivevehicleON.png'
    },
    'cmjONcar': {
      img: '/img/caimeiON.png'
    },
    'djccar': {
      img: '/img/djc.png'
    }
  },
  'track': {
    'route': new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 6, color: [237, 212, 0, 0.8]
      })
    }),
    'patrolPath': new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 6, color: 'mediumseagreen'
      })
    }),
    'endMarker': new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: '/icons/endMarker.png'
      })
    }),
    'startMarker': new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: '/icons/startMarker.png'
      })
    }),
    'start': new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: '/icons/start.png'
      })
    }),
    'end': new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: '/icons/end.png'
      })
    }),
    'geoMarker': new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        snapToPixel: false,
        fill: new ol.style.Fill({ color: 'black' }),
        stroke: new ol.style.Stroke({
          color: 'white', width: 2
        })
      })
    })
  },
  'landmark': new ol.style.Style({
    image: new ol.style.Icon({
      src: '/img/landmarker.png',
      scale: 0.08,
      rotateWithView: true
    })
  }),
  'workface': new ol.style.Style({
    image: new ol.style.Icon({
      src: '/img/jue.png',
      scale: 0.5,
      rotateWithView: true
    })
  }),
  'camera': new ol.style.Style({
    image: new ol.style.Icon({
      src: '/img/cameraright.png',
      scale: 0.5,
      rotateWithView: true
    })
  })
}

export {mapIcon}
