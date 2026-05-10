# FAT GYM - Management Platform 🏋️‍♂️

ระบบบริหารจัดการยิมระดับ Premium (Dashboard, Members, Inventory, Trainers, Complaints)

## 🚀 ขั้นตอนการติดตั้งและรันโปรเจกต์ (Local Setup)

เพื่อให้ระบบทำงานได้เหมือนเครื่องต้นฉบับ 100% กรุณาทำตามขั้นตอนดังนี้ครับ:

### 1. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจกต์แล้วรัน:
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
ก๊อปปี้ไฟล์ตัวอย่างเพื่อสร้างไฟล์ `.env` จริง:
```bash
cp .env.example .env
```

### 3. เตรียมฐานข้อมูลและข้อมูลตัวอย่าง (Database & Seeding)
รันคำสั่งนี้เพื่อสร้างตารางและสร้างข้อมูลจำลอง (เช่น Coach Mike, John Doe) ลงในเครื่อง:
```bash
npx prisma db push
npx prisma db seed
```

### 4. เริ่มรันโปรแกรม
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: [http://localhost:3000](http://localhost:3000)

---

## 🛠 ฟีเจอร์ที่พร้อมให้ทดสอบ
- **Interactive Dashboard**: สรุปยอดสมาชิกและแจ้งเตือนระบบ
- **Global Search (⌘K)**: ค้นหาทุกอย่างในระบบ (ลองหาคำว่า "Mike")
- **Member Management**: เพิ่มและจัดการสมาชิก
- **Inventory System**: ระบบตัดสต็อกสินค้าอัตโนมัติ
- **Complaints Module**: ระบบจัดการเรื่องร้องเรียนจากสมาชิก

---
**Note:** โปรเจกต์นี้ใช้ Next.js 14 (App Router) และ SQLite เป็นฐานข้อมูลเบื้องต้นเพื่อให้รันได้ง่ายที่สุดโดยไม่ต้องติดตั้ง Database เพิ่มเติม
