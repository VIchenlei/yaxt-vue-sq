export default {
  namespaced: true,
  state: {
    metaDialogEdit: {
      isVisible: false,
      tableName: null,
      rows: null,
      title: null,
    },
    alarmList: {
      isVisible: false,
      rows: null
    },
    staffCurve:{
      isVisible: false
    },
    mapModel: {
      isVisible: false,
      modalText: '',
      resultStatus: '',
      resultTitle: '',
      ajaxName: '',
      sendMsg: null,
      title: '',
      points: null,
      showInput: false,
    },
    sendCall: {
      isVisible: false,
      data: null
    },
    readerModal: {
      isVisible: false,
      coords: null
    },
    readerEdit: {
      isVisible: false,
      rows: null
    },
    landmarkModal: {
      isVisible: false,
      coords: null,
      isEdit: false
    },
    landmarkEdit: {
      isVisible: false,
      rows: null
    },
    cardModal: {
      isVisible: false,
      data: null,
      subType: ''
    },
    goafModal: {
      isVisible: false,
      points: null
    },
    goafEdit: {
      isVisible: false,
      rows: null
    },
    areaModal: {
      isVisible: false,
      points: null
    },
    areaEdit: {
      isVisible: false,
      rows: null
    },
    toolModal: {
      isVisible: false,
      data: null,
      subtype: null
    },
    detailDialog: {
      isVisible: false,
      data: null,
      cardType: null,
      title: null,
      areaId: null,
      points: null,
      shape: null,
    },
    upmine: {
      isVisible: false,
      data: null
    },
    inspectionModal: {
      isVisible: false,
      path: null
    },
    mapContainer: null,
    trailModal: {
      isVisible: false,
      trail: null
    },
    showReaderPath: new Map(),
    realPowerModal: {
      isVisible: false,
      rows: null
    },
    trackModal: {
      isVisible: false,
      rows: null
    },
  },
  mutations: {
    changeDialogEdit (state, msg) {
      state.metaDialogEdit.isVisible = msg && msg.type
      state.metaDialogEdit.tableName = msg && msg.name
      state.metaDialogEdit.rows = msg && msg.rows
      state.metaDialogEdit.title = msg && msg.title
    },
    changeAlarm(state, msg) {
      state.alarmList.isVisible = msg && msg.type
      state.alarmList.rows = msg && msg.rows
    },
    changeStaffCurve (state, msg) {
      state.staffCurve.isVisible = msg && msg.type
    },
    changeMapModel (state, msg) {
      state.mapModel.isVisible = msg && msg.type
      state.mapModel.modalText = msg && msg.modalText
      state.mapModel.resultStatus = msg && msg.resultStatus
      state.mapModel.resultTitle = msg && msg.resultTitle
      state.mapModel.ajaxName = msg && msg.ajaxName
      state.mapModel.sendMsg = msg && msg.sendMsg
      state.mapModel.title = msg && msg.title
      state.mapModel.points = msg && msg.points
      state.mapModel.showInput = msg && msg.showInput
    },
    changeSendCall (state, msg) {
      state.sendCall.isVisible = msg && msg.type
      state.sendCall.data = msg && msg.data
    },
    changeReaderModal (state, msg) {
      state.readerModal.isVisible = msg && msg.type
      state.readerModal.coords = msg && msg.coords
    },
    changeReaderEdit (state, msg) {
      state.readerEdit.isVisible = msg && msg.type
      state.readerEdit.rows = msg && msg.rows
    },
    changeLandmarkModal (state, msg) {
      state.landmarkModal.isVisible = msg && msg.type
      state.landmarkModal.coords = msg && msg.coords
    },
    changeLandmarkEdit (state, msg) {
      state.landmarkEdit.isVisible = msg && msg.type
      state.landmarkEdit.rows = msg && msg.rows
    },
    changeCardModal (state, msg) {
      state.cardModal.isVisible = msg && msg.isVisible
      state.cardModal.data = msg && msg.data
      state.cardModal.subType = msg && msg.subType
    },
    changeGoafEdit (state, msg) {
      state.goafEdit.isVisible = msg && msg.type
      state.goafEdit.rows = msg && msg.rows
    },
    changeGoafModal (state, msg) {
      state.goafModal.isVisible = msg && msg.type
      state.goafModal.points = msg && msg.points
    },
    changeAreaModal (state, msg) {
      state.areaModal.isVisible = msg && msg.type
      state.areaModal.points = msg && msg.points
    },
    changeAreaEdit (state, msg) {
      state.areaEdit.isVisible = msg && msg.type
      state.areaEdit.rows = msg && msg.rows
    },
    changeToolModal (state, msg) {
      state.toolModal.isVisible = msg && msg.type
      state.toolModal.data = msg && msg.data
      state.toolModal.subtype = msg && msg.subtype
    },
    changeDetailDialog (state, msg) {
      state.detailDialog.isVisible = msg && msg.type
      state.detailDialog.data = msg && msg.data
      state.detailDialog.cardType = msg && msg.cardType
      state.detailDialog.title = msg && msg.title
      state.detailDialog.areaId = msg && msg.areaId
      state.detailDialog.shape = msg && msg.shape
      state.detailDialog.points = msg && msg.points
    },
    changeUpmine (state, msg) {
      state.upmine.isVisible = msg && msg.type
      state.upmine.data = msg && msg.data
    },
    changeInspectionModal (state, msg) {
      state.inspectionModal.isVisible = msg && msg.type
      state.inspectionModal.path = msg && msg.path
    },
    changeMapContainer (state, msg) {
      state.mapContainer = msg && msg.mapContainer
    },
    changeTrailModal (state, msg) {
      state.trailModal.isVisible = msg && msg.type
      state.trailModal.trail = msg && msg.trail
    },
    switchShow (state, msg) {
      const { code, checked } = msg
      if (checked) {
        state.showReaderPath.set(code, true)
      } else {
        state.showReaderPath.delete(code)
      }
    },
    changeRealPowerModal (state, msg) {
      state.realPowerModal.isVisible = msg && msg.type
      state.realPowerModal.rows = msg && msg.rows
    },
    changeTrackModal (state, msg) {
      state.trackModal.isVisible = msg && msg.type
      state.trackModal.rows = msg && msg.rows
    }
  }
}