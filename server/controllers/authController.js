const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { isValidEmail } = require('../utils/validateEmail');
const { validatePassword, validateEmailFormat } = require('../utils/passwordValidator');
const { sendVerificationEmail } = require('../utils/sendEmail');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generate a new secure verification token and expiry.
 * Returns { token (plain), hashedToken, expire }
 */
function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h
  return { token, expire };
}

/**
 * Construct the frontend verification link matching the route registered in App.jsx: /verify-email/:token
 */
function getClientVerificationUrl(token) {
  const rawUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.protocol}//${parsed.host}/verify-email/${token}`;
  } catch {
    const cleanUrl = rawUrl.replace(/\/+$/, '').replace(/\/properties$/, '');
    return `${cleanUrl}/verify-email/${token}`;
  }
}

// ─── Register ────────────────────────────────────────────────────────────────

// @desc    Register a new user (Customer or Owner) — sends verification email
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    // 1. Email Format & DNS MX validation
    const emailCheck = await isValidEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid, existing email address.',
      });
    }

    // 2. Strong Password validation
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.message,
        errors: passwordCheck.errors,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 3. Generate verification token
    const { token: verificationToken, expire: verificationTokenExpire } = generateVerificationToken();

    // Restrict admin self-registration
    const validRoles = ['customer', 'owner'];
    const assignedRole = validRoles.includes(role) ? role : 'customer';

    // 4. Create user (unverified)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
      phone: phone || '',
      bio: bio || '',
      isVerified: false,
      verificationToken,
      verificationTokenExpire,
    });

    // 5. Send verification email
    const verificationLink = getClientVerificationUrl(verificationToken);
    let emailSent = true;

    try {
      await sendVerificationEmail(normalizedEmail, verificationLink);
    } catch (emailErr) {
      console.error('[Email Error] Could not send verification email:', emailErr.message);
      emailSent = false;
    }

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      emailSent,
      message: emailSent
        ? `Account created! We sent a verification link to ${normalizedEmail}. Please check your inbox (and spam folder) to activate your account.`
        : `Account created, but we couldn't send the verification email. Please use the "Resend Verification" option below.`,
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Verify Email ─────────────────────────────────────────────────────────────

// @desc    Verify user email via token from link
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is missing.' });
    }

    const user = await User.findOne({
      verificationToken: token,
    }).select('+verificationToken +verificationTokenExpire');

    // No user found by this token at all → genuinely invalid/tampered link
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This verification link is invalid or has expired.',
      });
    }

    // Token found but account is already verified → friendly second-click response
    if (user.isVerified) {
      return res.json({
        success: true,
        alreadyVerified: true,
        message: 'Your email is already verified. You can log in now.',
      });
    }

    // Token found, not yet verified — check expiry
    if (user.verificationTokenExpire < new Date()) {
      return res.status(400).json({
        success: false,
        expired: true,
        message: 'This verification link has expired. Please request a new one.',
        email: user.email,
      });
    }

    // First-time verification — mark as verified but KEEP the token stored
    // so that repeated clicks on the same link still find this user above
    user.isVerified = true;
    await user.save();

    return res.json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Resend Verification ──────────────────────────────────────────────────────

// @desc    Resend verification email (max 3 per email per hour)
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select('+verificationToken +verificationTokenExpire +resendCount +resendWindowStart');

    if (!user) {
      // Respond ambiguously to prevent user enumeration
      return res.json({
        success: true,
        message: 'If that email has an unverified account, a new verification link has been sent.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This account is already verified.' });
    }

    // Rate limiting: max 3 resend requests per 1 hour
    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();
    const windowStart = user.resendWindowStart ? user.resendWindowStart.getTime() : 0;

    if (now - windowStart < ONE_HOUR) {
      if (user.resendCount >= 3) {
        const minutesLeft = Math.ceil((ONE_HOUR - (now - windowStart)) / 60000);
        return res.status(429).json({
          success: false,
          message: `Too many resend attempts. Please wait ${minutesLeft} minute(s) before trying again.`,
        });
      }
      user.resendCount += 1;
    } else {
      // Reset window
      user.resendCount = 1;
      user.resendWindowStart = new Date(now);
    }

    // Issue fresh token
    const { token: newToken, expire: newExpire } = generateVerificationToken();
    user.verificationToken = newToken;
    user.verificationTokenExpire = newExpire;
    await user.save();

    const verificationLink = getClientVerificationUrl(newToken);
    await sendVerificationEmail(user.email, verificationLink);

    return res.json({
      success: true,
      message: `A new verification link has been sent to ${user.email}. Please check your inbox.`,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    if (!validateEmailFormat(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been disabled. Please contact support.',
      });
    }

    // Block login if email not yet verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message:
          'Please verify your email before logging in. Check your inbox for the verification link.',
        email: user.email,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ────────────────────────────────────────────────────────────────────

// @desc    Logout user / clear client token state
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, bio, avatar } = req.body;
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  getMe,
  logoutUser,
  updateProfile,
};
