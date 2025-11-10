// MDX 模型数据类型定义（基于 war3-model 但简化）

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec2 {
  u: number;
  v: number;
}

export interface MDXGeoset {
  Vertices: Float32Array; // 顶点位置
  Normals: Float32Array; // 法线
  TVertices: Float32Array[]; // UV 坐标（可能有多个 UV 集）
  Faces: Uint16Array; // 三角形索引
  VertexGroup: Uint8Array; // 顶点所属的组
  Groups: number[][]; // 每个组包含的骨骼索引
  MaterialID: number; // 材质 ID
}

export interface MDXMaterial {
  Layers: MDXLayer[];
  PriorityPlane?: number;
  RenderMode?: number;
}

export interface MDXLayer {
  FilterMode?: number; // 混合模式: 0=None, 1=Transparent, 2=Blend, 3=Additive, 4=AddAlpha, 5=Modulate, 6=Modulate2x
  Shading?: number;
  TextureID: number; // 纹理索引
  TVertexAnimId?: number;
  CoordId?: number;
  Alpha?: number;
}

export interface MDXTexture {
  Image: string; // 纹理路径
  ReplaceableId: number; // 可替换纹理 ID (1=团队颜色, 2=团队光泽)
  Flags?: number;
}

export interface MDXSequence {
  Name: string;
  Interval: [number, number]; // [开始帧, 结束帧]
  MoveSpeed?: number;
  NonLooping?: boolean;
  Rarity?: number;
}

export interface MDXNode {
  ObjectId: number;
  Name: string;
  Parent?: number;
  PivotPoint: Float32Array; // vec3
  Flags?: number;
}

export interface MDXModel {
  Version: number;
  Info?: {
    Name: string;
  };
  Geosets: MDXGeoset[];
  Materials: MDXMaterial[];
  Textures: MDXTexture[];
  Sequences?: MDXSequence[];
  Nodes: (MDXNode | null)[];
  GlobalSequences?: number[];
  GeosetAnims?: any[];
}
