import { VerificationRepository } from "../repositories/verification.repository";
import type {
  CreateValidationInput,
  KycValidation,
} from "../../../domain/types";

// The service now receives the full Worker Env so repositories can access D1 bindings.
export class VerificationService {
  repository: VerificationRepository;

  constructor(env?: Env) {
    this.repository = new VerificationRepository(env);
  }

  async create(input: CreateValidationInput): Promise<KycValidation> {
    return this.repository.create(input);
  }

  async list(): Promise<KycValidation[]> {
    return this.repository.list();
  }

  async findById(id: string): Promise<KycValidation | null> {
    return this.repository.findById(id);
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<KycValidation | null> {
    return this.repository.updateStatus(id, status as any);
  }
}
