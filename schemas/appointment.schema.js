/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         appointment_id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the appointment
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: ID of the user who booked the appointment
 *         doctor_id:
 *           type: string
 *           format: uuid
 *           description: ID of the doctor
 *         slot_id:
 *           type: integer
 *           description: ID of the time slot
 *         appointment_type:
 *           type: string
 *           enum: [online, in-person]
 *           description: Type of appointment
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *           description: Current status of the appointment
 *         appointment_date:
 *           type: string
 *           format: date
 *           description: Date of the appointment
 *         appointment_time:
 *           type: string
 *           format: time
 *           description: Time of the appointment
 *         patient_name:
 *           type: string
 *           description: Name of the patient
 *         phone_number:
 *           type: string
 *           description: Patient's phone number
 *         patient_email:
 *           type: string
 *           format: email
 *           description: Patient's email address
 *         patient_gender:
 *           type: string
 *           description: Patient's gender
 *         patient_age:
 *           type: integer
 *           description: Patient's age
 *         health_description:
 *           type: string
 *           description: Description of health condition
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the appointment was created
 *       required:
 *         - appointment_id
 *         - user_id
 *         - doctor_id
 *         - appointment_type
 *         - status
 *         - appointment_date
 *         - appointment_time
 *         - patient_name
 *         - phone_number
 *         - patient_email
 *         - patient_gender
 *         - patient_age
 *         - health_description
 *         - created_at
 * 
 *     Slot:
 *       type: object
 *       properties:
 *         slot_id:
 *           type: integer
 *           description: Unique identifier for the slot
 *         doctor_id:
 *           type: string
 *           format: uuid
 *           description: ID of the doctor
 *         start_time:
 *           type: string
 *           format: time
 *           description: Start time of the slot
 *         end_time:
 *           type: string
 *           format: time
 *           description: End time of the slot
 *         slot_date:
 *           type: string
 *           format: date
 *           description: Date of the slot
 *         slot_type:
 *           type: string
 *           description: Type of slot
 *         availability_status:
 *           type: boolean
 *           description: Whether the slot is available
 *       required:
 *         - slot_id
 *         - doctor_id
 *         - start_time
 *         - end_time
 *         - slot_date
 *         - slot_type
 *         - availability_status
 */ 