'use client';

/**
 * GPU-Accelerated Image Upscaler
 * Uses WebGPU (primary) with WebGL fallback for bicubic interpolation upscaling
 */

type Backend = 'webgpu' | 'webgl' | 'canvas';
type ScaleFactor = 2 | 3 | 4;

// Bicubic interpolation WGSL shader for WebGPU
const WEBGPU_BICUBIC_SHADER = `
struct Params {
  srcWidth: u32,
  srcHeight: u32,
  dstWidth: u32,
  dstHeight: u32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var srcTexture: texture_2d<f32>;
@group(0) @binding(2) var outputTexture: texture_storage_2d<rgba8unorm, write>;

fn cubicWeight(x: f32) -> f32 {
  let a = -0.5;
  let absX = abs(x);
  if (absX <= 1.0) {
    return (a + 2.0) * absX * absX * absX - (a + 3.0) * absX * absX + 1.0;
  } else if (absX < 2.0) {
    return a * absX * absX * absX - 5.0 * a * absX * absX + 8.0 * a * absX - 4.0 * a;
  }
  return 0.0;
}

fn sampleTexture(x: i32, y: i32) -> vec4<f32> {
  let clampedX = clamp(x, 0, i32(params.srcWidth) - 1);
  let clampedY = clamp(y, 0, i32(params.srcHeight) - 1);
  return textureLoad(srcTexture, vec2<i32>(clampedX, clampedY), 0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= params.dstWidth || gid.y >= params.dstHeight) {
    return;
  }
  
  let scaleX = f32(params.srcWidth) / f32(params.dstWidth);
  let scaleY = f32(params.srcHeight) / f32(params.dstHeight);
  
  let srcX = (f32(gid.x) + 0.5) * scaleX - 0.5;
  let srcY = (f32(gid.y) + 0.5) * scaleY - 0.5;
  
  let x0 = i32(floor(srcX));
  let y0 = i32(floor(srcY));
  
  let fx = srcX - f32(x0);
  let fy = srcY - f32(y0);
  
  var result = vec4<f32>(0.0);
  var weightSum = 0.0;
  
  for (var j = -1; j <= 2; j++) {
    for (var i = -1; i <= 2; i++) {
      let weight = cubicWeight(f32(i) - fx) * cubicWeight(f32(j) - fy);
      result += sampleTexture(x0 + i, y0 + j) * weight;
      weightSum += weight;
    }
  }
  
  result = result / weightSum;
  result = clamp(result, vec4<f32>(0.0), vec4<f32>(1.0));
  
  textureStore(outputTexture, vec2<i32>(i32(gid.x), i32(gid.y)), result);
}
`;

// WebGL bicubic interpolation shaders
const WEBGL_VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const WEBGL_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform vec2 u_srcSize;
  uniform vec2 u_dstSize;

  float cubicWeight(float x) {
    float a = -0.5;
    float absX = abs(x);
    if (absX <= 1.0) {
      return (a + 2.0) * absX * absX * absX - (a + 3.0) * absX * absX + 1.0;
    } else if (absX < 2.0) {
      return a * absX * absX * absX - 5.0 * a * absX * absX + 8.0 * a * absX - 4.0 * a;
    }
    return 0.0;
  }

  vec4 sampleTexture(vec2 coord) {
    vec2 clampedCoord = clamp(coord, vec2(0.0), vec2(1.0));
    return texture2D(u_image, clampedCoord);
  }

  void main() {
    vec2 scale = u_srcSize / u_dstSize;
    vec2 srcCoord = v_texCoord * u_dstSize;
    vec2 srcPos = (srcCoord + 0.5) * scale - 0.5;
    
    vec2 pos0 = floor(srcPos);
    vec2 f = fract(srcPos);
    
    vec4 result = vec4(0.0);
    float weightSum = 0.0;
    
    for (int j = -1; j <= 2; j++) {
      for (int i = -1; i <= 2; i++) {
        vec2 samplePos = (pos0 + vec2(float(i), float(j)) + 0.5) / u_srcSize;
        float weight = cubicWeight(float(i) - f.x) * cubicWeight(float(j) - f.y);
        result += sampleTexture(samplePos) * weight;
        weightSum += weight;
      }
    }
    
    gl_FragColor = clamp(result / weightSum, 0.0, 1.0);
  }
