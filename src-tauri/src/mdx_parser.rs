// MDX/MDL 模型文件解析器
// 参考格式: Warcraft III MDX binary format specification
// 参考实现: war3-model JavaScript 库

use byteorder::{LittleEndian, ReadBytesExt};
use serde::{Deserialize, Serialize};
use std::io::{Cursor, Read, Seek, SeekFrom};

// MDX 文件头结构 (4 bytes magic + version)
const MDX_MAGIC: &[u8; 4] = b"MDLX";
const BIG_ENDIAN: bool = false; // MDX 使用小端序
const NONE: i32 = -1; // 用于表示 null 的特殊值

// 完整的 MDX 模型结构
#[derive(Debug, Serialize, Deserialize)]
pub struct MdxModel {
    pub version: u32,
    pub info: ModelInfo,
    pub sequences: Vec<Sequence>,
    pub global_sequences: Vec<u32>,
    pub textures: Vec<Texture>,
    pub materials: Vec<Material>,
    pub geosets: Vec<Geoset>,
    pub geoset_anims: Vec<GeosetAnim>,
    pub bones: Vec<Node>,
    pub helpers: Vec<Node>,
    pub attachments: Vec<Attachment>,
    pub pivot_points: Vec<Vec3>,
    pub event_objects: Vec<EventObject>,
    pub collision_shapes: Vec<CollisionShape>,
    pub cameras: Vec<Camera>,
    pub lights: Vec<Light>,
    pub particle_emitters: Vec<ParticleEmitter>,
    pub particle_emitters2: Vec<ParticleEmitter2>,
    pub ribbon_emitters: Vec<RibbonEmitter>,
    pub texture_anims: Vec<TextureAnim>,
    pub nodes: Vec<Option<Node>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelInfo {
    pub name: String,
    pub minimum_extent: Option<Vec3>,
    pub maximum_extent: Option<Vec3>,
    pub bounds_radius: f32,
    pub blend_time: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Sequence {
    pub name: String,
    pub interval: [u32; 2],
    pub move_speed: f32,
    pub non_looping: bool,
    pub rarity: f32,
    pub minimum_extent: Option<Vec3>,
    pub maximum_extent: Option<Vec3>,
    pub bounds_radius: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Texture {
    pub replaceable_id: u32,
    pub path: String,
    pub flags: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Material {
    pub priority_plane: u32,
    pub render_mode: u32,
    pub layers: Vec<Layer>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Layer {
    pub filter_mode: u32,
    pub shading: u32,
    pub texture_id: i32,
    pub coord_id: u32,
    pub alpha: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Geoset {
    pub vertices: Vec<Vec3>,
    pub normals: Vec<Vec3>,
    pub uvs: Vec<Vec<Vec2>>, // 可能有多个 UV 集
    pub faces: Vec<Face>,
    pub vertex_groups: Vec<u8>,
    pub material_id: u32,
    pub selection_group: u32,
    pub bounds: BoundingBox,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeosetAnim {
    pub geoset_id: i32,
    pub alpha: f32,
    pub color: Option<Vec3>,
    pub flags: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Node {
    pub name: String,
    pub object_id: Option<u32>,
    pub parent: Option<u32>,
    pub pivot_point: Option<Vec3>,
    pub flags: u32,
    pub geoset_id: Option<i32>,
    pub geoset_anim_id: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Attachment {
    pub node: Node,
    pub path: String,
    pub attachment_id: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EventObject {
    pub node: Node,
    pub event_track: Vec<u32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CollisionShape {
    pub node: Node,
    pub shape: u32, // 0=Box, 1=Plane, 2=Sphere, 3=Cylinder
    pub vertices: Vec<f32>,
    pub radius: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Camera {
    pub name: String,
    pub position: Vec3,
    pub field_of_view: f32,
    pub far_clip: f32,
    pub near_clip: f32,
    pub target_position: Vec3,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Light {
    pub node: Node,
    pub light_type: u32,
    pub attenuation_start: f32,
    pub attenuation_end: f32,
    pub color: Vec3,
    pub intensity: f32,
    pub ambient_color: Vec3,
    pub ambient_intensity: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParticleEmitter {
    pub node: Node,
    pub emission_rate: f32,
    pub gravity: f32,
    pub longitude: f32,
    pub latitude: f32,
    pub path: String,
    pub life_span: f32,
    pub speed: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParticleEmitter2 {
    pub node: Node,
    pub speed: f32,
    pub variation: f32,
    pub latitude: f32,
    pub gravity: f32,
    pub life_span: f32,
    pub emission_rate: f32,
    pub width: f32,
    pub length: f32,
    pub filter_mode: u32,
    pub texture_id: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RibbonEmitter {
    pub node: Node,
    pub height_above: f32,
    pub height_below: f32,
    pub alpha: f32,
    pub color: Vec3,
    pub life_span: f32,
    pub texture_slot: u32,
    pub emission_rate: u32,
    pub material_id: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TextureAnim {
    // 纹理动画数据
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub struct Vec3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub struct Vec2 {
    pub u: f32,
    pub v: f32,
}

// 向下兼容旧的名称
pub type Vertex = Vec3;
pub type Normal = Vec3;
pub type UV = Vec2;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Face {
    pub indices: [u16; 3], // 三角面的三个顶点索引
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub struct BoundingBox {
    pub min: Vec3,
    pub max: Vec3,
}

// Chunk 类型标识符 (4 bytes)
#[derive(Debug, PartialEq)]
enum ChunkType {
    Vers, // Version
    Modl, // Model info
    Seqs, // Sequences (animations)
    Glbs, // Global sequences
    Mtls, // Materials
    Texs, // Textures
    Txan, // Texture animations
    Geos, // Geosets (geometry data)
    Geoa, // Geoset animations
    Bone, // Bones
    Help, // Helpers
    Atch, // Attachments
    Pivt, // Pivot points
    Evts, // Events
    Clid, // Collision shapes
    Cams, // Cameras
    Lite, // Lights
    Prem, // Particle emitters
    Pre2, // Particle emitters 2
    Ribb, // Ribbon emitters
    Unknown,
}

impl ChunkType {
    fn from_bytes(bytes: &[u8; 4]) -> Self {
        match bytes {
            b"VERS" => ChunkType::Vers,
            b"MODL" => ChunkType::Modl,
            b"SEQS" => ChunkType::Seqs,
            b"GLBS" => ChunkType::Glbs,
            b"MTLS" => ChunkType::Mtls,
            b"TEXS" => ChunkType::Texs,
            b"TXAN" => ChunkType::Txan,
            b"GEOS" => ChunkType::Geos,
            b"GEOA" => ChunkType::Geoa,
            b"BONE" => ChunkType::Bone,
            b"HELP" => ChunkType::Help,
            b"ATCH" => ChunkType::Atch,
            b"PIVT" => ChunkType::Pivt,
            b"EVTS" => ChunkType::Evts,
            b"CLID" => ChunkType::Clid,
            b"CAMS" => ChunkType::Cams,
            b"LITE" => ChunkType::Lite,
            b"PREM" => ChunkType::Prem,
            b"PRE2" => ChunkType::Pre2,
            b"RIBB" => ChunkType::Ribb,
            _ => ChunkType::Unknown,
        }
    }
}

pub struct MdxParser {
    cursor: Cursor<Vec<u8>>,
}

impl MdxParser {
    pub fn new(data: Vec<u8>) -> Result<Self, String> {
        Ok(MdxParser {
            cursor: Cursor::new(data),
        })
    }

    // 辅助方法：读取关键字（4字节字符串）
    fn read_keyword(&mut self) -> Result<[u8; 4], String> {
        let mut keyword = [0u8; 4];
        self.cursor
            .read_exact(&mut keyword)
            .map_err(|e| format!("Failed to read keyword: {}", e))?;
        Ok(keyword)
    }

    // 辅助方法：读取固定长度字符串
    fn read_string(&mut self, length: usize) -> Result<String, String> {
        let mut bytes = vec![0u8; length];
        self.cursor
            .read_exact(&mut bytes)
            .map_err(|e| format!("Failed to read string: {}", e))?;
        
        // 找到第一个 null 字符
        let end = bytes.iter().position(|&b| b == 0).unwrap_or(length);
        Ok(String::from_utf8_lossy(&bytes[..end]).to_string())
    }

    // 辅助方法：读取 Vec3
    fn read_vec3(&mut self) -> Result<Vec3, String> {
        Ok(Vec3 {
            x: self.cursor.read_f32::<LittleEndian>().map_err(|e| e.to_string())?,
            y: self.cursor.read_f32::<LittleEndian>().map_err(|e| e.to_string())?,
            z: self.cursor.read_f32::<LittleEndian>().map_err(|e| e.to_string())?,
        })
    }

    // 辅助方法：读取边界范围
    fn read_extent(&mut self) -> Result<(f32, Option<Vec3>, Option<Vec3>), String> {
        let bounds_radius = self.cursor.read_f32::<LittleEndian>().map_err(|e| e.to_string())?;
        let minimum_extent = Some(self.read_vec3()?);
        let maximum_extent = Some(self.read_vec3()?);
        Ok((bounds_radius, minimum_extent, maximum_extent))
    }

    pub fn parse(&mut self) -> Result<MdxModel, String> {
        // 读取文件头
        let magic = self.read_keyword()?;

        if &magic != MDX_MAGIC {
            return Err(format!(
                "Invalid MDX magic: expected {:?}, got {:?}",
                MDX_MAGIC, magic
            ));
        }

        let mut model = MdxModel {
            version: 800,
            info: ModelInfo {
                name: String::new(),
                minimum_extent: None,
                maximum_extent: None,
                bounds_radius: 0.0,
                blend_time: 150,
            },
            sequences: Vec::new(),
            global_sequences: Vec::new(),
            textures: Vec::new(),
            materials: Vec::new(),
            geosets: Vec::new(),
            geoset_anims: Vec::new(),
            bones: Vec::new(),
            helpers: Vec::new(),
            attachments: Vec::new(),
            pivot_points: Vec::new(),
            event_objects: Vec::new(),
            collision_shapes: Vec::new(),
            cameras: Vec::new(),
            lights: Vec::new(),
            particle_emitters: Vec::new(),
            particle_emitters2: Vec::new(),
            ribbon_emitters: Vec::new(),
            texture_anims: Vec::new(),
            nodes: Vec::new(),
        };

        // 读取所有 chunks
        loop {
            let chunk_id = match self.read_keyword() {
                Ok(id) => id,
                Err(_) => break, // 文件结束
            };

            let chunk_type = ChunkType::from_bytes(&chunk_id);
            let chunk_size = self
                .cursor
                .read_u32::<LittleEndian>()
                .map_err(|e| format!("Failed to read chunk size: {}", e))?;

            // 根据 chunk 类型处理
            match chunk_type {
                ChunkType::Vers => {
                    model.version = self.cursor.read_u32::<LittleEndian>()
                        .map_err(|e| format!("Failed to read version: {}", e))?;
                }
                ChunkType::Modl => {
                    self.parse_model_info(&mut model)?;
                }
                ChunkType::Seqs => {
                    self.parse_sequences(&mut model, chunk_size)?;
                }
                ChunkType::Glbs => {
                    self.parse_global_sequences(&mut model, chunk_size)?;
                }
                ChunkType::Texs => {
                    self.parse_textures(&mut model, chunk_size)?;
                }
                ChunkType::Mtls => {
                    self.parse_materials(&mut model, chunk_size)?;
                }
                ChunkType::Geos => {
                    self.parse_geosets(&mut model, chunk_size)?;
                }
                ChunkType::Geoa => {
                    self.parse_geoset_anims(&mut model, chunk_size)?;
                }
                ChunkType::Bone => {
                    self.parse_bones(&mut model, chunk_size)?;
                }
                ChunkType::Help => {
                    self.parse_helpers(&mut model, chunk_size)?;
                }
                ChunkType::Atch => {
                    self.parse_attachments(&mut model, chunk_size)?;
                }
                ChunkType::Pivt => {
                    self.parse_pivot_points(&mut model, chunk_size)?;
                }
                ChunkType::Evts => {
                    self.parse_event_objects(&mut model, chunk_size)?;
                }
                ChunkType::Clid => {
                    self.parse_collision_shapes(&mut model, chunk_size)?;
                }
                _ => {
                    // 跳过未知或暂不处理的 chunk
                    self.cursor
                        .seek(SeekFrom::Current(chunk_size as i64))
                        .map_err(|e| format!("Failed to skip chunk: {}", e))?;
                }
            }
        }

        // 应用 pivot points 到 nodes
        for (i, pivot) in model.pivot_points.iter().enumerate() {
            if i < model.nodes.len() {
                if let Some(ref mut node) = model.nodes[i] {
                    node.pivot_point = Some(*pivot);
                }
            }
        }

        Ok(model)
    }

    fn parse_model_info(&mut self, model: &mut MdxModel) -> Result<(), String> {
        // 模型名称 (336 bytes in MDX, 80 in older versions)
        model.info.name = self.read_string(336)?;
        
        // 跳过 animation file name (4 bytes, unused)
        self.cursor.read_u32::<LittleEndian>().ok();
        
        // 读取边界
        let (radius, min_extent, max_extent) = self.read_extent()?;
        model.info.bounds_radius = radius;
        model.info.minimum_extent = min_extent;
        model.info.maximum_extent = max_extent;
        
        // Blend time
        model.info.blend_time = self.cursor.read_u32::<LittleEndian>()
            .map_err(|e| format!("Failed to read blend time: {}", e))?;

        Ok(())
    }

    fn parse_sequences(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let start_pos = self.cursor.position();
        
        while self.cursor.position() < start_pos + size as u64 {
            let name = self.read_string(80)?;
            
            let interval_start = self.cursor.read_u32::<LittleEndian>()?;
            let interval_end = self.cursor.read_u32::<LittleEndian>()?;
            let move_speed = self.cursor.read_f32::<LittleEndian>()?;
            let non_looping = self.cursor.read_u32::<LittleEndian>()? > 0;
            let rarity = self.cursor.read_f32::<LittleEndian>()?;
            
            // Sync point (4 bytes, unused)
            self.cursor.read_u32::<LittleEndian>()?;
            
            let (radius, min_extent, max_extent) = self.read_extent()?;
            
            model.sequences.push(Sequence {
                name,
                interval: [interval_start, interval_end],
                move_speed,
                non_looping,
                rarity,
                minimum_extent: min_extent,
                maximum_extent: max_extent,
                bounds_radius: radius,
            });
        }

        Ok(())
    }

    fn parse_global_sequences(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let count = size / 4;
        for _ in 0..count {
            model.global_sequences.push(self.cursor.read_u32::<LittleEndian>()?);
        }
        Ok(())
    }

    fn parse_textures(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let start_pos = self.cursor.position();
        
        while self.cursor.position() < start_pos + size as u64 {
            let replaceable_id = self.cursor.read_u32::<LittleEndian>()?;
            let path = self.read_string(256)?;
            let flags = self.cursor.read_u32::<LittleEndian>()?;
            
            model.textures.push(Texture {
                replaceable_id,
                path,
                flags,
            });
        }

        Ok(())
    }

    fn parse_materials(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let start_pos = self.cursor.position();
        
        while self.cursor.position() < start_pos + size as u64 {
            // Material inclusive size (unused)
            self.cursor.read_u32::<LittleEndian>()?;
            
            let priority_plane = self.cursor.read_u32::<LittleEndian>()?;
            let render_mode = self.cursor.read_u32::<LittleEndian>()?;
            
            // Read LAYS chunk
            let lays_keyword = self.read_keyword()?;
            if &lays_keyword != b"LAYS" {
                return Err(format!("Expected LAYS, got {:?}", lays_keyword));
            }
            
            let layers_count = self.cursor.read_u32::<LittleEndian>()?;
            let mut layers = Vec::new();
            
            for _ in 0..layers_count {
                let layer_size = self.cursor.read_u32::<LittleEndian>()?;
                let layer_start = self.cursor.position();
                
                let filter_mode = self.cursor.read_u32::<LittleEndian>()?;
                let shading = self.cursor.read_u32::<LittleEndian>()?;
                let texture_id = self.cursor.read_i32::<LittleEndian>()?;
                let _tvertex_anim_id = self.cursor.read_i32::<LittleEndian>()?;
                let coord_id = self.cursor.read_u32::<LittleEndian>()?;
                let alpha = self.cursor.read_f32::<LittleEndian>()?;
                
                layers.push(Layer {
                    filter_mode,
                    shading,
                    texture_id,
                    coord_id,
                    alpha,
                });
                
                // 跳到下一个 layer
                self.cursor.seek(SeekFrom::Start(layer_start + layer_size as u64))?;
            }
            
            model.materials.push(Material {
                priority_plane,
                render_mode,
                layers,
            });
        }

        Ok(())
    }

    fn parse_geosets(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let start_pos = self.cursor.position();

        while self.cursor.position() < start_pos + size as u64 {
            let geoset_size = self.cursor.read_u32::<LittleEndian>()?;
            let geoset_start = self.cursor.position();
            
            let mut geoset = Geoset {
                vertices: Vec::new(),
                normals: Vec::new(),
                uvs: Vec::new(),
                faces: Vec::new(),
                vertex_groups: Vec::new(),
                material_id: 0,
                selection_group: 0,
                bounds: BoundingBox {
                    min: Vec3 { x: 0.0, y: 0.0, z: 0.0 },
                    max: Vec3 { x: 0.0, y: 0.0, z: 0.0 },
                },
            };

            // 读取 geoset 内的 sub-chunks
            while self.cursor.position() < geoset_start + geoset_size as u64 {
                let chunk_id = self.read_keyword()?;

                match &chunk_id {
                    b"VRTX" => {
                        // Vertices
                        let count = self.cursor.read_u32::<LittleEndian>()?;
                        for _ in 0..count {
                            geoset.vertices.push(self.read_vec3()?);
                        }
                    }
                    b"NRMS" => {
                        // Normals
                        let count = self.cursor.read_u32::<LittleEndian>()?;
                        for _ in 0..count {
                            geoset.normals.push(self.read_vec3()?);
                        }
                    }
                    b"PTYP" => {
                        // Primitive types
                        let count = self.cursor.read_u32::<LittleEndian>()?;
                        self.cursor.seek(SeekFrom::Current((count * 4) as i64))?;
                    }
                    b"PCNT" => {
                        // Primitive counts
                        let count = self.cursor.read_u32::<LittleEndian>()?;
                        self.cursor.seek(SeekFrom::Current((count * 4) as i64))?;
                    }
                    b"PVTX" => {
                        // Primitive vertex indices
                        let count = self.cursor.read_u32::<LittleEndian>()?;
                        for _ in 0..(count / 3) {
                            let i0 = self.cursor.read_u16::<LittleEndian>()?;
                            let i1 = self.cursor.read_u16::<LittleEndian>()?;
                            let i2 = self.cursor.read_u16::<LittleEndian>()?;
                            geoset.faces.push(Face { indices: [i0, i1, i2] });
                        }
                    }
                    b"GNDX" => {
                        // Vertex group indices
                        let count = self.cursor.read_u32::<LittleEndian>()?;
                        for _ in 0..count {
                            geoset.vertex_groups.push(self.cursor.read_u8()?);
                        }
                    }
                    b"MTGC" | b"MATS" | b"TANG" | b"SKIN" | b"UVAS" => {
                        // 其他数据块，跳过
                        let count = self.cursor.read_u32::<LittleEndian>()?;
                        let bytes_per_item = match &chunk_id {
                            b"MTGC" => 4,
                            b"MATS" => 4,
                            b"TANG" => 16, // 4 floats
                            b"SKIN" => 8,  // 8 bytes per skin weight
                            b"UVAS" => {
                                // UV 集合
                                let num_uvs = count;
                                let mut uv_set = Vec::new();
                                for _ in 0..num_uvs {
                                    let u = self.cursor.read_f32::<LittleEndian>()?;
                                    let v = self.cursor.read_f32::<LittleEndian>()?;
                                    uv_set.push(Vec2 { u, v });
                                }
                                geoset.uvs.push(uv_set);
                                0 // Already read
                            }
                            _ => 4,
                        };
                        if bytes_per_item > 0 {
                            self.cursor.seek(SeekFrom::Current((count * bytes_per_item) as i64))?;
                        }
                    }
                    _ => {
                        // 未知 chunk，跳到 geoset 结尾
                        break;
                    }
                }
            }

            // 计算边界
            if !geoset.vertices.is_empty() {
                let mut min = geoset.vertices[0];
                let mut max = geoset.vertices[0];

                for vertex in &geoset.vertices {
                    min.x = min.x.min(vertex.x);
                    min.y = min.y.min(vertex.y);
                    min.z = min.z.min(vertex.z);

                    max.x = max.x.max(vertex.x);
                    max.y = max.y.max(vertex.y);
                    max.z = max.z.max(vertex.z);
                }

                geoset.bounds = BoundingBox { min, max };
            }

            model.geosets.push(geoset);
            
            // 确保指针在 geoset 结尾
            self.cursor.seek(SeekFrom::Start(geoset_start + geoset_size as u64))?;
        }

        Ok(())
    }

    fn parse_geoset_anims(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let start_pos = self.cursor.position();

        while self.cursor.position() < start_pos + size as u64 {
            let _anim_size = self.cursor.read_u32::<LittleEndian>()?;
            
            let alpha = self.cursor.read_f32::<LittleEndian>()?;
            let flags = self.cursor.read_u32::<LittleEndian>()?;
            
            let color_r = self.cursor.read_f32::<LittleEndian>()?;
            let color_g = self.cursor.read_f32::<LittleEndian>()?;
            let color_b = self.cursor.read_f32::<LittleEndian>()?;
            
            let geoset_id = self.cursor.read_i32::<LittleEndian>()?;
            
            model.geoset_anims.push(GeosetAnim {
                geoset_id: if geoset_id == NONE { -1 } else { geoset_id },
                alpha,
                color: Some(Vec3 { x: color_r, y: color_g, z: color_b }),
                flags,
            });
        }

        Ok(())
    }

    fn parse_node(&mut self, model: &mut MdxModel) -> Result<Node, String> {
        let size = self.cursor.read_u32::<LittleEndian>()?;
        let start_pos = self.cursor.position();
        
        let name = self.read_string(80)?;
        
        let object_id = self.cursor.read_i32::<LittleEndian>()?;
        let object_id = if object_id == NONE { None } else { Some(object_id as u32) };
        
        let parent = self.cursor.read_i32::<LittleEndian>()?;
        let parent = if parent == NONE { None } else { Some(parent as u32) };
        
        let flags = self.cursor.read_u32::<LittleEndian>()?;
        
        let node = Node {
            name,
            object_id,
            parent,
            pivot_point: None,
            flags,
            geoset_id: None,
            geoset_anim_id: None,
        };
        
        // 跳过动画数据 (KGTR, KGRT, KGSC 等)
        self.cursor.seek(SeekFrom::Start(start_pos + size as u64))?;
        
        // 确保 nodes 数组足够大
        if let Some(id) = object_id {
            while model.nodes.len() <= id as usize {
                model.nodes.push(None);
            }
            model.nodes[id as usize] = Some(node.clone());
        }
        
        Ok(node)
    }

    fn parse_bones(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let start_pos = self.cursor.position();

        while self.cursor.position() < start_pos + size as u64 {
            let mut bone = self.parse_node(model)?;
            
            let geoset_id = self.cursor.read_i32::<LittleEndian>()?;
            bone.geoset_id = if geoset_id == NONE { None } else { Some(geoset_id) };
            
            let geoset_anim_id = self.cursor.read_i32::<LittleEndian>()?;
            bone.geoset_anim_id = if geoset_anim_id == NONE { None } else { Some(geoset_anim_id) };
            
            model.bones.push(bone);
        }

        Ok(())
    }

    fn parse_helpers(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let start_pos = self.cursor.position();

        while self.cursor.position() < start_pos + size as u64 {
            let helper = self.parse_node(model)?;
            model.helpers.push(helper);
        }

        Ok(())
    }

    fn parse_attachments(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let start_pos = self.cursor.position();

        while self.cursor.position() < start_pos + size as u64 {
            let _attachment_size = self.cursor.read_u32::<LittleEndian>()?;
            
            let node = self.parse_node(model)?;
            let path = self.read_string(256)?;
            
            // Skip reserved (4 bytes)
            self.cursor.read_u32::<LittleEndian>()?;
            
            let attachment_id = self.cursor.read_u32::<LittleEndian>()?;
            
            model.attachments.push(Attachment {
                node,
                path,
                attachment_id,
            });
        }

        Ok(())
    }

    fn parse_pivot_points(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let count = size / (4 * 3); // Each pivot is 3 floats
        
        for _ in 0..count {
            model.pivot_points.push(self.read_vec3()?);
        }

        Ok(())
    }

    fn parse_event_objects(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let start_pos = self.cursor.position();

        while self.cursor.position() < start_pos + size as u64 {
            let node = self.parse_node(model)?;
            
            // Read KEVT chunk
            let kevt_keyword = self.read_keyword()?;
            if &kevt_keyword != b"KEVT" {
                return Err(format!("Expected KEVT, got {:?}", kevt_keyword));
            }
            
            let event_track_count = self.cursor.read_u32::<LittleEndian>()?;
            let _global_seq_id = self.cursor.read_u32::<LittleEndian>()?;
            
            let mut event_track = Vec::new();
            for _ in 0..event_track_count {
                event_track.push(self.cursor.read_u32::<LittleEndian>()?);
            }
            
            model.event_objects.push(EventObject {
                node,
                event_track,
            });
        }

        Ok(())
    }

    fn parse_collision_shapes(&mut self, model: &mut MdxModel, size: u32) -> Result<(), String> {
        let start_pos = self.cursor.position();

        while self.cursor.position() < start_pos + size as u64 {
            let node = self.parse_node(model)?;
            
            let shape = self.cursor.read_u32::<LittleEndian>()?;
            
            let vertex_count = if shape == 0 { 6 } else { 3 }; // Box vs others
            let mut vertices = Vec::new();
            for _ in 0..vertex_count {
                vertices.push(self.cursor.read_f32::<LittleEndian>()?);
            }
            
            let radius = if shape == 2 { // Sphere
                Some(self.cursor.read_f32::<LittleEndian>()?)
            } else {
                None
            };
            
            model.collision_shapes.push(CollisionShape {
                node,
                shape,
                vertices,
                radius,
            });
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chunk_type_parsing() {
        assert_eq!(ChunkType::from_bytes(b"VERS"), ChunkType::Vers);
        assert_eq!(ChunkType::from_bytes(b"GEOS"), ChunkType::Geos);
        assert_eq!(ChunkType::from_bytes(b"XXXX"), ChunkType::Unknown);
    }

    #[test]
    fn test_mdx_magic() {
        assert_eq!(MDX_MAGIC, b"MDLX");
    }
}
