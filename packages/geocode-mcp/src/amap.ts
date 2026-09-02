/**
 * 高德 Web 服务 API 客户端（自研 MCP 的数据源）。
 * 返回的坐标为 GCJ-02（火星坐标），前端会统一纠偏为 WGS-84。
 */

export interface AmapPoi {
  id: string;
  name: string;
  address: string;
  lng: number;
  lat: number;
  pname: string;
  cityname: string;
  adname: string;
  type: string;
}

const AMAP_BASE = "https://restapi.amap.com/v3";

function assertAmapKey(): string {
  const key = process.env.AMAP_KEY;
  if (!key) {
    throw new Error("缺少 AMAP_KEY 环境变量，请在高德开放平台申请「Web 服务」类型 key");
  }
  return key;
}

async function amapRequest(
  path: string,
  params: Record<string, string>,
): Promise<Record<string, any>> {
  // 注意：不能用 new URL(path, AMAP_BASE)。path 以 "/" 开头时是绝对路径，
  // 会把 base 里的 "/v3" 整个替换掉，导致请求打到 https://restapi.amap.com/place/text
  // （少了 /v3），高德返回 SERVICE_NOT_AVAILABLE (infocode=10002)。
  // 这里直接字符串拼接，保证最终是 https://restapi.amap.com/v3/place/text。
  const url = new URL(`${AMAP_BASE}${path}`);
  url.searchParams.set("key", assertAmapKey());
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  const data = (await res.json()) as Record<string, any>;
  if (data.status !== "1") {
    throw new Error(
      `高德接口错误: status=${data.status} info=${data.info} infocode=${data.infocode}`,
    );
  }
  return data;
}

function parseLocation(location?: string): [number, number] {
  const [lng, lat] = (location ?? "0,0").split(",").map(Number);
  return [lng, lat];
}

/** 关键字检索 POI（地名地址检索主工具） */
export async function searchPlace(
  keywords: string,
  city?: string,
  types?: string,
): Promise<AmapPoi[]> {
  const data = await amapRequest("/place/text", {
    keywords,
    city: city ?? "",
    types: types ?? "",
    offset: "10",
    page: "1",
    extensions: "base",
  });
  const pois: any[] = data.pois ?? [];
  return pois.map((p) => {
    const [lng, lat] = parseLocation(p.location);
    return {
      id: p.id ?? "",
      name: p.name ?? "",
      address: Array.isArray(p.address) ? p.address.join("") : (p.address ?? ""),
      lng,
      lat,
      pname: p.pname ?? "",
      cityname: p.cityname ?? "",
      adname: p.adname ?? "",
      type: p.type ?? "",
    };
  });
}

/** 结构化地址 → 经纬度 */
export async function geocode(address: string, city?: string): Promise<AmapPoi[]> {
  const data = await amapRequest("/geocode/geo", { address, city: city ?? "" });
  const geocodes: any[] = data.geocodes ?? [];
  return geocodes.map((g) => {
    const [lng, lat] = parseLocation(g.location);
    return {
      id: g.id ?? "",
      name: g.formatted_address ?? address,
      address: g.formatted_address ?? address,
      lng,
      lat,
      pname: g.province ?? "",
      cityname: g.city ?? "",
      adname: g.district ?? "",
      type: g.level ?? "",
    };
  });
}
