const Crowns = artifacts.require("Crowns");

require("chai").should();

contract("Crowns", accounts => {

  beforeEach(async function (){
    this.token = await Crowns.new();
  });

  describe("Token attributes", function() {
    it("has the correct name", async function() {
      const name = await this.token.name();
      name.should.equal("Crowns");
    });

    it("has the correct symbol", async function() {
      const symbol = await this.token.symbol();
      symbol.should.equal("CWS");
    });
  });
});
