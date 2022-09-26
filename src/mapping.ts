import {
  BigInt,
  log,
} from "@graphprotocol/graph-ts";
import {
  Contract,
  Approval,
  ApprovalForAll,
  Transfer,
  TokenMinted,
} from "../generated/Contract/Contract"
import {
  TransferEntity,
  MintedEntity,
  User
} from "../generated/schema";

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleTokenMinted(event: TokenMinted): void {
  log.debug("DEBUG INFO:: entering handleTokenMinted event !", []);
  let id = event.params.id.toString();
  let mintEntity = new MintedEntity(id);
  mintEntity.tokenId = event.params.id;
  mintEntity.minter = event.params.to;
  mintEntity.discount = event.params.usedDiscount;

  let userEntity =  User.load(event.params.to.toHexString());
  
  if(!userEntity){
    userEntity = new User(event.params.to.toHexString());
    userEntity.mintedOverall = 0;
    userEntity.mintedDiscounted = 0;
  }

  if(event.params.usedDiscount){
    userEntity.mintedDiscounted++;
  }

  userEntity.mintedOverall++;

  userEntity.save();
  mintEntity.save();
}


export function handleTransfer(event: Transfer): void {
  let transfer = new TransferEntity(event.params.tokenId.toHex());
  let contract = Contract.bind(event.address);

  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.tokenId = event.params.tokenId;

  let tokenURI = contract.try_tokenURI(transfer.tokenId);

  if (tokenURI.reverted) {
    log.info("getTokenURI reverted", []);
  } else {
    transfer.tokenURI = tokenURI.value;
  }

  transfer.save();
}
