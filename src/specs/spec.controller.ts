import * as chai from 'chai';
import { ServerError, ClientError } from '../errors/application';
import { Controller } from '../helpers/generic.controller';
import { expectError } from '../helpers/spec.helper';

const expect: Chai.ExpectStatic = chai.expect;
const TOTAL_ITEMS = 4;
const validMongoId = '000000000000000000000000';
const invalidMongoID = 'BAD_ID';

export function runTests(controller: Controller<any>) {
  let testItems;
  describe(`Generic test type ${controller.controllerType}`, () => {

    before(() => {
      testItems = controller.createItems(TOTAL_ITEMS);
    });

    beforeEach(async () => {
      await controller.model.remove({}, (err: Error) => { });
      await Promise.all(testItems.map(item => controller.add(item)));
    });

    describe('#getById', () => {
      it('should return an item by its id', async () => {
        const item = await controller.getById(testItems[0]._id);
        expect(testItems[0]._id + '').to.be.equal(item._id + '');
      });
      it('should throw 404 error when id not found', async () => {
        const error = await expectError(controller.getById, [validMongoId]);
        expect(error).to.exist;
        expect(error).to.be.instanceof(ClientError);
        expect(error.status).to.be.equal(404);
      });
      it.skip('should throw 422 error when BAD_ID', async () => {
        const error = await expectError(controller.getById, [invalidMongoID]);
        expect(error).to.exist;
        expect(error).to.be.instanceof(ClientError);
        expect(error.status).to.be.equal(422);
      });
    });

    describe('#getAll', () => {
      it(`should return a collection with ${TOTAL_ITEMS} items`, async () => {
        const itemsReturned = await controller.getAll();
        expect(itemsReturned).to.not.be.empty;
        expect(itemsReturned).to.have.lengthOf(testItems.length);
      });
    });

    describe('#add', () => {
      it('should add a new item to the collection', async () => {
        const item = controller.createItems(1)[0];
        await controller.add(item);
        const itemsReturned = await controller.getAll();
        expect(itemsReturned).to.not.be.empty;
        expect(itemsReturned).to.have.lengthOf(testItems.length + 1);
      });
      it('should throw ServerError when trying to add new item with existed id', async () => {
        const error = await expectError(controller.add, [testItems[0]]);
        expect(error).to.exist;
        expect(error).to.be.instanceof(ServerError);
      });
    });

    describe('#deleteById', () => {
      it('should delete a single item', async () => {
        await controller.deleteById(testItems[0]._id);
        const itemsReturned = await controller.getAll();
        expect(itemsReturned).to.have.lengthOf(TOTAL_ITEMS - 1);
      });
      it('should throw NotFoundError for trying to delete non-existent item', async () => {
        const error = await expectError(controller.deleteById, [validMongoId]);
        expect(error).to.exist;
        expect(error).to.be.instanceof(ClientError);
        expect(error.status).to.be.equal(404);
      });
      it.skip('should throw ServerError for trying to delete BAD_ID item', async () => {
        const error = await expectError(controller.deleteById, ['!@#% ~`#^$^*&^*( *).,/']);
        expect(error).to.exist;
        expect(error).to.be.instanceof(ServerError);
      });
    });

    describe('#update', () => {
      it('should update the name of the item', async () => {
        await controller.update(testItems[0]._id, { _id: testItems[0]._id, name: 'newName' });
        const updatedUser = await controller.getById(testItems[0]._id);
        expect(updatedUser.name).to.be.equal('newName');
      });
      it('should throw 404 error when trying to update a non-existent item', async () => {
        const error = await expectError(controller.update, [validMongoId, { name: 'ErrorName' }]);
        expect(error).to.exist;
        expect(error).to.be.instanceof(ClientError);
        expect(error.status).to.be.equal(404);
      });
      it('should throw 422 error when trying to update an item with a BAD_ID', async () => {
        const error = await expectError(controller.update, [invalidMongoID, { name: 'ErrorName' }]);
        expect(error).to.exist;
        expect(error).to.be.instanceof(ClientError);
        expect(error.status).to.be.equal(422);
      });
      it('should throw exception when trying to update a wrong item', async () => {
        const error = await expectError(controller.update, [invalidMongoID, { _id: 'badId', name: 'ErrorName' }]);
        expect(error).to.exist;
        expect(error).to.be.instanceof(ClientError);
        expect(error.status).to.be.equal(422);
      });
    });

  });
}
