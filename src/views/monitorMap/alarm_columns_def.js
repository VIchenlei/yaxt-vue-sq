let alarmColmuns = {
  1: [
    {
      title: '告警类型',
      dataIndex: 'typeName',
      ellipsis: true,
      align: 'center'
    },
    {
      title: '告警开始时间',
      dataIndex: 'startTime',
      ellipsis: true,
      align: 'center'
    },
    {
      title: '限制值',
      dataIndex: 'limitValue',
      ellipsis: true,
      align: 'center',
    },
    {
      title: '当前值',
      dataIndex: 'curValue',
      ellipsis: true,
      align: 'center'
    },
    // {
    //   title: '操作',
    //   dataIndex: 'operate',
    //   ellipsis: true,
    //   align: 'center',
    //   width: '40px',
    //   scopedSlots: { customRender: 'operate' },
    // },
  ],
  3: [
    {
      title: '告警类型',
      dataIndex: 'typeName',
      ellipsis: true,
      align: 'center'
    },
    {
      title: '告警开始时间',
      dataIndex: 'startTime',
      ellipsis: true,
      align: 'center'
    },
    {
      title: '告警对象',
      dataIndex: 'name',
      ellipsis: true,
      align: 'center',
    },
    {
      title: '限制值',
      dataIndex: 'limitValue',
      ellipsis: true,
      align: 'center',
    },
    {
      title: '当前值',
      dataIndex: 'curValue',
      ellipsis: true,
      align: 'center'
    },
    // {
    //   title: '操作',
    //   dataIndex: 'operate',
    //   ellipsis: true,
    //   align: 'center',
    //   width: '40px',
    //   scopedSlots: { customRender: 'operate' },
    // },
  ]
}

export { alarmColmuns }