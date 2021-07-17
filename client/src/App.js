import React, { useState, useEffect } from "react";
import SystemeVote from "./contracts/SystemeVote.json";
import getWeb3 from "./getWeb3";
import OwnerSection from "./Components/ownerSection";
import ProposalSection from "./Components/proposalSection";
import VotersSection from "./Components/votersSection";

const App = () => {

  const [web3,setWeb3]= useState(null);
  const [accounts,setAccounts]=useState(null);
  const [contract,setContract]=useState(null);
  const [currentState,setCurrentState] = useState("We are in voters registration session");
  const [proposalTab,setProposalTab] = useState ([]);
  const [voteVoter,setVoteVoter] = useState (null);
  const [winner,setWinner] = useState ([]);

  useEffect ( () => {

      const initWeb3 = async () =>{
  try{
          const web3 = await getWeb3();
          const accounts = await web3.eth.getAccounts();
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = SystemeVote.networks[networkId];
      
          const instance = new web3.eth.Contract(
            SystemeVote.abi,
            deployedNetwork && deployedNetwork.address,
            );

          instance.events.WorkflowStatusChange()
	          .on("data", (event) => {
	          	switch (event.returnValues['newStatus']){
	          	case "1" : 
		          	setCurrentState("Proposal session");
		          	break;
	          	case "2" : 
		          	setCurrentState("Proposal session over, voting session will start soon...");
		          	break;
	          	case "3" : 
		          	setCurrentState('Voting session');
		          	break;
	          	case "4" : 
	          		setCurrentState('Voting session over, results are coming soon');
	          		break;
	          	case "5" : 
	          		setCurrentState('Finsished, Consult the winner');
	          		break;
	          	default :
	          		setCurrentState('Registration voter session');
	          }

			}).on("error", console.error);


          setContract(instance);
          setWeb3(web3);
          setAccounts(accounts);


    } catch (error){
        alert(
            `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
          );
          console.error(error);
      }
    }
      initWeb3();
      
  },[accounts]);
  
  const whitelist = async(add) => {
      try{
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        await contract.methods.whiteListed(add).send({from: accounts[0]});
        // Récupérer la liste des comptes autorisés
      }catch (error){
          console.log(error);
          alert('Error transaction');
          }
    }

  const startProposal = async() => {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        await contract.methods.openingProposalSession().send({from: accounts[0]});
      }

  const endProposal = async() => {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        await contract.methods.closingProposalSession().send({from: accounts[0]});
      }

    const startVoting = async() => {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        await contract.methods.openingVoting().send({from: accounts[0]});
      }
    
    const endVoting = async() => {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        await contract.methods.closingVoting().send({from: accounts[0]});
      }

    const endContract = async() => {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        await contract.methods.comptageVotes().send({from: accounts[0]});
      }

    const submitVote = async (vote) => {
        try{
          const accounts = await web3.eth.getAccounts();
          setAccounts(accounts);
          await contract.methods.vote(vote).send({from: accounts[0]});
      }catch(error){
        alert('Error transaction');
      }
    }

    const submitProposal = async (proposition) => {
      
      const tabMinusOne = proposalTab;

      try{
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        await contract.methods.propositions(proposition).send({from: accounts[0]});
        setProposalTab((proposalTab) => {

        return [...proposalTab,proposition]; //...=Tu prend le contenu de l'objet ici proposal tab, et tu l
        });

      }catch (error){
        setProposalTab (tabMinusOne);
      }
    }

    const checkVote = async (add) => {
        try{
        setVoteVoter(await contract.methods.getVote(add).call());
        console.log(proposalTab);
      }catch(error){
        alert ('Error transaction');
      }
    }

    const checkWinner = async () =>{
      try{
        setWinner(await contract.methods.getWinner().call());
        console.log(winner);
    }catch (error){

        alert('Error transaction');
      }
    } 

  return (
          <div>
            <h1 style = {{textAlign:'center', margin:'50px' }} > Systeme de vote </h1>
            <div className = "ui two column grid">
              <div className = "ui row">
                <div className = "column">
                  <div className="ui raised very padded text container segment">
                    <h2 className="ui header" style = {{textAlign:'center'}}>Proposal</h2>
                    <ProposalSection 
                    proposalTab = {proposalTab} 
                    submitProposal={submitProposal}/>
                  </div>
                </div>
                <div className = "column">
                  <div className="ui raised very padded text container segment">
                    <h2 className="ui header" style = {{textAlign:'center'}}>Administrator section</h2>
                      <OwnerSection 
                      startProposal = {startProposal} 
                      endProposal = {endProposal} 
                      startVoting = {startVoting} 
                      endVoting = {endVoting} 
                      endContract = {endContract}
                      whitelist = {whitelist}
                      />
                  </div>
                  <div className="ui raised very padded text container segment">
                    <h2 className="ui header" style = {{textAlign:'center'}}>Voters Section</h2>
                      <VotersSection 
                      currentState = {currentState} 
                      submitVote = {submitVote}
                      voteVoter = {voteVoter} 
                      proposalTab = {proposalTab}
                      winner = {winner}
                      checkVote = {checkVote}
                      checkWinner = {checkWinner}
                       />
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
}

export default App;
