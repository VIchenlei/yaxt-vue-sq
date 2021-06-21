const power = {
  'id': '电源编号',
  'powerLevelsId': '电路编号',
  'batteryNumber': '电池编号',
  'batteryModel': '电池型号',
  'batteryType': '电池类型',
  'ratedVoltage': '额定电压',
  'dischargeVoltage': '放电截止电压',
  'capacity': '电池容量',
  'dischargeVoltageCycle': '强制放电周期',
  'dischargeVoltageTime': '标准放电时间',
  'dischargeTime': '放电时间',
  'powerStatus': '供电状态'
}

const realPower = {
  'batteryNumber': '电池编号',
  'batteryVoltage': '电池电压',
  'batteryCapacity': '电池容量',
  'directCurrent': '直流电流',
  'alternatingCurrent': '交流电流（有/无）',
  'directVoltage': '直流输出电压',
  'batteryTemperature': '电池温度',
  'cycleCount': '累计充电次数',
  'cycleTime': '累计充电时长',
  'forcedDischarge': '强制放电（是/否）'
}

export { power, realPower }