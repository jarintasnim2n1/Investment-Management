"use client";

import { ABI, Contract_Address } from "@/web3/Contract/data";
import { formatEther, parseEther } from "viem";
import { useWriteContract, useConnection, useReadContract, useWaitForTransactionReceipt } from "wagmi";

export function useInvestorContract() {
    const { address, isConnected } = useConnection();
    const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    
    // READ functions
    const { data: investorInfo, refetch: refetchInvestorInfo, isLoading: investorLoading, isError: investorInfoError, error: investorInfoErrorMsg } = useReadContract({
        address: Contract_Address,
        abi: ABI,
        functionName: "getInvestorInfo",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!Contract_Address,
            refetchInterval: 3000,
        }
    });

    const { data: contractBalance, refetch: refetchContractBalance } = useReadContract({
        address: Contract_Address,
        abi: ABI,
        functionName: "getContractBalance",
        query: {
            enabled: !!Contract_Address,
            refetchInterval: 3000,
        }
    });

    const { data: investorCount, refetch: refetchInvestorCount } = useReadContract({
        address: Contract_Address,
        abi: ABI,
        functionName: "getInvestorCount",
        query: {
            enabled: !!Contract_Address,
        }
    });

    // WRITE functions
    const invest = (amountEth) => {
        if (!address) {
            alert("Please connect your wallet first");
            return;
        }
        if (!amountEth || parseFloat(amountEth) <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        try {
            const valueWei = parseEther(amountEth.toString());
            writeContract({
                address: Contract_Address,
                abi: ABI,
                functionName: "Invest",
                value: valueWei
            });
        }
        catch (error) {
            alert("Error: " + error.message);
        }
    };

    const distributions = (amountEth) => {
        try {
            writeContract({
                address: Contract_Address,
                abi: ABI,
                functionName: "distribution",
                value: parseEther(amountEth.toString()),
            });
        }
        catch (error) {
            alert("Error: " + error.message);
        }
    };

    const withdraw = (option, partialAmount = 0) => {
        try {
            // Validate option
            if (option < 0 || option > 2) {
                alert("Invalid option. Please select 0, 1, or 2");
                return;
            }

            let amountInWei = 0n;
            let confirmMessage = "";
            let successMessage = "";

            // Option 0: Withdraw Profit Only
            if (option === 0) {
                confirmMessage = "Are you sure you want to withdraw your profit/returns?";
                successMessage = "Profit withdrawal initiated successfully!";

                const confirmed = window.confirm(confirmMessage);
                if (!confirmed) {
                    console.log("Withdrawal cancelled by user");
                    return;
                }

                writeContract({
                    address: Contract_Address,
                    abi: ABI,
                    functionName: "withdraw",
                    args: [0, 0n],
                });

                alert(successMessage);
            }
            
            // Option 1: Withdraw All (Principal + Profit)
            else if (option === 1) {
                confirmMessage = "Are you sure you want to withdraw ALL (Principal + Profit)? This will close your investment.";
                successMessage = "Full withdrawal initiated successfully!";

                const confirmed = window.confirm(confirmMessage);
                if (!confirmed) {
                    console.log("Withdrawal cancelled by user");
                    return;
                }

                writeContract({
                    address: Contract_Address,
                    abi: ABI,
                    functionName: "withdraw",
                    args: [1, 0n],
                });

                alert(successMessage);
            }
            
            // Option 2: Withdraw Partial Amount from Principal
            else if (option === 2) {
                if (!partialAmount || partialAmount <= 0) {
                    alert("Please enter a valid partial amount greater than 0");
                    return;
                }

                confirmMessage = `Are you sure you want to withdraw ${partialAmount} ETH from your principal?`;
                successMessage = `Partial withdrawal of ${partialAmount} ETH initiated successfully!`;
                
                // Convert partialAmount to Wei using viem
                amountInWei = parseEther(partialAmount.toString());

                const confirmed = window.confirm(confirmMessage);
                if (!confirmed) {
                    console.log("Withdrawal cancelled by user");
                    return;
                }

                writeContract({
                    address: Contract_Address,
                    abi: ABI,
                    functionName: "withdraw",
                    args: [2, amountInWei],
                });

                alert(successMessage);
            }

        } catch (error) {
            console.error("Withdrawal error:", error);
            
            // Handle specific errors based on option
            if (error.message.includes("No balance")) {
                if (option === 0) {
                    alert("Error: No profit available to withdraw");
                } else if (option === 1) {
                    alert("Error: No balance to withdraw");
                } else {
                    alert("Error: No balance available");
                }
            } else if (error.message.includes("Insufficient contract balance")) {
                alert("Error: Contract has insufficient balance. Please contact support.");
            } else if (error.message.includes("Insufficient balance")) {
                if (option === 2) {
                    alert(`Error: Insufficient principal balance. You're trying to withdraw ${partialAmount} ETH but don't have enough.`);
                } else {
                    alert("Error: Insufficient balance for withdrawal");
                }
            } else if (error.message.includes("user rejected") || error.message.includes("User denied")) {
                alert("Transaction cancelled by user");
            } else if (error.message.includes("Transfer failed")) {
                alert("Error: Transfer failed. Please try again.");
            } else if (error.message.includes("insufficient funds")) {
                alert("Error: Insufficient funds for gas fees");
            } else {
                alert("Error: " + (error.shortMessage || error.message));
            }
        }
    };
const refetchAll = async () => {
    await Promise.all([
      refetchInvestorInfo(),
      refetchContractBalance(),
      refetchInvestorCount(),
    ]);
    // Reset transaction state after refetch
    reset();
  };
  const formattedInvestorInfo= investorInfo? {invested:formatEther(investorInfo[0]|| 0n),
    returnsEarned: formatEther(investorInfo[1]|| 0n)
  }:{invested:"0", returnsEarned:"0"};
  const formattedTotalBalance= investorInfo? formatEther((investorInfo[0] || 0n)+ (investorInfo[1] || 0n)):"0";
  const formattedContractBalance= contractBalance? formatEther(contractBalance):"0";
  const formattedInvestorCount=investorCount?Number(investorCount):0;

    return {
        // Connection
        address,
        isConnected,
        
        // Read data
        investorInfo:formattedInvestorInfo,
        contractBalance:formattedContractBalance,
        investorCount:formattedInvestorCount,
        myTotalBalance:formattedTotalBalance,
        
        // Refetch functions
        refetchAll,
        resetTransaction:reset,
        
        // Write functions
        invest,
        distributions,
        withdraw,
         // Loading states
         investorLoading,
        investorInfoError,
         investorInfoErrorMsg,
        // Transaction status
        hash,
        isPending,
        isConfirming,
        isConfirmed,
        writeError,
     
    };
}