import { VerificationService } from "../services/verification.service";
import { clearMemoryStore } from "../repositories/verification.repository";

describe("VerificationService (memory)", () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  test("create and list via service", async () => {
    const service = new VerificationService();
    const input = {
      name: "Service User",
      email: "service@example.com",
      documentNumber: "SVC1",
      selfieImage: "s.png",
      documentImage: "d.png",
    };

    const created = await service.create(input);
    expect(created).toHaveProperty("id");
    expect(created.status).toBe("pending");

    const all = await service.list();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBe(1);
  });

  test("findById and updateStatus via service", async () => {
    const service = new VerificationService();
    const input = {
      name: "Find User",
      email: "find@example.com",
      documentNumber: "FND1",
      selfieImage: "s2.png",
      documentImage: "d2.png",
    };

    const created = await service.create(input);

    const found = await service.findById(created.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);

    const updated = await service.updateStatus(created.id, "approved");
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe("approved");
  });
});
