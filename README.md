# Botnoi API Try it prototype

ต้นแบบหน้า Try it แบบแยกหน้า รองรับการเปิดฟอร์มโดยตรงจากปุ่มบนหน้าเอกสารผ่าน endpoint slug ใน URL hash ไม่มีการส่ง request ไป API จริง

## เปิดใช้งานในเครื่อง

```bash
npm install
npm run dev
```

## เตรียมลิงก์สำหรับปุ่ม Try it บนหน้าเอกสาร

เมื่อ deploy ต้นแบบแล้ว ให้ปุ่มบน endpoint ใช้ URL รูปแบบนี้และเปิดแท็บใหม่:

```html
<a href="{TRY_IT_APP_URL}/#/try-it-now/{endpoint-slug}" target="_blank" rel="noopener noreferrer">
  Try it
</a>
```

แทน `{TRY_IT_APP_URL}` ด้วย URL ที่ deploy แล้ว และใช้ slug จากตารางนี้:

| Endpoint | Slug |
| --- | --- |
| Create Seedance 2.5 video | `create-seedance-2-5-video` |
| Create SeeDance 2.0 / Mini video | `create-seedance-2-0-mini-video` |
| Create Motion Control video | `create-motion-control-video` |
| Create InfiniteTalk avatar | `create-infinitetalk-avatar` |
| Create OmniHuman avatar | `create-omnihuman-avatar` |
| Create SeeDream 4.5 image | `create-seedream-4-5-image` |

หน้า Try it อ่าน slug จาก URL และเปิดฟอร์มของ endpoint นั้นโดยตรง ปุ่ม Back ใช้กลับไปยังหน้าเอกสารเดิม ส่วน GET ยังไม่มีหน้า Try it

## ตรวจโปรเจกต์

```bash
npm run build
npm run lint
```

ฟอร์มและ Preview ในโปรเจกต์นี้เป็น UI prototype ยังไม่เรียก API จริง
