import UserService from "../../../subgraphs/user/services/user.service";
import UserRepo from "../../../subgraphs/user/repos/user.repo";
import { IUserDB } from "../../../subgraphs/user/models/user.model";
import { UserInputError } from "../../../infrastructure/utils/errors";
import { Role } from "../../../shared/types/role";
import { Types } from "mongoose";
import permissionService from "@/security/permission.service";

jest.mock("../../../subgraphs/user/repos/user.repo");

describe("UserService.findByEmail", () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<UserRepo>;
  let mockPermissionService: any;

  const createMockUserDB = (): IUserDB & { _id: Types.ObjectId,__v:number }  => ({
    _id: new Types.ObjectId(),// オブジェクト リテラルは既知のプロパティのみ指定できます。'_id' は型 'IUserDB' に存在しません。
    __v: 0,
    profile: {
      UserId: "profile-id",
      email: "test@example.com",
      name: "Test User",
      avatar: "avatar.png",
    },
    role: Role.USER,
    status: "ACTIVE",
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
    } as any;

    mockPermissionService = {
      checkPermission: jest.fn(),
      hasRole: jest.fn(),
      authorize: jest.fn(),
    };

    userService = new UserService(
      mockUserRepo,
      mockPermissionService
    );
  });

  it("should return mapped user when exists", async () => {
    const dbUser = createMockUserDB();

    mockUserRepo.findByEmail.mockResolvedValue(dbUser);

    const result = await userService.findByEmail("test@example.com");

    expect(result).not.toBeNull();
    expect(result?.id).toBe(dbUser._id.toString());// プロパティ 'id' は型 'IUserDB' に存在しません。
    expect(result?.profile.email).toBe("test@example.com");
  });
});

