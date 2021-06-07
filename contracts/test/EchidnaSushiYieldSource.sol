// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.6.0 <0.7.0;

import "../AbstractSushiYieldSource.sol";
import "./SushiBar.sol";
import "./ERC20Mintable.sol";
import "../ISushiBar.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";



contract EchidnaSushiYieldSource is AbstractSushiYieldSource {


  uint256 public totalXSushi;


  constructor() public {
    sushiAddr = ISushi(address(new ERC20Mintable("Sushi Token", "SUSHI")));
    sushiBar = ISushiBar(address(new SushiBar(IERC20(address(sushiAddr)))));
    
    
  }

  function withdraw() external {
    uint bal = balanceOfToken(msg.sender);
    redeemToken(bal);
    revert();
  }

  function accrue(uint amount) external {
    // mints amount of sushi to sushi bar address
    ERC20Mintable(address(sushiAddr)).mint(address(sushiBar), amount);
  }

  function supply(uint256 amount) external {
    
    // mint amount sushi tokens to sushi bar address
    ERC20Mintable(address(sushiAddr)).mint(msg.sender, amount);
    ERC20Mintable(address(sushiAddr)).approveFor(msg.sender, address(this), amount);
  
    supplyTokenTo(amount, msg.sender);

  }

  function redeem(uint256 amount) external {

    
    uint256 _amountToRedeem = amount;
    uint256 balance = balanceOfToken(msg.sender);

    if(amount > balance){
      _amountToRedeem = balance; 
    }

    redeemToken(_amountToRedeem);
  }

  // function echidna_can_always_redeem() external view {
  //   //return if sushiBar.balanceOf(yieldSource) > redeem amount
  // }




  // /// @dev Invariant: total unclaimed tokens should never exceed the balance held by the faucet
  // function echidna_total_unclaimed_lte_balance () external view returns (bool) {
  //   return faucet.totalUnclaimed() <= asset.balanceOf(address(faucet));
  // }

  // /// @dev Invariant: the balance of the faucet plus claimed tokens should always equal the total tokens dripped into the faucet
  // function echidna_total_dripped_eq_claimed_plus_balance () external view returns (bool) {
  //   return totalAssetsDripped == (totalAssetsClaimed + asset.balanceOf(address(faucet)));
  // }

}