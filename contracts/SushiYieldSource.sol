// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.6.12;

import { IYieldSource } from "@pooltogether/yield-source-interface/contracts/IYieldSource.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./ISushiBar.sol";
import "./ISushi.sol";

import "hardhat/console.sol";

/// @title A pooltogether yield source for sushi token
/// @author Steffel Fenix
contract SushiYieldSource is IYieldSource {
    
    using SafeMath for uint256;
    
    ISushiBar public immutable sushiBar;
    ISushi public immutable sushiAddr;
    
    mapping(address => uint256) public balances;

    constructor(ISushiBar _sushiBar, ISushi _sushiAddr) public {
        sushiBar = _sushiBar;
        sushiAddr = _sushiAddr;
    }

    /// @notice Returns the ERC20 asset token used for deposits.
    /// @return The ERC20 asset token
    function depositToken() public view override returns (address) {
        return address(sushiAddr);
    }

    /// @notice Returns the total balance (in asset tokens).  This includes the deposits and interest.
    /// @return The underlying balance of asset tokens
    function balanceOfToken(address addr) public override returns (uint256) {
        console.log("balanceOfToken called from ", msg.sender);
        console.log("balanceOfToken with addr ",addr);
        if (balances[addr] == 0) return 0;

        uint256 totalShares = sushiBar.totalSupply();
        uint256 barSushiBalance = sushiAddr.balanceOf(address(sushiBar));

        return balances[addr].mul(barSushiBalance).div(totalShares);       
    }

    /// @notice Allows assets to be supplied on other user's behalf using the `to` param.
    /// @param amount The amount of `token()` to be supplied
    /// @param to The user whose balance will receive the tokens
    function supplyTokenTo(uint256 amount, address to) public override {
        console.log("supplyTokenTo called with ", amount , to);
        sushiAddr.transferFrom(msg.sender, address(this), amount);
        sushiAddr.approve(address(sushiBar), amount);

        ISushiBar bar = sushiBar;
        uint256 beforeBalance = bar.balanceOf(address(this));
        
        bar.enter(amount);
        
        uint256 afterBalance = bar.balanceOf(address(this));
        uint256 balanceDiff = afterBalance.sub(beforeBalance);
        
        balances[to] = balances[to].add(balanceDiff);
    }

    /// @notice Redeems tokens from the yield source from the msg.sender, it burn yield bearing tokens and return token to the sender.
    /// @param amount The amount of `token()` to withdraw.  Denominated in `token()` as above.
    /// @return The actual amount of tokens that were redeemed.
    function redeemToken(uint256 amount) public override returns (uint256) {
        console.log("redeemToken called with ", amount);
        ISushiBar bar = sushiBar;
        ISushi sushi = sushiAddr;

        uint256 totalShares = bar.totalSupply();
        if(totalShares == 0) return 0; 

        uint256 barSushiBalance = sushi.balanceOf(address(bar));
        if(barSushiBalance == 0) return 0;

        uint256 sushiBeforeBalance = sushi.balanceOf(address(this));
        console.log("sushiBeforeBalance ", sushiBeforeBalance);

        uint256 barBeforeBalance = bar.balanceOf(address(this));
        console.log("barBeforeBalance ", barBeforeBalance);

        uint requiredShares = ((amount.mul(totalShares) + totalShares.sub(1))).div(barSushiBalance);
        console.log("calling bar.leave() with ", requiredShares);

        // console.log("bar is burning ", requiredShares.mul(sushi.balanceOf(address(sushiBar))).div(sushiBar.totalSupply()));


        bar.leave(requiredShares);

        console.log("returned from bar.leave()");

        uint256 barAfterBalance = bar.balanceOf(address(this));
        console.log("barAfterBalance ", barAfterBalance); 
        console.log("diff in bar balance: ", barBeforeBalance.sub(barAfterBalance));
        

        uint256 sushiAfterBalance = sushi.balanceOf(address(this));
        console.log("sushiAfterBalance ", sushiAfterBalance);

        uint256 sushiBalanceDiff = sushiAfterBalance.sub(sushiBeforeBalance);

        balances[msg.sender] = balances[msg.sender].sub(requiredShares);
        sushi.transfer(msg.sender, sushiBalanceDiff);
        
        return (sushiBalanceDiff);
    }

}
