import type { EndpointDoc, EndpointGroup, InitialVideoForm, ModelFormField } from '../types/app'

export const wavespeedModels: Record<string, EndpointDoc & { path: string; formFields: ModelFormField[] }> = {
  'Kling 3.0 Std': {
    title: 'Kling 3.0 Std Text-to-Video', method: 'POST', path: '/api/v3/kwaivgi/kling-v3.0-std/text-to-video', hideAttribution: true,
    description: 'Kling 3.0 Standard สร้างวิดีโอจากข้อความ รองรับเสียงประกอบ อัตราส่วนภาพ และ storyboard หลายช็อต',
    scopeNote: 'หน้านี้อ้างอิง Kling 3.0 Std โดยเฉพาะ Kling 1.5 เป็นคนละรุ่นและอาจมีฟิลด์ต่างกัน เส้นทางนี้เป็น WaveSpeedAI API โดยตรง ยังไม่ใช่ Botnoi Gateway',
    body: { contentType: 'application/json', shape: 'KlingV3StdTextToVideoRequest', fields: [['prompt', 'string', 'No*', 'คำอธิบายฉากและการเคลื่อนไหว; จำเป็นเมื่อ shot_type เป็น intelligence'], ['negative_prompt', 'string', 'No', 'สิ่งที่ไม่ต้องการในวิดีโอ'], ['duration', 'integer', 'No', '3–15 วินาที; ค่าเริ่มต้น 5'], ['aspect_ratio', 'string', 'No', '16:9, 9:16 หรือ 1:1; ค่าเริ่มต้น 16:9'], ['cfg_scale', 'number', 'No', 'น้ำหนักการยึดตาม prompt; ค่าเริ่มต้น 0.5'], ['sound', 'boolean', 'No', 'สร้างเสียงประกอบ; ค่าเริ่มต้น false'], ['shot_type', 'string', 'No', 'intelligence หรือ customize; ค่าเริ่มต้น customize'], ['multi_prompt', 'array', 'No', 'ชุด prompt หลายช็อตสำหรับ customize; ไม่ใช้เมื่อเป็น intelligence']] },
    formFields: [{ name: 'prompt', label: 'Prompt', kind: 'textarea', placeholder: 'อธิบายฉาก การเคลื่อนไหว และมุมกล้อง…' }, { name: 'negative_prompt', label: 'Negative prompt', kind: 'textarea', optional: true }, { name: 'duration', label: 'Duration', kind: 'number', min: 3, max: 15, defaultValue: '5' }, { name: 'aspect_ratio', label: 'Aspect ratio', kind: 'select', options: ['16:9', '9:16', '1:1'], defaultValue: '16:9' }, { name: 'cfg_scale', label: 'CFG scale', kind: 'number', step: 'any', defaultValue: '0.5' }, { name: 'sound', label: 'Sound', kind: 'boolean', defaultValue: false }, { name: 'shot_type', label: 'Shot type', kind: 'select', options: ['customize', 'intelligence'], defaultValue: 'customize' }, { name: 'multi_prompt', label: 'Multi-prompt (JSON array)', kind: 'json', optional: true, placeholder: '[{"prompt":"Scene one","duration":3}]' }],
  },
  'Wan 2.1 (Alibaba)': {
    title: 'Wan 2.1 Image-to-Video 720p', method: 'POST', path: '/api/v3/wavespeed-ai/wan-2.1/i2v-720p', hideAttribution: true,
    description: 'สร้างวิดีโอความละเอียด 720p จากภาพและ Prompt รองรับความยาว 5 หรือ 10 วินาที',
    body: { contentType: 'application/json', shape: 'Wan21I2V720pRequest', fields: [['prompt', 'string', 'Yes', 'คำอธิบายการเคลื่อนไหวและสไตล์'], ['image', 'string', 'Yes', 'รูปภาพต้นทาง URL หรือข้อมูลภาพ'], ['negative_prompt', 'string', 'No', 'สิ่งที่ไม่ต้องการในวิดีโอ'], ['size', 'string', 'No', '1280*720 หรือ 720*1280; ค่าเริ่มต้น 1280*720'], ['num_inference_steps', 'integer', 'No', 'จำนวนรอบประมวลผล 1–40; ค่าเริ่มต้น 30'], ['duration', 'integer', 'No', '5 หรือ 10 วินาที; ค่าเริ่มต้น 5'], ['guidance_scale', 'number', 'No', 'ความเข้มการยึด Prompt 0–20; ค่าเริ่มต้น 5'], ['flow_shift', 'number', 'No', 'ค่าควบคุม motion 1–10; ค่าเริ่มต้น 5'], ['seed', 'integer', 'No', 'ค่า seed; ใช้ -1 เพื่อสุ่ม']] },
    formFields: [{ name: 'prompt', label: 'Prompt', kind: 'textarea', required: true, placeholder: 'อธิบายการเคลื่อนไหวของภาพ…' }, { name: 'image', label: 'Image URL / Base64', kind: 'text', required: true, placeholder: 'https://example.com/source.jpg' }, { name: 'negative_prompt', label: 'Negative prompt', kind: 'textarea', optional: true }, { name: 'size', label: 'Size', kind: 'select', options: ['1280*720', '720*1280'], defaultValue: '1280*720' }, { name: 'num_inference_steps', label: 'Inference steps', kind: 'number', min: 1, max: 40, defaultValue: '30' }, { name: 'duration', label: 'Duration', kind: 'select', options: ['5', '10'], defaultValue: '5', valueType: 'number' }, { name: 'guidance_scale', label: 'Guidance scale', kind: 'number', min: 0, max: 20, step: 'any', defaultValue: '5' }, { name: 'flow_shift', label: 'Flow shift', kind: 'number', min: 1, max: 10, step: 'any', defaultValue: '5' }, { name: 'seed', label: 'Seed', kind: 'number', optional: true }],
  },
  'Wan 3.0 (Alibaba)': {
    title: 'Wan 3.0 Image-to-Video', method: 'POST', path: '/api/v3/alibaba/wan-3.0/image-to-video', hideAttribution: true,
    description: 'สร้างวิดีโอจากภาพเฟรมแรก พร้อมกำหนดภาพเฟรมสุดท้าย การเคลื่อนไหว ความยาว และเสียงได้',
    scopeNote: 'หน้านี้อ้างอิง Wan 3.0 Image-to-Video โดยเฉพาะ Wan 2.1 เป็นคนละรุ่นและอาจมีฟิลด์ต่างกัน เส้นทางนี้เป็น WaveSpeedAI API โดยตรง ยังไม่ใช่ Botnoi Gateway',
    body: { contentType: 'application/json', shape: 'Wan30ImageToVideoRequest', fields: [['prompt', 'string', 'Yes', 'คำอธิบายการเคลื่อนไหวและฉาก'], ['image', 'string', 'Yes', 'ภาพเฟรมแรก เป็น URL หรือข้อมูลภาพ Base64'], ['last_image', 'string', 'No', 'ภาพเฟรมสุดท้าย เป็น URL หรือข้อมูลภาพ Base64'], ['resolution', 'string', 'No', '480p, 720p หรือ 1080p; ค่าเริ่มต้น 720p'], ['aspect_ratio', 'string', 'No', '16:9, 9:16, 1:1, 4:3, 3:4; ถ้าไม่ระบุจะอิงภาพต้นฉบับ'], ['duration', 'integer', 'No', '2–30 วินาที; ค่าเริ่มต้น 5'], ['enable_prompt_expansion', 'boolean', 'No', 'ขยาย prompt อัตโนมัติ; ค่าเริ่มต้น false'], ['generate_audio', 'boolean', 'No', 'สร้างเสียงประกอบ; ค่าเริ่มต้น true'], ['seed', 'integer', 'No', 'ค่า seed; ใช้ -1 เพื่อสุ่ม']] },
    formFields: [{ name: 'prompt', label: 'Prompt', kind: 'textarea', required: true, placeholder: 'อธิบายการเคลื่อนไหวของภาพ…' }, { name: 'image', label: 'First-frame image URL / Base64', kind: 'text', required: true, placeholder: 'https://example.com/first-frame.jpg' }, { name: 'last_image', label: 'Last-frame image URL / Base64', kind: 'text', optional: true }, { name: 'resolution', label: 'Resolution', kind: 'select', options: ['480p', '720p', '1080p'], defaultValue: '720p' }, { name: 'aspect_ratio', label: 'Aspect ratio', kind: 'select', options: ['', '16:9', '9:16', '1:1', '4:3', '3:4'], defaultValue: '' }, { name: 'duration', label: 'Duration', kind: 'number', min: 2, max: 30, defaultValue: '5' }, { name: 'enable_prompt_expansion', label: 'Prompt expansion', kind: 'boolean', defaultValue: false }, { name: 'generate_audio', label: 'Generate audio', kind: 'boolean', defaultValue: true }, { name: 'seed', label: 'Seed', kind: 'number', optional: true }],
  },
  'GPT Image 2.5': {
    title: 'GPT Image 2.5 Flare Text-to-Image', method: 'POST', path: '/api/v3/openai/gpt-image-2.5-flare/text-to-image', hideAttribution: true,
    description: 'สร้างภาพจากข้อความด้วย GPT Image 2.5 Flare ปรับอัตราส่วน ความละเอียด คุณภาพ และรูปแบบไฟล์ได้',
    body: { contentType: 'application/json', shape: 'GPTImage25FlareRequest', fields: [['prompt', 'string', 'Yes', 'คำอธิบายภาพที่ต้องการ'], ['aspect_ratio', 'string', 'No', 'อัตราส่วนภาพ'], ['resolution', 'string', 'No', '1k, 2k หรือ 4k'], ['quality', 'string', 'No', 'low, medium, high, xhigh หรือ max'], ['output_format', 'string', 'No', 'png, jpeg หรือ webp'], ['enable_sync_mode', 'boolean', 'No', 'รอผลในคำขอเดียว'], ['enable_base64_output', 'boolean', 'No', 'คืนค่า Base64 แทน URL']] },
    formFields: [{ name: 'prompt', label: 'Prompt', kind: 'textarea', required: true }, { name: 'aspect_ratio', label: 'Aspect ratio', kind: 'select', options: ['1:1', '1:2', '2:1', '1:3', '3:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '9:21', '21:9'], defaultValue: '1:1' }, { name: 'resolution', label: 'Resolution', kind: 'select', options: ['1k', '2k', '4k'], defaultValue: '1k' }, { name: 'quality', label: 'Quality', kind: 'select', options: ['low', 'medium', 'high', 'xhigh', 'max'], defaultValue: 'medium' }, { name: 'output_format', label: 'Output format', kind: 'select', options: ['png', 'jpeg', 'webp'], defaultValue: 'png' }, { name: 'enable_sync_mode', label: 'Sync mode', kind: 'boolean', defaultValue: false }, { name: 'enable_base64_output', label: 'Base64 output', kind: 'boolean', defaultValue: false }],
  },
  'DALL-E 3': {
    title: 'DALL-E 3 Text-to-Image', method: 'POST', path: '/api/v3/openai/dall-e-3', hideAttribution: true,
    description: 'สร้างภาพจาก Prompt ด้วย DALL-E 3 เลือกขนาด คุณภาพ และสไตล์ภาพได้',
    body: { contentType: 'application/json', shape: 'Dalle3Request', fields: [['prompt', 'string', 'Yes', 'คำอธิบายภาพที่ต้องการ'], ['size', 'string', 'No', '1024*1024, 1024*1792 หรือ 1792*1024'], ['quality', 'string', 'No', 'standard หรือ hd'], ['style', 'string', 'No', 'vivid หรือ natural'], ['enable_sync_mode', 'boolean', 'No', 'รอผลในคำขอเดียว'], ['enable_base64_output', 'boolean', 'No', 'คืนค่า Base64 แทน URL']] },
    formFields: [{ name: 'prompt', label: 'Prompt', kind: 'textarea', required: true }, { name: 'size', label: 'Size', kind: 'select', options: ['1024*1024', '1024*1792', '1792*1024'], defaultValue: '1024*1024' }, { name: 'quality', label: 'Quality', kind: 'select', options: ['standard', 'hd'], defaultValue: 'standard' }, { name: 'style', label: 'Style', kind: 'select', options: ['vivid', 'natural'], defaultValue: 'vivid' }, { name: 'enable_sync_mode', label: 'Sync mode', kind: 'boolean', defaultValue: false }, { name: 'enable_base64_output', label: 'Base64 output', kind: 'boolean', defaultValue: false }],
  },
}
for (const model of Object.values(wavespeedModels)) {
  model.resultPath = '/api/v3/predictions/{id}/result'
  model.responses = [['200', 'Prediction submitted', 'WaveSpeedPrediction']]
  model.example = { code: 200, message: 'success', data: { id: 'abc123-task-id', status: 'created', urls: { get: 'https://api.wavespeed.ai/api/v3/predictions/abc123-task-id/result' } } }
  model.statusNote = 'created | processing | completed | failed | cancelled | timeout | deleted'
}

export const initialForm: InitialVideoForm = { prompt: '', duration: '5', resolution: '720p', aspect_ratio: '', generate_audio: false }
export const endpointGroups: EndpointGroup[] = [
  { name: 'Video AI Models', items: [
    { method: 'POST', name: 'Create Seedance 2.5 video', path: '/api/genai/wavespeed/bytedance/seedance-2.5/text-to-video' },
    { method: 'GET', name: 'Get Seedance 2.5 result' },
    { method: 'POST', name: 'Create SeeDance 2.0 / Mini video', path: '/api/genai/byteplus/video-generation' },
    { method: 'GET', name: 'Get SeeDance 2.0 result' },
    { method: 'POST', name: 'Create Motion Control video', path: '/api/genai/motion-control' },
    { method: 'GET', name: 'Get Motion Control result' },
  ] },
  { name: 'Avatar Lip-sync', items: [
    { method: 'POST', name: 'Create InfiniteTalk avatar', path: '/api/genai/infinitetalk' },
    { method: 'GET', name: 'Get InfiniteTalk result' },
    { method: 'POST', name: 'Create OmniHuman avatar', path: '/api/genai/byteplus/avatar-video' },
    { method: 'GET', name: 'Get OmniHuman result' },
  ] },
  { name: 'Image Generation', items: [
    { method: 'POST', name: 'Create SeeDream 4.5 image' },
    { method: 'GET', name: 'Get SeeDream 4.5 result' },
    {
    method: 'POST',
    name: 'Create GPT Image',
    path: '/api/genai/wavespeed/gpt-image/text-to-image'
  },
  ] },
  { name: 'Feature Model', items: [
    { kind: 'model', method: 'POST', name: 'Kling 3.0 Std', path: wavespeedModels['Kling 3.0 Std'].path },
    { kind: 'model', method: 'POST', name: 'Wan 2.1 (Alibaba)', path: wavespeedModels['Wan 2.1 (Alibaba)'].path },
    { kind: 'model', method: 'POST', name: 'Wan 3.0 (Alibaba)', path: wavespeedModels['Wan 3.0 (Alibaba)'].path },
    { kind: 'model', method: 'POST', name: 'GPT Image 2.5', path: wavespeedModels['GPT Image 2.5'].path },
    { kind: 'model', method: 'POST', name: 'DALL-E 3', path: wavespeedModels['DALL-E 3'].path },
  ] },
]
export const allEndpoints = endpointGroups.flatMap(group => group.items)
export const seedance25Markdown = [
  '# Create Seedance 2.5 video',
  '',
  '**POST** `/api/genai/wavespeed/bytedance/seedance-2.5/text-to-video`',
  '',
  'โมเดลสร้างวิดีโอคุณภาพสูง (Flagship) รองรับ Text-to-Video, Image-to-Video (First & Last frame) และ Reference Media',
  '',
  '## Auth',
  '',
  '**Authentication required.**',
  '',
  '## Parameters',
  '',
  'No parameters.',
  '',
  '## Request Body',
  '',
  '| **Required** | **Content-Type** | **Shape** |',
  '| :--- | :--- | :--- |',
  '| Yes | application/json | Seedance25Request |',
  '',
  '| **Name** | **Type** | **Required** | **Description** |',
  '| :--- | :--- | :--- | :--- |',
  '| prompt | string | Yes | ข้อความอธิบายวิดีโอที่ต้องการ |',
  '| duration | number | Yes | ความยาว เช่น 5 หรือ 10 วินาที |',
  '| resolution | string | Yes | "720p" หรือ "1080p" |',
  '| aspect_ratio | string | No | "16:9" หรือ "9:16" |',
  '| generate_audio | boolean | No | true หรือ false |',
  '| reference_images | string[] | No | Array ของรูปภาพแบบ Base64 Data URL |',
  '| reference_videos | string[] | No | Array ของวิดีโออ้างอิงแบบ Base64 Data URL |',
  '',
  '## Responses',
  '',
  '| **Status** | **Description** | **Content-Type** | **Shape** |',
  '| :--- | :--- | :--- | :--- |',
  '| **200** | Task submitted | application/json | TaskResponse |',
  '| **401** | Unauthorized | application/json | ErrorResponse |',
  '| **403** | Insufficient credits | application/json | ErrorResponse |',
  '',
  '**Example Response (200)**',
  '',
  '```json',
  '{',
  '  "data": {',
  '    "id": "task_seedance25_abc123",',
  '    "status": "pending"',
  '  }',
  '}',
  '```',
].join('\n')
export const seedance25ResultMarkdown = [
  '# Get Seedance 2.5 result',
  '',
  '**GET** `/api/genai/wavespeed/result/{id}`',
  '',
  'ตรวจสอบสถานะและดึง url_video ของ Seedance 2.5 task — ใช้ path เดียวกับ InfiniteTalk และ Motion Control',
  '',
  '## Auth',
  '',
  '**Authentication required.**',
  '',
  '## Parameters',
  '',
  '| **Name** | **In** | **Required** | **Type** | **Description** |',
  '| :--- | :--- | :--- | :--- | :--- |',
  '| id | path | Yes | string | Task ID ที่ได้จาก POST (field: data.id) |',
  '',
  '## Request Body',
  '',
  'No request body.',
  '',
  '## Responses',
  '',
  '| **Status** | **Description** | **Content-Type** | **Shape** |',
  '| :--- | :--- | :--- | :--- |',
  '| **200** | Successful Response | application/json | WavespeedResultResponse |',
  '| **404** | Task not found | application/json | ErrorResponse |',
  '',
  '**Example Response (200)**',
  '',
  '```json',
  '{',
  '  "data": {',
  '    "id": "<task_id>",',
  '    "status": "completed",',
  '    "url_video": "https://storage.botnoi.ai/.../output.mp4",',
  '    "error": ""',
  '  }',
  '}',
  '```',
  '',
  'Status values: "pending" | "processing" | "completed" | "failed"',
].join('\n')
export const endpointDocs: Record<string, Omit<EndpointDoc, 'title'>> = {
  'Create SeeDance 2.0 / Mini video': {
    method: 'POST', path: '/api/genai/byteplus/video-generation',
    description: 'BytePlus Engine — Text-to-Video หรือ Image-to-Video ด้วย dreamina-seedance-2-0 หรือ mini model',
    body: { contentType: 'multipart/form-data', shape: 'SeeDance20Request', fields: [
      ['prompt', 'string', 'Yes', 'ข้อความ Prompt'],
      ['mode', 'string', 'Yes', '"text-to-video" หรือ "image-to-video"'],
      ['model', 'string', 'No', '"dreamina-seedance-2-0-260128" หรือ "dreamina-seedance-2-0-mini-260615"'],
      ['image_file', 'File', 'No', 'ไฟล์รูปภาพตั้งต้น (Image-to-Video)'],
      ['duration', 'string', 'Yes', '"5" หรือ "10"'],
      ['ratio', 'string', 'Yes', '"16:9" หรือ "9:16"'],
      ['resolution', 'string', 'Yes', '"720p" หรือ "1080p"'],
    ] },
    responses: [['200', 'Task submitted', 'TaskResponse'], ['401', 'Unauthorized', 'ErrorResponse'], ['403', 'Insufficient credits', 'ErrorResponse']],
    example: { data: { task_id: 'task_seedance20_xyz789' } },
  },
  'Get SeeDance 2.0 result': {
    method: 'GET', path: '/api/genai/byteplus/video-generation/{task_id}',
    description: 'ตรวจสอบสถานะ task และดึง url_video ของ SeeDance 2.0 / Mini',
    parameters: [['task_id', 'path', 'Yes', 'string', 'Task ID ที่ได้จาก POST (field: data.task_id)']],
    responses: [['200', 'Successful Response', 'ByteplusStatusResponse'], ['404', 'Task not found', 'ErrorResponse']],
    example: { data: { status: 'completed', url_video: 'https://storage.botnoi.ai/.../video.mp4' } },
    statusNote: 'processing | completed | failed',
  },
  'Create Motion Control video': {
    method: 'POST', path: '/api/genai/motion-control',
    description: 'Kling Motion Control — สร้างวิดีโอตัวละครขยับตามท่าทางจาก Template video (Wavespeed engine)',
    body: { contentType: 'multipart/form-data', shape: 'MotionControlRequest', fields: [
      ['image', 'File', 'Yes', 'ภาพตัวละครต้นฉบับ'],
      ['video', 'File | string', 'Yes', 'คลิปท่าทางหรือ URL Template'],
      ['mode', 'string', 'Yes', '"standard" หรือ "pro"'],
      ['character_orientation', 'string', 'Yes', '"image" หรือ "video"'],
    ] },
    responses: [['200', 'Task submitted', 'TaskResponse'], ['401', 'Unauthorized', 'ErrorResponse'], ['403', 'Insufficient credits', 'ErrorResponse']],
    example: { data: { id: 'task_motion_999' } },
  },
  'Get Motion Control result': {
    method: 'GET', path: '/api/genai/get_id_wavspeed',
    description: 'ตรวจสอบสถานะ Motion Control task — ใช้ query param ?id={id} (Wavespeed engine เดียวกับ InfiniteTalk)',
    parameters: [['id', 'query', 'Yes', 'string', 'Task ID ที่ได้จาก POST (field: data.id)']],
    responses: [['200', 'Successful Response', 'WavespeedResultResponse'], ['404', 'Task not found', 'ErrorResponse']],
    example: { data: { id: 'task_motion_999', status: 'success', url_video: 'https://storage.botnoi.ai/.../motion.mp4' } },
    statusNote: 'pending | success | failed',
  },
  'Create InfiniteTalk avatar': {
    method: 'POST', path: '/api/genai/infinitetalk',
    description: 'สร้างวิดีโอตัวละครขยับปากและศีรษะสัมพันธ์กับเสียงพูดอย่างเป็นธรรมชาติ (Fast Avatar)',
    body: { contentType: 'multipart/form-data', shape: 'InfiniteTalkRequest', fields: [
      ['image_file', 'File', 'Yes', 'ไฟล์รูปภาพใบหน้า Avatar (JPG / PNG)'],
      ['audio_file', 'File', 'Yes', 'ไฟล์เสียงพูด (MP3 / WAV)'],
      ['resolution', 'string', 'Yes', '"480p" หรือ "720p"'],
      ['prompt', 'string', 'No', 'ข้อความ Prompt กำหนดลักษณะเพิ่มเติม'],
    ] },
    responses: [['200', 'Task submitted', 'TaskResponse'], ['401', 'Unauthorized', 'ErrorResponse'], ['403', 'Insufficient credits', 'ErrorResponse']],
    example: { data: { id: 'task_infinitetalk_555', task_id: 'task_infinitetalk_555', status: 'pending' } },
  },
  'Get InfiniteTalk result': {
    method: 'GET', path: '/api/genai/get_id_wavspeed',
    description: 'ตรวจสอบสถานะ InfiniteTalk task — ใช้ query param ?id={id} (Wavespeed engine)',
    parameters: [['id', 'query', 'Yes', 'string', 'Task ID ที่ได้จาก POST (field: data.id หรือ data.task_id)']],
    responses: [['200', 'Successful Response', 'WavespeedResultResponse'], ['404', 'Task not found', 'ErrorResponse']],
    example: { data: { id: 'task_infinitetalk_555', status: 'success', url_video: 'https://storage.botnoi.ai/.../avatar.mp4' } },
    statusNote: 'pending | success | failed',
  },
  'Create OmniHuman avatar': {
    method: 'POST', path: '/api/genai/byteplus/avatar-video',
    description: 'BytePlus Avatar — วิดีโออวาตาร์ขยับปากและแสดงสีหน้าซิงค์เสียง ด้วย OmniHuman engine',
    body: { contentType: 'multipart/form-data', shape: 'OmniHumanRequest', fields: [
      ['image_file', 'File', 'Yes', 'ไฟล์ภาพ Avatar'],
      ['audio_file', 'File | string', 'Yes', 'ไฟล์เสียงพูด'],
      ['prompt', 'string', 'No', 'Prompt อธิบายสไตล์'],
    ] },
    responses: [['200', 'Task submitted', 'TaskResponse'], ['401', 'Unauthorized', 'ErrorResponse'], ['403', 'Insufficient credits', 'ErrorResponse']],
    example: { data: { task_id: 'task_omnihuman_888' } },
  },
  'Get OmniHuman result': {
    method: 'GET', path: '/api/genai/byteplus/avatar-video/{task_id}',
    description: 'ตรวจสอบสถานะ OmniHuman task — ใช้ BytePlus path ต่างจาก InfiniteTalk',
    parameters: [['task_id', 'path', 'Yes', 'string', 'Task ID ที่ได้จาก POST (field: data.task_id)']],
    responses: [['200', 'Successful Response', 'ByteplusStatusResponse'], ['404', 'Task not found', 'ErrorResponse']],
    example: { data: { status: 'done', resp_data: '{"video_url":"https://storage.botnoi.ai/.../avatar.mp4"}' } },
  },
  'Create SeeDream 4.5 image': {
    method: 'POST', path: '/api/genai/byteplus/image-generation',
    description: 'BytePlus Image Model — สร้างรูปภาพคุณภาพสูงด้วย Seedream 4.5 รองรับ Text-to-Image และ Image-to-Image',
    body: { contentType: 'multipart/form-data', shape: 'SeeDreamRequest', fields: [
      ['prompt', 'string', 'Yes', 'ข้อความสร้างรูปภาพ'],
      ['model', 'string', 'No', '"seedream-4-5-251128"'],
      ['parameters', 'string', 'Yes', 'JSON: {"size":"1024x1024","sequential_image_generation":"disabled","watermark":false}'],
      ['image1', 'File', 'No', 'รูปภาพตั้งต้น (Image-to-Image)'],
    ] },
    responses: [['200', 'Task submitted', 'TaskResponse'], ['401', 'Unauthorized', 'ErrorResponse'], ['403', 'Insufficient credits', 'ErrorResponse']],
    example: { data: { task_id: 'task_seedream_001' } },
  },
  'Get SeeDream 4.5 result': {
    method: 'GET', path: '/api/genai/byteplus/image-generation/status/{task_id}',
    description: 'ตรวจสอบสถานะและดึง URL รูปภาพที่สร้างเสร็จแล้ว (BytePlus path)',
    parameters: [['task_id', 'path', 'Yes', 'string', 'Task ID ที่ได้จาก POST (field: data.task_id)']],
    responses: [['200', 'Successful Response', 'ByteplusStatusResponse'], ['404', 'Task not found', 'ErrorResponse']],
    example: { data: { status: 'success', url_video: 'https://storage.botnoi.ai/.../image.png' } },
  },
}
export const markdownCell = (value: unknown): string => String(value).replaceAll('|', '\\|')
export const endpointMarkdown = (doc: EndpointDoc & { exampleStatus?: number }) => {
  const lines = [`# ${doc.title}`, '', `**${doc.method}** \`${doc.path}\``, '', ...(doc.description ? [doc.description, ''] : []), ...(doc.scopeNote && !doc.hideAttribution ? [doc.scopeNote, ''] : []), ...(doc.sourceUrl && !doc.hideAttribution ? ['Base URL: `https://api.wavespeed.ai`', '', `Source: ${doc.sourceUrl}`, ''] : []), '## Auth', '', ...(doc.sourceUrl ? ['WaveSpeedAI API key: `Authorization: Bearer <WAVESPEED_API_KEY>`', ''] : ['**Authentication required.**', '']), '## Parameters', '']
  if (doc.parameters) lines.push('| **Name** | **In** | **Required** | **Type** | **Description** |', '| :--- | :--- | :--- | :--- | :--- |', ...doc.parameters.map(row => `| ${row.map(markdownCell).join(' | ')} |`))
  else lines.push('No parameters.')
  lines.push('', '## Request Body', '')
  if (!doc.body) lines.push('No request body.')
  else lines.push(`| **Required** | **Content-Type** | **Shape** |`, '| :--- | :--- | :--- |', `| Yes | ${doc.body.contentType} | ${doc.body.shape} |`, '', '| **Name** | **Type** | **Required** | **Description** |', '| :--- | :--- | :--- | :--- |', ...(doc.body.fields ?? []).map(row => `| ${row.map(markdownCell).join(' | ')} |`))
  lines.push('', '## Responses', '', '| **Status** | **Description** | **Content-Type** | **Shape** |', '| :--- | :--- | :--- | :--- |', ...(doc.responses ?? []).map(([status, description, shape]) => `| **${status}** | ${description} | application/json | ${shape} |`), '', `**Example Response (${doc.exampleStatus ?? 200})**`, '', '```json', JSON.stringify(doc.example, null, 2), '```')
  if (doc.statusNote) lines.push('', `Status: ${doc.statusNote}`)
  if (doc.resultPath) lines.push('', '## Get result', '', `**GET** \`${doc.resultPath}\``, '', 'Poll with the prediction ID from `data.id`. Completed results are in `data.outputs`.')
  return lines.join('\n')
}
