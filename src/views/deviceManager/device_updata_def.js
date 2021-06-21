/*设备参数、网络参数展示字段 公共字段*/
const DEVICEREVEAL = {
  names: ['type', 'code', 'ip'],
  labels: ['设备类型', '设备编号', '设备IP'],
}

/*设备参数、网络参数全部字段显示*/
const DEVICEUPDATADEF = {
  network_configuration: {
    names: ['code', 'type', 'ip', 'mask', 'gateway', 'mac', 'oneAimsIp', 'oneAimsPort', 'oneTdoaPort', 'oneEnable', 'twoAimsIp', 'twoAimsPort', 'twoTdoaPort', 'twoEnable', 'threeAimsIp', 'threeAimsPort', 'threeTdoaPort', 'threeEnable'],
    types: ['NUMBER', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'NUMBER', 'NUMBER', 'SELECT', 'STRING', 'NUMBER', 'NUMBER', 'SELECT', 'STRING', 'NUMBER', 'NUMBER', 'SELECT'],
    labels: ['设备地址', '设备类型', 'IP地址', '子网掩码', '默认网关', '物理mac地址', '目标ip1', '目标端口1', 'TDOA端口1', '1是否启用', '目标IP2', '目标端口2', 'TDOA端口2', '2是否启用', '目标IP3', '目标端口3', 'TDOA端口3', '3是否启用']
  },
  device_configuration: {
    names: ['type', 'code', 'uploadInterval', 'reconnectInterval', 'oneReceivingFrequency', 'twoReceivingFrequency', 'canId', 'lightNums', 'version', 'oneAntennaDelay', 'twoAntennaDelay', 'isshowBackside', 'timeSynchronization', 'areaId', 'lightFontShap', 'lightReverseShap', 'lightFontDuration', 'lightReverseDuration', 'uploadHartbeat', 'oneTransmitPower', 'oneCommunicationRate', 'onePulseReptFrequency', 'onePreambleCode', 'onePreambleCodeLength', 'onePac', 'twoTransmitPower', 'twoCommunicationRate', 'twoPulseReptFrequency', 'twoPreambleCode', 'twoPreambleCodeLength', 'twoPac', 'broadcastDuration', 'blinkDuration', 'responseDuration', 'finalDuration', 'afterPositionDormat', 'confictDormat', 'ackDuration', 'checkingDuration', 'rangingDuration', 'dormancyStatus', 'signalDuration', 'positionPattern', 'multidimposmode', 'multidimposseq'],
    types: ['SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'SELECT', 'SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'SELECT', 'NUMBER', 'NUMBER', 'SELECT', 'SELECT', 'NUMBER', 'NUMBER', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'SELECT', 'NUMBER', 'SELECT', 'SELECT', 'SELECT'],
    labels: ['设备类型', '设备地址', '上传间隔', '重连间隔', '接收频点1(第一路DW1000)', '接收频点2(第一路DW1000)', 'CANID', '组内红绿灯数量', '程序版本', '天线1延迟值', '天线2延迟值', '红绿灯是否显示背面面板', '分站时间同步上级分站', '分站区域编号', '红绿灯正面显示形状', '红绿灯反面显示形状', '离线正面时长', '离线反面时长', '通信分站是否上传心跳', '第一路DW1000发射功率', '第一路DW1000通信速率', '第一路DW1000脉冲重复频率', '第一路DW1000前导码', '第一路DW1000长度', '第一路DW1000PAC', '第二路DW1000发射功率', '第二路DW1000通信速率', '第二路DW1000脉冲重复频率', '第二路DW1000前导码', '第二路DW1000长度', '第二路DW1000PAC', '广播时长', '设置Blink时长', '设置侦听Response时长', '设置侦听Final时长', '设置定位完成后休眠时长', '设置冲突时休眠时长', '设置侦听ACK时长', '设置Checking时长', '设置Ranging时长', '休眠状态', '侦听信号时长', '定位模式', '定位基站数', '通讯序号']
  }
}

export { DEVICEREVEAL, DEVICEUPDATADEF}