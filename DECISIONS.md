# Decisions

## การใช้ AI

ใช้ AI เฉพาะช่วงที่ logic ซับซ้อน ไม่ได้ให้สร้างทั้งโปรเจกต์

- **เครื่องมือ:** Cursor
- **โมเดล:** Grok 4.6
- **สัดส่วนโดยประมาณ:** ไม่เกิน 40% ของโค้ดโปรเจกต์ โดยส่วนใหญ่เป็นฟังก์ชันคำนวณ/จัดการ state ที่วางโครงไว้แล้ว

โครงหน้า, types, UI, routing, และ markup ของตารางทำเอง จากนั้นให้ AI ช่วยเติมเฉพาะจุดที่ยาก

### ส่วนที่ใช้ AI ช่วย

- `src/data/missions.ts` — helper เติม mock data: `createWaypoints()`, `createTelemetryHistory()`, `pad()`, `lerp()`
- `src/hooks/useDebouncedValue.ts` — debounce ค่าค้นหา 400 ms พร้อม `clearTimeout`
- `src/components/missions/MissionList.tsx` — pipeline กรอง → เรียงวันที่ → แบ่งหน้า และซิงก์ `q` / `status` / `sort` / `page` กับ URL
- `src/components/missions/MissionChart.tsx` — คำนวณจุด polyline ของกราฟแบตเตอรี่บน SVG
- `src/components/missions/TelemetryPanel.tsx` — `setInterval` 1500 ms, อัปเดตค่าจำลอง, และ `clearInterval` ตอน unmount
- `src/components/forms/MissionForm.tsx` — `validate()` ของชื่อ, drone, วันที่, notes, และ waypoint

### ส่วนที่ทำเอง

- types, รายการ drone, โครง mock 40 รายการ
- หน้า `/missions`, detail, create, edit และข้อความ empty / not found
- `MissionTable` markup, `aria-sort`, sticky header, การ์ดมือถือ
- ฟอร์ม (field, waypoint เพิ่ม/ลบ, ปุ่ม Save/Cancel)
- mock API delay 500 ms และ `?error=true`
- สไตล์ Tailwind และการจัด layout แบบ responsive

### สิ่งที่รับมาใช้

รับเฉพาะโค้ดช่วงที่ขอให้ช่วย แล้วนำมาประกอบกับโครงที่วางไว้ ไม่ได้ใช้โค้ดทั้งโปรเจกต์จาก AI โดยไม่ตรวจ

## 2026-09-15 — Mock data ใน `src/data/missions.ts`

โครงไฟล์ทำเอง: import, `statuses` / `missionNames`, โครง `createMockMission(index)`, และการ export `missions` จำนวน 40 รายการ

AI เติมเฉพาะช่อง TODO ใน `createMockMission` และ helper ที่ใช้สร้างข้อมูล mock

## 2026-09-15 — Component ข้อ 6: Data Table

เลือก Data Table เป็นองค์ประกอบหลักของ dashboard เพราะหน้า `/missions` ต้องแสดงรายการภารกิจจำนวนมาก และต้องการ semantic HTML (`table` / `th` / `aria-sort`) พร้อมการเรียง Flight date และการเข้าถึงด้วยคีย์บอร์ด โดยเขียนด้วย React/HTML/Tailwind เอง ไม่พึ่ง table library
