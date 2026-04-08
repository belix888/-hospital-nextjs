-- Create Doctor table
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

-- Create Patient table
CREATE TABLE IF NOT EXISTS "Patient" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50) NOT NULL,
  "birthDate" DATE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Room table
CREATE TABLE IF NOT EXISTS "Room" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "isAvailable" BOOLEAN DEFAULT true,
  "isDeleted" BOOLEAN DEFAULT false,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Appointment table
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

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255),
  "role" VARCHAR(50) DEFAULT 'user',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Insert sample doctors
INSERT INTO "Doctor" ("name", "specialization", "phone", "email") VALUES
('Иванов Иван Иванович', 'Терапевт', '+7 999 123-45-67', 'ivanov@hospital.ru'),
('Петрова Анна Сергеевна', 'Кардиолог', '+7 999 234-56-78', 'petrova@hospital.ru'),
('Сидоров Алексей Петрович', 'Хирург', '+7 999 345-67-89', 'sidorov@hospital.ru')
ON CONFLICT DO NOTHING;

-- Create default admin user
INSERT INTO "User" (email, password, name, role) VALUES
('admin@hospital.ru', 'admin123', 'Администратор', 'admin')
ON CONFLICT DO NOTHING;

-- Insert sample rooms
INSERT INTO "Room" ("name", "isAvailable") VALUES
('Кабинет 1', true),
('Кабинет 2', true),
('Кабинет 3', true),
('Кабинет 4', true),
('Кабинет 5', true)
ON CONFLICT DO NOTHING;