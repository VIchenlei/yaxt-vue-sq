let shortcutItems = [
    {
      type: 'notification',
      label: '告警',
      fnName: 'alarm'
    },
    {
      type: 'environment',
      label: '取消定位',
      fnName: 'location'
    }, 
    {
      type:'phone',
      label: '发起呼叫',
      fnName: 'sendcall'
    }, 
    {
      type: 'notification',
      label: '停止呼叫',
      fnName: 'stopcall'
    }, 
    {
      type: 'rocket',
      label: '手动升井',
      fnName: 'handupMine'
    }, 
    {
      type: 'rocket',
      label: '一键撤离',
      fnName: 'leave'
    }, 
    {
      type: 'project',
      label: '人员数量历史曲线',
      fnName: 'staffcurve'
    },
    {
      type: 'project',
      label: '陪同',
      fnName: 'accompany'
    }
]

export { shortcutItems }