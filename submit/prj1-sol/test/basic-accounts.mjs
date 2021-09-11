
import accountsWrapper from './accounts-wrapper.mjs';

import chai from 'chai';
const { expect } = chai;

describe('basic accounts', () => {

  const TEST_HOLDER = 'Test Holder';

  let accounts;
  beforeEach(() => {
    accounts = accountsWrapper();
  });
  
  it('should return account ID when creating an account', () => {
    expect(accounts.newAccount({holderId: TEST_HOLDER})).to.be.a('string');
  });
  
  it('should return BAD_REQ error when holderId is not specified', () => {
    const account = accounts.newAccount();
    expect(account).to.have.property('errors');
    expect(account.errors?.[0]?.options?.code).to.equal('BAD_REQ');
  });

  it('should create multiple accounts for the same holderId', () => {
    const id1 = accounts.newAccount({ holderId: TEST_HOLDER});
    const id2 = accounts.newAccount({ holderId: TEST_HOLDER});
    expect(id1).to.not.equal(id2);
  });

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
  
});
