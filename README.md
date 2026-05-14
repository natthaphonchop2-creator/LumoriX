# LumoriX Website

React + Vite website สำหรับ LumoriX: next-generation energy market ที่ครอบคลุมโซลาร์ แบตเตอรี่ EV Charging, smart home, monitoring, subscription plans, lead capture และ content posting.

## Run

```bash
npm install
npm run dev -- --port 5379
```

เปิดเว็บที่ `http://localhost:5379/`

## Key Routes

- `/` หน้าแรก
- `/plans-pricing` แพ็กเกจและราคา
- `/products` ผลิตภัณฑ์
- `/free-solar-quote` เก็บ lead
- `/learn` ศูนย์เรียนรู้และบทความ
- `/go-solar-center/solar-faq` FAQ
- `/solar-by-state` landing pages รายจังหวัด
- `/company` บริษัท
- `/admin` Lead & Content Studio
- `/site-map` route library สำหรับหน้าแบบ Sunrun-equivalent

## Local Systems

- Leads เก็บใน `localStorage` key: `lumorix_leads`
- Posts เก็บใน `localStorage` key: `lumorix_posts`
- หน้า `/admin` export lead เป็น CSV และเพิ่ม/ลบโพสต์ได้

## Assets

ภาพหลักถูกสร้างเป็น bitmap assets และเก็บไว้ที่ `public/assets/`:

- `hero-smart-home.png`
- `product-ecosystem.png`
- `market-grid.png`
- `lumorix-homepage-concept.png`
