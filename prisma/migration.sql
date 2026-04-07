-- Create tables for hospital database

-- Doctor table
CREATE TABLE IF NOT EXISTS "Doctor" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "specialization" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50),
  "email" VARCHAR(255),
  "telegramId" BIGINT UNIQUE,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Patient table
CREATE TABLE IF NOT EXISTS "Patient" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50) NOT NULL,
  "birthDate" DATE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Room table
CREATE TABLE IF NOT EXISTS "Room" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "isAvailable" BOOLEAN DEFAULT true,
  "isDeleted" BOOLEAN DEFAULT false,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Appointment table
CREATE TABLE IF NOT EXISTS "Appointment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "doctorId" UUID NOT NULL REFERENCES "Doctor"("id"),
  "patientId" UUID NOT NULL REFERENCES "Patient"("id"),
  "roomId" UUID NOT NULL REFERENCES "Room"("id"),
  "appointmentDate" DATE NOT NULL,
  "appointmentTime" TIMESTAMP NOT NULL,
  "durationMinutes" INTEGER DEFAULT 60,
  "status" VARCHAR(50) DEFAULT 'scheduled',
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointment_date ON "Appointment"("appointmentDate");
CREATE INDEX IF NOT EXISTS idx_appointment_doctor_date ON "Appointment"("doctorId", "appointmentDate");

-- Insert sample data
INSERT INTO "Doctor" ("name", "specialization", "phone", "email") VALUES
  ('Иванов Иван Иванович', 'Терапевт', '+7 999 123-45-67', 'ivanov@hospital.ru'),
  ('Петрова Анна Сергеевна', 'Кардиолог', '+7 999 234-56-78', 'petrova@hospital.ru'),
  ('Сидоров Алексей Петрович', 'Хирург', '+7 999 345-67-89', 'sidorov@hospital.ru')
ON CONFLICT DO NOTHING;

INSERT INTO "Room" ("name", "isAvailable") VALUES
  ('Кабинет 1', true),
  ('Кабинет 2', true),
  ('Кабинет 3', true),
  ('Кабинет 4', true),
  ('Кабинет 5', true),
  ('Кабинет 6', true)
ON CONFLICT DO NOTHING;

INSERT INTO "Patient" ("name", "phone") VALUES
  ('Клиентов Алексей', '+7 999 111-22-33'),
  ('Клиентова Мария', '+7 999 222-33-44'),
  ('Клиентов Иван', '+7 999 333-44-55')
ON CONFLICT DO NOTHING;