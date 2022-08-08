/**
 * 通用API返回结构体
 */
export interface ICommonResp<T> {
  code: number;
  msg: string;
  data: T;
}
// 分页对象
export interface ICommonPage {
  page_num: number;
  page_size: number;
  total_num: number;
}
/**
 * 业务对象
 */
export interface IProjectItem {
  sce_id?: number;
  creator?: string;
  business_id?: number | string;
  business_name?: string;
  status?: number;
  requester?: string;
  passer?: string;
  create_time?: number;
  modify_time?: number;
}
export interface IConfigureListItem {
  qos_item_info_po: IQosItemInfoPo;
  qos_detail_info_po: IQosDetailInfoPo;
  qos_detail_info_sandbox_po: IQosDetailInfoSandboxPo;
}
// 行业缴费限流项目信息
export interface IQosItemInfoPo {
  sce_id?: number;
  item_no?: string;
  is_on_line?: number;
}
// 行业缴费限流配置详情
export interface IQosDetailInfoPo {
  item_name?: string;
  create_time?: number | string;
  modify_time?: number | string;
}
// 行业缴费沙箱限流配置详情
export interface IQosDetailInfoSandboxPo {
  business_id?: string;
  sce_id?: number;
  status?: number;
  is_on_line?: number;
}
