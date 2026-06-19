import { VerificationRepository } from "../repositories/verification.repository";
import type {
  CreateValidationInput,
  KycValidation,
} from "../../../domain/types";

export class VerificationService {
  repository: VerificationRepository;

  constructor(db?: D1Database) {
    this.repository = new VerificationRepository(db);
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
