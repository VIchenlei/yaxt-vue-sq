import { clone, pointToLineDistance } from '../map/mapUtils/OlMapLayerUtils'
export default {
  namespaced: true,
  state: {
    overview: {
      vehicle: 0,
      staff: 0,
    },
    infoDefs: null,
    vcards: new Map(), // 井下车辆状态：cardID -> []
    scards: new Map(), // 井下人员状态：cardID -> []
    hcards: new Map(), // 液压支架状态
    needMove: false,
    prescards: new Map(), // 井下人员上一次状态
  },
  mutations: {

  },
  actions: {
    cardUpdatePos ({state, commit, dispatch}, data) {
      let needMove = state.needMove
      dispatch('cardMove', {data, needMove})
      state.needMove = false
    },
    setCardView({state, commit, dispatch}, data) {
      if (!data) return
      // console.log('get overview card total', data);
      state.overview.vehicle = data.vehicleCount
      state.overview.staff = data.staffCount
    },
    dealHydraulic ({state, commit, dispatch}, msg) {
      let { data, needMove } = msg
      if (!data) return
      let length = data[0].hydraulicCode
      if (data.length === 1) {
        dispatch('completHydraulic', {data, length, needMove})
      } else {
        data = data.sort(function (a, b) {
          return b - a
        })
        let length = data[0].hydraulicCode
        dispatch('completHydraulic', {data, length, needMove})
      }
    },
    completHydraulic ({state, commit, dispatch}, msg) {
      let { data, length, needMove } = msg
      if (data.length === 1) {
        let card = clone(data[0])
        for (let i = 0; i < length; i++) {
          let cardID = card.ident
          let cloneData = clone(card)
          cloneData.x = i === 0 ? cloneData.x : cloneData.x+i*0.76
          // let disPoint = pointToLineDistance(cloneData.x, cloneData.y,card.x,card.y,lastCard.x,lastCard.y)
          // cloneData['rotation'] = disPoint[0]
          // cloneData.x = disPoint[1].x
          // cloneData.y = disPoint[1].y
          cloneData.hydraulicCode = length - i
          dispatch('judgeCardState', {cardID, card: cloneData, needMove, type:'hydraulic'})
          if (i === length -1) continue
        }
      } else {
        let card = clone(data[0])
        let lastCard = data[data.length - 1]
        // card.y = card.y - 1
        // lastCard.y = lastCard.y - 1
        for (let i = 0; i < length; i++) {
          let cardID = card.ident
          let cloneData = clone(card)
          cloneData.x = i === 0 ? cloneData.x : cloneData.x+i*0.76
          let disPoint = pointToLineDistance(cloneData.x, cloneData.y,card.x,card.y,lastCard.x,lastCard.y)
          // cloneData['rotation'] = disPoint[0]
          cloneData.x = disPoint[1].x
          cloneData.y = disPoint[1].y
          cloneData.hydraulicCode = length - i
          dispatch('judgeCardState', {cardID, card: cloneData, needMove, type:'hydraulic'})
          if (i === length -1) continue
        }
      }
        // console.log('hydraulic', hydraulic)
      // } else {
      //   for (let i = 0; i < data; i++) {
        
      //   }
      // }
    },
    cardMove ({state, commit, dispatch}, msg) {
      const { data, needMove} = msg
      if (!data) return
      state.overview.vehicle = data.vehicleCount
      state.overview.staff = data.staffCount
      dispatch('processVehicleData', {data: data.vehicle, needMove})
      dispatch('processStaffData', {data: data.staff, needMove})
      dispatch('dealHydraulic', {data: data.hydraulic, needMove})
      // dispatch('processHydraulic', {data: data.hydraulic, needMove})
      this.dispatch('olMapCardLayer/drawStaffs', data.areaStaff)
    },
    async processVehicleData ({state, commit, dispatch}, msg) {
      const { data, needMove } = msg
      if (!data || data.length < 1) return
      state.vcards = await dispatch('processDetail', {data, type: 'vehicle', needMove})
    },
    async processStaffData ({state, commit, dispatch}, msg) {
      const { data, needMove } = msg
      if (!data || data.length < 1) return
      state.scards = await dispatch('processDetail', {data, type: 'staff', needMove})
      state.prescards = state.scards
    },
    processHydraulic({state, commit, dispatch}, msg) {
      const { data, needMove } = msg
      if (!data || data.length < 1) return
      state.hcards = dispatch('processDetail', {data, type: 'hydraulic', needMove})
    },
    processDetail ({state, commit, dispatch}, processData) {
      let data = processData.data
      let type = processData.type
      let needMove = processData.needMove
      let xmap = new Map()
      // this.dispatch('olMapCardLayer/clearLayers', type)
      if (data) {
        for (const card of data) {
          let cardID = card.ident
          xmap.set(cardID, card)
          dispatch('judgeCardState', {cardID, card, needMove, type})
        }
      }
      return xmap
    },
    judgeCardState({state, commit, dispatch}, msg) {
      const { cardID, card, needMove, type } = msg
      let setMove = 1
      let bCood = state.prescards && state.prescards.get(cardID)
      let newCood = card
      if (bCood) {
        let distance = Math.pow((newCood.x - bCood.x), 2) + Math.pow((newCood.y - bCood.y), 2)
        // console.log('distance', distance)
        if (type === 'staff') {
          if (distance < 25) {
            setMove = distance < 1 ? 1 : 0
          } else {
            setMove = 1
          }
        } else {
          distance > 100 ? setMove = 1 : setMove = 0 // 0: 动画；1：定位
        }
      } else {
        setMove = 1
      }

      if (type === 'vehicle') {
        // if (card['stayValue'] == 1) {
          dispatch('showCard', {
            cardID: cardID,
            card: card,
            type: type,
            needMove,
            setMove,
          })
        // }
      } else if (type === 'staff') {
        let prescard = state.prescards && state.prescards.get(cardID)
        // if (card['stayValue'] == 1) {
          dispatch('showCard', {
            cardID: cardID,
            card: card,
            type: type,
            needMove,
            setMove,
          })
        // }
      } else if (type === 'hydraulic') {
        // console.log('hydraulic=====================', card)
        this.dispatch('olMapHydraulic/informMapUpdateCard', {
          card: card,
          type: type,
          needMove,
          setMove: setMove,
        })
      }
    },
    showCard ({state, commit, dispatch}, data) {
      let card = data.card
      let needMove = data.needMove
      this.dispatch('olMapCardLayer/informMapUpdateCard', {
        card: card,
        type: data.type,
        needMove,
        setMove: data.setMove,
      })
    }
  }
}