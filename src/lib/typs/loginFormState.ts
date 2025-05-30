export type LoginFormState = {
  errors: {
    username?: string[];
    password?: string[];
    general?: string[];
  };
  success: boolean;
};
