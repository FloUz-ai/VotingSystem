const systemeVote = artifacts.require("systemeVote");
const { expect } = require('chai');
const { BN } = require('@openzeppelin/test-helpers');


contract("systemeVote", accounts => {

	const _owner = accounts [0];
	const _voter1 = accounts [1];
	const _voter2 = accounts [2];
	const _nonVoter = accounts [3];
	


	beforeEach(async () => {
		systemeVoteInstance = await systemeVote.new();
	});
 
 context("An entire session of voting", async ()=> {
  it("Voter should be registered", async () => {
    
    await systemeVoteInstance.whiteListed(_voter1, { from: _owner });
    expect(await systemeVoteInstance.whiteList(_voter1)).to.include({isRegistered:true});
  });


  it("Voter should be able to make a proposal", async() =>{

  	let proposal = "je fais un test";
  	await systemeVoteInstance.whiteListed(_voter1, { from: _owner });
  	await systemeVoteInstance.openingProposalSession({from: _owner});
  	await systemeVoteInstance.propositions(proposal, {from:_voter1});
  	expect(await systemeVoteInstance.listProposals(proposal)).to.include({description:proposal});
  
  });

  it("Voter should be able to vote", async()=> {
	let proposal = "je fais un test";

  	await systemeVoteInstance.whiteListed(_voter1, { from: _owner });

  	await systemeVoteInstance.openingProposalSession({from: _owner});
  	await systemeVoteInstance.propositions(proposal, {from:_voter1});
    await systemeVoteInstance.closingProposalSession({from: _owner});
	
  	await systemeVoteInstance.openingVoting({from: _owner});
  	await systemeVoteInstance.vote(0, {from: _voter1});
  	expect(await systemeVoteInstance.whiteList(_voter1)).to.include({hasVoted:true});

  });

  it("Voter should be able to see the winnig proposal", async() => {

  	let proposal = "je fais un test";
  	let winingProposal = "I Win";

  	await systemeVoteInstance.whiteListed(_voter1, { from: _owner });
  	await systemeVoteInstance.whiteListed(_owner, { from: _owner });
  	await systemeVoteInstance.whiteListed(_voter2, { from: _owner });

  	await systemeVoteInstance.openingProposalSession({from: _owner});
  	await systemeVoteInstance.propositions(proposal, {from:_voter1});
  	await systemeVoteInstance.propositions(winingProposal, {from:_owner});
    await systemeVoteInstance.closingProposalSession({from: _owner});
	
  	await systemeVoteInstance.openingVoting({from: _owner});
  	await systemeVoteInstance.vote(0, {from: _voter1});
  	await systemeVoteInstance.vote(1, {from: _owner});
  	await systemeVoteInstance.vote(1, {from: _voter2});
  	await systemeVoteInstance.closingVoting({from: _owner});

  	await systemeVoteInstance.comptageVotes({from: _owner});
  	const winner = await systemeVoteInstance.getWinner({from:_voter1});

  	expect(winner).to.have.property('description',winingProposal);


  });

it("Voter should be able to see the vote of another voter", async() => {

   	let proposal = "je fais un test";
  	let winingProposal = "I Win";
  	let theVote = new BN(1);

  	await systemeVoteInstance.whiteListed(_voter1, { from: _owner });
  	await systemeVoteInstance.whiteListed(_owner, { from: _owner });
  	await systemeVoteInstance.whiteListed(_voter2, { from: _owner });

  	await systemeVoteInstance.openingProposalSession({from: _owner});
  	await systemeVoteInstance.propositions(proposal, {from:_voter1});
  	await systemeVoteInstance.propositions(winingProposal, {from:_owner});
    await systemeVoteInstance.closingProposalSession({from: _owner});
	
  	await systemeVoteInstance.openingVoting({from: _owner});
  	await systemeVoteInstance.vote(0, {from: _voter1});
  	await systemeVoteInstance.vote(1, {from: _owner});
  	await systemeVoteInstance.vote(1, {from: _voter2});
  	await systemeVoteInstance.closingVoting({from: _owner});

  	await systemeVoteInstance.comptageVotes({from: _owner});
  	const voteVoter = await systemeVoteInstance.getVote(_voter2);

  	expect(voteVoter).to.be.bignumber.equal(theVote);

  	});

});
});
