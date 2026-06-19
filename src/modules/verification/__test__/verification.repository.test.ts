import {
  VerificationRepository,
  clearMemoryStore,
} from "../repositories/verification.repository";

describe("VerificationRepository (memory)", () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  test("create stores and returns validation", async () => {
    const repo = new VerificationRepository();
    const input = {
      name: "John Doe",
      email: "john@example.com",
      documentNumber: "ABC123",
      selfieImage: "selfie.png",
      documentImage: "doc.png",
    };

    const created = await repo.create(input);

    expect(created.id).toBeDefined();
    expect(created.name).toBe(input.name);
    expect(created.email).toBe(input.email);
    expect(created.status).toBe("pending");
    expect(created.createdAt).toBeDefined();
    expect(created.updatedAt).toBeDefined();

    const list = await repo.list();
    expect(Array.isArray(list)).toBe(true);
    expect(list).toHaveLength(1);
  });

  test("findById returns the created validation and null for missing id", async () => {
    const repo = new VerificationRepository();
    const input = {
      name: "Jane Doe",
      email: "jane@example.com",
      documentNumber: "XYZ789",
      selfieImage: "selfie2.png",
      documentImage: "doc2.png",
    };

    const created = await repo.create(input);

    const found = await repo.findById(created.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);

    const notFound = await repo.findById("non-existent-id");
    expect(notFound).toBeNull();
  });

  test("updateStatus updates status and updatedAt", async () => {
    const repo = new VerificationRepository();
    const input = {
      name: "Update Test",
      email: "up@example.com",
      documentNumber: "UPD1",
      selfieImage: "s.png",
      documentImage: "d.png",
    };

    const created = await repo.create(input);
    const beforeUpdatedAt = created.updatedAt;

    const updated = await repo.updateStatus(created.id, "approved");
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe("approved");
    expect(updated?.updatedAt).toBeDefined();
    const beforeMs = new Date(beforeUpdatedAt).getTime();
    const afterMs = new Date(updated!.updatedAt).getTime();
    expect(afterMs).toBeGreaterThanOrEqual(beforeMs);
  });
});
