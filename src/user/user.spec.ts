import { IUser } from './user.interface';
import * as chai from 'chai';
import * as mongoose from 'mongoose';
import { UserController } from './user.controller';
import { createUsers } from '../helpers/functions';
import { userModel } from './user.model';
import { config } from '../config';
import { ERRORS } from '../helpers/enums';

const expect = chai.expect;
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

const TOTAL_USERS: number = 4;
const testUsers: IUser[] = createUsers(TOTAL_USERS);
const newName: string = 'shamanTheKing';

let numberOfUsers = TOTAL_USERS;

before(() => {
  (<any>mongoose).Promise = global.Promise;
  mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`);
});

beforeEach(async () => {
  userModel.remove({}, (err) => { });
  await Promise.all(testUsers.map(user => UserController.add(user)));
});

describe(`Test Users with ${TOTAL_USERS} users`, () => {

  describe('#getById', () => {
    it(`should return a user by its id`, async () => {
      const user: IUser = await UserController.getById(testUsers[0]._id);
      expect(testUsers[0].equals(user)).to.be.true;
    });
  });

  describe('#getAll', () => {
    it(`should return a collection with ${TOTAL_USERS} users`, async () => {
      const usersReturned = await UserController.getAll();
      expect(usersReturned).to.not.be.empty;
      expect(usersReturned).to.have.lengthOf(testUsers.length);
    });
  });

  describe('#add', () => {
    it(`should add a new user to the collection`, async () => {
      const user: IUser = createUsers(1)[0];
      await UserController.add(user);
      const usersReturned = await UserController.getAll();
      expect(usersReturned).to.not.be.empty;
      expect(usersReturned).to.have.lengthOf(testUsers.length + 1);
    });
    it(`should throw exception when trying to add new user with existed id`, async () => {
      await expect(UserController.add(testUsers[0]))
        .to.eventually.be.rejectedWith(ERRORS.USER_EXISTS);
    });
  });

  describe('#deleteById', () => {
    it('should delete a single user', async () => {
      await UserController.deleteById(testUsers[0]._id);
      await expect(UserController.getById(testUsers[0]._id))
        .to.eventually.be.rejectedWith(ERRORS.NOT_EXIST);
      const usersReturned: IUser[] = await UserController.getAll();
      numberOfUsers--;
      expect(usersReturned).to.have.lengthOf(numberOfUsers);
    });
  });

  describe('#update', () => {
    it(`should update half (${Math.floor(testUsers.length / 2)}) of the names`, async () => {
      for (let i = 0; i < Math.floor(testUsers.length / 2); i++) {
        await UserController.update(testUsers[i]._id, { _id: testUsers[i]._id, name: newName });
      }
      const updatedUser: IUser = await UserController.getById(testUsers[0]._id);
      expect(updatedUser.name).to.be.equal(newName);
    });
    it(`should throw exception when trying to update a non-existent user`, async () => {
      await expect(UserController.update('non_existent_id', { name: 'ErrorName' }))
        .to.eventually.be.rejectedWith(ERRORS.NOT_EXIST);
    });
  });

  describe('#getByName', () => {
    it('should get all users with the same name', async () => {
      for (let i = 0; i < Math.floor(testUsers.length / 2); i++) {
        await UserController.update(testUsers[i]._id, { _id: testUsers[i]._id, name: newName });
      }
      const users: IUser[] = await UserController.getByName(newName);
      users.sort(sortUserBy_id);
      expect(users.length).to.be.equal(Math.floor(testUsers.length / 2));
      for (let i = 0; i < users.length; i++) {
        expect(users[i].name).to.be.equal(newName);
        expect(users[i]._id).to.be.equal(testUsers[i]._id);
      }
    });
  });

});

after((done) => {
  mongoose.disconnect();
  done();
});

function sortUserBy_id(user1: IUser, user2: IUser) {
  if (user1._id > user2._id) {
    return 1;
  }
  if (user1._id < user2._id) {
    return -1;
  }
  return 0;
}