`;

export class ImageUpscaler {
    private backend: Backend = 'canvas';
    private gpuDevice: GPUDevice | null = null;
    private webglContext: WebGLRenderingContext | null = null;
    private webglProgram: WebGLProgram | null = null;
    private initialized = false;

    static isWebGPUSupported(): boolean {
        return typeof navigator !== 'undefined' && 'gpu' in navigator;
    }

    static isWebGLSupported(): boolean {
        if (typeof document === 'undefined') return false;
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
            return false;
        }
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        // Try WebGPU first
        if (ImageUpscaler.isWebGPUSupported()) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    this.gpuDevice = await adapter.requestDevice();
                    this.backend = 'webgpu';
                    this.initialized = true;
                    console.log('ImageUpscaler: Using WebGPU backend');
                    return;
                }
            } catch (e) {
                console.warn('WebGPU initialization failed:', e);
            }
        }

        // Fallback to WebGL
        if (ImageUpscaler.isWebGLSupported()) {
            try {
                const canvas = document.createElement('canvas');
                this.webglContext = canvas.getContext('webgl') as WebGLRenderingContext;
                if (this.webglContext) {
                    this.initWebGL();
                    this.backend = 'webgl';
                    this.initialized = true;
                    console.log('ImageUpscaler: Using WebGL backend');
                    return;
                }
            } catch (e) {
                console.warn('WebGL initialization failed:', e);
            }
        }

        // Final fallback to canvas
        this.backend = 'canvas';
        this.initialized = true;
        console.log('ImageUpscaler: Using Canvas backend (software)');
    }

    private initWebGL(): void {
        const gl = this.webglContext!;

        // Compile shaders
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, WEBGL_VERTEX_SHADER);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fragmentShader, WEBGL_FRAGMENT_SHADER);
        gl.compileShader(fragmentShader);

        // Link program
        this.webglProgram = gl.createProgram()!;
        gl.attachShader(this.webglProgram, vertexShader);
        gl.attachShader(this.webglProgram, fragmentShader);
        gl.linkProgram(this.webglProgram);

        if (!gl.getProgramParameter(this.webglProgram, gl.LINK_STATUS)) {
            console.error('WebGL program link failed:', gl.getProgramInfoLog(this.webglProgram));
        }
    }

    getBackend(): Backend {
        return this.backend;
    }

    async upscale(imageData: ImageData, scale: ScaleFactor): Promise<ImageData> {
        if (!this.initialized) {
            await this.initialize();
        }

        const dstWidth = imageData.width * scale;
        const dstHeight = imageData.height * scale;

        switch (this.backend) {
            case 'webgpu':
                return this.upscaleWebGPU(imageData, dstWidth, dstHeight);
            case 'webgl':
                return this.upscaleWebGL(imageData, dstWidth, dstHeight);
            default:
                return this.upscaleCanvas(imageData, dstWidth, dstHeight);
        }
    }

    private async upscaleWebGPU(
        imageData: ImageData,
        dstWidth: number,
        dstHeight: number
    ): Promise<ImageData> {
        const device = this.gpuDevice!;
        const srcWidth = imageData.width;
        const srcHeight = imageData.height;

        // Create source texture
        const srcTexture = device.createTexture({
            size: [srcWidth, srcHeight],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });

        device.queue.writeTexture(
            { texture: srcTexture },
            imageData.data,
            { bytesPerRow: srcWidth * 4 },
            { width: srcWidth, height: srcHeight }
        );

        // Create output texture
        const dstTexture = device.createTexture({
            size: [dstWidth, dstHeight],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC,
        });

        // Create uniform buffer
        const uniformBuffer = device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const uniformData = new Uint32Array([srcWidth, srcHeight, dstWidth, dstHeight]);
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        // Create shader module and pipeline
        const shaderModule = device.createShaderModule({ code: WEBGPU_BICUBIC_SHADER });

        const pipeline = device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'main',
            },
        });

        // Create bind group
        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: uniformBuffer } },
                { binding: 1, resource: srcTexture.createView() },
                { binding: 2, resource: dstTexture.createView() },
            ],
        });

        // Run compute shader
        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatchWorkgroups(
            Math.ceil(dstWidth / 16),
            Math.ceil(dstHeight / 16)
        );
        passEncoder.end();

        // Read back results
        const outputBuffer = device.createBuffer({
            size: dstWidth * dstHeight * 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        commandEncoder.copyTextureToBuffer(
            { texture: dstTexture },
            { buffer: outputBuffer, bytesPerRow: dstWidth * 4 },
            { width: dstWidth, height: dstHeight }
        );

        device.queue.submit([commandEncoder.finish()]);

        await outputBuffer.mapAsync(GPUMapMode.READ);
        const resultData = new Uint8ClampedArray(outputBuffer.getMappedRange().slice(0));
        outputBuffer.unmap();

        // Cleanup
        srcTexture.destroy();
        dstTexture.destroy();
        uniformBuffer.destroy();
        outputBuffer.destroy();

        return new ImageData(resultData, dstWidth, dstHeight);
    }

    private upscaleWebGL(
        imageData: ImageData,
        dstWidth: number,
        dstHeight: number
    ): Promise<ImageData> {
        return new Promise((resolve) => {
            const gl = this.webglContext!;
            const canvas = gl.canvas as HTMLCanvasElement;
            canvas.width = dstWidth;
            canvas.height = dstHeight;

            gl.viewport(0, 0, dstWidth, dstHeight);
            gl.useProgram(this.webglProgram!);

            // Create and upload texture
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                imageData.width,
                imageData.height,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                imageData.data
            );

            // Set uniforms
            const srcSizeLoc = gl.getUniformLocation(this.webglProgram!, 'u_srcSize');
            const dstSizeLoc = gl.getUniformLocation(this.webglProgram!, 'u_dstSize');
            gl.uniform2f(srcSizeLoc, imageData.width, imageData.height);
            gl.uniform2f(dstSizeLoc, dstWidth, dstHeight);

            // Setup geometry
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
                gl.STATIC_DRAW
            );

            const positionLoc = gl.getAttribLocation(this.webglProgram!, 'a_position');
            gl.enableVertexAttribArray(positionLoc);
            gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

            const texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]),
                gl.STATIC_DRAW
            );

            const texCoordLoc = gl.getAttribLocation(this.webglProgram!, 'a_texCoord');
            gl.enableVertexAttribArray(texCoordLoc);
            gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

            // Draw
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            // Read pixels
            const pixels = new Uint8ClampedArray(dstWidth * dstHeight * 4);
            gl.readPixels(0, 0, dstWidth, dstHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            // Flip Y (WebGL is bottom-up)
            const flipped = new Uint8ClampedArray(pixels.length);
            for (let y = 0; y < dstHeight; y++) {
                const srcRow = (dstHeight - 1 - y) * dstWidth * 4;
                const dstRow = y * dstWidth * 4;
                flipped.set(pixels.subarray(srcRow, srcRow + dstWidth * 4), dstRow);
            }

            // Cleanup
            gl.deleteTexture(texture);
            gl.deleteBuffer(positionBuffer);
            gl.deleteBuffer(texCoordBuffer);

            resolve(new ImageData(flipped, dstWidth, dstHeight));
        });
    }

    private upscaleCanvas(
        imageData: ImageData,
        dstWidth: number,
        dstHeight: number
    ): Promise<ImageData> {
        return new Promise((resolve) => {
            // Create source canvas
            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = imageData.width;
            srcCanvas.height = imageData.height;
            const srcCtx = srcCanvas.getContext('2d')!;
            srcCtx.putImageData(imageData, 0, 0);

            // Create destination canvas with high quality scaling
            const dstCanvas = document.createElement('canvas');
            dstCanvas.width = dstWidth;
            dstCanvas.height = dstHeight;
            const dstCtx = dstCanvas.getContext('2d')!;

            dstCtx.imageSmoothingEnabled = true;
            dstCtx.imageSmoothingQuality = 'high';
            dstCtx.drawImage(srcCanvas, 0, 0, dstWidth, dstHeight);

            const result = dstCtx.getImageData(0, 0, dstWidth, dstHeight);
            resolve(result);
        });
    }

    destroy(): void {
        if (this.gpuDevice) {
            this.gpuDevice.destroy();
            this.gpuDevice = null;
        }
        this.webglContext = null;
        this.webglProgram = null;
        this.initialized = false;
        this.backend = 'canvas';
    }
}

export type { Backend, ScaleFactor };
