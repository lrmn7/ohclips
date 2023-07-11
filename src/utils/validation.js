import {
  required,
  email,
  min,
  max,
  confirmed,
  mimes,
  size,
} from "@vee-validate/rules";
import { defineRule, configure } from "vee-validate";

const loginForm = {
  schema: {
    email: "required|email",
    password: "required|min:6",
  },
  definitions: () => {
    defineRule("required", required);
    defineRule("email", email);
    defineRule("min", min);
  },
};

const registerForm = {
  schema: {
    username: "required|min:3|max:20",
    email: "required|email",
    password: "required|min:6|max:50",
    password_confirmation: "required|confirmed:@password",
  },
  definitions: () => {
    defineRule("required", required);
    defineRule("email", email);
    defineRule("min", min);
    defineRule("max", max);
    defineRule("confirmed", confirmed);
  },
};

const uploadForm = {
  schema: {
    Title: "required|min:3|max:40",
    Game: "required|min:3|isGame",
    File: "required|mimes:mp4,mov|size:100000",
  },
  definitions: (gamesList) => {
    defineRule("required", required);
    defineRule("min", min);
    defineRule("max", max);
    defineRule("mimes", mimes);
    defineRule("size", size);
    defineRule("isGame", (value) => {
      return gamesList.includes(value);
    });
  },
};

const commentForm = {
  schema: {
    Comment: "required|min:3|max:200",
  },
  definitions: () => {
    defineRule("required", required);
    defineRule("min", min);
    defineRule("max", max);
  },
};

// Export configure function with custom generateMessage to use in the component
const configureVeeValidate = () => {
  configure({
    generateMessage: (ctx) => {
      const messages = {
        required: `${ctx.field} is required`,
        email: `email is not a valid one`,
        min: `${ctx.field} is too short`,
        max: `${ctx.field} is too long`,
        confirmed: `password does not match`,
        mimes: `File type is not supported`,
        size: `File size is too large`,
        isGame: `Game is not supported`,
      };

      const message = messages[ctx.rule.name]
        ? messages[ctx.rule.name]
        : `The field ${ctx.field} is invalid`;

      return message;
    },
  });
};

export {
  loginForm,
  registerForm,
  configureVeeValidate,
  uploadForm,
  commentForm,
};
