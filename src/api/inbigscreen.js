import { getAction, deleteAction, putAction, postAction } from '@/api/manage'

const getAllStaff=()=>getAction('staff/all',"")
export{
  getAllStaff
}