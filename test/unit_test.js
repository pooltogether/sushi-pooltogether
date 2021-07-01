const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const chai = require("chai");

chai.use(solidity);
const toWei = ethers.utils.parseEther;
const toEth = ethers.utils.formatEther;
const { expect } = chai;

let overrides = { gasLimit: 9500000 };

describe("SushiYieldSource", function () {
  let sushi;
  let sushiBar;
  let wallet;
  let wallet2;
  let yieldSource;
  let amount;

  let SushiYieldSourceContract;

  let isDeployTest = false;

  const deploySushiYieldSource = async (sushiBarAddress, sushiAddress) => {
    yieldSource = await SushiYieldSourceContract.deploy(
      sushiBarAddress,
      sushiAddress,
      overrides
    );
  };

  beforeEach(async function () {
    [wallet, wallet2] = await ethers.getSigners();
    const ERC20MintableContract = await hre.ethers.getContractFactory(
      "ERC20Mintable",
      wallet,
      overrides
    );
    sushi = await ERC20MintableContract.deploy("Sushi", "SUSHI");

    const SushiBarContract = await hre.ethers.getContractFactory(
      "SushiBar",
      wallet,
      overrides
    );
    sushiBar = await SushiBarContract.deploy(sushi.address);

    SushiYieldSourceContract = await ethers.getContractFactory(
      "SushiYieldSource"
    );

    if (!isDeployTest) {
      deploySushiYieldSource(sushiBar.address, sushi.address);
    }

    amount = toWei("100");
    await sushi.mint(wallet.address, amount);
    await sushi.mint(wallet2.address, amount.mul(99));
    await sushi.connect(wallet2).approve(sushiBar.address, amount.mul(99));
    await sushiBar.connect(wallet2).enter(amount.mul(99));
  });

  describe("constructor()", () => {
    let randomWalletAddress;

    before(() => {
      isDeployTest = true;
    });

    beforeEach(() => {
      randomWalletAddress = ethers.Wallet.createRandom().address;
    });

    after(() => {
      isDeployTest = false;
    });

    it("should fail if sushiBar address is address 0", async () => {
      await expect(
        deploySushiYieldSource(ethers.constants.AddressZero, sushi.address)
      ).to.be.revertedWith("SushiYieldSource/sushiBar-not-zero-address");
    });

    it("should fail if sushi address is address 0", async () => {
      await expect(
        deploySushiYieldSource(sushiBar.address, ethers.constants.AddressZero)
      ).to.be.revertedWith("SushiYieldSource/sushiAddr-not-zero-address");
    });
  });

  it("get token address", async function () {
    let address = await yieldSource.depositToken();
    expect(address == sushi);
  });

  it("balanceOfToken", async function () {
    expect(await yieldSource.callStatic.balanceOfToken(wallet.address)).to.eq(
      0
    );

    await sushi.connect(wallet).approve(yieldSource.address, amount);
    await yieldSource.supplyTokenTo(amount, wallet.address);
    expect(await yieldSource.callStatic.balanceOfToken(wallet.address)).to.eq(
      amount
    );
  });

  it("supplyTokenTo", async function () {
    await sushi.connect(wallet).approve(yieldSource.address, amount);
    await yieldSource.supplyTokenTo(amount, wallet.address);
    expect(await sushi.balanceOf(sushiBar.address)).to.eq(amount.mul(100));
    expect(await yieldSource.callStatic.balanceOfToken(wallet.address)).to.eq(
      amount
    );
  });

  it("redeemToken", async function () {
    await sushi.connect(wallet).approve(yieldSource.address, amount);
    await yieldSource.supplyTokenTo(amount, wallet.address);

    expect(await sushi.balanceOf(wallet.address)).to.eq(0);
    await yieldSource.redeemToken(amount);
    expect(await sushi.balanceOf(wallet.address)).to.eq(amount);
  });

  [toWei("100"), toWei("100").mul(10), toWei("100").mul(99)].forEach(function (
    amountToDeposit
  ) {
    it(
      "deposit " + toEth(amountToDeposit) + ", sushi accrues, withdrawal",
      async function () {
        await sushi.mint(wallet.address, amountToDeposit.sub(amount));
        await sushi
          .connect(wallet)
          .approve(yieldSource.address, amountToDeposit);
        await yieldSource.supplyTokenTo(amountToDeposit, wallet.address);
        // increase total balance by amount
        await sushi.mint(sushiBar.address, amount);

        const totalAmount = await yieldSource.callStatic.balanceOfToken(
          wallet.address
        );
        const expectedAmount = amountToDeposit
          .mul(amountToDeposit.add(amount.mul(100)))
          .div(amountToDeposit.add(amount.mul(99)));
        expect(totalAmount).to.eq(expectedAmount);

        await yieldSource.redeemToken(totalAmount);
        expect(await sushi.balanceOf(wallet.address)).to.be.closeTo(
          totalAmount,
          2
        );
      }
    );
  });
});
