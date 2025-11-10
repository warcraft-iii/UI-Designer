import { invoke } from '@tauri-apps/api/core';

/**
 * BLP 图像数据（RGBA 格式）
 */
export interface BlpImageData {
  width: number;
  height: number;
  data: number[]; // RGBA 数据，每像素 4 字节
}

/**
 * BLP 文件信息
 */
export interface BlpInfo {
  width: number;
  height: number;
  mipmap_count: number;
  format: string; // "JPEG" | "Paletted" | "DXT1/DXT3/DXT5"
}

/**
 * MDX 顶点
 */
export interface MdxVertex {
  x: number;
  y: number;
  z: number;
}

/**
 * MDX 法线
 */
export interface MdxNormal {
  x: number;
  y: number;
  z: number;
}

/**
 * MDX UV 坐标
 */
export interface MdxUV {
  u: number;
  v: number;
}

/**
 * MDX 三角面
 */
export interface MdxFace {
  indices: [number, number, number];
}

/**
 * MDX 包围盒
 */
export interface MdxBoundingBox {
  min: MdxVertex;
  max: MdxVertex;
}

/**
 * MDX 模型信息
 */
export interface MdxModelInfo {
  name: string;
  minimum_extent?: MdxVertex;
  maximum_extent?: MdxVertex;
  bounds_radius: number;
  blend_time: number;
}

/**
 * MDX 序列（动画）
 */
export interface MdxSequence {
  name: string;
  interval: [number, number];
  move_speed: number;
  non_looping: boolean;
  rarity: number;
  minimum_extent?: MdxVertex;
  maximum_extent?: MdxVertex;
  bounds_radius: number;
}

/**
 * MDX 纹理
 */
export interface MdxTexture {
  replaceable_id: number;
  path: string;
  flags: number;
}

/**
 * MDX 材质层
 */
export interface MdxLayer {
  filter_mode: number;
  shading: number;
  texture_id: number;
  coord_id: number;
  alpha: number;
}

/**
 * MDX 材质
 */
export interface MdxMaterial {
  priority_plane: number;
  render_mode: number;
  layers: MdxLayer[];
}

/**
 * MDX 几何体
 */
export interface MdxGeoset {
  vertices: MdxVertex[];
  normals: MdxVertex[];
  uvs: MdxUV[][];
  faces: MdxFace[];
  vertex_groups: number[];
  material_id: number;
  selection_group: number;
  bounds: MdxBoundingBox;
}

/**
 * MDX 节点
 */
export interface MdxNode {
  name: string;
  object_id?: number;
  parent?: number;
  pivot_point?: MdxVertex;
  flags: number;
  geoset_id?: number;
  geoset_anim_id?: number;
}

/**
 * MDX 模型数据（完整版本）
 */
export interface MdxModel {
  version: number;
  info: MdxModelInfo;
  sequences: MdxSequence[];
  global_sequences: number[];
  textures: MdxTexture[];
  materials: MdxMaterial[];
  geosets: MdxGeoset[];
  geoset_anims: any[];
  bones: MdxNode[];
  helpers: MdxNode[];
  attachments: any[];
  pivot_points: MdxVertex[];
  event_objects: any[];
  collision_shapes: any[];
  cameras: any[];
  lights: any[];
  particle_emitters: any[];
  particle_emitters2: any[];
  ribbon_emitters: any[];
  texture_anims: any[];
  nodes: (MdxNode | null)[];
}

/**
 * 解码 BLP 文件为 PNG base64（直接用于 <img> 标签）
 */
export async function decodeBLPToPNG(blpData: Uint8Array): Promise<string> {
  return invoke<string>('decode_blp_to_png', {
    blpData: Array.from(blpData),
  });
}

/**
 * 解码 BLP 文件为 RGBA 数据
 */
export async function decodeBLPToRGBA(blpData: Uint8Array): Promise<BlpImageData> {
  return invoke<BlpImageData>('decode_blp_to_rgba', {
    blpData: Array.from(blpData),
  });
}

/**
 * 获取 BLP 文件信息（不解码图像数据）
 */
export async function getBLPInfo(blpData: Uint8Array): Promise<BlpInfo> {
  return invoke<BlpInfo>('get_blp_file_info', {
    blpData: Array.from(blpData),
  });
}

/**
 * 解码 BLP 指定 mipmap 层级
 */
export async function decodeBLPMipmap(blpData: Uint8Array, level: number): Promise<BlpImageData> {
  return invoke<BlpImageData>('decode_blp_mipmap_level', {
    blpData: Array.from(blpData),
    level,
  });
}

/**
 * 解析 MDX 文件
 */
export async function parseMDX(mdxData: Uint8Array): Promise<MdxModel> {
  const jsonStr = await invoke<string>('parse_mdx_file', {
    mdxData: Array.from(mdxData),
  });
  return JSON.parse(jsonStr);
}

/**
 * 从 MPQ 档案中解析 MDX 文件
 */
export async function parseMDXFromMPQ(archivePath: string, fileName: string): Promise<MdxModel> {
  const jsonStr = await invoke<string>('parse_mdx_from_mpq', {
    archivePath,
    fileName,
  });
  return JSON.parse(jsonStr);
}

/**
 * 从本地文件系统解析 MDX 文件
 */
export async function parseMDXFromFile(filePath: string): Promise<MdxModel> {
  const jsonStr = await invoke<string>('parse_mdx_from_file', {
    filePath,
  });
  return JSON.parse(jsonStr);
}

/**
 * 将 BlpImageData 转换为 ImageData（用于 Canvas）
 */
export function blpImageDataToImageData(blpData: BlpImageData): ImageData {
  const uint8Array = new Uint8ClampedArray(blpData.data);
  return new ImageData(uint8Array, blpData.width, blpData.height);
}

/**
 * 将 BlpImageData 转换为 Data URL（用于 <img> 标签）
 */
export function blpImageDataToDataURL(blpData: BlpImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = blpData.width;
  canvas.height = blpData.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建 Canvas 上下文');
  }
  
  const imageData = blpImageDataToImageData(blpData);
  ctx.putImageData(imageData, 0, 0);
  
  return canvas.toDataURL();
}
