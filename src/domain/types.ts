export type ValidationStatus = "pending" | "approved" | "rejected";

export type KycValidation = {
  id: string;
  name: string;
  email: string;
  documentNumber: string;
  selfieImage: string;
  documentImage: string;
  status: ValidationStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateValidationInput = {
  name: string;
  email: string;
  documentNumber: string;
  selfieImage: string;
  documentImage: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
};
