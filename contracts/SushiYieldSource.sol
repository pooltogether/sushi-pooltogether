// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.6.12;

import { IYieldSource } from "@pooltogether/yield-source-interface/contracts/IYieldSource.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./ISushiBar.sol";
import "./ISushi.sol";

import "./AbstractSushiYieldSource.sol";

/// @title A pooltogether yield source for sushi token
/// @author Steffel Fenix
contract SushiYieldSource is AbstractSushiYieldSource {
    
    constructor(ISushiBar _sushiBar, ISushi _sushiAddr) public {
        sushiBar = _sushiBar;
        sushiAddr = _sushiAddr;
    }

}
