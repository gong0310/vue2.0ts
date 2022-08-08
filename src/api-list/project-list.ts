import RequestApi from "@/common/request-api";
import { ICommonResp, IProjectItem } from "@/api-list/common";

export interface IProjectItemReq {
  offset?: number;
  limit?: number;
}
export interface IProjectItemResp {
  ret_msg: string;
  service_list: Array<IProjectItem>;
  total_count: number;
}

export default async function projectList(req: IProjectItemReq): Promise<IProjectItemResp> {
  //处理请求参数格式化
  const resp: ICommonResp<IProjectItemResp> = await RequestApi.projectList(req);
  //处理返回数据格式化
  return resp.data;
}
