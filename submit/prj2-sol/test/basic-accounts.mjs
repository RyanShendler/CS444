//account services will use the DAO being built for this project
import { makeAccountsServices } from '../src/accounts-services.mjs';

//will run the project DAO using an in-memory mongodb server
import AccountsDao from './mem-accounts-dao.mjs';

import chai from 'chai';
const { expect } = chai;

describe('basic accounts', () => {

  const TEST_HOLDER = 'Test Holder';

  //mocha will run beforeEach() before each test to set up these variables
  let accounts, dao;
  beforeEach(async function () {
    dao = await AccountsDao.setup();
    accounts = makeAccountsServices(dao);
  });

  //mocha runs this after each test; we use this to clean up the DAO.
  afterEach(async function () {
    await AccountsDao.tearDown(dao);
  });
  
  it('should return account ID when creating an account', async () => {
    const ret = await accounts.newAccount({holderId: TEST_HOLDER});
   expect(ret).to.be.a('string');
  });
  
  it('should return BAD_REQ error when holderId is not specified', async () => {
    const account = await accounts.newAccount();
    expect(account).to.have.property('errors');
    expect(account.errors?.[0]?.options?.code).to.equal('BAD_REQ');
  });

  it('should create multiple accounts for the same holderId', async () => {
    const id1 = await accounts.newAccount({ holderId: TEST_HOLDER});
    const id2 = await accounts.newAccount({ holderId: TEST_HOLDER});
    expect(id1).to.not.equal(id2);
  });

  /* TODO: replace these synchronous project 1 tests with
     async tests suitable for this project.

  it('should retrieve a created account', () => {
    const id = accounts.newAccount({ holderId: TEST_HOLDER});
    expect(accounts.info({id})).to.not.be.undefined.and.not.be.null;
    expect(accounts.info({id}).id).to.equal(id);    
  });

  it('should have correct holderId when retrieving a account', () => {
    const id = accounts.newAccount({ holderId: TEST_HOLDER});
    expect(accounts.info({id}).holderId).to.equal(TEST_HOLDER);
  });

  it('should have a 0 balance when retrieving a newly created account', () => {
    const id = accounts.newAccount({ holderId: TEST_HOLDER});
    expect(accounts.info({id}).balance).to.equal(0);
  });

  it('should return NOT_FOUND error when retrieving by bad account ID', () => {
    const id = accounts.newAccount({ holderId: TEST_HOLDER});
    expect(accounts.info({id: id + 'x'})).to.have.property('errors');
    expect(accounts.info({id: id + 'x'})?.errors?.[0]?.options?.code).
      to.equal('NOT_FOUND');
  });
  */ 

  
});

