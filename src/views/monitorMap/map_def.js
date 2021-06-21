let topicDefs = [
  {
    iconName: 'car',
    label: '车辆按区域分布',
    fnName: 'getVehicleStaff',
    tType: 'vehicle',
    groupType:'area'
  },
  {
    iconName: 'man',
    label: '人员按部门分布',
    fnName: 'getVehicleStaff',
    tType: 'staff',
    groupType:'dept'
  }, 
  {
    iconName:'manArea',
    label: '人员按区域分布',
    fnName: 'getVehicleStaff',
    tType: 'staff',
    groupType:'area'
  }, 
  {
    iconName: 'manDept',
    label: '人员按岗位分布',
    fnName: 'getVehicleStaff',
    tType: 'staff',
    groupType:'post'
  }, 
  {
    iconName: 'manCall',
    label: '人员呼叫',
    fnName: 'getCallList',
  }, 
  {
    iconName: 'callList',
    label: '呼救列表',
    fnName: 'getHelpList',
  }
]

let tableColumns = [
  [
    {
      title: '区域',
      dataIndex: 'name',
    },
    {
      title: '车辆',
      dataIndex: 'count',
    }
  ],
  [
    {
      title: '部门',
      dataIndex: 'name',
    },
    {
      title: '人数',
      dataIndex: 'count',
    }
  ],
  [
    {
      title: '区域',
      dataIndex: 'name',
    },
    {
      title: '人数',
      dataIndex: 'count',
    }
  ],
  [
    {
      title: '岗位',
      dataIndex: 'name',
    },
    {
      title: '人数',
      dataIndex: 'count',
    }
  ],
  [
    {
      title: '发起人',
      dataIndex: 'sendName',
    },
    {
      title: '呼叫人',
      dataIndex: 'receiveName',
    },
    {
      title: '发起时间',
      dataIndex: 'sendTime',
    },
    {
      title: '操作',
      dataIndex: 'handle',
      scopedSlots: { customRender: 'handle' }
    }
  ],
  [
    {
      title: '姓名',
      dataIndex: 'sendName',
    },
    {
      title: '呼救时间',
      dataIndex: 'sendTime',
    },
    {
      title: '操作',
      dataIndex: 'handle',
      scopedSlots: { customRender: 'handle' }
    }
  ],
]

const expandedColumns = {
  'car': [
    {title: '车辆名称', dataIndex: 'name'},
    {title: '速度',dataIndex: 'speed'},
    {title: '操作',dataIndex: 'handle',scopedSlots: { customRender: 'handle' }}
  ],
  'man': [
    {title: '姓名', dataIndex: 'name'},
    {title: '入井时间',dataIndex: 'attStartTime'},
    {title: '地图',dataIndex: 'mapName'},
    {title: '操作',dataIndex: 'handle',scopedSlots: { customRender: 'handle' }}
  ],
  'manArea': [
    {title: '姓名', dataIndex: 'name'},
    {title: '入井时间',dataIndex: 'attStartTime'},
    {title: '操作',dataIndex: 'handle',scopedSlots: { customRender: 'handle' }}
  ],
  'manArea': [
    {title: '姓名', dataIndex: 'name'},
    {title: '入井时间',dataIndex: 'attStartTime'},
    {title: '操作',dataIndex: 'handle',scopedSlots: { customRender: 'handle' }}
  ],
  'manDept': [
    {title: '姓名', dataIndex: 'name'},
    {title: '入井时间',dataIndex: 'attStartTime'},
    {title: '操作',dataIndex: 'handle',scopedSlots: { customRender: 'handle' }}
  ]
}

/*
  人车详细列表展示配置
*/
const detailColumns = {
  'staff': [
    {title: '卡号', dataIndex: 'ident', align:"center"},
    {title: '姓名', dataIndex: 'name', align:"center"},
    {title: '部门', dataIndex: 'deptName', align:"center"},
    {title: '入井时间', dataIndex: 'attStartTime', align:"center"},
    {title: '进入区域时间', dataIndex: 'enterAreaTime', align:"center"},
    {title: '工作时长', dataIndex: 'duration', align:"center"},
    {title: '区域', dataIndex: 'areaName', align:"center"},
    {title: '地图', dataIndex: 'mapName', align:"center"},
    {title: '运动状态', dataIndex: 'stayFlag', align:"center"},
    {title: '速度(m/s)', dataIndex: 'speed', align:"center"},
    {title: '操作', dataIndex: 'handle', align:"center", scopedSlots: { customRender: 'handle' }},
  ],
  'vehicle': [
    {title: '卡号', dataIndex: 'ident', align:"center"},
    {title: '名称', dataIndex: 'name', align:"center"},
    {title: '部门', dataIndex: 'deptName', align:"center"},
    {title: '入井时间', dataIndex: 'attStartTime', align:"center"},
    {title: '进入区域时间', dataIndex: 'enterAreaTime', align:"center"},
    {title: '工作时长', dataIndex: 'duration', align:"center"},
    {title: '区域', dataIndex: 'areaName', align:"center"},
    {title: '地图', dataIndex: 'mapName', align:"center"},
    {title: '运动状态', dataIndex: 'stayFlag', align:"center"},
    {title: '速度', dataIndex: 'speed', align:"center"},
    {title: '操作', dataIndex: 'handle', align:"center", scopedSlots: { customRender: 'handle' }},
  ],
}

/*
  人车详细列表展示配置
*/
const upminColumns = {
  'staff': [
    {title: '卡号', dataIndex: 'ident', align:"center"},
    {title: '姓名', dataIndex: 'name', align:"center"},
    {title: '部门', dataIndex: 'deptName', align:"center"},
    {title: '入井时间', dataIndex: 'attStartTime', align:"center"},
    {title: '工作时长', dataIndex: 'duration', align:"center"},
    {title: '区域', dataIndex: 'areaName', align:"center"},
    {title: '地图', dataIndex: 'mapName', align:"center"},
    {title: '运动状态', dataIndex: 'statusName', align:"center"},
    {title: '是否禁止下井', dataIndex: 'forbinFlag', align:"center", scopedSlots: { customRender: 'forbinFlag' }},
    {title: '操作', dataIndex: 'handle', align:"center", scopedSlots: { customRender: 'handle' }},
  ],
}

export { topicDefs, tableColumns, expandedColumns, detailColumns, upminColumns }
