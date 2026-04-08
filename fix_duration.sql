-- Полный сброс durationMinutes для всех записей
-- Выполни этот запрос в Supabase SQL Editor

-- Сбросить все записи где durationMinutes больше 120 минут на 60
UPDATE "Appointment" 
SET "durationMinutes" = 60 
WHERE "durationMinutes" > 120;

-- Проверить текущие значения
SELECT id, "appointmentDate", "appointmentTime", "durationMinutes" 
FROM "Appointment" 
ORDER BY "appointmentDate" DESC, "appointmentTime" DESC
LIMIT 20;