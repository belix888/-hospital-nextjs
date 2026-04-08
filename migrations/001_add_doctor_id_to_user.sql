-- Add doctorId column to User table
-- Run this in Supabase SQL Editor

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "doctorId" UUID REFERENCES "Doctor"("id");