/*
字段类型：NUMBER, STRING, DATETIME, SELECT, IMAGE, MAP, COLOR, ICON, PATH
每种字段类型，在客户端都对应不同的录入/修改、查阅/显示方式：
* NUMBER : 显示：span，右对齐； 录入：<input type="number">
* STRING : 显示：span, 居中对齐； 录入：<input type="text">
* DATETIME : 显示： span, 居中对齐； 录入：日期选择器 <input type="date">
* SELECT :  显示：span, 居中对齐（value 值为 INT)；录入：select, value 值为 INT
* IMAGE : 显示：span，文件名（居中），鼠标移上去，显示 img 浮层；录入：input，文件名，鼠标点击，打开图片文件对话框。
* MAP：显示：span, 文件名（居中），鼠标点击，打开地图对话框；录入：input，文件名，鼠标点击，打开地图文件对话框。
* COLOR：显示：span，颜色值文字，背景为对应颜色； 录入：颜色选择器 <input type="color">
* ICON : 显示：span + svg；录入：icon选择器（自定义）
* PATH : 显示：链接，鼠标移上去，显示浮层； 录入：textarea，dialog
 */
const metadata = {
  area: {
    name: 'area',
    label: '区域',
    table: 'dat_area',
    keyIndex: 0, // table中key值在 field 中的位置
    fields: {
      names: ['code', 'name', 'mapId', 'mapName', 'areaType', 'areaList', 'maxPeople', 'maxCar', 'maxStandTime', 'speedPeopleCar', 'speedCarriageCar', 'speedSpecialCar', 'carAngle', 'point', 'workAreaFlag', 'description', 'points'], // 字段, md5用于更新地图
      types: ['NUMBER', 'STRING', 'SELECT', 'STRING', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING', 'STRING'], // 字段类型
      labels: ['区域编号', '区域名称', '所属地图', '地图名称', '区域类型', '区域业务', '人数上限', '车辆上限', '人停留时长上限', '人车速度(m/s)', '料车速度(m/s)', '特种车速度(m/s)', '车辆角度', '区域标注点', '是否是工作区', '区域描述', '坐标'],
      enableNull: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    }
  },
}

export { metadata }