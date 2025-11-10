// 简化的 MDX 模型着色器
// 支持硬件蒙皮（Hardware Skinning）的基础渲染

export const vertexShader = `
attribute vec3 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;
attribute vec4 aGroup; // 骨骼索引 (最多4个)

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNodesMatrices[254]; // 骨骼变换矩阵

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

void main(void) {
    // 暂时不应用骨骼变换，直接使用顶点位置
    // TODO: 实现正确的骨骼蒙皮逻辑
    vec4 position = vec4(aVertexPosition, 1.0);
    vec4 normal = vec4(aNormal, 0.0);
    
    gl_Position = uPMatrix * uMVMatrix * position;
    vTextureCoord = aTextureCoord;
    vNormal = normalize((uMVMatrix * normal).xyz);
    vPosition = (uMVMatrix * position).xyz;
}
`;

export const fragmentShader = `
precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uSampler;
uniform vec3 uReplaceableColor; // 可替换颜色（如团队颜色）
uniform int uReplaceableType; // 0=普通纹理, 1=团队颜色, 2=团队光泽
uniform float uDiscardAlphaLevel; // Alpha 测试阈值
uniform bool uWireframe; // 线框模式

float hypot(vec2 z) {
    float t;
    float x = abs(z.x);
    float y = abs(z.y);
    t = min(x, y);
    x = max(x, y);
    t = t / x;
    return (z.x == 0.0 && z.y == 0.0) ? 0.0 : x * sqrt(1.0 + t * t);
}

void main(void) {
    if (uWireframe) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // 绿色线框
        return;
    }
    
    vec4 finalColor;
    
    if (uReplaceableType == 0) {
        // 普通纹理
        finalColor = texture2D(uSampler, vTextureCoord);
    } else if (uReplaceableType == 1) {
        // 团队颜色：纯色（参考 war3-model）
        finalColor = vec4(uReplaceableColor, 1.0);
    } else if (uReplaceableType == 2) {
        // 团队光泽：径向渐变效果（参考 war3-model）
        float dist = hypot(vTextureCoord - vec2(0.5, 0.5)) * 2.0;
        float truncateDist = clamp(1.0 - dist * 1.4, 0.0, 1.0);
        float alpha = sin(truncateDist);
        finalColor = vec4(uReplaceableColor * alpha, 1.0);
    } else {
        // Fallback
        finalColor = texture2D(uSampler, vTextureCoord);
    }
    
    // Alpha 测试
    if (finalColor.a < uDiscardAlphaLevel) {
        discard;
    }
    
    // 简单的 Lambert 光照
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diffuse = max(dot(normalize(vNormal), lightDir), 0.3); // 最小环境光 0.3
    
    gl_FragColor = vec4(finalColor.rgb * diffuse, finalColor.a);
}
`;
