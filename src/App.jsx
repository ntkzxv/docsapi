import { useEffect, useRef, useState } from 'react'
import './App.css'
import Icon from './components/Icon'
import IndexPage from './pages/IndexPage'
import TryItPage from './pages/TryItPage'

const wavespeedModels = {
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

const initialForm = { prompt: '', duration: '5', resolution: '720p', aspect_ratio: '', generate_audio: false }
const endpointGroups = [
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
  ] },
  { name: 'Feature Model', items: [
    { kind: 'model', method: 'POST', name: 'Kling 3.0 Std', path: wavespeedModels['Kling 3.0 Std'].path },
    { kind: 'model', method: 'POST', name: 'Wan 2.1 (Alibaba)', path: wavespeedModels['Wan 2.1 (Alibaba)'].path },
    { kind: 'model', method: 'POST', name: 'Wan 3.0 (Alibaba)', path: wavespeedModels['Wan 3.0 (Alibaba)'].path },
    { kind: 'model', method: 'POST', name: 'GPT Image 2.5', path: wavespeedModels['GPT Image 2.5'].path },
    { kind: 'model', method: 'POST', name: 'DALL-E 3', path: wavespeedModels['DALL-E 3'].path },
  ] },
]
const allEndpoints = endpointGroups.flatMap(group => group.items)
const seedance25Markdown = [
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
const seedance25ResultMarkdown = [
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
const endpointDocs = {
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
    parameters: [['id', 'path', 'Yes', 'string', 'Task ID ที่ได้จาก POST (field: data.id)']],
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
    parameters: [['id', 'path', 'Yes', 'string', 'Task ID ที่ได้จาก POST (field: data.id หรือ data.task_id)']],
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
const markdownCell = value => String(value).replaceAll('|', '\\|')
const endpointMarkdown = doc => {
  const lines = [`# ${doc.title}`, '', `**${doc.method}** \`${doc.path}\``, '', ...(doc.description ? [doc.description, ''] : []), ...(doc.scopeNote && !doc.hideAttribution ? [doc.scopeNote, ''] : []), ...(doc.sourceUrl && !doc.hideAttribution ? ['Base URL: `https://api.wavespeed.ai`', '', `Source: ${doc.sourceUrl}`, ''] : []), '## Auth', '', ...(doc.sourceUrl ? ['WaveSpeedAI API key: `Authorization: Bearer <WAVESPEED_API_KEY>`', ''] : ['**Authentication required.**', '']), '## Parameters', '']
  if (doc.parameters) lines.push('| **Name** | **In** | **Required** | **Type** | **Description** |', '| :--- | :--- | :--- | :--- | :--- |', ...doc.parameters.map(row => `| ${row.map(markdownCell).join(' | ')} |`))
  else lines.push('No parameters.')
  lines.push('', '## Request Body', '')
  if (!doc.body) lines.push('No request body.')
  else lines.push(`| **Required** | **Content-Type** | **Shape** |`, '| :--- | :--- | :--- |', `| Yes | ${doc.body.contentType} | ${doc.body.shape} |`, '', '| **Name** | **Type** | **Required** | **Description** |', '| :--- | :--- | :--- | :--- |', ...doc.body.fields.map(row => `| ${row.map(markdownCell).join(' | ')} |`))
  lines.push('', '## Responses', '', '| **Status** | **Description** | **Content-Type** | **Shape** |', '| :--- | :--- | :--- | :--- |', ...doc.responses.map(([status, description, shape]) => `| **${status}** | ${description} | application/json | ${shape} |`), '', '**Example Response (200)**', '', '```json', JSON.stringify(doc.example, null, 2), '```')
  if (doc.statusNote) lines.push('', `Status: ${doc.statusNote}`)
  if (doc.resultPath) lines.push('', '## Get result', '', `**GET** \`${doc.resultPath}\``, '', 'Poll with the prediction ID from `data.id`. Completed results are in `data.outputs`.')
  return lines.join('\n')
}
function TryItCallout({ onTry }) {
  return <aside className="endpoint-try-group">
    <div><h2>ทดลองใช้ endpoint นี้</h2><p>กรอกข้อมูลและดูตัวอย่าง Request ได้ โดยยังไม่ส่งข้อมูลไปยัง API จริง</p></div>
    <button className="endpoint-launch-button" onClick={onTry}>Try it <Icon name="arrow" width="17" height="17"/></button>
  </aside>
}
function EndpointDocsPage({ doc, markdownCopied, onCopyMarkdown, onTry }) {
  return <article className="endpoint-docs">
    <div className="endpoint-docs-title-row"><h1>{doc.title}</h1><button className="markdown-copy-button" onClick={onCopyMarkdown}><Icon name="copy" width="15" height="15"/>{markdownCopied ? 'Copied!' : 'Copy as Markdown'}</button></div>
    {doc.description && <p className="endpoint-docs-description">{doc.description}</p>}
    {doc.scopeNote && !doc.hideAttribution && <p className="endpoint-scope-note">{doc.scopeNote} · Base URL: <code>https://api.wavespeed.ai</code></p>}
    {doc.sourceUrl && !doc.hideAttribution && <p className="endpoint-source">อ้างอิง <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer">เอกสาร WaveSpeedAI ↗</a></p>}
    {doc.method === 'POST' && onTry && <TryItCallout onTry={onTry}/>}
    <section className="endpoint-docs-section"><h2>Auth</h2><p>{doc.sourceUrl ? <>WaveSpeedAI API key: <code>Authorization: Bearer &lt;WAVESPEED_API_KEY&gt;</code></> : 'Authentication required.'}</p></section>
    <section className="endpoint-docs-section"><h2>Parameters</h2>{doc.parameters ? <div className="endpoint-table-wrap"><table><thead><tr><th>Name</th><th>In</th><th>Required</th><th>Type</th><th>Description</th></tr></thead><tbody>{doc.parameters.map(([name, location, required, type, description]) => <tr key={name}><td><code>{name}</code></td><td>{location}</td><td>{required}</td><td>{type}</td><td>{description}</td></tr>)}</tbody></table></div> : <p>No parameters.</p>}</section>
    <section className="endpoint-docs-section"><h2>Request Body</h2>{doc.body ? <><div className="endpoint-table-wrap"><table><thead><tr><th>Required</th><th>Content-Type</th><th>Shape</th></tr></thead><tbody><tr><td>Yes</td><td><code>{doc.body.contentType}</code></td><td><code>{doc.body.shape}</code></td></tr></tbody></table></div><div className="endpoint-table-wrap"><table><thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>{doc.body.fields.map(([name, type, required, description]) => <tr key={name}><td><code>{name}</code></td><td>{type}</td><td>{required}</td><td>{description}</td></tr>)}</tbody></table></div></> : <p>No request body.</p>}</section>
    <section className="endpoint-docs-section"><h2>Responses</h2><div className="endpoint-table-wrap"><table><thead><tr><th>Status</th><th>Description</th><th>Content-Type</th><th>Shape</th></tr></thead><tbody>{doc.responses.map(([status, description, shape]) => <tr key={status}><td><strong className={`response-status ${status === '200' ? 'success' : status === '401' ? 'unauthorized' : 'forbidden'}`}>{status}</strong></td><td>{description}</td><td><code>application/json</code></td><td><code>{shape}</code></td></tr>)}</tbody></table></div></section>
    <section className="endpoint-docs-section"><h2>Example Response (200)</h2><pre className="endpoint-example">{JSON.stringify(doc.example, null, 2)}</pre>{doc.statusNote && <p className="endpoint-status-note">Status: {doc.statusNote.split(' | ').map((status, index) => <span key={status}>{index > 0 && ' | '}<code>{status}</code></span>)}</p>}</section>
    {doc.resultPath && <section className="endpoint-docs-section"><h2>Get result</h2><p>ใช้ <code>data.id</code> จากผลการส่งงาน เพื่อตรวจสถานะด้วย <code>GET {doc.resultPath}</code> เมื่อสถานะเป็น <code>completed</code> ผลลัพธ์อยู่ใน <code>data.outputs</code></p></section>}
  </article>
}
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const endpointFromHash = () => {
  const routeSlug = window.location.hash.match(/^#\/(?:try-it-now|endpoint|model)\/(.+)$/)?.[1]
  const legacyModels = { 'kling-ai': 'kling-3-0-std', 'wan-alibaba': 'wan-3-0-alibaba', 'gpt-image': 'gpt-image-2-5' }
  const resolvedSlug = legacyModels[routeSlug] ?? (routeSlug === 'kling-1-5' ? 'kling-3-0-std' : routeSlug)
  return allEndpoints.find(item => slug(item.name) === resolvedSlug) ?? allEndpoints.find(item => item.method === 'POST')
}
function Choice({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const current = options.find(([key]) => key === value)

  useEffect(() => {
    if (!open) return undefined
    const closeOutside = event => { if (!root.current?.contains(event.target)) setOpen(false) }
    const closeEscape = event => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape) }
  }, [open])

  return <div className="choice-field" ref={root}>
    <span className="choice-label">{label}</span>
    <button type="button" className={`custom-select-trigger ${open ? 'is-open' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(v => !v)}>
      <span>{current?.[1] ?? 'Select an option'}</span><span className="select-chevron" aria-hidden="true"/>
    </button>
    {open && <div className="custom-select-menu" role="listbox" aria-label={label}>{options.map(([key, text]) => <button key={key || 'default'} type="button" role="option" aria-selected={value === key} className={value === key ? 'is-selected' : ''} onClick={() => { onChange(key); setOpen(false) }}>{text}{value === key && <span className="option-check" aria-hidden="true">✓</span>}</button>)}</div>}
  </div>
}
function WaveSpeedModelForm({ doc, onPreview }) {
  const defaults = Object.fromEntries(doc.formFields.map(field => [field.name, field.defaultValue ?? '']))
  const [values, setValues] = useState(defaults)
  const [error, setError] = useState('')
  const updateValue = (name, value) => setValues(current => ({ ...current, [name]: value }))
  const submit = event => {
    event.preventDefault()
    const body = {}
    try {
      for (const field of doc.formFields) {
        const value = values[field.name]
        if (field.kind === 'boolean') body[field.name] = value
        else if (String(value).trim()) body[field.name] = field.kind === 'number' || field.valueType === 'number' ? Number(value) : field.kind === 'json' ? JSON.parse(value) : String(value).trim()
      }
      if (doc.title.startsWith('Kling')) {
        if (body.shot_type === 'intelligence' && !body.prompt) throw new Error('โหมด intelligence ต้องมี Prompt')
        if (body.multi_prompt && !Array.isArray(body.multi_prompt)) throw new Error('Multi-prompt ต้องเป็น JSON array')
        if (body.shot_type === 'intelligence' && body.multi_prompt) throw new Error('โหมด intelligence ไม่ใช้ Multi-prompt')
      }
      setError('')
      onPreview(body)
    } catch (failure) { setError(failure instanceof SyntaxError ? 'Multi-prompt ต้องเป็น JSON ที่ถูกต้อง' : failure.message) }
  }
  return <form className="avatar-form wavespeed-form" onSubmit={submit}>
    {doc.formFields.map(field => <div key={field.name}>
      {field.kind === 'select' ? <Choice label={field.label} value={values[field.name]} options={field.options.map(option => [option, option || 'Auto from image'])} onChange={value => updateValue(field.name, value)}/>
        : field.kind === 'boolean' ? <div className="audio-row"><div><label htmlFor={`model-${field.name}`}>{field.label}</label></div><input id={`model-${field.name}`} className="switch" type="checkbox" checked={values[field.name]} onChange={event => updateValue(field.name, event.target.checked)}/></div>
          : <><label className="prompt-label" htmlFor={`model-${field.name}`}>{field.label} {field.required && <span className="required">*</span>}{field.optional && <span className="optional-tag">Optional</span>}</label><div className="prompt-input">{field.kind === 'textarea' || field.kind === 'json'
            ? <textarea id={`model-${field.name}`} required={field.required} value={values[field.name]} onChange={event => updateValue(field.name, event.target.value)} placeholder={field.placeholder || ''} rows={field.kind === 'json' ? 3 : 4}/>
            : <input id={`model-${field.name}`} type={field.kind === 'number' ? 'number' : 'text'} required={field.required} min={field.min} max={field.max} step={field.step || (field.kind === 'number' ? '1' : undefined)} value={values[field.name]} onChange={event => updateValue(field.name, event.target.value)} placeholder={field.placeholder || ''}/>}</div></>}
    </div>)}
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function InfiniteTalkForm({ onPreview }) {
  const [image, setImage] = useState(null)
  const [audio, setAudio] = useState(null)
  const [resolution, setResolution] = useState('480p')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!image || !audio) { setError('กรุณาเลือกไฟล์ภาพและไฟล์เสียงให้ครบ'); return }
    setError('')
    onPreview({ image_file: { file_name: image.name, content_type: image.type || 'image/*' }, audio_file: { file_name: audio.name, content_type: audio.type || 'audio/*' }, resolution, ...(prompt.trim() && { prompt: prompt.trim() }) })
  }
  const fileField = (field, file, setFile, accept, title, hint) => <div className="avatar-file-field">
    <label className="prompt-label" htmlFor={field}>{title} <span className="required">*</span></label>
    <label className={`avatar-dropzone ${file ? 'has-file' : ''}`} htmlFor={field}>
      <span className="avatar-upload-icon"><Icon name="upload"/></span>
      <strong>{file ? file.name : 'เลือกไฟล์ หรือวางไฟล์ที่นี่'}</strong>
      <span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : hint}</span>
      <input id={field} type="file" accept={accept} required onChange={event => setFile(event.target.files?.[0] ?? null)}/>
    </label>
  </div>
  return <form className="avatar-form" onSubmit={submit}>
    <div className="avatar-files">{fileField('image_file', image, setImage, 'image/jpeg,image/png,.jpg,.jpeg,.png', 'Avatar image', 'JPG or PNG')} {fileField('audio_file', audio, setAudio, 'audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav', 'Speech audio', 'MP3 or WAV')}</div>
    <Choice label="Resolution" value={resolution} options={[[ '480p', '480p' ], [ '720p', '720p' ]]} onChange={setResolution}/>
    <label className="prompt-label avatar-prompt-label" htmlFor="avatar-prompt">Prompt <span className="optional-tag">Optional</span></label>
    <div className="prompt-input"><textarea id="avatar-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="เพิ่มรายละเอียดลักษณะ Avatar หรือการเคลื่อนไหว…" rows="4"/><div className="prompt-footer"><span>กำหนดลักษณะเพิ่มเติม</span><span>{prompt.length} characters</span></div></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function SeeDreamForm({ onPreview }) {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('seedream-4-5-251128')
  const [parameters, setParameters] = useState('null')
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!prompt.trim()) { setError('กรุณากรอก Prompt ก่อนสร้างคำขอ'); return }
    setError('')
    onPreview({ prompt: prompt.trim(), ...(model.trim() && { model: model.trim() }), parameters: parameters === 'null' ? null : parameters, ...(image && { image1: { file_name: image.name, content_type: image.type || 'image/*' } }) })
  }
  return <form className="avatar-form seedream-form" onSubmit={submit}>
    <div>
      <label className="prompt-label" htmlFor="seedream-prompt">Prompt <span className="required">*</span></label>
      <div className="prompt-input"><textarea id="seedream-prompt" required value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="อธิบายภาพที่ต้องการสร้าง…" rows="4"/><div className="prompt-footer"><span>ระบุสิ่งที่ต้องการให้อยู่ในภาพ</span><span>{prompt.length} characters</span></div></div>
    </div>
    <label className="seedream-model-field"><span className="prompt-label">Model <span className="optional-tag">Optional</span></span><input value={model} onChange={event => setModel(event.target.value)} placeholder="seedream-4-5-251128"/></label>
    <Choice label="Parameters" value={parameters} options={[[ 'null', 'null' ]]} onChange={setParameters}/>
    <div className="seedream-image-field">
      <div className="prompt-label">Starting image <span className="optional-tag">Optional</span></div>
      <label className={`avatar-dropzone seedream-dropzone ${image ? 'has-file' : ''}`} htmlFor="seedream-image"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{image ? image.name : 'เลือกภาพตั้งต้น'}</strong><span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : 'ใช้สร้างภาพต่อจากรูปที่มี'}</span><input id="seedream-image" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={event => setImage(event.target.files?.[0] ?? null)}/></label>
    </div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function Seedance20Form({ onPreview }) {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text-to-video')
  const [model, setModel] = useState('')
  const [image, setImage] = useState(null)
  const [duration, setDuration] = useState('5')
  const [ratio, setRatio] = useState('16:9')
  const [resolution, setResolution] = useState('720p')
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!prompt.trim()) { setError('กรุณากรอก Prompt ก่อนสร้างคำขอ'); return }
    setError('')
    onPreview({ prompt: prompt.trim(), mode, ...(model && { model }), ...(mode === 'image-to-video' && image && { image_file: { file_name: image.name, content_type: image.type || 'image/*' } }), duration, ratio, resolution })
  }
  return <form className="avatar-form seedance20-form" onSubmit={submit}>
    <div>
      <label className="prompt-label" htmlFor="seedance20-prompt">Prompt <span className="required">*</span></label>
      <div className="prompt-input"><textarea id="seedance20-prompt" required value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="อธิบายวิดีโอและการเคลื่อนไหวที่ต้องการ…" rows="4"/><div className="prompt-footer"><span>ระบุฉากและการเคลื่อนไหวในวิดีโอ</span><span>{prompt.length} characters</span></div></div>
    </div>
    <Choice label="Mode" value={mode} options={[[ 'text-to-video', 'Text-to-Video' ], [ 'image-to-video', 'Image-to-Video' ]]} onChange={value => { setMode(value); setError('') }}/>
    <Choice label="Model" value={model} options={[[ '', 'Default model' ], [ 'dreamina-seedance-2-0-260128', 'Seedance 2.0' ], [ 'dreamina-seedance-2-0-mini-260615', 'Seedance 2.0 Mini' ]]} onChange={setModel}/>
    {mode === 'image-to-video' && <div className="seedream-image-field"><div className="prompt-label">Starting image <span className="optional-tag">Optional</span></div><label className={`avatar-dropzone seedream-dropzone ${image ? 'has-file' : ''}`} htmlFor="seedance20-image"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{image ? image.name : 'เลือกภาพตั้งต้น'}</strong><span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : 'ภาพที่ใช้เป็นเฟรมเริ่มต้นของวิดีโอ'}</span><input id="seedance20-image" type="file" accept="image/*" onChange={event => setImage(event.target.files?.[0] ?? null)}/></label></div>}
    <div className="settings-row"><Choice label="Duration" value={duration} options={[[ '5', '5 seconds' ], [ '10', '10 seconds' ]]} onChange={setDuration}/><Choice label="Ratio" value={ratio} options={[[ '16:9', '16:9' ], [ '9:16', '9:16' ]]} onChange={setRatio}/></div>
    <Choice label="Resolution" value={resolution} options={[[ '720p', '720p' ], [ '1080p', '1080p' ]]} onChange={setResolution}/>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function MotionControlForm({ onPreview }) {
  const [image, setImage] = useState(null)
  const [video, setVideo] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoSource, setVideoSource] = useState('file')
  const [mode, setMode] = useState('standard')
  const [orientation, setOrientation] = useState('video')
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!image) { setError('กรุณาอัปโหลดภาพตัวละคร'); return }
    if (videoSource === 'file' && !video) { setError('กรุณาอัปโหลดคลิปท่าทาง'); return }
    if (videoSource === 'url' && !videoUrl.trim()) { setError('กรุณากรอก URL ของ Template video'); return }
    setError('')
    onPreview({ image: { file_name: image.name, content_type: image.type || 'image/*' }, video: videoSource === 'file' ? { file_name: video.name, content_type: video.type || 'video/*' } : videoUrl.trim(), mode, character_orientation: orientation })
  }
  return <form className="avatar-form motion-form" onSubmit={submit}>
    <div className="motion-upload-grid">
      <div className="seedream-image-field"><div className="prompt-label">Character image <span className="required">*</span></div><label className={`avatar-dropzone seedream-dropzone ${image ? 'has-file' : ''}`} htmlFor="motion-image"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{image ? image.name : 'อัปโหลดภาพตัวละคร'}</strong><span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : 'ภาพต้นฉบับของตัวละคร'}</span><input id="motion-image" type="file" accept="image/*" onChange={event => setImage(event.target.files?.[0] ?? null)}/></label></div>
      <div className="motion-video-field"><div className="motion-video-heading"><span className="prompt-label">Template video <span className="required">*</span></span><div className="source-toggle"><button type="button" className={videoSource === 'file' ? 'selected' : ''} onClick={() => { setVideoSource('file'); setError('') }}>File</button><button type="button" className={videoSource === 'url' ? 'selected' : ''} onClick={() => { setVideoSource('url'); setError('') }}>URL</button></div></div>{videoSource === 'file' ? <label className={`avatar-dropzone seedream-dropzone ${video ? 'has-file' : ''}`} htmlFor="motion-video"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{video ? video.name : 'อัปโหลดคลิปท่าทาง'}</strong><span>{video ? `${(video.size / (1024 * 1024)).toFixed(2)} MB` : 'วิดีโอต้นแบบการเคลื่อนไหว'}</span><input id="motion-video" type="file" accept="video/*" onChange={event => setVideo(event.target.files?.[0] ?? null)}/></label> : <div className="prompt-input url-input"><input aria-label="Template video URL" type="url" value={videoUrl} onChange={event => setVideoUrl(event.target.value)} placeholder="https://example.com/template.mp4"/></div>}</div>
    </div>
    <div className="settings-row"><Choice label="Mode" value={mode} options={[[ 'standard', 'Standard' ], [ 'pro', 'Pro' ]]} onChange={setMode}/><Choice label="Character orientation" value={orientation} options={[[ 'image', 'Image' ], [ 'video', 'Video' ]]} onChange={setOrientation}/></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function OmniHumanForm({ onPreview }) {
  const [image, setImage] = useState(null)
  const [audio, setAudio] = useState(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioSource, setAudioSource] = useState('file')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!image) { setError('กรุณาอัปโหลดภาพ Avatar'); return }
    if (audioSource === 'file' && !audio) { setError('กรุณาอัปโหลดไฟล์เสียงพูด'); return }
    if (audioSource === 'url' && !audioUrl.trim()) { setError('กรุณากรอก URL ของไฟล์เสียง'); return }
    setError('')
    onPreview({ image_file: { file_name: image.name, content_type: image.type || 'image/*' }, audio_file: audioSource === 'file' ? { file_name: audio.name, content_type: audio.type || 'audio/*' } : audioUrl.trim(), ...(prompt.trim() && { prompt: prompt.trim() }) })
  }
  const fileDrop = (id, file, setFile, accept, title, note) => <div className="seedream-image-field"><div className="prompt-label">{title} <span className="required">*</span></div><label className={`avatar-dropzone seedream-dropzone ${file ? 'has-file' : ''}`} htmlFor={id}><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{file ? file.name : `อัปโหลด${title}`}</strong><span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : note}</span><input id={id} type="file" accept={accept} onChange={event => setFile(event.target.files?.[0] ?? null)}/></label></div>
  return <form className="avatar-form motion-form" onSubmit={submit}>
    <div className="motion-upload-grid">
      {fileDrop('omnihuman-image', image, setImage, 'image/*', 'Avatar image', 'ภาพต้นฉบับของ Avatar')}
      <div className="motion-video-field"><div className="motion-video-heading"><span className="prompt-label">Speech audio <span className="required">*</span></span><div className="source-toggle"><button type="button" className={audioSource === 'file' ? 'selected' : ''} onClick={() => { setAudioSource('file'); setError('') }}>File</button><button type="button" className={audioSource === 'url' ? 'selected' : ''} onClick={() => { setAudioSource('url'); setError('') }}>URL</button></div></div>{audioSource === 'file' ? <label className={`avatar-dropzone seedream-dropzone ${audio ? 'has-file' : ''}`} htmlFor="omnihuman-audio"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{audio ? audio.name : 'อัปโหลดไฟล์เสียง'}</strong><span>{audio ? `${(audio.size / (1024 * 1024)).toFixed(2)} MB` : 'MP3 หรือ WAV'}</span><input id="omnihuman-audio" type="file" accept="audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav" onChange={event => setAudio(event.target.files?.[0] ?? null)}/></label> : <div className="prompt-input url-input"><input aria-label="Audio URL" type="url" value={audioUrl} onChange={event => setAudioUrl(event.target.value)} placeholder="https://example.com/speech.mp3"/></div>}</div>
    </div>
    <div><label className="prompt-label" htmlFor="omnihuman-prompt">Prompt <span className="optional-tag">Optional</span></label><div className="prompt-input"><textarea id="omnihuman-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="อธิบายสไตล์หรือสีหน้าที่ต้องการ…" rows="4"/></div></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function App() {
  const [activeEndpoint, setActiveEndpoint] = useState(endpointFromHash)
  const [isTryPage, setIsTryPage] = useState(() => window.location.hash.startsWith('#/try-it-now/') && endpointFromHash()?.method === 'POST')
  const [expandedGroups, setExpandedGroups] = useState(() => Object.fromEntries(endpointGroups.map(group => [group.name, true])))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('try-it-theme') === 'light' ? 'light' : 'dark')
  const [markdownCopied, setMarkdownCopied] = useState(false)
  useEffect(() => {
    const syncEndpoint = () => {
      const item = endpointFromHash()
      setActiveEndpoint(item)
      setIsTryPage(window.location.hash.startsWith('#/try-it-now/') && item.method === 'POST')
    }
    window.addEventListener('popstate', syncEndpoint)
    window.addEventListener('hashchange', syncEndpoint)
    return () => { window.removeEventListener('popstate', syncEndpoint); window.removeEventListener('hashchange', syncEndpoint) }
  }, [])
  useEffect(() => { localStorage.setItem('try-it-theme', theme) }, [theme])
  const selectEndpoint = item => {
    setActiveEndpoint(item)
    setPreview(null)
    setMarkdownCopied(false)
    window.history.pushState({}, '', `#/${item.kind === 'model' ? 'model' : 'endpoint'}/${slug(item.name)}`)
    setIsTryPage(false)
    setSidebarOpen(false)
  }
  const openTryIt = () => {
    setPreview(null)
    window.history.pushState({}, '', `#/try-it-now/${slug(activeEndpoint.name)}`)
    setIsTryPage(true)
  }
  const copyMarkdown = async () => {
    try {
      const markdown = endpointDocs[activeEndpoint.name]
        ? endpointMarkdown({ title: activeEndpoint.name, ...endpointDocs[activeEndpoint.name] })
        : wavespeedModels[activeEndpoint.name]
          ? endpointMarkdown(wavespeedModels[activeEndpoint.name])
        : activeEndpoint.name === 'Get Seedance 2.5 result' ? seedance25ResultMarkdown : seedance25Markdown
      await navigator.clipboard.writeText(markdown)
      setMarkdownCopied(true)
      window.setTimeout(() => setMarkdownCopied(false), 1800)
    } catch {
      setError('คัดลอก Markdown ไม่สำเร็จ กรุณาลองอีกครั้ง')
    }
  }
  const [form, setForm] = useState(initialForm)
  const [media, setMedia] = useState({ images: [], videos: [] })
  const [preview, setPreview] = useState(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [reading, setReading] = useState(false)
  const [avatarResetKey, setAvatarResetKey] = useState(0)
  const [seedreamResetKey, setSeedreamResetKey] = useState(0)
  const [seedance20ResetKey, setSeedance20ResetKey] = useState(0)
  const [motionResetKey, setMotionResetKey] = useState(0)
  const [omniResetKey, setOmniResetKey] = useState(0)
  const [modelResetKey, setModelResetKey] = useState(0)
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const upload = async (kind, files) => {
    setError('')
    const selected = Array.from(files)
    if (selected.some(file => !file.type.startsWith(kind === 'images' ? 'image/' : 'video/'))) {
      setError('กรุณาเลือกไฟล์ให้ตรงกับประเภทภาพหรือวิดีโอ'); return
    }
    setReading(true)
    try {
      const items = await Promise.all(selected.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve({ name: file.name, data: reader.result })
        reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง'))
        reader.readAsDataURL(file)
      })))
      setMedia(current => ({ ...current, [kind]: [...current[kind], ...items] }))
    } catch (err) { setError(err.message) }
    finally { setReading(false) }
  }
  const submit = event => {
    event.preventDefault()
    if (!form.prompt.trim()) { setError('กรุณากรอก Prompt ก่อนสร้างคำขอ'); return }
    setError(''); setCopied(false)
    setPreview({ prompt: form.prompt.trim(), duration: Number(form.duration), resolution: form.resolution,
      ...(form.aspect_ratio && { aspect_ratio: form.aspect_ratio }), generate_audio: form.generate_audio,
      ...(media.images.length && { reference_images: media.images.map(item => item.data) }),
      ...(media.videos.length && { reference_videos: media.videos.map(item => item.data) }),
    })
  }
  const reset = () => { setForm(initialForm); setMedia({ images: [], videos: [] }); setPreview(null); setError(''); setCopied(false) }
  const copy = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(preview, null, 2)); setCopied(true) }
    catch { setError('คัดลอกไม่ได้ กรุณาเลือกข้อความจาก Preview แล้วคัดลอก') }
  }
  const goBack = () => { window.history.pushState({}, '', `#/${activeEndpoint.kind === 'model' ? 'model' : 'endpoint'}/${slug(activeEndpoint.name)}`); setIsTryPage(false) }
  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark')
  return <div className={`app-shell ${theme === 'light' ? 'light-mode' : ''}`}>
    {isTryPage ? <TryItPage activeEndpoint={activeEndpoint} theme={theme} onToggleTheme={toggleTheme} onBack={goBack}>
    <main className="workspace">
      <section className="input-panel" aria-label={activeEndpoint.name === 'Create InfiniteTalk avatar' || activeEndpoint.name === 'Create OmniHuman avatar' ? 'Avatar settings' : activeEndpoint.name === 'Create SeeDream 4.5 image' || ['GPT Image 2.5', 'DALL-E 3'].includes(activeEndpoint.name) ? 'Image settings' : activeEndpoint.name === 'Create Motion Control video' ? 'Motion Control settings' : 'Video settings'}>
        {activeEndpoint.kind === 'model' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>{['GPT Image 2.5', 'DALL-E 3'].includes(activeEndpoint.name) ? 'Image settings' : 'Video settings'}</h2><p>{wavespeedModels[activeEndpoint.name].title}</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setModelResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <WaveSpeedModelForm key={`${activeEndpoint.name}-${modelResetKey}`} doc={wavespeedModels[activeEndpoint.name]} onPreview={setPreview}/>
        </> : activeEndpoint.name === 'Create InfiniteTalk avatar' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>Avatar settings</h2><p>อัปโหลดภาพใบหน้าและเสียงพูด</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setAvatarResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <InfiniteTalkForm key={avatarResetKey} onPreview={setPreview}/>
        </> : activeEndpoint.name === 'Create SeeDream 4.5 image' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>Image settings</h2><p>กำหนดรายละเอียดภาพที่ต้องการสร้าง</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setSeedreamResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <SeeDreamForm key={seedreamResetKey} onPreview={setPreview}/>
        </> : activeEndpoint.name === 'Create SeeDance 2.0 / Mini video' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>Video settings</h2><p>ตั้งค่า Text-to-Video หรือ Image-to-Video</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setSeedance20ResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <Seedance20Form key={seedance20ResetKey} onPreview={setPreview}/>
        </> : activeEndpoint.name === 'Create Motion Control video' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>Motion Control settings</h2><p>จับคู่ภาพตัวละครกับคลิปท่าทาง</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setMotionResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <MotionControlForm key={motionResetKey} onPreview={setPreview}/>
        </> : activeEndpoint.name === 'Create OmniHuman avatar' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>OmniHuman settings</h2><p>สร้าง Avatar ที่ซิงค์ภาพกับเสียงพูด</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setOmniResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <OmniHumanForm key={omniResetKey} onPreview={setPreview}/>
        </> : <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>Video settings</h2><p>กำหนดรายละเอียดวิดีโอของคุณ</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={reset} disabled={reading}><Icon name="reset"/></button></div>
        <form onSubmit={submit}>
          <label className="prompt-label" htmlFor="prompt">Prompt <span className="required">*</span></label>
          <div className="prompt-input"><textarea id="prompt" required value={form.prompt} onChange={e => update('prompt', e.target.value)} placeholder="อธิบายฉาก การเคลื่อนไหว แสง และบรรยากาศของวิดีโอที่คุณต้องการ…"/><div className="prompt-footer"><span>รายละเอียดที่ชัดเจนช่วยให้ได้ผลลัพธ์ที่ตรงใจ</span><span>{form.prompt.length} characters</span></div></div>
          <div className="settings-row"><Choice label="Duration" value={form.duration} options={[[ '5', '5 seconds' ], [ '10', '10 seconds' ]]} onChange={v => update('duration', v)}/><Choice label="Resolution" value={form.resolution} options={[[ '720p', '720p' ], [ '1080p', '1080p' ]]} onChange={v => update('resolution', v)}/></div>
          <Choice label="Aspect ratio" value={form.aspect_ratio} options={[[ '', 'Default' ], [ '16:9', <><span className="ratio landscape"/>16:9</> ], [ '9:16', <><span className="ratio portrait"/>9:16</> ]]} onChange={v => update('aspect_ratio', v)}/>
          <div className="audio-row"><div><label htmlFor="audio">Generate audio</label><p>สร้างเสียงประกอบไปพร้อมกับวิดีโอ</p></div><input id="audio" className="switch" type="checkbox" checked={form.generate_audio} onChange={e => update('generate_audio', e.target.checked)}/></div>
          <div className="references"><div className="section-label">Reference media <span>Optional</span></div><p className="helper">เพิ่มภาพหรือวิดีโอเพื่อใช้เป็นแนวทางในการสร้าง</p><div className="upload-grid">{['images', 'videos'].map(kind => <div key={kind}><label className={`upload-zone ${reading ? 'disabled' : ''}`}><Icon name="upload"/><strong>{kind === 'images' ? 'Add images' : 'Add videos'}</strong><span>{kind === 'images' ? 'ภาพอ้างอิง' : 'วิดีโออ้างอิง'}</span><input type="file" accept={kind === 'images' ? 'image/*' : 'video/*'} multiple disabled={reading} onChange={e => { upload(kind, e.target.files); e.target.value = '' }}/></label>{media[kind].map((item, index) => <div className="file-row" key={`${index}-${item.name}`}><span title={item.name}>{item.name}</span><button type="button" aria-label={`Remove ${item.name}`} onClick={() => setMedia(current => ({ ...current, [kind]: current[kind].filter((_, i) => i !== index) }))}><Icon name="close" width="14" height="14"/></button></div>)}</div>)}</div></div>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="form-action"><button className="primary-button" type="submit" disabled={reading}><Icon name="code"/>{reading ? 'Reading files…' : 'Preview Request'}<Icon name="arrow"/></button></div>
        </form>
        </>}
      </section>
      <section className="preview-panel" aria-label="Request preview">
        <div className="preview-heading"><div className="preview-title"><Icon name="code"/><h2>Request preview</h2></div><span className="json-badge">{['Create InfiniteTalk avatar', 'Create OmniHuman avatar', 'Create SeeDream 4.5 image', 'Create SeeDance 2.0 / Mini video', 'Create Motion Control video'].includes(activeEndpoint.name) ? 'MULTIPART' : 'JSON'}</span>{preview && <button className="copy-button" onClick={copy}><Icon name="copy" width="15" height="15"/>{copied ? 'Copied' : 'Copy'}</button>}</div>
        <div className="preview-body" aria-live="polite">{preview ? <div className="code-content"><div className="request-route"><span className="method">{activeEndpoint.method}</span><code>{activeEndpoint.path ?? 'Path not provided'}</code></div>{['Create InfiniteTalk avatar', 'Create OmniHuman avatar', 'Create SeeDream 4.5 image', 'Create SeeDance 2.0 / Mini video', 'Create Motion Control video'].includes(activeEndpoint.name) && <div className="content-type-note">Content-Type <code>multipart/form-data</code> · แสดงเฉพาะชื่อไฟล์และค่าในฟอร์ม</div>}<pre>{JSON.stringify(preview, null, 2)}</pre></div> : <div className="empty-state"><div className="preview-symbol"><Icon name="code" width="30" height="30"/></div><h3>เริ่มต้นจากไอเดียของคุณ</h3><p>กรอกรายละเอียดทางซ้าย แล้วกด Preview Request<br/>เพื่อดูข้อมูลคำขอที่นี่</p><div className="empty-flow"><span>Prompt</span><Icon name="arrow" width="16"/><span>Settings</span><Icon name="arrow" width="16"/><span>Request</span></div></div>}</div>
        <div className="preview-bottom"><span className={`status-dot ${preview ? 'ready' : ''}`}/><span>{preview ? 'Request preview ready' : 'Waiting for your input'}</span><span className="format-label">application/json</span></div>
      </section>
    </main>
  </TryItPage> : <IndexPage endpointGroups={endpointGroups} expandedGroups={expandedGroups} setExpandedGroups={setExpandedGroups} activeEndpoint={activeEndpoint} selectEndpoint={selectEndpoint} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} setTheme={setTheme}>
    <main className={`catalog-content ${['Create Seedance 2.5 video', 'Get Seedance 2.5 result'].includes(activeEndpoint.name) || endpointDocs[activeEndpoint.name] || wavespeedModels[activeEndpoint.name] ? 'has-endpoint-docs' : ''}`}>
      {activeEndpoint.name === 'Create Seedance 2.5 video' ? <article className="endpoint-docs">
        <div className="endpoint-docs-title-row"><h1>Create Seedance 2.5 video</h1><button className="markdown-copy-button" onClick={copyMarkdown}><Icon name="copy" width="15" height="15"/>{markdownCopied ? 'Copied!' : 'Copy as Markdown'}</button></div>
        <p className="endpoint-docs-description">โมเดลสร้างวิดีโอคุณภาพสูง (Flagship) รองรับ Text-to-Video, Image-to-Video (First &amp; Last frame) และ Reference Media</p>
        <TryItCallout onTry={openTryIt}/>
        <section className="endpoint-docs-section"><h2>Auth</h2><p>Authentication required.</p></section>
        <section className="endpoint-docs-section"><h2>Parameters</h2><p>No parameters.</p></section>
        <section className="endpoint-docs-section"><h2>Request Body</h2>
          <div className="endpoint-table-wrap"><table><thead><tr><th>Required</th><th>Content-Type</th><th>Shape</th></tr></thead><tbody><tr><td>Yes</td><td><code>application/json</code></td><td><code>Seedance25Request</code></td></tr></tbody></table></div>
          <div className="endpoint-table-wrap"><table><thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>
            <tr><td><code>prompt</code></td><td>string</td><td>Yes</td><td>ข้อความอธิบายวิดีโอที่ต้องการ</td></tr>
            <tr><td><code>duration</code></td><td>number</td><td>Yes</td><td>ความยาว เช่น 5 หรือ 10 วินาที</td></tr>
            <tr><td><code>resolution</code></td><td>string</td><td>Yes</td><td>"720p" หรือ "1080p"</td></tr>
            <tr><td><code>aspect_ratio</code></td><td>string</td><td>No</td><td>"16:9" หรือ "9:16"</td></tr>
            <tr><td><code>generate_audio</code></td><td>boolean</td><td>No</td><td>true หรือ false</td></tr>
            <tr><td><code>reference_images</code></td><td>string[]</td><td>No</td><td>Array ของรูปภาพแบบ Base64 Data URL</td></tr>
            <tr><td><code>reference_videos</code></td><td>string[]</td><td>No</td><td>Array ของวิดีโออ้างอิงแบบ Base64 Data URL</td></tr>
          </tbody></table></div>
        </section>
        <section className="endpoint-docs-section"><h2>Responses</h2><div className="endpoint-table-wrap"><table><thead><tr><th>Status</th><th>Description</th><th>Content-Type</th><th>Shape</th></tr></thead><tbody>
          <tr><td><strong className="response-status success">200</strong></td><td>Task submitted</td><td><code>application/json</code></td><td><code>TaskResponse</code></td></tr>
          <tr><td><strong className="response-status unauthorized">401</strong></td><td>Unauthorized</td><td><code>application/json</code></td><td><code>ErrorResponse</code></td></tr>
          <tr><td><strong className="response-status forbidden">403</strong></td><td>Insufficient credits</td><td><code>application/json</code></td><td><code>ErrorResponse</code></td></tr>
        </tbody></table></div></section>
        <section className="endpoint-docs-section"><h2>Example Response (200)</h2><pre className="endpoint-example">{`{
  "data": {
    "id": "task_seedance25_abc123",
    "status": "pending"
  }
}`}</pre></section>
      </article> : activeEndpoint.name === 'Get Seedance 2.5 result' ? <article className="endpoint-docs">
        <div className="endpoint-docs-title-row"><h1>Get Seedance 2.5 result</h1><button className="markdown-copy-button" onClick={copyMarkdown}><Icon name="copy" width="15" height="15"/>{markdownCopied ? 'Copied!' : 'Copy as Markdown'}</button></div>
        <p className="endpoint-docs-description">ตรวจสอบสถานะและดึง url_video ของ Seedance 2.5 task — ใช้ path เดียวกับ InfiniteTalk และ Motion Control</p>
        <section className="endpoint-docs-section"><h2>Auth</h2><p>Authentication required.</p></section>
        <section className="endpoint-docs-section"><h2>Parameters</h2><div className="endpoint-table-wrap"><table><thead><tr><th>Name</th><th>In</th><th>Required</th><th>Type</th><th>Description</th></tr></thead><tbody>
          <tr><td><code>id</code></td><td>path</td><td>Yes</td><td>string</td><td>Task ID ที่ได้จาก POST (field: data.id)</td></tr>
        </tbody></table></div></section>
        <section className="endpoint-docs-section"><h2>Request Body</h2><p>No request body.</p></section>
        <section className="endpoint-docs-section"><h2>Responses</h2><div className="endpoint-table-wrap"><table><thead><tr><th>Status</th><th>Description</th><th>Content-Type</th><th>Shape</th></tr></thead><tbody>
          <tr><td><strong className="response-status success">200</strong></td><td>Successful Response</td><td><code>application/json</code></td><td><code>WavespeedResultResponse</code></td></tr>
          <tr><td><strong className="response-status forbidden">404</strong></td><td>Task not found</td><td><code>application/json</code></td><td><code>ErrorResponse</code></td></tr>
        </tbody></table></div></section>
        <section className="endpoint-docs-section"><h2>Example Response (200)</h2><pre className="endpoint-example">{`{
  "data": {
    "id": "&lt;task_id&gt;",
    "status": "completed",
    "url_video": "https://storage.botnoi.ai/.../output.mp4",
    "error": ""
  }
}`}</pre><p className="endpoint-status-note">Status: <code>pending</code> | <code>processing</code> | <code>completed</code> | <code>failed</code></p></section>
      </article> : endpointDocs[activeEndpoint.name] ? <EndpointDocsPage doc={{ title: activeEndpoint.name, ...endpointDocs[activeEndpoint.name] }} markdownCopied={markdownCopied} onCopyMarkdown={copyMarkdown} onTry={openTryIt}/> : wavespeedModels[activeEndpoint.name]?.available === false ? <article className="endpoint-docs"><h1>{wavespeedModels[activeEndpoint.name].title}</h1><p className="endpoint-unavailable-note">{wavespeedModels[activeEndpoint.name].description}</p><p className="endpoint-docs-description">สามารถตรวจสอบรายการโมเดลปัจจุบันได้ที่ <a href="https://wavespeed.ai/models" target="_blank" rel="noopener noreferrer">WaveSpeedAI Models ↗</a></p></article> : wavespeedModels[activeEndpoint.name] ? <EndpointDocsPage doc={wavespeedModels[activeEndpoint.name]} markdownCopied={markdownCopied} onCopyMarkdown={copyMarkdown} onTry={openTryIt}/> : activeEndpoint.method === 'POST' && <button className="endpoint-launch-button" onClick={openTryIt}>Try it <Icon name="arrow" width="17" height="17"/></button>}
    </main>
  </IndexPage>}
  </div>
}
export default App
