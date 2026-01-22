import React, { useEffect, useState } from 'react'
import { useInvestorContract } from './InvestorContract'
import { useConnection } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
const InvestorDashboard = () => {
  const [mounted, setMounted]= useState(false);
  const [investAmount, setInvestAmount]= useState("");
  const [withdrawAmount, setWithdrawAmount]= useState("");
  const [distributeAmount, setDistributeAmount ]=useState("");
  const [selectedOption, setSelectedOption]= useState("");
  const [amount, setAmount]=useState("");
  const {address, isConnected}= useConnection();
  const{investorInfo, contractBalance,investorCount, myTotalBalance, refetchAll,invest,distribution, withdraw, isPending, isConfirming , isConfirmed, writeError, hash, resetTransaction }= useInvestorContract()
  useEffect(()=>{
    setMounted(true);
  },[])
  useEffect(()=>{
  if(isConfirmed){
    const timer= setTimeout(()=>{
      refetchAll();

    }, 2000);
    setInvestAmount("");
    setWithdrawAmount("");
    setDistributeAmount("");
    return ()=>clearTimeout(timer);
  }
  },[isConfirmed, refetchAll])
 
if(!mounted){
  return(
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-lg text-center'>
        <h1 className="text-2xl font-bold mb-4">Investor Dashboard</h1>
        <p className="mb-4 text-gray-600">Loading....</p>
      </div>
    </div>
  )
}
if(!isConnected){
  return(
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-lg text-center'>
        <h1 className="text-2xl font-bold mb-4">Investor Dashboard</h1>
        <p className="mb-4 text-gray-600">Connect your wallet to continue</p>
        <ConnectButton/>
      </div>
    </div>
  )
}
  const handleWithdraw = () => {
        if (!address) {
            alert("Please connect your wallet first");
            return;
        }

        const option = parseInt(selectedOption);

        // Validate amount input for all options
        if (!amount || parseFloat(amount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        // Call withdraw with option and amount
        withdraw(option, amount);

        // Reset after submission
        setSelectedOption("");
        setAmount("");
    };
const getPlaceholder = () => {
        if (selectedOption === "0") return "Enter profit amount to withdraw (ETH)";
        if (selectedOption === "1") return "Enter total amount to withdraw (ETH)";
        if (selectedOption === "2") return "Enter partial amount to withdraw (ETH)";
        return "Enter amount (ETH)";
    };

    // Get label text based on selected option
    const getLabel = () => {
        if (selectedOption === "0") return "Profit Amount (ETH):";
        if (selectedOption === "1") return "Total Amount (ETH):";
        if (selectedOption === "2") return "Partial Amount (ETH):";
        return "Amount (ETH):";
    };
 return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto ">
        {/* header */}
        <div className="bg-gray-900  rounded-lg shadow-lg p-6 mb-6 ring ring-gray-400">
          <div className="flex justify-between items-center flex-wrap gap-4 ">
            <h1 className="text-3xl font-bold text-white">Investor Dashboard</h1>
            <div className="flex gap-3 items-center">
              <button onClick={()=>{refetchAll()}} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition"> 🔄️ Refresh </button>
              {(isPending || isConfirming || hash) && (
                <button onClick={()=>{resetTransaction()}} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition">🔄️Reset</button>
              )}
              <ConnectButton/>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-2"> Connected: {address?.slice(0,6)}...{address?.slice(-4)} </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-900 ring ring-gray-500 rounded-lg shadow p-6">
            <p className="text-gray-300 text-sm">My Investment</p>
            <p  className="text-2xl text-blue-600 font-bold"> {investorInfo?.invested || "0"} ETH </p>
          </div>

          <div className="bg-gray-900 rounded-lg ring ring-gray-500 shadow p-6">
            <p className="text-gray-300 text-sm">My Returns</p>
            <p  className="text-2xl text-blue-600 font-bold"> {investorInfo?.returnsEarned || "0"} ETH </p>
          </div>

          <div className="bg-gray-900 ring ring-gray-500 rounded-lg shadow p-6">
            <p className="text-gray-300 text-sm">Total Balance</p>
            <p  className="text-2xl text-blue-600 font-bold"> {myTotalBalance} ETH </p>
          </div>

          <div className="bg-gray-900 ring ring-gray-500 rounded-lg shadow p-6">
            <p className="text-gray-300 text-sm">Total Investor</p>
            <p  className="text-2xl text-blue-600 font-bold"> {investorCount} </p>
          </div>
        </div>
        {/* contract balance */}
        <div className="bg-blue-300/30 rounded-lg shadow ring ring-gray-500 p-6 mb-6"> 
          <p className="text-gray-100 text-sm">Contract Balance </p>
          <p className="text-3xl font-bold text-blue-400 ">{contractBalance} ETH </p>

          </div>

        {/* Action   */}
      
        <div className="mb-5">
          {/* invest */}

          <div className="bg-gray-800/70 text-black rounded-lg shadow p-6 ring ring-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center"> Invest </h2>
            <input type="number" step="0.01" placeholder="Amount in ETH" value={investAmount} onChange={(e)=>setInvestAmount(e.target.value)} className="w-[80%] border rounded px-4 py-2 ml-20 shadow-md mb-4 bg-gray-800/40 ring ring-gray-500 ring-2  placeholder:text-white" disabled={isPending || isConfirming} />
            <button onClick={()=>{
              if(!investAmount || parseFloat(investAmount)<=0){
                alert("Please enter a valid amount");
                return;
              }
              invest(investAmount);
            }}  disabled={!investAmount || isPending || isConfirming}
              className="w-[80%]  ml-20 bg-blue-700 text-orange-500 py-3 text-xl rounded font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
>             {isPending? "Confirming...": isConfirming?"Processing...": "Invest"} </button>
             {isPending && (
              <p className="text-sm text-orange-600 mt-4 font-bold text-center">
                {" "}
                Please confirm in your wallet...
              </p>
            )}
            {isConfirming && (
              <p className="text-sm text-blue-600 mt-4 font-bold text-center.">
                {" "}
                Transaction is being mined...
              </p>
            )}
          </div>
           {/* Withdraw */}
           <div className='mt-5 flex items-center justify-center flex-col bg-gray-900/80 ring ring-gray-800 rounded p-5'>
            <div>
              <h2 className='text-3xl  font-bold mb-6 text-green-600'>Withdraw Funds</h2>
           
            </div>
             <div className="mb-6">
                <label htmlFor="withdrawOption" className="block mb-2 text-sm font-semibold text-red-400">
                    Select Withdrawal Type:
                </label>
                <select
                    id="withdrawOption"
                    value={selectedOption}
                    onChange={(e) => {
                        setSelectedOption(e.target.value);
                        setAmount(""); // Reset amount when option changes
                    }}
                    className="w-full p-3 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="" className='text-black'>Select Option </option>
                    <option value="0" className='text-black'>💰 Withdraw Profit</option>
                    <option value="1" className='text-black'>🏦 Withdraw All</option>
                    <option value="2" className='text-black'>📊 Withdraw Partial</option>
                </select>
            </div>
                        {/* Step 2: Show Option-Specific UI with Amount Input */}
            {selectedOption === "0" && (
                <div className="p-4 mb-6 bg-blue-400/60  rounded shadow-md shadow-gray-700">
                    <h3 className="text-xl font-semibold text-white text-center mb-2">Withdraw Profit</h3>
                    <p className="text-sm text-black mb-4 font-medium">
                        Withdraw your earned returns/profit. Your principal investment will remain.
                    </p>
                    
                    <div>
                        <label htmlFor="amount" className="block mb-2 text-sm font-bold text-gray-950 ">
                            {getLabel()}
                        </label>
                        <input
                            type="number"
                            id="amount"
                            placeholder={getPlaceholder()}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                            min="0"
                            className="w-full p-3 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800"
                        />
                    </div>
                </div>
            )}
             {selectedOption === "1" && (
                <div className="p-4 mb-6 bg-blue-400/60  rounded shadow-md shadow-gray-700">
                    <h3 className="text-xl font-bold text-center text-white mb-2">Withdraw All</h3>
                    <p className="text-sm text-red-800 font-semibold mb-4">
                        ⚠️ Warning: Withdraw your entire balance (Principal + Profit) and close your investment.
                    </p>
                    
                    <div>
                        <label htmlFor="amount" className="block mb-2 text-sm font-bold text-black ">
                            {getLabel()}
                        </label>
                        <input
                            type="number"
                            id="amount"
                            placeholder={getPlaceholder()}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                            min="0"
                            className="w-full p-3 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                        />
                    </div>
                </div>
            )}

            {selectedOption === "2" && (
                <div className="p-4 mb-6 bg-blue-400/60  rounded shadow-md shadow-gray-700 rounded">
                    <h3 className="text-xl font-bold text-white text-center mb-2">Withdraw Partial Amount</h3>
                    <p className="text-sm text-black mb-4">
                        Withdraw a specific amount from your principal investment.
                    </p>
                    
                    <div>
                        <label htmlFor="amount" className="block mb-2 text-sm font-bold text-black">
                            {getLabel()}
                        </label>
                        <input
                            type="number"
                            id="amount"
                            placeholder={getPlaceholder()}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                            min="0"
                            className="w-full p-3 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800"
                        />
                    </div>
                </div>
            )}

            {selectedOption && (
                <button
                    onClick={handleWithdraw}
                    disabled={isPending || !amount}
                    className={`w-[60%] py-3 px-4 text-lg font-semibold rounded-md transition-colors ${
                        isPending || !amount
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    } text-white`}
                >
                    {isPending ? "Processing..." : "Confirm Withdrawal"}
                </button>
            )}

            {isPending && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
                    <p className="text-yellow-800">⏳ Transaction in progress... Please confirm in your wallet.</p>
                </div>
            )}

            {isConfirmed && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-center">
                    <p className="text-green-800">✅ Withdrawal of {amount} ETH successful!</p>
                </div>
            )}
            </div>
            {/* distribute returns */}
            <div className='bg-gray-800/70 text-purple-700 mt-7 ring ring-gray-800 rounded-lg shadow  p-6 flex justify-center items-center flex-col'>
              <h1 className="text-3xl text-center font-bold mb-4">Distribute Returns only Owner</h1>
              <input type='number' step={"0.01"} placeholder='Amount in ETH ' value={distributeAmount} onChange={(e)=>{setDistributeAmount(e.target.value)}} disabled={!isPending || isConfirming} className='w-[60%] border placeholder:text-gray-400 rounded px-4 py-2 mb-4' />
              <button onClick={()=>distributeReturns(distributeAmount)} disabled={!distributeAmount || isPending || isConfirming} className='w-[60%] bg-purple-600 text-white py-3 rounded font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition'>
                {isPending?"Confirming...": isConfirming?"Processing...":"Distribute Returns "}
              </button>
            </div>
          </div>
          {/* transaction status */}
          {hash && (
          <div className="mt-6 text-black bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-2">Transaction Status</h3>
            <p className="text-sm text-gray-600 break-all">Hash: {hash}</p>
            <p className="text-sm mt-2">
              Status:{" "}
              {isConfirming
                ? " Confirming..."
                : isConfirmed
                ? " Confirmed!"
                : " Pending..."}
            </p>
            {isConfirmed && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Data will refresh automatically in 2 seconds...
              </p>
            )}
          </div>
        )}

        {/* Error Display */}
        {writeError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg shadow p-6">
            <h3 className="font-bold text-red-800 mb-2"> Transaction Error</h3>
            <p className="text-sm text-red-600">
              {writeError.message || "An error occurred"}
            </p>
            <details className="mt-2">
              <summary className="text-xs text-red-500 cursor-pointer">
                View Details
              </summary>
              <pre className="text-xs mt-2 overflow-auto bg-red-100 p-2 rounded">
                {JSON.stringify(writeError, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        , 2)}
              </pre>
            </details>
          </div>
        )}
                {/* Debug Section - Remove in production */}
        <div className="mt-6 bg-gray-800 text-white rounded-lg shadow p-6 ring ring-gray-700">
          <h3 className="font-bold mb-2 text-center text-2xl text-green-600 tracking-wider"> Info </h3>
          <div className="text-xs tracking-wide space-y-1 font-semibold">
            <p>Connected Address: {address}</p>
            <p>
              Investor Info invested: {investorInfo?.invested?.toString() || "0"}
            </p>
            <p>
              Investor Info returnsEarned:{" "}
              {investorInfo?.returnsEarned?.toString() || "0"}
            </p>
            <p>My Total Balance: {myTotalBalance}</p>
            <p>Contract Balance: {contractBalance}</p>
            <p>Is Pending: {isPending ? "Yes" : "No"}</p>
            <p>Is Confirming: {isConfirming ? "Yes" : "No"}</p>
            <p>Is Confirmed: {isConfirmed ? "Yes" : "No"}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
export default InvestorDashboard