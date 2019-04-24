const Bank = artifacts.require('./Bank.sol')

contract('Bank', (accounts) => {
  before(async () => {
    this.Bank = await Bank.deployed()
  })

  it('deploys successfully', async () => {
    const address = await this.Bank.address
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)
  })


  it('creates User', async () => {
  await this.Bank.createUserRequest(1,"laxman@akeo.com", "laxman", 1000);
  const result = await this.Bank.getUserInfo(1);
  console.log("RESULT", result);
  const amount = await this.Bank.getUserAmount(1);
  console.log("amount", amount);
  assert.equal(result[1], 'laxman@akeo.com')
  assert.equal(result[2], "laxman")
  assert.equal(amount, 1000);
    
  })
/*
  it('Update amount', async () => {
    await this.Bank.UpdateAmountRequest(1, 2000);
    const result = await this.Bank.getUserInfo(1);
    console.log("RESULT1", result);
    const amount = await this.Bank.getUserAmount(1);
    console.log("amount2", amount);
    assert.equal(result[1], 'laxman@akeo.com')
    assert.equal(result[2], "laxman")
    assert.equal(amount, 2000);
      
    })

    it('Update  wrong Uer amount', async () => {
      await this.Bank.UpdateAmountRequest(2, 2000);
      const result = await this.Bank.getUserInfo(2);
      console.log("RESULT2", result);
      const amount = await this.Bank.getUserAmount(2);
      console.log("amount2", amount);
      assert.equal(result[1], 'laxman@akeo.com')
      assert.equal(result[2], "laxman")
      assert.equal(amount, 2000);
        
      })

  it('Get user data', async () => {
    const result = await this.Bank.getUserInfo(1);
    console.log("RESULT3", result);
    const amount = await this.Bank.getUserAmount(1);
    console.log("amount3", amount);
    assert.equal(result[1], 'laxman@akeo.com')
    assert.equal(result[2], "laxman")
    assert.equal(amount, 2000);
      
    })
*/
})
