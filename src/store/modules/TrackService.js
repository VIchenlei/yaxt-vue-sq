import ol from 'openlayers'
// import {ZOOM_LEVEL} from '../def/map_def'
export default {
  namespaced: true,
  state: {
    tracks: new Map(),
    vehicleLayerSource: null,
    staffLayerSource: null,
  },
  mutations:{
    set (state, {id, track}) {
      state.tracks.set(id, track)
    },
    delete (state, id) {
      state.tracks.delete(id)
    },
    clear (state) {
      state.tracks.clear()
    }
  },
  actions:{
    startTracking ({state,commit,dispatch}, cardID, cardTypeName,x,y) {
      const ZOOM_LEVEL = window.xdata.state.mapService.zoomLevel
      let lineFeatureID = cardID + 'line'
      let lfeature = null
      if (cardTypeName === 'vehicle') {
        lfeature = state.vehicleLayerSource.getFeatureById(featureID)
      } else if (cardTypeName === 'staff') {
        lfeature = state.staffLayerSource.getFeatureById(featureID)
      }

      if (!lfeature) { // new track line
        // icon feature
        let iconFeatureID = cardID
        let ifeature = cardTypeName === 'vehicle' ? state.vehicleLayerSource.getFeatureById(iconFeatureID) : state.staffLayerSource.getFeatureById(iconFeatureID)
        let coord = ifeature && ifeature.getGeometry().getCoordinates()
        if (!coord) coord = [x, y]
        let posdata = [coord, coord]  // 开始时两个点重合

        let trackFeature = new ol.Feature({
          geometry: new ol.geom.LineString(posdata)
        })
        trackFeature.setProperties({type: 'trackFeature'})
        trackFeature.setId(lineFeatureID)
        trackFeature.setStyle(new ol.style.Style({
          stroke: new ol.style.Stroke({
            width: 3,
            color: [255, 0, 0, 1]
          })
        }))

        if (cardTypeName === 'vehicle') {
          state.vehicleLayerSource.addFeature(trackFeature)
        } else if (cardTypeName === 'staff') {
          state.staffLayerSource.addFeature(trackFeature)
        }
        state.tracks.set(cardID, true)
        this.state.mapService.map.getView().animate({
          center: [x, y],
          duration: 1000,
          zoom: ZOOM_LEVEL.STAFFLEAVE
        })
      }
    },
    stopTracking ({state,commit,dispatch}, cardID, cardTypeName) {
      let lfeature = null
      if (cardTypeName === 'vehicle') {
        lfeature = state.vehicleLayerSource.getFeatureById(featureID)
      } else if (cardTypeName === 'staff') {
        lfeature = state.staffLayerSource.getFeatureById(featureID)
      }
      if (lfeature) {
        if (cardTypeName === 'vehicle') {
          state.vehicleLayerSource && state.vehicleLayerSource.getFeatureById(cardID + 'line') && state.vehicleLayerSource.removeFeature(feature)
        } else if (cardTypeName === 'staff') {
          state.staffLayerSource && state.staffLayerSource.getFeatureById(cardID + 'line') && state.staffLayerSource.removeFeature(feature)
        }
      }
      state.tracks.delete(cardID)

    },
    toggleTracking ({state,commit,dispatch}, msg) {
      let cards = msg.cards
      for (let i = 0, len = cards.length; i < len; i++) {
        let cardID = cards[i]
        state.trackStore.has(cardID) ? this.stopTracking(cardID) : this.startTracking(cardID)
      }
    },
    // 对象移动时，增加一段轨迹
    trackTo ({state,commit,dispatch}, cardID, cardTypeName) {
      let feature = null
      if (cardTypeName === 'vehicle') {
        feature = state.vehicleLayerSource.getFeatureById(featureID)
      } else if (cardTypeName === 'staff') {
        feature = state.staffLayerSource.getFeatureById(featureID)
      }
      if (feature && feature.getId() === lineFeatureID) {
        let linestring = feature.getGeometry()
        linestring.appendCoordinate([card[CARD.x], -card[CARD.y]])
        feature.setGeometry(linestring)
      }
    }
  }
}