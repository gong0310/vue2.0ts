import RequestApi from "@/common/request-api";
import { ICommonResp, IConfigureListItem } from "@/api-list/common";

export interface IConfigureListReq {
  offset?: number;
  limit?: number;
  sce_id?: number;
  item_no?: string;
  is_on_line: number;
}
export interface IConfigureListResp {
  return_msg?: string;
  total_count: number;
  qos_item_set_info_list?: Array<IConfigureListItem>;
}

export default async function configureList(req: IConfigureListReq) {
  const resp: ICommonResp<IConfigureListResp> = await RequestApi.configureList(req);
  return resp.data;
}
