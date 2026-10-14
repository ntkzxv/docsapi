import type { BotnoiEndpoint as Endpoint, BotnoiResponseRow as ResponseRow } from '../types/botnoiEndpoint'

export interface SidebarItem {
  id: string;
  label: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const sidebarGroups: SidebarGroup[] = [
  {
    label: 'VIDEO AI MODELS',
    items: [
      { id: 'seedance25-submit',     label: 'Create Seedance 2.5 video',      method: 'POST' },
      { id: 'seedance25-status',     label: 'Get Seedance 2.5 result',         method: 'GET'  },
      { id: 'seedance20-submit',     label: 'Create SeeDance 2.0 / Mini video', method: 'POST' },
      { id: 'seedance20-status',     label: 'Get SeeDance 2.0 result',         method: 'GET'  },
      { id: 'motion-control-submit', label: 'Create Motion Control video',     method: 'POST' },
      { id: 'motion-control-status', label: 'Get Motion Control result',       method: 'GET'  },
    ],
  },
  {
    label: 'AVATAR LIP-SYNC',
    items: [
      { id: 'infinitetalk-submit', label: 'Create InfiniteTalk avatar', method: 'POST' },
      { id: 'infinitetalk-status', label: 'Get InfiniteTalk result',    method: 'GET'  },
      { id: 'omnihuman-submit',    label: 'Create OmniHuman avatar',    method: 'POST' },
      { id: 'omnihuman-status',    label: 'Get OmniHuman result',       method: 'GET'  },
      { id: 'dreamactor-submit',   label: 'Create DreamActor',           method: 'POST' },
      { id: 'dreamactor-status',   label: 'Get DreamActor result',       method: 'GET'  },
    ],
  },
  {
    label: 'IMAGE GENERATION',
    items: [
      { id: 'seedream-submit', label: 'Create SeeDream 4.5 image', method: 'POST' },
      { id: 'seedream-status', label: 'Get SeeDream 4.5 result',   method: 'GET'  },
    ],
  },
  {
    label: 'GPT IMAGE STUDIO',
    items: [
      { id: 'gptimg-text2img',   label: 'Create GPT Image (Text to Image)', method: 'POST' },
      { id: 'gptimg-upload',     label: 'Upload image for editing',         method: 'POST' },
      { id: 'gptimg-edit',       label: 'Edit image with prompt',           method: 'POST' },
      { id: 'gptimg-status',     label: 'Get GPT Image result',             method: 'GET'  },
    ],
  },
];

// ─── Shared response shapes ───────────────────────────────────────────────────

const WAVESPEED_STATUS_RESPONSE: ResponseRow[] = [
  {
    status: 200,
    description: 'Successful Response',
    contentType: 'application/json',
    shape: 'WavespeedResultResponse',
    example: `{
  "data": {
    "id": "<task_id>",
    "status": "completed",
    "url_video": "https://storage.botnoi.ai/.../output.mp4",
    "error": ""
  }
}
// status: "pending" | "processing" | "completed" | "failed"`,
  },
  { status: 404, description: 'Task not found', contentType: 'application/json', shape: 'ErrorResponse' },
];

const BYTEPLUS_STATUS_RESPONSE: ResponseRow[] = [
  {
    status: 200,
    description: 'Successful Response',
    contentType: 'application/json',
    shape: 'ByteplusStatusResponse',
    example: `{
  "data": {
    "status": "completed",
    "url_video": "https://storage.botnoi.ai/.../video.mp4"
  }
}
// status: "processing" | "completed" | "failed"`,
  },
  { status: 404, description: 'Task not found', contentType: 'application/json', shape: 'ErrorResponse' },
];

const SUBMIT_ERROR_RESPONSES: ResponseRow[] = [
  { status: 401, description: 'Unauthorized',         contentType: 'application/json', shape: 'ErrorResponse' },
  { status: 403, description: 'Insufficient credits', contentType: 'application/json', shape: 'ErrorResponse' },
];

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const endpoints: Record<string, Endpoint> = {

  // ── Seedance 2.5 ────────────────────────────────────────────────────────────
  'seedance25-submit': {
    id: 'seedance25-submit',
    title: 'Create Seedance 2.5 video',
    method: 'POST',
    path: '/api/genai/wavespeed/bytedance/seedance-2.5/text-to-video',
    description: 'โมเดลสร้างวิดีโอคุณภาพสูง (Flagship) รองรับ Text-to-Video, Image-to-Video (First & Last frame) และ Reference Media',
    auth: true,
    parameters: [],
    requestBody: {
      required: true,
      contentType: 'application/json',
      shape: 'Seedance25Request',
      fields: [
        { name: 'prompt',           type: 'string',   required: true,  description: 'ข้อความอธิบายวิดีโอที่ต้องการ' },
        { name: 'duration',         type: 'number',   required: true,  description: 'ความยาว เช่น 5 หรือ 10 วินาที' },
        { name: 'resolution',       type: 'string',   required: true,  description: '"720p" หรือ "1080p"' },
        { name: 'aspect_ratio',     type: 'string',   required: false, description: '"16:9" หรือ "9:16"' },
        { name: 'generate_audio',   type: 'boolean',  required: false, description: 'true หรือ false' },
        { name: 'reference_images', type: 'string[]', required: false, description: 'Array ของรูปภาพแบบ Base64 Data URL' },
        { name: 'reference_videos', type: 'string[]', required: false, description: 'Array ของวิดีโออ้างอิงแบบ Base64 Data URL' },
      ],
    },
    responses: [
      {
        status: 200,
        description: 'Task submitted',
        contentType: 'application/json',
        shape: 'TaskResponse',
        example: `{
  "data": {
    "id": "task_seedance25_abc123",
    "status": "pending"
  }
}`,
      },
      ...SUBMIT_ERROR_RESPONSES,
    ],
  },

  'seedance25-status': {
    id: 'seedance25-status',
    title: 'Get Seedance 2.5 result',
    method: 'GET',
    path: '/api/genai/wavespeed/result/{id}',
    description: 'ตรวจสอบสถานะและดึง url_video ของ Seedance 2.5 task — ใช้ path เดียวกับ InfiniteTalk และ Motion Control',
    auth: true,
    parameters: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'Task ID ที่ได้จาก POST (field: data.id)' },
    ],
    requestBody: null,
    responses: WAVESPEED_STATUS_RESPONSE,
  },

  // ── SeeDance 2.0 / Mini ──────────────────────────────────────────────────────
  'seedance20-submit': {
    id: 'seedance20-submit',
    title: 'Create SeeDance 2.0 / Mini video',
    method: 'POST',
    path: '/api/genai/byteplus/video-generation',
    description: 'BytePlus Engine — Text-to-Video หรือ Image-to-Video ด้วย dreamina-seedance-2-0 หรือ mini model',
    auth: true,
    parameters: [],
    requestBody: {
      required: true,
      contentType: 'multipart/form-data',
      shape: 'SeeDance20Request',
      fields: [
        { name: 'prompt',     type: 'string', required: true,  description: 'ข้อความ Prompt' },
        { name: 'mode',       type: 'string', required: true,  description: '"text-to-video" หรือ "image-to-video"' },
        { name: 'model',      type: 'string', required: false, description: '"dreamina-seedance-2-0-260128" หรือ "dreamina-seedance-2-0-mini-260615"' },
        { name: 'image_file', type: 'File',   required: false, description: 'ไฟล์รูปภาพตั้งต้น (Image-to-Video)' },
        { name: 'duration',   type: 'string', required: true,  description: '"5" หรือ "10"' },
        { name: 'ratio',      type: 'string', required: true,  description: '"16:9" หรือ "9:16"' },
        { name: 'resolution', type: 'string', required: true,  description: '"720p" หรือ "1080p"' },
      ],
    },
    responses: [
      {
        status: 200,
        description: 'Task submitted',
        contentType: 'application/json',
        shape: 'TaskResponse',
        example: `{
  "data": {
    "task_id": "task_seedance20_xyz789"
  }
}`,
      },
      ...SUBMIT_ERROR_RESPONSES,
    ],
  },

  'seedance20-status': {
    id: 'seedance20-status',
    title: 'Get SeeDance 2.0 result',
    method: 'GET',
    path: '/api/genai/byteplus/video-generation/{task_id}',
    description: 'ตรวจสอบสถานะ task และดึง url_video ของ SeeDance 2.0 / Mini',
    auth: true,
    parameters: [
      { name: 'task_id', in: 'path', type: 'string', required: true, description: 'Task ID ที่ได้จาก POST (field: data.task_id)' },
    ],
    requestBody: null,
    responses: BYTEPLUS_STATUS_RESPONSE,
  },

  // ── InfiniteTalk ─────────────────────────────────────────────────────────────
  'infinitetalk-submit': {
    id: 'infinitetalk-submit',
    title: 'Create InfiniteTalk avatar',
    method: 'POST',
    path: '/api/genai/infinitetalk',
    description: 'สร้างวิดีโอตัวละครขยับปากและศีรษะสัมพันธ์กับเสียงพูดอย่างเป็นธรรมชาติ (Fast Avatar)',
    auth: true,
    parameters: [],
    requestBody: {
      required: true,
      contentType: 'multipart/form-data',
      shape: 'InfiniteTalkRequest',
      fields: [
        { name: 'image_file', type: 'File',   required: true,  description: 'ไฟล์รูปภาพใบหน้า Avatar (JPG / PNG)' },
        { name: 'audio_file', type: 'File',   required: true,  description: 'ไฟล์เสียงพูด (MP3 / WAV)' },
        { name: 'resolution', type: 'string', required: true,  description: '"480p" หรือ "720p"' },
        { name: 'prompt',     type: 'string', required: false, description: 'ข้อความ Prompt กำหนดลักษณะเพิ่มเติม' },
      ],
    },
    responses: [
      {
        status: 200,
        description: 'Task submitted',
        contentType: 'application/json',
        shape: 'TaskResponse',
        example: `{
  "data": {
    "id": "task_infinitetalk_555",
    "task_id": "task_infinitetalk_555",
    "status": "pending"
  }
}`,
      },
      ...SUBMIT_ERROR_RESPONSES,
    ],
  },

  'infinitetalk-status': {
    id: 'infinitetalk-status',
    title: 'Get InfiniteTalk result',
    method: 'GET',
    path: '/api/genai/get_id_wavspeed',
    description: 'ตรวจสอบสถานะ InfiniteTalk task — ใช้ query param ?id={id} (Wavespeed engine)',
    auth: true,
    parameters: [
      { name: 'id', in: 'query', type: 'string', required: true, description: 'Task ID ที่ได้จาก POST (field: data.id หรือ data.task_id)' },
    ],
    requestBody: null,
    responses: [
      {
        status: 200,
        description: 'Successful Response',
        contentType: 'application/json',
        shape: 'WavespeedResultResponse',
        example: `{
  "data": {
    "id": "task_infinitetalk_555",
    "status": "success",
    "url_video": "https://storage.botnoi.ai/.../avatar.mp4"
  }
}
// status: "pending" | "success" | "failed"`,
      },
      { status: 404, description: 'Task not found', contentType: 'application/json', shape: 'ErrorResponse' },
    ],
  },

  // ── OmniHuman ────────────────────────────────────────────────────────────────
  'omnihuman-submit': {
    id: 'omnihuman-submit',
    title: 'Create OmniHuman avatar',
    method: 'POST',
    path: '/api/genai/byteplus/avatar-video',
    description: 'BytePlus Avatar — วิดีโออวาตาร์ขยับปากและแสดงสีหน้าซิงค์เสียง ด้วย OmniHuman engine',
    auth: true,
    parameters: [],
    requestBody: {
      required: true,
      contentType: 'multipart/form-data',
      shape: 'OmniHumanRequest',
      fields: [
        { name: 'image_file', type: 'File',          required: true,  description: 'ไฟล์ภาพ Avatar' },
        { name: 'audio_file', type: 'File | string', required: true,  description: 'ไฟล์เสียงพูด' },
        { name: 'prompt',     type: 'string',        required: false, description: 'Prompt อธิบายสไตล์' },
      ],
    },
    responses: [
      {
        status: 200,
        description: 'Task submitted',
        contentType: 'application/json',
        shape: 'TaskResponse',
        example: `{
  "data": {
    "task_id": "task_omnihuman_888"
  }
}`,
      },
      ...SUBMIT_ERROR_RESPONSES,
    ],
  },

  'omnihuman-status': {
    id: 'omnihuman-status',
    title: 'Get OmniHuman result',
    method: 'GET',
    path: '/api/genai/byteplus/avatar-video/{task_id}',
    description: 'ตรวจสอบสถานะ OmniHuman task — ใช้ BytePlus path ต่างจาก InfiniteTalk',
    auth: true,
    parameters: [
      { name: 'task_id', in: 'path', type: 'string', required: true, description: 'Task ID ที่ได้จาก POST (field: data.task_id)' },
    ],
    requestBody: null,
    responses: [
      {
        status: 200,
        description: 'Successful Response',
        contentType: 'application/json',
        shape: 'ByteplusStatusResponse',
        example: JSON.stringify({
          data: {
            status: 'done',
            resp_data: JSON.stringify({ video_url: 'https://storage.botnoi.ai/.../avatar.mp4' }),
          },
        }, null, 2),
      },
      { status: 404, description: 'Task not found', contentType: 'application/json', shape: 'ErrorResponse' },
    ],
  },

  'dreamactor-submit': {
    id: 'dreamactor-submit',
    title: 'Create DreamActor',
    method: 'POST',
    path: '/api/genai/byteplus/dreamactor',
    description: 'BytePlus DreamActor — ดิจิทัลฮิวแมนระดับสูง ขยับปากและแสดงสีหน้าซิงค์เสียง เหมาะสำหรับ Digital Human Presenter',
    auth: true,
    parameters: [],
    requestBody: {
      required: true,
      contentType: 'multipart/form-data',
      shape: 'DreamActorRequest',
      fields: [
        { name: 'image_file', type: 'File', required: true, description: 'ไฟล์รูปภาพ Presenter' },
        { name: 'audio_file', type: 'File', required: true, description: 'ไฟล์เสียงพากย์ (MP3, WAV)' },
        { name: 'prompt', type: 'string', required: false, description: 'Prompt อธิบายสไตล์เพิ่มเติม' },
      ],
    },
    responses: [
      {
        status: 202,
        description: 'Task accepted',
        contentType: 'application/json',
        shape: 'TaskResponse',
        example: JSON.stringify({ data: { id: 'task_dreamactor_123', status: 'pending' } }, null, 2),
      },
      { status: 401, description: 'Unauthorized', contentType: 'application/json', shape: 'ErrorResponse' },
      { status: 403, description: 'Insufficient credits', contentType: 'application/json', shape: 'ErrorResponse' },
    ],
  },

  'dreamactor-status': {
    id: 'dreamactor-status',
    title: 'Get DreamActor result',
    method: 'GET',
    path: '/api/genai/byteplus/dreamactor/{id}',
    description: 'ตรวจสอบสถานะ DreamActor task',
    auth: true,
    parameters: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'Task ID จาก POST DreamActor' },
    ],
    requestBody: null,
    responses: [
      {
        status: 200,
        description: 'Successful Response',
        contentType: 'application/json',
        shape: 'ByteplusStatusResponse',
        example: JSON.stringify({ data: { status: 'completed', url_video: 'https://storage.botnoi.ai/.../dreamactor.mp4' } }, null, 2),
      },
      { status: 404, description: 'Task not found', contentType: 'application/json', shape: 'ErrorResponse' },
    ],
  },

  // ── Motion Control ───────────────────────────────────────────────────────────
  'motion-control-submit': {
    id: 'motion-control-submit',
    title: 'Create Motion Control video',
    method: 'POST',
    path: '/api/genai/motion-control',
    description: 'Kling Motion Control — สร้างวิดีโอตัวละครขยับตามท่าทางจาก Template video (Wavespeed engine)',
    auth: true,
    parameters: [],
    requestBody: {
      required: true,
      contentType: 'multipart/form-data',
      shape: 'MotionControlRequest',
      fields: [
        { name: 'image',                 type: 'File',          required: true, description: 'ภาพตัวละครต้นฉบับ' },
        { name: 'video',                 type: 'File | string', required: true, description: 'คลิปท่าทางหรือ URL Template' },
        { name: 'mode',                  type: 'string',        required: true, description: '"standard" หรือ "pro"' },
        { name: 'character_orientation', type: 'string',        required: true, description: '"image" หรือ "video"' },
      ],
    },
    responses: [
      {
        status: 200,
        description: 'Task submitted',
        contentType: 'application/json',
        shape: 'TaskResponse',
        example: `{
  "data": {
    "id": "task_motion_999"
  }
}`,
      },
      ...SUBMIT_ERROR_RESPONSES,
    ],
  },

  'motion-control-status': {
    id: 'motion-control-status',
    title: 'Get Motion Control result',
    method: 'GET',
    path: '/api/genai/get_id_wavspeed',
    description: 'ตรวจสอบสถานะ Motion Control task — ใช้ query param ?id={id} (Wavespeed engine เดียวกับ InfiniteTalk)',
    auth: true,
    parameters: [
      { name: 'id', in: 'query', type: 'string', required: true, description: 'Task ID ที่ได้จาก POST (field: data.id)' },
    ],
    requestBody: null,
    responses: [
      {
        status: 200,
        description: 'Successful Response',
        contentType: 'application/json',
        shape: 'WavespeedResultResponse',
        example: `{
  "data": {
    "id": "task_motion_999",
    "status": "success",
    "url_video": "https://storage.botnoi.ai/.../motion.mp4"
  }
}
// status: "pending" | "success" | "failed"`,
      },
      { status: 404, description: 'Task not found', contentType: 'application/json', shape: 'ErrorResponse' },
    ],
  },

  // ── SeeDream 4.5 ─────────────────────────────────────────────────────────────
  'seedream-submit': {
    id: 'seedream-submit',
    title: 'Create SeeDream 4.5 image',
    method: 'POST',
    path: '/api/genai/byteplus/image-generation',
    description: 'BytePlus Image Model — สร้างรูปภาพคุณภาพสูงด้วย Seedream 4.5 รองรับ Text-to-Image และ Image-to-Image',
    auth: true,
    parameters: [],
    requestBody: {
      required: true,
      contentType: 'multipart/form-data',
      shape: 'SeeDreamRequest',
      fields: [
        { name: 'prompt',     type: 'string', required: true,  description: 'ข้อความสร้างรูปภาพ' },
        { name: 'model',      type: 'string', required: false, description: '"seedream-4-5-251128"' },
        { name: 'parameters', type: 'string', required: true,  description: 'JSON: {"size":"1024x1024","sequential_image_generation":"disabled","watermark":false}' },
        { name: 'image1',     type: 'File',   required: false, description: 'รูปภาพตั้งต้น (Image-to-Image)' },
      ],
    },
    responses: [
      {
        status: 200,
        description: 'Task submitted',
        contentType: 'application/json',
        shape: 'TaskResponse',
        example: `{
  "data": {
    "task_id": "task_seedream_001"
  }
}`,
      },
      ...SUBMIT_ERROR_RESPONSES,
    ],
  },

  'seedream-status': {
    id: 'seedream-status',
    title: 'Get SeeDream 4.5 result',
    method: 'GET',
    path: '/api/genai/byteplus/image-generation/status/{task_id}',
    description: 'ตรวจสอบสถานะและดึง URL รูปภาพที่สร้างเสร็จแล้ว (BytePlus path)',
    auth: true,
    parameters: [
      { name: 'task_id', in: 'path', type: 'string', required: true, description: 'Task ID ที่ได้จาก POST (field: data.task_id)' },
    ],
    requestBody: null,
    responses: [
      {
        status: 200,
        description: 'Successful Response',
        contentType: 'application/json',
        shape: 'ByteplusStatusResponse',
        example: `{
  "data": {
    "status": "success",
    "url_video": "https://storage.botnoi.ai/.../image.png"
  }
}`,
      },
      { status: 404, description: 'Task not found', contentType: 'application/json', shape: 'ErrorResponse' },
    ],
  },

  // ── GPT Image Studio ─────────────────────────────────────────────────────────
  'gptimg-text2img': {
    id: 'gptimg-text2img',
    title: 'Create GPT Image (Text to Image)',
    method: 'POST',
    path: '/api/genai/wavespeed/gpt-image/text-to-image',
    description: 'ส่งคำสั่ง Prompt สำหรับสร้างรูปภาพใหม่ด้วยโมเดล GPT Image — ได้รับ task_id สำหรับนำไป polling',
    auth: true,
    parameters: [],
    requestBody: {
      required: true,
      contentType: 'application/json',
      shape: 'GptImageTextToImageRequest',
      fields: [
        { name: 'prompt',               type: 'string',  required: true,  description: 'ข้อความอธิบายรูปภาพที่ต้องการสร้าง' },
        { name: 'resolution',           type: 'string',  required: false, description: '"1k" หรือ "2k"' },
        { name: 'quality',              type: 'string',  required: false, description: '"low" | "medium" | "high"' },
        { name: 'aspect_ratio',         type: 'string',  required: false, description: '"1:1" | "16:9" | "9:16" | "4:3" (หรือเว้นว่าง)' },
        { name: 'output_format',        type: 'string',  required: false, description: '"png" | "jpeg" | "webp"' },
        { name: 'enable_sync_mode',     type: 'boolean', required: false, description: 'false (default) — async mode' },
        { name: 'enable_base64_output', type: 'boolean', required: false, description: 'false (default)' },
      ],
    },
    responses: [
      {
        status: 200,
        description: 'Task submitted',
        contentType: 'application/json',
        shape: 'GptImageTaskResponse',
        example: `{
  "code": 200,
  "message": "success",
  "data": {
    "id": "pred_20261008xxxxxxxxx",
    "status": "queued"
  }
}`,
      },
      ...SUBMIT_ERROR_RESPONSES,
    ],
  },

  'gptimg-upload': {
    id: 'gptimg-upload',
    title: 'Upload image for editing',
    method: 'POST',
    path: '/api/genai/upload_image',
    description: 'อัปโหลดไฟล์รูปภาพขึ้น Amazon S3 เพื่อรับ img_url นำไปใช้ใน Image Edit endpoint',
    auth: true,
    parameters: [],
    requestBody: {
      required: true,
      contentType: 'multipart/form-data',
      shape: 'UploadImageRequest',
      fields: [
        { name: 'file', type: 'File', required: true, description: 'ไฟล์รูปภาพ (.png, .jpg, .webp)' },
      ],
    },
    responses: [
      {
        status: 200,
        description: 'Upload successful',
        contentType: 'application/json',
        shape: 'UploadImageResponse',
        example: `{
  "message": "upload successfully",
  "img_url": "https://botnoiaudio.s3.amazonaws.com/default/production/user_xxx/image_xxx.png"
}`,
      },
      { status: 401, description: 'Unauthorized', contentType: 'application/json', shape: 'ErrorResponse' },
    ],
  },

  'gptimg-edit': {
    id: 'gptimg-edit',
    title: 'Edit image with prompt',
    method: 'POST',
    path: '/api/genai/wavespeed/gpt-image/edit',
    description: 'ส่งคำสั่ง Prompt พร้อม URL รูปภาพต้นฉบับ (จาก upload_image) เพื่อให้ AI ทำการแก้ไขหรือตกแต่งภาพ',
    auth: true,
    parameters: [],
    requestBody: {
      required: true,
      contentType: 'application/json',
      shape: 'GptImageEditRequest',
      fields: [
        { name: 'prompt',               type: 'string',   required: true,  description: 'คำสั่งแก้ไขภาพ เช่น "change background to snowy mountain"' },
        { name: 'images',               type: 'string[]', required: true,  description: 'Array ของ URL รูปภาพต้นฉบับ (ได้จาก upload_image)' },
        { name: 'output_format',        type: 'string',   required: false, description: '"png" | "jpeg" | "webp"' },
        { name: 'enable_sync_mode',     type: 'boolean',  required: false, description: 'false (default)' },
        { name: 'enable_base64_output', type: 'boolean',  required: false, description: 'false (default)' },
      ],
    },
    responses: [
      {
        status: 200,
        description: 'Task submitted',
        contentType: 'application/json',
        shape: 'GptImageTaskResponse',
        example: `{
  "code": 200,
  "message": "success",
  "data": {
    "id": "pred_20261008xxxxxxxxx",
    "status": "queued"
  }
}`,
      },
      ...SUBMIT_ERROR_RESPONSES,
    ],
  },

  'gptimg-status': {
    id: 'gptimg-status',
    title: 'Get GPT Image result',
    method: 'GET',
    path: '/api/genai/wavespeed/result/{id}',
    description: 'ตรวจสถานะงานสร้าง/แก้ไขรูปภาพ — แนะนำให้ polling ทุก 2 วินาที จนกว่า status จะเป็น completed หรือ failed',
    auth: true,
    parameters: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'Task ID ที่ได้จาก POST (field: data.id)' },
    ],
    requestBody: null,
    responses: [
      {
        status: 200,
        description: 'Processing (ระหว่างประมวลผล)',
        contentType: 'application/json',
        shape: 'GptImageStatusResponse',
        example: `{
  "message": "processing",
  "data": {
    "task_id": "pred_20261008xxxxxxxxx",
    "progress": 60,
    "status": "processing"
  }
}`,
      },
      {
        status: 200,
        description: 'Completed (เสร็จสมบูรณ์)',
        contentType: 'application/json',
        shape: 'GptImageStatusResponse',
        example: `{
  "message": "success",
  "data": {
    "task_id": "pred_20261008xxxxxxxxx",
    "progress": 100,
    "status": "completed",
    "video_url": "https://botnoiaudio.s3.amazonaws.com/default/production/user_xxx/result_xxx.png"
  }
}`,
      },
      { status: 404, description: 'Task not found', contentType: 'application/json', shape: 'ErrorResponse' },
    ],
  },
};
