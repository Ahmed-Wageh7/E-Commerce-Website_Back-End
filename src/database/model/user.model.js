import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    phone: {
      type: String,
      trim: true,
      default: null
    },
    avatar: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ["user", "admin", "staff"],
      default: "user"
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpiresAt;
        return ret;
      }
    }
  }
);

userSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const excludeDeletedUsers = function excludeDeletedUsers(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
};

userSchema.pre("find", excludeDeletedUsers);
userSchema.pre("findOne", excludeDeletedUsers);
userSchema.pre("countDocuments", excludeDeletedUsers);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
