-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    display_name VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password TEXT NOT NULL,
    user_id UUID DEFAULT gen_random_uuid() UNIQUE,
    user_type VARCHAR(50) CHECK (user_type IN ('patient', 'doctor', 'admin')),
    past_appointments TEXT,
    future_appointments TEXT,
    teams TEXT
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience INT NOT NULL,
    location TEXT NOT NULL,
    phone VARCHAR(20),
    doctor_id UUID DEFAULT gen_random_uuid() UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    appointment_id UUID DEFAULT gen_random_uuid() UNIQUE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    slot_id INT REFERENCES slots(slot_id) ON DELETE CASCADE,
    appointment_type VARCHAR(20) CHECK (appointment_type IN ('online', 'in-person')) NOT NULL,
    status VARCHAR(10) CHECK (status IN ('pending', 'confirmed','completed', 'cancelled')) DEFAULT 'pending',
    team_id TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--- Slots Table
CREATE TABLE IF NOT EXISTS slots (
    slot_id SERIAL PRIMARY KEY,
    doctor_id UUID REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_date DATE NOT NULL,
    slot_type VARCHAR(50),
    availability_status BOOLEAN DEFAULT TRUE
);

-- Admin Table
CREATE TABLE IF NOT EXISTS admins (
    admin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) UNIQUE NOT NULL,
    admin_phone VARCHAR(20)
);

-- Disease Categories Table
CREATE TABLE IF NOT EXISTS disease_categories (
    category_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    category_tag VARCHAR(255) NOT NULL
);


-- Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
