const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema representing students, faculty, club leads, and admins
const UserSchema = new mongoose.Schema({
  // Full name of the user
  Name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  // Official college email address, used for login and notifications
  CollegeEmail: {
    type: String,
    required: [true, 'College email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  },
  // Hashed password for security
  Password: {
    type: String,
    required: [true, 'Password is required']
  },
  // Official registration number (for students) or employee/staff ID (for faculty/admins)
  IDNumber: {
    type: String,
    required: [true, 'ID Number is required'],
    trim: true,
    unique: true
  },
  // Academic department the user belongs to (e.g., 'CSE', 'ECE', 'Mechanical')
  Department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  // User role that determines authorization and permissions on the campus notice board
  Role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['student', 'faculty', 'club_lead', 'admin'],
    default: 'student'
  }
}, {
  // Automatically add createdAt and updatedAt timestamp fields
  timestamps: true
});

// Pre-save hook to hash passwords automatically before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('Password')) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

module.exports = mongoose.model('User', UserSchema);
