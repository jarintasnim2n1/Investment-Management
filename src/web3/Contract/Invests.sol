// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
 // Investor can invest Eth and get profit 
 // Invesor can also withdraw profit or partial withdraw or total 
contract Investment {
    address public owner;
    uint256 public totalInvestment;

    struct Investor{
        uint256 amount;
        uint256 return_Earned_Profit;
    }
    mapping (address =>Investor) public investors;
    address[] public investorList; 
    constructor(){
     owner= msg.sender;
    }
    modifier onlyOwner(){
        require(msg.sender== owner, "not owmner");
        _;
    }

    enum WithdrawOption{
        ClaimReturns,
        Withdraw_All,
        Withdraw_Partial
    }
  function Invest() external payable {
   require(msg.value>0, "Insufficient value");
   if(investors[msg.sender].amount==0)
   investorList.push(msg.sender);

   investors[msg.sender].amount += msg.value;
    totalInvestment += msg.value;
  }
  //return distributed profit
  function distribution() external payable onlyOwner {
    require(msg.value>0, "No distributed amount");
    require(totalInvestment>0, "No investment");
    uint256 totalReturn= msg.value;

    for(uint256 i=0; i<investorList.length; i++){
        address investorAddr= investorList[i];
        uint256 invested=investors[investorAddr].amount;
        uint256 share = (invested * totalReturn)/totalInvestment;
        investors[investorAddr].return_Earned_Profit +=share;
        
    }

  }
  //withdraw function
//   choise option 
// claim return (profit only)
// withdral All (profit +invest)
// withdraw partial 
  function withdraw (uint8 option, uint256 partialAmount) external payable{
  require(option<=2,"Invalid option");
  WithdrawOption selectedOption = WithdrawOption(option);
  uint256 payout=0;
  if(selectedOption==WithdrawOption.ClaimReturns){
    payout=investors[msg.sender].return_Earned_Profit;
    require(payout>0,"No balance");
    investors[msg.sender].return_Earned_Profit=0;
  }
  else if(selectedOption== WithdrawOption.Withdraw_All){
    uint256 principal= investors[msg.sender].amount;
    uint256 returnEnd= investors[msg.sender].return_Earned_Profit;
    payout = principal + returnEnd;

    require(payout>0,"No balance");
    require(address(this).balance>=payout,"Insufficient contract balance");
    investors[msg.sender].amount=0;
    investors[msg.sender].return_Earned_Profit=0;
    totalInvestment -=principal;
  }
  else if(selectedOption== WithdrawOption.Withdraw_Partial){
    require(partialAmount>0,"Insufficient balance");
    require(partialAmount<=investors[msg.sender].amount,"Insufficient balance");
    payout= partialAmount;
    require(address(this).balance>=payout,"Insufficient contract balance");
    investors[msg.sender].amount-=partialAmount;
    totalInvestment -=partialAmount;
  }
   // execute transfer
   require(payout>0, "No amount to withdraw");
   (bool success,)= msg.sender.call{value:payout}(" ");
   require(success, "Transfer failed");
  }
// view function
function getInvestorInfo(address _investor) external view returns(uint256 invested, uint256 return_Earned_Profit){
    return (investors[_investor].amount, investors[_investor].return_Earned_Profit);
} 
function getInvestorCount() external view returns(uint256){
return investorList.length;
}
function getContractBalance() external view returns(uint256){
    return address(this).balance;
}

function getTotalBalance(address _investor) external view returns(uint256){
    return (investors[_investor].amount+ investors[_investor].return_Earned_Profit);
}
// show available option
function getWithdrawOption() external pure returns(string[3] memory){
    return[
        "0. Withdraw Invested Amount",
        "1. Withdraw Profit",
        "2. Withdraw Total Balance"
    ];
}
}

//0x23BFF198cB7F5d52c6ccdC2548253998321F7E5e