import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user';

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  // Get part after // and before : (in case port number in URL)
  domain: process.env.BASE_URL.split('//')[1].split(':')[0],
  httpOnly: true,
  path: '/',
  sameSite: true,
  secure: !!process.env.BASE_URL.includes('https'),
};

const resolvers = {
  Mutation: {
    registerUser: async (parent, { email, name, password }, { setCookies }) => {
      const foundUser = await User.findOne({ email });
      if (foundUser) throw new Error('Email already registered');

      const passwordSalt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, passwordSalt);

      const refreshToken = uuidv4();
      const refreshTokenExpiry = new Date(
        Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRY) * 1000
      );

      const refreshTokenSalt = await bcrypt.genSalt(10);
      const refreshTokenHash = await bcrypt.hash(
        refreshToken,
        refreshTokenSalt
      );

      setCookies.push({
        name: 'refreshToken',
        value: refreshToken,
        options: {
          ...REFRESH_TOKEN_COOKIE_OPTIONS,
          expires: refreshTokenExpiry,
        },
      });

      const newUser = await User.create({
        email,
        name,
        passwordHash,
        refreshTokens: [{ hash: refreshTokenHash, expiry: refreshTokenExpiry }],
      });

      const payload = {
        user: {
          id: newUser._id,
        },
      };

      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(process.env.JWT_EXPIRY),
      });

      return { userId: newUser._id, token };
    },

    signInUser: async (parent, { email, password }, { setCookies }) => {
      const foundUser = await User.findOne({ email });
      if (!foundUser) throw new Error('Authentication failed.');

      const isPasswordMatch = await bcrypt.compare(
        password,
        foundUser.passwordHash
      );
      if (!isPasswordMatch) throw new Error('Authentication failed.');

      const payload = {
        user: {
          id: foundUser.id,
        },
      };
      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(process.env.JWT_EXPIRY),
      });

      const refreshToken = uuidv4();
      const refreshTokenExpiry = new Date(
        Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRY) * 1000
      );

      const salt = await bcrypt.genSalt(10);
      const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

      foundUser.refreshTokens.push({
        hash: refreshTokenHash,
        expiry: refreshTokenExpiry,
      });
      await foundUser.save();

      setCookies.push({
        name: 'refreshToken',
        value: refreshToken,
        options: {
          ...REFRESH_TOKEN_COOKIE_OPTIONS,
          expires: refreshTokenExpiry,
        },
      });

      return { userId: foundUser._id, token };
    },

    refreshUserToken: async (parent, { userId }, { req, setCookies }) => {
      const { refreshToken } = req.cookies;
      if (!refreshToken) throw new Error('No refresh token provided');

      const foundUser = await User.findById(userId);
      if (!foundUser) throw new Error('Invalid user');

      // REFRESH TOKEN VALIDATION
      let isRefreshTokenValid = false;

      foundUser.refreshTokens = foundUser.refreshTokens.filter(
        (storedToken) => {
          const isMatch = bcrypt.compareSync(refreshToken, storedToken.hash);
          const isValid = storedToken.expiry > Date.now();
          if (isMatch && isValid) {
            isRefreshTokenValid = true;
          }
          return !isMatch && isValid;
        }
      );

      if (!isRefreshTokenValid) throw new Error('Invalid refresh token');

      // ISSUING OF NEW REFRESH TOKEN
      const newRefreshToken = uuidv4();
      const newRefreshTokenExpiry = new Date(
        Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRY) * 1000
      );

      setCookies.push({
        name: 'refreshToken',
        value: newRefreshToken,
        options: {
          ...REFRESH_TOKEN_COOKIE_OPTIONS,
          expires: newRefreshTokenExpiry,
        },
      });

      const salt = await bcrypt.genSalt(10);
      const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, salt);

      foundUser.refreshTokens.push({
        hash: newRefreshTokenHash,
        expiry: newRefreshTokenExpiry,
      });

      await foundUser.save();

      // ISSUING OF NEW ACCESS TOKEN
      const payload = {
        user: {
          id: foundUser._id,
        },
      };
      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(process.env.JWT_EXPIRY),
      });

      return { userId: foundUser.id, token };
    },

    signOutUser: async (parent, { userId }, { req, setCookies }) => {
      const foundUser = await User.findById(userId);
      const { refreshToken } = req.cookies;

      // find matching token in database and filter it out
      foundUser.refreshTokens = foundUser.refreshTokens.filter(
        (storedToken) => !bcrypt.compareSync(refreshToken, storedToken.hash)
      );

      await foundUser.save();

      // Send the same cookie options as on signin but expiry in the past
      setCookies.push({
        name: 'refreshToken',
        value: req.cookies.refreshToken,
        options: {
          ...REFRESH_TOKEN_COOKIE_OPTIONS,
          expires: new Date(0),
        },
      });
      return true;
    },
  },

  Query: {
    showPrivateStuff: async (parent, args, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return '🤫 Secret private stuff';
    },
  },
};

export default resolvers;
