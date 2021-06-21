const staffDef = {
  names: ['name', 'ident', 'dept', 'post', 'startTime', 'endTime'],
  labels: ['姓名', '卡号', '部门', '职务', '开始时间', '结束时间']
}

const timeOptions = [
  {value: 0, label: '无'},
  {value: 1, label: '1分钟'},
  {value: 5, label: '5分钟'},
  {value: 10, label: '10分钟'},
]

const tableColumns = [
  {
    title: '记录时间',
    dataIndex: 'locationTime',
    ellipsis: true,
    align: 'center',
  },
  {
    title: 'x坐标',
    dataIndex: 'x',
    ellipsis: true,
    align: 'center',
  },
  {
    title: 'y坐标',
    dataIndex: 'y',
    ellipsis: true,
    align: 'center',
  },
  {
    title: 'z坐标',
    dataIndex: 'z',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '分站',
    dataIndex: 'stations',
    ellipsis: true,
    align: 'center',
  },
]

export { staffDef, timeOptions, tableColumns }