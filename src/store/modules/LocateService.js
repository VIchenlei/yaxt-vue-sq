import ol from 'openlayers'
// import {ZOOM_LEVEL} from '../def/map_def'
export default {
  namespaced: true,
  state: {
    locates: new Map(),
    locateLandmark: new Map(),
    locateAreas: new Map(),
    // locatevehicle: new Map(),
    // locatestaff: new Map(),
    locateCard: new Map(),
    localReader: new Map(),
    localLight: new Map()
  },
  mutations:{
    set (state, {id, locate}) {
      state.locates.set(id, locate)
    },
    delete (state, id) {
      state.locates.delete(id)
    },
    clear (state) {
      state.locates.clear()
    },
    reset(state){
      state.locates.clear()
      // state.locatestaff.clear()
      // state.locatevehicle.clear()
      state.locateCard.clear()
      state.locateLandmark.clear()
      state.localReader.clear()
    }
  },
  actions:{
    cardStartLocating ({state, commit, dispatch}, msg) {
      const ZOOM_LEVEL = window.xdata.state.mapService.zoomLevel
      let cards = msg.cards
      let type = msg.type
      let symbolType = msg.symbolType
      let position = msg.position
      for (let i = 0, len = cards.length; i < len; i++) {
        let cardID = cards[i]
        if (!state.locates.has(cardID)) {
          let div = document.createElement('div')
          let circleClass = 'css_animation'
          if (type === 'ALARM' || type === 'HELP') circleClass = 'css_animation_alarm'
          div.setAttribute('id', circleClass)
          div.setAttribute('class', 'animation' + cardID)
          let pointOverlay = new ol.Overlay({
            element: div,
            positioning: 'center-center',
            id: 'position' + cardID,
            stopEvent: false
          })
          this.state.mapService.map.addOverlay(pointOverlay)
          pointOverlay.setPosition(position)
          state.locates.set(cardID, true)
          // if ((/^001/i).test(cardID)) {
          //   state.locatestaff.set(cardID, true)
          // } else if ((/^002/i).test(cardID)) {
          //   state.locatevehicle.set(cardID, true)
          // } else 
          if (symbolType === 'card') {
            state.locateCard.set(cardID, true)
          } else if (symbolType === 'reader') {
            state.localReader.set(cardID, true)
          } else if(symbolType === 'landmark'){
            state.locateLandmark.set(cardID, true)        
          } else if (symbolType === 'light') {
            state.localLight.set(cardID, true)
          }
        }
        let view = this.state.mapService.map.getView()
        view.animate({
          center: position,
          duration: 1000,
          zoom: ZOOM_LEVEL.CARDVIEWZOOM
        })
      }
    },
    cardStopLocating ({state, commit, dispatch}, msg) {
      let cards = msg.cards
      for (let i = 0, len = cards.length; i < len; i++) {
        let cardID = cards[i]
        let position = this.state.mapService.map.getOverlayById('position' + cardID)
        position && this.state.mapService.map.removeOverlay(position)
        state.locates.delete(cardID)
        // if ((/^001/i).test(cardID)) {
        //   state.locatestaff.delete(cardID, true)
        // } else if ((/^002/ig).test(cardID)) {
        //   state.locatevehicle.delete(cardID, true)
        // } else 
        if (state.locateCard.get(cardID)) {
          state.locateCard.delete(cardID, true)
        } if (state.locateLandmark.get(cardID)){
          state.locateLandmark.delete(cardID, true)
        } else if (state.localReader.get(cardID)) {
          state.localReader.delete(cardID, true)
        } else if (state.localLight.get(cardID)) {
          state.localLight.delete(cardID)
        }
      }
    },
    toggleLocating ({state, commit, dispatch}, msg) {
      let cards = msg.cards
      for (let i = 0, len = cards.length; i < len; i++) {
        let cardID = cards[i]
        state.locates.has(cardID) ? this.dispatch('locateService/cardStopLocating',{cards: cardID}): this.dispatch('locateService/cardStartLocating',msg)
      }
    }
  }
}