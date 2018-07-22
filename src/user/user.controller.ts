/**
 * The middleware between the router and the DB querying.
 * Handles the logic of the requests.
 */
import * as UserErrors from '../errors/user';
import { ServerError } from '../errors/application';
import { IUser } from './user.interface';
import { userModel } from './user.model';
import { UserService } from './user.service';
import { UserValidator } from './user.validator';

const isValidUpdate: (id: string, partialUser: Partial<IUser>) => boolean = UserValidator.isValidUpdate;
export class UserController {
  public static async getById(id: string): Promise<IUser> {
    const user: IUser = await UserService.getById(id);
    if (user) {
      return user;
    }
    throw new UserErrors.UserNotFoundError();
  }

  public static getByName(name: String): Promise<IUser[]> {
    return UserService.getByName(name);
  }

  public static async update(id: string, partialUser: Partial<IUser>): Promise<IUser> {
    if (!isValidUpdate(id, partialUser)) {
      throw new UserErrors.BadIdError();
    }
    const updatedUser: IUser = await UserService.update(partialUser._id, partialUser);
    if (updatedUser) {
      return updatedUser;
    }
    throw new UserErrors.UserNotFoundError();
  }

  public static getAll(): Promise<IUser[]> {
    return UserService.getAll();
  }

  public static async add(reqUser: IUser): Promise<IUser> {
    const newUser: IUser = new userModel(reqUser);
    return await UserService.add(newUser);
  }

  public static async deleteById(id: string) {
    const res = await UserService.deleteById(id);
    if (!res.ok) {
      throw new ServerError();
    } else if (res.n < 1) {
      throw new UserErrors.UserNotFoundError();
    }
    return res;
  }
}
